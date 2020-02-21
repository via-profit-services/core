module.exports=function(e){var t={};function n(r){if(t[r])return t[r].exports;var o=t[r]={i:r,l:!1,exports:{}};return e[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}return n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)n.d(r,o,function(t){return e[t]}.bind(null,o));return r},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=51)}([function(e,t){e.exports=require("winston-daily-rotate-file")},function(e,t){e.exports=require("winston")},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const r=n(1);t.default=r.format.combine(r.format.metadata(),r.format.json(),r.format.timestamp({format:"YYYY-MM-DDTHH:mm:ssZZ"}),r.format.splat(),r.format.printf(e=>{const{timestamp:t,level:n,message:r,metadata:o}=e,i="{}"!==JSON.stringify(o)?o:null;return`${t} ${n}: ${r} ${i?JSON.stringify(i):""}`}))},function(e,t){e.exports=require("graphql")},function(e,t,n){"use strict";function r(e){for(var n in e)t.hasOwnProperty(n)||(t[n]=e[n])}Object.defineProperty(t,"__esModule",{value:!0}),r(n(36)),r(n(42)),r(n(10))},function(e,t){e.exports=require("chalk")},function(e,t){e.exports=require("express")},function(e,t,n){"use strict";var r=this&&this.__awaiter||function(e,t,n,r){return new(n||(n=Promise))((function(o,i){function a(e){try{u(r.next(e))}catch(e){i(e)}}function s(e){try{u(r.throw(e))}catch(e){i(e)}}function u(e){var t;e.done?o(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(a,s)}u((r=r.apply(e,t||[])).next())}))},o=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const i=o(n(8)),a=o(n(25)),s=o(n(26)),u=o(n(9)),d=n(10);var l;!function(e){e.access="access",e.refresh="refresh"}(l=t.TokenType||(t.TokenType={}));t.Authentificator=class{constructor(e){this.props=e}static extractToken(e){const{headers:t}=e,{authorization:n}=t,r=String(n).split(" ")[0],o=String(n).split(" ")[1];return"bearer"===r.toLocaleLowerCase()?o:""}static verifyToken(e,t){if(null===e||""===e)throw new d.UnauthorizedError("The token must be provided");try{const n=i.default.readFileSync(t);return a.default.verify(String(e),n)}catch(e){throw new d.UnauthorizedError("Token verification failed",e)}}registerTokens(e){return r(this,void 0,void 0,(function*(){const{context:t}=this.props,{knex:n,logger:r}=t,o=yield n.select(["id","roles"]).from("accounts").where({id:e.uuid}).first(),i=this.generateTokens({uuid:o.id,roles:o.roles});try{yield n("tokens").insert({id:i.accessToken.payload.id,account:i.accessToken.payload.uuid,type:l.access,deviceInfo:e.deviceInfo,expiredAt:s.default(i.accessToken.payload.exp).format()})}catch(e){throw new d.ServerError("Failed to register access token",e)}try{yield n("tokens").insert({id:i.refreshToken.payload.id,account:i.refreshToken.payload.uuid,type:l.refresh,associated:i.accessToken.payload.id,deviceInfo:e.deviceInfo,expiredAt:s.default(i.refreshToken.payload.exp).format()})}catch(e){throw new d.ServerError("Failed to register refresh token",e)}return r.auth.info("New Access token was registered",i.accessToken.payload),i}))}generateTokens(e){const{context:t}=this.props;try{i.default.accessSync(t.jwt.privateKey)}catch(e){throw new d.ServerError("Failed to open JWT privateKey file",{err:e})}const n=i.default.readFileSync(t.jwt.privateKey),r=Object.assign(Object.assign({},e),{type:l.access,id:u.default(),exp:Math.floor(Date.now()/1e3)+Number(t.jwt.accessTokenExpiresIn),iss:t.jwt.issuer}),o=Object.assign(Object.assign({},e),{type:l.refresh,id:u.default(),associated:r.id,exp:Math.floor(Date.now()/1e3)+Number(t.jwt.refreshTokenExpiresIn),iss:t.jwt.issuer}),s=a.default.sign(r,n,{algorithm:t.jwt.algorithm}),c=a.default.sign(o,n,{algorithm:t.jwt.algorithm});return{accessToken:{token:s,payload:Object.assign(Object.assign({},r),{type:l.access})},refreshToken:{token:c,payload:Object.assign(Object.assign({},o),{type:l.refresh})}}}revokeToken(e){return r(this,void 0,void 0,(function*(){const{context:t}=this.props,{knex:n}=t;yield n.del("tokens").where({id:e})}))}checkTokenExist(e){return r(this,void 0,void 0,(function*(){const{context:t}=this.props,{knex:n}=t;return null!==(yield n.select(["id"]).from("tokens").where({id:e}).first())}))}getAccountByLogin(e){return r(this,void 0,void 0,(function*(){const{context:t}=this.props,{knex:n}=t,r=yield n.select(["id","password","status"]).from("accounts").where({login:e}).first();return{id:r.id,password:r.password,status:r.status}}))}static sendResponseError(e,t){const n=[];switch(e){case"accountForbidden":n.push({message:"Account locked",name:"Authorization error"});break;case"authentificationRequired":n.push({message:"Authentication Required",name:"Authorization error"});break;case"isNotARefreshToken":n.push({message:"Token error",name:"Is not a refresh token"});break;case"isNotAnAccessToken":n.push({message:"Token error",name:"Is not a access token"});break;case"tokenExpired":n.push({message:"Token error",name:"This token expired"});break;case"tokenWasRevoked":n.push({message:"Token error",name:"Token was revoked"});break;case"accountNotFound":case"invalidLoginOrPassword":default:n.push({message:"Invalid login or password",name:"Authorization error"})}return t.status(401).json({errors:n})}},function(e){e.authentificationRequired="authentificationRequired",e.accountNotFound="accountNotFound",e.accountForbidden="accountForbidden",e.invalidLoginOrPassword="invalidLoginOrPassword",e.tokenExpired="tokenExpired",e.isNotAnAccessToken="isNotAnAccessToken",e.isNotARefreshToken="isNotARefreshToken",e.tokenWasRevoked="tokenWasRevoked"}(t.ResponseErrorType||(t.ResponseErrorType={})),function(e){e.allowed="allowed",e.forbidden="forbidden"}(t.AccountStatus||(t.AccountStatus={}))},function(e,t){e.exports=require("fs")},function(e,t){e.exports=require("uuid/v4")},function(e,t,n){"use strict";var r=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const o=r(n(27));t.BadRequestError=o.default;const i=r(n(28));t.ForbiddenError=i.default;const a=r(n(29));t.NotFoundError=a.default;const s=r(n(30));t.ServerError=s.default;const u=r(n(31));t.UnauthorizedError=u.default},function(e,t){e.exports=require("graphql-tools")},function(e,t){e.exports=require("path")},function(e,t,n){"use strict";var r=this&&this.__awaiter||function(e,t,n,r){return new(n||(n=Promise))((function(o,i){function a(e){try{u(r.next(e))}catch(e){i(e)}}function s(e){try{u(r.throw(e))}catch(e){i(e)}}function u(e){var t;e.done?o(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(a,s)}u((r=r.apply(e,t||[])).next())}))},o=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const i=n(14),a=n(15),s=o(n(5)),u=o(n(16)),d=o(n(6)),l=o(n(17)),c=n(3),p=o(n(18)),f=n(11),m=n(19),y=n(20),h=n(21),g=n(32),v=n(4),k=n(46),N=n(48);class _{constructor(e){this.props=Object.assign({port:4e3,endpoint:"/graphql",subscriptionsEndpoint:"/subscriptions",usePlayground:!1,useVoyager:!1},e),this.props.routes=Object.assign({auth:"/auth",playground:"/playground",voyager:"/voyager"},this.props.routes)}bootstrap(){const{port:e,usePlayground:t,useVoyager:n,endpoint:r,routes:o}=this.props,{app:i,schema:s,context:u}=this.createApp(),{emitter:d}=u,l=a.createServer(i);l.listen(e,()=>{this.createSubscriptionServer({schema:s,server:l}),d.emit("VIAPROFIT_SERVER_STARTED",{port:e})})}createSubscriptionServer(e){const{subscriptionsEndpoint:t}=this.props,{server:n,schema:r}=e;return new y.SubscriptionServer({execute:c.execute,schema:r,subscribe:c.subscribe},{server:n,path:t})}createApp(){const e=d.default(),{schemas:t,endpoint:n,port:o,jwt:a,database:c,logger:y,routes:_,subscriptionsEndpoint:T,usePlayground:b,useVoyager:w}=this.props,D=f.mergeSchemas({schemas:[...t,k.infoSchema]}),x={endpoint:n,jwt:a,logger:y,knex:g.knexProvider({logger:y,database:c}),emitter:new i.EventEmitter};if(e.use(u.default()),e.use(d.default.json({limit:"50mb"})),e.use(d.default.urlencoded({extended:!0,limit:"50mb"})),e.use(v.requestHandlerMiddleware({context:x})),e.use(h.authentificatorMiddleware({context:x,authUrl:_.auth,allowedUrl:[_.playground]})),b&&e.get(_.playground,p.default({endpoint:n})),w){const{accessToken:t}=N.configureTokens([""],x);console.log(""),console.log(`${s.default.yellow.bold("Note: ")}${s.default.yellow("An access token was created specifically for GraphQL voyager")}`),console.log(`${s.default.yellow("This token was expire at")} ${s.default.yellowBright.bold(new Date(Date.now()+18e5))}`),console.log(s.default.yellow("After the token expires, you must restart the application")),e.use(_.voyager,m.express({endpointUrl:n,headersJS:JSON.stringify({Authorization:`Bearer ${t.token}`})}))}return e.use(n,l.default(()=>r(this,void 0,void 0,(function*(){return{context:x,graphiql:!1,schema:D,subscriptionsEndpoint:`ws://localhost:${o}${T}`}})))),e.use(v.errorHandlerMiddleware({context:x})),{app:e,context:x,schema:D,routes:_}}}t.App=_,t.default=_},function(e,t){e.exports=require("events")},function(e,t){e.exports=require("http")},function(e,t){e.exports=require("cors")},function(e,t){e.exports=require("express-graphql")},function(e,t){e.exports=require("graphql-playground-middleware-express")},function(e,t){e.exports=require("graphql-voyager/middleware")},function(e,t){e.exports=require("subscriptions-transport-ws")},function(e,t,n){"use strict";var r=this&&this.__awaiter||function(e,t,n,r){return new(n||(n=Promise))((function(o,i){function a(e){try{u(r.next(e))}catch(e){i(e)}}function s(e){try{u(r.throw(e))}catch(e){i(e)}}function u(e){var t;e.done?o(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(a,s)}u((r=r.apply(e,t||[])).next())}))},o=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const i=o(n(22)),a=o(n(23)),s=n(6),u=o(n(24)),d=n(7),l=e=>{const{context:t,authUrl:n,allowedUrl:o}=e,{endpoint:l}=e.context,{publicKey:c}=e.context.jwt,{logger:p}=t,f=new d.Authentificator({context:t}),m=s.Router();return m.post(`${n}/access-token`,u.default((t,n)=>r(void 0,void 0,void 0,(function*(){const{body:r,headers:o}=t,{login:s,password:u}=r,l=(new a.default).parse(o["user-agent"]);p.auth.info("Access token request",{login:s});const c=yield f.getAccountByLogin(s);if(!c||!i.default.compareSync(u,c.password))return p.auth.error("Account not found",{login:s}),d.Authentificator.sendResponseError(d.ResponseErrorType.accountNotFound,n);if(c.status===d.AccountStatus.forbidden&&i.default.compareSync(u,c.password))return p.auth.info("Authentification forbidden",{login:s}),d.Authentificator.sendResponseError(d.ResponseErrorType.accountForbidden,n);if(c.status===d.AccountStatus.allowed&&i.default.compareSync(u,c.password)){const t=yield f.registerTokens({uuid:c.id,deviceInfo:l});return n.status(200).json({accessToken:t.accessToken.token,tokenType:"bearer",expiresIn:e.context.jwt.accessTokenExpiresIn,refreshToken:t.refreshToken.token})}return d.Authentificator.sendResponseError(d.ResponseErrorType.accountNotFound,n)})))),m.post(`${n}/refresh-token`,u.default((n,o)=>r(void 0,void 0,void 0,(function*(){const{body:r,headers:i}=n,{token:s}=r,u=d.Authentificator.verifyToken(s,t.jwt.publicKey);if(u.type!==d.TokenType.refresh)return p.auth.info("Tried to refresh token by access token. Rejected",{payload:u}),d.Authentificator.sendResponseError(d.ResponseErrorType.isNotARefreshToken,o);if(!(yield f.checkTokenExist(u.id)))return p.auth.info("Tried to refresh token by revoked refresh token. Rejected",{payload:u}),d.Authentificator.sendResponseError(d.ResponseErrorType.tokenWasRevoked,o);const l=(new a.default).parse(i["user-agent"]);yield f.revokeToken(u.associated),yield f.revokeToken(u.id);const c=yield f.registerTokens({uuid:u.uuid,deviceInfo:l});return o.status(200).json({accessToken:c.accessToken.token,tokenType:"bearer",expiresIn:e.context.jwt.accessTokenExpiresIn,refreshToken:c.refreshToken.token})})))),m.post(`${n}/validate-token`,u.default((e,t)=>r(void 0,void 0,void 0,(function*(){const{body:n}=e,{token:r}=n,o=d.Authentificator.verifyToken(r,c);t.json(o)})))),m.use(l,u.default((e,t,n)=>r(void 0,void 0,void 0,(function*(){if(o.includes(e.originalUrl))return n();const r=d.Authentificator.extractToken(e);return d.Authentificator.verifyToken(r,c).type!==d.TokenType.access?d.Authentificator.sendResponseError(d.ResponseErrorType.isNotAnAccessToken,t):n()})))),m};t.authentificatorMiddleware=l,t.default=l},function(e,t){e.exports=require("bcryptjs")},function(e,t){e.exports=require("device-detector-js")},function(e,t){e.exports=require("express-async-handler")},function(e,t){e.exports=require("jsonwebtoken")},function(e,t){e.exports=require("moment-timezone")},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});class r extends Error{constructor(e,t){super(e),this.name="BadRequestError",this.message=e,this.metaData=t,this.status=400,Object.setPrototypeOf(this,r.prototype)}}t.default=r},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});class r extends Error{constructor(e,t){super(e),this.name="ForbiddenError",this.message=e,this.metaData=t,this.status=503,Object.setPrototypeOf(this,r.prototype)}}t.default=r},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});class r extends Error{constructor(e,t){super(e),this.name="NotFoundError",this.message=e,this.metaData=t,this.status=404,Object.setPrototypeOf(this,r.prototype)}}t.default=r},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});class r extends Error{constructor(e,t){super(e),this.name="ServerError",this.message=e,this.metaData=t,this.status=500,Object.setPrototypeOf(this,r.prototype)}}t.default=r},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});class r extends Error{constructor(e,t){super(e),this.name="UnauthorizedError",this.message=e,this.metaData=t,this.status=401,Object.setPrototypeOf(this,r.prototype)}}t.default=r},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),function(e){for(var n in e)t.hasOwnProperty(n)||(t[n]=e[n])}(n(33))},function(e,t,n){"use strict";var r=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const o=n(34),i=r(n(35)),a=n(4),s=e=>{const{database:t,logger:n}=e,r={};let s=0;const u=i.default(t);return u.on("query",e=>{const t=e.__knexQueryUid;r[t]={position:s,query:e,startTime:o.performance.now(),finished:!1},s+=1}).on("query-response",(e,t)=>{const i=t.__knexQueryUid;r[i].endTime=o.performance.now(),r[i].finished=!0,n.sql.debug(t.sql,r[i])}).on("query-error",(e,t)=>{n.sql.error(t.sql,{err:e})}),u.raw("SELECT 1+1 AS result").then(()=>(n.server.debug("Test the connection by trying to authenticate is OK"),!0)).catch(e=>{throw n.server.error(e.name,e),new a.ServerError(e)}),u};t.knexProvider=s,t.default=s},function(e,t){e.exports=require("perf_hooks")},function(e,t){e.exports=require("knex")},function(e,t,n){"use strict";var r=this&&this.__rest||function(e,t){var n={};for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&t.indexOf(r)<0&&(n[r]=e[r]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var o=0;for(r=Object.getOwnPropertySymbols(e);o<r.length;o++)t.indexOf(r[o])<0&&Object.prototype.propertyIsEnumerable.call(e,r[o])&&(n[r[o]]=e[r[o]])}return n};Object.defineProperty(t,"__esModule",{value:!0}),n(0);const o=n(37);let i;t.logger=i;const a=e=>{const{loggers:n}=e,a=r(e,["loggers"]);return t.logger=i=Object.assign({auth:o.authLogger(a),http:o.httpLogger(a),server:o.serverLogger(a),sql:o.sqlLogger(a)},n),i};t.configureLogger=a,t.default=a},function(e,t,n){"use strict";var r=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const o=r(n(38));t.authLogger=o.default;const i=r(n(39));t.httpLogger=i.default;const a=r(n(40));t.serverLogger=a.default;const s=r(n(41));t.sqlLogger=s.default},function(e,t,n){"use strict";var r=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const o=n(1);n(0);const i=r(n(2));t.default=e=>{const{logPath:t}=e;return o.createLogger({level:"info",format:i.default,transports:[new o.transports.DailyRotateFile({filename:`${t}/%DATE%-auth.log`,level:"info",datePattern:"YYYY-MM-DD",zippedArchive:!0,maxSize:"20m",maxFiles:"14d"}),new o.transports.DailyRotateFile({filename:`${t}/%DATE%-debug.log`,level:"debug",datePattern:"YYYY-MM-DD",zippedArchive:!0,maxSize:"20m",maxFiles:"14d"})]})}},function(e,t,n){"use strict";var r=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const o=n(1);n(0);const i=r(n(2));t.default=e=>{const{logPath:t}=e;return o.createLogger({level:"info",format:i.default,transports:[new o.transports.DailyRotateFile({filename:`${t}/%DATE%-http.log`,level:"info",datePattern:"YYYY-MM-DD",zippedArchive:!0,maxSize:"20m",maxFiles:"14d"})]})}},function(e,t,n){"use strict";var r=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const o=n(1);n(0);const i=r(n(2));t.default=e=>{const{logPath:t}=e;return o.createLogger({level:"debug",format:i.default,transports:[new o.transports.DailyRotateFile({filename:`${t}/%DATE%-errors.log`,level:"error",datePattern:"YYYY-MM-DD",zippedArchive:!0,maxSize:"20m",maxFiles:"14d"}),new o.transports.DailyRotateFile({filename:`${t}/%DATE%-debug.log`,level:"debug",datePattern:"YYYY-MM-DD",zippedArchive:!0,maxSize:"20m",maxFiles:"14d"})]})}},function(e,t,n){"use strict";var r=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const o=n(1);n(0);const i=r(n(2));t.default=e=>{const{logPath:t}=e;return o.createLogger({level:"debug",format:i.default,transports:[new o.transports.DailyRotateFile({filename:`${t}/%DATE%-sql.log`,level:"debug",datePattern:"YYYY-MM-DD",zippedArchive:!0,maxSize:"20m",maxFiles:"14d"}),new o.transports.Console({level:"error"})]})}},function(e,t,n){"use strict";var r=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const o=r(n(43));t.errorHandlerMiddleware=o.default;const i=r(n(45));t.requestHandlerMiddleware=i.default},function(e,t,n){"use strict";var r=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});r(n(5));const o=r(n(44));t.default=e=>{const{context:t}=e,{logger:n}=t;return[(e,t,r,i)=>{const{status:a,stack:s,name:u,message:d,metaData:l}=e,{originalUrl:c}=t,p=d?`${a||""} ${d}`:"Unknown error";switch(a){case 401:n.auth.error(p,{originalUrl:c,stack:s,metaData:l});break;case 500:default:n.server.error(p,{originalUrl:c,stack:s,metaData:l})}r.status(a||500).json(o.default({message:d||"Please contact system administrator",name:u||"Internal server error"}))},(e,t)=>{t.status(404).end()},(e,t)=>{t.status(503).end()},(e,t)=>{t.status(400).end()}]}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default=e=>{const{name:t,message:n}=e;return{errors:[{name:t||"Unknown Error",message:n||t||"Unknown Error"}]}}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default=e=>{const{context:t}=e,{logger:n}=t;return(e,t,r)=>{const{method:o,originalUrl:i,headers:a}=e,s=String(e.headers["x-forwarded-for"]||"").replace(/:\d+$/,"")||e.connection.remoteAddress,u="127.0.0.1"===s||"::1"===s?"localhost":s;return n.http.info(`${u} ${o} "${i}"`,{headers:a}),r()}}},function(e,t,n){"use strict";var r=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const o=r(n(47));t.infoSchema=o.default,t.default=o.default},function(e,t,n){"use strict";(function(e){var r=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const o=r(n(8)),i=r(n(12)),a=n(3),s=o.default.readFileSync(i.default.resolve(e,"..","..","..","package.json"),"utf8"),u=JSON.parse(s),d=new a.GraphQLObjectType({name:"DevInfo",fields:()=>({name:{description:"Application name",resolve:()=>u.name,type:new a.GraphQLNonNull(a.GraphQLString)},description:{description:"Application description",resolve:()=>u.description,type:new a.GraphQLNonNull(a.GraphQLString)},version:{description:"Application version number",resolve:()=>u.version,type:new a.GraphQLNonNull(a.GraphQLString)},author:{description:"Application author",resolve:()=>u.author,type:new a.GraphQLNonNull(a.GraphQLString)},support:{description:"Application support",resolve:()=>u.support,type:new a.GraphQLNonNull(a.GraphQLString)},license:{description:"Application license",resolve:()=>u.license,type:new a.GraphQLNonNull(a.GraphQLString)},repository:{resolve:()=>u.repository,type:new a.GraphQLNonNull(new a.GraphQLObjectType({name:"Repository",description:"Application repository",fields:()=>({type:{description:"Repository type",type:new a.GraphQLNonNull(a.GraphQLString),resolve:()=>u.repository.type},url:{description:"Repository URL addess",type:new a.GraphQLNonNull(a.GraphQLString),resolve:()=>u.repository.url}})}))}})}),l=new a.GraphQLSchema({query:new a.GraphQLObjectType({name:"Query",fields:()=>({devInfo:{description:"Application development info",resolve:()=>({}),type:new a.GraphQLNonNull(d)}})})});t.default=l}).call(this,"src/schemas/info")},function(e,t,n){"use strict";var r=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const o=r(n(9)),i=n(7),a=(e,t)=>new i.Authentificator({context:t}).generateTokens({uuid:o.default(),roles:e});t.configureTokens=a,t.default=a},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});t.default=class{constructor(){this.categories=[{id:"100",name:"Category 1"},{id:"200",name:"Category 2"},{id:"300",name:"Category 3"},{id:"400",name:"Category 4"}],this.items=[{id:"178900",name:"Item 1",category:"100",price:1600},{id:"278900",name:"Item 2",category:"100",price:7600},{id:"378900",name:"Item 3",category:"100",price:5250},{id:"478900",name:"Item 4",category:"200",price:300},{id:"578900",name:"Item 5",category:"200",price:652},{id:"678900",name:"Item 6",category:"200",price:730}]}getItemsList(){return this.items}getCategoriesList(){return this.categories}getItem(e){return this.getItemsList().find(t=>t.id===e)}getCategory(e){return this.getCategoriesList().find(t=>t.id===e)}}},,function(e,t,n){"use strict";var r=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const o=n(13),i=r(n(52)),a=r(n(58)),s=n(59).configureApp({schemas:[a.default,i.default]});new o.App(s).bootstrap()},function(e,t,n){"use strict";var r=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}},o=this&&this.__importStar||function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var n in e)Object.hasOwnProperty.call(e,n)&&(t[n]=e[n]);return t.default=e,t};Object.defineProperty(t,"__esModule",{value:!0});const i=n(11),a=r(n(53));t.configureCatalogLogger=a.default;const s=r(n(54)),u=o(n(57)),d=i.makeExecutableSchema({typeDefs:u,resolvers:s.default});t.default=d},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const r=n(1);n(0),t.default=e=>{const{logPath:t}=e;return r.createLogger({level:"debug",format:r.format.combine(r.format.metadata(),r.format.json(),r.format.timestamp({format:"YYYY-MM-DDTHH:mm:ssZZ"}),r.format.splat(),r.format.printf(e=>{const{timestamp:t,level:n,message:r,metadata:o}=e,i="{}"!==JSON.stringify(o)?o:null;return`${t} ${n}: ${r} ${i?JSON.stringify(i):""}`})),transports:[new r.transports.DailyRotateFile({filename:`${t}/%DATE%-catalog.log`,level:"debug",datePattern:"YYYY-MM-DD",zippedArchive:!0,maxSize:"20m",maxFiles:"14d"})]})}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const r=n(55),o={Query:{news:()=>({})},Mutation:{news:()=>({})},CatalogQueries:n(56).CatalogQueries,CatalogMutations:{category:()=>({}),item:()=>({})},CategoryMutations:r.CategoryMutations,ItemMutations:r.ItemMutations};t.default=o},function(e,t,n){"use strict";var r=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const o=r(n(49));t.CategoryMutations={create:()=>(new o.default).getCategory(String(100)),update:(e,t)=>{const{id:n}=t;return(new o.default).getCategory(n)},delete:()=>!0},t.ItemMutations={create:()=>(new o.default).getItem(String(1)),update:(e,t)=>{const{id:n}=t;return(new o.default).getItem(n)},delete:()=>!0}},function(e,t,n){"use strict";var r=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const o=r(n(49));t.CatalogQueries={categories:(e,t,n)=>{const{logger:r}=n;return r.catalog.debug("Returns categories list"),(new o.default).getCategoriesList()},item:(e,t,n)=>{const{id:r}=t,{logger:i}=n;return i.catalog.debug("Returns Item"),(new o.default).getItemsList().find(e=>e.id===String(r))},items:(e,t,n)=>{const{logger:r}=n,i=new o.default;return r.catalog.debug("Returns Items list"),i.getItemsList()}},t.default=t.CatalogQueries},function(e,t){var n={kind:"Document",definitions:[{kind:"ObjectTypeDefinition",name:{kind:"Name",value:"Query"},interfaces:[],directives:[],fields:[{kind:"FieldDefinition",name:{kind:"Name",value:"news"},arguments:[],type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"CatalogQueries"}}},directives:[]}]},{kind:"ObjectTypeDefinition",name:{kind:"Name",value:"Mutation"},interfaces:[],directives:[],fields:[{kind:"FieldDefinition",name:{kind:"Name",value:"news"},arguments:[],type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"CatalogMutations"}}},directives:[]}]},{kind:"ObjectTypeDefinition",name:{kind:"Name",value:"CatalogQueries"},interfaces:[],directives:[],fields:[{kind:"FieldDefinition",name:{kind:"Name",value:"categories"},arguments:[],type:{kind:"NonNullType",type:{kind:"ListType",type:{kind:"NamedType",name:{kind:"Name",value:"Category"}}}},directives:[]},{kind:"FieldDefinition",name:{kind:"Name",value:"items"},arguments:[],type:{kind:"NonNullType",type:{kind:"ListType",type:{kind:"NamedType",name:{kind:"Name",value:"Item"}}}},directives:[]},{kind:"FieldDefinition",name:{kind:"Name",value:"item"},arguments:[{kind:"InputValueDefinition",name:{kind:"Name",value:"id"},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"ID"}}},directives:[]}],type:{kind:"NamedType",name:{kind:"Name",value:"Item"}},directives:[]}]},{kind:"ObjectTypeDefinition",name:{kind:"Name",value:"CatalogMutations"},interfaces:[],directives:[],fields:[{kind:"FieldDefinition",name:{kind:"Name",value:"category"},arguments:[],type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"CategoryMutations"}}},directives:[]},{kind:"FieldDefinition",name:{kind:"Name",value:"item"},arguments:[],type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"ItemMutations"}}},directives:[]}]},{kind:"ObjectTypeDefinition",name:{kind:"Name",value:"ItemMutations"},interfaces:[],directives:[],fields:[{kind:"FieldDefinition",name:{kind:"Name",value:"create"},arguments:[{kind:"InputValueDefinition",name:{kind:"Name",value:"name"},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},directives:[]}],type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"Item"}}},directives:[]},{kind:"FieldDefinition",name:{kind:"Name",value:"update"},arguments:[{kind:"InputValueDefinition",name:{kind:"Name",value:"id"},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"ID"}}},directives:[]},{kind:"InputValueDefinition",name:{kind:"Name",value:"name"},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},directives:[]}],type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"Item"}}},directives:[]},{kind:"FieldDefinition",name:{kind:"Name",value:"delete"},arguments:[{kind:"InputValueDefinition",name:{kind:"Name",value:"id"},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"ID"}}},directives:[]}],type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},directives:[]}]},{kind:"ObjectTypeDefinition",name:{kind:"Name",value:"CategoryMutations"},interfaces:[],directives:[],fields:[{kind:"FieldDefinition",name:{kind:"Name",value:"create"},arguments:[{kind:"InputValueDefinition",name:{kind:"Name",value:"name"},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},directives:[]}],type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"Category"}}},directives:[]},{kind:"FieldDefinition",name:{kind:"Name",value:"update"},arguments:[{kind:"InputValueDefinition",name:{kind:"Name",value:"id"},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"ID"}}},directives:[]},{kind:"InputValueDefinition",name:{kind:"Name",value:"name"},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},directives:[]}],type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"Category"}}},directives:[]},{kind:"FieldDefinition",name:{kind:"Name",value:"delete"},arguments:[{kind:"InputValueDefinition",name:{kind:"Name",value:"id"},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"ID"}}},directives:[]}],type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},directives:[]}]},{kind:"ObjectTypeDefinition",name:{kind:"Name",value:"Category"},interfaces:[],directives:[],fields:[{kind:"FieldDefinition",name:{kind:"Name",value:"id"},arguments:[],type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"ID"}}},directives:[]},{kind:"FieldDefinition",name:{kind:"Name",value:"name"},arguments:[],type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},directives:[]}]},{kind:"ObjectTypeDefinition",name:{kind:"Name",value:"Item"},interfaces:[],directives:[],fields:[{kind:"FieldDefinition",name:{kind:"Name",value:"id"},arguments:[],type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"ID"}}},directives:[]},{kind:"FieldDefinition",name:{kind:"Name",value:"name"},arguments:[],type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},directives:[]}]}],loc:{start:0,end:599}};n.loc.source={body:"type Query {\n  news: CatalogQueries!\n}\n\ntype Mutation {\n  news: CatalogMutations!\n}\n\ntype CatalogQueries {\n  categories: [Category]!\n  items: [Item]!\n  item(id: ID!): Item\n}\n\ntype CatalogMutations {\n  category: CategoryMutations!\n  item: ItemMutations!\n}\n\ntype ItemMutations {\n  create(name: String!): Item!\n  update(id: ID!, name: String!): Item!\n  delete(id: ID!): Boolean!\n}\n\ntype CategoryMutations {\n  create(name: String!): Category!\n  update(id: ID!, name: String!): Category!\n  delete(id: ID!): Boolean!\n}\n\ntype Category {\n  id: ID!\n  name: String!\n}\n\ntype Item {\n  id: ID!\n  name: String!\n}\n",name:"GraphQL request",locationOffset:{line:1,column:1}};e.exports=n},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const r=n(3),o=new r.GraphQLObjectType({name:"Post",description:"Current Post data",fields:()=>({title:{type:new r.GraphQLNonNull(r.GraphQLString),description:"Post Title"},url:{type:new r.GraphQLNonNull(r.GraphQLString),description:"URL address"}})}),i=new r.GraphQLSchema({query:new r.GraphQLObjectType({name:"Query",fields:()=>({post:{type:new r.GraphQLNonNull(o),resolve:()=>({title:"Lorem ipsum",url:"hppts://google.com"})}})}),mutation:new r.GraphQLObjectType({name:"Mutation",fields:()=>({setAny:{description:"Set any value for test mutation",args:{name:{type:new r.GraphQLNonNull(r.GraphQLString),description:"Any value string"}},resolve:()=>!0,type:new r.GraphQLNonNull(r.GraphQLBoolean)}})})});t.default=i},function(e,t,n){"use strict";var r=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const o=r(n(12)),i=r(n(60)),a=n(4).configureLogger({logPath:"log"});i.default.config();const s={client:process.env.DB_CLIENT,connection:{database:process.env.DB_NAME,host:process.env.DB_HOST,password:process.env.DB_PASSWORD,user:process.env.DB_USER}},u={accessTokenExpiresIn:Number(process.env.JWT_ACCESSTOKENEXPIRESIN),algorithm:process.env.JWT_ALGORITHM,issuer:process.env.JWT_ISSUER,privateKey:o.default.resolve(process.cwd(),process.env.JWT_PRIVATEKEY),publicKey:o.default.resolve(process.cwd(),process.env.JWT_PUBLICKEY),refreshTokenExpiresIn:Number(process.env.JWT_REFRESHTOKENEXPIRESIN)},d={port:Number(process.env.PORT),endpoint:process.env.GQL_ENDPOINT,subscriptionsEndpoint:process.env.GQL_SUBSCRIPTIONSENDPOINT,database:s,jwt:u,logger:a,schemas:[]},l=e=>{const{schemas:t}=e;return Object.assign(Object.assign({},d),{schemas:t})};t.configureApp=l,t.default=l},function(e,t){e.exports=require("dotenv")}]);