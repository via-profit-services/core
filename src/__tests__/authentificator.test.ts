import { createServer } from 'http';
import supertest from 'supertest';
import { TOKEN_AUTHORIZATION_KEY, TOKEN_BEARER } from '../utils';
import configureTest from '../utils/configureTests';

const { app, config, accessToken } = configureTest({ port: 4001 });
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
      .set(TOKEN_AUTHORIZATION_KEY, `${TOKEN_BEARER} ${accessToken.token}`)
      .set('Content-Type', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400)
      .end(done);
  });
});
