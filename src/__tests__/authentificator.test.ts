import { createServer } from 'http';
import supertest from 'supertest';
import configureTest from '../utils/configureTests';

const { app, config, accessToken, refreshToken } = configureTest({ port: 4001 });
const { endpoint } = config;

describe('Authentification service', () => {
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

  it('Any GraphQL request with refresh token as bearer authentificator should return 401 «Unauthorized»', done => {
    supertest(server)
      .post(endpoint)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${refreshToken.token}`)
      .send({
        query: `
        query{
          devInfo {
            version
          }
        }`,
      })
      .expect('Content-Type', /json/)
      .expect(401)
      .end(done);
  });
});
