(window.webpackJsonp=window.webpackJsonp||[]).push([[16],{215:function(t,e,n){"use strict";n.r(e);var s=n(0),a=Object(s.a)({},(function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[n("h1",{attrs:{id:"the-command-line-test-runner"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#the-command-line-test-runner"}},[t._v("#")]),t._v(" The command line test runner")]),t._v(" "),n("p",[t._v("The Counsel command-line test runner can be invoked through the "),n("code",[t._v("counsel")]),t._v(" command. The following example shows how to run tests with the counsel command-line test runner:")]),t._v(" "),n("div",{staticClass:"language-bash extra-class"},[n("pre",{pre:!0,attrs:{class:"language-bash"}},[n("code",[t._v("$ counsel ArrayTest\nCounsel "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("version"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n\n"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("..")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("..")]),t._v("\n\nTime: 55ms\n\n"),n("span",{pre:!0,attrs:{class:"token number"}},[t._v("6")]),t._v(" passed, "),n("span",{pre:!0,attrs:{class:"token number"}},[t._v("4")]),t._v(" tests\n")])])]),n("p",[t._v("When invoked as shown above, the Counsel command-line test runner will look for a ArrayTest.js sourcefile, by default in the tests folder within the current working directory. It will load the file, and expect to find a ArrayTest test case class. Than It will execute the tests within that class.")]),t._v(" "),n("p",[t._v("For each test run, the Counsel command-line tool prints one character to indicate progress:")]),t._v(" "),n("p",[n("code",[t._v(".")])]),t._v(" "),n("p",[t._v("Printed when the test succeeds.")]),t._v(" "),n("p",[n("code",[t._v("x")])]),t._v(" "),n("p",[t._v("Printed when an assertion fails while running the test method.")]),t._v(" "),n("p",[n("code",[t._v("S")])]),t._v(" "),n("p",[t._v("Printed when the test has been skipped (see Incomplete and Skipped Tests).")]),t._v(" "),n("p",[n("code",[t._v("I")])]),t._v(" "),n("p",[t._v("Printed when the test is marked as being incomplete or not yet implemented (see Incomplete and Skipped Tests).")]),t._v(" "),n("h2",{attrs:{id:"command-line-options"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#command-line-options"}},[t._v("#")]),t._v(" Command line options")]),t._v(" "),n("p",[t._v("The command line test runner provide some useful options:")]),t._v(" "),n("div",{staticClass:"language-bash extra-class"},[n("pre",{pre:!0,attrs:{class:"language-bash"}},[n("code",[t._v("$ counsel --help\n\n Counsel "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("version"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v(".\n \n Options:\n   -h, --help         \tShow some help.\n\n   -v, --version        Show counsel's verion number.\n\n   -c, --config         Specify a custom config file.\n\n   -f, --filter         Filter "),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("which")]),t._v(" tests you want to run.\n\n   -s, --suite          Filter "),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("which")]),t._v(" suite to run.\n\n   --ls, --list-suites  Show available "),n("span",{pre:!0,attrs:{class:"token builtin class-name"}},[t._v("test")]),t._v(" suites.\n\n   --verbose            Show "),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("more")]),t._v(" verbose information.\n\n   --coverage           Generate code coverage report. Supported report types:\n   \t\t\t\t\t\tclover, cobertura, html, json-summary, json, lcov,\n   \t\t\t\t\t\tlcovonly,non e, teamcity, text-lcov, text-summary, text.\n    \t\t\t\t\tDefault will be text-summary.\n\n   --silent             Run "),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("in")]),t._v(" silent mode, this will not display anything.\n   \t\t\t\t\t\tUsefull "),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("for")]),t._v(" running through a "),n("span",{pre:!0,attrs:{class:"token builtin class-name"}},[t._v("test")]),t._v(" coverage tool.\n\n   --is-io-test         Mark the current process as an IO test.\n\n   --as-io-test         Run tests normal, but output as "),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("if")]),t._v(" it is an IO test.\n\n   --io-test-filename   Specify the filename from the current IO test.\n\n   --skip-io-tests      Skip all IO tests.\n")])])])])}),[],!1,null,null,null);e.default=a.exports}}]);