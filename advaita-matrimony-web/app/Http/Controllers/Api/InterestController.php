<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Interest;
use App\Models\Conversation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InterestController extends Controller
{
    /**
     * Send interest to a profile
     */
    public function sendInterest(Request $request, int $userId): JsonResponse
    {
        $sender = $request->user();

        if ($sender->id === $userId) {
            return response()->json(['success' => false, 'message' => 'Cannot send interest to yourself'], 422);
        }

        // Check subscription limits
        $subscription = $sender->activeSubscription;
        if ($subscription && $subscription->package->interest_sends_limit > 0) {
            if ($subscription->interests_used >= $subscription->package->interest_sends_limit) {
                return response()->json(['success' => false, 'message' => 'Interest send limit reached. Please upgrade your plan.'], 403);
            }
        }

        $existing = Interest::where('sender_id', $sender->id)->where('receiver_id', $userId)->first();
        if ($existing) {
            return response()->json(['success' => false, 'message' => 'Interest already sent'], 409);
        }

        Interest::create([
            'sender_id' => $sender->id,
            'receiver_id' => $userId,
            'message' => $request->message,
        ]);

        // Increment usage
        if ($subscription) {
            $subscription->increment('interests_used');
        }

        return response()->json(['success' => true, 'message' => 'Interest sent successfully!']);
    }

    /**
     * Respond to received interest
     */
    public function respondToInterest(Request $request, int $interestId): JsonResponse
    {
        $request->validate(['status' => 'required|in:accepted,rejected']);

        $interest = Interest::where('receiver_id', $request->user()->id)
            ->where('id', $interestId)
            ->where('status', 'pending')
            ->firstOrFail();

        $interest->update([
            'status' => $request->status,
            'responded_at' => now(),
        ]);

        // If accepted, create a conversation
        if ($request->status === 'accepted') {
            Conversation::firstOrCreate([
                'user_one_id' => min($interest->sender_id, $interest->receiver_id),
                'user_two_id' => max($interest->sender_id, $interest->receiver_id),
            ], ['last_message_at' => now()]);
        }

        $message = $request->status === 'accepted' ? 'Interest accepted! You can now chat.' : 'Interest declined.';

        return response()->json(['success' => true, 'message' => $message]);
    }

    /**
     * Get sent interests
     */
    public function sentInterests(Request $request): JsonResponse
    {
        $interests = Interest::where('sender_id', $request->user()->id)
            ->with(['receiver:id,name,unique_id,gender,date_of_birth', 'receiver.primaryPhoto', 'receiver.profile:id,user_id,profile_category,city,state'])
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json(['success' => true, 'data' => $interests]);
    }

    /**
     * Get received interests
     */
    public function receivedInterests(Request $request): JsonResponse
    {
        $interests = Interest::where('receiver_id', $request->user()->id)
            ->with(['sender:id,name,unique_id,gender,date_of_birth', 'sender.primaryPhoto', 'sender.profile:id,user_id,profile_category,city,state,highest_education,occupation'])
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json(['success' => true, 'data' => $interests]);
    }

    /**
     * Get mutual matches (both accepted)
     */
    public function mutualMatches(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $matches = Interest::where(function ($q) use ($userId) {
            $q->where('sender_id', $userId)->orWhere('receiver_id', $userId);
        })
        ->where('status', 'accepted')
        ->with(['sender:id,name,unique_id,gender,date_of_birth', 'sender.primaryPhoto', 'sender.profile:id,user_id,profile_category,city,state',
                'receiver:id,name,unique_id,gender,date_of_birth', 'receiver.primaryPhoto', 'receiver.profile:id,user_id,profile_category,city,state'])
        ->orderByDesc('responded_at')
        ->paginate(20);

        return response()->json(['success' => true, 'data' => $matches]);
    }
}
