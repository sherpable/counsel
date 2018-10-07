module.exports = class AssertEquals extends Assertion
{
    describeFailure()
    {
        return [
            '--- Expected',
            '+++ Actual',
            '@@ @@',
            '---',
            this.beautify(this.expected),
            '+++',
            this.beautify(this.actual),
            'Difference',
            this.visualDifference(),
        ];
    }
}
