#!/usr/bin/env node

(async () => {
    let app = require('./CounselRunner').instantiate();
    let chalk = resolve('chalk');
    let figures = resolve('figures');
    
    /**
     * Boot counsel, basically this will read the config file "counsel.js".
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
