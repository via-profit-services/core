// import assert from 'assert';
import { createServer } from 'http';
import supertest from 'supertest';
import configureTest from '../playground/configureTest';

const { app, config, accessToken } = configureTest({ port: 4001 });
const { endpoint } = config;

describe('Server', () => {
  const server = createServer(app);

  it('Any NOT authorized request must return 401 «Unauthorized»', done => {
    supertest(server)
      .post(endpoint)
      .set('Content-Type', 'application/json')
      .expect('Content-Type', /json/)
      .expect(401)
      .end(done);
  });

  it('Any authorized request must return 400 «Bad Request Error»', done => {
    supertest(server)
      .post(`${endpoint}`)
      .set('Authorization', `Bearer ${accessToken.token}`)
      .set('Content-Type', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400)
      .end(done);
  });

  it('GraphQL', done => {
    supertest(server)
      .post(endpoint)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${accessToken.token}`)
      .send({
        query: 'query{devInfo{version}}',
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .end(done);
    // .then(async response => {
    //   const data = JSON.parse(response.text);
    //   assert.deepEqual(
    //     data,
    //     {
    //       data: {
    //         devInfo: {
    //           version: '0.1.1',
    //         },
    //       },
    //     },
    //     'Invalid response ERROR',
    //   );
    //   done();
    // });
  });

  afterAll(async () => {
    server.close();
  });
});
