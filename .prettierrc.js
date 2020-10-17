module.exports = {
  tabWidth: 2,
  printWidth: 80,
  proseWrap: "preserve",
  semi: false,
  trailingComma: "es5",
  singleQuote: false,
  arrowParens: "avoid",
  overrides: [
    {
      files: "{*.edi?(on),*.x12,*.edifact,*.xml}",
      options: {
        parser: "json5",
        quoteProps: "preserve",
        singleQuote: false,
        trailingComma: "all",
      },
    },
  ],
}
