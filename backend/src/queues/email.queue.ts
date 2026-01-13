import { Queue } from 'bullmq'
import { queueClient } from '@/services/redis.service'
import { ITicketData } from '@/types/payment'

const emailQueue = new Queue('email', {
  connection: queueClient
})

export const addEmailToQueue = async (to: string, subject: string, otp: string) => {
  await emailQueue.add('sendEmail', { to, subject, otp }, {
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

export const addNewsEmailToQueue = async (to: string, title: string, content: string, imageUrl: string) => {
  await emailQueue.add('sendNewsEmail', { to, title, content, imageUrl }, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000
    }
  })
}