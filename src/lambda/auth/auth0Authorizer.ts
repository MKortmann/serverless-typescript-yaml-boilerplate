import { APIGatewayTokenAuthorizerEvent, APIGatewayAuthorizerResult } from 'aws-lambda'
// import { APIGatewayTokenAuthorizerEvent, APIGatewayAuthorizerResult, APIGatewayAuthorizerHandler } from 'aws-lambda'
import 'source-map-support/register'
// import * as AWS from 'aws-sdk'

import * as middy from 'middy'
// it will read and cache secrets from AWS Secrets Manager
import { secretsManager } from 'middy/middlewares'

// import verify function
import { verify } from 'jsonwebtoken'
// import the JWT token interface that we've just defined
import { JwtToken } from '../../auth/JwtToken'

// const auth0Secret = process.env.AUTH_0_SECRET_ID;

const secretId = process.env.AUTH_0_SECRET_ID
const secretField = process.env.AUTH_0_SECRET_FIELD

// used to read our Auth0 Secret
// const client = new AWS.SecretsManager()

// Cache secret if a Lambda instance is reused, and do not sent requests to
// secrets manager over and over again, lambda function it will be at least some minutes more in
// the memory allowing to reuse it. It save us some money on calling AWS Secret Manager
// let cachedSecret: string


// we need the context in our function because middy, will store the secret in this context
export const handler = middy(async (event: APIGatewayTokenAuthorizerEvent, context): Promise<APIGatewayAuthorizerResult> => {

  try {
    // we first call the verifyToken function and pass the token that we need to verify.
    // we use here await to convert the promise into a value
    const decodedToken = verifyToken(event.authorizationToken, context.AUTH0_SECRET[secretField])

    console.log('User was authorized')

    // if the verifyToken does not throw any expection we will return the policy for
    // API Gateway
    return {
      // getting the user id from JWTtoken - sub is an ID of user that pass identification with Auth0
      principalId: decodedToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    console.log('User was not authorized', e.message)

    // if the user is not authorized, we return another police that will
    // deny access to any Lambda functions.
    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
})

// because of await it should be async function.
// async function returns a promise
function verifyToken(authHeader: string, secret: string): JwtToken {
  if (!authHeader)
    throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  // const secretObject: any = await getSecret()

  // const secret = secretObject[secretField]

  // no acception, so a request has been authorized
  // verify the function and return the result as JwtToken (cast operation)
  return verify(token, secret) as JwtToken
}


// we can the handler method and pass the middleware that we want to use
handler.use(
  secretsManager({
    awsSdkOptions: { region: 'eu-central-1' },
    // we want to cache the secret value
    cache: true,
    cacheExpiryInMillis: 60000,
    // Throw an error if can't read the secret
    throwOnFailedCall: true,
    // specify which secret it should fetch
    secrets: {
      AUTH0_SECRET: secretId
    }
  })
)


// using Middy we do not need to download secret ourselves anymore
// we call the cachedSecret here
// async function getSecret() {

//   if(cachedSecret) return cachedSecret

//   const data = await client.getSecretValue({
//     SecretId: secretId
//   })
//   .promise()

//   cachedSecret = data.SecretString

//   return JSON.parse(cachedSecret)


// }
