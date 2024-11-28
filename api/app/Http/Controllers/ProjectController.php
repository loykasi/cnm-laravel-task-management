<?php

namespace App\Http\Controllers;

use App\Events\ProjectCreated;
use App\Http\Requests\Project\DeleteRequest;
use App\Http\Requests\Project\StoreRequest;
use App\Http\Requests\Project\UpdateRequest;
use App\Services\ProjectService;
use App\Models\Project;

class ProjectController extends Controller
{
    public function __construct(private ProjectService $projectService) {}

    public function index() {
        $projects = $this->projectService->index();

        if ($projects) {
            return response([
                'data' => $projects
            ], 200);
        }

        return response([
            'message' => 'not found'
        ], 404);
    }

    public function getUserProject($userId) {
        $projects = $this->projectService->getUserProject($userId);

        if ($projects) {
            return response([
                'data' => $projects
            ], 200);
        }

        return response([
            'message' => 'not found'
        ], 404);
    }

    public function store(StoreRequest $request) {
        $fields = $request->validated();

        $project = $this->projectService->store($fields['name'], $fields['userId']);

        $count = Project::count();

        return response([
            'project' => $project,
            'message' => 'project created'
            ], 200);
    }

    public function update(UpdateRequest $request) {
        $fields = $request->validated();

        $result = $this->projectService->update($fields['id'], $fields['name']);

        if ($result) {
            return response([
                'message' => 'project updated'
                ], 200);
        }

        return response([
            'message' => 'not found'
        ], 404);
    }

    public function delete(DeleteRequest $request) {
        $fields = $request->validated();

        $result = $this->projectService->delete($fields['id']);

        if ($result) {
            return response([
                'message' => 'project updated'
                ], 200);
        }

        return response([
            'message' => 'not found'
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

}