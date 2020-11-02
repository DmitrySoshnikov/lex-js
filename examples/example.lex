{
  rules: [
    [/\s+/, v => 'WS'],
    [/\d+/, v => 'NUMBER'],
    [/\w+/, v => 'WORD'],
  ],
}