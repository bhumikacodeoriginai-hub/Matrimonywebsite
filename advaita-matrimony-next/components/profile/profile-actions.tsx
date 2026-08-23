'use client';

/**
 * Sticky action bar on a profile: Send interest · Shortlist · Message · More.
 *
 * Every action hits a real endpoint and every documented failure is handled —
 * 409 (already sent) resolves to the sent state, 403 (plan limit) offers the
 * upgrade path.
 *
 * BLOCKING IS IRREVERSIBLE AND SAYS SO
 * `POST /block/{id}` exists; there is no unblock endpoint. The confirmation dialog
 * states that plainly rather than implying it can be undone from Settings later.
 *
 * REPORTING HAS NO ENDPOINT
 * There is no report route in the API. Rather than a button that silently does
 * nothing, "Report" opens guidance that routes to a real human channel and says
 * what will happen. Recorded in docs/BACKEND_GAPS.md.
 */

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { Icon } from '../ui/icon';
import { Sheet, ConfirmDialog } from '../ui/overlay';
import { Alert, Note } from '../ui/feedback';
import { useToast } from '../ui/toast';
import { addToShortlist, blockUser, removeFromShortlist, sendInterest } from '../../lib/api/actions';
import { useAction } from '../../lib/hooks/use-action';
import { useReducedMotion } from '../../lib/hooks/use-media';
import styles from './profile-detail.module.css';

export interface ProfileActionsProps {
  memberId: number;
  memberName: string;
  interestSent?: boolean;
  shortlisted?: boolean;
  conversationId?: number | null;
}

export function ProfileActions({
  memberId,
  memberName,
  interestSent = false,
  shortlisted = false,
  conversationId = null,
}: ProfileActionsProps) {
  const router = useRouter();
  const toast = useToast();
  const reducedMotion = useReducedMotion();

  const [sent, setSent] = useState(interestSent);
  const [saved, setSaved] = useState(shortlisted);
  const [pulse, setPulse] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);

  const interest = useAction(sendInterest, {
    onSuccess: (_data, message) => {
      setSent(true);
      if (!reducedMotion) {
        setPulse(true);
        window.setTimeout(() => setPulse(false), 700);
      }
      toast.success('Interest sent', message ?? `${memberName} will see it on their dashboard.`);
    },
  });

  const shortlist = useAction(
    async (id: number, currentlySaved: boolean) =>
      currentlySaved ? removeFromShortlist(id) : addToShortlist(id),
    {
      onSuccess: () => setSaved((current) => !current),
      onError: (message) => toast.error('Could not update your shortlist', message),
    },
  );

  const block = useAction(blockUser, {
    onSuccess: () => {
      setBlockOpen(false);
      setMoreOpen(false);
      toast.success('Member blocked', `${memberName} can no longer see or contact you.`);
      // They are gone from every list now; send the member somewhere valid.
      router.replace('/discover');
    },
    onError: (message) => toast.error('Could not block that member', message),
  });

  const handleInterest = async () => {
    const result = await interest.run(memberId);
    if (!result || result.ok) return;

    if (result.alreadyDone) {
      setSent(true);
      toast.toast({ title: 'Already sent', description: 'You have sent this member an interest before.' });
      return;
    }
    if (result.notAllowed) {
      toast.toast({
        title: 'Interest limit reached',
        description: result.message,
        tone: 'premium',
        action: { label: 'See plans', onClick: () => router.push('/subscription') },
      });
      return;
    }
    toast.error('Could not send that interest', result.message);
  };

  return (
    <>
      <div className={styles.actionBar}>
        {sent ? (
          <p className={styles.actionSent} role="status">
            <Icon name="check-circle" />
            Interest sent
          </p>
        ) : (
          <Button
            variant="accent"
            icon="heart"
            className={styles.actionPrimary}
            onClick={() => void handleInterest()}
            loading={interest.isPending}
            loadingLabel={`Sending an interest to ${memberName}`}
          >
            Send interest
          </Button>
        )}

        <button
          type="button"
          className={[styles.actionIcon, saved ? styles.actionIconOn : ''].filter(Boolean).join(' ')}
          onClick={() => void shortlist.run(memberId, saved)}
          disabled={shortlist.isPending}
          aria-pressed={saved}
          aria-label={saved ? `Remove ${memberName} from your shortlist` : `Shortlist ${memberName}`}
        >
          <Icon name={saved ? 'star-filled' : 'star'} />
        </button>

        {conversationId ? (
          <Link
            href={`/messages/${conversationId}`}
            className={styles.actionIcon}
            style={{ display: 'grid', placeItems: 'center' }}
            aria-label={`Message ${memberName}`}
          >
            <Icon name="message" />
          </Link>
        ) : (
          <button
            type="button"
            className={styles.actionIcon}
            onClick={() =>
              toast.toast({
                title: 'Messaging opens after an accepted interest',
                description: 'Send an interest first. Once it is accepted you can message each other.',
              })
            }
            aria-label={`Messaging ${memberName} is not available yet`}
          >
            <Icon name="message" />
          </button>
        )}

        <button
          type="button"
          className={styles.actionIcon}
          onClick={() => setMoreOpen(true)}
          aria-label="More options"
          aria-expanded={moreOpen}
        >
          <Icon name="more" />
        </button>

        {pulse && <span className="sr-only">Interest sent</span>}
      </div>

      {/* -------- More -------- */}
      <Sheet
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        title="More options"
        description={`Manage how you and ${memberName} interact.`}
      >
        <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
          <Note icon="shield">
            Advaita never asks members for money. If someone does, tell us — that account will be removed.
          </Note>

          {/*
            No report endpoint exists, so this does not pretend to file one. It
            routes to a channel a person actually reads and says what happens next.
          */}
          <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
            <Alert tone="warning" title="Report this member">
              To report someone, email <strong>safety@advaitamatrimony.com</strong> with their profile ID. A
              person reviews every report, usually within a day, and you will get a reply. In-app reporting is
              not built yet, and we would rather say so than give you a button that goes nowhere.
            </Alert>

            <Button
              variant="secondary"
              icon="flag"
              onClick={() => {
                void navigator.clipboard
                  ?.writeText(`Advaita profile ID: ${memberId} (${memberName})`)
                  .then(() => toast.success('Copied', 'Profile details copied — paste them into your email.'))
                  .catch(() => toast.error('Could not copy', 'Please note the profile ID manually.'));
              }}
            >
              Copy profile details for your report
            </Button>
          </div>

          <Button variant="danger" icon="ban" onClick={() => setBlockOpen(true)}>
            Block {memberName}
          </Button>
        </div>
      </Sheet>

      {/* -------- Block confirmation -------- */}
      <ConfirmDialog
        open={blockOpen}
        onClose={() => setBlockOpen(false)}
        onConfirm={() => void block.run(memberId)}
        title={`Block ${memberName}?`}
        confirmLabel="Block permanently"
        destructive
        pending={block.isPending}
        body={
          <>
            They will no longer be able to see your profile, view your photos or contact you, and they will
            not appear in your search results.
            <br />
            <br />
            <strong>This cannot be undone from the app.</strong> There is no unblock feature yet — you would
            need to email support to reverse it.
          </>
        }
      />
    </>
  );
}
