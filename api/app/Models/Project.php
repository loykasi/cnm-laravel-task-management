<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Project extends Model
{
    use HasFactory;

    protected $guarded = [];

    public static function createSlug($name) {
        $code = Str::random(10) . time();
        $slug = Str::slug($name) . '-' . $code;
        return $slug;
    }

    public function lists() {
        return $this->hasMany(CardList::class, 'projectId');
    }

    public function members()
    {
        return $this->belongsToMany(User::class, 'project_user');
    }
    public function users()
    {
        return $this->belongsToMany(User::class, 'project_user', 'project_id', 'user_id')->withTimestamps();
    }

}