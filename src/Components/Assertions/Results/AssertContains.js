counselUse('Assertion');

module.exports = class AssertContains extends Assertion
{
    /**
     * Describe the failure for this assertion.
     * 
     * @return {string}
     */
    describeFailure()
    {
        return `Value must match expression:\n\n${this.beautify(this.contents)}\n\nRegular expression:\n\n${this.beautify(this.regex)}`;
    }
}
