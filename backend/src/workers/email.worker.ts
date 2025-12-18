import { Worker } from 'bullmq'
import { workerClient } from '@/services/redis.service'
import { sendEmail, sendTicketEmail } from '@/services/mail.service'

const emailWorker = new Worker('email', async job => {
  const { name, data } = job
  switch (name) {
    case 'sendEmail': {
      const { to, subject, body } = data
      await sendEmail(to, subject, body)
      break
    }
      
    case 'sendMovieTicket': {
      const { to, subject, ticketData, qrBase64 } = data

      const qrBase64Data = qrBase64.split(',')[1]
      const qrBuffer = Buffer.from(qrBase64Data, 'base64')
      await sendTicketEmail(to, subject, ticketData, qrBuffer)
      break
    }
    default:
      throw new Error(`No handler for job name: ${name}`)
  }
}, 
{
  connection: workerClient
})

emailWorker.on('completed', (job) => {
  console.log(`Email job ${job.id} has been completed`)
})
emailWorker.on('failed', (job, err) => {
  console.log(`Email job ${job?.id} has failed with ${err.message}`)
})

export default emailWorker

