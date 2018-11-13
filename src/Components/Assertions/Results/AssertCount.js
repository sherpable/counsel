counselUse('Assertion');

module.exports = class AssertCount extends Assertion
{
    /**
     * Describe the failure for this assertion.
     * 
     * @return {string}
     */
    describeFailure()
    {
        return `Failed asserting that expected size ${this.beautify(this.expected)} matches actual size ${this.beautify(this.actual)}.`;
    }
}
