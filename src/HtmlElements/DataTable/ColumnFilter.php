<?php
namespace Dfi\TestReverse\HtmlElements\DataTable;


use Dfi\TestReverse\HtmlElements\DataTable;
use Dfi\TestReverse\HtmlElements\Inputs\FormElement;

class ColumnFilter
{
    /**
     * @var FormElement[]
     */
    protected $inputs;
    protected $dt;

    /**
     * Footer constructor.
     * @param DataTable $dt
     */
    public function __construct(DataTable $dt)
    {
        $this->dt = $dt;
    }


    public function addInput(FormElement $input)
    {
        $this->inputs[] = $input;
        $this->dt->getElements()->registerInput($input);
    }

    /**
     * @return FormElement[]
     */
    public function getInputs()
    {
        return $this->inputs;
    }
}