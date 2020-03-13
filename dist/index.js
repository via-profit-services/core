module.exports=function(e){var t={};function n(r){if(t[r])return t[r].exports;var o=t[r]={i:r,l:!1,exports:{}};return e[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}return n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)n.d(r,o,function(t){return e[t]}.bind(null,o));return r},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=14)}([function(e,t){e.exports=require("winston-daily-rotate-file")},function(e,t){e.exports=require("winston")},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const r=n(1);t.default=r.format.combine(r.format.metadata(),r.format.json(),r.format.timestamp({format:"YYYY-MM-DDTHH:mm:ssZZ"}),r.format.splat(),r.format.printf(e=>{const{timestamp:t,level:n,message:r,metadata:o}=e,i="{}"!==JSON.stringify(o)?o:null;return`${t} ${n}: ${r} ${i?JSON.stringify(i):""}`}))},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.AUTH_LOG_FILENAME="auth-%DATE%.log",t.HTTP_LOG_FILENAME="http-%DATE%.log",t.DEBUG_LOG_FILENAME="debug-%DATE%.log",t.ERRORS_LOG_FILENAME="errors-%DATE%.log",t.SQL_LOG_FILENAME="sql-%DATE%.log"},function(e,t,n){"use strict";var r=this&&this.__awaiter||function(e,t,n,r){return new(n||(n=Promise))((function(o,i){function s(e){try{u(r.next(e))}catch(e){i(e)}}function a(e){try{u(r.throw(e))}catch(e){i(e)}}function u(e){var t;e.done?o(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(s,a)}u((r=r.apply(e,t||[])).next())}))},o=this&&this.__rest||function(e,t){var n={};for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&t.indexOf(r)<0&&(n[r]=e[r]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var o=0;for(r=Object.getOwnPropertySymbols(e);o<r.length;o++)t.indexOf(r[o])<0&&Object.prototype.propertyIsEnumerable.call(e,r[o])&&(n[r[o]]=e[r[o]])}return n},i=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const s=i(n(27)),a=i(n(28)),u=i(n(29)),d=i(n(10)),c=n(11);var l;!function(e){e.access="access",e.refresh="refresh"}(l=t.TokenType||(t.TokenType={}));t.Authentificator=class{constructor(e){this.props=e}static extractToken(e){const{headers:t}=e,{authorization:n}=t,r=String(n).split(" ")[0],o=String(n).split(" ")[1];return"bearer"===r.toLocaleLowerCase()?o:""}static verifyToken(e,t){if(null===e||""===e)throw new c.UnauthorizedError("The token must be provided");try{const n=s.default.readFileSync(t);return a.default.verify(String(e),n)}catch(e){throw new c.UnauthorizedError("Token verification failed",e)}}registerTokens(e){return r(this,void 0,void 0,(function*(){const{context:t}=this.props,{knex:n,logger:r}=t,o=yield n.select(["id","roles"]).from("accounts").where({id:e.uuid}).first(),i=this.generateTokens({uuid:o.id,roles:o.roles});try{yield n("tokens").insert({id:i.accessToken.payload.id,account:i.accessToken.payload.uuid,type:l.access,deviceInfo:e.deviceInfo,expiredAt:u.default(i.accessToken.payload.exp).format()})}catch(e){throw new c.ServerError("Failed to register access token",e)}try{yield n("tokens").insert({id:i.refreshToken.payload.id,account:i.refreshToken.payload.uuid,type:l.refresh,associated:i.accessToken.payload.id,deviceInfo:e.deviceInfo,expiredAt:u.default(i.refreshToken.payload.exp).format()})}catch(e){throw new c.ServerError("Failed to register refresh token",e)}return r.auth.info("New Access token was registered",i.accessToken.payload),i}))}generateTokens(e,t){var n,r;const{context:o}=this.props,i=(null===(n=t)||void 0===n?void 0:n.access)?t.access:o.jwt.accessTokenExpiresIn,u=(null===(r=t)||void 0===r?void 0:r.refresh)?t.refresh:o.jwt.refreshTokenExpiresIn;try{s.default.accessSync(o.jwt.privateKey)}catch(e){throw new c.ServerError("Failed to open JWT privateKey file",{err:e})}const f=s.default.readFileSync(o.jwt.privateKey),p=Object.assign(Object.assign({},e),{type:l.access,id:d.default(),exp:Math.floor(Date.now()/1e3)+Number(i),iss:o.jwt.issuer}),m=Object.assign(Object.assign({},e),{type:l.refresh,id:d.default(),associated:p.id,exp:Math.floor(Date.now()/1e3)+Number(u),iss:o.jwt.issuer}),y=a.default.sign(p,f,{algorithm:o.jwt.algorithm}),v=a.default.sign(m,f,{algorithm:o.jwt.algorithm});return{accessToken:{token:y,payload:Object.assign(Object.assign({},p),{type:l.access})},refreshToken:{token:v,payload:Object.assign(Object.assign({},m),{type:l.refresh})}}}revokeToken(e){return r(this,void 0,void 0,(function*(){const{context:t}=this.props,{knex:n}=t;yield n.del("tokens").where({id:e})}))}checkTokenExist(e){return r(this,void 0,void 0,(function*(){const{context:t}=this.props,{knex:n}=t;return null!==(yield n.select(["id"]).from("tokens").where({id:e}).first())}))}getAccountByLogin(e){return r(this,void 0,void 0,(function*(){const{context:t}=this.props,{knex:n}=t,r=yield n.select(["id","password","status"]).from("accounts").where({login:e}).first();return{id:r.id,password:r.password,status:r.status}}))}static sendResponseError(e,t){const n=[];switch(e){case"accountForbidden":n.push({message:"Account locked",name:"Authorization error"});break;case"authentificationRequired":n.push({message:"Authentication Required",name:"Authorization error"});break;case"isNotARefreshToken":n.push({message:"Token error",name:"Is not a refresh token"});break;case"isNotAnAccessToken":n.push({message:"Token error",name:"Is not a access token"});break;case"tokenExpired":n.push({message:"Token error",name:"This token expired"});break;case"tokenWasRevoked":n.push({message:"Token error",name:"Token was revoked"});break;case"accountNotFound":case"invalidLoginOrPassword":default:n.push({message:"Invalid login or password",name:"Authorization error"})}return t.status(401).json({errors:n})}getAccounts(e){const{context:t}=this.props,{knex:n,timezone:r}=t,i={totalCount:0,nodes:[]};return n.select(["j.totalCount","accounts.*"]).join(n("accounts").select(["id",n.raw('count(*) over() as "totalCount"')]).orderBy(e.orderBy).limit(e.limit).where(t=>{void 0!==e.after&&t.where("cursor",">",Number(e.after)),void 0!==e.before&&t.where("cursor","<",Number(e.before)),void 0!==e.where&&t.where(e.where)}).as("j"),"j.id","accounts.id").orderBy(e.orderBy).from("accounts").then(e=>e.map(e=>{const{totalCount:t}=e,n=o(e,["totalCount"]);return i.totalCount=t,Object.assign(Object.assign({},n),{createdAt:u.default.tz(n.createdAt,r).format(),updatedAt:u.default.tz(n.updatedAt,r).format()})})).then(e=>(i.totalCount=Number(i.totalCount),i.nodes=e,i))}},function(e){e.asc="asc",e.desc="desc"}(t.OrderRange||(t.OrderRange={})),function(e){e.authentificationRequired="authentificationRequired",e.accountNotFound="accountNotFound",e.accountForbidden="accountForbidden",e.invalidLoginOrPassword="invalidLoginOrPassword",e.tokenExpired="tokenExpired",e.isNotAnAccessToken="isNotAnAccessToken",e.isNotARefreshToken="isNotARefreshToken",e.tokenWasRevoked="tokenWasRevoked"}(t.ResponseErrorType||(t.ResponseErrorType={})),function(e){e.allowed="allowed",e.forbidden="forbidden"}(t.AccountStatus||(t.AccountStatus={}))},function(e,t,n){"use strict";function r(e){for(var n in e)t.hasOwnProperty(n)||(t[n]=e[n])}Object.defineProperty(t,"__esModule",{value:!0}),r(n(38)),r(n(3)),r(n(2)),r(n(44)),r(n(11))},function(e,t){e.exports=require("chalk")},function(e,t){e.exports=require("express")},function(e,t){e.exports=require("graphql-tools")},function(e,t,n){"use strict";var r=this&&this.__awaiter||function(e,t,n,r){return new(n||(n=Promise))((function(o,i){function s(e){try{u(r.next(e))}catch(e){i(e)}}function a(e){try{u(r.throw(e))}catch(e){i(e)}}function u(e){var t;e.done?o(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(s,a)}u((r=r.apply(e,t||[])).next())}))},o=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const i=o(n(24)),s=o(n(25)),a=n(7),u=o(n(26)),d=n(4),c=e=>{const{context:t,authUrl:n,allowedUrl:o}=e,{endpoint:c}=e.context,{publicKey:l}=e.context.jwt,{logger:f}=t,p=new d.Authentificator({context:t}),m=a.Router();return m.post(`${n}/access-token`,u.default((t,n)=>r(void 0,void 0,void 0,(function*(){const{body:r,headers:o}=t,{login:a,password:u}=r,c=(new s.default).parse(o["user-agent"]);f.auth.info("Access token request",{login:a});const l=yield p.getAccountByLogin(a);if(!l||!i.default.compareSync(u,l.password))return f.auth.error("Account not found",{login:a}),d.Authentificator.sendResponseError(d.ResponseErrorType.accountNotFound,n);if(l.status===d.AccountStatus.forbidden&&i.default.compareSync(u,l.password))return f.auth.info("Authentification forbidden",{login:a}),d.Authentificator.sendResponseError(d.ResponseErrorType.accountForbidden,n);if(l.status===d.AccountStatus.allowed&&i.default.compareSync(u,l.password)){const t=yield p.registerTokens({uuid:l.id,deviceInfo:c});return n.status(200).json({accessToken:t.accessToken.token,tokenType:"bearer",expiresIn:e.context.jwt.accessTokenExpiresIn,refreshToken:t.refreshToken.token})}return d.Authentificator.sendResponseError(d.ResponseErrorType.accountNotFound,n)})))),m.post(`${n}/refresh-token`,u.default((n,o)=>r(void 0,void 0,void 0,(function*(){const{body:r,headers:i}=n,{token:a}=r,u=d.Authentificator.verifyToken(a,t.jwt.publicKey);if(u.type!==d.TokenType.refresh)return f.auth.info("Tried to refresh token by access token. Rejected",{payload:u}),d.Authentificator.sendResponseError(d.ResponseErrorType.isNotARefreshToken,o);if(!(yield p.checkTokenExist(u.id)))return f.auth.info("Tried to refresh token by revoked refresh token. Rejected",{payload:u}),d.Authentificator.sendResponseError(d.ResponseErrorType.tokenWasRevoked,o);const c=(new s.default).parse(i["user-agent"]);yield p.revokeToken(u.associated),yield p.revokeToken(u.id);const l=yield p.registerTokens({uuid:u.uuid,deviceInfo:c});return o.status(200).json({accessToken:l.accessToken.token,tokenType:"bearer",expiresIn:e.context.jwt.accessTokenExpiresIn,refreshToken:l.refreshToken.token})})))),m.post(`${n}/validate-token`,u.default((e,t)=>r(void 0,void 0,void 0,(function*(){const{body:n}=e,{token:r}=n,o=d.Authentificator.verifyToken(r,l);t.json(o)})))),m.use(c,u.default((e,t,n)=>r(void 0,void 0,void 0,(function*(){if(o.includes(e.originalUrl))return n();const r=d.Authentificator.extractToken(e);return d.Authentificator.verifyToken(r,l).type!==d.TokenType.access?d.Authentificator.sendResponseError(d.ResponseErrorType.isNotAnAccessToken,t):n()})))),m};t.authentificatorMiddleware=c,t.default=c},function(e,t){e.exports=require("uuid/v4")},function(e,t,n){"use strict";var r=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const o=r(n(30));t.BadRequestError=o.default;const i=r(n(31));t.ForbiddenError=i.default;const s=r(n(32));t.NotFoundError=s.default;const a=r(n(33));t.ServerError=a.default;const u=r(n(34));t.UnauthorizedError=u.default},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),function(e){for(var n in e)t.hasOwnProperty(n)||(t[n]=e[n])}(n(35))},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.stringToCursor=e=>Buffer.from(e,"binary").toString("base64"),t.cursorToString=e=>Buffer.from(e,"base64").toString("binary"),t.nodeToEdge=e=>({node:e,cursor:t.stringToCursor(String(e.cursor))}),t.nodesListToEdges=e=>e.map(e=>t.nodeToEdge(e));const r=e=>{const{nodes:n,totalCount:r}=e;return{totalCount:r,pageInfo:{startCursor:n.length?t.stringToCursor(String(n[0].cursor)):void 0,endCursor:n.length?t.stringToCursor(String(n[n.length-1].cursor)):void 0,hasPreviousPage:!1,hasNextPage:!1},edges:t.nodesListToEdges(n)}};t.buildCursorBundle=r,t.default=r},function(e,t,n){"use strict";function r(e){for(var n in e)t.hasOwnProperty(n)||(t[n]=e[n])}Object.defineProperty(t,"__esModule",{value:!0}),r(n(15)),r(n(55)),r(n(5)),r(n(12))},function(e,t,n){"use strict";var r=this&&this.__awaiter||function(e,t,n,r){return new(n||(n=Promise))((function(o,i){function s(e){try{u(r.next(e))}catch(e){i(e)}}function a(e){try{u(r.throw(e))}catch(e){i(e)}}function u(e){var t;e.done?o(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(s,a)}u((r=r.apply(e,t||[])).next())}))},o=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const i=n(16),s=n(17),a=o(n(6)),u=o(n(18)),d=o(n(7)),c=o(n(19)),l=n(20),f=o(n(21)),p=n(8),m=n(22),y=n(23),v=n(9),k=n(12),h=n(5),g=n(48),b=n(54);class N{constructor(e){this.props=Object.assign({port:4e3,endpoint:"/graphql",timezone:"UTC",subscriptionsEndpoint:"/subscriptions",usePlayground:!1,useVoyager:!1},e),this.props.routes=Object.assign({auth:"/auth",playground:"/playground",voyager:"/voyager"},this.props.routes)}bootstrap(e){const{port:t,usePlayground:n,useVoyager:r,endpoint:o,routes:i,serverOptions:a}=this.props,{app:u,schema:d,context:c}=this.createApp(),l=s.createServer(a,u);l.listen(t,()=>{this.createSubscriptionServer({schema:d,server:l});const s={graphql:`https://localhost:${t}${o}`,auth:`https://localhost:${t}${i.auth}`};n&&(s.playground=`https://localhost:${t}${i.playground}`),r&&(s.voyager=`https://localhost:${t}${i.voyager}`),void 0!==e&&e({port:t,context:c,resolveUrl:s})})}createSubscriptionServer(e){const{subscriptionsEndpoint:t}=this.props,{server:n,schema:r}=e;return new y.SubscriptionServer({execute:l.execute,schema:r,subscribe:l.subscribe},{server:n,path:t})}createApp(){const e=d.default(),{schemas:t,endpoint:n,timezone:o,port:s,jwt:l,database:y,logger:N,routes:T,subscriptionsEndpoint:_,usePlayground:w,useVoyager:O}=this.props,A=p.mergeSchemas({schemas:[...t,g.accountsSchema]}),x={endpoint:n,timezone:o,jwt:l,logger:N,knex:k.knexProvider(Object.assign({logger:N},y)),emitter:new i.EventEmitter};if(e.use(u.default()),e.use(d.default.json({limit:"50mb"})),e.use(d.default.urlencoded({extended:!0,limit:"50mb"})),e.use(h.requestHandlerMiddleware({context:x})),e.use(v.authentificatorMiddleware({context:x,authUrl:T.auth,allowedUrl:[T.playground]})),w&&e.get(T.playground,f.default({endpoint:n})),O){const{accessToken:t}=b.configureTokens([""],x);console.log(""),console.log(`${a.default.yellow.bold("Note: ")}${a.default.yellow("An access token was created specifically for GraphQL voyager")}`),console.log(`${a.default.yellow("This token was expire at")} ${a.default.yellowBright.bold(new Date(Date.now()+18e5))}`),console.log(a.default.yellow("After the token expires, you must restart the application")),e.use(T.voyager,m.express({endpointUrl:n,headersJS:JSON.stringify({Authorization:`Bearer ${t.token}`})}))}return e.use(n,c.default(()=>r(this,void 0,void 0,(function*(){return{context:x,graphiql:!1,schema:A,subscriptionsEndpoint:`ws://localhost:${s}${_}`}})))),e.use(h.errorHandlerMiddleware({context:x})),{app:e,context:x,schema:A,routes:T}}}t.App=N,t.default=N},function(e,t){e.exports=require("events")},function(e,t){e.exports=require("https")},function(e,t){e.exports=require("cors")},function(e,t){e.exports=require("express-graphql")},function(e,t){e.exports=require("graphql")},function(e,t){e.exports=require("graphql-playground-middleware-express")},function(e,t){e.exports=require("graphql-voyager/middleware")},function(e,t){e.exports=require("subscriptions-transport-ws")},function(e,t){e.exports=require("bcryptjs")},function(e,t){e.exports=require("device-detector-js")},function(e,t){e.exports=require("express-async-handler")},function(e,t){e.exports=require("fs")},function(e,t){e.exports=require("jsonwebtoken")},function(e,t){e.exports=require("moment-timezone")},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});class r extends Error{constructor(e,t){super(e),this.name="BadRequestError",this.message=e,this.metaData=t,this.status=400,Object.setPrototypeOf(this,r.prototype)}}t.default=r},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});class r extends Error{constructor(e,t){super(e),this.name="ForbiddenError",this.message=e,this.metaData=t,this.status=403,Object.setPrototypeOf(this,r.prototype)}}t.default=r},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});class r extends Error{constructor(e,t){super(e),this.name="NotFoundError",this.message=e,this.metaData=t,this.status=404,Object.setPrototypeOf(this,r.prototype)}}t.default=r},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});class r extends Error{constructor(e,t){super(e),this.name="ServerError",this.message=e,this.metaData=t,this.status=500,Object.setPrototypeOf(this,r.prototype)}}t.default=r},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});class r extends Error{constructor(e,t){super(e),this.name="UnauthorizedError",this.message=e,this.metaData=t,this.status=401,Object.setPrototypeOf(this,r.prototype)}}t.default=r},function(e,t,n){"use strict";var r=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const o=n(36),i=r(n(37)),s=n(5),a=e=>{const{connection:t,logger:n,timezone:r}=e,a={};let u=0;const d=i.default({client:"pg",connection:t,pool:{afterCreate:(e,t)=>{e.query(`\n            SET TIMEZONE = '${r}';\n            SET CLIENT_ENCODING = UTF8;\n          `,o=>{o?n.sql.debug("Connection error",{err:o}):(n.sql.debug(`The TIMEZONE was set to "${r}"`),n.sql.debug('The charset was set to "UTF8"')),t(o,e)})}}});return d.on("query",e=>{const t=e.__knexQueryUid;a[t]={position:u,query:e,startTime:o.performance.now(),finished:!1},u+=1}).on("query-response",(e,t)=>{const r=t.__knexQueryUid;a[r].endTime=o.performance.now(),a[r].finished=!0,n.sql.debug(t.sql,Object.assign({bindings:t.bindings},a[r]))}).on("query-error",(e,t)=>{console.log(t),n.sql.error(t.sql,{bindings:t.bindings,err:e})}),d.raw("SELECT 1+1 AS result").then(()=>(n.server.debug("Test the connection by trying to authenticate is OK"),!0)).catch(e=>{throw n.server.error(e.name,e),new s.ServerError(e)}),d};t.knexProvider=a,t.default=a},function(e,t){e.exports=require("perf_hooks")},function(e,t){e.exports=require("knex")},function(e,t,n){"use strict";var r=this&&this.__rest||function(e,t){var n={};for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&t.indexOf(r)<0&&(n[r]=e[r]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var o=0;for(r=Object.getOwnPropertySymbols(e);o<r.length;o++)t.indexOf(r[o])<0&&Object.prototype.propertyIsEnumerable.call(e,r[o])&&(n[r[o]]=e[r[o]])}return n};Object.defineProperty(t,"__esModule",{value:!0}),n(0);const o=n(39);let i;t.logger=i;const s=e=>{const{loggers:n}=e,s=r(e,["loggers"]);return t.logger=i=Object.assign({auth:o.authLogger(s),http:o.httpLogger(s),server:o.serverLogger(s),sql:o.sqlLogger(s)},n),i};t.configureLogger=s,t.default=s},function(e,t,n){"use strict";var r=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const o=r(n(40));t.authLogger=o.default;const i=r(n(41));t.httpLogger=i.default;const s=r(n(42));t.serverLogger=s.default;const a=r(n(43));t.sqlLogger=a.default},function(e,t,n){"use strict";var r=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const o=n(1);n(0);const i=r(n(2)),s=n(3);t.default=e=>{const{logDir:t}=e;return o.createLogger({level:"info",format:i.default,transports:[new o.transports.DailyRotateFile({filename:`${t}/${s.AUTH_LOG_FILENAME}`,level:"info",datePattern:"YYYY-MM-DD",zippedArchive:!0,maxSize:"20m",maxFiles:"14d"}),new o.transports.DailyRotateFile({filename:`${t}/${s.DEBUG_LOG_FILENAME}`,level:"debug",datePattern:"YYYY-MM-DD",zippedArchive:!0,maxSize:"20m",maxFiles:"14d"})]})}},function(e,t,n){"use strict";var r=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const o=n(1);n(0);const i=r(n(2)),s=n(3);t.default=e=>{const{logDir:t}=e;return o.createLogger({level:"info",format:i.default,transports:[new o.transports.DailyRotateFile({filename:`${t}/${s.HTTP_LOG_FILENAME}`,level:"info",datePattern:"YYYY-MM-DD",zippedArchive:!0,maxSize:"20m",maxFiles:"14d"})]})}},function(e,t,n){"use strict";var r=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const o=n(1);n(0);const i=r(n(2)),s=n(3);t.default=e=>{const{logDir:t}=e;return o.createLogger({level:"debug",format:i.default,transports:[new o.transports.DailyRotateFile({filename:`${t}/${s.ERRORS_LOG_FILENAME}`,level:"error",datePattern:"YYYY-MM-DD",zippedArchive:!0,maxSize:"20m",maxFiles:"14d"}),new o.transports.DailyRotateFile({filename:`${t}/${s.DEBUG_LOG_FILENAME}`,level:"debug",datePattern:"YYYY-MM-DD",zippedArchive:!0,maxSize:"20m",maxFiles:"14d"})]})}},function(e,t,n){"use strict";var r=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const o=n(1);n(0);const i=r(n(2)),s=n(3);t.default=e=>{const{logDir:t}=e;return o.createLogger({level:"debug",format:i.default,transports:[new o.transports.DailyRotateFile({filename:`${t}/${s.SQL_LOG_FILENAME}`,level:"debug",datePattern:"YYYY-MM-DD",zippedArchive:!0,maxSize:"20m",maxFiles:"14d"}),new o.transports.Console({level:"error"})]})}},function(e,t,n){"use strict";var r=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const o=r(n(45));t.errorHandlerMiddleware=o.default;const i=r(n(47));t.requestHandlerMiddleware=i.default},function(e,t,n){"use strict";var r=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});r(n(6));const o=r(n(46));t.default=e=>{const{context:t}=e,{logger:n}=t;return[(e,t,r,i)=>{const{status:s,stack:a,name:u,message:d,metaData:c}=e,{originalUrl:l}=t,f=d?`${s||""} ${d}`:"Unknown error";switch(s){case 401:n.auth.error(f,{originalUrl:l,stack:a,metaData:c});break;case 500:default:n.server.error(f,{originalUrl:l,stack:a,metaData:c})}r.status(s||500).json(o.default({message:d||"Please contact system administrator",name:u||"Internal server error"}))},(e,t)=>{t.status(404).end()},(e,t)=>{t.status(503).end()},(e,t)=>{t.status(400).end()}]}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default=e=>{const{name:t,message:n}=e;return{errors:[{name:t||"Unknown Error",message:n||t||"Unknown Error"}]}}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default=e=>{const{context:t}=e,{logger:n}=t;return(e,t,r)=>{const{method:o,originalUrl:i,headers:s}=e,a=String(e.headers["x-forwarded-for"]||"").replace(/:\d+$/,"")||e.connection.remoteAddress,u="127.0.0.1"===a||"::1"===a?"localhost":a;return n.http.info(`${u} ${o} "${i}"`,{headers:s}),r()}}},function(e,t,n){"use strict";var r=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const o=r(n(49));t.accountsSchema=o.default,t.default=o.default},function(e,t,n){"use strict";var r=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}},o=this&&this.__importStar||function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var n in e)Object.hasOwnProperty.call(e,n)&&(t[n]=e[n]);return t.default=e,t};Object.defineProperty(t,"__esModule",{value:!0});const i=n(8),s=r(n(50)),a=o(n(53)),u=i.makeExecutableSchema({typeDefs:a,resolvers:s.default});t.default=u},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const r={Query:{accounts:()=>({})},AccountsQueries:n(51).AccountsQueries};t.default=r},function(e,t,n){"use strict";var r=this&&this.__awaiter||function(e,t,n,r){return new(n||(n=Promise))((function(o,i){function s(e){try{u(r.next(e))}catch(e){i(e)}}function a(e){try{u(r.throw(e))}catch(e){i(e)}}function u(e){var t;e.done?o(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(s,a)}u((r=r.apply(e,t||[])).next())}))};Object.defineProperty(t,"__esModule",{value:!0});const o=n(52),i=n(13);t.AccountsQueries={list:(e,t,n)=>r(void 0,void 0,void 0,(function*(){const{first:e,last:r,after:s,before:a,orderBy:u,status:d}=t,c=new o.Authentificator({context:n}),l={limit:void 0!==e?e:r,orderBy:[{column:"cursor",order:void 0!==s?o.OrderRange.asc:o.OrderRange.desc}],where:{}};void 0!==s&&(l.after=Number(i.cursorToString(s))),void 0!==a&&(l.before=Number(i.cursorToString(a))),void 0!==u&&l.orderBy.unshift({column:u.field,order:u.direction}),void 0!==d&&(l.where.status=d);const f=yield c.getAccounts(l),{totalCount:p,nodes:m}=f;return i.buildCursorBundle({nodes:m,totalCount:p,limit:l.limit})}))},t.default=t.AccountsQueries},function(e,t,n){"use strict";function r(e){for(var n in e)t.hasOwnProperty(n)||(t[n]=e[n])}Object.defineProperty(t,"__esModule",{value:!0}),r(n(4)),r(n(9))},function(e,t){var n={kind:"Document",definitions:[{kind:"ObjectTypeDefinition",name:{kind:"Name",value:"Query"},interfaces:[],directives:[],fields:[{kind:"FieldDefinition",name:{kind:"Name",value:"accounts"},arguments:[],type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"AccountsQueries"}}},directives:[]}]},{kind:"ObjectTypeDefinition",description:{kind:"StringValue",value:"Information about pagination in a connection.",block:!0},name:{kind:"Name",value:"PageInfo"},interfaces:[],directives:[],fields:[{kind:"FieldDefinition",name:{kind:"Name",value:"hasPreviousPage"},arguments:[],type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},directives:[]},{kind:"FieldDefinition",name:{kind:"Name",value:"hasNextPage"},arguments:[],type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},directives:[]},{kind:"FieldDefinition",name:{kind:"Name",value:"startCursor"},arguments:[],type:{kind:"NamedType",name:{kind:"Name",value:"String"}},directives:[]},{kind:"FieldDefinition",name:{kind:"Name",value:"endCursor"},arguments:[],type:{kind:"NamedType",name:{kind:"Name",value:"String"}},directives:[]}]},{kind:"ObjectTypeDefinition",description:{kind:"StringValue",value:"Account adge bundle",block:!0},name:{kind:"Name",value:"AccountsEdge"},interfaces:[],directives:[],fields:[{kind:"FieldDefinition",name:{kind:"Name",value:"node"},arguments:[],type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"Account"}}},directives:[]},{kind:"FieldDefinition",name:{kind:"Name",value:"cursor"},arguments:[],type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},directives:[]}]},{kind:"ObjectTypeDefinition",description:{kind:"StringValue",value:"Accounts module queries",block:!0},name:{kind:"Name",value:"AccountsQueries"},interfaces:[],directives:[],fields:[{kind:"FieldDefinition",description:{kind:"StringValue",value:"Returns Accounts list bundle",block:!0},name:{kind:"Name",value:"list"},arguments:[{kind:"InputValueDefinition",name:{kind:"Name",value:"first"},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}},directives:[]},{kind:"InputValueDefinition",name:{kind:"Name",value:"last"},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}},directives:[]},{kind:"InputValueDefinition",name:{kind:"Name",value:"after"},type:{kind:"NamedType",name:{kind:"Name",value:"String"}},directives:[]},{kind:"InputValueDefinition",name:{kind:"Name",value:"before"},type:{kind:"NamedType",name:{kind:"Name",value:"String"}},directives:[]},{kind:"InputValueDefinition",name:{kind:"Name",value:"status"},type:{kind:"NamedType",name:{kind:"Name",value:"AccountStatus"}},directives:[]},{kind:"InputValueDefinition",name:{kind:"Name",value:"orderBy"},type:{kind:"NamedType",name:{kind:"Name",value:"AccountOrderBy"}},directives:[]}],type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"AccountListResult"}}},directives:[]}]},{kind:"InputObjectTypeDefinition",description:{kind:"StringValue",value:"Ordering options for accounts returned from the connection",block:!0},name:{kind:"Name",value:"AccountOrderBy"},directives:[],fields:[{kind:"InputValueDefinition",name:{kind:"Name",value:"field"},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"AccountOrderField"}}},directives:[]},{kind:"InputValueDefinition",name:{kind:"Name",value:"direction"},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"OrderDirection"}}},directives:[]}]},{kind:"EnumTypeDefinition",name:{kind:"Name",value:"AccountOrderField"},directives:[],values:[{kind:"EnumValueDefinition",name:{kind:"Name",value:"name"},directives:[]},{kind:"EnumValueDefinition",name:{kind:"Name",value:"login"},directives:[]},{kind:"EnumValueDefinition",name:{kind:"Name",value:"createdAt"},directives:[]},{kind:"EnumValueDefinition",name:{kind:"Name",value:"updatedAt"},directives:[]}]},{kind:"EnumTypeDefinition",name:{kind:"Name",value:"OrderDirection"},directives:[],values:[{kind:"EnumValueDefinition",name:{kind:"Name",value:"ASC"},directives:[]},{kind:"EnumValueDefinition",name:{kind:"Name",value:"DESC"},directives:[]}]},{kind:"ObjectTypeDefinition",description:{kind:"StringValue",value:"Account object",block:!0},name:{kind:"Name",value:"Account"},interfaces:[],directives:[],fields:[{kind:"FieldDefinition",name:{kind:"Name",value:"id"},arguments:[],type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"ID"}}},directives:[]},{kind:"FieldDefinition",name:{kind:"Name",value:"name"},arguments:[],type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},directives:[]},{kind:"FieldDefinition",name:{kind:"Name",value:"login"},arguments:[],type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},directives:[]},{kind:"FieldDefinition",name:{kind:"Name",value:"password"},arguments:[],type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},directives:[]},{kind:"FieldDefinition",name:{kind:"Name",value:"status"},arguments:[],type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"AccountStatus"}}},directives:[]},{kind:"FieldDefinition",name:{kind:"Name",value:"createdAt"},arguments:[],type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},directives:[]},{kind:"FieldDefinition",name:{kind:"Name",value:"updatedAt"},arguments:[],type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},directives:[]},{kind:"FieldDefinition",name:{kind:"Name",value:"roles"},arguments:[],type:{kind:"NonNullType",type:{kind:"ListType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},directives:[]}]},{kind:"ObjectTypeDefinition",description:{kind:"StringValue",value:"Accounts list bundle",block:!0},name:{kind:"Name",value:"AccountListResult"},interfaces:[],directives:[],fields:[{kind:"FieldDefinition",name:{kind:"Name",value:"totalCount"},arguments:[],type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},directives:[]},{kind:"FieldDefinition",name:{kind:"Name",value:"pageInfo"},arguments:[],type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"PageInfo"}}},directives:[]},{kind:"FieldDefinition",name:{kind:"Name",value:"edges"},arguments:[],type:{kind:"NonNullType",type:{kind:"ListType",type:{kind:"NamedType",name:{kind:"Name",value:"AccountsEdge"}}}},directives:[]}]},{kind:"EnumTypeDefinition",description:{kind:"StringValue",value:"Account status",block:!0},name:{kind:"Name",value:"AccountStatus"},directives:[],values:[{kind:"EnumValueDefinition",name:{kind:"Name",value:"allowed"},directives:[]},{kind:"EnumValueDefinition",name:{kind:"Name",value:"forbidden"},directives:[]}]}],loc:{start:0,end:1189}};n.loc.source={body:'type Query {\n  accounts: AccountsQueries!\n}\n\n"""\nInformation about pagination in a connection.\n"""\ntype PageInfo {\n  hasPreviousPage: Boolean!\n  hasNextPage: Boolean!\n  startCursor: String\n  endCursor: String\n}\n\n"""\nAccount adge bundle\n"""\ntype AccountsEdge {\n  node: Account!\n  cursor: String!\n}\n\n"""\nAccounts module queries\n"""\ntype AccountsQueries {\n\n  """\n  Returns Accounts list bundle\n  """\n  list(\n    first: Int\n    last: Int\n    after: String\n    before: String\n    status: AccountStatus\n    orderBy: AccountOrderBy\n  ): AccountListResult!\n}\n\n"""\nOrdering options for accounts returned from the connection\n"""\ninput AccountOrderBy {\n  field: AccountOrderField!\n  direction: OrderDirection!\n}\n\n\nenum AccountOrderField {\n  name\n  login\n  createdAt\n  updatedAt\n}\n\nenum OrderDirection {\n  ASC\n  DESC\n}\n\n"""\nAccount object\n"""\ntype Account {\n  id: ID!\n  name: String!\n  login: String!\n  password: String!\n  status: AccountStatus!\n  createdAt: String!\n  updatedAt: String!\n  roles: [String]!\n}\n\n"""\nAccounts list bundle\n"""\ntype AccountListResult {\n  totalCount: Int!\n  pageInfo: PageInfo!\n  edges: [AccountsEdge]!\n}\n\n\n"""\nAccount status\n"""\nenum AccountStatus {\n  allowed\n  forbidden\n}',name:"GraphQL request",locationOffset:{line:1,column:1}};e.exports=n},function(e,t,n){"use strict";var r=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const o=r(n(10)),i=n(4),s=(e,t)=>new i.Authentificator({context:t}).generateTokens({uuid:o.default(),roles:e},{access:86400,refresh:86400});t.configureTokens=s,t.default=s},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),function(e){for(var n in e)t.hasOwnProperty(n)||(t[n]=e[n])}(n(13))}]);