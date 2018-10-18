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
            Assertion: './assertions/Assertion',
            Test: './results/Test',
            TestClass: './results/TestClass',
            Reporter: './reporters/Reporter',
            TestCase: './TestCase',
            IOTestRunner: './IOTestRunner',
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
    
    loadHelpers()
    {
        require('./helpers.js');
    }
    
    bind(abstract, concrete = null)
    {
        if (! concrete) {
            concrete = abstract;
        }

        this.serviceProviders[abstract] = concrete;
    }

    make(abstract, parameters)
    {
        return new (this.resolve(abstract))(...parameters);
    }
    
    use(abstract)
    {
        let alias;

        [abstract, alias] = abstract.split(' as ');

        if (! alias) {
            alias = abstract;
        }

        global[alias] = this.resolve(abstract);
    }

    resolve(abstract)
    {
        return this.serviceProviders[abstract];
    }
    
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

    registerServiceProviders(providers)
    {
        this.serviceProvidersList = providers;
    }

    cwd()
    {
        if (process.platform == 'win32') {
            return this.rootWithoutTrailingsSlash.replace(/\\/g, '\\\\');
        }

        return this.rootWithoutTrailingsSlash;
    }

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

    loadAssertions()
    {
        this.bind('Assertions', new Proxy(
            new (require('./assertions/Assertions'))(this.reporter),
            require('./assertions/AssertionsProxy')
        ));

        this.assertions = this.resolve('Assertions');
    }

    async boot()
    {
        this.loadConfig();
        
        this.loadCustomErrorClasses();

        await this.reporter.beforeBoot();

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

            let ioTest = {
                filename,
                test,
            };

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
            this.bind('VueComponentTestCase', require('./VueComponentTestCase'));
            this.bind('VueComponentTester', require('./VueComponentTester'));
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

        if (this.isIOTestProcess) {
            // Disable colors for IO tests
            this.serviceProviders.chalk = require('chalk').constructor({enabled: false, level: 0});
        }
    }

    defineFacades()
    {
        for (let resolveKey in this.facades) {
            this.defineFacade(this.facades[resolveKey], resolveKey);
        }
    }

    defineFacade(globalName, resolveKey)
    {
        global[globalName] = new Proxy(
            new (require('./Facade'))(resolveKey),
            require('./FacadeProxy')
        );
    }

    async test()
    {
        await this.reporter.beforeTest();

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

        await this.reporter.afterTest();
    }

    instantiateIOTestRunner()
    {
        return new this.serviceProviders.IOTestRunner(this.ioTests, this.reporter);
    }

    async runIOTests()
    {
        if (this.isIOTestProcess) {
            return;
        }

        await this.reporter.beforeIOTest();

        this.IOTestRunner = this.instantiateIOTestRunner();

        this.IOTestRunner.test();

        await this.reporter.afterIOTest();
    }

    exit()
    {
        let statusCode = counsel().reporter.assertionsFailuresCount ? 2 : 0;

        process.exit(statusCode);
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

            let testClass = new (this.resolve('TestClass'))(
                new testFiles[filePath](),
                filePath,
                testClasses[filePath]
            );

            await testClass.runTests();
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
            totalTests += testClasses[testClass].filter(functionName => functionName != 'test').length;
        }

        totalTests += this.getTotalIOTests();

        return totalTests;
    }

    getTotalIOTests()
    {
        let totalIOTests = 0;

        for (let ioTestIndex in this.ioTests) {
            totalIOTests++;
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
