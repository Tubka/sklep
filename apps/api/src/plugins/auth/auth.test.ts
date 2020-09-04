import Faker from 'faker';

import { prisma } from '../../db';
import { getServerWithPlugins } from '../../server';

const getServerForTest = async () => {
  const server = await getServerWithPlugins();

  // @note we could replace this with a mock in the future
  // @ts-expect-error
  server.app.db = prisma;

  return server;
};

describe('/auth', () => {
  describe('/me', () => {
    it(`should return nothing when I'm not logged in`, async () => {
      const server = await getServerForTest();

      const injection = await server.inject({
        method: 'GET',
        url: '/auth/me',
      });

      expect(injection.result).toEqual({ data: null });
    });
  });

  describe('/register', () => {
    it(`should register`, async () => {
      const server = await getServerForTest();

      const email = Faker.internet.email(undefined, undefined, 'typeofweb.com');

      const injection = await server.inject({
        method: 'POST',
        url: '/auth/register',
        payload: {
          email,
          password: 'asdASD123!@#',
        },
      });

      expect(injection.statusCode).toEqual(204);
    });

    it(`should return 400 TOO_EASY because the password is easy`, async () => {
      const server = await getServerForTest();

      const injection = await server.inject({
        method: 'POST',
        url: '/auth/register',
        payload: {
          email: Faker.internet.email(undefined, undefined, 'typeofweb.com'),
          password: '123123123',
        },
      });

      expect(injection.statusCode).toEqual(400);
      expect(injection.result).toHaveProperty('message', 'TOO_EASY');
    });

    it(`should return 409 when user with the same email exists`, async () => {
      const server = await getServerForTest();

      const email = Faker.internet.email(undefined, undefined, 'typeofweb.com');

      await server.inject({
        method: 'POST',
        url: '/auth/register',
        payload: {
          email,
          password: 'asdASD123!@#',
        },
      });

      const injection = await server.inject({
        method: 'POST',
        url: '/auth/register',
        payload: {
          email,
          password: '123!@#dsaASD',
        },
      });

      expect(injection.statusCode).toEqual(409);
    });
  });

  describe('/login', () => {
    it('should allow logging in', async () => {
      const server = await getServerForTest();

      const email = Faker.internet.email(undefined, undefined, 'typeofweb.com');
      const password = 'asdASD123!@#';

      await server.inject({
        method: 'POST',
        url: '/auth/register',
        payload: {
          email,
          password,
        },
      });

      const injection = await server.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          email,
          password,
        },
      });

      expect(injection.headers).toHaveProperty('set-cookie');
      expect(injection.headers['set-cookie'][0].startsWith('session')).toBe(true);
    });

    it('logging in should allow using private routes', async () => {
      const server = await getServerForTest();

      server.route({
        method: 'GET',
        path: '/private',
        options: {
          auth: {
            mode: 'required',
          },
        },
        handler(request) {
          return request.auth.credentials.session;
        },
      });

      const failingInjection = await server.inject({
        method: 'GET',
        url: '/private',
      });
      expect(failingInjection.statusCode).toEqual(401);

      const email = Faker.internet.email(undefined, undefined, 'typeofweb.com');
      const password = 'asdASD123!@#';

      await server.inject({
        method: 'POST',
        url: '/auth/register',
        payload: {
          email,
          password,
        },
      });

      const injection = await server.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          email,
          password,
        },
      });
      const cookies = injection.headers['set-cookie'];

      const workingInjection = await server.inject({
        method: 'GET',
        url: '/private',
        headers: {
          Cookie: cookies[0].split(';')[0],
        },
      });
      expect(workingInjection.result).toHaveProperty('id');
      expect(workingInjection.result).toHaveProperty('user');
      expect(workingInjection.result).toHaveProperty('user.email', email);
    });
  });
});
