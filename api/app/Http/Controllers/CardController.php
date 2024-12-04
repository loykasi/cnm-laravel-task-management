<?php

namespace App\Http\Controllers;


use App\Http\Requests\Card\StoreRequest;
use App\Models\Card;
use App\Services\CardService;
use Illuminate\Http\Request;
use function PHPUnit\Framework\isNull;

class CardController extends Controller
{
    public function __construct(
        protected CardService $cardService
    ) {

    }

    public function index($listId)
    {
        $result = $this->cardService->index($listId);
        if (!$result) {
            return response()->json([
                'message' => 'error'
            ], 404);
        }
        return response([
            'message' => 'Ok',
            'data' => $result
        ], 200);
    }

    public function show($id)
    {
        // Lấy thẻ với các bình luận liên quan
        $card = Card::with(['comments', 'users'])->findOrFail($id);

        // Định dạng dữ liệu trả về
        $data = [
            'id' => $card->id,
            'name' => $card->name,
            'description' => $card->description,
            'comments' => $card->comments->map(function ($comment) {
                return [
                    'id' => $comment->id,
                    'content' => $comment->content,
                    'author' => $comment->author,
                    'timestamp' => $comment->timestamp,
                ];
            }),
            'users' => $card->users->map(function ($user) {
                return [
                    'user' => [
                        'id' => $user->id,
                        'username' => $user->username,
                        'email' => $user->email,
                    ]
                ];
            })
        ];

        return response()->json($data);
    }

    public function store(StoreRequest $request)
    {
        $fields = $request->validated();

        $result = $this->cardService->store($fields['name'], $fields['listId'], $fields['projectId']);

        if ($result)
        {
            return response()->json($result, 200);

        }

        return response()->json([
            'message' => 'failed'
        ], 400);
    }

    public function update($cardId, Request $request)
    {
        $result = $this->cardService->update(
            $cardId,
            $request['fromListId'],
            $request['toListId'],
            $request['projectId'],
            $request['name'],
            $request['description'],
            $request['order'],

            $request['description'],
            $request['comment'],

        );

        if ($result)
        {
            return response()->json([
                'message' => 'card updated'
            ], 200);
        }

        return response()->json([
            'message' => 'failed'
        ], 400);
    }

    public function delete($cardId, Request $request)
    {
        $result = $this->cardService->delete($cardId, $request['projectId']);

        if ($result)
        {
            return response()->json([
                'message' => 'card deleted'
            ], 200);
        }

        return response()->json([
            'message' => 'failed'
        ], 400);
    }
}