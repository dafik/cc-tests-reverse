<?php
/**
 * Created by IntelliJ IDEA.
 * User: z.wieczorek
 * Date: 22.10.15
 * Time: 08:21
 */

namespace Dfi\TestReverse\Skeleton;



use Dfi\TestReverse\HtmlElements\Button;
use Dfi\TestReverse\HtmlElements\DataTable;
use Dfi\TestReverse\HtmlElements\Inputs\FormElement;
use Dfi\TestReverse\HtmlElements\Inputs\Input;

class Elements
{
    /**
     * @var Input[]
     */
    protected $inputs = [];
    /**
     * @var Button[]
     */
    protected $buttons = [];
    /**
     * @var  DataTable[]
     */
    protected $dataTables = [];

    /**
     * @var Input[]
     */
    protected $registeredInputs = [];
    /**
     * @var Button[]
     */
    protected $registeredButtons = [];

    /**
     * @param FormElement $input
     */
    public function registerInput(FormElement $input)
    {
        $this->registeredInputs[] = $input;
    }

    public function isRegisteredInput(FormElement $input)
    {
        /** @var FormElement $registeredInput */
        foreach ($this->registeredInputs as $registeredInput) {
            if ($input->getId()) {
                /** @var Input $registeredInput */
                if ($registeredInput->getId() === $input->getId()) {
                    return true;
                }
            }

            //$x1 = $registeredInput->getXpath();
            //$x2 = $input->getXpath();
            if ($registeredInput->getXpath() === $input->getXpath()) {
                return true;
            }
            if ($registeredInput->getNode()->getOuterHtml() === $input->getNode()->getOuterHtml()) {
                return true;
            }

        }

        return false;
    }

    public function isRegisteredButton(Button $button)
    {
        /** @var Input $registeredInput */
        foreach ($this->registeredButtons as $registeredButton) {
            if ($button->getId()) {
                /** @var Input $registeredButton */
                if ($registeredButton->getId() === $button->getId()) {
                    return true;
                }
            }

            //$x1 = $registeredButton->getXpath();
            //$x2 = $button->getXpath();
            if ($registeredButton->getXpath() === $button->getXpath()) {
                return true;
            }
            if ($registeredButton->getNode()->getOuterHtml() === $button->getNode()->getOuterHtml()) {
                return true;
            }

        }
        return false;
    }


    public function registerButton(Button $button)
    {
        $this->registeredButtons[] = $button;
    }

    /**
     * @return Button[]
     */
    public function getButtons()
    {
        return $this->buttons;
    }

    /**
     * @param Button $button
     */
    public function addButton(Button $button)
    {
        $this->buttons[] = $button;
    }

    /**
     * @return DataTable
     */
    public function getDataTables()
    {
        return $this->dataTables;
    }

    /**
     * @param DataTable $dataTable
     */
    public function addDataTable($dataTable)
    {
        $this->dataTables[] = $dataTable;
    }

    /**
     * @return Input[]
     */
    public function getInputs()
    {
        return $this->inputs;
    }

    /**
     * @param Input $input
     */
    public function addInput($input)
    {
        $this->inputs[] = $input;
    }
}