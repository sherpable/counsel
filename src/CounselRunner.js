module.exports = class CounselRunner
{
    /**
     * Create a new CounselRunner instance.
     * 
     * @constructor
     */
    constructor()
    {
        require('jsdom-global')();

        this.configFile = 'counsel.config.js';

        this.serviceProviders = {};

        this.serviceProvidersList = {
            path: 'path',
            fs: 'fs',
            fileLoader: './Utilities/autoloader',
            concordance: 'concordance',
            figures: 'figures',
            cheerio: 'cheerio',
            moment: 'moment',
            sinon: 'sinon',
            stackTrace: 'stack-trace',
            chalk: 'chalk',
            nodeHook: 'node-hook',
            yaml: 'js-yaml',
            annotations: './Utilities/annotations',
            Assertion: './Components/Assertions/Assertion',
            Test: './Components/Testing/Test',
            IOTest: './Components/Testing/IOTest',
            TestClass: './Components/Testing/TestClass',
            Reporter: './Components/Reporters/Reporter',
            TestCase: './Components/Testing/TestCase',
            IOTestRunner: './Components/Runners/IOTestRunner',
        };

        this.facades = {
            Assertions: 'Assertions',
            TestCase: 'TestCase',
        }

        this.packageJson = require(require('path').resolve(__dirname, '../package.json'));

        this.version = this.packageJson.version;

        this.arguments = this.parseArguments();

        this.silent = false;

        if (this.arguments.silent) {
            this.silent = true;
        }

        if (this.arguments.config) {
            this.configFile = this.arguments.config;
        }

        this.ioTests = [];

        this.reporter = null;

        this.config = {};

        this.locations = [];

        this.isIOTestMarker = 'is-io-test';

        this.asIOTestMarker = 'as-io-test';

        this.isIOTestProcess = this.arguments[this.isIOTestMarker];

        this.asIOTestProcess = this.arguments[this.asIOTestMarker];

        this.ioTestFilename = this.arguments['io-test-filename'];

        this.skipIOTests = this.arguments['skip-io-tests'];

        this.rawFilter = process.env.npm_lifecycle_script;

        this.filter = this.arguments.filter;

        if (! this.filter) {
            this.filter = this.arguments._[0];
        }

        if (! this.filter) {
            this.fullRun = true;
        } else {
            this.fullRun = false;
        }

        this.annotationFilter = 'test';

        if (this.filter && this.filter.startsWith('@')) {
            this.annotationFilter = this.filter.replace('@', '');
            this.filter = '';
        }
    }

    /**
     * Assign a CounselRunner instance the current instance.
     * 
     * @param  {CounselRunner} app
     * @return {CounselRunner}
     */
    static instantiate(app = null)
    {
        if (! app) {
            app = new this;
        }
        
        this.instance = app;
        
        app.loadHelpers();
        
        app.loadServiceProviders();
        
        return app;
    }
    
    /**
     * Load the helpers.js file.
     * This will also make the helpers globally available.
     * 
     * @return {void}
     */
    loadHelpers()
    {
        require('./helpers.js');
    }
    
    /**
     * Register a binding with the container.
     * 
     * @param  {string}  abstract
     * @param  {object}  concrete
     * @return {void}
     */
    bind(abstract, concrete = null)
    {
        if (! concrete) {
            concrete = abstract;
        }

        this.serviceProviders[abstract] = concrete;
    }

    /**
     * Fetch the given type from the container and return a new instance from it.
     * 
     * @param  {string}  abstract
     * @param  {array}   parameters
     * @return {object}
     */
    make(abstract, parameters)
    {
        return new (this.resolve(abstract))(...parameters);
    }
    
    /**
     * Fetch the given type from the container and assign it to the global object.
     * It is possible to specify an alias name with the keyword 'as' like this:
     * use('Foo as Bar');
     * 
     * @param  {string}  abstract
     * @return {void}
     */
    use(abstract)
    {
        let alias;

        [abstract, alias] = abstract.split(' as ');

        if (! alias) {
            alias = abstract;
        }

        global[alias] = this.resolve(abstract);
    }

    /**
     * Fetch the given type from the container and return it.
     * 
     * @param  {string}  abstract
     * @return {object}
     */
    resolve(abstract)
    {
        return this.serviceProviders[abstract];
    }
    
    /**
     * Run the code coverage tool.
     * 
     * @param  {string}  reporterType
     * @return {void}
     */
    runCodeCoverage(reporterType)
    {
        if (! String(reporterType) || typeof reporterType != 'string') {
            reporterType = 'text-summary';
        }

        let root = require('path').normalize(
            process.cwd()
        );

        let spawn = require('child_process').spawnSync;

        this.reporter.log(`Running test coverage tool Istanbul: https://istanbul.js.org/.`);

        let nycFile = '/node_modules/.bin/nyc';
        let options = {};
        if (process.platform == 'win32') {
            root = `node ${root}`;
            nycFile = '\\node_modules\\nyc\\bin\\nyc.js';
            options.shell = true;
        }

        let coverageProcess = spawn(`${root}${nycFile}`, [
            '--reporter', reporterType,
            'src/counsel.js',
            '--silent'
        ], options);

        let result = null;
        let error = null;

        if (coverageProcess.stdout) {
            result = coverageProcess.stdout.toString();
        }

        if (coverageProcess.stderr) {
            error = coverageProcess.stderr.toString();
        }

        this.reporter.log(result);

        if (! coverageProcess.stderr) {
            this.reporter.log(`Test coverage completed.`);
        }

        if (reporterType == 'html') {
            let coverageIndexFilePath = '/coverage/index.html';

            if (process.platform == 'win32') {
                coverageIndexFilePath = '\\coverage\\index.html'
            }
            this.reporter.log(`View results: file://${root}${coverageIndexFilePath}`);
        }

        if (error) {
            this.reporter.log('Error');
            this.reporter.log(error);
        }
    }

    /**
     * The this will run right after the app is fully loaded and booted.
     * 
     * @return {void}
     */
    booted()
    {
        if (this.arguments.help) {
            this.reporter.log(`Counsel ${require('chalk').green(this.version)}\n`);

            this.reporter.log(this.optimist.help());
            process.exit();
        }

        if (this.arguments.version) {
            this.reporter.log(`Counsel version ${require('chalk').green(this.version)}`);
            process.exit();
        }

        if (this.arguments.coverage) {
            this.runCodeCoverage(this.arguments.coverage);
            process.exit();
        }

        this.reporter.log(`Counsel ${require('chalk').green(this.version)}\n`);

        if (this.arguments['list-suites']) {
            this.reporter.log('Available test suite(s):');
            for (let suite in this.config.suites) {
                this.reporter.log(`- ${suite}`);
            }

            process.exit();
        }
    }

    /**
     * Parse the incomming arguments.
     * 
     * @return {void}
     */
    parseArguments()
    {
        this.optimist = require('optimist');

        return this.optimist
            .boolean('is-io-test')
            .alias('h', 'help').describe('h', 'Show some help.')
            .alias('v', 'version').describe('v', 'Show counsel\'s verion number.')
            .alias('c', 'config').describe('c', 'Specify a custom config file.')
            .alias('f', 'filter').describe('f', 'Filter which tests you want to run.')
            .alias('s', 'suite').describe('s', 'Filter which suite to run.')
            .alias('ls', 'list-suites').describe('ls', 'Show available test suites.')
            .describe('verbose', 'Show more verbose information.')
            .describe('coverage', 'Generate code coverage report. Supported report types: clover, cobertura, html, json-summary, json, lcov, lcovonly, none, teamcity, text-lcov, text-summary, text. Default will be text-summary.')
            .describe('silent', 'Run in silent mode, this will not display anything. Usefull for running through a test coverage tool.')
            .describe('is-io-test', 'Mark the current process as an IO test.')
            .describe('as-io-test', 'Run tests normal, but output as if it is an IO test.')
            .describe('io-test-filename', 'Specify the filename from the current IO test.')
            .describe('skip-io-tests', 'Skip all IO tests.')
            .argv;
    }

    /**
     * Register a list of service providers.
     * 
     * @param  {object}  providers
     * @return {void}
     */
    registerServiceProviders(providers)
    {
        this.serviceProvidersList = providers;
    }

    /**
     * Retrieve the current working directory.
     * 
     * @return {string}
     */
    cwd()
    {
        if (process.platform == 'win32') {
            return this.rootWithoutTrailingsSlash.replace(/\\/g, '\\\\');
        }

        return this.rootWithoutTrailingsSlash;
    }

    /**
     * Load and cache the configuration from the config file.
     * 
     * @return {void}
     */
    loadConfig()
    {
        this.rootWithoutTrailingsSlash = this.serviceProviders.path.normalize(
            process.cwd()
        );

        if (process.platform == 'win32') {
            this.root = this.rootWithoutTrailingsSlash + '\\';
        } else {
            this.root = this.rootWithoutTrailingsSlash + '/';
        }

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
    
    /**
     * Load custom error classes and make them globally available.
     * 
     * @return {void}
     */
    loadCustomErrorClasses()
    {
        global.IncompleteTestError = class IncompleteTestError extends Error
        {
            toString()
            {
                return `${this.constructor.name}: ${this.message}`;
            }
        };

        global.SkippedTestError = class SkippedTestError extends Error
        {
            toString()
            {
                return `${this.constructor.name}: ${this.message}`;
            }
        };
    }

    /**
     * Load the reporter.
     * 
     * @param  {callback|string}  reporter
     * @return {void}
     */
    loadReporter(reporter)
    {
        try {
            if (typeof reporter == 'string') {
                this.reporter = new (require(reporter));
            }

            if (typeof reporter == 'function') {
                this.reporter = reporter;
            }

            this.reporter.silent = this.silent;
            this.reporter.fullRun = this.fullRun;

            global.dump = (data) => {
                this.reporter.log(this.reporter.beautify(data));
            }

            global.dd = (data) => {
                global.dump(data);
                process.exit(0);
            }
        } catch (error) {
            console.log(this.serviceProviders.chalk.red(`${this.serviceProviders.figures.cross} counsel error`));
            console.log(error);

            process.exit(2);
        }
    }

    /**
     * Load and bind the Assertions.
     * 
     * @return {void}
     */
    loadAssertions()
    {
        this.bind('Assertions', new Proxy(
            new (require('./Components/Assertions/Assertions'))(this.reporter),
            require('./Components/Assertions/AssertionsProxy')
        ));

        this.assertions = this.resolve('Assertions');
    }

    /**
     * Boot the application.
     * 
     * @return {void}
     */
    async boot()
    {
        this.loadConfig();
        
        this.loadCustomErrorClasses();

        await this.reporter.emit('beforeBoot');

        // Parse IO (yaml) tests
        this.serviceProviders.nodeHook.hook('.yaml', (source, filename) => {
            let test = this.serviceProviders.yaml.safeLoad(source);

            // Apply cli filter
            if (this.filter && (! filename.includes(this.filter) && ! test.test.includes(this.filter))) {
                return false;
            }

            // When running an IO test as if it is a normal test,
            // don't run itself cause that will end in a infinite loop.
            if (filename == this.ioTestFilename && this.asIOTestProcess) {
                return false;
            }

            let ioTest = new (this.resolve('IOTest'))({
                filename,
                test,
            });

            this.ioTests.push(ioTest);

            return ioTest;
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
            this.bind('VueComponentTestCase', require('./Components/Testing/Vue/VueComponentTestCase'));
            this.bind('VueComponentTester', require('./Components/Testing/Vue/VueComponentTester'));
            this.bind('vueTestUtils', require('@vue/test-utils'));
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
                this.reporter.log(`${this.serviceProviders.chalk.red(this.serviceProviders.figures.cross)} Bootstrap file [${this.config.bootstrap}] don't exists.`);
                this.reporter.log(error);
            } else {
                this.reporter.error(this.serviceProviders.chalk.red(`${this.serviceProviders.figures.cross} counsel bootstrap error`));
                this.reporter.log(error);
            }

            process.exit(2);
        }

        this.loadEnvData();

        this.autoloadFiles();

        this.autoloadClasses();

        this.instantiateClasses();

        this.getTestLocations();

        this.loadAssertions();

        this.defineFacades();

        await this.booted();

        await this.reporter.emit('afterBoot');
    }

    /**
     * Load the env data from de config file and assign in to the current process.
     * 
     * @return {void}
     */
    loadEnvData()
    {
        let envData = this.config.env;

        if (envData && typeof envData == 'object') {
            for (let envItem in envData) {
                process.env[envItem] = envData[envItem];
            }
        }
    }

    /**
     * Autoload the files specified with the autoloadFiles section with the config file.
     * 
     * @return {void}
     */
    autoloadFiles()
    {
        let autoloadFiles = this.config.autoloadFiles;

        if (autoloadFiles && typeof autoloadFiles == 'object') {
            autoloadFiles.forEach(file => {
                require(this.root + file);
            });
        }
    }

    /**
     * Autoload the classes specified with the autoloadClasses section with the config file.
     * 
     * @param  {string}  reporterType
     * @return {void}
     */
    autoloadClasses()
    {
        let autoloadClasses = this.config.autoloadClasses;

        if (autoloadClasses && typeof autoloadClasses == 'object') {
            for (let alias in autoloadClasses) {
                global[alias] = require(this.root + autoloadClasses[alias]);
            }
        }
    }

    /**
     * Autoload and instantiate the classes specified with the instantiateClasses section with the config file.
     * 
     * @return {void}
     */
    instantiateClasses()
    {
        let instantiateClasses = this.config.instantiateClasses;

        if (instantiateClasses && typeof instantiateClasses == 'object') {
            for (let alias in instantiateClasses) {
                global[alias] = new (require(this.root + instantiateClasses[alias]));
            }
        }
    }

    /**
     * Load and register all given service providers.
     * 
     * @return {void}
     */
    loadServiceProviders()
    {
        for (let serviceProvider in this.serviceProvidersList) {
            this.serviceProviders[serviceProvider] = require(this.serviceProvidersList[serviceProvider]);
        }

        if (this.isIOTestProcess) {
            // Disable colors for IO tests
            this.serviceProviders.chalk = require('chalk').constructor({enabled: false, level: 0});
        }
    }

    /**
     * Define the facades.
     * 
     * @return {void}
     */
    defineFacades()
    {
        for (let resolveKey in this.facades) {
            this.defineFacade(this.facades[resolveKey], resolveKey);
        }
    }

    /**
     * Define a single facades.
     * 
     * @param  {string}  globalName
     * @param  {string}  resolveKey
     * @return {void}
     */
    defineFacade(globalName, resolveKey)
    {
        global[globalName] = new Proxy(
            new (require('./Components/Facade/Facade'))(resolveKey),
            require('./Components/Facade/FacadeProxy')
        );
    }

    /**
     * Run all tests.
     * 
     * @return {void}
     */
    async test()
    {
        await this.reporter.emit('beforeTest');

        try {
            for (let location in this.locations) {
                await this.runTestsInLocation(location);
            }
        } catch (error) {
            console.error('\n' + this.serviceProviders.chalk.red(`  ${this.serviceProviders.figures.cross} counsel error`));
            console.error(error);

            process.exit(2);
        }

        if(! this.isIOTestProcess && ! this.skipIOTests) {
            await this.runIOTests();
        }

        await this.reporter.emit('afterTest');
    }

    /**
     * Retrieve a new instance from the IO test runner.
     * 
     * @return {IOTestRunner}
     */
    instantiateIOTestRunner()
    {
        return new this.serviceProviders.IOTestRunner(this.ioTests, this.reporter);
    }

    /**
     * Run all IO tests.
     * 
     * @return {void}
     */
    async runIOTests()
    {
        if (this.isIOTestProcess) {
            return;
        }

        await this.reporter.emit('beforeIOTest');

        this.IOTestRunner = this.instantiateIOTestRunner();

        await this.IOTestRunner.test();

        await this.reporter.emit('afterIOTest');
    }

    /**
     * Exit the app with the proper status code.
     * 
     * @return {void}
     */
    exit()
    {
        let statusCode = counsel().reporter.assertionsFailuresCount ? 2 : 0;

        process.exit(statusCode);
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
        let testFiles = this.getTestFilesInLocation(this.locations[location]);

        let testClasses = this.parseTestClasses(testFiles, location);

        if (! reportingTests) {
            this.reporter.totalTests = this.getTotalTests(testClasses);
        }

        for (let filePath in testFiles) {
            if (! testClasses[filePath]) {
                continue;
            }

            let testClass = new (this.resolve('TestClass'))(
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
            let testsInTestClass = this.parseTestClass(testClass, filePath, location);

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
     * @param  {string}  testClassName
     * @param  {string}  path
     * @param  {string}  location
     * @return {object}
     */
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

        for (let ioTestIndex in this.ioTests) {
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

    /**
     * Retrieve the files within the given test locations.
     * 
     * @param  {array}  object
     * @return {object}
     */
    getTestLocations(locations = null)
    {
        let fileLocations = locations || this.config.locations;

        if (this.arguments['suite']) {
            fileLocations = [];
            let suiteLocation = this.config.suites[this.arguments['suite']];

            if (! suiteLocation) {
                console.error(this.serviceProviders.chalk.red(`  ${this.serviceProviders.figures.cross} Test suite [${this.arguments['suite']}] don't exists.`));
                process.exit(2);
            }

            fileLocations.push(suiteLocation);
        }

        if (! fileLocations) {
            process.exit(2);
        }

        fileLocations.forEach(location => {
            this.locations[location] = this.loadFilesFrom(location);
        });

        return this.locations;
    }

    /**
     * Retrieve an absolute path for this application.
     * As the first parameter it is possible to add an additional relative path.
     * 
     * @param  {string}  additionalPath
     * @return {string}
     */
    path(additionalPath)
    {
        return this.root + additionalPath;
    }

    /**
     * Load file from a specific location.
     * 
     * @param  {string}  path
     * @return {void}
     */
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

    /**
     * When running IO tests it is possible to reporter back to the parent process
     * from within the child (io test) process using this method.
     * 
     * @param  {string|object}  key
     * @param  {string}         value
     * @return {void}
     */
    reportToParentProcess(key, value = null)
    {
        if (! this.isIOTestProcess && ! this.asIOTestProcess) {
            return;
        }

        console.log('');

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
