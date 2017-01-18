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

// Session is required to store the user data and authentication steps.
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
  let bearer = request.session.bearer['google']

  // User is not authenticated for google.
  if (!bearer)
    response.redirect('/auth/google')

  // Make an API request using the access token.
  bearer.post('url', data)
})

// Other routes...

```
