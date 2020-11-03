# lex-js

[![Build Status](https://travis-ci.org/DmitrySoshnikov/lex-js.svg?branch=master)](https://travis-ci.org/DmitrySoshnikov/lex-js) [![npm version](https://badge.fury.io/js/@dmitrysoshnikov/lex-js.svg)](https://badge.fury.io/js/@dmitrysoshnikov/lex-js) [![npm downloads](https://img.shields.io/npm/dt/@dmitrysoshnikov/lex-js.svg)](https://www.npmjs.com/package/@dmitrysoshnikov/lex-js)

Lexer generator from RegExp spec.

### Table of Contents

- [Installation](#installation)
- [Development](#development)
- [Node usage example](#node-usage-example)
- [CLI usage example](#cli-usage-example)
- [API](#api)
  - [fromSpec](#fromSpec)
  - [init](#init)
  - [reset](#reset)
  - [hasMoreTokens](#hasMoreTokens)
  - [getNextToken](#getNextToken)
  - [tokens](#tokens)
  - [getAllTokens](#getAllTokens)
  - [setOptions](#setOptions)
- [Error reporting](#error-reporting)
- [Spec format](#spec-format)
  - [Default spec](#default-spec)
  - [JSON spec](#json-spec)
  - [Yacc spec](#Yacc-spec)

### Installation

The tool can be installed as an [npm module](https://www.npmjs.com/package/lex-js):

```
npm install -g @dmitrysoshnikov/lex-js

lex-js --help
```

### Development

1. Fork the https://github.com/DmitrySoshnikov/lex-js repo
2. Make your changes
3. Make sure `npm test` passes (add new tests if needed)
4. Submit a PR

```
git clone https://github.com/<your-github-account>/lex-js.git
cd lex-js
npm install
npm test

./bin/lex-js --help
```

### Node usage example

The module allows creating tokenizers from RegExp specs at runtime:

```js
const {Tokenizer} = require('lex-js');

/**
 * Create a new tokenizer from spec.
 */
const tokenizer = Tokenizer.fromSpec([
  [/\s+/, v => 'WS'],
  [/\d+/, v => 'NUMBER'],
  [/\w+/, v => 'WORD'],
]);

tokenizer.init('Score 255');

console.log(tokenizer.getAllTokens());

/*

Result:

[
  {type: 'WORD', value: 'Score'},
  {type: 'WS', value: ' '},
  {type: 'NUMBER', value: '255'},
]

*/
```

### CLI usage example

The CLI allows generating a tokenizer module from the spec file.

Example `~/spec.lex`:

```js
{
  rules: [
    [/\s+/, v => 'WS'],
    [/\d+/, v => 'NUMBER'],
    [/\w+/, v => 'WORD'],
  ],
  options: {
    captureLocations: false,
  },
}
```

To generate the tokenizer module:

```
lex-js --spec ~/spec.lex --output ./lexer.js

✓ Successfully generated: ~/lexer.js
```

The generated file `./lexer.js` contains the tokenizer module which can be required in Node.js app:

```js
const lexer = require('./lexer');

lexer.init('Score 250');

console.log(lexer.getAllTokens());

/*

Result:

[
  {type: 'WORD', value: 'Score'},
  {type: 'WS', value: ' '},
  {type: 'NUMBER', value: '255'},
]

*/
```

### API

The following methods are available on the `Tokenizer` class.

#### fromSpec

Creates a new tokenizer from spec:

```js
const {Tokenizer} = require('lex-js');

/**
 * Create a new tokenizer from spec.
 */
const tokenizer = Tokenizer.fromSpec([
  [/\s+/, v => 'WS'],
  [/\d+/, v => 'NUMBER'],
  [/\w+/, v => 'WORD'],
]);

tokenizer.init('Score 255');

console.log(tokenizer.getAllTokens());
```

#### init

**`tokenizer.init(string, options = {})`**

Initializes the tokenizer instance with a string and parsing options:

```js
tokenizer.init('Score 255', {captureLocations: true});
````

#### reset

**`tokenizer.reset()`**

Rewinds the string to the beginning, resets tokens.

#### hasMoreTokens

**`tokenizer.hasMoreTokens()`**

Whether there are still more tokens.

#### getNextToken

**`tokenizer.getNextToken()`**

Returns the next token from the iterator.

#### tokens

**`tokenizer.token()`**

Returns tokens iterator.

```js
[...tokenizer.tokens()];

// Same as:
tokenizer.getAllTokens();

// Same as:
[...tokenizer];

// Iterate through tokens:

for (const token of tokenizer.tokens() {
  // Pull lazily tokens
}
```

#### getAllTokens

**`tokenizer.getAllTokens()`**

Returns all tokens as an array.

#### setOptions

**`tokenizer.setOptions()`**

Sets lexer options.

Supported options:

- `captureLocations: boolean`: whether to capture locations.

```js
tokenizer.setOptions({captureLocations: true});

tokenizer.init('Score 250');

console.log(tokenizer.getNextToken());

/*

Result:

{
  type: 'WORD',
  value: 'Score',
  endColumn: 5,
  endLine: 1,
  endOffset: 5,
  startColumn: 0,
  startLine: 1,
  startOffset: 0,
}

*/

```

The options can also be passed with each `init` call:

```js
tokenizer.init('Score 250', {captureLocations: false});

console.log(tokenizer.getNextToken());

/*

Result:

{type: 'WORD', value: 'Score'}

*/

```

### Error reporting

Tokenizer throws _"Unexpected token"_ exception if a token is not recognized from spec:

```js
tokenizer.init('Score: 250');
tokenizer.getAllTokens();

/*

Result:

SyntaxError:

Score: 255
     ^
Unexpected token: ":" at 1:5

*/
```

### Spec format

See [examples](https://github.com/DmitrySoshnikov/lex-js/blob/main/examples/) for multiple spec formats.

#### Default spec

The `lex-js` supports spec formats as the rules [with callback functions](https://github.com/DmitrySoshnikov/lex-js/blob/main/examples/example.lex):

```js
{
  rules: [
    [/\s+/, v => 'WS'],
    [/\d+/, v => 'NUMBER'],
    [/\w+/, v => 'WORD'],
  ],
  options: {
    captureLocations: true,
  },
}
```

This format can be shorter and contain only rules:

```js
[
  [/\s+/, v => 'WS'],
  [/\d+/, v => 'NUMBER'],
  [/\w+/, v => 'WORD'],
]
```

The advantages of this format are the RegExp rules are passed actual regular expressions, and the handlers as actual functions, controlling the parameter name `v` for the matching token.

#### JSON spec

The [JSON format](https://github.com/DmitrySoshnikov/lex-js/blob/main/examples/example-spec.json) of the [Syntax](https://github.com/DmitrySoshnikov/syntax) tool is also supported:

```
{
  "rules": [
    ["\\s+",  "return 'WS'"],
    ["\\d+",  "return 'NUMBER'"],
    ["\\w+",  "return 'WORD'"]
  ],
  "options": {
    "captureLocations": true
  }
}
```

An anonymous function is created from the handler string, and the matched token is passed as the `yytext` parameter in this case.

#### Yacc spec

The [Yacc/Lex](https://github.com/DmitrySoshnikov/lex-js/blob/main/examples/example-spec.yacc) format is supported as well:

```
%%

\s+     return 'WS'
\d+     return 'NUMBER'
\w+     return 'WORD'
```