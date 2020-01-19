(window.webpackJsonp=window.webpackJsonp||[]).push([[14],{213:function(t,s,e){"use strict";e.r(s);var a=e(0),n=Object(a.a)({},(function(){var t=this,s=t.$createElement,e=t._self._c||s;return e("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[e("h1",{attrs:{id:"incomplete-and-skipped-tests"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#incomplete-and-skipped-tests"}},[t._v("#")]),t._v(" Incomplete and skipped tests")]),t._v(" "),e("h2",{attrs:{id:"incomplete-tests"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#incomplete-tests"}},[t._v("#")]),t._v(" Incomplete tests")]),t._v(" "),e("p",[t._v("When working on a new feature, it is possible to write out the behavior within a new test case class. Your first instinct might be to write empty test methods with the new test case class. But the problem is that Counsel will interpete an empty test method as a successful test. Also calling "),e("code",[t._v("this->fail()")]),t._v(" don't make sence in this case, cause Counsel will interpreted the test as a failure. If you want to keep track of all incomplete tests you need to mark a test specific as being incomplete. You can also think about it as lights. A successful test will be green and a failing test will be red. We need another yellow light to mark tests as incomplete or not implemented yet.")]),t._v(" "),e("h2",{attrs:{id:"incomplete-test-example"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#incomplete-test-example"}},[t._v("#")]),t._v(" Incomplete test example")]),t._v(" "),e("p",[t._v("Example 3.1 shows how to mark a test as incomplete. This will be done by calling the method "),e("code",[t._v("markAsIncomplete()")]),t._v(".")]),t._v(" "),e("div",{staticClass:"language-js extra-class"},[e("pre",{pre:!0,attrs:{class:"language-js"}},[e("code",[e("span",{pre:!0,attrs:{class:"token function"}},[t._v("counsel_use")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),e("span",{pre:!0,attrs:{class:"token string"}},[t._v("'TestCase'")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n"),e("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("class")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("ExampleIncompleteTest")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("extends")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("TestCase")]),t._v("\n"),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),e("span",{pre:!0,attrs:{class:"token comment"}},[t._v("/** @test */")]),t._v("\n    "),e("span",{pre:!0,attrs:{class:"token function"}},[t._v("new_incomplete_feature")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n    "),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n        "),e("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// Optional: Test anything here, if you want.")]),t._v("\n        "),e("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("this")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),e("span",{pre:!0,attrs:{class:"token function"}},[t._v("assertTrue")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),e("span",{pre:!0,attrs:{class:"token boolean"}},[t._v("true")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token string"}},[t._v("'This should already work.'")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n\t\t"),e("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// Stop here and mark this test as incomplete.")]),t._v("\n        "),e("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("this")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),e("span",{pre:!0,attrs:{class:"token function"}},[t._v("markAsIncomplete")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("\n            "),e("span",{pre:!0,attrs:{class:"token string"}},[t._v("'This test is not implemented yet.'")]),t._v("\n        "),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n        "),e("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// For example: this assertion will never executed")]),t._v("\n        "),e("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("this")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),e("span",{pre:!0,attrs:{class:"token function"}},[t._v("assertTrue")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),e("span",{pre:!0,attrs:{class:"token boolean"}},[t._v("false")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n    "),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n"),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")])])]),e("p",[t._v("An incomplete test is indicated by an "),e("code",[t._v("I")]),t._v(" in the output of the Counsel command-line test runner.")]),t._v(" "),e("div",{staticClass:"language-bash extra-class"},[e("pre",{pre:!0,attrs:{class:"language-bash"}},[e("code",[t._v("$ counsel ExampleIncompleteTest --verbose\nCounsel "),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("version"),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n \n.I\n\nTime: 79ms\n\n"),e("span",{pre:!0,attrs:{class:"token number"}},[t._v("1")]),t._v(" passed, "),e("span",{pre:!0,attrs:{class:"token number"}},[t._v("1")]),t._v(" tests\nOK, but "),e("span",{pre:!0,attrs:{class:"token number"}},[t._v("1")]),t._v(" incomplete\n\nExampleIncompleteTest-"),e("span",{pre:!0,attrs:{class:"token operator"}},[t._v(">")]),t._v("new_incomplete_feature\nThis "),e("span",{pre:!0,attrs:{class:"token builtin class-name"}},[t._v("test")]),t._v(" is not implemented yet.\n")])])]),e("h2",{attrs:{id:"skipping-tests"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#skipping-tests"}},[t._v("#")]),t._v(" Skipping tests")]),t._v(" "),e("p",[t._v("Not all tests can be run in every environment. Consider, for instance, a database abstraction layer that has several drivers for the different database systems it supports. The tests for the MySQL driver can of course only be run if a MySQL server is available.")]),t._v(" "),e("h2",{attrs:{id:"skipping-test-example"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#skipping-test-example"}},[t._v("#")]),t._v(" Skipping test example")]),t._v(" "),e("p",[t._v("Example 3.2 shows a test case class, DatabaseTest, that contains one test method, testConnection(). In the test case class' setUp() template method we check whether the MySQLi extension is available and use the "),e("code",[t._v("markAsSkipped()")]),t._v(" method to skip the test if it is not.")]),t._v(" "),e("div",{staticClass:"language-js extra-class"},[e("pre",{pre:!0,attrs:{class:"language-js"}},[e("code",[e("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("class")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("ExampleSkippedTest")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("extends")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("TestCase")]),t._v("\n"),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n\t"),e("span",{pre:!0,attrs:{class:"token function"}},[t._v("setUp")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n\t"),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n\t\t"),e("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("super")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),e("span",{pre:!0,attrs:{class:"token function"}},[t._v("setUp")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n    \t"),e("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("if")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),e("span",{pre:!0,attrs:{class:"token operator"}},[t._v("!")]),t._v(" databaseConnection"),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n\t        "),e("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("this")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),e("span",{pre:!0,attrs:{class:"token function"}},[t._v("markAsSkipped")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("\n\t            "),e("span",{pre:!0,attrs:{class:"token string"}},[t._v("'Database connection not available.'")]),t._v("\n\t        "),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n        "),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n\t"),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n\n    "),e("span",{pre:!0,attrs:{class:"token comment"}},[t._v("/** @test */")]),t._v("\n    "),e("span",{pre:!0,attrs:{class:"token function"}},[t._v("database_connection")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n    "),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n        "),e("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// ..")]),t._v("\n    "),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n"),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")])])]),e("p",[t._v("A test that has been skipped is indicated by an "),e("code",[t._v("S")]),t._v(" in the output of the Counsel command-line test runner.")]),t._v(" "),e("div",{staticClass:"language-bash extra-class"},[e("pre",{pre:!0,attrs:{class:"language-bash"}},[e("code",[t._v("$ counsel ExampleSkippedTest --verbose\nCounsel "),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("version"),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n \nS\n\nTime: 52ms\n\n"),e("span",{pre:!0,attrs:{class:"token number"}},[t._v("0")]),t._v(" passed, "),e("span",{pre:!0,attrs:{class:"token number"}},[t._v("0")]),t._v(" tests\nOK, but "),e("span",{pre:!0,attrs:{class:"token number"}},[t._v("1")]),t._v(" skipped\n \nExampleSkippedTest\nDatabase connection not available.\n")])])])])}),[],!1,null,null,null);s.default=n.exports}}]);