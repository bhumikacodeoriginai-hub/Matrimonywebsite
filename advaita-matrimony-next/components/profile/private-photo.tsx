'use client';

/**
 * Photo gallery with the request-access flow.
 *
 * THE SECURITY CONTRACT (also stated in private-photo.module.css)
 * --------------------------------------------------------------
 * When `is_blurred` is true, the `url` the server gave us IS the blurred file —
 * a separate image produced by PhotoService. This component renders that file and
 * nothing else. It never applies a CSS blur to a clear source, and it never
 * preloads the clear source behind an overlay, because both would put the real
 * photo one devtools toggle away from anyone who wanted it.
 *
 * The blur-to-clear animation runs only after `router.refresh()` has returned a
 * newly authorised URL. It animates a different file arriving, not a curtain
 * lifting off one that was already there.
 *
 * ⚠️ WHAT THIS CANNOT FIX
 * All four photo variants sit on Laravel's public disk with guessable paths, so
 * the blur protects the photo from being BROWSED but not from a direct link.
 * Closing that requires an authorising media route server-side. It is recorded in
 * docs/SECURITY_FINDINGS.md and disclosed to members on the privacy page — not
 * papered over here.
 *
 * REQUEST STATE IS NOT PERSISTED SERVER-SIDE
 * `POST /profiles/{id}/request-photo` creates the request, but there is no endpoint
 * to ask "have I already requested this?". The server does answer "already
 * pending" / "already granted" when you try again, which is what drives the state
 * below — so the state is correct after an attempt, and unknown before one.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Icon } from '../ui/icon';
import { Alert } from '../ui/feedback';
import { useToast } from '../ui/toast';
import { requestPhotoAccess, type PhotoRequestOutcome } from '../../lib/api/actions';
import { useAction } from '../../lib/hooks/use-action';
import { photoUrl } from '../../lib/api/media';
import type { ViewablePhoto } from '../../lib/api/types';
import styles from './private-photo.module.css';

export interface PhotoGalleryProps {
  photos: ViewablePhoto[];
  /** Whose photos these are — used for the request and for alt text. */
  memberId: number;
  memberName: string;
}

type RequestState = 'unknown' | 'sent' | 'pending' | 'granted' | 'unavailable';

export function PhotoGallery({ photos, memberId, memberName }: PhotoGalleryProps) {
  const router = useRouter();
  const toast = useToast();

  const [activeIndex, setActiveIndex] = useState(0);
  const [requestState, setRequestState] = useState<RequestState>('unknown');
  const [revealing, setRevealing] = useState(false);

  /** Tracks whether the active photo WAS blurred, to animate the transition. */
  const wasBlurred = useRef<boolean | null>(null);

  const active = photos[activeIndex];

  /**
   * When a photo that was blurred becomes clear (because access was granted and
   * the server sent a different URL), play the reveal once.
   */
  useEffect(() => {
    if (!active) return;
    if (wasBlurred.current === true && active.is_blurred === false) {
      setRevealing(true);
      const timer = window.setTimeout(() => setRevealing(false), 600);
      wasBlurred.current = active.is_blurred;
      return () => window.clearTimeout(timer);
    }
    wasBlurred.current = active.is_blurred;
  }, [active]);

  const request = useAction(requestPhotoAccess, {
    onSuccess: (outcome: PhotoRequestOutcome) => {
      if (outcome === 'already_granted') {
        setRequestState('granted');
        // Access exists; refetch so the server sends the authorised URLs.
        router.refresh();
        return;
      }
      setRequestState(outcome === 'already_pending' ? 'pending' : 'sent');
      toast.success(
        outcome === 'already_pending' ? 'Request already sent' : 'Request sent',
        `${memberName} will be asked to approve it.`,
      );
    },
    onError: (message) => {
      /*
       * This endpoint 500s on an unpatched backend (it references a
       * PhotoAccessRequest model that does not exist). Rather than a generic
       * failure, say what the member can actually conclude.
       */
      setRequestState('unavailable');
      toast.error('Photo requests are unavailable', message);
    },
  });

  const handleRequest = useCallback(() => {
    void request.run(memberId);
  }, [request, memberId]);

  /* -------- No photos -------- */
  if (photos.length === 0) {
    return (
      <div className={styles.empty}>
        <Icon name="user" size={44} />
        <span className={styles.emptyLabel}>No photos yet</span>
        <p className={styles.emptyBody}>
          {memberName} has not added a photo. Many members add one after their first few conversations.
        </p>
      </div>
    );
  }

  const url = photoUrl(active?.url);
  const locked = active?.is_blurred === true;

  return (
    <div className={styles.gallery}>
      <div className={`${styles.frame} ${styles.main}`}>
        {url && (
          <img
            className={[styles.image, revealing ? styles.revealing : ''].filter(Boolean).join(' ')}
            src={url}
            /*
             * Empty alt when locked: describing a deliberately obscured image is
             * misleading. The scrim below carries the real, readable explanation.
             */
            alt={locked ? '' : `${memberName}'s photo`}
            width={560}
            height={700}
            decoding="async"
            referrerPolicy="no-referrer"
            /* First gallery image is usually the largest element on the page. */
            loading="eager"
          />
        )}

        {photos.length > 1 && (
          <span className={styles.counter}>
            {activeIndex + 1} / {photos.length}
          </span>
        )}

        {locked && (
          <div className={styles.lockScrim}>
            <span className={styles.lockIcon} aria-hidden="true">
              <Icon name="lock" />
            </span>

            <h3 className={styles.lockTitle}>Private photo</h3>

            {requestState === 'sent' || requestState === 'pending' ? (
              <>
                <p className={styles.lockBody}>
                  Your request is with {memberName}. You will see their photos here once they approve it.
                </p>
                <Badge tone="pending" icon="clock" solid>
                  Access requested
                </Badge>
              </>
            ) : requestState === 'unavailable' ? (
              <p className={styles.lockBody}>
                Photo requests are temporarily unavailable. Please try again later.
              </p>
            ) : (
              <>
                <p className={styles.lockBody}>
                  {memberName} keeps their photos private until they approve each person. Ask, and they
                  decide.
                </p>
                <div className={styles.lockActions}>
                  <Button
                    variant="secondary"
                    icon="unlock"
                    onClick={handleRequest}
                    loading={request.isPending}
                    loadingLabel="Sending your request"
                  >
                    Request access
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {photos.length > 1 && (
        <div className={styles.thumbs} role="group" aria-label={`${memberName}'s photos`}>
          {photos.map((photo, index) => {
            const thumb = photoUrl(photo.url);
            return (
              <button
                key={photo.id}
                type="button"
                className={[styles.thumb, index === activeIndex ? styles.thumbActive : '']
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => setActiveIndex(index)}
                aria-label={`Photo ${index + 1} of ${photos.length}${photo.is_blurred ? ', private' : ''}`}
                aria-current={index === activeIndex ? 'true' : undefined}
              >
                {thumb && (
                  <img src={thumb} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" />
                )}
                {photo.is_blurred && (
                  <span className={styles.thumbLock} aria-hidden="true">
                    <Icon name="lock" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Honest about the limitation, in the place it matters. */}
      {locked && requestState === 'unknown' && (
        <Alert tone="info">
          Photos are blurred until the member approves you. Requests are reviewed by them, not by us.
        </Alert>
      )}
    </div>
  );
}
