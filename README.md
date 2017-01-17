# Ctrine - Auth

Easy authentication for Express JS.

## Installation

```shell
npm install ctrine-auth
```

## Usage

```Javascript
import auth from 'ctrine-auth'
import express from 'express'
import session from 'express-session'

let app = express()

// Session is required to store the user data and identify authentication steps.
app.use(session())

app.use(
  auth({
    // The domain used for callbacks.
    domain: 'http://www.mydomain.com',
    // The :provider is required to identify the authentication intended.
    authRoute: '/auth/:provider',
    // Route to process the callback.
    callbackRoute: '/auth/callback'
    // You just need to add the client ID and secret.
    providers: {
      google: {
        clientId: 'abc...',
        clientSecret: 'abc...'
      },
      yahoo: {
        clientId: 'abc...',
        clientSecret: 'abc...'
      }
    }
  })
)

/**
 * API request.
 */
app.get('/some-route', (request, response, next) => {
  let bearer = request.session.ctrine.bearer['google']

  // User is not authenticated for google.
  if (!bearer)
    response.redirect('/auth/google')

  // Make an API request using the access token.
  bearer.post('url', data)
})

// Other routes...

/**
 * Available keys in ctrine.
 */
const EXPECTED_SESSION_KEYS = {
  /**
   * Current provider doing the authentication.
   */
  currentAuthProvider: null,

  /**
   * Used by the current provider to determine the authentication step to be
   * executed.
   */
  nextAuthStep: null,

  /**
   * Used to make http requests using the access tokens retrived.
   */
  bearers: {},

  /**
   * Loaded profiles for each provider.
   */
  profiles: {},

  /**
   * Retrieved tokens for each provider.
   */
  tokens: {}
}
```
