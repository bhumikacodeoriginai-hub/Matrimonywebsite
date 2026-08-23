'use client';

/**
 * Profile card — the most repeated component in the product.
 *
 * ACTIONS ARE REAL. Send interest → `POST /interests/send/{id}`. Shortlist →
 * `POST|DELETE /shortlist/{id}`. Message → the conversation, which only exists once
 * an interest has been accepted, so the button explains itself rather than 404ing.
 * Every outcome the API can return is handled: 409 (already sent) becomes the
 * "sent" state rather than an error, and 403 (plan limit reached) offers the
 * upgrade path.
 *
 * COMPATIBILITY IS SHOWN HONESTLY
 * The score only appears when `shouldShowScore` agrees — which means it is above
 * the trust floor AND the member has actually saved preferences for it to be
 * computed from. It is labelled "Preference match", never "AI". Reasons are only
 * listed when they can be verified from the data on the card.
 *
 * ⚠️ THUMBNAIL PRIVACY LIMITATION
 * `GET /search` and `GET /matches/recommended` return `primaryPhoto.thumbnail_path`
 * unconditionally — the server does NOT substitute a blurred variant for card
 * thumbnails the way it does on the profile detail endpoint. So a card thumbnail is
 * not blurred even for a viewer with no photo access. We render what the API gives
 * us and cannot fix it from here; the fix is server-side and is recorded in
 * docs/SECURITY_FINDINGS.md.
 *
 * PERFORMANCE
 * Actions are always visible rather than hover-revealed (touch devices have no
 * hover, and hover-only actions are unreachable there). Hover animates `transform`
 * and `opacity` only, so a grid of 20 cards does not thrash layout.
 */

import { useState } from 'react';
import Link from 'next/link';
import { Avatar } from '../ui/avatar';
import { Badge, CategoryBadge, PremiumBadge, StatusDot } from '../ui/badge';
import { Button } from '../ui/button';
import { Icon } from '../ui/icon';
import { useToast } from '../ui/toast';
import { addToShortlist, removeFromShortlist, sendInterest } from '../../lib/api/actions';
import { useAction } from '../../lib/hooks/use-action';
import { useReducedMotion } from '../../lib/hooks/use-media';
import { photoUrl } from '../../lib/api/media';
import { metaLine } from '../../lib/format';
import {
  BAND_LABELS,
  SCORE_METHOD_LABEL,
  bandFor,
  explainMatch,
  shouldShowScore,
} from '../../lib/compatibility';
import type { PartnerPreferenceRecord, ProfileCardData } from '../../lib/api/types';
import styles from './profile-card.module.css';

export interface ProfileCardProps {
  profile: ProfileCardData;
  /**
   * The viewer's saved preferences. Required to decide whether a score is
   * meaningful and to explain it — pass `null` if unknown, and no score is shown.
   */
  preferences?: PartnerPreferenceRecord | null;
  /** Whether this profile is already on the viewer's shortlist. */
  shortlisted?: boolean;
  /** Set when an interest has already been sent, so the card opens in that state. */
  interestSent?: boolean;
  /** Conversation id, when one exists. Enables the Message button. */
  conversationId?: number | null;
  /** Stagger index for the reveal animation. */
  index?: number;
}

export function ProfileCard({
  profile,
  preferences = null,
  shortlisted = false,
  interestSent = false,
  conversationId = null,
  index = 0,
}: ProfileCardProps) {
  const toast = useToast();
  const reducedMotion = useReducedMotion();

  const [sent, setSent] = useState(interestSent);
  const [saved, setSaved] = useState(shortlisted);
  const [pulse, setPulse] = useState(false);

  const interest = useAction(sendInterest, {
    onSuccess: (_data, message) => {
      setSent(true);
      if (!reducedMotion) {
        setPulse(true);
        window.setTimeout(() => setPulse(false), 700);
      }
      toast.success('Interest sent', message ?? `${profile.name} will see it on their dashboard.`);
    },
    onError: () => undefined,
  });

  const shortlist = useAction(
    async (userId: number, currentlySaved: boolean) =>
      currentlySaved ? removeFromShortlist(userId) : addToShortlist(userId),
    {
      onSuccess: () => setSaved((current) => !current),
      onError: (message) => toast.error('Could not update your shortlist', message),
    },
  );

  const handleInterest = async () => {
    const result = await interest.run(profile.id);
    if (!result || result.ok) return;

    // A 409 means it was already sent — that is the same end state, not a failure.
    if (result.alreadyDone) {
      setSent(true);
      toast.toast({ title: 'Already sent', description: 'You have sent this member an interest before.' });
      return;
    }

    // A 403 is almost always the plan's interest allowance.
    if (result.notAllowed) {
      toast.toast({
        title: 'Interest limit reached',
        description: result.message,
        tone: 'premium',
        action: { label: 'See plans', onClick: () => (window.location.href = '/subscription') },
      });
      return;
    }

    toast.error('Could not send that interest', result.message);
  };

  const src = photoUrl(profile.photo);
  const showScore = shouldShowScore(profile.match_score, preferences);
  const score = profile.match_score ?? 0;
  const reasons = showScore ? explainMatch(profile, preferences).slice(0, 3) : [];

  const profileHref = `/profiles/${profile.id}`;

  return (
    <article className={styles.card} data-reveal="" style={{ ['--reveal-index' as string]: index }}>
      <div className={styles.media}>
        {src ? (
          <img
            className={styles.photo}
            src={src}
            alt=""
            width={320}
            height={400}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className={styles.noPhoto}>
            <Icon name="user" size={38} />
            <span className={styles.noPhotoLabel}>No photo yet</span>
          </div>
        )}

        <div className={styles.shade} aria-hidden="true" />

        <div className={styles.topBadges}>
          <CategoryBadge category={profile.profile_category} solid />
          {profile.is_premium && <PremiumBadge solid />}
        </div>

        <div className={styles.overlay}>
          {/* The card's accessible name comes from the stretched link below, so
              this heading is presentational and not read twice. */}
          <h3 className={styles.name}>
            {profile.name}
            {profile.age !== null && `, ${profile.age}`}
          </h3>
          <p className={styles.meta}>{metaLine(profile.city, profile.state) || profile.unique_id}</p>
        </div>

        <div className={styles.presence}>
          {/* The API gives a human string ("2 hours ago"), not a timestamp, so we
              show it verbatim rather than guessing an online/recent state. */}
          <StatusDot state="offline" label={profile.last_active} showLabel={false} />
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.factRow}>
          {profile.occupation && (
            <p className={styles.fact}>
              <span className={styles.factIcon} aria-hidden="true">
                <Icon name="briefcase" />
              </span>
              <span className={styles.factText}>{profile.occupation}</span>
            </p>
          )}
          {profile.highest_education && (
            <p className={styles.fact}>
              <span className={styles.factIcon} aria-hidden="true">
                <Icon name="graduation" />
              </span>
              <span className={styles.factText}>{profile.highest_education}</span>
            </p>
          )}
        </div>

        {showScore && (
          <>
            <div className={styles.scoreRow}>
              <span className={styles.scoreValue}>{score}%</span>
              <span className={styles.scoreText}>
                <span className={styles.scoreLabel}>{BAND_LABELS[bandFor(score)]}</span>
                {/* Never "AI" — this is arithmetic on saved preferences. */}
                <span className={styles.scoreMethod}>{SCORE_METHOD_LABEL}</span>
              </span>
            </div>

            {reasons.length > 0 && (
              <div className={styles.reasons}>
                {reasons.map((reason) => (
                  <Badge key={reason.kind} tone="neutral" title={reason.detail}>
                    {reason.label}
                  </Badge>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <div className={styles.actions}>
        {sent ? (
          <p className={styles.sentState} role="status">
            <Icon name="check-circle" />
            Interest sent
          </p>
        ) : (
          <Button
            variant="accent"
            icon="heart"
            className={[styles.primaryAction, pulse ? styles.heartPulse : ''].filter(Boolean).join(' ')}
            onClick={() => void handleInterest()}
            loading={interest.isPending}
            loadingLabel={`Sending an interest to ${profile.name}`}
          >
            Send interest
            {pulse && <span className={styles.heartGlow} aria-hidden="true" />}
          </Button>
        )}

        <button
          type="button"
          className={[styles.iconAction, saved ? styles.iconActionOn : ''].filter(Boolean).join(' ')}
          onClick={() => void shortlist.run(profile.id, saved)}
          disabled={shortlist.isPending}
          aria-pressed={saved}
          aria-label={saved ? `Remove ${profile.name} from your shortlist` : `Shortlist ${profile.name}`}
        >
          <Icon name={saved ? 'star-filled' : 'star'} />
        </button>

        {conversationId ? (
          <Link
            href={`/messages/${conversationId}`}
            className={styles.iconAction}
            style={{ display: 'grid', placeItems: 'center' }}
            aria-label={`Message ${profile.name}`}
          >
            <Icon name="message" />
          </Link>
        ) : (
          /*
            Messaging only exists after an accepted interest — that is enforced
            server-side, since a Conversation row is created solely by
            InterestController on acceptance. So rather than a button that would
            fail, this explains the rule when pressed.
          */
          <button
            type="button"
            className={styles.iconAction}
            onClick={() =>
              toast.toast({
                title: 'Messaging opens after an accepted interest',
                description: 'Send an interest first. Once it is accepted you can message each other.',
              })
            }
            aria-label={`Messaging ${profile.name} is not available yet`}
          >
            <Icon name="message" />
          </button>
        )}
      </div>

      {/* Stretched link: the whole card navigates, and this carries the
          accessible name for the entire tile. */}
      <Link
        href={profileHref}
        className={styles.linkOverlay}
        aria-label={`View ${profile.name}'s full profile`}
      />
    </article>
  );
}

/* ==========================================================================
   Compact row variant
   ========================================================================== */

export interface ProfileRowProps {
  id: number;
  name: string;
  photo: string | null;
  meta: string;
  /** Right-hand content — usually buttons. */
  actions?: React.ReactNode;
  /** Extra badge beside the name. */
  badge?: React.ReactNode;
  /** Where the row links to. Defaults to the member's profile. */
  href?: string;
}

/**
 * Horizontal row for lists: interests, viewers, shortlist, matches.
 *
 * Uses the same stretched-link pattern as the card, so the row is one click
 * target with one accessible name while its buttons stay independently operable.
 */
export function ProfileRow({ id, name, photo, meta, actions, badge, href }: ProfileRowProps) {
  return (
    <div className={styles.rowCard}>
      <Avatar src={photo} name={name} size="lg" decorative />

      <div className={styles.rowBody}>
        <p className={styles.rowName}>
          {name}
          {badge}
        </p>
        <p className={styles.rowMeta}>{meta}</p>
      </div>

      {actions && <div className={styles.rowActions}>{actions}</div>}

      <Link
        href={href ?? `/profiles/${id}`}
        className={styles.linkOverlay}
        aria-label={`View ${name}'s profile`}
      />
    </div>
  );
}
