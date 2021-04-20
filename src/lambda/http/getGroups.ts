import 'source-map-support/register'
import { getAllGroups } from '../../businessLogic/groups';

// import express and aws-serverless-express dependencies
import * as express from 'express'
import * as awsServerlessExpress from 'aws-serverless-express'

// create and express app
const app = express()

// this is a single function that will procedss get request
app.get('/groups', async (_req, res) => {
  // so, I get all groups and return then as JSON object
  const groups = await getAllGroups()

  // to solve CORS conflict in the frontend
  res.header({
    'Access-Control-Allow-Origin': '*'
  });

  res.json({
    items: groups
  })


})

const server = awsServerlessExpress.createServer(app)
exports.handler = (event, context) => { awsServerlessExpress.proxy(server, event, context) }
