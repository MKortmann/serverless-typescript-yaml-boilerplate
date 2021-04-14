import { APIGatewayTokenAuthorizerEvent, APIGatewayAuthorizerResult, APIGatewayAuthorizerHandler } from 'aws-lambda'
import 'source-map-support/register'
// import * as middy from 'middy'
// import { secretsManager } from 'middy/middlewares'

// import verify function
import { verify } from 'jsonwebtoken'
// import the JWT token interface that we've just defined
import { JwtToken } from '../../auth/JwtToken'

const auth0Secret = process.env.AUTH_0_SECRET_ID;

// const secretId = process.env.AUTH_0_SECRET_ID
// const secretField = process.env.AUTH_0_SECRET_FIELD

export const handler: APIGatewayAuthorizerHandler = async (event: APIGatewayTokenAuthorizerEvent): Promise<APIGatewayAuthorizerResult> => {

  try {
    // we first call the verifyToken function and pass the token that we need to verify.
    const decodedToken = verifyToken(event.authorizationToken, auth0Secret)

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
}

function verifyToken(authHeader: string, secret: string): JwtToken {
  if (!authHeader)
    throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  // no acception, so a request has been authorized
  // verify the function and return the result as JwtToken (cast operation)
  return verify(token, secret) as JwtToken
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
