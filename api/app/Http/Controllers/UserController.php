<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
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
  
    public function editprofile(Request $request)
    {
        
        // Validate đầu vào
        $validatedData = $request->validate([
            'email' => 'required|email|exists:users,email',
            'username' => 'nullable|string|max:255',
            'job' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:255',
            'bio' => 'nullable|string',
            'avatar' => 'nullable|string', // Avatar dưới dạng base64
        ]);

        try {


            $user = User::where('email', $validatedData['email'])->first();
    
        
          

            if (!$user) {
                return response()->json(['message' => 'Người dùng không tồn tại'], 404);
            }

            // Cập nhật thông tin người dùng
            if (isset($validatedData['username'])) {
                $user->username = $validatedData['username'];
            }

            if (isset($validatedData['job'])) {
                $user->job = $validatedData['job'];
            }
            if (isset($validatedData['address'])) {
                $user->address = $validatedData['address'];
            }
            if (isset($validatedData['bio'])) {
                $user->bio = $validatedData['bio'];
            }
            if (isset($validatedData['avatar'])) {
                $user->avatar = $validatedData['avatar']; // Lưu chuỗi base64
            }

            $user->save();

            return response()->json([
                'message' => 'Cập nhật thông tin thành công',
                'user' => [
                    'username' => $user->username,
                    'email' => $user->email,
                ],
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Đã xảy ra lỗi khi cập nhật thông tin', 'error' => $e->getMessage()], 500);
        }
    }
    public function uploadAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
            'email' => 'required|email',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        // Xử lý upload ảnh
        if ($request->hasFile('avatar')) {
            $avatar = $request->file('avatar');
            $avatarPath = $avatar->store('avatars', 'public'); // Lưu vào storage/app/public/avatars

            // Cập nhật avatar cho người dùng
            $user->avatar = $avatarPath;
            $user->save();

            return response()->json(['avatar' => $user->avatar]);
        }

        return response()->json(['error' => 'No file uploaded'], 400);
    }

}