import type { PubsubFactory, SubscriptionsFactory } from '@via-profit-services/core';
import { execute, subscribe } from 'graphql';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import Redis from 'ioredis';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import WebSocket from 'ws';

import ServerError from './errorHandlers/ServerError';

export const pubsubFactory: PubsubFactory = (config, logger) => {
  const { redis } = config;

  let redisHandle: Redis.Redis;
  let redisPublisherHandle: Redis.Redis;
  let redisSubscriberHandle: Redis.Redis;

  const redisConfig = {
    retryStrategy: (times: number) => Math.min(times * 50, 20000),
    ...redis,
  };

  try {
    redisHandle = new Redis(redisConfig);
    redisPublisherHandle = new Redis(redisConfig);
    redisSubscriberHandle = new Redis(redisConfig);
  } catch (err) {
    throw new ServerError('Failed to init Redis handle', { err });
  }

  redisHandle.on('error', (err) => {
    logger.server.error(`Redis Common error ${err.errno}`, { err });
  });

  redisPublisherHandle.on('error', (err) => {
    logger.server.error(`Redis Publisher error ${err.errno}`, { err });
  });

  redisSubscriberHandle.on('error', (err) => {
    logger.server.error(`Redis Subscriber error ${err.errno}`, { err });
  });

  redisHandle.on('connect', () => {
    logger.server.debug('Redis common connection is Done');
  });

  redisPublisherHandle.on('connect', () => {
    logger.server.debug('Redis Publisher connection is Done');
  });

  redisSubscriberHandle.on('connect', () => {
    logger.server.debug('Redis Subscriber connection is Done');
  });

  redisHandle.on('reconnecting', () => {
    logger.server.debug('Redis common reconnecting');
  });

  redisPublisherHandle.on('reconnecting', () => {
    logger.server.debug('Redis Publisher reconnecting');
  });

  redisSubscriberHandle.on('reconnecting', () => {
    logger.server.debug('Redis Subscriber reconnecting');
  });

  redisHandle.on('close', () => {
    logger.server.debug('Redis common close');
  });

  redisPublisherHandle.on('close', () => {
    logger.server.debug('Redis Publisher close');
  });

  redisSubscriberHandle.on('close', () => {
    logger.server.debug('Redis Subscriber close');
  });

  const pubsub = new RedisPubSub({
    publisher: redisPublisherHandle,
    subscriber: redisSubscriberHandle,
    connection: redis,
  });

  return {
    redis: redisHandle,
    pubsub,
  }
}

export const subscriptionsFactory: SubscriptionsFactory = (server, config, context) => {
  const { schema } = config;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const subscriptionServer = new SubscriptionServer({
    execute,
    schema,
    subscribe,
    onConnect: async () => context,
    onDisconnect: (webSocket: WebSocket) => webSocket.close(),
  },
  {
    server,
    path: '/graphql',
  });
}
