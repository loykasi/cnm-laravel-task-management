<?php

namespace App\Http\Controllers;

use App\Http\Requests\CardList\DeleteRequest;
use App\Http\Requests\CardList\ReorderRequest;
use App\Http\Requests\CardList\StoreRequest;
use App\Http\Requests\CardList\UpdateRequest;
use App\Services\CardListService;
use Illuminate\Http\Request;

class CardListController extends Controller
{
    public function __construct(
        protected CardListService $cardListService
    ) {
        
    }

    public function index($projectId)
    {
        $result = $this->cardListService->index($projectId);
        return response([
            'message' => 'Ok',
            'data' => $result
        ], 200);
    }

    public function store(StoreRequest $request)
    {
        $fields = $request->validated();
        $result = $this->cardListService->store($fields['name'], $fields['projectId']);
        
        if ($result)
        {
            return response($result, 200);
        }

        return response([
            'message' => 'failed'
        ], 400);
    }

    public function update($listId, Request $request)
    {
        $result = $this->cardListService->update(
            $listId,
            $request['projectId'],
            $request['name'],
            $request['order'],
        );

        if ($result) {
            return response([
                'message' => 'list updated'
            ], 200);
        }

        return response([
            'message' => 'failed'
        ], 400);
    }

    public function delete($listId, Request $request)
    {
        $result = $this->cardListService->delete($listId, $request['projectId']);

        if ($result)
        {
            return response([
                'message' => 'list deleted'
            ], 200);
        }

        return response([
            'message' => 'failed'
        ], 400);
    }
}
