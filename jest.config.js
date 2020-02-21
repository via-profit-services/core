module.exports = {
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.+(ts|tsx|js)', '**/?(*.)+(spec|test).+(ts|tsx|js)'],
  transform: {
    '^.+\\.(ts|tsx)?$': 'ts-jest',
    '^.+\\.(gql|graphql)$': '@jagi/jest-transform-graphql',
  },
  moduleDirectories: ['node_modules', 'src'],
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node', 'graphql', 'gql'],
  moduleNameMapper: {
    '^~(.*)$': '<rootDir>/src$1',
  },
};
