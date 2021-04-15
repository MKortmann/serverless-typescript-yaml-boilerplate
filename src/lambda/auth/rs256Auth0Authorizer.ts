
import { APIGatewayTokenAuthorizerEvent, APIGatewayAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { JwtToken } from '../../auth/JwtToken'

const cert = `-----BEGIN CERTIFICATE-----
MIIDDTCCAfWgAwIBAgIJYfwAsKroa5QnMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV
BAMTGWRldi1vZWVoNmhkYi5ldS5hdXRoMC5jb20wHhcNMjEwNDEwMTY0MTE1WhcN
MzQxMjE4MTY0MTE1WjAkMSIwIAYDVQQDExlkZXYtb2VlaDZoZGIuZXUuYXV0aDAu
Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAq2HjYPnk1hYuYq9a
YqPYVndEuJ23MTaEY4to2oV3RkYpkSVwr6jcI8MdxrQFOGkugDXSb19RwdYtfGDR
eo1gRp9Esx/ZV+RCDGFOtKf70x5ttqb9TaFt80bIQy+zRBtdqRl/AgRA9aV4TGCf
LNMoAQ4ojCwoIEkqjGo1nR83yEzHt3osaI7iI6E3w4vx9CZ8ZiNudV6wIu9qSxsn
DG3nPO41aCIq54/BAMQrCt8krlskpLsxD/+E0Er87vDgqM638dF2LM8V1LCk1xxu
QdyHd8HTDpOOJsHODycgFom9rFZgBjF65MjIEE4+U61d0kpb7ByIIY1wEdfQTA8P
s/0abQIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBSPfwzqhxv1
h0tWP7tiwT1JYneOgDAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB
AAygdKvF78lqQ2EWP5/MZ/rWjo44/7LIKFH040M8nU2Vqb2XHn73U/x9tmbzWeyT
D7XH/KKuzCOGiZ0RYqkSzJAsF5YGroOWFOu7iNlk09LVZjUEvJoxZ3gqucnP0mfd
6h4/3IB9IlEHOebybj0hO96/XAVLA621uGJOUgXh47YtmejlRfKpISeHtV1AOFxX
JMzIw06OF6cMUGSGrhOVFjYjqzafycBHw1TIzhTYAtxR/tZ/Sgqf1A+hcXHv2KdE
1fZQsbPovRDbivDuCdP9su/SAujb1rJTlU+21h9UsOMxDfNtVGD0Nx8QfOT/mh9p
l/sU6e+vUKY8RmPPoswoD8Y=
-----END CERTIFICATE-----`

export const handler = async (event: APIGatewayTokenAuthorizerEvent): Promise<APIGatewayAuthorizerResult> => {
  try {
    const jwtToken = verifyToken(event.authorizationToken)
    console.log('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
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
    console.log('User authorized', e.message)

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

function verifyToken(authHeader: string): JwtToken {
  if (!authHeader)
    throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return verify(token, cert, { algorithms: ['RS256'] }) as JwtToken
}
