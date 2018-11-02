use('TestCase');

module.exports = class IOTestTest extends TestCase
{
    /** @test */
    it_will_parse_the_io_test_process_proper()
    {
        let ioTest = new (resolve('IOTest'))({
            filename: 'Foo.yaml',
            test: ioTestContent
        });

        ioTest.parseProcess();

        this.assertEquals({
            arguments: [
                '--config',
                'io-tests/configs/dot-reporter-true-false-error-reporting-test.js',
                '--is-io-test',
            ],
            command: 'src/counsel.js',
            options: {
                cwd: '/Users/Timon/Projects/counsel/foo',
            },
        }, ioTest.process);
    }
    
    /** @test */
    it_is_able_to_run_a_specific_io_test()
    {
        let ioTest = new (resolve('IOTest'))({
            filename: 'Foo.yaml',
            test: ioTestContent2
        });

        ioTest.parseProcess();
        
        ioTest.run();
        
        this.assertEquals(
            ioTest.expect,
            ioTest.actual
        );
    }
}

const ioTestContent = resolve('yaml').safeLoad(
    `test:
  Dot reporter error true and false output
perform:
  src/counsel.js --config io-tests/configs/dot-reporter-true-false-error-reporting-test.js --is-io-test
cwd:
  foo
expect: |
  Counsel {{version}}

  xx                        2 / 2 (100%)

  x 1) CoreAssertionsTest -> it_is_able_to_assert_true
  {{root}}io-tests/dot-reporter-true-false-error-reporting-test/CoreAssertionsTest.js:8

  7|     {
  8|         this.assertTrue(false);
  9|     }

  Value is not truthy:

  false

  x 2) CoreAssertionsTest -> it_is_able_to_assert_false
  {{root}}io-tests/dot-reporter-true-false-error-reporting-test/CoreAssertionsTest.js:14

  13|     {
  14|         this.assertFalse(true);
  15|     }

  Value is not falsy:

  true

  Time: {{executionTimeFormatted}}

  2 failed, 2 tests
assertions:
  status: 2
  assertionsCount: 2
  assertionsFailuresCount: 2
  assertionsPassesCount: 0
  testsCount: 2
  testsFailuresCount: 2
  testsPassesCount: 0
  progress: 100`
);

const ioTestContent2 = resolve('yaml').safeLoad(
    `test:
  Dot reporter error true and false output
perform:
  src/counsel.js --config io-tests/configs/dot-reporter-true-false-error-reporting-test.js --is-io-test
expect: |
  Counsel {{version}}

  xx                        2 / 2 (100%)

  x 1) CoreAssertionsTest -> it_is_able_to_assert_true
  {{root}}io-tests/dot-reporter-true-false-error-reporting-test/CoreAssertionsTest.js:8

  7|     {
  8|         this.assertTrue(false);
  9|     }

  Value is not truthy:

  false

  x 2) CoreAssertionsTest -> it_is_able_to_assert_false
  {{root}}io-tests/dot-reporter-true-false-error-reporting-test/CoreAssertionsTest.js:14

  13|     {
  14|         this.assertFalse(true);
  15|     }

  Value is not falsy:

  true

  Time: {{executionTimeFormatted}}

  2 failed, 2 tests
assertions:
  status: 2
  assertionsCount: 2
  assertionsFailuresCount: 2
  assertionsPassesCount: 0
  testsCount: 2
  testsFailuresCount: 2
  testsPassesCount: 0
  progress: 100`
);
