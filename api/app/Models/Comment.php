<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    use HasFactory;

    // protected $fillable = ['content', 'author', 'card_id', 'timestamp'];
    protected $guarded = [];

    public function card()
    {
        return $this->belongsTo(Card::class, 'card_id');
    }
}
