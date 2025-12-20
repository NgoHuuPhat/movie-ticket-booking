import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

if(!process.env.AWS_REGION || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_S3_BUCKET_NAME) {
  throw new Error('AWS S3 environment variables are not set properly.')
}

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
})

export async function uploadToS3(fileBuffer: Buffer, folderName: string, fileName: string, mimeType: string): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `${folderName}/${fileName}`,
    Body: fileBuffer,
    ContentType: mimeType,
  })
  await s3.send(command)
  return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${folderName}/${fileName}`
}

export async function deleteFromS3(folderName: string, fileName: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `${folderName}/${fileName}`,
  })
  await s3.send(command)
}