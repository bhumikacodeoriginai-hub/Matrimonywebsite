'use client';

/**
 * Accept / decline buttons for a received interest.
 *
 * The only interactive part of the dashboard's interest list, so it is the only
 * part that ships as a Client Component.
 *
 * ACCEPTING IS SIGNIFICANT: it is the single action that creates a conversation
 * (`InterestController` `firstOrCreate`s the Conversation row on acceptance, and
 * nothing else in the API ever does). So the success message says so — a member
 * should know they have just opened a channel, not merely dismissed a card.
 *
 * Declining is deliberately NOT styled as destructive-red. Declining is a normal,
 * complete answer, and dressing it as a dangerous action pressures people into
 * accepting.
 */

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useToast } from '../ui/toast';
import { respondToInterest } from '../../lib/api/actions';
import { useAction } from '../../lib/hooks/use-action';

export function InterestActions({ interestId, senderName }: { interestId: number; senderName: string }) {
  const router = useRouter();
  const toast = useToast();
  const [outcome, setOutcome] = useState<'accepted' | 'rejected' | null>(null);

  const respond = useAction(respondToInterest, {
    onError: (message) => toast.error('That did not go through', message),
  });

  const handle = async (status: 'accepted' | 'rejected') => {
    const result = await respond.run(interestId, status);
    if (!result?.ok) return;

    setOutcome(status);

    if (status === 'accepted') {
      toast.success('Interest accepted', `You and ${senderName} can message each other now.`);
    } else {
      toast.toast({ title: 'Interest declined', description: 'They will not be told why.' });
    }

    // Refresh the server-rendered lists and the shell's pending count.
    router.refresh();
  };

  if (outcome === 'accepted') {
    return (
      <Badge tone="verified" icon="check-circle">
        Accepted
      </Badge>
    );
  }

  if (outcome === 'rejected') {
    return <Badge tone="neutral">Declined</Badge>;
  }

  return (
    <>
      {/* Ghost, not danger: declining is a normal answer. */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => void handle('rejected')}
        disabled={respond.isPending}
        aria-label={`Decline the interest from ${senderName}`}
      >
        Decline
      </Button>
      <Button
        variant="accent"
        size="sm"
        icon="check"
        onClick={() => void handle('accepted')}
        loading={respond.isPending}
        loadingLabel="Responding"
        aria-label={`Accept the interest from ${senderName}`}
      >
        Accept
      </Button>
    </>
  );
}
