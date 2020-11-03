/**
 * The MIT License (MIT)
 * Copyright (C) 2020-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

const Toknizer = require('../src/Tokenizer');

const defaultSpec = [
  [/\s+/, v => 'WS'],
  [/\d+/, v => 'NUMBER'],
  [/\w+/, v => 'WORD'],
];

const objectSpec = {
  rules: [
    ['\\s+', "return 'WS'"],
    ['\\d+', "return 'NUMBER'"],
    ['\\w+', "return 'WORD'"],
  ],
  options: {
    captureLocations: true,
  },
};

const expectedTokens = [
  {
    type: 'WORD',
    value: 'Score',
  },
  {
    type: 'WS',
    value: ' ',
  },
  {
    type: 'NUMBER',
    value: '250',
  },
];

const expectedTokensWithLocations = [
  {
    type: 'WORD',
    value: 'Score',
    endColumn: 5,
    endLine: 1,
    endOffset: 5,
    startColumn: 0,
    startLine: 1,
    startOffset: 0,
  },
  {
    type: 'WS',
    value: ' ',
    endColumn: 6,
    endLine: 1,
    endOffset: 6,
    startColumn: 5,
    startLine: 1,
    startOffset: 5,
  },
  {
    type: 'NUMBER',
    value: '250',
    endColumn: 9,
    endLine: 1,
    endOffset: 9,
    startColumn: 6,
    startLine: 1,
    startOffset: 6,
  },
];

describe('Toknizer-API', () => {
  it('Class API', () => {
    expect(typeof Toknizer.fromSpec).toBe('function');
  });

  it('Instance API', () => {
    const tokenizer = Toknizer.fromSpec(defaultSpec);

    [
      'init',
      'initString',
      'reset',
      'setOptions',
      'getOptions',
      'getNextToken',
      'hasMoreTokens',
      'isEOF',
      'getSpec',
      'getCursor',
      'getCurrentLine',
      'getCurrentColumn',
      'tokens',
      'getCurrentTokens',
      'getAllTokens',
    ].forEach(method => expect(typeof tokenizer[method]).toBe('function'));
  });

  it('Default spec', () => {
    const tokenizer = Toknizer.fromSpec(defaultSpec);
    expect(tokenizer.getSpec()).toEqual(defaultSpec);
  });

  it('Object spec', () => {
    const tokenizer = Toknizer.fromSpec(objectSpec);
    const spec = tokenizer.getSpec();

    expect(typeof spec[0][1]).toBe('function');
    expect(spec[0][1].toString()).toContain("return 'WS'");
  });

  it('Tokens iterator', () => {
    const tokenizer = Toknizer.fromSpec(defaultSpec);

    tokenizer.init('Score 250');

    expect([...tokenizer]).toEqual(expectedTokens);

    tokenizer.reset();
    expect([...tokenizer.tokens()]).toEqual(expectedTokens);

    tokenizer.reset();
    expect(tokenizer.getNextToken()).toEqual(expectedTokens[0]);
    expect(tokenizer.getNextToken()).toEqual(expectedTokens[1]);
    expect(tokenizer.getNextToken()).toEqual(expectedTokens[2]);
  });

  it('Tokens array', () => {
    const tokenizer = Toknizer.fromSpec(defaultSpec);
    tokenizer.init('Score 250');
    expect(tokenizer.getAllTokens()).toEqual(expectedTokens);
  });

  it('hasMoreTokens', () => {
    const tokenizer = Toknizer.fromSpec(defaultSpec);
    tokenizer.init('Score 250');

    expect(tokenizer.hasMoreTokens()).toBe(true);
    tokenizer.getAllTokens();
    expect(tokenizer.hasMoreTokens()).toBe(false);
    tokenizer.reset();
    expect(tokenizer.hasMoreTokens()).toBe(true);
  });

  it('getNextToken', () => {
    const tokenizer = Toknizer.fromSpec(defaultSpec);
    tokenizer.init('Score 250');

    expect(tokenizer.getNextToken()).toEqual(expectedTokens[0]);
    expect(tokenizer.getCurrentTokens()[0]).toEqual(expectedTokens[0]);
  });

  it('Unexpected token', () => {
    const tokenizer = Toknizer.fromSpec(defaultSpec);
    tokenizer.init('Score: 250');

    try {
      tokenizer.getAllTokens();
    } catch (e) {
      expect(e.message).toContain(
        `Score: 250\n` + `     ^\n` + `Unexpected token: ":" at 1:5`,
      );
    }
  });

  it('Capture captureLocations', () => {
    const tokenizer = Toknizer.fromSpec(defaultSpec);
    tokenizer.init('Score 250', {captureLocations: true});

    expect(tokenizer.getAllTokens()).toEqual(expectedTokensWithLocations);
  });
});