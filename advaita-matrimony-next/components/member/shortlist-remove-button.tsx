'use client';

/**
 * Removes a profile from the shortlist and refreshes the server-rendered list.
 *
 * The whole row disappears on success, which is unambiguous — so no toast is
 * needed for the happy path. Failures still speak, because a row that stubbornly
 * stays put with no explanation is worse than a message.
 */

import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { useToast } from '../ui/toast';
import { removeFromShortlist } from '../../lib/api/actions';
import { useAction } from '../../lib/hooks/use-action';

export function ShortlistRemoveButton({ userId, name }: { userId: number; name: string }) {
  const router = useRouter();
  const toast = useToast();

  const remove = useAction(removeFromShortlist, {
    onSuccess: () => router.refresh(),
    onError: (message) => toast.error('Could not remove that profile', message),
  });

  return (
    <Button
      variant="ghost"
      size="sm"
      icon="star-filled"
      onClick={() => void remove.run(userId)}
      loading={remove.isPending}
      loadingLabel="Removing"
      aria-label={`Remove ${name} from your shortlist`}
    >
      Remove
    </Button>
  );
}
