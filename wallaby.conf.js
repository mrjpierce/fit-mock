module.exports = function (w) {

  return {
    files: [
      'src/**/*.ts',
      '!src/**/*test.ts'
    ],

    tests: [
      'src/**/*test.ts'
    ],

    env: {
      type: 'node',
      runner: 'node'
    },

    testFramework: 'mocha'
  };
};
