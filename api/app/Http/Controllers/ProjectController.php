<?php

namespace App\Http\Controllers;

use App\Events\ProjectCreated;
use App\Http\Requests\Project\DeleteRequest;
use App\Http\Requests\Project\StoreRequest;
use App\Http\Requests\Project\UpdateRequest;
use App\Services\ProjectService;
use App\Models\Project;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
class ProjectController extends Controller
{
    public function __construct(private ProjectService $projectService) {}

    public function index(Request $request)
    {
        // Lấy ID của người dùng hiện tại
        $email = $request->input('email');
        if (!$email) {
            return response([
                'message' => 'Email is required.'
                ,$email
            ], 400);
        }
     // Lấy ID của người dùng từ bảng users
        $userId = User::where('email', $email)->value('id');
        if (!$userId) {
            return response([
                'message' => 'User not found.'
            ], 404);
        }

        $projectIds = DB::table('project_user')
        ->where('user_id', $userId)
        ->pluck('project_id');
        $projects = Project::whereIn('id', $projectIds)->get();
    
        if ($projects->isNotEmpty()) {
            return response([
                'data' => $projects
            ], 200);
        }
    
        return response([
            'message' => 'No projects found for the provided user.'
        ], 404);
    }

    public function getUserProject($userId) {
        $projects = $this->projectService->getUserProject($userId);

        if ($projects) {
            return response()->json([
                'data' => $projects
            ], 200);
        }

        return response()->json([
            'message' => 'not found'
        ], 404);
    }

    public function store(StoreRequest $request) {
        $fields = $request->validated();

        $project = $this->projectService->store($fields['name'],  $fields['user_id'], $fields['description'],);

        $count = Project::count();

        if (!$project) {
            return response()->json([
                'error' => 'Project creation failed!',
                'fields' => $fields,
            ], 404);
        }
        
        return response()->json([
            'project' => $project,
            'message' => 'project created'
            ], 200);
    }

    public function update(UpdateRequest $request) {
        $fields = $request->validated();

        $result = $this->projectService->update($fields['id'], $fields['name'], null);

        if ($result) {
            return response()->json([
                'message' => 'project updated'
            ], 200);
        }

        return response()->json([
            'message' => 'not found'
        ], 404);
    }

    public function delete($id) {

        $result = $this->projectService->delete($id);

        if ($result) {
            return response()->json([
                'status' => 'success',
                'message' => 'Project deleted successfully',
            ], 200);
        }

        return response()->json([
            'status' => 'error',
            'message' => 'Project not found',
        ], 404);
    }

    public function getProjectDetail($projectId) {
        $project = $this->projectService->getProjectDetail($projectId);
        
        return response([
            'data' => $project
        ], 200);
    }

    public function countProject() {
        $count = Project::count();
        return response(['count' => $count]);
    }
    public function create(Request $request)
    {
        $email = $request->input('email');
        if (!$email) {
            return response([
                'message' => 'Email is required.'
                ,$email
            ], 400);
        }
    
        $userId = User::where('email', $email)->value('id');
        if (!$userId) {
            return response([
                'message' => 'User not found.'
            ], 404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'status' => 'required|string',
            'dueDate' => 'required|date',
        ]);

        $project = Project::create([
            'name' => $validated['name'],
            'user_id'=>$userId,
            'slug' => $validated['name'],       
            'description' => $validated['description'],
            'status' => $validated['status'],
            'due_date' => $validated['dueDate'],
        ]);
        $project->users()->attach($userId);
        
        return response()->json([
            'success' => true,
            'data' => $project
        ], 200);
    }
}