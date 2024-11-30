<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;

class UserController extends Controller
{
    public function getUserProfile(Request $request)
    {
        $email = $request->input('email');

        $user = User::where('email', $email)->first();

        // Nếu không tìm thấy người dùng
        if (!$user) {
            return response()->json(['message' => 'Không tìm thấy người dùng.'], 404);
        }

        return response()->json([
            'name' => $user->username,
            'phone' => $user->phone,
            'email' => $user->email,
            'avatar'=>$user->avatar,
            'address'=>$user->address,
            'bio'=>$user->bio,
            'job'=>$user->job,
        ]);
    }
}