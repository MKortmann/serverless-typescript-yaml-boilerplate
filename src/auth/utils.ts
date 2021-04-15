import { decode } from 'jsonwebtoken'

import { JwtToken } from './JwtToken'

/**
 * Parse a JWT token and return a user id
 * @param jwtToken JWT token to parse
 * @returns a user id from the JWT token
 */
export function getUserId(jwtToken: string): string {
  // the decode function from jsonwebtoken does not validate the token
  // it just parses it and returns its payload
  const decodedJwt = decode(jwtToken) as JwtToken
  return decodedJwt.sub
}
