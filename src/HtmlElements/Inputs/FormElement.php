<?php
/**
 * Created by IntelliJ IDEA.
 * User: z.wieczorek
 * Date: 22.10.15
 * Time: 08:22
 */

namespace Dfi\TestReverse\HtmlElements\Inputs;

use Behat\Mink\Element\NodeElement;
use Dfi\TestReverse\HtmlElements\Element;

class FormElement extends Element
{

    /**
     * @var string|bool
     */
    protected $name = false;
    /**
     * @var string|bool
     */
    protected $label = false;

    public function setNode(NodeElement $node)
    {
        parent::setNode($node);
        if ($this->hasAttribute('name')) {
            $this->setName($this->getAttribute('name'));
        }
    }


    public function getType()
    {
        $class = get_class($this);
        $parts = explode('\\', $class);

        return strtolower(array_pop($parts));
    }


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

    public function getName()
    {
        return $this->name;
    }

    /**
     * @param string $name
     */
    public function setName($name)
    {
        $this->name = $name;
    }
}