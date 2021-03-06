import { SNSEvent, SNSHandler, S3EventRecord } from 'aws-lambda'
import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

import Jimp from 'jimp/es'
// import { stringify } from 'querystring'


const XAWS = AWSXRay.captureAWS(AWS)

const s3 = new XAWS.S3()

// const s3 = new AWS.S3()

const imagesBucketName = process.env.IMAGES_S3_BUCKET
const thumbnailBucketName = process.env.THUMBNAILS_S3_BUCKET

export const handler: SNSHandler = async (event: SNSEvent) => {
  console.log('Processing SNS event ', JSON.stringify(event))
  for (const snsRecord of event.Records) {
    const s3EventStr = snsRecord.Sns.Message
    console.log('Processing S3 event', s3EventStr)
    const s3Event = JSON.parse(s3EventStr)

    for (const record of s3Event.Records) {
      await processImage(record)
    }
  }
}

async function processImage(record: S3EventRecord) {
  // get a key of an uploaded image in S3
  const key = record.s3.object.key
  console.log('Processing S3 item with key: ', key)
  // download the image using the key and getObject method that get an object from s3
  const response = await s3
    .getObject({
      Bucket: imagesBucketName,
      Key: key
    })
    .promise()

  // response.body is the image that was uploaded from s3
  const body = response.Body
  // read an image with the Jimp library
  const image = await Jimp.read(body)

  console.log('Resizing image')
  // resize an image maintaining the ratio between the image's
  image.resize(150, Jimp.AUTO)


  // convert an image to a buffer that we can write/upload to a different bucket
  const convertedBuffer = await image.getBufferAsync(Jimp.AUTO)

  console.log(`Writing image back to S3 bucket: ${thumbnailBucketName}`)
  await s3
    .putObject({
      Bucket: thumbnailBucketName,
      Key: `${key}.jpeg`,
      Body: convertedBuffer
    })
    .promise()
}
