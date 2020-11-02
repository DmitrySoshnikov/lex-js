/**
 * The MIT License (MIT)
 * Copyright (C) 2020-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

const Toknizer = require('../src/Tokenizer');

const spec = [
  [/\s+/, v => 'WS'],
  [/\d+/, v => 'NUMBER'],
  [/\w+/, v => 'WORD'],
];

describe('Toknizer-API', () => {
  it('Class API', () => {
    expect(typeof Toknizer.fromSpec).toBe('function');
  });

  it('Instance API', () => {
    const tokenizer = Toknizer.fromSpec(spec);

    [
      'init',
      'initString',
      'reset',
      'getNextToken',
      'hasMoreTokens',
      'isEOF',
      'getSpec',
      'getCursor',
      'getCurrentLine',
      'getCurrentColumn',
      'tokens',
      'getAllTokens',
    ].forEach(method => expect(typeof tokenizer[method]).toBe('function'));
  });
});
