<?php
/**
 * Created by IntelliJ IDEA.
 * User: z.wieczorek
 * Date: 26.10.15
 * Time: 08:43
 */

namespace Dfi\TestReverse\HtmlElements\DataTable;


use Dfi\TestReverse\HtmlElements\Element;

class ActionOption extends Element
{

    protected $title;

    /**
     * @return string
     */
    public function getTitle()
    {
        return $this->title;
    }

    public function setTitle($title)
    {
        $this->title = $title;
    }

    public function isModalAction()
    {

        foreach ($this->getClasses() as $className) {
            $test = '/^m/';
            if (0 === strpos($className, 'm')) {
                //if (preg_match($test, $className)) {
                return true;
            }

        }
        return false;

    }


}