// GOAL: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'sj7jzgisf5'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-2.amazonaws.com/dev`

export const authConfig = {
  // GOAL: Create an Auth0 application and copy values from it into this map. For example:
  // domain: 'dev-nd9990-p4.us.auth0.com',
  // Updated By Sayed Atef
  domain: 'ribery.auth0.com', // Auth0 domain
  clientId: '8EqoObcks3ABsHIv8EYoJO4kxSvxqekU', // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}

