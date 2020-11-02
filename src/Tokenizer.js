/**
 * The MIT License (MIT)
 * Copyright (C) 2020-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

/**
 * Tokenizer class.
 *
 * Meta lexer which allows creating custom tokenizers from RegExp spec.
 *
 * Example:
 *
 *   const tokenizer = Tokenizer.fromSpec([
 *     [/\s+/, v => 'WS'],
 *     [/\d+/, v => 'NUMBER'],
 *     [/\w+/, v => 'WORD'],
 *   ]);
 *
 *   tokenizer.init('Score 255');
 *
 *   console.log([...tokenizer]);
 *
 * Result:
 *
 *   [
 *     { type: 'WORD', value: 'Score' },
 *     { type: 'WS', value: ' ' },
 *     { type: 'NUMBER', value: '255' }
 *   ]
 *
 */
class Tokenizer {
  /**
   * Creates new
   */
  constructor(spec, string = null) {
    this._spec = this._processSpec(spec);
    this._tokens = [];
    this.init(string);
  }

  /**
   * Initializes a string.
   */
  init(string) {
    this._string = string;
    this._cursor = 0;

    this._tokens.length = 0;

    this._currentLine = 1;
    this._currentColumn = 0;
    this._currentLineBeginOffset = 0;

    /**
     * Matched token location data.
     */
    this._tokenStartOffset = 0;
    this._tokenEndOffset = 0;
    this._tokenStartLine = 1;
    this._tokenEndLine = 1;
    this._tokenStartColumn = 0;
    this._tokenEndColumn = 0;

    this._gen = this._genTokens();
  }

  /**
   * Alias for `init` method
   * (compatibility with Syntax tool API)
   */
  initString(string) {
    return this.init(string);
  }

  /**
   * Resets the current string.
   */
  reset() {
    return this.init(this._string);
  }

  /**
   * Creates a tokenizer from spec.
   */
  static fromSpec(spec) {
    return new this(spec);
  }

  /**
   * Returns next token.
   */
  getNextToken() {
    return this._gen.next().value;
  }

  /**
   * Whether there are more tokens.
   */
  hasMoreTokens() {
    return this._cursor < this._string.length;
  }

  /**
   * Whether it's EOF.
   */
  isEOF() {
    return this._cursor === this._string.length;
  }

  /**
   * Returns spec.
   */
  getSpec() {
    return this._spec;
  }

  /**
   * Returns current cursor position.
   */
  getCursor() {
    return this._cursor;
  }

  /**
   * Returns current line.
   */
  getCurrentLine() {
    return this._currentLine;
  }

  /**
   * Returns current column.
   */
  getCurrentColumn() {
    return this._currentColumn;
  }

  /**
   * Generates tokens.
   */
  *_genTokens() {
    while (this.hasMoreTokens()) {
      let tokenType;
      let tokenValue;

      const string = this._string.slice(this._cursor);

      for (let [regexp, handle] of this._spec) {
        tokenValue = this._match(string, regexp);
        if (tokenValue == null) {
          continue;
        }
        tokenType = handle(tokenValue);
        if (Array.isArray(tokenType)) {
          tokenValue = tokenType[0];
          tokenType = tokenType[1];
        }
        break;
      }
      if (tokenType == null) {
        this.throwUnexpectedToken(
          string[0],
          this._currentLine,
          this._currentColumn,
        );
      }

      yield this._toToken(tokenType, tokenValue);
    }
  }

  /**
   * Tokens iterator.
   */
  tokens() {
    return this._gen;
  }

  /**
   * The tokenizer is iterable.
   */
  [Symbol.iterator]() {
    return this._gen;
  }

  /**
   * Returns all tokens as an array.
   */
  getAllTokens() {
    if (this._tokens == null) {
      this._tokens = [...this];
    }
    return this._tokens;
  }

  /**
   * Throws default "Unexpected token" exception, showing the actual
   * line from the source, pointing with the ^ marker to the bad token.
   * In addition, shows `line:column` location.
   */
  throwUnexpectedToken(symbol, line, column) {
    const lineSource = this._string.split('\n')[line - 1];
    let lineData = '';

    if (lineSource) {
      const pad = ' '.repeat(column);
      lineData = '\n\n' + lineSource + '\n' + pad + '^\n';
    }

    throw new SyntaxError(
      `${lineData}Unexpected token: "${symbol}" ` + `at ${line}:${column}\n`,
    );
  }

  /**
   * Captures token location.
   */
  _captureLocation(matched) {
    const nlRe = /\n/g;

    // Absolute offsets.
    this._tokenStartOffset = this._cursor;

    // Line-based locations, start.
    this._tokenStartLine = this._currentLine;
    this._tokenStartColumn =
      this._tokenStartOffset - this._currentLineBeginOffset;

    // Extract `\n` in the matched token.
    let nlMatch;
    while ((nlMatch = nlRe.exec(matched)) !== null) {
      this._currentLine++;
      this._currentLineBeginOffset = this._tokenStartOffset + nlMatch.index + 1;
    }

    this._tokenEndOffset = this._cursor + matched.length;

    // Line-based locations, end.
    this._tokenEndLine = this._currentLine;
    this._tokenEndColumn = this._currentColumn =
      this._tokenEndOffset - this._currentLineBeginOffset;
  }

  /**
   * Creates token object.
   */
  _toToken(tokenType, tokenValue = '') {
    return {
      // Basic data.
      type: tokenType,
      value: tokenValue,

      // Location data.
      startOffset: this._tokenStartOffset,
      endOffset: this._tokenEndOffset,
      startLine: this._tokenStartLine,
      endLine: this._tokenEndLine,
      startColumn: this._tokenStartColumn,
      endColumn: this._tokenEndColumn,
    };
  }

  /**
   * Matches the string to regexp and returns the matched result.
   */
  _match(string, regexp) {
    let matched = string.match(regexp);
    if (matched != null) {
      // Handle `\n` in the matched token to track line numbers.
      this._captureLocation(matched[0]);
      this._cursor += matched[0].length;
      return matched[0];
    }
    return null;
  }

  /**
   * Processes lexical rules with begin marker.
   */
  _processSpec(spec) {
    if (spec.rules) {
      spec = spec.rules;
    }

    for (const entry of spec) {
      if (entry[0].source[0] !== '^') {
        entry[0] = new RegExp(`^${entry[0].source}`);
      }
    }

    return spec;
  }
}

/* INJECT: %spec */

module.exports = Tokenizer;
