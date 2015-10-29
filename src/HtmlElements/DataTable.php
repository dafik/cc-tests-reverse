<?php
/**
 * Created by IntelliJ IDEA.
 * User: z.wieczorek
 * Date: 22.10.15
 * Time: 08:26
 */
namespace Dfi\TestReverse\HtmlElements;

use Dfi\TestReverse\HtmlElements\DataTable\ActionOption;
use Dfi\TestReverse\HtmlElements\DataTable\ColumnFilter;
use Dfi\TestReverse\HtmlElements\DataTable\Footer;
use Dfi\TestReverse\HtmlElements\DataTable\Header;
use Dfi\TestReverse\HtmlElements\Inputs\FormElement;
use Dfi\TestReverse\Skeleton\Elements;

class DataTable extends Element
{
    /**
     * @var Elements
     */
    protected $elements;


    /**
     * @var FormElement[]
     */
    protected $inputs = [];
    /**
     * @var FormElement[]
     */
    protected $registeredInputs = [];


    /**
     * @var Button[]
     */
    protected $buttons = [];


    /**
     * @var Footer
     */
    protected $footer;
    /**
     * @var Header
     */
    protected $header;
    /**
     * @var ColumnFilter
     */
    protected $columnFilter;
    /**
     * @var ActionOption[]
     */
    protected $options;


    public function __construct(Elements $elements)
    {
        $this->elements = $elements;
    }

    /**
     * @return Elements
     */
    public function getElements()
    {
        return $this->elements;
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
        $this->elements->registerButton($button);
    }


    /**
     * @return FormElement[]
     */
    public function getInputs()
    {
        return $this->inputs;
    }

    /**
     * @param FormElement $input
     */
    public function addInput(FormElement $input)
    {
        $this->inputs[] = $input;
        $this->elements->registerInput($input);
    }

    public function addRegisteredInput(FormElement $input)
    {
        $this->registeredInputs[] = $input;
        $this->elements->registerInput($input);
    }

    /**
     * @param Footer $foot
     */
    public function addFooter(Footer $foot)
    {
        $this->footer = $foot;
    }


    /**
     * @param Header $header
     */
    public function addHeader(Header $header)
    {
        $this->header = $header;
    }

    public function addFilter(ColumnFilter $filter)
    {
        $this->columnFilter = $filter;
    }


    public function hasPager()
    {
        if ($this->hasPaginate()) {
            return true;
        } else {
            if ($this->hasInfo()) {
                return true;
            }
        }

        return false;
    }

    public function hasColumnFilter()
    {
        return null !== $this->columnFilter;
    }

    public function hasActions()
    {
        return 0 !== count($this->inputs) + count($this->buttons);

    }

    public function hasRowOptions()
    {
        return count($this->options) > 0;
    }

    public function hasLength()
    {
        return false !== $this->header->getLength();
    }

    public function hasInfo()
    {
        return null !== $this->footer->getInfo();
    }

    public function hasPaginate()
    {
        return null !== $this->footer->getPager();
    }

    /**
     * @return ColumnFilter
     */
    public function getColumnFilter()
    {
        if ($this->columnFilter) {
            return $this->columnFilter;
        }
        return false;
    }

    public function getActions()
    {
        return array_merge($this->inputs, $this->buttons);

    }

    /**
     * @return DataTable\ActionOption[]
     */
    public function getRowOptions()
    {
        return $this->options;
    }

    /**
     * @param ActionOption $actionOption
     */
    public function addActionOption(ActionOption $actionOption)
    {
        $this->options[] = $actionOption;
    }

    /**
     * @return Header
     */
    public function getHeader()
    {
        if ($this->header) {
            return $this->header;
        }
        return false;
    }

    /**
     * @return Footer
     */
    public function getFooter()
    {
        if ($this->footer) {
            return $this->footer;
        }
        return false;
    }


}