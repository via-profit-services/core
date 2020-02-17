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
const v4_1 = __importDefault(__webpack_require__(/*! uuid/v4 */ "uuid/v4"));
const moment_timezone_1 = __importDefault(__webpack_require__(/*! moment-timezone */ "moment-timezone"));
const index_1 = __webpack_require__(/*! ~/index */ "./src/index.ts");
const models_1 = __webpack_require__(/*! ./models */ "./src/authentificator/models/index.ts");
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
            const { sequelize, logger } = context;
            const account = yield models_1.AccountsModel(sequelize).findByPk(data.uuid);
            const tokens = this.generateTokens({
                uuid: account.id,
                roles: account.roles,
            });
            // Register access token
            try {
                yield models_1.TokensModel(sequelize).create({
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
                yield models_1.TokensModel(sequelize).create({
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
            const { sequelize } = context;
            yield models_1.TokensModel(sequelize).destroy({
                where: {
                    id: tokenId,
                },
            });
        });
    }
    checkTokenExist(tokenId) {
        return __awaiter(this, void 0, void 0, function* () {
            const { context } = this.props;
            const { sequelize } = context;
            const tokenData = yield models_1.TokensModel(sequelize).findByPk(tokenId, {
                attributes: ['id'],
            });
            return tokenData !== null;
        });
    }
    getAccountByLogin(login) {
        return __awaiter(this, void 0, void 0, function* () {
            const { context } = this.props;
            const { sequelize } = context;
            const account = yield models_1.AccountsModel(sequelize).findOne({
                attributes: ['id', 'password', 'status'],
                where: {
                    login,
                },
            });
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
const express_1 = __webpack_require__(/*! express */ "express");
const express_async_handler_1 = __importDefault(__webpack_require__(/*! express-async-handler */ "express-async-handler"));
const device_detector_js_1 = __importDefault(__webpack_require__(/*! device-detector-js */ "device-detector-js"));
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

/***/ "./src/authentificator/models/Accounts.ts":
/*!************************************************!*\
  !*** ./src/authentificator/models/Accounts.ts ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = __webpack_require__(/*! sequelize */ "sequelize");
class AccountsModel extends sequelize_1.Model {
}
const modelFactory = (sequelize) => {
    AccountsModel.init({
        id: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
            primaryKey: true,
        },
        name: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        login: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        password: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        status: {
            type: sequelize_1.DataTypes.ENUM('allowed', 'forbidden'),
            allowNull: false,
        },
        createdAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.NOW,
        },
        updatedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.NOW,
        },
    }, {
        sequelize,
        modelName: 'accounts',
    });
    return AccountsModel;
};
exports.default = modelFactory;


/***/ }),

/***/ "./src/authentificator/models/Tokens.ts":
/*!**********************************************!*\
  !*** ./src/authentificator/models/Tokens.ts ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = __webpack_require__(/*! sequelize */ "sequelize");
class TokensModel extends sequelize_1.Model {
}
const modelFactory = (sequelize) => {
    TokensModel.init({
        id: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
            primaryKey: true,
        },
        associated: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
        },
        account: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
        },
        createdAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.NOW,
        },
        updatedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.NOW,
        },
        expiredAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
        },
        type: {
            type: sequelize_1.DataTypes.ENUM('access', 'refresh'),
            allowNull: false,
        },
        deviceInfo: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: true,
        },
    }, {
        sequelize,
        modelName: 'tokens',
    });
    return TokensModel;
};
exports.default = modelFactory;


/***/ }),

/***/ "./src/authentificator/models/index.ts":
/*!*********************************************!*\
  !*** ./src/authentificator/models/index.ts ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Accounts_1 = __importDefault(__webpack_require__(/*! ./Accounts */ "./src/authentificator/models/Accounts.ts"));
exports.AccountsModel = Accounts_1.default;
const Tokens_1 = __importDefault(__webpack_require__(/*! ./Tokens */ "./src/authentificator/models/Tokens.ts"));
exports.TokensModel = Tokens_1.default;


/***/ }),

/***/ "./src/databaseManager/index.ts":
/*!**************************************!*\
  !*** ./src/databaseManager/index.ts ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = __webpack_require__(/*! sequelize */ "sequelize");
const sequelizeProvider = (options) => {
    const sequelize = new sequelize_1.Sequelize(Object.assign({ dialect: 'postgres' }, options));
    return sequelize;
};
exports.sequelizeProvider = sequelizeProvider;
exports.default = sequelizeProvider;
// TODO Tests reuired


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
const ServerError_1 = __importDefault(__webpack_require__(/*! ./ServerError */ "./src/logger/errorHandlers/ServerError.ts"));
exports.ServerError = ServerError_1.default;
const BadRequestError_1 = __importDefault(__webpack_require__(/*! ./BadRequestError */ "./src/logger/errorHandlers/BadRequestError.ts"));
exports.BadRequestError = BadRequestError_1.default;
const ForbiddenError_1 = __importDefault(__webpack_require__(/*! ./ForbiddenError */ "./src/logger/errorHandlers/ForbiddenError.ts"));
exports.ForbiddenError = ForbiddenError_1.default;
const NotFoundError_1 = __importDefault(__webpack_require__(/*! ./NotFoundError */ "./src/logger/errorHandlers/NotFoundError.ts"));
exports.NotFoundError = NotFoundError_1.default;


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
const server_1 = __importDefault(__webpack_require__(/*! ./server */ "./src/logger/loggers/server.ts"));
exports.serverLogger = server_1.default;
const auth_1 = __importDefault(__webpack_require__(/*! ./auth */ "./src/logger/loggers/auth.ts"));
exports.authLogger = auth_1.default;
const sql_1 = __importDefault(__webpack_require__(/*! ./sql */ "./src/logger/loggers/sql.ts"));
exports.sqlLogger = sql_1.default;
const http_1 = __importDefault(__webpack_require__(/*! ./http */ "./src/logger/loggers/http.ts"));
exports.httpLogger = http_1.default;


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
                filename: `${logPath}/%DATE%-debug.log`,
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
const requestHandler_1 = __importDefault(__webpack_require__(/*! ./requestHandler */ "./src/logger/middlewares/requestHandler.ts"));
exports.requestHandlerMiddleware = requestHandler_1.default;
const errorHandler_1 = __importDefault(__webpack_require__(/*! ./errorHandler */ "./src/logger/middlewares/errorHandler.ts"));
exports.errorHandlerMiddleware = errorHandler_1.default;


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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(__webpack_require__(/*! path */ "path"));
const index_1 = __webpack_require__(/*! ~/index */ "./src/index.ts");
const catalog_1 = __importStar(__webpack_require__(/*! ~/playground/schemas/catalog */ "./src/playground/schemas/catalog/index.ts"));
const catalogLogger = catalog_1.configureCatalogLogger({
    logPath: 'log',
});
const logger = index_1.configureLogger({
    logPath: 'log',
    loggers: {
        catalog: catalogLogger,
    },
});
const server = new index_1.Server({
    database: {
        database: 'services',
        host: 'e1g.ru',
        password: 'nonprofitproject',
        username: 'services',
    },
    endpoint: '/api/graphql',
    jwt: {
        accessTokenExpiresIn: 1800,
        algorithm: 'RS256',
        issuer: 'viaprofit-services',
        privateKey: path_1.default.resolve(__dirname, './cert/jwtRS256.key'),
        publicKey: path_1.default.resolve(__dirname, './cert/jwtRS256.key.pub'),
        refreshTokenExpiresIn: 2.592e6,
    },
    logger,
    port: 4000,
    schemas: [catalog_1.default],
});
server.startServer();
// TODO Tests reuired

/* WEBPACK VAR INJECTION */}.call(this, "src/playground"))

/***/ }),

/***/ "./src/playground/schemas/catalog/index.ts":
/*!*************************************************!*\
  !*** ./src/playground/schemas/catalog/index.ts ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_tools_1 = __webpack_require__(/*! graphql-tools */ "graphql-tools");
const schema_graphql_1 = __importDefault(__webpack_require__(/*! ./schema.graphql */ "./src/playground/schemas/catalog/schema.graphql"));
const resolvers_1 = __importDefault(__webpack_require__(/*! ./resolvers */ "./src/playground/schemas/catalog/resolvers/index.ts"));
const logger_1 = __importDefault(__webpack_require__(/*! ./logger */ "./src/playground/schemas/catalog/logger.ts"));
exports.configureCatalogLogger = logger_1.default;
const schema = graphql_tools_1.makeExecutableSchema({
    typeDefs: schema_graphql_1.default,
    resolvers: resolvers_1.default,
});
exports.default = schema;


/***/ }),

/***/ "./src/playground/schemas/catalog/logger.ts":
/*!**************************************************!*\
  !*** ./src/playground/schemas/catalog/logger.ts ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __webpack_require__(/*! winston */ "winston");
__webpack_require__(/*! winston-daily-rotate-file */ "winston-daily-rotate-file");
exports.default = (config) => {
    const { logPath } = config;
    return winston_1.createLogger({
        level: 'debug',
        format: winston_1.format.combine(winston_1.format.metadata(), winston_1.format.json(), winston_1.format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ssZZ' }), winston_1.format.splat(), winston_1.format.printf(info => {
            const { timestamp, level, message, metadata } = info;
            const meta = JSON.stringify(metadata) !== '{}' ? metadata : null;
            return `${timestamp} ${level}: ${message} ${meta ? JSON.stringify(meta) : ''}`;
        })),
        transports: [
            new winston_1.transports.DailyRotateFile({
                filename: `${logPath}/%DATE%-catalog.log`,
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

/***/ "./src/playground/schemas/catalog/resolvers/index.ts":
/*!***********************************************************!*\
  !*** ./src/playground/schemas/catalog/resolvers/index.ts ***!
  \***********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const mutations_1 = __webpack_require__(/*! ./mutations */ "./src/playground/schemas/catalog/resolvers/mutations.ts");
const queries_1 = __webpack_require__(/*! ./queries */ "./src/playground/schemas/catalog/resolvers/queries.ts");
const resolvers = {
    Query: { news: () => ({}) },
    Mutation: { news: () => ({}) },
    NewsQueries: queries_1.NewsQueries,
    NewsMutations: {
        category: () => ({}),
        item: () => ({}),
    },
    CategoryMutations: mutations_1.CategoryMutations,
    ItemMutations: mutations_1.ItemMutations,
};
exports.default = resolvers;


/***/ }),

/***/ "./src/playground/schemas/catalog/resolvers/mutations.ts":
/*!***************************************************************!*\
  !*** ./src/playground/schemas/catalog/resolvers/mutations.ts ***!
  \***************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const service_1 = __importDefault(__webpack_require__(/*! ../service */ "./src/playground/schemas/catalog/service.ts"));
exports.CategoryMutations = {
    create: () => {
        const news = new service_1.default();
        return news.getCategory(String(100));
    },
    update: (parent, args) => {
        const { id } = args;
        const news = new service_1.default();
        return news.getCategory(id);
    },
    delete: () => true,
};
exports.ItemMutations = {
    create: () => {
        const news = new service_1.default();
        return news.getItem(String(1));
    },
    update: (parent, args) => {
        const { id } = args;
        const news = new service_1.default();
        return news.getItem(id);
    },
    delete: () => true,
};


/***/ }),

/***/ "./src/playground/schemas/catalog/resolvers/queries.ts":
/*!*************************************************************!*\
  !*** ./src/playground/schemas/catalog/resolvers/queries.ts ***!
  \*************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const service_1 = __importDefault(__webpack_require__(/*! ../service */ "./src/playground/schemas/catalog/service.ts"));
exports.NewsQueries = {
    categories: (source, args, context) => {
        const { logger } = context;
        logger.catalog.debug('Returns categories list');
        const news = new service_1.default();
        return news.getCategoriesList();
    },
    item: (source, args, context) => {
        const { id } = args;
        const { logger } = context;
        logger.catalog.debug('Returns Item');
        const news = new service_1.default();
        return news.getItemsList().find(i => i.id === String(id));
    },
    items: (source, args, context) => {
        const { logger } = context;
        const news = new service_1.default();
        logger.catalog.debug('Returns Items list');
        return news.getItemsList();
    },
};
exports.default = exports.NewsQueries;


/***/ }),

/***/ "./src/playground/schemas/catalog/schema.graphql":
/*!*******************************************************!*\
  !*** ./src/playground/schemas/catalog/schema.graphql ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports) {


    var doc = {"kind":"Document","definitions":[{"kind":"ObjectTypeDefinition","name":{"kind":"Name","value":"Query"},"interfaces":[],"directives":[],"fields":[{"kind":"FieldDefinition","name":{"kind":"Name","value":"news"},"arguments":[],"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"NewsQueries"}}},"directives":[]}]},{"kind":"ObjectTypeDefinition","name":{"kind":"Name","value":"Mutation"},"interfaces":[],"directives":[],"fields":[{"kind":"FieldDefinition","name":{"kind":"Name","value":"news"},"arguments":[],"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"NewsMutations"}}},"directives":[]}]},{"kind":"ObjectTypeDefinition","name":{"kind":"Name","value":"NewsQueries"},"interfaces":[],"directives":[],"fields":[{"kind":"FieldDefinition","name":{"kind":"Name","value":"categories"},"arguments":[],"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Category"}}}},"directives":[]},{"kind":"FieldDefinition","name":{"kind":"Name","value":"items"},"arguments":[],"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Item"}}}},"directives":[]},{"kind":"FieldDefinition","name":{"kind":"Name","value":"item"},"arguments":[{"kind":"InputValueDefinition","name":{"kind":"Name","value":"id"},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}},"directives":[]}],"type":{"kind":"NamedType","name":{"kind":"Name","value":"Item"}},"directives":[]}]},{"kind":"ObjectTypeDefinition","name":{"kind":"Name","value":"NewsMutations"},"interfaces":[],"directives":[],"fields":[{"kind":"FieldDefinition","name":{"kind":"Name","value":"category"},"arguments":[],"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CategoryMutations"}}},"directives":[]},{"kind":"FieldDefinition","name":{"kind":"Name","value":"item"},"arguments":[],"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ItemMutations"}}},"directives":[]}]},{"kind":"ObjectTypeDefinition","name":{"kind":"Name","value":"ItemMutations"},"interfaces":[],"directives":[],"fields":[{"kind":"FieldDefinition","name":{"kind":"Name","value":"create"},"arguments":[{"kind":"InputValueDefinition","name":{"kind":"Name","value":"name"},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},"directives":[]}],"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Item"}}},"directives":[]},{"kind":"FieldDefinition","name":{"kind":"Name","value":"update"},"arguments":[{"kind":"InputValueDefinition","name":{"kind":"Name","value":"id"},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"directives":[]},{"kind":"InputValueDefinition","name":{"kind":"Name","value":"name"},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},"directives":[]}],"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Item"}}},"directives":[]},{"kind":"FieldDefinition","name":{"kind":"Name","value":"delete"},"arguments":[{"kind":"InputValueDefinition","name":{"kind":"Name","value":"id"},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"directives":[]}],"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},"directives":[]}]},{"kind":"ObjectTypeDefinition","name":{"kind":"Name","value":"CategoryMutations"},"interfaces":[],"directives":[],"fields":[{"kind":"FieldDefinition","name":{"kind":"Name","value":"create"},"arguments":[{"kind":"InputValueDefinition","name":{"kind":"Name","value":"name"},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},"directives":[]}],"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Category"}}},"directives":[]},{"kind":"FieldDefinition","name":{"kind":"Name","value":"update"},"arguments":[{"kind":"InputValueDefinition","name":{"kind":"Name","value":"id"},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"directives":[]},{"kind":"InputValueDefinition","name":{"kind":"Name","value":"name"},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},"directives":[]}],"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Category"}}},"directives":[]},{"kind":"FieldDefinition","name":{"kind":"Name","value":"delete"},"arguments":[{"kind":"InputValueDefinition","name":{"kind":"Name","value":"id"},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"directives":[]}],"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},"directives":[]}]},{"kind":"ObjectTypeDefinition","name":{"kind":"Name","value":"Category"},"interfaces":[],"directives":[],"fields":[{"kind":"FieldDefinition","name":{"kind":"Name","value":"id"},"arguments":[],"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"directives":[]},{"kind":"FieldDefinition","name":{"kind":"Name","value":"name"},"arguments":[],"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},"directives":[]}]},{"kind":"ObjectTypeDefinition","name":{"kind":"Name","value":"Item"},"interfaces":[],"directives":[],"fields":[{"kind":"FieldDefinition","name":{"kind":"Name","value":"id"},"arguments":[],"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"directives":[]},{"kind":"FieldDefinition","name":{"kind":"Name","value":"name"},"arguments":[],"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},"directives":[]}]}],"loc":{"start":0,"end":593}};
    doc.loc.source = {"body":"type Query {\n  news: NewsQueries!\n}\n\ntype Mutation {\n  news: NewsMutations!\n}\n\ntype NewsQueries {\n  categories: [Category]!\n  items: [Item]!\n  item(id: ID!): Item\n}\n\ntype NewsMutations {\n  category: CategoryMutations!\n  item: ItemMutations!\n}\n\ntype ItemMutations {\n  create(name: String!): Item!\n  update(id: Int!, name: String!): Item!\n  delete(id: Int!): Boolean!\n}\n\ntype CategoryMutations {\n  create(name: String!): Category!\n  update(id: Int!, name: String!): Category!\n  delete(id: Int!): Boolean!\n}\n\ntype Category {\n  id: Int!\n  name: String!\n}\n\ntype Item {\n  id: Int!\n  name: String!\n}\n","name":"GraphQL request","locationOffset":{"line":1,"column":1}};
  

    var names = {};
    function unique(defs) {
      return defs.filter(
        function(def) {
          if (def.kind !== 'FragmentDefinition') return true;
          var name = def.name.value
          if (names[name]) {
            return false;
          } else {
            names[name] = true;
            return true;
          }
        }
      )
    }
  

      module.exports = doc;
    


/***/ }),

/***/ "./src/playground/schemas/catalog/service.ts":
/*!***************************************************!*\
  !*** ./src/playground/schemas/catalog/service.ts ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// import { IContext } from '~/index';
Object.defineProperty(exports, "__esModule", { value: true });
class CatalogService {
    constructor() {
        // private knexHandle: IContext['knexHandle'];
        this.categories = [
            { id: '100', name: 'Category 1' },
            { id: '200', name: 'Category 2' },
            { id: '300', name: 'Category 3' },
            { id: '400', name: 'Category 4' },
        ];
        this.items = [
            {
                id: '178900',
                name: 'Item 1',
                category: 100,
                price: 1600.0,
            },
            {
                id: '278900',
                name: 'Item 2',
                category: 100,
                price: 7600.0,
            },
            {
                id: '378900',
                name: 'Item 3',
                category: 100,
                price: 5250.0,
            },
            {
                id: '478900',
                name: 'Item 4',
                category: 200,
                price: 300.0,
            },
            {
                id: '578900',
                name: 'Item 5',
                category: 200,
                price: 652.0,
            },
            {
                id: '678900',
                name: 'Item 6',
                category: 200,
                price: 730.0,
            },
        ];
    }
    getItemsList() {
        return this.items;
    }
    getCategoriesList() {
        return this.categories;
    }
    getItem(id) {
        return this.getItemsList().find(i => i.id === id);
    }
    getCategory(id) {
        return this.getCategoriesList().find(c => c.id === id);
    }
}
exports.default = CatalogService;


/***/ }),

/***/ "./src/server/index.ts":
/*!*****************************!*\
  !*** ./src/server/index.ts ***!
  \*****************************/
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
const chalk_1 = __importDefault(__webpack_require__(/*! chalk */ "chalk"));
const cors_1 = __importDefault(__webpack_require__(/*! cors */ "cors"));
const express_1 = __importDefault(__webpack_require__(/*! express */ "express"));
const express_graphql_1 = __importDefault(__webpack_require__(/*! express-graphql */ "express-graphql"));
const graphql_1 = __webpack_require__(/*! graphql */ "graphql");
const graphql_playground_middleware_express_1 = __importDefault(__webpack_require__(/*! graphql-playground-middleware-express */ "graphql-playground-middleware-express"));
const graphql_tools_1 = __webpack_require__(/*! graphql-tools */ "graphql-tools");
const middleware_1 = __webpack_require__(/*! graphql-voyager/middleware */ "graphql-voyager/middleware");
const http_1 = __webpack_require__(/*! http */ "http");
const subscriptions_transport_ws_1 = __webpack_require__(/*! subscriptions-transport-ws */ "subscriptions-transport-ws");
const authentificator_1 = __webpack_require__(/*! ~/authentificator */ "./src/authentificator/index.ts");
const databaseManager_1 = __webpack_require__(/*! ~/databaseManager */ "./src/databaseManager/index.ts");
const logger_1 = __webpack_require__(/*! ~/logger */ "./src/logger/index.ts");
const app = express_1.default();
class Server {
    constructor(props) {
        this.props = props;
    }
    startServer() {
        return __awaiter(this, void 0, void 0, function* () {
            const { schemas, endpoint, port, jwt, database, logger } = this.props;
            const subscriptionsEndpoint = '/subscriptions';
            const schema = graphql_tools_1.mergeSchemas({ schemas });
            const routes = {
                auth: `${endpoint}/auth`,
                playground: `${endpoint}/playground`,
                voyager: `${endpoint}/voyager`,
            };
            const sequelize = databaseManager_1.sequelizeProvider(Object.assign({ benchmark: true, logging: (sql, timing) => {
                    if (true) {
                        logger.sql.debug(sql, { queryTimeMs: timing });
                    }
                } }, database));
            sequelize
                .authenticate()
                .then(() => {
                logger.server.debug('Test the connection by trying to authenticate is OK');
                return true;
            })
                .catch(err => {
                logger.server.error(err.name, err);
                throw new logger_1.ServerError(err);
            });
            const context = {
                endpoint,
                jwt,
                logger,
                sequelize,
            };
            // This middleware must be defined first
            app.use(logger_1.requestHandlerMiddleware({ context }));
            app.use(cors_1.default());
            app.use(express_1.default.json({ limit: '50mb' }));
            app.use(express_1.default.urlencoded({ extended: true, limit: '50mb' }));
            app.use(authentificator_1.authentificatorMiddleware({
                context,
                authUrl: routes.auth,
                allowedUrl: [routes.playground],
            }));
            app.get(routes.playground, graphql_playground_middleware_express_1.default({ endpoint }));
            app.use(routes.voyager, middleware_1.express({ endpointUrl: endpoint }));
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
            // Create listener server by wrapping express app
            const webServer = http_1.createServer(app);
            webServer.listen(port, () => {
                logger.server.debug('Server was started', { port, endpoint, routes });
                console.log('');
                console.log('');
                console.log(chalk_1.default.green('========= GraphQL ========='));
                console.log('');
                console.log(`${chalk_1.default.green('GraphQL server')}:     ${chalk_1.default.yellow(`http://localhost:${port}${endpoint}`)}`);
                console.log(`${chalk_1.default.magenta('GraphQL playground')}: ${chalk_1.default.yellow(`http://localhost:${port}${routes.playground}`)}`);
                console.log(`${chalk_1.default.cyan('Auth Server')}:        ${chalk_1.default.yellow(`http://localhost:${port}${routes.auth}`)}`);
                console.log(`${chalk_1.default.blue('GraphQL voyager')}:    ${chalk_1.default.yellow(`http://localhost:${port}${routes.voyager}`)}`);
                console.log('');
                // Set up the WebSocket for handling GraphQL subscriptions.
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const ss = new subscriptions_transport_ws_1.SubscriptionServer({
                    execute: graphql_1.execute,
                    schema,
                    subscribe: graphql_1.subscribe,
                }, {
                    path: subscriptionsEndpoint,
                    server: webServer,
                });
            });
            process.on('SIGINT', code => {
                logger.server.debug(`Server was stopped. SIGINT to exit with code: ${code}`);
            });
        });
    }
}
exports.Server = Server;
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

/***/ "sequelize":
/*!****************************!*\
  !*** external "sequelize" ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("sequelize");

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2F1dGhlbnRpZmljYXRvci9BdXRoZW50aWZpY2F0b3IudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2F1dGhlbnRpZmljYXRvci9hdXRoZW50aWZpY2F0b3JNaWRkbGV3YXJlLnRzIiwid2VicGFjazovLy8uL3NyYy9hdXRoZW50aWZpY2F0b3IvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2F1dGhlbnRpZmljYXRvci9tb2RlbHMvQWNjb3VudHMudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2F1dGhlbnRpZmljYXRvci9tb2RlbHMvVG9rZW5zLnRzIiwid2VicGFjazovLy8uL3NyYy9hdXRoZW50aWZpY2F0b3IvbW9kZWxzL2luZGV4LnRzIiwid2VicGFjazovLy8uL3NyYy9kYXRhYmFzZU1hbmFnZXIvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2luZGV4LnRzIiwid2VicGFjazovLy8uL3NyYy9sb2dnZXIvZXJyb3JIYW5kbGVycy9CYWRSZXF1ZXN0RXJyb3IudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2xvZ2dlci9lcnJvckhhbmRsZXJzL0ZvcmJpZGRlbkVycm9yLnRzIiwid2VicGFjazovLy8uL3NyYy9sb2dnZXIvZXJyb3JIYW5kbGVycy9Ob3RGb3VuZEVycm9yLnRzIiwid2VicGFjazovLy8uL3NyYy9sb2dnZXIvZXJyb3JIYW5kbGVycy9TZXJ2ZXJFcnJvci50cyIsIndlYnBhY2s6Ly8vLi9zcmMvbG9nZ2VyL2Vycm9ySGFuZGxlcnMvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2xvZ2dlci9pbmRleC50cyIsIndlYnBhY2s6Ly8vLi9zcmMvbG9nZ2VyL2xvZ2dlcnMvYXV0aC50cyIsIndlYnBhY2s6Ly8vLi9zcmMvbG9nZ2VyL2xvZ2dlcnMvaHR0cC50cyIsIndlYnBhY2s6Ly8vLi9zcmMvbG9nZ2VyL2xvZ2dlcnMvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2xvZ2dlci9sb2dnZXJzL3NlcnZlci50cyIsIndlYnBhY2s6Ly8vLi9zcmMvbG9nZ2VyL2xvZ2dlcnMvc3FsLnRzIiwid2VicGFjazovLy8uL3NyYy9sb2dnZXIvbWlkZGxld2FyZXMvZXJyb3JIYW5kbGVyLnRzIiwid2VicGFjazovLy8uL3NyYy9sb2dnZXIvbWlkZGxld2FyZXMvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2xvZ2dlci9taWRkbGV3YXJlcy9yZXF1ZXN0SGFuZGxlci50cyIsIndlYnBhY2s6Ly8vLi9zcmMvbG9nZ2VyL3V0aWxzL2xvZ0Zvcm1hdHRlci50cyIsIndlYnBhY2s6Ly8vLi9zcmMvbG9nZ2VyL3V0aWxzL3Jlc3BvbnNlRm9ybWF0dGVyLnRzIiwid2VicGFjazovLy8uL3NyYy9wbGF5Z3JvdW5kL3BsYXlncm91bmQudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3BsYXlncm91bmQvc2NoZW1hcy9jYXRhbG9nL2luZGV4LnRzIiwid2VicGFjazovLy8uL3NyYy9wbGF5Z3JvdW5kL3NjaGVtYXMvY2F0YWxvZy9sb2dnZXIudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3BsYXlncm91bmQvc2NoZW1hcy9jYXRhbG9nL3Jlc29sdmVycy9pbmRleC50cyIsIndlYnBhY2s6Ly8vLi9zcmMvcGxheWdyb3VuZC9zY2hlbWFzL2NhdGFsb2cvcmVzb2x2ZXJzL211dGF0aW9ucy50cyIsIndlYnBhY2s6Ly8vLi9zcmMvcGxheWdyb3VuZC9zY2hlbWFzL2NhdGFsb2cvcmVzb2x2ZXJzL3F1ZXJpZXMudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3BsYXlncm91bmQvc2NoZW1hcy9jYXRhbG9nL3NjaGVtYS5ncmFwaHFsIiwid2VicGFjazovLy8uL3NyYy9wbGF5Z3JvdW5kL3NjaGVtYXMvY2F0YWxvZy9zZXJ2aWNlLnRzIiwid2VicGFjazovLy8uL3NyYy9zZXJ2ZXIvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwiYmNyeXB0anNcIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJjaGFsa1wiIiwid2VicGFjazovLy9leHRlcm5hbCBcImNvcnNcIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJkZXZpY2UtZGV0ZWN0b3ItanNcIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJleHByZXNzXCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwiZXhwcmVzcy1hc3luYy1oYW5kbGVyXCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwiZXhwcmVzcy1ncmFwaHFsXCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwiZnNcIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJncmFwaHFsXCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwiZ3JhcGhxbC1wbGF5Z3JvdW5kLW1pZGRsZXdhcmUtZXhwcmVzc1wiIiwid2VicGFjazovLy9leHRlcm5hbCBcImdyYXBocWwtdG9vbHNcIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJncmFwaHFsLXZveWFnZXIvbWlkZGxld2FyZVwiIiwid2VicGFjazovLy9leHRlcm5hbCBcImh0dHBcIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJqc29ud2VidG9rZW5cIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJtb21lbnQtdGltZXpvbmVcIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJwYXRoXCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwic2VxdWVsaXplXCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwic3Vic2NyaXB0aW9ucy10cmFuc3BvcnQtd3NcIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJ1dWlkL3Y0XCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwid2luc3RvblwiIiwid2VicGFjazovLy9leHRlcm5hbCBcIndpbnN0b24tZGFpbHktcm90YXRlLWZpbGVcIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztRQUFBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7O1FB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Qjs7Ozs7Ozs7Ozs7QUNBQSxvQzs7Ozs7Ozs7Ozs7QUNBQSxrRTs7Ozs7Ozs7Ozs7QUNBQSwwQzs7Ozs7Ozs7Ozs7QUNBQSx1RDs7Ozs7Ozs7Ozs7QUNBQSxpQzs7Ozs7Ozs7Ozs7QUNBQSx5Qzs7Ozs7Ozs7Ozs7QUNBQSw0Qzs7Ozs7Ozs7Ozs7QUNBQSxpQzs7Ozs7Ozs7Ozs7QUNBQSxzQzs7Ozs7Ozs7Ozs7QUNBQSx1RDs7Ozs7Ozs7Ozs7QUNBQSxvQzs7Ozs7Ozs7Ozs7QUNBQSxvQzs7Ozs7Ozs7Ozs7QUNBQSxzRCIsImZpbGUiOiJwbGF5Z3JvdW5kLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZ2V0dGVyIH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSBmdW5jdGlvbihleHBvcnRzKSB7XG4gXHRcdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuIFx0XHR9XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG4gXHR9O1xuXG4gXHQvLyBjcmVhdGUgYSBmYWtlIG5hbWVzcGFjZSBvYmplY3RcbiBcdC8vIG1vZGUgJiAxOiB2YWx1ZSBpcyBhIG1vZHVsZSBpZCwgcmVxdWlyZSBpdFxuIFx0Ly8gbW9kZSAmIDI6IG1lcmdlIGFsbCBwcm9wZXJ0aWVzIG9mIHZhbHVlIGludG8gdGhlIG5zXG4gXHQvLyBtb2RlICYgNDogcmV0dXJuIHZhbHVlIHdoZW4gYWxyZWFkeSBucyBvYmplY3RcbiBcdC8vIG1vZGUgJiA4fDE6IGJlaGF2ZSBsaWtlIHJlcXVpcmVcbiBcdF9fd2VicGFja19yZXF1aXJlX18udCA9IGZ1bmN0aW9uKHZhbHVlLCBtb2RlKSB7XG4gXHRcdGlmKG1vZGUgJiAxKSB2YWx1ZSA9IF9fd2VicGFja19yZXF1aXJlX18odmFsdWUpO1xuIFx0XHRpZihtb2RlICYgOCkgcmV0dXJuIHZhbHVlO1xuIFx0XHRpZigobW9kZSAmIDQpICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgJiYgdmFsdWUuX19lc01vZHVsZSkgcmV0dXJuIHZhbHVlO1xuIFx0XHR2YXIgbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIobnMpO1xuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkobnMsICdkZWZhdWx0JywgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdmFsdWUgfSk7XG4gXHRcdGlmKG1vZGUgJiAyICYmIHR5cGVvZiB2YWx1ZSAhPSAnc3RyaW5nJykgZm9yKHZhciBrZXkgaW4gdmFsdWUpIF9fd2VicGFja19yZXF1aXJlX18uZChucywga2V5LCBmdW5jdGlvbihrZXkpIHsgcmV0dXJuIHZhbHVlW2tleV07IH0uYmluZChudWxsLCBrZXkpKTtcbiBcdFx0cmV0dXJuIG5zO1xuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IFwiLi9zcmMvcGxheWdyb3VuZC9wbGF5Z3JvdW5kLnRzXCIpO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19hd2FpdGVyID0gKHRoaXMgJiYgdGhpcy5fX2F3YWl0ZXIpIHx8IGZ1bmN0aW9uICh0aGlzQXJnLCBfYXJndW1lbnRzLCBQLCBnZW5lcmF0b3IpIHtcbiAgICBmdW5jdGlvbiBhZG9wdCh2YWx1ZSkgeyByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBQID8gdmFsdWUgOiBuZXcgUChmdW5jdGlvbiAocmVzb2x2ZSkgeyByZXNvbHZlKHZhbHVlKTsgfSk7IH1cbiAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgZnVuY3Rpb24gZnVsZmlsbGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yLm5leHQodmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvcltcInRocm93XCJdKHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBhZG9wdChyZXN1bHQudmFsdWUpLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH1cbiAgICAgICAgc3RlcCgoZ2VuZXJhdG9yID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pKS5uZXh0KCkpO1xuICAgIH0pO1xufTtcbnZhciBfX2ltcG9ydERlZmF1bHQgPSAodGhpcyAmJiB0aGlzLl9faW1wb3J0RGVmYXVsdCkgfHwgZnVuY3Rpb24gKG1vZCkge1xuICAgIHJldHVybiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSA/IG1vZCA6IHsgXCJkZWZhdWx0XCI6IG1vZCB9O1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IGZzXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcImZzXCIpKTtcbmNvbnN0IGpzb253ZWJ0b2tlbl8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCJqc29ud2VidG9rZW5cIikpO1xuY29uc3QgdjRfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwidXVpZC92NFwiKSk7XG5jb25zdCBtb21lbnRfdGltZXpvbmVfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwibW9tZW50LXRpbWV6b25lXCIpKTtcbmNvbnN0IGluZGV4XzEgPSByZXF1aXJlKFwifi9pbmRleFwiKTtcbmNvbnN0IG1vZGVsc18xID0gcmVxdWlyZShcIi4vbW9kZWxzXCIpO1xudmFyIFRva2VuVHlwZTtcbihmdW5jdGlvbiAoVG9rZW5UeXBlKSB7XG4gICAgVG9rZW5UeXBlW1wiYWNjZXNzXCJdID0gXCJhY2Nlc3NcIjtcbiAgICBUb2tlblR5cGVbXCJyZWZyZXNoXCJdID0gXCJyZWZyZXNoXCI7XG59KShUb2tlblR5cGUgPSBleHBvcnRzLlRva2VuVHlwZSB8fCAoZXhwb3J0cy5Ub2tlblR5cGUgPSB7fSkpO1xuY2xhc3MgQXV0aGVudGlmaWNhdG9yIHtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICB0aGlzLnByb3BzID0gcHJvcHM7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEV4dHJhY3QgVG9rZW4gZnJvbSBIVFRQIHJlcXVlc3QgaGVhZGVyc1xuICAgICAqIEBwYXJhbSAge1JlcXVlc3R9IHJlcXVlc3RcbiAgICAgKiBAcmV0dXJucyBzdHJpbmdcbiAgICAgKi9cbiAgICBzdGF0aWMgZXh0cmFjdFRva2VuKHJlcXVlc3QpIHtcbiAgICAgICAgY29uc3QgeyBoZWFkZXJzIH0gPSByZXF1ZXN0O1xuICAgICAgICBjb25zdCB7IGF1dGhvcml6YXRpb24gfSA9IGhlYWRlcnM7XG4gICAgICAgIGNvbnN0IGJlYXJlciA9IFN0cmluZyhhdXRob3JpemF0aW9uKS5zcGxpdCgnICcpWzBdO1xuICAgICAgICBjb25zdCB0b2tlbiA9IFN0cmluZyhhdXRob3JpemF0aW9uKS5zcGxpdCgnICcpWzFdO1xuICAgICAgICByZXR1cm4gYmVhcmVyLnRvTG9jYWxlTG93ZXJDYXNlKCkgPT09ICdiZWFyZXInID8gdG9rZW4gOiAnJztcbiAgICB9XG4gICAgLyoqXG4gICAgICogVmVyaWZ5IEpXVCB0b2tlblxuICAgICAqIEBwYXJhbSAge3N0cmluZ30gdG9rZW5cbiAgICAgKiBAcGFyYW0gIHtzdHJpbmd9IHB1YmxpY0tleVBhdGhcbiAgICAgKiBAcmV0dXJucyBJVG9rZW5JbmZvWydwYXlsb2FkJ11cbiAgICAgKi9cbiAgICBzdGF0aWMgdmVyaWZ5VG9rZW4odG9rZW4sIHB1YmxpY0tleVBhdGgpIHtcbiAgICAgICAgaWYgKHRva2VuID09PSBudWxsKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgaW5kZXhfMS5TZXJ2ZXJFcnJvcignVG9rZW4gdmVyaWZpY2F0aW9uIGZhaWxlZC4gVGhlIHRva2VuIG11c3QgYmUgcHJvdmlkZWQnKTtcbiAgICAgICAgfVxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcHVibGljS2V5ID0gZnNfMS5kZWZhdWx0LnJlYWRGaWxlU3luYyhwdWJsaWNLZXlQYXRoKTtcbiAgICAgICAgICAgIGNvbnN0IHBheWxvYWQgPSBqc29ud2VidG9rZW5fMS5kZWZhdWx0LnZlcmlmeShTdHJpbmcodG9rZW4pLCBwdWJsaWNLZXkpO1xuICAgICAgICAgICAgcmV0dXJuIHBheWxvYWQ7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IGluZGV4XzEuU2VydmVyRXJyb3IoJ1Rva2VuIHZlcmlmaWNhdGlvbiBmYWlsZWQnLCBlcnIpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJlZ2lzdGVyIHRva2Vuc1xuICAgICAqIEBwYXJhbSAge3t1dWlkOnN0cmluZztkZXZpY2VJbmZvOnt9O319IGRhdGFcbiAgICAgKiBAcmV0dXJucyBJVG9rZW5JbmZvXG4gICAgICovXG4gICAgcmVnaXN0ZXJUb2tlbnMoZGF0YSkge1xuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgY29uc3QgeyBjb250ZXh0IH0gPSB0aGlzLnByb3BzO1xuICAgICAgICAgICAgY29uc3QgeyBzZXF1ZWxpemUsIGxvZ2dlciB9ID0gY29udGV4dDtcbiAgICAgICAgICAgIGNvbnN0IGFjY291bnQgPSB5aWVsZCBtb2RlbHNfMS5BY2NvdW50c01vZGVsKHNlcXVlbGl6ZSkuZmluZEJ5UGsoZGF0YS51dWlkKTtcbiAgICAgICAgICAgIGNvbnN0IHRva2VucyA9IHRoaXMuZ2VuZXJhdGVUb2tlbnMoe1xuICAgICAgICAgICAgICAgIHV1aWQ6IGFjY291bnQuaWQsXG4gICAgICAgICAgICAgICAgcm9sZXM6IGFjY291bnQucm9sZXMsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8vIFJlZ2lzdGVyIGFjY2VzcyB0b2tlblxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB5aWVsZCBtb2RlbHNfMS5Ub2tlbnNNb2RlbChzZXF1ZWxpemUpLmNyZWF0ZSh7XG4gICAgICAgICAgICAgICAgICAgIGlkOiB0b2tlbnMuYWNjZXNzVG9rZW4ucGF5bG9hZC5pZCxcbiAgICAgICAgICAgICAgICAgICAgYWNjb3VudDogdG9rZW5zLmFjY2Vzc1Rva2VuLnBheWxvYWQudXVpZCxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogVG9rZW5UeXBlLmFjY2VzcyxcbiAgICAgICAgICAgICAgICAgICAgZGV2aWNlSW5mbzogZGF0YS5kZXZpY2VJbmZvLFxuICAgICAgICAgICAgICAgICAgICBleHBpcmVkQXQ6IG1vbWVudF90aW1lem9uZV8xLmRlZmF1bHQodG9rZW5zLmFjY2Vzc1Rva2VuLnBheWxvYWQuZXhwKS5mb3JtYXQoKSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgaW5kZXhfMS5TZXJ2ZXJFcnJvcignRmFpbGVkIHRvIHJlZ2lzdGVyIGFjY2VzcyB0b2tlbicsIGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyByZWdpc3RlciByZWZyZXNoIHRva2VuXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHlpZWxkIG1vZGVsc18xLlRva2Vuc01vZGVsKHNlcXVlbGl6ZSkuY3JlYXRlKHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6IHRva2Vucy5yZWZyZXNoVG9rZW4ucGF5bG9hZC5pZCxcbiAgICAgICAgICAgICAgICAgICAgYWNjb3VudDogdG9rZW5zLnJlZnJlc2hUb2tlbi5wYXlsb2FkLnV1aWQsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFRva2VuVHlwZS5yZWZyZXNoLFxuICAgICAgICAgICAgICAgICAgICBhc3NvY2lhdGVkOiB0b2tlbnMuYWNjZXNzVG9rZW4ucGF5bG9hZC5pZCxcbiAgICAgICAgICAgICAgICAgICAgZGV2aWNlSW5mbzogZGF0YS5kZXZpY2VJbmZvLFxuICAgICAgICAgICAgICAgICAgICBleHBpcmVkQXQ6IG1vbWVudF90aW1lem9uZV8xLmRlZmF1bHQodG9rZW5zLnJlZnJlc2hUb2tlbi5wYXlsb2FkLmV4cCkuZm9ybWF0KCksXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IGluZGV4XzEuU2VydmVyRXJyb3IoJ0ZhaWxlZCB0byByZWdpc3RlciByZWZyZXNoIHRva2VuJywgZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxvZ2dlci5hdXRoLmluZm8oJ05ldyBBY2Nlc3MgdG9rZW4gd2FzIHJlZ2lzdGVyZWQnLCB0b2tlbnMuYWNjZXNzVG9rZW4ucGF5bG9hZCk7XG4gICAgICAgICAgICByZXR1cm4gdG9rZW5zO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgZ2VuZXJhdGVUb2tlbnMocGF5bG9hZCkge1xuICAgICAgICBjb25zdCB7IGNvbnRleHQgfSA9IHRoaXMucHJvcHM7XG4gICAgICAgIC8vIGNoZWNrIGZpbGUgdG8gYWNjZXNzIGFuZCByZWFkYWJsZVxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgZnNfMS5kZWZhdWx0LmFjY2Vzc1N5bmMoY29udGV4dC5qd3QucHJpdmF0ZUtleSk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IGluZGV4XzEuU2VydmVyRXJyb3IoJ0ZhaWxlZCB0byBvcGVuIEpXVCBwcml2YXRlS2V5IGZpbGUnLCB7IGVyciB9KTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwcml2YXRLZXkgPSBmc18xLmRlZmF1bHQucmVhZEZpbGVTeW5jKGNvbnRleHQuand0LnByaXZhdGVLZXkpO1xuICAgICAgICBjb25zdCBhY2Nlc3NUb2tlblBheWxvYWQgPSBPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oe30sIHBheWxvYWQpLCB7IHR5cGU6IFRva2VuVHlwZS5hY2Nlc3MsIGlkOiB2NF8xLmRlZmF1bHQoKSwgZXhwOiBEYXRlLm5vdygpICsgTnVtYmVyKGNvbnRleHQuand0LmFjY2Vzc1Rva2VuRXhwaXJlc0luKSAqIDEwMDAsIGlzczogY29udGV4dC5qd3QuaXNzdWVyIH0pO1xuICAgICAgICBjb25zdCByZWZyZXNoVG9rZW5QYXlsb2FkID0gT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHt9LCBwYXlsb2FkKSwgeyB0eXBlOiBUb2tlblR5cGUucmVmcmVzaCwgaWQ6IHY0XzEuZGVmYXVsdCgpLCBhc3NvY2lhdGVkOiBhY2Nlc3NUb2tlblBheWxvYWQuaWQsIGV4cDogRGF0ZS5ub3coKSArIE51bWJlcihjb250ZXh0Lmp3dC5yZWZyZXNoVG9rZW5FeHBpcmVzSW4pICogMTAwMCwgaXNzOiBjb250ZXh0Lmp3dC5pc3N1ZXIgfSk7XG4gICAgICAgIGNvbnN0IGFjY2Vzc1Rva2VuID0ganNvbndlYnRva2VuXzEuZGVmYXVsdC5zaWduKGFjY2Vzc1Rva2VuUGF5bG9hZCwgcHJpdmF0S2V5LCB7XG4gICAgICAgICAgICBhbGdvcml0aG06IGNvbnRleHQuand0LmFsZ29yaXRobSxcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IHJlZnJlc2hUb2tlbiA9IGpzb253ZWJ0b2tlbl8xLmRlZmF1bHQuc2lnbihyZWZyZXNoVG9rZW5QYXlsb2FkLCBwcml2YXRLZXksIHtcbiAgICAgICAgICAgIGFsZ29yaXRobTogY29udGV4dC5qd3QuYWxnb3JpdGhtLFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGFjY2Vzc1Rva2VuOiB7XG4gICAgICAgICAgICAgICAgdG9rZW46IGFjY2Vzc1Rva2VuLFxuICAgICAgICAgICAgICAgIHBheWxvYWQ6IE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7fSwgYWNjZXNzVG9rZW5QYXlsb2FkKSwgeyB0eXBlOiBUb2tlblR5cGUuYWNjZXNzIH0pLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJlZnJlc2hUb2tlbjoge1xuICAgICAgICAgICAgICAgIHRva2VuOiByZWZyZXNoVG9rZW4sXG4gICAgICAgICAgICAgICAgcGF5bG9hZDogT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHt9LCByZWZyZXNoVG9rZW5QYXlsb2FkKSwgeyB0eXBlOiBUb2tlblR5cGUucmVmcmVzaCB9KSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgfVxuICAgIHJldm9rZVRva2VuKHRva2VuSWQpIHtcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgIGNvbnN0IHsgY29udGV4dCB9ID0gdGhpcy5wcm9wcztcbiAgICAgICAgICAgIGNvbnN0IHsgc2VxdWVsaXplIH0gPSBjb250ZXh0O1xuICAgICAgICAgICAgeWllbGQgbW9kZWxzXzEuVG9rZW5zTW9kZWwoc2VxdWVsaXplKS5kZXN0cm95KHtcbiAgICAgICAgICAgICAgICB3aGVyZToge1xuICAgICAgICAgICAgICAgICAgICBpZDogdG9rZW5JZCxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBjaGVja1Rva2VuRXhpc3QodG9rZW5JZCkge1xuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgY29uc3QgeyBjb250ZXh0IH0gPSB0aGlzLnByb3BzO1xuICAgICAgICAgICAgY29uc3QgeyBzZXF1ZWxpemUgfSA9IGNvbnRleHQ7XG4gICAgICAgICAgICBjb25zdCB0b2tlbkRhdGEgPSB5aWVsZCBtb2RlbHNfMS5Ub2tlbnNNb2RlbChzZXF1ZWxpemUpLmZpbmRCeVBrKHRva2VuSWQsIHtcbiAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzOiBbJ2lkJ10sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiB0b2tlbkRhdGEgIT09IG51bGw7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBnZXRBY2NvdW50QnlMb2dpbihsb2dpbikge1xuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgY29uc3QgeyBjb250ZXh0IH0gPSB0aGlzLnByb3BzO1xuICAgICAgICAgICAgY29uc3QgeyBzZXF1ZWxpemUgfSA9IGNvbnRleHQ7XG4gICAgICAgICAgICBjb25zdCBhY2NvdW50ID0geWllbGQgbW9kZWxzXzEuQWNjb3VudHNNb2RlbChzZXF1ZWxpemUpLmZpbmRPbmUoe1xuICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXM6IFsnaWQnLCAncGFzc3dvcmQnLCAnc3RhdHVzJ10sXG4gICAgICAgICAgICAgICAgd2hlcmU6IHtcbiAgICAgICAgICAgICAgICAgICAgbG9naW4sXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBpZDogYWNjb3VudC5pZCxcbiAgICAgICAgICAgICAgICBwYXNzd29yZDogYWNjb3VudC5wYXNzd29yZCxcbiAgICAgICAgICAgICAgICBzdGF0dXM6IGFjY291bnQuc3RhdHVzLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHN0YXRpYyBzZW5kUmVzcG9uc2VFcnJvcihyZXNwb25zZXR5cGUsIHJlc3ApIHtcbiAgICAgICAgY29uc3QgZXJyb3JzID0gW107XG4gICAgICAgIHN3aXRjaCAocmVzcG9uc2V0eXBlKSB7XG4gICAgICAgICAgICBjYXNlICdhY2NvdW50Rm9yYmlkZGVuJzpcbiAgICAgICAgICAgICAgICBlcnJvcnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdBY2NvdW50IGxvY2tlZCcsXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICdBdXRob3JpemF0aW9uIGVycm9yJyxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2F1dGhlbnRpZmljYXRpb25SZXF1aXJlZCc6XG4gICAgICAgICAgICAgICAgZXJyb3JzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiAnQXV0aGVudGljYXRpb24gUmVxdWlyZWQnLFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnQXV0aG9yaXphdGlvbiBlcnJvcicsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdpc05vdEFSZWZyZXNoVG9rZW4nOlxuICAgICAgICAgICAgICAgIGVycm9ycy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogJ1Rva2VuIGVycm9yJyxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ0lzIG5vdCBhIHJlZnJlc2ggdG9rZW4nLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAndG9rZW5FeHBpcmVkJzpcbiAgICAgICAgICAgICAgICBlcnJvcnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdUb2tlbiBlcnJvcicsXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICdUaGlzIHRva2VuIGV4cGlyZWQnLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAndG9rZW5XYXNSZXZva2VkJzpcbiAgICAgICAgICAgICAgICBlcnJvcnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdUb2tlbiBlcnJvcicsXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICdUb2tlbiB3YXMgcmV2b2tlZCcsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdhY2NvdW50Tm90Rm91bmQnOlxuICAgICAgICAgICAgY2FzZSAnaW52YWxpZExvZ2luT3JQYXNzd29yZCc6XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGVycm9ycy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogJ0ludmFsaWQgbG9naW4gb3IgcGFzc3dvcmQnLFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnQXV0aG9yaXphdGlvbiBlcnJvcicsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3Auc3RhdHVzKDQwMSkuanNvbih7IGVycm9ycyB9KTtcbiAgICB9XG59XG5leHBvcnRzLkF1dGhlbnRpZmljYXRvciA9IEF1dGhlbnRpZmljYXRvcjtcbnZhciBSZXNwb25zZUVycm9yVHlwZTtcbihmdW5jdGlvbiAoUmVzcG9uc2VFcnJvclR5cGUpIHtcbiAgICBSZXNwb25zZUVycm9yVHlwZVtcImF1dGhlbnRpZmljYXRpb25SZXF1aXJlZFwiXSA9IFwiYXV0aGVudGlmaWNhdGlvblJlcXVpcmVkXCI7XG4gICAgUmVzcG9uc2VFcnJvclR5cGVbXCJhY2NvdW50Tm90Rm91bmRcIl0gPSBcImFjY291bnROb3RGb3VuZFwiO1xuICAgIFJlc3BvbnNlRXJyb3JUeXBlW1wiYWNjb3VudEZvcmJpZGRlblwiXSA9IFwiYWNjb3VudEZvcmJpZGRlblwiO1xuICAgIFJlc3BvbnNlRXJyb3JUeXBlW1wiaW52YWxpZExvZ2luT3JQYXNzd29yZFwiXSA9IFwiaW52YWxpZExvZ2luT3JQYXNzd29yZFwiO1xuICAgIFJlc3BvbnNlRXJyb3JUeXBlW1widG9rZW5FeHBpcmVkXCJdID0gXCJ0b2tlbkV4cGlyZWRcIjtcbiAgICBSZXNwb25zZUVycm9yVHlwZVtcImlzTm90QVJlZnJlc2hUb2tlblwiXSA9IFwiaXNOb3RBUmVmcmVzaFRva2VuXCI7XG4gICAgUmVzcG9uc2VFcnJvclR5cGVbXCJ0b2tlbldhc1Jldm9rZWRcIl0gPSBcInRva2VuV2FzUmV2b2tlZFwiO1xufSkoUmVzcG9uc2VFcnJvclR5cGUgPSBleHBvcnRzLlJlc3BvbnNlRXJyb3JUeXBlIHx8IChleHBvcnRzLlJlc3BvbnNlRXJyb3JUeXBlID0ge30pKTtcbnZhciBBY2NvdW50U3RhdHVzO1xuKGZ1bmN0aW9uIChBY2NvdW50U3RhdHVzKSB7XG4gICAgQWNjb3VudFN0YXR1c1tcImFsbG93ZWRcIl0gPSBcImFsbG93ZWRcIjtcbiAgICBBY2NvdW50U3RhdHVzW1wiZm9yYmlkZGVuXCJdID0gXCJmb3JiaWRkZW5cIjtcbn0pKEFjY291bnRTdGF0dXMgPSBleHBvcnRzLkFjY291bnRTdGF0dXMgfHwgKGV4cG9ydHMuQWNjb3VudFN0YXR1cyA9IHt9KSk7XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2F3YWl0ZXIgPSAodGhpcyAmJiB0aGlzLl9fYXdhaXRlcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xuICAgIGZ1bmN0aW9uIGFkb3B0KHZhbHVlKSB7IHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFAgPyB2YWx1ZSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUodmFsdWUpOyB9KTsgfVxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XG4gICAgfSk7XG59O1xudmFyIF9faW1wb3J0RGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnREZWZhdWx0KSB8fCBmdW5jdGlvbiAobW9kKSB7XG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBcImRlZmF1bHRcIjogbW9kIH07XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgYmNyeXB0anNfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiYmNyeXB0anNcIikpO1xuY29uc3QgZXhwcmVzc18xID0gcmVxdWlyZShcImV4cHJlc3NcIik7XG5jb25zdCBleHByZXNzX2FzeW5jX2hhbmRsZXJfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiZXhwcmVzcy1hc3luYy1oYW5kbGVyXCIpKTtcbmNvbnN0IGRldmljZV9kZXRlY3Rvcl9qc18xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCJkZXZpY2UtZGV0ZWN0b3ItanNcIikpO1xuY29uc3QgQXV0aGVudGlmaWNhdG9yXzEgPSByZXF1aXJlKFwiLi9BdXRoZW50aWZpY2F0b3JcIik7XG5jb25zdCBhdXRoZW50aWZpY2F0b3JNaWRkbGV3YXJlID0gKGNvbmZpZykgPT4ge1xuICAgIGNvbnN0IHsgY29udGV4dCwgYXV0aFVybCwgYWxsb3dlZFVybCB9ID0gY29uZmlnO1xuICAgIGNvbnN0IHsgZW5kcG9pbnQgfSA9IGNvbmZpZy5jb250ZXh0O1xuICAgIGNvbnN0IHsgcHVibGljS2V5IH0gPSBjb25maWcuY29udGV4dC5qd3Q7XG4gICAgY29uc3QgeyBsb2dnZXIgfSA9IGNvbnRleHQ7XG4gICAgY29uc3QgYXV0aGVudGlmaWNhdG9yID0gbmV3IEF1dGhlbnRpZmljYXRvcl8xLkF1dGhlbnRpZmljYXRvcih7IGNvbnRleHQgfSk7XG4gICAgY29uc3Qgcm91dGVyID0gZXhwcmVzc18xLlJvdXRlcigpO1xuICAgIHJvdXRlci5wb3N0KGAke2F1dGhVcmx9L2FjY2Vzcy10b2tlbmAsIGV4cHJlc3NfYXN5bmNfaGFuZGxlcl8xLmRlZmF1bHQoKHJlcSwgcmVzKSA9PiBfX2F3YWl0ZXIodm9pZCAwLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgY29uc3QgeyBib2R5LCBoZWFkZXJzIH0gPSByZXE7XG4gICAgICAgIGNvbnN0IHsgbG9naW4sIHBhc3N3b3JkIH0gPSBib2R5O1xuICAgICAgICBjb25zdCBkZXZpY2VEZXRlY3RvciA9IG5ldyBkZXZpY2VfZGV0ZWN0b3JfanNfMS5kZWZhdWx0KCk7XG4gICAgICAgIGNvbnN0IGRldmljZUluZm8gPSBkZXZpY2VEZXRlY3Rvci5wYXJzZShoZWFkZXJzWyd1c2VyLWFnZW50J10pO1xuICAgICAgICBsb2dnZXIuYXV0aC5pbmZvKCdBY2Nlc3MgdG9rZW4gcmVxdWVzdCcsIHsgbG9naW4gfSk7XG4gICAgICAgIGNvbnN0IGFjY291bnQgPSB5aWVsZCBhdXRoZW50aWZpY2F0b3IuZ2V0QWNjb3VudEJ5TG9naW4obG9naW4pO1xuICAgICAgICAvLyBhY2NvdW50IG5vdCBmb3VuZFxuICAgICAgICBpZiAoIWFjY291bnQgfHwgIWJjcnlwdGpzXzEuZGVmYXVsdC5jb21wYXJlU3luYyhwYXNzd29yZCwgYWNjb3VudC5wYXNzd29yZCkpIHtcbiAgICAgICAgICAgIGxvZ2dlci5hdXRoLmVycm9yKCdBY2NvdW50IG5vdCBmb3VuZCcsIHsgbG9naW4gfSk7XG4gICAgICAgICAgICByZXR1cm4gQXV0aGVudGlmaWNhdG9yXzEuQXV0aGVudGlmaWNhdG9yLnNlbmRSZXNwb25zZUVycm9yKEF1dGhlbnRpZmljYXRvcl8xLlJlc3BvbnNlRXJyb3JUeXBlLmFjY291bnROb3RGb3VuZCwgcmVzKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBhY2NvdW50IGxvY2tlZFxuICAgICAgICBpZiAoYWNjb3VudC5zdGF0dXMgPT09IEF1dGhlbnRpZmljYXRvcl8xLkFjY291bnRTdGF0dXMuZm9yYmlkZGVuICYmIGJjcnlwdGpzXzEuZGVmYXVsdC5jb21wYXJlU3luYyhwYXNzd29yZCwgYWNjb3VudC5wYXNzd29yZCkpIHtcbiAgICAgICAgICAgIGxvZ2dlci5hdXRoLmluZm8oJ0F1dGhlbnRpZmljYXRpb24gZm9yYmlkZGVuJywgeyBsb2dpbiB9KTtcbiAgICAgICAgICAgIHJldHVybiBBdXRoZW50aWZpY2F0b3JfMS5BdXRoZW50aWZpY2F0b3Iuc2VuZFJlc3BvbnNlRXJyb3IoQXV0aGVudGlmaWNhdG9yXzEuUmVzcG9uc2VFcnJvclR5cGUuYWNjb3VudEZvcmJpZGRlbiwgcmVzKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBzdWNjZXNzXG4gICAgICAgIGlmIChhY2NvdW50LnN0YXR1cyA9PT0gQXV0aGVudGlmaWNhdG9yXzEuQWNjb3VudFN0YXR1cy5hbGxvd2VkICYmIGJjcnlwdGpzXzEuZGVmYXVsdC5jb21wYXJlU3luYyhwYXNzd29yZCwgYWNjb3VudC5wYXNzd29yZCkpIHtcbiAgICAgICAgICAgIGNvbnN0IHRva2VucyA9IHlpZWxkIGF1dGhlbnRpZmljYXRvci5yZWdpc3RlclRva2Vucyh7XG4gICAgICAgICAgICAgICAgdXVpZDogYWNjb3VudC5pZCxcbiAgICAgICAgICAgICAgICBkZXZpY2VJbmZvLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cygyMDApLmpzb24oe1xuICAgICAgICAgICAgICAgIGFjY2Vzc1Rva2VuOiB0b2tlbnMuYWNjZXNzVG9rZW4udG9rZW4sXG4gICAgICAgICAgICAgICAgdG9rZW5UeXBlOiAnYmVhcmVyJyxcbiAgICAgICAgICAgICAgICBleHBpcmVzSW46IGNvbmZpZy5jb250ZXh0Lmp3dC5hY2Nlc3NUb2tlbkV4cGlyZXNJbixcbiAgICAgICAgICAgICAgICByZWZyZXNoVG9rZW46IHRva2Vucy5yZWZyZXNoVG9rZW4udG9rZW4sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gQXV0aGVudGlmaWNhdG9yXzEuQXV0aGVudGlmaWNhdG9yLnNlbmRSZXNwb25zZUVycm9yKEF1dGhlbnRpZmljYXRvcl8xLlJlc3BvbnNlRXJyb3JUeXBlLmFjY291bnROb3RGb3VuZCwgcmVzKTtcbiAgICB9KSkpO1xuICAgIHJvdXRlci5wb3N0KGAke2F1dGhVcmx9L3JlZnJlc2gtdG9rZW5gLCBleHByZXNzX2FzeW5jX2hhbmRsZXJfMS5kZWZhdWx0KChyZXEsIHJlcykgPT4gX19hd2FpdGVyKHZvaWQgMCwgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgIGNvbnN0IHsgYm9keSwgaGVhZGVycyB9ID0gcmVxO1xuICAgICAgICBjb25zdCB7IHRva2VuIH0gPSBib2R5O1xuICAgICAgICAvLyB0cnkgdG8gdmVyaWZ5IHJlZnJlc2ggdG9rZW5cbiAgICAgICAgY29uc3QgdG9rZW5QYXlsb2FkID0gQXV0aGVudGlmaWNhdG9yXzEuQXV0aGVudGlmaWNhdG9yLnZlcmlmeVRva2VuKHRva2VuLCBjb250ZXh0Lmp3dC5wdWJsaWNLZXkpO1xuICAgICAgICBpZiAodG9rZW5QYXlsb2FkLnR5cGUgIT09IEF1dGhlbnRpZmljYXRvcl8xLlRva2VuVHlwZS5yZWZyZXNoKSB7XG4gICAgICAgICAgICBsb2dnZXIuYXV0aC5pbmZvKCdUcmllZCB0byByZWZyZXNoIHRva2VuIGJ5IGFjY2VzcyB0b2tlbi4gUmVqZWN0ZWQnLCB7IHBheWxvYWQ6IHRva2VuUGF5bG9hZCB9KTtcbiAgICAgICAgICAgIHJldHVybiBBdXRoZW50aWZpY2F0b3JfMS5BdXRoZW50aWZpY2F0b3Iuc2VuZFJlc3BvbnNlRXJyb3IoQXV0aGVudGlmaWNhdG9yXzEuUmVzcG9uc2VFcnJvclR5cGUuaXNOb3RBUmVmcmVzaFRva2VuLCByZXMpO1xuICAgICAgICB9XG4gICAgICAgIC8vIGNoZWNrIHRvIHRva2VuIGV4aXN0XG4gICAgICAgIGlmICghKHlpZWxkIGF1dGhlbnRpZmljYXRvci5jaGVja1Rva2VuRXhpc3QodG9rZW5QYXlsb2FkLmlkKSkpIHtcbiAgICAgICAgICAgIGxvZ2dlci5hdXRoLmluZm8oJ1RyaWVkIHRvIHJlZnJlc2ggdG9rZW4gYnkgcmV2b2tlZCByZWZyZXNoIHRva2VuLiBSZWplY3RlZCcsIHsgcGF5bG9hZDogdG9rZW5QYXlsb2FkIH0pO1xuICAgICAgICAgICAgcmV0dXJuIEF1dGhlbnRpZmljYXRvcl8xLkF1dGhlbnRpZmljYXRvci5zZW5kUmVzcG9uc2VFcnJvcihBdXRoZW50aWZpY2F0b3JfMS5SZXNwb25zZUVycm9yVHlwZS50b2tlbldhc1Jldm9rZWQsIHJlcyk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZGV2aWNlRGV0ZWN0b3IgPSBuZXcgZGV2aWNlX2RldGVjdG9yX2pzXzEuZGVmYXVsdCgpO1xuICAgICAgICBjb25zdCBkZXZpY2VJbmZvID0gZGV2aWNlRGV0ZWN0b3IucGFyc2UoaGVhZGVyc1sndXNlci1hZ2VudCddKTtcbiAgICAgICAgLy8gcmV2b2tlIG9sZCBhY2Nlc3MgdG9rZW4gb2YgdGhpcyByZWZyZXNoXG4gICAgICAgIHlpZWxkIGF1dGhlbnRpZmljYXRvci5yZXZva2VUb2tlbih0b2tlblBheWxvYWQuYXNzb2NpYXRlZCk7XG4gICAgICAgIC8vIHJldm9rZSBvbGQgcmVmcmVzaCB0b2tlblxuICAgICAgICB5aWVsZCBhdXRoZW50aWZpY2F0b3IucmV2b2tlVG9rZW4odG9rZW5QYXlsb2FkLmlkKTtcbiAgICAgICAgLy8gY3JlYXRlIG5ldyB0b2tlbnNcbiAgICAgICAgY29uc3QgdG9rZW5zID0geWllbGQgYXV0aGVudGlmaWNhdG9yLnJlZ2lzdGVyVG9rZW5zKHtcbiAgICAgICAgICAgIHV1aWQ6IHRva2VuUGF5bG9hZC51dWlkLFxuICAgICAgICAgICAgZGV2aWNlSW5mbyxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDIwMCkuanNvbih7XG4gICAgICAgICAgICBhY2Nlc3NUb2tlbjogdG9rZW5zLmFjY2Vzc1Rva2VuLnRva2VuLFxuICAgICAgICAgICAgdG9rZW5UeXBlOiAnYmVhcmVyJyxcbiAgICAgICAgICAgIGV4cGlyZXNJbjogY29uZmlnLmNvbnRleHQuand0LmFjY2Vzc1Rva2VuRXhwaXJlc0luLFxuICAgICAgICAgICAgcmVmcmVzaFRva2VuOiB0b2tlbnMucmVmcmVzaFRva2VuLnRva2VuLFxuICAgICAgICB9KTtcbiAgICB9KSkpO1xuICAgIHJvdXRlci51c2UoZW5kcG9pbnQsIGV4cHJlc3NfYXN5bmNfaGFuZGxlcl8xLmRlZmF1bHQoKHJlcSwgcmVzLCBuZXh0KSA9PiBfX2F3YWl0ZXIodm9pZCAwLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgaWYgKGFsbG93ZWRVcmwuaW5jbHVkZXMocmVxLm9yaWdpbmFsVXJsKSkge1xuICAgICAgICAgICAgcmV0dXJuIG5leHQoKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB0b2tlbiA9IEF1dGhlbnRpZmljYXRvcl8xLkF1dGhlbnRpZmljYXRvci5leHRyYWN0VG9rZW4ocmVxKTtcbiAgICAgICAgQXV0aGVudGlmaWNhdG9yXzEuQXV0aGVudGlmaWNhdG9yLnZlcmlmeVRva2VuKHRva2VuLCBwdWJsaWNLZXkpO1xuICAgICAgICByZXR1cm4gQXV0aGVudGlmaWNhdG9yXzEuQXV0aGVudGlmaWNhdG9yLnNlbmRSZXNwb25zZUVycm9yKEF1dGhlbnRpZmljYXRvcl8xLlJlc3BvbnNlRXJyb3JUeXBlLmF1dGhlbnRpZmljYXRpb25SZXF1aXJlZCwgcmVzKTtcbiAgICB9KSkpO1xuICAgIHJldHVybiByb3V0ZXI7XG59O1xuZXhwb3J0cy5hdXRoZW50aWZpY2F0b3JNaWRkbGV3YXJlID0gYXV0aGVudGlmaWNhdG9yTWlkZGxld2FyZTtcbmV4cG9ydHMuZGVmYXVsdCA9IGF1dGhlbnRpZmljYXRvck1pZGRsZXdhcmU7XG4iLCJcInVzZSBzdHJpY3RcIjtcbmZ1bmN0aW9uIF9fZXhwb3J0KG0pIHtcbiAgICBmb3IgKHZhciBwIGluIG0pIGlmICghZXhwb3J0cy5oYXNPd25Qcm9wZXJ0eShwKSkgZXhwb3J0c1twXSA9IG1bcF07XG59XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5fX2V4cG9ydChyZXF1aXJlKFwiLi9BdXRoZW50aWZpY2F0b3JcIikpO1xuX19leHBvcnQocmVxdWlyZShcIi4vYXV0aGVudGlmaWNhdG9yTWlkZGxld2FyZVwiKSk7XG4vLyBUT0RPIFRlc3RzIHJldWlyZWRcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3Qgc2VxdWVsaXplXzEgPSByZXF1aXJlKFwic2VxdWVsaXplXCIpO1xuY2xhc3MgQWNjb3VudHNNb2RlbCBleHRlbmRzIHNlcXVlbGl6ZV8xLk1vZGVsIHtcbn1cbmNvbnN0IG1vZGVsRmFjdG9yeSA9IChzZXF1ZWxpemUpID0+IHtcbiAgICBBY2NvdW50c01vZGVsLmluaXQoe1xuICAgICAgICBpZDoge1xuICAgICAgICAgICAgdHlwZTogc2VxdWVsaXplXzEuRGF0YVR5cGVzLlNUUklORyxcbiAgICAgICAgICAgIGFsbG93TnVsbDogZmFsc2UsXG4gICAgICAgICAgICBwcmltYXJ5S2V5OiB0cnVlLFxuICAgICAgICB9LFxuICAgICAgICBuYW1lOiB7XG4gICAgICAgICAgICB0eXBlOiBzZXF1ZWxpemVfMS5EYXRhVHlwZXMuU1RSSU5HLFxuICAgICAgICAgICAgYWxsb3dOdWxsOiBmYWxzZSxcbiAgICAgICAgfSxcbiAgICAgICAgbG9naW46IHtcbiAgICAgICAgICAgIHR5cGU6IHNlcXVlbGl6ZV8xLkRhdGFUeXBlcy5TVFJJTkcsXG4gICAgICAgICAgICBhbGxvd051bGw6IGZhbHNlLFxuICAgICAgICB9LFxuICAgICAgICBwYXNzd29yZDoge1xuICAgICAgICAgICAgdHlwZTogc2VxdWVsaXplXzEuRGF0YVR5cGVzLlNUUklORyxcbiAgICAgICAgICAgIGFsbG93TnVsbDogZmFsc2UsXG4gICAgICAgIH0sXG4gICAgICAgIHN0YXR1czoge1xuICAgICAgICAgICAgdHlwZTogc2VxdWVsaXplXzEuRGF0YVR5cGVzLkVOVU0oJ2FsbG93ZWQnLCAnZm9yYmlkZGVuJyksXG4gICAgICAgICAgICBhbGxvd051bGw6IGZhbHNlLFxuICAgICAgICB9LFxuICAgICAgICBjcmVhdGVkQXQ6IHtcbiAgICAgICAgICAgIHR5cGU6IHNlcXVlbGl6ZV8xLkRhdGFUeXBlcy5EQVRFLFxuICAgICAgICAgICAgYWxsb3dOdWxsOiBmYWxzZSxcbiAgICAgICAgICAgIGRlZmF1bHRWYWx1ZTogc2VxdWVsaXplXzEuTk9XLFxuICAgICAgICB9LFxuICAgICAgICB1cGRhdGVkQXQ6IHtcbiAgICAgICAgICAgIHR5cGU6IHNlcXVlbGl6ZV8xLkRhdGFUeXBlcy5EQVRFLFxuICAgICAgICAgICAgYWxsb3dOdWxsOiBmYWxzZSxcbiAgICAgICAgICAgIGRlZmF1bHRWYWx1ZTogc2VxdWVsaXplXzEuTk9XLFxuICAgICAgICB9LFxuICAgIH0sIHtcbiAgICAgICAgc2VxdWVsaXplLFxuICAgICAgICBtb2RlbE5hbWU6ICdhY2NvdW50cycsXG4gICAgfSk7XG4gICAgcmV0dXJuIEFjY291bnRzTW9kZWw7XG59O1xuZXhwb3J0cy5kZWZhdWx0ID0gbW9kZWxGYWN0b3J5O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBzZXF1ZWxpemVfMSA9IHJlcXVpcmUoXCJzZXF1ZWxpemVcIik7XG5jbGFzcyBUb2tlbnNNb2RlbCBleHRlbmRzIHNlcXVlbGl6ZV8xLk1vZGVsIHtcbn1cbmNvbnN0IG1vZGVsRmFjdG9yeSA9IChzZXF1ZWxpemUpID0+IHtcbiAgICBUb2tlbnNNb2RlbC5pbml0KHtcbiAgICAgICAgaWQ6IHtcbiAgICAgICAgICAgIHR5cGU6IHNlcXVlbGl6ZV8xLkRhdGFUeXBlcy5TVFJJTkcsXG4gICAgICAgICAgICBhbGxvd051bGw6IGZhbHNlLFxuICAgICAgICAgICAgcHJpbWFyeUtleTogdHJ1ZSxcbiAgICAgICAgfSxcbiAgICAgICAgYXNzb2NpYXRlZDoge1xuICAgICAgICAgICAgdHlwZTogc2VxdWVsaXplXzEuRGF0YVR5cGVzLlNUUklORyxcbiAgICAgICAgICAgIGFsbG93TnVsbDogdHJ1ZSxcbiAgICAgICAgfSxcbiAgICAgICAgYWNjb3VudDoge1xuICAgICAgICAgICAgdHlwZTogc2VxdWVsaXplXzEuRGF0YVR5cGVzLlNUUklORyxcbiAgICAgICAgICAgIGFsbG93TnVsbDogdHJ1ZSxcbiAgICAgICAgfSxcbiAgICAgICAgY3JlYXRlZEF0OiB7XG4gICAgICAgICAgICB0eXBlOiBzZXF1ZWxpemVfMS5EYXRhVHlwZXMuREFURSxcbiAgICAgICAgICAgIGFsbG93TnVsbDogZmFsc2UsXG4gICAgICAgICAgICBkZWZhdWx0VmFsdWU6IHNlcXVlbGl6ZV8xLk5PVyxcbiAgICAgICAgfSxcbiAgICAgICAgdXBkYXRlZEF0OiB7XG4gICAgICAgICAgICB0eXBlOiBzZXF1ZWxpemVfMS5EYXRhVHlwZXMuREFURSxcbiAgICAgICAgICAgIGFsbG93TnVsbDogZmFsc2UsXG4gICAgICAgICAgICBkZWZhdWx0VmFsdWU6IHNlcXVlbGl6ZV8xLk5PVyxcbiAgICAgICAgfSxcbiAgICAgICAgZXhwaXJlZEF0OiB7XG4gICAgICAgICAgICB0eXBlOiBzZXF1ZWxpemVfMS5EYXRhVHlwZXMuREFURSxcbiAgICAgICAgICAgIGFsbG93TnVsbDogZmFsc2UsXG4gICAgICAgIH0sXG4gICAgICAgIHR5cGU6IHtcbiAgICAgICAgICAgIHR5cGU6IHNlcXVlbGl6ZV8xLkRhdGFUeXBlcy5FTlVNKCdhY2Nlc3MnLCAncmVmcmVzaCcpLFxuICAgICAgICAgICAgYWxsb3dOdWxsOiBmYWxzZSxcbiAgICAgICAgfSxcbiAgICAgICAgZGV2aWNlSW5mbzoge1xuICAgICAgICAgICAgdHlwZTogc2VxdWVsaXplXzEuRGF0YVR5cGVzLkpTT04sXG4gICAgICAgICAgICBhbGxvd051bGw6IHRydWUsXG4gICAgICAgIH0sXG4gICAgfSwge1xuICAgICAgICBzZXF1ZWxpemUsXG4gICAgICAgIG1vZGVsTmFtZTogJ3Rva2VucycsXG4gICAgfSk7XG4gICAgcmV0dXJuIFRva2Vuc01vZGVsO1xufTtcbmV4cG9ydHMuZGVmYXVsdCA9IG1vZGVsRmFjdG9yeTtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9faW1wb3J0RGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnREZWZhdWx0KSB8fCBmdW5jdGlvbiAobW9kKSB7XG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBcImRlZmF1bHRcIjogbW9kIH07XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgQWNjb3VudHNfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi9BY2NvdW50c1wiKSk7XG5leHBvcnRzLkFjY291bnRzTW9kZWwgPSBBY2NvdW50c18xLmRlZmF1bHQ7XG5jb25zdCBUb2tlbnNfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi9Ub2tlbnNcIikpO1xuZXhwb3J0cy5Ub2tlbnNNb2RlbCA9IFRva2Vuc18xLmRlZmF1bHQ7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IHNlcXVlbGl6ZV8xID0gcmVxdWlyZShcInNlcXVlbGl6ZVwiKTtcbmNvbnN0IHNlcXVlbGl6ZVByb3ZpZGVyID0gKG9wdGlvbnMpID0+IHtcbiAgICBjb25zdCBzZXF1ZWxpemUgPSBuZXcgc2VxdWVsaXplXzEuU2VxdWVsaXplKE9iamVjdC5hc3NpZ24oeyBkaWFsZWN0OiAncG9zdGdyZXMnIH0sIG9wdGlvbnMpKTtcbiAgICByZXR1cm4gc2VxdWVsaXplO1xufTtcbmV4cG9ydHMuc2VxdWVsaXplUHJvdmlkZXIgPSBzZXF1ZWxpemVQcm92aWRlcjtcbmV4cG9ydHMuZGVmYXVsdCA9IHNlcXVlbGl6ZVByb3ZpZGVyO1xuLy8gVE9ETyBUZXN0cyByZXVpcmVkXG4iLCJcInVzZSBzdHJpY3RcIjtcbmZ1bmN0aW9uIF9fZXhwb3J0KG0pIHtcbiAgICBmb3IgKHZhciBwIGluIG0pIGlmICghZXhwb3J0cy5oYXNPd25Qcm9wZXJ0eShwKSkgZXhwb3J0c1twXSA9IG1bcF07XG59XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5fX2V4cG9ydChyZXF1aXJlKFwiLi9zZXJ2ZXJcIikpO1xuX19leHBvcnQocmVxdWlyZShcIi4vYXV0aGVudGlmaWNhdG9yXCIpKTtcbl9fZXhwb3J0KHJlcXVpcmUoXCIuL2RhdGFiYXNlTWFuYWdlclwiKSk7XG5fX2V4cG9ydChyZXF1aXJlKFwiLi9sb2dnZXJcIikpO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jbGFzcyBCYWRSZXF1ZXN0RXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gICAgY29uc3RydWN0b3IobWVzc2FnZSwgbWV0YURhdGEpIHtcbiAgICAgICAgc3VwZXIobWVzc2FnZSk7XG4gICAgICAgIHRoaXMubmFtZSA9ICdCYWRSZXF1ZXN0RXJyb3InO1xuICAgICAgICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xuICAgICAgICB0aGlzLm1ldGFEYXRhID0gbWV0YURhdGE7XG4gICAgICAgIHRoaXMuc3RhdHVzID0gNDAwO1xuICAgICAgICAvLyBTZXQgdGhlIHByb3RvdHlwZSBleHBsaWNpdGx5LlxuICAgICAgICBPYmplY3Quc2V0UHJvdG90eXBlT2YodGhpcywgQmFkUmVxdWVzdEVycm9yLnByb3RvdHlwZSk7XG4gICAgfVxufVxuZXhwb3J0cy5kZWZhdWx0ID0gQmFkUmVxdWVzdEVycm9yO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jbGFzcyBGb3JiaWRkZW5FcnJvciBleHRlbmRzIEVycm9yIHtcbiAgICBjb25zdHJ1Y3RvcihtZXNzYWdlLCBtZXRhRGF0YSkge1xuICAgICAgICBzdXBlcihtZXNzYWdlKTtcbiAgICAgICAgdGhpcy5uYW1lID0gJ0ZvcmJpZGRlbkVycm9yJztcbiAgICAgICAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbiAgICAgICAgdGhpcy5tZXRhRGF0YSA9IG1ldGFEYXRhO1xuICAgICAgICB0aGlzLnN0YXR1cyA9IDUwMztcbiAgICAgICAgLy8gU2V0IHRoZSBwcm90b3R5cGUgZXhwbGljaXRseS5cbiAgICAgICAgT2JqZWN0LnNldFByb3RvdHlwZU9mKHRoaXMsIEZvcmJpZGRlbkVycm9yLnByb3RvdHlwZSk7XG4gICAgfVxufVxuZXhwb3J0cy5kZWZhdWx0ID0gRm9yYmlkZGVuRXJyb3I7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNsYXNzIE5vdEZvdW5kRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gICAgY29uc3RydWN0b3IobWVzc2FnZSwgbWV0YURhdGEpIHtcbiAgICAgICAgc3VwZXIobWVzc2FnZSk7XG4gICAgICAgIHRoaXMubmFtZSA9ICdOb3RGb3VuZEVycm9yJztcbiAgICAgICAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbiAgICAgICAgdGhpcy5tZXRhRGF0YSA9IG1ldGFEYXRhO1xuICAgICAgICB0aGlzLnN0YXR1cyA9IDQwNDtcbiAgICAgICAgLy8gU2V0IHRoZSBwcm90b3R5cGUgZXhwbGljaXRseS5cbiAgICAgICAgT2JqZWN0LnNldFByb3RvdHlwZU9mKHRoaXMsIE5vdEZvdW5kRXJyb3IucHJvdG90eXBlKTtcbiAgICB9XG59XG5leHBvcnRzLmRlZmF1bHQgPSBOb3RGb3VuZEVycm9yO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jbGFzcyBTZXJ2ZXJFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgICBjb25zdHJ1Y3RvcihtZXNzYWdlLCBtZXRhRGF0YSkge1xuICAgICAgICBzdXBlcihtZXNzYWdlKTtcbiAgICAgICAgdGhpcy5uYW1lID0gJ1NlcnZlckVycm9yJztcbiAgICAgICAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbiAgICAgICAgdGhpcy5tZXRhRGF0YSA9IG1ldGFEYXRhO1xuICAgICAgICB0aGlzLnN0YXR1cyA9IDUwMDtcbiAgICAgICAgLy8gU2V0IHRoZSBwcm90b3R5cGUgZXhwbGljaXRseS5cbiAgICAgICAgT2JqZWN0LnNldFByb3RvdHlwZU9mKHRoaXMsIFNlcnZlckVycm9yLnByb3RvdHlwZSk7XG4gICAgfVxufVxuZXhwb3J0cy5kZWZhdWx0ID0gU2VydmVyRXJyb3I7XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2ltcG9ydERlZmF1bHQgPSAodGhpcyAmJiB0aGlzLl9faW1wb3J0RGVmYXVsdCkgfHwgZnVuY3Rpb24gKG1vZCkge1xuICAgIHJldHVybiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSA/IG1vZCA6IHsgXCJkZWZhdWx0XCI6IG1vZCB9O1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IFNlcnZlckVycm9yXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4vU2VydmVyRXJyb3JcIikpO1xuZXhwb3J0cy5TZXJ2ZXJFcnJvciA9IFNlcnZlckVycm9yXzEuZGVmYXVsdDtcbmNvbnN0IEJhZFJlcXVlc3RFcnJvcl8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCIuL0JhZFJlcXVlc3RFcnJvclwiKSk7XG5leHBvcnRzLkJhZFJlcXVlc3RFcnJvciA9IEJhZFJlcXVlc3RFcnJvcl8xLmRlZmF1bHQ7XG5jb25zdCBGb3JiaWRkZW5FcnJvcl8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCIuL0ZvcmJpZGRlbkVycm9yXCIpKTtcbmV4cG9ydHMuRm9yYmlkZGVuRXJyb3IgPSBGb3JiaWRkZW5FcnJvcl8xLmRlZmF1bHQ7XG5jb25zdCBOb3RGb3VuZEVycm9yXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4vTm90Rm91bmRFcnJvclwiKSk7XG5leHBvcnRzLk5vdEZvdW5kRXJyb3IgPSBOb3RGb3VuZEVycm9yXzEuZGVmYXVsdDtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9fcmVzdCA9ICh0aGlzICYmIHRoaXMuX19yZXN0KSB8fCBmdW5jdGlvbiAocywgZSkge1xuICAgIHZhciB0ID0ge307XG4gICAgZm9yICh2YXIgcCBpbiBzKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHMsIHApICYmIGUuaW5kZXhPZihwKSA8IDApXG4gICAgICAgIHRbcF0gPSBzW3BdO1xuICAgIGlmIChzICE9IG51bGwgJiYgdHlwZW9mIE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMgPT09IFwiZnVuY3Rpb25cIilcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIHAgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKHMpOyBpIDwgcC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKGUuaW5kZXhPZihwW2ldKSA8IDAgJiYgT2JqZWN0LnByb3RvdHlwZS5wcm9wZXJ0eUlzRW51bWVyYWJsZS5jYWxsKHMsIHBbaV0pKVxuICAgICAgICAgICAgICAgIHRbcFtpXV0gPSBzW3BbaV1dO1xuICAgICAgICB9XG4gICAgcmV0dXJuIHQ7XG59O1xuZnVuY3Rpb24gX19leHBvcnQobSkge1xuICAgIGZvciAodmFyIHAgaW4gbSkgaWYgKCFleHBvcnRzLmhhc093blByb3BlcnR5KHApKSBleHBvcnRzW3BdID0gbVtwXTtcbn1cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbnJlcXVpcmUoXCJ3aW5zdG9uLWRhaWx5LXJvdGF0ZS1maWxlXCIpO1xuY29uc3QgbG9nZ2Vyc18xID0gcmVxdWlyZShcIi4vbG9nZ2Vyc1wiKTtcbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBpbXBvcnQvbm8tbXV0YWJsZS1leHBvcnRzXG5sZXQgbG9nZ2VyO1xuZXhwb3J0cy5sb2dnZXIgPSBsb2dnZXI7XG5leHBvcnRzLmNvbmZpZ3VyZUxvZ2dlciA9IChjb25maWcpID0+IHtcbiAgICBjb25zdCB7IGxvZ2dlcnMgfSA9IGNvbmZpZywgbG9nZ2VyQ29uZmlnID0gX19yZXN0KGNvbmZpZywgW1wibG9nZ2Vyc1wiXSk7XG4gICAgZXhwb3J0cy5sb2dnZXIgPSBsb2dnZXIgPSBPYmplY3QuYXNzaWduKHsgYXV0aDogbG9nZ2Vyc18xLmF1dGhMb2dnZXIobG9nZ2VyQ29uZmlnKSwgaHR0cDogbG9nZ2Vyc18xLmh0dHBMb2dnZXIobG9nZ2VyQ29uZmlnKSwgc2VydmVyOiBsb2dnZXJzXzEuc2VydmVyTG9nZ2VyKGxvZ2dlckNvbmZpZyksIHNxbDogbG9nZ2Vyc18xLnNxbExvZ2dlcihsb2dnZXJDb25maWcpIH0sIGxvZ2dlcnMpO1xuICAgIHJldHVybiBsb2dnZXI7XG59O1xuX19leHBvcnQocmVxdWlyZShcIi4vbWlkZGxld2FyZXNcIikpO1xuX19leHBvcnQocmVxdWlyZShcIi4vZXJyb3JIYW5kbGVyc1wiKSk7XG4vLyBUT0RPIFRlc3RzIHJldWlyZWRcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9faW1wb3J0RGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnREZWZhdWx0KSB8fCBmdW5jdGlvbiAobW9kKSB7XG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBcImRlZmF1bHRcIjogbW9kIH07XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3Qgd2luc3Rvbl8xID0gcmVxdWlyZShcIndpbnN0b25cIik7XG5yZXF1aXJlKFwid2luc3Rvbi1kYWlseS1yb3RhdGUtZmlsZVwiKTtcbmNvbnN0IGxvZ0Zvcm1hdHRlcl8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCIuLi91dGlscy9sb2dGb3JtYXR0ZXJcIikpO1xuZXhwb3J0cy5kZWZhdWx0ID0gKGNvbmZpZykgPT4ge1xuICAgIGNvbnN0IHsgbG9nUGF0aCB9ID0gY29uZmlnO1xuICAgIHJldHVybiB3aW5zdG9uXzEuY3JlYXRlTG9nZ2VyKHtcbiAgICAgICAgbGV2ZWw6ICdpbmZvJyxcbiAgICAgICAgZm9ybWF0OiBsb2dGb3JtYXR0ZXJfMS5kZWZhdWx0LFxuICAgICAgICB0cmFuc3BvcnRzOiBbXG4gICAgICAgICAgICBuZXcgd2luc3Rvbl8xLnRyYW5zcG9ydHMuRGFpbHlSb3RhdGVGaWxlKHtcbiAgICAgICAgICAgICAgICBmaWxlbmFtZTogYCR7bG9nUGF0aH0vJURBVEUlLWF1dGgubG9nYCxcbiAgICAgICAgICAgICAgICBsZXZlbDogJ2luZm8nLFxuICAgICAgICAgICAgICAgIGRhdGVQYXR0ZXJuOiAnWVlZWS1NTS1ERCcsXG4gICAgICAgICAgICAgICAgemlwcGVkQXJjaGl2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBtYXhTaXplOiAnMjBtJyxcbiAgICAgICAgICAgICAgICBtYXhGaWxlczogJzE0ZCcsXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIG5ldyB3aW5zdG9uXzEudHJhbnNwb3J0cy5EYWlseVJvdGF0ZUZpbGUoe1xuICAgICAgICAgICAgICAgIGZpbGVuYW1lOiBgJHtsb2dQYXRofS8lREFURSUtZGVidWcubG9nYCxcbiAgICAgICAgICAgICAgICBsZXZlbDogJ2RlYnVnJyxcbiAgICAgICAgICAgICAgICBkYXRlUGF0dGVybjogJ1lZWVktTU0tREQnLFxuICAgICAgICAgICAgICAgIHppcHBlZEFyY2hpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgbWF4U2l6ZTogJzIwbScsXG4gICAgICAgICAgICAgICAgbWF4RmlsZXM6ICcxNGQnLFxuICAgICAgICAgICAgfSksXG4gICAgICAgIF0sXG4gICAgfSk7XG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19pbXBvcnREZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydERlZmF1bHQpIHx8IGZ1bmN0aW9uIChtb2QpIHtcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IFwiZGVmYXVsdFwiOiBtb2QgfTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCB3aW5zdG9uXzEgPSByZXF1aXJlKFwid2luc3RvblwiKTtcbnJlcXVpcmUoXCJ3aW5zdG9uLWRhaWx5LXJvdGF0ZS1maWxlXCIpO1xuY29uc3QgbG9nRm9ybWF0dGVyXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4uL3V0aWxzL2xvZ0Zvcm1hdHRlclwiKSk7XG5leHBvcnRzLmRlZmF1bHQgPSAoY29uZmlnKSA9PiB7XG4gICAgY29uc3QgeyBsb2dQYXRoIH0gPSBjb25maWc7XG4gICAgcmV0dXJuIHdpbnN0b25fMS5jcmVhdGVMb2dnZXIoe1xuICAgICAgICBsZXZlbDogJ2luZm8nLFxuICAgICAgICBmb3JtYXQ6IGxvZ0Zvcm1hdHRlcl8xLmRlZmF1bHQsXG4gICAgICAgIHRyYW5zcG9ydHM6IFtcbiAgICAgICAgICAgIG5ldyB3aW5zdG9uXzEudHJhbnNwb3J0cy5EYWlseVJvdGF0ZUZpbGUoe1xuICAgICAgICAgICAgICAgIGZpbGVuYW1lOiBgJHtsb2dQYXRofS8lREFURSUtaHR0cC5sb2dgLFxuICAgICAgICAgICAgICAgIGxldmVsOiAnaW5mbycsXG4gICAgICAgICAgICAgICAgZGF0ZVBhdHRlcm46ICdZWVlZLU1NLUREJyxcbiAgICAgICAgICAgICAgICB6aXBwZWRBcmNoaXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgIG1heFNpemU6ICcyMG0nLFxuICAgICAgICAgICAgICAgIG1heEZpbGVzOiAnMTRkJyxcbiAgICAgICAgICAgIH0pLFxuICAgICAgICBdLFxuICAgIH0pO1xufTtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9faW1wb3J0RGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnREZWZhdWx0KSB8fCBmdW5jdGlvbiAobW9kKSB7XG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBcImRlZmF1bHRcIjogbW9kIH07XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3Qgc2VydmVyXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4vc2VydmVyXCIpKTtcbmV4cG9ydHMuc2VydmVyTG9nZ2VyID0gc2VydmVyXzEuZGVmYXVsdDtcbmNvbnN0IGF1dGhfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi9hdXRoXCIpKTtcbmV4cG9ydHMuYXV0aExvZ2dlciA9IGF1dGhfMS5kZWZhdWx0O1xuY29uc3Qgc3FsXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4vc3FsXCIpKTtcbmV4cG9ydHMuc3FsTG9nZ2VyID0gc3FsXzEuZGVmYXVsdDtcbmNvbnN0IGh0dHBfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi9odHRwXCIpKTtcbmV4cG9ydHMuaHR0cExvZ2dlciA9IGh0dHBfMS5kZWZhdWx0O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19pbXBvcnREZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydERlZmF1bHQpIHx8IGZ1bmN0aW9uIChtb2QpIHtcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IFwiZGVmYXVsdFwiOiBtb2QgfTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCB3aW5zdG9uXzEgPSByZXF1aXJlKFwid2luc3RvblwiKTtcbnJlcXVpcmUoXCJ3aW5zdG9uLWRhaWx5LXJvdGF0ZS1maWxlXCIpO1xuY29uc3QgbG9nRm9ybWF0dGVyXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4uL3V0aWxzL2xvZ0Zvcm1hdHRlclwiKSk7XG5leHBvcnRzLmRlZmF1bHQgPSAoY29uZmlnKSA9PiB7XG4gICAgY29uc3QgeyBsb2dQYXRoIH0gPSBjb25maWc7XG4gICAgcmV0dXJuIHdpbnN0b25fMS5jcmVhdGVMb2dnZXIoe1xuICAgICAgICBsZXZlbDogJ2RlYnVnJyxcbiAgICAgICAgZm9ybWF0OiBsb2dGb3JtYXR0ZXJfMS5kZWZhdWx0LFxuICAgICAgICB0cmFuc3BvcnRzOiBbXG4gICAgICAgICAgICBuZXcgd2luc3Rvbl8xLnRyYW5zcG9ydHMuRGFpbHlSb3RhdGVGaWxlKHtcbiAgICAgICAgICAgICAgICBmaWxlbmFtZTogYCR7bG9nUGF0aH0vJURBVEUlLWVycm9ycy5sb2dgLFxuICAgICAgICAgICAgICAgIGxldmVsOiAnZXJyb3InLFxuICAgICAgICAgICAgICAgIGRhdGVQYXR0ZXJuOiAnWVlZWS1NTS1ERCcsXG4gICAgICAgICAgICAgICAgemlwcGVkQXJjaGl2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBtYXhTaXplOiAnMjBtJyxcbiAgICAgICAgICAgICAgICBtYXhGaWxlczogJzE0ZCcsXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIG5ldyB3aW5zdG9uXzEudHJhbnNwb3J0cy5EYWlseVJvdGF0ZUZpbGUoe1xuICAgICAgICAgICAgICAgIGZpbGVuYW1lOiBgJHtsb2dQYXRofS8lREFURSUtZGVidWcubG9nYCxcbiAgICAgICAgICAgICAgICBsZXZlbDogJ2RlYnVnJyxcbiAgICAgICAgICAgICAgICBkYXRlUGF0dGVybjogJ1lZWVktTU0tREQnLFxuICAgICAgICAgICAgICAgIHppcHBlZEFyY2hpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgbWF4U2l6ZTogJzIwbScsXG4gICAgICAgICAgICAgICAgbWF4RmlsZXM6ICcxNGQnLFxuICAgICAgICAgICAgfSksXG4gICAgICAgIF0sXG4gICAgfSk7XG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19pbXBvcnREZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydERlZmF1bHQpIHx8IGZ1bmN0aW9uIChtb2QpIHtcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IFwiZGVmYXVsdFwiOiBtb2QgfTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCB3aW5zdG9uXzEgPSByZXF1aXJlKFwid2luc3RvblwiKTtcbnJlcXVpcmUoXCJ3aW5zdG9uLWRhaWx5LXJvdGF0ZS1maWxlXCIpO1xuY29uc3QgbG9nRm9ybWF0dGVyXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4uL3V0aWxzL2xvZ0Zvcm1hdHRlclwiKSk7XG5leHBvcnRzLmRlZmF1bHQgPSAoY29uZmlnKSA9PiB7XG4gICAgY29uc3QgeyBsb2dQYXRoIH0gPSBjb25maWc7XG4gICAgcmV0dXJuIHdpbnN0b25fMS5jcmVhdGVMb2dnZXIoe1xuICAgICAgICBsZXZlbDogJ2RlYnVnJyxcbiAgICAgICAgZm9ybWF0OiBsb2dGb3JtYXR0ZXJfMS5kZWZhdWx0LFxuICAgICAgICB0cmFuc3BvcnRzOiBbXG4gICAgICAgICAgICBuZXcgd2luc3Rvbl8xLnRyYW5zcG9ydHMuRGFpbHlSb3RhdGVGaWxlKHtcbiAgICAgICAgICAgICAgICBmaWxlbmFtZTogYCR7bG9nUGF0aH0vJURBVEUlLWRlYnVnLmxvZ2AsXG4gICAgICAgICAgICAgICAgbGV2ZWw6ICdkZWJ1ZycsXG4gICAgICAgICAgICAgICAgZGF0ZVBhdHRlcm46ICdZWVlZLU1NLUREJyxcbiAgICAgICAgICAgICAgICB6aXBwZWRBcmNoaXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgIG1heFNpemU6ICcyMG0nLFxuICAgICAgICAgICAgICAgIG1heEZpbGVzOiAnMTRkJyxcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgbmV3IHdpbnN0b25fMS50cmFuc3BvcnRzLkNvbnNvbGUoe1xuICAgICAgICAgICAgICAgIGxldmVsOiAnZXJyb3InLFxuICAgICAgICAgICAgfSksXG4gICAgICAgIF0sXG4gICAgfSk7XG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19pbXBvcnREZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydERlZmF1bHQpIHx8IGZ1bmN0aW9uIChtb2QpIHtcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IFwiZGVmYXVsdFwiOiBtb2QgfTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBjaGFsa18xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCJjaGFsa1wiKSk7XG5jb25zdCByZXNwb25zZUZvcm1hdHRlcl8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCJ+L2xvZ2dlci91dGlscy9yZXNwb25zZUZvcm1hdHRlclwiKSk7XG5leHBvcnRzLmRlZmF1bHQgPSAoY29uZmlnKSA9PiB7XG4gICAgY29uc3QgeyBjb250ZXh0IH0gPSBjb25maWc7XG4gICAgY29uc3QgeyBsb2dnZXIgfSA9IGNvbnRleHQ7XG4gICAgcmV0dXJuIFtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyc1xuICAgICAgICAoZXJyLCByZXEsIHJlcywgbmV4dCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgeyBzdGF0dXMsIHN0YWNrLCBuYW1lLCBtZXNzYWdlLCBtZXRhRGF0YSB9ID0gZXJyO1xuICAgICAgICAgICAgY29uc3QgeyBvcmlnaW5hbFVybCB9ID0gcmVxO1xuICAgICAgICAgICAgbG9nZ2VyLnNlcnZlci5lcnJvcihtZXNzYWdlID8gYCR7c3RhdHVzIHx8ICcnfSAke21lc3NhZ2V9YCA6ICdVbmtub3duIGVycm9yJywgeyBvcmlnaW5hbFVybCwgc3RhY2ssIG1ldGFEYXRhIH0pO1xuICAgICAgICAgICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAnZGV2ZWxvcG1lbnQnKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJycpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2NoYWxrXzEuZGVmYXVsdC5iZ1JlZC53aGl0ZSgnIEZhdGFsIEVycm9yICcpfSAke2NoYWxrXzEuZGVmYXVsdC5yZWQobmFtZSl9YCk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cobWVzc2FnZSwgbWV0YURhdGEpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCcnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlcy5zdGF0dXMoc3RhdHVzIHx8IDUwMCkuanNvbihyZXNwb25zZUZvcm1hdHRlcl8xLmRlZmF1bHQoe1xuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IG1lc3NhZ2UgfHwgJ1BsZWFzZSBjb250YWN0IHN5c3RlbSBhZG1pbmlzdHJhdG9yJyxcbiAgICAgICAgICAgICAgICBuYW1lOiBuYW1lIHx8ICdJbnRlcm5hbCBzZXJ2ZXIgZXJyb3InLFxuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9LFxuICAgICAgICAocmVxLCByZXMpID0+IHtcbiAgICAgICAgICAgIHJlcy5zdGF0dXMoNDA0KS5lbmQoKTtcbiAgICAgICAgfSxcbiAgICAgICAgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgICAgICByZXMuc3RhdHVzKDUwMykuZW5kKCk7XG4gICAgICAgIH0sXG4gICAgICAgIChyZXEsIHJlcykgPT4ge1xuICAgICAgICAgICAgcmVzLnN0YXR1cyg0MDApLmVuZCgpO1xuICAgICAgICB9LFxuICAgIF07XG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19pbXBvcnREZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydERlZmF1bHQpIHx8IGZ1bmN0aW9uIChtb2QpIHtcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IFwiZGVmYXVsdFwiOiBtb2QgfTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCByZXF1ZXN0SGFuZGxlcl8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCIuL3JlcXVlc3RIYW5kbGVyXCIpKTtcbmV4cG9ydHMucmVxdWVzdEhhbmRsZXJNaWRkbGV3YXJlID0gcmVxdWVzdEhhbmRsZXJfMS5kZWZhdWx0O1xuY29uc3QgZXJyb3JIYW5kbGVyXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4vZXJyb3JIYW5kbGVyXCIpKTtcbmV4cG9ydHMuZXJyb3JIYW5kbGVyTWlkZGxld2FyZSA9IGVycm9ySGFuZGxlcl8xLmRlZmF1bHQ7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuZGVmYXVsdCA9IChjb25maWcpID0+IHtcbiAgICBjb25zdCB7IGNvbnRleHQgfSA9IGNvbmZpZztcbiAgICBjb25zdCB7IGxvZ2dlciB9ID0gY29udGV4dDtcbiAgICByZXR1cm4gKHJlcSwgcmVzLCBuZXh0KSA9PiB7XG4gICAgICAgIGNvbnN0IHsgbWV0aG9kLCBvcmlnaW5hbFVybCwgaGVhZGVycyB9ID0gcmVxO1xuICAgICAgICBjb25zdCB4Rm9yd2FyZGVkRm9yID0gU3RyaW5nKHJlcS5oZWFkZXJzWyd4LWZvcndhcmRlZC1mb3InXSB8fCAnJykucmVwbGFjZSgvOlxcZCskLywgJycpO1xuICAgICAgICBjb25zdCBpcCA9IHhGb3J3YXJkZWRGb3IgfHwgcmVxLmNvbm5lY3Rpb24ucmVtb3RlQWRkcmVzcztcbiAgICAgICAgY29uc3QgaXBBZGRyZXNzID0gaXAgPT09ICcxMjcuMC4wLjEnIHx8IGlwID09PSAnOjoxJyA/ICdsb2NhbGhvc3QnIDogaXA7XG4gICAgICAgIGxvZ2dlci5odHRwLmluZm8oYCR7aXBBZGRyZXNzfSAke21ldGhvZH0gXCIke29yaWdpbmFsVXJsfVwiYCwgeyBoZWFkZXJzIH0pO1xuICAgICAgICByZXR1cm4gbmV4dCgpO1xuICAgIH07XG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCB3aW5zdG9uXzEgPSByZXF1aXJlKFwid2luc3RvblwiKTtcbmV4cG9ydHMuZGVmYXVsdCA9IHdpbnN0b25fMS5mb3JtYXQuY29tYmluZSh3aW5zdG9uXzEuZm9ybWF0Lm1ldGFkYXRhKCksIHdpbnN0b25fMS5mb3JtYXQuanNvbigpLCB3aW5zdG9uXzEuZm9ybWF0LnRpbWVzdGFtcCh7IGZvcm1hdDogJ1lZWVktTU0tRERUSEg6bW06c3NaWicgfSksIHdpbnN0b25fMS5mb3JtYXQuc3BsYXQoKSwgd2luc3Rvbl8xLmZvcm1hdC5wcmludGYoaW5mbyA9PiB7XG4gICAgY29uc3QgeyB0aW1lc3RhbXAsIGxldmVsLCBtZXNzYWdlLCBtZXRhZGF0YSB9ID0gaW5mbztcbiAgICBjb25zdCBtZXRhID0gSlNPTi5zdHJpbmdpZnkobWV0YWRhdGEpICE9PSAne30nID8gbWV0YWRhdGEgOiBudWxsO1xuICAgIHJldHVybiBgJHt0aW1lc3RhbXB9ICR7bGV2ZWx9OiAke21lc3NhZ2V9ICR7bWV0YSA/IEpTT04uc3RyaW5naWZ5KG1ldGEpIDogJyd9YDtcbn0pKTtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gKHByb3BzKSA9PiB7XG4gICAgY29uc3QgeyBuYW1lLCBtZXNzYWdlIH0gPSBwcm9wcztcbiAgICByZXR1cm4ge1xuICAgICAgICBlcnJvcnM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBuYW1lOiBuYW1lIHx8ICdVbmtub3duIEVycm9yJyxcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBtZXNzYWdlIHx8IG5hbWUgfHwgJ1Vua25vd24gRXJyb3InLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICB9O1xufTtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9faW1wb3J0RGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnREZWZhdWx0KSB8fCBmdW5jdGlvbiAobW9kKSB7XG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBcImRlZmF1bHRcIjogbW9kIH07XG59O1xudmFyIF9faW1wb3J0U3RhciA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnRTdGFyKSB8fCBmdW5jdGlvbiAobW9kKSB7XG4gICAgaWYgKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgcmV0dXJuIG1vZDtcbiAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgaWYgKG1vZCAhPSBudWxsKSBmb3IgKHZhciBrIGluIG1vZCkgaWYgKE9iamVjdC5oYXNPd25Qcm9wZXJ0eS5jYWxsKG1vZCwgaykpIHJlc3VsdFtrXSA9IG1vZFtrXTtcbiAgICByZXN1bHRbXCJkZWZhdWx0XCJdID0gbW9kO1xuICAgIHJldHVybiByZXN1bHQ7XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgcGF0aF8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCJwYXRoXCIpKTtcbmNvbnN0IGluZGV4XzEgPSByZXF1aXJlKFwifi9pbmRleFwiKTtcbmNvbnN0IGNhdGFsb2dfMSA9IF9faW1wb3J0U3RhcihyZXF1aXJlKFwifi9wbGF5Z3JvdW5kL3NjaGVtYXMvY2F0YWxvZ1wiKSk7XG5jb25zdCBjYXRhbG9nTG9nZ2VyID0gY2F0YWxvZ18xLmNvbmZpZ3VyZUNhdGFsb2dMb2dnZXIoe1xuICAgIGxvZ1BhdGg6ICdsb2cnLFxufSk7XG5jb25zdCBsb2dnZXIgPSBpbmRleF8xLmNvbmZpZ3VyZUxvZ2dlcih7XG4gICAgbG9nUGF0aDogJ2xvZycsXG4gICAgbG9nZ2Vyczoge1xuICAgICAgICBjYXRhbG9nOiBjYXRhbG9nTG9nZ2VyLFxuICAgIH0sXG59KTtcbmNvbnN0IHNlcnZlciA9IG5ldyBpbmRleF8xLlNlcnZlcih7XG4gICAgZGF0YWJhc2U6IHtcbiAgICAgICAgZGF0YWJhc2U6ICdzZXJ2aWNlcycsXG4gICAgICAgIGhvc3Q6ICdlMWcucnUnLFxuICAgICAgICBwYXNzd29yZDogJ25vbnByb2ZpdHByb2plY3QnLFxuICAgICAgICB1c2VybmFtZTogJ3NlcnZpY2VzJyxcbiAgICB9LFxuICAgIGVuZHBvaW50OiAnL2FwaS9ncmFwaHFsJyxcbiAgICBqd3Q6IHtcbiAgICAgICAgYWNjZXNzVG9rZW5FeHBpcmVzSW46IDE4MDAsXG4gICAgICAgIGFsZ29yaXRobTogJ1JTMjU2JyxcbiAgICAgICAgaXNzdWVyOiAndmlhcHJvZml0LXNlcnZpY2VzJyxcbiAgICAgICAgcHJpdmF0ZUtleTogcGF0aF8xLmRlZmF1bHQucmVzb2x2ZShfX2Rpcm5hbWUsICcuL2NlcnQvand0UlMyNTYua2V5JyksXG4gICAgICAgIHB1YmxpY0tleTogcGF0aF8xLmRlZmF1bHQucmVzb2x2ZShfX2Rpcm5hbWUsICcuL2NlcnQvand0UlMyNTYua2V5LnB1YicpLFxuICAgICAgICByZWZyZXNoVG9rZW5FeHBpcmVzSW46IDIuNTkyZTYsXG4gICAgfSxcbiAgICBsb2dnZXIsXG4gICAgcG9ydDogNDAwMCxcbiAgICBzY2hlbWFzOiBbY2F0YWxvZ18xLmRlZmF1bHRdLFxufSk7XG5zZXJ2ZXIuc3RhcnRTZXJ2ZXIoKTtcbi8vIFRPRE8gVGVzdHMgcmV1aXJlZFxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19pbXBvcnREZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydERlZmF1bHQpIHx8IGZ1bmN0aW9uIChtb2QpIHtcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IFwiZGVmYXVsdFwiOiBtb2QgfTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBncmFwaHFsX3Rvb2xzXzEgPSByZXF1aXJlKFwiZ3JhcGhxbC10b29sc1wiKTtcbmNvbnN0IHNjaGVtYV9ncmFwaHFsXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4vc2NoZW1hLmdyYXBocWxcIikpO1xuY29uc3QgcmVzb2x2ZXJzXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4vcmVzb2x2ZXJzXCIpKTtcbmNvbnN0IGxvZ2dlcl8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCIuL2xvZ2dlclwiKSk7XG5leHBvcnRzLmNvbmZpZ3VyZUNhdGFsb2dMb2dnZXIgPSBsb2dnZXJfMS5kZWZhdWx0O1xuY29uc3Qgc2NoZW1hID0gZ3JhcGhxbF90b29sc18xLm1ha2VFeGVjdXRhYmxlU2NoZW1hKHtcbiAgICB0eXBlRGVmczogc2NoZW1hX2dyYXBocWxfMS5kZWZhdWx0LFxuICAgIHJlc29sdmVyczogcmVzb2x2ZXJzXzEuZGVmYXVsdCxcbn0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gc2NoZW1hO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCB3aW5zdG9uXzEgPSByZXF1aXJlKFwid2luc3RvblwiKTtcbnJlcXVpcmUoXCJ3aW5zdG9uLWRhaWx5LXJvdGF0ZS1maWxlXCIpO1xuZXhwb3J0cy5kZWZhdWx0ID0gKGNvbmZpZykgPT4ge1xuICAgIGNvbnN0IHsgbG9nUGF0aCB9ID0gY29uZmlnO1xuICAgIHJldHVybiB3aW5zdG9uXzEuY3JlYXRlTG9nZ2VyKHtcbiAgICAgICAgbGV2ZWw6ICdkZWJ1ZycsXG4gICAgICAgIGZvcm1hdDogd2luc3Rvbl8xLmZvcm1hdC5jb21iaW5lKHdpbnN0b25fMS5mb3JtYXQubWV0YWRhdGEoKSwgd2luc3Rvbl8xLmZvcm1hdC5qc29uKCksIHdpbnN0b25fMS5mb3JtYXQudGltZXN0YW1wKHsgZm9ybWF0OiAnWVlZWS1NTS1ERFRISDptbTpzc1paJyB9KSwgd2luc3Rvbl8xLmZvcm1hdC5zcGxhdCgpLCB3aW5zdG9uXzEuZm9ybWF0LnByaW50ZihpbmZvID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHsgdGltZXN0YW1wLCBsZXZlbCwgbWVzc2FnZSwgbWV0YWRhdGEgfSA9IGluZm87XG4gICAgICAgICAgICBjb25zdCBtZXRhID0gSlNPTi5zdHJpbmdpZnkobWV0YWRhdGEpICE9PSAne30nID8gbWV0YWRhdGEgOiBudWxsO1xuICAgICAgICAgICAgcmV0dXJuIGAke3RpbWVzdGFtcH0gJHtsZXZlbH06ICR7bWVzc2FnZX0gJHttZXRhID8gSlNPTi5zdHJpbmdpZnkobWV0YSkgOiAnJ31gO1xuICAgICAgICB9KSksXG4gICAgICAgIHRyYW5zcG9ydHM6IFtcbiAgICAgICAgICAgIG5ldyB3aW5zdG9uXzEudHJhbnNwb3J0cy5EYWlseVJvdGF0ZUZpbGUoe1xuICAgICAgICAgICAgICAgIGZpbGVuYW1lOiBgJHtsb2dQYXRofS8lREFURSUtY2F0YWxvZy5sb2dgLFxuICAgICAgICAgICAgICAgIGxldmVsOiAnZGVidWcnLFxuICAgICAgICAgICAgICAgIGRhdGVQYXR0ZXJuOiAnWVlZWS1NTS1ERCcsXG4gICAgICAgICAgICAgICAgemlwcGVkQXJjaGl2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBtYXhTaXplOiAnMjBtJyxcbiAgICAgICAgICAgICAgICBtYXhGaWxlczogJzE0ZCcsXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgXSxcbiAgICB9KTtcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IG11dGF0aW9uc18xID0gcmVxdWlyZShcIi4vbXV0YXRpb25zXCIpO1xuY29uc3QgcXVlcmllc18xID0gcmVxdWlyZShcIi4vcXVlcmllc1wiKTtcbmNvbnN0IHJlc29sdmVycyA9IHtcbiAgICBRdWVyeTogeyBuZXdzOiAoKSA9PiAoe30pIH0sXG4gICAgTXV0YXRpb246IHsgbmV3czogKCkgPT4gKHt9KSB9LFxuICAgIE5ld3NRdWVyaWVzOiBxdWVyaWVzXzEuTmV3c1F1ZXJpZXMsXG4gICAgTmV3c011dGF0aW9uczoge1xuICAgICAgICBjYXRlZ29yeTogKCkgPT4gKHt9KSxcbiAgICAgICAgaXRlbTogKCkgPT4gKHt9KSxcbiAgICB9LFxuICAgIENhdGVnb3J5TXV0YXRpb25zOiBtdXRhdGlvbnNfMS5DYXRlZ29yeU11dGF0aW9ucyxcbiAgICBJdGVtTXV0YXRpb25zOiBtdXRhdGlvbnNfMS5JdGVtTXV0YXRpb25zLFxufTtcbmV4cG9ydHMuZGVmYXVsdCA9IHJlc29sdmVycztcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9faW1wb3J0RGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnREZWZhdWx0KSB8fCBmdW5jdGlvbiAobW9kKSB7XG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBcImRlZmF1bHRcIjogbW9kIH07XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3Qgc2VydmljZV8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCIuLi9zZXJ2aWNlXCIpKTtcbmV4cG9ydHMuQ2F0ZWdvcnlNdXRhdGlvbnMgPSB7XG4gICAgY3JlYXRlOiAoKSA9PiB7XG4gICAgICAgIGNvbnN0IG5ld3MgPSBuZXcgc2VydmljZV8xLmRlZmF1bHQoKTtcbiAgICAgICAgcmV0dXJuIG5ld3MuZ2V0Q2F0ZWdvcnkoU3RyaW5nKDEwMCkpO1xuICAgIH0sXG4gICAgdXBkYXRlOiAocGFyZW50LCBhcmdzKSA9PiB7XG4gICAgICAgIGNvbnN0IHsgaWQgfSA9IGFyZ3M7XG4gICAgICAgIGNvbnN0IG5ld3MgPSBuZXcgc2VydmljZV8xLmRlZmF1bHQoKTtcbiAgICAgICAgcmV0dXJuIG5ld3MuZ2V0Q2F0ZWdvcnkoaWQpO1xuICAgIH0sXG4gICAgZGVsZXRlOiAoKSA9PiB0cnVlLFxufTtcbmV4cG9ydHMuSXRlbU11dGF0aW9ucyA9IHtcbiAgICBjcmVhdGU6ICgpID0+IHtcbiAgICAgICAgY29uc3QgbmV3cyA9IG5ldyBzZXJ2aWNlXzEuZGVmYXVsdCgpO1xuICAgICAgICByZXR1cm4gbmV3cy5nZXRJdGVtKFN0cmluZygxKSk7XG4gICAgfSxcbiAgICB1cGRhdGU6IChwYXJlbnQsIGFyZ3MpID0+IHtcbiAgICAgICAgY29uc3QgeyBpZCB9ID0gYXJncztcbiAgICAgICAgY29uc3QgbmV3cyA9IG5ldyBzZXJ2aWNlXzEuZGVmYXVsdCgpO1xuICAgICAgICByZXR1cm4gbmV3cy5nZXRJdGVtKGlkKTtcbiAgICB9LFxuICAgIGRlbGV0ZTogKCkgPT4gdHJ1ZSxcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2ltcG9ydERlZmF1bHQgPSAodGhpcyAmJiB0aGlzLl9faW1wb3J0RGVmYXVsdCkgfHwgZnVuY3Rpb24gKG1vZCkge1xuICAgIHJldHVybiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSA/IG1vZCA6IHsgXCJkZWZhdWx0XCI6IG1vZCB9O1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IHNlcnZpY2VfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi4vc2VydmljZVwiKSk7XG5leHBvcnRzLk5ld3NRdWVyaWVzID0ge1xuICAgIGNhdGVnb3JpZXM6IChzb3VyY2UsIGFyZ3MsIGNvbnRleHQpID0+IHtcbiAgICAgICAgY29uc3QgeyBsb2dnZXIgfSA9IGNvbnRleHQ7XG4gICAgICAgIGxvZ2dlci5jYXRhbG9nLmRlYnVnKCdSZXR1cm5zIGNhdGVnb3JpZXMgbGlzdCcpO1xuICAgICAgICBjb25zdCBuZXdzID0gbmV3IHNlcnZpY2VfMS5kZWZhdWx0KCk7XG4gICAgICAgIHJldHVybiBuZXdzLmdldENhdGVnb3JpZXNMaXN0KCk7XG4gICAgfSxcbiAgICBpdGVtOiAoc291cmNlLCBhcmdzLCBjb250ZXh0KSA9PiB7XG4gICAgICAgIGNvbnN0IHsgaWQgfSA9IGFyZ3M7XG4gICAgICAgIGNvbnN0IHsgbG9nZ2VyIH0gPSBjb250ZXh0O1xuICAgICAgICBsb2dnZXIuY2F0YWxvZy5kZWJ1ZygnUmV0dXJucyBJdGVtJyk7XG4gICAgICAgIGNvbnN0IG5ld3MgPSBuZXcgc2VydmljZV8xLmRlZmF1bHQoKTtcbiAgICAgICAgcmV0dXJuIG5ld3MuZ2V0SXRlbXNMaXN0KCkuZmluZChpID0+IGkuaWQgPT09IFN0cmluZyhpZCkpO1xuICAgIH0sXG4gICAgaXRlbXM6IChzb3VyY2UsIGFyZ3MsIGNvbnRleHQpID0+IHtcbiAgICAgICAgY29uc3QgeyBsb2dnZXIgfSA9IGNvbnRleHQ7XG4gICAgICAgIGNvbnN0IG5ld3MgPSBuZXcgc2VydmljZV8xLmRlZmF1bHQoKTtcbiAgICAgICAgbG9nZ2VyLmNhdGFsb2cuZGVidWcoJ1JldHVybnMgSXRlbXMgbGlzdCcpO1xuICAgICAgICByZXR1cm4gbmV3cy5nZXRJdGVtc0xpc3QoKTtcbiAgICB9LFxufTtcbmV4cG9ydHMuZGVmYXVsdCA9IGV4cG9ydHMuTmV3c1F1ZXJpZXM7XG4iLCJcbiAgICB2YXIgZG9jID0ge1wia2luZFwiOlwiRG9jdW1lbnRcIixcImRlZmluaXRpb25zXCI6W3tcImtpbmRcIjpcIk9iamVjdFR5cGVEZWZpbml0aW9uXCIsXCJuYW1lXCI6e1wia2luZFwiOlwiTmFtZVwiLFwidmFsdWVcIjpcIlF1ZXJ5XCJ9LFwiaW50ZXJmYWNlc1wiOltdLFwiZGlyZWN0aXZlc1wiOltdLFwiZmllbGRzXCI6W3tcImtpbmRcIjpcIkZpZWxkRGVmaW5pdGlvblwiLFwibmFtZVwiOntcImtpbmRcIjpcIk5hbWVcIixcInZhbHVlXCI6XCJuZXdzXCJ9LFwiYXJndW1lbnRzXCI6W10sXCJ0eXBlXCI6e1wia2luZFwiOlwiTm9uTnVsbFR5cGVcIixcInR5cGVcIjp7XCJraW5kXCI6XCJOYW1lZFR5cGVcIixcIm5hbWVcIjp7XCJraW5kXCI6XCJOYW1lXCIsXCJ2YWx1ZVwiOlwiTmV3c1F1ZXJpZXNcIn19fSxcImRpcmVjdGl2ZXNcIjpbXX1dfSx7XCJraW5kXCI6XCJPYmplY3RUeXBlRGVmaW5pdGlvblwiLFwibmFtZVwiOntcImtpbmRcIjpcIk5hbWVcIixcInZhbHVlXCI6XCJNdXRhdGlvblwifSxcImludGVyZmFjZXNcIjpbXSxcImRpcmVjdGl2ZXNcIjpbXSxcImZpZWxkc1wiOlt7XCJraW5kXCI6XCJGaWVsZERlZmluaXRpb25cIixcIm5hbWVcIjp7XCJraW5kXCI6XCJOYW1lXCIsXCJ2YWx1ZVwiOlwibmV3c1wifSxcImFyZ3VtZW50c1wiOltdLFwidHlwZVwiOntcImtpbmRcIjpcIk5vbk51bGxUeXBlXCIsXCJ0eXBlXCI6e1wia2luZFwiOlwiTmFtZWRUeXBlXCIsXCJuYW1lXCI6e1wia2luZFwiOlwiTmFtZVwiLFwidmFsdWVcIjpcIk5ld3NNdXRhdGlvbnNcIn19fSxcImRpcmVjdGl2ZXNcIjpbXX1dfSx7XCJraW5kXCI6XCJPYmplY3RUeXBlRGVmaW5pdGlvblwiLFwibmFtZVwiOntcImtpbmRcIjpcIk5hbWVcIixcInZhbHVlXCI6XCJOZXdzUXVlcmllc1wifSxcImludGVyZmFjZXNcIjpbXSxcImRpcmVjdGl2ZXNcIjpbXSxcImZpZWxkc1wiOlt7XCJraW5kXCI6XCJGaWVsZERlZmluaXRpb25cIixcIm5hbWVcIjp7XCJraW5kXCI6XCJOYW1lXCIsXCJ2YWx1ZVwiOlwiY2F0ZWdvcmllc1wifSxcImFyZ3VtZW50c1wiOltdLFwidHlwZVwiOntcImtpbmRcIjpcIk5vbk51bGxUeXBlXCIsXCJ0eXBlXCI6e1wia2luZFwiOlwiTGlzdFR5cGVcIixcInR5cGVcIjp7XCJraW5kXCI6XCJOYW1lZFR5cGVcIixcIm5hbWVcIjp7XCJraW5kXCI6XCJOYW1lXCIsXCJ2YWx1ZVwiOlwiQ2F0ZWdvcnlcIn19fX0sXCJkaXJlY3RpdmVzXCI6W119LHtcImtpbmRcIjpcIkZpZWxkRGVmaW5pdGlvblwiLFwibmFtZVwiOntcImtpbmRcIjpcIk5hbWVcIixcInZhbHVlXCI6XCJpdGVtc1wifSxcImFyZ3VtZW50c1wiOltdLFwidHlwZVwiOntcImtpbmRcIjpcIk5vbk51bGxUeXBlXCIsXCJ0eXBlXCI6e1wia2luZFwiOlwiTGlzdFR5cGVcIixcInR5cGVcIjp7XCJraW5kXCI6XCJOYW1lZFR5cGVcIixcIm5hbWVcIjp7XCJraW5kXCI6XCJOYW1lXCIsXCJ2YWx1ZVwiOlwiSXRlbVwifX19fSxcImRpcmVjdGl2ZXNcIjpbXX0se1wia2luZFwiOlwiRmllbGREZWZpbml0aW9uXCIsXCJuYW1lXCI6e1wia2luZFwiOlwiTmFtZVwiLFwidmFsdWVcIjpcIml0ZW1cIn0sXCJhcmd1bWVudHNcIjpbe1wia2luZFwiOlwiSW5wdXRWYWx1ZURlZmluaXRpb25cIixcIm5hbWVcIjp7XCJraW5kXCI6XCJOYW1lXCIsXCJ2YWx1ZVwiOlwiaWRcIn0sXCJ0eXBlXCI6e1wia2luZFwiOlwiTm9uTnVsbFR5cGVcIixcInR5cGVcIjp7XCJraW5kXCI6XCJOYW1lZFR5cGVcIixcIm5hbWVcIjp7XCJraW5kXCI6XCJOYW1lXCIsXCJ2YWx1ZVwiOlwiSURcIn19fSxcImRpcmVjdGl2ZXNcIjpbXX1dLFwidHlwZVwiOntcImtpbmRcIjpcIk5hbWVkVHlwZVwiLFwibmFtZVwiOntcImtpbmRcIjpcIk5hbWVcIixcInZhbHVlXCI6XCJJdGVtXCJ9fSxcImRpcmVjdGl2ZXNcIjpbXX1dfSx7XCJraW5kXCI6XCJPYmplY3RUeXBlRGVmaW5pdGlvblwiLFwibmFtZVwiOntcImtpbmRcIjpcIk5hbWVcIixcInZhbHVlXCI6XCJOZXdzTXV0YXRpb25zXCJ9LFwiaW50ZXJmYWNlc1wiOltdLFwiZGlyZWN0aXZlc1wiOltdLFwiZmllbGRzXCI6W3tcImtpbmRcIjpcIkZpZWxkRGVmaW5pdGlvblwiLFwibmFtZVwiOntcImtpbmRcIjpcIk5hbWVcIixcInZhbHVlXCI6XCJjYXRlZ29yeVwifSxcImFyZ3VtZW50c1wiOltdLFwidHlwZVwiOntcImtpbmRcIjpcIk5vbk51bGxUeXBlXCIsXCJ0eXBlXCI6e1wia2luZFwiOlwiTmFtZWRUeXBlXCIsXCJuYW1lXCI6e1wia2luZFwiOlwiTmFtZVwiLFwidmFsdWVcIjpcIkNhdGVnb3J5TXV0YXRpb25zXCJ9fX0sXCJkaXJlY3RpdmVzXCI6W119LHtcImtpbmRcIjpcIkZpZWxkRGVmaW5pdGlvblwiLFwibmFtZVwiOntcImtpbmRcIjpcIk5hbWVcIixcInZhbHVlXCI6XCJpdGVtXCJ9LFwiYXJndW1lbnRzXCI6W10sXCJ0eXBlXCI6e1wia2luZFwiOlwiTm9uTnVsbFR5cGVcIixcInR5cGVcIjp7XCJraW5kXCI6XCJOYW1lZFR5cGVcIixcIm5hbWVcIjp7XCJraW5kXCI6XCJOYW1lXCIsXCJ2YWx1ZVwiOlwiSXRlbU11dGF0aW9uc1wifX19LFwiZGlyZWN0aXZlc1wiOltdfV19LHtcImtpbmRcIjpcIk9iamVjdFR5cGVEZWZpbml0aW9uXCIsXCJuYW1lXCI6e1wia2luZFwiOlwiTmFtZVwiLFwidmFsdWVcIjpcIkl0ZW1NdXRhdGlvbnNcIn0sXCJpbnRlcmZhY2VzXCI6W10sXCJkaXJlY3RpdmVzXCI6W10sXCJmaWVsZHNcIjpbe1wia2luZFwiOlwiRmllbGREZWZpbml0aW9uXCIsXCJuYW1lXCI6e1wia2luZFwiOlwiTmFtZVwiLFwidmFsdWVcIjpcImNyZWF0ZVwifSxcImFyZ3VtZW50c1wiOlt7XCJraW5kXCI6XCJJbnB1dFZhbHVlRGVmaW5pdGlvblwiLFwibmFtZVwiOntcImtpbmRcIjpcIk5hbWVcIixcInZhbHVlXCI6XCJuYW1lXCJ9LFwidHlwZVwiOntcImtpbmRcIjpcIk5vbk51bGxUeXBlXCIsXCJ0eXBlXCI6e1wia2luZFwiOlwiTmFtZWRUeXBlXCIsXCJuYW1lXCI6e1wia2luZFwiOlwiTmFtZVwiLFwidmFsdWVcIjpcIlN0cmluZ1wifX19LFwiZGlyZWN0aXZlc1wiOltdfV0sXCJ0eXBlXCI6e1wia2luZFwiOlwiTm9uTnVsbFR5cGVcIixcInR5cGVcIjp7XCJraW5kXCI6XCJOYW1lZFR5cGVcIixcIm5hbWVcIjp7XCJraW5kXCI6XCJOYW1lXCIsXCJ2YWx1ZVwiOlwiSXRlbVwifX19LFwiZGlyZWN0aXZlc1wiOltdfSx7XCJraW5kXCI6XCJGaWVsZERlZmluaXRpb25cIixcIm5hbWVcIjp7XCJraW5kXCI6XCJOYW1lXCIsXCJ2YWx1ZVwiOlwidXBkYXRlXCJ9LFwiYXJndW1lbnRzXCI6W3tcImtpbmRcIjpcIklucHV0VmFsdWVEZWZpbml0aW9uXCIsXCJuYW1lXCI6e1wia2luZFwiOlwiTmFtZVwiLFwidmFsdWVcIjpcImlkXCJ9LFwidHlwZVwiOntcImtpbmRcIjpcIk5vbk51bGxUeXBlXCIsXCJ0eXBlXCI6e1wia2luZFwiOlwiTmFtZWRUeXBlXCIsXCJuYW1lXCI6e1wia2luZFwiOlwiTmFtZVwiLFwidmFsdWVcIjpcIkludFwifX19LFwiZGlyZWN0aXZlc1wiOltdfSx7XCJraW5kXCI6XCJJbnB1dFZhbHVlRGVmaW5pdGlvblwiLFwibmFtZVwiOntcImtpbmRcIjpcIk5hbWVcIixcInZhbHVlXCI6XCJuYW1lXCJ9LFwidHlwZVwiOntcImtpbmRcIjpcIk5vbk51bGxUeXBlXCIsXCJ0eXBlXCI6e1wia2luZFwiOlwiTmFtZWRUeXBlXCIsXCJuYW1lXCI6e1wia2luZFwiOlwiTmFtZVwiLFwidmFsdWVcIjpcIlN0cmluZ1wifX19LFwiZGlyZWN0aXZlc1wiOltdfV0sXCJ0eXBlXCI6e1wia2luZFwiOlwiTm9uTnVsbFR5cGVcIixcInR5cGVcIjp7XCJraW5kXCI6XCJOYW1lZFR5cGVcIixcIm5hbWVcIjp7XCJraW5kXCI6XCJOYW1lXCIsXCJ2YWx1ZVwiOlwiSXRlbVwifX19LFwiZGlyZWN0aXZlc1wiOltdfSx7XCJraW5kXCI6XCJGaWVsZERlZmluaXRpb25cIixcIm5hbWVcIjp7XCJraW5kXCI6XCJOYW1lXCIsXCJ2YWx1ZVwiOlwiZGVsZXRlXCJ9LFwiYXJndW1lbnRzXCI6W3tcImtpbmRcIjpcIklucHV0VmFsdWVEZWZpbml0aW9uXCIsXCJuYW1lXCI6e1wia2luZFwiOlwiTmFtZVwiLFwidmFsdWVcIjpcImlkXCJ9LFwidHlwZVwiOntcImtpbmRcIjpcIk5vbk51bGxUeXBlXCIsXCJ0eXBlXCI6e1wia2luZFwiOlwiTmFtZWRUeXBlXCIsXCJuYW1lXCI6e1wia2luZFwiOlwiTmFtZVwiLFwidmFsdWVcIjpcIkludFwifX19LFwiZGlyZWN0aXZlc1wiOltdfV0sXCJ0eXBlXCI6e1wia2luZFwiOlwiTm9uTnVsbFR5cGVcIixcInR5cGVcIjp7XCJraW5kXCI6XCJOYW1lZFR5cGVcIixcIm5hbWVcIjp7XCJraW5kXCI6XCJOYW1lXCIsXCJ2YWx1ZVwiOlwiQm9vbGVhblwifX19LFwiZGlyZWN0aXZlc1wiOltdfV19LHtcImtpbmRcIjpcIk9iamVjdFR5cGVEZWZpbml0aW9uXCIsXCJuYW1lXCI6e1wia2luZFwiOlwiTmFtZVwiLFwidmFsdWVcIjpcIkNhdGVnb3J5TXV0YXRpb25zXCJ9LFwiaW50ZXJmYWNlc1wiOltdLFwiZGlyZWN0aXZlc1wiOltdLFwiZmllbGRzXCI6W3tcImtpbmRcIjpcIkZpZWxkRGVmaW5pdGlvblwiLFwibmFtZVwiOntcImtpbmRcIjpcIk5hbWVcIixcInZhbHVlXCI6XCJjcmVhdGVcIn0sXCJhcmd1bWVudHNcIjpbe1wia2luZFwiOlwiSW5wdXRWYWx1ZURlZmluaXRpb25cIixcIm5hbWVcIjp7XCJraW5kXCI6XCJOYW1lXCIsXCJ2YWx1ZVwiOlwibmFtZVwifSxcInR5cGVcIjp7XCJraW5kXCI6XCJOb25OdWxsVHlwZVwiLFwidHlwZVwiOntcImtpbmRcIjpcIk5hbWVkVHlwZVwiLFwibmFtZVwiOntcImtpbmRcIjpcIk5hbWVcIixcInZhbHVlXCI6XCJTdHJpbmdcIn19fSxcImRpcmVjdGl2ZXNcIjpbXX1dLFwidHlwZVwiOntcImtpbmRcIjpcIk5vbk51bGxUeXBlXCIsXCJ0eXBlXCI6e1wia2luZFwiOlwiTmFtZWRUeXBlXCIsXCJuYW1lXCI6e1wia2luZFwiOlwiTmFtZVwiLFwidmFsdWVcIjpcIkNhdGVnb3J5XCJ9fX0sXCJkaXJlY3RpdmVzXCI6W119LHtcImtpbmRcIjpcIkZpZWxkRGVmaW5pdGlvblwiLFwibmFtZVwiOntcImtpbmRcIjpcIk5hbWVcIixcInZhbHVlXCI6XCJ1cGRhdGVcIn0sXCJhcmd1bWVudHNcIjpbe1wia2luZFwiOlwiSW5wdXRWYWx1ZURlZmluaXRpb25cIixcIm5hbWVcIjp7XCJraW5kXCI6XCJOYW1lXCIsXCJ2YWx1ZVwiOlwiaWRcIn0sXCJ0eXBlXCI6e1wia2luZFwiOlwiTm9uTnVsbFR5cGVcIixcInR5cGVcIjp7XCJraW5kXCI6XCJOYW1lZFR5cGVcIixcIm5hbWVcIjp7XCJraW5kXCI6XCJOYW1lXCIsXCJ2YWx1ZVwiOlwiSW50XCJ9fX0sXCJkaXJlY3RpdmVzXCI6W119LHtcImtpbmRcIjpcIklucHV0VmFsdWVEZWZpbml0aW9uXCIsXCJuYW1lXCI6e1wia2luZFwiOlwiTmFtZVwiLFwidmFsdWVcIjpcIm5hbWVcIn0sXCJ0eXBlXCI6e1wia2luZFwiOlwiTm9uTnVsbFR5cGVcIixcInR5cGVcIjp7XCJraW5kXCI6XCJOYW1lZFR5cGVcIixcIm5hbWVcIjp7XCJraW5kXCI6XCJOYW1lXCIsXCJ2YWx1ZVwiOlwiU3RyaW5nXCJ9fX0sXCJkaXJlY3RpdmVzXCI6W119XSxcInR5cGVcIjp7XCJraW5kXCI6XCJOb25OdWxsVHlwZVwiLFwidHlwZVwiOntcImtpbmRcIjpcIk5hbWVkVHlwZVwiLFwibmFtZVwiOntcImtpbmRcIjpcIk5hbWVcIixcInZhbHVlXCI6XCJDYXRlZ29yeVwifX19LFwiZGlyZWN0aXZlc1wiOltdfSx7XCJraW5kXCI6XCJGaWVsZERlZmluaXRpb25cIixcIm5hbWVcIjp7XCJraW5kXCI6XCJOYW1lXCIsXCJ2YWx1ZVwiOlwiZGVsZXRlXCJ9LFwiYXJndW1lbnRzXCI6W3tcImtpbmRcIjpcIklucHV0VmFsdWVEZWZpbml0aW9uXCIsXCJuYW1lXCI6e1wia2luZFwiOlwiTmFtZVwiLFwidmFsdWVcIjpcImlkXCJ9LFwidHlwZVwiOntcImtpbmRcIjpcIk5vbk51bGxUeXBlXCIsXCJ0eXBlXCI6e1wia2luZFwiOlwiTmFtZWRUeXBlXCIsXCJuYW1lXCI6e1wia2luZFwiOlwiTmFtZVwiLFwidmFsdWVcIjpcIkludFwifX19LFwiZGlyZWN0aXZlc1wiOltdfV0sXCJ0eXBlXCI6e1wia2luZFwiOlwiTm9uTnVsbFR5cGVcIixcInR5cGVcIjp7XCJraW5kXCI6XCJOYW1lZFR5cGVcIixcIm5hbWVcIjp7XCJraW5kXCI6XCJOYW1lXCIsXCJ2YWx1ZVwiOlwiQm9vbGVhblwifX19LFwiZGlyZWN0aXZlc1wiOltdfV19LHtcImtpbmRcIjpcIk9iamVjdFR5cGVEZWZpbml0aW9uXCIsXCJuYW1lXCI6e1wia2luZFwiOlwiTmFtZVwiLFwidmFsdWVcIjpcIkNhdGVnb3J5XCJ9LFwiaW50ZXJmYWNlc1wiOltdLFwiZGlyZWN0aXZlc1wiOltdLFwiZmllbGRzXCI6W3tcImtpbmRcIjpcIkZpZWxkRGVmaW5pdGlvblwiLFwibmFtZVwiOntcImtpbmRcIjpcIk5hbWVcIixcInZhbHVlXCI6XCJpZFwifSxcImFyZ3VtZW50c1wiOltdLFwidHlwZVwiOntcImtpbmRcIjpcIk5vbk51bGxUeXBlXCIsXCJ0eXBlXCI6e1wia2luZFwiOlwiTmFtZWRUeXBlXCIsXCJuYW1lXCI6e1wia2luZFwiOlwiTmFtZVwiLFwidmFsdWVcIjpcIkludFwifX19LFwiZGlyZWN0aXZlc1wiOltdfSx7XCJraW5kXCI6XCJGaWVsZERlZmluaXRpb25cIixcIm5hbWVcIjp7XCJraW5kXCI6XCJOYW1lXCIsXCJ2YWx1ZVwiOlwibmFtZVwifSxcImFyZ3VtZW50c1wiOltdLFwidHlwZVwiOntcImtpbmRcIjpcIk5vbk51bGxUeXBlXCIsXCJ0eXBlXCI6e1wia2luZFwiOlwiTmFtZWRUeXBlXCIsXCJuYW1lXCI6e1wia2luZFwiOlwiTmFtZVwiLFwidmFsdWVcIjpcIlN0cmluZ1wifX19LFwiZGlyZWN0aXZlc1wiOltdfV19LHtcImtpbmRcIjpcIk9iamVjdFR5cGVEZWZpbml0aW9uXCIsXCJuYW1lXCI6e1wia2luZFwiOlwiTmFtZVwiLFwidmFsdWVcIjpcIkl0ZW1cIn0sXCJpbnRlcmZhY2VzXCI6W10sXCJkaXJlY3RpdmVzXCI6W10sXCJmaWVsZHNcIjpbe1wia2luZFwiOlwiRmllbGREZWZpbml0aW9uXCIsXCJuYW1lXCI6e1wia2luZFwiOlwiTmFtZVwiLFwidmFsdWVcIjpcImlkXCJ9LFwiYXJndW1lbnRzXCI6W10sXCJ0eXBlXCI6e1wia2luZFwiOlwiTm9uTnVsbFR5cGVcIixcInR5cGVcIjp7XCJraW5kXCI6XCJOYW1lZFR5cGVcIixcIm5hbWVcIjp7XCJraW5kXCI6XCJOYW1lXCIsXCJ2YWx1ZVwiOlwiSW50XCJ9fX0sXCJkaXJlY3RpdmVzXCI6W119LHtcImtpbmRcIjpcIkZpZWxkRGVmaW5pdGlvblwiLFwibmFtZVwiOntcImtpbmRcIjpcIk5hbWVcIixcInZhbHVlXCI6XCJuYW1lXCJ9LFwiYXJndW1lbnRzXCI6W10sXCJ0eXBlXCI6e1wia2luZFwiOlwiTm9uTnVsbFR5cGVcIixcInR5cGVcIjp7XCJraW5kXCI6XCJOYW1lZFR5cGVcIixcIm5hbWVcIjp7XCJraW5kXCI6XCJOYW1lXCIsXCJ2YWx1ZVwiOlwiU3RyaW5nXCJ9fX0sXCJkaXJlY3RpdmVzXCI6W119XX1dLFwibG9jXCI6e1wic3RhcnRcIjowLFwiZW5kXCI6NTkzfX07XG4gICAgZG9jLmxvYy5zb3VyY2UgPSB7XCJib2R5XCI6XCJ0eXBlIFF1ZXJ5IHtcXG4gIG5ld3M6IE5ld3NRdWVyaWVzIVxcbn1cXG5cXG50eXBlIE11dGF0aW9uIHtcXG4gIG5ld3M6IE5ld3NNdXRhdGlvbnMhXFxufVxcblxcbnR5cGUgTmV3c1F1ZXJpZXMge1xcbiAgY2F0ZWdvcmllczogW0NhdGVnb3J5XSFcXG4gIGl0ZW1zOiBbSXRlbV0hXFxuICBpdGVtKGlkOiBJRCEpOiBJdGVtXFxufVxcblxcbnR5cGUgTmV3c011dGF0aW9ucyB7XFxuICBjYXRlZ29yeTogQ2F0ZWdvcnlNdXRhdGlvbnMhXFxuICBpdGVtOiBJdGVtTXV0YXRpb25zIVxcbn1cXG5cXG50eXBlIEl0ZW1NdXRhdGlvbnMge1xcbiAgY3JlYXRlKG5hbWU6IFN0cmluZyEpOiBJdGVtIVxcbiAgdXBkYXRlKGlkOiBJbnQhLCBuYW1lOiBTdHJpbmchKTogSXRlbSFcXG4gIGRlbGV0ZShpZDogSW50ISk6IEJvb2xlYW4hXFxufVxcblxcbnR5cGUgQ2F0ZWdvcnlNdXRhdGlvbnMge1xcbiAgY3JlYXRlKG5hbWU6IFN0cmluZyEpOiBDYXRlZ29yeSFcXG4gIHVwZGF0ZShpZDogSW50ISwgbmFtZTogU3RyaW5nISk6IENhdGVnb3J5IVxcbiAgZGVsZXRlKGlkOiBJbnQhKTogQm9vbGVhbiFcXG59XFxuXFxudHlwZSBDYXRlZ29yeSB7XFxuICBpZDogSW50IVxcbiAgbmFtZTogU3RyaW5nIVxcbn1cXG5cXG50eXBlIEl0ZW0ge1xcbiAgaWQ6IEludCFcXG4gIG5hbWU6IFN0cmluZyFcXG59XFxuXCIsXCJuYW1lXCI6XCJHcmFwaFFMIHJlcXVlc3RcIixcImxvY2F0aW9uT2Zmc2V0XCI6e1wibGluZVwiOjEsXCJjb2x1bW5cIjoxfX07XG4gIFxuXG4gICAgdmFyIG5hbWVzID0ge307XG4gICAgZnVuY3Rpb24gdW5pcXVlKGRlZnMpIHtcbiAgICAgIHJldHVybiBkZWZzLmZpbHRlcihcbiAgICAgICAgZnVuY3Rpb24oZGVmKSB7XG4gICAgICAgICAgaWYgKGRlZi5raW5kICE9PSAnRnJhZ21lbnREZWZpbml0aW9uJykgcmV0dXJuIHRydWU7XG4gICAgICAgICAgdmFyIG5hbWUgPSBkZWYubmFtZS52YWx1ZVxuICAgICAgICAgIGlmIChuYW1lc1tuYW1lXSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBuYW1lc1tuYW1lXSA9IHRydWU7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIClcbiAgICB9XG4gIFxuXG4gICAgICBtb2R1bGUuZXhwb3J0cyA9IGRvYztcbiAgICBcbiIsIlwidXNlIHN0cmljdFwiO1xuLy8gaW1wb3J0IHsgSUNvbnRleHQgfSBmcm9tICd+L2luZGV4Jztcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNsYXNzIENhdGFsb2dTZXJ2aWNlIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgLy8gcHJpdmF0ZSBrbmV4SGFuZGxlOiBJQ29udGV4dFsna25leEhhbmRsZSddO1xuICAgICAgICB0aGlzLmNhdGVnb3JpZXMgPSBbXG4gICAgICAgICAgICB7IGlkOiAnMTAwJywgbmFtZTogJ0NhdGVnb3J5IDEnIH0sXG4gICAgICAgICAgICB7IGlkOiAnMjAwJywgbmFtZTogJ0NhdGVnb3J5IDInIH0sXG4gICAgICAgICAgICB7IGlkOiAnMzAwJywgbmFtZTogJ0NhdGVnb3J5IDMnIH0sXG4gICAgICAgICAgICB7IGlkOiAnNDAwJywgbmFtZTogJ0NhdGVnb3J5IDQnIH0sXG4gICAgICAgIF07XG4gICAgICAgIHRoaXMuaXRlbXMgPSBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaWQ6ICcxNzg5MDAnLFxuICAgICAgICAgICAgICAgIG5hbWU6ICdJdGVtIDEnLFxuICAgICAgICAgICAgICAgIGNhdGVnb3J5OiAxMDAsXG4gICAgICAgICAgICAgICAgcHJpY2U6IDE2MDAuMCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaWQ6ICcyNzg5MDAnLFxuICAgICAgICAgICAgICAgIG5hbWU6ICdJdGVtIDInLFxuICAgICAgICAgICAgICAgIGNhdGVnb3J5OiAxMDAsXG4gICAgICAgICAgICAgICAgcHJpY2U6IDc2MDAuMCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaWQ6ICczNzg5MDAnLFxuICAgICAgICAgICAgICAgIG5hbWU6ICdJdGVtIDMnLFxuICAgICAgICAgICAgICAgIGNhdGVnb3J5OiAxMDAsXG4gICAgICAgICAgICAgICAgcHJpY2U6IDUyNTAuMCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaWQ6ICc0Nzg5MDAnLFxuICAgICAgICAgICAgICAgIG5hbWU6ICdJdGVtIDQnLFxuICAgICAgICAgICAgICAgIGNhdGVnb3J5OiAyMDAsXG4gICAgICAgICAgICAgICAgcHJpY2U6IDMwMC4wLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpZDogJzU3ODkwMCcsXG4gICAgICAgICAgICAgICAgbmFtZTogJ0l0ZW0gNScsXG4gICAgICAgICAgICAgICAgY2F0ZWdvcnk6IDIwMCxcbiAgICAgICAgICAgICAgICBwcmljZTogNjUyLjAsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGlkOiAnNjc4OTAwJyxcbiAgICAgICAgICAgICAgICBuYW1lOiAnSXRlbSA2JyxcbiAgICAgICAgICAgICAgICBjYXRlZ29yeTogMjAwLFxuICAgICAgICAgICAgICAgIHByaWNlOiA3MzAuMCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIF07XG4gICAgfVxuICAgIGdldEl0ZW1zTGlzdCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaXRlbXM7XG4gICAgfVxuICAgIGdldENhdGVnb3JpZXNMaXN0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jYXRlZ29yaWVzO1xuICAgIH1cbiAgICBnZXRJdGVtKGlkKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldEl0ZW1zTGlzdCgpLmZpbmQoaSA9PiBpLmlkID09PSBpZCk7XG4gICAgfVxuICAgIGdldENhdGVnb3J5KGlkKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldENhdGVnb3JpZXNMaXN0KCkuZmluZChjID0+IGMuaWQgPT09IGlkKTtcbiAgICB9XG59XG5leHBvcnRzLmRlZmF1bHQgPSBDYXRhbG9nU2VydmljZTtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9fYXdhaXRlciA9ICh0aGlzICYmIHRoaXMuX19hd2FpdGVyKSB8fCBmdW5jdGlvbiAodGhpc0FyZywgX2FyZ3VtZW50cywgUCwgZ2VuZXJhdG9yKSB7XG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XG4gICAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvci5uZXh0KHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHN0ZXAocmVzdWx0KSB7IHJlc3VsdC5kb25lID8gcmVzb2x2ZShyZXN1bHQudmFsdWUpIDogYWRvcHQocmVzdWx0LnZhbHVlKS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpOyB9XG4gICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTtcbiAgICB9KTtcbn07XG52YXIgX19pbXBvcnREZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydERlZmF1bHQpIHx8IGZ1bmN0aW9uIChtb2QpIHtcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IFwiZGVmYXVsdFwiOiBtb2QgfTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBjaGFsa18xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCJjaGFsa1wiKSk7XG5jb25zdCBjb3JzXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcImNvcnNcIikpO1xuY29uc3QgZXhwcmVzc18xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCJleHByZXNzXCIpKTtcbmNvbnN0IGV4cHJlc3NfZ3JhcGhxbF8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCJleHByZXNzLWdyYXBocWxcIikpO1xuY29uc3QgZ3JhcGhxbF8xID0gcmVxdWlyZShcImdyYXBocWxcIik7XG5jb25zdCBncmFwaHFsX3BsYXlncm91bmRfbWlkZGxld2FyZV9leHByZXNzXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcImdyYXBocWwtcGxheWdyb3VuZC1taWRkbGV3YXJlLWV4cHJlc3NcIikpO1xuY29uc3QgZ3JhcGhxbF90b29sc18xID0gcmVxdWlyZShcImdyYXBocWwtdG9vbHNcIik7XG5jb25zdCBtaWRkbGV3YXJlXzEgPSByZXF1aXJlKFwiZ3JhcGhxbC12b3lhZ2VyL21pZGRsZXdhcmVcIik7XG5jb25zdCBodHRwXzEgPSByZXF1aXJlKFwiaHR0cFwiKTtcbmNvbnN0IHN1YnNjcmlwdGlvbnNfdHJhbnNwb3J0X3dzXzEgPSByZXF1aXJlKFwic3Vic2NyaXB0aW9ucy10cmFuc3BvcnQtd3NcIik7XG5jb25zdCBhdXRoZW50aWZpY2F0b3JfMSA9IHJlcXVpcmUoXCJ+L2F1dGhlbnRpZmljYXRvclwiKTtcbmNvbnN0IGRhdGFiYXNlTWFuYWdlcl8xID0gcmVxdWlyZShcIn4vZGF0YWJhc2VNYW5hZ2VyXCIpO1xuY29uc3QgbG9nZ2VyXzEgPSByZXF1aXJlKFwifi9sb2dnZXJcIik7XG5jb25zdCBhcHAgPSBleHByZXNzXzEuZGVmYXVsdCgpO1xuY2xhc3MgU2VydmVyIHtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICB0aGlzLnByb3BzID0gcHJvcHM7XG4gICAgfVxuICAgIHN0YXJ0U2VydmVyKCkge1xuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgY29uc3QgeyBzY2hlbWFzLCBlbmRwb2ludCwgcG9ydCwgand0LCBkYXRhYmFzZSwgbG9nZ2VyIH0gPSB0aGlzLnByb3BzO1xuICAgICAgICAgICAgY29uc3Qgc3Vic2NyaXB0aW9uc0VuZHBvaW50ID0gJy9zdWJzY3JpcHRpb25zJztcbiAgICAgICAgICAgIGNvbnN0IHNjaGVtYSA9IGdyYXBocWxfdG9vbHNfMS5tZXJnZVNjaGVtYXMoeyBzY2hlbWFzIH0pO1xuICAgICAgICAgICAgY29uc3Qgcm91dGVzID0ge1xuICAgICAgICAgICAgICAgIGF1dGg6IGAke2VuZHBvaW50fS9hdXRoYCxcbiAgICAgICAgICAgICAgICBwbGF5Z3JvdW5kOiBgJHtlbmRwb2ludH0vcGxheWdyb3VuZGAsXG4gICAgICAgICAgICAgICAgdm95YWdlcjogYCR7ZW5kcG9pbnR9L3ZveWFnZXJgLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNvbnN0IHNlcXVlbGl6ZSA9IGRhdGFiYXNlTWFuYWdlcl8xLnNlcXVlbGl6ZVByb3ZpZGVyKE9iamVjdC5hc3NpZ24oeyBiZW5jaG1hcms6IHRydWUsIGxvZ2dpbmc6IChzcWwsIHRpbWluZykgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdkZXZlbG9wbWVudCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5zcWwuZGVidWcoc3FsLCB7IHF1ZXJ5VGltZU1zOiB0aW1pbmcgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IH0sIGRhdGFiYXNlKSk7XG4gICAgICAgICAgICBzZXF1ZWxpemVcbiAgICAgICAgICAgICAgICAuYXV0aGVudGljYXRlKClcbiAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLnNlcnZlci5kZWJ1ZygnVGVzdCB0aGUgY29ubmVjdGlvbiBieSB0cnlpbmcgdG8gYXV0aGVudGljYXRlIGlzIE9LJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5jYXRjaChlcnIgPT4ge1xuICAgICAgICAgICAgICAgIGxvZ2dlci5zZXJ2ZXIuZXJyb3IoZXJyLm5hbWUsIGVycik7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IGxvZ2dlcl8xLlNlcnZlckVycm9yKGVycik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNvbnN0IGNvbnRleHQgPSB7XG4gICAgICAgICAgICAgICAgZW5kcG9pbnQsXG4gICAgICAgICAgICAgICAgand0LFxuICAgICAgICAgICAgICAgIGxvZ2dlcixcbiAgICAgICAgICAgICAgICBzZXF1ZWxpemUsXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgLy8gVGhpcyBtaWRkbGV3YXJlIG11c3QgYmUgZGVmaW5lZCBmaXJzdFxuICAgICAgICAgICAgYXBwLnVzZShsb2dnZXJfMS5yZXF1ZXN0SGFuZGxlck1pZGRsZXdhcmUoeyBjb250ZXh0IH0pKTtcbiAgICAgICAgICAgIGFwcC51c2UoY29yc18xLmRlZmF1bHQoKSk7XG4gICAgICAgICAgICBhcHAudXNlKGV4cHJlc3NfMS5kZWZhdWx0Lmpzb24oeyBsaW1pdDogJzUwbWInIH0pKTtcbiAgICAgICAgICAgIGFwcC51c2UoZXhwcmVzc18xLmRlZmF1bHQudXJsZW5jb2RlZCh7IGV4dGVuZGVkOiB0cnVlLCBsaW1pdDogJzUwbWInIH0pKTtcbiAgICAgICAgICAgIGFwcC51c2UoYXV0aGVudGlmaWNhdG9yXzEuYXV0aGVudGlmaWNhdG9yTWlkZGxld2FyZSh7XG4gICAgICAgICAgICAgICAgY29udGV4dCxcbiAgICAgICAgICAgICAgICBhdXRoVXJsOiByb3V0ZXMuYXV0aCxcbiAgICAgICAgICAgICAgICBhbGxvd2VkVXJsOiBbcm91dGVzLnBsYXlncm91bmRdLFxuICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgYXBwLmdldChyb3V0ZXMucGxheWdyb3VuZCwgZ3JhcGhxbF9wbGF5Z3JvdW5kX21pZGRsZXdhcmVfZXhwcmVzc18xLmRlZmF1bHQoeyBlbmRwb2ludCB9KSk7XG4gICAgICAgICAgICBhcHAudXNlKHJvdXRlcy52b3lhZ2VyLCBtaWRkbGV3YXJlXzEuZXhwcmVzcyh7IGVuZHBvaW50VXJsOiBlbmRwb2ludCB9KSk7XG4gICAgICAgICAgICBhcHAudXNlKGVuZHBvaW50LCBleHByZXNzX2dyYXBocWxfMS5kZWZhdWx0KCgpID0+IF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKHtcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dCxcbiAgICAgICAgICAgICAgICAgICAgZ3JhcGhpcWw6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBzY2hlbWEsXG4gICAgICAgICAgICAgICAgICAgIHN1YnNjcmlwdGlvbnNFbmRwb2ludDogYHdzOi8vbG9jYWxob3N0OiR7cG9ydH0ke3N1YnNjcmlwdGlvbnNFbmRwb2ludH1gLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSkpKTtcbiAgICAgICAgICAgIC8vIHRoaXMgbWlkZGxld2FyZSBtb3N0IGJlIGRlZmluZWQgZmlyc3RcbiAgICAgICAgICAgIGFwcC51c2UobG9nZ2VyXzEuZXJyb3JIYW5kbGVyTWlkZGxld2FyZSh7IGNvbnRleHQgfSkpO1xuICAgICAgICAgICAgLy8gQ3JlYXRlIGxpc3RlbmVyIHNlcnZlciBieSB3cmFwcGluZyBleHByZXNzIGFwcFxuICAgICAgICAgICAgY29uc3Qgd2ViU2VydmVyID0gaHR0cF8xLmNyZWF0ZVNlcnZlcihhcHApO1xuICAgICAgICAgICAgd2ViU2VydmVyLmxpc3Rlbihwb3J0LCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLnNlcnZlci5kZWJ1ZygnU2VydmVyIHdhcyBzdGFydGVkJywgeyBwb3J0LCBlbmRwb2ludCwgcm91dGVzIH0pO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCcnKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnJyk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coY2hhbGtfMS5kZWZhdWx0LmdyZWVuKCc9PT09PT09PT0gR3JhcGhRTCA9PT09PT09PT0nKSk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJycpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2NoYWxrXzEuZGVmYXVsdC5ncmVlbignR3JhcGhRTCBzZXJ2ZXInKX06ICAgICAke2NoYWxrXzEuZGVmYXVsdC55ZWxsb3coYGh0dHA6Ly9sb2NhbGhvc3Q6JHtwb3J0fSR7ZW5kcG9pbnR9YCl9YCk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYCR7Y2hhbGtfMS5kZWZhdWx0Lm1hZ2VudGEoJ0dyYXBoUUwgcGxheWdyb3VuZCcpfTogJHtjaGFsa18xLmRlZmF1bHQueWVsbG93KGBodHRwOi8vbG9jYWxob3N0OiR7cG9ydH0ke3JvdXRlcy5wbGF5Z3JvdW5kfWApfWApO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2NoYWxrXzEuZGVmYXVsdC5jeWFuKCdBdXRoIFNlcnZlcicpfTogICAgICAgICR7Y2hhbGtfMS5kZWZhdWx0LnllbGxvdyhgaHR0cDovL2xvY2FsaG9zdDoke3BvcnR9JHtyb3V0ZXMuYXV0aH1gKX1gKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtjaGFsa18xLmRlZmF1bHQuYmx1ZSgnR3JhcGhRTCB2b3lhZ2VyJyl9OiAgICAke2NoYWxrXzEuZGVmYXVsdC55ZWxsb3coYGh0dHA6Ly9sb2NhbGhvc3Q6JHtwb3J0fSR7cm91dGVzLnZveWFnZXJ9YCl9YCk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJycpO1xuICAgICAgICAgICAgICAgIC8vIFNldCB1cCB0aGUgV2ViU29ja2V0IGZvciBoYW5kbGluZyBHcmFwaFFMIHN1YnNjcmlwdGlvbnMuXG4gICAgICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyc1xuICAgICAgICAgICAgICAgIGNvbnN0IHNzID0gbmV3IHN1YnNjcmlwdGlvbnNfdHJhbnNwb3J0X3dzXzEuU3Vic2NyaXB0aW9uU2VydmVyKHtcbiAgICAgICAgICAgICAgICAgICAgZXhlY3V0ZTogZ3JhcGhxbF8xLmV4ZWN1dGUsXG4gICAgICAgICAgICAgICAgICAgIHNjaGVtYSxcbiAgICAgICAgICAgICAgICAgICAgc3Vic2NyaWJlOiBncmFwaHFsXzEuc3Vic2NyaWJlLFxuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgcGF0aDogc3Vic2NyaXB0aW9uc0VuZHBvaW50LFxuICAgICAgICAgICAgICAgICAgICBzZXJ2ZXI6IHdlYlNlcnZlcixcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcHJvY2Vzcy5vbignU0lHSU5UJywgY29kZSA9PiB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLnNlcnZlci5kZWJ1ZyhgU2VydmVyIHdhcyBzdG9wcGVkLiBTSUdJTlQgdG8gZXhpdCB3aXRoIGNvZGU6ICR7Y29kZX1gKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG59XG5leHBvcnRzLlNlcnZlciA9IFNlcnZlcjtcbi8vIFRPRE8gVGVzdHMgcmV1aXJlZFxuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiYmNyeXB0anNcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiY2hhbGtcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiY29yc1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJkZXZpY2UtZGV0ZWN0b3ItanNcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiZXhwcmVzc1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJleHByZXNzLWFzeW5jLWhhbmRsZXJcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiZXhwcmVzcy1ncmFwaHFsXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImZzXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImdyYXBocWxcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiZ3JhcGhxbC1wbGF5Z3JvdW5kLW1pZGRsZXdhcmUtZXhwcmVzc1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJncmFwaHFsLXRvb2xzXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImdyYXBocWwtdm95YWdlci9taWRkbGV3YXJlXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImh0dHBcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwianNvbndlYnRva2VuXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIm1vbWVudC10aW1lem9uZVwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJwYXRoXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcInNlcXVlbGl6ZVwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJzdWJzY3JpcHRpb25zLXRyYW5zcG9ydC13c1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJ1dWlkL3Y0XCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIndpbnN0b25cIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwid2luc3Rvbi1kYWlseS1yb3RhdGUtZmlsZVwiKTsiXSwic291cmNlUm9vdCI6IiJ9