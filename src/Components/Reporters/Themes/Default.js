let ansiStyles = require('ansi-styles');

/**
 * Export the default theme object with the given styling per data type.
 * 
 * @return {object}
 */
module.exports = (chalk, forceColor) => {
    return {
        dumpTheme: {
            boolean: ansiStyles.yellow,
            circular: forceColor.grey('[Circular]'),
            date: {
                invalid: forceColor.red('invalid'),
                value: ansiStyles.blue
            },
            diffGutters: {
                actual: forceColor.red('-') + ' ',
                expected: forceColor.green('+') + ' ',
                padding: '  '
            },
            error: {
                ctor: {open: ansiStyles.grey.open + '(', close: ')' + ansiStyles.grey.close},
                name: ansiStyles.magenta
            },
            function: {
                name: ansiStyles.blue,
                stringTag: ansiStyles.magenta
            },
            global: ansiStyles.magenta,
            item: {after: forceColor.grey(',')},
            list: {openBracket: forceColor.grey('['), closeBracket: forceColor.grey(']')},
            mapEntry: {after: forceColor.grey(',')},
            maxDepth: forceColor.grey('…'),
            null: ansiStyles.yellow,
            number: ansiStyles.yellow,
            object: {
                openBracket: forceColor.grey('{'),
                closeBracket: forceColor.grey('}'),
                ctor: ansiStyles.magenta,
                stringTag: {open: ansiStyles.magenta.open + '@', close: ansiStyles.magenta.close},
                secondaryStringTag: {open: ansiStyles.grey.open + '@', close: ansiStyles.grey.close}
            },
            property: {
                after: forceColor.grey(','),
                keyBracket: {open: forceColor.grey('['), close: forceColor.grey(']')},
                valueFallback: forceColor.grey('…')
            },
            react: {
                functionType: forceColor.grey('\u235F'),
                openTag: {
                    start: forceColor.grey('<'),
                    end: forceColor.grey('>'),
                    selfClose: forceColor.grey('/'),
                    selfCloseVoid: ' ' + forceColor.grey('/')
                },
                closeTag: {
                    open: forceColor.grey('</'),
                    close: forceColor.grey('>')
                },
                tagName: ansiStyles.magenta,
                attribute: {
                    separator: '=',
                    value: {
                        openBracket: forceColor.grey('{'),
                        closeBracket: forceColor.grey('}'),
                        string: {
                            line: {open: forceColor.blue('"'), close: forceColor.blue('"'), escapeQuote: '"'}
                        }
                    }
                },
                child: {
                    openBracket: forceColor.grey('{'),
                    closeBracket: forceColor.grey('}')
                }
            },
            regexp: {
                source: {open: ansiStyles.blue.open + '/', close: '/' + ansiStyles.blue.close},
                flags: ansiStyles.yellow
            },
            stats: {separator: forceColor.grey('---')},
            string: {
                open: ansiStyles.blue.open,
                close: ansiStyles.blue.close,
                line: {open: forceColor.blue('\''), close: forceColor.blue('\'')},
                multiline: {start: forceColor.blue('`'), end: forceColor.blue('`')},
                controlPicture: ansiStyles.grey,
                diff: {
                    insert: {
                        open: ansiStyles.bgGreen.open + ansiStyles.black.open,
                        close: ansiStyles.black.close + ansiStyles.bgGreen.close
                    },
                    delete: {
                        open: ansiStyles.bgRed.open + ansiStyles.black.open,
                        close: ansiStyles.black.close + ansiStyles.bgRed.close
                    },
                    equal: ansiStyles.blue,
                    insertLine: {
                        open: ansiStyles.green.open,
                        close: ansiStyles.green.close
                    },
                    deleteLine: {
                        open: ansiStyles.red.open,
                        close: ansiStyles.red.close
                    }
                }
            },
            symbol: ansiStyles.yellow,
            typedArray: {
                bytes: ansiStyles.yellow
            },
            undefined: ansiStyles.yellow
        },

        htmlDumpTheme: {
            /**
             * keyword in a regular Algol-style language
             */
            keyword: chalk.blue,

            /**
             * built-in or library object (constant, class, function)
             */
            built_in: chalk.cyan,

            /**
             * user-defined type in a language with first-class syntactically significant types, like
             * Haskell
             */
            type: chalk.cyan.dim,

            /**
             * special identifier for a built-in value ("true", "false", "null")
             */
            literal: chalk.blue,

            /**
             * number, including units and modifiers, if any.
             */
            number: chalk.green,

            /**
             * literal regular expression
             */
            regexp: chalk.red,

            /**
             * literal string, character
             */
            string: chalk.greenBright,

            /**
             * parsed section inside a literal string
             */
            subst: plainFormat,

            /**
             * symbolic constant, interned string, goto label
             */
            symbol: plainFormat,

            /**
             * class or class-level declaration (interfaces, traits, modules, etc)
             */
            class: chalk.blue,

            /**
             * function or method declaration
             */
            function: chalk.yellow,

            /**
             * name of a class or a function at the place of declaration
             */
            title: plainFormat,

            /**
             * block of function arguments (parameters) at the place of declaration
             */
            params: plainFormat,

            /**
             * comment
             */
            comment: chalk.green,

            /**
             * documentation markup within comments
             */
            doctag: chalk.green,

            /**
             * flags, modifiers, annotations, processing instructions, preprocessor directive, etc
             */
            meta: chalk.grey,

            /**
             * keyword or built-in within meta construct
             */
            'meta-keyword': plainFormat,

            /**
             * string within meta construct
             */
            'meta-string': plainFormat,

            /**
             * heading of a section in a config file, heading in text markup
             */
            section: plainFormat,

            /**
             * XML/HTML tag
             */
            tag: chalk.green,

            /**
             * name of an XML tag, the first word in an s-expression
             */
            name: chalk.green,

            /**
             * s-expression name from the language standard library
             */
            'builtin-name': plainFormat,

            /**
             * name of an attribute with no language defined semantics (keys in JSON, setting names in
             * .ini), also sub-attribute within another highlighted object, like XML tag
             */
            attr: chalk.yellow,

            /**
             * name of an attribute followed by a structured value part, like CSS properties
             */
            attribute: plainFormat,

            /**
             * variable in a config or a template file, environment var expansion in a script
             */
            variable: plainFormat,

            /**
             * list item bullet in text markup
             */
            bullet: plainFormat,

            /**
             * code block in text markup
             */
            code: plainFormat,

            /**
             * emphasis in text markup
             */
            emphasis: chalk.italic,

            /**
             * strong emphasis in text markup
             */
            strong: chalk.bold,

            /**
             * mathematical formula in text markup
             */
            formula: plainFormat,

            /**
             * hyperlink in text markup
             */
            link: chalk.underline,

            /**
             * quotation in text markup
             */
            quote: plainFormat,

            /**
             * tag selector in CSS
             */
            'selector-tag': plainFormat,

            /**
             * #id selector in CSS
             */
            'selector-id': plainFormat,

            /**
             * .class selector in CSS
             */
            'selector-class': plainFormat,

            /**
             * [attr] selector in CSS
             */
            'selector-attr': plainFormat,

            /**
             * :pseudo selector in CSS
             */
            'selector-pseudo': plainFormat,

            /**
             * tag of a template language
             */
            'template-tag': plainFormat,

            /**
             * variable in a template language
             */
            'template-variable': plainFormat,

            /**
             * added or changed line in a diff
             */
            addition: chalk.green,

            /**
             * deleted line in a diff
             */
            deletion: chalk.red,
        }
    };
};

function plainFormat(code)
{
    return code;
}
