#!/usr/bin/env node

(async () => {
    require("@babel/register")({
        only: [
            /tests\/*.*\/ES/,
            /TestCase/,
        ]
    });
    require("@babel/polyfill");

    let app = require('./App').instantiate();
    let chalk = counsel_resolve('chalk');
    let figures = counsel_resolve('figures');
    
    /**
     * Boot counsel, basically this will read the config file "counsel.config.js".
     * If a bootstrap file is provided it will load this fill.
     * Further it scan all provided locations and get the test classes.
     */
    try {
        await app.boot();
    } catch (error) {
        console.error(chalk.red(`  ${figures.cross} counsel bootstrap error`));
        console.log(error);
        process.exit(2);
    }

    /**
     * Filter and run all tests found in all the test classes.
     */
    try {
        await app.test();
    } catch (error) {
        console.error(chalk.red(`  ${figures.cross} counsel error`));
        console.log(error);
        process.exit(2);
    }

    /**
     * Finally, exit with the proper status code.
     */
    app.exit();
})();
