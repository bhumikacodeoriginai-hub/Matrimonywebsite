'use client';

/**
 * Photos step.
 *
 * Uploads happen IMMEDIATELY, one request per file, rather than being queued until
 * the member presses Continue. A 5 MB image sitting in memory waiting for a button
 * press is a lost upload on any flaky connection, and the member has no idea it has
 * not been sent.
 *
 * What the member is told, because all of it is true and all of it matters:
 *  • Every photo is reviewed before it becomes visible (server default:
 *    `status: 'pending'`).
 *  • New photos are members-only by default (`privacy_level: 'members_only'`).
 *  • Every upload is watermarked automatically by PhotoService.
 *  • Eight photos maximum, 5 MB each, JPG/PNG/WebP — all enforced server-side, and
 *    checked here too so the feedback is instant and specific.
 *
 * The preview uses a local blob URL rather than the uploaded path, because the
 * server's processed variants are not readable until moderation has run.
 */

import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Alert, Note, Spinner } from '../ui/feedback';
import { Icon } from '../ui/icon';
import { useToast } from '../ui/toast';
import {
  PHOTO_ACCEPTED_TYPES,
  PHOTO_MAX_BYTES,
  PHOTO_MAX_COUNT,
  deletePhoto,
  uploadPhoto,
} from '../../lib/api/actions';
import styles from './wizard.module.css';

interface UploadedPhoto {
  /** Server id once the upload has completed. */
  id: number | null;
  /** Local blob URL used for the preview. */
  preview: string;
  status: 'uploading' | 'pending' | 'failed';
  isPrimary: boolean;
}

export function PhotosStep() {
  const toast = useToast();
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  /* Blob URLs are a memory leak if they are not revoked. */
  useEffect(() => {
    return () => {
      photos.forEach((photo) => URL.revokeObjectURL(photo.preview));
    };
    // Intentionally runs only on unmount — revoking on every change would break
    // previews that are still on screen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFiles = useCallback(
    async (files: FileList) => {
      setError(null);

      const remaining = PHOTO_MAX_COUNT - photos.length;
      if (remaining <= 0) {
        setError(`You can have up to ${PHOTO_MAX_COUNT} photos.`);
        return;
      }

      const selected = Array.from(files).slice(0, remaining);
      if (files.length > remaining) {
        setError(`Only the first ${remaining} of those were added — the limit is ${PHOTO_MAX_COUNT} photos.`);
      }

      for (const file of selected) {
        // Local checks first so the feedback is immediate and names the problem.
        if (!PHOTO_ACCEPTED_TYPES.includes(file.type)) {
          setError(`“${file.name}” is not a JPG, PNG or WebP image.`);
          continue;
        }
        if (file.size > PHOTO_MAX_BYTES) {
          setError(`“${file.name}” is larger than 5 MB. Please choose a smaller photo.`);
          continue;
        }

        const preview = URL.createObjectURL(file);
        const isPrimary = photos.length === 0;

        setPhotos((current) => [...current, { id: null, preview, status: 'uploading', isPrimary }]);

        const result = await uploadPhoto(file, isPrimary);

        setPhotos((current) =>
          current.map((photo) =>
            photo.preview === preview
              ? { ...photo, id: result.ok ? result.data.id : null, status: result.ok ? 'pending' : 'failed' }
              : photo,
          ),
        );

        if (!result.ok) {
          toast.error('That photo did not upload', result.message);
        }
      }

      // Reset the input so choosing the same file again still fires a change.
      if (inputRef.current) inputRef.current.value = '';
    },
    [photos.length, toast],
  );

  const remove = async (photo: UploadedPhoto) => {
    if (photo.id !== null) {
      const result = await deletePhoto(photo.id);
      if (!result.ok) {
        toast.error('Could not remove that photo', result.message);
        return;
      }
    }
    URL.revokeObjectURL(photo.preview);
    setPhotos((current) => current.filter((item) => item.preview !== photo.preview));
  };

  const uploadedCount = photos.filter((photo) => photo.status === 'pending').length;

  return (
    <>
      <div className={styles.group}>
        <h3 className={styles.groupTitle}>Your photos</h3>
        <p className={styles.groupHint}>
          A profile with a photo receives far more interest. Yours stay blurred to other members until you
          choose to share them, and every one is watermarked automatically.
        </p>

        {error && <Alert tone="warning">{error}</Alert>}

        <div className={styles.photoGrid}>
          {photos.map((photo) => (
            <div key={photo.preview} className={styles.photoTile}>
              {/* Local preview: the server's processed copies are not readable
                  until moderation has run. */}
              <img src={photo.preview} alt="" />

              {photo.status === 'uploading' && (
                <span
                  className="center inset"
                  style={{ background: 'rgba(26,19,25,0.55)', color: '#fff' }}
                  role="status"
                >
                  <Spinner size={22} />
                  <span className="sr-only">Uploading</span>
                </span>
              )}

              <span className={styles.photoPending}>
                {photo.status === 'pending' && (
                  <Badge tone="pending" icon="clock" solid>
                    In review
                  </Badge>
                )}
                {photo.status === 'failed' && (
                  <Badge tone="danger" icon="alert" solid>
                    Failed
                  </Badge>
                )}
                {photo.isPrimary && photo.status === 'pending' && (
                  <Badge tone="brand" icon="star" solid>
                    Main
                  </Badge>
                )}
              </span>

              <button
                type="button"
                className={styles.photoRemove}
                onClick={() => void remove(photo)}
                aria-label="Remove this photo"
              >
                <Icon name="close" />
              </button>
            </div>
          ))}

          {photos.length < PHOTO_MAX_COUNT && (
            /* A real <label> wrapping a real file input: keyboard-operable,
               works with screen readers, no click-forwarding hacks. */
            <label className={styles.photoAdd}>
              <span className={styles.photoAddIcon} aria-hidden="true">
                <Icon name="camera" />
              </span>
              <span>Add a photo</span>
              <span style={{ color: 'var(--text-muted)', fontWeight: 'var(--weight-normal)' }}>
                JPG, PNG or WebP · up to 5 MB
              </span>
              <input
                ref={inputRef}
                className={styles.fileInput}
                type="file"
                accept={PHOTO_ACCEPTED_TYPES.join(',')}
                multiple
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  if (event.target.files && event.target.files.length > 0) {
                    void handleFiles(event.target.files);
                  }
                }}
              />
            </label>
          )}
        </div>

        <p role="status" aria-live="polite" className="sr-only">
          {uploadedCount} of {PHOTO_MAX_COUNT} photos uploaded.
        </p>
      </div>

      <div className={styles.group}>
        <h3 className={styles.groupTitle}>What happens to them</h3>
        <Note icon="shield-check">
          Every photo is reviewed by our team before it appears anywhere. Until then it is visible only to
          you.
        </Note>
        <Note icon="eye-off">
          Other members see a blurred version by default. You can change that per photo in your profile
          settings at any time.
        </Note>
        <Note icon="image">
          Each upload is watermarked with the Advaita name, which makes it much harder to reuse elsewhere.
        </Note>
      </div>

      {photos.length === 0 && (
        <Note icon="info">
          You can skip this and add photos later — but a profile without one gets noticeably less attention.
        </Note>
      )}

      {photos.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <Button variant="ghost" icon="plus" onClick={() => inputRef.current?.click()}>
            Add another
          </Button>
        </div>
      )}
    </>
  );
}
