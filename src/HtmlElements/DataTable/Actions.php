<?php
/**
 * Created by IntelliJ IDEA.
 * User: z.wieczorek
 * Date: 22.10.15
 * Time: 11:43
 */

namespace Dfi\TestReverse\HtmlElements\DataTable;



use Dfi\TestReverse\HtmlElements\Button;
use Dfi\TestReverse\HtmlElements\DataTable;
use Dfi\TestReverse\HtmlElements\Inputs\FormElement;
use Dfi\TestReverse\HtmlElements\Inputs\Input;

class Actions
{

    /**
     * @var DataTable
     */
    protected $dt;
    /**
     * @var Button[]
     */
    protected $buttons = [];
    /**
     * @var Input[]
     */
    protected $inputs = [];

    /**
     * Footer constructor.
     * @param DataTable $dt
     */
    public function __construct(DataTable $dt)
    {
        $this->dt = $dt;
    }

    /**
     * @return DataTable
     */
    public function getDt()
    {
        return $this->dt;
    }

    public function addButton(Button $button)
    {
        $this->buttons[] = $button;
        $this->dt->addButton($button);
    }

    public function addInput(FormElement $input)
    {
        $this->inputs[] = $input;
        $this->dt->addInput($input);
    }
}