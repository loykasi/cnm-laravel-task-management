<?php

namespace App\Http\Controllers;

use App\Models\Card;
use App\Models\User;
use Illuminate\Http\Request;

class CardUserController extends Controller
{
    public function store(Request $request, $cardId)
    {
        // $request->validate([
        //     'user_id' => 'required|exists:users,id',
        // ]);
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        $card = Card::find($cardId);

        if (!$card) {
            return response()->json(['message' => 'Card not found'], 404);
        }

        $user = User::where('email', $request->email)->first();

        if ($card->users()->where('user_id', $user->id)->exists()) {
            return response()->json(['message' => 'User already assigned to this card'], 400);
        }

        $card->users()->attach($user->id, ['created_at' => now(),]);

        $data = [
            'users' => $card->users->map(function ($user) {
                return [
                    'user' => [
                        'id' => $user->id,
                        'username' => $user->username,
                        'email' => $user->email,
                    ]
                ];
            })
        ];

        // return response()->json(['message' => 'User added to card successfully'], 200);
        return response()->json($data);
    }

    public function delete($cardId, $userId)
    {
        $card = Card::find($cardId);

        if (!$card) {
            return response()->json(['message' => 'Card not found'], 404);
        }

        $user = User::find($userId);

        if (!$user || !$card->users()->where('user_id', $user->id)->exists()) {
            return response()->json(['message' => 'User not assigned to this card'], 400);
        }

        $card->users()->detach($user->id);

        return response()->json(['message' => 'User removed from card successfully'], 200);
    }
}
