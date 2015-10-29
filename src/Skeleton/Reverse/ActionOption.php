<?php
/**
 * Created by IntelliJ IDEA.
 * User: z.wieczorek
 * Date: 22.10.15
 * Time: 09:16
 */

namespace Dfi\TestReverse\Skeleton\Reverse;


use Behat\Mink\Element\NodeElement;
use Dfi\TestReverse\HtmlElements\DataTable\ActionOption as DtActionOption;

class ActionOption
{
    public static function reverse(NodeElement $option, DtActionOption $actionOption)
    {

        if ($actionOption->hasAttribute('data-original-title')) {
            $actionOption->setTitle($actionOption->getAttribute('data-original-title'));
        }
    }
}