<?php
/**
 * Created by IntelliJ IDEA.
 * User: z.wieczorek
 * Date: 22.10.15
 * Time: 10:24
 */

namespace Dfi\TestReverse\HtmlElements\DataTable;



use Dfi\TestReverse\HtmlElements\DataTable;

class Header
{
    /**
     * @var DataTable
     */
    protected $dt;
    /**
     * @var Length
     */
    protected $length;

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

    /**
     * @param Length $length
     */
    public function setLength(Length $length)
    {
        $this->length = $length;
    }


    public function getLength()
    {
        if ($this->length) {
            return $this->length;
        }
        return false;
    }
}