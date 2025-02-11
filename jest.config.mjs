const config = {
    testEnvironment: 'node',
    testMatch: ['**/__tests__/**/*.js?(x)', '**/?(*.)+(spec|test).js?(x)'],
    coveragePathIgnorePatterns: ['/node_modules/'],
    setupFilesAfterEnv: ['./src/tests/setup.js'],
    transform: {
        '^.+\\.js$': 'babel-jest',
    },
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
};

export default config; 