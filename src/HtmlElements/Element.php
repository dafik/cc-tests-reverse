<?php
/**
 * Created by IntelliJ IDEA.
 * User: z.wieczorek
 * Date: 22.10.15
 * Time: 12:04
 */

namespace Dfi\TestReverse\HtmlElements;


use Behat\Mink\Element\NodeElement;
use Dfi\TestReverse\Skeleton;


class Element
{

    /**
     * @var string|bool
     */
    protected $id = false;
    /**
     * @var bool
     */
    protected $visible = false;
    /**
     * @var NodeElement
     */
    protected $node;

    /**
     * @var string
     */
    protected $xpath;

    /**
     * @var []
     */
    protected $classes = [];
    /**
     * @var []
     */
    protected $attributes = [];
    /**
     * @var []
     */
    protected $parents;

    /**
     * @return bool|string
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @param string $id
     */
    public function setId($id)
    {
        $this->id = $id;
    }

    /**
     * @return boolean
     */
    public function isVisible()
    {
        return $this->visible;
    }

    /**
     * @param boolean $isVisible
     */
    public function setVisible($isVisible)
    {
        $this->visible = $isVisible;
    }

    /**
     * @return NodeElement
     */
    public function getNode()
    {
        return $this->node;
    }

    /**
     * @param NodeElement $node
     */
    public function setNode(NodeElement $node)
    {
        $this->node = $node;
        $this->setXpath($node->getXpath());
        $this->visible = $node->isVisible();

        $id = $node->getAttribute('id');
        if ($id) {
            $this->setId($id);
        }

        $classes = $node->getAttribute('class');
        if ($classes) {
            $this->classes = explode(' ', $classes);
        }
        $this->attributes = self::parseAttribs($node);
    }


    public function hasAttribute($name)
    {
        return array_key_exists($name, $this->attributes);
    }

    public function getAttribute($name)
    {
        if (array_key_exists($name, $this->attributes)) {
            return $this->attributes[$name];
        }
        throw new \LogicException($name . ' not found');
    }


    public function hasClass($class)
    {
        return in_array($class, $this->classes, true);
    }

    public function getClasses()
    {
        return $this->classes;
    }

    /**
     * @return string
     */
    public function getXpath()
    {
        return $this->xpath;
    }

    /**
     * @param string $xpath
     */
    public function setXpath($xpath)
    {
        $this->xpath = $xpath;
    }

    /**
     * @return string
     */
    public function getPhpName()
    {
        if (method_exists($this, 'getName') && $this->getName()) {
            $name = $this->getName();
        } elseif ($this->getId()) {
            $name = $this->getId();
        } elseif (method_exists($this, 'getLabel') && $this->getLabel()) {
            $name = $this->getLabel();
        } else {
            $name = 'undefined' . Skeleton::getVarName();
            //throw new \LogicException('cant determine name');
        }
        $name = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $name);

        return '$' . str_replace(['-', '.', ' ', ']', '['], '_', $name);
    }


    public function getFindMethod()
    {
        if ($this->id) {
            return 'findById';
        } else {
            return 'find';
        }


    }


    public function getFindArgs()
    {
        if ($this->getFindMethod() === 'findById') {
            return [$this->getId()];
        } else {
            return ['xpath', $this->getXpath()];
        }


    }

    public function getParents()
    {
        if (!$this->parents) {
            $this->parents = $this->parseParents();
        }
        return $this->parents;


    }

    private function parseParents(NodeElement $element = null)
    {
        if (!$element && $this->node) {
            $element = $this->node;
        }
        if (!$element) {
            throw new \LogicException('element not provided');
        }
        $parent = $element->getParent();
        $tag = $parent->getTagName();
        if ($parent->getTagName() !== 'html') {

            $x = array_merge([['tag' => $tag, 'node' => $parent]], $this->parseParents($parent));
            return $x;
        }
        return [['tag' => $tag, 'node' => $parent]];
    }

    /**
     * @param $tagName
     * @return NodeElement
     */
    public function findParent($tagName)
    {
        foreach ($this->getParents() as $parent) {
            if ($parent['tag'] === $tagName) {
                return $parent['node'];
            }
        }
        return false;
    }

    /**
     * @param $node
     */
    public static function parseAttribs(NodeElement $node)
    {
        $tagName = $node->getTagName();

        $outer = $node->getOuterHtml();
        $dom = new \DOMDocument();
        $dom->loadHTML('<?xml encoding="UTF-8">' . $outer);

        $sxe = simplexml_import_dom($dom);

        /** @var \SimpleXMLElement $tag */
        $tag = $sxe->body->$tagName;
        $a = (array)$tag->attributes();


        $attributes = $a['@attributes'];


        return $attributes;
    }


}