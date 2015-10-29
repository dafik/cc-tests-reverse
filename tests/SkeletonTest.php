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

        Skeleton::generate();

        // Remove the following lines when you implement this test.
        static::markTestIncomplete(
            'This test has not been implemented yet . '
        );
    }
}
