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
        $result = Project::where('id', $id)
                            ->update([
                                'name' => $name,
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