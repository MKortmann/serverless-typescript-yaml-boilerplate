import { APIGatewayTokenAuthorizerEvent, APIGatewayAuthorizerResult, APIGatewayAuthorizerHandler } from 'aws-lambda'
import 'source-map-support/register'
// import * as middy from 'middy'
// import { secretsManager } from 'middy/middlewares'

// import { verify } from 'jsonwebtoken'
// import { JwtToken } from '../../auth/JwtToken'

// const secretId = process.env.AUTH_0_SECRET_ID
// const secretField = process.env.AUTH_0_SECRET_FIELD

export const handler: APIGatewayAuthorizerHandler = async (event: APIGatewayTokenAuthorizerEvent): Promise<APIGatewayAuthorizerResult> => {

  try {
    // we first call the verifyToken function and pass the token that we need to verify.
    verifyToken(event.authorizationToken)

    console.log('User was authorized')

    // if the verifyToken does not throw any expection we will return the policy for
    // API Gateway
    return {
      principalId: 'user',
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
}

function verifyToken(authHeader: string) {
  if (!authHeader)
    throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  if(token !== '123') {
    throw new Error('Invalid token');
  }

  // no acception, so a request has been authorized
}

// handler.use(
//   secretsManager({
//     awsSdkOptions: { region: 'us-east-1' },
//     cache: true,
//     cacheExpiryInMillis: 60000,
//     // Throw an error if can't read the secret
//     throwOnFailedCall: true,
//     secrets: {
//       AUTH0_SECRET: secretId
//     }
//   })
// )
