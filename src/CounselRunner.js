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
            fileLoader: 'auto-loader',
            concordance: 'concordance',
            figures: 'figures',
            cheerio: 'cheerio',
            moment: 'moment',
            sinon: 'sinon',
            stackTrace: 'stack-trace',
            chalk: 'chalk',
            nodeHook: 'node-hook',
            annotations: './utilities/annotations',
            assertionResult: './assertions/AssertionResult',
            reporter: './reporters/Reporter',
            testCase: './TestCase',
        };

        this.reporter = null;

		this.config = {};

		this.locations = [];

		this.rawFilter = process.env.npm_lifecycle_script;

        this.filter = this.parseFilter(this.rawFilter);
        this.filter = process.argv.slice(2)[0];

        this.annotationFilter = 'test';

        if (this.filter && this.filter.startsWith('@')) {
            this.annotationFilter = this.filter.replace('@', '');
            this.filter = '';
        }
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

	parseFilter(rawFilter = '')
	{
		let searchFilter = rawFilter.match(/"((?:\\.|[^"\\])*)"/);

		if (typeof searchFilter === 'object' && searchFilter !== null) {
			return searchFilter[1];
		}

		return null;
	}

	async boot()
	{
        this.loadServiceProviders();

        this.defineGlobals();

        this.loadConfig();

        await this.reporter.beforeBoot();

        if (this.config.vue) {
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

	async test(callback)
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

        await this.reporter.afterTest();
	}

    exit()
    {
        let statusCode = (counsel.reporter.assertionsFailuresCount > 0) ? 2 : 0;

        process.exit(statusCode);
    }

	async runTestsInClass(testClass, path, location)
	{
		let annotations = this.serviceProviders.annotations.getSync(this.path(`${location}/${path}.js`));
        let invokedSetUp = false;
        let testClassMethodIsHit = false;

        for (let name of Object.getOwnPropertyNames(Object.getPrototypeOf(testClass))) {
			let hasCorrectAnnotation = false;
		    let method = testClass[name];

		    if (typeof annotations[name] == 'object') {
                hasCorrectAnnotation = annotations[name][this.annotationFilter] === true;
            }

		    // Default filters:
		    // 1. Skip constructor
		    // 2. Only call methods with a 'test' prefix or a correct annotation, by default this will be 'test'
            if ( ! method instanceof Function || method === testClass || name == 'constructor' || (! name.startsWith('test') && ! hasCorrectAnnotation)) {
                continue;
            }

            // If a custom annotation filter is specified,
            // only run tests with that specific annotation.
            // This will skip tests with prefix 'test'.
            if (this.annotationFilter != 'test' && ! hasCorrectAnnotation) {
                continue;
            }

            // Apply cli filter
            if (this.filter && name != this.filter && testClass.constructor.name != this.filter) {
                continue;
            }

            testClassMethodIsHit = true;

            // Invoke setUp method if exists
            if (typeof testClass['setUp'] == 'function' && ! invokedSetUp) {
                invokedSetUp = true;
                testClass.name = path + ' -> ' + 'setUp';
                testClass['setUp']();
            }

            // Invoke beforeEach method if exists
            // @todo: create test for this feature
            if (typeof testClass['beforeEach'] == 'function') {
                testClass.name = path + ' -> ' + 'beforeEach';
                testClass['beforeEach']();
            }

            testClass.test = { file: path, function: name };
            testClass.assertions.test = { file: path, function: name };

            try {
                await testClass[name]();

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
                    } else {
                        throw error;
                    }
                }

                testClass['cleanupAfterSingleTestMethod']();
            }
		}

        // Invoke tearDown method
        if (typeof testClass['tearDown'] == 'function' && testClassMethodIsHit) {
            testClass.name = path + ' -> ' + 'tearDown';
            testClass['tearDown']();
        }
	}

	async runTestsInLocation(location)
	{
        let testFiles = this.getTestFilesInLocation(this.locations[location]);

        for (let filePath in testFiles) {
            let testClass = new testFiles[filePath]();
            testClass.reporter = this.reporter;
            testClass.assertions = this.assertions;

            await this.reporter.beforeEachTest(filePath);

        	await this.runTestsInClass(testClass, filePath, location);

            let testFailuresCount = this.reporter.testFailures[filePath];

            await this.reporter.afterEachTest(filePath, this.reporter.results[filePath], testFailuresCount);

            if (testFailuresCount > 0) {
                await this.reporter.afterEachFailedTest(filePath, this.reporter.results[filePath], testFailuresCount);
            } else {
                await this.reporter.afterEachPassedTest(filePath, this.reporter.results[filePath]);
            }
        }
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

	getTestLocations()
	{
		let fileLocations = this.config.files;

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
            if(this.serviceProviders.fs.lstatSync(path).isDirectory() == false) {
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

		return this.serviceProviders.fileLoader.load(this.path(path));
	}
}
