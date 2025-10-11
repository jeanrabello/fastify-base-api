import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleDirectories: ["node_modules", "src"],
  moduleNameMapper: {
    "^@src/(.*)$": "<rootDir>/src/$1",
    "^@config/(.*)$": "<rootDir>/src/config/$1",
    "^@lang/(.*)$": "<rootDir>/src/lang/$1",
    "^@middlewares/(.*)$": "<rootDir>/src/shared/middlewares/$1",
    "^@plugins/(.*)$": "<rootDir>/src/plugins/$1",
    "^@modules/(.*)$": "<rootDir>/src/modules/$1",
    "^@utils/(.*)$": "<rootDir>/src/shared/utils/$1",
  },
  modulePathIgnorePatterns: ["<rootDir>/dist/"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  moduleFileExtensions: ["ts", "js", "json", "node"],
  testMatch: ["**/__tests__/**/*.(ts|tsx|js)", "**/*.(test|spec).(ts|tsx|js)"],
  maxWorkers: 1,
};

export default config;
