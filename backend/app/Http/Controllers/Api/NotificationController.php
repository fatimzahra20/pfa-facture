<?php

namespace App\Http\Controllers\Api;

use App\Models\Notification;
use App\Models\User;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class NotificationController extends Controller
{
    /**
     * Get all notifications for current user
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $notifications = Notification::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        $threadMessages = Notification::where(function ($query) use ($user) {
                $query->where('user_id', $user->id)
                    ->orWhere('from_user_id', $user->id);
            })
            ->orderBy('created_at')
            ->get();

        return response()->json([
            'notifications' => $notifications,
            'thread_messages' => $threadMessages,
            'unread_count' => Notification::where('user_id', $user->id)
                ->whereNull('read_at')
                ->count(),
        ]);
    }

    /**
     * Send a message notification between application roles.
     */
    public function send(Request $request): JsonResponse
    {
        $sender = $request->user();

        $allowedRolesBySender = [
            'admin' => ['user', 'comptable', 'tresorier', 'admin'],
            'comptable' => ['admin', 'tresorier'],
            'user' => ['admin', 'tresorier'],
            'tresorier' => ['admin', 'comptable', 'user'],
        ];

        $senderRole = $sender->role ?? 'user';
        $allowedRoles = $allowedRolesBySender[$senderRole] ?? [];

        if (empty($allowedRoles)) {
            return response()->json(['message' => 'Action non autorisee.'], 403);
        }

        $data = $request->validate([
            'target_role' => ['nullable', 'in:user,admin,comptable,tresorier,all'],
            'target_user_id' => ['nullable', 'integer', 'exists:users,id'],
            'reply_to_id' => ['nullable', 'integer', 'exists:notifications,id'],
            'titre' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
        ]);

        $replyTo = null;
        $threadId = null;
        if (!empty($data['reply_to_id'])) {
            $replyTo = Notification::where('id', $data['reply_to_id'])
                ->where(function ($query) use ($sender) {
                    $query->where('user_id', $sender->id)
                        ->orWhere('from_user_id', $sender->id);
                })
                ->first();

            if (!$replyTo) {
                return response()->json(['message' => 'Message original introuvable.'], 404);
            }

            $threadId = $replyTo->data['thread_id'] ?? $replyTo->id;
        }

        $recipients = User::query()
            ->where('actif', true)
            ->when(!empty($data['target_user_id']), function ($query) use ($data, $allowedRoles) {
                $query->where('id', $data['target_user_id'])
                    ->whereIn('role', $allowedRoles);
            })
            ->when(empty($data['target_user_id']), function ($query) use ($data, $allowedRoles) {
                if (($data['target_role'] ?? 'all') === 'all') {
                    $query->whereIn('role', $allowedRoles);
                    return;
                }

                $query->where('role', $data['target_role'])
                    ->whereIn('role', $allowedRoles);
            })
            ->where('id', '!=', $sender->id)
            ->get();

        if ($recipients->isEmpty()) {
            return response()->json([
                'message' => 'Aucun destinataire trouve.',
            ], 422);
        }

        foreach ($recipients as $recipient) {
            $notification = Notification::create([
                'user_id' => $recipient->id,
                'from_user_id' => $sender->id,
                'type' => 'manual_message',
                'titre' => $data['titre'],
                'description' => $data['description'],
                'data' => [
                    'from_user_id' => $sender->id,
                    'from_name' => $sender->nom ?: $sender->name,
                    'from_email' => $sender->email,
                    'from_role' => $senderRole,
                    'target_role' => $data['target_role'] ?? null,
                    'reply_to_id' => $replyTo?->id,
                    'thread_id' => $threadId,
                ],
            ]);

            if (!$threadId) {
                $payload = $notification->data ?? [];
                $payload['thread_id'] = $notification->id;
                $notification->update(['data' => $payload]);
            }
        }

        return response()->json([
            'message' => 'Message envoye.',
            'sent_count' => $recipients->count(),
        ], 201);
    }

    /**
     * Mark a notification as read
     */
    public function markAsRead($id, Request $request): JsonResponse
    {
        $user = $request->user();
        
        $notification = Notification::where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$notification) {
            return response()->json(['message' => 'Notification non trouvée.'], 404);
        }

        $notification->update(['read_at' => now()]);

        return response()->json([
            'message' => 'Notification marquée comme lue.',
            'notification' => $notification,
        ]);
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        $user = $request->user();
        
        Notification::where('user_id', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json([
            'message' => 'Toutes les notifications sont marquées comme lues.',
        ]);
    }

    /**
     * Delete a notification
     */
    public function destroy($id, Request $request): JsonResponse
    {
        $user = $request->user();
        
        $notification = Notification::where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$notification) {
            return response()->json(['message' => 'Notification non trouvée.'], 404);
        }

        $notification->delete();

        return response()->json(['message' => 'Notification supprimée.']);
    }
}
