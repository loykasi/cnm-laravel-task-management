<?php

namespace App\Http\Controllers;

use App\Models\Card;
use App\Models\Comment;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    public function store(Request $request, $cardId)
    {
        // Kiểm tra xem thẻ có tồn tại hay không
        $card = Card::findOrFail($cardId);
        // $card = Card::find(1);

        // Xác thực dữ liệu yêu cầu
        $validated = $request->validate([
            'content' => 'required|string|max:255',
            'author' => 'required|string|max:255',
            // 'timestamp' => 'required|date_format:Y-m-d\TH:i:s\Z', // Đảm bảo định dạng timestamp đúng
        ]);

        // Tạo bình luận mới và liên kết với thẻ
        $comment = new Comment([
            'content' => $validated['content'],
            'author' => $validated['author'],
            // 'timestamp' => $validated['timestamp'],
        ]);

        // Lưu bình luận vào thẻ
        $card->comments()->save($comment);

        // Trả về phản hồi thành công với dữ liệu bình luận mới
        return response()->json([
            'message' => 'Comment added successfully.',
            'comment' => $comment
        ], 201); // HTTP status 201 (Created)
    }
}
