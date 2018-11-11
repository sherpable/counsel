module.exports = class TestRunner
{
    /**
     * Create a new TestRunner instance.
     * 
     * @constructor
     */
    constructor(reporter, config, args)
    {
        this.reporter = reporter;
        this.config = config;
        this.arguments = args;

        this.annotations = resolve('annotations');
        this.chalk = resolve('chalk');
        this.figures = resolve('figures');

    }

    /**
     * Run all tests.
     * 
     * @return {void}
     */
    async test()
    {
        try {
            for (let location in counsel().locations) {
                await this.runTestsInLocation(location);
            }
        } catch (error) {
            console.error('\n' + this.chalk.red(`  ${this.figures.cross} counsel error`));
            console.error(error);

            process.exit(2);
        }
    }

    /**
     * Run all tests found within a given location.
     * 
     * @param  {string}   location
     * @param  {boolean}  reportingTests
     * @return {void}
     */
    async runTestsInLocation(location, reportingTests = false)
    {
        let testFiles = this.getTestFilesInLocation(counsel().locations[location]);

        let testClasses = this.parseTestClasses(testFiles, location);

        if (! reportingTests) {
            this.reporter.totalTests = this.getTotalTests(testClasses);
        }

        for (let filePath in testFiles) {
            if (! testClasses[filePath]) {
                continue;
            }

            let testClass = new (resolve('TestClass'))(
                new testFiles[filePath](),
                filePath,
                testClasses[filePath]
            );

            await testClass.runTests();
        }
    }

    /**
     * Parse the given test files. This will check which test files need to be executed
     * according to the given filters.
     * 
     * @param  {object}  testFiles
     * @param  {string}  location
     * @return {object}
     */
    parseTestClasses(testFiles, location)
    {
        let testClasses = [];

        for (let filePath in testFiles) {
            let testClass = testFiles[filePath];
            let testsInTestClass = this.parseTestClass(filePath, location);

            if (testsInTestClass.length > 0) {
                testClasses[filePath] = testsInTestClass;
            }
        }

        return testClasses;
    }

    /**
     * Parse a single test file. This will check if the test file need to be executed
     * according to the given filters.
     * 
     * @param  {string}  path
     * @param  {string}  location
     * @return {object}
     */
    parseTestClass(path, location)
    {
        let tests = [];

        let annotations = this.annotations.getSync(counsel().path(`${location}/${path}.js`));

        let possibleTestMethods = [];

        for (let possibleTestMethod in annotations) {
            possibleTestMethods.push(possibleTestMethod);
        }

        for (let index in possibleTestMethods) {
            let name = possibleTestMethods[index];

            let hasCorrectAnnotation = false;

            if (typeof annotations[name] == 'object') {
                hasCorrectAnnotation = annotations[name][counsel().annotationFilter] === true;
            }

            // Default filters:
            // 1. Skip constructor
            // 2. Only call methods with a 'test' prefix or a correct annotation, by default this will be 'test'
            if (name == 'constructor' || (! name.startsWith('test') && ! hasCorrectAnnotation)) {
                continue;
            }

            // If a custom annotation filter is specified,
            // only run tests with that specific annotation.
            // This will skip tests with prefix 'test'.
            if (counsel().annotationFilter != 'test' && ! hasCorrectAnnotation) {
                continue;
            }

            // Apply cli filter
            if (counsel().filter && name != counsel().filter && ! path.toLowerCase().includes(counsel().filter.toLowerCase())) {
                continue;
            }

            tests.push(name);
        }

        return tests;
    }

    /**
     * Get the total tests that need to be executed, including IO tests.
     * 
     * @param  {object}  testClasses
     * @return {number}
     */
    getTotalTests(testClasses)
    {
        let totalTests = 0;


        for (let testClass in testClasses) {
            totalTests += testClasses[testClass].filter(functionName => functionName != 'test').length;
        }

        totalTests += this.getTotalIOTests();

        return totalTests;
    }

    /**
     * Get the total IO tests that need to be executed.
     * 
     * @return {number}
     */
    getTotalIOTests()
    {
        let totalIOTests = 0;

        for (let ioTestIndex in counsel().ioTests) {
            totalIOTests++;
        }

        return totalIOTests;
    }

    /**
     * Check if a specific IO test need to be executed inside the current platform.
     * 
     * @param  {object}  testContext
     * @return {boolean}
     */
    ioTestIsForCurrentPlatform(testContext)
    {
        if (! testContext.test.platform) {
            return true;
        }

        return testContext.test.platform.includes(process.platform);
    }

    /**
     * Format the test files object into a flat array.
     * 
     * @param  {object}  object
     * @return {object}
     */
    getTestFilesInLocation(object)
    {
        let testFilePaths = {};

        for (let i in object) {
            if (! object.hasOwnProperty(i)) continue;

            if ((typeof object[i]) == 'object') {
                let flatObject = this.getTestFilesInLocation(object[i]);
                for (let x in flatObject) {
                    if (! flatObject.hasOwnProperty(x)) continue;

                    if (x.toLowerCase().endsWith('test')) {
                        testFilePaths[i + '/' + x] = flatObject[x];
                    }
                }
            } else {
                if (i.toLowerCase().endsWith('test')) {
                    testFilePaths[i] = object[i];
                }
            }
        }

        return testFilePaths;
    }
}