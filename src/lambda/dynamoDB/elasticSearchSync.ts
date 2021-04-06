import { DynamoDBStreamEvent, DynamoDBStreamHandler } from 'aws-lambda'
import 'source-map-support/register'

import * as elasticsearch from 'elasticsearch'
import * as httpAwsEs from 'http-aws-es'

const esHost = process.env.ES_ENDPOINT

// creating an instance of elasticSearchClient that we will use
// to write items to Elasticsearch
const es = new elasticsearch.Client({
  hosts: [ esHost ],
  connectionClass: httpAwsEs
})

export const handler: DynamoDBStreamHandler = async (event: DynamoDBStreamEvent) => {
  console.log('Processing events batch from DynamoDB', JSON.stringify(event))

  for (const record of event.Records) {
    console.log('Processing record', JSON.stringify(record))
    // if it is not 'INSERT' we just skip this record!
    if (record.eventName !== 'INSERT') {
      continue
    }

    // get the dynamodDB item that was added to dynamoDB
    const newItem = record.dynamodb.NewImage

    // get an id of the image that was added to our images table
    const imageId = newItem.imageId.S

    // create a document that it want to store in Elasticsearch
    const body = {
      imageId: newItem.imageId.S,
      groupId: newItem.groupId.S,
      imageUrl: newItem.imageUrl.S,
      title: newItem.title.S,
      timestamp: newItem.timestamp.S
    }

    // here we upload this document to Elasticsearch
    await es.index({
      index: 'images-index',
      type: 'images',
      id: imageId,
      body
    })

  }
}
