import { createServer } from 'http';
import supertest from 'supertest';
import { configureApp } from '~/playground/serverConfigure';
import { configureTokens } from '~/playground/tokenConfigure';

const endpoint = '/test';
const { app, context } = configureApp({ port: 4001, endpoint });
const { accessToken } = configureTokens([], context);
const server = createServer(app);

describe('Server', () => {
  it('Any NOT authorized request must return 500 «Internal Server Error»', done => {
    supertest(server)
      .post(endpoint)
      .set('Content-Type', 'application/json')
      .expect('Content-Type', /json/)
      .expect(500)
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
});
