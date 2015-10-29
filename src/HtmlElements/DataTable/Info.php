<?php
/**
 * Created by IntelliJ IDEA.
 * User: z.wieczorek
 * Date: 22.10.15
 * Time: 11:43
 */

namespace Dfi\TestReverse\HtmlElements\DataTable;



use Dfi\TestReverse\HtmlElements\DataTable;

class Info
{

    /**
     * @var DataTable
     */
    protected $dt;

    /**
     * @var bool
     */
    protected $shouldHavePager = false;

    /**
     * @var int
     */
    protected $start = 0;

    /**
     * @var int
     */
    protected $end = 0;

    /**
     * @var int
     */
    protected $length = 0;

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
     * @return boolean
     */
    /** @noinspection ClassMethodNameMatchesFieldNameInspection */
    public function shouldHavePager()
    {
        return $this->shouldHavePager;
    }

    /**
     * @return mixed
     */
    public function getEnd()
    {
        return $this->end;
    }

    /**
     * @param mixed $end
     */
    public function setEnd($end)
    {
        $this->end = $end;
        $this->setShouldHavePager();
    }

    /**
     *
     */
    private function setShouldHavePager()
    {
        if ($this->end && $this->length && $this->length > $this->end) {
            $this->shouldHavePager = true;
        }
    }


    /**
     * @return mixed
     */
    public function getLength()
    {
        return $this->length;
    }

    /**
     * @param mixed $length
     */
    public function setLength($length)
    {
        $this->length = $length;
        $this->setShouldHavePager();
    }

    /**
     * @return mixed
     */
    public function getStart()
    {
        return $this->start;
    }

    /**
     * @param mixed $start
     */
    public function setStart($start)
    {
        $this->start = $start;
    }


}