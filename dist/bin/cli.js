#!/usr/bin/env node
/* eslint-disable */
module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 58);
/******/ })
/************************************************************************/
/******/ ({

/***/ 4:
/***/ (function(module, exports) {

module.exports = require("chalk");

/***/ }),

/***/ 58:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/* eslint-disable import/no-extraneous-dependencies */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(__webpack_require__(7));
const path_1 = __importDefault(__webpack_require__(59));
const chalk_1 = __importDefault(__webpack_require__(4));
const dotenv_1 = __importDefault(__webpack_require__(60));
const glob_1 = __importDefault(__webpack_require__(61));
const yargs_1 = __importDefault(__webpack_require__(62));
const getMigrations = (params) => {
    const dotenvFile = path_1.default.resolve(process.cwd(), '.env');
    const MIGRATIONS_DIR_PATTERN = 'migrations';
    const SEEDS_DIT_PATTERN = 'seeds';
    const searchPathPattern = `${process.cwd()}/node_modules/@via-profit-services/*/dist/database/@(${MIGRATIONS_DIR_PATTERN}|${SEEDS_DIT_PATTERN})/*.ts`;
    if (fs_1.default.existsSync(dotenvFile)) {
        const dotEnvData = dotenv_1.default.config({ path: dotenvFile }).parsed;
        if (dotEnvData.DB_MIGRATIONS_DIRECTORY !== undefined || dotEnvData.DB_SEEDS_DIRECTORY !== undefined) {
            glob_1.default(searchPathPattern, (err, files) => {
                files.forEach(filename => {
                    if (!filename.match(/\.d\.ts$/)) {
                        const dir = path_1.default.basename(path_1.default.dirname(filename));
                        const migrationsDestPath = path_1.default.resolve(process.cwd(), dotEnvData.DB_MIGRATIONS_DIRECTORY);
                        const seedsDestPath = path_1.default.resolve(process.cwd(), dotEnvData.DB_SEEDS_DIRECTORY);
                        // copy migrations
                        if (params.migrations && dir === MIGRATIONS_DIR_PATTERN && fs_1.default.existsSync(migrationsDestPath)) {
                            const destinationFile = path_1.default.join(migrationsDestPath, path_1.default.basename(filename));
                            if (!fs_1.default.existsSync(destinationFile)) {
                                fs_1.default.copyFileSync(filename, destinationFile);
                                console.log(`${chalk_1.default.yellow('Was created migration file')} ${chalk_1.default.cyan(path_1.default.basename(filename))}`);
                            }
                        }
                        // copy seeds
                        if (params.seeds && dir === SEEDS_DIT_PATTERN && fs_1.default.existsSync(seedsDestPath)) {
                            const destinationFile = path_1.default.join(seedsDestPath, path_1.default.basename(filename));
                            if (!fs_1.default.existsSync(destinationFile)) {
                                fs_1.default.copyFileSync(filename, destinationFile);
                                console.log(`${chalk_1.default.yellow('Was created seed file')} from ${chalk_1.default.cyan(path_1.default.basename(filename))}`);
                            }
                        }
                    }
                });
            });
        }
    }
};
const args = yargs_1.default
    .command('get-migrations', 'Copy all migration and/or seed files from @via-profit-services modules into your project', () => { }, action => {
    const { migrations, seeds } = action;
    getMigrations({ migrations, seeds });
})
    .options({
    migrations: {
        alias: 'm',
        type: 'boolean',
        description: 'Get migration files',
    },
    seeds: {
        alias: 's',
        type: 'boolean',
        description: 'Get seed files',
    },
}).argv;
exports.default = args;


/***/ }),

/***/ 59:
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),

/***/ 60:
/***/ (function(module, exports) {

module.exports = require("dotenv");

/***/ }),

/***/ 61:
/***/ (function(module, exports) {

module.exports = require("glob");

/***/ }),

/***/ 62:
/***/ (function(module, exports) {

module.exports = require("yargs");

/***/ }),

/***/ 7:
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ })

/******/ });