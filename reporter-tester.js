const { spawnSync } = require('child_process');
const counselProcess = spawnSync('src/counsel.js');

let error = counselProcess.stderr.toString();
let result = counselProcess.stdout.toString();

let expectedResult = `  ........................  24 / 48 ( 50%)
  ........................  48 / 48 (100%)
  
  Time: {{time}}
  64 passed, 48 tests
`;

expectedResult = expectedResult.split('\n').map((lineContent, lineNumber) => {
    if (lineContent.startsWith('  Time')) {
        return result.split('\n')[lineNumber];
    }

    return lineContent;
}).join('\n');

// process.exit();

// console.log(result.split('\n'));
// console.log(expectedResult.split('\n'));

// process.exit();

// console.log(expectedResult);
// console.log(result);

console.log(result == expectedResult);
