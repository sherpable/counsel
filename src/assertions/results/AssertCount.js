use('Assertion');

module.exports = class AssertCount extends Assertion
{
    describeFailure()
    {
        return `Failed asserting that expected size ${this.beautify(this.expected)} matches actual size ${this.beautify(this.actual)}.`;
    }
}
