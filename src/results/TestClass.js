module.exports = class TestClass
{
	constructor(testClass, filePath, methods)
	{
		this.testClass = testClass;
		this.filePath = filePath;
		this.methods = methods;

		this.testClass.reporter = counsel().reporter;
		this.testClass.assertions = counsel().assertions;
		this.testClassName = this.testClass.constructor.name;

		this.reporter = counsel().reporter;
		this.assertions = counsel().assertions;
	}

	async runTests()
	{
		await this.reporter.beforeEachTestClass(this);

		await this.runTestsInClass();

		let testFailuresCount = this.reporter.testFailures[this.filePath]['count'];

		await this.reporter.afterEachTestClass(this);

		if (testFailuresCount > 0) {
			await this.reporter.afterEachFailedTestClass(this);
		} else {
			await this.reporter.afterEachPassedTestClass(this);
		}
	}

	async runTest(method)
	{
		let test = new (counsel().resolve('Test'))(this.filePath, method);

		try {
			await this.reporter.beforeEachTest(test);

			// Run the test
			await this.testClass[method]();
			

			let testFailuresCount = this.reporter.testFailures[this.filePath]['functions'][method]['count'];
			let testIncomplete = this.reporter.incompleteTests[`${this.filePath}->${method}`];
			let testSkipped = this.reporter.skippedTests[`${this.filePath}->${method}`];
			test.failuresCount = testFailuresCount;
			test.incomplete = testIncomplete;
			test.skipped = testSkipped;
			test.results = this.reporter.results[this.filePath];

			if (test.failuresCount > 0) {
				await this.reporter.afterEachFailedTest(test);
			} else if (! test.incomplete && ! test.skipped) {
				await this.reporter.afterEachPassedTest(test);
			}
			await this.reporter.afterEachTest(test);

			if (this.testClass.expectedException) {
				Assertions.setTest(this.testClass.test);
				Assertions.fail(`Assert that exception [${this.testClass.expectedException.name}] was thrown, but it was not.`, this.testClass.error);
			}

			if (this.testClass.notExpectedException) {
				Assertions.setTest(this.testClass.test);
				Assertions.pass(`Exception [${this.testClass.notExpectedException.name}] was not thrown.`);
			}

			// @todo: create test for this feature
			this.invokeIfNeeded('afterEachInternal', 'afterEach');
		} catch (error) {
			if (error.message.startsWith('[vue-test-utils]')) {
				this.reporter.log('\n');
				this.reporter.log(this.serviceProviders.chalk.red(`Vue utils error`));
				this.reporter.log(error);

				process.exit(2);
			} else {
				let expectedException = this.testClass.expectedException;
				let expectedExceptionMessage = this.testClass.expectedExceptionMessage;
				let notExpectedException = this.testClass.notExpectedException;

				if ((expectedException && expectedException.name) || (notExpectedException && notExpectedException.name)) {
					if (expectedException && expectedException.name) {
						Assertions.setTest(this.testClass.test);
						Assertions.assertEquals(expectedException.name, error.name, `Assert that exception [${expectedException.name}] was thrown, but is was not.\n  ${error.stack}`, this.testClass.error);
					}

					if(notExpectedException && notExpectedException.name) {
						Assertions.setTest(this.testClass.test);
						Assertions.assertNotEquals(notExpectedException.name, error.name, `Assert that exception [${notExpectedException.name}] was not thrown, but is was.\n  ${error.stack}`, this.testClass.error);
					}

					// After each test with exception
					let testFailuresCount = this.reporter.testFailures[this.filePath]['functions'][method]['count'];
					test.failuresCount = testFailuresCount;
					test.results = this.reporter.results[this.filePath];
					if (testFailuresCount > 0) {
						await this.reporter.afterEachFailedTest(test);
					} else {
						await this.reporter.afterEachPassedTest(test);
					}
					await this.reporter.afterEachTest(test);
				} else {
					if (error instanceof IncompleteTestError) {
						let incompleteTest = this.testClass.test;
						incompleteTest.className = incompleteTest.file;
						incompleteTest.functionName = incompleteTest.function;
						if (! incompleteTest) {
							incompleteTest = { className: this.filePath, functionName: null };
						}

						incompleteTest.message = error.message;

						this.reporter.afterEachIncompleteTest(incompleteTest);
						this.reporter.afterEachTest(test);
					} else if (error instanceof SkippedTestError) {
						let skippedTest = this.testClass.test;
						skippedTest.className = skippedTest.file;
						skippedTest.functionName = skippedTest.function;
						if (! skippedTest) {
							skippedTest = { className: this.filePath, functionName: null };
						}

						skippedTest.message = error.message;

						this.reporter.afterEachSkippedTest(skippedTest);
						this.reporter.afterEachTest(test);
					} else {
						throw error;
					}
				}
			}

			this.testClass['cleanupAfterSingleTestMethod']();
		}
	}

    async runTestsInClass()
    {
		// Invoke setUp method if exists
		if (! this.invokeIfNeeded('setUpInternal', 'setUp')) {
			return;
		}

        for (let method of Object.getOwnPropertyNames(Object.getPrototypeOf(this.testClass))) {
            if (! this.methods.includes(method)) {
                continue;
            }

            // Invoke beforeEach method if exists
			this.invokeIfNeeded('beforeEachInternal', 'beforeEach');

            this.testClass.test = { file: this.filePath, function: method };
            this.testClass.assertions.setTest({ file: this.filePath, function: method });

			await this.runTest(method);
        }

		// Invoke tearDown method
		this.invokeIfNeeded('tearDownInternal', 'tearDown');
	}
	
	invokeIfNeeded(methodName, nameInOutput = null)
	{
		if (! nameInOutput) {
			nameInOutput = methodName;
		}

        try {
            if (typeof this.testClass[methodName] == 'function') {
                this.testClass.name = this.filePath + ' -> ' + nameInOutput;
				this.testClass[methodName]();
				
				return true;
            }
        } catch (error) {
            if (error instanceof IncompleteTestError) {
                let incompleteTest = this.testClass.test;
                if (! incompleteTest) {
                    incompleteTest = { className: this.filePath, functionName: null };
                }

                incompleteTest.message = error.message;

                this.reporter.afterEachIncompleteTest(incompleteTest);
                this.reporter.afterEachTest(this.testClass.test);

                return;
            } else if (error instanceof SkippedTestError) {
                let skippedTest = this.testClass.test;
                if (! skippedTest) {
                    skippedTest = { className: this.filePath, functionName: null };
                }

                skippedTest.message = error.message;

                this.reporter.afterEachSkippedTest(skippedTest);
                this.reporter.afterEachTest(this.testClass.test);

                return;
            } else {
                throw error;
            }
        }
	}
}
