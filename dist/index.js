module.exports=function(e){var t={};function r(o){if(t[o])return t[o].exports;var n=t[o]={i:o,l:!1,exports:{}};return e[o].call(n.exports,n,n.exports,r),n.l=!0,n.exports}return r.m=e,r.c=t,r.d=function(e,t,o){r.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:o})},r.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},r.t=function(e,t){if(1&t&&(e=r(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var o=Object.create(null);if(r.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var n in e)r.d(o,n,function(t){return e[t]}.bind(null,n));return o},r.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return r.d(t,"a",t),t},r.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},r.p="",r(r.s=4)}([function(e,t){e.exports=require("winston-daily-rotate-file")},function(e,t){e.exports=require("winston")},function(e,t,r){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const o=r(1);t.default=o.format.combine(o.format.metadata(),o.format.json(),o.format.timestamp({format:"YYYY-MM-DDTHH:mm:ssZZ"}),o.format.splat(),o.format.printf(e=>{const{timestamp:t,level:r,message:o,metadata:n}=e,s="{}"!==JSON.stringify(n)?n:null;return`${t} ${r}: ${o} ${s?JSON.stringify(s):""}`}))},function(e,t,r){"use strict";var o=this&&this.__rest||function(e,t){var r={};for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&t.indexOf(o)<0&&(r[o]=e[o]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var n=0;for(o=Object.getOwnPropertySymbols(e);n<o.length;n++)t.indexOf(o[n])<0&&Object.prototype.propertyIsEnumerable.call(e,o[n])&&(r[o[n]]=e[o[n]])}return r};function n(e){for(var r in e)t.hasOwnProperty(r)||(t[r]=e[r])}Object.defineProperty(t,"__esModule",{value:!0}),r(0);const s=r(30);let i;t.logger=i,t.configureLogger=e=>{const{loggers:r}=e,n=o(e,["loggers"]);return t.logger=i=Object.assign({auth:s.authLogger(n),http:s.httpLogger(n),server:s.serverLogger(n),sql:s.sqlLogger(n)},r),i},n(r(35)),n(r(39))},function(e,t,r){"use strict";function o(e){for(var r in e)t.hasOwnProperty(r)||(t[r]=e[r])}Object.defineProperty(t,"__esModule",{value:!0}),o(r(6)),o(r(8)),o(r(11)),o(r(3)),o(r(46)),o(r(13))},function(e,t){e.exports=require("graphql")},function(e,t,r){"use strict";var o=this&&this.__awaiter||function(e,t,r,o){return new(r||(r=Promise))((function(n,s){function i(e){try{u(o.next(e))}catch(e){s(e)}}function a(e){try{u(o.throw(e))}catch(e){s(e)}}function u(e){var t;e.done?n(e.value):(t=e.value,t instanceof r?t:new r((function(e){e(t)}))).then(i,a)}u((o=o.apply(e,t||[])).next())}))},n=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const s=r(15),i=n(r(16)),a=n(r(7)),u=n(r(17)),c=n(r(18)),l=r(19),d=r(20),p=r(8),f=r(11),h=r(3),y=r(13);class g{static buildRoutes(e,t){return Object.assign({auth:`${e}/auth`,playground:`${e}/playground`,voyager:`${e}/voyager`},t)}static createApp(e){const t=a.default(),{schemas:r,endpoint:n,port:v,jwt:m,database:_,logger:b,routes:k,subscriptionsEndpoint:w,playgroundInProduction:x,voyagerInProduction:j}=e,T=!!x,O=!!j,M=l.mergeSchemas({schemas:[...r,y.infoSchema]}),P=g.buildRoutes(n,k),A={endpoint:n,jwt:m,logger:b,knex:f.knexProvider({logger:b,database:_}),emitter:new s.EventEmitter};return t.use(h.requestHandlerMiddleware({context:A})),t.use(i.default()),t.use(a.default.json({limit:"50mb"})),t.use(a.default.urlencoded({extended:!0,limit:"50mb"})),t.use(p.authentificatorMiddleware({context:A,authUrl:P.auth,allowedUrl:[P.playground]})),T&&t.get(P.playground,c.default({endpoint:n})),O&&t.use(P.voyager,d.express({endpointUrl:n})),t.use(n,u.default(()=>o(this,void 0,void 0,(function*(){return{context:A,graphiql:!1,schema:M,subscriptionsEndpoint:`ws://localhost:${v}${w}`}})))),t.use(h.errorHandlerMiddleware({context:A})),Object.assign(Object.assign({},e),{app:t,context:A,schema:M,routes:P})}}t.App=g,t.default=g},function(e,t){e.exports=require("express")},function(e,t,r){"use strict";function o(e){for(var r in e)t.hasOwnProperty(r)||(t[r]=e[r])}Object.defineProperty(t,"__esModule",{value:!0}),o(r(9)),o(r(24))},function(e,t,r){"use strict";var o=this&&this.__awaiter||function(e,t,r,o){return new(r||(r=Promise))((function(n,s){function i(e){try{u(o.next(e))}catch(e){s(e)}}function a(e){try{u(o.throw(e))}catch(e){s(e)}}function u(e){var t;e.done?n(e.value):(t=e.value,t instanceof r?t:new r((function(e){e(t)}))).then(i,a)}u((o=o.apply(e,t||[])).next())}))},n=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const s=n(r(10)),i=n(r(21)),a=n(r(22)),u=n(r(23)),c=r(4);var l;!function(e){e.access="access",e.refresh="refresh"}(l=t.TokenType||(t.TokenType={}));t.Authentificator=class{constructor(e){this.props=e}static extractToken(e){const{headers:t}=e,{authorization:r}=t,o=String(r).split(" ")[0],n=String(r).split(" ")[1];return"bearer"===o.toLocaleLowerCase()?n:""}static verifyToken(e,t){if(null===e||""===e)throw new c.UnauthorizedError("The token must be provided");try{const r=s.default.readFileSync(t);return i.default.verify(String(e),r)}catch(e){throw new c.UnauthorizedError("Token verification failed",e)}}registerTokens(e){return o(this,void 0,void 0,(function*(){const{context:t}=this.props,{knex:r,logger:o}=t,n=yield r.select(["id","roles"]).from("accounts").where({id:e.uuid}).first(),s=this.generateTokens({uuid:n.id,roles:n.roles});try{yield r("tokens").insert({id:s.accessToken.payload.id,account:s.accessToken.payload.uuid,type:l.access,deviceInfo:e.deviceInfo,expiredAt:a.default(s.accessToken.payload.exp).format()})}catch(e){throw new c.ServerError("Failed to register access token",e)}try{yield r("tokens").insert({id:s.refreshToken.payload.id,account:s.refreshToken.payload.uuid,type:l.refresh,associated:s.accessToken.payload.id,deviceInfo:e.deviceInfo,expiredAt:a.default(s.refreshToken.payload.exp).format()})}catch(e){throw new c.ServerError("Failed to register refresh token",e)}return o.auth.info("New Access token was registered",s.accessToken.payload),s}))}generateTokens(e){const{context:t}=this.props;try{s.default.accessSync(t.jwt.privateKey)}catch(e){throw new c.ServerError("Failed to open JWT privateKey file",{err:e})}const r=s.default.readFileSync(t.jwt.privateKey),o=Object.assign(Object.assign({},e),{type:l.access,id:u.default(),exp:Math.floor(Date.now()/1e3)+Number(t.jwt.accessTokenExpiresIn),iss:t.jwt.issuer}),n=Object.assign(Object.assign({},e),{type:l.refresh,id:u.default(),associated:o.id,exp:Math.floor(Date.now()/1e3)+Number(t.jwt.refreshTokenExpiresIn),iss:t.jwt.issuer}),a=i.default.sign(o,r,{algorithm:t.jwt.algorithm}),d=i.default.sign(n,r,{algorithm:t.jwt.algorithm});return{accessToken:{token:a,payload:Object.assign(Object.assign({},o),{type:l.access})},refreshToken:{token:d,payload:Object.assign(Object.assign({},n),{type:l.refresh})}}}revokeToken(e){return o(this,void 0,void 0,(function*(){const{context:t}=this.props,{knex:r}=t;yield r.del("tokens").where({id:e})}))}checkTokenExist(e){return o(this,void 0,void 0,(function*(){const{context:t}=this.props,{knex:r}=t;return null!==(yield r.select(["id"]).from("tokens").where({id:e}).first())}))}getAccountByLogin(e){return o(this,void 0,void 0,(function*(){const{context:t}=this.props,{knex:r}=t,o=yield r.select(["id","password","status"]).from("accounts").where({login:e}).first();return{id:o.id,password:o.password,status:o.status}}))}static sendResponseError(e,t){const r=[];switch(e){case"accountForbidden":r.push({message:"Account locked",name:"Authorization error"});break;case"authentificationRequired":r.push({message:"Authentication Required",name:"Authorization error"});break;case"isNotARefreshToken":r.push({message:"Token error",name:"Is not a refresh token"});break;case"tokenExpired":r.push({message:"Token error",name:"This token expired"});break;case"tokenWasRevoked":r.push({message:"Token error",name:"Token was revoked"});break;case"accountNotFound":case"invalidLoginOrPassword":default:r.push({message:"Invalid login or password",name:"Authorization error"})}return t.status(401).json({errors:r})}},function(e){e.authentificationRequired="authentificationRequired",e.accountNotFound="accountNotFound",e.accountForbidden="accountForbidden",e.invalidLoginOrPassword="invalidLoginOrPassword",e.tokenExpired="tokenExpired",e.isNotARefreshToken="isNotARefreshToken",e.tokenWasRevoked="tokenWasRevoked"}(t.ResponseErrorType||(t.ResponseErrorType={})),function(e){e.allowed="allowed",e.forbidden="forbidden"}(t.AccountStatus||(t.AccountStatus={}))},function(e,t){e.exports=require("fs")},function(e,t,r){"use strict";var o=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const n=r(28),s=o(r(29)),i=e=>{const{database:t,logger:r}=e,o={};let i=0;const a=s.default(t);return a.on("query",e=>{const t=e.__knexQueryUid;o[t]={position:i,query:e,startTime:n.performance.now(),finished:!1},i+=1}).on("query-response",(e,t)=>{const s=t.__knexQueryUid;o[s].endTime=n.performance.now(),o[s].finished=!0,r.sql.debug(t.sql,o[s])}).on("query-error",(e,t)=>{r.sql.error(t.sql,{err:e})}),a};t.knexProvider=i,t.default=i},function(e,t){e.exports=require("chalk")},function(e,t,r){"use strict";var o=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const n=o(r(45));t.infoSchema=n.default,t.default=n.default},function(e,t){e.exports=require("path")},function(e,t){e.exports=require("events")},function(e,t){e.exports=require("cors")},function(e,t){e.exports=require("express-graphql")},function(e,t){e.exports=require("graphql-playground-middleware-express")},function(e,t){e.exports=require("graphql-tools")},function(e,t){e.exports=require("graphql-voyager/middleware")},function(e,t){e.exports=require("jsonwebtoken")},function(e,t){e.exports=require("moment-timezone")},function(e,t){e.exports=require("uuid/v4")},function(e,t,r){"use strict";var o=this&&this.__awaiter||function(e,t,r,o){return new(r||(r=Promise))((function(n,s){function i(e){try{u(o.next(e))}catch(e){s(e)}}function a(e){try{u(o.throw(e))}catch(e){s(e)}}function u(e){var t;e.done?n(e.value):(t=e.value,t instanceof r?t:new r((function(e){e(t)}))).then(i,a)}u((o=o.apply(e,t||[])).next())}))},n=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const s=n(r(25)),i=n(r(26)),a=r(7),u=n(r(27)),c=r(9),l=e=>{const{context:t,authUrl:r,allowedUrl:n}=e,{endpoint:l}=e.context,{publicKey:d}=e.context.jwt,{logger:p}=t,f=new c.Authentificator({context:t}),h=a.Router();return h.post(`${r}/access-token`,u.default((t,r)=>o(void 0,void 0,void 0,(function*(){const{body:o,headers:n}=t,{login:a,password:u}=o,l=(new i.default).parse(n["user-agent"]);p.auth.info("Access token request",{login:a});const d=yield f.getAccountByLogin(a);if(!d||!s.default.compareSync(u,d.password))return p.auth.error("Account not found",{login:a}),c.Authentificator.sendResponseError(c.ResponseErrorType.accountNotFound,r);if(d.status===c.AccountStatus.forbidden&&s.default.compareSync(u,d.password))return p.auth.info("Authentification forbidden",{login:a}),c.Authentificator.sendResponseError(c.ResponseErrorType.accountForbidden,r);if(d.status===c.AccountStatus.allowed&&s.default.compareSync(u,d.password)){const t=yield f.registerTokens({uuid:d.id,deviceInfo:l});return r.status(200).json({accessToken:t.accessToken.token,tokenType:"bearer",expiresIn:e.context.jwt.accessTokenExpiresIn,refreshToken:t.refreshToken.token})}return c.Authentificator.sendResponseError(c.ResponseErrorType.accountNotFound,r)})))),h.post(`${r}/refresh-token`,u.default((r,n)=>o(void 0,void 0,void 0,(function*(){const{body:o,headers:s}=r,{token:a}=o,u=c.Authentificator.verifyToken(a,t.jwt.publicKey);if(u.type!==c.TokenType.refresh)return p.auth.info("Tried to refresh token by access token. Rejected",{payload:u}),c.Authentificator.sendResponseError(c.ResponseErrorType.isNotARefreshToken,n);if(!(yield f.checkTokenExist(u.id)))return p.auth.info("Tried to refresh token by revoked refresh token. Rejected",{payload:u}),c.Authentificator.sendResponseError(c.ResponseErrorType.tokenWasRevoked,n);const l=(new i.default).parse(s["user-agent"]);yield f.revokeToken(u.associated),yield f.revokeToken(u.id);const d=yield f.registerTokens({uuid:u.uuid,deviceInfo:l});return n.status(200).json({accessToken:d.accessToken.token,tokenType:"bearer",expiresIn:e.context.jwt.accessTokenExpiresIn,refreshToken:d.refreshToken.token})})))),h.post(`${r}/validate-token`,u.default((e,t)=>o(void 0,void 0,void 0,(function*(){const{body:r}=e,{token:o}=r,n=c.Authentificator.verifyToken(o,d);t.json(n)})))),h.use(l,u.default((e,t,r)=>o(void 0,void 0,void 0,(function*(){if(n.includes(e.originalUrl))return r();const t=c.Authentificator.extractToken(e);return c.Authentificator.verifyToken(t,d),r()})))),h};t.authentificatorMiddleware=l,t.default=l},function(e,t){e.exports=require("bcryptjs")},function(e,t){e.exports=require("device-detector-js")},function(e,t){e.exports=require("express-async-handler")},function(e,t){e.exports=require("perf_hooks")},function(e,t){e.exports=require("knex")},function(e,t,r){"use strict";var o=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const n=o(r(31));t.authLogger=n.default;const s=o(r(32));t.httpLogger=s.default;const i=o(r(33));t.serverLogger=i.default;const a=o(r(34));t.sqlLogger=a.default},function(e,t,r){"use strict";var o=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const n=r(1);r(0);const s=o(r(2));t.default=e=>{const{logPath:t}=e;return n.createLogger({level:"info",format:s.default,transports:[new n.transports.DailyRotateFile({filename:`${t}/%DATE%-auth.log`,level:"info",datePattern:"YYYY-MM-DD",zippedArchive:!0,maxSize:"20m",maxFiles:"14d"}),new n.transports.DailyRotateFile({filename:`${t}/%DATE%-debug.log`,level:"debug",datePattern:"YYYY-MM-DD",zippedArchive:!0,maxSize:"20m",maxFiles:"14d"})]})}},function(e,t,r){"use strict";var o=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const n=r(1);r(0);const s=o(r(2));t.default=e=>{const{logPath:t}=e;return n.createLogger({level:"info",format:s.default,transports:[new n.transports.DailyRotateFile({filename:`${t}/%DATE%-http.log`,level:"info",datePattern:"YYYY-MM-DD",zippedArchive:!0,maxSize:"20m",maxFiles:"14d"})]})}},function(e,t,r){"use strict";var o=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const n=r(1);r(0);const s=o(r(2));t.default=e=>{const{logPath:t}=e;return n.createLogger({level:"debug",format:s.default,transports:[new n.transports.DailyRotateFile({filename:`${t}/%DATE%-errors.log`,level:"error",datePattern:"YYYY-MM-DD",zippedArchive:!0,maxSize:"20m",maxFiles:"14d"}),new n.transports.DailyRotateFile({filename:`${t}/%DATE%-debug.log`,level:"debug",datePattern:"YYYY-MM-DD",zippedArchive:!0,maxSize:"20m",maxFiles:"14d"})]})}},function(e,t,r){"use strict";var o=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const n=r(1);r(0);const s=o(r(2));t.default=e=>{const{logPath:t}=e;return n.createLogger({level:"debug",format:s.default,transports:[new n.transports.DailyRotateFile({filename:`${t}/%DATE%-sql.log`,level:"debug",datePattern:"YYYY-MM-DD",zippedArchive:!0,maxSize:"20m",maxFiles:"14d"}),new n.transports.Console({level:"error"})]})}},function(e,t,r){"use strict";var o=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const n=o(r(36));t.errorHandlerMiddleware=n.default;const s=o(r(38));t.requestHandlerMiddleware=s.default},function(e,t,r){"use strict";var o=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});o(r(12));const n=o(r(37));t.default=e=>{const{context:t}=e,{logger:r}=t;return[(e,t,o,s)=>{const{status:i,stack:a,name:u,message:c,metaData:l}=e,{originalUrl:d}=t,p=c?`${i||""} ${c}`:"Unknown error";switch(i){case 401:r.auth.error(p,{originalUrl:d,stack:a,metaData:l});break;case 500:default:r.server.error(p,{originalUrl:d,stack:a,metaData:l})}o.status(i||500).json(n.default({message:c||"Please contact system administrator",name:u||"Internal server error"}))},(e,t)=>{t.status(404).end()},(e,t)=>{t.status(503).end()},(e,t)=>{t.status(400).end()}]}},function(e,t,r){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default=e=>{const{name:t,message:r}=e;return{errors:[{name:t||"Unknown Error",message:r||t||"Unknown Error"}]}}},function(e,t,r){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default=e=>{const{context:t}=e,{logger:r}=t;return(e,t,o)=>{const{method:n,originalUrl:s,headers:i}=e,a=String(e.headers["x-forwarded-for"]||"").replace(/:\d+$/,"")||e.connection.remoteAddress,u="127.0.0.1"===a||"::1"===a?"localhost":a;return r.http.info(`${u} ${n} "${s}"`,{headers:i}),o()}}},function(e,t,r){"use strict";var o=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const n=o(r(40));t.BadRequestError=n.default;const s=o(r(41));t.ForbiddenError=s.default;const i=o(r(42));t.NotFoundError=i.default;const a=o(r(43));t.ServerError=a.default;const u=o(r(44));t.UnauthorizedError=u.default},function(e,t,r){"use strict";Object.defineProperty(t,"__esModule",{value:!0});class o extends Error{constructor(e,t){super(e),this.name="BadRequestError",this.message=e,this.metaData=t,this.status=400,Object.setPrototypeOf(this,o.prototype)}}t.default=o},function(e,t,r){"use strict";Object.defineProperty(t,"__esModule",{value:!0});class o extends Error{constructor(e,t){super(e),this.name="ForbiddenError",this.message=e,this.metaData=t,this.status=503,Object.setPrototypeOf(this,o.prototype)}}t.default=o},function(e,t,r){"use strict";Object.defineProperty(t,"__esModule",{value:!0});class o extends Error{constructor(e,t){super(e),this.name="NotFoundError",this.message=e,this.metaData=t,this.status=404,Object.setPrototypeOf(this,o.prototype)}}t.default=o},function(e,t,r){"use strict";Object.defineProperty(t,"__esModule",{value:!0});class o extends Error{constructor(e,t){super(e),this.name="ServerError",this.message=e,this.metaData=t,this.status=500,Object.setPrototypeOf(this,o.prototype)}}t.default=o},function(e,t,r){"use strict";Object.defineProperty(t,"__esModule",{value:!0});class o extends Error{constructor(e,t){super(e),this.name="UnauthorizedError",this.message=e,this.metaData=t,this.status=401,Object.setPrototypeOf(this,o.prototype)}}t.default=o},function(e,t,r){"use strict";(function(e){var o=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const n=o(r(10)),s=o(r(14)),i=r(5),a=n.default.readFileSync(s.default.resolve(e,"..","..","..","package.json"),"utf8"),u=JSON.parse(a),c=new i.GraphQLObjectType({name:"DevInfo",fields:()=>({name:{description:"Application name",resolve:()=>u.name,type:new i.GraphQLNonNull(i.GraphQLString)},description:{description:"Application description",resolve:()=>u.description,type:new i.GraphQLNonNull(i.GraphQLString)},version:{description:"Application version number",resolve:()=>u.version,type:new i.GraphQLNonNull(i.GraphQLString)},author:{description:"Application author",resolve:()=>u.author,type:new i.GraphQLNonNull(i.GraphQLString)},support:{description:"Application support",resolve:()=>u.support,type:new i.GraphQLNonNull(i.GraphQLString)},license:{description:"Application license",resolve:()=>u.license,type:new i.GraphQLNonNull(i.GraphQLString)},repository:{resolve:()=>u.repository,type:new i.GraphQLNonNull(new i.GraphQLObjectType({name:"Repository",description:"Application repository",fields:()=>({type:{description:"Repository type",type:new i.GraphQLNonNull(i.GraphQLString),resolve:()=>u.repository.type},url:{description:"Repository URL addess",type:new i.GraphQLNonNull(i.GraphQLString),resolve:()=>u.repository.url}})}))}})}),l=new i.GraphQLSchema({query:new i.GraphQLObjectType({name:"Query",fields:()=>({devInfo:{description:"Application development info",resolve:()=>({}),type:new i.GraphQLNonNull(c)}})})});t.default=l}).call(this,"src/schemas/info")},function(e,t,r){"use strict";var o=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const n=r(47),s=o(r(12)),i=r(5),a=r(48),u=r(6),c=r(3);class l{static init(e){const{port:t,endpoint:r,subscriptionsEndpoint:o,logger:l,playgroundInProduction:d,voyagerInProduction:p}=e,f=!!d,h=!!p,{app:y,context:g,schema:v,routes:m}=u.App.createApp(e),_=n.createServer(y),{knex:b}=g;return b.raw("SELECT 1+1 AS result").then(()=>(l.server.debug("Test the connection by trying to authenticate is OK"),!0)).catch(e=>{throw l.server.error(e.name,e),new c.ServerError(e)}),_.listen(t,()=>{new a.SubscriptionServer({execute:i.execute,schema:v,subscribe:i.subscribe},{server:_,path:o}),console.log(""),console.log(""),console.log(s.default.green("========= GraphQL =========")),console.log(""),console.log(`${s.default.green("GraphQL server")}:     ${s.default.yellow(`http://localhost:${t}${r}`)}`),f&&console.log(`${s.default.magenta("GraphQL playground")}: ${s.default.yellow(`http://localhost:${t}${m.playground}`)}`),console.log(`${s.default.cyan("Auth Server")}:        ${s.default.yellow(`http://localhost:${t}${m.auth}`)}`),h&&console.log(`${s.default.blue("GraphQL voyager")}:    ${s.default.yellow(`http://localhost:${t}${m.voyager}`)}`),console.log("")}),_}}t.Core=l,t.default=l},function(e,t){e.exports=require("http")},function(e,t){e.exports=require("subscriptions-transport-ws")}]);