import Redis from 'ioredis'

const bullMQConfig = {
  maxRetriesPerRequest: null
}

export const redisClient = new Redis(process.env.REDIS_URL!)
redisClient.on('error', (err) => console.log('Redis Client Error', err))

export const queueClient = new Redis(process.env.REDIS_URL!, bullMQConfig)
queueClient.on('error', (err) => console.log('Redis Queue Client Error', err))

export const workerClient = new Redis(process.env.REDIS_URL!, bullMQConfig)
workerClient.on('error', (err) => console.log('Redis Worker Client Error', err))
