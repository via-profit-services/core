import supertest from 'supertest';
import { configureServer } from '~/playground/serverConfigure';
import { configureTokens } from '~/playground/tokenConfigure';

const endpoint = '/test';
const { server, context } = configureServer({ port: 4001, endpoint });
const { accessToken } = configureTokens([], context);

describe('Server', () => {
  it('Any request without token should be rejected with ServerError 500', done => {
    supertest(server)
      .post(endpoint)
      .set('Content-Type', 'application/json')
      .expect('Content-Type', /json/)
      .expect(500)
      .end(done);
  });

  it('Some', done => {
    supertest(server)
      .post(`${endpoint}`)
      .set('Authorization', `Bearer ${accessToken.token}`)
      .set('Content-Type', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(done);
  });
});
