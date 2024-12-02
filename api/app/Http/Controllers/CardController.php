<?php

namespace App\Http\Controllers;


use App\Http\Requests\Card\StoreRequest;

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

    public function store(StoreRequest $request)
    {
        $fields = $request->validated();
        $result = $this->cardService->store($fields['name'], $fields['description'], $fields['comment'], $fields['listId'], $fields['projectId']);        
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