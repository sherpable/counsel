#!/usr/bin/env node

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
    }

    /**
     * Finally, filter and run all tests found in all the test classes.
     */
    try {
        await counsel.test();
    } catch (error) {
        console.error(counsel.serviceProviders.chalk.red(`  ${counsel.serviceProviders.figures.cross} counsel error`));
        console.log(error);
    }
})();
