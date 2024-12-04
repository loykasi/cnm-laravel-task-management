<?php
namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Models\User;

class GoogleController extends Controller
{
    public function handleGoogleLogin(Request $request)
    {
        $googleToken = $request->input('token');
    
        // Gửi yêu cầu giải mã token tới Google
        $client = new \GuzzleHttp\Client();
        $response = $client->get('https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=' . $googleToken);
        $userInfo = json_decode($response->getBody()->getContents());
    
        if (!$userInfo || empty($userInfo->email)) {
            return response()->json(['error' => 'Token không hợp lệ'], 400);
        }
    
        // Kiểm tra hoặc tạo người dùng
        $user = User::firstOrCreate(
            ['email' => $userInfo->email], // Truy cập object bằng "->"
            [
                'username' => $userInfo->name,
                'google_id' => $userInfo->sub,
                'avatar' => $userInfo->picture,
                'password' => bcrypt(Str::random(16)),
            
            ]
        );
    
        // Đăng nhập người dùng
        Auth::login($user);
    
        return response()->json(['token' => $user->createToken('authToken')->plainTextToken, 'email'=>$user->email]);
    }
}