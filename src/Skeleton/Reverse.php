<?php
/**
 * Created by IntelliJ IDEA.
 * User: z.wieczorek
 * Date: 20.10.15
 * Time: 14:12
 */

namespace Dfi\TestReverse\Skeleton;


use Dfi\TestReverse\Skeleton\Reverse\Buttons;
use Dfi\TestReverse\Skeleton\Reverse\DataTable;
use Dfi\TestReverse\Skeleton\Reverse\Inputs;
use Exception;
use TestLib\Mink;

class Reverse
{
    protected static $providerClass = '\Dfi\TestReverse\Skeleton\Provider\Phantom';

    /**
     * @param string $providerClass
     */
    public static function setProviderClass($providerClass)
    {
        self::$providerClass = $providerClass;
    }


    /**
     * @param $config
     * @return bool|Elements
     */
    public static function getElements($config)
    {
        $elements = new Elements();


        try {

            $provider = new self::$providerClass();
            if ($provider->init($config)) {

                $page = $provider->getPage();

                $content = $page->findById('content');

                DataTable::reverse($content, $elements);
                Inputs::reverseAll($content, $elements);
                Buttons::reverseAll($content, $elements);
            } else {
                $x = 1;
                $log = $provider->getConsoleLog();
                return false;
            }

        } catch (Exception $e) {
            $x = 1;
            Mink::getInstance()->ss('error-revers');
            return false;
        }

        return $elements;
    }
}