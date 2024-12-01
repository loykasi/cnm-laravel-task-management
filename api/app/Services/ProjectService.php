<?php

namespace App\Services;

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

    public function store($name, $desc, $userId) {
        $project = Project::create([
            'name' => $name,
            // 'slug' => Project::createSlug($name),
            'description' => $desc,
            'user_id' => $userId
        ]);

        return $project;
    }

    public function update($id, $name, $desc) {
        $result = Project::where('id', $id)
                            ->update([
                                'name' => $name,
                                'description' => $desc,
                            ]);

        return $result;
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
