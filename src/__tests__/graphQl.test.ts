import assert from 'assert';
import { createServer } from 'http';
import supertest from 'supertest';
import configureTest from '../utils/configureTests';
import { DEV_INFO_DEVELOPER_NAME, DEV_INFO_DEVELOPER_URL } from '../utils/constants';

const { app, config, accessToken } = configureTest({ port: 4001 });
const { endpoint } = config;

describe('GraphQL', () => {
  const server = createServer(app);

  // it('dummy', done => done());
  it('GraphQL «devInfo» query. Must returns full «devInfo»', (done) => {
    supertest(server)
      .post(endpoint)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${accessToken.token}`)
      .send({
        query: `
          query{
            info {
              developer {
                name
                url
              }
            }
          }`,
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .then(async (response) => {
        const data = JSON.parse(response.text);
        assert.deepEqual(data, {
          data: {
            info: {
              developer: {
                name: DEV_INFO_DEVELOPER_NAME,
                url: DEV_INFO_DEVELOPER_URL,
              },
            },
          },
        });
        done();
      });
  });
});
