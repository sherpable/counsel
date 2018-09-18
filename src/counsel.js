#!/usr/bin/env node

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

(async () => {
    global.counsel = new (require('./CounselRunner'));

    /**
     * Boot counsel, basically this will read the config file "counsel.js".
     * If a bootstrap file is provided it will load this fill.
     * Further it scan all provided locations and get the test classes.
     */
    try {
        await counsel.boot();
    } catch (error) {
        console.error(counsel.serviceProviders.chalk.red(`  ${counsel.serviceProviders.figures.cross} counsel bootstrap error`));
        console.log(error);
        process.exit(2);
    }

    /**
     * Filter and run all tests found in all the test classes.
     */
    try {
        await counsel.test();
    } catch (error) {
        console.error(counsel.serviceProviders.chalk.red(`  ${counsel.serviceProviders.figures.cross} counsel error`));
        console.log(error);
        process.exit(2);
    }

    /**
     * Finally, exit with the proper status code.
     */
    counsel.exit();
})();
