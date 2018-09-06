module.exports = class AssertEqualsResult extends AssertionResult
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
