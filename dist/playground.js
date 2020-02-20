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

/***/ "./src/app/index.ts":
/*!**************************!*\
  !*** ./src/app/index.ts ***!
  \**************************/
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
/* eslint-disable import/max-dependencies */
const events_1 = __webpack_require__(/*! events */ "events");
const cors_1 = __importDefault(__webpack_require__(/*! cors */ "cors"));
const express_1 = __importDefault(__webpack_require__(/*! express */ "express"));
const express_graphql_1 = __importDefault(__webpack_require__(/*! express-graphql */ "express-graphql"));
const graphql_playground_middleware_express_1 = __importDefault(__webpack_require__(/*! graphql-playground-middleware-express */ "graphql-playground-middleware-express"));
const graphql_tools_1 = __webpack_require__(/*! graphql-tools */ "graphql-tools");
const middleware_1 = __webpack_require__(/*! graphql-voyager/middleware */ "graphql-voyager/middleware");
const authentificator_1 = __webpack_require__(/*! ~/authentificator */ "./src/authentificator/index.ts");
const databaseManager_1 = __webpack_require__(/*! ~/databaseManager */ "./src/databaseManager/index.ts");
const logger_1 = __webpack_require__(/*! ~/logger */ "./src/logger/index.ts");
const schemas_1 = __webpack_require__(/*! ~/schemas */ "./src/schemas/index.ts");
class App {
    static buildRoutes(endpoint, routes) {
        return Object.assign({ auth: `${endpoint}/auth`, playground: `${endpoint}/playground`, voyager: `${endpoint}/voyager` }, routes);
    }
    static createApp(props) {
        const app = express_1.default();
        const { schemas, endpoint, port, jwt, database, logger, routes, subscriptionsEndpoint } = props;
        // merge user schemas and legacy
        const schema = graphql_tools_1.mergeSchemas({ schemas: [...schemas, schemas_1.infoSchema] });
        // generate routes
        const routesList = App.buildRoutes(endpoint, routes);
        // define knex instance
        const knex = databaseManager_1.knexProvider({ logger, database });
        // define EventEmittre instance
        const emitter = new events_1.EventEmitter();
        // combine finally context object
        const context = {
            endpoint,
            jwt,
            logger,
            knex,
            emitter,
        };
        // This middleware must be defined first
        app.use(logger_1.requestHandlerMiddleware({ context }));
        app.use(cors_1.default());
        app.use(express_1.default.json({ limit: '50mb' }));
        app.use(express_1.default.urlencoded({ extended: true, limit: '50mb' }));
        app.use(authentificator_1.authentificatorMiddleware({
            context,
            authUrl: routesList.auth,
            allowedUrl: [routesList.playground],
        }));
        app.get(routesList.playground, graphql_playground_middleware_express_1.default({ endpoint }));
        app.use(routesList.voyager, middleware_1.express({ endpointUrl: endpoint }));
        app.use(endpoint, express_graphql_1.default(() => __awaiter(this, void 0, void 0, function* () {
            return ({
                context,
                graphiql: false,
                schema,
                subscriptionsEndpoint: `ws://localhost:${port}${subscriptionsEndpoint}`,
            });
        })));
        // this middleware most be defined first
        app.use(logger_1.errorHandlerMiddleware({ context }));
        return { app, context, schema, routes: routesList };
    }
}
exports.App = App;
exports.default = App;


/***/ }),

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
        const accessTokenPayload = Object.assign(Object.assign({}, payload), { type: TokenType.access, id: v4_1.default(), exp: Math.floor(Date.now() / 1000) + Number(context.jwt.accessTokenExpiresIn), iss: context.jwt.issuer });
        const refreshTokenPayload = Object.assign(Object.assign({}, payload), { type: TokenType.refresh, id: v4_1.default(), associated: accessTokenPayload.id, exp: Math.floor(Date.now() / 1000) + Number(context.jwt.refreshTokenExpiresIn), iss: context.jwt.issuer });
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
    /**
     * Route serving access token requests
     * This point response JSON object with token data:
     * e.g. {
     *  accessToken: "XXXXXXXXXXXXXXX...",
     *  tokenType: "bearer",
     *  expiresIn: 1582178054
     *  refreshToken: "XXXXXXXXXXXXXXX..."
     * }
     * @param  {Request} req The request
     * @param  {Response} res The response
     * @param  {string} req.body.login Account login
     * @param  {string} req.body.password Account password
     * @param  {Response} res
     */
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
    /**
     * Route serving refresh token requests
     * This point response JSON object with token data:
     * e.g. {
     *  accessToken: "XXXXXXXXXXXXXXX...",
     *  tokenType: "bearer",
     *  expiresIn: 1582178054
     *  refreshToken: "XXXXXXXXXXXXXXX..."
     * }
     * @param  {Request} req The request
     * @param  {Response} res The response
     * @param  {string} req.token Valid refresh token
     * @param  {Response} res
     */
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
    /**
     * Route serving token validation requests
     * This point response JSON object with token payload data
     * @param  {Request} req The request
     * @param  {Response} res The response
     * @param  {string} req.token Valid refresh token
     * @param  {Response} res
     */
    router.post(`${authUrl}/validate-token`, express_async_handler_1.default((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { body } = req;
        const { token } = body;
        const payload = Authentificator_1.Authentificator.verifyToken(token, publicKey);
        res.json(payload);
    })));
    /**
     * This point serve all request into GraphQL `endpoint`
     */
    router.use(endpoint, express_async_handler_1.default((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        if (allowedUrl.includes(req.originalUrl)) {
            return next();
        }
        const token = Authentificator_1.Authentificator.extractToken(req);
        Authentificator_1.Authentificator.verifyToken(token, publicKey);
        return next();
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
const http_1 = __webpack_require__(/*! http */ "http");
const chalk_1 = __importDefault(__webpack_require__(/*! chalk */ "chalk"));
const graphql_1 = __webpack_require__(/*! graphql */ "graphql");
const subscriptions_transport_ws_1 = __webpack_require__(/*! subscriptions-transport-ws */ "subscriptions-transport-ws");
const app_1 = __webpack_require__(/*! ~/app */ "./src/app/index.ts");
const logger_1 = __webpack_require__(/*! ~/logger */ "./src/logger/index.ts");
class Core {
    static init(config) {
        const { port, endpoint, subscriptionsEndpoint, logger } = config;
        // Create web application by wrapping express app
        const { app, context, schema, routes } = app_1.App.createApp(config);
        // Create web server
        const server = http_1.createServer(app);
        // configure knex query builder
        const { knex } = context;
        // check database connection
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
        // Run HTTP server
        server.listen(port, () => {
            // connect websockrt subscriptions werver
            // @see https://github.com/apollographql/subscriptions-transport-ws/blob/master/docs/source/express.md
            // eslint-disable-next-line no-new
            new subscriptions_transport_ws_1.SubscriptionServer({
                execute: graphql_1.execute,
                schema,
                subscribe: graphql_1.subscribe,
            }, {
                server,
                path: subscriptionsEndpoint,
            });
            console.log('');
            console.log('');
            console.log(chalk_1.default.green('========= GraphQL ========='));
            console.log('');
            console.log(`${chalk_1.default.green('GraphQL server')}:     ${chalk_1.default.yellow(`http://localhost:${port}${endpoint}`)}`);
            console.log(`${chalk_1.default.magenta('GraphQL playground')}: ${chalk_1.default.yellow(`http://localhost:${port}${routes.playground}`)}`);
            console.log(`${chalk_1.default.cyan('Auth Server')}:        ${chalk_1.default.yellow(`http://localhost:${port}${routes.auth}`)}`);
            console.log(`${chalk_1.default.blue('GraphQL voyager')}:    ${chalk_1.default.yellow(`http://localhost:${port}${routes.voyager}`)}`);
            console.log('');
        });
        return server;
    }
}
exports.Core = Core;
exports.default = Core;


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
__export(__webpack_require__(/*! ./app */ "./src/app/index.ts"));
__export(__webpack_require__(/*! ./authentificator */ "./src/authentificator/index.ts"));
__export(__webpack_require__(/*! ./databaseManager */ "./src/databaseManager/index.ts"));
__export(__webpack_require__(/*! ./logger */ "./src/logger/index.ts"));
__export(__webpack_require__(/*! ./core */ "./src/core/index.ts"));
__export(__webpack_require__(/*! ./schemas */ "./src/schemas/index.ts"));


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
const simple_1 = __importDefault(__webpack_require__(/*! ~/playground/schemas/simple */ "./src/playground/schemas/simple/index.ts"));
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
    subscriptionsEndpoint: '/api/subscriptions',
    jwt: jwtConfig,
    logger,
    port: 4000,
    schemas: [simple_1.default],
};
exports.serverConfig = serverConfig;
const server = index_1.Core.init(serverConfig);
exports.default = server;

/* WEBPACK VAR INJECTION */}.call(this, "src/playground"))

/***/ }),

/***/ "./src/playground/schemas/simple/index.ts":
/*!************************************************!*\
  !*** ./src/playground/schemas/simple/index.ts ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = __webpack_require__(/*! graphql */ "graphql");
const Post = new graphql_1.GraphQLObjectType({
    name: 'Post',
    description: 'Current Post data',
    fields: () => ({
        title: {
            type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString),
            description: 'Post Title',
        },
        url: {
            type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString),
            description: 'URL address',
        },
    }),
});
const schema = new graphql_1.GraphQLSchema({
    query: new graphql_1.GraphQLObjectType({
        name: 'Query',
        fields: () => ({
            post: {
                type: new graphql_1.GraphQLNonNull(Post),
                resolve: () => ({
                    title: 'Lorem ipsum',
                    url: 'hppts://google.com',
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

/***/ "./src/schemas/index.ts":
/*!******************************!*\
  !*** ./src/schemas/index.ts ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const info_1 = __importDefault(__webpack_require__(/*! ./info */ "./src/schemas/info/index.ts"));
exports.infoSchema = info_1.default;
exports.default = info_1.default;


/***/ }),

/***/ "./src/schemas/info/index.ts":
/*!***********************************!*\
  !*** ./src/schemas/info/index.ts ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(__dirname) {
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(__webpack_require__(/*! fs */ "fs"));
const path_1 = __importDefault(__webpack_require__(/*! path */ "path"));
const graphql_1 = __webpack_require__(/*! graphql */ "graphql");
const packageJson = fs_1.default.readFileSync(path_1.default.resolve(__dirname, '..', '..', '..', 'package.json'), 'utf8');
const packageInfo = JSON.parse(packageJson);
const DevInfo = new graphql_1.GraphQLObjectType({
    name: 'DevInfo',
    fields: () => ({
        name: {
            description: 'Application name',
            resolve: () => packageInfo.name,
            type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString),
        },
        description: {
            description: 'Application description',
            resolve: () => packageInfo.description,
            type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString),
        },
        version: {
            description: 'Application version number',
            resolve: () => packageInfo.version,
            type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString),
        },
        author: {
            description: 'Application author',
            resolve: () => packageInfo.author,
            type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString),
        },
        support: {
            description: 'Application support',
            resolve: () => packageInfo.support,
            type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString),
        },
        license: {
            description: 'Application license',
            resolve: () => packageInfo.license,
            type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString),
        },
        repository: {
            resolve: () => packageInfo.repository,
            type: new graphql_1.GraphQLNonNull(new graphql_1.GraphQLObjectType({
                name: 'Repository',
                description: 'Application repository',
                fields: () => ({
                    type: {
                        description: 'Repository type',
                        type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString),
                        resolve: () => packageInfo.repository.type,
                    },
                    url: {
                        description: 'Repository URL addess',
                        type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString),
                        resolve: () => packageInfo.repository.url,
                    },
                }),
            })),
        },
    }),
});
const schema = new graphql_1.GraphQLSchema({
    query: new graphql_1.GraphQLObjectType({
        name: 'Query',
        fields: () => ({
            devInfo: {
                description: 'Application development info',
                resolve: () => ({}),
                type: new graphql_1.GraphQLNonNull(DevInfo),
            },
        }),
    }),
});
exports.default = schema;

/* WEBPACK VAR INJECTION */}.call(this, "src/schemas/info"))

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

/***/ "cors":
/*!***********************!*\
  !*** external "cors" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("cors");

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

/***/ "express-graphql":
/*!**********************************!*\
  !*** external "express-graphql" ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("express-graphql");

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

/***/ "graphql-playground-middleware-express":
/*!********************************************************!*\
  !*** external "graphql-playground-middleware-express" ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("graphql-playground-middleware-express");

/***/ }),

/***/ "graphql-tools":
/*!********************************!*\
  !*** external "graphql-tools" ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("graphql-tools");

/***/ }),

/***/ "graphql-voyager/middleware":
/*!*********************************************!*\
  !*** external "graphql-voyager/middleware" ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("graphql-voyager/middleware");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("http");

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

/***/ "subscriptions-transport-ws":
/*!*********************************************!*\
  !*** external "subscriptions-transport-ws" ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("subscriptions-transport-ws");

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2FwcC9pbmRleC50cyIsIndlYnBhY2s6Ly8vLi9zcmMvYXV0aGVudGlmaWNhdG9yL0F1dGhlbnRpZmljYXRvci50cyIsIndlYnBhY2s6Ly8vLi9zcmMvYXV0aGVudGlmaWNhdG9yL2F1dGhlbnRpZmljYXRvck1pZGRsZXdhcmUudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2F1dGhlbnRpZmljYXRvci9pbmRleC50cyIsIndlYnBhY2s6Ly8vLi9zcmMvY29yZS9pbmRleC50cyIsIndlYnBhY2s6Ly8vLi9zcmMvZGF0YWJhc2VNYW5hZ2VyL2luZGV4LnRzIiwid2VicGFjazovLy8uL3NyYy9pbmRleC50cyIsIndlYnBhY2s6Ly8vLi9zcmMvbG9nZ2VyL2Vycm9ySGFuZGxlcnMvQmFkUmVxdWVzdEVycm9yLnRzIiwid2VicGFjazovLy8uL3NyYy9sb2dnZXIvZXJyb3JIYW5kbGVycy9Gb3JiaWRkZW5FcnJvci50cyIsIndlYnBhY2s6Ly8vLi9zcmMvbG9nZ2VyL2Vycm9ySGFuZGxlcnMvTm90Rm91bmRFcnJvci50cyIsIndlYnBhY2s6Ly8vLi9zcmMvbG9nZ2VyL2Vycm9ySGFuZGxlcnMvU2VydmVyRXJyb3IudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2xvZ2dlci9lcnJvckhhbmRsZXJzL2luZGV4LnRzIiwid2VicGFjazovLy8uL3NyYy9sb2dnZXIvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2xvZ2dlci9sb2dnZXJzL2F1dGgudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2xvZ2dlci9sb2dnZXJzL2h0dHAudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2xvZ2dlci9sb2dnZXJzL2luZGV4LnRzIiwid2VicGFjazovLy8uL3NyYy9sb2dnZXIvbG9nZ2Vycy9zZXJ2ZXIudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2xvZ2dlci9sb2dnZXJzL3NxbC50cyIsIndlYnBhY2s6Ly8vLi9zcmMvbG9nZ2VyL21pZGRsZXdhcmVzL2Vycm9ySGFuZGxlci50cyIsIndlYnBhY2s6Ly8vLi9zcmMvbG9nZ2VyL21pZGRsZXdhcmVzL2luZGV4LnRzIiwid2VicGFjazovLy8uL3NyYy9sb2dnZXIvbWlkZGxld2FyZXMvcmVxdWVzdEhhbmRsZXIudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2xvZ2dlci91dGlscy9sb2dGb3JtYXR0ZXIudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2xvZ2dlci91dGlscy9yZXNwb25zZUZvcm1hdHRlci50cyIsIndlYnBhY2s6Ly8vLi9zcmMvcGxheWdyb3VuZC9wbGF5Z3JvdW5kLnRzIiwid2VicGFjazovLy8uL3NyYy9wbGF5Z3JvdW5kL3NjaGVtYXMvc2ltcGxlL2luZGV4LnRzIiwid2VicGFjazovLy8uL3NyYy9zY2hlbWFzL2luZGV4LnRzIiwid2VicGFjazovLy8uL3NyYy9zY2hlbWFzL2luZm8vaW5kZXgudHMiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwiYmNyeXB0anNcIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJjaGFsa1wiIiwid2VicGFjazovLy9leHRlcm5hbCBcImNvcnNcIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJkZXZpY2UtZGV0ZWN0b3ItanNcIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJldmVudHNcIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJleHByZXNzXCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwiZXhwcmVzcy1hc3luYy1oYW5kbGVyXCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwiZXhwcmVzcy1ncmFwaHFsXCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwiZnNcIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJncmFwaHFsXCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwiZ3JhcGhxbC1wbGF5Z3JvdW5kLW1pZGRsZXdhcmUtZXhwcmVzc1wiIiwid2VicGFjazovLy9leHRlcm5hbCBcImdyYXBocWwtdG9vbHNcIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJncmFwaHFsLXZveWFnZXIvbWlkZGxld2FyZVwiIiwid2VicGFjazovLy9leHRlcm5hbCBcImh0dHBcIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJqc29ud2VidG9rZW5cIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJrbmV4XCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwibW9tZW50LXRpbWV6b25lXCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwicGF0aFwiIiwid2VicGFjazovLy9leHRlcm5hbCBcInBlcmZfaG9va3NcIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJzdWJzY3JpcHRpb25zLXRyYW5zcG9ydC13c1wiIiwid2VicGFjazovLy9leHRlcm5hbCBcInV1aWQvdjRcIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJ3aW5zdG9uXCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwid2luc3Rvbi1kYWlseS1yb3RhdGUtZmlsZVwiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O1FBQUE7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7OztRQUdBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSwwQ0FBMEMsZ0NBQWdDO1FBQzFFO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0Esd0RBQXdELGtCQUFrQjtRQUMxRTtRQUNBLGlEQUFpRCxjQUFjO1FBQy9EOztRQUVBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQSx5Q0FBeUMsaUNBQWlDO1FBQzFFLGdIQUFnSCxtQkFBbUIsRUFBRTtRQUNySTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLDJCQUEyQiwwQkFBMEIsRUFBRTtRQUN2RCxpQ0FBaUMsZUFBZTtRQUNoRDtRQUNBO1FBQ0E7O1FBRUE7UUFDQSxzREFBc0QsK0RBQStEOztRQUVy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Q0FBLG9DOzs7Ozs7Ozs7OztBQ0FBLGtFOzs7Ozs7Ozs7OztBQ0FBLDBDOzs7Ozs7Ozs7OztBQ0FBLHVEOzs7Ozs7Ozs7OztBQ0FBLGlDOzs7Ozs7Ozs7OztBQ0FBLHlDOzs7Ozs7Ozs7OztBQ0FBLGlDOzs7Ozs7Ozs7OztBQ0FBLDRDOzs7Ozs7Ozs7OztBQ0FBLGlDOzs7Ozs7Ozs7OztBQ0FBLHVDOzs7Ozs7Ozs7OztBQ0FBLHVEOzs7Ozs7Ozs7OztBQ0FBLG9DOzs7Ozs7Ozs7OztBQ0FBLG9DOzs7Ozs7Ozs7OztBQ0FBLHNEIiwiZmlsZSI6InBsYXlncm91bmQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBnZXR0ZXIgfSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiBcdFx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG4gXHRcdH1cbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbiBcdH07XG5cbiBcdC8vIGNyZWF0ZSBhIGZha2UgbmFtZXNwYWNlIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDE6IHZhbHVlIGlzIGEgbW9kdWxlIGlkLCByZXF1aXJlIGl0XG4gXHQvLyBtb2RlICYgMjogbWVyZ2UgYWxsIHByb3BlcnRpZXMgb2YgdmFsdWUgaW50byB0aGUgbnNcbiBcdC8vIG1vZGUgJiA0OiByZXR1cm4gdmFsdWUgd2hlbiBhbHJlYWR5IG5zIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDh8MTogYmVoYXZlIGxpa2UgcmVxdWlyZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy50ID0gZnVuY3Rpb24odmFsdWUsIG1vZGUpIHtcbiBcdFx0aWYobW9kZSAmIDEpIHZhbHVlID0gX193ZWJwYWNrX3JlcXVpcmVfXyh2YWx1ZSk7XG4gXHRcdGlmKG1vZGUgJiA4KSByZXR1cm4gdmFsdWU7XG4gXHRcdGlmKChtb2RlICYgNCkgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAmJiB2YWx1ZS5fX2VzTW9kdWxlKSByZXR1cm4gdmFsdWU7XG4gXHRcdHZhciBucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18ucihucyk7XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShucywgJ2RlZmF1bHQnLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2YWx1ZSB9KTtcbiBcdFx0aWYobW9kZSAmIDIgJiYgdHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSBmb3IodmFyIGtleSBpbiB2YWx1ZSkgX193ZWJwYWNrX3JlcXVpcmVfXy5kKG5zLCBrZXksIGZ1bmN0aW9uKGtleSkgeyByZXR1cm4gdmFsdWVba2V5XTsgfS5iaW5kKG51bGwsIGtleSkpO1xuIFx0XHRyZXR1cm4gbnM7XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gXCIuL3NyYy9wbGF5Z3JvdW5kL3BsYXlncm91bmQudHNcIik7XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2F3YWl0ZXIgPSAodGhpcyAmJiB0aGlzLl9fYXdhaXRlcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xuICAgIGZ1bmN0aW9uIGFkb3B0KHZhbHVlKSB7IHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFAgPyB2YWx1ZSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUodmFsdWUpOyB9KTsgfVxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XG4gICAgfSk7XG59O1xudmFyIF9faW1wb3J0RGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnREZWZhdWx0KSB8fCBmdW5jdGlvbiAobW9kKSB7XG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBcImRlZmF1bHRcIjogbW9kIH07XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuLyogZXNsaW50LWRpc2FibGUgaW1wb3J0L21heC1kZXBlbmRlbmNpZXMgKi9cbmNvbnN0IGV2ZW50c18xID0gcmVxdWlyZShcImV2ZW50c1wiKTtcbmNvbnN0IGNvcnNfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiY29yc1wiKSk7XG5jb25zdCBleHByZXNzXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcImV4cHJlc3NcIikpO1xuY29uc3QgZXhwcmVzc19ncmFwaHFsXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcImV4cHJlc3MtZ3JhcGhxbFwiKSk7XG5jb25zdCBncmFwaHFsX3BsYXlncm91bmRfbWlkZGxld2FyZV9leHByZXNzXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcImdyYXBocWwtcGxheWdyb3VuZC1taWRkbGV3YXJlLWV4cHJlc3NcIikpO1xuY29uc3QgZ3JhcGhxbF90b29sc18xID0gcmVxdWlyZShcImdyYXBocWwtdG9vbHNcIik7XG5jb25zdCBtaWRkbGV3YXJlXzEgPSByZXF1aXJlKFwiZ3JhcGhxbC12b3lhZ2VyL21pZGRsZXdhcmVcIik7XG5jb25zdCBhdXRoZW50aWZpY2F0b3JfMSA9IHJlcXVpcmUoXCJ+L2F1dGhlbnRpZmljYXRvclwiKTtcbmNvbnN0IGRhdGFiYXNlTWFuYWdlcl8xID0gcmVxdWlyZShcIn4vZGF0YWJhc2VNYW5hZ2VyXCIpO1xuY29uc3QgbG9nZ2VyXzEgPSByZXF1aXJlKFwifi9sb2dnZXJcIik7XG5jb25zdCBzY2hlbWFzXzEgPSByZXF1aXJlKFwifi9zY2hlbWFzXCIpO1xuY2xhc3MgQXBwIHtcbiAgICBzdGF0aWMgYnVpbGRSb3V0ZXMoZW5kcG9pbnQsIHJvdXRlcykge1xuICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7IGF1dGg6IGAke2VuZHBvaW50fS9hdXRoYCwgcGxheWdyb3VuZDogYCR7ZW5kcG9pbnR9L3BsYXlncm91bmRgLCB2b3lhZ2VyOiBgJHtlbmRwb2ludH0vdm95YWdlcmAgfSwgcm91dGVzKTtcbiAgICB9XG4gICAgc3RhdGljIGNyZWF0ZUFwcChwcm9wcykge1xuICAgICAgICBjb25zdCBhcHAgPSBleHByZXNzXzEuZGVmYXVsdCgpO1xuICAgICAgICBjb25zdCB7IHNjaGVtYXMsIGVuZHBvaW50LCBwb3J0LCBqd3QsIGRhdGFiYXNlLCBsb2dnZXIsIHJvdXRlcywgc3Vic2NyaXB0aW9uc0VuZHBvaW50IH0gPSBwcm9wcztcbiAgICAgICAgLy8gbWVyZ2UgdXNlciBzY2hlbWFzIGFuZCBsZWdhY3lcbiAgICAgICAgY29uc3Qgc2NoZW1hID0gZ3JhcGhxbF90b29sc18xLm1lcmdlU2NoZW1hcyh7IHNjaGVtYXM6IFsuLi5zY2hlbWFzLCBzY2hlbWFzXzEuaW5mb1NjaGVtYV0gfSk7XG4gICAgICAgIC8vIGdlbmVyYXRlIHJvdXRlc1xuICAgICAgICBjb25zdCByb3V0ZXNMaXN0ID0gQXBwLmJ1aWxkUm91dGVzKGVuZHBvaW50LCByb3V0ZXMpO1xuICAgICAgICAvLyBkZWZpbmUga25leCBpbnN0YW5jZVxuICAgICAgICBjb25zdCBrbmV4ID0gZGF0YWJhc2VNYW5hZ2VyXzEua25leFByb3ZpZGVyKHsgbG9nZ2VyLCBkYXRhYmFzZSB9KTtcbiAgICAgICAgLy8gZGVmaW5lIEV2ZW50RW1pdHRyZSBpbnN0YW5jZVxuICAgICAgICBjb25zdCBlbWl0dGVyID0gbmV3IGV2ZW50c18xLkV2ZW50RW1pdHRlcigpO1xuICAgICAgICAvLyBjb21iaW5lIGZpbmFsbHkgY29udGV4dCBvYmplY3RcbiAgICAgICAgY29uc3QgY29udGV4dCA9IHtcbiAgICAgICAgICAgIGVuZHBvaW50LFxuICAgICAgICAgICAgand0LFxuICAgICAgICAgICAgbG9nZ2VyLFxuICAgICAgICAgICAga25leCxcbiAgICAgICAgICAgIGVtaXR0ZXIsXG4gICAgICAgIH07XG4gICAgICAgIC8vIFRoaXMgbWlkZGxld2FyZSBtdXN0IGJlIGRlZmluZWQgZmlyc3RcbiAgICAgICAgYXBwLnVzZShsb2dnZXJfMS5yZXF1ZXN0SGFuZGxlck1pZGRsZXdhcmUoeyBjb250ZXh0IH0pKTtcbiAgICAgICAgYXBwLnVzZShjb3JzXzEuZGVmYXVsdCgpKTtcbiAgICAgICAgYXBwLnVzZShleHByZXNzXzEuZGVmYXVsdC5qc29uKHsgbGltaXQ6ICc1MG1iJyB9KSk7XG4gICAgICAgIGFwcC51c2UoZXhwcmVzc18xLmRlZmF1bHQudXJsZW5jb2RlZCh7IGV4dGVuZGVkOiB0cnVlLCBsaW1pdDogJzUwbWInIH0pKTtcbiAgICAgICAgYXBwLnVzZShhdXRoZW50aWZpY2F0b3JfMS5hdXRoZW50aWZpY2F0b3JNaWRkbGV3YXJlKHtcbiAgICAgICAgICAgIGNvbnRleHQsXG4gICAgICAgICAgICBhdXRoVXJsOiByb3V0ZXNMaXN0LmF1dGgsXG4gICAgICAgICAgICBhbGxvd2VkVXJsOiBbcm91dGVzTGlzdC5wbGF5Z3JvdW5kXSxcbiAgICAgICAgfSkpO1xuICAgICAgICBhcHAuZ2V0KHJvdXRlc0xpc3QucGxheWdyb3VuZCwgZ3JhcGhxbF9wbGF5Z3JvdW5kX21pZGRsZXdhcmVfZXhwcmVzc18xLmRlZmF1bHQoeyBlbmRwb2ludCB9KSk7XG4gICAgICAgIGFwcC51c2Uocm91dGVzTGlzdC52b3lhZ2VyLCBtaWRkbGV3YXJlXzEuZXhwcmVzcyh7IGVuZHBvaW50VXJsOiBlbmRwb2ludCB9KSk7XG4gICAgICAgIGFwcC51c2UoZW5kcG9pbnQsIGV4cHJlc3NfZ3JhcGhxbF8xLmRlZmF1bHQoKCkgPT4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgcmV0dXJuICh7XG4gICAgICAgICAgICAgICAgY29udGV4dCxcbiAgICAgICAgICAgICAgICBncmFwaGlxbDogZmFsc2UsXG4gICAgICAgICAgICAgICAgc2NoZW1hLFxuICAgICAgICAgICAgICAgIHN1YnNjcmlwdGlvbnNFbmRwb2ludDogYHdzOi8vbG9jYWxob3N0OiR7cG9ydH0ke3N1YnNjcmlwdGlvbnNFbmRwb2ludH1gLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pKSk7XG4gICAgICAgIC8vIHRoaXMgbWlkZGxld2FyZSBtb3N0IGJlIGRlZmluZWQgZmlyc3RcbiAgICAgICAgYXBwLnVzZShsb2dnZXJfMS5lcnJvckhhbmRsZXJNaWRkbGV3YXJlKHsgY29udGV4dCB9KSk7XG4gICAgICAgIHJldHVybiB7IGFwcCwgY29udGV4dCwgc2NoZW1hLCByb3V0ZXM6IHJvdXRlc0xpc3QgfTtcbiAgICB9XG59XG5leHBvcnRzLkFwcCA9IEFwcDtcbmV4cG9ydHMuZGVmYXVsdCA9IEFwcDtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9fYXdhaXRlciA9ICh0aGlzICYmIHRoaXMuX19hd2FpdGVyKSB8fCBmdW5jdGlvbiAodGhpc0FyZywgX2FyZ3VtZW50cywgUCwgZ2VuZXJhdG9yKSB7XG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XG4gICAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvci5uZXh0KHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHN0ZXAocmVzdWx0KSB7IHJlc3VsdC5kb25lID8gcmVzb2x2ZShyZXN1bHQudmFsdWUpIDogYWRvcHQocmVzdWx0LnZhbHVlKS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpOyB9XG4gICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTtcbiAgICB9KTtcbn07XG52YXIgX19pbXBvcnREZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydERlZmF1bHQpIHx8IGZ1bmN0aW9uIChtb2QpIHtcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IFwiZGVmYXVsdFwiOiBtb2QgfTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBmc18xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCJmc1wiKSk7XG5jb25zdCBqc29ud2VidG9rZW5fMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwianNvbndlYnRva2VuXCIpKTtcbmNvbnN0IG1vbWVudF90aW1lem9uZV8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCJtb21lbnQtdGltZXpvbmVcIikpO1xuY29uc3QgdjRfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwidXVpZC92NFwiKSk7XG5jb25zdCBpbmRleF8xID0gcmVxdWlyZShcIn4vaW5kZXhcIik7XG52YXIgVG9rZW5UeXBlO1xuKGZ1bmN0aW9uIChUb2tlblR5cGUpIHtcbiAgICBUb2tlblR5cGVbXCJhY2Nlc3NcIl0gPSBcImFjY2Vzc1wiO1xuICAgIFRva2VuVHlwZVtcInJlZnJlc2hcIl0gPSBcInJlZnJlc2hcIjtcbn0pKFRva2VuVHlwZSA9IGV4cG9ydHMuVG9rZW5UeXBlIHx8IChleHBvcnRzLlRva2VuVHlwZSA9IHt9KSk7XG5jbGFzcyBBdXRoZW50aWZpY2F0b3Ige1xuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHRoaXMucHJvcHMgPSBwcm9wcztcbiAgICB9XG4gICAgLyoqXG4gICAgICogRXh0cmFjdCBUb2tlbiBmcm9tIEhUVFAgcmVxdWVzdCBoZWFkZXJzXG4gICAgICogQHBhcmFtICB7UmVxdWVzdH0gcmVxdWVzdFxuICAgICAqIEByZXR1cm5zIHN0cmluZ1xuICAgICAqL1xuICAgIHN0YXRpYyBleHRyYWN0VG9rZW4ocmVxdWVzdCkge1xuICAgICAgICBjb25zdCB7IGhlYWRlcnMgfSA9IHJlcXVlc3Q7XG4gICAgICAgIGNvbnN0IHsgYXV0aG9yaXphdGlvbiB9ID0gaGVhZGVycztcbiAgICAgICAgY29uc3QgYmVhcmVyID0gU3RyaW5nKGF1dGhvcml6YXRpb24pLnNwbGl0KCcgJylbMF07XG4gICAgICAgIGNvbnN0IHRva2VuID0gU3RyaW5nKGF1dGhvcml6YXRpb24pLnNwbGl0KCcgJylbMV07XG4gICAgICAgIHJldHVybiBiZWFyZXIudG9Mb2NhbGVMb3dlckNhc2UoKSA9PT0gJ2JlYXJlcicgPyB0b2tlbiA6ICcnO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBWZXJpZnkgSldUIHRva2VuXG4gICAgICogQHBhcmFtICB7c3RyaW5nfSB0b2tlblxuICAgICAqIEBwYXJhbSAge3N0cmluZ30gcHVibGljS2V5UGF0aFxuICAgICAqIEByZXR1cm5zIElUb2tlbkluZm9bJ3BheWxvYWQnXVxuICAgICAqL1xuICAgIHN0YXRpYyB2ZXJpZnlUb2tlbih0b2tlbiwgcHVibGljS2V5UGF0aCkge1xuICAgICAgICBpZiAodG9rZW4gPT09IG51bGwpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBpbmRleF8xLlNlcnZlckVycm9yKCdUb2tlbiB2ZXJpZmljYXRpb24gZmFpbGVkLiBUaGUgdG9rZW4gbXVzdCBiZSBwcm92aWRlZCcpO1xuICAgICAgICB9XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBwdWJsaWNLZXkgPSBmc18xLmRlZmF1bHQucmVhZEZpbGVTeW5jKHB1YmxpY0tleVBhdGgpO1xuICAgICAgICAgICAgY29uc3QgcGF5bG9hZCA9IGpzb253ZWJ0b2tlbl8xLmRlZmF1bHQudmVyaWZ5KFN0cmluZyh0b2tlbiksIHB1YmxpY0tleSk7XG4gICAgICAgICAgICByZXR1cm4gcGF5bG9hZDtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgaW5kZXhfMS5TZXJ2ZXJFcnJvcignVG9rZW4gdmVyaWZpY2F0aW9uIGZhaWxlZCcsIGVycik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogUmVnaXN0ZXIgdG9rZW5zXG4gICAgICogQHBhcmFtICB7e3V1aWQ6c3RyaW5nO2RldmljZUluZm86e307fX0gZGF0YVxuICAgICAqIEByZXR1cm5zIElUb2tlbkluZm9cbiAgICAgKi9cbiAgICByZWdpc3RlclRva2VucyhkYXRhKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICBjb25zdCB7IGNvbnRleHQgfSA9IHRoaXMucHJvcHM7XG4gICAgICAgICAgICBjb25zdCB7IGtuZXgsIGxvZ2dlciB9ID0gY29udGV4dDtcbiAgICAgICAgICAgIGNvbnN0IGFjY291bnQgPSB5aWVsZCBrbmV4XG4gICAgICAgICAgICAgICAgLnNlbGVjdChbJ2lkJywgJ3JvbGVzJ10pXG4gICAgICAgICAgICAgICAgLmZyb20oJ2FjY291bnRzJylcbiAgICAgICAgICAgICAgICAud2hlcmUoe1xuICAgICAgICAgICAgICAgIGlkOiBkYXRhLnV1aWQsXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5maXJzdCgpO1xuICAgICAgICAgICAgY29uc3QgdG9rZW5zID0gdGhpcy5nZW5lcmF0ZVRva2Vucyh7XG4gICAgICAgICAgICAgICAgdXVpZDogYWNjb3VudC5pZCxcbiAgICAgICAgICAgICAgICByb2xlczogYWNjb3VudC5yb2xlcyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLy8gUmVnaXN0ZXIgYWNjZXNzIHRva2VuXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHlpZWxkIGtuZXgoJ3Rva2VucycpLmluc2VydCh7XG4gICAgICAgICAgICAgICAgICAgIGlkOiB0b2tlbnMuYWNjZXNzVG9rZW4ucGF5bG9hZC5pZCxcbiAgICAgICAgICAgICAgICAgICAgYWNjb3VudDogdG9rZW5zLmFjY2Vzc1Rva2VuLnBheWxvYWQudXVpZCxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogVG9rZW5UeXBlLmFjY2VzcyxcbiAgICAgICAgICAgICAgICAgICAgZGV2aWNlSW5mbzogZGF0YS5kZXZpY2VJbmZvLFxuICAgICAgICAgICAgICAgICAgICBleHBpcmVkQXQ6IG1vbWVudF90aW1lem9uZV8xLmRlZmF1bHQodG9rZW5zLmFjY2Vzc1Rva2VuLnBheWxvYWQuZXhwKS5mb3JtYXQoKSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgaW5kZXhfMS5TZXJ2ZXJFcnJvcignRmFpbGVkIHRvIHJlZ2lzdGVyIGFjY2VzcyB0b2tlbicsIGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyByZWdpc3RlciByZWZyZXNoIHRva2VuXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHlpZWxkIGtuZXgoJ3Rva2VucycpLmluc2VydCh7XG4gICAgICAgICAgICAgICAgICAgIGlkOiB0b2tlbnMucmVmcmVzaFRva2VuLnBheWxvYWQuaWQsXG4gICAgICAgICAgICAgICAgICAgIGFjY291bnQ6IHRva2Vucy5yZWZyZXNoVG9rZW4ucGF5bG9hZC51dWlkLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBUb2tlblR5cGUucmVmcmVzaCxcbiAgICAgICAgICAgICAgICAgICAgYXNzb2NpYXRlZDogdG9rZW5zLmFjY2Vzc1Rva2VuLnBheWxvYWQuaWQsXG4gICAgICAgICAgICAgICAgICAgIGRldmljZUluZm86IGRhdGEuZGV2aWNlSW5mbyxcbiAgICAgICAgICAgICAgICAgICAgZXhwaXJlZEF0OiBtb21lbnRfdGltZXpvbmVfMS5kZWZhdWx0KHRva2Vucy5yZWZyZXNoVG9rZW4ucGF5bG9hZC5leHApLmZvcm1hdCgpLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBpbmRleF8xLlNlcnZlckVycm9yKCdGYWlsZWQgdG8gcmVnaXN0ZXIgcmVmcmVzaCB0b2tlbicsIGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsb2dnZXIuYXV0aC5pbmZvKCdOZXcgQWNjZXNzIHRva2VuIHdhcyByZWdpc3RlcmVkJywgdG9rZW5zLmFjY2Vzc1Rva2VuLnBheWxvYWQpO1xuICAgICAgICAgICAgcmV0dXJuIHRva2VucztcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGdlbmVyYXRlVG9rZW5zKHBheWxvYWQpIHtcbiAgICAgICAgY29uc3QgeyBjb250ZXh0IH0gPSB0aGlzLnByb3BzO1xuICAgICAgICAvLyBjaGVjayBmaWxlIHRvIGFjY2VzcyBhbmQgcmVhZGFibGVcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGZzXzEuZGVmYXVsdC5hY2Nlc3NTeW5jKGNvbnRleHQuand0LnByaXZhdGVLZXkpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBpbmRleF8xLlNlcnZlckVycm9yKCdGYWlsZWQgdG8gb3BlbiBKV1QgcHJpdmF0ZUtleSBmaWxlJywgeyBlcnIgfSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcHJpdmF0S2V5ID0gZnNfMS5kZWZhdWx0LnJlYWRGaWxlU3luYyhjb250ZXh0Lmp3dC5wcml2YXRlS2V5KTtcbiAgICAgICAgY29uc3QgYWNjZXNzVG9rZW5QYXlsb2FkID0gT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHt9LCBwYXlsb2FkKSwgeyB0eXBlOiBUb2tlblR5cGUuYWNjZXNzLCBpZDogdjRfMS5kZWZhdWx0KCksIGV4cDogTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMCkgKyBOdW1iZXIoY29udGV4dC5qd3QuYWNjZXNzVG9rZW5FeHBpcmVzSW4pLCBpc3M6IGNvbnRleHQuand0Lmlzc3VlciB9KTtcbiAgICAgICAgY29uc3QgcmVmcmVzaFRva2VuUGF5bG9hZCA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7fSwgcGF5bG9hZCksIHsgdHlwZTogVG9rZW5UeXBlLnJlZnJlc2gsIGlkOiB2NF8xLmRlZmF1bHQoKSwgYXNzb2NpYXRlZDogYWNjZXNzVG9rZW5QYXlsb2FkLmlkLCBleHA6IE1hdGguZmxvb3IoRGF0ZS5ub3coKSAvIDEwMDApICsgTnVtYmVyKGNvbnRleHQuand0LnJlZnJlc2hUb2tlbkV4cGlyZXNJbiksIGlzczogY29udGV4dC5qd3QuaXNzdWVyIH0pO1xuICAgICAgICBjb25zdCBhY2Nlc3NUb2tlbiA9IGpzb253ZWJ0b2tlbl8xLmRlZmF1bHQuc2lnbihhY2Nlc3NUb2tlblBheWxvYWQsIHByaXZhdEtleSwge1xuICAgICAgICAgICAgYWxnb3JpdGhtOiBjb250ZXh0Lmp3dC5hbGdvcml0aG0sXG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCByZWZyZXNoVG9rZW4gPSBqc29ud2VidG9rZW5fMS5kZWZhdWx0LnNpZ24ocmVmcmVzaFRva2VuUGF5bG9hZCwgcHJpdmF0S2V5LCB7XG4gICAgICAgICAgICBhbGdvcml0aG06IGNvbnRleHQuand0LmFsZ29yaXRobSxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBhY2Nlc3NUb2tlbjoge1xuICAgICAgICAgICAgICAgIHRva2VuOiBhY2Nlc3NUb2tlbixcbiAgICAgICAgICAgICAgICBwYXlsb2FkOiBPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oe30sIGFjY2Vzc1Rva2VuUGF5bG9hZCksIHsgdHlwZTogVG9rZW5UeXBlLmFjY2VzcyB9KSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByZWZyZXNoVG9rZW46IHtcbiAgICAgICAgICAgICAgICB0b2tlbjogcmVmcmVzaFRva2VuLFxuICAgICAgICAgICAgICAgIHBheWxvYWQ6IE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7fSwgcmVmcmVzaFRva2VuUGF5bG9hZCksIHsgdHlwZTogVG9rZW5UeXBlLnJlZnJlc2ggfSksXG4gICAgICAgICAgICB9LFxuICAgICAgICB9O1xuICAgIH1cbiAgICByZXZva2VUb2tlbih0b2tlbklkKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICBjb25zdCB7IGNvbnRleHQgfSA9IHRoaXMucHJvcHM7XG4gICAgICAgICAgICBjb25zdCB7IGtuZXggfSA9IGNvbnRleHQ7XG4gICAgICAgICAgICB5aWVsZCBrbmV4LmRlbCgndG9rZW5zJykud2hlcmUoe1xuICAgICAgICAgICAgICAgIGlkOiB0b2tlbklkLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBjaGVja1Rva2VuRXhpc3QodG9rZW5JZCkge1xuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgY29uc3QgeyBjb250ZXh0IH0gPSB0aGlzLnByb3BzO1xuICAgICAgICAgICAgY29uc3QgeyBrbmV4IH0gPSBjb250ZXh0O1xuICAgICAgICAgICAgY29uc3QgdG9rZW5EYXRhID0geWllbGQga25leFxuICAgICAgICAgICAgICAgIC5zZWxlY3QoWydpZCddKVxuICAgICAgICAgICAgICAgIC5mcm9tKCd0b2tlbnMnKVxuICAgICAgICAgICAgICAgIC53aGVyZSh7IGlkOiB0b2tlbklkIH0pXG4gICAgICAgICAgICAgICAgLmZpcnN0KCk7XG4gICAgICAgICAgICByZXR1cm4gdG9rZW5EYXRhICE9PSBudWxsO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgZ2V0QWNjb3VudEJ5TG9naW4obG9naW4pIHtcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgIGNvbnN0IHsgY29udGV4dCB9ID0gdGhpcy5wcm9wcztcbiAgICAgICAgICAgIGNvbnN0IHsga25leCB9ID0gY29udGV4dDtcbiAgICAgICAgICAgIGNvbnN0IGFjY291bnQgPSB5aWVsZCBrbmV4XG4gICAgICAgICAgICAgICAgLnNlbGVjdChbJ2lkJywgJ3Bhc3N3b3JkJywgJ3N0YXR1cyddKVxuICAgICAgICAgICAgICAgIC5mcm9tKCdhY2NvdW50cycpXG4gICAgICAgICAgICAgICAgLndoZXJlKHtcbiAgICAgICAgICAgICAgICBsb2dpbixcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmZpcnN0KCk7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGlkOiBhY2NvdW50LmlkLFxuICAgICAgICAgICAgICAgIHBhc3N3b3JkOiBhY2NvdW50LnBhc3N3b3JkLFxuICAgICAgICAgICAgICAgIHN0YXR1czogYWNjb3VudC5zdGF0dXMsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgc3RhdGljIHNlbmRSZXNwb25zZUVycm9yKHJlc3BvbnNldHlwZSwgcmVzcCkge1xuICAgICAgICBjb25zdCBlcnJvcnMgPSBbXTtcbiAgICAgICAgc3dpdGNoIChyZXNwb25zZXR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ2FjY291bnRGb3JiaWRkZW4nOlxuICAgICAgICAgICAgICAgIGVycm9ycy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogJ0FjY291bnQgbG9ja2VkJyxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ0F1dGhvcml6YXRpb24gZXJyb3InLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnYXV0aGVudGlmaWNhdGlvblJlcXVpcmVkJzpcbiAgICAgICAgICAgICAgICBlcnJvcnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdBdXRoZW50aWNhdGlvbiBSZXF1aXJlZCcsXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICdBdXRob3JpemF0aW9uIGVycm9yJyxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2lzTm90QVJlZnJlc2hUb2tlbic6XG4gICAgICAgICAgICAgICAgZXJyb3JzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiAnVG9rZW4gZXJyb3InLFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnSXMgbm90IGEgcmVmcmVzaCB0b2tlbicsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICd0b2tlbkV4cGlyZWQnOlxuICAgICAgICAgICAgICAgIGVycm9ycy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogJ1Rva2VuIGVycm9yJyxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ1RoaXMgdG9rZW4gZXhwaXJlZCcsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICd0b2tlbldhc1Jldm9rZWQnOlxuICAgICAgICAgICAgICAgIGVycm9ycy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogJ1Rva2VuIGVycm9yJyxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ1Rva2VuIHdhcyByZXZva2VkJyxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2FjY291bnROb3RGb3VuZCc6XG4gICAgICAgICAgICBjYXNlICdpbnZhbGlkTG9naW5PclBhc3N3b3JkJzpcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgZXJyb3JzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiAnSW52YWxpZCBsb2dpbiBvciBwYXNzd29yZCcsXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICdBdXRob3JpemF0aW9uIGVycm9yJyxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzcC5zdGF0dXMoNDAxKS5qc29uKHsgZXJyb3JzIH0pO1xuICAgIH1cbn1cbmV4cG9ydHMuQXV0aGVudGlmaWNhdG9yID0gQXV0aGVudGlmaWNhdG9yO1xudmFyIFJlc3BvbnNlRXJyb3JUeXBlO1xuKGZ1bmN0aW9uIChSZXNwb25zZUVycm9yVHlwZSkge1xuICAgIFJlc3BvbnNlRXJyb3JUeXBlW1wiYXV0aGVudGlmaWNhdGlvblJlcXVpcmVkXCJdID0gXCJhdXRoZW50aWZpY2F0aW9uUmVxdWlyZWRcIjtcbiAgICBSZXNwb25zZUVycm9yVHlwZVtcImFjY291bnROb3RGb3VuZFwiXSA9IFwiYWNjb3VudE5vdEZvdW5kXCI7XG4gICAgUmVzcG9uc2VFcnJvclR5cGVbXCJhY2NvdW50Rm9yYmlkZGVuXCJdID0gXCJhY2NvdW50Rm9yYmlkZGVuXCI7XG4gICAgUmVzcG9uc2VFcnJvclR5cGVbXCJpbnZhbGlkTG9naW5PclBhc3N3b3JkXCJdID0gXCJpbnZhbGlkTG9naW5PclBhc3N3b3JkXCI7XG4gICAgUmVzcG9uc2VFcnJvclR5cGVbXCJ0b2tlbkV4cGlyZWRcIl0gPSBcInRva2VuRXhwaXJlZFwiO1xuICAgIFJlc3BvbnNlRXJyb3JUeXBlW1wiaXNOb3RBUmVmcmVzaFRva2VuXCJdID0gXCJpc05vdEFSZWZyZXNoVG9rZW5cIjtcbiAgICBSZXNwb25zZUVycm9yVHlwZVtcInRva2VuV2FzUmV2b2tlZFwiXSA9IFwidG9rZW5XYXNSZXZva2VkXCI7XG59KShSZXNwb25zZUVycm9yVHlwZSA9IGV4cG9ydHMuUmVzcG9uc2VFcnJvclR5cGUgfHwgKGV4cG9ydHMuUmVzcG9uc2VFcnJvclR5cGUgPSB7fSkpO1xudmFyIEFjY291bnRTdGF0dXM7XG4oZnVuY3Rpb24gKEFjY291bnRTdGF0dXMpIHtcbiAgICBBY2NvdW50U3RhdHVzW1wiYWxsb3dlZFwiXSA9IFwiYWxsb3dlZFwiO1xuICAgIEFjY291bnRTdGF0dXNbXCJmb3JiaWRkZW5cIl0gPSBcImZvcmJpZGRlblwiO1xufSkoQWNjb3VudFN0YXR1cyA9IGV4cG9ydHMuQWNjb3VudFN0YXR1cyB8fCAoZXhwb3J0cy5BY2NvdW50U3RhdHVzID0ge30pKTtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9fYXdhaXRlciA9ICh0aGlzICYmIHRoaXMuX19hd2FpdGVyKSB8fCBmdW5jdGlvbiAodGhpc0FyZywgX2FyZ3VtZW50cywgUCwgZ2VuZXJhdG9yKSB7XG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XG4gICAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvci5uZXh0KHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHN0ZXAocmVzdWx0KSB7IHJlc3VsdC5kb25lID8gcmVzb2x2ZShyZXN1bHQudmFsdWUpIDogYWRvcHQocmVzdWx0LnZhbHVlKS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpOyB9XG4gICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTtcbiAgICB9KTtcbn07XG52YXIgX19pbXBvcnREZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydERlZmF1bHQpIHx8IGZ1bmN0aW9uIChtb2QpIHtcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IFwiZGVmYXVsdFwiOiBtb2QgfTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBiY3J5cHRqc18xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCJiY3J5cHRqc1wiKSk7XG5jb25zdCBkZXZpY2VfZGV0ZWN0b3JfanNfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiZGV2aWNlLWRldGVjdG9yLWpzXCIpKTtcbmNvbnN0IGV4cHJlc3NfMSA9IHJlcXVpcmUoXCJleHByZXNzXCIpO1xuY29uc3QgZXhwcmVzc19hc3luY19oYW5kbGVyXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcImV4cHJlc3MtYXN5bmMtaGFuZGxlclwiKSk7XG5jb25zdCBBdXRoZW50aWZpY2F0b3JfMSA9IHJlcXVpcmUoXCIuL0F1dGhlbnRpZmljYXRvclwiKTtcbmNvbnN0IGF1dGhlbnRpZmljYXRvck1pZGRsZXdhcmUgPSAoY29uZmlnKSA9PiB7XG4gICAgY29uc3QgeyBjb250ZXh0LCBhdXRoVXJsLCBhbGxvd2VkVXJsIH0gPSBjb25maWc7XG4gICAgY29uc3QgeyBlbmRwb2ludCB9ID0gY29uZmlnLmNvbnRleHQ7XG4gICAgY29uc3QgeyBwdWJsaWNLZXkgfSA9IGNvbmZpZy5jb250ZXh0Lmp3dDtcbiAgICBjb25zdCB7IGxvZ2dlciB9ID0gY29udGV4dDtcbiAgICBjb25zdCBhdXRoZW50aWZpY2F0b3IgPSBuZXcgQXV0aGVudGlmaWNhdG9yXzEuQXV0aGVudGlmaWNhdG9yKHsgY29udGV4dCB9KTtcbiAgICBjb25zdCByb3V0ZXIgPSBleHByZXNzXzEuUm91dGVyKCk7XG4gICAgLyoqXG4gICAgICogUm91dGUgc2VydmluZyBhY2Nlc3MgdG9rZW4gcmVxdWVzdHNcbiAgICAgKiBUaGlzIHBvaW50IHJlc3BvbnNlIEpTT04gb2JqZWN0IHdpdGggdG9rZW4gZGF0YTpcbiAgICAgKiBlLmcuIHtcbiAgICAgKiAgYWNjZXNzVG9rZW46IFwiWFhYWFhYWFhYWFhYWFhYLi4uXCIsXG4gICAgICogIHRva2VuVHlwZTogXCJiZWFyZXJcIixcbiAgICAgKiAgZXhwaXJlc0luOiAxNTgyMTc4MDU0XG4gICAgICogIHJlZnJlc2hUb2tlbjogXCJYWFhYWFhYWFhYWFhYWFguLi5cIlxuICAgICAqIH1cbiAgICAgKiBAcGFyYW0gIHtSZXF1ZXN0fSByZXEgVGhlIHJlcXVlc3RcbiAgICAgKiBAcGFyYW0gIHtSZXNwb25zZX0gcmVzIFRoZSByZXNwb25zZVxuICAgICAqIEBwYXJhbSAge3N0cmluZ30gcmVxLmJvZHkubG9naW4gQWNjb3VudCBsb2dpblxuICAgICAqIEBwYXJhbSAge3N0cmluZ30gcmVxLmJvZHkucGFzc3dvcmQgQWNjb3VudCBwYXNzd29yZFxuICAgICAqIEBwYXJhbSAge1Jlc3BvbnNlfSByZXNcbiAgICAgKi9cbiAgICByb3V0ZXIucG9zdChgJHthdXRoVXJsfS9hY2Nlc3MtdG9rZW5gLCBleHByZXNzX2FzeW5jX2hhbmRsZXJfMS5kZWZhdWx0KChyZXEsIHJlcykgPT4gX19hd2FpdGVyKHZvaWQgMCwgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgIGNvbnN0IHsgYm9keSwgaGVhZGVycyB9ID0gcmVxO1xuICAgICAgICBjb25zdCB7IGxvZ2luLCBwYXNzd29yZCB9ID0gYm9keTtcbiAgICAgICAgY29uc3QgZGV2aWNlRGV0ZWN0b3IgPSBuZXcgZGV2aWNlX2RldGVjdG9yX2pzXzEuZGVmYXVsdCgpO1xuICAgICAgICBjb25zdCBkZXZpY2VJbmZvID0gZGV2aWNlRGV0ZWN0b3IucGFyc2UoaGVhZGVyc1sndXNlci1hZ2VudCddKTtcbiAgICAgICAgbG9nZ2VyLmF1dGguaW5mbygnQWNjZXNzIHRva2VuIHJlcXVlc3QnLCB7IGxvZ2luIH0pO1xuICAgICAgICBjb25zdCBhY2NvdW50ID0geWllbGQgYXV0aGVudGlmaWNhdG9yLmdldEFjY291bnRCeUxvZ2luKGxvZ2luKTtcbiAgICAgICAgLy8gYWNjb3VudCBub3QgZm91bmRcbiAgICAgICAgaWYgKCFhY2NvdW50IHx8ICFiY3J5cHRqc18xLmRlZmF1bHQuY29tcGFyZVN5bmMocGFzc3dvcmQsIGFjY291bnQucGFzc3dvcmQpKSB7XG4gICAgICAgICAgICBsb2dnZXIuYXV0aC5lcnJvcignQWNjb3VudCBub3QgZm91bmQnLCB7IGxvZ2luIH0pO1xuICAgICAgICAgICAgcmV0dXJuIEF1dGhlbnRpZmljYXRvcl8xLkF1dGhlbnRpZmljYXRvci5zZW5kUmVzcG9uc2VFcnJvcihBdXRoZW50aWZpY2F0b3JfMS5SZXNwb25zZUVycm9yVHlwZS5hY2NvdW50Tm90Rm91bmQsIHJlcyk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gYWNjb3VudCBsb2NrZWRcbiAgICAgICAgaWYgKGFjY291bnQuc3RhdHVzID09PSBBdXRoZW50aWZpY2F0b3JfMS5BY2NvdW50U3RhdHVzLmZvcmJpZGRlbiAmJiBiY3J5cHRqc18xLmRlZmF1bHQuY29tcGFyZVN5bmMocGFzc3dvcmQsIGFjY291bnQucGFzc3dvcmQpKSB7XG4gICAgICAgICAgICBsb2dnZXIuYXV0aC5pbmZvKCdBdXRoZW50aWZpY2F0aW9uIGZvcmJpZGRlbicsIHsgbG9naW4gfSk7XG4gICAgICAgICAgICByZXR1cm4gQXV0aGVudGlmaWNhdG9yXzEuQXV0aGVudGlmaWNhdG9yLnNlbmRSZXNwb25zZUVycm9yKEF1dGhlbnRpZmljYXRvcl8xLlJlc3BvbnNlRXJyb3JUeXBlLmFjY291bnRGb3JiaWRkZW4sIHJlcyk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gc3VjY2Vzc1xuICAgICAgICBpZiAoYWNjb3VudC5zdGF0dXMgPT09IEF1dGhlbnRpZmljYXRvcl8xLkFjY291bnRTdGF0dXMuYWxsb3dlZCAmJiBiY3J5cHRqc18xLmRlZmF1bHQuY29tcGFyZVN5bmMocGFzc3dvcmQsIGFjY291bnQucGFzc3dvcmQpKSB7XG4gICAgICAgICAgICBjb25zdCB0b2tlbnMgPSB5aWVsZCBhdXRoZW50aWZpY2F0b3IucmVnaXN0ZXJUb2tlbnMoe1xuICAgICAgICAgICAgICAgIHV1aWQ6IGFjY291bnQuaWQsXG4gICAgICAgICAgICAgICAgZGV2aWNlSW5mbyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoMjAwKS5qc29uKHtcbiAgICAgICAgICAgICAgICBhY2Nlc3NUb2tlbjogdG9rZW5zLmFjY2Vzc1Rva2VuLnRva2VuLFxuICAgICAgICAgICAgICAgIHRva2VuVHlwZTogJ2JlYXJlcicsXG4gICAgICAgICAgICAgICAgZXhwaXJlc0luOiBjb25maWcuY29udGV4dC5qd3QuYWNjZXNzVG9rZW5FeHBpcmVzSW4sXG4gICAgICAgICAgICAgICAgcmVmcmVzaFRva2VuOiB0b2tlbnMucmVmcmVzaFRva2VuLnRva2VuLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIEF1dGhlbnRpZmljYXRvcl8xLkF1dGhlbnRpZmljYXRvci5zZW5kUmVzcG9uc2VFcnJvcihBdXRoZW50aWZpY2F0b3JfMS5SZXNwb25zZUVycm9yVHlwZS5hY2NvdW50Tm90Rm91bmQsIHJlcyk7XG4gICAgfSkpKTtcbiAgICAvKipcbiAgICAgKiBSb3V0ZSBzZXJ2aW5nIHJlZnJlc2ggdG9rZW4gcmVxdWVzdHNcbiAgICAgKiBUaGlzIHBvaW50IHJlc3BvbnNlIEpTT04gb2JqZWN0IHdpdGggdG9rZW4gZGF0YTpcbiAgICAgKiBlLmcuIHtcbiAgICAgKiAgYWNjZXNzVG9rZW46IFwiWFhYWFhYWFhYWFhYWFhYLi4uXCIsXG4gICAgICogIHRva2VuVHlwZTogXCJiZWFyZXJcIixcbiAgICAgKiAgZXhwaXJlc0luOiAxNTgyMTc4MDU0XG4gICAgICogIHJlZnJlc2hUb2tlbjogXCJYWFhYWFhYWFhYWFhYWFguLi5cIlxuICAgICAqIH1cbiAgICAgKiBAcGFyYW0gIHtSZXF1ZXN0fSByZXEgVGhlIHJlcXVlc3RcbiAgICAgKiBAcGFyYW0gIHtSZXNwb25zZX0gcmVzIFRoZSByZXNwb25zZVxuICAgICAqIEBwYXJhbSAge3N0cmluZ30gcmVxLnRva2VuIFZhbGlkIHJlZnJlc2ggdG9rZW5cbiAgICAgKiBAcGFyYW0gIHtSZXNwb25zZX0gcmVzXG4gICAgICovXG4gICAgcm91dGVyLnBvc3QoYCR7YXV0aFVybH0vcmVmcmVzaC10b2tlbmAsIGV4cHJlc3NfYXN5bmNfaGFuZGxlcl8xLmRlZmF1bHQoKHJlcSwgcmVzKSA9PiBfX2F3YWl0ZXIodm9pZCAwLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgY29uc3QgeyBib2R5LCBoZWFkZXJzIH0gPSByZXE7XG4gICAgICAgIGNvbnN0IHsgdG9rZW4gfSA9IGJvZHk7XG4gICAgICAgIC8vIHRyeSB0byB2ZXJpZnkgcmVmcmVzaCB0b2tlblxuICAgICAgICBjb25zdCB0b2tlblBheWxvYWQgPSBBdXRoZW50aWZpY2F0b3JfMS5BdXRoZW50aWZpY2F0b3IudmVyaWZ5VG9rZW4odG9rZW4sIGNvbnRleHQuand0LnB1YmxpY0tleSk7XG4gICAgICAgIGlmICh0b2tlblBheWxvYWQudHlwZSAhPT0gQXV0aGVudGlmaWNhdG9yXzEuVG9rZW5UeXBlLnJlZnJlc2gpIHtcbiAgICAgICAgICAgIGxvZ2dlci5hdXRoLmluZm8oJ1RyaWVkIHRvIHJlZnJlc2ggdG9rZW4gYnkgYWNjZXNzIHRva2VuLiBSZWplY3RlZCcsIHsgcGF5bG9hZDogdG9rZW5QYXlsb2FkIH0pO1xuICAgICAgICAgICAgcmV0dXJuIEF1dGhlbnRpZmljYXRvcl8xLkF1dGhlbnRpZmljYXRvci5zZW5kUmVzcG9uc2VFcnJvcihBdXRoZW50aWZpY2F0b3JfMS5SZXNwb25zZUVycm9yVHlwZS5pc05vdEFSZWZyZXNoVG9rZW4sIHJlcyk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gY2hlY2sgdG8gdG9rZW4gZXhpc3RcbiAgICAgICAgaWYgKCEoeWllbGQgYXV0aGVudGlmaWNhdG9yLmNoZWNrVG9rZW5FeGlzdCh0b2tlblBheWxvYWQuaWQpKSkge1xuICAgICAgICAgICAgbG9nZ2VyLmF1dGguaW5mbygnVHJpZWQgdG8gcmVmcmVzaCB0b2tlbiBieSByZXZva2VkIHJlZnJlc2ggdG9rZW4uIFJlamVjdGVkJywgeyBwYXlsb2FkOiB0b2tlblBheWxvYWQgfSk7XG4gICAgICAgICAgICByZXR1cm4gQXV0aGVudGlmaWNhdG9yXzEuQXV0aGVudGlmaWNhdG9yLnNlbmRSZXNwb25zZUVycm9yKEF1dGhlbnRpZmljYXRvcl8xLlJlc3BvbnNlRXJyb3JUeXBlLnRva2VuV2FzUmV2b2tlZCwgcmVzKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBkZXZpY2VEZXRlY3RvciA9IG5ldyBkZXZpY2VfZGV0ZWN0b3JfanNfMS5kZWZhdWx0KCk7XG4gICAgICAgIGNvbnN0IGRldmljZUluZm8gPSBkZXZpY2VEZXRlY3Rvci5wYXJzZShoZWFkZXJzWyd1c2VyLWFnZW50J10pO1xuICAgICAgICAvLyByZXZva2Ugb2xkIGFjY2VzcyB0b2tlbiBvZiB0aGlzIHJlZnJlc2hcbiAgICAgICAgeWllbGQgYXV0aGVudGlmaWNhdG9yLnJldm9rZVRva2VuKHRva2VuUGF5bG9hZC5hc3NvY2lhdGVkKTtcbiAgICAgICAgLy8gcmV2b2tlIG9sZCByZWZyZXNoIHRva2VuXG4gICAgICAgIHlpZWxkIGF1dGhlbnRpZmljYXRvci5yZXZva2VUb2tlbih0b2tlblBheWxvYWQuaWQpO1xuICAgICAgICAvLyBjcmVhdGUgbmV3IHRva2Vuc1xuICAgICAgICBjb25zdCB0b2tlbnMgPSB5aWVsZCBhdXRoZW50aWZpY2F0b3IucmVnaXN0ZXJUb2tlbnMoe1xuICAgICAgICAgICAgdXVpZDogdG9rZW5QYXlsb2FkLnV1aWQsXG4gICAgICAgICAgICBkZXZpY2VJbmZvLFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoMjAwKS5qc29uKHtcbiAgICAgICAgICAgIGFjY2Vzc1Rva2VuOiB0b2tlbnMuYWNjZXNzVG9rZW4udG9rZW4sXG4gICAgICAgICAgICB0b2tlblR5cGU6ICdiZWFyZXInLFxuICAgICAgICAgICAgZXhwaXJlc0luOiBjb25maWcuY29udGV4dC5qd3QuYWNjZXNzVG9rZW5FeHBpcmVzSW4sXG4gICAgICAgICAgICByZWZyZXNoVG9rZW46IHRva2Vucy5yZWZyZXNoVG9rZW4udG9rZW4sXG4gICAgICAgIH0pO1xuICAgIH0pKSk7XG4gICAgLyoqXG4gICAgICogUm91dGUgc2VydmluZyB0b2tlbiB2YWxpZGF0aW9uIHJlcXVlc3RzXG4gICAgICogVGhpcyBwb2ludCByZXNwb25zZSBKU09OIG9iamVjdCB3aXRoIHRva2VuIHBheWxvYWQgZGF0YVxuICAgICAqIEBwYXJhbSAge1JlcXVlc3R9IHJlcSBUaGUgcmVxdWVzdFxuICAgICAqIEBwYXJhbSAge1Jlc3BvbnNlfSByZXMgVGhlIHJlc3BvbnNlXG4gICAgICogQHBhcmFtICB7c3RyaW5nfSByZXEudG9rZW4gVmFsaWQgcmVmcmVzaCB0b2tlblxuICAgICAqIEBwYXJhbSAge1Jlc3BvbnNlfSByZXNcbiAgICAgKi9cbiAgICByb3V0ZXIucG9zdChgJHthdXRoVXJsfS92YWxpZGF0ZS10b2tlbmAsIGV4cHJlc3NfYXN5bmNfaGFuZGxlcl8xLmRlZmF1bHQoKHJlcSwgcmVzKSA9PiBfX2F3YWl0ZXIodm9pZCAwLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgY29uc3QgeyBib2R5IH0gPSByZXE7XG4gICAgICAgIGNvbnN0IHsgdG9rZW4gfSA9IGJvZHk7XG4gICAgICAgIGNvbnN0IHBheWxvYWQgPSBBdXRoZW50aWZpY2F0b3JfMS5BdXRoZW50aWZpY2F0b3IudmVyaWZ5VG9rZW4odG9rZW4sIHB1YmxpY0tleSk7XG4gICAgICAgIHJlcy5qc29uKHBheWxvYWQpO1xuICAgIH0pKSk7XG4gICAgLyoqXG4gICAgICogVGhpcyBwb2ludCBzZXJ2ZSBhbGwgcmVxdWVzdCBpbnRvIEdyYXBoUUwgYGVuZHBvaW50YFxuICAgICAqL1xuICAgIHJvdXRlci51c2UoZW5kcG9pbnQsIGV4cHJlc3NfYXN5bmNfaGFuZGxlcl8xLmRlZmF1bHQoKHJlcSwgcmVzLCBuZXh0KSA9PiBfX2F3YWl0ZXIodm9pZCAwLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgaWYgKGFsbG93ZWRVcmwuaW5jbHVkZXMocmVxLm9yaWdpbmFsVXJsKSkge1xuICAgICAgICAgICAgcmV0dXJuIG5leHQoKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB0b2tlbiA9IEF1dGhlbnRpZmljYXRvcl8xLkF1dGhlbnRpZmljYXRvci5leHRyYWN0VG9rZW4ocmVxKTtcbiAgICAgICAgQXV0aGVudGlmaWNhdG9yXzEuQXV0aGVudGlmaWNhdG9yLnZlcmlmeVRva2VuKHRva2VuLCBwdWJsaWNLZXkpO1xuICAgICAgICByZXR1cm4gbmV4dCgpO1xuICAgIH0pKSk7XG4gICAgcmV0dXJuIHJvdXRlcjtcbn07XG5leHBvcnRzLmF1dGhlbnRpZmljYXRvck1pZGRsZXdhcmUgPSBhdXRoZW50aWZpY2F0b3JNaWRkbGV3YXJlO1xuZXhwb3J0cy5kZWZhdWx0ID0gYXV0aGVudGlmaWNhdG9yTWlkZGxld2FyZTtcbiIsIlwidXNlIHN0cmljdFwiO1xuZnVuY3Rpb24gX19leHBvcnQobSkge1xuICAgIGZvciAodmFyIHAgaW4gbSkgaWYgKCFleHBvcnRzLmhhc093blByb3BlcnR5KHApKSBleHBvcnRzW3BdID0gbVtwXTtcbn1cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbl9fZXhwb3J0KHJlcXVpcmUoXCIuL0F1dGhlbnRpZmljYXRvclwiKSk7XG5fX2V4cG9ydChyZXF1aXJlKFwiLi9hdXRoZW50aWZpY2F0b3JNaWRkbGV3YXJlXCIpKTtcbi8vIFRPRE8gVGVzdHMgcmV1aXJlZFxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19pbXBvcnREZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydERlZmF1bHQpIHx8IGZ1bmN0aW9uIChtb2QpIHtcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IFwiZGVmYXVsdFwiOiBtb2QgfTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBodHRwXzEgPSByZXF1aXJlKFwiaHR0cFwiKTtcbmNvbnN0IGNoYWxrXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcImNoYWxrXCIpKTtcbmNvbnN0IGdyYXBocWxfMSA9IHJlcXVpcmUoXCJncmFwaHFsXCIpO1xuY29uc3Qgc3Vic2NyaXB0aW9uc190cmFuc3BvcnRfd3NfMSA9IHJlcXVpcmUoXCJzdWJzY3JpcHRpb25zLXRyYW5zcG9ydC13c1wiKTtcbmNvbnN0IGFwcF8xID0gcmVxdWlyZShcIn4vYXBwXCIpO1xuY29uc3QgbG9nZ2VyXzEgPSByZXF1aXJlKFwifi9sb2dnZXJcIik7XG5jbGFzcyBDb3JlIHtcbiAgICBzdGF0aWMgaW5pdChjb25maWcpIHtcbiAgICAgICAgY29uc3QgeyBwb3J0LCBlbmRwb2ludCwgc3Vic2NyaXB0aW9uc0VuZHBvaW50LCBsb2dnZXIgfSA9IGNvbmZpZztcbiAgICAgICAgLy8gQ3JlYXRlIHdlYiBhcHBsaWNhdGlvbiBieSB3cmFwcGluZyBleHByZXNzIGFwcFxuICAgICAgICBjb25zdCB7IGFwcCwgY29udGV4dCwgc2NoZW1hLCByb3V0ZXMgfSA9IGFwcF8xLkFwcC5jcmVhdGVBcHAoY29uZmlnKTtcbiAgICAgICAgLy8gQ3JlYXRlIHdlYiBzZXJ2ZXJcbiAgICAgICAgY29uc3Qgc2VydmVyID0gaHR0cF8xLmNyZWF0ZVNlcnZlcihhcHApO1xuICAgICAgICAvLyBjb25maWd1cmUga25leCBxdWVyeSBidWlsZGVyXG4gICAgICAgIGNvbnN0IHsga25leCB9ID0gY29udGV4dDtcbiAgICAgICAgLy8gY2hlY2sgZGF0YWJhc2UgY29ubmVjdGlvblxuICAgICAgICBrbmV4XG4gICAgICAgICAgICAucmF3KCdTRUxFQ1QgMSsxIEFTIHJlc3VsdCcpXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICBsb2dnZXIuc2VydmVyLmRlYnVnKCdUZXN0IHRoZSBjb25uZWN0aW9uIGJ5IHRyeWluZyB0byBhdXRoZW50aWNhdGUgaXMgT0snKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9KVxuICAgICAgICAgICAgLmNhdGNoKGVyciA9PiB7XG4gICAgICAgICAgICBsb2dnZXIuc2VydmVyLmVycm9yKGVyci5uYW1lLCBlcnIpO1xuICAgICAgICAgICAgdGhyb3cgbmV3IGxvZ2dlcl8xLlNlcnZlckVycm9yKGVycik7XG4gICAgICAgIH0pO1xuICAgICAgICAvLyBSdW4gSFRUUCBzZXJ2ZXJcbiAgICAgICAgc2VydmVyLmxpc3Rlbihwb3J0LCAoKSA9PiB7XG4gICAgICAgICAgICAvLyBjb25uZWN0IHdlYnNvY2tydCBzdWJzY3JpcHRpb25zIHdlcnZlclxuICAgICAgICAgICAgLy8gQHNlZSBodHRwczovL2dpdGh1Yi5jb20vYXBvbGxvZ3JhcGhxbC9zdWJzY3JpcHRpb25zLXRyYW5zcG9ydC13cy9ibG9iL21hc3Rlci9kb2NzL3NvdXJjZS9leHByZXNzLm1kXG4gICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tbmV3XG4gICAgICAgICAgICBuZXcgc3Vic2NyaXB0aW9uc190cmFuc3BvcnRfd3NfMS5TdWJzY3JpcHRpb25TZXJ2ZXIoe1xuICAgICAgICAgICAgICAgIGV4ZWN1dGU6IGdyYXBocWxfMS5leGVjdXRlLFxuICAgICAgICAgICAgICAgIHNjaGVtYSxcbiAgICAgICAgICAgICAgICBzdWJzY3JpYmU6IGdyYXBocWxfMS5zdWJzY3JpYmUsXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgc2VydmVyLFxuICAgICAgICAgICAgICAgIHBhdGg6IHN1YnNjcmlwdGlvbnNFbmRwb2ludCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJycpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJycpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coY2hhbGtfMS5kZWZhdWx0LmdyZWVuKCc9PT09PT09PT0gR3JhcGhRTCA9PT09PT09PT0nKSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnJyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtjaGFsa18xLmRlZmF1bHQuZ3JlZW4oJ0dyYXBoUUwgc2VydmVyJyl9OiAgICAgJHtjaGFsa18xLmRlZmF1bHQueWVsbG93KGBodHRwOi8vbG9jYWxob3N0OiR7cG9ydH0ke2VuZHBvaW50fWApfWApO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYCR7Y2hhbGtfMS5kZWZhdWx0Lm1hZ2VudGEoJ0dyYXBoUUwgcGxheWdyb3VuZCcpfTogJHtjaGFsa18xLmRlZmF1bHQueWVsbG93KGBodHRwOi8vbG9jYWxob3N0OiR7cG9ydH0ke3JvdXRlcy5wbGF5Z3JvdW5kfWApfWApO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYCR7Y2hhbGtfMS5kZWZhdWx0LmN5YW4oJ0F1dGggU2VydmVyJyl9OiAgICAgICAgJHtjaGFsa18xLmRlZmF1bHQueWVsbG93KGBodHRwOi8vbG9jYWxob3N0OiR7cG9ydH0ke3JvdXRlcy5hdXRofWApfWApO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYCR7Y2hhbGtfMS5kZWZhdWx0LmJsdWUoJ0dyYXBoUUwgdm95YWdlcicpfTogICAgJHtjaGFsa18xLmRlZmF1bHQueWVsbG93KGBodHRwOi8vbG9jYWxob3N0OiR7cG9ydH0ke3JvdXRlcy52b3lhZ2VyfWApfWApO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJycpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHNlcnZlcjtcbiAgICB9XG59XG5leHBvcnRzLkNvcmUgPSBDb3JlO1xuZXhwb3J0cy5kZWZhdWx0ID0gQ29yZTtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9faW1wb3J0RGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnREZWZhdWx0KSB8fCBmdW5jdGlvbiAobW9kKSB7XG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBcImRlZmF1bHRcIjogbW9kIH07XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgcGVyZl9ob29rc18xID0gcmVxdWlyZShcInBlcmZfaG9va3NcIik7XG5jb25zdCBrbmV4XzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcImtuZXhcIikpO1xuY29uc3Qga25leFByb3ZpZGVyID0gKGNvbmZpZykgPT4ge1xuICAgIGNvbnN0IHsgZGF0YWJhc2UsIGxvZ2dlciB9ID0gY29uZmlnO1xuICAgIGNvbnN0IHRpbWVzID0ge307XG4gICAgbGV0IGNvdW50ID0gMDtcbiAgICBjb25zdCBpbnN0YW5jZSA9IGtuZXhfMS5kZWZhdWx0KGRhdGFiYXNlKTtcbiAgICBpbnN0YW5jZVxuICAgICAgICAub24oJ3F1ZXJ5JywgcXVlcnkgPT4ge1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZXJzY29yZS1kYW5nbGVcbiAgICAgICAgY29uc3QgdWlkID0gcXVlcnkuX19rbmV4UXVlcnlVaWQ7XG4gICAgICAgIHRpbWVzW3VpZF0gPSB7XG4gICAgICAgICAgICBwb3NpdGlvbjogY291bnQsXG4gICAgICAgICAgICBxdWVyeSxcbiAgICAgICAgICAgIHN0YXJ0VGltZTogcGVyZl9ob29rc18xLnBlcmZvcm1hbmNlLm5vdygpLFxuICAgICAgICAgICAgZmluaXNoZWQ6IGZhbHNlLFxuICAgICAgICB9O1xuICAgICAgICBjb3VudCArPSAxO1xuICAgIH0pXG4gICAgICAgIC5vbigncXVlcnktcmVzcG9uc2UnLCAocmVzcG9uc2UsIHF1ZXJ5KSA9PiB7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlcnNjb3JlLWRhbmdsZVxuICAgICAgICBjb25zdCB1aWQgPSBxdWVyeS5fX2tuZXhRdWVyeVVpZDtcbiAgICAgICAgdGltZXNbdWlkXS5lbmRUaW1lID0gcGVyZl9ob29rc18xLnBlcmZvcm1hbmNlLm5vdygpO1xuICAgICAgICB0aW1lc1t1aWRdLmZpbmlzaGVkID0gdHJ1ZTtcbiAgICAgICAgbG9nZ2VyLnNxbC5kZWJ1ZyhxdWVyeS5zcWwsIHRpbWVzW3VpZF0pO1xuICAgIH0pXG4gICAgICAgIC5vbigncXVlcnktZXJyb3InLCAoZXJyLCBxdWVyeSkgPT4ge1xuICAgICAgICBsb2dnZXIuc3FsLmVycm9yKHF1ZXJ5LnNxbCwgeyBlcnIgfSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGluc3RhbmNlO1xufTtcbmV4cG9ydHMua25leFByb3ZpZGVyID0ga25leFByb3ZpZGVyO1xuZXhwb3J0cy5kZWZhdWx0ID0ga25leFByb3ZpZGVyO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5mdW5jdGlvbiBfX2V4cG9ydChtKSB7XG4gICAgZm9yICh2YXIgcCBpbiBtKSBpZiAoIWV4cG9ydHMuaGFzT3duUHJvcGVydHkocCkpIGV4cG9ydHNbcF0gPSBtW3BdO1xufVxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuX19leHBvcnQocmVxdWlyZShcIi4vYXBwXCIpKTtcbl9fZXhwb3J0KHJlcXVpcmUoXCIuL2F1dGhlbnRpZmljYXRvclwiKSk7XG5fX2V4cG9ydChyZXF1aXJlKFwiLi9kYXRhYmFzZU1hbmFnZXJcIikpO1xuX19leHBvcnQocmVxdWlyZShcIi4vbG9nZ2VyXCIpKTtcbl9fZXhwb3J0KHJlcXVpcmUoXCIuL2NvcmVcIikpO1xuX19leHBvcnQocmVxdWlyZShcIi4vc2NoZW1hc1wiKSk7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNsYXNzIEJhZFJlcXVlc3RFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgICBjb25zdHJ1Y3RvcihtZXNzYWdlLCBtZXRhRGF0YSkge1xuICAgICAgICBzdXBlcihtZXNzYWdlKTtcbiAgICAgICAgdGhpcy5uYW1lID0gJ0JhZFJlcXVlc3RFcnJvcic7XG4gICAgICAgIHRoaXMubWVzc2FnZSA9IG1lc3NhZ2U7XG4gICAgICAgIHRoaXMubWV0YURhdGEgPSBtZXRhRGF0YTtcbiAgICAgICAgdGhpcy5zdGF0dXMgPSA0MDA7XG4gICAgICAgIC8vIFNldCB0aGUgcHJvdG90eXBlIGV4cGxpY2l0bHkuXG4gICAgICAgIE9iamVjdC5zZXRQcm90b3R5cGVPZih0aGlzLCBCYWRSZXF1ZXN0RXJyb3IucHJvdG90eXBlKTtcbiAgICB9XG59XG5leHBvcnRzLmRlZmF1bHQgPSBCYWRSZXF1ZXN0RXJyb3I7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNsYXNzIEZvcmJpZGRlbkVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICAgIGNvbnN0cnVjdG9yKG1lc3NhZ2UsIG1ldGFEYXRhKSB7XG4gICAgICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgICAgICB0aGlzLm5hbWUgPSAnRm9yYmlkZGVuRXJyb3InO1xuICAgICAgICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xuICAgICAgICB0aGlzLm1ldGFEYXRhID0gbWV0YURhdGE7XG4gICAgICAgIHRoaXMuc3RhdHVzID0gNTAzO1xuICAgICAgICAvLyBTZXQgdGhlIHByb3RvdHlwZSBleHBsaWNpdGx5LlxuICAgICAgICBPYmplY3Quc2V0UHJvdG90eXBlT2YodGhpcywgRm9yYmlkZGVuRXJyb3IucHJvdG90eXBlKTtcbiAgICB9XG59XG5leHBvcnRzLmRlZmF1bHQgPSBGb3JiaWRkZW5FcnJvcjtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY2xhc3MgTm90Rm91bmRFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgICBjb25zdHJ1Y3RvcihtZXNzYWdlLCBtZXRhRGF0YSkge1xuICAgICAgICBzdXBlcihtZXNzYWdlKTtcbiAgICAgICAgdGhpcy5uYW1lID0gJ05vdEZvdW5kRXJyb3InO1xuICAgICAgICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xuICAgICAgICB0aGlzLm1ldGFEYXRhID0gbWV0YURhdGE7XG4gICAgICAgIHRoaXMuc3RhdHVzID0gNDA0O1xuICAgICAgICAvLyBTZXQgdGhlIHByb3RvdHlwZSBleHBsaWNpdGx5LlxuICAgICAgICBPYmplY3Quc2V0UHJvdG90eXBlT2YodGhpcywgTm90Rm91bmRFcnJvci5wcm90b3R5cGUpO1xuICAgIH1cbn1cbmV4cG9ydHMuZGVmYXVsdCA9IE5vdEZvdW5kRXJyb3I7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNsYXNzIFNlcnZlckVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICAgIGNvbnN0cnVjdG9yKG1lc3NhZ2UsIG1ldGFEYXRhKSB7XG4gICAgICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgICAgICB0aGlzLm5hbWUgPSAnU2VydmVyRXJyb3InO1xuICAgICAgICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xuICAgICAgICB0aGlzLm1ldGFEYXRhID0gbWV0YURhdGE7XG4gICAgICAgIHRoaXMuc3RhdHVzID0gNTAwO1xuICAgICAgICAvLyBTZXQgdGhlIHByb3RvdHlwZSBleHBsaWNpdGx5LlxuICAgICAgICBPYmplY3Quc2V0UHJvdG90eXBlT2YodGhpcywgU2VydmVyRXJyb3IucHJvdG90eXBlKTtcbiAgICB9XG59XG5leHBvcnRzLmRlZmF1bHQgPSBTZXJ2ZXJFcnJvcjtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9faW1wb3J0RGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnREZWZhdWx0KSB8fCBmdW5jdGlvbiAobW9kKSB7XG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBcImRlZmF1bHRcIjogbW9kIH07XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgQmFkUmVxdWVzdEVycm9yXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4vQmFkUmVxdWVzdEVycm9yXCIpKTtcbmV4cG9ydHMuQmFkUmVxdWVzdEVycm9yID0gQmFkUmVxdWVzdEVycm9yXzEuZGVmYXVsdDtcbmNvbnN0IEZvcmJpZGRlbkVycm9yXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4vRm9yYmlkZGVuRXJyb3JcIikpO1xuZXhwb3J0cy5Gb3JiaWRkZW5FcnJvciA9IEZvcmJpZGRlbkVycm9yXzEuZGVmYXVsdDtcbmNvbnN0IE5vdEZvdW5kRXJyb3JfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi9Ob3RGb3VuZEVycm9yXCIpKTtcbmV4cG9ydHMuTm90Rm91bmRFcnJvciA9IE5vdEZvdW5kRXJyb3JfMS5kZWZhdWx0O1xuY29uc3QgU2VydmVyRXJyb3JfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi9TZXJ2ZXJFcnJvclwiKSk7XG5leHBvcnRzLlNlcnZlckVycm9yID0gU2VydmVyRXJyb3JfMS5kZWZhdWx0O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19yZXN0ID0gKHRoaXMgJiYgdGhpcy5fX3Jlc3QpIHx8IGZ1bmN0aW9uIChzLCBlKSB7XG4gICAgdmFyIHQgPSB7fTtcbiAgICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkgJiYgZS5pbmRleE9mKHApIDwgMClcbiAgICAgICAgdFtwXSA9IHNbcF07XG4gICAgaWYgKHMgIT0gbnVsbCAmJiB0eXBlb2YgT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyA9PT0gXCJmdW5jdGlvblwiKVxuICAgICAgICBmb3IgKHZhciBpID0gMCwgcCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMocyk7IGkgPCBwLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoZS5pbmRleE9mKHBbaV0pIDwgMCAmJiBPYmplY3QucHJvdG90eXBlLnByb3BlcnR5SXNFbnVtZXJhYmxlLmNhbGwocywgcFtpXSkpXG4gICAgICAgICAgICAgICAgdFtwW2ldXSA9IHNbcFtpXV07XG4gICAgICAgIH1cbiAgICByZXR1cm4gdDtcbn07XG5mdW5jdGlvbiBfX2V4cG9ydChtKSB7XG4gICAgZm9yICh2YXIgcCBpbiBtKSBpZiAoIWV4cG9ydHMuaGFzT3duUHJvcGVydHkocCkpIGV4cG9ydHNbcF0gPSBtW3BdO1xufVxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xucmVxdWlyZShcIndpbnN0b24tZGFpbHktcm90YXRlLWZpbGVcIik7XG5jb25zdCBsb2dnZXJzXzEgPSByZXF1aXJlKFwiLi9sb2dnZXJzXCIpO1xuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGltcG9ydC9uby1tdXRhYmxlLWV4cG9ydHNcbmxldCBsb2dnZXI7XG5leHBvcnRzLmxvZ2dlciA9IGxvZ2dlcjtcbmV4cG9ydHMuY29uZmlndXJlTG9nZ2VyID0gKGNvbmZpZykgPT4ge1xuICAgIGNvbnN0IHsgbG9nZ2VycyB9ID0gY29uZmlnLCBsb2dnZXJDb25maWcgPSBfX3Jlc3QoY29uZmlnLCBbXCJsb2dnZXJzXCJdKTtcbiAgICBleHBvcnRzLmxvZ2dlciA9IGxvZ2dlciA9IE9iamVjdC5hc3NpZ24oeyBhdXRoOiBsb2dnZXJzXzEuYXV0aExvZ2dlcihsb2dnZXJDb25maWcpLCBodHRwOiBsb2dnZXJzXzEuaHR0cExvZ2dlcihsb2dnZXJDb25maWcpLCBzZXJ2ZXI6IGxvZ2dlcnNfMS5zZXJ2ZXJMb2dnZXIobG9nZ2VyQ29uZmlnKSwgc3FsOiBsb2dnZXJzXzEuc3FsTG9nZ2VyKGxvZ2dlckNvbmZpZykgfSwgbG9nZ2Vycyk7XG4gICAgcmV0dXJuIGxvZ2dlcjtcbn07XG5fX2V4cG9ydChyZXF1aXJlKFwiLi9taWRkbGV3YXJlc1wiKSk7XG5fX2V4cG9ydChyZXF1aXJlKFwiLi9lcnJvckhhbmRsZXJzXCIpKTtcbi8vIFRPRE8gVGVzdHMgcmV1aXJlZFxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19pbXBvcnREZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydERlZmF1bHQpIHx8IGZ1bmN0aW9uIChtb2QpIHtcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IFwiZGVmYXVsdFwiOiBtb2QgfTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCB3aW5zdG9uXzEgPSByZXF1aXJlKFwid2luc3RvblwiKTtcbnJlcXVpcmUoXCJ3aW5zdG9uLWRhaWx5LXJvdGF0ZS1maWxlXCIpO1xuY29uc3QgbG9nRm9ybWF0dGVyXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4uL3V0aWxzL2xvZ0Zvcm1hdHRlclwiKSk7XG5leHBvcnRzLmRlZmF1bHQgPSAoY29uZmlnKSA9PiB7XG4gICAgY29uc3QgeyBsb2dQYXRoIH0gPSBjb25maWc7XG4gICAgcmV0dXJuIHdpbnN0b25fMS5jcmVhdGVMb2dnZXIoe1xuICAgICAgICBsZXZlbDogJ2luZm8nLFxuICAgICAgICBmb3JtYXQ6IGxvZ0Zvcm1hdHRlcl8xLmRlZmF1bHQsXG4gICAgICAgIHRyYW5zcG9ydHM6IFtcbiAgICAgICAgICAgIG5ldyB3aW5zdG9uXzEudHJhbnNwb3J0cy5EYWlseVJvdGF0ZUZpbGUoe1xuICAgICAgICAgICAgICAgIGZpbGVuYW1lOiBgJHtsb2dQYXRofS8lREFURSUtYXV0aC5sb2dgLFxuICAgICAgICAgICAgICAgIGxldmVsOiAnaW5mbycsXG4gICAgICAgICAgICAgICAgZGF0ZVBhdHRlcm46ICdZWVlZLU1NLUREJyxcbiAgICAgICAgICAgICAgICB6aXBwZWRBcmNoaXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgIG1heFNpemU6ICcyMG0nLFxuICAgICAgICAgICAgICAgIG1heEZpbGVzOiAnMTRkJyxcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgbmV3IHdpbnN0b25fMS50cmFuc3BvcnRzLkRhaWx5Um90YXRlRmlsZSh7XG4gICAgICAgICAgICAgICAgZmlsZW5hbWU6IGAke2xvZ1BhdGh9LyVEQVRFJS1kZWJ1Zy5sb2dgLFxuICAgICAgICAgICAgICAgIGxldmVsOiAnZGVidWcnLFxuICAgICAgICAgICAgICAgIGRhdGVQYXR0ZXJuOiAnWVlZWS1NTS1ERCcsXG4gICAgICAgICAgICAgICAgemlwcGVkQXJjaGl2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBtYXhTaXplOiAnMjBtJyxcbiAgICAgICAgICAgICAgICBtYXhGaWxlczogJzE0ZCcsXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgXSxcbiAgICB9KTtcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2ltcG9ydERlZmF1bHQgPSAodGhpcyAmJiB0aGlzLl9faW1wb3J0RGVmYXVsdCkgfHwgZnVuY3Rpb24gKG1vZCkge1xuICAgIHJldHVybiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSA/IG1vZCA6IHsgXCJkZWZhdWx0XCI6IG1vZCB9O1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IHdpbnN0b25fMSA9IHJlcXVpcmUoXCJ3aW5zdG9uXCIpO1xucmVxdWlyZShcIndpbnN0b24tZGFpbHktcm90YXRlLWZpbGVcIik7XG5jb25zdCBsb2dGb3JtYXR0ZXJfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi4vdXRpbHMvbG9nRm9ybWF0dGVyXCIpKTtcbmV4cG9ydHMuZGVmYXVsdCA9IChjb25maWcpID0+IHtcbiAgICBjb25zdCB7IGxvZ1BhdGggfSA9IGNvbmZpZztcbiAgICByZXR1cm4gd2luc3Rvbl8xLmNyZWF0ZUxvZ2dlcih7XG4gICAgICAgIGxldmVsOiAnaW5mbycsXG4gICAgICAgIGZvcm1hdDogbG9nRm9ybWF0dGVyXzEuZGVmYXVsdCxcbiAgICAgICAgdHJhbnNwb3J0czogW1xuICAgICAgICAgICAgbmV3IHdpbnN0b25fMS50cmFuc3BvcnRzLkRhaWx5Um90YXRlRmlsZSh7XG4gICAgICAgICAgICAgICAgZmlsZW5hbWU6IGAke2xvZ1BhdGh9LyVEQVRFJS1odHRwLmxvZ2AsXG4gICAgICAgICAgICAgICAgbGV2ZWw6ICdpbmZvJyxcbiAgICAgICAgICAgICAgICBkYXRlUGF0dGVybjogJ1lZWVktTU0tREQnLFxuICAgICAgICAgICAgICAgIHppcHBlZEFyY2hpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgbWF4U2l6ZTogJzIwbScsXG4gICAgICAgICAgICAgICAgbWF4RmlsZXM6ICcxNGQnLFxuICAgICAgICAgICAgfSksXG4gICAgICAgIF0sXG4gICAgfSk7XG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19pbXBvcnREZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydERlZmF1bHQpIHx8IGZ1bmN0aW9uIChtb2QpIHtcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IFwiZGVmYXVsdFwiOiBtb2QgfTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBhdXRoXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4vYXV0aFwiKSk7XG5leHBvcnRzLmF1dGhMb2dnZXIgPSBhdXRoXzEuZGVmYXVsdDtcbmNvbnN0IGh0dHBfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi9odHRwXCIpKTtcbmV4cG9ydHMuaHR0cExvZ2dlciA9IGh0dHBfMS5kZWZhdWx0O1xuY29uc3Qgc2VydmVyXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4vc2VydmVyXCIpKTtcbmV4cG9ydHMuc2VydmVyTG9nZ2VyID0gc2VydmVyXzEuZGVmYXVsdDtcbmNvbnN0IHNxbF8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCIuL3NxbFwiKSk7XG5leHBvcnRzLnNxbExvZ2dlciA9IHNxbF8xLmRlZmF1bHQ7XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2ltcG9ydERlZmF1bHQgPSAodGhpcyAmJiB0aGlzLl9faW1wb3J0RGVmYXVsdCkgfHwgZnVuY3Rpb24gKG1vZCkge1xuICAgIHJldHVybiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSA/IG1vZCA6IHsgXCJkZWZhdWx0XCI6IG1vZCB9O1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IHdpbnN0b25fMSA9IHJlcXVpcmUoXCJ3aW5zdG9uXCIpO1xucmVxdWlyZShcIndpbnN0b24tZGFpbHktcm90YXRlLWZpbGVcIik7XG5jb25zdCBsb2dGb3JtYXR0ZXJfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi4vdXRpbHMvbG9nRm9ybWF0dGVyXCIpKTtcbmV4cG9ydHMuZGVmYXVsdCA9IChjb25maWcpID0+IHtcbiAgICBjb25zdCB7IGxvZ1BhdGggfSA9IGNvbmZpZztcbiAgICByZXR1cm4gd2luc3Rvbl8xLmNyZWF0ZUxvZ2dlcih7XG4gICAgICAgIGxldmVsOiAnZGVidWcnLFxuICAgICAgICBmb3JtYXQ6IGxvZ0Zvcm1hdHRlcl8xLmRlZmF1bHQsXG4gICAgICAgIHRyYW5zcG9ydHM6IFtcbiAgICAgICAgICAgIG5ldyB3aW5zdG9uXzEudHJhbnNwb3J0cy5EYWlseVJvdGF0ZUZpbGUoe1xuICAgICAgICAgICAgICAgIGZpbGVuYW1lOiBgJHtsb2dQYXRofS8lREFURSUtZXJyb3JzLmxvZ2AsXG4gICAgICAgICAgICAgICAgbGV2ZWw6ICdlcnJvcicsXG4gICAgICAgICAgICAgICAgZGF0ZVBhdHRlcm46ICdZWVlZLU1NLUREJyxcbiAgICAgICAgICAgICAgICB6aXBwZWRBcmNoaXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgIG1heFNpemU6ICcyMG0nLFxuICAgICAgICAgICAgICAgIG1heEZpbGVzOiAnMTRkJyxcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgbmV3IHdpbnN0b25fMS50cmFuc3BvcnRzLkRhaWx5Um90YXRlRmlsZSh7XG4gICAgICAgICAgICAgICAgZmlsZW5hbWU6IGAke2xvZ1BhdGh9LyVEQVRFJS1kZWJ1Zy5sb2dgLFxuICAgICAgICAgICAgICAgIGxldmVsOiAnZGVidWcnLFxuICAgICAgICAgICAgICAgIGRhdGVQYXR0ZXJuOiAnWVlZWS1NTS1ERCcsXG4gICAgICAgICAgICAgICAgemlwcGVkQXJjaGl2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBtYXhTaXplOiAnMjBtJyxcbiAgICAgICAgICAgICAgICBtYXhGaWxlczogJzE0ZCcsXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgXSxcbiAgICB9KTtcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2ltcG9ydERlZmF1bHQgPSAodGhpcyAmJiB0aGlzLl9faW1wb3J0RGVmYXVsdCkgfHwgZnVuY3Rpb24gKG1vZCkge1xuICAgIHJldHVybiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSA/IG1vZCA6IHsgXCJkZWZhdWx0XCI6IG1vZCB9O1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IHdpbnN0b25fMSA9IHJlcXVpcmUoXCJ3aW5zdG9uXCIpO1xucmVxdWlyZShcIndpbnN0b24tZGFpbHktcm90YXRlLWZpbGVcIik7XG5jb25zdCBsb2dGb3JtYXR0ZXJfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi4vdXRpbHMvbG9nRm9ybWF0dGVyXCIpKTtcbmV4cG9ydHMuZGVmYXVsdCA9IChjb25maWcpID0+IHtcbiAgICBjb25zdCB7IGxvZ1BhdGggfSA9IGNvbmZpZztcbiAgICByZXR1cm4gd2luc3Rvbl8xLmNyZWF0ZUxvZ2dlcih7XG4gICAgICAgIGxldmVsOiAnZGVidWcnLFxuICAgICAgICBmb3JtYXQ6IGxvZ0Zvcm1hdHRlcl8xLmRlZmF1bHQsXG4gICAgICAgIHRyYW5zcG9ydHM6IFtcbiAgICAgICAgICAgIG5ldyB3aW5zdG9uXzEudHJhbnNwb3J0cy5EYWlseVJvdGF0ZUZpbGUoe1xuICAgICAgICAgICAgICAgIGZpbGVuYW1lOiBgJHtsb2dQYXRofS8lREFURSUtc3FsLmxvZ2AsXG4gICAgICAgICAgICAgICAgbGV2ZWw6ICdkZWJ1ZycsXG4gICAgICAgICAgICAgICAgZGF0ZVBhdHRlcm46ICdZWVlZLU1NLUREJyxcbiAgICAgICAgICAgICAgICB6aXBwZWRBcmNoaXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgIG1heFNpemU6ICcyMG0nLFxuICAgICAgICAgICAgICAgIG1heEZpbGVzOiAnMTRkJyxcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgbmV3IHdpbnN0b25fMS50cmFuc3BvcnRzLkNvbnNvbGUoe1xuICAgICAgICAgICAgICAgIGxldmVsOiAnZXJyb3InLFxuICAgICAgICAgICAgfSksXG4gICAgICAgIF0sXG4gICAgfSk7XG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19pbXBvcnREZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydERlZmF1bHQpIHx8IGZ1bmN0aW9uIChtb2QpIHtcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IFwiZGVmYXVsdFwiOiBtb2QgfTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBjaGFsa18xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCJjaGFsa1wiKSk7XG5jb25zdCByZXNwb25zZUZvcm1hdHRlcl8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCJ+L2xvZ2dlci91dGlscy9yZXNwb25zZUZvcm1hdHRlclwiKSk7XG5leHBvcnRzLmRlZmF1bHQgPSAoY29uZmlnKSA9PiB7XG4gICAgY29uc3QgeyBjb250ZXh0IH0gPSBjb25maWc7XG4gICAgY29uc3QgeyBsb2dnZXIgfSA9IGNvbnRleHQ7XG4gICAgcmV0dXJuIFtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyc1xuICAgICAgICAoZXJyLCByZXEsIHJlcywgbmV4dCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgeyBzdGF0dXMsIHN0YWNrLCBuYW1lLCBtZXNzYWdlLCBtZXRhRGF0YSB9ID0gZXJyO1xuICAgICAgICAgICAgY29uc3QgeyBvcmlnaW5hbFVybCB9ID0gcmVxO1xuICAgICAgICAgICAgbG9nZ2VyLnNlcnZlci5lcnJvcihtZXNzYWdlID8gYCR7c3RhdHVzIHx8ICcnfSAke21lc3NhZ2V9YCA6ICdVbmtub3duIGVycm9yJywgeyBvcmlnaW5hbFVybCwgc3RhY2ssIG1ldGFEYXRhIH0pO1xuICAgICAgICAgICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAnZGV2ZWxvcG1lbnQnKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJycpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2NoYWxrXzEuZGVmYXVsdC5iZ1JlZC53aGl0ZSgnIEZhdGFsIEVycm9yICcpfSAke2NoYWxrXzEuZGVmYXVsdC5yZWQobmFtZSl9YCk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cobWVzc2FnZSwgbWV0YURhdGEpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCcnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlcy5zdGF0dXMoc3RhdHVzIHx8IDUwMCkuanNvbihyZXNwb25zZUZvcm1hdHRlcl8xLmRlZmF1bHQoe1xuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IG1lc3NhZ2UgfHwgJ1BsZWFzZSBjb250YWN0IHN5c3RlbSBhZG1pbmlzdHJhdG9yJyxcbiAgICAgICAgICAgICAgICBuYW1lOiBuYW1lIHx8ICdJbnRlcm5hbCBzZXJ2ZXIgZXJyb3InLFxuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9LFxuICAgICAgICAocmVxLCByZXMpID0+IHtcbiAgICAgICAgICAgIHJlcy5zdGF0dXMoNDA0KS5lbmQoKTtcbiAgICAgICAgfSxcbiAgICAgICAgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgICAgICByZXMuc3RhdHVzKDUwMykuZW5kKCk7XG4gICAgICAgIH0sXG4gICAgICAgIChyZXEsIHJlcykgPT4ge1xuICAgICAgICAgICAgcmVzLnN0YXR1cyg0MDApLmVuZCgpO1xuICAgICAgICB9LFxuICAgIF07XG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19pbXBvcnREZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydERlZmF1bHQpIHx8IGZ1bmN0aW9uIChtb2QpIHtcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IFwiZGVmYXVsdFwiOiBtb2QgfTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBlcnJvckhhbmRsZXJfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi9lcnJvckhhbmRsZXJcIikpO1xuZXhwb3J0cy5lcnJvckhhbmRsZXJNaWRkbGV3YXJlID0gZXJyb3JIYW5kbGVyXzEuZGVmYXVsdDtcbmNvbnN0IHJlcXVlc3RIYW5kbGVyXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4vcmVxdWVzdEhhbmRsZXJcIikpO1xuZXhwb3J0cy5yZXF1ZXN0SGFuZGxlck1pZGRsZXdhcmUgPSByZXF1ZXN0SGFuZGxlcl8xLmRlZmF1bHQ7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuZGVmYXVsdCA9IChjb25maWcpID0+IHtcbiAgICBjb25zdCB7IGNvbnRleHQgfSA9IGNvbmZpZztcbiAgICBjb25zdCB7IGxvZ2dlciB9ID0gY29udGV4dDtcbiAgICByZXR1cm4gKHJlcSwgcmVzLCBuZXh0KSA9PiB7XG4gICAgICAgIGNvbnN0IHsgbWV0aG9kLCBvcmlnaW5hbFVybCwgaGVhZGVycyB9ID0gcmVxO1xuICAgICAgICBjb25zdCB4Rm9yd2FyZGVkRm9yID0gU3RyaW5nKHJlcS5oZWFkZXJzWyd4LWZvcndhcmRlZC1mb3InXSB8fCAnJykucmVwbGFjZSgvOlxcZCskLywgJycpO1xuICAgICAgICBjb25zdCBpcCA9IHhGb3J3YXJkZWRGb3IgfHwgcmVxLmNvbm5lY3Rpb24ucmVtb3RlQWRkcmVzcztcbiAgICAgICAgY29uc3QgaXBBZGRyZXNzID0gaXAgPT09ICcxMjcuMC4wLjEnIHx8IGlwID09PSAnOjoxJyA/ICdsb2NhbGhvc3QnIDogaXA7XG4gICAgICAgIGxvZ2dlci5odHRwLmluZm8oYCR7aXBBZGRyZXNzfSAke21ldGhvZH0gXCIke29yaWdpbmFsVXJsfVwiYCwgeyBoZWFkZXJzIH0pO1xuICAgICAgICByZXR1cm4gbmV4dCgpO1xuICAgIH07XG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCB3aW5zdG9uXzEgPSByZXF1aXJlKFwid2luc3RvblwiKTtcbmV4cG9ydHMuZGVmYXVsdCA9IHdpbnN0b25fMS5mb3JtYXQuY29tYmluZSh3aW5zdG9uXzEuZm9ybWF0Lm1ldGFkYXRhKCksIHdpbnN0b25fMS5mb3JtYXQuanNvbigpLCB3aW5zdG9uXzEuZm9ybWF0LnRpbWVzdGFtcCh7IGZvcm1hdDogJ1lZWVktTU0tRERUSEg6bW06c3NaWicgfSksIHdpbnN0b25fMS5mb3JtYXQuc3BsYXQoKSwgd2luc3Rvbl8xLmZvcm1hdC5wcmludGYoaW5mbyA9PiB7XG4gICAgY29uc3QgeyB0aW1lc3RhbXAsIGxldmVsLCBtZXNzYWdlLCBtZXRhZGF0YSB9ID0gaW5mbztcbiAgICBjb25zdCBtZXRhID0gSlNPTi5zdHJpbmdpZnkobWV0YWRhdGEpICE9PSAne30nID8gbWV0YWRhdGEgOiBudWxsO1xuICAgIHJldHVybiBgJHt0aW1lc3RhbXB9ICR7bGV2ZWx9OiAke21lc3NhZ2V9ICR7bWV0YSA/IEpTT04uc3RyaW5naWZ5KG1ldGEpIDogJyd9YDtcbn0pKTtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gKHByb3BzKSA9PiB7XG4gICAgY29uc3QgeyBuYW1lLCBtZXNzYWdlIH0gPSBwcm9wcztcbiAgICByZXR1cm4ge1xuICAgICAgICBlcnJvcnM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBuYW1lOiBuYW1lIHx8ICdVbmtub3duIEVycm9yJyxcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBtZXNzYWdlIHx8IG5hbWUgfHwgJ1Vua25vd24gRXJyb3InLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICB9O1xufTtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9faW1wb3J0RGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnREZWZhdWx0KSB8fCBmdW5jdGlvbiAobW9kKSB7XG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBcImRlZmF1bHRcIjogbW9kIH07XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgcGF0aF8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCJwYXRoXCIpKTtcbmNvbnN0IGluZGV4XzEgPSByZXF1aXJlKFwifi9pbmRleFwiKTtcbi8vIGltcG9ydCB7IGNvbmZpZ3VyZUNhdGFsb2dMb2dnZXIgfSBmcm9tICd+L3BsYXlncm91bmQvc2NoZW1hcy9jYXRhbG9nJztcbmNvbnN0IHNpbXBsZV8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCJ+L3BsYXlncm91bmQvc2NoZW1hcy9zaW1wbGVcIikpO1xuLy8gY29uc3QgY2F0YWxvZ0xvZ2dlciA9IGNvbmZpZ3VyZUNhdGFsb2dMb2dnZXIoe1xuLy8gICBsb2dQYXRoOiAnbG9nJyxcbi8vIH0pO1xuY29uc3QgbG9nZ2VyID0gaW5kZXhfMS5jb25maWd1cmVMb2dnZXIoe1xuICAgIGxvZ1BhdGg6ICdsb2cnLFxufSk7XG5leHBvcnRzLmxvZ2dlciA9IGxvZ2dlcjtcbmNvbnN0IGRhdGFiYXNlQ29uZmlnID0ge1xuICAgIGNsaWVudDogJ3BnJyxcbiAgICBjb25uZWN0aW9uOiB7XG4gICAgICAgIGRhdGFiYXNlOiAnc2VydmljZXMnLFxuICAgICAgICBob3N0OiAnZTFnLnJ1JyxcbiAgICAgICAgcGFzc3dvcmQ6ICdub25wcm9maXRwcm9qZWN0JyxcbiAgICAgICAgdXNlcjogJ3NlcnZpY2VzJyxcbiAgICB9LFxufTtcbmV4cG9ydHMuZGF0YWJhc2VDb25maWcgPSBkYXRhYmFzZUNvbmZpZztcbmNvbnN0IGp3dENvbmZpZyA9IHtcbiAgICBhY2Nlc3NUb2tlbkV4cGlyZXNJbjogMTgwMCxcbiAgICBhbGdvcml0aG06ICdSUzI1NicsXG4gICAgaXNzdWVyOiAndmlhcHJvZml0LXNlcnZpY2VzJyxcbiAgICBwcml2YXRlS2V5OiBwYXRoXzEuZGVmYXVsdC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vY2VydC9qd3RSUzI1Ni5rZXknKSxcbiAgICBwdWJsaWNLZXk6IHBhdGhfMS5kZWZhdWx0LnJlc29sdmUoX19kaXJuYW1lLCAnLi9jZXJ0L2p3dFJTMjU2LmtleS5wdWInKSxcbiAgICByZWZyZXNoVG9rZW5FeHBpcmVzSW46IDIuNTkyZTYsXG59O1xuZXhwb3J0cy5qd3RDb25maWcgPSBqd3RDb25maWc7XG5jb25zdCBzZXJ2ZXJDb25maWcgPSB7XG4gICAgZGF0YWJhc2U6IGRhdGFiYXNlQ29uZmlnLFxuICAgIGVuZHBvaW50OiAnL2FwaS9ncmFwaHFsJyxcbiAgICBzdWJzY3JpcHRpb25zRW5kcG9pbnQ6ICcvYXBpL3N1YnNjcmlwdGlvbnMnLFxuICAgIGp3dDogand0Q29uZmlnLFxuICAgIGxvZ2dlcixcbiAgICBwb3J0OiA0MDAwLFxuICAgIHNjaGVtYXM6IFtzaW1wbGVfMS5kZWZhdWx0XSxcbn07XG5leHBvcnRzLnNlcnZlckNvbmZpZyA9IHNlcnZlckNvbmZpZztcbmNvbnN0IHNlcnZlciA9IGluZGV4XzEuQ29yZS5pbml0KHNlcnZlckNvbmZpZyk7XG5leHBvcnRzLmRlZmF1bHQgPSBzZXJ2ZXI7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IGdyYXBocWxfMSA9IHJlcXVpcmUoXCJncmFwaHFsXCIpO1xuY29uc3QgUG9zdCA9IG5ldyBncmFwaHFsXzEuR3JhcGhRTE9iamVjdFR5cGUoe1xuICAgIG5hbWU6ICdQb3N0JyxcbiAgICBkZXNjcmlwdGlvbjogJ0N1cnJlbnQgUG9zdCBkYXRhJyxcbiAgICBmaWVsZHM6ICgpID0+ICh7XG4gICAgICAgIHRpdGxlOiB7XG4gICAgICAgICAgICB0eXBlOiBuZXcgZ3JhcGhxbF8xLkdyYXBoUUxOb25OdWxsKGdyYXBocWxfMS5HcmFwaFFMU3RyaW5nKSxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnUG9zdCBUaXRsZScsXG4gICAgICAgIH0sXG4gICAgICAgIHVybDoge1xuICAgICAgICAgICAgdHlwZTogbmV3IGdyYXBocWxfMS5HcmFwaFFMTm9uTnVsbChncmFwaHFsXzEuR3JhcGhRTFN0cmluZyksXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1VSTCBhZGRyZXNzJyxcbiAgICAgICAgfSxcbiAgICB9KSxcbn0pO1xuY29uc3Qgc2NoZW1hID0gbmV3IGdyYXBocWxfMS5HcmFwaFFMU2NoZW1hKHtcbiAgICBxdWVyeTogbmV3IGdyYXBocWxfMS5HcmFwaFFMT2JqZWN0VHlwZSh7XG4gICAgICAgIG5hbWU6ICdRdWVyeScsXG4gICAgICAgIGZpZWxkczogKCkgPT4gKHtcbiAgICAgICAgICAgIHBvc3Q6IHtcbiAgICAgICAgICAgICAgICB0eXBlOiBuZXcgZ3JhcGhxbF8xLkdyYXBoUUxOb25OdWxsKFBvc3QpLFxuICAgICAgICAgICAgICAgIHJlc29sdmU6ICgpID0+ICh7XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiAnTG9yZW0gaXBzdW0nLFxuICAgICAgICAgICAgICAgICAgICB1cmw6ICdocHB0czovL2dvb2dsZS5jb20nLFxuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSksXG4gICAgfSksXG4gICAgbXV0YXRpb246IG5ldyBncmFwaHFsXzEuR3JhcGhRTE9iamVjdFR5cGUoe1xuICAgICAgICBuYW1lOiAnTXV0YXRpb24nLFxuICAgICAgICBmaWVsZHM6ICgpID0+ICh7XG4gICAgICAgICAgICBzZXRBbnk6IHtcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1NldCBhbnkgdmFsdWUgZm9yIHRlc3QgbXV0YXRpb24nLFxuICAgICAgICAgICAgICAgIGFyZ3M6IHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogbmV3IGdyYXBocWxfMS5HcmFwaFFMTm9uTnVsbChncmFwaHFsXzEuR3JhcGhRTFN0cmluZyksXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0FueSB2YWx1ZSBzdHJpbmcnLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcmVzb2x2ZTogKCkgPT4gdHJ1ZSxcbiAgICAgICAgICAgICAgICB0eXBlOiBuZXcgZ3JhcGhxbF8xLkdyYXBoUUxOb25OdWxsKGdyYXBocWxfMS5HcmFwaFFMQm9vbGVhbiksXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KSxcbiAgICB9KSxcbn0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gc2NoZW1hO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19pbXBvcnREZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydERlZmF1bHQpIHx8IGZ1bmN0aW9uIChtb2QpIHtcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IFwiZGVmYXVsdFwiOiBtb2QgfTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBpbmZvXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4vaW5mb1wiKSk7XG5leHBvcnRzLmluZm9TY2hlbWEgPSBpbmZvXzEuZGVmYXVsdDtcbmV4cG9ydHMuZGVmYXVsdCA9IGluZm9fMS5kZWZhdWx0O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19pbXBvcnREZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydERlZmF1bHQpIHx8IGZ1bmN0aW9uIChtb2QpIHtcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IFwiZGVmYXVsdFwiOiBtb2QgfTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBmc18xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCJmc1wiKSk7XG5jb25zdCBwYXRoXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcInBhdGhcIikpO1xuY29uc3QgZ3JhcGhxbF8xID0gcmVxdWlyZShcImdyYXBocWxcIik7XG5jb25zdCBwYWNrYWdlSnNvbiA9IGZzXzEuZGVmYXVsdC5yZWFkRmlsZVN5bmMocGF0aF8xLmRlZmF1bHQucmVzb2x2ZShfX2Rpcm5hbWUsICcuLicsICcuLicsICcuLicsICdwYWNrYWdlLmpzb24nKSwgJ3V0ZjgnKTtcbmNvbnN0IHBhY2thZ2VJbmZvID0gSlNPTi5wYXJzZShwYWNrYWdlSnNvbik7XG5jb25zdCBEZXZJbmZvID0gbmV3IGdyYXBocWxfMS5HcmFwaFFMT2JqZWN0VHlwZSh7XG4gICAgbmFtZTogJ0RldkluZm8nLFxuICAgIGZpZWxkczogKCkgPT4gKHtcbiAgICAgICAgbmFtZToge1xuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdBcHBsaWNhdGlvbiBuYW1lJyxcbiAgICAgICAgICAgIHJlc29sdmU6ICgpID0+IHBhY2thZ2VJbmZvLm5hbWUsXG4gICAgICAgICAgICB0eXBlOiBuZXcgZ3JhcGhxbF8xLkdyYXBoUUxOb25OdWxsKGdyYXBocWxfMS5HcmFwaFFMU3RyaW5nKSxcbiAgICAgICAgfSxcbiAgICAgICAgZGVzY3JpcHRpb246IHtcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnQXBwbGljYXRpb24gZGVzY3JpcHRpb24nLFxuICAgICAgICAgICAgcmVzb2x2ZTogKCkgPT4gcGFja2FnZUluZm8uZGVzY3JpcHRpb24sXG4gICAgICAgICAgICB0eXBlOiBuZXcgZ3JhcGhxbF8xLkdyYXBoUUxOb25OdWxsKGdyYXBocWxfMS5HcmFwaFFMU3RyaW5nKSxcbiAgICAgICAgfSxcbiAgICAgICAgdmVyc2lvbjoge1xuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdBcHBsaWNhdGlvbiB2ZXJzaW9uIG51bWJlcicsXG4gICAgICAgICAgICByZXNvbHZlOiAoKSA9PiBwYWNrYWdlSW5mby52ZXJzaW9uLFxuICAgICAgICAgICAgdHlwZTogbmV3IGdyYXBocWxfMS5HcmFwaFFMTm9uTnVsbChncmFwaHFsXzEuR3JhcGhRTFN0cmluZyksXG4gICAgICAgIH0sXG4gICAgICAgIGF1dGhvcjoge1xuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdBcHBsaWNhdGlvbiBhdXRob3InLFxuICAgICAgICAgICAgcmVzb2x2ZTogKCkgPT4gcGFja2FnZUluZm8uYXV0aG9yLFxuICAgICAgICAgICAgdHlwZTogbmV3IGdyYXBocWxfMS5HcmFwaFFMTm9uTnVsbChncmFwaHFsXzEuR3JhcGhRTFN0cmluZyksXG4gICAgICAgIH0sXG4gICAgICAgIHN1cHBvcnQ6IHtcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnQXBwbGljYXRpb24gc3VwcG9ydCcsXG4gICAgICAgICAgICByZXNvbHZlOiAoKSA9PiBwYWNrYWdlSW5mby5zdXBwb3J0LFxuICAgICAgICAgICAgdHlwZTogbmV3IGdyYXBocWxfMS5HcmFwaFFMTm9uTnVsbChncmFwaHFsXzEuR3JhcGhRTFN0cmluZyksXG4gICAgICAgIH0sXG4gICAgICAgIGxpY2Vuc2U6IHtcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnQXBwbGljYXRpb24gbGljZW5zZScsXG4gICAgICAgICAgICByZXNvbHZlOiAoKSA9PiBwYWNrYWdlSW5mby5saWNlbnNlLFxuICAgICAgICAgICAgdHlwZTogbmV3IGdyYXBocWxfMS5HcmFwaFFMTm9uTnVsbChncmFwaHFsXzEuR3JhcGhRTFN0cmluZyksXG4gICAgICAgIH0sXG4gICAgICAgIHJlcG9zaXRvcnk6IHtcbiAgICAgICAgICAgIHJlc29sdmU6ICgpID0+IHBhY2thZ2VJbmZvLnJlcG9zaXRvcnksXG4gICAgICAgICAgICB0eXBlOiBuZXcgZ3JhcGhxbF8xLkdyYXBoUUxOb25OdWxsKG5ldyBncmFwaHFsXzEuR3JhcGhRTE9iamVjdFR5cGUoe1xuICAgICAgICAgICAgICAgIG5hbWU6ICdSZXBvc2l0b3J5JyxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0FwcGxpY2F0aW9uIHJlcG9zaXRvcnknLFxuICAgICAgICAgICAgICAgIGZpZWxkczogKCkgPT4gKHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdSZXBvc2l0b3J5IHR5cGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogbmV3IGdyYXBocWxfMS5HcmFwaFFMTm9uTnVsbChncmFwaHFsXzEuR3JhcGhRTFN0cmluZyksXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlOiAoKSA9PiBwYWNrYWdlSW5mby5yZXBvc2l0b3J5LnR5cGUsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHVybDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdSZXBvc2l0b3J5IFVSTCBhZGRlc3MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogbmV3IGdyYXBocWxfMS5HcmFwaFFMTm9uTnVsbChncmFwaHFsXzEuR3JhcGhRTFN0cmluZyksXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlOiAoKSA9PiBwYWNrYWdlSW5mby5yZXBvc2l0b3J5LnVybCxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIH0pKSxcbiAgICAgICAgfSxcbiAgICB9KSxcbn0pO1xuY29uc3Qgc2NoZW1hID0gbmV3IGdyYXBocWxfMS5HcmFwaFFMU2NoZW1hKHtcbiAgICBxdWVyeTogbmV3IGdyYXBocWxfMS5HcmFwaFFMT2JqZWN0VHlwZSh7XG4gICAgICAgIG5hbWU6ICdRdWVyeScsXG4gICAgICAgIGZpZWxkczogKCkgPT4gKHtcbiAgICAgICAgICAgIGRldkluZm86IHtcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0FwcGxpY2F0aW9uIGRldmVsb3BtZW50IGluZm8nLFxuICAgICAgICAgICAgICAgIHJlc29sdmU6ICgpID0+ICh7fSksXG4gICAgICAgICAgICAgICAgdHlwZTogbmV3IGdyYXBocWxfMS5HcmFwaFFMTm9uTnVsbChEZXZJbmZvKSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pLFxuICAgIH0pLFxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSBzY2hlbWE7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJiY3J5cHRqc1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJjaGFsa1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJjb3JzXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImRldmljZS1kZXRlY3Rvci1qc1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJldmVudHNcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiZXhwcmVzc1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJleHByZXNzLWFzeW5jLWhhbmRsZXJcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiZXhwcmVzcy1ncmFwaHFsXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImZzXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImdyYXBocWxcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiZ3JhcGhxbC1wbGF5Z3JvdW5kLW1pZGRsZXdhcmUtZXhwcmVzc1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJncmFwaHFsLXRvb2xzXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImdyYXBocWwtdm95YWdlci9taWRkbGV3YXJlXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImh0dHBcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwianNvbndlYnRva2VuXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImtuZXhcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwibW9tZW50LXRpbWV6b25lXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcInBhdGhcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwicGVyZl9ob29rc1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJzdWJzY3JpcHRpb25zLXRyYW5zcG9ydC13c1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJ1dWlkL3Y0XCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIndpbnN0b25cIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwid2luc3Rvbi1kYWlseS1yb3RhdGUtZmlsZVwiKTsiXSwic291cmNlUm9vdCI6IiJ9