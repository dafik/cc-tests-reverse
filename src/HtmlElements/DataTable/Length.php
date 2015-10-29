<?php
/**
 * Created by IntelliJ IDEA.
 * User: z.wieczorek
 * Date: 22.10.15
 * Time: 11:43
 */

namespace Dfi\TestReverse\HtmlElements\DataTable;


use Dfi\TestReverse\HtmlElements\DataTable;
use Dfi\TestReverse\HtmlElements\Inputs\Select;

class Length
{

    /**
     * @var DataTable
     */
    protected $dt;
    /**
     * @var Select
     */
    protected $select = [];

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

    public function setSelect(Select $select)
    {
        $this->select = $select;
        $this->dt->addRegisteredInput($select);
    }

    /**
     * @return Select
     */
    public function getSelect()
    {
        return $this->select;
    }

}