<?php
/**
 * Created by IntelliJ IDEA.
 * User: z.wieczorek
 * Date: 22.10.15
 * Time: 09:15
 */

namespace Dfi\TestReverse\Skeleton\Reverse;


use Behat\Mink\Element\NodeElement;
use Dfi\TestReverse\HtmlElements\Button;
use Dfi\TestReverse\HtmlElements\Control;
use Dfi\TestReverse\HtmlElements\DataTable as dTable;
use Dfi\TestReverse\HtmlElements\DataTable\Actions;
use Dfi\TestReverse\HtmlElements\DataTable\ColumnFilter;
use Dfi\TestReverse\HtmlElements\DataTable\Footer;
use Dfi\TestReverse\HtmlElements\DataTable\Header;
use Dfi\TestReverse\HtmlElements\DataTable\Info;
use Dfi\TestReverse\HtmlElements\DataTable\Length;
use Dfi\TestReverse\HtmlElements\DataTable\Pager;
use Dfi\TestReverse\HtmlElements\Inputs\Select;
use Dfi\TestReverse\Skeleton\Elements;
use Dfi\TestReverse\Skeleton\Reverse\ActionOption as ReverseActionOption;
use Dfi\TestReverse\Skeleton\Reverse\Input\Select as RevSelect;
use TestLib\Mink;

class DataTable
{
    /**
     * @var Elements
     */
    protected static $elements;

    public static function reverse(NodeElement $content, Elements $elements)
    {
        self::$elements = $elements;

        $tables = $content->findAll('css', 'table.datatable');
        if (null !== $tables) {
            /** @var NodeElement $tableElement */
            foreach ($tables as $tableElement) {


                $dt = new dTable($elements);
                $dt->setNode($tableElement);
                $elements->addDataTable($dt);


                self::reverseControls($tableElement, $dt);
                self::reverseFilter($tableElement, $dt);
                self::reverseOptions($tableElement, $dt);


            }
        }
    }

    private static function reverseControls(NodeElement $content, dTable $dt)
    {
        $wrap = $content->getParent();


        self::reverseHeader($wrap, $dt);
        self::reverseFooter($wrap, $dt);


    }

    private static function reverseFilter(NodeElement $content, dTable $dt)
    {
        $tHead = $content->find('css', 'thead');
        if ($tHead) {
            $inputElements = $tHead->findAll('css', 'input.dtSearch');
            if ($inputElements) {
                $filter = new ColumnFilter($dt);
                foreach ($inputElements as $inputElement) {
                    $input = self::reverseInput($inputElement, self::$elements);
                    if ($input) {
                        $filter->addInput($input);
                    }
                }
                $dt->addFilter($filter);
            }
        }
    }

    private static function reverseOptions(NodeElement $content, dTable $dt)
    {
        $headColumns = $content->findAll('css', 'thead th');
        if ($headColumns) {
            /** @var NodeElement $column */
            foreach ($headColumns as $key => $column) {
                $text = $column->getText();
                if (strtolower($text) === 'opcje') {
                    $row = $content->find('css', 'tbody tr td:nth-child(' . ($key + 1) . ')');
                    //$o = $row->getOuterHtml();
                    //$t = $row->getText();
                    if ($row) {
                        $options = $row->findAll('css', 'ul.table-controls li a');
                        foreach ($options as $option) {
                            $actionOption = new ActionOption();
                            $actionOption->setNode($option);
                            self::reverseActionOption($option, $actionOption);
                            $dt->addActionOption($actionOption);
                        }
                        continue;
                    } else {
                        Mink::getInstance()->ss('nodatatableoptions');
                        throw new \LogicException('dt options not found');
                    }
                };
            }
        } else {
            Mink::getInstance()->ss('nodatatableoptions');
            throw new \LogicException('dt options not found');

        }
        //determine option colunm
        //get options
    }

    private static function reverseHeader(NodeElement $wrap, dTable $dt)
    {
        $header = $wrap->find('css', 'div.dataTables_header');
        if ($header) {
            $head = new Header($dt);

            self::reverseLength($header, $head);
            self::reverseActions($header, $head);

            $dt->addHeader($head);
        }
    }

    private static function reverseFooter(NodeElement $wrap, dTable $dt)
    {
        $footer = $wrap->find('css', 'div.dataTables_footer');
        if ($footer) {
            $foot = new Footer($dt);

            self::reverseInfo($footer, $foot);
            if ($foot->getInfo() && $foot->getInfo()->shouldHavePager()) {
                self::reversePager($footer, $foot);
            }

            $dt->addFooter($foot);
        }
    }

    private static function reverseInfo(NodeElement $footer, Footer $foot)
    {
        $infoElement = $footer->find('css', 'div.dataTables_info');
        if ($infoElement) {
            //Pozycje od 1 do 10 z 79981 łącznie
            $text = $infoElement->getText();
            $regex = '/\p{L}+\s+\p{L}+\s+(\d+)\s+\p{L}+\s+(\d+)\s+\p{L}+\s+(\d+)\s+\p{L}+/';
            $matches = [];
            if (preg_match($regex, $text, $matches)) {

                $info = new Info($foot->getDt());

                $info->setStart($matches[1]);
                $info->setEnd($matches[2]);
                $info->setLength($matches[3]);

                $foot->setInfo($info);
            }
        }
    }

    private static function reversePager(NodeElement $footer, Footer $foot)
    {
        $pagerElem = $footer->find('css', 'div.dataTables_paginate');
        $o = $pagerElem->getOuterHtml();
        if ($pagerElem) {
            $pager = new Pager();

            $elements = $pagerElem->findAll('css', '.paginate_button');
            /** @var NodeElement $element */
            foreach ($elements as $element) {
                $classes = explode(' ', $element->getAttribute('class'));
                if (!in_array('disabled', $classes, true)) {
                    $control = new Control();
                    $control->setNode($element);
                    $control->setLabel($element->getText());

                    if (in_array('active', $classes, true)) {
                        $pager->addActive($control);
                    } elseif (in_array('previous', $classes, true)) {
                        $pager->addPrevious($control);
                    } elseif (in_array('next', $classes, true)) {
                        $pager->addNext($control);
                    } else {
                        $pager->addControl($control);

                    }
                }
            }
            $foot->setPager($pager);
        }
    }

    private static function reverseLength(NodeElement $header, Header $head)
    {
        $lengthElem = $header->find('css', 'div.dataTables_length');
        if ($lengthElem) {
            $length = new Length($head->getDt());

            $selectElements = $lengthElem->findAll('css', 'select');
            /** @var NodeElement $element */
            foreach ($selectElements as $selectElement) {
                $select = new Select();
                self::reverseSelect($selectElement, $select);
                $length->setSelect($select);
            }
            $head->setLength($length);
        }
    }

    private static function reverseActions(NodeElement $header, Header $head)
    {
        $actions = new Actions($head->getDt());

        $buttonsElems = $header->findAll('css', 'button');
        if ($buttonsElems) {
            /** @var NodeElement $element */
            foreach ($buttonsElems as $buttonElement) {
                $button = new Button();
                self::reverseButton($buttonElement, $button, self::$elements);
                if (!self::$elements->isRegisteredButton($button)) {
                    $actions->addButton($button);
                }
            }
        }

        $inputElems = $header->findAll('css', 'input,select,textarea');
        if ($inputElems) {
            /** @var NodeElement $element */
            foreach ($inputElems as $inputElement) {
                $input = self::reverseInput($inputElement, self::$elements);
                if ($input) {
                    $actions->addInput($input);
                }
            }
        }

    }

    private static function reverseSelect(NodeElement $selectElement, Select $select)
    {
        RevSelect::reverse($selectElement, $select);
    }

    private static function reverseInput($inputElement, Elements $elements = null)
    {
        return Inputs::reverse($inputElement, $elements);
    }

    private static function reverseButton(NodeElement $buttonElement, Button $button, Elements $elements = null)
    {
        Buttons::reverse($buttonElement, $button, $elements);
    }

    private static function reverseActionOption(NodeElement $option, ActionOption $actionOption)
    {
        ReverseActionOption::reverse($option, $actionOption);
    }
}