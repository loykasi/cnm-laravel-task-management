<?php

namespace App\Services;

use App\Events\ProjectUpdated;
use App\Models\Project;
use Illuminate\Support\Facades\DB;

class ProjectService
{
    public function index() {
        $project = Project::get();

        return $project;
    }

    public function getUserProject($userId) {
        $projects = Project::where('userId', $userId)->get();

        return $projects;
    }

    public function store($name, $userId) {
        $project = Project::create([
            'name' => $name,
            'slug' => Project::createSlug($name),
            'userId' => $userId
        ]);

        return $project;
    }

    public function update($id, $name) {
        $project = Project::find($id);

        if ($project !== null) {
            $project->name = $name;
            $project->save();
        }
        
        broadcast(new ProjectUpdated($project))->toOthers();

        return true;
    }

    public function delete($id) {
        $result = Project::where('id', $id)->delete();

        return $result;
    }

    public function getProjectDetail($projectId) {
        $project = Project::with(['lists.cards'])
                        ->where('id', $projectId)
                        ->first();

        return $project;
    }
}