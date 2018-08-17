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

        return `--- Expected\n+++ Actual\n@@ @@\n---\n${this.beautify(this.expected)}\n+++\n${this.beautify(this.actual)}\nDifference\n${this.visualDifference()}`;
    }
}
