// We will implement the class that will encapsulate logic for working with the groups table,
// and I will call it groups access.


import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

const XAWS = AWSXRay.captureAWS(AWS)

import { Group } from '../models/Group'

export class GroupAccess {

  constructor(
    // DocumentClient allows us to work with DynamoDB
    // groupsTable is the table where we store the names about our groups
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly groupsTable = process.env.GROUPS_TABLE) {
  }

  async getAllGroups(): Promise<Group[]> {
    console.log('Getting all groups')

    const result = await this.docClient.scan({
      TableName: this.groupsTable
    }).promise()

    const items = result.Items
    return items as Group[]
  }

  async createGroup(group: Group): Promise<Group> {
    await this.docClient.put({
      TableName: this.groupsTable,
      Item: group
    }).promise()

    return group
  }
}

function createDynamoDBClient() {
  // if you are offline, serverless offline will set this variable IS_OFFLINE to true
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}


