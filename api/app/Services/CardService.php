<?php

namespace App\Services;

use App\Events\CardCreated;
use App\Events\CardDeleted;
use App\Events\CardUpdated;
use App\Models\Card;
use Illuminate\Support\Facades\DB;

class CardService
{
    public function index($listId)
    {
        return Card::where('listId', $listId)->get();
    }

    public function store($name, $desc, $cmt, $listId, $projectId)
    {
        $cardCount = Card::where('listId', $listId)->count();
        $card = Card::create([
            'name' => $name,
            'description' => $desc,
            'comment' => $cmt,
            'listId' => $listId,
            'order' => $cardCount
        ]);

        broadcast(new CardCreated($projectId, $card))->toOthers();

        return $card;
    }

    public function update($cardId, $fromListId, $toListId, $projectId, $name, $order, $desc, $cmt)
    {
        $card = Card::find($cardId);

        if ($order !== null) {
            $this->reorder($card, $order, $fromListId, $toListId);
        }
        if ($name !== null) {
            $card->name = $name;
            if ($desc !== null) {$card->description = $desc;}
            if ($cmt !== null) {$card->comment = $cmt;}
            $card->save();
        }

        broadcast(new CardUpdated($projectId, $fromListId, $card))->toOthers();

        return true;
    }

    public function reorder($card, $order, $fromListId, $toListId) {
        $oldOrder = $card->order;

        $card->order = $order;
        $card->listId = $toListId;
        $card->save();

        if ($fromListId === $toListId) {
            if ($order != $oldOrder) {
                $cards = Card::where([
                    ['listId', $toListId],
                    ['id', '<>', $card->id],
                ]);

                if ($order > $oldOrder) {
                    $this->reorderOthersInBetween($cards, $oldOrder, $order, -1);
                } else {
                    $this->reorderOthersInBetween($cards, $order, $oldOrder, 1);
                }
            }
        } else {
            $this->reorderOthersFrom($card->id, $fromListId, $oldOrder, -1);
            $this->reorderOthersFrom($card->id, $toListId, $order, 1);
        }
    }

    private function reorderOthersInBetween($cards, $rangeA, $rangeB, $change) {
        $cards = $cards->whereBetween('order', [$rangeA, $rangeB])->get();

        foreach ($cards as $card) {
            $card->order += $change;
            $card->save();
        }
    }

    private function reorderOthersFrom($cardId, $listId, $fromValue, $change) {
        $cards = Card::where([
            ['listId', $listId],
            ['id', '<>', $cardId],
            ['order', '>=', $fromValue]
        ])->get();

        foreach ($cards as $card) {
            $card->order += $change;
            $card->save();
        }
    }

    public function delete($cardId, $projectId)
    {
        $card = Card::where('id', $cardId)->first();
        if ($card === null) {
            return false;
        }

        broadcast(new CardDeleted($projectId, $card->listId, $card->id))->toOthers();
        $card->delete();
        return true;
    }
}
