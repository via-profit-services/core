// import assert from 'assert';
// import fs from 'fs';
// import { createServer } from 'http';
// import path from 'path';
// import supertest from 'supertest';
// import configureTest from '../utils/configureTests';

// const packageJson = fs.readFileSync(path.resolve(__dirname, '..', '..', 'package.json'), 'utf8');
// const packageInfo = JSON.parse(packageJson);

// const { app, config, accessToken } = configureTest({ port: 4001 });
// const { endpoint } = config;

describe('GraphQL', () => {
  // const server = createServer(app);
  it('dummy', done => done());
  // it(`GraphQL «devInfo» query. Must returns full «devInfo»`, done => {
  //   supertest(server)
  //     .post(endpoint)
  //     .set('Accept', 'application/json')
  //     .set('Content-Type', 'application/json')
  //     .set('Authorization', `Bearer ${accessToken.token}`)
  //     .send({
  //       query: `
  //       query{
  //         devInfo {
  //           version
  //           name
  //           support
  //           description
  //           author
  //           license
  //           repository {
  //             type
  //             url
  //           }
  //         }
  //       }`,
  //     })
  //     .expect('Content-Type', /json/)
  //     .expect(200)
  //     .then(async response => {
  //       const data = JSON.parse(response.text);
  //       assert.deepEqual(data, {
  //         data: {
  //           devInfo: {
  //             version: packageInfo.version,
  //             name: packageInfo.name,
  //             support: packageInfo.support,
  //             description: packageInfo.description,
  //             author: packageInfo.author,
  //             license: packageInfo.license,
  //             repository: packageInfo.repository,
  //           },
  //         },
  //       });
  //       done();
  //     });
  // });
});
