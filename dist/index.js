module.exports=function(e){var t={};function n(r){if(t[r])return t[r].exports;var o=t[r]={i:r,l:!1,exports:{}};return e[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}return n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)n.d(r,o,function(t){return e[t]}.bind(null,o));return r},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=18)}([function(e,t,n){"use strict";var r=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const o=r(n(31));t.BadRequestError=o.default;const i=r(n(32));t.ForbiddenError=i.default;const s=r(n(33));t.NotFoundError=s.default;const a=r(n(34));t.ServerError=a.default;const u=r(n(35));t.UnauthorizedError=u.default},function(e,t,n){"use strict";function r(e){for(var n in e)t.hasOwnProperty(n)||(t[n]=e[n])}Object.defineProperty(t,"__esModule",{value:!0}),r(n(12)),r(n(13)),r(n(37))},function(e,t){e.exports=require("winston-daily-rotate-file")},function(e,t){e.exports=require("winston")},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const r=n(3);t.default=r.format.combine(r.format.metadata(),r.format.json(),r.format.timestamp({format:"YYYY-MM-DDTHH:mm:ssZZ"}),r.format.splat(),r.format.printf(e=>{const{timestamp:t,level:n,message:r,metadata:o}=e,i="{}"!==JSON.stringify(o)?o:null;return`${t} ${n}: ${r} ${i?JSON.stringify(i):""}`}))},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.AUTH_LOG_FILENAME="auth-%DATE%.log",t.HTTP_LOG_FILENAME="http-%DATE%.log",t.DEBUG_LOG_FILENAME="debug-%DATE%.log",t.ERRORS_LOG_FILENAME="errors-%DATE%.log",t.SQL_LOG_FILENAME="sql-%DATE%.log"},function(e,t){e.exports=require("chalk")},function(e,t,n){"use strict";var r=this&&this.__awaiter||function(e,t,n,r){return new(n||(n=Promise))((function(o,i){function s(e){try{u(r.next(e))}catch(e){i(e)}}function a(e){try{u(r.throw(e))}catch(e){i(e)}}function u(e){var t;e.done?o(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(s,a)}u((r=r.apply(e,t||[])).next())}))},o=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const i=o(n(8)),s=o(n(38)),a=o(n(39)),u=o(n(14)),c=n(40),d=n(0),l=n(1);var f,p,m;!function(e){e.access="access",e.refresh="refresh"}(f=t.TokenType||(t.TokenType={})),function(e){e.allowed="allowed",e.forbidden="forbidden"}(p=t.AccountStatus||(t.AccountStatus={})),function(e){e.authentificationRequired="authentificationRequired",e.accountNotFound="accountNotFound",e.accountForbidden="accountForbidden",e.invalidLoginOrPassword="invalidLoginOrPassword",e.tokenExpired="tokenExpired",e.isNotAnAccessToken="isNotAnAccessToken",e.isNotARefreshToken="isNotARefreshToken",e.tokenWasRevoked="tokenWasRevoked"}(m=t.ResponseErrorType||(t.ResponseErrorType={}));t.Authentificator=class{constructor(e){this.props=e}static cryptUserPassword(e){const t=s.default.genSaltSync(10);return s.default.hashSync(e,t)}static verifyToken(e,t){if(null===e||""===e)throw new d.UnauthorizedError("The token must be provided");try{const n=i.default.readFileSync(t);return a.default.verify(String(e),n)}catch(e){throw new d.UnauthorizedError("Token verification failed",e)}}registerTokens(e){return r(this,void 0,void 0,(function*(){const{context:t}=this.props,{knex:n,logger:r}=t,o=yield n.select(["id","roles"]).from("accounts").where({id:e.uuid}).first(),i=this.generateTokens({uuid:o.id,roles:o.roles});try{yield n("tokens").insert({id:i.accessToken.payload.id,account:i.accessToken.payload.uuid,type:f.access,deviceInfo:e.deviceInfo,expiredAt:u.default(i.accessToken.payload.exp).format()})}catch(e){throw new d.ServerError("Failed to register access token",e)}try{yield n("tokens").insert({id:i.refreshToken.payload.id,account:i.refreshToken.payload.uuid,type:f.refresh,associated:i.accessToken.payload.id,deviceInfo:e.deviceInfo,expiredAt:u.default(i.refreshToken.payload.exp).format()})}catch(e){throw new d.ServerError("Failed to register refresh token",e)}return r.auth.info("New Access token was registered",i.accessToken.payload),i}))}generateTokens(e,t){var n,r;const{context:o}=this.props,s=(null===(n=t)||void 0===n?void 0:n.access)?t.access:o.jwt.accessTokenExpiresIn,u=(null===(r=t)||void 0===r?void 0:r.refresh)?t.refresh:o.jwt.refreshTokenExpiresIn;try{i.default.accessSync(o.jwt.privateKey)}catch(e){throw new d.ServerError("Failed to open JWT privateKey file",{err:e})}const l=i.default.readFileSync(o.jwt.privateKey),p=Object.assign(Object.assign({},e),{type:f.access,id:c.v4(),exp:Math.floor(Date.now()/1e3)+Number(s),iss:o.jwt.issuer}),m=Object.assign(Object.assign({},e),{type:f.refresh,id:c.v4(),associated:p.id,exp:Math.floor(Date.now()/1e3)+Number(u),iss:o.jwt.issuer}),v=a.default.sign(p,l,{algorithm:o.jwt.algorithm}),y=a.default.sign(m,l,{algorithm:o.jwt.algorithm});return{accessToken:{token:v,payload:Object.assign(Object.assign({},p),{type:f.access})},refreshToken:{token:y,payload:Object.assign(Object.assign({},m),{type:f.refresh})}}}revokeToken(e){return r(this,void 0,void 0,(function*(){const{context:t}=this.props,{knex:n}=t;yield n.del("tokens").where({id:e})}))}static extractToken(e){const{headers:t}=e;if(l.TOKEN_AUTHORIZATION_KEY.toLocaleLowerCase()in t){const[e,n]=String(t[l.TOKEN_AUTHORIZATION_KEY.toLocaleLowerCase()]).split(" ");if(e===l.TOKEN_BEARER&&""!==n)return String(n)}return l.TOKEN_AUTHORIZATION_KEY in e.signedCookies?String(e.signedCookies[l.TOKEN_AUTHORIZATION_KEY]):""}checkTokenExist(e){return r(this,void 0,void 0,(function*(){const{context:t}=this.props,{knex:n}=t;return null!==(yield n.select(["id"]).from("tokens").where({id:e}).first())}))}getAccountByLogin(e,t){return r(this,void 0,void 0,(function*(){const{context:n}=this.props,{knex:r}=n,o=yield r.select(["id","password","status","roles"]).from("accounts").where({login:e}).first();return void 0===o?{error:m.accountNotFound,account:!1}:"string"!=typeof t||s.default.compareSync(t,o.password)?o.status===p.forbidden?{error:m.accountForbidden,account:!1}:{account:{id:o.id,password:o.password,status:o.status,roles:o.roles}}:{error:m.invalidLoginOrPassword,account:!1}}))}static sendResponseError(e,t){const n=[];switch(e){case"accountForbidden":n.push({message:"Account locked",name:"Authorization error"});break;case"authentificationRequired":n.push({message:"Authentication Required",name:"Authorization error"});break;case"isNotARefreshToken":n.push({message:"Token error",name:"Is not a refresh token"});break;case"isNotAnAccessToken":n.push({message:"Token error",name:"Is not a access token"});break;case"tokenExpired":n.push({message:"Token error",name:"This token expired"});break;case"tokenWasRevoked":n.push({message:"Token error",name:"Token was revoked"});break;case"accountNotFound":case"invalidLoginOrPassword":default:n.push({message:"Invalid login or password",name:"Authorization error"})}return t.status(401).json({errors:n})}getAccounts(e){const{context:t}=this.props,{knex:n}=t,{limit:r,orderBy:o,where:i}=e;return n.select(["j.totalCount","accounts.*"]).join(n("accounts").select(["id",n.raw('count(*) over() as "totalCount"')]).orderBy(o).limit(r).where(i).as("j"),"j.id","accounts.id").orderBy(o).from("accounts").then(e=>({totalCount:e.length?e[0].totalCount:0,nodes:e,limit:r}))}}},function(e,t){e.exports=require("fs")},function(e,t){e.exports=require("express")},function(e,t){e.exports=require("graphql-tools")},function(e,t,n){"use strict";var r=this&&this.__awaiter||function(e,t,n,r){return new(n||(n=Promise))((function(o,i){function s(e){try{u(r.next(e))}catch(e){i(e)}}function a(e){try{u(r.throw(e))}catch(e){i(e)}}function u(e){var t;e.done?o(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(s,a)}u((r=r.apply(e,t||[])).next())}))},o=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const i=o(n(29)),s=n(9),a=o(n(30)),u=n(0),c=n(1),d=n(7),l=e=>{const{context:t,authUrl:n,allowedUrl:o}=e,{endpoint:l}=e.context,{publicKey:f}=e.context.jwt,{logger:p}=t,m=new d.Authentificator({context:t}),v=s.Router();return v.post(`${n}/access-token`,a.default((t,n)=>r(void 0,void 0,void 0,(function*(){const{body:r,headers:o}=t,s=(new i.default).parse(o["user-agent"]),{login:a,password:l}=r;if("string"!=typeof a||"string"!=typeof l)throw new u.BadRequestError("login and password must be provied");p.auth.info("Access token request",{login:a});const{error:f,account:v}=yield m.getAccountByLogin(a,l);if(void 0!==f||!1===v)return p.auth.error(f,{login:a}),d.Authentificator.sendResponseError(f,n);const y=yield m.registerTokens({uuid:v.id,deviceInfo:s});n.cookie(c.TOKEN_AUTHORIZATION_KEY,y.accessToken.token,{expires:new Date((new Date).getTime()+1e3*e.context.jwt.accessTokenExpiresIn),signed:!0,httpOnly:!0,secure:!0});const g={accessToken:y.accessToken.token,tokenType:c.TOKEN_BEARER,expiresIn:e.context.jwt.accessTokenExpiresIn,refreshToken:y.refreshToken.token,id:v.id,roles:v.roles};return n.status(200).json(g)})))),v.post(`${n}/refresh-token`,a.default((n,o)=>r(void 0,void 0,void 0,(function*(){const{headers:r}=n,s=d.Authentificator.extractToken(n),a=d.Authentificator.verifyToken(s,t.jwt.publicKey);if(a.type!==d.TokenType.refresh)return p.auth.info("Tried to refresh token by access token. Rejected",{payload:a}),d.Authentificator.sendResponseError(d.ResponseErrorType.isNotARefreshToken,o);if(!(yield m.checkTokenExist(a.id)))return p.auth.info("Tried to refresh token by revoked refresh token. Rejected",{payload:a}),d.Authentificator.sendResponseError(d.ResponseErrorType.tokenWasRevoked,o);const u=(new i.default).parse(r["user-agent"]);yield m.revokeToken(a.associated),yield m.revokeToken(a.id);const c=yield m.registerTokens({uuid:a.uuid,deviceInfo:u});return o.status(200).json({accessToken:c.accessToken.token,tokenType:"bearer",expiresIn:e.context.jwt.accessTokenExpiresIn,refreshToken:c.refreshToken.token})})))),v.post(`${n}/validate-token`,a.default((e,t)=>r(void 0,void 0,void 0,(function*(){const{body:n}=e,{token:r}=n,o=d.Authentificator.verifyToken(String(r),f);t.json(o)})))),v.use(l,a.default((e,t,n)=>r(void 0,void 0,void 0,(function*(){if(o.includes(e.originalUrl))return n();const r=d.Authentificator.extractToken(e);return d.Authentificator.verifyToken(String(r),f).type!==d.TokenType.access?d.Authentificator.sendResponseError(d.ResponseErrorType.isNotAnAccessToken,t):n()})))),v};t.authentificatorMiddleware=l,t.default=l},function(e,t,n){"use strict";var r;Object.defineProperty(t,"__esModule",{value:!0}),function(e){e.ASC="ASC",e.DESC="DESC"}(r=t.IDirectionRange||(t.IDirectionRange={})),t.stringToCursor=e=>Buffer.from(String(e),"binary").toString("base64"),t.cursorToString=e=>Buffer.from(e,"base64").toString("binary"),t.nodeToEdge=e=>{const{cursor:n}=e;return{node:e,cursor:t.stringToCursor(n.toString())}};t.buildCursorConnection=e=>{const{nodes:n,totalCount:r}=e;return{totalCount:r,pageInfo:{startCursor:n.length?t.stringToCursor(String(n[0].cursor)):void 0,endCursor:n.length?t.stringToCursor(String(n[n.length-1].cursor)):void 0,hasPreviousPage:!1,hasNextPage:!1},edges:n.map(e=>t.nodeToEdge(e))}};t.buildQueryFilter=e=>{const{first:n,last:o,after:i,before:s,orderBy:a,where:u}=e,c={limit:void 0!==n?n:o,orderBy:[{column:"cursor",order:r.ASC}],where:{}};return"object"==typeof a&&c.orderBy.unshift({column:a.field,order:a.direction}),c.where=e=>(void 0!==i&&e.where("cursor",">",Number(t.cursorToString(i))),void 0!==s&&e.where("cursor","<",Number(t.cursorToString(s))),void 0!==u&&e.where(u),e),c}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const r=n(36),o=n(0),i={pool:new Map,logger:void 0};class s{static addJob(e,t){if(i.pool.get(e))throw new o.ServerError(`Cron job with name «${e}» already exists`,{jobName:e});const n=r.job(t);return i.logger&&(i.logger.server.debug(`New Cron job was added with name «${e}» at time ${t.cronTime}`,{jobConfig:t}),n.addCallback(()=>{i.logger.server.debug(`Called Cron job with name «${e}» at time ${t.cronTime}`,{jobConfig:t})})),i.pool.set(e,n),n}static getJob(e){return i.pool.get(e)}static getPool(){return i.pool}}t.CronJobManager=s,s.configure=e=>{const{logger:t}=e;i.logger=t},t.default=s},function(e,t){e.exports=require("moment-timezone")},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),function(e){for(var n in e)t.hasOwnProperty(n)||(t[n]=e[n])}(n(41))},function(e,t,n){"use strict";function r(e){for(var n in e)t.hasOwnProperty(n)||(t[n]=e[n])}Object.defineProperty(t,"__esModule",{value:!0}),r(n(45)),r(n(5)),r(n(4)),r(n(51))},function(e,t,n){"use strict";function r(e){for(var n in e)t.hasOwnProperty(n)||(t[n]=e[n])}Object.defineProperty(t,"__esModule",{value:!0}),r(n(7)),r(n(11))},function(e,t,n){"use strict";function r(e){for(var n in e)t.hasOwnProperty(n)||(t[n]=e[n])}Object.defineProperty(t,"__esModule",{value:!0}),r(n(19)),r(n(1)),r(n(16)),r(n(15)),r(n(0)),r(n(17))},function(e,t,n){"use strict";var r=this&&this.__awaiter||function(e,t,n,r){return new(n||(n=Promise))((function(o,i){function s(e){try{u(r.next(e))}catch(e){i(e)}}function a(e){try{u(r.throw(e))}catch(e){i(e)}}function u(e){var t;e.done?o(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(s,a)}u((r=r.apply(e,t||[])).next())}))},o=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const i=n(20),s=n(21),a=o(n(6)),u=o(n(22)),c=o(n(23)),d=o(n(9)),l=o(n(24)),f=n(25),p=o(n(26)),m=n(10),v=n(27),y=n(28),g=n(11),k=n(15),h=n(16),T=n(55),_=n(1),N=n(60),b=n(13),A=n(62);class E{constructor(e){this.props=Object.assign({port:_.DEFAULT_SERVER_PORT,endpoint:_.DEFAULT_GRAPHQL_ENDPOINT,timezone:_.DEFAULT_SERVER_TIMEZONE,subscriptionsEndpoint:_.DEFAULT_GRAPHQL_SUBSCRIPTIONS_ENDPOINT,usePlayground:!1,useVoyager:!1},e),this.props.routes=Object.assign({auth:_.DEFAULT_ROUTE_AUTH,playground:_.DEFAULT_ROUTE_PLAYGROUND,voyager:_.DEFAULT_ROUTE_VOYAGER},this.props.routes)}bootstrap(e){const{port:t,usePlayground:n,useVoyager:r,endpoint:o,routes:i,serverOptions:a}=this.props,{app:u,schema:c,context:d}=this.createApp(),{logger:l}=d,f=s.createServer(a,u);f.listen(t,()=>{const s={graphql:`https://localhost:${t}${o}`,auth:`https://localhost:${t}${i.auth}`};n&&(s.playground=`https://localhost:${t}${i.playground}`),r&&(s.voyager=`https://localhost:${t}${i.voyager}`),l.server.debug(`App server started at «${s.graphql}»`),this.createSubscriptionServer({schema:c,server:f}),void 0!==e&&e({port:t,context:d,resolveUrl:s})})}createSubscriptionServer(e){const{subscriptionsEndpoint:t}=this.props,{server:n,schema:r}=e;return new y.SubscriptionServer({execute:f.execute,schema:r,subscribe:f.subscribe},{server:n,path:t})}createApp(){const{schemas:e,endpoint:t,timezone:n,port:o,jwt:s,database:f,logger:y,routes:E,subscriptionsEndpoint:O,usePlayground:w,useVoyager:D,serverOptions:S}=this.props,{cookieSign:x}=S;y.server.debug("Create application proc was started");const j=d.default(),M=m.mergeSchemas({schemas:[...e,T.accountsSchema]}),P=k.knexProvider(Object.assign({localTimezone:n,logger:y},f)),I=new i.EventEmitter;b.CronJobManager.configure({logger:y});const R={endpoint:t,timezone:n,jwt:s,logger:y,knex:P,emitter:I};if(j.use(c.default({credentials:!0,origin:(e,t)=>t(null,!0)})),j.use(d.default.json({limit:_.MAXIMUM_REQUEST_BODY_SIZE})),j.use(d.default.urlencoded({extended:!0,limit:_.MAXIMUM_REQUEST_BODY_SIZE})),j.use(u.default(x)),j.use(A.headersMiddleware()),j.use(h.requestHandlerMiddleware({context:R})),j.use(g.authentificatorMiddleware({context:R,authUrl:E.auth,allowedUrl:[E.playground]})),w&&j.get(E.playground,p.default({endpoint:t})),D){const{accessToken:e}=N.configureTokens([""],R);y.server.debug("New AccessToken was created special for GraphQL voyager",{accessToken:e}),console.log(""),console.log(`${a.default.yellow.bold("Note: ")}${a.default.yellow("An access token was created specifically for GraphQL voyager")}`),console.log(`${a.default.yellow("This token was expire at")} ${a.default.yellowBright.bold(new Date(Date.now()+18e5))}`),console.log(a.default.yellow("After the token expires, you must restart the application")),j.use(E.voyager,v.express({endpointUrl:t,headersJS:JSON.stringify({Authorization:`Bearer ${e.token}`})}))}return j.use(t,l.default(()=>r(this,void 0,void 0,(function*(){return{context:R,graphiql:!1,schema:M,subscriptionsEndpoint:`ws://localhost:${o}${O}`}})))),j.use(h.errorHandlerMiddleware({context:R})),y.server.debug("Application was created"),{app:j,context:R,schema:M,routes:E}}}t.App=E,t.default=E},function(e,t){e.exports=require("events")},function(e,t){e.exports=require("https")},function(e,t){e.exports=require("cookie-parser")},function(e,t){e.exports=require("cors")},function(e,t){e.exports=require("express-graphql")},function(e,t){e.exports=require("graphql")},function(e,t){e.exports=require("graphql-playground-middleware-express")},function(e,t){e.exports=require("graphql-voyager/middleware")},function(e,t){e.exports=require("subscriptions-transport-ws")},function(e,t){e.exports=require("device-detector-js")},function(e,t){e.exports=require("express-async-handler")},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});class r extends Error{constructor(e,t){super(e),this.name="BadRequestError",this.message=e,this.metaData=t,this.status=400,Object.setPrototypeOf(this,r.prototype)}}t.default=r},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});class r extends Error{constructor(e,t){super(e),this.name="ForbiddenError",this.message=e,this.metaData=t,this.status=403,Object.setPrototypeOf(this,r.prototype)}}t.default=r},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});class r extends Error{constructor(e,t){super(e),this.name="NotFoundError",this.message=e,this.metaData=t,this.status=404,Object.setPrototypeOf(this,r.prototype)}}t.default=r},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});class r extends Error{constructor(e,t){super(e),this.name="ServerError",this.message=e,this.metaData=t,this.status=500,Object.setPrototypeOf(this,r.prototype)}}t.default=r},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});class r extends Error{constructor(e,t){super(e),this.name="UnauthorizedError",this.message=e,this.metaData=t,this.status=401,Object.setPrototypeOf(this,r.prototype)}}t.default=r},function(e,t){e.exports=require("cron")},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.TOKEN_AUTHORIZATION_KEY="Authorization",t.TOKEN_BEARER="Bearer",t.DATABASE_CHARSET="UTF8",t.DATABASE_CLIENT="pg",t.DEFAULT_SERVER_PORT=4e3,t.DEFAULT_GRAPHQL_ENDPOINT="/graphql",t.DEFAULT_GRAPHQL_SUBSCRIPTIONS_ENDPOINT="/subscriptions",t.DEFAULT_SERVER_TIMEZONE="UTC",t.DEFAULT_ROUTE_AUTH="/auth",t.DEFAULT_ROUTE_PLAYGROUND="/playground",t.DEFAULT_ROUTE_VOYAGER="/voyager",t.MAXIMUM_REQUEST_BODY_SIZE="50mb"},function(e,t){e.exports=require("bcryptjs")},function(e,t){e.exports=require("jsonwebtoken")},function(e,t){e.exports=require("uuid")},function(e,t,n){"use strict";var r=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const o=n(42),i=r(n(43)),s=r(n(14)),a=n(44),u=n(0),c=n(1),d=e=>{const{connection:t,logger:n,timezone:r,localTimezone:d}=e,l={};a.types.setTypeParser(a.types.builtins.TIMESTAMP,"text",e=>s.default.tz(e,d).format()),a.types.setTypeParser(a.types.builtins.TIMESTAMPTZ,"text",e=>s.default.tz(e,d).format()),a.types.setTypeParser(a.types.builtins.NUMERIC,parseFloat),n.server.debug("pg-types configured");let f=0;const p=i.default({client:c.DATABASE_CLIENT,connection:t,pool:{afterCreate:(e,t)=>{e.query(`\n            SET TIMEZONE = '${r}';\n            SET CLIENT_ENCODING = ${c.DATABASE_CHARSET};\n          `,o=>{o?n.sql.debug("Connection error",{err:o}):(n.sql.debug(`The TIMEZONE was set to "${r}"`),n.sql.debug(`The charset was set to "${c.DATABASE_CHARSET}"`)),t(o,e)})}}});return p.on("query",e=>{const t=e.__knexQueryUid;l[t]={position:f,query:e,startTime:o.performance.now(),finished:!1},f+=1}).on("query-response",(e,t)=>{const r=t.__knexQueryUid;l[r].endTime=o.performance.now(),l[r].finished=!0,n.sql.debug(t.sql,Object.assign({bindings:t.bindings},l[r]))}).on("query-error",(e,t)=>{console.log(t),n.sql.error(t.sql,{bindings:t.bindings,err:e})}),n.server.debug("Knex provider configured"),p.raw("SELECT 1+1 AS result").then(()=>(n.server.debug("Test the connection by trying to authenticate is OK"),!0)).catch(e=>{throw n.server.error(e.name,e),new u.ServerError(e)}),p};t.knexProvider=d,t.default=d},function(e,t){e.exports=require("perf_hooks")},function(e,t){e.exports=require("knex")},function(e,t){e.exports=require("pg")},function(e,t,n){"use strict";var r=this&&this.__rest||function(e,t){var n={};for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&t.indexOf(r)<0&&(n[r]=e[r]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var o=0;for(r=Object.getOwnPropertySymbols(e);o<r.length;o++)t.indexOf(r[o])<0&&Object.prototype.propertyIsEnumerable.call(e,r[o])&&(n[r[o]]=e[r[o]])}return n};Object.defineProperty(t,"__esModule",{value:!0}),n(2);const o=n(46);let i;t.logger=i;const s=e=>{const{loggers:n}=e,s=r(e,["loggers"]);return t.logger=i=Object.assign({auth:o.authLogger(s),http:o.httpLogger(s),server:o.serverLogger(s),sql:o.sqlLogger(s)},n),i};t.configureLogger=s,t.default=s},function(e,t,n){"use strict";var r=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const o=r(n(47));t.authLogger=o.default;const i=r(n(48));t.httpLogger=i.default;const s=r(n(49));t.serverLogger=s.default;const a=r(n(50));t.sqlLogger=a.default},function(e,t,n){"use strict";var r=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const o=n(3);n(2);const i=r(n(4)),s=n(5);t.default=e=>{const{logDir:t}=e;return o.createLogger({level:"info",format:i.default,transports:[new o.transports.DailyRotateFile({filename:`${t}/${s.AUTH_LOG_FILENAME}`,level:"info",datePattern:"YYYY-MM-DD",zippedArchive:!0,maxSize:"20m",maxFiles:"14d"}),new o.transports.DailyRotateFile({filename:`${t}/${s.DEBUG_LOG_FILENAME}`,level:"debug",datePattern:"YYYY-MM-DD",zippedArchive:!0,maxSize:"20m",maxFiles:"14d"})]})}},function(e,t,n){"use strict";var r=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const o=n(3);n(2);const i=r(n(4)),s=n(5);t.default=e=>{const{logDir:t}=e;return o.createLogger({level:"info",format:i.default,transports:[new o.transports.DailyRotateFile({filename:`${t}/${s.HTTP_LOG_FILENAME}`,level:"info",datePattern:"YYYY-MM-DD",zippedArchive:!0,maxSize:"20m",maxFiles:"14d"})]})}},function(e,t,n){"use strict";var r=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const o=n(3);n(2);const i=r(n(4)),s=n(5);t.default=e=>{const{logDir:t}=e;return o.createLogger({level:"debug",format:i.default,transports:[new o.transports.DailyRotateFile({filename:`${t}/${s.ERRORS_LOG_FILENAME}`,level:"error",datePattern:"YYYY-MM-DD",zippedArchive:!0,maxSize:"20m",maxFiles:"14d"}),new o.transports.DailyRotateFile({filename:`${t}/${s.DEBUG_LOG_FILENAME}`,level:"debug",datePattern:"YYYY-MM-DD",zippedArchive:!0,maxSize:"20m",maxFiles:"14d"})]})}},function(e,t,n){"use strict";var r=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const o=n(3);n(2);const i=r(n(4)),s=n(5);t.default=e=>{const{logDir:t}=e;return o.createLogger({level:"debug",format:i.default,transports:[new o.transports.DailyRotateFile({filename:`${t}/${s.SQL_LOG_FILENAME}`,level:"debug",datePattern:"YYYY-MM-DD",zippedArchive:!0,maxSize:"20m",maxFiles:"14d"}),new o.transports.Console({level:"error"})]})}},function(e,t,n){"use strict";var r=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const o=r(n(52));t.errorHandlerMiddleware=o.default;const i=r(n(54));t.requestHandlerMiddleware=i.default},function(e,t,n){"use strict";var r=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});r(n(6));const o=r(n(53));t.default=e=>{const{context:t}=e,{logger:n}=t;return[(e,t,r,i)=>{const{status:s,stack:a,name:u,message:c,metaData:d}=e,{originalUrl:l}=t,f=c?`${s||""} ${c}`:"Unknown error";switch(s){case 401:n.auth.error(f,{originalUrl:l,stack:a,metaData:d});break;case 500:default:n.server.error(f,{originalUrl:l,stack:a,metaData:d})}r.status(s||500).json(o.default({message:c||"Please contact system administrator",name:u||"Internal server error"}))},(e,t)=>{t.status(404).end()},(e,t)=>{t.status(503).end()},(e,t)=>{t.status(400).end()}]}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default=e=>{const{name:t,message:n}=e;return{errors:[{name:t||"Unknown Error",message:n||t||"Unknown Error"}]}}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default=e=>{const{context:t}=e,{logger:n}=t;return(e,t,r)=>{const{method:o,originalUrl:i,headers:s}=e,a=String(e.headers["x-forwarded-for"]||"").replace(/:\d+$/,"")||e.connection.remoteAddress,u="127.0.0.1"===a||"::1"===a?"localhost":a;return n.http.info(`${u} ${o} "${i}"`,{headers:s}),r()}}},function(e,t,n){"use strict";var r=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const o=r(n(56));t.accountsSchema=o.default,t.default=o.default},function(e,t,n){"use strict";var r=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}},o=this&&this.__importStar||function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var n in e)Object.hasOwnProperty.call(e,n)&&(t[n]=e[n]);return t.default=e,t};Object.defineProperty(t,"__esModule",{value:!0});const i=n(10),s=r(n(57)),a=o(n(59)),u=i.makeExecutableSchema({typeDefs:a,resolvers:s.default});t.default=u},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const r={Query:{accounts:()=>({})},AccountsQueries:n(58).AccountsQueries};t.default=r},function(e,t,n){"use strict";var r=this&&this.__awaiter||function(e,t,n,r){return new(n||(n=Promise))((function(o,i){function s(e){try{u(r.next(e))}catch(e){i(e)}}function a(e){try{u(r.throw(e))}catch(e){i(e)}}function u(e){var t;e.done?o(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(s,a)}u((r=r.apply(e,t||[])).next())}))};Object.defineProperty(t,"__esModule",{value:!0});const o=n(17),i=n(12);t.AccountsQueries={list:(e,t,n)=>r(void 0,void 0,void 0,(function*(){const e=new o.Authentificator({context:n}),r=i.buildQueryFilter(t),s=yield e.getAccounts(r);return i.buildCursorConnection(s)}))},t.default=t.AccountsQueries},function(e,t){var n={kind:"Document",definitions:[{kind:"ObjectTypeDefinition",name:{kind:"Name",value:"Query"},interfaces:[],directives:[],fields:[{kind:"FieldDefinition",name:{kind:"Name",value:"accounts"},arguments:[],type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"AccountsQueries"}}},directives:[]}]},{kind:"ObjectTypeDefinition",description:{kind:"StringValue",value:"Information about pagination in a connection.",block:!0},name:{kind:"Name",value:"PageInfo"},interfaces:[],directives:[],fields:[{kind:"FieldDefinition",name:{kind:"Name",value:"hasPreviousPage"},arguments:[],type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},directives:[]},{kind:"FieldDefinition",name:{kind:"Name",value:"hasNextPage"},arguments:[],type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},directives:[]},{kind:"FieldDefinition",name:{kind:"Name",value:"startCursor"},arguments:[],type:{kind:"NamedType",name:{kind:"Name",value:"String"}},directives:[]},{kind:"FieldDefinition",name:{kind:"Name",value:"endCursor"},arguments:[],type:{kind:"NamedType",name:{kind:"Name",value:"String"}},directives:[]}]},{kind:"ObjectTypeDefinition",description:{kind:"StringValue",value:"Account adge bundle",block:!0},name:{kind:"Name",value:"AccountsEdge"},interfaces:[],directives:[],fields:[{kind:"FieldDefinition",name:{kind:"Name",value:"node"},arguments:[],type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"Account"}}},directives:[]},{kind:"FieldDefinition",name:{kind:"Name",value:"cursor"},arguments:[],type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},directives:[]}]},{kind:"ObjectTypeDefinition",description:{kind:"StringValue",value:"Accounts module queries",block:!0},name:{kind:"Name",value:"AccountsQueries"},interfaces:[],directives:[],fields:[{kind:"FieldDefinition",description:{kind:"StringValue",value:"Returns Accounts list bundle",block:!0},name:{kind:"Name",value:"list"},arguments:[{kind:"InputValueDefinition",name:{kind:"Name",value:"first"},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}},directives:[]},{kind:"InputValueDefinition",name:{kind:"Name",value:"last"},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}},directives:[]},{kind:"InputValueDefinition",name:{kind:"Name",value:"after"},type:{kind:"NamedType",name:{kind:"Name",value:"String"}},directives:[]},{kind:"InputValueDefinition",name:{kind:"Name",value:"before"},type:{kind:"NamedType",name:{kind:"Name",value:"String"}},directives:[]},{kind:"InputValueDefinition",name:{kind:"Name",value:"status"},type:{kind:"NamedType",name:{kind:"Name",value:"AccountStatus"}},directives:[]},{kind:"InputValueDefinition",name:{kind:"Name",value:"orderBy"},type:{kind:"NamedType",name:{kind:"Name",value:"AccountOrderBy"}},directives:[]}],type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"AccountListResult"}}},directives:[]}]},{kind:"InputObjectTypeDefinition",description:{kind:"StringValue",value:"Ordering options for accounts returned from the connection",block:!0},name:{kind:"Name",value:"AccountOrderBy"},directives:[],fields:[{kind:"InputValueDefinition",name:{kind:"Name",value:"field"},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"AccountOrderField"}}},directives:[]},{kind:"InputValueDefinition",name:{kind:"Name",value:"direction"},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"OrderDirection"}}},directives:[]}]},{kind:"EnumTypeDefinition",name:{kind:"Name",value:"AccountOrderField"},directives:[],values:[{kind:"EnumValueDefinition",name:{kind:"Name",value:"name"},directives:[]},{kind:"EnumValueDefinition",name:{kind:"Name",value:"login"},directives:[]},{kind:"EnumValueDefinition",name:{kind:"Name",value:"createdAt"},directives:[]},{kind:"EnumValueDefinition",name:{kind:"Name",value:"updatedAt"},directives:[]}]},{kind:"EnumTypeDefinition",name:{kind:"Name",value:"OrderDirection"},directives:[],values:[{kind:"EnumValueDefinition",name:{kind:"Name",value:"ASC"},directives:[]},{kind:"EnumValueDefinition",name:{kind:"Name",value:"DESC"},directives:[]}]},{kind:"ObjectTypeDefinition",description:{kind:"StringValue",value:"Account object",block:!0},name:{kind:"Name",value:"Account"},interfaces:[],directives:[],fields:[{kind:"FieldDefinition",name:{kind:"Name",value:"id"},arguments:[],type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"ID"}}},directives:[]},{kind:"FieldDefinition",name:{kind:"Name",value:"name"},arguments:[],type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},directives:[]},{kind:"FieldDefinition",name:{kind:"Name",value:"login"},arguments:[],type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},directives:[]},{kind:"FieldDefinition",name:{kind:"Name",value:"password"},arguments:[],type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},directives:[]},{kind:"FieldDefinition",name:{kind:"Name",value:"status"},arguments:[],type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"AccountStatus"}}},directives:[]},{kind:"FieldDefinition",name:{kind:"Name",value:"createdAt"},arguments:[],type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},directives:[]},{kind:"FieldDefinition",name:{kind:"Name",value:"updatedAt"},arguments:[],type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},directives:[]},{kind:"FieldDefinition",name:{kind:"Name",value:"roles"},arguments:[],type:{kind:"NonNullType",type:{kind:"ListType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},directives:[]}]},{kind:"ObjectTypeDefinition",description:{kind:"StringValue",value:"Accounts list bundle",block:!0},name:{kind:"Name",value:"AccountListResult"},interfaces:[],directives:[],fields:[{kind:"FieldDefinition",name:{kind:"Name",value:"totalCount"},arguments:[],type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},directives:[]},{kind:"FieldDefinition",name:{kind:"Name",value:"pageInfo"},arguments:[],type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"PageInfo"}}},directives:[]},{kind:"FieldDefinition",name:{kind:"Name",value:"edges"},arguments:[],type:{kind:"NonNullType",type:{kind:"ListType",type:{kind:"NamedType",name:{kind:"Name",value:"AccountsEdge"}}}},directives:[]}]},{kind:"EnumTypeDefinition",description:{kind:"StringValue",value:"Account status",block:!0},name:{kind:"Name",value:"AccountStatus"},directives:[],values:[{kind:"EnumValueDefinition",name:{kind:"Name",value:"allowed"},directives:[]},{kind:"EnumValueDefinition",name:{kind:"Name",value:"forbidden"},directives:[]}]}],loc:{start:0,end:1189}};n.loc.source={body:'type Query {\n  accounts: AccountsQueries!\n}\n\n"""\nInformation about pagination in a connection.\n"""\ntype PageInfo {\n  hasPreviousPage: Boolean!\n  hasNextPage: Boolean!\n  startCursor: String\n  endCursor: String\n}\n\n"""\nAccount adge bundle\n"""\ntype AccountsEdge {\n  node: Account!\n  cursor: String!\n}\n\n"""\nAccounts module queries\n"""\ntype AccountsQueries {\n\n  """\n  Returns Accounts list bundle\n  """\n  list(\n    first: Int\n    last: Int\n    after: String\n    before: String\n    status: AccountStatus\n    orderBy: AccountOrderBy\n  ): AccountListResult!\n}\n\n"""\nOrdering options for accounts returned from the connection\n"""\ninput AccountOrderBy {\n  field: AccountOrderField!\n  direction: OrderDirection!\n}\n\n\nenum AccountOrderField {\n  name\n  login\n  createdAt\n  updatedAt\n}\n\nenum OrderDirection {\n  ASC\n  DESC\n}\n\n"""\nAccount object\n"""\ntype Account {\n  id: ID!\n  name: String!\n  login: String!\n  password: String!\n  status: AccountStatus!\n  createdAt: String!\n  updatedAt: String!\n  roles: [String]!\n}\n\n"""\nAccounts list bundle\n"""\ntype AccountListResult {\n  totalCount: Int!\n  pageInfo: PageInfo!\n  edges: [AccountsEdge]!\n}\n\n\n"""\nAccount status\n"""\nenum AccountStatus {\n  allowed\n  forbidden\n}',name:"GraphQL request",locationOffset:{line:1,column:1}};e.exports=n},function(e,t,n){"use strict";var r=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const o=r(n(61)),i=n(7),s=(e,t)=>new i.Authentificator({context:t}).generateTokens({uuid:o.default(),roles:e},{access:86400,refresh:86400});t.configureTokens=s,t.default=s},function(e,t){e.exports=require("uuid/v4")},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.headersMiddleware=()=>(e,t,n)=>{t.removeHeader("X-Powered-By"),t.setHeader("X-Developer","Via Profit"),n()},t.default=t.headersMiddleware}]);