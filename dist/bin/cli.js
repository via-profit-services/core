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
/******/ 	return __webpack_require__(__webpack_require__.s = 98);
/******/ })
/************************************************************************/
/******/ ({

/***/ 1:
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ }),

/***/ 100:
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
Object.defineProperty(exports, "__esModule", { value: true });
const downloadSchema_1 = __webpack_require__(14);
const yargsModule = {
    command: 'download-schema <endpoint> <token> [filename] [method]',
    describe: 'Download GraphQL schema by introspection',
    handler: (args) => __awaiter(void 0, void 0, void 0, function* () {
        const { method, token, endpoint, filename, } = args;
        yield downloadSchema_1.downloadSchema({
            token,
            endpoint,
            filename,
            method: method === 'POST' ? 'POST' : 'GET',
        });
    }),
    builder: (builder) => {
        return builder
            .example('$0 download-schema https://example.com/gql MyToken ./schema.graphql', 'Download GraphQL schema into the ./schema.graphql file')
            .example('$0 download-schema https://example.com/gql MyToken', 'Download GraphQL schema and return this as string');
    },
};
exports.default = yargsModule;


/***/ }),

/***/ 101:
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
Object.defineProperty(exports, "__esModule", { value: true });
const migrations_1 = __webpack_require__(31);
const yargsModule = {
    command: 'get-migrations',
    describe: 'Copy all migration and/or seed files from @via-profit-services modules into your project',
    handler: (args) => __awaiter(void 0, void 0, void 0, function* () { return migrations_1.getMigrations(args); }),
    builder: (builder) => {
        return builder
            .options({
            migrations: {
                alias: 'm',
                type: 'boolean',
            },
            seeds: {
                alias: 's',
                type: 'boolean',
            },
        })
            .example('$0 get-migrations -m', 'Copy all migration files into your project')
            .example('$0 get-migrations -s', 'Copy all seed files into your project')
            .example('$0 get-migrations -m -s', 'Copy all migration and seed files into your project');
    },
};
exports.default = yargsModule;


/***/ }),

/***/ 102:
/***/ (function(module, exports) {

module.exports = require("child_process");

/***/ }),

/***/ 103:
/***/ (function(module, exports) {

module.exports = require("dotenv");

/***/ }),

/***/ 104:
/***/ (function(module, exports) {

module.exports = require("glob");

/***/ }),

/***/ 105:
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
/* eslint-disable import/no-extraneous-dependencies */
const fs_1 = __importDefault(__webpack_require__(1));
const path_1 = __importDefault(__webpack_require__(4));
const chalk_1 = __importDefault(__webpack_require__(7));
const migrations_1 = __webpack_require__(31);
const yargsModule = {
    command: 'knex <command>',
    describe: 'knex-cli provider',
    handler: () => { },
    builder: (builder) => {
        return builder
            .example('$0 knex migrate latest ./knexfile.ts', 'Apply all of the next migrations')
            .command('migrate <command>', 'Apply/Undo/Make migrations', (migrationBuilder) => {
            return migrationBuilder
                .command('latest', 'Apply all of the next migrations', (b) => b.options({
                knexfile: {
                    alias: 'k',
                    type: 'string',
                    demandOption: true,
                    decribe: 'Location of the knexfile',
                },
            }), (args) => __awaiter(void 0, void 0, void 0, function* () {
                yield migrations_1.execKnex('migrate:latest', args.knexfile);
            }))
                .command('up', 'Apply next migration', (b) => b.options({
                knexfile: {
                    alias: 'k',
                    type: 'string',
                    demandOption: true,
                    decribe: 'Location of the knexfile',
                },
            }), (args) => __awaiter(void 0, void 0, void 0, function* () {
                yield migrations_1.execKnex('migrate:up', args.knexfile);
            }))
                .command('down', 'Undo last single of migration', (b) => b.options({
                knexfile: {
                    alias: 'k',
                    type: 'string',
                    demandOption: true,
                    decribe: 'Location of the knexfile',
                },
            }), (args) => __awaiter(void 0, void 0, void 0, function* () {
                yield migrations_1.execKnex('migrate:down', args.knexfile);
            }))
                .command('rollback', 'Undo last migrations', (b) => b.options({
                knexfile: {
                    alias: 'k',
                    type: 'string',
                    demandOption: true,
                    decribe: 'Location of the knexfile',
                },
            }), (args) => __awaiter(void 0, void 0, void 0, function* () {
                yield migrations_1.execKnex('migrate:rollback', args.knexfile);
            }))
                .command('rollback-all', 'Undo all migrations', (b) => b.options({
                knexfile: {
                    alias: 'k',
                    type: 'string',
                    demandOption: true,
                    decribe: 'Location of the knexfile',
                },
            }), (args) => __awaiter(void 0, void 0, void 0, function* () {
                yield migrations_1.execKnex('migrate:rollback --all', args.knexfile);
            }))
                .command('list', 'To list both completed and pending migrations', (b) => b.options({
                knexfile: {
                    alias: 'k',
                    type: 'string',
                    demandOption: true,
                    decribe: 'Location of the knexfile',
                },
            }), (args) => __awaiter(void 0, void 0, void 0, function* () {
                yield migrations_1.execKnex('migrate:list', args.knexfile);
            }))
                .command('make', 'Creating new migration file', (b) => b.options({
                knexfile: {
                    alias: 'k',
                    type: 'string',
                    demandOption: true,
                    decribe: 'Location of the knexfile',
                },
                name: {
                    alias: 'n',
                    type: 'string',
                    demandOption: true,
                    decribe: 'Migration filename',
                },
                stub: {
                    alias: 's',
                    type: 'string',
                    decribe: 'Template file',
                },
            }), (args) => __awaiter(void 0, void 0, void 0, function* () {
                const knexfileDir = path_1.default.dirname(migrations_1.resolveKnexfile(args.knexfile));
                const stubFile = args.stub
                    ? path_1.default.resolve(knexfileDir, args.stub)
                    : path_1.default.resolve(`${process.cwd()}/node_modules/@via-profit-services/core/dist/bin/stub/stub-migration.ts.stub`);
                if (!fs_1.default.existsSync(stubFile)) {
                    console.log(chalk_1.default.red(`Stubfile not found in «${stubFile}»`));
                    process.exit(1);
                }
                yield migrations_1.execKnex(`migrate:make ${args.name}  --stub ${stubFile}`, args.knexfile);
            }));
        })
            .command('seed <command>', 'Apply/Make seeds', (seedBuilder) => {
            return seedBuilder
                .command('make', 'Creating new seed file', (b) => b.options({
                knexfile: {
                    alias: 'k',
                    type: 'string',
                    demandOption: true,
                    decribe: 'Location of the knexfile',
                },
                name: {
                    alias: 'n',
                    type: 'string',
                    demandOption: true,
                    decribe: 'Seed filename',
                },
                stub: {
                    alias: 's',
                    type: 'string',
                    decribe: 'Template file',
                },
            }), (args) => __awaiter(void 0, void 0, void 0, function* () {
                const knexfileDir = path_1.default.dirname(migrations_1.resolveKnexfile(args.knexfile));
                const stubFile = args.stub
                    ? path_1.default.resolve(knexfileDir, args.stub)
                    : path_1.default.resolve(`${process.cwd()}/node_modules/@via-profit-services/core/dist/bin/stub/stub-seed.ts.stub`);
                if (!fs_1.default.existsSync(stubFile)) {
                    console.log(chalk_1.default.red(`Stubfile not found in «${stubFile}»`));
                    process.exit(1);
                }
                yield migrations_1.execKnex(`seed:make ${args.name} --stub ${stubFile}`, args.knexfile);
            }))
                .command('run-all', 'Run all seed files', (b) => b.options({
                knexfile: {
                    alias: 'k',
                    type: 'string',
                    demandOption: true,
                    decribe: 'Location of the knexfile',
                },
            }), (args) => __awaiter(void 0, void 0, void 0, function* () {
                yield migrations_1.execKnex('seed:run', args.knexfile);
            }))
                .command('run <name>', 'Run seed file', (b) => b.options({
                knexfile: {
                    alias: 'k',
                    type: 'string',
                    demandOption: true,
                    decribe: 'Location of the knexfile',
                },
                name: {
                    alias: 'n',
                    type: 'string',
                    demandOption: true,
                    decribe: 'Seed filename',
                },
            }), (args) => __awaiter(void 0, void 0, void 0, function* () {
                yield migrations_1.execKnex(`seed:run ${args.name}`, args.knexfile);
            }));
        });
    },
};
exports.default = yargsModule;


/***/ }),

/***/ 14:
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
const fs_1 = __importDefault(__webpack_require__(1));
const path_1 = __importDefault(__webpack_require__(4));
const utilities_1 = __webpack_require__(15);
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


/***/ }),

/***/ 15:
/***/ (function(module, exports) {

module.exports = require("graphql/utilities");

/***/ }),

/***/ 31:
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
const child_process_1 = __webpack_require__(102);
const fs_1 = __importDefault(__webpack_require__(1));
const path_1 = __importDefault(__webpack_require__(4));
const chalk_1 = __importDefault(__webpack_require__(7));
const dotenv_1 = __importDefault(__webpack_require__(103));
const glob_1 = __importDefault(__webpack_require__(104));
exports.listMigrationsPerPackage = () => {
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
exports.getMigrations = (params) => {
    const localDotEnvFile = path_1.default.resolve(process.cwd(), '.env');
    if (fs_1.default.existsSync(localDotEnvFile)) {
        const dotEnvData = dotenv_1.default.config({ path: localDotEnvFile }).parsed;
        const migrationsListPerPackage = exports.listMigrationsPerPackage();
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
exports.resolveKnexfile = (knexfile) => {
    return path_1.default.resolve(process.cwd(), knexfile);
};
exports.execKnex = (knexCommand, knexfile) => __awaiter(void 0, void 0, void 0, function* () {
    const localKnexfile = exports.resolveKnexfile(knexfile);
    return new Promise((resolve) => {
        const command = `knex ${knexCommand} --knexfile ${localKnexfile}`;
        if (!fs_1.default.existsSync(localKnexfile)) {
            console.log(chalk_1.default.red(`Knexfile not found in «${localKnexfile}»`));
            process.exit(1);
        }
        child_process_1.spawn('yarn', command.split(' '), { stdio: 'inherit' })
            .on('exit', (error) => {
            if (error) {
                console.log(chalk_1.default.red(`Failed to execute knex command ${command}`));
                console.log(chalk_1.default.red(error));
                process.exit(1);
            }
            resolve();
        });
    });
});


/***/ }),

/***/ 4:
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),

/***/ 7:
/***/ (function(module, exports) {

module.exports = require("chalk");

/***/ }),

/***/ 98:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable import/no-extraneous-dependencies */
const yargs_1 = __importDefault(__webpack_require__(99));
const cli_download_schema_1 = __importDefault(__webpack_require__(100));
const cli_get_migrations_1 = __importDefault(__webpack_require__(101));
const cli_knex_1 = __importDefault(__webpack_require__(105));
const args = yargs_1.default
    .command(cli_download_schema_1.default)
    .command(cli_get_migrations_1.default)
    .command(cli_knex_1.default)
    .help()
    .argv;
exports.default = args;


/***/ }),

/***/ 99:
/***/ (function(module, exports) {

module.exports = require("yargs");

/***/ })

/******/ });