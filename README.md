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
    // The “:provider” parameter is required to identify the provider; the following
    // value is the default one and you can ommit the setting.
    authRoute: '/auth/:provider',
    // Route to process the callback; the following value is the default one and
    // you can ommit the setting.
    callbackRoute: '/auth/callback',
    // Called when the authentication completes.
    onSuccess: (request, response, next, provider) => {
      let profile = request.session.profiles[provider]
      response.send(profile)
    },
    // Called when the user was not authenticated either by supplying invalid
    // credentials or actively refusing the app access to his profile data.
    onAuthDenied: (error, request, response, next) => {
      response.send('User was not authenticated...')
    },
    // Called when the server returned an error.
    onError: (error, request, response, next) => {
      response.send('Something went wrong...')
    },
    // You just need to add the client ID and secret.
    providers: {
      github: {
        clientId: 'abc...',
        clientSecret: 'abc...'
      },
      google: {
        clientId: 'abc...',
        clientSecret: 'abc...'
      },
      // Other providers...
    }
  })
)

// API request.
app.get('/some-route', (request, response, next) => {
  let bearer = request.session.bearers['google']

  // User is not authenticated for google.
  if (!bearer)
    response.redirect('/auth/google')

  // Make an API request using the access token; bearer uses Axios to the make
  // the requests, go to https://github.com/mzabriskie/axios for more information
  // about the API.
  bearer.post({
    // API url.
    url: '...',
    // Query parameters.
    query: {},
    // Request body.
    data: {},
    // Additional headers; The basic headers e.g. Bearer required by OAuth2 is
    // already set by the provider.
    headers: {}
  })
})

// Other routes...

```

## Supported providers

### OAuth 1a

* Twitter

### OAuth 2

* Dropbox
* Facebook
* Github
* Google
* Linked In
* Yahoo
