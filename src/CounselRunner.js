module.exports = class CounselRunner
{
	constructor()
	{
        require('jsdom-global')();

		this.configFile = 'counsel.config.js';

        this.serviceProviders = {};

        this.serviceProvidersList = {
            path: 'path',
            fs: 'fs',
            fileLoader: './utilities/autoloader',
            concordance: 'concordance',
            figures: 'figures',
            cheerio: 'cheerio',
            moment: 'moment',
            sinon: 'sinon',
            stackTrace: 'stack-trace',
            chalk: 'chalk',
            nodeHook: 'node-hook',
            yaml: 'js-yaml',
            annotations: './utilities/annotations',
            assertionResult: './assertions/AssertionResult',
            reporter: './reporters/Reporter',
            testCase: './TestCase',
            IOTestRunner: './IOTestRunner',
        };

        this.packageJson = require(require('path').resolve(__dirname, '../package.json'));

        this.arguments = this.parseArguments();

        if (this.arguments.help) {
            this.optimist.showHelp();
            process.exit();
        }

        if (this.arguments.version) {
            console.log(`Counsel version ${require('chalk').green(this.packageJson.version)}`);
            process.exit();
        }


        if (this.arguments.config) {
            this.configFile = this.arguments.config;
        }

        this.ioTests = [];

        this.reporter = null;

		this.config = {};

		this.locations = [];

        // this.isIoTestProcess = process.argv.includes('io-test');
        this.isIoTestProcess = this.arguments['io-test'];

		this.rawFilter = process.env.npm_lifecycle_script;

        // this.filter = this.getFilter();
        this.filter = this.arguments.filter;

        if (! this.filter) {
            this.filter = this.arguments._[0];
        }

        if (! this.filter) {
            this.fullRun = true;
        } else {
            this.fullRun = false;
        }

        // Skip filter when running as IO test
        if(this.isIoTestProcess && this.filter == 'io-test') {
            this.filter = false;
            this.fullRun = true;
        }

        this.annotationFilter = 'test';

        if (this.filter && this.filter.startsWith('@')) {
            this.annotationFilter = this.filter.replace('@', '');
            this.filter = '';
        }
	}

    parseArguments()
    {
        this.optimist = require('optimist');
        
        return this.optimist.usage('Usage: $0 [-h] [-v] [--config string] [--filter string] [--io-test] filter')
            .boolean('io-test')
            .alias('h', 'help').describe('h', 'Show some help.')
            .alias('v', 'version').describe('v', 'Show counsel\'s verion number.')
            .alias('c', 'config').describe('c', 'Specify a custom config file.')
            .alias('f', 'filter').describe('f', 'Filter which tests you want to run.')
            .alias('s', 'suite').describe('s', 'Filter which suite to run.')
            .argv;
    }

    registerServiceProviders(providers)
    {
        this.serviceProvidersList = providers;
    }

	loadConfig()
	{
        this.root = this.serviceProviders.path.normalize(
            process.cwd() + '/'
        );

		if (this.serviceProviders.fs.existsSync(this.configFile)) {
			this.config = require(this.root + this.configFile);
            // Merge it with the default config
            this.config = { ...require('./counsel.config'), ...this.config };
		} else {
            this.config = require('./counsel.config');
        }

        if (this.config.reporter) {
            this.loadReporter(this.config.reporter);
        }
	}

    loadReporter(reporter)
    {
        try {
            if (typeof reporter == 'string') {
                this.reporter = new (require(reporter));
            }

            if (typeof reporter == 'function') {
                this.reporter = reporter;
            }

            this.reporter.fullRun = this.fullRun;

            global.dump = (data) => {
                console.log(this.reporter.beautify(data));
            }

            global.dd = (data) => {
                global.dump(data);
                process.exit(0);
            }
        } catch (error) {
            console.error(this.serviceProviders.chalk.red(`  ${this.serviceProviders.figures.cross} counsel error`));
            console.error(error);

            process.exit(2);
        }
    }

    loadAssertions()
    {
        global.Assertions = new Proxy(
            new (require('./assertions/Assertions'))(this.reporter),
            require('./assertions/AssertionsProxy')
        );

        this.assertions = Assertions;
    }

	getFilter()
	{
		return process.argv.slice(2)[0];
	}

	async boot()
	{
        this.loadServiceProviders();

        this.defineGlobals();

        this.loadConfig();

        await this.reporter.beforeBoot();

        // Parse IO (yaml) tests
        this.serviceProviders.nodeHook.hook('.yaml', (source, filename) => {
            this.ioTests.push({
                filename,
                test: this.serviceProviders.yaml.safeLoad(source),
            });

            return class {
                test()
                {
                    return this.serviceProviders.yaml.safeLoad(source);
                }

                filename()
                {
                    return filename;
                }
            };
        });

        if (this.config.vue) {
            // Parse .vue files
            this.serviceProviders.nodeHook.hook('.vue', (source, filename) => {
                let rawComponent = this.serviceProviders.cheerio.load(source);
                let component = rawComponent('script').html();
                let template = rawComponent('template').html();

                return component.replace('module.exports = {', 'module.exports = { template: `' + template + '`,');
            });

            // Load vue specific stuff
            global.VueComponentTestCase = require('./VueComponentTestCase');
            global.VueComponentTester = require('./VueComponentTester');
            global.vueTestUtils = require('vue-test-utils');
            if (! this.config.vue.require) {
                this.config.vue.require = () => {
                    require('vue');
                }
            }

            global.Vue = global[this.config.vue] = this.config.vue.require();

            Vue.config.productionTip = false;
            Vue.config.debug = false;
            Vue.config.silent = true;
            Vue.config.devtools = false;
        }

		try {
			if (this.config.bootstrap) {
				require(this.path(this.config.bootstrap));
			}
		} catch (error) {
            if (error instanceof Error && error.code === 'MODULE_NOT_FOUND') {
                console.error(`  ${this.serviceProviders.chalk.red(this.serviceProviders.figures.cross)} Bootstrap file [${this.config.bootstrap}] don't exists.`);
                console.log(error);
            } else {
                console.error(this.serviceProviders.chalk.red(`  ${this.serviceProviders.figures.cross} counsel bootstrap error`));
                console.log(error);
            }

			process.exit(2);
		}

        this.loadEnvData();

        this.autoloadFiles();

        this.autoloadClasses();

        this.instantiateClasses();

		this.getTestLocations();

        this.loadAssertions();

        await this.reporter.afterBoot();
	}

    loadEnvData()
    {
        let envData = this.config.env;

        if (envData && typeof envData == 'object') {
            for (let envItem in envData) {
                process.env[envItem] = envData[envItem];
            }
        }
    }

    autoloadFiles()
    {
        let autoloadFiles = this.config.autoloadFiles;

        if (autoloadFiles && typeof autoloadFiles == 'object') {
            autoloadFiles.forEach(file => {
                require(this.root + file);
            });
        }
    }

    autoloadClasses()
    {
        let autoloadClasses = this.config.autoloadClasses;

        if (autoloadClasses && typeof autoloadClasses == 'object') {
            for (let alias in autoloadClasses) {
                global[alias] = require(this.root + autoloadClasses[alias]);
            }
        }
    }

    instantiateClasses()
    {
        let instantiateClasses = this.config.instantiateClasses;

        if (instantiateClasses && typeof instantiateClasses == 'object') {
            for (let alias in instantiateClasses) {
                global[alias] = new (require(this.root + instantiateClasses[alias]));
            }
        }
    }

    loadServiceProviders()
    {
        for (let serviceProvider in this.serviceProvidersList) {
            this.serviceProviders[serviceProvider] = require(this.serviceProvidersList[serviceProvider]);
        }
    }

    defineGlobals()
    {
        global.Reporter = this.serviceProviders.reporter;
        global.TestCase = this.serviceProviders.testCase;
        global.AssertionResult = this.serviceProviders.assertionResult;
        global.moment = this.serviceProviders.moment;
    }

	async test()
	{
        await this.reporter.beforeTest();

        // Write 2 spaces before first assertion result
        process.stdout.write('  ');

        try {
    		for (let location in this.locations) {
    			await this.runTestsInLocation(location);
            }
        } catch (error) {
            console.error(this.serviceProviders.chalk.red(`  ${this.serviceProviders.figures.cross} counsel error`));
            console.error(error);

            process.exit(2);
        }

        if(! this.isIoTestProcess) {
            await this.runIOTests();
        }

        await this.reporter.afterTest();
	}

    instantiateIOTestRunner()
    {
        return new this.serviceProviders.IOTestRunner(this.ioTests, this.reporter);
    }

    async runIOTests()
    {
        if (this.isIoTestProcess) {
            return;
        }

        this.reporter.beforeIOTests();

        this.IOTestRunner = this.instantiateIOTestRunner();

        this.IOTestsPasses = this.IOTestRunner.test();

        await this.reporter.afterIOTests(this.IOTestsPasses);
    }

    exit()
    {
        let statusCode = (counsel.reporter.assertionsFailuresCount > 0 || this.IOTestsPasses === false) ? 2 : 0;

        process.exit(statusCode);
    }

	async runTestsInClass(testClass, path, testMethods)
	{
        // Invoke setUp method if exists
        if (typeof testClass['setUp'] == 'function') {
            testClass.name = path + ' -> ' + 'setUp';
            testClass['setUp']();
        }

        for (let name of Object.getOwnPropertyNames(Object.getPrototypeOf(testClass))) {
            if (! testMethods.includes(name)) {
                continue;
            }

		    let method = testClass[name];

            // Invoke beforeEach method if exists
            // @todo: create test for this feature
            if (typeof testClass['beforeEach'] == 'function') {
                testClass.name = path + ' -> ' + 'beforeEach';
                testClass['beforeEach']();
            }

            testClass.test = { file: path, function: name };
            testClass.assertions.test = { file: path, function: name };

            try {
                // Fix with test name instead if path
                await this.reporter.beforeEachTest(path);

                // Run the test
                await testClass[name]();

                // Fix with test name instead if path
                let testFailuresCount = this.reporter.testFailures[path];
                if (testFailuresCount > 0) {
                    await this.reporter.afterEachFailedTest(path, this.reporter.results[path], testFailuresCount);
                } else {
                    await this.reporter.afterEachPassedTest(path, this.reporter.results[path]);
                }
                await this.reporter.afterEachTest(path, this.reporter.results[path], testFailuresCount);

                if (testClass.expectedException) {
                    Assertions.test = testClass.test;
                    Assertions.fail(`Assert that exception [${testClass.expectedException.name}] was thrown, but is was not.`, testClass.error);
                }

                if (testClass.notExpectedException) {
                    Assertions.test = testClass.test;
                    Assertions.pass(`Exception [${testClass.notExpectedException.name}] was not thrown.`);
                }

                // Invoke afterEach method if exists
                // @todo: create test for this feature
                if (typeof testClass['afterEach'] == 'function') {
                    testClass.name = path + ' -> ' + 'afterEach';
                    testClass['afterEach']();
                }
            } catch (error) {
                if (error.message.startsWith('[vue-test-utils]')) {
                    console.log('\n');
                    console.error(this.serviceProviders.chalk.red(`  Vue utils error`));
                    console.error(error);

                    process.exit(2);
                } else {
                	let expectedException = testClass.expectedException;
                	let expectedExceptionMessage = testClass.expectedExceptionMessage;
                	let notExpectedException = testClass.notExpectedException;

                    if ((expectedException && expectedException.name) || (notExpectedException && notExpectedException.name)) {
                        if (expectedException && expectedException.name) {
                            Assertions.test = testClass.test;
                            Assertions.assertEquals(expectedException.name, error.name, `Assert that exception [${expectedException.name}] was thrown, but is was not.\n  ${error.stack}`, testClass.error);
                        }

                        if(notExpectedException && notExpectedException.name) {
                            Assertions.test = testClass.test;
                            Assertions.assertNotEquals(notExpectedException.name, error.name, `Assert that exception [${notExpectedException.name}] was not thrown, but is was.\n  ${error.stack}`, testClass.error);
                        }

                        // After each test with exception
                        // Fix with test name instead if path
                        let testFailuresCount = this.reporter.testFailures[path];
                        if (testFailuresCount > 0) {
                            await this.reporter.afterEachFailedTest(path, this.reporter.results[path], testFailuresCount);
                        } else {
                            await this.reporter.afterEachPassedTest(path, this.reporter.results[path]);
                        }
                        await this.reporter.afterEachTest(path, this.reporter.results[path], testFailuresCount);
                    } else {
                        throw error;
                    }
                }

                testClass['cleanupAfterSingleTestMethod']();
            }
		}

        // Invoke tearDown method
        if (typeof testClass['tearDown'] == 'function') {
            testClass.name = path + ' -> ' + 'tearDown';
            testClass['tearDown']();
        }
	}

	async runTestsInLocation(location, reportingTests = false)
	{
        let testFiles = this.getTestFilesInLocation(this.locations[location]);

        let testClasses = this.parseTestClasses(testFiles, location);

        if (! reportingTests) {
            this.reporter.totalTests = this.getTotalTests(testClasses);
        }

        for (let filePath in testFiles) {
            if (! testClasses[filePath]) {
                continue;
            }

            let testClass = new testFiles[filePath]();
            testClass.reporter = this.reporter;
            testClass.assertions = this.assertions;

            let testClassName = testClass.constructor.name;

            await this.reporter.beforeEachTestClass(testClassName, filePath);

        	await this.runTestsInClass(testClass, filePath, testClasses[filePath]);

            let testFailuresCount = this.reporter.testFailures[filePath];

            await this.reporter.afterEachTestClass(testClassName, filePath, this.reporter.results[filePath], testFailuresCount);

            if (testFailuresCount > 0) {
                await this.reporter.afterEachFailedTestClass(testClassName, filePath, this.reporter.results[filePath], testFailuresCount);
            } else {
                await this.reporter.afterEachPassedTestClass(testClassName, filePath, this.reporter.results[filePath]);
            }
        }
    }

    parseTestClasses(testFiles, location)
    {
        let testClasses = [];

        for (let filePath in testFiles) {

            let testClass = testFiles[filePath];
            let testsInTestClass = this.parseTestClass(testClass, filePath, location);

            if (testsInTestClass.length > 0) {
                testClasses[filePath] = testsInTestClass;
            }
        }

        return testClasses;
    }

    parseTestClass(testClassName, path, location)
    {
        let tests = [];

        let annotations = this.serviceProviders.annotations.getSync(this.path(`${location}/${path}.js`));

        let possibleTestMethods = [];

        for (let possibleTestMethod in annotations) {
            possibleTestMethods.push(possibleTestMethod);
        }

        for (let index in possibleTestMethods) {
            let name = possibleTestMethods[index];

            let hasCorrectAnnotation = false;

            if (typeof annotations[name] == 'object') {
                hasCorrectAnnotation = annotations[name][this.annotationFilter] === true;
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
            if (this.annotationFilter != 'test' && ! hasCorrectAnnotation) {
                continue;
            }

            // Apply cli filter
            if (this.filter && name != this.filter && ! path.toLowerCase().includes(this.filter.toLowerCase())) {
                continue;
            }

            tests.push(name);
        }

        return tests;
    }

    getTotalTests(testClasses)
    {
        let totalTests = 0;

        for (let testClass in testClasses) {
            totalTests += testClasses[testClass].length;
        }

        totalTests += this.getTotalIOTests();

        return totalTests;
    }

    getTotalIOTests()
    {
        let totalIOTests = 0;

        for (let ioTestIndex in this.ioTests) {
            let ioTest = this.ioTests[ioTestIndex];

            if (! ioTest.test.skip && this.ioTestIsForCurrentPlatform(ioTest)) {
                totalIOTests++;
            }
        }

        return totalIOTests;
    }

    ioTestIsForCurrentPlatform(testContext)
    {
        if (! testContext.test.platform) {
            return true;
        }

        return testContext.test.platform.includes(process.platform);
    }

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

	getTestLocations(locations = null)
	{
		let fileLocations = locations || this.config.locations;

		if (! fileLocations) {
			process.exit(2);
		}

		fileLocations.forEach(location => {
			this.locations[location] = this.loadFilesFrom(location);
		});

		return this.locations;
	}

	path(additionalPath)
	{
		return this.root + additionalPath;
	}

	loadFilesFrom(path)
	{
        try {
            if (this.serviceProviders.fs.lstatSync(path).isDirectory() == false) {
                return require(this.path(path));
            }
		} catch (error) {
			if (error instanceof Error && error.code === 'ENOENT') {
				console.error(this.serviceProviders.chalk.red(`  ${this.serviceProviders.figures.cross} Directory [${path}] don't exists.`));
			} else {
                console.error(this.serviceProviders.chalk.red(`  counsel error`));
                console.error(error);
            }

			process.exit(2);
		}

		return this.serviceProviders.fileLoader.load(this.path(path), {patterns: this.config.patterns});
	}

    reportToParentProcess(key, value = null)
    {
        if (! this.isIoTestProcess) {
            return;
        }

        let data = '';

        if (typeof key == 'object') {
            for (let item in key) {
                data += `\n${item}=${key[item]}`;
            }
        } else {
            data += `\n${key}=${value}`;
        }

        console.log(`COUNSEL-CHILD-PARENT-MESSAGE:START${data}\nCOUNSEL-CHILD-PARENT-MESSAGE:END`);
    }
}
