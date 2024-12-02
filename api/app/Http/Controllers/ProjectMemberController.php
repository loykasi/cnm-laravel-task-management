<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Project;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
class ProjectMemberController extends Controller
{
   // Add a member to a project
   public function addMember(Request $request, $projectId)
   {
       // Validate the user_id in the request
       $validator = Validator::make($request->all(), [
           'user_id' => 'required|exists:users,id', // Ensures the user_id exists in the users table
       ]);

       if ($validator->fails()) {
           return response()->json(['error' => $validator->errors()], 400);
       }

       // Find the project by ID or fail
       $project = Project::findOrFail($projectId);

       // Find the user by ID or fail
       $user = User::findOrFail($request->input('user_id'));

       // Check if the user is already a member (if necessary)
       if ($project->members->contains($user->id)) {
           return response()->json(['message' => 'User is already a member of this project'], 400);
       }

       // Attach the user to the project (many-to-many relationship)
       $project->members()->attach($user);

       return response()->json(['message' => 'Member added successfully']);
   }

   // Get members of a project
   public function getMembers($projectId)
   {
       // Find the project and load the members
       $project = Project::with('members')->findOrFail($projectId);

       // Return the project members
       return response()->json($project->members);
   }

   public function searchUsers(Request $request)
    {
        $email = $request->query('email');
        $users = User::where('email', 'like', '%' . $email . '%')->get();
        return response()->json($users);
    }

    public function removeMember($projectId, $userId)
    {
        // Lấy thông tin user đang đăng nhập
        $currentUserId = Auth::id();

        // Tìm project
        $project = Project::findOrFail($projectId);

        // Kiểm tra quyền: user hiện tại phải là chủ sở hữu project
        if ($project->user_id !== $currentUserId) {
            return response()->json(['message' => 'Unauthorized: You do not own this project'], 403);
        }

        // Kiểm tra xem user có phải là thành viên không
        if (!$project->members->contains($userId)) {
            return response()->json(['message' => 'User is not a member of this project'], 404);
        }

        // Gỡ user khỏi project
        $project->members()->detach($userId);

        return response()->json(['message' => 'Member removed successfully']);
    }
}
