<?php
/**
 * Created by IntelliJ IDEA.
 * User: z.wieczorek
 * Date: 22.10.15
 * Time: 09:15
 */

namespace Dfi\TestReverse\Skeleton\Reverse;


use Behat\Mink\Element\NodeElement;
use Dfi\TestReverse\HtmlElements\Inputs\Checkbox;
use Dfi\TestReverse\HtmlElements\Inputs\File;
use Dfi\TestReverse\HtmlElements\Inputs\FormElement;
use Dfi\TestReverse\HtmlElements\Inputs\Input;
use Dfi\TestReverse\HtmlElements\Inputs\Radio;
use Dfi\TestReverse\HtmlElements\Inputs\Select;
use Dfi\TestReverse\HtmlElements\Inputs\Submit;
use Dfi\TestReverse\HtmlElements\Inputs\Text;
use Dfi\TestReverse\HtmlElements\Inputs\Textarea;
use Dfi\TestReverse\Skeleton\Elements;


class Inputs
{
    public static function reverseAll(NodeElement $content, Elements $elements = null)
    {

        $inputsElements = $content->findAll('css', 'input,select,textarea');
        if ($inputsElements) {
            foreach ($inputsElements as $inputsElement) {
                $input = self::reverse($inputsElement, $elements);
                if ($input) {
                    $elements->addInput($input);
                }
            }
        }
    }

    public static function reverse(NodeElement $content, Elements $elements = null)
    {
        $tag = $content->getTagName();


        if ($tag === 'select') {
            $input = new Select();
        } elseif ($tag === 'textarea') {
            $input = new Textarea();
        } elseif ($tag === 'input') {
            $input = new Input();
            $input->setNode($content);

            switch ($input->getAttribute('type')) {
                case 'checkbox':
                    $input = new Checkbox();
                    break;
                case 'submit':
                    $input = new Submit();
                    break;
                case 'text':
                    $input = new Text();
                    break;
                case 'radio':
                    $input = new Radio();
                    break;
                case 'file':
                    $input = new File();
                    break;
                case 'hidden':
                    return false;
                case 'search':
                    $input = new Text();
                    $input->setLabel('dtsearch');
                    $input->setNode($content);
                    return $input;
                    break;
                default:
                    //hidden
                    $x = 1;
                    return false;
                    break;
            }
        } else {   //hidden
            $x = 1;
            return false;
        }
        /** @var Input $input */
        $input->setNode($content);
        if ($elements && $elements->isRegisteredInput($input)) {
            return false;
        }


        $outer = $content->getOuterHtml();
        $inner = $content->getHtml();
        $txt = $content->getText();
        $parents = $input->getParents();

        $res = self::findLabelByParent($input);
        if ($res) {
            $input->setLabel($res);
            return $input;
        }
        $res = self::findLabelByPlaceholder($input);
        if ($res) {
            $input->setLabel($res);
            return $input;
        }
        $res = self::findLabelByStdForm($input);
        if ($res) {
            $input->setLabel($res);
            return $input;
        }
        $res = self::findLabelByValue($input);
        if ($res) {
            $input->setLabel($res);
            return $input;
        }


        if (!$input->getId() && !$input->getName()) {
            if (false !== $input->hasClass('dtSearch')) { //datatables column filter
                $x = 1;
            }

            /*   $dt = $content->find('css', 'table.table-columnfilter');
               if ($dt) {
                   //skip datatable;
                   $x =1;
               }*/
            $class = $content->getAttribute('class');
            if ($class && $class === 'select2-search__field') {
                $x = 1;
            }
            if (false !== strpos($content->getParent()->getParent()->getAttribute('class'), 'CodeMirror')) {
                $x = 1;
                $p = $content->getParent()->getParent()->getParent()->getParent();
            } else {
                if ($input->getType() === 'search') {
                    $x = 1;
                }
                $x = 1;
                $p = $content;
            }


            $label = $p->find('css', 'label');
            if ($label) {
                $label = $label->getText();
            } else {
                $label = $content->getAttribute('placeholder');
            }
            //self::addNotNull($elem, 'label', $label);

            $xpath = $input->getXpath();
            //self::addNotNull($elem, 'xpath', $xpath);

        } else {
            if (false !== strpos($input->getName(), '_length')) { //datatables per page
                $x = 1;
            }
            if ($input->getName()) {
                $label = $content->find('css', 'label[for="' . $input->getName() . '"]');
                if (!$label) {
                    if ($input->getType() === 'checkbox') {
                        $p = $content->getParent()->getParent()->getParent();
                        $h = $p->getHtml();
                        $h = $p->getOuterHtml();

                        $label = $p->getText();
                    } else {
                        $x = 1;
                    }
                }
            } else {

                $label = $content->find('css', 'label[for=' . $input->getId() . ']');
            }
            if (!is_string($label)) {

                if ($label) {
                    $label = $label->getText();
                } else {
                    $label = $content->getValue();
                }
            }
            //self::addNotNull($elem, 'label', $label);
        }

        return $input;
    }

    protected static function findLabelByParent(FormElement $input)
    {
        $parentLabel = $input->getNode()->getParent();
        if ($parentLabel && $parentLabel->getTagName() === 'label') {

            $x = $parentLabel->getOuterHtml();
            $dom = new \DOMDocument();
            $dom->loadHTML('<?xml encoding="UTF-8">' . $x);

            $s = simplexml_import_dom($dom);
            $l = (string)$s->body->label;

            return $l;
        }
        return false;

    }

    protected static function findLabelByPlaceholder(FormElement $input)
    {

        if ($input->hasAttribute('placeholder')) {
            $l = $input->getAttribute('placeholder');
            return $l;
        }
        return false;
    }

    private static function findLabelByStdForm(FormElement $input)
    {


        if ($input->getType() === 'radio') {
            $content = $input->getNode()->getParent()->getParent()->getParent()->find('css', 'label');
            $lLabel = $content->getText();

            $content = $input->getNode()->getParent()->getParent()->getParent()->getParent()->getParent()->find('css', 'label');
            if ($content && $input->getName() === $content->getAttribute('for')) {
                return $content->getText() . ' ' . $lLabel;
            }


        } elseif ($input->getType() === 'checkbox') {
            $x = 1;
            $content = $input->getNode()->getParent()->getParent()->getParent()->getParent()->find('css', 'label');
            if ($content && $input->getName() === $content->getAttribute('for')) {
                return $content->getText();
            }

        } else {
            $content = $input->getNode()->getParent()->getParent()->find('css', 'label');
            if ($content && $input->getId() === $content->getAttribute('for')) {
                return $content->getText();
            }
        }
        /*$outer = $content->getOuterHtml();
        $inner = $content->getHtml();
        $txt = $content->getText();
        $parents = $input->getParents();*/


        return false;


    }

    private static function findLabelByValue(FormElement $input)
    {
        if ($input->getType() === 'submit' && $input->hasAttribute('value') && $input->getAttribute('value')) {
            return $input->getAttribute('value');
        }
        return false;
    }

}