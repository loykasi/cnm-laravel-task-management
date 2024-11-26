<?php

namespace App\Http\Controllers;

use App\Events\CardListCreated;
use App\Http\Requests\Card\ReorderRequest;
use App\Http\Requests\Card\StoreRequest;
use App\Http\Requests\Card\UpdateRequest;
use App\Http\Requests\Card\DeleteRequest;
use App\Services\CardService;
use Illuminate\Http\Request;

class CardController extends Controller
{
    public function __construct(
        protected CardService $cardService
    ) {
        
    }

    public function index($listId)
    {
        $result = $this->cardService->index($listId);
        return response([
            'message' => 'Ok',
            'data' => $result
        ], 200);
    }

    public function store(StoreRequest $request)
    {
        $fields = $request->validated();
        $result = $this->cardService->store($fields['name'], $fields['listId'], $request['projectId']);
        
        if ($result)
        {
            return response([
                'message' => 'card created'
            ], 200);
        }

        return response([
            'message' => 'failed'
        ], 400);
    }

    public function update($cardId, Request $request)
    {
        $result = $this->cardService->update(
            $cardId,
            $request['name'],
            $request['listId'],
            $request['order'],
            $request['projectId']
        );

        if ($result)
        {
            return response([
                'message' => 'card updated'
            ], 200);
        }

        return response([
            'message' => 'failed'
        ], 400);
    }

    public function delete($cardId, Request $request)
    {
        $result = $this->cardService->delete($cardId, $request['projectId']);

        if ($result)
        {
            return response([
                'message' => 'card deleted'
            ], 200);
        }

        return response([
            'message' => 'failed'
        ], 400);
    }
}
