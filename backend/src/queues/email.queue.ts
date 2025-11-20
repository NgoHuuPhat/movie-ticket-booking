import { Queue } from 'bullmq'
import { queueClient } from '@/services/redis.service'

const emailQueue = new Queue('email', {
  connection: queueClient
})

export const addEmailToQueue = async (to: string, subject: string, body: string) => {
  await emailQueue.add('sendEmail', { to, subject, body }, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000
    }
  })
}
