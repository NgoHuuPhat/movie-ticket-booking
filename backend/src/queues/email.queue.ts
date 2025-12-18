import { Queue } from 'bullmq'
import { queueClient } from '@/services/redis.service'
import { ITicketData } from '@/types/payment'

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

export const addTicketEmailToQueue = async (to: string, subject: string, ticketData: ITicketData, qrBase64: string) => {
  await emailQueue.add('sendMovieTicket', { to, subject, ticketData, qrBase64 }, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000
    }
  })
}
