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

        let command = (process.platform == 'win32' ? 'node ' : '') + 'src/counsel.js';

        let options = {
            cwd: require('path').normalize(`${process.cwd()}/foo`),
        };

        if (process.platform == 'win32') {
          options.shell = true;
        }

        this.assertEquals({
            arguments: [
                '--config',
                'io-tests/configs/dot-reporter-true-false-error-reporting-test.js',
                '--is-io-test',
            ],
            command: command,
            options: options,
        }, ioTest.process);
    }
    
    /** @test */
    it_is_able_to_run_a_specific_io_test()
    {
        let ioTest = new (resolve('IOTest'))({
            filename: 'Foo.yaml',
            test: ioTestContent2
        });

        let ioTestReporter = new (require('../../../src/Components/Reporters/DotReporter'));
        ioTestReporter.forceColor = new (counsel().serviceProviders.chalk).constructor({enabled: false, level: 0});
        ioTestReporter.silent = true;

        let parentTestReporter = Assertions.reporter;
        let parentTest = Assertions.test;
        Assertions.setReporter(ioTestReporter);

        ioTest.parseProcess();

        ioTest.reporter = ioTestReporter;

        ioTest.run();

        Assertions.setReporter(parentTestReporter);
        Assertions.setTest(parentTest);
        
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

  Time: {{formattedExecutionTime}}

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

  Time: {{formattedExecutionTime}}

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
