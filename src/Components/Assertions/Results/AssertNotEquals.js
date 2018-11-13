counselUse('Assertion');

module.exports = class AssertNotEquals extends Assertion
{
    /**
     * Describe the failure for this assertion.
     * 
     * @return {string}
     */
    describeFailure()
    {
        return `Failed asserting that ${this.beautify(this.expected)} is not equal to ${this.beautify(this.actual)}.`;
    }
}
