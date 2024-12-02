<?php

use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\RoomController;

use App\Http\Controllers\GoogleController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\HomepageController;
use App\Http\Controllers\AuthGoogleController;
use App\Http\Controllers\VerificationController;
use App\Http\Controllers\ResetPasswordController;
use App\Http\Controllers\ForgotPasswordController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\CardController;
use App\Http\Controllers\CardListController;
use Illuminate\Broadcasting\BroadcastController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Các route không yêu cầu người dùng đăng nhập
Route::post('/forgot-password', ForgotPasswordController::class);
Route::post('/reset-password', ResetPasswordController::class);
Route::post('/send-verification-code', [VerificationController::class, 'sendVerificationCode']);
Route::post('/verifyOtp', [VerificationController::class, 'verifyOtp']);
// Các route yêu cầu người dùng đăng nhập
Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/broadcasting/auth', [BroadcastController::class, 'authenticate']);
    Route::post('/logout', [AuthController::class, 'logout']);
  

    Route::controller(ProjectController::class)->group(function() {
        Route::get('/project', 'index');
        Route::get('/user/{userId}/project', 'getUserProject');
        Route::get('/project/{projectId}', 'getProjectDetail');
        Route::post('/project', 'store');
        Route::put('/project', 'update');
    });
    Route::controller(UserController::class)->group(function () {
        Route::post('/editprofile',  'editprofile');
        Route::post('/profile',  'getUserProfile');
        Route::post('/upload-avatar',  'uploadAvatar');
    });

    Route::controller(CardListController::class)->group(function() {
        Route::get('/project/{projectId}/list', 'index');
        Route::post('/list', 'store');
        Route::put('/list/{listId}', 'update');
        Route::delete('/list/{listId}', 'delete');
    });

    Route::controller(CardController::class)->group(function() {
        // Route::get('/list/{listId}/card', 'index');
        Route::post('/card', 'store');
        Route::put('/card/{cardId}', 'update');
        Route::delete('/card/{cardId}', 'delete');
    });
});

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::middleware(['web'])->group(function () {
    Route::get('auth', [AuthController::class, 'redirectToAuth']);
    Route::get('auth/callback', [AuthController::class, 'handleAuthCallback']);
});