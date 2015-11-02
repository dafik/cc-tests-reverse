<?php
namespace Dfi\TestReverse;

use CodeGen\Block;
use CodeGen\ClassMethod;
use CodeGen\Comment;
use CodeGen\CommentBlock;
use CodeGen\Expr\AssignExpr;
use CodeGen\Expr\MethodCall;
use CodeGen\Expr\ObjectProperty;
use CodeGen\Expr\StaticMethodCall;
use CodeGen\Raw;
use CodeGen\Statement\AssignStatement;
use CodeGen\Statement\IfElseStatement;
use CodeGen\Statement\Statement;
use CodeGen\Statement\TryCatchStatement;
use CodeGen\UserClass;
use CodeGen\Variable;
use Dfi\TestReverse\HtmlElements\Button;
use Dfi\TestReverse\HtmlElements\DataTable;
use Dfi\TestReverse\HtmlElements\DataTable\ActionOption;
use Dfi\TestReverse\HtmlElements\Inputs\FormElement;
use Dfi\TestReverse\HtmlElements\Inputs\Text;
use Dfi\TestReverse\Skeleton\Reverse;
use Dfi\TestUtils\Module\Map;
use ErrorException;


class Skeleton
{
    private static $varCount = 1;
    private static $testLocation = 'tests/integration/modules';

    /**
     * @param string $testLocation
     */
    public static function setTestLocation($testLocation)
    {
        self::$testLocation = $testLocation;
    }


    private static $reservedWords = [
        '__halt_compiler', 'abstract', 'and', 'array', 'as', 'break', 'callable', 'case', 'catch', 'class', 'clone', 'const', 'continue', 'declare',
        'default', 'die', 'do', 'echo', 'else', 'elseif', 'empty', 'enddeclare', 'endfor', 'endforeach', 'endif', 'endswitch', 'endwhile', 'eval',
        'exit', 'extends', 'final', 'finally', 'for', 'foreach', 'function', 'global', 'goto', 'if', 'implements', 'include', 'include_once',
        'instanceof', 'insteadof', 'interface', 'isset', 'list', 'namespace', 'new', 'or', 'print', 'private', 'protected', 'public', 'require',
        'require_once', 'return', 'static', 'switch', 'throw', 'trait', 'try', 'unset', 'use', 'var', 'while', 'xor', 'yield', '__CLASS__',
        '__DIR__', '__FILE__', '__FUNCTION__', '__LINE__', '__METHOD__', '__NAMESPACE__', '__TRAIT__', 'int', 'float', 'bool', 'string', 'true',
        'false', 'null', 'resource', 'object', 'mixed', 'numeric ',
    ];

    public static function getVarName()
    {
        $var = self::$varCount;
        self::$varCount++;

        return $var;
    }

    public static function generate()
    {
        self::$testLocation = ROOT . DIRECTORY_SEPARATOR . self::$testLocation;

        $config = Map::getConfig();
        foreach ($config->modules as $module) {
            if (self::shouldGenerateModule($module)) {
                self::generateModuleTest($module);
            }
        }
    }

    private static function generateModuleTest($config)
    {
        $module = ucfirst($config->module);
        $controller = ucfirst($config->controller);
        $action = ucfirst($config->action);


        if (!$module && !$controller && !$action) {
            return;
        }
        if ($module) {
            if (self::isReserved($module, $config)) {
                $module .= '_';
            }
            $pathModule = self::$testLocation . DIRECTORY_SEPARATOR . $module;
            if (!file_exists($pathModule)) {
                mkdir($pathModule, 0777, true);
            }

            if ($controller) {
                if (self::isReserved($controller, $config)) {
                    $controller .= '_';
                }
                $pathController = $pathModule . DIRECTORY_SEPARATOR . $controller;
                if (!file_exists($pathController)) {
                    mkdir($pathController, 0777, true);
                }

                if ($action) {
                    $pathAction = $pathController . DIRECTORY_SEPARATOR . $action . 'Test.php';
                    self::generateActionTest($config, $pathAction);
                }
            }
        }
    }

    private static function generateActionTest($config, $pathAction)
    {


        $module = ucfirst($config->module);
        if (self::isReserved($module, $config)) {
            $module .= '_';
        }
        $controller = ucfirst($config->controller);
        if (self::isReserved($controller, $config)) {
            $controller .= '_';
        }
        $action = ucfirst($config->action);

        $className = $module . '\\' . $controller . '\\' . $action . 'Test';
        $class = new UserClass($className);
        $class->extendClass('AbstractModuleTest');
        $class->useClass('integration\modules\AbstractModuleTest');
        $class->useClass('TestLib\Mink');

        $class->addStaticVar('canBeOverWritten', true);


        $doc1 = new CommentBlock();
        $doc1->appendLine('Sets up the fixture, for example, opens a network connection.');
        $doc1->appendLine('This method is called before a test is executed.');

        //$setup = $class->addMethod('protected', 'setUp');
        $setup = new ClassMethod('setUp');
        $setup->setScope('protected');
        //$setup->setCommentBlock($doc1);
        $block = $setup->getBlock();

        $block->appendRenderable(
            new AssignStatement(new ObjectProperty('$this', 'module'), $config->module));
        $block->appendRenderable(
            new AssignStatement(new ObjectProperty('$this', 'controller'), $config->controller));
        $block->appendRenderable(
            new AssignStatement(new ObjectProperty('$this', 'action'), $config->action));
        $block->appendRenderable(
            new Statement(
                new StaticMethodCall('parent', 'setUp')));

        $class->addMethodObject($setup);


        $doc2 = new CommentBlock();
        $doc2->appendLine('Tears down the fixture, for example, closes a network connection.');
        $doc2->appendLine('This method is called after a test is executed.');

        $teardown = new ClassMethod('tearDown');
        $teardown->setScope('protected');
        //$teardown->setCommentBlock($doc2);
        $block = $teardown->getBlock();
        $block->appendLine(
            new Statement(
                new StaticMethodCall('parent', 'tearDown')));

        $class->addMethodObject($teardown);


        //////////

        $doc3 = new CommentBlock();
        $doc3->appendLine('@covers ' . $config->module . '/' . $config->controller . '/' . $config->action);

        $mainTest = new ClassMethod('test' . $action);
        $mainTest->setScope('public');
        //$mainTest->setCommentBlock($doc3);

        $class->addMethodObject($mainTest);

        $block = $mainTest->getBlock();


        if ($config->inMenu === true && !self::isDanger($config)) {
            $res = self::openInMenuBlock($block, $class, $config);
            if (!$res) {
                fwrite(STDOUT, "\t" . 'cant open: ' . $config->module . ':' . $config->controller . ':' . $config->action . "\n");
                return;
            }
        } else {
            //return;
            self::simpleBlock($block);
        }


        $res = file_put_contents($pathAction, $code = "<?php\n" . $class->render());
        if (!$res) {
            throw new ErrorException('cant write');
        }

    }

    private static function shouldGenerateModule(/** @noinspection PhpUnusedParameterInspection */
        $module)
    {
        //TODO implement check;
        return true;
    }

    private static function isReserved($word, /** @noinspection PhpUnusedParameterInspection */
                                       $config)
    {
        if (in_array(strtolower($word), self::$reservedWords, false)) {
            //fwrite(STDERR, 'found reserved word: ' . $word . ' in ' . $config->module . '\\' . $config->controller . '\\' . $config->action . "\n");
            return true;
        }
        return false;
    }

    /**
     * @param Block $block
     * @param ClassFile $class
     * @param $config
     * @return bool
     */
    private static function openInMenuBlock(Block $block, UserClass $class, $config)
    {
        fwrite(STDOUT, 'processing: ' . $config->module . ':' . $config->controller . ':' . $config->action . "\n");

        $elements = Reverse::getElements($config);
        if ($elements === false) {
            return false;
        }

        $tryStmt = new TryCatchStatement();

        $block->appendRenderable($tryStmt);

        $tryBlock = $tryStmt->tryBlock;

        $tryBlock->appendRenderable(
            new Statement(
                new AssignExpr('$session',
                    new MethodCall('$this', 'getLoggedSession'))));
        $tryBlock->appendRenderable(
            new Statement(
                new MethodCall('$this', 'openInMenu', [
                        new ObjectProperty('$this', 'mapModule'),
                        '$session'
                    ]
                )));

        $tryBlock->appendRenderable(
            new Statement(
                new MethodCall('$this', 'checkWait', ['$session'])));
        $tryBlock->appendRenderable(
            new Statement(
                new AssignExpr('$page',
                    new MethodCall('$session', 'getPage'))));


        /** @var FormElement $input */
        foreach ($elements->getInputs() as $input) {

            $tryBlock->appendLine('');
            $tryBlock->appendRenderable(
                new Comment('input type: ' . $input->getType() . ' label: ' . $input->getLabel()));

            $tryBlock->appendRenderable(
                new AssignStatement(
                    new Raw($input->getPhpName() . 'Input'),
                    new MethodCall('$page', $input->getFindMethod(), $input->getFindArgs())));

        }


        /** @var Button $button */
        foreach ($elements->getButtons() as $button) {

            $tryBlock->appendLine('');
            //$tryBlock->appendRenderable(
            //    new CommentBlock(explode("\n", var_export($button, true)))
            //);
            $tryBlock->appendRenderable(
                new Comment('button label: ' . $button->getLabel()));

            $tryBlock->appendRenderable(
                new AssignStatement(
                    new Raw($button->getPhpName() . 'Button'),
                    new MethodCall('$page', $button->getFindMethod(), $button->getFindArgs())));

        }


        $tryBlock->appendLine('');
        $tryBlock->appendLine('');
        $tryBlock->appendRenderable(
            new Comment('Implement test here.'));
        $tryBlock->appendLine('');
        $tryBlock->appendLine('');

        $tryBlock->appendRenderable(
            new Statement(
                new MethodCall('$this', 'checkErrors', ['$session'])));


        $tryBlock->appendLine('');
        $tryBlock->appendLine('');
        $tryBlock->appendRenderable(
            new Comment('Remove the following lines when you implement this test.'));
        /*        $tryBlock->appendRenderable(
                    new Statement(new StaticMethodCall('static', 'markTestIncomplete', ['This test has not been implemented yet . '])));*/
        $tryBlock->appendLine('');
        $tryBlock->appendLine('');


        $throwBlock = $tryStmt->catchBlock;
        $throwBlock->appendRenderable(
            new Statement(
                new MethodCall(
                    new StaticMethodCall('Mink', 'getInstance')
                    , 'ss'
                )));
        $throwBlock->appendRenderable(
            new Comment('Remove the following lines when you implement this test.'));
        /*        $throwBlock->appendRenderable(
                    new Statement(new StaticMethodCall('static', 'markTestIncomplete', ['This test has not been implemented yet . '])));*/

        if ($elements->getDataTables()) {
            foreach ($elements->getDataTables() as $key => $dataTable) {

                $doc = new CommentBlock();
                $doc->appendLine('Datatable tests');


                $dtTest = new ClassMethodWithComments('testDataTable' . ($key + 1));
                $dtTest->setScope('public');
                $dtTest->setCommentBlock($doc);

                $block = $dtTest->getBlock();

                self::createDataTableTest($dataTable, $block);

                $class->addMethodObject($dtTest);
            }

        }

        return true;
    }

    private static function createDataTableTest(DataTable $dt, Block $codeBlock)
    {

        $tryStmt = new TryCatchStatement();

        $codeBlock->appendRenderable($tryStmt);

        $tryBlock = $tryStmt->tryBlock;

        $tryBlock->appendRenderable(
            new Statement(
                new AssignExpr('$session',
                    new MethodCall('$this', 'getLoggedSession'))));
        $tryBlock->appendRenderable(
            new Statement(
                new MethodCall('$this', 'openInMenu', [
                        new ObjectProperty('$this', 'mapModule'),
                        '$session'
                    ]
                )));

        $tryBlock->appendRenderable(
            new Statement(
                new MethodCall('$this', 'checkWait', ['$session'])));
        $tryBlock->appendRenderable(
            new Statement(
                new AssignExpr('$page',
                    new MethodCall('$session', 'getPage'))));


        $tryBlock->appendRenderable(
            new Statement(
                new AssignExpr('$dt',
                    new MethodCall('$page', 'findById', [$dt->getId()]))));


        $tryBlock->appendLine('');
        $tryBlock->appendLine('');

        $var = new Variable('$dt');
        $ifElseBlock = new IfElseStatement($var, null, new Block());
        $ifBlock = $ifElseBlock->if;

        $ifBlock->appendLine('');

        if ($dt->hasPager()) {
            $ifBlock->appendLine('');
            self::createPagerTest($dt, $ifBlock);
        }
        if ($dt->hasColumnFilter()) {
            $ifBlock->appendLine('');
            self::createColumnFilterTest($dt, $ifBlock);
        }
        if ($dt->hasActions()) {
            $ifBlock->appendLine('');
            self::createActionsTest($dt, $ifBlock);
        }

        if ($dt->hasRowOptions()) {
            $ifBlock->appendLine('');
            self::createRowTest($dt, $ifBlock);
        }
        $ifBlock->appendLine('');
        $ifBlock->appendLine('');

        /** @var Block $elseBlock */
        $elseBlock = $ifElseBlock->else;

        $elseBlock->appendRenderable(
            new Statement(
                new StaticMethodCall('static', 'assertTrue', [false, 'dt not found'])));

        $tryBlock->appendRenderable($ifElseBlock);

    }


    private static function createPagerTest(DataTable $dt, $codeBlock)
    {
        if ($dt->hasLength()) {
            self::createLengthTest($dt, $codeBlock);
        }
        if ($dt->hasPaginate()) {
            self::createPaginateTest($dt, $codeBlock);
        }
    }

    private static function createColumnFilterTest(DataTable $dt, $codeBlock)
    {
        $columnFilter = $dt->getColumnFilter();
        foreach ($columnFilter->getInputs() as $key => $inputColumn) {
            self::createColumnTest($dt, $inputColumn, $key, $codeBlock);
        }
    }

    private static function createActionsTest(DataTable $dt, $codeBlock)
    {
        foreach ($dt->getActions() as $action) {
            self::createActionTest($dt, $action, $codeBlock);
        }
    }

    private static function createRowTest(DataTable $dt, $codeBlock)
    {
        foreach ($dt->getRowOptions() as $action) {
            self::createRowOptionTest($dt, $action, $codeBlock);
        }
    }


    /**
     * @param $block
     */
    private static function simpleBlock(Block $block)
    {

        $block->appendLine('');
        $block->appendLine('');
        $block->appendRenderable(
            new Comment('Remove the following lines when you implement this test.'));
        $block->appendRenderable(
            new Statement(new StaticMethodCall('static', 'markTestIncomplete', ['This test has not been implemented yet . '])));
        $block->appendLine('');
        $block->appendLine('');
    }

    private static function isDanger($config)
    {
        $danger = '/clean|clear|delete|sync/';
        if (preg_match($danger, $config->action)) {
            return true;
        }
        return false;
    }

    private static function createLengthTest(DataTable $dt, Block $codeBlock)
    {
        $select = $dt->getHeader()->getLength()->getSelect();

        $codeBlock->appendRenderable(
            new Statement(
                new StaticMethodCall('parent', 'dtLabelTest',
                    [
                        'session' => '$session',
                        'selectXpath' => $select->getXpath()
                    ]
                )));
    }

    private static function createPaginateTest(DataTable $dt, Block $codeBlock)
    {
        $paginate = $dt->getFooter()->getPager();

        $options = [
            'session' => '$session',

            'controls' => [
                'activeXpath' => $paginate->getActive()->getXpath(),
                'nextXpath' => $paginate->getNext()->getXpath()
            ]
        ];
        foreach ($paginate->getControls() as $key => $control) {
            $options['controls'][$control->getLabel()] = $control->getXpath();
        }

        $codeBlock->appendRenderable(
            new Statement(
                new StaticMethodCall('parent', 'dtPaginateTest', $options)));
    }

    /**
     * @param DataTable $dt
     * @param FormElement $column
     * @param integer $index
     * @param Block $codeBlock
     */
    private static function createColumnTest(DataTable $dt, FormElement $column, $index, Block $codeBlock)
    {
        $options = [
            'session' => '$session',
            'xpath' => $column->getXpath(),
            'index' => $index
        ];

        $codeBlock->appendRenderable(
            new Comment('columnFilter: ' . $column->getLabel()));
        $codeBlock->appendRenderable(
            new Statement(
                new StaticMethodCall('parent', 'dtColumnFilterTest', $options)));

    }

    /**
     * @param DataTable $dt
     * @param Button|Text $action
     * @param Block $codeBlock
     */
    private static function createActionTest(DataTable $dt, $action, Block $codeBlock)
    {

        $options = [
            'session' => '$session',
            'xpath' => $action->getXpath(),

        ];

        if ($action->hasClass('ColVis_Button')) {

            if ($action->getLabel() === 'Kolumny') { // clear filtr
                $codeBlock->appendRenderable(
                    new Comment('action columns: ' . $action->getLabel()));
                $codeBlock->appendRenderable(
                    new Statement(
                        new StaticMethodCall('parent', 'dtActionColumns', $options)));
            } else {
                $x = 1;
            }

        } elseif ($action->getLabel() === 'filtr') { // visible columns
            $codeBlock->appendRenderable(
                new Comment('action filter: ' . $action->getLabel()));
            $codeBlock->appendRenderable(
                new Statement(
                    new StaticMethodCall('parent', 'dtActionFilter', $options)));
        } elseif ($action->getLabel() === 'dtsearch') {
            $codeBlock->appendRenderable(
                new Comment('action globalsearch: ' . $action->getLabel()));
            $codeBlock->appendRenderable(
                new Statement(
                    new StaticMethodCall('parent', 'dtActionGlobalSearch', $options)));
        } else {
            $x = 1;
        }
    }

    private static function createRowOptionTest(DataTable $dt, ActionOption $action, Block $codeBlock)
    {
        $x = 1;

        $options = [
            'session' => '$session',
            'xpath' => $action->getXpath(),

        ];

        if ($action->isModalAction()) {
            $codeBlock->appendRenderable(
                new Comment('dt modal: ' . $action->getTitle()));
            $codeBlock->appendRenderable(
                new Statement(
                    new StaticMethodCall('parent', 'dtModalTest', $options)));
        } elseif ($action->hasAttribute('href')) {

            $codeBlock->appendRenderable(
                new Comment('dt href: ' . $action->getTitle()));
            $codeBlock->appendRenderable(
                new Statement(
                    new StaticMethodCall('parent', 'dtOptionActionTest', $options)));

        } else {
            $x = 1;
        }

    }


}