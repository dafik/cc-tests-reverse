<?php
/**
 * Created by IntelliJ IDEA.
 * User: z.wieczorek
 * Date: 22.10.15
 * Time: 08:42
 */

namespace Dfi\TestReverse\Skeleton\Provider;


use Behat\Mink\Session;
use Dfi\TestReverse\HtmlElements\NotyContainer;
use Dfi\TestUtils\Log\Console;
use Dfi\TestUtils\Module\Action;
use Dfi\TestUtils\Module\Controller;
use Dfi\TestUtils\Module\Map;
use Dfi\TestUtils\Module\Module;
use Dfi\TestUtils\Module\ModuleAbstract;
use Exception;
use TestLib\Mink;
use Throwable;


class Phantom
{
    /**
     * @var int
     */
    protected $currentCheck = 0;
    /**
     * @var Session
     */
    protected $currentSession;
    /**
     * @var string
     */
    protected $errorModalSelector = '.bootbox.modal .errorPage.error';


    protected $initialised = false;

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

    public function getPage()
    {
        if (!$this->initialised) {
            throw new \LogicException('initialise first');
        }
        return $this->getCurrentSession()->getPage();
    }

    /**
     * @return Session
     */
    protected function getCurrentSession()
    {
        return $this->currentSession;
    }


    protected function login()
    {
        $baseUrl = TEST_HOST;

        $mink = Mink::getInstance();
        $session = $mink->getSession();
        $session->reset();

        $session->visit($baseUrl);
        $session->setCookie('_a', 'true');

        $page = $session->getPage();

        $u = $page->findField('username');
        $u->setValue(TEST_USER);

        $p = $page->findField('password');
        $p->setValue(TEST_PASSWORD);

        $submit = $page->findButton('submit');

        $submit->click();

        $this->wait(8000, 'typeof frm != \'undefined\'');
        $this->wait(8000, 'frm.ready');


        $this->currentSession = $session;

        return $session;
    }

    protected function wait($timeout, $condition = 'false', $secondChance = false)
    {
        $driver = Mink::getInstance()->getDriver();

        $start = microtime(true);
        $end = $start + $timeout / 1000.0;
        do {
            if ($this->getCurrentSession()) {
                if ($this->checkErrors($this->getCurrentSession())) {
                    return false;
                };
            }
            $result = $driver->getBrowser()->evaluate($condition);
            usleep(100000);
        } while (microtime(true) < $end && !$result);

        if ('false' !== $condition && !$result) {
            if ($this->getCurrentSession()) {
                if ($this->checkErrors($this->getCurrentSession())) {
                    return false;
                };
            }
            $log = $this->getConsoleLog();

            fwrite(STDOUT, $log . "\n");

            Mink::getInstance()->ss('condition timeout');
            if (!$secondChance) {
                $this->wait($timeout + $timeout, $condition);
            }

        }


        return (bool)$result;
    }

    protected function checkWait(Session $session, $maxChecks = 10)
    {


        if ($this->currentCheck < $maxChecks) {
            $this->currentCheck++;
            $page = $session->getPage();
            $selector = '.blockUI';
            $block = $page->find('css', $selector);
            if ($block) {
                $this->wait(100);
                return $this->checkWait($session, $maxChecks - 1);
            }

            return true;
        } else {
            throw new \LogicException('check wait exceed');
        }

    }

    protected function checkErrors(Session $session)
    {
        $modal = $this->checkModalError($session);
        if ($modal) {
            return true;
        }
        $noty = $this->checkNotyMessages($session);
        if ($noty) {
            return true;
        }
        return false;
    }

    protected function checkNotyMessages(Session $session)
    {
        Mink::getInstance()->ss();

        $page = $session->getPage();
        $notyContainerNode = $page->findById('noty_top_layout_container');

        //$messages = [];
        $errorMessages = [];

        if ($notyContainerNode) {
            $notyContainer = NotyContainer::createFromNode($notyContainerNode);
            if ($notyContainer->hasErrorMessages()) {
                $errorMessages = $notyContainer->getErrorMessages();
            }
            //$messages = $notyContainer->getMessages();
            $notyContainer->clean();
        }

        $test = 0 === count($errorMessages);

        return !$test;
    }

    /**
     * @param Session $session
     * @return bool
     */
    protected function checkModalError(Session $session)
    {
        $page = $session->getPage();
        $errorModal = $page->find('css', $this->errorModalSelector);

        /*$message = '';

        if ($errorModal) {
            $eHeader = $errorModal->find('css', 'h6');
            if ($eHeader) {   // error page
                $parent = $eHeader->getParent();

                $p = $parent->find('css', 'p');

                $message = $p->getHtml();
                $message = trim(str_replace('<b>Message:</b>', '', $message));
            } else { //shutdown
                $message = $errorModal->getHtml();
            }
        }*/
        $test = $errorModal === null;
        return !$test;
    }

    public function getConsoleLog()
    {
        $frm = Mink::getInstance()->getDriver()->evaluateScript('typeof frm != "undefined"');
        if ($frm) {
            $log = Mink::getInstance()->getDriver()->evaluateScript('frm.log.debugout.getLog()');
            $console = Console::parseLog($log);
            return $console;
        }
        return null;
    }

    /**
     * @param ModuleAbstract $module
     * @param Session $session
     * @param int $wait
     * @param bool|false $makeSS
     * @return bool
     * @throws Exception
     * @throws Throwable
     */
    /** @noinspection MoreThanThreeArgumentsInspection
     * @param ModuleAbstract $module
     * @param Session $session
     * @param int $wait
     * @param bool $makeSS
     * @return bool
     * @throws Exception
     * @throws Throwable
     */
    protected function openInMenu(ModuleAbstract $module, Session $session, $wait = 10, $makeSS = false)
    {

        try {

            $moduleClass = get_class($module);


            if ($moduleClass === 'Dfi\TestUtils\Module\Action') {
                /** @var Action $actionModule */
                $actionModule = $module;

                /** @var Controller $controllerModule */
                $controllerModule = $actionModule->getController();
                /** @var Module $moduleModule */
                $moduleModule = $controllerModule->getModule();

                $this->openModule($moduleModule, $session, $wait, $makeSS);
                $this->openController($controllerModule, $session, $wait, $makeSS);
                return $this->openAction($actionModule, $session, 10000, $makeSS);


            } elseif ($moduleClass === 'Dfi\TestUtils\Module\Controller') {


                /** @var Controller $controllerModule */
                $controllerModule = $module;
                /** @var Module $moduleModule */
                $moduleModule = $controllerModule->getModule();

                $this->openModule($moduleModule, $session, $wait, $makeSS);
                $this->openController($controllerModule, $session, $wait, $makeSS);


            } else {

                /** @var Module $moduleModule */
                $moduleModule = $module;
                $this->openModule($moduleModule, $session, $wait, $makeSS);
            }


        } catch (Throwable $_e) {
            Mink::getInstance()->ss();
            /** @noinspection PhpUndefinedFieldInspection */
            $_e->log = $this->getConsoleLog();
            /** @noinspection PhpUndefinedFieldInspection */
            $_e->html = $session->getPage()->getContent();
            throw $_e;
        } catch (Exception $_e) {
            Mink::getInstance()->ss('error');
            throw $_e;
        }

        return true;
    }

    /** @noinspection MoreThanThreeArgumentsInspection
     * @param Action $module
     * @param Session $session
     * @param int $wait
     * @param bool $makeSS
     * @return bool
     */
    private function openAction(Action $module, Session $session, $wait = 10000, $makeSS = false)
    {
        $return = false;
        $page = $session->getPage();
        $nav = $page->findById('nav');
        $container = $nav->findById('mi_' . $module->getId());
        if ($container) {
            $link = $container->find('css', 'a:first-child');
            $link->click();
            $return = $this->wait($wait, 'frm.ready');
        }
        if ($makeSS) {
            Mink::getInstance()->ss();
        }
        return $return;
    }

    /** @noinspection MoreThanThreeArgumentsInspection
     * @param Controller $module
     * @param Session $session
     * @param int $wait
     * @param bool $makeSS
     */
    private function openController(Controller $module, Session $session, $wait = 100, $makeSS = false)
    {
        $page = $session->getPage();
        $nav = $page->findById('nav');
        $container = $nav->findById('mi_' . $module->getId());
        $link = $container->find('css', 'a:first-child');

        $link->click();
        $session->wait($wait);
        if ($makeSS) {
            Mink::getInstance()->ss();
        }
    }

    /** @noinspection MoreThanThreeArgumentsInspection
     * @param Module $module
     * @param Session $session
     * @param int $wait
     * @param bool $makeSS
     */
    private function openModule(Module $module, Session $session, $wait = 100, $makeSS = false)
    {
        $page = $session->getPage();
        $nav = $page->findById('nav');
        $container = $nav->findById('mi_' . $module->getId());
        $link = $container->find('css', 'a:first-child');
        $link->click();
        $this->wait($wait);

        if ($makeSS) {
            Mink::getInstance()->ss();
        }
    }

    protected function findModule($config)
    {
        return Map::getModule($config->module, $config->controller, $config->action);
    }


}