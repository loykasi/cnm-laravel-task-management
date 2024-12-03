<?php

namespace App\Services;

use App\Events\CardListUpdated;
use App\Models\CardList;
use App\Events\CardListCreated;
use App\Events\CardListDeleted;
use Log;

class CardListService
{
    public function index($projectId)
    {
        return CardList::with(['cards'])->where('projectId', $projectId)->get();
    }

    public function store($name, $projectId)
    {
        $listCount = CardList::where('projectId', $projectId)->count();

        $list = CardList::create([
            'name' => $name,
            'projectId' => $projectId,
            'order' => $listCount
        ]);

        broadcast(new CardListCreated($projectId, $list))->toOthers();

        return $list;
    }

    public function update($listId, $projectId, $name, $order)
    {
        $list = CardList::find($listId);

        if ($order !== null) {
            $result = $this->reorder($list, $order);
            if (!$result) {
                return false;
            }
        }

        if ($name !== null) {
            $list->name = $name;
            $list->save();
        }

        broadcast(new CardListUpdated($projectId, $list))->toOthers();
        return true;
    }

    public function reorder($list, $order) {
        try {
            $oldOrder = $list->order;
    
            $list->order = $order;
            $list->save();
                
            if ($order != $oldOrder) {
                $cardLists = CardList::where([
                    ['id', '<>', $list->id],
                ]);
                
                if ($order > $oldOrder) {
                    $this->reorderOthers($cardLists, $oldOrder, $order, -1);
                } else {
                    $this->reorderOthers($cardLists, $order, $oldOrder, 1);
                }
            }

            return true;
        } catch (\Throwable $th) {
            return false;
        }
    }

    private function reorderOthers($cardLists, $rangeA, $rangeB, $change) {
        $cardLists = $cardLists->whereBetween('order', [$rangeA, $rangeB])->get();

        foreach ($cardLists as $cardList) {
            $cardList->order += $change;
            $cardList->save();
        }
    }

    public function delete($listId, $projectId)
    {
        $list = CardList::where('id', $listId)->first();
        if ($list === null) {
            return false;
        }

        broadcast(new CardListDeleted($projectId, $list->id))->toOthers();
        $list->delete();
        return true;
    }
}