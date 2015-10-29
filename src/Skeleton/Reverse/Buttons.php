<?php
/**
 * Created by IntelliJ IDEA.
 * User: z.wieczorek
 * Date: 22.10.15
 * Time: 09:16
 */

namespace Dfi\TestReverse\Skeleton\Reverse;


use Behat\Mink\Element\NodeElement;
use Dfi\TestReverse\HtmlElements\Button;
use Dfi\TestReverse\Skeleton\Elements;

;

class Buttons
{
    public static function reverseAll(NodeElement $content, Elements $elements)
    {
        $buttonElements = $content->findAll('css', 'button');
        if ($buttonElements) {
            foreach ($buttonElements as $buttonElement) {
                $button = new Button();
                self::reverse($buttonElement, $button, $elements);
                if (!$elements->isRegisteredButton($button)) {
                    $elements->addButton($button);
                }
            }
        }
    }

    public static function reverse(NodeElement $buttonNode, Button $buttonObj, Elements $elements = null)
    {


        if ($buttonNode->getTagName() === 'button') {
            $buttonObj->setNode($buttonNode);
        } else {
            throw new \LogicException('tag mismatch');
        }
        $parents = $buttonObj->getParents();
        $outer = $buttonNode->getOuterHtml();

        $label = $buttonNode->getText();
        if ($label) {
            $buttonObj->setLabel($label);
        } else {
            $x = 1;
        }


        //return;

   /*     $elem = [];
        $id = $button->getAttribute('id');

        $html = $button->getOuterHtml();
        $test = '/<[a-z]+\s([^>]*)/';
        if (preg_match($test, $html, $matches)) {
            preg_match_all('/([a-z]+=".*?")/', $matches[1], $attribs1);
            $attribs = preg_split('/ /', $matches[1], null, PREG_SPLIT_DELIM_CAPTURE | PREG_SPLIT_NO_EMPTY);
            $elem['attr'] = $attribs;
        }


        if ($button->getTagName() === 'a') {
            $href = $button->getAttribute('href');
            $elem['href'] = $href;
        }


        if (!$id) {

            $dt = $content->find('css', 'table.table-columnfilter');
            if ($dt) {
                //skip datatable;
                //continue;
            }

            $label = $button->getText();
            $xpath = $button->getXpath();

            $elem['xpath'] = $xpath;
            $elem['label'] = $label;
        } else {
            $label = $button->getText();

            $elements['buttons'][] = ['id' => $id, 'label' => $label];
        }

        $elements['buttons'][] = $elem;*/
    }


}