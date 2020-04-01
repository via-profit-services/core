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
/******/ 	return __webpack_require__(__webpack_require__.s = 78);
/******/ })
/************************************************************************/
/******/ ({

/***/ 10:
/***/ (function(module, exports) {

module.exports = require("graphql/utilities");

/***/ }),

/***/ 2:
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ }),

/***/ 7:
/***/ (function(module, exports) {

module.exports = require("chalk");

/***/ }),

/***/ 78:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/* eslint-disable import/no-extraneous-dependencies */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(__webpack_require__(2));
const path_1 = __importDefault(__webpack_require__(8));
const chalk_1 = __importDefault(__webpack_require__(7));
const dotenv_1 = __importDefault(__webpack_require__(79));
const glob_1 = __importDefault(__webpack_require__(80));
const yargs_1 = __importDefault(__webpack_require__(81));
const downloadSchema_1 = __webpack_require__(9);
const listMigrationsPerPackage = () => {
    const list = [];
    const projectsList = glob_1.default.sync(`${process.cwd()}/node_modules/@via-profit-services/*/`);
    projectsList.forEach((projectPath) => {
        const projectName = path_1.default.basename(projectPath);
        const projectInfo = {
            migrations: [],
            seeds: [],
        };
        const migrationSearchPattern = `${projectPath}dist/database/@(migrations|seeds)/*.ts`;
        const projectMigrationFiles = glob_1.default.sync(migrationSearchPattern);
        projectMigrationFiles.forEach((filename) => {
            if (!filename.match(/\.d\.ts$/)) {
                const dir = path_1.default.basename(path_1.default.dirname(filename));
                projectInfo[dir].push(filename);
            }
        });
        list.push({
            project: projectName,
            files: projectInfo,
        });
    });
    return list;
};
const getMigrations = (params) => {
    const localDotEnvFile = path_1.default.resolve(process.cwd(), '.env');
    if (fs_1.default.existsSync(localDotEnvFile)) {
        const dotEnvData = dotenv_1.default.config({ path: localDotEnvFile }).parsed;
        const migrationsListPerPackage = listMigrationsPerPackage();
        migrationsListPerPackage.forEach((projectData) => {
            const { files, project } = projectData;
            if (params.migrations && dotEnvData.DB_MIGRATIONS_DIRECTORY !== undefined) {
                let affected = 0;
                console.log('');
                console.log(`Migrations from project ${chalk_1.default.magenta(project)}`);
                const migrationsDestPath = path_1.default.resolve(process.cwd(), dotEnvData.DB_MIGRATIONS_DIRECTORY);
                files.migrations.forEach((migrationSourceFile) => {
                    const destinationFile = path_1.default.join(migrationsDestPath, path_1.default.basename(migrationSourceFile));
                    if (!fs_1.default.existsSync(destinationFile)) {
                        affected += 1;
                        fs_1.default.copyFileSync(migrationSourceFile, destinationFile);
                        console.log(`${chalk_1.default.yellow('Was created migration file')} ${chalk_1.default.cyan(path_1.default.basename(migrationSourceFile))}`);
                    }
                });
                if (affected) {
                    console.log(`${chalk_1.default.bold.green(affected.toString())} ${chalk_1.default.yellow('file[s] was copied')}`);
                }
                else {
                    console.log(chalk_1.default.grey('No files was copied'));
                }
            }
            if (params.seeds && dotEnvData.DB_SEEDS_DIRECTORY !== undefined) {
                let affected = 0;
                console.log('');
                console.log(`Seeds for ${chalk_1.default.magenta(project)}`);
                const seedsDestPath = path_1.default.resolve(process.cwd(), dotEnvData.DB_SEEDS_DIRECTORY);
                files.seeds.forEach((seedSourceFile) => {
                    const destinationFile = path_1.default.join(seedsDestPath, path_1.default.basename(seedSourceFile));
                    if (!fs_1.default.existsSync(destinationFile)) {
                        affected += 1;
                        fs_1.default.copyFileSync(seedSourceFile, destinationFile);
                        console.log(`${chalk_1.default.yellow('Was created seed file')} ${chalk_1.default.cyan(path_1.default.basename(seedSourceFile))}`);
                    }
                });
                if (affected) {
                    console.log(`${chalk_1.default.bold.green(affected.toString())} ${chalk_1.default.yellow('file[s] was copied')}`);
                }
                else {
                    console.log(chalk_1.default.grey('No files was copied'));
                }
            }
        });
    }
};
const args = yargs_1.default
    .usage('usage: $0 <command>')
    .command('get-migrations', 'Copy all migration and/or seed files from @via-profit-services modules into your project', (builder) => builder.options({
    migrations: {
        alias: 'm',
        type: 'boolean',
    },
    seeds: {
        alias: 's',
        type: 'boolean',
    },
}), ({ migrations, seeds }) => {
    getMigrations({ migrations, seeds });
})
    .command('download-schema <endpoint> <token> [filename] [method]', 'Download GraphQL schema by introspection', (builder) => builder, (action) => __awaiter(void 0, void 0, void 0, function* () {
    const { endpoint, token, filename, method, } = action;
    yield downloadSchema_1.downloadSchema({
        endpoint,
        method,
        token,
        filename,
    });
}))
    .usage('usage: $0 download-schema <endpoint> <token> [filename] [method]')
    .example('$0 download-schema https://example.com/gql MyToken ./schema.graphql', 'Download GraphQL schema into the ./schema.graphql file')
    .example('$0 download-schema https://example.com/gql MyToken', 'Download GraphQL schema and return this as string')
    .help()
    .wrap(120).argv;
exports.default = args;


/***/ }),

/***/ 79:
/***/ (function(module, exports) {

module.exports = require("dotenv");

/***/ }),

/***/ 8:
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),

/***/ 80:
/***/ (function(module, exports) {

module.exports = require("glob");

/***/ }),

/***/ 81:
/***/ (function(module, exports) {

module.exports = require("yargs");

/***/ }),

/***/ 9:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(__webpack_require__(2));
const path_1 = __importDefault(__webpack_require__(8));
const utilities_1 = __webpack_require__(10);
exports.downloadSchema = (options) => __awaiter(void 0, void 0, void 0, function* () {
    const { endpoint, method, token, filename, headers, } = options;
    const response = yield fetch(endpoint, {
        method: method || 'POST',
        headers: Object.assign({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, headers),
        body: JSON.stringify({ query: utilities_1.getIntrospectionQuery() }),
    });
    if (response.status !== 200) {
        throw new Error(`Failed to send introspection request with status code ${response.status}`);
    }
    const schemaJSON = yield response.json();
    const clientSchema = utilities_1.printSchema(utilities_1.buildClientSchema(schemaJSON.data));
    return fs_1.default.writeFileSync(path_1.default.resolve(filename), clientSchema);
});


/***/ })

/******/ });