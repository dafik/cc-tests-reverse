<?php
/**
 * Created by IntelliJ IDEA.
 * User: z.wieczorek
 * Date: 22.10.15
 * Time: 09:15
 */

namespace Dfi\TestReverse\Skeleton\Reverse\Input;


use Behat\Mink\Element\NodeElement;
use Dfi\TestReverse\HtmlElements\Inputs\Select as InputSelect;
use Dfi\TestReverse\Skeleton\Reverse\Inputs;
use LogicException;

class Select extends Inputs
{
    public static function reverse(NodeElement $selectNode, InputSelect $select)
    {
        if ($selectNode->getTagName() === 'select') {
            $select->setNode($selectNode);
        } else {
            throw new LogicException('tag mismatch');
        }
        $parents = $select->getParents();

        if ($select->hasAttribute('name')) {
            $select->setName($select->getAttribute('name'));
        }


        $res = self::findLabelByParent($select);
        if (!$res) {
            $x = 1;
        }
        $select->setLabel($res);
        //return;


        /*if (!$id && !$name) {
            if (false !== strpos($selectNode->getAttribute('class'), 'dtSearch')) { //datatables column filter
                continue;
            }

            $dt = $content->find('css', 'table.table-columnfilter');
            if ($dt) {
                //skip datatable;
                continue;
            }
            $class = $selectNode->getAttribute('class');
            if ($class && $class == 'select2-search__field') {
                continue;
            }
            if (false !== strpos($selectNode->getParent()->getParent()->getAttribute('class'), 'CodeMirror')) {
                continue;
                $p = $selectNode->getParent()->getParent()->getParent()->getParent();
            } else {
                if ($type == 'search') {
                    continue;
                }
                $x = 1;
                $p = $selectNode;
            }


            $label = $p->find('css', 'label');
            if ($label) {
                $label = $label->getText();
            } else {
                $label = $selectNode->getAttribute('placeholder');
            }
            self::addNotNull($elem, 'label', $label);

            $xpath = $selectNode->getXpath();
            self::addNotNull($elem, 'xpath', $xpath);

        } else {
            if (false !== strpos($name, '_length')) { //datatables per page
                continue;
            }
            if ($name) {
                $label = $selectNode->find('css', 'label[for="' . $name . '"]');
                if (!$label) {
                    if ($type == 'checkbox') {
                        $p = $selectNode->getParent()->getParent()->getParent();
                        $h = $p->getHtml();
                        $h = $p->getOuterHtml();

                        $label = $p->getText();
                    }
                }
            } else {

                $label = $selectNode->find('css', 'label[for=' . $id . ']');
            }
            if (!is_string($label)) {

                if ($label) {
                    $label = $label->getText();
                } else {
                    $label = $selectNode->getValue();
                }
            }
            self::addNotNull($elem, 'label', $label);
        }

        $elements['inputs'][] = $elem;*/

    }
}