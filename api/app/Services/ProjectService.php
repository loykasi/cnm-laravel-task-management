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
        $projects = Project::where('user_id', $userId)->get();

        return $projects;
    }

    public function store($name, $userId, $desc) {
        $project = Project::create([
            'name' => $name,
            'slug' => Project::createSlug($name),
            'user_id' => $userId,
            'description' => $desc,
        ]);

        return $project;
    }

    public function update($id, $name, $desc) {
        $project = Project::find($id);

        if ($project !== null) {
            $project->name = $name;
            if ($desc !== null)
                $project->description = $desc;
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
        $project = Project::with(['lists.cards.users'])
                        ->where('id', $projectId)
                        ->first();

        return $project;
    }
}