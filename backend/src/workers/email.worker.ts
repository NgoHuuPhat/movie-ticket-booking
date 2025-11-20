import { Worker } from 'bullmq'
import { workerClient } from '@/services/redis.service'
import { sendEmail } from '@/services/mail.service'

const emailWorker = new Worker('email', async job => {
  const { to, subject, body } = job.data
  await sendEmail(to, subject, body)
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

