// these are just standard field in a JWT token
export interface JwtToken {
  iss: string
  sub: string
  iat: number
  exp: number
}
