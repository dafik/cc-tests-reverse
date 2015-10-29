<?php
/**
 * Created by IntelliJ IDEA.
 * User: z.wieczorek
 * Date: 22.10.15
 * Time: 10:24
 */

namespace Dfi\TestReverse\HtmlElements\DataTable;



use Dfi\TestReverse\HtmlElements\Control;

class Pager
{

    /**
     * @var Control
     */
    protected $active;
    /**
     * @var  Control
     */
    protected $previous;
    /**
     * @var Control
     */
    protected $next;
    /**
     * @var  Control []
     */
    protected $controls;

    /**
     * @param Control $control
     */
    public function addActive(Control $control)
    {
        $this->active = $control;
    }

    /**
     * @param Control $control
     */
    public function addPrevious(Control $control)
    {
        $this->previous = $control;
    }

    /**
     * @param Control $control
     */
    public function addNext(Control $control)
    {
        $this->next = $control;
    }

    /**
     * @param Control $control
     */
    public function addControl(Control $control)
    {
        $this->controls[] = $control;
    }

    /**
     * @return Control
     */
    public function getActive()
    {
        if ($this->active) {
            return $this->active;
        }
        return false;
    }

    /**
     * @return Control
     */
    public function getNext()
    {
        if ($this->next) {
            return $this->next;
        }
        return false;
    }

    /**
     * @return Control[]
     */
    public function getControls()
    {
        return $this->controls;
    }
}