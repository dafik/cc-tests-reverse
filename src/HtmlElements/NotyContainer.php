<?php
/**
 * Created by IntelliJ IDEA.
 * User: z.wieczorek
 * Date: 21.10.15
 * Time: 08:22
 */

namespace Dfi\TestReverse\HtmlElements;


use Behat\Mink\Element\NodeElement;

class NotyContainer
{
    /**
     * @var NodeElement
     */
    protected $node;
    /**
     * @var NotyMessage[]
     */
    private $messages = [];


    public static function createFromNode(NodeElement $node)
    {
        $noty = new NotyContainer();

        $noty->parse($node);

        return $noty;
    }


    public function parse(NodeElement $node)
    {
        $this->node = $node;

        $elems = $node->findAll('css', 'li');
        foreach ($elems as $elem) {
            $notyMessage = NotyMessage::createFromNode($elem);

            $this->messages[] = $notyMessage;
        }
    }


    public function hasErrorMessages()
    {
        $found = false;
        foreach ($this->messages as $message) {
            if ($message->isError()) {
                $found = true;
            }
        }

        return $found;
    }

    public function getErrorMessages()
    {
        $found = [];
        foreach ($this->messages as $message) {
            if ($message->isError()) {
                $found[] = $message;
            }
        }
        return $found;
    }

    public function getMessages()
    {
        return $this->messages;
    }

    public function clean()
    {
        /** @var NotyMessage $message */
        foreach (array_reverse($this->messages) as $message) {
            $message->clean();
        }
        $this->messages = [];

        //TODO find hidden in queue

        $this->node;
    }


}