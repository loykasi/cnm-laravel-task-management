<?php

namespace App\Services;

use App\Models\Card;
use Illuminate\Support\Facades\DB;

class CardService
{
    public function index($listId)
    {
        return Card::where('listId', $listId)->get();
    }

    public function store($name, $listId, $projectId)
    {
        $cardCount = Card::where('listId', $listId)->count();
        $card = Card::create([
            'name' => $name,
            'listId' => $listId,
            'order' => $cardCount
        ]);

        return $card;
    }

    public function update($cardId, $listId, $projectId, $name, $order)
    {
        $card = Card::find($cardId);

        if ($order !== null) {
            $result = $this->reorder($card, $order);
            if (!$result) {
                return false;
            }
        }
        if ($name !== null) {
            $card->name = $name;
            $card->listId = $listId;
            $card->save();
        }

        return true;
    }
    
    public function reorder($card, $order) {
        try {
            $oldOrder = $card->order;
    
            $card->order = $order;
            $card->save();
                
            if ($order != $oldOrder) {
                $cards = Card::where([
                    ['id', '<>', $card->id],
                ]);
                
                if ($order > $oldOrder) {
                    $this->reorderOthers($cards, $oldOrder, $order, -1);
                } else {
                    $this->reorderOthers($cards, $order, $oldOrder, 1);
                }
            }

            return true;
        } catch (\Throwable $th) {
            return false;
        }
    }

    private function reorderOthers($cards, $rangeA, $rangeB, $change) {
        $cards = $cards->whereBetween('order', [$rangeA, $rangeB])->get();

        foreach ($cards as $card) {
            $card->order += $change;
            $card->save();
        }
    }

    public function delete($cardId, $projectId)
    {
        return Card::where('id', $cardId)->delete();
    }
}