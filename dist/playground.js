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
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/playground/playground.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/authentificator/Authentificator.ts":
/*!************************************************!*\
  !*** ./src/authentificator/Authentificator.ts ***!
  \************************************************/
/*! no static exports found */
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
const fs_1 = __importDefault(__webpack_require__(/*! fs */ "fs"));
const jsonwebtoken_1 = __importDefault(__webpack_require__(/*! jsonwebtoken */ "jsonwebtoken"));
const moment_timezone_1 = __importDefault(__webpack_require__(/*! moment-timezone */ "moment-timezone"));
const v4_1 = __importDefault(__webpack_require__(/*! uuid/v4 */ "uuid/v4"));
const index_1 = __webpack_require__(/*! ~/index */ "./src/index.ts");
var TokenType;
(function (TokenType) {
    TokenType["access"] = "access";
    TokenType["refresh"] = "refresh";
})(TokenType = exports.TokenType || (exports.TokenType = {}));
class Authentificator {
    constructor(props) {
        this.props = props;
    }
    /**
     * Extract Token from HTTP request headers
     * @param  {Request} request
     * @returns string
     */
    static extractToken(request) {
        const { headers } = request;
        const { authorization } = headers;
        const bearer = String(authorization).split(' ')[0];
        const token = String(authorization).split(' ')[1];
        return bearer.toLocaleLowerCase() === 'bearer' ? token : '';
    }
    /**
     * Verify JWT token
     * @param  {string} token
     * @param  {string} publicKeyPath
     * @returns ITokenInfo['payload']
     */
    static verifyToken(token, publicKeyPath) {
        if (token === null) {
            throw new index_1.ServerError('Token verification failed. The token must be provided');
        }
        try {
            const publicKey = fs_1.default.readFileSync(publicKeyPath);
            const payload = jsonwebtoken_1.default.verify(String(token), publicKey);
            return payload;
        }
        catch (err) {
            throw new index_1.ServerError('Token verification failed', err);
        }
    }
    /**
     * Register tokens
     * @param  {{uuid:string;deviceInfo:{};}} data
     * @returns ITokenInfo
     */
    registerTokens(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { context } = this.props;
            const { knex, logger } = context;
            const account = yield knex
                .select(['id', 'roles'])
                .from('accounts')
                .where({
                id: data.uuid,
            })
                .first();
            const tokens = this.generateTokens({
                uuid: account.id,
                roles: account.roles,
            });
            // Register access token
            try {
                yield knex('tokens').insert({
                    id: tokens.accessToken.payload.id,
                    account: tokens.accessToken.payload.uuid,
                    type: TokenType.access,
                    deviceInfo: data.deviceInfo,
                    expiredAt: moment_timezone_1.default(tokens.accessToken.payload.exp).format(),
                });
            }
            catch (err) {
                throw new index_1.ServerError('Failed to register access token', err);
            }
            // register refresh token
            try {
                yield knex('tokens').insert({
                    id: tokens.refreshToken.payload.id,
                    account: tokens.refreshToken.payload.uuid,
                    type: TokenType.refresh,
                    associated: tokens.accessToken.payload.id,
                    deviceInfo: data.deviceInfo,
                    expiredAt: moment_timezone_1.default(tokens.refreshToken.payload.exp).format(),
                });
            }
            catch (err) {
                throw new index_1.ServerError('Failed to register refresh token', err);
            }
            logger.auth.info('New Access token was registered', tokens.accessToken.payload);
            return tokens;
        });
    }
    generateTokens(payload) {
        const { context } = this.props;
        // check file to access and readable
        try {
            fs_1.default.accessSync(context.jwt.privateKey);
        }
        catch (err) {
            throw new index_1.ServerError('Failed to open JWT privateKey file', { err });
        }
        const privatKey = fs_1.default.readFileSync(context.jwt.privateKey);
        const accessTokenPayload = Object.assign(Object.assign({}, payload), { type: TokenType.access, id: v4_1.default(), exp: Date.now() + Number(context.jwt.accessTokenExpiresIn) * 1000, iss: context.jwt.issuer });
        const refreshTokenPayload = Object.assign(Object.assign({}, payload), { type: TokenType.refresh, id: v4_1.default(), associated: accessTokenPayload.id, exp: Date.now() + Number(context.jwt.refreshTokenExpiresIn) * 1000, iss: context.jwt.issuer });
        const accessToken = jsonwebtoken_1.default.sign(accessTokenPayload, privatKey, {
            algorithm: context.jwt.algorithm,
        });
        const refreshToken = jsonwebtoken_1.default.sign(refreshTokenPayload, privatKey, {
            algorithm: context.jwt.algorithm,
        });
        return {
            accessToken: {
                token: accessToken,
                payload: Object.assign(Object.assign({}, accessTokenPayload), { type: TokenType.access }),
            },
            refreshToken: {
                token: refreshToken,
                payload: Object.assign(Object.assign({}, refreshTokenPayload), { type: TokenType.refresh }),
            },
        };
    }
    revokeToken(tokenId) {
        return __awaiter(this, void 0, void 0, function* () {
            const { context } = this.props;
            const { knex } = context;
            yield knex.del('tokens').where({
                id: tokenId,
            });
        });
    }
    checkTokenExist(tokenId) {
        return __awaiter(this, void 0, void 0, function* () {
            const { context } = this.props;
            const { knex } = context;
            const tokenData = yield knex
                .select(['id'])
                .from('tokens')
                .where({ id: tokenId })
                .first();
            return tokenData !== null;
        });
    }
    getAccountByLogin(login) {
        return __awaiter(this, void 0, void 0, function* () {
            const { context } = this.props;
            const { knex } = context;
            const account = yield knex
                .select(['id', 'password', 'status'])
                .from('accounts')
                .where({
                login,
            })
                .first();
            return {
                id: account.id,
                password: account.password,
                status: account.status,
            };
        });
    }
    static sendResponseError(responsetype, resp) {
        const errors = [];
        switch (responsetype) {
            case 'accountForbidden':
                errors.push({
                    message: 'Account locked',
                    name: 'Authorization error',
                });
                break;
            case 'authentificationRequired':
                errors.push({
                    message: 'Authentication Required',
                    name: 'Authorization error',
                });
                break;
            case 'isNotARefreshToken':
                errors.push({
                    message: 'Token error',
                    name: 'Is not a refresh token',
                });
                break;
            case 'tokenExpired':
                errors.push({
                    message: 'Token error',
                    name: 'This token expired',
                });
                break;
            case 'tokenWasRevoked':
                errors.push({
                    message: 'Token error',
                    name: 'Token was revoked',
                });
                break;
            case 'accountNotFound':
            case 'invalidLoginOrPassword':
            default:
                errors.push({
                    message: 'Invalid login or password',
                    name: 'Authorization error',
                });
                break;
        }
        return resp.status(401).json({ errors });
    }
}
exports.Authentificator = Authentificator;
var ResponseErrorType;
(function (ResponseErrorType) {
    ResponseErrorType["authentificationRequired"] = "authentificationRequired";
    ResponseErrorType["accountNotFound"] = "accountNotFound";
    ResponseErrorType["accountForbidden"] = "accountForbidden";
    ResponseErrorType["invalidLoginOrPassword"] = "invalidLoginOrPassword";
    ResponseErrorType["tokenExpired"] = "tokenExpired";
    ResponseErrorType["isNotARefreshToken"] = "isNotARefreshToken";
    ResponseErrorType["tokenWasRevoked"] = "tokenWasRevoked";
})(ResponseErrorType = exports.ResponseErrorType || (exports.ResponseErrorType = {}));
var AccountStatus;
(function (AccountStatus) {
    AccountStatus["allowed"] = "allowed";
    AccountStatus["forbidden"] = "forbidden";
})(AccountStatus = exports.AccountStatus || (exports.AccountStatus = {}));


/***/ }),

/***/ "./src/authentificator/authentificatorMiddleware.ts":
/*!**********************************************************!*\
  !*** ./src/authentificator/authentificatorMiddleware.ts ***!
  \**********************************************************/
/*! no static exports found */
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
const bcryptjs_1 = __importDefault(__webpack_require__(/*! bcryptjs */ "bcryptjs"));
const device_detector_js_1 = __importDefault(__webpack_require__(/*! device-detector-js */ "device-detector-js"));
const express_1 = __webpack_require__(/*! express */ "express");
const express_async_handler_1 = __importDefault(__webpack_require__(/*! express-async-handler */ "express-async-handler"));
const Authentificator_1 = __webpack_require__(/*! ./Authentificator */ "./src/authentificator/Authentificator.ts");
const authentificatorMiddleware = (config) => {
    const { context, authUrl, allowedUrl } = config;
    const { endpoint } = config.context;
    const { publicKey } = config.context.jwt;
    const { logger } = context;
    const authentificator = new Authentificator_1.Authentificator({ context });
    const router = express_1.Router();
    router.post(`${authUrl}/access-token`, express_async_handler_1.default((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { body, headers } = req;
        const { login, password } = body;
        const deviceDetector = new device_detector_js_1.default();
        const deviceInfo = deviceDetector.parse(headers['user-agent']);
        logger.auth.info('Access token request', { login });
        const account = yield authentificator.getAccountByLogin(login);
        // account not found
        if (!account || !bcryptjs_1.default.compareSync(password, account.password)) {
            logger.auth.error('Account not found', { login });
            return Authentificator_1.Authentificator.sendResponseError(Authentificator_1.ResponseErrorType.accountNotFound, res);
        }
        // account locked
        if (account.status === Authentificator_1.AccountStatus.forbidden && bcryptjs_1.default.compareSync(password, account.password)) {
            logger.auth.info('Authentification forbidden', { login });
            return Authentificator_1.Authentificator.sendResponseError(Authentificator_1.ResponseErrorType.accountForbidden, res);
        }
        // success
        if (account.status === Authentificator_1.AccountStatus.allowed && bcryptjs_1.default.compareSync(password, account.password)) {
            const tokens = yield authentificator.registerTokens({
                uuid: account.id,
                deviceInfo,
            });
            return res.status(200).json({
                accessToken: tokens.accessToken.token,
                tokenType: 'bearer',
                expiresIn: config.context.jwt.accessTokenExpiresIn,
                refreshToken: tokens.refreshToken.token,
            });
        }
        return Authentificator_1.Authentificator.sendResponseError(Authentificator_1.ResponseErrorType.accountNotFound, res);
    })));
    router.post(`${authUrl}/refresh-token`, express_async_handler_1.default((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { body, headers } = req;
        const { token } = body;
        // try to verify refresh token
        const tokenPayload = Authentificator_1.Authentificator.verifyToken(token, context.jwt.publicKey);
        if (tokenPayload.type !== Authentificator_1.TokenType.refresh) {
            logger.auth.info('Tried to refresh token by access token. Rejected', { payload: tokenPayload });
            return Authentificator_1.Authentificator.sendResponseError(Authentificator_1.ResponseErrorType.isNotARefreshToken, res);
        }
        // check to token exist
        if (!(yield authentificator.checkTokenExist(tokenPayload.id))) {
            logger.auth.info('Tried to refresh token by revoked refresh token. Rejected', { payload: tokenPayload });
            return Authentificator_1.Authentificator.sendResponseError(Authentificator_1.ResponseErrorType.tokenWasRevoked, res);
        }
        const deviceDetector = new device_detector_js_1.default();
        const deviceInfo = deviceDetector.parse(headers['user-agent']);
        // revoke old access token of this refresh
        yield authentificator.revokeToken(tokenPayload.associated);
        // revoke old refresh token
        yield authentificator.revokeToken(tokenPayload.id);
        // create new tokens
        const tokens = yield authentificator.registerTokens({
            uuid: tokenPayload.uuid,
            deviceInfo,
        });
        return res.status(200).json({
            accessToken: tokens.accessToken.token,
            tokenType: 'bearer',
            expiresIn: config.context.jwt.accessTokenExpiresIn,
            refreshToken: tokens.refreshToken.token,
        });
    })));
    router.use(endpoint, express_async_handler_1.default((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        if (allowedUrl.includes(req.originalUrl)) {
            return next();
        }
        const token = Authentificator_1.Authentificator.extractToken(req);
        Authentificator_1.Authentificator.verifyToken(token, publicKey);
        return Authentificator_1.Authentificator.sendResponseError(Authentificator_1.ResponseErrorType.authentificationRequired, res);
    })));
    return router;
};
exports.authentificatorMiddleware = authentificatorMiddleware;
exports.default = authentificatorMiddleware;


/***/ }),

/***/ "./src/authentificator/index.ts":
/*!**************************************!*\
  !*** ./src/authentificator/index.ts ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(/*! ./Authentificator */ "./src/authentificator/Authentificator.ts"));
__export(__webpack_require__(/*! ./authentificatorMiddleware */ "./src/authentificator/authentificatorMiddleware.ts"));
// TODO Tests reuired


/***/ }),

/***/ "./src/core/index.ts":
/*!***************************!*\
  !*** ./src/core/index.ts ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import { createServer } from 'http';
const chalk_1 = __importDefault(__webpack_require__(/*! chalk */ "chalk"));
// import { SubscriptionServer } from 'subscriptions-transport-ws';
const logger_1 = __webpack_require__(/*! ~/logger */ "./src/logger/index.ts");
const server_1 = __webpack_require__(/*! ~/server */ "./src/server/index.ts");
class Core {
    static init(config) {
        const { port, endpoint, routes, logger } = config;
        const routesList = server_1.getRoutes(endpoint, routes);
        // check connection
        // Create listener server by wrapping express app
        const { server, context } = server_1.createServer(config);
        const { knex } = context;
        knex
            .raw('SELECT 1+1 AS result')
            .then(() => {
            logger.server.debug('Test the connection by trying to authenticate is OK');
            return true;
        })
            .catch(err => {
            logger.server.error(err.name, err);
            throw new logger_1.ServerError(err);
        });
        server.listen(port, () => {
            console.log('');
            console.log('');
            console.log(chalk_1.default.green('========= GraphQL ========='));
            console.log('');
            console.log(`${chalk_1.default.green('GraphQL server')}:     ${chalk_1.default.yellow(`http://localhost:${port}${endpoint}`)}`);
            console.log(`${chalk_1.default.magenta('GraphQL playground')}: ${chalk_1.default.yellow(`http://localhost:${port}${routesList.playground}`)}`);
            console.log(`${chalk_1.default.cyan('Auth Server')}:        ${chalk_1.default.yellow(`http://localhost:${port}${routesList.auth}`)}`);
            console.log(`${chalk_1.default.blue('GraphQL voyager')}:    ${chalk_1.default.yellow(`http://localhost:${port}${routesList.voyager}`)}`);
            console.log('');
        });
        return server;
        // const webServer = createServer(s);
        // webServer.listen(port, () => {
        //   // logger.server.debug('Server was started', { port, endpoint, routes });
        //   console.log('');
        //   console.log('');
        //   console.log(chalk.green('========= GraphQL ========='));
        //   console.log('');
        //   console.log(`${chalk.green('GraphQL server')}:     ${chalk.yellow(`http://localhost:${port}${endpoint}`)}`);
        //   console.log(
        //     `${chalk.magenta('GraphQL playground')}: ${chalk.yellow(`http://localhost:${port}${routes.playground}`)}`,
        //   );
        //   console.log(`${chalk.cyan('Auth Server')}:        ${chalk.yellow(`http://localhost:${port}${routes.auth}`)}`);
        //   console.log(`${chalk.blue('GraphQL voyager')}:    ${chalk.yellow(`http://localhost:${port}${routes.voyager}`)}`);
        //   console.log('');
        // Set up the WebSocket for handling GraphQL subscriptions.
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        // const ss = new SubscriptionServer(
        //   {
        //     execute,
        //     schema,
        //     subscribe,
        //   },
        //   {
        //     path: subscriptionsEndpoint,
        //     server: webServer,
        //   },
        // );
        // });
        // process.on('SIGINT', code => {
        //   logger.server.debug(`Server was stopped (Ctrl-C key passed). Exit with code: ${code}`);
        //   process.exit(2);
        // });
    }
}
exports.Core = Core;
exports.default = Core;
// const webServer = server(config: IInitProps);


/***/ }),

/***/ "./src/databaseManager/index.ts":
/*!**************************************!*\
  !*** ./src/databaseManager/index.ts ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const perf_hooks_1 = __webpack_require__(/*! perf_hooks */ "perf_hooks");
const knex_1 = __importDefault(__webpack_require__(/*! knex */ "knex"));
const knexProvider = (config) => {
    const { database, logger } = config;
    const times = {};
    let count = 0;
    const instance = knex_1.default(database);
    instance
        .on('query', query => {
        // eslint-disable-next-line no-underscore-dangle
        const uid = query.__knexQueryUid;
        times[uid] = {
            position: count,
            query,
            startTime: perf_hooks_1.performance.now(),
            finished: false,
        };
        count += 1;
    })
        .on('query-response', (response, query) => {
        // eslint-disable-next-line no-underscore-dangle
        const uid = query.__knexQueryUid;
        times[uid].endTime = perf_hooks_1.performance.now();
        times[uid].finished = true;
        logger.sql.debug(query.sql, times[uid]);
    })
        .on('query-error', (err, query) => {
        logger.sql.error(query.sql, { err });
    });
    return instance;
};
exports.knexProvider = knexProvider;
exports.default = knexProvider;


/***/ }),

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(/*! ./server */ "./src/server/index.ts"));
__export(__webpack_require__(/*! ./authentificator */ "./src/authentificator/index.ts"));
__export(__webpack_require__(/*! ./databaseManager */ "./src/databaseManager/index.ts"));
__export(__webpack_require__(/*! ./logger */ "./src/logger/index.ts"));
__export(__webpack_require__(/*! ./core */ "./src/core/index.ts"));


/***/ }),

/***/ "./src/logger/errorHandlers/BadRequestError.ts":
/*!*****************************************************!*\
  !*** ./src/logger/errorHandlers/BadRequestError.ts ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class BadRequestError extends Error {
    constructor(message, metaData) {
        super(message);
        this.name = 'BadRequestError';
        this.message = message;
        this.metaData = metaData;
        this.status = 400;
        // Set the prototype explicitly.
        Object.setPrototypeOf(this, BadRequestError.prototype);
    }
}
exports.default = BadRequestError;


/***/ }),

/***/ "./src/logger/errorHandlers/ForbiddenError.ts":
/*!****************************************************!*\
  !*** ./src/logger/errorHandlers/ForbiddenError.ts ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class ForbiddenError extends Error {
    constructor(message, metaData) {
        super(message);
        this.name = 'ForbiddenError';
        this.message = message;
        this.metaData = metaData;
        this.status = 503;
        // Set the prototype explicitly.
        Object.setPrototypeOf(this, ForbiddenError.prototype);
    }
}
exports.default = ForbiddenError;


/***/ }),

/***/ "./src/logger/errorHandlers/NotFoundError.ts":
/*!***************************************************!*\
  !*** ./src/logger/errorHandlers/NotFoundError.ts ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class NotFoundError extends Error {
    constructor(message, metaData) {
        super(message);
        this.name = 'NotFoundError';
        this.message = message;
        this.metaData = metaData;
        this.status = 404;
        // Set the prototype explicitly.
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}
exports.default = NotFoundError;


/***/ }),

/***/ "./src/logger/errorHandlers/ServerError.ts":
/*!*************************************************!*\
  !*** ./src/logger/errorHandlers/ServerError.ts ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class ServerError extends Error {
    constructor(message, metaData) {
        super(message);
        this.name = 'ServerError';
        this.message = message;
        this.metaData = metaData;
        this.status = 500;
        // Set the prototype explicitly.
        Object.setPrototypeOf(this, ServerError.prototype);
    }
}
exports.default = ServerError;


/***/ }),

/***/ "./src/logger/errorHandlers/index.ts":
/*!*******************************************!*\
  !*** ./src/logger/errorHandlers/index.ts ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BadRequestError_1 = __importDefault(__webpack_require__(/*! ./BadRequestError */ "./src/logger/errorHandlers/BadRequestError.ts"));
exports.BadRequestError = BadRequestError_1.default;
const ForbiddenError_1 = __importDefault(__webpack_require__(/*! ./ForbiddenError */ "./src/logger/errorHandlers/ForbiddenError.ts"));
exports.ForbiddenError = ForbiddenError_1.default;
const NotFoundError_1 = __importDefault(__webpack_require__(/*! ./NotFoundError */ "./src/logger/errorHandlers/NotFoundError.ts"));
exports.NotFoundError = NotFoundError_1.default;
const ServerError_1 = __importDefault(__webpack_require__(/*! ./ServerError */ "./src/logger/errorHandlers/ServerError.ts"));
exports.ServerError = ServerError_1.default;


/***/ }),

/***/ "./src/logger/index.ts":
/*!*****************************!*\
  !*** ./src/logger/index.ts ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__webpack_require__(/*! winston-daily-rotate-file */ "winston-daily-rotate-file");
const loggers_1 = __webpack_require__(/*! ./loggers */ "./src/logger/loggers/index.ts");
// eslint-disable-next-line import/no-mutable-exports
let logger;
exports.logger = logger;
exports.configureLogger = (config) => {
    const { loggers } = config, loggerConfig = __rest(config, ["loggers"]);
    exports.logger = logger = Object.assign({ auth: loggers_1.authLogger(loggerConfig), http: loggers_1.httpLogger(loggerConfig), server: loggers_1.serverLogger(loggerConfig), sql: loggers_1.sqlLogger(loggerConfig) }, loggers);
    return logger;
};
__export(__webpack_require__(/*! ./middlewares */ "./src/logger/middlewares/index.ts"));
__export(__webpack_require__(/*! ./errorHandlers */ "./src/logger/errorHandlers/index.ts"));
// TODO Tests reuired


/***/ }),

/***/ "./src/logger/loggers/auth.ts":
/*!************************************!*\
  !*** ./src/logger/loggers/auth.ts ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __webpack_require__(/*! winston */ "winston");
__webpack_require__(/*! winston-daily-rotate-file */ "winston-daily-rotate-file");
const logFormatter_1 = __importDefault(__webpack_require__(/*! ../utils/logFormatter */ "./src/logger/utils/logFormatter.ts"));
exports.default = (config) => {
    const { logPath } = config;
    return winston_1.createLogger({
        level: 'info',
        format: logFormatter_1.default,
        transports: [
            new winston_1.transports.DailyRotateFile({
                filename: `${logPath}/%DATE%-auth.log`,
                level: 'info',
                datePattern: 'YYYY-MM-DD',
                zippedArchive: true,
                maxSize: '20m',
                maxFiles: '14d',
            }),
            new winston_1.transports.DailyRotateFile({
                filename: `${logPath}/%DATE%-debug.log`,
                level: 'debug',
                datePattern: 'YYYY-MM-DD',
                zippedArchive: true,
                maxSize: '20m',
                maxFiles: '14d',
            }),
        ],
    });
};


/***/ }),

/***/ "./src/logger/loggers/http.ts":
/*!************************************!*\
  !*** ./src/logger/loggers/http.ts ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __webpack_require__(/*! winston */ "winston");
__webpack_require__(/*! winston-daily-rotate-file */ "winston-daily-rotate-file");
const logFormatter_1 = __importDefault(__webpack_require__(/*! ../utils/logFormatter */ "./src/logger/utils/logFormatter.ts"));
exports.default = (config) => {
    const { logPath } = config;
    return winston_1.createLogger({
        level: 'info',
        format: logFormatter_1.default,
        transports: [
            new winston_1.transports.DailyRotateFile({
                filename: `${logPath}/%DATE%-http.log`,
                level: 'info',
                datePattern: 'YYYY-MM-DD',
                zippedArchive: true,
                maxSize: '20m',
                maxFiles: '14d',
            }),
        ],
    });
};


/***/ }),

/***/ "./src/logger/loggers/index.ts":
/*!*************************************!*\
  !*** ./src/logger/loggers/index.ts ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_1 = __importDefault(__webpack_require__(/*! ./auth */ "./src/logger/loggers/auth.ts"));
exports.authLogger = auth_1.default;
const http_1 = __importDefault(__webpack_require__(/*! ./http */ "./src/logger/loggers/http.ts"));
exports.httpLogger = http_1.default;
const server_1 = __importDefault(__webpack_require__(/*! ./server */ "./src/logger/loggers/server.ts"));
exports.serverLogger = server_1.default;
const sql_1 = __importDefault(__webpack_require__(/*! ./sql */ "./src/logger/loggers/sql.ts"));
exports.sqlLogger = sql_1.default;


/***/ }),

/***/ "./src/logger/loggers/server.ts":
/*!**************************************!*\
  !*** ./src/logger/loggers/server.ts ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __webpack_require__(/*! winston */ "winston");
__webpack_require__(/*! winston-daily-rotate-file */ "winston-daily-rotate-file");
const logFormatter_1 = __importDefault(__webpack_require__(/*! ../utils/logFormatter */ "./src/logger/utils/logFormatter.ts"));
exports.default = (config) => {
    const { logPath } = config;
    return winston_1.createLogger({
        level: 'debug',
        format: logFormatter_1.default,
        transports: [
            new winston_1.transports.DailyRotateFile({
                filename: `${logPath}/%DATE%-errors.log`,
                level: 'error',
                datePattern: 'YYYY-MM-DD',
                zippedArchive: true,
                maxSize: '20m',
                maxFiles: '14d',
            }),
            new winston_1.transports.DailyRotateFile({
                filename: `${logPath}/%DATE%-debug.log`,
                level: 'debug',
                datePattern: 'YYYY-MM-DD',
                zippedArchive: true,
                maxSize: '20m',
                maxFiles: '14d',
            }),
        ],
    });
};


/***/ }),

/***/ "./src/logger/loggers/sql.ts":
/*!***********************************!*\
  !*** ./src/logger/loggers/sql.ts ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __webpack_require__(/*! winston */ "winston");
__webpack_require__(/*! winston-daily-rotate-file */ "winston-daily-rotate-file");
const logFormatter_1 = __importDefault(__webpack_require__(/*! ../utils/logFormatter */ "./src/logger/utils/logFormatter.ts"));
exports.default = (config) => {
    const { logPath } = config;
    return winston_1.createLogger({
        level: 'debug',
        format: logFormatter_1.default,
        transports: [
            new winston_1.transports.DailyRotateFile({
                filename: `${logPath}/%DATE%-sql.log`,
                level: 'debug',
                datePattern: 'YYYY-MM-DD',
                zippedArchive: true,
                maxSize: '20m',
                maxFiles: '14d',
            }),
            new winston_1.transports.Console({
                level: 'error',
            }),
        ],
    });
};


/***/ }),

/***/ "./src/logger/middlewares/errorHandler.ts":
/*!************************************************!*\
  !*** ./src/logger/middlewares/errorHandler.ts ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(__webpack_require__(/*! chalk */ "chalk"));
const responseFormatter_1 = __importDefault(__webpack_require__(/*! ~/logger/utils/responseFormatter */ "./src/logger/utils/responseFormatter.ts"));
exports.default = (config) => {
    const { context } = config;
    const { logger } = context;
    return [
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (err, req, res, next) => {
            const { status, stack, name, message, metaData } = err;
            const { originalUrl } = req;
            logger.server.error(message ? `${status || ''} ${message}` : 'Unknown error', { originalUrl, stack, metaData });
            if (true) {
                console.log('');
                console.log(`${chalk_1.default.bgRed.white(' Fatal Error ')} ${chalk_1.default.red(name)}`);
                console.log(message, metaData);
                console.log('');
            }
            res.status(status || 500).json(responseFormatter_1.default({
                message: message || 'Please contact system administrator',
                name: name || 'Internal server error',
            }));
        },
        (req, res) => {
            res.status(404).end();
        },
        (req, res) => {
            res.status(503).end();
        },
        (req, res) => {
            res.status(400).end();
        },
    ];
};


/***/ }),

/***/ "./src/logger/middlewares/index.ts":
/*!*****************************************!*\
  !*** ./src/logger/middlewares/index.ts ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const errorHandler_1 = __importDefault(__webpack_require__(/*! ./errorHandler */ "./src/logger/middlewares/errorHandler.ts"));
exports.errorHandlerMiddleware = errorHandler_1.default;
const requestHandler_1 = __importDefault(__webpack_require__(/*! ./requestHandler */ "./src/logger/middlewares/requestHandler.ts"));
exports.requestHandlerMiddleware = requestHandler_1.default;


/***/ }),

/***/ "./src/logger/middlewares/requestHandler.ts":
/*!**************************************************!*\
  !*** ./src/logger/middlewares/requestHandler.ts ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (config) => {
    const { context } = config;
    const { logger } = context;
    return (req, res, next) => {
        const { method, originalUrl, headers } = req;
        const xForwardedFor = String(req.headers['x-forwarded-for'] || '').replace(/:\d+$/, '');
        const ip = xForwardedFor || req.connection.remoteAddress;
        const ipAddress = ip === '127.0.0.1' || ip === '::1' ? 'localhost' : ip;
        logger.http.info(`${ipAddress} ${method} "${originalUrl}"`, { headers });
        return next();
    };
};


/***/ }),

/***/ "./src/logger/utils/logFormatter.ts":
/*!******************************************!*\
  !*** ./src/logger/utils/logFormatter.ts ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __webpack_require__(/*! winston */ "winston");
exports.default = winston_1.format.combine(winston_1.format.metadata(), winston_1.format.json(), winston_1.format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ssZZ' }), winston_1.format.splat(), winston_1.format.printf(info => {
    const { timestamp, level, message, metadata } = info;
    const meta = JSON.stringify(metadata) !== '{}' ? metadata : null;
    return `${timestamp} ${level}: ${message} ${meta ? JSON.stringify(meta) : ''}`;
}));


/***/ }),

/***/ "./src/logger/utils/responseFormatter.ts":
/*!***********************************************!*\
  !*** ./src/logger/utils/responseFormatter.ts ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (props) => {
    const { name, message } = props;
    return {
        errors: [
            {
                name: name || 'Unknown Error',
                message: message || name || 'Unknown Error',
            },
        ],
    };
};


/***/ }),

/***/ "./src/playground/playground.ts":
/*!**************************************!*\
  !*** ./src/playground/playground.ts ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(__dirname) {
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(__webpack_require__(/*! path */ "path"));
const index_1 = __webpack_require__(/*! ~/index */ "./src/index.ts");
// import { configureCatalogLogger } from '~/playground/schemas/catalog';
const news_1 = __importDefault(__webpack_require__(/*! ~/playground/schemas/news */ "./src/playground/schemas/news/index.ts"));
// const catalogLogger = configureCatalogLogger({
//   logPath: 'log',
// });
const logger = index_1.configureLogger({
    logPath: 'log',
});
exports.logger = logger;
const databaseConfig = {
    client: 'pg',
    connection: {
        database: 'services',
        host: 'e1g.ru',
        password: 'nonprofitproject',
        user: 'services',
    },
};
exports.databaseConfig = databaseConfig;
const jwtConfig = {
    accessTokenExpiresIn: 1800,
    algorithm: 'RS256',
    issuer: 'viaprofit-services',
    privateKey: path_1.default.resolve(__dirname, './cert/jwtRS256.key'),
    publicKey: path_1.default.resolve(__dirname, './cert/jwtRS256.key.pub'),
    refreshTokenExpiresIn: 2.592e6,
};
exports.jwtConfig = jwtConfig;
const serverConfig = {
    database: databaseConfig,
    endpoint: '/api/graphql',
    jwt: jwtConfig,
    logger,
    port: 4000,
    schemas: [news_1.default],
};
exports.serverConfig = serverConfig;
const { server } = index_1.createServer(serverConfig);
server.listen(4000);
// const server = Core.init(serverConfig);
exports.default = server;

/* WEBPACK VAR INJECTION */}.call(this, "src/playground"))

/***/ }),

/***/ "./src/playground/schemas/news/index.ts":
/*!**********************************************!*\
  !*** ./src/playground/schemas/news/index.ts ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = __webpack_require__(/*! graphql */ "graphql");
const DeveloperInfo = new graphql_1.GraphQLObjectType({
    name: 'DeveloperInfo',
    description: 'developer info',
    fields: () => ({
        name: {
            type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString),
            description: 'Company name',
        },
        website: {
            type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString),
            description: 'Website URL address',
        },
    }),
});
const schema = new graphql_1.GraphQLSchema({
    query: new graphql_1.GraphQLObjectType({
        name: 'Query',
        fields: () => ({
            version: {
                description: 'Just version',
                resolve: () => '0.1.1',
                type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString),
            },
            developer: {
                description: 'Retuen Developer info',
                type: new graphql_1.GraphQLNonNull(DeveloperInfo),
                resolve: () => ({
                    name: 'Via Profit',
                    website: 'https://via-profit.ru',
                }),
            },
        }),
    }),
    mutation: new graphql_1.GraphQLObjectType({
        name: 'Mutation',
        fields: () => ({
            setAny: {
                description: 'Set any value for test mutation',
                args: {
                    name: {
                        type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString),
                        description: 'Any value string',
                    },
                },
                resolve: () => true,
                type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLBoolean),
            },
        }),
    }),
});
exports.default = schema;


/***/ }),

/***/ "./src/server/index.ts":
/*!*****************************!*\
  !*** ./src/server/index.ts ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable import/max-dependencies */
const events_1 = __webpack_require__(/*! events */ "events");
const express_1 = __importDefault(__webpack_require__(/*! express */ "express"));
const graphql_tools_1 = __webpack_require__(/*! graphql-tools */ "graphql-tools");
const databaseManager_1 = __webpack_require__(/*! ~/databaseManager */ "./src/databaseManager/index.ts");
exports.getRoutes = (endpoint, routes) => {
    return Object.assign({ auth: `${endpoint}/auth`, playground: `${endpoint}/playground`, voyager: `${endpoint}/voyager` }, routes);
};
const createServer = (props) => {
    const server = express_1.default();
    const { schemas, endpoint, port, jwt, database, logger, routes } = props;
    const subscriptionsEndpoint = '/subscriptions';
    const schema = graphql_tools_1.mergeSchemas({ schemas });
    // generate routes
    const routesList = exports.getRoutes(endpoint, routes);
    // define knex instance
    const knex = databaseManager_1.knexProvider({ logger, database });
    // define EventEmittre instance
    const emitter = new events_1.EventEmitter();
    const context = {
        endpoint,
        jwt,
        logger,
        knex,
        emitter,
    };
    // This middleware must be defined first
    /* server.use(requestHandlerMiddleware({ context }));
    server.use(cors());
    server.use(express.json({ limit: '50mb' }));
    server.use(express.urlencoded({ extended: true, limit: '50mb' }));
  
    server.use(
      authentificatorMiddleware({
        context,
        authUrl: routesList.auth,
        allowedUrl: [routesList.playground],
      }),
    );
    server.get(routesList.playground, expressPlayground({ endpoint }));
    server.use(routesList.voyager, voyagerMiddleware({ endpointUrl: endpoint }));
    server.use(
      endpoint,
      graphqlHTTP(
        async (): Promise<OptionsData & { subscriptionsEndpoint?: string }> => ({
          context,
          graphiql: false,
          schema,
          subscriptionsEndpoint: `ws://localhost:${port || 4000}${subscriptionsEndpoint}`,
        }),
      ),
    );
  
    // this middleware most be defined first
    server.use(errorHandlerMiddleware({ context })); */
    // Create listener server by wrapping express app
    /* const webServer = createServer(app);
  
    webServer.listen(port, () => {
      logger.server.debug('Server was started', { port, endpoint, routesList });
      console.log('');
      console.log('');
      console.log(chalk.green('========= GraphQL ========='));
      console.log('');
      console.log(`${chalk.green('GraphQL server')}:     ${chalk.yellow(`http://localhost:${port}${endpoint}`)}`);
      console.log(
        `${chalk.magenta('GraphQL playground')}: ${chalk.yellow(`http://localhost:${port}${routes.playground}`)}`,
      );
      console.log(`${chalk.cyan('Auth Server')}:        ${chalk.yellow(`http://localhost:${port}${routes.auth}`)}`);
      console.log(`${chalk.blue('GraphQL voyager')}:    ${chalk.yellow(`http://localhost:${port}${routes.voyager}`)}`);
      console.log('');
  
      // Set up the WebSocket for handling GraphQL subscriptions.
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const ss = new SubscriptionServer(
        {
          execute,
          schema,
          subscribe,
        },
        {
          path: subscriptionsEndpoint,
          server: webServer,
        },
      );
    });
  
    process.on('SIGINT', code => {
      logger.server.debug(`Server was stopped (Ctrl-C key passed). Exit with code: ${code}`);
      process.exit(2);
    }); */
    return { server, context };
};
exports.createServer = createServer;
exports.default = createServer;
// TODO Tests reuired


/***/ }),

/***/ "bcryptjs":
/*!***************************!*\
  !*** external "bcryptjs" ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("bcryptjs");

/***/ }),

/***/ "chalk":
/*!************************!*\
  !*** external "chalk" ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("chalk");

/***/ }),

/***/ "device-detector-js":
/*!*************************************!*\
  !*** external "device-detector-js" ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("device-detector-js");

/***/ }),

/***/ "events":
/*!*************************!*\
  !*** external "events" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("events");

/***/ }),

/***/ "express":
/*!**************************!*\
  !*** external "express" ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("express");

/***/ }),

/***/ "express-async-handler":
/*!****************************************!*\
  !*** external "express-async-handler" ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("express-async-handler");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ }),

/***/ "graphql":
/*!**************************!*\
  !*** external "graphql" ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("graphql");

/***/ }),

/***/ "graphql-tools":
/*!********************************!*\
  !*** external "graphql-tools" ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("graphql-tools");

/***/ }),

/***/ "jsonwebtoken":
/*!*******************************!*\
  !*** external "jsonwebtoken" ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("jsonwebtoken");

/***/ }),

/***/ "knex":
/*!***********************!*\
  !*** external "knex" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("knex");

/***/ }),

/***/ "moment-timezone":
/*!**********************************!*\
  !*** external "moment-timezone" ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("moment-timezone");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),

/***/ "perf_hooks":
/*!*****************************!*\
  !*** external "perf_hooks" ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("perf_hooks");

/***/ }),

/***/ "uuid/v4":
/*!**************************!*\
  !*** external "uuid/v4" ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("uuid/v4");

/***/ }),

/***/ "winston":
/*!**************************!*\
  !*** external "winston" ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("winston");

/***/ }),

/***/ "winston-daily-rotate-file":
/*!********************************************!*\
  !*** external "winston-daily-rotate-file" ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("winston-daily-rotate-file");

/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2F1dGhlbnRpZmljYXRvci9BdXRoZW50aWZpY2F0b3IudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2F1dGhlbnRpZmljYXRvci9hdXRoZW50aWZpY2F0b3JNaWRkbGV3YXJlLnRzIiwid2VicGFjazovLy8uL3NyYy9hdXRoZW50aWZpY2F0b3IvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvcmUvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2RhdGFiYXNlTWFuYWdlci9pbmRleC50cyIsIndlYnBhY2s6Ly8vLi9zcmMvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2xvZ2dlci9lcnJvckhhbmRsZXJzL0JhZFJlcXVlc3RFcnJvci50cyIsIndlYnBhY2s6Ly8vLi9zcmMvbG9nZ2VyL2Vycm9ySGFuZGxlcnMvRm9yYmlkZGVuRXJyb3IudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2xvZ2dlci9lcnJvckhhbmRsZXJzL05vdEZvdW5kRXJyb3IudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2xvZ2dlci9lcnJvckhhbmRsZXJzL1NlcnZlckVycm9yLnRzIiwid2VicGFjazovLy8uL3NyYy9sb2dnZXIvZXJyb3JIYW5kbGVycy9pbmRleC50cyIsIndlYnBhY2s6Ly8vLi9zcmMvbG9nZ2VyL2luZGV4LnRzIiwid2VicGFjazovLy8uL3NyYy9sb2dnZXIvbG9nZ2Vycy9hdXRoLnRzIiwid2VicGFjazovLy8uL3NyYy9sb2dnZXIvbG9nZ2Vycy9odHRwLnRzIiwid2VicGFjazovLy8uL3NyYy9sb2dnZXIvbG9nZ2Vycy9pbmRleC50cyIsIndlYnBhY2s6Ly8vLi9zcmMvbG9nZ2VyL2xvZ2dlcnMvc2VydmVyLnRzIiwid2VicGFjazovLy8uL3NyYy9sb2dnZXIvbG9nZ2Vycy9zcWwudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2xvZ2dlci9taWRkbGV3YXJlcy9lcnJvckhhbmRsZXIudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2xvZ2dlci9taWRkbGV3YXJlcy9pbmRleC50cyIsIndlYnBhY2s6Ly8vLi9zcmMvbG9nZ2VyL21pZGRsZXdhcmVzL3JlcXVlc3RIYW5kbGVyLnRzIiwid2VicGFjazovLy8uL3NyYy9sb2dnZXIvdXRpbHMvbG9nRm9ybWF0dGVyLnRzIiwid2VicGFjazovLy8uL3NyYy9sb2dnZXIvdXRpbHMvcmVzcG9uc2VGb3JtYXR0ZXIudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3BsYXlncm91bmQvcGxheWdyb3VuZC50cyIsIndlYnBhY2s6Ly8vLi9zcmMvcGxheWdyb3VuZC9zY2hlbWFzL25ld3MvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3NlcnZlci9pbmRleC50cyIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJiY3J5cHRqc1wiIiwid2VicGFjazovLy9leHRlcm5hbCBcImNoYWxrXCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwiZGV2aWNlLWRldGVjdG9yLWpzXCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwiZXZlbnRzXCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwiZXhwcmVzc1wiIiwid2VicGFjazovLy9leHRlcm5hbCBcImV4cHJlc3MtYXN5bmMtaGFuZGxlclwiIiwid2VicGFjazovLy9leHRlcm5hbCBcImZzXCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwiZ3JhcGhxbFwiIiwid2VicGFjazovLy9leHRlcm5hbCBcImdyYXBocWwtdG9vbHNcIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJqc29ud2VidG9rZW5cIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJrbmV4XCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwibW9tZW50LXRpbWV6b25lXCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwicGF0aFwiIiwid2VicGFjazovLy9leHRlcm5hbCBcInBlcmZfaG9va3NcIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJ1dWlkL3Y0XCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwid2luc3RvblwiIiwid2VicGFjazovLy9leHRlcm5hbCBcIndpbnN0b24tZGFpbHktcm90YXRlLWZpbGVcIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztRQUFBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBOzs7UUFHQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0EsMENBQTBDLGdDQUFnQztRQUMxRTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLHdEQUF3RCxrQkFBa0I7UUFDMUU7UUFDQSxpREFBaUQsY0FBYztRQUMvRDs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0EseUNBQXlDLGlDQUFpQztRQUMxRSxnSEFBZ0gsbUJBQW1CLEVBQUU7UUFDckk7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSwyQkFBMkIsMEJBQTBCLEVBQUU7UUFDdkQsaUNBQWlDLGVBQWU7UUFDaEQ7UUFDQTtRQUNBOztRQUVBO1FBQ0Esc0RBQXNELCtEQUErRDs7UUFFckg7UUFDQTs7O1FBR0E7UUFDQTs7Ozs7Ozs7Ozs7OztBQ2xGYTtBQUNiO0FBQ0EsMkJBQTJCLCtEQUErRCxnQkFBZ0IsRUFBRSxFQUFFO0FBQzlHO0FBQ0EsbUNBQW1DLE1BQU0sNkJBQTZCLEVBQUUsWUFBWSxXQUFXLEVBQUU7QUFDakcsa0NBQWtDLE1BQU0saUNBQWlDLEVBQUUsWUFBWSxXQUFXLEVBQUU7QUFDcEcsK0JBQStCLHFGQUFxRjtBQUNwSDtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsNENBQTRDO0FBQzVDO0FBQ0EsOENBQThDLGNBQWM7QUFDNUQsNkJBQTZCLG1CQUFPLENBQUMsY0FBSTtBQUN6Qyx1Q0FBdUMsbUJBQU8sQ0FBQyxrQ0FBYztBQUM3RCwwQ0FBMEMsbUJBQU8sQ0FBQyx3Q0FBaUI7QUFDbkUs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QUFDVDtBQUNBOztBQUVBO0FBQ0EsdUNBQXVDLFVBQVUsR0FBRztBQUNwRDtBQUNBOztBQUVBO0FBQ0EsaURBQWlELDZCQUE2QjtBQUM5RTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQiw4QkFBOEIsUUFBUSxpQ0FBaUMsS0FBSyxFQUFFLFNBQVMsR0FBRztBQUMvRztBQUNBLFdBQVcsb0NBQW9DLElBQUksaUNBQWlDLEtBQUssRUFBRSxrQkFBa0IsR0FBRztBQUNoSDtBQUNBLHFCQUFxQiwwQkFBMEIsV0FBVyxpQ0FBaUMsS0FBSyxFQUFFLFlBQVksR0FBRztBQUNqSCxxQkFBcUIsOEJBQThCLE9BQU8saUNBQWlDLEtBQUssRUFBRSxlQUFlLEdBQUc7QUFDcEg7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0EsS0FBSzs7QUFFTDtBQUNBLHFGQUFxRixLQUFLO0FBQzFGO0FBQ0EsS0FBSyxFQUFFO0FBQ1AsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7QUNwR0EscUM7Ozs7Ozs7Ozs7O0FDQUEsa0M7Ozs7Ozs7Ozs7O0FDQUEsK0M7Ozs7Ozs7Ozs7O0FDQUEsbUM7Ozs7Ozs7Ozs7O0FDQUEsb0M7Ozs7Ozs7Ozs7O0FDQUEsa0Q7Ozs7Ozs7Ozs7O0FDQUEsK0I7Ozs7Ozs7Ozs7O0FDQUEsb0M7Ozs7Ozs7Ozs7O0FDQUEsMEM7Ozs7Ozs7Ozs7O0FDQUEseUM7Ozs7Ozs7Ozs7O0FDQUEsaUM7Ozs7Ozs7Ozs7O0FDQUEsNEM7Ozs7Ozs7Ozs7O0FDQUEsaUM7Ozs7Ozs7Ozs7O0FDQUEsdUM7Ozs7Ozs7Ozs7O0FDQUEsb0M7Ozs7Ozs7Ozs7O0FDQUEsb0M7Ozs7Ozs7Ozs7O0FDQUEsc0QiLCJmaWxlIjoicGxheWdyb3VuZC5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGdldHRlciB9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yID0gZnVuY3Rpb24oZXhwb3J0cykge1xuIFx0XHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcbiBcdFx0fVxuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuIFx0fTtcblxuIFx0Ly8gY3JlYXRlIGEgZmFrZSBuYW1lc3BhY2Ugb2JqZWN0XG4gXHQvLyBtb2RlICYgMTogdmFsdWUgaXMgYSBtb2R1bGUgaWQsIHJlcXVpcmUgaXRcbiBcdC8vIG1vZGUgJiAyOiBtZXJnZSBhbGwgcHJvcGVydGllcyBvZiB2YWx1ZSBpbnRvIHRoZSBuc1xuIFx0Ly8gbW9kZSAmIDQ6IHJldHVybiB2YWx1ZSB3aGVuIGFscmVhZHkgbnMgb2JqZWN0XG4gXHQvLyBtb2RlICYgOHwxOiBiZWhhdmUgbGlrZSByZXF1aXJlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnQgPSBmdW5jdGlvbih2YWx1ZSwgbW9kZSkge1xuIFx0XHRpZihtb2RlICYgMSkgdmFsdWUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKHZhbHVlKTtcbiBcdFx0aWYobW9kZSAmIDgpIHJldHVybiB2YWx1ZTtcbiBcdFx0aWYoKG1vZGUgJiA0KSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICYmIHZhbHVlLl9fZXNNb2R1bGUpIHJldHVybiB2YWx1ZTtcbiBcdFx0dmFyIG5zID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yKG5zKTtcbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG5zLCAnZGVmYXVsdCcsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHZhbHVlIH0pO1xuIFx0XHRpZihtb2RlICYgMiAmJiB0eXBlb2YgdmFsdWUgIT0gJ3N0cmluZycpIGZvcih2YXIga2V5IGluIHZhbHVlKSBfX3dlYnBhY2tfcmVxdWlyZV9fLmQobnMsIGtleSwgZnVuY3Rpb24oa2V5KSB7IHJldHVybiB2YWx1ZVtrZXldOyB9LmJpbmQobnVsbCwga2V5KSk7XG4gXHRcdHJldHVybiBucztcbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vc3JjL3BsYXlncm91bmQvcGxheWdyb3VuZC50c1wiKTtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9fYXdhaXRlciA9ICh0aGlzICYmIHRoaXMuX19hd2FpdGVyKSB8fCBmdW5jdGlvbiAodGhpc0FyZywgX2FyZ3VtZW50cywgUCwgZ2VuZXJhdG9yKSB7XG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XG4gICAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvci5uZXh0KHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHN0ZXAocmVzdWx0KSB7IHJlc3VsdC5kb25lID8gcmVzb2x2ZShyZXN1bHQudmFsdWUpIDogYWRvcHQocmVzdWx0LnZhbHVlKS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpOyB9XG4gICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTtcbiAgICB9KTtcbn07XG52YXIgX19pbXBvcnREZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydERlZmF1bHQpIHx8IGZ1bmN0aW9uIChtb2QpIHtcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IFwiZGVmYXVsdFwiOiBtb2QgfTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBmc18xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCJmc1wiKSk7XG5jb25zdCBqc29ud2VidG9rZW5fMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwianNvbndlYnRva2VuXCIpKTtcbmNvbnN0IG1vbWVudF90aW1lem9uZV8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCJtb21lbnQtdGltZXpvbmVcIikpO1xuY29uc3QgdjRfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwidXVpZC92NFwiKSk7XG5jb25zdCBpbmRleF8xID0gcmVxdWlyZShcIn4vaW5kZXhcIik7XG52YXIgVG9rZW5UeXBlO1xuKGZ1bmN0aW9uIChUb2tlblR5cGUpIHtcbiAgICBUb2tlblR5cGVbXCJhY2Nlc3NcIl0gPSBcImFjY2Vzc1wiO1xuICAgIFRva2VuVHlwZVtcInJlZnJlc2hcIl0gPSBcInJlZnJlc2hcIjtcbn0pKFRva2VuVHlwZSA9IGV4cG9ydHMuVG9rZW5UeXBlIHx8IChleHBvcnRzLlRva2VuVHlwZSA9IHt9KSk7XG5jbGFzcyBBdXRoZW50aWZpY2F0b3Ige1xuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHRoaXMucHJvcHMgPSBwcm9wcztcbiAgICB9XG4gICAgLyoqXG4gICAgICogRXh0cmFjdCBUb2tlbiBmcm9tIEhUVFAgcmVxdWVzdCBoZWFkZXJzXG4gICAgICogQHBhcmFtICB7UmVxdWVzdH0gcmVxdWVzdFxuICAgICAqIEByZXR1cm5zIHN0cmluZ1xuICAgICAqL1xuICAgIHN0YXRpYyBleHRyYWN0VG9rZW4ocmVxdWVzdCkge1xuICAgICAgICBjb25zdCB7IGhlYWRlcnMgfSA9IHJlcXVlc3Q7XG4gICAgICAgIGNvbnN0IHsgYXV0aG9yaXphdGlvbiB9ID0gaGVhZGVycztcbiAgICAgICAgY29uc3QgYmVhcmVyID0gU3RyaW5nKGF1dGhvcml6YXRpb24pLnNwbGl0KCcgJylbMF07XG4gICAgICAgIGNvbnN0IHRva2VuID0gU3RyaW5nKGF1dGhvcml6YXRpb24pLnNwbGl0KCcgJylbMV07XG4gICAgICAgIHJldHVybiBiZWFyZXIudG9Mb2NhbGVMb3dlckNhc2UoKSA9PT0gJ2JlYXJlcicgPyB0b2tlbiA6ICcnO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBWZXJpZnkgSldUIHRva2VuXG4gICAgICogQHBhcmFtICB7c3RyaW5nfSB0b2tlblxuICAgICAqIEBwYXJhbSAge3N0cmluZ30gcHVibGljS2V5UGF0aFxuICAgICAqIEByZXR1cm5zIElUb2tlbkluZm9bJ3BheWxvYWQnXVxuICAgICAqL1xuICAgIHN0YXRpYyB2ZXJpZnlUb2tlbih0b2tlbiwgcHVibGljS2V5UGF0aCkge1xuICAgICAgICBpZiAodG9rZW4gPT09IG51bGwpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBpbmRleF8xLlNlcnZlckVycm9yKCdUb2tlbiB2ZXJpZmljYXRpb24gZmFpbGVkLiBUaGUgdG9rZW4gbXVzdCBiZSBwcm92aWRlZCcpO1xuICAgICAgICB9XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBwdWJsaWNLZXkgPSBmc18xLmRlZmF1bHQucmVhZEZpbGVTeW5jKHB1YmxpY0tleVBhdGgpO1xuICAgICAgICAgICAgY29uc3QgcGF5bG9hZCA9IGpzb253ZWJ0b2tlbl8xLmRlZmF1bHQudmVyaWZ5KFN0cmluZyh0b2tlbiksIHB1YmxpY0tleSk7XG4gICAgICAgICAgICByZXR1cm4gcGF5bG9hZDtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgaW5kZXhfMS5TZXJ2ZXJFcnJvcignVG9rZW4gdmVyaWZpY2F0aW9uIGZhaWxlZCcsIGVycik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogUmVnaXN0ZXIgdG9rZW5zXG4gICAgICogQHBhcmFtICB7e3V1aWQ6c3RyaW5nO2RldmljZUluZm86e307fX0gZGF0YVxuICAgICAqIEByZXR1cm5zIElUb2tlbkluZm9cbiAgICAgKi9cbiAgICByZWdpc3RlclRva2VucyhkYXRhKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICBjb25zdCB7IGNvbnRleHQgfSA9IHRoaXMucHJvcHM7XG4gICAgICAgICAgICBjb25zdCB7IGtuZXgsIGxvZ2dlciB9ID0gY29udGV4dDtcbiAgICAgICAgICAgIGNvbnN0IGFjY291bnQgPSB5aWVsZCBrbmV4XG4gICAgICAgICAgICAgICAgLnNlbGVjdChbJ2lkJywgJ3JvbGVzJ10pXG4gICAgICAgICAgICAgICAgLmZyb20oJ2FjY291bnRzJylcbiAgICAgICAgICAgICAgICAud2hlcmUoe1xuICAgICAgICAgICAgICAgIGlkOiBkYXRhLnV1aWQsXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5maXJzdCgpO1xuICAgICAgICAgICAgY29uc3QgdG9rZW5zID0gdGhpcy5nZW5lcmF0ZVRva2Vucyh7XG4gICAgICAgICAgICAgICAgdXVpZDogYWNjb3VudC5pZCxcbiAgICAgICAgICAgICAgICByb2xlczogYWNjb3VudC5yb2xlcyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLy8gUmVnaXN0ZXIgYWNjZXNzIHRva2VuXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHlpZWxkIGtuZXgoJ3Rva2VucycpLmluc2VydCh7XG4gICAgICAgICAgICAgICAgICAgIGlkOiB0b2tlbnMuYWNjZXNzVG9rZW4ucGF5bG9hZC5pZCxcbiAgICAgICAgICAgICAgICAgICAgYWNjb3VudDogdG9rZW5zLmFjY2Vzc1Rva2VuLnBheWxvYWQudXVpZCxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogVG9rZW5UeXBlLmFjY2VzcyxcbiAgICAgICAgICAgICAgICAgICAgZGV2aWNlSW5mbzogZGF0YS5kZXZpY2VJbmZvLFxuICAgICAgICAgICAgICAgICAgICBleHBpcmVkQXQ6IG1vbWVudF90aW1lem9uZV8xLmRlZmF1bHQodG9rZW5zLmFjY2Vzc1Rva2VuLnBheWxvYWQuZXhwKS5mb3JtYXQoKSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgaW5kZXhfMS5TZXJ2ZXJFcnJvcignRmFpbGVkIHRvIHJlZ2lzdGVyIGFjY2VzcyB0b2tlbicsIGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyByZWdpc3RlciByZWZyZXNoIHRva2VuXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHlpZWxkIGtuZXgoJ3Rva2VucycpLmluc2VydCh7XG4gICAgICAgICAgICAgICAgICAgIGlkOiB0b2tlbnMucmVmcmVzaFRva2VuLnBheWxvYWQuaWQsXG4gICAgICAgICAgICAgICAgICAgIGFjY291bnQ6IHRva2Vucy5yZWZyZXNoVG9rZW4ucGF5bG9hZC51dWlkLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBUb2tlblR5cGUucmVmcmVzaCxcbiAgICAgICAgICAgICAgICAgICAgYXNzb2NpYXRlZDogdG9rZW5zLmFjY2Vzc1Rva2VuLnBheWxvYWQuaWQsXG4gICAgICAgICAgICAgICAgICAgIGRldmljZUluZm86IGRhdGEuZGV2aWNlSW5mbyxcbiAgICAgICAgICAgICAgICAgICAgZXhwaXJlZEF0OiBtb21lbnRfdGltZXpvbmVfMS5kZWZhdWx0KHRva2Vucy5yZWZyZXNoVG9rZW4ucGF5bG9hZC5leHApLmZvcm1hdCgpLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBpbmRleF8xLlNlcnZlckVycm9yKCdGYWlsZWQgdG8gcmVnaXN0ZXIgcmVmcmVzaCB0b2tlbicsIGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsb2dnZXIuYXV0aC5pbmZvKCdOZXcgQWNjZXNzIHRva2VuIHdhcyByZWdpc3RlcmVkJywgdG9rZW5zLmFjY2Vzc1Rva2VuLnBheWxvYWQpO1xuICAgICAgICAgICAgcmV0dXJuIHRva2VucztcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGdlbmVyYXRlVG9rZW5zKHBheWxvYWQpIHtcbiAgICAgICAgY29uc3QgeyBjb250ZXh0IH0gPSB0aGlzLnByb3BzO1xuICAgICAgICAvLyBjaGVjayBmaWxlIHRvIGFjY2VzcyBhbmQgcmVhZGFibGVcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGZzXzEuZGVmYXVsdC5hY2Nlc3NTeW5jKGNvbnRleHQuand0LnByaXZhdGVLZXkpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBpbmRleF8xLlNlcnZlckVycm9yKCdGYWlsZWQgdG8gb3BlbiBKV1QgcHJpdmF0ZUtleSBmaWxlJywgeyBlcnIgfSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcHJpdmF0S2V5ID0gZnNfMS5kZWZhdWx0LnJlYWRGaWxlU3luYyhjb250ZXh0Lmp3dC5wcml2YXRlS2V5KTtcbiAgICAgICAgY29uc3QgYWNjZXNzVG9rZW5QYXlsb2FkID0gT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHt9LCBwYXlsb2FkKSwgeyB0eXBlOiBUb2tlblR5cGUuYWNjZXNzLCBpZDogdjRfMS5kZWZhdWx0KCksIGV4cDogRGF0ZS5ub3coKSArIE51bWJlcihjb250ZXh0Lmp3dC5hY2Nlc3NUb2tlbkV4cGlyZXNJbikgKiAxMDAwLCBpc3M6IGNvbnRleHQuand0Lmlzc3VlciB9KTtcbiAgICAgICAgY29uc3QgcmVmcmVzaFRva2VuUGF5bG9hZCA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7fSwgcGF5bG9hZCksIHsgdHlwZTogVG9rZW5UeXBlLnJlZnJlc2gsIGlkOiB2NF8xLmRlZmF1bHQoKSwgYXNzb2NpYXRlZDogYWNjZXNzVG9rZW5QYXlsb2FkLmlkLCBleHA6IERhdGUubm93KCkgKyBOdW1iZXIoY29udGV4dC5qd3QucmVmcmVzaFRva2VuRXhwaXJlc0luKSAqIDEwMDAsIGlzczogY29udGV4dC5qd3QuaXNzdWVyIH0pO1xuICAgICAgICBjb25zdCBhY2Nlc3NUb2tlbiA9IGpzb253ZWJ0b2tlbl8xLmRlZmF1bHQuc2lnbihhY2Nlc3NUb2tlblBheWxvYWQsIHByaXZhdEtleSwge1xuICAgICAgICAgICAgYWxnb3JpdGhtOiBjb250ZXh0Lmp3dC5hbGdvcml0aG0sXG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCByZWZyZXNoVG9rZW4gPSBqc29ud2VidG9rZW5fMS5kZWZhdWx0LnNpZ24ocmVmcmVzaFRva2VuUGF5bG9hZCwgcHJpdmF0S2V5LCB7XG4gICAgICAgICAgICBhbGdvcml0aG06IGNvbnRleHQuand0LmFsZ29yaXRobSxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBhY2Nlc3NUb2tlbjoge1xuICAgICAgICAgICAgICAgIHRva2VuOiBhY2Nlc3NUb2tlbixcbiAgICAgICAgICAgICAgICBwYXlsb2FkOiBPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oe30sIGFjY2Vzc1Rva2VuUGF5bG9hZCksIHsgdHlwZTogVG9rZW5UeXBlLmFjY2VzcyB9KSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByZWZyZXNoVG9rZW46IHtcbiAgICAgICAgICAgICAgICB0b2tlbjogcmVmcmVzaFRva2VuLFxuICAgICAgICAgICAgICAgIHBheWxvYWQ6IE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7fSwgcmVmcmVzaFRva2VuUGF5bG9hZCksIHsgdHlwZTogVG9rZW5UeXBlLnJlZnJlc2ggfSksXG4gICAgICAgICAgICB9LFxuICAgICAgICB9O1xuICAgIH1cbiAgICByZXZva2VUb2tlbih0b2tlbklkKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICBjb25zdCB7IGNvbnRleHQgfSA9IHRoaXMucHJvcHM7XG4gICAgICAgICAgICBjb25zdCB7IGtuZXggfSA9IGNvbnRleHQ7XG4gICAgICAgICAgICB5aWVsZCBrbmV4LmRlbCgndG9rZW5zJykud2hlcmUoe1xuICAgICAgICAgICAgICAgIGlkOiB0b2tlbklkLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBjaGVja1Rva2VuRXhpc3QodG9rZW5JZCkge1xuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgY29uc3QgeyBjb250ZXh0IH0gPSB0aGlzLnByb3BzO1xuICAgICAgICAgICAgY29uc3QgeyBrbmV4IH0gPSBjb250ZXh0O1xuICAgICAgICAgICAgY29uc3QgdG9rZW5EYXRhID0geWllbGQga25leFxuICAgICAgICAgICAgICAgIC5zZWxlY3QoWydpZCddKVxuICAgICAgICAgICAgICAgIC5mcm9tKCd0b2tlbnMnKVxuICAgICAgICAgICAgICAgIC53aGVyZSh7IGlkOiB0b2tlbklkIH0pXG4gICAgICAgICAgICAgICAgLmZpcnN0KCk7XG4gICAgICAgICAgICByZXR1cm4gdG9rZW5EYXRhICE9PSBudWxsO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgZ2V0QWNjb3VudEJ5TG9naW4obG9naW4pIHtcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgIGNvbnN0IHsgY29udGV4dCB9ID0gdGhpcy5wcm9wcztcbiAgICAgICAgICAgIGNvbnN0IHsga25leCB9ID0gY29udGV4dDtcbiAgICAgICAgICAgIGNvbnN0IGFjY291bnQgPSB5aWVsZCBrbmV4XG4gICAgICAgICAgICAgICAgLnNlbGVjdChbJ2lkJywgJ3Bhc3N3b3JkJywgJ3N0YXR1cyddKVxuICAgICAgICAgICAgICAgIC5mcm9tKCdhY2NvdW50cycpXG4gICAgICAgICAgICAgICAgLndoZXJlKHtcbiAgICAgICAgICAgICAgICBsb2dpbixcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmZpcnN0KCk7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGlkOiBhY2NvdW50LmlkLFxuICAgICAgICAgICAgICAgIHBhc3N3b3JkOiBhY2NvdW50LnBhc3N3b3JkLFxuICAgICAgICAgICAgICAgIHN0YXR1czogYWNjb3VudC5zdGF0dXMsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgc3RhdGljIHNlbmRSZXNwb25zZUVycm9yKHJlc3BvbnNldHlwZSwgcmVzcCkge1xuICAgICAgICBjb25zdCBlcnJvcnMgPSBbXTtcbiAgICAgICAgc3dpdGNoIChyZXNwb25zZXR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ2FjY291bnRGb3JiaWRkZW4nOlxuICAgICAgICAgICAgICAgIGVycm9ycy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogJ0FjY291bnQgbG9ja2VkJyxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ0F1dGhvcml6YXRpb24gZXJyb3InLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnYXV0aGVudGlmaWNhdGlvblJlcXVpcmVkJzpcbiAgICAgICAgICAgICAgICBlcnJvcnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdBdXRoZW50aWNhdGlvbiBSZXF1aXJlZCcsXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICdBdXRob3JpemF0aW9uIGVycm9yJyxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2lzTm90QVJlZnJlc2hUb2tlbic6XG4gICAgICAgICAgICAgICAgZXJyb3JzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiAnVG9rZW4gZXJyb3InLFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnSXMgbm90IGEgcmVmcmVzaCB0b2tlbicsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICd0b2tlbkV4cGlyZWQnOlxuICAgICAgICAgICAgICAgIGVycm9ycy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogJ1Rva2VuIGVycm9yJyxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ1RoaXMgdG9rZW4gZXhwaXJlZCcsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICd0b2tlbldhc1Jldm9rZWQnOlxuICAgICAgICAgICAgICAgIGVycm9ycy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogJ1Rva2VuIGVycm9yJyxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ1Rva2VuIHdhcyByZXZva2VkJyxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2FjY291bnROb3RGb3VuZCc6XG4gICAgICAgICAgICBjYXNlICdpbnZhbGlkTG9naW5PclBhc3N3b3JkJzpcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgZXJyb3JzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiAnSW52YWxpZCBsb2dpbiBvciBwYXNzd29yZCcsXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICdBdXRob3JpemF0aW9uIGVycm9yJyxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzcC5zdGF0dXMoNDAxKS5qc29uKHsgZXJyb3JzIH0pO1xuICAgIH1cbn1cbmV4cG9ydHMuQXV0aGVudGlmaWNhdG9yID0gQXV0aGVudGlmaWNhdG9yO1xudmFyIFJlc3BvbnNlRXJyb3JUeXBlO1xuKGZ1bmN0aW9uIChSZXNwb25zZUVycm9yVHlwZSkge1xuICAgIFJlc3BvbnNlRXJyb3JUeXBlW1wiYXV0aGVudGlmaWNhdGlvblJlcXVpcmVkXCJdID0gXCJhdXRoZW50aWZpY2F0aW9uUmVxdWlyZWRcIjtcbiAgICBSZXNwb25zZUVycm9yVHlwZVtcImFjY291bnROb3RGb3VuZFwiXSA9IFwiYWNjb3VudE5vdEZvdW5kXCI7XG4gICAgUmVzcG9uc2VFcnJvclR5cGVbXCJhY2NvdW50Rm9yYmlkZGVuXCJdID0gXCJhY2NvdW50Rm9yYmlkZGVuXCI7XG4gICAgUmVzcG9uc2VFcnJvclR5cGVbXCJpbnZhbGlkTG9naW5PclBhc3N3b3JkXCJdID0gXCJpbnZhbGlkTG9naW5PclBhc3N3b3JkXCI7XG4gICAgUmVzcG9uc2VFcnJvclR5cGVbXCJ0b2tlbkV4cGlyZWRcIl0gPSBcInRva2VuRXhwaXJlZFwiO1xuICAgIFJlc3BvbnNlRXJyb3JUeXBlW1wiaXNOb3RBUmVmcmVzaFRva2VuXCJdID0gXCJpc05vdEFSZWZyZXNoVG9rZW5cIjtcbiAgICBSZXNwb25zZUVycm9yVHlwZVtcInRva2VuV2FzUmV2b2tlZFwiXSA9IFwidG9rZW5XYXNSZXZva2VkXCI7XG59KShSZXNwb25zZUVycm9yVHlwZSA9IGV4cG9ydHMuUmVzcG9uc2VFcnJvclR5cGUgfHwgKGV4cG9ydHMuUmVzcG9uc2VFcnJvclR5cGUgPSB7fSkpO1xudmFyIEFjY291bnRTdGF0dXM7XG4oZnVuY3Rpb24gKEFjY291bnRTdGF0dXMpIHtcbiAgICBBY2NvdW50U3RhdHVzW1wiYWxsb3dlZFwiXSA9IFwiYWxsb3dlZFwiO1xuICAgIEFjY291bnRTdGF0dXNbXCJmb3JiaWRkZW5cIl0gPSBcImZvcmJpZGRlblwiO1xufSkoQWNjb3VudFN0YXR1cyA9IGV4cG9ydHMuQWNjb3VudFN0YXR1cyB8fCAoZXhwb3J0cy5BY2NvdW50U3RhdHVzID0ge30pKTtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9fYXdhaXRlciA9ICh0aGlzICYmIHRoaXMuX19hd2FpdGVyKSB8fCBmdW5jdGlvbiAodGhpc0FyZywgX2FyZ3VtZW50cywgUCwgZ2VuZXJhdG9yKSB7XG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XG4gICAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvci5uZXh0KHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHN0ZXAocmVzdWx0KSB7IHJlc3VsdC5kb25lID8gcmVzb2x2ZShyZXN1bHQudmFsdWUpIDogYWRvcHQocmVzdWx0LnZhbHVlKS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpOyB9XG4gICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTtcbiAgICB9KTtcbn07XG52YXIgX19pbXBvcnREZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydERlZmF1bHQpIHx8IGZ1bmN0aW9uIChtb2QpIHtcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IFwiZGVmYXVsdFwiOiBtb2QgfTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBiY3J5cHRqc18xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCJiY3J5cHRqc1wiKSk7XG5jb25zdCBkZXZpY2VfZGV0ZWN0b3JfanNfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiZGV2aWNlLWRldGVjdG9yLWpzXCIpKTtcbmNvbnN0IGV4cHJlc3NfMSA9IHJlcXVpcmUoXCJleHByZXNzXCIpO1xuY29uc3QgZXhwcmVzc19hc3luY19oYW5kbGVyXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcImV4cHJlc3MtYXN5bmMtaGFuZGxlclwiKSk7XG5jb25zdCBBdXRoZW50aWZpY2F0b3JfMSA9IHJlcXVpcmUoXCIuL0F1dGhlbnRpZmljYXRvclwiKTtcbmNvbnN0IGF1dGhlbnRpZmljYXRvck1pZGRsZXdhcmUgPSAoY29uZmlnKSA9PiB7XG4gICAgY29uc3QgeyBjb250ZXh0LCBhdXRoVXJsLCBhbGxvd2VkVXJsIH0gPSBjb25maWc7XG4gICAgY29uc3QgeyBlbmRwb2ludCB9ID0gY29uZmlnLmNvbnRleHQ7XG4gICAgY29uc3QgeyBwdWJsaWNLZXkgfSA9IGNvbmZpZy5jb250ZXh0Lmp3dDtcbiAgICBjb25zdCB7IGxvZ2dlciB9ID0gY29udGV4dDtcbiAgICBjb25zdCBhdXRoZW50aWZpY2F0b3IgPSBuZXcgQXV0aGVudGlmaWNhdG9yXzEuQXV0aGVudGlmaWNhdG9yKHsgY29udGV4dCB9KTtcbiAgICBjb25zdCByb3V0ZXIgPSBleHByZXNzXzEuUm91dGVyKCk7XG4gICAgcm91dGVyLnBvc3QoYCR7YXV0aFVybH0vYWNjZXNzLXRva2VuYCwgZXhwcmVzc19hc3luY19oYW5kbGVyXzEuZGVmYXVsdCgocmVxLCByZXMpID0+IF9fYXdhaXRlcih2b2lkIDAsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICBjb25zdCB7IGJvZHksIGhlYWRlcnMgfSA9IHJlcTtcbiAgICAgICAgY29uc3QgeyBsb2dpbiwgcGFzc3dvcmQgfSA9IGJvZHk7XG4gICAgICAgIGNvbnN0IGRldmljZURldGVjdG9yID0gbmV3IGRldmljZV9kZXRlY3Rvcl9qc18xLmRlZmF1bHQoKTtcbiAgICAgICAgY29uc3QgZGV2aWNlSW5mbyA9IGRldmljZURldGVjdG9yLnBhcnNlKGhlYWRlcnNbJ3VzZXItYWdlbnQnXSk7XG4gICAgICAgIGxvZ2dlci5hdXRoLmluZm8oJ0FjY2VzcyB0b2tlbiByZXF1ZXN0JywgeyBsb2dpbiB9KTtcbiAgICAgICAgY29uc3QgYWNjb3VudCA9IHlpZWxkIGF1dGhlbnRpZmljYXRvci5nZXRBY2NvdW50QnlMb2dpbihsb2dpbik7XG4gICAgICAgIC8vIGFjY291bnQgbm90IGZvdW5kXG4gICAgICAgIGlmICghYWNjb3VudCB8fCAhYmNyeXB0anNfMS5kZWZhdWx0LmNvbXBhcmVTeW5jKHBhc3N3b3JkLCBhY2NvdW50LnBhc3N3b3JkKSkge1xuICAgICAgICAgICAgbG9nZ2VyLmF1dGguZXJyb3IoJ0FjY291bnQgbm90IGZvdW5kJywgeyBsb2dpbiB9KTtcbiAgICAgICAgICAgIHJldHVybiBBdXRoZW50aWZpY2F0b3JfMS5BdXRoZW50aWZpY2F0b3Iuc2VuZFJlc3BvbnNlRXJyb3IoQXV0aGVudGlmaWNhdG9yXzEuUmVzcG9uc2VFcnJvclR5cGUuYWNjb3VudE5vdEZvdW5kLCByZXMpO1xuICAgICAgICB9XG4gICAgICAgIC8vIGFjY291bnQgbG9ja2VkXG4gICAgICAgIGlmIChhY2NvdW50LnN0YXR1cyA9PT0gQXV0aGVudGlmaWNhdG9yXzEuQWNjb3VudFN0YXR1cy5mb3JiaWRkZW4gJiYgYmNyeXB0anNfMS5kZWZhdWx0LmNvbXBhcmVTeW5jKHBhc3N3b3JkLCBhY2NvdW50LnBhc3N3b3JkKSkge1xuICAgICAgICAgICAgbG9nZ2VyLmF1dGguaW5mbygnQXV0aGVudGlmaWNhdGlvbiBmb3JiaWRkZW4nLCB7IGxvZ2luIH0pO1xuICAgICAgICAgICAgcmV0dXJuIEF1dGhlbnRpZmljYXRvcl8xLkF1dGhlbnRpZmljYXRvci5zZW5kUmVzcG9uc2VFcnJvcihBdXRoZW50aWZpY2F0b3JfMS5SZXNwb25zZUVycm9yVHlwZS5hY2NvdW50Rm9yYmlkZGVuLCByZXMpO1xuICAgICAgICB9XG4gICAgICAgIC8vIHN1Y2Nlc3NcbiAgICAgICAgaWYgKGFjY291bnQuc3RhdHVzID09PSBBdXRoZW50aWZpY2F0b3JfMS5BY2NvdW50U3RhdHVzLmFsbG93ZWQgJiYgYmNyeXB0anNfMS5kZWZhdWx0LmNvbXBhcmVTeW5jKHBhc3N3b3JkLCBhY2NvdW50LnBhc3N3b3JkKSkge1xuICAgICAgICAgICAgY29uc3QgdG9rZW5zID0geWllbGQgYXV0aGVudGlmaWNhdG9yLnJlZ2lzdGVyVG9rZW5zKHtcbiAgICAgICAgICAgICAgICB1dWlkOiBhY2NvdW50LmlkLFxuICAgICAgICAgICAgICAgIGRldmljZUluZm8sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDIwMCkuanNvbih7XG4gICAgICAgICAgICAgICAgYWNjZXNzVG9rZW46IHRva2Vucy5hY2Nlc3NUb2tlbi50b2tlbixcbiAgICAgICAgICAgICAgICB0b2tlblR5cGU6ICdiZWFyZXInLFxuICAgICAgICAgICAgICAgIGV4cGlyZXNJbjogY29uZmlnLmNvbnRleHQuand0LmFjY2Vzc1Rva2VuRXhwaXJlc0luLFxuICAgICAgICAgICAgICAgIHJlZnJlc2hUb2tlbjogdG9rZW5zLnJlZnJlc2hUb2tlbi50b2tlbixcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBBdXRoZW50aWZpY2F0b3JfMS5BdXRoZW50aWZpY2F0b3Iuc2VuZFJlc3BvbnNlRXJyb3IoQXV0aGVudGlmaWNhdG9yXzEuUmVzcG9uc2VFcnJvclR5cGUuYWNjb3VudE5vdEZvdW5kLCByZXMpO1xuICAgIH0pKSk7XG4gICAgcm91dGVyLnBvc3QoYCR7YXV0aFVybH0vcmVmcmVzaC10b2tlbmAsIGV4cHJlc3NfYXN5bmNfaGFuZGxlcl8xLmRlZmF1bHQoKHJlcSwgcmVzKSA9PiBfX2F3YWl0ZXIodm9pZCAwLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgY29uc3QgeyBib2R5LCBoZWFkZXJzIH0gPSByZXE7XG4gICAgICAgIGNvbnN0IHsgdG9rZW4gfSA9IGJvZHk7XG4gICAgICAgIC8vIHRyeSB0byB2ZXJpZnkgcmVmcmVzaCB0b2tlblxuICAgICAgICBjb25zdCB0b2tlblBheWxvYWQgPSBBdXRoZW50aWZpY2F0b3JfMS5BdXRoZW50aWZpY2F0b3IudmVyaWZ5VG9rZW4odG9rZW4sIGNvbnRleHQuand0LnB1YmxpY0tleSk7XG4gICAgICAgIGlmICh0b2tlblBheWxvYWQudHlwZSAhPT0gQXV0aGVudGlmaWNhdG9yXzEuVG9rZW5UeXBlLnJlZnJlc2gpIHtcbiAgICAgICAgICAgIGxvZ2dlci5hdXRoLmluZm8oJ1RyaWVkIHRvIHJlZnJlc2ggdG9rZW4gYnkgYWNjZXNzIHRva2VuLiBSZWplY3RlZCcsIHsgcGF5bG9hZDogdG9rZW5QYXlsb2FkIH0pO1xuICAgICAgICAgICAgcmV0dXJuIEF1dGhlbnRpZmljYXRvcl8xLkF1dGhlbnRpZmljYXRvci5zZW5kUmVzcG9uc2VFcnJvcihBdXRoZW50aWZpY2F0b3JfMS5SZXNwb25zZUVycm9yVHlwZS5pc05vdEFSZWZyZXNoVG9rZW4sIHJlcyk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gY2hlY2sgdG8gdG9rZW4gZXhpc3RcbiAgICAgICAgaWYgKCEoeWllbGQgYXV0aGVudGlmaWNhdG9yLmNoZWNrVG9rZW5FeGlzdCh0b2tlblBheWxvYWQuaWQpKSkge1xuICAgICAgICAgICAgbG9nZ2VyLmF1dGguaW5mbygnVHJpZWQgdG8gcmVmcmVzaCB0b2tlbiBieSByZXZva2VkIHJlZnJlc2ggdG9rZW4uIFJlamVjdGVkJywgeyBwYXlsb2FkOiB0b2tlblBheWxvYWQgfSk7XG4gICAgICAgICAgICByZXR1cm4gQXV0aGVudGlmaWNhdG9yXzEuQXV0aGVudGlmaWNhdG9yLnNlbmRSZXNwb25zZUVycm9yKEF1dGhlbnRpZmljYXRvcl8xLlJlc3BvbnNlRXJyb3JUeXBlLnRva2VuV2FzUmV2b2tlZCwgcmVzKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBkZXZpY2VEZXRlY3RvciA9IG5ldyBkZXZpY2VfZGV0ZWN0b3JfanNfMS5kZWZhdWx0KCk7XG4gICAgICAgIGNvbnN0IGRldmljZUluZm8gPSBkZXZpY2VEZXRlY3Rvci5wYXJzZShoZWFkZXJzWyd1c2VyLWFnZW50J10pO1xuICAgICAgICAvLyByZXZva2Ugb2xkIGFjY2VzcyB0b2tlbiBvZiB0aGlzIHJlZnJlc2hcbiAgICAgICAgeWllbGQgYXV0aGVudGlmaWNhdG9yLnJldm9rZVRva2VuKHRva2VuUGF5bG9hZC5hc3NvY2lhdGVkKTtcbiAgICAgICAgLy8gcmV2b2tlIG9sZCByZWZyZXNoIHRva2VuXG4gICAgICAgIHlpZWxkIGF1dGhlbnRpZmljYXRvci5yZXZva2VUb2tlbih0b2tlblBheWxvYWQuaWQpO1xuICAgICAgICAvLyBjcmVhdGUgbmV3IHRva2Vuc1xuICAgICAgICBjb25zdCB0b2tlbnMgPSB5aWVsZCBhdXRoZW50aWZpY2F0b3IucmVnaXN0ZXJUb2tlbnMoe1xuICAgICAgICAgICAgdXVpZDogdG9rZW5QYXlsb2FkLnV1aWQsXG4gICAgICAgICAgICBkZXZpY2VJbmZvLFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoMjAwKS5qc29uKHtcbiAgICAgICAgICAgIGFjY2Vzc1Rva2VuOiB0b2tlbnMuYWNjZXNzVG9rZW4udG9rZW4sXG4gICAgICAgICAgICB0b2tlblR5cGU6ICdiZWFyZXInLFxuICAgICAgICAgICAgZXhwaXJlc0luOiBjb25maWcuY29udGV4dC5qd3QuYWNjZXNzVG9rZW5FeHBpcmVzSW4sXG4gICAgICAgICAgICByZWZyZXNoVG9rZW46IHRva2Vucy5yZWZyZXNoVG9rZW4udG9rZW4sXG4gICAgICAgIH0pO1xuICAgIH0pKSk7XG4gICAgcm91dGVyLnVzZShlbmRwb2ludCwgZXhwcmVzc19hc3luY19oYW5kbGVyXzEuZGVmYXVsdCgocmVxLCByZXMsIG5leHQpID0+IF9fYXdhaXRlcih2b2lkIDAsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICBpZiAoYWxsb3dlZFVybC5pbmNsdWRlcyhyZXEub3JpZ2luYWxVcmwpKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV4dCgpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHRva2VuID0gQXV0aGVudGlmaWNhdG9yXzEuQXV0aGVudGlmaWNhdG9yLmV4dHJhY3RUb2tlbihyZXEpO1xuICAgICAgICBBdXRoZW50aWZpY2F0b3JfMS5BdXRoZW50aWZpY2F0b3IudmVyaWZ5VG9rZW4odG9rZW4sIHB1YmxpY0tleSk7XG4gICAgICAgIHJldHVybiBBdXRoZW50aWZpY2F0b3JfMS5BdXRoZW50aWZpY2F0b3Iuc2VuZFJlc3BvbnNlRXJyb3IoQXV0aGVudGlmaWNhdG9yXzEuUmVzcG9uc2VFcnJvclR5cGUuYXV0aGVudGlmaWNhdGlvblJlcXVpcmVkLCByZXMpO1xuICAgIH0pKSk7XG4gICAgcmV0dXJuIHJvdXRlcjtcbn07XG5leHBvcnRzLmF1dGhlbnRpZmljYXRvck1pZGRsZXdhcmUgPSBhdXRoZW50aWZpY2F0b3JNaWRkbGV3YXJlO1xuZXhwb3J0cy5kZWZhdWx0ID0gYXV0aGVudGlmaWNhdG9yTWlkZGxld2FyZTtcbiIsIlwidXNlIHN0cmljdFwiO1xuZnVuY3Rpb24gX19leHBvcnQobSkge1xuICAgIGZvciAodmFyIHAgaW4gbSkgaWYgKCFleHBvcnRzLmhhc093blByb3BlcnR5KHApKSBleHBvcnRzW3BdID0gbVtwXTtcbn1cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbl9fZXhwb3J0KHJlcXVpcmUoXCIuL0F1dGhlbnRpZmljYXRvclwiKSk7XG5fX2V4cG9ydChyZXF1aXJlKFwiLi9hdXRoZW50aWZpY2F0b3JNaWRkbGV3YXJlXCIpKTtcbi8vIFRPRE8gVGVzdHMgcmV1aXJlZFxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19pbXBvcnREZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydERlZmF1bHQpIHx8IGZ1bmN0aW9uIChtb2QpIHtcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IFwiZGVmYXVsdFwiOiBtb2QgfTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG4vLyBpbXBvcnQgeyBjcmVhdGVTZXJ2ZXIgfSBmcm9tICdodHRwJztcbmNvbnN0IGNoYWxrXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcImNoYWxrXCIpKTtcbi8vIGltcG9ydCB7IFN1YnNjcmlwdGlvblNlcnZlciB9IGZyb20gJ3N1YnNjcmlwdGlvbnMtdHJhbnNwb3J0LXdzJztcbmNvbnN0IGxvZ2dlcl8xID0gcmVxdWlyZShcIn4vbG9nZ2VyXCIpO1xuY29uc3Qgc2VydmVyXzEgPSByZXF1aXJlKFwifi9zZXJ2ZXJcIik7XG5jbGFzcyBDb3JlIHtcbiAgICBzdGF0aWMgaW5pdChjb25maWcpIHtcbiAgICAgICAgY29uc3QgeyBwb3J0LCBlbmRwb2ludCwgcm91dGVzLCBsb2dnZXIgfSA9IGNvbmZpZztcbiAgICAgICAgY29uc3Qgcm91dGVzTGlzdCA9IHNlcnZlcl8xLmdldFJvdXRlcyhlbmRwb2ludCwgcm91dGVzKTtcbiAgICAgICAgLy8gY2hlY2sgY29ubmVjdGlvblxuICAgICAgICAvLyBDcmVhdGUgbGlzdGVuZXIgc2VydmVyIGJ5IHdyYXBwaW5nIGV4cHJlc3MgYXBwXG4gICAgICAgIGNvbnN0IHsgc2VydmVyLCBjb250ZXh0IH0gPSBzZXJ2ZXJfMS5jcmVhdGVTZXJ2ZXIoY29uZmlnKTtcbiAgICAgICAgY29uc3QgeyBrbmV4IH0gPSBjb250ZXh0O1xuICAgICAgICBrbmV4XG4gICAgICAgICAgICAucmF3KCdTRUxFQ1QgMSsxIEFTIHJlc3VsdCcpXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICBsb2dnZXIuc2VydmVyLmRlYnVnKCdUZXN0IHRoZSBjb25uZWN0aW9uIGJ5IHRyeWluZyB0byBhdXRoZW50aWNhdGUgaXMgT0snKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9KVxuICAgICAgICAgICAgLmNhdGNoKGVyciA9PiB7XG4gICAgICAgICAgICBsb2dnZXIuc2VydmVyLmVycm9yKGVyci5uYW1lLCBlcnIpO1xuICAgICAgICAgICAgdGhyb3cgbmV3IGxvZ2dlcl8xLlNlcnZlckVycm9yKGVycik7XG4gICAgICAgIH0pO1xuICAgICAgICBzZXJ2ZXIubGlzdGVuKHBvcnQsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCcnKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCcnKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGNoYWxrXzEuZGVmYXVsdC5ncmVlbignPT09PT09PT09IEdyYXBoUUwgPT09PT09PT09JykpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJycpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYCR7Y2hhbGtfMS5kZWZhdWx0LmdyZWVuKCdHcmFwaFFMIHNlcnZlcicpfTogICAgICR7Y2hhbGtfMS5kZWZhdWx0LnllbGxvdyhgaHR0cDovL2xvY2FsaG9zdDoke3BvcnR9JHtlbmRwb2ludH1gKX1gKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2NoYWxrXzEuZGVmYXVsdC5tYWdlbnRhKCdHcmFwaFFMIHBsYXlncm91bmQnKX06ICR7Y2hhbGtfMS5kZWZhdWx0LnllbGxvdyhgaHR0cDovL2xvY2FsaG9zdDoke3BvcnR9JHtyb3V0ZXNMaXN0LnBsYXlncm91bmR9YCl9YCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtjaGFsa18xLmRlZmF1bHQuY3lhbignQXV0aCBTZXJ2ZXInKX06ICAgICAgICAke2NoYWxrXzEuZGVmYXVsdC55ZWxsb3coYGh0dHA6Ly9sb2NhbGhvc3Q6JHtwb3J0fSR7cm91dGVzTGlzdC5hdXRofWApfWApO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYCR7Y2hhbGtfMS5kZWZhdWx0LmJsdWUoJ0dyYXBoUUwgdm95YWdlcicpfTogICAgJHtjaGFsa18xLmRlZmF1bHQueWVsbG93KGBodHRwOi8vbG9jYWxob3N0OiR7cG9ydH0ke3JvdXRlc0xpc3Qudm95YWdlcn1gKX1gKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCcnKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBzZXJ2ZXI7XG4gICAgICAgIC8vIGNvbnN0IHdlYlNlcnZlciA9IGNyZWF0ZVNlcnZlcihzKTtcbiAgICAgICAgLy8gd2ViU2VydmVyLmxpc3Rlbihwb3J0LCAoKSA9PiB7XG4gICAgICAgIC8vICAgLy8gbG9nZ2VyLnNlcnZlci5kZWJ1ZygnU2VydmVyIHdhcyBzdGFydGVkJywgeyBwb3J0LCBlbmRwb2ludCwgcm91dGVzIH0pO1xuICAgICAgICAvLyAgIGNvbnNvbGUubG9nKCcnKTtcbiAgICAgICAgLy8gICBjb25zb2xlLmxvZygnJyk7XG4gICAgICAgIC8vICAgY29uc29sZS5sb2coY2hhbGsuZ3JlZW4oJz09PT09PT09PSBHcmFwaFFMID09PT09PT09PScpKTtcbiAgICAgICAgLy8gICBjb25zb2xlLmxvZygnJyk7XG4gICAgICAgIC8vICAgY29uc29sZS5sb2coYCR7Y2hhbGsuZ3JlZW4oJ0dyYXBoUUwgc2VydmVyJyl9OiAgICAgJHtjaGFsay55ZWxsb3coYGh0dHA6Ly9sb2NhbGhvc3Q6JHtwb3J0fSR7ZW5kcG9pbnR9YCl9YCk7XG4gICAgICAgIC8vICAgY29uc29sZS5sb2coXG4gICAgICAgIC8vICAgICBgJHtjaGFsay5tYWdlbnRhKCdHcmFwaFFMIHBsYXlncm91bmQnKX06ICR7Y2hhbGsueWVsbG93KGBodHRwOi8vbG9jYWxob3N0OiR7cG9ydH0ke3JvdXRlcy5wbGF5Z3JvdW5kfWApfWAsXG4gICAgICAgIC8vICAgKTtcbiAgICAgICAgLy8gICBjb25zb2xlLmxvZyhgJHtjaGFsay5jeWFuKCdBdXRoIFNlcnZlcicpfTogICAgICAgICR7Y2hhbGsueWVsbG93KGBodHRwOi8vbG9jYWxob3N0OiR7cG9ydH0ke3JvdXRlcy5hdXRofWApfWApO1xuICAgICAgICAvLyAgIGNvbnNvbGUubG9nKGAke2NoYWxrLmJsdWUoJ0dyYXBoUUwgdm95YWdlcicpfTogICAgJHtjaGFsay55ZWxsb3coYGh0dHA6Ly9sb2NhbGhvc3Q6JHtwb3J0fSR7cm91dGVzLnZveWFnZXJ9YCl9YCk7XG4gICAgICAgIC8vICAgY29uc29sZS5sb2coJycpO1xuICAgICAgICAvLyBTZXQgdXAgdGhlIFdlYlNvY2tldCBmb3IgaGFuZGxpbmcgR3JhcGhRTCBzdWJzY3JpcHRpb25zLlxuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG4gICAgICAgIC8vIGNvbnN0IHNzID0gbmV3IFN1YnNjcmlwdGlvblNlcnZlcihcbiAgICAgICAgLy8gICB7XG4gICAgICAgIC8vICAgICBleGVjdXRlLFxuICAgICAgICAvLyAgICAgc2NoZW1hLFxuICAgICAgICAvLyAgICAgc3Vic2NyaWJlLFxuICAgICAgICAvLyAgIH0sXG4gICAgICAgIC8vICAge1xuICAgICAgICAvLyAgICAgcGF0aDogc3Vic2NyaXB0aW9uc0VuZHBvaW50LFxuICAgICAgICAvLyAgICAgc2VydmVyOiB3ZWJTZXJ2ZXIsXG4gICAgICAgIC8vICAgfSxcbiAgICAgICAgLy8gKTtcbiAgICAgICAgLy8gfSk7XG4gICAgICAgIC8vIHByb2Nlc3Mub24oJ1NJR0lOVCcsIGNvZGUgPT4ge1xuICAgICAgICAvLyAgIGxvZ2dlci5zZXJ2ZXIuZGVidWcoYFNlcnZlciB3YXMgc3RvcHBlZCAoQ3RybC1DIGtleSBwYXNzZWQpLiBFeGl0IHdpdGggY29kZTogJHtjb2RlfWApO1xuICAgICAgICAvLyAgIHByb2Nlc3MuZXhpdCgyKTtcbiAgICAgICAgLy8gfSk7XG4gICAgfVxufVxuZXhwb3J0cy5Db3JlID0gQ29yZTtcbmV4cG9ydHMuZGVmYXVsdCA9IENvcmU7XG4vLyBjb25zdCB3ZWJTZXJ2ZXIgPSBzZXJ2ZXIoY29uZmlnOiBJSW5pdFByb3BzKTtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9faW1wb3J0RGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnREZWZhdWx0KSB8fCBmdW5jdGlvbiAobW9kKSB7XG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBcImRlZmF1bHRcIjogbW9kIH07XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgcGVyZl9ob29rc18xID0gcmVxdWlyZShcInBlcmZfaG9va3NcIik7XG5jb25zdCBrbmV4XzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcImtuZXhcIikpO1xuY29uc3Qga25leFByb3ZpZGVyID0gKGNvbmZpZykgPT4ge1xuICAgIGNvbnN0IHsgZGF0YWJhc2UsIGxvZ2dlciB9ID0gY29uZmlnO1xuICAgIGNvbnN0IHRpbWVzID0ge307XG4gICAgbGV0IGNvdW50ID0gMDtcbiAgICBjb25zdCBpbnN0YW5jZSA9IGtuZXhfMS5kZWZhdWx0KGRhdGFiYXNlKTtcbiAgICBpbnN0YW5jZVxuICAgICAgICAub24oJ3F1ZXJ5JywgcXVlcnkgPT4ge1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZXJzY29yZS1kYW5nbGVcbiAgICAgICAgY29uc3QgdWlkID0gcXVlcnkuX19rbmV4UXVlcnlVaWQ7XG4gICAgICAgIHRpbWVzW3VpZF0gPSB7XG4gICAgICAgICAgICBwb3NpdGlvbjogY291bnQsXG4gICAgICAgICAgICBxdWVyeSxcbiAgICAgICAgICAgIHN0YXJ0VGltZTogcGVyZl9ob29rc18xLnBlcmZvcm1hbmNlLm5vdygpLFxuICAgICAgICAgICAgZmluaXNoZWQ6IGZhbHNlLFxuICAgICAgICB9O1xuICAgICAgICBjb3VudCArPSAxO1xuICAgIH0pXG4gICAgICAgIC5vbigncXVlcnktcmVzcG9uc2UnLCAocmVzcG9uc2UsIHF1ZXJ5KSA9PiB7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlcnNjb3JlLWRhbmdsZVxuICAgICAgICBjb25zdCB1aWQgPSBxdWVyeS5fX2tuZXhRdWVyeVVpZDtcbiAgICAgICAgdGltZXNbdWlkXS5lbmRUaW1lID0gcGVyZl9ob29rc18xLnBlcmZvcm1hbmNlLm5vdygpO1xuICAgICAgICB0aW1lc1t1aWRdLmZpbmlzaGVkID0gdHJ1ZTtcbiAgICAgICAgbG9nZ2VyLnNxbC5kZWJ1ZyhxdWVyeS5zcWwsIHRpbWVzW3VpZF0pO1xuICAgIH0pXG4gICAgICAgIC5vbigncXVlcnktZXJyb3InLCAoZXJyLCBxdWVyeSkgPT4ge1xuICAgICAgICBsb2dnZXIuc3FsLmVycm9yKHF1ZXJ5LnNxbCwgeyBlcnIgfSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGluc3RhbmNlO1xufTtcbmV4cG9ydHMua25leFByb3ZpZGVyID0ga25leFByb3ZpZGVyO1xuZXhwb3J0cy5kZWZhdWx0ID0ga25leFByb3ZpZGVyO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5mdW5jdGlvbiBfX2V4cG9ydChtKSB7XG4gICAgZm9yICh2YXIgcCBpbiBtKSBpZiAoIWV4cG9ydHMuaGFzT3duUHJvcGVydHkocCkpIGV4cG9ydHNbcF0gPSBtW3BdO1xufVxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuX19leHBvcnQocmVxdWlyZShcIi4vc2VydmVyXCIpKTtcbl9fZXhwb3J0KHJlcXVpcmUoXCIuL2F1dGhlbnRpZmljYXRvclwiKSk7XG5fX2V4cG9ydChyZXF1aXJlKFwiLi9kYXRhYmFzZU1hbmFnZXJcIikpO1xuX19leHBvcnQocmVxdWlyZShcIi4vbG9nZ2VyXCIpKTtcbl9fZXhwb3J0KHJlcXVpcmUoXCIuL2NvcmVcIikpO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jbGFzcyBCYWRSZXF1ZXN0RXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gICAgY29uc3RydWN0b3IobWVzc2FnZSwgbWV0YURhdGEpIHtcbiAgICAgICAgc3VwZXIobWVzc2FnZSk7XG4gICAgICAgIHRoaXMubmFtZSA9ICdCYWRSZXF1ZXN0RXJyb3InO1xuICAgICAgICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xuICAgICAgICB0aGlzLm1ldGFEYXRhID0gbWV0YURhdGE7XG4gICAgICAgIHRoaXMuc3RhdHVzID0gNDAwO1xuICAgICAgICAvLyBTZXQgdGhlIHByb3RvdHlwZSBleHBsaWNpdGx5LlxuICAgICAgICBPYmplY3Quc2V0UHJvdG90eXBlT2YodGhpcywgQmFkUmVxdWVzdEVycm9yLnByb3RvdHlwZSk7XG4gICAgfVxufVxuZXhwb3J0cy5kZWZhdWx0ID0gQmFkUmVxdWVzdEVycm9yO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jbGFzcyBGb3JiaWRkZW5FcnJvciBleHRlbmRzIEVycm9yIHtcbiAgICBjb25zdHJ1Y3RvcihtZXNzYWdlLCBtZXRhRGF0YSkge1xuICAgICAgICBzdXBlcihtZXNzYWdlKTtcbiAgICAgICAgdGhpcy5uYW1lID0gJ0ZvcmJpZGRlbkVycm9yJztcbiAgICAgICAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbiAgICAgICAgdGhpcy5tZXRhRGF0YSA9IG1ldGFEYXRhO1xuICAgICAgICB0aGlzLnN0YXR1cyA9IDUwMztcbiAgICAgICAgLy8gU2V0IHRoZSBwcm90b3R5cGUgZXhwbGljaXRseS5cbiAgICAgICAgT2JqZWN0LnNldFByb3RvdHlwZU9mKHRoaXMsIEZvcmJpZGRlbkVycm9yLnByb3RvdHlwZSk7XG4gICAgfVxufVxuZXhwb3J0cy5kZWZhdWx0ID0gRm9yYmlkZGVuRXJyb3I7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNsYXNzIE5vdEZvdW5kRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gICAgY29uc3RydWN0b3IobWVzc2FnZSwgbWV0YURhdGEpIHtcbiAgICAgICAgc3VwZXIobWVzc2FnZSk7XG4gICAgICAgIHRoaXMubmFtZSA9ICdOb3RGb3VuZEVycm9yJztcbiAgICAgICAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbiAgICAgICAgdGhpcy5tZXRhRGF0YSA9IG1ldGFEYXRhO1xuICAgICAgICB0aGlzLnN0YXR1cyA9IDQwNDtcbiAgICAgICAgLy8gU2V0IHRoZSBwcm90b3R5cGUgZXhwbGljaXRseS5cbiAgICAgICAgT2JqZWN0LnNldFByb3RvdHlwZU9mKHRoaXMsIE5vdEZvdW5kRXJyb3IucHJvdG90eXBlKTtcbiAgICB9XG59XG5leHBvcnRzLmRlZmF1bHQgPSBOb3RGb3VuZEVycm9yO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jbGFzcyBTZXJ2ZXJFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgICBjb25zdHJ1Y3RvcihtZXNzYWdlLCBtZXRhRGF0YSkge1xuICAgICAgICBzdXBlcihtZXNzYWdlKTtcbiAgICAgICAgdGhpcy5uYW1lID0gJ1NlcnZlckVycm9yJztcbiAgICAgICAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbiAgICAgICAgdGhpcy5tZXRhRGF0YSA9IG1ldGFEYXRhO1xuICAgICAgICB0aGlzLnN0YXR1cyA9IDUwMDtcbiAgICAgICAgLy8gU2V0IHRoZSBwcm90b3R5cGUgZXhwbGljaXRseS5cbiAgICAgICAgT2JqZWN0LnNldFByb3RvdHlwZU9mKHRoaXMsIFNlcnZlckVycm9yLnByb3RvdHlwZSk7XG4gICAgfVxufVxuZXhwb3J0cy5kZWZhdWx0ID0gU2VydmVyRXJyb3I7XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2ltcG9ydERlZmF1bHQgPSAodGhpcyAmJiB0aGlzLl9faW1wb3J0RGVmYXVsdCkgfHwgZnVuY3Rpb24gKG1vZCkge1xuICAgIHJldHVybiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSA/IG1vZCA6IHsgXCJkZWZhdWx0XCI6IG1vZCB9O1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IEJhZFJlcXVlc3RFcnJvcl8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCIuL0JhZFJlcXVlc3RFcnJvclwiKSk7XG5leHBvcnRzLkJhZFJlcXVlc3RFcnJvciA9IEJhZFJlcXVlc3RFcnJvcl8xLmRlZmF1bHQ7XG5jb25zdCBGb3JiaWRkZW5FcnJvcl8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCIuL0ZvcmJpZGRlbkVycm9yXCIpKTtcbmV4cG9ydHMuRm9yYmlkZGVuRXJyb3IgPSBGb3JiaWRkZW5FcnJvcl8xLmRlZmF1bHQ7XG5jb25zdCBOb3RGb3VuZEVycm9yXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4vTm90Rm91bmRFcnJvclwiKSk7XG5leHBvcnRzLk5vdEZvdW5kRXJyb3IgPSBOb3RGb3VuZEVycm9yXzEuZGVmYXVsdDtcbmNvbnN0IFNlcnZlckVycm9yXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4vU2VydmVyRXJyb3JcIikpO1xuZXhwb3J0cy5TZXJ2ZXJFcnJvciA9IFNlcnZlckVycm9yXzEuZGVmYXVsdDtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9fcmVzdCA9ICh0aGlzICYmIHRoaXMuX19yZXN0KSB8fCBmdW5jdGlvbiAocywgZSkge1xuICAgIHZhciB0ID0ge307XG4gICAgZm9yICh2YXIgcCBpbiBzKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHMsIHApICYmIGUuaW5kZXhPZihwKSA8IDApXG4gICAgICAgIHRbcF0gPSBzW3BdO1xuICAgIGlmIChzICE9IG51bGwgJiYgdHlwZW9mIE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMgPT09IFwiZnVuY3Rpb25cIilcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIHAgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKHMpOyBpIDwgcC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKGUuaW5kZXhPZihwW2ldKSA8IDAgJiYgT2JqZWN0LnByb3RvdHlwZS5wcm9wZXJ0eUlzRW51bWVyYWJsZS5jYWxsKHMsIHBbaV0pKVxuICAgICAgICAgICAgICAgIHRbcFtpXV0gPSBzW3BbaV1dO1xuICAgICAgICB9XG4gICAgcmV0dXJuIHQ7XG59O1xuZnVuY3Rpb24gX19leHBvcnQobSkge1xuICAgIGZvciAodmFyIHAgaW4gbSkgaWYgKCFleHBvcnRzLmhhc093blByb3BlcnR5KHApKSBleHBvcnRzW3BdID0gbVtwXTtcbn1cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbnJlcXVpcmUoXCJ3aW5zdG9uLWRhaWx5LXJvdGF0ZS1maWxlXCIpO1xuY29uc3QgbG9nZ2Vyc18xID0gcmVxdWlyZShcIi4vbG9nZ2Vyc1wiKTtcbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBpbXBvcnQvbm8tbXV0YWJsZS1leHBvcnRzXG5sZXQgbG9nZ2VyO1xuZXhwb3J0cy5sb2dnZXIgPSBsb2dnZXI7XG5leHBvcnRzLmNvbmZpZ3VyZUxvZ2dlciA9IChjb25maWcpID0+IHtcbiAgICBjb25zdCB7IGxvZ2dlcnMgfSA9IGNvbmZpZywgbG9nZ2VyQ29uZmlnID0gX19yZXN0KGNvbmZpZywgW1wibG9nZ2Vyc1wiXSk7XG4gICAgZXhwb3J0cy5sb2dnZXIgPSBsb2dnZXIgPSBPYmplY3QuYXNzaWduKHsgYXV0aDogbG9nZ2Vyc18xLmF1dGhMb2dnZXIobG9nZ2VyQ29uZmlnKSwgaHR0cDogbG9nZ2Vyc18xLmh0dHBMb2dnZXIobG9nZ2VyQ29uZmlnKSwgc2VydmVyOiBsb2dnZXJzXzEuc2VydmVyTG9nZ2VyKGxvZ2dlckNvbmZpZyksIHNxbDogbG9nZ2Vyc18xLnNxbExvZ2dlcihsb2dnZXJDb25maWcpIH0sIGxvZ2dlcnMpO1xuICAgIHJldHVybiBsb2dnZXI7XG59O1xuX19leHBvcnQocmVxdWlyZShcIi4vbWlkZGxld2FyZXNcIikpO1xuX19leHBvcnQocmVxdWlyZShcIi4vZXJyb3JIYW5kbGVyc1wiKSk7XG4vLyBUT0RPIFRlc3RzIHJldWlyZWRcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9faW1wb3J0RGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnREZWZhdWx0KSB8fCBmdW5jdGlvbiAobW9kKSB7XG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBcImRlZmF1bHRcIjogbW9kIH07XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3Qgd2luc3Rvbl8xID0gcmVxdWlyZShcIndpbnN0b25cIik7XG5yZXF1aXJlKFwid2luc3Rvbi1kYWlseS1yb3RhdGUtZmlsZVwiKTtcbmNvbnN0IGxvZ0Zvcm1hdHRlcl8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCIuLi91dGlscy9sb2dGb3JtYXR0ZXJcIikpO1xuZXhwb3J0cy5kZWZhdWx0ID0gKGNvbmZpZykgPT4ge1xuICAgIGNvbnN0IHsgbG9nUGF0aCB9ID0gY29uZmlnO1xuICAgIHJldHVybiB3aW5zdG9uXzEuY3JlYXRlTG9nZ2VyKHtcbiAgICAgICAgbGV2ZWw6ICdpbmZvJyxcbiAgICAgICAgZm9ybWF0OiBsb2dGb3JtYXR0ZXJfMS5kZWZhdWx0LFxuICAgICAgICB0cmFuc3BvcnRzOiBbXG4gICAgICAgICAgICBuZXcgd2luc3Rvbl8xLnRyYW5zcG9ydHMuRGFpbHlSb3RhdGVGaWxlKHtcbiAgICAgICAgICAgICAgICBmaWxlbmFtZTogYCR7bG9nUGF0aH0vJURBVEUlLWF1dGgubG9nYCxcbiAgICAgICAgICAgICAgICBsZXZlbDogJ2luZm8nLFxuICAgICAgICAgICAgICAgIGRhdGVQYXR0ZXJuOiAnWVlZWS1NTS1ERCcsXG4gICAgICAgICAgICAgICAgemlwcGVkQXJjaGl2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBtYXhTaXplOiAnMjBtJyxcbiAgICAgICAgICAgICAgICBtYXhGaWxlczogJzE0ZCcsXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIG5ldyB3aW5zdG9uXzEudHJhbnNwb3J0cy5EYWlseVJvdGF0ZUZpbGUoe1xuICAgICAgICAgICAgICAgIGZpbGVuYW1lOiBgJHtsb2dQYXRofS8lREFURSUtZGVidWcubG9nYCxcbiAgICAgICAgICAgICAgICBsZXZlbDogJ2RlYnVnJyxcbiAgICAgICAgICAgICAgICBkYXRlUGF0dGVybjogJ1lZWVktTU0tREQnLFxuICAgICAgICAgICAgICAgIHppcHBlZEFyY2hpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgbWF4U2l6ZTogJzIwbScsXG4gICAgICAgICAgICAgICAgbWF4RmlsZXM6ICcxNGQnLFxuICAgICAgICAgICAgfSksXG4gICAgICAgIF0sXG4gICAgfSk7XG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19pbXBvcnREZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydERlZmF1bHQpIHx8IGZ1bmN0aW9uIChtb2QpIHtcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IFwiZGVmYXVsdFwiOiBtb2QgfTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCB3aW5zdG9uXzEgPSByZXF1aXJlKFwid2luc3RvblwiKTtcbnJlcXVpcmUoXCJ3aW5zdG9uLWRhaWx5LXJvdGF0ZS1maWxlXCIpO1xuY29uc3QgbG9nRm9ybWF0dGVyXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4uL3V0aWxzL2xvZ0Zvcm1hdHRlclwiKSk7XG5leHBvcnRzLmRlZmF1bHQgPSAoY29uZmlnKSA9PiB7XG4gICAgY29uc3QgeyBsb2dQYXRoIH0gPSBjb25maWc7XG4gICAgcmV0dXJuIHdpbnN0b25fMS5jcmVhdGVMb2dnZXIoe1xuICAgICAgICBsZXZlbDogJ2luZm8nLFxuICAgICAgICBmb3JtYXQ6IGxvZ0Zvcm1hdHRlcl8xLmRlZmF1bHQsXG4gICAgICAgIHRyYW5zcG9ydHM6IFtcbiAgICAgICAgICAgIG5ldyB3aW5zdG9uXzEudHJhbnNwb3J0cy5EYWlseVJvdGF0ZUZpbGUoe1xuICAgICAgICAgICAgICAgIGZpbGVuYW1lOiBgJHtsb2dQYXRofS8lREFURSUtaHR0cC5sb2dgLFxuICAgICAgICAgICAgICAgIGxldmVsOiAnaW5mbycsXG4gICAgICAgICAgICAgICAgZGF0ZVBhdHRlcm46ICdZWVlZLU1NLUREJyxcbiAgICAgICAgICAgICAgICB6aXBwZWRBcmNoaXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgIG1heFNpemU6ICcyMG0nLFxuICAgICAgICAgICAgICAgIG1heEZpbGVzOiAnMTRkJyxcbiAgICAgICAgICAgIH0pLFxuICAgICAgICBdLFxuICAgIH0pO1xufTtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9faW1wb3J0RGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnREZWZhdWx0KSB8fCBmdW5jdGlvbiAobW9kKSB7XG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBcImRlZmF1bHRcIjogbW9kIH07XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgYXV0aF8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCIuL2F1dGhcIikpO1xuZXhwb3J0cy5hdXRoTG9nZ2VyID0gYXV0aF8xLmRlZmF1bHQ7XG5jb25zdCBodHRwXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4vaHR0cFwiKSk7XG5leHBvcnRzLmh0dHBMb2dnZXIgPSBodHRwXzEuZGVmYXVsdDtcbmNvbnN0IHNlcnZlcl8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCIuL3NlcnZlclwiKSk7XG5leHBvcnRzLnNlcnZlckxvZ2dlciA9IHNlcnZlcl8xLmRlZmF1bHQ7XG5jb25zdCBzcWxfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi9zcWxcIikpO1xuZXhwb3J0cy5zcWxMb2dnZXIgPSBzcWxfMS5kZWZhdWx0O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19pbXBvcnREZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydERlZmF1bHQpIHx8IGZ1bmN0aW9uIChtb2QpIHtcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IFwiZGVmYXVsdFwiOiBtb2QgfTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCB3aW5zdG9uXzEgPSByZXF1aXJlKFwid2luc3RvblwiKTtcbnJlcXVpcmUoXCJ3aW5zdG9uLWRhaWx5LXJvdGF0ZS1maWxlXCIpO1xuY29uc3QgbG9nRm9ybWF0dGVyXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4uL3V0aWxzL2xvZ0Zvcm1hdHRlclwiKSk7XG5leHBvcnRzLmRlZmF1bHQgPSAoY29uZmlnKSA9PiB7XG4gICAgY29uc3QgeyBsb2dQYXRoIH0gPSBjb25maWc7XG4gICAgcmV0dXJuIHdpbnN0b25fMS5jcmVhdGVMb2dnZXIoe1xuICAgICAgICBsZXZlbDogJ2RlYnVnJyxcbiAgICAgICAgZm9ybWF0OiBsb2dGb3JtYXR0ZXJfMS5kZWZhdWx0LFxuICAgICAgICB0cmFuc3BvcnRzOiBbXG4gICAgICAgICAgICBuZXcgd2luc3Rvbl8xLnRyYW5zcG9ydHMuRGFpbHlSb3RhdGVGaWxlKHtcbiAgICAgICAgICAgICAgICBmaWxlbmFtZTogYCR7bG9nUGF0aH0vJURBVEUlLWVycm9ycy5sb2dgLFxuICAgICAgICAgICAgICAgIGxldmVsOiAnZXJyb3InLFxuICAgICAgICAgICAgICAgIGRhdGVQYXR0ZXJuOiAnWVlZWS1NTS1ERCcsXG4gICAgICAgICAgICAgICAgemlwcGVkQXJjaGl2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBtYXhTaXplOiAnMjBtJyxcbiAgICAgICAgICAgICAgICBtYXhGaWxlczogJzE0ZCcsXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIG5ldyB3aW5zdG9uXzEudHJhbnNwb3J0cy5EYWlseVJvdGF0ZUZpbGUoe1xuICAgICAgICAgICAgICAgIGZpbGVuYW1lOiBgJHtsb2dQYXRofS8lREFURSUtZGVidWcubG9nYCxcbiAgICAgICAgICAgICAgICBsZXZlbDogJ2RlYnVnJyxcbiAgICAgICAgICAgICAgICBkYXRlUGF0dGVybjogJ1lZWVktTU0tREQnLFxuICAgICAgICAgICAgICAgIHppcHBlZEFyY2hpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgbWF4U2l6ZTogJzIwbScsXG4gICAgICAgICAgICAgICAgbWF4RmlsZXM6ICcxNGQnLFxuICAgICAgICAgICAgfSksXG4gICAgICAgIF0sXG4gICAgfSk7XG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19pbXBvcnREZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydERlZmF1bHQpIHx8IGZ1bmN0aW9uIChtb2QpIHtcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IFwiZGVmYXVsdFwiOiBtb2QgfTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCB3aW5zdG9uXzEgPSByZXF1aXJlKFwid2luc3RvblwiKTtcbnJlcXVpcmUoXCJ3aW5zdG9uLWRhaWx5LXJvdGF0ZS1maWxlXCIpO1xuY29uc3QgbG9nRm9ybWF0dGVyXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4uL3V0aWxzL2xvZ0Zvcm1hdHRlclwiKSk7XG5leHBvcnRzLmRlZmF1bHQgPSAoY29uZmlnKSA9PiB7XG4gICAgY29uc3QgeyBsb2dQYXRoIH0gPSBjb25maWc7XG4gICAgcmV0dXJuIHdpbnN0b25fMS5jcmVhdGVMb2dnZXIoe1xuICAgICAgICBsZXZlbDogJ2RlYnVnJyxcbiAgICAgICAgZm9ybWF0OiBsb2dGb3JtYXR0ZXJfMS5kZWZhdWx0LFxuICAgICAgICB0cmFuc3BvcnRzOiBbXG4gICAgICAgICAgICBuZXcgd2luc3Rvbl8xLnRyYW5zcG9ydHMuRGFpbHlSb3RhdGVGaWxlKHtcbiAgICAgICAgICAgICAgICBmaWxlbmFtZTogYCR7bG9nUGF0aH0vJURBVEUlLXNxbC5sb2dgLFxuICAgICAgICAgICAgICAgIGxldmVsOiAnZGVidWcnLFxuICAgICAgICAgICAgICAgIGRhdGVQYXR0ZXJuOiAnWVlZWS1NTS1ERCcsXG4gICAgICAgICAgICAgICAgemlwcGVkQXJjaGl2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBtYXhTaXplOiAnMjBtJyxcbiAgICAgICAgICAgICAgICBtYXhGaWxlczogJzE0ZCcsXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIG5ldyB3aW5zdG9uXzEudHJhbnNwb3J0cy5Db25zb2xlKHtcbiAgICAgICAgICAgICAgICBsZXZlbDogJ2Vycm9yJyxcbiAgICAgICAgICAgIH0pLFxuICAgICAgICBdLFxuICAgIH0pO1xufTtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9faW1wb3J0RGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnREZWZhdWx0KSB8fCBmdW5jdGlvbiAobW9kKSB7XG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBcImRlZmF1bHRcIjogbW9kIH07XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgY2hhbGtfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiY2hhbGtcIikpO1xuY29uc3QgcmVzcG9uc2VGb3JtYXR0ZXJfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwifi9sb2dnZXIvdXRpbHMvcmVzcG9uc2VGb3JtYXR0ZXJcIikpO1xuZXhwb3J0cy5kZWZhdWx0ID0gKGNvbmZpZykgPT4ge1xuICAgIGNvbnN0IHsgY29udGV4dCB9ID0gY29uZmlnO1xuICAgIGNvbnN0IHsgbG9nZ2VyIH0gPSBjb250ZXh0O1xuICAgIHJldHVybiBbXG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcbiAgICAgICAgKGVyciwgcmVxLCByZXMsIG5leHQpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHsgc3RhdHVzLCBzdGFjaywgbmFtZSwgbWVzc2FnZSwgbWV0YURhdGEgfSA9IGVycjtcbiAgICAgICAgICAgIGNvbnN0IHsgb3JpZ2luYWxVcmwgfSA9IHJlcTtcbiAgICAgICAgICAgIGxvZ2dlci5zZXJ2ZXIuZXJyb3IobWVzc2FnZSA/IGAke3N0YXR1cyB8fCAnJ30gJHttZXNzYWdlfWAgOiAnVW5rbm93biBlcnJvcicsIHsgb3JpZ2luYWxVcmwsIHN0YWNrLCBtZXRhRGF0YSB9KTtcbiAgICAgICAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ2RldmVsb3BtZW50Jykge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCcnKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtjaGFsa18xLmRlZmF1bHQuYmdSZWQud2hpdGUoJyBGYXRhbCBFcnJvciAnKX0gJHtjaGFsa18xLmRlZmF1bHQucmVkKG5hbWUpfWApO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKG1lc3NhZ2UsIG1ldGFEYXRhKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXMuc3RhdHVzKHN0YXR1cyB8fCA1MDApLmpzb24ocmVzcG9uc2VGb3JtYXR0ZXJfMS5kZWZhdWx0KHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBtZXNzYWdlIHx8ICdQbGVhc2UgY29udGFjdCBzeXN0ZW0gYWRtaW5pc3RyYXRvcicsXG4gICAgICAgICAgICAgICAgbmFtZTogbmFtZSB8fCAnSW50ZXJuYWwgc2VydmVyIGVycm9yJyxcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfSxcbiAgICAgICAgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgICAgICByZXMuc3RhdHVzKDQwNCkuZW5kKCk7XG4gICAgICAgIH0sXG4gICAgICAgIChyZXEsIHJlcykgPT4ge1xuICAgICAgICAgICAgcmVzLnN0YXR1cyg1MDMpLmVuZCgpO1xuICAgICAgICB9LFxuICAgICAgICAocmVxLCByZXMpID0+IHtcbiAgICAgICAgICAgIHJlcy5zdGF0dXMoNDAwKS5lbmQoKTtcbiAgICAgICAgfSxcbiAgICBdO1xufTtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9faW1wb3J0RGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnREZWZhdWx0KSB8fCBmdW5jdGlvbiAobW9kKSB7XG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBcImRlZmF1bHRcIjogbW9kIH07XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgZXJyb3JIYW5kbGVyXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4vZXJyb3JIYW5kbGVyXCIpKTtcbmV4cG9ydHMuZXJyb3JIYW5kbGVyTWlkZGxld2FyZSA9IGVycm9ySGFuZGxlcl8xLmRlZmF1bHQ7XG5jb25zdCByZXF1ZXN0SGFuZGxlcl8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCIuL3JlcXVlc3RIYW5kbGVyXCIpKTtcbmV4cG9ydHMucmVxdWVzdEhhbmRsZXJNaWRkbGV3YXJlID0gcmVxdWVzdEhhbmRsZXJfMS5kZWZhdWx0O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLmRlZmF1bHQgPSAoY29uZmlnKSA9PiB7XG4gICAgY29uc3QgeyBjb250ZXh0IH0gPSBjb25maWc7XG4gICAgY29uc3QgeyBsb2dnZXIgfSA9IGNvbnRleHQ7XG4gICAgcmV0dXJuIChyZXEsIHJlcywgbmV4dCkgPT4ge1xuICAgICAgICBjb25zdCB7IG1ldGhvZCwgb3JpZ2luYWxVcmwsIGhlYWRlcnMgfSA9IHJlcTtcbiAgICAgICAgY29uc3QgeEZvcndhcmRlZEZvciA9IFN0cmluZyhyZXEuaGVhZGVyc1sneC1mb3J3YXJkZWQtZm9yJ10gfHwgJycpLnJlcGxhY2UoLzpcXGQrJC8sICcnKTtcbiAgICAgICAgY29uc3QgaXAgPSB4Rm9yd2FyZGVkRm9yIHx8IHJlcS5jb25uZWN0aW9uLnJlbW90ZUFkZHJlc3M7XG4gICAgICAgIGNvbnN0IGlwQWRkcmVzcyA9IGlwID09PSAnMTI3LjAuMC4xJyB8fCBpcCA9PT0gJzo6MScgPyAnbG9jYWxob3N0JyA6IGlwO1xuICAgICAgICBsb2dnZXIuaHR0cC5pbmZvKGAke2lwQWRkcmVzc30gJHttZXRob2R9IFwiJHtvcmlnaW5hbFVybH1cImAsIHsgaGVhZGVycyB9KTtcbiAgICAgICAgcmV0dXJuIG5leHQoKTtcbiAgICB9O1xufTtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3Qgd2luc3Rvbl8xID0gcmVxdWlyZShcIndpbnN0b25cIik7XG5leHBvcnRzLmRlZmF1bHQgPSB3aW5zdG9uXzEuZm9ybWF0LmNvbWJpbmUod2luc3Rvbl8xLmZvcm1hdC5tZXRhZGF0YSgpLCB3aW5zdG9uXzEuZm9ybWF0Lmpzb24oKSwgd2luc3Rvbl8xLmZvcm1hdC50aW1lc3RhbXAoeyBmb3JtYXQ6ICdZWVlZLU1NLUREVEhIOm1tOnNzWlonIH0pLCB3aW5zdG9uXzEuZm9ybWF0LnNwbGF0KCksIHdpbnN0b25fMS5mb3JtYXQucHJpbnRmKGluZm8gPT4ge1xuICAgIGNvbnN0IHsgdGltZXN0YW1wLCBsZXZlbCwgbWVzc2FnZSwgbWV0YWRhdGEgfSA9IGluZm87XG4gICAgY29uc3QgbWV0YSA9IEpTT04uc3RyaW5naWZ5KG1ldGFkYXRhKSAhPT0gJ3t9JyA/IG1ldGFkYXRhIDogbnVsbDtcbiAgICByZXR1cm4gYCR7dGltZXN0YW1wfSAke2xldmVsfTogJHttZXNzYWdlfSAke21ldGEgPyBKU09OLnN0cmluZ2lmeShtZXRhKSA6ICcnfWA7XG59KSk7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuZGVmYXVsdCA9IChwcm9wcykgPT4ge1xuICAgIGNvbnN0IHsgbmFtZSwgbWVzc2FnZSB9ID0gcHJvcHM7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgZXJyb3JzOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbmFtZTogbmFtZSB8fCAnVW5rbm93biBFcnJvcicsXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogbWVzc2FnZSB8fCBuYW1lIHx8ICdVbmtub3duIEVycm9yJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgfTtcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2ltcG9ydERlZmF1bHQgPSAodGhpcyAmJiB0aGlzLl9faW1wb3J0RGVmYXVsdCkgfHwgZnVuY3Rpb24gKG1vZCkge1xuICAgIHJldHVybiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSA/IG1vZCA6IHsgXCJkZWZhdWx0XCI6IG1vZCB9O1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IHBhdGhfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwicGF0aFwiKSk7XG5jb25zdCBpbmRleF8xID0gcmVxdWlyZShcIn4vaW5kZXhcIik7XG4vLyBpbXBvcnQgeyBjb25maWd1cmVDYXRhbG9nTG9nZ2VyIH0gZnJvbSAnfi9wbGF5Z3JvdW5kL3NjaGVtYXMvY2F0YWxvZyc7XG5jb25zdCBuZXdzXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIn4vcGxheWdyb3VuZC9zY2hlbWFzL25ld3NcIikpO1xuLy8gY29uc3QgY2F0YWxvZ0xvZ2dlciA9IGNvbmZpZ3VyZUNhdGFsb2dMb2dnZXIoe1xuLy8gICBsb2dQYXRoOiAnbG9nJyxcbi8vIH0pO1xuY29uc3QgbG9nZ2VyID0gaW5kZXhfMS5jb25maWd1cmVMb2dnZXIoe1xuICAgIGxvZ1BhdGg6ICdsb2cnLFxufSk7XG5leHBvcnRzLmxvZ2dlciA9IGxvZ2dlcjtcbmNvbnN0IGRhdGFiYXNlQ29uZmlnID0ge1xuICAgIGNsaWVudDogJ3BnJyxcbiAgICBjb25uZWN0aW9uOiB7XG4gICAgICAgIGRhdGFiYXNlOiAnc2VydmljZXMnLFxuICAgICAgICBob3N0OiAnZTFnLnJ1JyxcbiAgICAgICAgcGFzc3dvcmQ6ICdub25wcm9maXRwcm9qZWN0JyxcbiAgICAgICAgdXNlcjogJ3NlcnZpY2VzJyxcbiAgICB9LFxufTtcbmV4cG9ydHMuZGF0YWJhc2VDb25maWcgPSBkYXRhYmFzZUNvbmZpZztcbmNvbnN0IGp3dENvbmZpZyA9IHtcbiAgICBhY2Nlc3NUb2tlbkV4cGlyZXNJbjogMTgwMCxcbiAgICBhbGdvcml0aG06ICdSUzI1NicsXG4gICAgaXNzdWVyOiAndmlhcHJvZml0LXNlcnZpY2VzJyxcbiAgICBwcml2YXRlS2V5OiBwYXRoXzEuZGVmYXVsdC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vY2VydC9qd3RSUzI1Ni5rZXknKSxcbiAgICBwdWJsaWNLZXk6IHBhdGhfMS5kZWZhdWx0LnJlc29sdmUoX19kaXJuYW1lLCAnLi9jZXJ0L2p3dFJTMjU2LmtleS5wdWInKSxcbiAgICByZWZyZXNoVG9rZW5FeHBpcmVzSW46IDIuNTkyZTYsXG59O1xuZXhwb3J0cy5qd3RDb25maWcgPSBqd3RDb25maWc7XG5jb25zdCBzZXJ2ZXJDb25maWcgPSB7XG4gICAgZGF0YWJhc2U6IGRhdGFiYXNlQ29uZmlnLFxuICAgIGVuZHBvaW50OiAnL2FwaS9ncmFwaHFsJyxcbiAgICBqd3Q6IGp3dENvbmZpZyxcbiAgICBsb2dnZXIsXG4gICAgcG9ydDogNDAwMCxcbiAgICBzY2hlbWFzOiBbbmV3c18xLmRlZmF1bHRdLFxufTtcbmV4cG9ydHMuc2VydmVyQ29uZmlnID0gc2VydmVyQ29uZmlnO1xuY29uc3QgeyBzZXJ2ZXIgfSA9IGluZGV4XzEuY3JlYXRlU2VydmVyKHNlcnZlckNvbmZpZyk7XG5zZXJ2ZXIubGlzdGVuKDQwMDApO1xuLy8gY29uc3Qgc2VydmVyID0gQ29yZS5pbml0KHNlcnZlckNvbmZpZyk7XG5leHBvcnRzLmRlZmF1bHQgPSBzZXJ2ZXI7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IGdyYXBocWxfMSA9IHJlcXVpcmUoXCJncmFwaHFsXCIpO1xuY29uc3QgRGV2ZWxvcGVySW5mbyA9IG5ldyBncmFwaHFsXzEuR3JhcGhRTE9iamVjdFR5cGUoe1xuICAgIG5hbWU6ICdEZXZlbG9wZXJJbmZvJyxcbiAgICBkZXNjcmlwdGlvbjogJ2RldmVsb3BlciBpbmZvJyxcbiAgICBmaWVsZHM6ICgpID0+ICh7XG4gICAgICAgIG5hbWU6IHtcbiAgICAgICAgICAgIHR5cGU6IG5ldyBncmFwaHFsXzEuR3JhcGhRTE5vbk51bGwoZ3JhcGhxbF8xLkdyYXBoUUxTdHJpbmcpLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdDb21wYW55IG5hbWUnLFxuICAgICAgICB9LFxuICAgICAgICB3ZWJzaXRlOiB7XG4gICAgICAgICAgICB0eXBlOiBuZXcgZ3JhcGhxbF8xLkdyYXBoUUxOb25OdWxsKGdyYXBocWxfMS5HcmFwaFFMU3RyaW5nKSxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnV2Vic2l0ZSBVUkwgYWRkcmVzcycsXG4gICAgICAgIH0sXG4gICAgfSksXG59KTtcbmNvbnN0IHNjaGVtYSA9IG5ldyBncmFwaHFsXzEuR3JhcGhRTFNjaGVtYSh7XG4gICAgcXVlcnk6IG5ldyBncmFwaHFsXzEuR3JhcGhRTE9iamVjdFR5cGUoe1xuICAgICAgICBuYW1lOiAnUXVlcnknLFxuICAgICAgICBmaWVsZHM6ICgpID0+ICh7XG4gICAgICAgICAgICB2ZXJzaW9uOiB7XG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdKdXN0IHZlcnNpb24nLFxuICAgICAgICAgICAgICAgIHJlc29sdmU6ICgpID0+ICcwLjEuMScsXG4gICAgICAgICAgICAgICAgdHlwZTogbmV3IGdyYXBocWxfMS5HcmFwaFFMTm9uTnVsbChncmFwaHFsXzEuR3JhcGhRTFN0cmluZyksXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZGV2ZWxvcGVyOiB7XG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdSZXR1ZW4gRGV2ZWxvcGVyIGluZm8nLFxuICAgICAgICAgICAgICAgIHR5cGU6IG5ldyBncmFwaHFsXzEuR3JhcGhRTE5vbk51bGwoRGV2ZWxvcGVySW5mbyksXG4gICAgICAgICAgICAgICAgcmVzb2x2ZTogKCkgPT4gKHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ1ZpYSBQcm9maXQnLFxuICAgICAgICAgICAgICAgICAgICB3ZWJzaXRlOiAnaHR0cHM6Ly92aWEtcHJvZml0LnJ1JyxcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pLFxuICAgIH0pLFxuICAgIG11dGF0aW9uOiBuZXcgZ3JhcGhxbF8xLkdyYXBoUUxPYmplY3RUeXBlKHtcbiAgICAgICAgbmFtZTogJ011dGF0aW9uJyxcbiAgICAgICAgZmllbGRzOiAoKSA9PiAoe1xuICAgICAgICAgICAgc2V0QW55OiB7XG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdTZXQgYW55IHZhbHVlIGZvciB0ZXN0IG11dGF0aW9uJyxcbiAgICAgICAgICAgICAgICBhcmdzOiB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IG5ldyBncmFwaHFsXzEuR3JhcGhRTE5vbk51bGwoZ3JhcGhxbF8xLkdyYXBoUUxTdHJpbmcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdBbnkgdmFsdWUgc3RyaW5nJyxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHJlc29sdmU6ICgpID0+IHRydWUsXG4gICAgICAgICAgICAgICAgdHlwZTogbmV3IGdyYXBocWxfMS5HcmFwaFFMTm9uTnVsbChncmFwaHFsXzEuR3JhcGhRTEJvb2xlYW4pLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSksXG4gICAgfSksXG59KTtcbmV4cG9ydHMuZGVmYXVsdCA9IHNjaGVtYTtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9faW1wb3J0RGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnREZWZhdWx0KSB8fCBmdW5jdGlvbiAobW9kKSB7XG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBcImRlZmF1bHRcIjogbW9kIH07XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuLyogZXNsaW50LWRpc2FibGUgaW1wb3J0L21heC1kZXBlbmRlbmNpZXMgKi9cbmNvbnN0IGV2ZW50c18xID0gcmVxdWlyZShcImV2ZW50c1wiKTtcbmNvbnN0IGV4cHJlc3NfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiZXhwcmVzc1wiKSk7XG5jb25zdCBncmFwaHFsX3Rvb2xzXzEgPSByZXF1aXJlKFwiZ3JhcGhxbC10b29sc1wiKTtcbmNvbnN0IGRhdGFiYXNlTWFuYWdlcl8xID0gcmVxdWlyZShcIn4vZGF0YWJhc2VNYW5hZ2VyXCIpO1xuZXhwb3J0cy5nZXRSb3V0ZXMgPSAoZW5kcG9pbnQsIHJvdXRlcykgPT4ge1xuICAgIHJldHVybiBPYmplY3QuYXNzaWduKHsgYXV0aDogYCR7ZW5kcG9pbnR9L2F1dGhgLCBwbGF5Z3JvdW5kOiBgJHtlbmRwb2ludH0vcGxheWdyb3VuZGAsIHZveWFnZXI6IGAke2VuZHBvaW50fS92b3lhZ2VyYCB9LCByb3V0ZXMpO1xufTtcbmNvbnN0IGNyZWF0ZVNlcnZlciA9IChwcm9wcykgPT4ge1xuICAgIGNvbnN0IHNlcnZlciA9IGV4cHJlc3NfMS5kZWZhdWx0KCk7XG4gICAgY29uc3QgeyBzY2hlbWFzLCBlbmRwb2ludCwgcG9ydCwgand0LCBkYXRhYmFzZSwgbG9nZ2VyLCByb3V0ZXMgfSA9IHByb3BzO1xuICAgIGNvbnN0IHN1YnNjcmlwdGlvbnNFbmRwb2ludCA9ICcvc3Vic2NyaXB0aW9ucyc7XG4gICAgY29uc3Qgc2NoZW1hID0gZ3JhcGhxbF90b29sc18xLm1lcmdlU2NoZW1hcyh7IHNjaGVtYXMgfSk7XG4gICAgLy8gZ2VuZXJhdGUgcm91dGVzXG4gICAgY29uc3Qgcm91dGVzTGlzdCA9IGV4cG9ydHMuZ2V0Um91dGVzKGVuZHBvaW50LCByb3V0ZXMpO1xuICAgIC8vIGRlZmluZSBrbmV4IGluc3RhbmNlXG4gICAgY29uc3Qga25leCA9IGRhdGFiYXNlTWFuYWdlcl8xLmtuZXhQcm92aWRlcih7IGxvZ2dlciwgZGF0YWJhc2UgfSk7XG4gICAgLy8gZGVmaW5lIEV2ZW50RW1pdHRyZSBpbnN0YW5jZVxuICAgIGNvbnN0IGVtaXR0ZXIgPSBuZXcgZXZlbnRzXzEuRXZlbnRFbWl0dGVyKCk7XG4gICAgY29uc3QgY29udGV4dCA9IHtcbiAgICAgICAgZW5kcG9pbnQsXG4gICAgICAgIGp3dCxcbiAgICAgICAgbG9nZ2VyLFxuICAgICAgICBrbmV4LFxuICAgICAgICBlbWl0dGVyLFxuICAgIH07XG4gICAgLy8gVGhpcyBtaWRkbGV3YXJlIG11c3QgYmUgZGVmaW5lZCBmaXJzdFxuICAgIC8qIHNlcnZlci51c2UocmVxdWVzdEhhbmRsZXJNaWRkbGV3YXJlKHsgY29udGV4dCB9KSk7XG4gICAgc2VydmVyLnVzZShjb3JzKCkpO1xuICAgIHNlcnZlci51c2UoZXhwcmVzcy5qc29uKHsgbGltaXQ6ICc1MG1iJyB9KSk7XG4gICAgc2VydmVyLnVzZShleHByZXNzLnVybGVuY29kZWQoeyBleHRlbmRlZDogdHJ1ZSwgbGltaXQ6ICc1MG1iJyB9KSk7XG4gIFxuICAgIHNlcnZlci51c2UoXG4gICAgICBhdXRoZW50aWZpY2F0b3JNaWRkbGV3YXJlKHtcbiAgICAgICAgY29udGV4dCxcbiAgICAgICAgYXV0aFVybDogcm91dGVzTGlzdC5hdXRoLFxuICAgICAgICBhbGxvd2VkVXJsOiBbcm91dGVzTGlzdC5wbGF5Z3JvdW5kXSxcbiAgICAgIH0pLFxuICAgICk7XG4gICAgc2VydmVyLmdldChyb3V0ZXNMaXN0LnBsYXlncm91bmQsIGV4cHJlc3NQbGF5Z3JvdW5kKHsgZW5kcG9pbnQgfSkpO1xuICAgIHNlcnZlci51c2Uocm91dGVzTGlzdC52b3lhZ2VyLCB2b3lhZ2VyTWlkZGxld2FyZSh7IGVuZHBvaW50VXJsOiBlbmRwb2ludCB9KSk7XG4gICAgc2VydmVyLnVzZShcbiAgICAgIGVuZHBvaW50LFxuICAgICAgZ3JhcGhxbEhUVFAoXG4gICAgICAgIGFzeW5jICgpOiBQcm9taXNlPE9wdGlvbnNEYXRhICYgeyBzdWJzY3JpcHRpb25zRW5kcG9pbnQ/OiBzdHJpbmcgfT4gPT4gKHtcbiAgICAgICAgICBjb250ZXh0LFxuICAgICAgICAgIGdyYXBoaXFsOiBmYWxzZSxcbiAgICAgICAgICBzY2hlbWEsXG4gICAgICAgICAgc3Vic2NyaXB0aW9uc0VuZHBvaW50OiBgd3M6Ly9sb2NhbGhvc3Q6JHtwb3J0IHx8IDQwMDB9JHtzdWJzY3JpcHRpb25zRW5kcG9pbnR9YCxcbiAgICAgICAgfSksXG4gICAgICApLFxuICAgICk7XG4gIFxuICAgIC8vIHRoaXMgbWlkZGxld2FyZSBtb3N0IGJlIGRlZmluZWQgZmlyc3RcbiAgICBzZXJ2ZXIudXNlKGVycm9ySGFuZGxlck1pZGRsZXdhcmUoeyBjb250ZXh0IH0pKTsgKi9cbiAgICAvLyBDcmVhdGUgbGlzdGVuZXIgc2VydmVyIGJ5IHdyYXBwaW5nIGV4cHJlc3MgYXBwXG4gICAgLyogY29uc3Qgd2ViU2VydmVyID0gY3JlYXRlU2VydmVyKGFwcCk7XG4gIFxuICAgIHdlYlNlcnZlci5saXN0ZW4ocG9ydCwgKCkgPT4ge1xuICAgICAgbG9nZ2VyLnNlcnZlci5kZWJ1ZygnU2VydmVyIHdhcyBzdGFydGVkJywgeyBwb3J0LCBlbmRwb2ludCwgcm91dGVzTGlzdCB9KTtcbiAgICAgIGNvbnNvbGUubG9nKCcnKTtcbiAgICAgIGNvbnNvbGUubG9nKCcnKTtcbiAgICAgIGNvbnNvbGUubG9nKGNoYWxrLmdyZWVuKCc9PT09PT09PT0gR3JhcGhRTCA9PT09PT09PT0nKSk7XG4gICAgICBjb25zb2xlLmxvZygnJyk7XG4gICAgICBjb25zb2xlLmxvZyhgJHtjaGFsay5ncmVlbignR3JhcGhRTCBzZXJ2ZXInKX06ICAgICAke2NoYWxrLnllbGxvdyhgaHR0cDovL2xvY2FsaG9zdDoke3BvcnR9JHtlbmRwb2ludH1gKX1gKTtcbiAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICBgJHtjaGFsay5tYWdlbnRhKCdHcmFwaFFMIHBsYXlncm91bmQnKX06ICR7Y2hhbGsueWVsbG93KGBodHRwOi8vbG9jYWxob3N0OiR7cG9ydH0ke3JvdXRlcy5wbGF5Z3JvdW5kfWApfWAsXG4gICAgICApO1xuICAgICAgY29uc29sZS5sb2coYCR7Y2hhbGsuY3lhbignQXV0aCBTZXJ2ZXInKX06ICAgICAgICAke2NoYWxrLnllbGxvdyhgaHR0cDovL2xvY2FsaG9zdDoke3BvcnR9JHtyb3V0ZXMuYXV0aH1gKX1gKTtcbiAgICAgIGNvbnNvbGUubG9nKGAke2NoYWxrLmJsdWUoJ0dyYXBoUUwgdm95YWdlcicpfTogICAgJHtjaGFsay55ZWxsb3coYGh0dHA6Ly9sb2NhbGhvc3Q6JHtwb3J0fSR7cm91dGVzLnZveWFnZXJ9YCl9YCk7XG4gICAgICBjb25zb2xlLmxvZygnJyk7XG4gIFxuICAgICAgLy8gU2V0IHVwIHRoZSBXZWJTb2NrZXQgZm9yIGhhbmRsaW5nIEdyYXBoUUwgc3Vic2NyaXB0aW9ucy5cbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcbiAgICAgIGNvbnN0IHNzID0gbmV3IFN1YnNjcmlwdGlvblNlcnZlcihcbiAgICAgICAge1xuICAgICAgICAgIGV4ZWN1dGUsXG4gICAgICAgICAgc2NoZW1hLFxuICAgICAgICAgIHN1YnNjcmliZSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHBhdGg6IHN1YnNjcmlwdGlvbnNFbmRwb2ludCxcbiAgICAgICAgICBzZXJ2ZXI6IHdlYlNlcnZlcixcbiAgICAgICAgfSxcbiAgICAgICk7XG4gICAgfSk7XG4gIFxuICAgIHByb2Nlc3Mub24oJ1NJR0lOVCcsIGNvZGUgPT4ge1xuICAgICAgbG9nZ2VyLnNlcnZlci5kZWJ1ZyhgU2VydmVyIHdhcyBzdG9wcGVkIChDdHJsLUMga2V5IHBhc3NlZCkuIEV4aXQgd2l0aCBjb2RlOiAke2NvZGV9YCk7XG4gICAgICBwcm9jZXNzLmV4aXQoMik7XG4gICAgfSk7ICovXG4gICAgcmV0dXJuIHsgc2VydmVyLCBjb250ZXh0IH07XG59O1xuZXhwb3J0cy5jcmVhdGVTZXJ2ZXIgPSBjcmVhdGVTZXJ2ZXI7XG5leHBvcnRzLmRlZmF1bHQgPSBjcmVhdGVTZXJ2ZXI7XG4vLyBUT0RPIFRlc3RzIHJldWlyZWRcbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImJjcnlwdGpzXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImNoYWxrXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImRldmljZS1kZXRlY3Rvci1qc1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJldmVudHNcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiZXhwcmVzc1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJleHByZXNzLWFzeW5jLWhhbmRsZXJcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiZnNcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiZ3JhcGhxbFwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJncmFwaHFsLXRvb2xzXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImpzb253ZWJ0b2tlblwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJrbmV4XCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIm1vbWVudC10aW1lem9uZVwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJwYXRoXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcInBlcmZfaG9va3NcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwidXVpZC92NFwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJ3aW5zdG9uXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIndpbnN0b24tZGFpbHktcm90YXRlLWZpbGVcIik7Il0sInNvdXJjZVJvb3QiOiIifQ==