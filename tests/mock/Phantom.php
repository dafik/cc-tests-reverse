<?php
/**
 * Created by IntelliJ IDEA.
 * User: z.wieczorek
 * Date: 29.10.15
 * Time: 15:07
 */

namespace mock;


use Exception;
use TestLib\Mink;
use Zumba\GastonJS\Exception\JavascriptError;

class Phantom extends \Dfi\TestReverse\Skeleton\Provider\Phantom
{
    public function init($config)
    {

        try {
            $session = $this->login();
            $module = $this->findModule($config);

            if ($this->checkErrors($session)) {
                return false;
            }

            $res = $this->openInMenu($module, $session);
            if (!$res) {
                return false;
            }
            $this->checkWait($session);

            Mink::getInstance()->ss();
            $this->initialised = true;

        } catch (Exception $e) {
            Mink::getInstance()->ss('error-revers');
            return false;
        }
        return $this->initialised;

    }

    protected function login()
    {
        $baseUrl = TEST_HOST;

        $mink = Mink::getInstance();
        $session = $mink->getSession();
        $session->reset();

        try {
            $session->visit($baseUrl);
        } catch (JavascriptError $e) {

        }


        $this->currentSession = $session;

        return $session;
    }
}