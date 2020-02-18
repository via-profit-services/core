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
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.ts");
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2F1dGhlbnRpZmljYXRvci9BdXRoZW50aWZpY2F0b3IudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2F1dGhlbnRpZmljYXRvci9hdXRoZW50aWZpY2F0b3JNaWRkbGV3YXJlLnRzIiwid2VicGFjazovLy8uL3NyYy9hdXRoZW50aWZpY2F0b3IvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvcmUvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2RhdGFiYXNlTWFuYWdlci9pbmRleC50cyIsIndlYnBhY2s6Ly8vLi9zcmMvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2xvZ2dlci9lcnJvckhhbmRsZXJzL0JhZFJlcXVlc3RFcnJvci50cyIsIndlYnBhY2s6Ly8vLi9zcmMvbG9nZ2VyL2Vycm9ySGFuZGxlcnMvRm9yYmlkZGVuRXJyb3IudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2xvZ2dlci9lcnJvckhhbmRsZXJzL05vdEZvdW5kRXJyb3IudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2xvZ2dlci9lcnJvckhhbmRsZXJzL1NlcnZlckVycm9yLnRzIiwid2VicGFjazovLy8uL3NyYy9sb2dnZXIvZXJyb3JIYW5kbGVycy9pbmRleC50cyIsIndlYnBhY2s6Ly8vLi9zcmMvbG9nZ2VyL2luZGV4LnRzIiwid2VicGFjazovLy8uL3NyYy9sb2dnZXIvbG9nZ2Vycy9hdXRoLnRzIiwid2VicGFjazovLy8uL3NyYy9sb2dnZXIvbG9nZ2Vycy9odHRwLnRzIiwid2VicGFjazovLy8uL3NyYy9sb2dnZXIvbG9nZ2Vycy9pbmRleC50cyIsIndlYnBhY2s6Ly8vLi9zcmMvbG9nZ2VyL2xvZ2dlcnMvc2VydmVyLnRzIiwid2VicGFjazovLy8uL3NyYy9sb2dnZXIvbG9nZ2Vycy9zcWwudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2xvZ2dlci9taWRkbGV3YXJlcy9lcnJvckhhbmRsZXIudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2xvZ2dlci9taWRkbGV3YXJlcy9pbmRleC50cyIsIndlYnBhY2s6Ly8vLi9zcmMvbG9nZ2VyL21pZGRsZXdhcmVzL3JlcXVlc3RIYW5kbGVyLnRzIiwid2VicGFjazovLy8uL3NyYy9sb2dnZXIvdXRpbHMvbG9nRm9ybWF0dGVyLnRzIiwid2VicGFjazovLy8uL3NyYy9sb2dnZXIvdXRpbHMvcmVzcG9uc2VGb3JtYXR0ZXIudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3NlcnZlci9pbmRleC50cyIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJiY3J5cHRqc1wiIiwid2VicGFjazovLy9leHRlcm5hbCBcImNoYWxrXCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwiZGV2aWNlLWRldGVjdG9yLWpzXCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwiZXZlbnRzXCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwiZXhwcmVzc1wiIiwid2VicGFjazovLy9leHRlcm5hbCBcImV4cHJlc3MtYXN5bmMtaGFuZGxlclwiIiwid2VicGFjazovLy9leHRlcm5hbCBcImZzXCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwiZ3JhcGhxbC10b29sc1wiIiwid2VicGFjazovLy9leHRlcm5hbCBcImpzb253ZWJ0b2tlblwiIiwid2VicGFjazovLy9leHRlcm5hbCBcImtuZXhcIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJtb21lbnQtdGltZXpvbmVcIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJwZXJmX2hvb2tzXCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwidXVpZC92NFwiIiwid2VicGFjazovLy9leHRlcm5hbCBcIndpbnN0b25cIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJ3aW5zdG9uLWRhaWx5LXJvdGF0ZS1maWxlXCIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7UUFBQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FB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QUFpRCw2QkFBNkI7QUFDOUU7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUIsOEJBQThCLFFBQVEsaUNBQWlDLEtBQUssRUFBRSxTQUFTLEdBQUc7QUFDL0c7QUFDQSxXQUFXLG9DQUFvQyxJQUFJLGlDQUFpQyxLQUFLLEVBQUUsa0JBQWtCLEdBQUc7QUFDaEg7QUFDQSxxQkFBcUIsMEJBQTBCLFdBQVcsaUNBQWlDLEtBQUssRUFBRSxZQUFZLEdBQUc7QUFDakgscUJBQXFCLDhCQUE4QixPQUFPLGlDQUFpQyxLQUFLLEVBQUUsZUFBZSxHQUFHO0FBQ3BIOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBLEtBQUs7O0FBRUw7QUFDQSxxRkFBcUYsS0FBSztBQUMxRjtBQUNBLEtBQUssRUFBRTtBQUNQLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7O0FDcEdBLHFDOzs7Ozs7Ozs7OztBQ0FBLGtDOzs7Ozs7Ozs7OztBQ0FBLCtDOzs7Ozs7Ozs7OztBQ0FBLG1DOzs7Ozs7Ozs7OztBQ0FBLG9DOzs7Ozs7Ozs7OztBQ0FBLGtEOzs7Ozs7Ozs7OztBQ0FBLCtCOzs7Ozs7Ozs7OztBQ0FBLDBDOzs7Ozs7Ozs7OztBQ0FBLHlDOzs7Ozs7Ozs7OztBQ0FBLGlDOzs7Ozs7Ozs7OztBQ0FBLDRDOzs7Ozs7Ozs7OztBQ0FBLHVDOzs7Ozs7Ozs7OztBQ0FBLG9DOzs7Ozs7Ozs7OztBQ0FBLG9DOzs7Ozs7Ozs7OztBQ0FBLHNEIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZ2V0dGVyIH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSBmdW5jdGlvbihleHBvcnRzKSB7XG4gXHRcdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuIFx0XHR9XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG4gXHR9O1xuXG4gXHQvLyBjcmVhdGUgYSBmYWtlIG5hbWVzcGFjZSBvYmplY3RcbiBcdC8vIG1vZGUgJiAxOiB2YWx1ZSBpcyBhIG1vZHVsZSBpZCwgcmVxdWlyZSBpdFxuIFx0Ly8gbW9kZSAmIDI6IG1lcmdlIGFsbCBwcm9wZXJ0aWVzIG9mIHZhbHVlIGludG8gdGhlIG5zXG4gXHQvLyBtb2RlICYgNDogcmV0dXJuIHZhbHVlIHdoZW4gYWxyZWFkeSBucyBvYmplY3RcbiBcdC8vIG1vZGUgJiA4fDE6IGJlaGF2ZSBsaWtlIHJlcXVpcmVcbiBcdF9fd2VicGFja19yZXF1aXJlX18udCA9IGZ1bmN0aW9uKHZhbHVlLCBtb2RlKSB7XG4gXHRcdGlmKG1vZGUgJiAxKSB2YWx1ZSA9IF9fd2VicGFja19yZXF1aXJlX18odmFsdWUpO1xuIFx0XHRpZihtb2RlICYgOCkgcmV0dXJuIHZhbHVlO1xuIFx0XHRpZigobW9kZSAmIDQpICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgJiYgdmFsdWUuX19lc01vZHVsZSkgcmV0dXJuIHZhbHVlO1xuIFx0XHR2YXIgbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIobnMpO1xuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkobnMsICdkZWZhdWx0JywgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdmFsdWUgfSk7XG4gXHRcdGlmKG1vZGUgJiAyICYmIHR5cGVvZiB2YWx1ZSAhPSAnc3RyaW5nJykgZm9yKHZhciBrZXkgaW4gdmFsdWUpIF9fd2VicGFja19yZXF1aXJlX18uZChucywga2V5LCBmdW5jdGlvbihrZXkpIHsgcmV0dXJuIHZhbHVlW2tleV07IH0uYmluZChudWxsLCBrZXkpKTtcbiBcdFx0cmV0dXJuIG5zO1xuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IFwiLi9zcmMvaW5kZXgudHNcIik7XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2F3YWl0ZXIgPSAodGhpcyAmJiB0aGlzLl9fYXdhaXRlcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xuICAgIGZ1bmN0aW9uIGFkb3B0KHZhbHVlKSB7IHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFAgPyB2YWx1ZSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUodmFsdWUpOyB9KTsgfVxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XG4gICAgfSk7XG59O1xudmFyIF9faW1wb3J0RGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnREZWZhdWx0KSB8fCBmdW5jdGlvbiAobW9kKSB7XG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBcImRlZmF1bHRcIjogbW9kIH07XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgZnNfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiZnNcIikpO1xuY29uc3QganNvbndlYnRva2VuXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcImpzb253ZWJ0b2tlblwiKSk7XG5jb25zdCBtb21lbnRfdGltZXpvbmVfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwibW9tZW50LXRpbWV6b25lXCIpKTtcbmNvbnN0IHY0XzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcInV1aWQvdjRcIikpO1xuY29uc3QgaW5kZXhfMSA9IHJlcXVpcmUoXCJ+L2luZGV4XCIpO1xudmFyIFRva2VuVHlwZTtcbihmdW5jdGlvbiAoVG9rZW5UeXBlKSB7XG4gICAgVG9rZW5UeXBlW1wiYWNjZXNzXCJdID0gXCJhY2Nlc3NcIjtcbiAgICBUb2tlblR5cGVbXCJyZWZyZXNoXCJdID0gXCJyZWZyZXNoXCI7XG59KShUb2tlblR5cGUgPSBleHBvcnRzLlRva2VuVHlwZSB8fCAoZXhwb3J0cy5Ub2tlblR5cGUgPSB7fSkpO1xuY2xhc3MgQXV0aGVudGlmaWNhdG9yIHtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICB0aGlzLnByb3BzID0gcHJvcHM7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEV4dHJhY3QgVG9rZW4gZnJvbSBIVFRQIHJlcXVlc3QgaGVhZGVyc1xuICAgICAqIEBwYXJhbSAge1JlcXVlc3R9IHJlcXVlc3RcbiAgICAgKiBAcmV0dXJucyBzdHJpbmdcbiAgICAgKi9cbiAgICBzdGF0aWMgZXh0cmFjdFRva2VuKHJlcXVlc3QpIHtcbiAgICAgICAgY29uc3QgeyBoZWFkZXJzIH0gPSByZXF1ZXN0O1xuICAgICAgICBjb25zdCB7IGF1dGhvcml6YXRpb24gfSA9IGhlYWRlcnM7XG4gICAgICAgIGNvbnN0IGJlYXJlciA9IFN0cmluZyhhdXRob3JpemF0aW9uKS5zcGxpdCgnICcpWzBdO1xuICAgICAgICBjb25zdCB0b2tlbiA9IFN0cmluZyhhdXRob3JpemF0aW9uKS5zcGxpdCgnICcpWzFdO1xuICAgICAgICByZXR1cm4gYmVhcmVyLnRvTG9jYWxlTG93ZXJDYXNlKCkgPT09ICdiZWFyZXInID8gdG9rZW4gOiAnJztcbiAgICB9XG4gICAgLyoqXG4gICAgICogVmVyaWZ5IEpXVCB0b2tlblxuICAgICAqIEBwYXJhbSAge3N0cmluZ30gdG9rZW5cbiAgICAgKiBAcGFyYW0gIHtzdHJpbmd9IHB1YmxpY0tleVBhdGhcbiAgICAgKiBAcmV0dXJucyBJVG9rZW5JbmZvWydwYXlsb2FkJ11cbiAgICAgKi9cbiAgICBzdGF0aWMgdmVyaWZ5VG9rZW4odG9rZW4sIHB1YmxpY0tleVBhdGgpIHtcbiAgICAgICAgaWYgKHRva2VuID09PSBudWxsKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgaW5kZXhfMS5TZXJ2ZXJFcnJvcignVG9rZW4gdmVyaWZpY2F0aW9uIGZhaWxlZC4gVGhlIHRva2VuIG11c3QgYmUgcHJvdmlkZWQnKTtcbiAgICAgICAgfVxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcHVibGljS2V5ID0gZnNfMS5kZWZhdWx0LnJlYWRGaWxlU3luYyhwdWJsaWNLZXlQYXRoKTtcbiAgICAgICAgICAgIGNvbnN0IHBheWxvYWQgPSBqc29ud2VidG9rZW5fMS5kZWZhdWx0LnZlcmlmeShTdHJpbmcodG9rZW4pLCBwdWJsaWNLZXkpO1xuICAgICAgICAgICAgcmV0dXJuIHBheWxvYWQ7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IGluZGV4XzEuU2VydmVyRXJyb3IoJ1Rva2VuIHZlcmlmaWNhdGlvbiBmYWlsZWQnLCBlcnIpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJlZ2lzdGVyIHRva2Vuc1xuICAgICAqIEBwYXJhbSAge3t1dWlkOnN0cmluZztkZXZpY2VJbmZvOnt9O319IGRhdGFcbiAgICAgKiBAcmV0dXJucyBJVG9rZW5JbmZvXG4gICAgICovXG4gICAgcmVnaXN0ZXJUb2tlbnMoZGF0YSkge1xuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgY29uc3QgeyBjb250ZXh0IH0gPSB0aGlzLnByb3BzO1xuICAgICAgICAgICAgY29uc3QgeyBrbmV4LCBsb2dnZXIgfSA9IGNvbnRleHQ7XG4gICAgICAgICAgICBjb25zdCBhY2NvdW50ID0geWllbGQga25leFxuICAgICAgICAgICAgICAgIC5zZWxlY3QoWydpZCcsICdyb2xlcyddKVxuICAgICAgICAgICAgICAgIC5mcm9tKCdhY2NvdW50cycpXG4gICAgICAgICAgICAgICAgLndoZXJlKHtcbiAgICAgICAgICAgICAgICBpZDogZGF0YS51dWlkLFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuZmlyc3QoKTtcbiAgICAgICAgICAgIGNvbnN0IHRva2VucyA9IHRoaXMuZ2VuZXJhdGVUb2tlbnMoe1xuICAgICAgICAgICAgICAgIHV1aWQ6IGFjY291bnQuaWQsXG4gICAgICAgICAgICAgICAgcm9sZXM6IGFjY291bnQucm9sZXMsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8vIFJlZ2lzdGVyIGFjY2VzcyB0b2tlblxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB5aWVsZCBrbmV4KCd0b2tlbnMnKS5pbnNlcnQoe1xuICAgICAgICAgICAgICAgICAgICBpZDogdG9rZW5zLmFjY2Vzc1Rva2VuLnBheWxvYWQuaWQsXG4gICAgICAgICAgICAgICAgICAgIGFjY291bnQ6IHRva2Vucy5hY2Nlc3NUb2tlbi5wYXlsb2FkLnV1aWQsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFRva2VuVHlwZS5hY2Nlc3MsXG4gICAgICAgICAgICAgICAgICAgIGRldmljZUluZm86IGRhdGEuZGV2aWNlSW5mbyxcbiAgICAgICAgICAgICAgICAgICAgZXhwaXJlZEF0OiBtb21lbnRfdGltZXpvbmVfMS5kZWZhdWx0KHRva2Vucy5hY2Nlc3NUb2tlbi5wYXlsb2FkLmV4cCkuZm9ybWF0KCksXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IGluZGV4XzEuU2VydmVyRXJyb3IoJ0ZhaWxlZCB0byByZWdpc3RlciBhY2Nlc3MgdG9rZW4nLCBlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gcmVnaXN0ZXIgcmVmcmVzaCB0b2tlblxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB5aWVsZCBrbmV4KCd0b2tlbnMnKS5pbnNlcnQoe1xuICAgICAgICAgICAgICAgICAgICBpZDogdG9rZW5zLnJlZnJlc2hUb2tlbi5wYXlsb2FkLmlkLFxuICAgICAgICAgICAgICAgICAgICBhY2NvdW50OiB0b2tlbnMucmVmcmVzaFRva2VuLnBheWxvYWQudXVpZCxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogVG9rZW5UeXBlLnJlZnJlc2gsXG4gICAgICAgICAgICAgICAgICAgIGFzc29jaWF0ZWQ6IHRva2Vucy5hY2Nlc3NUb2tlbi5wYXlsb2FkLmlkLFxuICAgICAgICAgICAgICAgICAgICBkZXZpY2VJbmZvOiBkYXRhLmRldmljZUluZm8sXG4gICAgICAgICAgICAgICAgICAgIGV4cGlyZWRBdDogbW9tZW50X3RpbWV6b25lXzEuZGVmYXVsdCh0b2tlbnMucmVmcmVzaFRva2VuLnBheWxvYWQuZXhwKS5mb3JtYXQoKSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgaW5kZXhfMS5TZXJ2ZXJFcnJvcignRmFpbGVkIHRvIHJlZ2lzdGVyIHJlZnJlc2ggdG9rZW4nLCBlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbG9nZ2VyLmF1dGguaW5mbygnTmV3IEFjY2VzcyB0b2tlbiB3YXMgcmVnaXN0ZXJlZCcsIHRva2Vucy5hY2Nlc3NUb2tlbi5wYXlsb2FkKTtcbiAgICAgICAgICAgIHJldHVybiB0b2tlbnM7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBnZW5lcmF0ZVRva2VucyhwYXlsb2FkKSB7XG4gICAgICAgIGNvbnN0IHsgY29udGV4dCB9ID0gdGhpcy5wcm9wcztcbiAgICAgICAgLy8gY2hlY2sgZmlsZSB0byBhY2Nlc3MgYW5kIHJlYWRhYmxlXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBmc18xLmRlZmF1bHQuYWNjZXNzU3luYyhjb250ZXh0Lmp3dC5wcml2YXRlS2V5KTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgaW5kZXhfMS5TZXJ2ZXJFcnJvcignRmFpbGVkIHRvIG9wZW4gSldUIHByaXZhdGVLZXkgZmlsZScsIHsgZXJyIH0pO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHByaXZhdEtleSA9IGZzXzEuZGVmYXVsdC5yZWFkRmlsZVN5bmMoY29udGV4dC5qd3QucHJpdmF0ZUtleSk7XG4gICAgICAgIGNvbnN0IGFjY2Vzc1Rva2VuUGF5bG9hZCA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7fSwgcGF5bG9hZCksIHsgdHlwZTogVG9rZW5UeXBlLmFjY2VzcywgaWQ6IHY0XzEuZGVmYXVsdCgpLCBleHA6IERhdGUubm93KCkgKyBOdW1iZXIoY29udGV4dC5qd3QuYWNjZXNzVG9rZW5FeHBpcmVzSW4pICogMTAwMCwgaXNzOiBjb250ZXh0Lmp3dC5pc3N1ZXIgfSk7XG4gICAgICAgIGNvbnN0IHJlZnJlc2hUb2tlblBheWxvYWQgPSBPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oe30sIHBheWxvYWQpLCB7IHR5cGU6IFRva2VuVHlwZS5yZWZyZXNoLCBpZDogdjRfMS5kZWZhdWx0KCksIGFzc29jaWF0ZWQ6IGFjY2Vzc1Rva2VuUGF5bG9hZC5pZCwgZXhwOiBEYXRlLm5vdygpICsgTnVtYmVyKGNvbnRleHQuand0LnJlZnJlc2hUb2tlbkV4cGlyZXNJbikgKiAxMDAwLCBpc3M6IGNvbnRleHQuand0Lmlzc3VlciB9KTtcbiAgICAgICAgY29uc3QgYWNjZXNzVG9rZW4gPSBqc29ud2VidG9rZW5fMS5kZWZhdWx0LnNpZ24oYWNjZXNzVG9rZW5QYXlsb2FkLCBwcml2YXRLZXksIHtcbiAgICAgICAgICAgIGFsZ29yaXRobTogY29udGV4dC5qd3QuYWxnb3JpdGhtLFxuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgcmVmcmVzaFRva2VuID0ganNvbndlYnRva2VuXzEuZGVmYXVsdC5zaWduKHJlZnJlc2hUb2tlblBheWxvYWQsIHByaXZhdEtleSwge1xuICAgICAgICAgICAgYWxnb3JpdGhtOiBjb250ZXh0Lmp3dC5hbGdvcml0aG0sXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgYWNjZXNzVG9rZW46IHtcbiAgICAgICAgICAgICAgICB0b2tlbjogYWNjZXNzVG9rZW4sXG4gICAgICAgICAgICAgICAgcGF5bG9hZDogT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHt9LCBhY2Nlc3NUb2tlblBheWxvYWQpLCB7IHR5cGU6IFRva2VuVHlwZS5hY2Nlc3MgfSksXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcmVmcmVzaFRva2VuOiB7XG4gICAgICAgICAgICAgICAgdG9rZW46IHJlZnJlc2hUb2tlbixcbiAgICAgICAgICAgICAgICBwYXlsb2FkOiBPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oe30sIHJlZnJlc2hUb2tlblBheWxvYWQpLCB7IHR5cGU6IFRva2VuVHlwZS5yZWZyZXNoIH0pLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfTtcbiAgICB9XG4gICAgcmV2b2tlVG9rZW4odG9rZW5JZCkge1xuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgY29uc3QgeyBjb250ZXh0IH0gPSB0aGlzLnByb3BzO1xuICAgICAgICAgICAgY29uc3QgeyBrbmV4IH0gPSBjb250ZXh0O1xuICAgICAgICAgICAgeWllbGQga25leC5kZWwoJ3Rva2VucycpLndoZXJlKHtcbiAgICAgICAgICAgICAgICBpZDogdG9rZW5JZCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgY2hlY2tUb2tlbkV4aXN0KHRva2VuSWQpIHtcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgIGNvbnN0IHsgY29udGV4dCB9ID0gdGhpcy5wcm9wcztcbiAgICAgICAgICAgIGNvbnN0IHsga25leCB9ID0gY29udGV4dDtcbiAgICAgICAgICAgIGNvbnN0IHRva2VuRGF0YSA9IHlpZWxkIGtuZXhcbiAgICAgICAgICAgICAgICAuc2VsZWN0KFsnaWQnXSlcbiAgICAgICAgICAgICAgICAuZnJvbSgndG9rZW5zJylcbiAgICAgICAgICAgICAgICAud2hlcmUoeyBpZDogdG9rZW5JZCB9KVxuICAgICAgICAgICAgICAgIC5maXJzdCgpO1xuICAgICAgICAgICAgcmV0dXJuIHRva2VuRGF0YSAhPT0gbnVsbDtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGdldEFjY291bnRCeUxvZ2luKGxvZ2luKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICBjb25zdCB7IGNvbnRleHQgfSA9IHRoaXMucHJvcHM7XG4gICAgICAgICAgICBjb25zdCB7IGtuZXggfSA9IGNvbnRleHQ7XG4gICAgICAgICAgICBjb25zdCBhY2NvdW50ID0geWllbGQga25leFxuICAgICAgICAgICAgICAgIC5zZWxlY3QoWydpZCcsICdwYXNzd29yZCcsICdzdGF0dXMnXSlcbiAgICAgICAgICAgICAgICAuZnJvbSgnYWNjb3VudHMnKVxuICAgICAgICAgICAgICAgIC53aGVyZSh7XG4gICAgICAgICAgICAgICAgbG9naW4sXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5maXJzdCgpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBpZDogYWNjb3VudC5pZCxcbiAgICAgICAgICAgICAgICBwYXNzd29yZDogYWNjb3VudC5wYXNzd29yZCxcbiAgICAgICAgICAgICAgICBzdGF0dXM6IGFjY291bnQuc3RhdHVzLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHN0YXRpYyBzZW5kUmVzcG9uc2VFcnJvcihyZXNwb25zZXR5cGUsIHJlc3ApIHtcbiAgICAgICAgY29uc3QgZXJyb3JzID0gW107XG4gICAgICAgIHN3aXRjaCAocmVzcG9uc2V0eXBlKSB7XG4gICAgICAgICAgICBjYXNlICdhY2NvdW50Rm9yYmlkZGVuJzpcbiAgICAgICAgICAgICAgICBlcnJvcnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdBY2NvdW50IGxvY2tlZCcsXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICdBdXRob3JpemF0aW9uIGVycm9yJyxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2F1dGhlbnRpZmljYXRpb25SZXF1aXJlZCc6XG4gICAgICAgICAgICAgICAgZXJyb3JzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiAnQXV0aGVudGljYXRpb24gUmVxdWlyZWQnLFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnQXV0aG9yaXphdGlvbiBlcnJvcicsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdpc05vdEFSZWZyZXNoVG9rZW4nOlxuICAgICAgICAgICAgICAgIGVycm9ycy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogJ1Rva2VuIGVycm9yJyxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ0lzIG5vdCBhIHJlZnJlc2ggdG9rZW4nLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAndG9rZW5FeHBpcmVkJzpcbiAgICAgICAgICAgICAgICBlcnJvcnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdUb2tlbiBlcnJvcicsXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICdUaGlzIHRva2VuIGV4cGlyZWQnLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAndG9rZW5XYXNSZXZva2VkJzpcbiAgICAgICAgICAgICAgICBlcnJvcnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdUb2tlbiBlcnJvcicsXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICdUb2tlbiB3YXMgcmV2b2tlZCcsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdhY2NvdW50Tm90Rm91bmQnOlxuICAgICAgICAgICAgY2FzZSAnaW52YWxpZExvZ2luT3JQYXNzd29yZCc6XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGVycm9ycy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogJ0ludmFsaWQgbG9naW4gb3IgcGFzc3dvcmQnLFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnQXV0aG9yaXphdGlvbiBlcnJvcicsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3Auc3RhdHVzKDQwMSkuanNvbih7IGVycm9ycyB9KTtcbiAgICB9XG59XG5leHBvcnRzLkF1dGhlbnRpZmljYXRvciA9IEF1dGhlbnRpZmljYXRvcjtcbnZhciBSZXNwb25zZUVycm9yVHlwZTtcbihmdW5jdGlvbiAoUmVzcG9uc2VFcnJvclR5cGUpIHtcbiAgICBSZXNwb25zZUVycm9yVHlwZVtcImF1dGhlbnRpZmljYXRpb25SZXF1aXJlZFwiXSA9IFwiYXV0aGVudGlmaWNhdGlvblJlcXVpcmVkXCI7XG4gICAgUmVzcG9uc2VFcnJvclR5cGVbXCJhY2NvdW50Tm90Rm91bmRcIl0gPSBcImFjY291bnROb3RGb3VuZFwiO1xuICAgIFJlc3BvbnNlRXJyb3JUeXBlW1wiYWNjb3VudEZvcmJpZGRlblwiXSA9IFwiYWNjb3VudEZvcmJpZGRlblwiO1xuICAgIFJlc3BvbnNlRXJyb3JUeXBlW1wiaW52YWxpZExvZ2luT3JQYXNzd29yZFwiXSA9IFwiaW52YWxpZExvZ2luT3JQYXNzd29yZFwiO1xuICAgIFJlc3BvbnNlRXJyb3JUeXBlW1widG9rZW5FeHBpcmVkXCJdID0gXCJ0b2tlbkV4cGlyZWRcIjtcbiAgICBSZXNwb25zZUVycm9yVHlwZVtcImlzTm90QVJlZnJlc2hUb2tlblwiXSA9IFwiaXNOb3RBUmVmcmVzaFRva2VuXCI7XG4gICAgUmVzcG9uc2VFcnJvclR5cGVbXCJ0b2tlbldhc1Jldm9rZWRcIl0gPSBcInRva2VuV2FzUmV2b2tlZFwiO1xufSkoUmVzcG9uc2VFcnJvclR5cGUgPSBleHBvcnRzLlJlc3BvbnNlRXJyb3JUeXBlIHx8IChleHBvcnRzLlJlc3BvbnNlRXJyb3JUeXBlID0ge30pKTtcbnZhciBBY2NvdW50U3RhdHVzO1xuKGZ1bmN0aW9uIChBY2NvdW50U3RhdHVzKSB7XG4gICAgQWNjb3VudFN0YXR1c1tcImFsbG93ZWRcIl0gPSBcImFsbG93ZWRcIjtcbiAgICBBY2NvdW50U3RhdHVzW1wiZm9yYmlkZGVuXCJdID0gXCJmb3JiaWRkZW5cIjtcbn0pKEFjY291bnRTdGF0dXMgPSBleHBvcnRzLkFjY291bnRTdGF0dXMgfHwgKGV4cG9ydHMuQWNjb3VudFN0YXR1cyA9IHt9KSk7XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2F3YWl0ZXIgPSAodGhpcyAmJiB0aGlzLl9fYXdhaXRlcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xuICAgIGZ1bmN0aW9uIGFkb3B0KHZhbHVlKSB7IHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFAgPyB2YWx1ZSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUodmFsdWUpOyB9KTsgfVxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XG4gICAgfSk7XG59O1xudmFyIF9faW1wb3J0RGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnREZWZhdWx0KSB8fCBmdW5jdGlvbiAobW9kKSB7XG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBcImRlZmF1bHRcIjogbW9kIH07XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgYmNyeXB0anNfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiYmNyeXB0anNcIikpO1xuY29uc3QgZGV2aWNlX2RldGVjdG9yX2pzXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcImRldmljZS1kZXRlY3Rvci1qc1wiKSk7XG5jb25zdCBleHByZXNzXzEgPSByZXF1aXJlKFwiZXhwcmVzc1wiKTtcbmNvbnN0IGV4cHJlc3NfYXN5bmNfaGFuZGxlcl8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCJleHByZXNzLWFzeW5jLWhhbmRsZXJcIikpO1xuY29uc3QgQXV0aGVudGlmaWNhdG9yXzEgPSByZXF1aXJlKFwiLi9BdXRoZW50aWZpY2F0b3JcIik7XG5jb25zdCBhdXRoZW50aWZpY2F0b3JNaWRkbGV3YXJlID0gKGNvbmZpZykgPT4ge1xuICAgIGNvbnN0IHsgY29udGV4dCwgYXV0aFVybCwgYWxsb3dlZFVybCB9ID0gY29uZmlnO1xuICAgIGNvbnN0IHsgZW5kcG9pbnQgfSA9IGNvbmZpZy5jb250ZXh0O1xuICAgIGNvbnN0IHsgcHVibGljS2V5IH0gPSBjb25maWcuY29udGV4dC5qd3Q7XG4gICAgY29uc3QgeyBsb2dnZXIgfSA9IGNvbnRleHQ7XG4gICAgY29uc3QgYXV0aGVudGlmaWNhdG9yID0gbmV3IEF1dGhlbnRpZmljYXRvcl8xLkF1dGhlbnRpZmljYXRvcih7IGNvbnRleHQgfSk7XG4gICAgY29uc3Qgcm91dGVyID0gZXhwcmVzc18xLlJvdXRlcigpO1xuICAgIHJvdXRlci5wb3N0KGAke2F1dGhVcmx9L2FjY2Vzcy10b2tlbmAsIGV4cHJlc3NfYXN5bmNfaGFuZGxlcl8xLmRlZmF1bHQoKHJlcSwgcmVzKSA9PiBfX2F3YWl0ZXIodm9pZCAwLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgY29uc3QgeyBib2R5LCBoZWFkZXJzIH0gPSByZXE7XG4gICAgICAgIGNvbnN0IHsgbG9naW4sIHBhc3N3b3JkIH0gPSBib2R5O1xuICAgICAgICBjb25zdCBkZXZpY2VEZXRlY3RvciA9IG5ldyBkZXZpY2VfZGV0ZWN0b3JfanNfMS5kZWZhdWx0KCk7XG4gICAgICAgIGNvbnN0IGRldmljZUluZm8gPSBkZXZpY2VEZXRlY3Rvci5wYXJzZShoZWFkZXJzWyd1c2VyLWFnZW50J10pO1xuICAgICAgICBsb2dnZXIuYXV0aC5pbmZvKCdBY2Nlc3MgdG9rZW4gcmVxdWVzdCcsIHsgbG9naW4gfSk7XG4gICAgICAgIGNvbnN0IGFjY291bnQgPSB5aWVsZCBhdXRoZW50aWZpY2F0b3IuZ2V0QWNjb3VudEJ5TG9naW4obG9naW4pO1xuICAgICAgICAvLyBhY2NvdW50IG5vdCBmb3VuZFxuICAgICAgICBpZiAoIWFjY291bnQgfHwgIWJjcnlwdGpzXzEuZGVmYXVsdC5jb21wYXJlU3luYyhwYXNzd29yZCwgYWNjb3VudC5wYXNzd29yZCkpIHtcbiAgICAgICAgICAgIGxvZ2dlci5hdXRoLmVycm9yKCdBY2NvdW50IG5vdCBmb3VuZCcsIHsgbG9naW4gfSk7XG4gICAgICAgICAgICByZXR1cm4gQXV0aGVudGlmaWNhdG9yXzEuQXV0aGVudGlmaWNhdG9yLnNlbmRSZXNwb25zZUVycm9yKEF1dGhlbnRpZmljYXRvcl8xLlJlc3BvbnNlRXJyb3JUeXBlLmFjY291bnROb3RGb3VuZCwgcmVzKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBhY2NvdW50IGxvY2tlZFxuICAgICAgICBpZiAoYWNjb3VudC5zdGF0dXMgPT09IEF1dGhlbnRpZmljYXRvcl8xLkFjY291bnRTdGF0dXMuZm9yYmlkZGVuICYmIGJjcnlwdGpzXzEuZGVmYXVsdC5jb21wYXJlU3luYyhwYXNzd29yZCwgYWNjb3VudC5wYXNzd29yZCkpIHtcbiAgICAgICAgICAgIGxvZ2dlci5hdXRoLmluZm8oJ0F1dGhlbnRpZmljYXRpb24gZm9yYmlkZGVuJywgeyBsb2dpbiB9KTtcbiAgICAgICAgICAgIHJldHVybiBBdXRoZW50aWZpY2F0b3JfMS5BdXRoZW50aWZpY2F0b3Iuc2VuZFJlc3BvbnNlRXJyb3IoQXV0aGVudGlmaWNhdG9yXzEuUmVzcG9uc2VFcnJvclR5cGUuYWNjb3VudEZvcmJpZGRlbiwgcmVzKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBzdWNjZXNzXG4gICAgICAgIGlmIChhY2NvdW50LnN0YXR1cyA9PT0gQXV0aGVudGlmaWNhdG9yXzEuQWNjb3VudFN0YXR1cy5hbGxvd2VkICYmIGJjcnlwdGpzXzEuZGVmYXVsdC5jb21wYXJlU3luYyhwYXNzd29yZCwgYWNjb3VudC5wYXNzd29yZCkpIHtcbiAgICAgICAgICAgIGNvbnN0IHRva2VucyA9IHlpZWxkIGF1dGhlbnRpZmljYXRvci5yZWdpc3RlclRva2Vucyh7XG4gICAgICAgICAgICAgICAgdXVpZDogYWNjb3VudC5pZCxcbiAgICAgICAgICAgICAgICBkZXZpY2VJbmZvLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cygyMDApLmpzb24oe1xuICAgICAgICAgICAgICAgIGFjY2Vzc1Rva2VuOiB0b2tlbnMuYWNjZXNzVG9rZW4udG9rZW4sXG4gICAgICAgICAgICAgICAgdG9rZW5UeXBlOiAnYmVhcmVyJyxcbiAgICAgICAgICAgICAgICBleHBpcmVzSW46IGNvbmZpZy5jb250ZXh0Lmp3dC5hY2Nlc3NUb2tlbkV4cGlyZXNJbixcbiAgICAgICAgICAgICAgICByZWZyZXNoVG9rZW46IHRva2Vucy5yZWZyZXNoVG9rZW4udG9rZW4sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gQXV0aGVudGlmaWNhdG9yXzEuQXV0aGVudGlmaWNhdG9yLnNlbmRSZXNwb25zZUVycm9yKEF1dGhlbnRpZmljYXRvcl8xLlJlc3BvbnNlRXJyb3JUeXBlLmFjY291bnROb3RGb3VuZCwgcmVzKTtcbiAgICB9KSkpO1xuICAgIHJvdXRlci5wb3N0KGAke2F1dGhVcmx9L3JlZnJlc2gtdG9rZW5gLCBleHByZXNzX2FzeW5jX2hhbmRsZXJfMS5kZWZhdWx0KChyZXEsIHJlcykgPT4gX19hd2FpdGVyKHZvaWQgMCwgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgIGNvbnN0IHsgYm9keSwgaGVhZGVycyB9ID0gcmVxO1xuICAgICAgICBjb25zdCB7IHRva2VuIH0gPSBib2R5O1xuICAgICAgICAvLyB0cnkgdG8gdmVyaWZ5IHJlZnJlc2ggdG9rZW5cbiAgICAgICAgY29uc3QgdG9rZW5QYXlsb2FkID0gQXV0aGVudGlmaWNhdG9yXzEuQXV0aGVudGlmaWNhdG9yLnZlcmlmeVRva2VuKHRva2VuLCBjb250ZXh0Lmp3dC5wdWJsaWNLZXkpO1xuICAgICAgICBpZiAodG9rZW5QYXlsb2FkLnR5cGUgIT09IEF1dGhlbnRpZmljYXRvcl8xLlRva2VuVHlwZS5yZWZyZXNoKSB7XG4gICAgICAgICAgICBsb2dnZXIuYXV0aC5pbmZvKCdUcmllZCB0byByZWZyZXNoIHRva2VuIGJ5IGFjY2VzcyB0b2tlbi4gUmVqZWN0ZWQnLCB7IHBheWxvYWQ6IHRva2VuUGF5bG9hZCB9KTtcbiAgICAgICAgICAgIHJldHVybiBBdXRoZW50aWZpY2F0b3JfMS5BdXRoZW50aWZpY2F0b3Iuc2VuZFJlc3BvbnNlRXJyb3IoQXV0aGVudGlmaWNhdG9yXzEuUmVzcG9uc2VFcnJvclR5cGUuaXNOb3RBUmVmcmVzaFRva2VuLCByZXMpO1xuICAgICAgICB9XG4gICAgICAgIC8vIGNoZWNrIHRvIHRva2VuIGV4aXN0XG4gICAgICAgIGlmICghKHlpZWxkIGF1dGhlbnRpZmljYXRvci5jaGVja1Rva2VuRXhpc3QodG9rZW5QYXlsb2FkLmlkKSkpIHtcbiAgICAgICAgICAgIGxvZ2dlci5hdXRoLmluZm8oJ1RyaWVkIHRvIHJlZnJlc2ggdG9rZW4gYnkgcmV2b2tlZCByZWZyZXNoIHRva2VuLiBSZWplY3RlZCcsIHsgcGF5bG9hZDogdG9rZW5QYXlsb2FkIH0pO1xuICAgICAgICAgICAgcmV0dXJuIEF1dGhlbnRpZmljYXRvcl8xLkF1dGhlbnRpZmljYXRvci5zZW5kUmVzcG9uc2VFcnJvcihBdXRoZW50aWZpY2F0b3JfMS5SZXNwb25zZUVycm9yVHlwZS50b2tlbldhc1Jldm9rZWQsIHJlcyk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZGV2aWNlRGV0ZWN0b3IgPSBuZXcgZGV2aWNlX2RldGVjdG9yX2pzXzEuZGVmYXVsdCgpO1xuICAgICAgICBjb25zdCBkZXZpY2VJbmZvID0gZGV2aWNlRGV0ZWN0b3IucGFyc2UoaGVhZGVyc1sndXNlci1hZ2VudCddKTtcbiAgICAgICAgLy8gcmV2b2tlIG9sZCBhY2Nlc3MgdG9rZW4gb2YgdGhpcyByZWZyZXNoXG4gICAgICAgIHlpZWxkIGF1dGhlbnRpZmljYXRvci5yZXZva2VUb2tlbih0b2tlblBheWxvYWQuYXNzb2NpYXRlZCk7XG4gICAgICAgIC8vIHJldm9rZSBvbGQgcmVmcmVzaCB0b2tlblxuICAgICAgICB5aWVsZCBhdXRoZW50aWZpY2F0b3IucmV2b2tlVG9rZW4odG9rZW5QYXlsb2FkLmlkKTtcbiAgICAgICAgLy8gY3JlYXRlIG5ldyB0b2tlbnNcbiAgICAgICAgY29uc3QgdG9rZW5zID0geWllbGQgYXV0aGVudGlmaWNhdG9yLnJlZ2lzdGVyVG9rZW5zKHtcbiAgICAgICAgICAgIHV1aWQ6IHRva2VuUGF5bG9hZC51dWlkLFxuICAgICAgICAgICAgZGV2aWNlSW5mbyxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDIwMCkuanNvbih7XG4gICAgICAgICAgICBhY2Nlc3NUb2tlbjogdG9rZW5zLmFjY2Vzc1Rva2VuLnRva2VuLFxuICAgICAgICAgICAgdG9rZW5UeXBlOiAnYmVhcmVyJyxcbiAgICAgICAgICAgIGV4cGlyZXNJbjogY29uZmlnLmNvbnRleHQuand0LmFjY2Vzc1Rva2VuRXhwaXJlc0luLFxuICAgICAgICAgICAgcmVmcmVzaFRva2VuOiB0b2tlbnMucmVmcmVzaFRva2VuLnRva2VuLFxuICAgICAgICB9KTtcbiAgICB9KSkpO1xuICAgIHJvdXRlci51c2UoZW5kcG9pbnQsIGV4cHJlc3NfYXN5bmNfaGFuZGxlcl8xLmRlZmF1bHQoKHJlcSwgcmVzLCBuZXh0KSA9PiBfX2F3YWl0ZXIodm9pZCAwLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgaWYgKGFsbG93ZWRVcmwuaW5jbHVkZXMocmVxLm9yaWdpbmFsVXJsKSkge1xuICAgICAgICAgICAgcmV0dXJuIG5leHQoKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB0b2tlbiA9IEF1dGhlbnRpZmljYXRvcl8xLkF1dGhlbnRpZmljYXRvci5leHRyYWN0VG9rZW4ocmVxKTtcbiAgICAgICAgQXV0aGVudGlmaWNhdG9yXzEuQXV0aGVudGlmaWNhdG9yLnZlcmlmeVRva2VuKHRva2VuLCBwdWJsaWNLZXkpO1xuICAgICAgICByZXR1cm4gQXV0aGVudGlmaWNhdG9yXzEuQXV0aGVudGlmaWNhdG9yLnNlbmRSZXNwb25zZUVycm9yKEF1dGhlbnRpZmljYXRvcl8xLlJlc3BvbnNlRXJyb3JUeXBlLmF1dGhlbnRpZmljYXRpb25SZXF1aXJlZCwgcmVzKTtcbiAgICB9KSkpO1xuICAgIHJldHVybiByb3V0ZXI7XG59O1xuZXhwb3J0cy5hdXRoZW50aWZpY2F0b3JNaWRkbGV3YXJlID0gYXV0aGVudGlmaWNhdG9yTWlkZGxld2FyZTtcbmV4cG9ydHMuZGVmYXVsdCA9IGF1dGhlbnRpZmljYXRvck1pZGRsZXdhcmU7XG4iLCJcInVzZSBzdHJpY3RcIjtcbmZ1bmN0aW9uIF9fZXhwb3J0KG0pIHtcbiAgICBmb3IgKHZhciBwIGluIG0pIGlmICghZXhwb3J0cy5oYXNPd25Qcm9wZXJ0eShwKSkgZXhwb3J0c1twXSA9IG1bcF07XG59XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5fX2V4cG9ydChyZXF1aXJlKFwiLi9BdXRoZW50aWZpY2F0b3JcIikpO1xuX19leHBvcnQocmVxdWlyZShcIi4vYXV0aGVudGlmaWNhdG9yTWlkZGxld2FyZVwiKSk7XG4vLyBUT0RPIFRlc3RzIHJldWlyZWRcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9faW1wb3J0RGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnREZWZhdWx0KSB8fCBmdW5jdGlvbiAobW9kKSB7XG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBcImRlZmF1bHRcIjogbW9kIH07XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuLy8gaW1wb3J0IHsgY3JlYXRlU2VydmVyIH0gZnJvbSAnaHR0cCc7XG5jb25zdCBjaGFsa18xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCJjaGFsa1wiKSk7XG4vLyBpbXBvcnQgeyBTdWJzY3JpcHRpb25TZXJ2ZXIgfSBmcm9tICdzdWJzY3JpcHRpb25zLXRyYW5zcG9ydC13cyc7XG5jb25zdCBsb2dnZXJfMSA9IHJlcXVpcmUoXCJ+L2xvZ2dlclwiKTtcbmNvbnN0IHNlcnZlcl8xID0gcmVxdWlyZShcIn4vc2VydmVyXCIpO1xuY2xhc3MgQ29yZSB7XG4gICAgc3RhdGljIGluaXQoY29uZmlnKSB7XG4gICAgICAgIGNvbnN0IHsgcG9ydCwgZW5kcG9pbnQsIHJvdXRlcywgbG9nZ2VyIH0gPSBjb25maWc7XG4gICAgICAgIGNvbnN0IHJvdXRlc0xpc3QgPSBzZXJ2ZXJfMS5nZXRSb3V0ZXMoZW5kcG9pbnQsIHJvdXRlcyk7XG4gICAgICAgIC8vIGNoZWNrIGNvbm5lY3Rpb25cbiAgICAgICAgLy8gQ3JlYXRlIGxpc3RlbmVyIHNlcnZlciBieSB3cmFwcGluZyBleHByZXNzIGFwcFxuICAgICAgICBjb25zdCB7IHNlcnZlciwgY29udGV4dCB9ID0gc2VydmVyXzEuY3JlYXRlU2VydmVyKGNvbmZpZyk7XG4gICAgICAgIGNvbnN0IHsga25leCB9ID0gY29udGV4dDtcbiAgICAgICAga25leFxuICAgICAgICAgICAgLnJhdygnU0VMRUNUIDErMSBBUyByZXN1bHQnKVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgbG9nZ2VyLnNlcnZlci5kZWJ1ZygnVGVzdCB0aGUgY29ubmVjdGlvbiBieSB0cnlpbmcgdG8gYXV0aGVudGljYXRlIGlzIE9LJyk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSlcbiAgICAgICAgICAgIC5jYXRjaChlcnIgPT4ge1xuICAgICAgICAgICAgbG9nZ2VyLnNlcnZlci5lcnJvcihlcnIubmFtZSwgZXJyKTtcbiAgICAgICAgICAgIHRocm93IG5ldyBsb2dnZXJfMS5TZXJ2ZXJFcnJvcihlcnIpO1xuICAgICAgICB9KTtcbiAgICAgICAgc2VydmVyLmxpc3Rlbihwb3J0LCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnJyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnJyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhjaGFsa18xLmRlZmF1bHQuZ3JlZW4oJz09PT09PT09PSBHcmFwaFFMID09PT09PT09PScpKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCcnKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2NoYWxrXzEuZGVmYXVsdC5ncmVlbignR3JhcGhRTCBzZXJ2ZXInKX06ICAgICAke2NoYWxrXzEuZGVmYXVsdC55ZWxsb3coYGh0dHA6Ly9sb2NhbGhvc3Q6JHtwb3J0fSR7ZW5kcG9pbnR9YCl9YCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtjaGFsa18xLmRlZmF1bHQubWFnZW50YSgnR3JhcGhRTCBwbGF5Z3JvdW5kJyl9OiAke2NoYWxrXzEuZGVmYXVsdC55ZWxsb3coYGh0dHA6Ly9sb2NhbGhvc3Q6JHtwb3J0fSR7cm91dGVzTGlzdC5wbGF5Z3JvdW5kfWApfWApO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYCR7Y2hhbGtfMS5kZWZhdWx0LmN5YW4oJ0F1dGggU2VydmVyJyl9OiAgICAgICAgJHtjaGFsa18xLmRlZmF1bHQueWVsbG93KGBodHRwOi8vbG9jYWxob3N0OiR7cG9ydH0ke3JvdXRlc0xpc3QuYXV0aH1gKX1gKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2NoYWxrXzEuZGVmYXVsdC5ibHVlKCdHcmFwaFFMIHZveWFnZXInKX06ICAgICR7Y2hhbGtfMS5kZWZhdWx0LnllbGxvdyhgaHR0cDovL2xvY2FsaG9zdDoke3BvcnR9JHtyb3V0ZXNMaXN0LnZveWFnZXJ9YCl9YCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnJyk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gc2VydmVyO1xuICAgICAgICAvLyBjb25zdCB3ZWJTZXJ2ZXIgPSBjcmVhdGVTZXJ2ZXIocyk7XG4gICAgICAgIC8vIHdlYlNlcnZlci5saXN0ZW4ocG9ydCwgKCkgPT4ge1xuICAgICAgICAvLyAgIC8vIGxvZ2dlci5zZXJ2ZXIuZGVidWcoJ1NlcnZlciB3YXMgc3RhcnRlZCcsIHsgcG9ydCwgZW5kcG9pbnQsIHJvdXRlcyB9KTtcbiAgICAgICAgLy8gICBjb25zb2xlLmxvZygnJyk7XG4gICAgICAgIC8vICAgY29uc29sZS5sb2coJycpO1xuICAgICAgICAvLyAgIGNvbnNvbGUubG9nKGNoYWxrLmdyZWVuKCc9PT09PT09PT0gR3JhcGhRTCA9PT09PT09PT0nKSk7XG4gICAgICAgIC8vICAgY29uc29sZS5sb2coJycpO1xuICAgICAgICAvLyAgIGNvbnNvbGUubG9nKGAke2NoYWxrLmdyZWVuKCdHcmFwaFFMIHNlcnZlcicpfTogICAgICR7Y2hhbGsueWVsbG93KGBodHRwOi8vbG9jYWxob3N0OiR7cG9ydH0ke2VuZHBvaW50fWApfWApO1xuICAgICAgICAvLyAgIGNvbnNvbGUubG9nKFxuICAgICAgICAvLyAgICAgYCR7Y2hhbGsubWFnZW50YSgnR3JhcGhRTCBwbGF5Z3JvdW5kJyl9OiAke2NoYWxrLnllbGxvdyhgaHR0cDovL2xvY2FsaG9zdDoke3BvcnR9JHtyb3V0ZXMucGxheWdyb3VuZH1gKX1gLFxuICAgICAgICAvLyAgICk7XG4gICAgICAgIC8vICAgY29uc29sZS5sb2coYCR7Y2hhbGsuY3lhbignQXV0aCBTZXJ2ZXInKX06ICAgICAgICAke2NoYWxrLnllbGxvdyhgaHR0cDovL2xvY2FsaG9zdDoke3BvcnR9JHtyb3V0ZXMuYXV0aH1gKX1gKTtcbiAgICAgICAgLy8gICBjb25zb2xlLmxvZyhgJHtjaGFsay5ibHVlKCdHcmFwaFFMIHZveWFnZXInKX06ICAgICR7Y2hhbGsueWVsbG93KGBodHRwOi8vbG9jYWxob3N0OiR7cG9ydH0ke3JvdXRlcy52b3lhZ2VyfWApfWApO1xuICAgICAgICAvLyAgIGNvbnNvbGUubG9nKCcnKTtcbiAgICAgICAgLy8gU2V0IHVwIHRoZSBXZWJTb2NrZXQgZm9yIGhhbmRsaW5nIEdyYXBoUUwgc3Vic2NyaXB0aW9ucy5cbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyc1xuICAgICAgICAvLyBjb25zdCBzcyA9IG5ldyBTdWJzY3JpcHRpb25TZXJ2ZXIoXG4gICAgICAgIC8vICAge1xuICAgICAgICAvLyAgICAgZXhlY3V0ZSxcbiAgICAgICAgLy8gICAgIHNjaGVtYSxcbiAgICAgICAgLy8gICAgIHN1YnNjcmliZSxcbiAgICAgICAgLy8gICB9LFxuICAgICAgICAvLyAgIHtcbiAgICAgICAgLy8gICAgIHBhdGg6IHN1YnNjcmlwdGlvbnNFbmRwb2ludCxcbiAgICAgICAgLy8gICAgIHNlcnZlcjogd2ViU2VydmVyLFxuICAgICAgICAvLyAgIH0sXG4gICAgICAgIC8vICk7XG4gICAgICAgIC8vIH0pO1xuICAgICAgICAvLyBwcm9jZXNzLm9uKCdTSUdJTlQnLCBjb2RlID0+IHtcbiAgICAgICAgLy8gICBsb2dnZXIuc2VydmVyLmRlYnVnKGBTZXJ2ZXIgd2FzIHN0b3BwZWQgKEN0cmwtQyBrZXkgcGFzc2VkKS4gRXhpdCB3aXRoIGNvZGU6ICR7Y29kZX1gKTtcbiAgICAgICAgLy8gICBwcm9jZXNzLmV4aXQoMik7XG4gICAgICAgIC8vIH0pO1xuICAgIH1cbn1cbmV4cG9ydHMuQ29yZSA9IENvcmU7XG5leHBvcnRzLmRlZmF1bHQgPSBDb3JlO1xuLy8gY29uc3Qgd2ViU2VydmVyID0gc2VydmVyKGNvbmZpZzogSUluaXRQcm9wcyk7XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2ltcG9ydERlZmF1bHQgPSAodGhpcyAmJiB0aGlzLl9faW1wb3J0RGVmYXVsdCkgfHwgZnVuY3Rpb24gKG1vZCkge1xuICAgIHJldHVybiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSA/IG1vZCA6IHsgXCJkZWZhdWx0XCI6IG1vZCB9O1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IHBlcmZfaG9va3NfMSA9IHJlcXVpcmUoXCJwZXJmX2hvb2tzXCIpO1xuY29uc3Qga25leF8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCJrbmV4XCIpKTtcbmNvbnN0IGtuZXhQcm92aWRlciA9IChjb25maWcpID0+IHtcbiAgICBjb25zdCB7IGRhdGFiYXNlLCBsb2dnZXIgfSA9IGNvbmZpZztcbiAgICBjb25zdCB0aW1lcyA9IHt9O1xuICAgIGxldCBjb3VudCA9IDA7XG4gICAgY29uc3QgaW5zdGFuY2UgPSBrbmV4XzEuZGVmYXVsdChkYXRhYmFzZSk7XG4gICAgaW5zdGFuY2VcbiAgICAgICAgLm9uKCdxdWVyeScsIHF1ZXJ5ID0+IHtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVyc2NvcmUtZGFuZ2xlXG4gICAgICAgIGNvbnN0IHVpZCA9IHF1ZXJ5Ll9fa25leFF1ZXJ5VWlkO1xuICAgICAgICB0aW1lc1t1aWRdID0ge1xuICAgICAgICAgICAgcG9zaXRpb246IGNvdW50LFxuICAgICAgICAgICAgcXVlcnksXG4gICAgICAgICAgICBzdGFydFRpbWU6IHBlcmZfaG9va3NfMS5wZXJmb3JtYW5jZS5ub3coKSxcbiAgICAgICAgICAgIGZpbmlzaGVkOiBmYWxzZSxcbiAgICAgICAgfTtcbiAgICAgICAgY291bnQgKz0gMTtcbiAgICB9KVxuICAgICAgICAub24oJ3F1ZXJ5LXJlc3BvbnNlJywgKHJlc3BvbnNlLCBxdWVyeSkgPT4ge1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZXJzY29yZS1kYW5nbGVcbiAgICAgICAgY29uc3QgdWlkID0gcXVlcnkuX19rbmV4UXVlcnlVaWQ7XG4gICAgICAgIHRpbWVzW3VpZF0uZW5kVGltZSA9IHBlcmZfaG9va3NfMS5wZXJmb3JtYW5jZS5ub3coKTtcbiAgICAgICAgdGltZXNbdWlkXS5maW5pc2hlZCA9IHRydWU7XG4gICAgICAgIGxvZ2dlci5zcWwuZGVidWcocXVlcnkuc3FsLCB0aW1lc1t1aWRdKTtcbiAgICB9KVxuICAgICAgICAub24oJ3F1ZXJ5LWVycm9yJywgKGVyciwgcXVlcnkpID0+IHtcbiAgICAgICAgbG9nZ2VyLnNxbC5lcnJvcihxdWVyeS5zcWwsIHsgZXJyIH0pO1xuICAgIH0pO1xuICAgIHJldHVybiBpbnN0YW5jZTtcbn07XG5leHBvcnRzLmtuZXhQcm92aWRlciA9IGtuZXhQcm92aWRlcjtcbmV4cG9ydHMuZGVmYXVsdCA9IGtuZXhQcm92aWRlcjtcbiIsIlwidXNlIHN0cmljdFwiO1xuZnVuY3Rpb24gX19leHBvcnQobSkge1xuICAgIGZvciAodmFyIHAgaW4gbSkgaWYgKCFleHBvcnRzLmhhc093blByb3BlcnR5KHApKSBleHBvcnRzW3BdID0gbVtwXTtcbn1cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbl9fZXhwb3J0KHJlcXVpcmUoXCIuL3NlcnZlclwiKSk7XG5fX2V4cG9ydChyZXF1aXJlKFwiLi9hdXRoZW50aWZpY2F0b3JcIikpO1xuX19leHBvcnQocmVxdWlyZShcIi4vZGF0YWJhc2VNYW5hZ2VyXCIpKTtcbl9fZXhwb3J0KHJlcXVpcmUoXCIuL2xvZ2dlclwiKSk7XG5fX2V4cG9ydChyZXF1aXJlKFwiLi9jb3JlXCIpKTtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY2xhc3MgQmFkUmVxdWVzdEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICAgIGNvbnN0cnVjdG9yKG1lc3NhZ2UsIG1ldGFEYXRhKSB7XG4gICAgICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgICAgICB0aGlzLm5hbWUgPSAnQmFkUmVxdWVzdEVycm9yJztcbiAgICAgICAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbiAgICAgICAgdGhpcy5tZXRhRGF0YSA9IG1ldGFEYXRhO1xuICAgICAgICB0aGlzLnN0YXR1cyA9IDQwMDtcbiAgICAgICAgLy8gU2V0IHRoZSBwcm90b3R5cGUgZXhwbGljaXRseS5cbiAgICAgICAgT2JqZWN0LnNldFByb3RvdHlwZU9mKHRoaXMsIEJhZFJlcXVlc3RFcnJvci5wcm90b3R5cGUpO1xuICAgIH1cbn1cbmV4cG9ydHMuZGVmYXVsdCA9IEJhZFJlcXVlc3RFcnJvcjtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY2xhc3MgRm9yYmlkZGVuRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gICAgY29uc3RydWN0b3IobWVzc2FnZSwgbWV0YURhdGEpIHtcbiAgICAgICAgc3VwZXIobWVzc2FnZSk7XG4gICAgICAgIHRoaXMubmFtZSA9ICdGb3JiaWRkZW5FcnJvcic7XG4gICAgICAgIHRoaXMubWVzc2FnZSA9IG1lc3NhZ2U7XG4gICAgICAgIHRoaXMubWV0YURhdGEgPSBtZXRhRGF0YTtcbiAgICAgICAgdGhpcy5zdGF0dXMgPSA1MDM7XG4gICAgICAgIC8vIFNldCB0aGUgcHJvdG90eXBlIGV4cGxpY2l0bHkuXG4gICAgICAgIE9iamVjdC5zZXRQcm90b3R5cGVPZih0aGlzLCBGb3JiaWRkZW5FcnJvci5wcm90b3R5cGUpO1xuICAgIH1cbn1cbmV4cG9ydHMuZGVmYXVsdCA9IEZvcmJpZGRlbkVycm9yO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jbGFzcyBOb3RGb3VuZEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICAgIGNvbnN0cnVjdG9yKG1lc3NhZ2UsIG1ldGFEYXRhKSB7XG4gICAgICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgICAgICB0aGlzLm5hbWUgPSAnTm90Rm91bmRFcnJvcic7XG4gICAgICAgIHRoaXMubWVzc2FnZSA9IG1lc3NhZ2U7XG4gICAgICAgIHRoaXMubWV0YURhdGEgPSBtZXRhRGF0YTtcbiAgICAgICAgdGhpcy5zdGF0dXMgPSA0MDQ7XG4gICAgICAgIC8vIFNldCB0aGUgcHJvdG90eXBlIGV4cGxpY2l0bHkuXG4gICAgICAgIE9iamVjdC5zZXRQcm90b3R5cGVPZih0aGlzLCBOb3RGb3VuZEVycm9yLnByb3RvdHlwZSk7XG4gICAgfVxufVxuZXhwb3J0cy5kZWZhdWx0ID0gTm90Rm91bmRFcnJvcjtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY2xhc3MgU2VydmVyRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gICAgY29uc3RydWN0b3IobWVzc2FnZSwgbWV0YURhdGEpIHtcbiAgICAgICAgc3VwZXIobWVzc2FnZSk7XG4gICAgICAgIHRoaXMubmFtZSA9ICdTZXJ2ZXJFcnJvcic7XG4gICAgICAgIHRoaXMubWVzc2FnZSA9IG1lc3NhZ2U7XG4gICAgICAgIHRoaXMubWV0YURhdGEgPSBtZXRhRGF0YTtcbiAgICAgICAgdGhpcy5zdGF0dXMgPSA1MDA7XG4gICAgICAgIC8vIFNldCB0aGUgcHJvdG90eXBlIGV4cGxpY2l0bHkuXG4gICAgICAgIE9iamVjdC5zZXRQcm90b3R5cGVPZih0aGlzLCBTZXJ2ZXJFcnJvci5wcm90b3R5cGUpO1xuICAgIH1cbn1cbmV4cG9ydHMuZGVmYXVsdCA9IFNlcnZlckVycm9yO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19pbXBvcnREZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydERlZmF1bHQpIHx8IGZ1bmN0aW9uIChtb2QpIHtcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IFwiZGVmYXVsdFwiOiBtb2QgfTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBCYWRSZXF1ZXN0RXJyb3JfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi9CYWRSZXF1ZXN0RXJyb3JcIikpO1xuZXhwb3J0cy5CYWRSZXF1ZXN0RXJyb3IgPSBCYWRSZXF1ZXN0RXJyb3JfMS5kZWZhdWx0O1xuY29uc3QgRm9yYmlkZGVuRXJyb3JfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi9Gb3JiaWRkZW5FcnJvclwiKSk7XG5leHBvcnRzLkZvcmJpZGRlbkVycm9yID0gRm9yYmlkZGVuRXJyb3JfMS5kZWZhdWx0O1xuY29uc3QgTm90Rm91bmRFcnJvcl8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCIuL05vdEZvdW5kRXJyb3JcIikpO1xuZXhwb3J0cy5Ob3RGb3VuZEVycm9yID0gTm90Rm91bmRFcnJvcl8xLmRlZmF1bHQ7XG5jb25zdCBTZXJ2ZXJFcnJvcl8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCIuL1NlcnZlckVycm9yXCIpKTtcbmV4cG9ydHMuU2VydmVyRXJyb3IgPSBTZXJ2ZXJFcnJvcl8xLmRlZmF1bHQ7XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX3Jlc3QgPSAodGhpcyAmJiB0aGlzLl9fcmVzdCkgfHwgZnVuY3Rpb24gKHMsIGUpIHtcbiAgICB2YXIgdCA9IHt9O1xuICAgIGZvciAodmFyIHAgaW4gcykgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzLCBwKSAmJiBlLmluZGV4T2YocCkgPCAwKVxuICAgICAgICB0W3BdID0gc1twXTtcbiAgICBpZiAocyAhPSBudWxsICYmIHR5cGVvZiBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzID09PSBcImZ1bmN0aW9uXCIpXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBwID0gT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhzKTsgaSA8IHAubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChlLmluZGV4T2YocFtpXSkgPCAwICYmIE9iamVjdC5wcm90b3R5cGUucHJvcGVydHlJc0VudW1lcmFibGUuY2FsbChzLCBwW2ldKSlcbiAgICAgICAgICAgICAgICB0W3BbaV1dID0gc1twW2ldXTtcbiAgICAgICAgfVxuICAgIHJldHVybiB0O1xufTtcbmZ1bmN0aW9uIF9fZXhwb3J0KG0pIHtcbiAgICBmb3IgKHZhciBwIGluIG0pIGlmICghZXhwb3J0cy5oYXNPd25Qcm9wZXJ0eShwKSkgZXhwb3J0c1twXSA9IG1bcF07XG59XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5yZXF1aXJlKFwid2luc3Rvbi1kYWlseS1yb3RhdGUtZmlsZVwiKTtcbmNvbnN0IGxvZ2dlcnNfMSA9IHJlcXVpcmUoXCIuL2xvZ2dlcnNcIik7XG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgaW1wb3J0L25vLW11dGFibGUtZXhwb3J0c1xubGV0IGxvZ2dlcjtcbmV4cG9ydHMubG9nZ2VyID0gbG9nZ2VyO1xuZXhwb3J0cy5jb25maWd1cmVMb2dnZXIgPSAoY29uZmlnKSA9PiB7XG4gICAgY29uc3QgeyBsb2dnZXJzIH0gPSBjb25maWcsIGxvZ2dlckNvbmZpZyA9IF9fcmVzdChjb25maWcsIFtcImxvZ2dlcnNcIl0pO1xuICAgIGV4cG9ydHMubG9nZ2VyID0gbG9nZ2VyID0gT2JqZWN0LmFzc2lnbih7IGF1dGg6IGxvZ2dlcnNfMS5hdXRoTG9nZ2VyKGxvZ2dlckNvbmZpZyksIGh0dHA6IGxvZ2dlcnNfMS5odHRwTG9nZ2VyKGxvZ2dlckNvbmZpZyksIHNlcnZlcjogbG9nZ2Vyc18xLnNlcnZlckxvZ2dlcihsb2dnZXJDb25maWcpLCBzcWw6IGxvZ2dlcnNfMS5zcWxMb2dnZXIobG9nZ2VyQ29uZmlnKSB9LCBsb2dnZXJzKTtcbiAgICByZXR1cm4gbG9nZ2VyO1xufTtcbl9fZXhwb3J0KHJlcXVpcmUoXCIuL21pZGRsZXdhcmVzXCIpKTtcbl9fZXhwb3J0KHJlcXVpcmUoXCIuL2Vycm9ySGFuZGxlcnNcIikpO1xuLy8gVE9ETyBUZXN0cyByZXVpcmVkXG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2ltcG9ydERlZmF1bHQgPSAodGhpcyAmJiB0aGlzLl9faW1wb3J0RGVmYXVsdCkgfHwgZnVuY3Rpb24gKG1vZCkge1xuICAgIHJldHVybiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSA/IG1vZCA6IHsgXCJkZWZhdWx0XCI6IG1vZCB9O1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IHdpbnN0b25fMSA9IHJlcXVpcmUoXCJ3aW5zdG9uXCIpO1xucmVxdWlyZShcIndpbnN0b24tZGFpbHktcm90YXRlLWZpbGVcIik7XG5jb25zdCBsb2dGb3JtYXR0ZXJfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi4vdXRpbHMvbG9nRm9ybWF0dGVyXCIpKTtcbmV4cG9ydHMuZGVmYXVsdCA9IChjb25maWcpID0+IHtcbiAgICBjb25zdCB7IGxvZ1BhdGggfSA9IGNvbmZpZztcbiAgICByZXR1cm4gd2luc3Rvbl8xLmNyZWF0ZUxvZ2dlcih7XG4gICAgICAgIGxldmVsOiAnaW5mbycsXG4gICAgICAgIGZvcm1hdDogbG9nRm9ybWF0dGVyXzEuZGVmYXVsdCxcbiAgICAgICAgdHJhbnNwb3J0czogW1xuICAgICAgICAgICAgbmV3IHdpbnN0b25fMS50cmFuc3BvcnRzLkRhaWx5Um90YXRlRmlsZSh7XG4gICAgICAgICAgICAgICAgZmlsZW5hbWU6IGAke2xvZ1BhdGh9LyVEQVRFJS1hdXRoLmxvZ2AsXG4gICAgICAgICAgICAgICAgbGV2ZWw6ICdpbmZvJyxcbiAgICAgICAgICAgICAgICBkYXRlUGF0dGVybjogJ1lZWVktTU0tREQnLFxuICAgICAgICAgICAgICAgIHppcHBlZEFyY2hpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgbWF4U2l6ZTogJzIwbScsXG4gICAgICAgICAgICAgICAgbWF4RmlsZXM6ICcxNGQnLFxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBuZXcgd2luc3Rvbl8xLnRyYW5zcG9ydHMuRGFpbHlSb3RhdGVGaWxlKHtcbiAgICAgICAgICAgICAgICBmaWxlbmFtZTogYCR7bG9nUGF0aH0vJURBVEUlLWRlYnVnLmxvZ2AsXG4gICAgICAgICAgICAgICAgbGV2ZWw6ICdkZWJ1ZycsXG4gICAgICAgICAgICAgICAgZGF0ZVBhdHRlcm46ICdZWVlZLU1NLUREJyxcbiAgICAgICAgICAgICAgICB6aXBwZWRBcmNoaXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgIG1heFNpemU6ICcyMG0nLFxuICAgICAgICAgICAgICAgIG1heEZpbGVzOiAnMTRkJyxcbiAgICAgICAgICAgIH0pLFxuICAgICAgICBdLFxuICAgIH0pO1xufTtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9faW1wb3J0RGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnREZWZhdWx0KSB8fCBmdW5jdGlvbiAobW9kKSB7XG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBcImRlZmF1bHRcIjogbW9kIH07XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3Qgd2luc3Rvbl8xID0gcmVxdWlyZShcIndpbnN0b25cIik7XG5yZXF1aXJlKFwid2luc3Rvbi1kYWlseS1yb3RhdGUtZmlsZVwiKTtcbmNvbnN0IGxvZ0Zvcm1hdHRlcl8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCIuLi91dGlscy9sb2dGb3JtYXR0ZXJcIikpO1xuZXhwb3J0cy5kZWZhdWx0ID0gKGNvbmZpZykgPT4ge1xuICAgIGNvbnN0IHsgbG9nUGF0aCB9ID0gY29uZmlnO1xuICAgIHJldHVybiB3aW5zdG9uXzEuY3JlYXRlTG9nZ2VyKHtcbiAgICAgICAgbGV2ZWw6ICdpbmZvJyxcbiAgICAgICAgZm9ybWF0OiBsb2dGb3JtYXR0ZXJfMS5kZWZhdWx0LFxuICAgICAgICB0cmFuc3BvcnRzOiBbXG4gICAgICAgICAgICBuZXcgd2luc3Rvbl8xLnRyYW5zcG9ydHMuRGFpbHlSb3RhdGVGaWxlKHtcbiAgICAgICAgICAgICAgICBmaWxlbmFtZTogYCR7bG9nUGF0aH0vJURBVEUlLWh0dHAubG9nYCxcbiAgICAgICAgICAgICAgICBsZXZlbDogJ2luZm8nLFxuICAgICAgICAgICAgICAgIGRhdGVQYXR0ZXJuOiAnWVlZWS1NTS1ERCcsXG4gICAgICAgICAgICAgICAgemlwcGVkQXJjaGl2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBtYXhTaXplOiAnMjBtJyxcbiAgICAgICAgICAgICAgICBtYXhGaWxlczogJzE0ZCcsXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgXSxcbiAgICB9KTtcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2ltcG9ydERlZmF1bHQgPSAodGhpcyAmJiB0aGlzLl9faW1wb3J0RGVmYXVsdCkgfHwgZnVuY3Rpb24gKG1vZCkge1xuICAgIHJldHVybiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSA/IG1vZCA6IHsgXCJkZWZhdWx0XCI6IG1vZCB9O1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IGF1dGhfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi9hdXRoXCIpKTtcbmV4cG9ydHMuYXV0aExvZ2dlciA9IGF1dGhfMS5kZWZhdWx0O1xuY29uc3QgaHR0cF8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCIuL2h0dHBcIikpO1xuZXhwb3J0cy5odHRwTG9nZ2VyID0gaHR0cF8xLmRlZmF1bHQ7XG5jb25zdCBzZXJ2ZXJfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi9zZXJ2ZXJcIikpO1xuZXhwb3J0cy5zZXJ2ZXJMb2dnZXIgPSBzZXJ2ZXJfMS5kZWZhdWx0O1xuY29uc3Qgc3FsXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4vc3FsXCIpKTtcbmV4cG9ydHMuc3FsTG9nZ2VyID0gc3FsXzEuZGVmYXVsdDtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9faW1wb3J0RGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnREZWZhdWx0KSB8fCBmdW5jdGlvbiAobW9kKSB7XG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBcImRlZmF1bHRcIjogbW9kIH07XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3Qgd2luc3Rvbl8xID0gcmVxdWlyZShcIndpbnN0b25cIik7XG5yZXF1aXJlKFwid2luc3Rvbi1kYWlseS1yb3RhdGUtZmlsZVwiKTtcbmNvbnN0IGxvZ0Zvcm1hdHRlcl8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCIuLi91dGlscy9sb2dGb3JtYXR0ZXJcIikpO1xuZXhwb3J0cy5kZWZhdWx0ID0gKGNvbmZpZykgPT4ge1xuICAgIGNvbnN0IHsgbG9nUGF0aCB9ID0gY29uZmlnO1xuICAgIHJldHVybiB3aW5zdG9uXzEuY3JlYXRlTG9nZ2VyKHtcbiAgICAgICAgbGV2ZWw6ICdkZWJ1ZycsXG4gICAgICAgIGZvcm1hdDogbG9nRm9ybWF0dGVyXzEuZGVmYXVsdCxcbiAgICAgICAgdHJhbnNwb3J0czogW1xuICAgICAgICAgICAgbmV3IHdpbnN0b25fMS50cmFuc3BvcnRzLkRhaWx5Um90YXRlRmlsZSh7XG4gICAgICAgICAgICAgICAgZmlsZW5hbWU6IGAke2xvZ1BhdGh9LyVEQVRFJS1lcnJvcnMubG9nYCxcbiAgICAgICAgICAgICAgICBsZXZlbDogJ2Vycm9yJyxcbiAgICAgICAgICAgICAgICBkYXRlUGF0dGVybjogJ1lZWVktTU0tREQnLFxuICAgICAgICAgICAgICAgIHppcHBlZEFyY2hpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgbWF4U2l6ZTogJzIwbScsXG4gICAgICAgICAgICAgICAgbWF4RmlsZXM6ICcxNGQnLFxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBuZXcgd2luc3Rvbl8xLnRyYW5zcG9ydHMuRGFpbHlSb3RhdGVGaWxlKHtcbiAgICAgICAgICAgICAgICBmaWxlbmFtZTogYCR7bG9nUGF0aH0vJURBVEUlLWRlYnVnLmxvZ2AsXG4gICAgICAgICAgICAgICAgbGV2ZWw6ICdkZWJ1ZycsXG4gICAgICAgICAgICAgICAgZGF0ZVBhdHRlcm46ICdZWVlZLU1NLUREJyxcbiAgICAgICAgICAgICAgICB6aXBwZWRBcmNoaXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgIG1heFNpemU6ICcyMG0nLFxuICAgICAgICAgICAgICAgIG1heEZpbGVzOiAnMTRkJyxcbiAgICAgICAgICAgIH0pLFxuICAgICAgICBdLFxuICAgIH0pO1xufTtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9faW1wb3J0RGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnREZWZhdWx0KSB8fCBmdW5jdGlvbiAobW9kKSB7XG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBcImRlZmF1bHRcIjogbW9kIH07XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3Qgd2luc3Rvbl8xID0gcmVxdWlyZShcIndpbnN0b25cIik7XG5yZXF1aXJlKFwid2luc3Rvbi1kYWlseS1yb3RhdGUtZmlsZVwiKTtcbmNvbnN0IGxvZ0Zvcm1hdHRlcl8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCIuLi91dGlscy9sb2dGb3JtYXR0ZXJcIikpO1xuZXhwb3J0cy5kZWZhdWx0ID0gKGNvbmZpZykgPT4ge1xuICAgIGNvbnN0IHsgbG9nUGF0aCB9ID0gY29uZmlnO1xuICAgIHJldHVybiB3aW5zdG9uXzEuY3JlYXRlTG9nZ2VyKHtcbiAgICAgICAgbGV2ZWw6ICdkZWJ1ZycsXG4gICAgICAgIGZvcm1hdDogbG9nRm9ybWF0dGVyXzEuZGVmYXVsdCxcbiAgICAgICAgdHJhbnNwb3J0czogW1xuICAgICAgICAgICAgbmV3IHdpbnN0b25fMS50cmFuc3BvcnRzLkRhaWx5Um90YXRlRmlsZSh7XG4gICAgICAgICAgICAgICAgZmlsZW5hbWU6IGAke2xvZ1BhdGh9LyVEQVRFJS1zcWwubG9nYCxcbiAgICAgICAgICAgICAgICBsZXZlbDogJ2RlYnVnJyxcbiAgICAgICAgICAgICAgICBkYXRlUGF0dGVybjogJ1lZWVktTU0tREQnLFxuICAgICAgICAgICAgICAgIHppcHBlZEFyY2hpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgbWF4U2l6ZTogJzIwbScsXG4gICAgICAgICAgICAgICAgbWF4RmlsZXM6ICcxNGQnLFxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBuZXcgd2luc3Rvbl8xLnRyYW5zcG9ydHMuQ29uc29sZSh7XG4gICAgICAgICAgICAgICAgbGV2ZWw6ICdlcnJvcicsXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgXSxcbiAgICB9KTtcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2ltcG9ydERlZmF1bHQgPSAodGhpcyAmJiB0aGlzLl9faW1wb3J0RGVmYXVsdCkgfHwgZnVuY3Rpb24gKG1vZCkge1xuICAgIHJldHVybiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSA/IG1vZCA6IHsgXCJkZWZhdWx0XCI6IG1vZCB9O1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IGNoYWxrXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcImNoYWxrXCIpKTtcbmNvbnN0IHJlc3BvbnNlRm9ybWF0dGVyXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIn4vbG9nZ2VyL3V0aWxzL3Jlc3BvbnNlRm9ybWF0dGVyXCIpKTtcbmV4cG9ydHMuZGVmYXVsdCA9IChjb25maWcpID0+IHtcbiAgICBjb25zdCB7IGNvbnRleHQgfSA9IGNvbmZpZztcbiAgICBjb25zdCB7IGxvZ2dlciB9ID0gY29udGV4dDtcbiAgICByZXR1cm4gW1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG4gICAgICAgIChlcnIsIHJlcSwgcmVzLCBuZXh0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCB7IHN0YXR1cywgc3RhY2ssIG5hbWUsIG1lc3NhZ2UsIG1ldGFEYXRhIH0gPSBlcnI7XG4gICAgICAgICAgICBjb25zdCB7IG9yaWdpbmFsVXJsIH0gPSByZXE7XG4gICAgICAgICAgICBsb2dnZXIuc2VydmVyLmVycm9yKG1lc3NhZ2UgPyBgJHtzdGF0dXMgfHwgJyd9ICR7bWVzc2FnZX1gIDogJ1Vua25vd24gZXJyb3InLCB7IG9yaWdpbmFsVXJsLCBzdGFjaywgbWV0YURhdGEgfSk7XG4gICAgICAgICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdkZXZlbG9wbWVudCcpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnJyk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYCR7Y2hhbGtfMS5kZWZhdWx0LmJnUmVkLndoaXRlKCcgRmF0YWwgRXJyb3IgJyl9ICR7Y2hhbGtfMS5kZWZhdWx0LnJlZChuYW1lKX1gKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhtZXNzYWdlLCBtZXRhRGF0YSk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJycpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzLnN0YXR1cyhzdGF0dXMgfHwgNTAwKS5qc29uKHJlc3BvbnNlRm9ybWF0dGVyXzEuZGVmYXVsdCh7XG4gICAgICAgICAgICAgICAgbWVzc2FnZTogbWVzc2FnZSB8fCAnUGxlYXNlIGNvbnRhY3Qgc3lzdGVtIGFkbWluaXN0cmF0b3InLFxuICAgICAgICAgICAgICAgIG5hbWU6IG5hbWUgfHwgJ0ludGVybmFsIHNlcnZlciBlcnJvcicsXG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH0sXG4gICAgICAgIChyZXEsIHJlcykgPT4ge1xuICAgICAgICAgICAgcmVzLnN0YXR1cyg0MDQpLmVuZCgpO1xuICAgICAgICB9LFxuICAgICAgICAocmVxLCByZXMpID0+IHtcbiAgICAgICAgICAgIHJlcy5zdGF0dXMoNTAzKS5lbmQoKTtcbiAgICAgICAgfSxcbiAgICAgICAgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgICAgICByZXMuc3RhdHVzKDQwMCkuZW5kKCk7XG4gICAgICAgIH0sXG4gICAgXTtcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2ltcG9ydERlZmF1bHQgPSAodGhpcyAmJiB0aGlzLl9faW1wb3J0RGVmYXVsdCkgfHwgZnVuY3Rpb24gKG1vZCkge1xuICAgIHJldHVybiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSA/IG1vZCA6IHsgXCJkZWZhdWx0XCI6IG1vZCB9O1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IGVycm9ySGFuZGxlcl8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCIuL2Vycm9ySGFuZGxlclwiKSk7XG5leHBvcnRzLmVycm9ySGFuZGxlck1pZGRsZXdhcmUgPSBlcnJvckhhbmRsZXJfMS5kZWZhdWx0O1xuY29uc3QgcmVxdWVzdEhhbmRsZXJfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi9yZXF1ZXN0SGFuZGxlclwiKSk7XG5leHBvcnRzLnJlcXVlc3RIYW5kbGVyTWlkZGxld2FyZSA9IHJlcXVlc3RIYW5kbGVyXzEuZGVmYXVsdDtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gKGNvbmZpZykgPT4ge1xuICAgIGNvbnN0IHsgY29udGV4dCB9ID0gY29uZmlnO1xuICAgIGNvbnN0IHsgbG9nZ2VyIH0gPSBjb250ZXh0O1xuICAgIHJldHVybiAocmVxLCByZXMsIG5leHQpID0+IHtcbiAgICAgICAgY29uc3QgeyBtZXRob2QsIG9yaWdpbmFsVXJsLCBoZWFkZXJzIH0gPSByZXE7XG4gICAgICAgIGNvbnN0IHhGb3J3YXJkZWRGb3IgPSBTdHJpbmcocmVxLmhlYWRlcnNbJ3gtZm9yd2FyZGVkLWZvciddIHx8ICcnKS5yZXBsYWNlKC86XFxkKyQvLCAnJyk7XG4gICAgICAgIGNvbnN0IGlwID0geEZvcndhcmRlZEZvciB8fCByZXEuY29ubmVjdGlvbi5yZW1vdGVBZGRyZXNzO1xuICAgICAgICBjb25zdCBpcEFkZHJlc3MgPSBpcCA9PT0gJzEyNy4wLjAuMScgfHwgaXAgPT09ICc6OjEnID8gJ2xvY2FsaG9zdCcgOiBpcDtcbiAgICAgICAgbG9nZ2VyLmh0dHAuaW5mbyhgJHtpcEFkZHJlc3N9ICR7bWV0aG9kfSBcIiR7b3JpZ2luYWxVcmx9XCJgLCB7IGhlYWRlcnMgfSk7XG4gICAgICAgIHJldHVybiBuZXh0KCk7XG4gICAgfTtcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IHdpbnN0b25fMSA9IHJlcXVpcmUoXCJ3aW5zdG9uXCIpO1xuZXhwb3J0cy5kZWZhdWx0ID0gd2luc3Rvbl8xLmZvcm1hdC5jb21iaW5lKHdpbnN0b25fMS5mb3JtYXQubWV0YWRhdGEoKSwgd2luc3Rvbl8xLmZvcm1hdC5qc29uKCksIHdpbnN0b25fMS5mb3JtYXQudGltZXN0YW1wKHsgZm9ybWF0OiAnWVlZWS1NTS1ERFRISDptbTpzc1paJyB9KSwgd2luc3Rvbl8xLmZvcm1hdC5zcGxhdCgpLCB3aW5zdG9uXzEuZm9ybWF0LnByaW50ZihpbmZvID0+IHtcbiAgICBjb25zdCB7IHRpbWVzdGFtcCwgbGV2ZWwsIG1lc3NhZ2UsIG1ldGFkYXRhIH0gPSBpbmZvO1xuICAgIGNvbnN0IG1ldGEgPSBKU09OLnN0cmluZ2lmeShtZXRhZGF0YSkgIT09ICd7fScgPyBtZXRhZGF0YSA6IG51bGw7XG4gICAgcmV0dXJuIGAke3RpbWVzdGFtcH0gJHtsZXZlbH06ICR7bWVzc2FnZX0gJHttZXRhID8gSlNPTi5zdHJpbmdpZnkobWV0YSkgOiAnJ31gO1xufSkpO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLmRlZmF1bHQgPSAocHJvcHMpID0+IHtcbiAgICBjb25zdCB7IG5hbWUsIG1lc3NhZ2UgfSA9IHByb3BzO1xuICAgIHJldHVybiB7XG4gICAgICAgIGVycm9yczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5hbWU6IG5hbWUgfHwgJ1Vua25vd24gRXJyb3InLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IG1lc3NhZ2UgfHwgbmFtZSB8fCAnVW5rbm93biBFcnJvcicsXG4gICAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgIH07XG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19pbXBvcnREZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydERlZmF1bHQpIHx8IGZ1bmN0aW9uIChtb2QpIHtcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IFwiZGVmYXVsdFwiOiBtb2QgfTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG4vKiBlc2xpbnQtZGlzYWJsZSBpbXBvcnQvbWF4LWRlcGVuZGVuY2llcyAqL1xuY29uc3QgZXZlbnRzXzEgPSByZXF1aXJlKFwiZXZlbnRzXCIpO1xuY29uc3QgZXhwcmVzc18xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCJleHByZXNzXCIpKTtcbmNvbnN0IGdyYXBocWxfdG9vbHNfMSA9IHJlcXVpcmUoXCJncmFwaHFsLXRvb2xzXCIpO1xuY29uc3QgZGF0YWJhc2VNYW5hZ2VyXzEgPSByZXF1aXJlKFwifi9kYXRhYmFzZU1hbmFnZXJcIik7XG5leHBvcnRzLmdldFJvdXRlcyA9IChlbmRwb2ludCwgcm91dGVzKSA9PiB7XG4gICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oeyBhdXRoOiBgJHtlbmRwb2ludH0vYXV0aGAsIHBsYXlncm91bmQ6IGAke2VuZHBvaW50fS9wbGF5Z3JvdW5kYCwgdm95YWdlcjogYCR7ZW5kcG9pbnR9L3ZveWFnZXJgIH0sIHJvdXRlcyk7XG59O1xuY29uc3QgY3JlYXRlU2VydmVyID0gKHByb3BzKSA9PiB7XG4gICAgY29uc3Qgc2VydmVyID0gZXhwcmVzc18xLmRlZmF1bHQoKTtcbiAgICBjb25zdCB7IHNjaGVtYXMsIGVuZHBvaW50LCBwb3J0LCBqd3QsIGRhdGFiYXNlLCBsb2dnZXIsIHJvdXRlcyB9ID0gcHJvcHM7XG4gICAgY29uc3Qgc3Vic2NyaXB0aW9uc0VuZHBvaW50ID0gJy9zdWJzY3JpcHRpb25zJztcbiAgICBjb25zdCBzY2hlbWEgPSBncmFwaHFsX3Rvb2xzXzEubWVyZ2VTY2hlbWFzKHsgc2NoZW1hcyB9KTtcbiAgICAvLyBnZW5lcmF0ZSByb3V0ZXNcbiAgICBjb25zdCByb3V0ZXNMaXN0ID0gZXhwb3J0cy5nZXRSb3V0ZXMoZW5kcG9pbnQsIHJvdXRlcyk7XG4gICAgLy8gZGVmaW5lIGtuZXggaW5zdGFuY2VcbiAgICBjb25zdCBrbmV4ID0gZGF0YWJhc2VNYW5hZ2VyXzEua25leFByb3ZpZGVyKHsgbG9nZ2VyLCBkYXRhYmFzZSB9KTtcbiAgICAvLyBkZWZpbmUgRXZlbnRFbWl0dHJlIGluc3RhbmNlXG4gICAgY29uc3QgZW1pdHRlciA9IG5ldyBldmVudHNfMS5FdmVudEVtaXR0ZXIoKTtcbiAgICBjb25zdCBjb250ZXh0ID0ge1xuICAgICAgICBlbmRwb2ludCxcbiAgICAgICAgand0LFxuICAgICAgICBsb2dnZXIsXG4gICAgICAgIGtuZXgsXG4gICAgICAgIGVtaXR0ZXIsXG4gICAgfTtcbiAgICAvLyBUaGlzIG1pZGRsZXdhcmUgbXVzdCBiZSBkZWZpbmVkIGZpcnN0XG4gICAgLyogc2VydmVyLnVzZShyZXF1ZXN0SGFuZGxlck1pZGRsZXdhcmUoeyBjb250ZXh0IH0pKTtcbiAgICBzZXJ2ZXIudXNlKGNvcnMoKSk7XG4gICAgc2VydmVyLnVzZShleHByZXNzLmpzb24oeyBsaW1pdDogJzUwbWInIH0pKTtcbiAgICBzZXJ2ZXIudXNlKGV4cHJlc3MudXJsZW5jb2RlZCh7IGV4dGVuZGVkOiB0cnVlLCBsaW1pdDogJzUwbWInIH0pKTtcbiAgXG4gICAgc2VydmVyLnVzZShcbiAgICAgIGF1dGhlbnRpZmljYXRvck1pZGRsZXdhcmUoe1xuICAgICAgICBjb250ZXh0LFxuICAgICAgICBhdXRoVXJsOiByb3V0ZXNMaXN0LmF1dGgsXG4gICAgICAgIGFsbG93ZWRVcmw6IFtyb3V0ZXNMaXN0LnBsYXlncm91bmRdLFxuICAgICAgfSksXG4gICAgKTtcbiAgICBzZXJ2ZXIuZ2V0KHJvdXRlc0xpc3QucGxheWdyb3VuZCwgZXhwcmVzc1BsYXlncm91bmQoeyBlbmRwb2ludCB9KSk7XG4gICAgc2VydmVyLnVzZShyb3V0ZXNMaXN0LnZveWFnZXIsIHZveWFnZXJNaWRkbGV3YXJlKHsgZW5kcG9pbnRVcmw6IGVuZHBvaW50IH0pKTtcbiAgICBzZXJ2ZXIudXNlKFxuICAgICAgZW5kcG9pbnQsXG4gICAgICBncmFwaHFsSFRUUChcbiAgICAgICAgYXN5bmMgKCk6IFByb21pc2U8T3B0aW9uc0RhdGEgJiB7IHN1YnNjcmlwdGlvbnNFbmRwb2ludD86IHN0cmluZyB9PiA9PiAoe1xuICAgICAgICAgIGNvbnRleHQsXG4gICAgICAgICAgZ3JhcGhpcWw6IGZhbHNlLFxuICAgICAgICAgIHNjaGVtYSxcbiAgICAgICAgICBzdWJzY3JpcHRpb25zRW5kcG9pbnQ6IGB3czovL2xvY2FsaG9zdDoke3BvcnQgfHwgNDAwMH0ke3N1YnNjcmlwdGlvbnNFbmRwb2ludH1gLFxuICAgICAgICB9KSxcbiAgICAgICksXG4gICAgKTtcbiAgXG4gICAgLy8gdGhpcyBtaWRkbGV3YXJlIG1vc3QgYmUgZGVmaW5lZCBmaXJzdFxuICAgIHNlcnZlci51c2UoZXJyb3JIYW5kbGVyTWlkZGxld2FyZSh7IGNvbnRleHQgfSkpOyAqL1xuICAgIC8vIENyZWF0ZSBsaXN0ZW5lciBzZXJ2ZXIgYnkgd3JhcHBpbmcgZXhwcmVzcyBhcHBcbiAgICAvKiBjb25zdCB3ZWJTZXJ2ZXIgPSBjcmVhdGVTZXJ2ZXIoYXBwKTtcbiAgXG4gICAgd2ViU2VydmVyLmxpc3Rlbihwb3J0LCAoKSA9PiB7XG4gICAgICBsb2dnZXIuc2VydmVyLmRlYnVnKCdTZXJ2ZXIgd2FzIHN0YXJ0ZWQnLCB7IHBvcnQsIGVuZHBvaW50LCByb3V0ZXNMaXN0IH0pO1xuICAgICAgY29uc29sZS5sb2coJycpO1xuICAgICAgY29uc29sZS5sb2coJycpO1xuICAgICAgY29uc29sZS5sb2coY2hhbGsuZ3JlZW4oJz09PT09PT09PSBHcmFwaFFMID09PT09PT09PScpKTtcbiAgICAgIGNvbnNvbGUubG9nKCcnKTtcbiAgICAgIGNvbnNvbGUubG9nKGAke2NoYWxrLmdyZWVuKCdHcmFwaFFMIHNlcnZlcicpfTogICAgICR7Y2hhbGsueWVsbG93KGBodHRwOi8vbG9jYWxob3N0OiR7cG9ydH0ke2VuZHBvaW50fWApfWApO1xuICAgICAgY29uc29sZS5sb2coXG4gICAgICAgIGAke2NoYWxrLm1hZ2VudGEoJ0dyYXBoUUwgcGxheWdyb3VuZCcpfTogJHtjaGFsay55ZWxsb3coYGh0dHA6Ly9sb2NhbGhvc3Q6JHtwb3J0fSR7cm91dGVzLnBsYXlncm91bmR9YCl9YCxcbiAgICAgICk7XG4gICAgICBjb25zb2xlLmxvZyhgJHtjaGFsay5jeWFuKCdBdXRoIFNlcnZlcicpfTogICAgICAgICR7Y2hhbGsueWVsbG93KGBodHRwOi8vbG9jYWxob3N0OiR7cG9ydH0ke3JvdXRlcy5hdXRofWApfWApO1xuICAgICAgY29uc29sZS5sb2coYCR7Y2hhbGsuYmx1ZSgnR3JhcGhRTCB2b3lhZ2VyJyl9OiAgICAke2NoYWxrLnllbGxvdyhgaHR0cDovL2xvY2FsaG9zdDoke3BvcnR9JHtyb3V0ZXMudm95YWdlcn1gKX1gKTtcbiAgICAgIGNvbnNvbGUubG9nKCcnKTtcbiAgXG4gICAgICAvLyBTZXQgdXAgdGhlIFdlYlNvY2tldCBmb3IgaGFuZGxpbmcgR3JhcGhRTCBzdWJzY3JpcHRpb25zLlxuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyc1xuICAgICAgY29uc3Qgc3MgPSBuZXcgU3Vic2NyaXB0aW9uU2VydmVyKFxuICAgICAgICB7XG4gICAgICAgICAgZXhlY3V0ZSxcbiAgICAgICAgICBzY2hlbWEsXG4gICAgICAgICAgc3Vic2NyaWJlLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgcGF0aDogc3Vic2NyaXB0aW9uc0VuZHBvaW50LFxuICAgICAgICAgIHNlcnZlcjogd2ViU2VydmVyLFxuICAgICAgICB9LFxuICAgICAgKTtcbiAgICB9KTtcbiAgXG4gICAgcHJvY2Vzcy5vbignU0lHSU5UJywgY29kZSA9PiB7XG4gICAgICBsb2dnZXIuc2VydmVyLmRlYnVnKGBTZXJ2ZXIgd2FzIHN0b3BwZWQgKEN0cmwtQyBrZXkgcGFzc2VkKS4gRXhpdCB3aXRoIGNvZGU6ICR7Y29kZX1gKTtcbiAgICAgIHByb2Nlc3MuZXhpdCgyKTtcbiAgICB9KTsgKi9cbiAgICByZXR1cm4geyBzZXJ2ZXIsIGNvbnRleHQgfTtcbn07XG5leHBvcnRzLmNyZWF0ZVNlcnZlciA9IGNyZWF0ZVNlcnZlcjtcbmV4cG9ydHMuZGVmYXVsdCA9IGNyZWF0ZVNlcnZlcjtcbi8vIFRPRE8gVGVzdHMgcmV1aXJlZFxuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiYmNyeXB0anNcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiY2hhbGtcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiZGV2aWNlLWRldGVjdG9yLWpzXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImV2ZW50c1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJleHByZXNzXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImV4cHJlc3MtYXN5bmMtaGFuZGxlclwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJmc1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJncmFwaHFsLXRvb2xzXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImpzb253ZWJ0b2tlblwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJrbmV4XCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIm1vbWVudC10aW1lem9uZVwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJwZXJmX2hvb2tzXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcInV1aWQvdjRcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwid2luc3RvblwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJ3aW5zdG9uLWRhaWx5LXJvdGF0ZS1maWxlXCIpOyJdLCJzb3VyY2VSb290IjoiIn0=