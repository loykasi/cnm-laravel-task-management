<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CardController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\GoogleController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\CardListController;
use App\Http\Controllers\HomepageController;
use App\Http\Controllers\AuthGoogleController;
use App\Http\Controllers\CardUserController;
use App\Http\Controllers\CommentController;

use App\Http\Controllers\VerificationController;
use App\Http\Controllers\ProjectMemberController;
use App\Http\Controllers\ResetPasswordController;
use App\Http\Controllers\ForgotPasswordController;

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
Route::post('/auth/google', [GoogleController::class, 'handleGoogleLogin']);



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
        Route::delete('/project/{id}', 'delete');
        Route::post('/createproject', 'create');



    });
    Route::controller(UserController::class)->group(function () {
        Route::post('/editprofile',  'editprofile');
        Route::post('/profile',  'getUserProfile');
        Route::post('/upload-avatar',  'uploadAvatar');
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

    Route::delete('projects/{projectId}/members/{userId}', [ProjectMemberController::class, 'removeMember']);


    Route::post('/cards/{cardId}/comments', [CommentController::class, 'store']);
    Route::post('/cards/{cardId}/users', [CardUserController::class, 'store']);
    Route::delete('/cards/{cardId}/users/{userId}', [CardUserController::class, 'delete']);
    Route::get('/cards/{id}', [CardController::class, 'show']);


});

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::middleware(['web'])->group(function () {
    Route::get('auth', [AuthController::class, 'redirectToAuth']);
    Route::get('auth/callback', [AuthController::class, 'handleAuthCallback']);

});

Route::post('/projects/{projectId}/members', [ProjectMemberController::class, 'addMember']);
Route::get('/projects/{projectId}/members', [ProjectMemberController::class, 'getMembers']);

Route::get('/search-users', [ProjectMemberController::class, 'searchUsers']);