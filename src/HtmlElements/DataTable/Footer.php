<?php
/**
 * Created by IntelliJ IDEA.
 * User: z.wieczorek
 * Date: 22.10.15
 * Time: 10:24
 */

namespace Dfi\TestReverse\HtmlElements\DataTable;



use Dfi\TestReverse\HtmlElements\DataTable;

class Footer
{
    /**
     * @var DataTable
     */
    protected $dt;
    /**
     * @var  Info
     */
    protected $info;

    /**
     * @var Pager
     */
    protected $pager;

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
     * @param Info $info
     */
    public function setInfo(Info $info)
    {
        $this->info = $info;

    }


    /**
     * @return Info
     */
    public function getInfo()
    {
        return $this->info;
    }

    /**
     * @return Pager
     */
    public function getPager()
    {
        return $this->pager;
    }

    /**
     * @param Pager $pager
     */
    public function setPager($pager)
    {
        $this->pager = $pager;
    }


}