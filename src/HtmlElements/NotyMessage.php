<?php
/**
 * Created by IntelliJ IDEA.
 * User: z.wieczorek
 * Date: 21.10.15
 * Time: 08:22
 */

namespace Dfi\TestReverse\HtmlElements;


use Behat\Mink\Element\NodeElement;

class NotyMessage
{
    private $message;
    private $type;
    private $element;

    private function __construct(NodeElement $node, $type, $message)
    {
        $this->element = $node;
        $this->message = $message;
        $this->type = $type;
    }


    public static function createFromNode(NodeElement $node)
    {
        $message = $node->find('css', '.noty_text')->getHtml();
        //$x = $node->getOuterHtml();
        $class = $node->getAttribute('class');

        switch ($class) {

            case 'noty_alert':
                $type = 'alert';
                break;

            case 'noty_warning':
                $type = 'warning';
                break;

            case 'noty_error':
                $type = 'error';
                break;

            case 'noty_information':
                $type = 'information';
                break;

            case 'noty_success':
                $type = 'success';
                break;

            default:
                $type = 'default';
        }

        return new NotyMessage($node, $type, $message);
    }

    public function isError()
    {
        return $this->type === 'error';
    }

    public function clean()
    {
        $this->element->click();
    }


}