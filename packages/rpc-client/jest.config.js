module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  globals: {
    'ts-jest': {
      tsConfig: './test/tsconfig.json',
      diagnostics: {
        ignoreCodes: ['TS151001']
      }
    }
  }
};