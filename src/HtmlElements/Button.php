<?php
/**
 * Created by IntelliJ IDEA.
 * User: z.wieczorek
 * Date: 22.10.15
 * Time: 08:22
 */

namespace Dfi\TestReverse\HtmlElements;


class Button extends Element
{
    /**
     * @var string|bool
     */
    protected $label = false;


    public function getLabel()
    {
        return $this->label;
    }

    /**
     * @param string $label
     */
    public function setLabel($label)
    {
        $this->label = $label;
    }


}