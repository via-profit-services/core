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
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/playground/index.ts");
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
        if (token === null || token === '') {
            throw new index_1.UnauthorizedError('The token must be provided');
        }
        try {
            const publicKey = fs_1.default.readFileSync(publicKeyPath);
            const payload = jsonwebtoken_1.default.verify(String(token), publicKey);
            return payload;
        }
        catch (err) {
            throw new index_1.UnauthorizedError('Token verification failed', err);
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

/***/ "./src/logger/errorHandlers/UnauthorizedError.ts":
/*!*******************************************************!*\
  !*** ./src/logger/errorHandlers/UnauthorizedError.ts ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class UnauthorizedError extends Error {
    constructor(message, metaData) {
        super(message);
        this.name = 'UnauthorizedError';
        this.message = message;
        this.metaData = metaData;
        this.status = 401;
        // Set the prototype explicitly.
        Object.setPrototypeOf(this, UnauthorizedError.prototype);
    }
}
exports.default = UnauthorizedError;


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
const UnauthorizedError_1 = __importDefault(__webpack_require__(/*! ./UnauthorizedError */ "./src/logger/errorHandlers/UnauthorizedError.ts"));
exports.UnauthorizedError = UnauthorizedError_1.default;


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
            const errorMessage = message ? `${status || ''} ${message}` : 'Unknown error';
            switch (status) {
                case 401:
                    logger.auth.error(errorMessage, {
                        originalUrl,
                        stack,
                        metaData,
                    });
                    break;
                case 500:
                default:
                    logger.server.error(errorMessage, {
                        originalUrl,
                        stack,
                        metaData,
                    });
                    break;
            }
            if (true) {
                console.log('');
                console.log(`${chalk_1.default.bgRed.white(errorMessage)} ${chalk_1.default.red(name)}`);
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

/***/ "./src/playground/configureApp.ts":
/*!****************************************!*\
  !*** ./src/playground/configureApp.ts ***!
  \****************************************/
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

/* WEBPACK VAR INJECTION */}.call(this, "src/playground"))

/***/ }),

/***/ "./src/playground/index.ts":
/*!*********************************!*\
  !*** ./src/playground/index.ts ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __webpack_require__(/*! ~/index */ "./src/index.ts");
const configureApp_1 = __webpack_require__(/*! ~/playground/configureApp */ "./src/playground/configureApp.ts");
index_1.Core.init(Object.assign(Object.assign({}, configureApp_1.serverConfig), { port: 4000 }));


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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2FwcC9pbmRleC50cyIsIndlYnBhY2s6Ly8vLi9zcmMvYXV0aGVudGlmaWNhdG9yL0F1dGhlbnRpZmljYXRvci50cyIsIndlYnBhY2s6Ly8vLi9zcmMvYXV0aGVudGlmaWNhdG9yL2F1dGhlbnRpZmljYXRvck1pZGRsZXdhcmUudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2F1dGhlbnRpZmljYXRvci9pbmRleC50cyIsIndlYnBhY2s6Ly8vLi9zcmMvY29yZS9pbmRleC50cyIsIndlYnBhY2s6Ly8vLi9zcmMvZGF0YWJhc2VNYW5hZ2VyL2luZGV4LnRzIiwid2VicGFjazovLy8uL3NyYy9pbmRleC50cyIsIndlYnBhY2s6Ly8vLi9zcmMvbG9nZ2VyL2Vycm9ySGFuZGxlcnMvQmFkUmVxdWVzdEVycm9yLnRzIiwid2VicGFjazovLy8uL3NyYy9sb2dnZXIvZXJyb3JIYW5kbGVycy9Gb3JiaWRkZW5FcnJvci50cyIsIndlYnBhY2s6Ly8vLi9zcmMvbG9nZ2VyL2Vycm9ySGFuZGxlcnMvTm90Rm91bmRFcnJvci50cyIsIndlYnBhY2s6Ly8vLi9zcmMvbG9nZ2VyL2Vycm9ySGFuZGxlcnMvU2VydmVyRXJyb3IudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2xvZ2dlci9lcnJvckhhbmRsZXJzL1VuYXV0aG9yaXplZEVycm9yLnRzIiwid2VicGFjazovLy8uL3NyYy9sb2dnZXIvZXJyb3JIYW5kbGVycy9pbmRleC50cyIsIndlYnBhY2s6Ly8vLi9zcmMvbG9nZ2VyL2luZGV4LnRzIiwid2VicGFjazovLy8uL3NyYy9sb2dnZXIvbG9nZ2Vycy9hdXRoLnRzIiwid2VicGFjazovLy8uL3NyYy9sb2dnZXIvbG9nZ2Vycy9odHRwLnRzIiwid2VicGFjazovLy8uL3NyYy9sb2dnZXIvbG9nZ2Vycy9pbmRleC50cyIsIndlYnBhY2s6Ly8vLi9zcmMvbG9nZ2VyL2xvZ2dlcnMvc2VydmVyLnRzIiwid2VicGFjazovLy8uL3NyYy9sb2dnZXIvbG9nZ2Vycy9zcWwudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2xvZ2dlci9taWRkbGV3YXJlcy9lcnJvckhhbmRsZXIudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2xvZ2dlci9taWRkbGV3YXJlcy9pbmRleC50cyIsIndlYnBhY2s6Ly8vLi9zcmMvbG9nZ2VyL21pZGRsZXdhcmVzL3JlcXVlc3RIYW5kbGVyLnRzIiwid2VicGFjazovLy8uL3NyYy9sb2dnZXIvdXRpbHMvbG9nRm9ybWF0dGVyLnRzIiwid2VicGFjazovLy8uL3NyYy9sb2dnZXIvdXRpbHMvcmVzcG9uc2VGb3JtYXR0ZXIudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3BsYXlncm91bmQvY29uZmlndXJlQXBwLnRzIiwid2VicGFjazovLy8uL3NyYy9wbGF5Z3JvdW5kL2luZGV4LnRzIiwid2VicGFjazovLy8uL3NyYy9wbGF5Z3JvdW5kL3NjaGVtYXMvc2ltcGxlL2luZGV4LnRzIiwid2VicGFjazovLy8uL3NyYy9zY2hlbWFzL2luZGV4LnRzIiwid2VicGFjazovLy8uL3NyYy9zY2hlbWFzL2luZm8vaW5kZXgudHMiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwiYmNyeXB0anNcIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJjaGFsa1wiIiwid2VicGFjazovLy9leHRlcm5hbCBcImNvcnNcIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJkZXZpY2UtZGV0ZWN0b3ItanNcIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJldmVudHNcIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJleHByZXNzXCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwiZXhwcmVzcy1hc3luYy1oYW5kbGVyXCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwiZXhwcmVzcy1ncmFwaHFsXCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwiZnNcIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJncmFwaHFsXCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwiZ3JhcGhxbC1wbGF5Z3JvdW5kLW1pZGRsZXdhcmUtZXhwcmVzc1wiIiwid2VicGFjazovLy9leHRlcm5hbCBcImdyYXBocWwtdG9vbHNcIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJncmFwaHFsLXZveWFnZXIvbWlkZGxld2FyZVwiIiwid2VicGFjazovLy9leHRlcm5hbCBcImh0dHBcIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJqc29ud2VidG9rZW5cIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJrbmV4XCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwibW9tZW50LXRpbWV6b25lXCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwicGF0aFwiIiwid2VicGFjazovLy9leHRlcm5hbCBcInBlcmZfaG9va3NcIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJzdWJzY3JpcHRpb25zLXRyYW5zcG9ydC13c1wiIiwid2VicGFjazovLy9leHRlcm5hbCBcInV1aWQvdjRcIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJ3aW5zdG9uXCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwid2luc3Rvbi1kYWlseS1yb3RhdGUtZmlsZVwiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O1FBQUE7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7OztRQUdBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSwwQ0FBMEMsZ0NBQWdDO1FBQzFFO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0Esd0RBQXdELGtCQUFrQjtRQUMxRTtRQUNBLGlEQUFpRCxjQUFjO1FBQy9EOztRQUVBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQSx5Q0FBeUMsaUNBQWlDO1FBQzFFLGdIQUFnSCxtQkFBbUIsRUFBRTtRQUNySTtRQUNBOztR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Q0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckIsaUJBQWlCO0FBQ2pCLGFBQWE7QUFDYixTQUFTO0FBQ1QsS0FBSztBQUNMLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQ0FBa0M7QUFDbEM7QUFDQSxhQUFhO0FBQ2IsU0FBUztBQUNULEtBQUs7QUFDTCxDQUFDO0FBQ0Q7Ozs7Ozs7Ozs7Ozs7QUM1RUEscUM7Ozs7Ozs7Ozs7O0FDQUEsa0M7Ozs7Ozs7Ozs7O0FDQUEsaUM7Ozs7Ozs7Ozs7O0FDQUEsK0M7Ozs7Ozs7Ozs7O0FDQUEsbUM7Ozs7Ozs7Ozs7O0FDQUEsb0M7Ozs7Ozs7Ozs7O0FDQUEsa0Q7Ozs7Ozs7Ozs7O0FDQUEsNEM7Ozs7Ozs7Ozs7O0FDQUEsK0I7Ozs7Ozs7Ozs7O0FDQUEsb0M7Ozs7Ozs7Ozs7O0FDQUEsa0U7Ozs7Ozs7Ozs7O0FDQUEsMEM7Ozs7Ozs7Ozs7O0FDQUEsdUQ7Ozs7Ozs7Ozs7O0FDQUEsaUM7Ozs7Ozs7Ozs7O0FDQUEseUM7Ozs7Ozs7Ozs7O0FDQUEsaUM7Ozs7Ozs7Ozs7O0FDQUEsNEM7Ozs7Ozs7Ozs7O0FDQUEsaUM7Ozs7Ozs7Ozs7O0FDQUEsdUM7Ozs7Ozs7Ozs7O0FDQUEsdUQ7Ozs7Ozs7Ozs7O0FDQUEsb0M7Ozs7Ozs7Ozs7O0FDQUEsb0M7Ozs7Ozs7Ozs7O0FDQUEsc0QiLCJmaWxlIjoicGxheWdyb3VuZC5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGdldHRlciB9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yID0gZnVuY3Rpb24oZXhwb3J0cykge1xuIFx0XHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcbiBcdFx0fVxuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuIFx0fTtcblxuIFx0Ly8gY3JlYXRlIGEgZmFrZSBuYW1lc3BhY2Ugb2JqZWN0XG4gXHQvLyBtb2RlICYgMTogdmFsdWUgaXMgYSBtb2R1bGUgaWQsIHJlcXVpcmUgaXRcbiBcdC8vIG1vZGUgJiAyOiBtZXJnZSBhbGwgcHJvcGVydGllcyBvZiB2YWx1ZSBpbnRvIHRoZSBuc1xuIFx0Ly8gbW9kZSAmIDQ6IHJldHVybiB2YWx1ZSB3aGVuIGFscmVhZHkgbnMgb2JqZWN0XG4gXHQvLyBtb2RlICYgOHwxOiBiZWhhdmUgbGlrZSByZXF1aXJlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnQgPSBmdW5jdGlvbih2YWx1ZSwgbW9kZSkge1xuIFx0XHRpZihtb2RlICYgMSkgdmFsdWUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKHZhbHVlKTtcbiBcdFx0aWYobW9kZSAmIDgpIHJldHVybiB2YWx1ZTtcbiBcdFx0aWYoKG1vZGUgJiA0KSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICYmIHZhbHVlLl9fZXNNb2R1bGUpIHJldHVybiB2YWx1ZTtcbiBcdFx0dmFyIG5zID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yKG5zKTtcbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG5zLCAnZGVmYXVsdCcsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHZhbHVlIH0pO1xuIFx0XHRpZihtb2RlICYgMiAmJiB0eXBlb2YgdmFsdWUgIT0gJ3N0cmluZycpIGZvcih2YXIga2V5IGluIHZhbHVlKSBfX3dlYnBhY2tfcmVxdWlyZV9fLmQobnMsIGtleSwgZnVuY3Rpb24oa2V5KSB7IHJldHVybiB2YWx1ZVtrZXldOyB9LmJpbmQobnVsbCwga2V5KSk7XG4gXHRcdHJldHVybiBucztcbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vc3JjL3BsYXlncm91bmQvaW5kZXgudHNcIik7XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2F3YWl0ZXIgPSAodGhpcyAmJiB0aGlzLl9fYXdhaXRlcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xuICAgIGZ1bmN0aW9uIGFkb3B0KHZhbHVlKSB7IHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFAgPyB2YWx1ZSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUodmFsdWUpOyB9KTsgfVxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XG4gICAgfSk7XG59O1xudmFyIF9faW1wb3J0RGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnREZWZhdWx0KSB8fCBmdW5jdGlvbiAobW9kKSB7XG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBcImRlZmF1bHRcIjogbW9kIH07XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuLyogZXNsaW50LWRpc2FibGUgaW1wb3J0L21heC1kZXBlbmRlbmNpZXMgKi9cbmNvbnN0IGV2ZW50c18xID0gcmVxdWlyZShcImV2ZW50c1wiKTtcbmNvbnN0IGNvcnNfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiY29yc1wiKSk7XG5jb25zdCBleHByZXNzXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcImV4cHJlc3NcIikpO1xuY29uc3QgZXhwcmVzc19ncmFwaHFsXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcImV4cHJlc3MtZ3JhcGhxbFwiKSk7XG5jb25zdCBncmFwaHFsX3BsYXlncm91bmRfbWlkZGxld2FyZV9leHByZXNzXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcImdyYXBocWwtcGxheWdyb3VuZC1taWRkbGV3YXJlLWV4cHJlc3NcIikpO1xuY29uc3QgZ3JhcGhxbF90b29sc18xID0gcmVxdWlyZShcImdyYXBocWwtdG9vbHNcIik7XG5jb25zdCBtaWRkbGV3YXJlXzEgPSByZXF1aXJlKFwiZ3JhcGhxbC12b3lhZ2VyL21pZGRsZXdhcmVcIik7XG5jb25zdCBhdXRoZW50aWZpY2F0b3JfMSA9IHJlcXVpcmUoXCJ+L2F1dGhlbnRpZmljYXRvclwiKTtcbmNvbnN0IGRhdGFiYXNlTWFuYWdlcl8xID0gcmVxdWlyZShcIn4vZGF0YWJhc2VNYW5hZ2VyXCIpO1xuY29uc3QgbG9nZ2VyXzEgPSByZXF1aXJlKFwifi9sb2dnZXJcIik7XG5jb25zdCBzY2hlbWFzXzEgPSByZXF1aXJlKFwifi9zY2hlbWFzXCIpO1xuY2xhc3MgQXBwIHtcbiAgICBzdGF0aWMgYnVpbGRSb3V0ZXMoZW5kcG9pbnQsIHJvdXRlcykge1xuICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7IGF1dGg6IGAke2VuZHBvaW50fS9hdXRoYCwgcGxheWdyb3VuZDogYCR7ZW5kcG9pbnR9L3BsYXlncm91bmRgLCB2b3lhZ2VyOiBgJHtlbmRwb2ludH0vdm95YWdlcmAgfSwgcm91dGVzKTtcbiAgICB9XG4gICAgc3RhdGljIGNyZWF0ZUFwcChwcm9wcykge1xuICAgICAgICBjb25zdCBhcHAgPSBleHByZXNzXzEuZGVmYXVsdCgpO1xuICAgICAgICBjb25zdCB7IHNjaGVtYXMsIGVuZHBvaW50LCBwb3J0LCBqd3QsIGRhdGFiYXNlLCBsb2dnZXIsIHJvdXRlcywgc3Vic2NyaXB0aW9uc0VuZHBvaW50IH0gPSBwcm9wcztcbiAgICAgICAgLy8gbWVyZ2UgdXNlciBzY2hlbWFzIGFuZCBsZWdhY3lcbiAgICAgICAgY29uc3Qgc2NoZW1hID0gZ3JhcGhxbF90b29sc18xLm1lcmdlU2NoZW1hcyh7IHNjaGVtYXM6IFsuLi5zY2hlbWFzLCBzY2hlbWFzXzEuaW5mb1NjaGVtYV0gfSk7XG4gICAgICAgIC8vIGdlbmVyYXRlIHJvdXRlc1xuICAgICAgICBjb25zdCByb3V0ZXNMaXN0ID0gQXBwLmJ1aWxkUm91dGVzKGVuZHBvaW50LCByb3V0ZXMpO1xuICAgICAgICAvLyBkZWZpbmUga25leCBpbnN0YW5jZVxuICAgICAgICBjb25zdCBrbmV4ID0gZGF0YWJhc2VNYW5hZ2VyXzEua25leFByb3ZpZGVyKHsgbG9nZ2VyLCBkYXRhYmFzZSB9KTtcbiAgICAgICAgLy8gZGVmaW5lIEV2ZW50RW1pdHRyZSBpbnN0YW5jZVxuICAgICAgICBjb25zdCBlbWl0dGVyID0gbmV3IGV2ZW50c18xLkV2ZW50RW1pdHRlcigpO1xuICAgICAgICAvLyBjb21iaW5lIGZpbmFsbHkgY29udGV4dCBvYmplY3RcbiAgICAgICAgY29uc3QgY29udGV4dCA9IHtcbiAgICAgICAgICAgIGVuZHBvaW50LFxuICAgICAgICAgICAgand0LFxuICAgICAgICAgICAgbG9nZ2VyLFxuICAgICAgICAgICAga25leCxcbiAgICAgICAgICAgIGVtaXR0ZXIsXG4gICAgICAgIH07XG4gICAgICAgIC8vIFRoaXMgbWlkZGxld2FyZSBtdXN0IGJlIGRlZmluZWQgZmlyc3RcbiAgICAgICAgYXBwLnVzZShsb2dnZXJfMS5yZXF1ZXN0SGFuZGxlck1pZGRsZXdhcmUoeyBjb250ZXh0IH0pKTtcbiAgICAgICAgYXBwLnVzZShjb3JzXzEuZGVmYXVsdCgpKTtcbiAgICAgICAgYXBwLnVzZShleHByZXNzXzEuZGVmYXVsdC5qc29uKHsgbGltaXQ6ICc1MG1iJyB9KSk7XG4gICAgICAgIGFwcC51c2UoZXhwcmVzc18xLmRlZmF1bHQudXJsZW5jb2RlZCh7IGV4dGVuZGVkOiB0cnVlLCBsaW1pdDogJzUwbWInIH0pKTtcbiAgICAgICAgYXBwLnVzZShhdXRoZW50aWZpY2F0b3JfMS5hdXRoZW50aWZpY2F0b3JNaWRkbGV3YXJlKHtcbiAgICAgICAgICAgIGNvbnRleHQsXG4gICAgICAgICAgICBhdXRoVXJsOiByb3V0ZXNMaXN0LmF1dGgsXG4gICAgICAgICAgICBhbGxvd2VkVXJsOiBbcm91dGVzTGlzdC5wbGF5Z3JvdW5kXSxcbiAgICAgICAgfSkpO1xuICAgICAgICBhcHAuZ2V0KHJvdXRlc0xpc3QucGxheWdyb3VuZCwgZ3JhcGhxbF9wbGF5Z3JvdW5kX21pZGRsZXdhcmVfZXhwcmVzc18xLmRlZmF1bHQoeyBlbmRwb2ludCB9KSk7XG4gICAgICAgIGFwcC51c2Uocm91dGVzTGlzdC52b3lhZ2VyLCBtaWRkbGV3YXJlXzEuZXhwcmVzcyh7IGVuZHBvaW50VXJsOiBlbmRwb2ludCB9KSk7XG4gICAgICAgIGFwcC51c2UoZW5kcG9pbnQsIGV4cHJlc3NfZ3JhcGhxbF8xLmRlZmF1bHQoKCkgPT4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgcmV0dXJuICh7XG4gICAgICAgICAgICAgICAgY29udGV4dCxcbiAgICAgICAgICAgICAgICBncmFwaGlxbDogZmFsc2UsXG4gICAgICAgICAgICAgICAgc2NoZW1hLFxuICAgICAgICAgICAgICAgIHN1YnNjcmlwdGlvbnNFbmRwb2ludDogYHdzOi8vbG9jYWxob3N0OiR7cG9ydH0ke3N1YnNjcmlwdGlvbnNFbmRwb2ludH1gLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pKSk7XG4gICAgICAgIC8vIHRoaXMgbWlkZGxld2FyZSBtb3N0IGJlIGRlZmluZWQgZmlyc3RcbiAgICAgICAgYXBwLnVzZShsb2dnZXJfMS5lcnJvckhhbmRsZXJNaWRkbGV3YXJlKHsgY29udGV4dCB9KSk7XG4gICAgICAgIHJldHVybiB7IGFwcCwgY29udGV4dCwgc2NoZW1hLCByb3V0ZXM6IHJvdXRlc0xpc3QgfTtcbiAgICB9XG59XG5leHBvcnRzLkFwcCA9IEFwcDtcbmV4cG9ydHMuZGVmYXVsdCA9IEFwcDtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9fYXdhaXRlciA9ICh0aGlzICYmIHRoaXMuX19hd2FpdGVyKSB8fCBmdW5jdGlvbiAodGhpc0FyZywgX2FyZ3VtZW50cywgUCwgZ2VuZXJhdG9yKSB7XG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XG4gICAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvci5uZXh0KHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHN0ZXAocmVzdWx0KSB7IHJlc3VsdC5kb25lID8gcmVzb2x2ZShyZXN1bHQudmFsdWUpIDogYWRvcHQocmVzdWx0LnZhbHVlKS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpOyB9XG4gICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTtcbiAgICB9KTtcbn07XG52YXIgX19pbXBvcnREZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydERlZmF1bHQpIHx8IGZ1bmN0aW9uIChtb2QpIHtcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IFwiZGVmYXVsdFwiOiBtb2QgfTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBmc18xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCJmc1wiKSk7XG5jb25zdCBqc29ud2VidG9rZW5fMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwianNvbndlYnRva2VuXCIpKTtcbmNvbnN0IG1vbWVudF90aW1lem9uZV8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCJtb21lbnQtdGltZXpvbmVcIikpO1xuY29uc3QgdjRfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwidXVpZC92NFwiKSk7XG5jb25zdCBpbmRleF8xID0gcmVxdWlyZShcIn4vaW5kZXhcIik7XG52YXIgVG9rZW5UeXBlO1xuKGZ1bmN0aW9uIChUb2tlblR5cGUpIHtcbiAgICBUb2tlblR5cGVbXCJhY2Nlc3NcIl0gPSBcImFjY2Vzc1wiO1xuICAgIFRva2VuVHlwZVtcInJlZnJlc2hcIl0gPSBcInJlZnJlc2hcIjtcbn0pKFRva2VuVHlwZSA9IGV4cG9ydHMuVG9rZW5UeXBlIHx8IChleHBvcnRzLlRva2VuVHlwZSA9IHt9KSk7XG5jbGFzcyBBdXRoZW50aWZpY2F0b3Ige1xuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHRoaXMucHJvcHMgPSBwcm9wcztcbiAgICB9XG4gICAgLyoqXG4gICAgICogRXh0cmFjdCBUb2tlbiBmcm9tIEhUVFAgcmVxdWVzdCBoZWFkZXJzXG4gICAgICogQHBhcmFtICB7UmVxdWVzdH0gcmVxdWVzdFxuICAgICAqIEByZXR1cm5zIHN0cmluZ1xuICAgICAqL1xuICAgIHN0YXRpYyBleHRyYWN0VG9rZW4ocmVxdWVzdCkge1xuICAgICAgICBjb25zdCB7IGhlYWRlcnMgfSA9IHJlcXVlc3Q7XG4gICAgICAgIGNvbnN0IHsgYXV0aG9yaXphdGlvbiB9ID0gaGVhZGVycztcbiAgICAgICAgY29uc3QgYmVhcmVyID0gU3RyaW5nKGF1dGhvcml6YXRpb24pLnNwbGl0KCcgJylbMF07XG4gICAgICAgIGNvbnN0IHRva2VuID0gU3RyaW5nKGF1dGhvcml6YXRpb24pLnNwbGl0KCcgJylbMV07XG4gICAgICAgIHJldHVybiBiZWFyZXIudG9Mb2NhbGVMb3dlckNhc2UoKSA9PT0gJ2JlYXJlcicgPyB0b2tlbiA6ICcnO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBWZXJpZnkgSldUIHRva2VuXG4gICAgICogQHBhcmFtICB7c3RyaW5nfSB0b2tlblxuICAgICAqIEBwYXJhbSAge3N0cmluZ30gcHVibGljS2V5UGF0aFxuICAgICAqIEByZXR1cm5zIElUb2tlbkluZm9bJ3BheWxvYWQnXVxuICAgICAqL1xuICAgIHN0YXRpYyB2ZXJpZnlUb2tlbih0b2tlbiwgcHVibGljS2V5UGF0aCkge1xuICAgICAgICBpZiAodG9rZW4gPT09IG51bGwgfHwgdG9rZW4gPT09ICcnKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgaW5kZXhfMS5VbmF1dGhvcml6ZWRFcnJvcignVGhlIHRva2VuIG11c3QgYmUgcHJvdmlkZWQnKTtcbiAgICAgICAgfVxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcHVibGljS2V5ID0gZnNfMS5kZWZhdWx0LnJlYWRGaWxlU3luYyhwdWJsaWNLZXlQYXRoKTtcbiAgICAgICAgICAgIGNvbnN0IHBheWxvYWQgPSBqc29ud2VidG9rZW5fMS5kZWZhdWx0LnZlcmlmeShTdHJpbmcodG9rZW4pLCBwdWJsaWNLZXkpO1xuICAgICAgICAgICAgcmV0dXJuIHBheWxvYWQ7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IGluZGV4XzEuVW5hdXRob3JpemVkRXJyb3IoJ1Rva2VuIHZlcmlmaWNhdGlvbiBmYWlsZWQnLCBlcnIpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJlZ2lzdGVyIHRva2Vuc1xuICAgICAqIEBwYXJhbSAge3t1dWlkOnN0cmluZztkZXZpY2VJbmZvOnt9O319IGRhdGFcbiAgICAgKiBAcmV0dXJucyBJVG9rZW5JbmZvXG4gICAgICovXG4gICAgcmVnaXN0ZXJUb2tlbnMoZGF0YSkge1xuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgY29uc3QgeyBjb250ZXh0IH0gPSB0aGlzLnByb3BzO1xuICAgICAgICAgICAgY29uc3QgeyBrbmV4LCBsb2dnZXIgfSA9IGNvbnRleHQ7XG4gICAgICAgICAgICBjb25zdCBhY2NvdW50ID0geWllbGQga25leFxuICAgICAgICAgICAgICAgIC5zZWxlY3QoWydpZCcsICdyb2xlcyddKVxuICAgICAgICAgICAgICAgIC5mcm9tKCdhY2NvdW50cycpXG4gICAgICAgICAgICAgICAgLndoZXJlKHtcbiAgICAgICAgICAgICAgICBpZDogZGF0YS51dWlkLFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuZmlyc3QoKTtcbiAgICAgICAgICAgIGNvbnN0IHRva2VucyA9IHRoaXMuZ2VuZXJhdGVUb2tlbnMoe1xuICAgICAgICAgICAgICAgIHV1aWQ6IGFjY291bnQuaWQsXG4gICAgICAgICAgICAgICAgcm9sZXM6IGFjY291bnQucm9sZXMsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8vIFJlZ2lzdGVyIGFjY2VzcyB0b2tlblxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB5aWVsZCBrbmV4KCd0b2tlbnMnKS5pbnNlcnQoe1xuICAgICAgICAgICAgICAgICAgICBpZDogdG9rZW5zLmFjY2Vzc1Rva2VuLnBheWxvYWQuaWQsXG4gICAgICAgICAgICAgICAgICAgIGFjY291bnQ6IHRva2Vucy5hY2Nlc3NUb2tlbi5wYXlsb2FkLnV1aWQsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFRva2VuVHlwZS5hY2Nlc3MsXG4gICAgICAgICAgICAgICAgICAgIGRldmljZUluZm86IGRhdGEuZGV2aWNlSW5mbyxcbiAgICAgICAgICAgICAgICAgICAgZXhwaXJlZEF0OiBtb21lbnRfdGltZXpvbmVfMS5kZWZhdWx0KHRva2Vucy5hY2Nlc3NUb2tlbi5wYXlsb2FkLmV4cCkuZm9ybWF0KCksXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IGluZGV4XzEuU2VydmVyRXJyb3IoJ0ZhaWxlZCB0byByZWdpc3RlciBhY2Nlc3MgdG9rZW4nLCBlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gcmVnaXN0ZXIgcmVmcmVzaCB0b2tlblxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB5aWVsZCBrbmV4KCd0b2tlbnMnKS5pbnNlcnQoe1xuICAgICAgICAgICAgICAgICAgICBpZDogdG9rZW5zLnJlZnJlc2hUb2tlbi5wYXlsb2FkLmlkLFxuICAgICAgICAgICAgICAgICAgICBhY2NvdW50OiB0b2tlbnMucmVmcmVzaFRva2VuLnBheWxvYWQudXVpZCxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogVG9rZW5UeXBlLnJlZnJlc2gsXG4gICAgICAgICAgICAgICAgICAgIGFzc29jaWF0ZWQ6IHRva2Vucy5hY2Nlc3NUb2tlbi5wYXlsb2FkLmlkLFxuICAgICAgICAgICAgICAgICAgICBkZXZpY2VJbmZvOiBkYXRhLmRldmljZUluZm8sXG4gICAgICAgICAgICAgICAgICAgIGV4cGlyZWRBdDogbW9tZW50X3RpbWV6b25lXzEuZGVmYXVsdCh0b2tlbnMucmVmcmVzaFRva2VuLnBheWxvYWQuZXhwKS5mb3JtYXQoKSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgaW5kZXhfMS5TZXJ2ZXJFcnJvcignRmFpbGVkIHRvIHJlZ2lzdGVyIHJlZnJlc2ggdG9rZW4nLCBlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbG9nZ2VyLmF1dGguaW5mbygnTmV3IEFjY2VzcyB0b2tlbiB3YXMgcmVnaXN0ZXJlZCcsIHRva2Vucy5hY2Nlc3NUb2tlbi5wYXlsb2FkKTtcbiAgICAgICAgICAgIHJldHVybiB0b2tlbnM7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBnZW5lcmF0ZVRva2VucyhwYXlsb2FkKSB7XG4gICAgICAgIGNvbnN0IHsgY29udGV4dCB9ID0gdGhpcy5wcm9wcztcbiAgICAgICAgLy8gY2hlY2sgZmlsZSB0byBhY2Nlc3MgYW5kIHJlYWRhYmxlXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBmc18xLmRlZmF1bHQuYWNjZXNzU3luYyhjb250ZXh0Lmp3dC5wcml2YXRlS2V5KTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgaW5kZXhfMS5TZXJ2ZXJFcnJvcignRmFpbGVkIHRvIG9wZW4gSldUIHByaXZhdGVLZXkgZmlsZScsIHsgZXJyIH0pO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHByaXZhdEtleSA9IGZzXzEuZGVmYXVsdC5yZWFkRmlsZVN5bmMoY29udGV4dC5qd3QucHJpdmF0ZUtleSk7XG4gICAgICAgIGNvbnN0IGFjY2Vzc1Rva2VuUGF5bG9hZCA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7fSwgcGF5bG9hZCksIHsgdHlwZTogVG9rZW5UeXBlLmFjY2VzcywgaWQ6IHY0XzEuZGVmYXVsdCgpLCBleHA6IE1hdGguZmxvb3IoRGF0ZS5ub3coKSAvIDEwMDApICsgTnVtYmVyKGNvbnRleHQuand0LmFjY2Vzc1Rva2VuRXhwaXJlc0luKSwgaXNzOiBjb250ZXh0Lmp3dC5pc3N1ZXIgfSk7XG4gICAgICAgIGNvbnN0IHJlZnJlc2hUb2tlblBheWxvYWQgPSBPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oe30sIHBheWxvYWQpLCB7IHR5cGU6IFRva2VuVHlwZS5yZWZyZXNoLCBpZDogdjRfMS5kZWZhdWx0KCksIGFzc29jaWF0ZWQ6IGFjY2Vzc1Rva2VuUGF5bG9hZC5pZCwgZXhwOiBNYXRoLmZsb29yKERhdGUubm93KCkgLyAxMDAwKSArIE51bWJlcihjb250ZXh0Lmp3dC5yZWZyZXNoVG9rZW5FeHBpcmVzSW4pLCBpc3M6IGNvbnRleHQuand0Lmlzc3VlciB9KTtcbiAgICAgICAgY29uc3QgYWNjZXNzVG9rZW4gPSBqc29ud2VidG9rZW5fMS5kZWZhdWx0LnNpZ24oYWNjZXNzVG9rZW5QYXlsb2FkLCBwcml2YXRLZXksIHtcbiAgICAgICAgICAgIGFsZ29yaXRobTogY29udGV4dC5qd3QuYWxnb3JpdGhtLFxuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgcmVmcmVzaFRva2VuID0ganNvbndlYnRva2VuXzEuZGVmYXVsdC5zaWduKHJlZnJlc2hUb2tlblBheWxvYWQsIHByaXZhdEtleSwge1xuICAgICAgICAgICAgYWxnb3JpdGhtOiBjb250ZXh0Lmp3dC5hbGdvcml0aG0sXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgYWNjZXNzVG9rZW46IHtcbiAgICAgICAgICAgICAgICB0b2tlbjogYWNjZXNzVG9rZW4sXG4gICAgICAgICAgICAgICAgcGF5bG9hZDogT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHt9LCBhY2Nlc3NUb2tlblBheWxvYWQpLCB7IHR5cGU6IFRva2VuVHlwZS5hY2Nlc3MgfSksXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcmVmcmVzaFRva2VuOiB7XG4gICAgICAgICAgICAgICAgdG9rZW46IHJlZnJlc2hUb2tlbixcbiAgICAgICAgICAgICAgICBwYXlsb2FkOiBPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oe30sIHJlZnJlc2hUb2tlblBheWxvYWQpLCB7IHR5cGU6IFRva2VuVHlwZS5yZWZyZXNoIH0pLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfTtcbiAgICB9XG4gICAgcmV2b2tlVG9rZW4odG9rZW5JZCkge1xuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgY29uc3QgeyBjb250ZXh0IH0gPSB0aGlzLnByb3BzO1xuICAgICAgICAgICAgY29uc3QgeyBrbmV4IH0gPSBjb250ZXh0O1xuICAgICAgICAgICAgeWllbGQga25leC5kZWwoJ3Rva2VucycpLndoZXJlKHtcbiAgICAgICAgICAgICAgICBpZDogdG9rZW5JZCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgY2hlY2tUb2tlbkV4aXN0KHRva2VuSWQpIHtcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgIGNvbnN0IHsgY29udGV4dCB9ID0gdGhpcy5wcm9wcztcbiAgICAgICAgICAgIGNvbnN0IHsga25leCB9ID0gY29udGV4dDtcbiAgICAgICAgICAgIGNvbnN0IHRva2VuRGF0YSA9IHlpZWxkIGtuZXhcbiAgICAgICAgICAgICAgICAuc2VsZWN0KFsnaWQnXSlcbiAgICAgICAgICAgICAgICAuZnJvbSgndG9rZW5zJylcbiAgICAgICAgICAgICAgICAud2hlcmUoeyBpZDogdG9rZW5JZCB9KVxuICAgICAgICAgICAgICAgIC5maXJzdCgpO1xuICAgICAgICAgICAgcmV0dXJuIHRva2VuRGF0YSAhPT0gbnVsbDtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGdldEFjY291bnRCeUxvZ2luKGxvZ2luKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICBjb25zdCB7IGNvbnRleHQgfSA9IHRoaXMucHJvcHM7XG4gICAgICAgICAgICBjb25zdCB7IGtuZXggfSA9IGNvbnRleHQ7XG4gICAgICAgICAgICBjb25zdCBhY2NvdW50ID0geWllbGQga25leFxuICAgICAgICAgICAgICAgIC5zZWxlY3QoWydpZCcsICdwYXNzd29yZCcsICdzdGF0dXMnXSlcbiAgICAgICAgICAgICAgICAuZnJvbSgnYWNjb3VudHMnKVxuICAgICAgICAgICAgICAgIC53aGVyZSh7XG4gICAgICAgICAgICAgICAgbG9naW4sXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5maXJzdCgpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBpZDogYWNjb3VudC5pZCxcbiAgICAgICAgICAgICAgICBwYXNzd29yZDogYWNjb3VudC5wYXNzd29yZCxcbiAgICAgICAgICAgICAgICBzdGF0dXM6IGFjY291bnQuc3RhdHVzLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHN0YXRpYyBzZW5kUmVzcG9uc2VFcnJvcihyZXNwb25zZXR5cGUsIHJlc3ApIHtcbiAgICAgICAgY29uc3QgZXJyb3JzID0gW107XG4gICAgICAgIHN3aXRjaCAocmVzcG9uc2V0eXBlKSB7XG4gICAgICAgICAgICBjYXNlICdhY2NvdW50Rm9yYmlkZGVuJzpcbiAgICAgICAgICAgICAgICBlcnJvcnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdBY2NvdW50IGxvY2tlZCcsXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICdBdXRob3JpemF0aW9uIGVycm9yJyxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2F1dGhlbnRpZmljYXRpb25SZXF1aXJlZCc6XG4gICAgICAgICAgICAgICAgZXJyb3JzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiAnQXV0aGVudGljYXRpb24gUmVxdWlyZWQnLFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnQXV0aG9yaXphdGlvbiBlcnJvcicsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdpc05vdEFSZWZyZXNoVG9rZW4nOlxuICAgICAgICAgICAgICAgIGVycm9ycy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogJ1Rva2VuIGVycm9yJyxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ0lzIG5vdCBhIHJlZnJlc2ggdG9rZW4nLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAndG9rZW5FeHBpcmVkJzpcbiAgICAgICAgICAgICAgICBlcnJvcnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdUb2tlbiBlcnJvcicsXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICdUaGlzIHRva2VuIGV4cGlyZWQnLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAndG9rZW5XYXNSZXZva2VkJzpcbiAgICAgICAgICAgICAgICBlcnJvcnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdUb2tlbiBlcnJvcicsXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICdUb2tlbiB3YXMgcmV2b2tlZCcsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdhY2NvdW50Tm90Rm91bmQnOlxuICAgICAgICAgICAgY2FzZSAnaW52YWxpZExvZ2luT3JQYXNzd29yZCc6XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGVycm9ycy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogJ0ludmFsaWQgbG9naW4gb3IgcGFzc3dvcmQnLFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnQXV0aG9yaXphdGlvbiBlcnJvcicsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3Auc3RhdHVzKDQwMSkuanNvbih7IGVycm9ycyB9KTtcbiAgICB9XG59XG5leHBvcnRzLkF1dGhlbnRpZmljYXRvciA9IEF1dGhlbnRpZmljYXRvcjtcbnZhciBSZXNwb25zZUVycm9yVHlwZTtcbihmdW5jdGlvbiAoUmVzcG9uc2VFcnJvclR5cGUpIHtcbiAgICBSZXNwb25zZUVycm9yVHlwZVtcImF1dGhlbnRpZmljYXRpb25SZXF1aXJlZFwiXSA9IFwiYXV0aGVudGlmaWNhdGlvblJlcXVpcmVkXCI7XG4gICAgUmVzcG9uc2VFcnJvclR5cGVbXCJhY2NvdW50Tm90Rm91bmRcIl0gPSBcImFjY291bnROb3RGb3VuZFwiO1xuICAgIFJlc3BvbnNlRXJyb3JUeXBlW1wiYWNjb3VudEZvcmJpZGRlblwiXSA9IFwiYWNjb3VudEZvcmJpZGRlblwiO1xuICAgIFJlc3BvbnNlRXJyb3JUeXBlW1wiaW52YWxpZExvZ2luT3JQYXNzd29yZFwiXSA9IFwiaW52YWxpZExvZ2luT3JQYXNzd29yZFwiO1xuICAgIFJlc3BvbnNlRXJyb3JUeXBlW1widG9rZW5FeHBpcmVkXCJdID0gXCJ0b2tlbkV4cGlyZWRcIjtcbiAgICBSZXNwb25zZUVycm9yVHlwZVtcImlzTm90QVJlZnJlc2hUb2tlblwiXSA9IFwiaXNOb3RBUmVmcmVzaFRva2VuXCI7XG4gICAgUmVzcG9uc2VFcnJvclR5cGVbXCJ0b2tlbldhc1Jldm9rZWRcIl0gPSBcInRva2VuV2FzUmV2b2tlZFwiO1xufSkoUmVzcG9uc2VFcnJvclR5cGUgPSBleHBvcnRzLlJlc3BvbnNlRXJyb3JUeXBlIHx8IChleHBvcnRzLlJlc3BvbnNlRXJyb3JUeXBlID0ge30pKTtcbnZhciBBY2NvdW50U3RhdHVzO1xuKGZ1bmN0aW9uIChBY2NvdW50U3RhdHVzKSB7XG4gICAgQWNjb3VudFN0YXR1c1tcImFsbG93ZWRcIl0gPSBcImFsbG93ZWRcIjtcbiAgICBBY2NvdW50U3RhdHVzW1wiZm9yYmlkZGVuXCJdID0gXCJmb3JiaWRkZW5cIjtcbn0pKEFjY291bnRTdGF0dXMgPSBleHBvcnRzLkFjY291bnRTdGF0dXMgfHwgKGV4cG9ydHMuQWNjb3VudFN0YXR1cyA9IHt9KSk7XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2F3YWl0ZXIgPSAodGhpcyAmJiB0aGlzLl9fYXdhaXRlcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xuICAgIGZ1bmN0aW9uIGFkb3B0KHZhbHVlKSB7IHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFAgPyB2YWx1ZSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUodmFsdWUpOyB9KTsgfVxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XG4gICAgfSk7XG59O1xudmFyIF9faW1wb3J0RGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnREZWZhdWx0KSB8fCBmdW5jdGlvbiAobW9kKSB7XG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBcImRlZmF1bHRcIjogbW9kIH07XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgYmNyeXB0anNfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiYmNyeXB0anNcIikpO1xuY29uc3QgZGV2aWNlX2RldGVjdG9yX2pzXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcImRldmljZS1kZXRlY3Rvci1qc1wiKSk7XG5jb25zdCBleHByZXNzXzEgPSByZXF1aXJlKFwiZXhwcmVzc1wiKTtcbmNvbnN0IGV4cHJlc3NfYXN5bmNfaGFuZGxlcl8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCJleHByZXNzLWFzeW5jLWhhbmRsZXJcIikpO1xuY29uc3QgQXV0aGVudGlmaWNhdG9yXzEgPSByZXF1aXJlKFwiLi9BdXRoZW50aWZpY2F0b3JcIik7XG5jb25zdCBhdXRoZW50aWZpY2F0b3JNaWRkbGV3YXJlID0gKGNvbmZpZykgPT4ge1xuICAgIGNvbnN0IHsgY29udGV4dCwgYXV0aFVybCwgYWxsb3dlZFVybCB9ID0gY29uZmlnO1xuICAgIGNvbnN0IHsgZW5kcG9pbnQgfSA9IGNvbmZpZy5jb250ZXh0O1xuICAgIGNvbnN0IHsgcHVibGljS2V5IH0gPSBjb25maWcuY29udGV4dC5qd3Q7XG4gICAgY29uc3QgeyBsb2dnZXIgfSA9IGNvbnRleHQ7XG4gICAgY29uc3QgYXV0aGVudGlmaWNhdG9yID0gbmV3IEF1dGhlbnRpZmljYXRvcl8xLkF1dGhlbnRpZmljYXRvcih7IGNvbnRleHQgfSk7XG4gICAgY29uc3Qgcm91dGVyID0gZXhwcmVzc18xLlJvdXRlcigpO1xuICAgIC8qKlxuICAgICAqIFJvdXRlIHNlcnZpbmcgYWNjZXNzIHRva2VuIHJlcXVlc3RzXG4gICAgICogVGhpcyBwb2ludCByZXNwb25zZSBKU09OIG9iamVjdCB3aXRoIHRva2VuIGRhdGE6XG4gICAgICogZS5nLiB7XG4gICAgICogIGFjY2Vzc1Rva2VuOiBcIlhYWFhYWFhYWFhYWFhYWC4uLlwiLFxuICAgICAqICB0b2tlblR5cGU6IFwiYmVhcmVyXCIsXG4gICAgICogIGV4cGlyZXNJbjogMTU4MjE3ODA1NFxuICAgICAqICByZWZyZXNoVG9rZW46IFwiWFhYWFhYWFhYWFhYWFhYLi4uXCJcbiAgICAgKiB9XG4gICAgICogQHBhcmFtICB7UmVxdWVzdH0gcmVxIFRoZSByZXF1ZXN0XG4gICAgICogQHBhcmFtICB7UmVzcG9uc2V9IHJlcyBUaGUgcmVzcG9uc2VcbiAgICAgKiBAcGFyYW0gIHtzdHJpbmd9IHJlcS5ib2R5LmxvZ2luIEFjY291bnQgbG9naW5cbiAgICAgKiBAcGFyYW0gIHtzdHJpbmd9IHJlcS5ib2R5LnBhc3N3b3JkIEFjY291bnQgcGFzc3dvcmRcbiAgICAgKiBAcGFyYW0gIHtSZXNwb25zZX0gcmVzXG4gICAgICovXG4gICAgcm91dGVyLnBvc3QoYCR7YXV0aFVybH0vYWNjZXNzLXRva2VuYCwgZXhwcmVzc19hc3luY19oYW5kbGVyXzEuZGVmYXVsdCgocmVxLCByZXMpID0+IF9fYXdhaXRlcih2b2lkIDAsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICBjb25zdCB7IGJvZHksIGhlYWRlcnMgfSA9IHJlcTtcbiAgICAgICAgY29uc3QgeyBsb2dpbiwgcGFzc3dvcmQgfSA9IGJvZHk7XG4gICAgICAgIGNvbnN0IGRldmljZURldGVjdG9yID0gbmV3IGRldmljZV9kZXRlY3Rvcl9qc18xLmRlZmF1bHQoKTtcbiAgICAgICAgY29uc3QgZGV2aWNlSW5mbyA9IGRldmljZURldGVjdG9yLnBhcnNlKGhlYWRlcnNbJ3VzZXItYWdlbnQnXSk7XG4gICAgICAgIGxvZ2dlci5hdXRoLmluZm8oJ0FjY2VzcyB0b2tlbiByZXF1ZXN0JywgeyBsb2dpbiB9KTtcbiAgICAgICAgY29uc3QgYWNjb3VudCA9IHlpZWxkIGF1dGhlbnRpZmljYXRvci5nZXRBY2NvdW50QnlMb2dpbihsb2dpbik7XG4gICAgICAgIC8vIGFjY291bnQgbm90IGZvdW5kXG4gICAgICAgIGlmICghYWNjb3VudCB8fCAhYmNyeXB0anNfMS5kZWZhdWx0LmNvbXBhcmVTeW5jKHBhc3N3b3JkLCBhY2NvdW50LnBhc3N3b3JkKSkge1xuICAgICAgICAgICAgbG9nZ2VyLmF1dGguZXJyb3IoJ0FjY291bnQgbm90IGZvdW5kJywgeyBsb2dpbiB9KTtcbiAgICAgICAgICAgIHJldHVybiBBdXRoZW50aWZpY2F0b3JfMS5BdXRoZW50aWZpY2F0b3Iuc2VuZFJlc3BvbnNlRXJyb3IoQXV0aGVudGlmaWNhdG9yXzEuUmVzcG9uc2VFcnJvclR5cGUuYWNjb3VudE5vdEZvdW5kLCByZXMpO1xuICAgICAgICB9XG4gICAgICAgIC8vIGFjY291bnQgbG9ja2VkXG4gICAgICAgIGlmIChhY2NvdW50LnN0YXR1cyA9PT0gQXV0aGVudGlmaWNhdG9yXzEuQWNjb3VudFN0YXR1cy5mb3JiaWRkZW4gJiYgYmNyeXB0anNfMS5kZWZhdWx0LmNvbXBhcmVTeW5jKHBhc3N3b3JkLCBhY2NvdW50LnBhc3N3b3JkKSkge1xuICAgICAgICAgICAgbG9nZ2VyLmF1dGguaW5mbygnQXV0aGVudGlmaWNhdGlvbiBmb3JiaWRkZW4nLCB7IGxvZ2luIH0pO1xuICAgICAgICAgICAgcmV0dXJuIEF1dGhlbnRpZmljYXRvcl8xLkF1dGhlbnRpZmljYXRvci5zZW5kUmVzcG9uc2VFcnJvcihBdXRoZW50aWZpY2F0b3JfMS5SZXNwb25zZUVycm9yVHlwZS5hY2NvdW50Rm9yYmlkZGVuLCByZXMpO1xuICAgICAgICB9XG4gICAgICAgIC8vIHN1Y2Nlc3NcbiAgICAgICAgaWYgKGFjY291bnQuc3RhdHVzID09PSBBdXRoZW50aWZpY2F0b3JfMS5BY2NvdW50U3RhdHVzLmFsbG93ZWQgJiYgYmNyeXB0anNfMS5kZWZhdWx0LmNvbXBhcmVTeW5jKHBhc3N3b3JkLCBhY2NvdW50LnBhc3N3b3JkKSkge1xuICAgICAgICAgICAgY29uc3QgdG9rZW5zID0geWllbGQgYXV0aGVudGlmaWNhdG9yLnJlZ2lzdGVyVG9rZW5zKHtcbiAgICAgICAgICAgICAgICB1dWlkOiBhY2NvdW50LmlkLFxuICAgICAgICAgICAgICAgIGRldmljZUluZm8sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDIwMCkuanNvbih7XG4gICAgICAgICAgICAgICAgYWNjZXNzVG9rZW46IHRva2Vucy5hY2Nlc3NUb2tlbi50b2tlbixcbiAgICAgICAgICAgICAgICB0b2tlblR5cGU6ICdiZWFyZXInLFxuICAgICAgICAgICAgICAgIGV4cGlyZXNJbjogY29uZmlnLmNvbnRleHQuand0LmFjY2Vzc1Rva2VuRXhwaXJlc0luLFxuICAgICAgICAgICAgICAgIHJlZnJlc2hUb2tlbjogdG9rZW5zLnJlZnJlc2hUb2tlbi50b2tlbixcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBBdXRoZW50aWZpY2F0b3JfMS5BdXRoZW50aWZpY2F0b3Iuc2VuZFJlc3BvbnNlRXJyb3IoQXV0aGVudGlmaWNhdG9yXzEuUmVzcG9uc2VFcnJvclR5cGUuYWNjb3VudE5vdEZvdW5kLCByZXMpO1xuICAgIH0pKSk7XG4gICAgLyoqXG4gICAgICogUm91dGUgc2VydmluZyByZWZyZXNoIHRva2VuIHJlcXVlc3RzXG4gICAgICogVGhpcyBwb2ludCByZXNwb25zZSBKU09OIG9iamVjdCB3aXRoIHRva2VuIGRhdGE6XG4gICAgICogZS5nLiB7XG4gICAgICogIGFjY2Vzc1Rva2VuOiBcIlhYWFhYWFhYWFhYWFhYWC4uLlwiLFxuICAgICAqICB0b2tlblR5cGU6IFwiYmVhcmVyXCIsXG4gICAgICogIGV4cGlyZXNJbjogMTU4MjE3ODA1NFxuICAgICAqICByZWZyZXNoVG9rZW46IFwiWFhYWFhYWFhYWFhYWFhYLi4uXCJcbiAgICAgKiB9XG4gICAgICogQHBhcmFtICB7UmVxdWVzdH0gcmVxIFRoZSByZXF1ZXN0XG4gICAgICogQHBhcmFtICB7UmVzcG9uc2V9IHJlcyBUaGUgcmVzcG9uc2VcbiAgICAgKiBAcGFyYW0gIHtzdHJpbmd9IHJlcS50b2tlbiBWYWxpZCByZWZyZXNoIHRva2VuXG4gICAgICogQHBhcmFtICB7UmVzcG9uc2V9IHJlc1xuICAgICAqL1xuICAgIHJvdXRlci5wb3N0KGAke2F1dGhVcmx9L3JlZnJlc2gtdG9rZW5gLCBleHByZXNzX2FzeW5jX2hhbmRsZXJfMS5kZWZhdWx0KChyZXEsIHJlcykgPT4gX19hd2FpdGVyKHZvaWQgMCwgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgIGNvbnN0IHsgYm9keSwgaGVhZGVycyB9ID0gcmVxO1xuICAgICAgICBjb25zdCB7IHRva2VuIH0gPSBib2R5O1xuICAgICAgICAvLyB0cnkgdG8gdmVyaWZ5IHJlZnJlc2ggdG9rZW5cbiAgICAgICAgY29uc3QgdG9rZW5QYXlsb2FkID0gQXV0aGVudGlmaWNhdG9yXzEuQXV0aGVudGlmaWNhdG9yLnZlcmlmeVRva2VuKHRva2VuLCBjb250ZXh0Lmp3dC5wdWJsaWNLZXkpO1xuICAgICAgICBpZiAodG9rZW5QYXlsb2FkLnR5cGUgIT09IEF1dGhlbnRpZmljYXRvcl8xLlRva2VuVHlwZS5yZWZyZXNoKSB7XG4gICAgICAgICAgICBsb2dnZXIuYXV0aC5pbmZvKCdUcmllZCB0byByZWZyZXNoIHRva2VuIGJ5IGFjY2VzcyB0b2tlbi4gUmVqZWN0ZWQnLCB7IHBheWxvYWQ6IHRva2VuUGF5bG9hZCB9KTtcbiAgICAgICAgICAgIHJldHVybiBBdXRoZW50aWZpY2F0b3JfMS5BdXRoZW50aWZpY2F0b3Iuc2VuZFJlc3BvbnNlRXJyb3IoQXV0aGVudGlmaWNhdG9yXzEuUmVzcG9uc2VFcnJvclR5cGUuaXNOb3RBUmVmcmVzaFRva2VuLCByZXMpO1xuICAgICAgICB9XG4gICAgICAgIC8vIGNoZWNrIHRvIHRva2VuIGV4aXN0XG4gICAgICAgIGlmICghKHlpZWxkIGF1dGhlbnRpZmljYXRvci5jaGVja1Rva2VuRXhpc3QodG9rZW5QYXlsb2FkLmlkKSkpIHtcbiAgICAgICAgICAgIGxvZ2dlci5hdXRoLmluZm8oJ1RyaWVkIHRvIHJlZnJlc2ggdG9rZW4gYnkgcmV2b2tlZCByZWZyZXNoIHRva2VuLiBSZWplY3RlZCcsIHsgcGF5bG9hZDogdG9rZW5QYXlsb2FkIH0pO1xuICAgICAgICAgICAgcmV0dXJuIEF1dGhlbnRpZmljYXRvcl8xLkF1dGhlbnRpZmljYXRvci5zZW5kUmVzcG9uc2VFcnJvcihBdXRoZW50aWZpY2F0b3JfMS5SZXNwb25zZUVycm9yVHlwZS50b2tlbldhc1Jldm9rZWQsIHJlcyk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZGV2aWNlRGV0ZWN0b3IgPSBuZXcgZGV2aWNlX2RldGVjdG9yX2pzXzEuZGVmYXVsdCgpO1xuICAgICAgICBjb25zdCBkZXZpY2VJbmZvID0gZGV2aWNlRGV0ZWN0b3IucGFyc2UoaGVhZGVyc1sndXNlci1hZ2VudCddKTtcbiAgICAgICAgLy8gcmV2b2tlIG9sZCBhY2Nlc3MgdG9rZW4gb2YgdGhpcyByZWZyZXNoXG4gICAgICAgIHlpZWxkIGF1dGhlbnRpZmljYXRvci5yZXZva2VUb2tlbih0b2tlblBheWxvYWQuYXNzb2NpYXRlZCk7XG4gICAgICAgIC8vIHJldm9rZSBvbGQgcmVmcmVzaCB0b2tlblxuICAgICAgICB5aWVsZCBhdXRoZW50aWZpY2F0b3IucmV2b2tlVG9rZW4odG9rZW5QYXlsb2FkLmlkKTtcbiAgICAgICAgLy8gY3JlYXRlIG5ldyB0b2tlbnNcbiAgICAgICAgY29uc3QgdG9rZW5zID0geWllbGQgYXV0aGVudGlmaWNhdG9yLnJlZ2lzdGVyVG9rZW5zKHtcbiAgICAgICAgICAgIHV1aWQ6IHRva2VuUGF5bG9hZC51dWlkLFxuICAgICAgICAgICAgZGV2aWNlSW5mbyxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDIwMCkuanNvbih7XG4gICAgICAgICAgICBhY2Nlc3NUb2tlbjogdG9rZW5zLmFjY2Vzc1Rva2VuLnRva2VuLFxuICAgICAgICAgICAgdG9rZW5UeXBlOiAnYmVhcmVyJyxcbiAgICAgICAgICAgIGV4cGlyZXNJbjogY29uZmlnLmNvbnRleHQuand0LmFjY2Vzc1Rva2VuRXhwaXJlc0luLFxuICAgICAgICAgICAgcmVmcmVzaFRva2VuOiB0b2tlbnMucmVmcmVzaFRva2VuLnRva2VuLFxuICAgICAgICB9KTtcbiAgICB9KSkpO1xuICAgIC8qKlxuICAgICAqIFJvdXRlIHNlcnZpbmcgdG9rZW4gdmFsaWRhdGlvbiByZXF1ZXN0c1xuICAgICAqIFRoaXMgcG9pbnQgcmVzcG9uc2UgSlNPTiBvYmplY3Qgd2l0aCB0b2tlbiBwYXlsb2FkIGRhdGFcbiAgICAgKiBAcGFyYW0gIHtSZXF1ZXN0fSByZXEgVGhlIHJlcXVlc3RcbiAgICAgKiBAcGFyYW0gIHtSZXNwb25zZX0gcmVzIFRoZSByZXNwb25zZVxuICAgICAqIEBwYXJhbSAge3N0cmluZ30gcmVxLnRva2VuIFZhbGlkIHJlZnJlc2ggdG9rZW5cbiAgICAgKiBAcGFyYW0gIHtSZXNwb25zZX0gcmVzXG4gICAgICovXG4gICAgcm91dGVyLnBvc3QoYCR7YXV0aFVybH0vdmFsaWRhdGUtdG9rZW5gLCBleHByZXNzX2FzeW5jX2hhbmRsZXJfMS5kZWZhdWx0KChyZXEsIHJlcykgPT4gX19hd2FpdGVyKHZvaWQgMCwgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgIGNvbnN0IHsgYm9keSB9ID0gcmVxO1xuICAgICAgICBjb25zdCB7IHRva2VuIH0gPSBib2R5O1xuICAgICAgICBjb25zdCBwYXlsb2FkID0gQXV0aGVudGlmaWNhdG9yXzEuQXV0aGVudGlmaWNhdG9yLnZlcmlmeVRva2VuKHRva2VuLCBwdWJsaWNLZXkpO1xuICAgICAgICByZXMuanNvbihwYXlsb2FkKTtcbiAgICB9KSkpO1xuICAgIC8qKlxuICAgICAqIFRoaXMgcG9pbnQgc2VydmUgYWxsIHJlcXVlc3QgaW50byBHcmFwaFFMIGBlbmRwb2ludGBcbiAgICAgKi9cbiAgICByb3V0ZXIudXNlKGVuZHBvaW50LCBleHByZXNzX2FzeW5jX2hhbmRsZXJfMS5kZWZhdWx0KChyZXEsIHJlcywgbmV4dCkgPT4gX19hd2FpdGVyKHZvaWQgMCwgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgIGlmIChhbGxvd2VkVXJsLmluY2x1ZGVzKHJlcS5vcmlnaW5hbFVybCkpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXh0KCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdG9rZW4gPSBBdXRoZW50aWZpY2F0b3JfMS5BdXRoZW50aWZpY2F0b3IuZXh0cmFjdFRva2VuKHJlcSk7XG4gICAgICAgIEF1dGhlbnRpZmljYXRvcl8xLkF1dGhlbnRpZmljYXRvci52ZXJpZnlUb2tlbih0b2tlbiwgcHVibGljS2V5KTtcbiAgICAgICAgcmV0dXJuIG5leHQoKTtcbiAgICB9KSkpO1xuICAgIHJldHVybiByb3V0ZXI7XG59O1xuZXhwb3J0cy5hdXRoZW50aWZpY2F0b3JNaWRkbGV3YXJlID0gYXV0aGVudGlmaWNhdG9yTWlkZGxld2FyZTtcbmV4cG9ydHMuZGVmYXVsdCA9IGF1dGhlbnRpZmljYXRvck1pZGRsZXdhcmU7XG4iLCJcInVzZSBzdHJpY3RcIjtcbmZ1bmN0aW9uIF9fZXhwb3J0KG0pIHtcbiAgICBmb3IgKHZhciBwIGluIG0pIGlmICghZXhwb3J0cy5oYXNPd25Qcm9wZXJ0eShwKSkgZXhwb3J0c1twXSA9IG1bcF07XG59XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5fX2V4cG9ydChyZXF1aXJlKFwiLi9BdXRoZW50aWZpY2F0b3JcIikpO1xuX19leHBvcnQocmVxdWlyZShcIi4vYXV0aGVudGlmaWNhdG9yTWlkZGxld2FyZVwiKSk7XG4vLyBUT0RPIFRlc3RzIHJldWlyZWRcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9faW1wb3J0RGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnREZWZhdWx0KSB8fCBmdW5jdGlvbiAobW9kKSB7XG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBcImRlZmF1bHRcIjogbW9kIH07XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgaHR0cF8xID0gcmVxdWlyZShcImh0dHBcIik7XG5jb25zdCBjaGFsa18xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCJjaGFsa1wiKSk7XG5jb25zdCBncmFwaHFsXzEgPSByZXF1aXJlKFwiZ3JhcGhxbFwiKTtcbmNvbnN0IHN1YnNjcmlwdGlvbnNfdHJhbnNwb3J0X3dzXzEgPSByZXF1aXJlKFwic3Vic2NyaXB0aW9ucy10cmFuc3BvcnQtd3NcIik7XG5jb25zdCBhcHBfMSA9IHJlcXVpcmUoXCJ+L2FwcFwiKTtcbmNvbnN0IGxvZ2dlcl8xID0gcmVxdWlyZShcIn4vbG9nZ2VyXCIpO1xuY2xhc3MgQ29yZSB7XG4gICAgc3RhdGljIGluaXQoY29uZmlnKSB7XG4gICAgICAgIGNvbnN0IHsgcG9ydCwgZW5kcG9pbnQsIHN1YnNjcmlwdGlvbnNFbmRwb2ludCwgbG9nZ2VyIH0gPSBjb25maWc7XG4gICAgICAgIC8vIENyZWF0ZSB3ZWIgYXBwbGljYXRpb24gYnkgd3JhcHBpbmcgZXhwcmVzcyBhcHBcbiAgICAgICAgY29uc3QgeyBhcHAsIGNvbnRleHQsIHNjaGVtYSwgcm91dGVzIH0gPSBhcHBfMS5BcHAuY3JlYXRlQXBwKGNvbmZpZyk7XG4gICAgICAgIC8vIENyZWF0ZSB3ZWIgc2VydmVyXG4gICAgICAgIGNvbnN0IHNlcnZlciA9IGh0dHBfMS5jcmVhdGVTZXJ2ZXIoYXBwKTtcbiAgICAgICAgLy8gY29uZmlndXJlIGtuZXggcXVlcnkgYnVpbGRlclxuICAgICAgICBjb25zdCB7IGtuZXggfSA9IGNvbnRleHQ7XG4gICAgICAgIC8vIGNoZWNrIGRhdGFiYXNlIGNvbm5lY3Rpb25cbiAgICAgICAga25leFxuICAgICAgICAgICAgLnJhdygnU0VMRUNUIDErMSBBUyByZXN1bHQnKVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgbG9nZ2VyLnNlcnZlci5kZWJ1ZygnVGVzdCB0aGUgY29ubmVjdGlvbiBieSB0cnlpbmcgdG8gYXV0aGVudGljYXRlIGlzIE9LJyk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSlcbiAgICAgICAgICAgIC5jYXRjaChlcnIgPT4ge1xuICAgICAgICAgICAgbG9nZ2VyLnNlcnZlci5lcnJvcihlcnIubmFtZSwgZXJyKTtcbiAgICAgICAgICAgIHRocm93IG5ldyBsb2dnZXJfMS5TZXJ2ZXJFcnJvcihlcnIpO1xuICAgICAgICB9KTtcbiAgICAgICAgLy8gUnVuIEhUVFAgc2VydmVyXG4gICAgICAgIHNlcnZlci5saXN0ZW4ocG9ydCwgKCkgPT4ge1xuICAgICAgICAgICAgLy8gY29ubmVjdCB3ZWJzb2NrcnQgc3Vic2NyaXB0aW9ucyB3ZXJ2ZXJcbiAgICAgICAgICAgIC8vIEBzZWUgaHR0cHM6Ly9naXRodWIuY29tL2Fwb2xsb2dyYXBocWwvc3Vic2NyaXB0aW9ucy10cmFuc3BvcnQtd3MvYmxvYi9tYXN0ZXIvZG9jcy9zb3VyY2UvZXhwcmVzcy5tZFxuICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLW5ld1xuICAgICAgICAgICAgbmV3IHN1YnNjcmlwdGlvbnNfdHJhbnNwb3J0X3dzXzEuU3Vic2NyaXB0aW9uU2VydmVyKHtcbiAgICAgICAgICAgICAgICBleGVjdXRlOiBncmFwaHFsXzEuZXhlY3V0ZSxcbiAgICAgICAgICAgICAgICBzY2hlbWEsXG4gICAgICAgICAgICAgICAgc3Vic2NyaWJlOiBncmFwaHFsXzEuc3Vic2NyaWJlLFxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIHNlcnZlcixcbiAgICAgICAgICAgICAgICBwYXRoOiBzdWJzY3JpcHRpb25zRW5kcG9pbnQsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCcnKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCcnKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGNoYWxrXzEuZGVmYXVsdC5ncmVlbignPT09PT09PT09IEdyYXBoUUwgPT09PT09PT09JykpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJycpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYCR7Y2hhbGtfMS5kZWZhdWx0LmdyZWVuKCdHcmFwaFFMIHNlcnZlcicpfTogICAgICR7Y2hhbGtfMS5kZWZhdWx0LnllbGxvdyhgaHR0cDovL2xvY2FsaG9zdDoke3BvcnR9JHtlbmRwb2ludH1gKX1gKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2NoYWxrXzEuZGVmYXVsdC5tYWdlbnRhKCdHcmFwaFFMIHBsYXlncm91bmQnKX06ICR7Y2hhbGtfMS5kZWZhdWx0LnllbGxvdyhgaHR0cDovL2xvY2FsaG9zdDoke3BvcnR9JHtyb3V0ZXMucGxheWdyb3VuZH1gKX1gKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2NoYWxrXzEuZGVmYXVsdC5jeWFuKCdBdXRoIFNlcnZlcicpfTogICAgICAgICR7Y2hhbGtfMS5kZWZhdWx0LnllbGxvdyhgaHR0cDovL2xvY2FsaG9zdDoke3BvcnR9JHtyb3V0ZXMuYXV0aH1gKX1gKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2NoYWxrXzEuZGVmYXVsdC5ibHVlKCdHcmFwaFFMIHZveWFnZXInKX06ICAgICR7Y2hhbGtfMS5kZWZhdWx0LnllbGxvdyhgaHR0cDovL2xvY2FsaG9zdDoke3BvcnR9JHtyb3V0ZXMudm95YWdlcn1gKX1gKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCcnKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBzZXJ2ZXI7XG4gICAgfVxufVxuZXhwb3J0cy5Db3JlID0gQ29yZTtcbmV4cG9ydHMuZGVmYXVsdCA9IENvcmU7XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2ltcG9ydERlZmF1bHQgPSAodGhpcyAmJiB0aGlzLl9faW1wb3J0RGVmYXVsdCkgfHwgZnVuY3Rpb24gKG1vZCkge1xuICAgIHJldHVybiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSA/IG1vZCA6IHsgXCJkZWZhdWx0XCI6IG1vZCB9O1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IHBlcmZfaG9va3NfMSA9IHJlcXVpcmUoXCJwZXJmX2hvb2tzXCIpO1xuY29uc3Qga25leF8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCJrbmV4XCIpKTtcbmNvbnN0IGtuZXhQcm92aWRlciA9IChjb25maWcpID0+IHtcbiAgICBjb25zdCB7IGRhdGFiYXNlLCBsb2dnZXIgfSA9IGNvbmZpZztcbiAgICBjb25zdCB0aW1lcyA9IHt9O1xuICAgIGxldCBjb3VudCA9IDA7XG4gICAgY29uc3QgaW5zdGFuY2UgPSBrbmV4XzEuZGVmYXVsdChkYXRhYmFzZSk7XG4gICAgaW5zdGFuY2VcbiAgICAgICAgLm9uKCdxdWVyeScsIHF1ZXJ5ID0+IHtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVyc2NvcmUtZGFuZ2xlXG4gICAgICAgIGNvbnN0IHVpZCA9IHF1ZXJ5Ll9fa25leFF1ZXJ5VWlkO1xuICAgICAgICB0aW1lc1t1aWRdID0ge1xuICAgICAgICAgICAgcG9zaXRpb246IGNvdW50LFxuICAgICAgICAgICAgcXVlcnksXG4gICAgICAgICAgICBzdGFydFRpbWU6IHBlcmZfaG9va3NfMS5wZXJmb3JtYW5jZS5ub3coKSxcbiAgICAgICAgICAgIGZpbmlzaGVkOiBmYWxzZSxcbiAgICAgICAgfTtcbiAgICAgICAgY291bnQgKz0gMTtcbiAgICB9KVxuICAgICAgICAub24oJ3F1ZXJ5LXJlc3BvbnNlJywgKHJlc3BvbnNlLCBxdWVyeSkgPT4ge1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZXJzY29yZS1kYW5nbGVcbiAgICAgICAgY29uc3QgdWlkID0gcXVlcnkuX19rbmV4UXVlcnlVaWQ7XG4gICAgICAgIHRpbWVzW3VpZF0uZW5kVGltZSA9IHBlcmZfaG9va3NfMS5wZXJmb3JtYW5jZS5ub3coKTtcbiAgICAgICAgdGltZXNbdWlkXS5maW5pc2hlZCA9IHRydWU7XG4gICAgICAgIGxvZ2dlci5zcWwuZGVidWcocXVlcnkuc3FsLCB0aW1lc1t1aWRdKTtcbiAgICB9KVxuICAgICAgICAub24oJ3F1ZXJ5LWVycm9yJywgKGVyciwgcXVlcnkpID0+IHtcbiAgICAgICAgbG9nZ2VyLnNxbC5lcnJvcihxdWVyeS5zcWwsIHsgZXJyIH0pO1xuICAgIH0pO1xuICAgIHJldHVybiBpbnN0YW5jZTtcbn07XG5leHBvcnRzLmtuZXhQcm92aWRlciA9IGtuZXhQcm92aWRlcjtcbmV4cG9ydHMuZGVmYXVsdCA9IGtuZXhQcm92aWRlcjtcbiIsIlwidXNlIHN0cmljdFwiO1xuZnVuY3Rpb24gX19leHBvcnQobSkge1xuICAgIGZvciAodmFyIHAgaW4gbSkgaWYgKCFleHBvcnRzLmhhc093blByb3BlcnR5KHApKSBleHBvcnRzW3BdID0gbVtwXTtcbn1cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbl9fZXhwb3J0KHJlcXVpcmUoXCIuL2FwcFwiKSk7XG5fX2V4cG9ydChyZXF1aXJlKFwiLi9hdXRoZW50aWZpY2F0b3JcIikpO1xuX19leHBvcnQocmVxdWlyZShcIi4vZGF0YWJhc2VNYW5hZ2VyXCIpKTtcbl9fZXhwb3J0KHJlcXVpcmUoXCIuL2xvZ2dlclwiKSk7XG5fX2V4cG9ydChyZXF1aXJlKFwiLi9jb3JlXCIpKTtcbl9fZXhwb3J0KHJlcXVpcmUoXCIuL3NjaGVtYXNcIikpO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jbGFzcyBCYWRSZXF1ZXN0RXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gICAgY29uc3RydWN0b3IobWVzc2FnZSwgbWV0YURhdGEpIHtcbiAgICAgICAgc3VwZXIobWVzc2FnZSk7XG4gICAgICAgIHRoaXMubmFtZSA9ICdCYWRSZXF1ZXN0RXJyb3InO1xuICAgICAgICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xuICAgICAgICB0aGlzLm1ldGFEYXRhID0gbWV0YURhdGE7XG4gICAgICAgIHRoaXMuc3RhdHVzID0gNDAwO1xuICAgICAgICAvLyBTZXQgdGhlIHByb3RvdHlwZSBleHBsaWNpdGx5LlxuICAgICAgICBPYmplY3Quc2V0UHJvdG90eXBlT2YodGhpcywgQmFkUmVxdWVzdEVycm9yLnByb3RvdHlwZSk7XG4gICAgfVxufVxuZXhwb3J0cy5kZWZhdWx0ID0gQmFkUmVxdWVzdEVycm9yO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jbGFzcyBGb3JiaWRkZW5FcnJvciBleHRlbmRzIEVycm9yIHtcbiAgICBjb25zdHJ1Y3RvcihtZXNzYWdlLCBtZXRhRGF0YSkge1xuICAgICAgICBzdXBlcihtZXNzYWdlKTtcbiAgICAgICAgdGhpcy5uYW1lID0gJ0ZvcmJpZGRlbkVycm9yJztcbiAgICAgICAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbiAgICAgICAgdGhpcy5tZXRhRGF0YSA9IG1ldGFEYXRhO1xuICAgICAgICB0aGlzLnN0YXR1cyA9IDUwMztcbiAgICAgICAgLy8gU2V0IHRoZSBwcm90b3R5cGUgZXhwbGljaXRseS5cbiAgICAgICAgT2JqZWN0LnNldFByb3RvdHlwZU9mKHRoaXMsIEZvcmJpZGRlbkVycm9yLnByb3RvdHlwZSk7XG4gICAgfVxufVxuZXhwb3J0cy5kZWZhdWx0ID0gRm9yYmlkZGVuRXJyb3I7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNsYXNzIE5vdEZvdW5kRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gICAgY29uc3RydWN0b3IobWVzc2FnZSwgbWV0YURhdGEpIHtcbiAgICAgICAgc3VwZXIobWVzc2FnZSk7XG4gICAgICAgIHRoaXMubmFtZSA9ICdOb3RGb3VuZEVycm9yJztcbiAgICAgICAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbiAgICAgICAgdGhpcy5tZXRhRGF0YSA9IG1ldGFEYXRhO1xuICAgICAgICB0aGlzLnN0YXR1cyA9IDQwNDtcbiAgICAgICAgLy8gU2V0IHRoZSBwcm90b3R5cGUgZXhwbGljaXRseS5cbiAgICAgICAgT2JqZWN0LnNldFByb3RvdHlwZU9mKHRoaXMsIE5vdEZvdW5kRXJyb3IucHJvdG90eXBlKTtcbiAgICB9XG59XG5leHBvcnRzLmRlZmF1bHQgPSBOb3RGb3VuZEVycm9yO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jbGFzcyBTZXJ2ZXJFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgICBjb25zdHJ1Y3RvcihtZXNzYWdlLCBtZXRhRGF0YSkge1xuICAgICAgICBzdXBlcihtZXNzYWdlKTtcbiAgICAgICAgdGhpcy5uYW1lID0gJ1NlcnZlckVycm9yJztcbiAgICAgICAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbiAgICAgICAgdGhpcy5tZXRhRGF0YSA9IG1ldGFEYXRhO1xuICAgICAgICB0aGlzLnN0YXR1cyA9IDUwMDtcbiAgICAgICAgLy8gU2V0IHRoZSBwcm90b3R5cGUgZXhwbGljaXRseS5cbiAgICAgICAgT2JqZWN0LnNldFByb3RvdHlwZU9mKHRoaXMsIFNlcnZlckVycm9yLnByb3RvdHlwZSk7XG4gICAgfVxufVxuZXhwb3J0cy5kZWZhdWx0ID0gU2VydmVyRXJyb3I7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNsYXNzIFVuYXV0aG9yaXplZEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICAgIGNvbnN0cnVjdG9yKG1lc3NhZ2UsIG1ldGFEYXRhKSB7XG4gICAgICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgICAgICB0aGlzLm5hbWUgPSAnVW5hdXRob3JpemVkRXJyb3InO1xuICAgICAgICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xuICAgICAgICB0aGlzLm1ldGFEYXRhID0gbWV0YURhdGE7XG4gICAgICAgIHRoaXMuc3RhdHVzID0gNDAxO1xuICAgICAgICAvLyBTZXQgdGhlIHByb3RvdHlwZSBleHBsaWNpdGx5LlxuICAgICAgICBPYmplY3Quc2V0UHJvdG90eXBlT2YodGhpcywgVW5hdXRob3JpemVkRXJyb3IucHJvdG90eXBlKTtcbiAgICB9XG59XG5leHBvcnRzLmRlZmF1bHQgPSBVbmF1dGhvcml6ZWRFcnJvcjtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9faW1wb3J0RGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnREZWZhdWx0KSB8fCBmdW5jdGlvbiAobW9kKSB7XG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBcImRlZmF1bHRcIjogbW9kIH07XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgQmFkUmVxdWVzdEVycm9yXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4vQmFkUmVxdWVzdEVycm9yXCIpKTtcbmV4cG9ydHMuQmFkUmVxdWVzdEVycm9yID0gQmFkUmVxdWVzdEVycm9yXzEuZGVmYXVsdDtcbmNvbnN0IEZvcmJpZGRlbkVycm9yXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4vRm9yYmlkZGVuRXJyb3JcIikpO1xuZXhwb3J0cy5Gb3JiaWRkZW5FcnJvciA9IEZvcmJpZGRlbkVycm9yXzEuZGVmYXVsdDtcbmNvbnN0IE5vdEZvdW5kRXJyb3JfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi9Ob3RGb3VuZEVycm9yXCIpKTtcbmV4cG9ydHMuTm90Rm91bmRFcnJvciA9IE5vdEZvdW5kRXJyb3JfMS5kZWZhdWx0O1xuY29uc3QgU2VydmVyRXJyb3JfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi9TZXJ2ZXJFcnJvclwiKSk7XG5leHBvcnRzLlNlcnZlckVycm9yID0gU2VydmVyRXJyb3JfMS5kZWZhdWx0O1xuY29uc3QgVW5hdXRob3JpemVkRXJyb3JfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi9VbmF1dGhvcml6ZWRFcnJvclwiKSk7XG5leHBvcnRzLlVuYXV0aG9yaXplZEVycm9yID0gVW5hdXRob3JpemVkRXJyb3JfMS5kZWZhdWx0O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19yZXN0ID0gKHRoaXMgJiYgdGhpcy5fX3Jlc3QpIHx8IGZ1bmN0aW9uIChzLCBlKSB7XG4gICAgdmFyIHQgPSB7fTtcbiAgICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkgJiYgZS5pbmRleE9mKHApIDwgMClcbiAgICAgICAgdFtwXSA9IHNbcF07XG4gICAgaWYgKHMgIT0gbnVsbCAmJiB0eXBlb2YgT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyA9PT0gXCJmdW5jdGlvblwiKVxuICAgICAgICBmb3IgKHZhciBpID0gMCwgcCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMocyk7IGkgPCBwLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoZS5pbmRleE9mKHBbaV0pIDwgMCAmJiBPYmplY3QucHJvdG90eXBlLnByb3BlcnR5SXNFbnVtZXJhYmxlLmNhbGwocywgcFtpXSkpXG4gICAgICAgICAgICAgICAgdFtwW2ldXSA9IHNbcFtpXV07XG4gICAgICAgIH1cbiAgICByZXR1cm4gdDtcbn07XG5mdW5jdGlvbiBfX2V4cG9ydChtKSB7XG4gICAgZm9yICh2YXIgcCBpbiBtKSBpZiAoIWV4cG9ydHMuaGFzT3duUHJvcGVydHkocCkpIGV4cG9ydHNbcF0gPSBtW3BdO1xufVxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xucmVxdWlyZShcIndpbnN0b24tZGFpbHktcm90YXRlLWZpbGVcIik7XG5jb25zdCBsb2dnZXJzXzEgPSByZXF1aXJlKFwiLi9sb2dnZXJzXCIpO1xuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGltcG9ydC9uby1tdXRhYmxlLWV4cG9ydHNcbmxldCBsb2dnZXI7XG5leHBvcnRzLmxvZ2dlciA9IGxvZ2dlcjtcbmV4cG9ydHMuY29uZmlndXJlTG9nZ2VyID0gKGNvbmZpZykgPT4ge1xuICAgIGNvbnN0IHsgbG9nZ2VycyB9ID0gY29uZmlnLCBsb2dnZXJDb25maWcgPSBfX3Jlc3QoY29uZmlnLCBbXCJsb2dnZXJzXCJdKTtcbiAgICBleHBvcnRzLmxvZ2dlciA9IGxvZ2dlciA9IE9iamVjdC5hc3NpZ24oeyBhdXRoOiBsb2dnZXJzXzEuYXV0aExvZ2dlcihsb2dnZXJDb25maWcpLCBodHRwOiBsb2dnZXJzXzEuaHR0cExvZ2dlcihsb2dnZXJDb25maWcpLCBzZXJ2ZXI6IGxvZ2dlcnNfMS5zZXJ2ZXJMb2dnZXIobG9nZ2VyQ29uZmlnKSwgc3FsOiBsb2dnZXJzXzEuc3FsTG9nZ2VyKGxvZ2dlckNvbmZpZykgfSwgbG9nZ2Vycyk7XG4gICAgcmV0dXJuIGxvZ2dlcjtcbn07XG5fX2V4cG9ydChyZXF1aXJlKFwiLi9taWRkbGV3YXJlc1wiKSk7XG5fX2V4cG9ydChyZXF1aXJlKFwiLi9lcnJvckhhbmRsZXJzXCIpKTtcbi8vIFRPRE8gVGVzdHMgcmV1aXJlZFxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19pbXBvcnREZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydERlZmF1bHQpIHx8IGZ1bmN0aW9uIChtb2QpIHtcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IFwiZGVmYXVsdFwiOiBtb2QgfTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCB3aW5zdG9uXzEgPSByZXF1aXJlKFwid2luc3RvblwiKTtcbnJlcXVpcmUoXCJ3aW5zdG9uLWRhaWx5LXJvdGF0ZS1maWxlXCIpO1xuY29uc3QgbG9nRm9ybWF0dGVyXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4uL3V0aWxzL2xvZ0Zvcm1hdHRlclwiKSk7XG5leHBvcnRzLmRlZmF1bHQgPSAoY29uZmlnKSA9PiB7XG4gICAgY29uc3QgeyBsb2dQYXRoIH0gPSBjb25maWc7XG4gICAgcmV0dXJuIHdpbnN0b25fMS5jcmVhdGVMb2dnZXIoe1xuICAgICAgICBsZXZlbDogJ2luZm8nLFxuICAgICAgICBmb3JtYXQ6IGxvZ0Zvcm1hdHRlcl8xLmRlZmF1bHQsXG4gICAgICAgIHRyYW5zcG9ydHM6IFtcbiAgICAgICAgICAgIG5ldyB3aW5zdG9uXzEudHJhbnNwb3J0cy5EYWlseVJvdGF0ZUZpbGUoe1xuICAgICAgICAgICAgICAgIGZpbGVuYW1lOiBgJHtsb2dQYXRofS8lREFURSUtYXV0aC5sb2dgLFxuICAgICAgICAgICAgICAgIGxldmVsOiAnaW5mbycsXG4gICAgICAgICAgICAgICAgZGF0ZVBhdHRlcm46ICdZWVlZLU1NLUREJyxcbiAgICAgICAgICAgICAgICB6aXBwZWRBcmNoaXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgIG1heFNpemU6ICcyMG0nLFxuICAgICAgICAgICAgICAgIG1heEZpbGVzOiAnMTRkJyxcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgbmV3IHdpbnN0b25fMS50cmFuc3BvcnRzLkRhaWx5Um90YXRlRmlsZSh7XG4gICAgICAgICAgICAgICAgZmlsZW5hbWU6IGAke2xvZ1BhdGh9LyVEQVRFJS1kZWJ1Zy5sb2dgLFxuICAgICAgICAgICAgICAgIGxldmVsOiAnZGVidWcnLFxuICAgICAgICAgICAgICAgIGRhdGVQYXR0ZXJuOiAnWVlZWS1NTS1ERCcsXG4gICAgICAgICAgICAgICAgemlwcGVkQXJjaGl2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBtYXhTaXplOiAnMjBtJyxcbiAgICAgICAgICAgICAgICBtYXhGaWxlczogJzE0ZCcsXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgXSxcbiAgICB9KTtcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2ltcG9ydERlZmF1bHQgPSAodGhpcyAmJiB0aGlzLl9faW1wb3J0RGVmYXVsdCkgfHwgZnVuY3Rpb24gKG1vZCkge1xuICAgIHJldHVybiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSA/IG1vZCA6IHsgXCJkZWZhdWx0XCI6IG1vZCB9O1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IHdpbnN0b25fMSA9IHJlcXVpcmUoXCJ3aW5zdG9uXCIpO1xucmVxdWlyZShcIndpbnN0b24tZGFpbHktcm90YXRlLWZpbGVcIik7XG5jb25zdCBsb2dGb3JtYXR0ZXJfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi4vdXRpbHMvbG9nRm9ybWF0dGVyXCIpKTtcbmV4cG9ydHMuZGVmYXVsdCA9IChjb25maWcpID0+IHtcbiAgICBjb25zdCB7IGxvZ1BhdGggfSA9IGNvbmZpZztcbiAgICByZXR1cm4gd2luc3Rvbl8xLmNyZWF0ZUxvZ2dlcih7XG4gICAgICAgIGxldmVsOiAnaW5mbycsXG4gICAgICAgIGZvcm1hdDogbG9nRm9ybWF0dGVyXzEuZGVmYXVsdCxcbiAgICAgICAgdHJhbnNwb3J0czogW1xuICAgICAgICAgICAgbmV3IHdpbnN0b25fMS50cmFuc3BvcnRzLkRhaWx5Um90YXRlRmlsZSh7XG4gICAgICAgICAgICAgICAgZmlsZW5hbWU6IGAke2xvZ1BhdGh9LyVEQVRFJS1odHRwLmxvZ2AsXG4gICAgICAgICAgICAgICAgbGV2ZWw6ICdpbmZvJyxcbiAgICAgICAgICAgICAgICBkYXRlUGF0dGVybjogJ1lZWVktTU0tREQnLFxuICAgICAgICAgICAgICAgIHppcHBlZEFyY2hpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgbWF4U2l6ZTogJzIwbScsXG4gICAgICAgICAgICAgICAgbWF4RmlsZXM6ICcxNGQnLFxuICAgICAgICAgICAgfSksXG4gICAgICAgIF0sXG4gICAgfSk7XG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19pbXBvcnREZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydERlZmF1bHQpIHx8IGZ1bmN0aW9uIChtb2QpIHtcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IFwiZGVmYXVsdFwiOiBtb2QgfTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBhdXRoXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4vYXV0aFwiKSk7XG5leHBvcnRzLmF1dGhMb2dnZXIgPSBhdXRoXzEuZGVmYXVsdDtcbmNvbnN0IGh0dHBfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi9odHRwXCIpKTtcbmV4cG9ydHMuaHR0cExvZ2dlciA9IGh0dHBfMS5kZWZhdWx0O1xuY29uc3Qgc2VydmVyXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4vc2VydmVyXCIpKTtcbmV4cG9ydHMuc2VydmVyTG9nZ2VyID0gc2VydmVyXzEuZGVmYXVsdDtcbmNvbnN0IHNxbF8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCIuL3NxbFwiKSk7XG5leHBvcnRzLnNxbExvZ2dlciA9IHNxbF8xLmRlZmF1bHQ7XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2ltcG9ydERlZmF1bHQgPSAodGhpcyAmJiB0aGlzLl9faW1wb3J0RGVmYXVsdCkgfHwgZnVuY3Rpb24gKG1vZCkge1xuICAgIHJldHVybiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSA/IG1vZCA6IHsgXCJkZWZhdWx0XCI6IG1vZCB9O1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IHdpbnN0b25fMSA9IHJlcXVpcmUoXCJ3aW5zdG9uXCIpO1xucmVxdWlyZShcIndpbnN0b24tZGFpbHktcm90YXRlLWZpbGVcIik7XG5jb25zdCBsb2dGb3JtYXR0ZXJfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi4vdXRpbHMvbG9nRm9ybWF0dGVyXCIpKTtcbmV4cG9ydHMuZGVmYXVsdCA9IChjb25maWcpID0+IHtcbiAgICBjb25zdCB7IGxvZ1BhdGggfSA9IGNvbmZpZztcbiAgICByZXR1cm4gd2luc3Rvbl8xLmNyZWF0ZUxvZ2dlcih7XG4gICAgICAgIGxldmVsOiAnZGVidWcnLFxuICAgICAgICBmb3JtYXQ6IGxvZ0Zvcm1hdHRlcl8xLmRlZmF1bHQsXG4gICAgICAgIHRyYW5zcG9ydHM6IFtcbiAgICAgICAgICAgIG5ldyB3aW5zdG9uXzEudHJhbnNwb3J0cy5EYWlseVJvdGF0ZUZpbGUoe1xuICAgICAgICAgICAgICAgIGZpbGVuYW1lOiBgJHtsb2dQYXRofS8lREFURSUtZXJyb3JzLmxvZ2AsXG4gICAgICAgICAgICAgICAgbGV2ZWw6ICdlcnJvcicsXG4gICAgICAgICAgICAgICAgZGF0ZVBhdHRlcm46ICdZWVlZLU1NLUREJyxcbiAgICAgICAgICAgICAgICB6aXBwZWRBcmNoaXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgIG1heFNpemU6ICcyMG0nLFxuICAgICAgICAgICAgICAgIG1heEZpbGVzOiAnMTRkJyxcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgbmV3IHdpbnN0b25fMS50cmFuc3BvcnRzLkRhaWx5Um90YXRlRmlsZSh7XG4gICAgICAgICAgICAgICAgZmlsZW5hbWU6IGAke2xvZ1BhdGh9LyVEQVRFJS1kZWJ1Zy5sb2dgLFxuICAgICAgICAgICAgICAgIGxldmVsOiAnZGVidWcnLFxuICAgICAgICAgICAgICAgIGRhdGVQYXR0ZXJuOiAnWVlZWS1NTS1ERCcsXG4gICAgICAgICAgICAgICAgemlwcGVkQXJjaGl2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBtYXhTaXplOiAnMjBtJyxcbiAgICAgICAgICAgICAgICBtYXhGaWxlczogJzE0ZCcsXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgXSxcbiAgICB9KTtcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2ltcG9ydERlZmF1bHQgPSAodGhpcyAmJiB0aGlzLl9faW1wb3J0RGVmYXVsdCkgfHwgZnVuY3Rpb24gKG1vZCkge1xuICAgIHJldHVybiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSA/IG1vZCA6IHsgXCJkZWZhdWx0XCI6IG1vZCB9O1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IHdpbnN0b25fMSA9IHJlcXVpcmUoXCJ3aW5zdG9uXCIpO1xucmVxdWlyZShcIndpbnN0b24tZGFpbHktcm90YXRlLWZpbGVcIik7XG5jb25zdCBsb2dGb3JtYXR0ZXJfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi4vdXRpbHMvbG9nRm9ybWF0dGVyXCIpKTtcbmV4cG9ydHMuZGVmYXVsdCA9IChjb25maWcpID0+IHtcbiAgICBjb25zdCB7IGxvZ1BhdGggfSA9IGNvbmZpZztcbiAgICByZXR1cm4gd2luc3Rvbl8xLmNyZWF0ZUxvZ2dlcih7XG4gICAgICAgIGxldmVsOiAnZGVidWcnLFxuICAgICAgICBmb3JtYXQ6IGxvZ0Zvcm1hdHRlcl8xLmRlZmF1bHQsXG4gICAgICAgIHRyYW5zcG9ydHM6IFtcbiAgICAgICAgICAgIG5ldyB3aW5zdG9uXzEudHJhbnNwb3J0cy5EYWlseVJvdGF0ZUZpbGUoe1xuICAgICAgICAgICAgICAgIGZpbGVuYW1lOiBgJHtsb2dQYXRofS8lREFURSUtc3FsLmxvZ2AsXG4gICAgICAgICAgICAgICAgbGV2ZWw6ICdkZWJ1ZycsXG4gICAgICAgICAgICAgICAgZGF0ZVBhdHRlcm46ICdZWVlZLU1NLUREJyxcbiAgICAgICAgICAgICAgICB6aXBwZWRBcmNoaXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgIG1heFNpemU6ICcyMG0nLFxuICAgICAgICAgICAgICAgIG1heEZpbGVzOiAnMTRkJyxcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgbmV3IHdpbnN0b25fMS50cmFuc3BvcnRzLkNvbnNvbGUoe1xuICAgICAgICAgICAgICAgIGxldmVsOiAnZXJyb3InLFxuICAgICAgICAgICAgfSksXG4gICAgICAgIF0sXG4gICAgfSk7XG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19pbXBvcnREZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydERlZmF1bHQpIHx8IGZ1bmN0aW9uIChtb2QpIHtcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IFwiZGVmYXVsdFwiOiBtb2QgfTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBjaGFsa18xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCJjaGFsa1wiKSk7XG5jb25zdCByZXNwb25zZUZvcm1hdHRlcl8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCJ+L2xvZ2dlci91dGlscy9yZXNwb25zZUZvcm1hdHRlclwiKSk7XG5leHBvcnRzLmRlZmF1bHQgPSAoY29uZmlnKSA9PiB7XG4gICAgY29uc3QgeyBjb250ZXh0IH0gPSBjb25maWc7XG4gICAgY29uc3QgeyBsb2dnZXIgfSA9IGNvbnRleHQ7XG4gICAgcmV0dXJuIFtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyc1xuICAgICAgICAoZXJyLCByZXEsIHJlcywgbmV4dCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgeyBzdGF0dXMsIHN0YWNrLCBuYW1lLCBtZXNzYWdlLCBtZXRhRGF0YSB9ID0gZXJyO1xuICAgICAgICAgICAgY29uc3QgeyBvcmlnaW5hbFVybCB9ID0gcmVxO1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gbWVzc2FnZSA/IGAke3N0YXR1cyB8fCAnJ30gJHttZXNzYWdlfWAgOiAnVW5rbm93biBlcnJvcic7XG4gICAgICAgICAgICBzd2l0Y2ggKHN0YXR1cykge1xuICAgICAgICAgICAgICAgIGNhc2UgNDAxOlxuICAgICAgICAgICAgICAgICAgICBsb2dnZXIuYXV0aC5lcnJvcihlcnJvck1lc3NhZ2UsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9yaWdpbmFsVXJsLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhY2ssXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXRhRGF0YSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgNTAwOlxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIGxvZ2dlci5zZXJ2ZXIuZXJyb3IoZXJyb3JNZXNzYWdlLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvcmlnaW5hbFVybCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YWNrLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWV0YURhdGEsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ2RldmVsb3BtZW50Jykge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCcnKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtjaGFsa18xLmRlZmF1bHQuYmdSZWQud2hpdGUoZXJyb3JNZXNzYWdlKX0gJHtjaGFsa18xLmRlZmF1bHQucmVkKG5hbWUpfWApO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKG1lc3NhZ2UsIG1ldGFEYXRhKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXMuc3RhdHVzKHN0YXR1cyB8fCA1MDApLmpzb24ocmVzcG9uc2VGb3JtYXR0ZXJfMS5kZWZhdWx0KHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBtZXNzYWdlIHx8ICdQbGVhc2UgY29udGFjdCBzeXN0ZW0gYWRtaW5pc3RyYXRvcicsXG4gICAgICAgICAgICAgICAgbmFtZTogbmFtZSB8fCAnSW50ZXJuYWwgc2VydmVyIGVycm9yJyxcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfSxcbiAgICAgICAgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgICAgICByZXMuc3RhdHVzKDQwNCkuZW5kKCk7XG4gICAgICAgIH0sXG4gICAgICAgIChyZXEsIHJlcykgPT4ge1xuICAgICAgICAgICAgcmVzLnN0YXR1cyg1MDMpLmVuZCgpO1xuICAgICAgICB9LFxuICAgICAgICAocmVxLCByZXMpID0+IHtcbiAgICAgICAgICAgIHJlcy5zdGF0dXMoNDAwKS5lbmQoKTtcbiAgICAgICAgfSxcbiAgICBdO1xufTtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9faW1wb3J0RGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnREZWZhdWx0KSB8fCBmdW5jdGlvbiAobW9kKSB7XG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBcImRlZmF1bHRcIjogbW9kIH07XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgZXJyb3JIYW5kbGVyXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4vZXJyb3JIYW5kbGVyXCIpKTtcbmV4cG9ydHMuZXJyb3JIYW5kbGVyTWlkZGxld2FyZSA9IGVycm9ySGFuZGxlcl8xLmRlZmF1bHQ7XG5jb25zdCByZXF1ZXN0SGFuZGxlcl8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCIuL3JlcXVlc3RIYW5kbGVyXCIpKTtcbmV4cG9ydHMucmVxdWVzdEhhbmRsZXJNaWRkbGV3YXJlID0gcmVxdWVzdEhhbmRsZXJfMS5kZWZhdWx0O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLmRlZmF1bHQgPSAoY29uZmlnKSA9PiB7XG4gICAgY29uc3QgeyBjb250ZXh0IH0gPSBjb25maWc7XG4gICAgY29uc3QgeyBsb2dnZXIgfSA9IGNvbnRleHQ7XG4gICAgcmV0dXJuIChyZXEsIHJlcywgbmV4dCkgPT4ge1xuICAgICAgICBjb25zdCB7IG1ldGhvZCwgb3JpZ2luYWxVcmwsIGhlYWRlcnMgfSA9IHJlcTtcbiAgICAgICAgY29uc3QgeEZvcndhcmRlZEZvciA9IFN0cmluZyhyZXEuaGVhZGVyc1sneC1mb3J3YXJkZWQtZm9yJ10gfHwgJycpLnJlcGxhY2UoLzpcXGQrJC8sICcnKTtcbiAgICAgICAgY29uc3QgaXAgPSB4Rm9yd2FyZGVkRm9yIHx8IHJlcS5jb25uZWN0aW9uLnJlbW90ZUFkZHJlc3M7XG4gICAgICAgIGNvbnN0IGlwQWRkcmVzcyA9IGlwID09PSAnMTI3LjAuMC4xJyB8fCBpcCA9PT0gJzo6MScgPyAnbG9jYWxob3N0JyA6IGlwO1xuICAgICAgICBsb2dnZXIuaHR0cC5pbmZvKGAke2lwQWRkcmVzc30gJHttZXRob2R9IFwiJHtvcmlnaW5hbFVybH1cImAsIHsgaGVhZGVycyB9KTtcbiAgICAgICAgcmV0dXJuIG5leHQoKTtcbiAgICB9O1xufTtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3Qgd2luc3Rvbl8xID0gcmVxdWlyZShcIndpbnN0b25cIik7XG5leHBvcnRzLmRlZmF1bHQgPSB3aW5zdG9uXzEuZm9ybWF0LmNvbWJpbmUod2luc3Rvbl8xLmZvcm1hdC5tZXRhZGF0YSgpLCB3aW5zdG9uXzEuZm9ybWF0Lmpzb24oKSwgd2luc3Rvbl8xLmZvcm1hdC50aW1lc3RhbXAoeyBmb3JtYXQ6ICdZWVlZLU1NLUREVEhIOm1tOnNzWlonIH0pLCB3aW5zdG9uXzEuZm9ybWF0LnNwbGF0KCksIHdpbnN0b25fMS5mb3JtYXQucHJpbnRmKGluZm8gPT4ge1xuICAgIGNvbnN0IHsgdGltZXN0YW1wLCBsZXZlbCwgbWVzc2FnZSwgbWV0YWRhdGEgfSA9IGluZm87XG4gICAgY29uc3QgbWV0YSA9IEpTT04uc3RyaW5naWZ5KG1ldGFkYXRhKSAhPT0gJ3t9JyA/IG1ldGFkYXRhIDogbnVsbDtcbiAgICByZXR1cm4gYCR7dGltZXN0YW1wfSAke2xldmVsfTogJHttZXNzYWdlfSAke21ldGEgPyBKU09OLnN0cmluZ2lmeShtZXRhKSA6ICcnfWA7XG59KSk7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuZGVmYXVsdCA9IChwcm9wcykgPT4ge1xuICAgIGNvbnN0IHsgbmFtZSwgbWVzc2FnZSB9ID0gcHJvcHM7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgZXJyb3JzOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbmFtZTogbmFtZSB8fCAnVW5rbm93biBFcnJvcicsXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogbWVzc2FnZSB8fCBuYW1lIHx8ICdVbmtub3duIEVycm9yJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgfTtcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2ltcG9ydERlZmF1bHQgPSAodGhpcyAmJiB0aGlzLl9faW1wb3J0RGVmYXVsdCkgfHwgZnVuY3Rpb24gKG1vZCkge1xuICAgIHJldHVybiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSA/IG1vZCA6IHsgXCJkZWZhdWx0XCI6IG1vZCB9O1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IHBhdGhfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwicGF0aFwiKSk7XG5jb25zdCBpbmRleF8xID0gcmVxdWlyZShcIn4vaW5kZXhcIik7XG4vLyBpbXBvcnQgeyBjb25maWd1cmVDYXRhbG9nTG9nZ2VyIH0gZnJvbSAnfi9wbGF5Z3JvdW5kL3NjaGVtYXMvY2F0YWxvZyc7XG5jb25zdCBzaW1wbGVfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwifi9wbGF5Z3JvdW5kL3NjaGVtYXMvc2ltcGxlXCIpKTtcbi8vIGNvbnN0IGNhdGFsb2dMb2dnZXIgPSBjb25maWd1cmVDYXRhbG9nTG9nZ2VyKHtcbi8vICAgbG9nUGF0aDogJ2xvZycsXG4vLyB9KTtcbmNvbnN0IGxvZ2dlciA9IGluZGV4XzEuY29uZmlndXJlTG9nZ2VyKHtcbiAgICBsb2dQYXRoOiAnbG9nJyxcbn0pO1xuZXhwb3J0cy5sb2dnZXIgPSBsb2dnZXI7XG5jb25zdCBkYXRhYmFzZUNvbmZpZyA9IHtcbiAgICBjbGllbnQ6ICdwZycsXG4gICAgY29ubmVjdGlvbjoge1xuICAgICAgICBkYXRhYmFzZTogJ3NlcnZpY2VzJyxcbiAgICAgICAgaG9zdDogJ2UxZy5ydScsXG4gICAgICAgIHBhc3N3b3JkOiAnbm9ucHJvZml0cHJvamVjdCcsXG4gICAgICAgIHVzZXI6ICdzZXJ2aWNlcycsXG4gICAgfSxcbn07XG5leHBvcnRzLmRhdGFiYXNlQ29uZmlnID0gZGF0YWJhc2VDb25maWc7XG5jb25zdCBqd3RDb25maWcgPSB7XG4gICAgYWNjZXNzVG9rZW5FeHBpcmVzSW46IDE4MDAsXG4gICAgYWxnb3JpdGhtOiAnUlMyNTYnLFxuICAgIGlzc3VlcjogJ3ZpYXByb2ZpdC1zZXJ2aWNlcycsXG4gICAgcHJpdmF0ZUtleTogcGF0aF8xLmRlZmF1bHQucmVzb2x2ZShfX2Rpcm5hbWUsICcuL2NlcnQvand0UlMyNTYua2V5JyksXG4gICAgcHVibGljS2V5OiBwYXRoXzEuZGVmYXVsdC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vY2VydC9qd3RSUzI1Ni5rZXkucHViJyksXG4gICAgcmVmcmVzaFRva2VuRXhwaXJlc0luOiAyLjU5MmU2LFxufTtcbmV4cG9ydHMuand0Q29uZmlnID0gand0Q29uZmlnO1xuY29uc3Qgc2VydmVyQ29uZmlnID0ge1xuICAgIGRhdGFiYXNlOiBkYXRhYmFzZUNvbmZpZyxcbiAgICBlbmRwb2ludDogJy9hcGkvZ3JhcGhxbCcsXG4gICAgc3Vic2NyaXB0aW9uc0VuZHBvaW50OiAnL2FwaS9zdWJzY3JpcHRpb25zJyxcbiAgICBqd3Q6IGp3dENvbmZpZyxcbiAgICBsb2dnZXIsXG4gICAgcG9ydDogNDAwMCxcbiAgICBzY2hlbWFzOiBbc2ltcGxlXzEuZGVmYXVsdF0sXG59O1xuZXhwb3J0cy5zZXJ2ZXJDb25maWcgPSBzZXJ2ZXJDb25maWc7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IGluZGV4XzEgPSByZXF1aXJlKFwifi9pbmRleFwiKTtcbmNvbnN0IGNvbmZpZ3VyZUFwcF8xID0gcmVxdWlyZShcIn4vcGxheWdyb3VuZC9jb25maWd1cmVBcHBcIik7XG5pbmRleF8xLkNvcmUuaW5pdChPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oe30sIGNvbmZpZ3VyZUFwcF8xLnNlcnZlckNvbmZpZyksIHsgcG9ydDogNDAwMCB9KSk7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IGdyYXBocWxfMSA9IHJlcXVpcmUoXCJncmFwaHFsXCIpO1xuY29uc3QgUG9zdCA9IG5ldyBncmFwaHFsXzEuR3JhcGhRTE9iamVjdFR5cGUoe1xuICAgIG5hbWU6ICdQb3N0JyxcbiAgICBkZXNjcmlwdGlvbjogJ0N1cnJlbnQgUG9zdCBkYXRhJyxcbiAgICBmaWVsZHM6ICgpID0+ICh7XG4gICAgICAgIHRpdGxlOiB7XG4gICAgICAgICAgICB0eXBlOiBuZXcgZ3JhcGhxbF8xLkdyYXBoUUxOb25OdWxsKGdyYXBocWxfMS5HcmFwaFFMU3RyaW5nKSxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnUG9zdCBUaXRsZScsXG4gICAgICAgIH0sXG4gICAgICAgIHVybDoge1xuICAgICAgICAgICAgdHlwZTogbmV3IGdyYXBocWxfMS5HcmFwaFFMTm9uTnVsbChncmFwaHFsXzEuR3JhcGhRTFN0cmluZyksXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1VSTCBhZGRyZXNzJyxcbiAgICAgICAgfSxcbiAgICB9KSxcbn0pO1xuY29uc3Qgc2NoZW1hID0gbmV3IGdyYXBocWxfMS5HcmFwaFFMU2NoZW1hKHtcbiAgICBxdWVyeTogbmV3IGdyYXBocWxfMS5HcmFwaFFMT2JqZWN0VHlwZSh7XG4gICAgICAgIG5hbWU6ICdRdWVyeScsXG4gICAgICAgIGZpZWxkczogKCkgPT4gKHtcbiAgICAgICAgICAgIHBvc3Q6IHtcbiAgICAgICAgICAgICAgICB0eXBlOiBuZXcgZ3JhcGhxbF8xLkdyYXBoUUxOb25OdWxsKFBvc3QpLFxuICAgICAgICAgICAgICAgIHJlc29sdmU6ICgpID0+ICh7XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiAnTG9yZW0gaXBzdW0nLFxuICAgICAgICAgICAgICAgICAgICB1cmw6ICdocHB0czovL2dvb2dsZS5jb20nLFxuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSksXG4gICAgfSksXG4gICAgbXV0YXRpb246IG5ldyBncmFwaHFsXzEuR3JhcGhRTE9iamVjdFR5cGUoe1xuICAgICAgICBuYW1lOiAnTXV0YXRpb24nLFxuICAgICAgICBmaWVsZHM6ICgpID0+ICh7XG4gICAgICAgICAgICBzZXRBbnk6IHtcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1NldCBhbnkgdmFsdWUgZm9yIHRlc3QgbXV0YXRpb24nLFxuICAgICAgICAgICAgICAgIGFyZ3M6IHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogbmV3IGdyYXBocWxfMS5HcmFwaFFMTm9uTnVsbChncmFwaHFsXzEuR3JhcGhRTFN0cmluZyksXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0FueSB2YWx1ZSBzdHJpbmcnLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcmVzb2x2ZTogKCkgPT4gdHJ1ZSxcbiAgICAgICAgICAgICAgICB0eXBlOiBuZXcgZ3JhcGhxbF8xLkdyYXBoUUxOb25OdWxsKGdyYXBocWxfMS5HcmFwaFFMQm9vbGVhbiksXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KSxcbiAgICB9KSxcbn0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gc2NoZW1hO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19pbXBvcnREZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydERlZmF1bHQpIHx8IGZ1bmN0aW9uIChtb2QpIHtcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IFwiZGVmYXVsdFwiOiBtb2QgfTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBpbmZvXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4vaW5mb1wiKSk7XG5leHBvcnRzLmluZm9TY2hlbWEgPSBpbmZvXzEuZGVmYXVsdDtcbmV4cG9ydHMuZGVmYXVsdCA9IGluZm9fMS5kZWZhdWx0O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19pbXBvcnREZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydERlZmF1bHQpIHx8IGZ1bmN0aW9uIChtb2QpIHtcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IFwiZGVmYXVsdFwiOiBtb2QgfTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBmc18xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCJmc1wiKSk7XG5jb25zdCBwYXRoXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcInBhdGhcIikpO1xuY29uc3QgZ3JhcGhxbF8xID0gcmVxdWlyZShcImdyYXBocWxcIik7XG5jb25zdCBwYWNrYWdlSnNvbiA9IGZzXzEuZGVmYXVsdC5yZWFkRmlsZVN5bmMocGF0aF8xLmRlZmF1bHQucmVzb2x2ZShfX2Rpcm5hbWUsICcuLicsICcuLicsICcuLicsICdwYWNrYWdlLmpzb24nKSwgJ3V0ZjgnKTtcbmNvbnN0IHBhY2thZ2VJbmZvID0gSlNPTi5wYXJzZShwYWNrYWdlSnNvbik7XG5jb25zdCBEZXZJbmZvID0gbmV3IGdyYXBocWxfMS5HcmFwaFFMT2JqZWN0VHlwZSh7XG4gICAgbmFtZTogJ0RldkluZm8nLFxuICAgIGZpZWxkczogKCkgPT4gKHtcbiAgICAgICAgbmFtZToge1xuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdBcHBsaWNhdGlvbiBuYW1lJyxcbiAgICAgICAgICAgIHJlc29sdmU6ICgpID0+IHBhY2thZ2VJbmZvLm5hbWUsXG4gICAgICAgICAgICB0eXBlOiBuZXcgZ3JhcGhxbF8xLkdyYXBoUUxOb25OdWxsKGdyYXBocWxfMS5HcmFwaFFMU3RyaW5nKSxcbiAgICAgICAgfSxcbiAgICAgICAgZGVzY3JpcHRpb246IHtcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnQXBwbGljYXRpb24gZGVzY3JpcHRpb24nLFxuICAgICAgICAgICAgcmVzb2x2ZTogKCkgPT4gcGFja2FnZUluZm8uZGVzY3JpcHRpb24sXG4gICAgICAgICAgICB0eXBlOiBuZXcgZ3JhcGhxbF8xLkdyYXBoUUxOb25OdWxsKGdyYXBocWxfMS5HcmFwaFFMU3RyaW5nKSxcbiAgICAgICAgfSxcbiAgICAgICAgdmVyc2lvbjoge1xuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdBcHBsaWNhdGlvbiB2ZXJzaW9uIG51bWJlcicsXG4gICAgICAgICAgICByZXNvbHZlOiAoKSA9PiBwYWNrYWdlSW5mby52ZXJzaW9uLFxuICAgICAgICAgICAgdHlwZTogbmV3IGdyYXBocWxfMS5HcmFwaFFMTm9uTnVsbChncmFwaHFsXzEuR3JhcGhRTFN0cmluZyksXG4gICAgICAgIH0sXG4gICAgICAgIGF1dGhvcjoge1xuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdBcHBsaWNhdGlvbiBhdXRob3InLFxuICAgICAgICAgICAgcmVzb2x2ZTogKCkgPT4gcGFja2FnZUluZm8uYXV0aG9yLFxuICAgICAgICAgICAgdHlwZTogbmV3IGdyYXBocWxfMS5HcmFwaFFMTm9uTnVsbChncmFwaHFsXzEuR3JhcGhRTFN0cmluZyksXG4gICAgICAgIH0sXG4gICAgICAgIHN1cHBvcnQ6IHtcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnQXBwbGljYXRpb24gc3VwcG9ydCcsXG4gICAgICAgICAgICByZXNvbHZlOiAoKSA9PiBwYWNrYWdlSW5mby5zdXBwb3J0LFxuICAgICAgICAgICAgdHlwZTogbmV3IGdyYXBocWxfMS5HcmFwaFFMTm9uTnVsbChncmFwaHFsXzEuR3JhcGhRTFN0cmluZyksXG4gICAgICAgIH0sXG4gICAgICAgIGxpY2Vuc2U6IHtcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnQXBwbGljYXRpb24gbGljZW5zZScsXG4gICAgICAgICAgICByZXNvbHZlOiAoKSA9PiBwYWNrYWdlSW5mby5saWNlbnNlLFxuICAgICAgICAgICAgdHlwZTogbmV3IGdyYXBocWxfMS5HcmFwaFFMTm9uTnVsbChncmFwaHFsXzEuR3JhcGhRTFN0cmluZyksXG4gICAgICAgIH0sXG4gICAgICAgIHJlcG9zaXRvcnk6IHtcbiAgICAgICAgICAgIHJlc29sdmU6ICgpID0+IHBhY2thZ2VJbmZvLnJlcG9zaXRvcnksXG4gICAgICAgICAgICB0eXBlOiBuZXcgZ3JhcGhxbF8xLkdyYXBoUUxOb25OdWxsKG5ldyBncmFwaHFsXzEuR3JhcGhRTE9iamVjdFR5cGUoe1xuICAgICAgICAgICAgICAgIG5hbWU6ICdSZXBvc2l0b3J5JyxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0FwcGxpY2F0aW9uIHJlcG9zaXRvcnknLFxuICAgICAgICAgICAgICAgIGZpZWxkczogKCkgPT4gKHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdSZXBvc2l0b3J5IHR5cGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogbmV3IGdyYXBocWxfMS5HcmFwaFFMTm9uTnVsbChncmFwaHFsXzEuR3JhcGhRTFN0cmluZyksXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlOiAoKSA9PiBwYWNrYWdlSW5mby5yZXBvc2l0b3J5LnR5cGUsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHVybDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdSZXBvc2l0b3J5IFVSTCBhZGRlc3MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogbmV3IGdyYXBocWxfMS5HcmFwaFFMTm9uTnVsbChncmFwaHFsXzEuR3JhcGhRTFN0cmluZyksXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlOiAoKSA9PiBwYWNrYWdlSW5mby5yZXBvc2l0b3J5LnVybCxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIH0pKSxcbiAgICAgICAgfSxcbiAgICB9KSxcbn0pO1xuY29uc3Qgc2NoZW1hID0gbmV3IGdyYXBocWxfMS5HcmFwaFFMU2NoZW1hKHtcbiAgICBxdWVyeTogbmV3IGdyYXBocWxfMS5HcmFwaFFMT2JqZWN0VHlwZSh7XG4gICAgICAgIG5hbWU6ICdRdWVyeScsXG4gICAgICAgIGZpZWxkczogKCkgPT4gKHtcbiAgICAgICAgICAgIGRldkluZm86IHtcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0FwcGxpY2F0aW9uIGRldmVsb3BtZW50IGluZm8nLFxuICAgICAgICAgICAgICAgIHJlc29sdmU6ICgpID0+ICh7fSksXG4gICAgICAgICAgICAgICAgdHlwZTogbmV3IGdyYXBocWxfMS5HcmFwaFFMTm9uTnVsbChEZXZJbmZvKSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pLFxuICAgIH0pLFxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSBzY2hlbWE7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJiY3J5cHRqc1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJjaGFsa1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJjb3JzXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImRldmljZS1kZXRlY3Rvci1qc1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJldmVudHNcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiZXhwcmVzc1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJleHByZXNzLWFzeW5jLWhhbmRsZXJcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiZXhwcmVzcy1ncmFwaHFsXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImZzXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImdyYXBocWxcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiZ3JhcGhxbC1wbGF5Z3JvdW5kLW1pZGRsZXdhcmUtZXhwcmVzc1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJncmFwaHFsLXRvb2xzXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImdyYXBocWwtdm95YWdlci9taWRkbGV3YXJlXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImh0dHBcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwianNvbndlYnRva2VuXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImtuZXhcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwibW9tZW50LXRpbWV6b25lXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcInBhdGhcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwicGVyZl9ob29rc1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJzdWJzY3JpcHRpb25zLXRyYW5zcG9ydC13c1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJ1dWlkL3Y0XCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIndpbnN0b25cIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwid2luc3Rvbi1kYWlseS1yb3RhdGUtZmlsZVwiKTsiXSwic291cmNlUm9vdCI6IiJ9