'use client';

import { useState, type ChangeEvent } from 'react';
import { Alert, Note } from '../ui/feedback';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Icon } from '../ui/icon';
import { deletePhoto, PHOTO_MAX_COUNT, uploadPhoto } from '../../lib/api/actions';
import { photoUrl } from '../../lib/api/media';
import type { PhotoRecord } from '../../lib/api/types';
import styles from './account.module.css';

export function PhotoManager({ initialPhotos }: { initialPhotos: PhotoRecord[] }) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [primary, setPrimary] = useState(photos.length === 0);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);

  const upload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setBusy(true);
    setFeedback(null);
    const result = await uploadPhoto(file, primary);
    setBusy(false);
    if (!result.ok) {
      setFeedback({ tone: 'error', text: result.message });
      return;
    }
    setPhotos((current) => [...current, result.data]);
    setPrimary(false);
    setFeedback({ tone: 'success', text: result.message ?? 'Photo added to your profile.' });
  };

  const remove = async (photo: PhotoRecord) => {
    if (!window.confirm('Remove this photo from your profile?')) return;
    setBusy(true);
    setFeedback(null);
    const result = await deletePhoto(photo.id);
    setBusy(false);
    if (!result.ok) {
      setFeedback({ tone: 'error', text: result.message });
      return;
    }
    setPhotos((current) => current.filter((item) => item.id !== photo.id));
    setFeedback({ tone: 'success', text: result.message ?? 'Photo removed.' });
  };

  return (
    <div className={styles.stack}>
      {feedback && <Alert tone={feedback.tone === 'success' ? 'success' : 'error'}>{feedback.text}</Alert>}
      <Note icon="shield-check">
        Uploads are checked by the server before appearing publicly. A photo can be visible, members-only or
        request-only according to the privacy settings available on the backend.
      </Note>

      {photos.length > 0 && (
        <ul className={styles.photoGrid} aria-label="Your profile photos">
          {photos.map((photo) => {
            const src = photoUrl(photo.thumbnail_path ?? photo.watermarked_path ?? photo.original_path);
            return (
              <li className={styles.photoItem} key={photo.id}>
                {src ? (
                  <img src={src} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" />
                ) : (
                  <Icon name="image" size={36} />
                )}
                <div className={styles.photoItemActions}>
                  {photo.is_primary ? <Badge tone="premium">Primary</Badge> : <span />}
                  <Button
                    variant="danger"
                    size="sm"
                    icon="trash"
                    aria-label="Delete photo"
                    onClick={() => void remove(photo)}
                    disabled={busy}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {photos.length < PHOTO_MAX_COUNT && (
        <label className={styles.photoUpload}>
          <span>
            <Icon name="upload" size={30} />
            <strong style={{ display: 'block', marginTop: 'var(--space-2)' }}>Add a photo</strong>
            <span className={styles.photoHint}>
              JPG, PNG or WebP · up to 5 MB · {PHOTO_MAX_COUNT - photos.length} slots left
            </span>
          </span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={upload}
            disabled={busy}
            style={{ position: 'absolute', width: 1, height: 1, opacity: 0 }}
          />
        </label>
      )}

      {photos.length === 0 && (
        <p className={styles.muted}>Add one clear, recent photo to help members recognise you.</p>
      )}
      {photos.length > 0 && (
        <label className={styles.muted}>
          <input
            type="checkbox"
            checked={primary}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setPrimary(event.target.checked)}
          />{' '}
          Make the next uploaded photo my primary photo
        </label>
      )}
    </div>
  );
}
