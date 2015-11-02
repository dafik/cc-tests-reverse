<?php
use Dfi\TestReverse\Skeleton;

/**
 * Created by IntelliJ IDEA.
 * User: z.wieczorek
 * Date: 29.10.15
 * Time: 13:28
 */
class SkeletonTest extends AbstractTest
{
    public function testGenerate()
    {
        $testLocation = 'tmp/gen';
        Skeleton::setTestLocation($testLocation);

        $mockClass = '\mock\Phantom';
        $file = 'tests/mock/Phantom.php';


        require_once $file;
        Skeleton\Reverse::setProviderClass($mockClass);

        $file = 'tmp/gen/Administrator/Callrecords/ListTest.php';
        if (file_exists($file)) {
            unlink($file);
        }
        static::assertFileNotExists($file);

        Skeleton::generate();

        static::assertFileExists($file);

        static::assertFileEquals('tests/fixtures/code/listTest.fixture', $file);


    }
}
