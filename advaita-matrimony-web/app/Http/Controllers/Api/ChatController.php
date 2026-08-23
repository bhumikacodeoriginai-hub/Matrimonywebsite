<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    /**
     * Get all conversations
     */
    public function conversations(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $conversations = Conversation::where('user_one_id', $userId)
            ->orWhere('user_two_id', $userId)
            ->with(['userOne:id,name,unique_id,avatar,is_online,last_active_at', 'userOne.primaryPhoto',
                    'userTwo:id,name,unique_id,avatar,is_online,last_active_at', 'userTwo.primaryPhoto',
                    'latestMessage'])
            ->orderByDesc('last_message_at')
            ->paginate(20);

        $conversations->getCollection()->transform(function ($conv) use ($userId) {
            $otherUser = $conv->user_one_id === $userId ? $conv->userTwo : $conv->userOne;
            $unreadCount = Message::where('conversation_id', $conv->id)
                ->where('sender_id', '!=', $userId)
                ->where('is_read', false)
                ->count();

            return [
                'id' => $conv->id,
                'other_user' => [
                    'id' => $otherUser->id,
                    'name' => $otherUser->name,
                    'unique_id' => $otherUser->unique_id,
                    'photo' => $otherUser->primaryPhoto?->thumbnail_path,
                    'is_online' => $otherUser->is_online,
                    'last_active' => $otherUser->last_active_at?->diffForHumans(),
                ],
                'last_message' => $conv->latestMessage ? [
                    'body' => $conv->latestMessage->body,
                    'type' => $conv->latestMessage->type,
                    'sent_by_me' => $conv->latestMessage->sender_id === $userId,
                    'time' => $conv->latestMessage->created_at->diffForHumans(),
                ] : null,
                'unread_count' => $unreadCount,
                'updated_at' => $conv->last_message_at,
            ];
        });

        return response()->json(['success' => true, 'data' => $conversations]);
    }

    /**
     * Get messages for a conversation
     */
    public function messages(Request $request, int $conversationId): JsonResponse
    {
        $userId = $request->user()->id;

        $conversation = Conversation::where(function ($q) use ($userId) {
            $q->where('user_one_id', $userId)->orWhere('user_two_id', $userId);
        })->findOrFail($conversationId);

        $messages = Message::where('conversation_id', $conversationId)
            ->orderByDesc('created_at')
            ->paginate(50);

        // Mark messages as read
        Message::where('conversation_id', $conversationId)
            ->where('sender_id', '!=', $userId)
            ->where('is_read', false)
            ->update(['is_read' => true, 'read_at' => now()]);

        return response()->json(['success' => true, 'data' => $messages]);
    }

    /**
     * Send a message
     */
    public function sendMessage(Request $request, int $conversationId): JsonResponse
    {
        $request->validate([
            'body' => 'required_without:attachment|string|max:5000',
            'type' => 'in:text,image,audio',
            'attachment' => 'nullable|file|max:10240',
        ]);

        $userId = $request->user()->id;

        $conversation = Conversation::where(function ($q) use ($userId) {
            $q->where('user_one_id', $userId)->orWhere('user_two_id', $userId);
        })->findOrFail($conversationId);

        $attachmentPath = null;
        if ($request->hasFile('attachment')) {
            $attachmentPath = $request->file('attachment')->store("chat/{$conversationId}", 'public');
        }

        $message = Message::create([
            'conversation_id' => $conversationId,
            'sender_id' => $userId,
            'body' => $request->body,
            'type' => $request->type ?? 'text',
            'attachment_path' => $attachmentPath,
        ]);

        $conversation->update(['last_message_at' => now()]);

        // TODO: Send push notification to other user via FCM

        return response()->json(['success' => true, 'data' => $message], 201);
    }

    /**
     * Get unread message count
     */
    public function unreadCount(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $count = Message::whereHas('conversation', function ($q) use ($userId) {
            $q->where('user_one_id', $userId)->orWhere('user_two_id', $userId);
        })
        ->where('sender_id', '!=', $userId)
        ->where('is_read', false)
        ->count();

        return response()->json(['success' => true, 'count' => $count]);
    }
}
