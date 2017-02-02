// Licensed under the Apache License, Version 2.0 (the “License”); you may not
// use this file except in compliance with the License. You may obtain a copy of
// the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an “AS IS” BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations under
// the License.

import autobind from 'autobind-decorator'
import deepAssign from 'deep-assign'
import defaultAssign from 'object-defaults'
import express from 'express'

import AuthDenied from './AuthDenied'
import {
  AVAILABLE_PROVIDERS,
  DEFAULT_OPTIONS,
  DEFAULT_SESSION_KEYS
} from './constants'

/**
 * Middleware used to authenticate.
 */
class AuthMiddleware {
  /**
   * Router used to intercept the auth and callback routes.
   */
  router = express.Router()

  /**
   * All settings.
   */
  _options = DEFAULT_OPTIONS

  /**
   * Configured providers.
   */
  _providers = {}

  constructor(options:Options) {
    deepAssign(this._options, options)

    let {authRoute, callbackRoute, domain, providers} = this._options
    let callbackUrl = `${domain}${callbackRoute}`

    if (!providers)
      throw new Error('No providers configured.')

    // Configure the providers with the client’s credentials and the callback
    // URL that can be used to process additional steps.
    Object.entries(providers).forEach(([providerName, config]) => {
      this._providers[providerName] = new AVAILABLE_PROVIDERS[providerName]({
        callbackUrl,
        ...config
      })
    })

    // Loop used to process additional steps required to authenticate the user.
    // This function may be called multiple times, the state/step must be stored
    // in the session. Usually the callback route is a subroute of the auth route
    // so, it is important that this route gets checked first.
    this.router.get(
      callbackRoute,
      this.processCallback,
      this._authenticated
    )

    // Authenticates the user. Some providers will require multiple steps which
    // will be processed in the callback route.
    this.router.get(
      authRoute,
      this._skipCallback,
      this.authenticate,
      this._authenticated
    )

    this.router.post(
      authRoute,
      this._skipCallback,
      this.authenticate,
      this._authenticated
    )
  }

  @autobind
  authenticate(request, response, next) {
    defaultAssign(request.session, DEFAULT_SESSION_KEYS)

    let providerName = request.params.provider
    let provider = this._providers[providerName]

    if (!provider)
      throw new Error(`Provider "${providerName}" not configured.`)

    // Save the provider in the session which can be used later to execute the
    // additional steps required.
    request.session.currentAuthProvider = providerName

    // Initiates authentication.
    provider.authenticate(request, response, next)
      .catch(error => {
        request.session.currentAuthProvider = null
        request.session.nextAuthStep = null
        this._options.onError(error, request, response, next, providerName)
      })
  }

  @autobind
  processCallback(request, response, next) {
    defaultAssign(request.session, DEFAULT_SESSION_KEYS)

    let providerName = request.session.currentAuthProvider
    let provider = this._providers[providerName]

    provider.processCallback(request, response, next)
      .then(({bearer, tokens}) => {
        request.session.bearers[providerName] = bearer
        request.session.tokens[providerName] = tokens
        next()
      })
      .catch(error => {
        request.session.currentAuthProvider = null
        request.session.nextAuthStep = null

        if (error instanceof AuthDenied)
          this._options.onAuthDenied(error, request, response, next, providerName)
        else
          this._options.onError(error, request, response, next, providerName)
      })
  }

  /**
   * The authentication has finished, now it needs to load the basic user profile.
   */
  @autobind
  _authenticated(request, response, next) {
    defaultAssign(request.session, DEFAULT_SESSION_KEYS)

    let providerName = request.session.currentAuthProvider
    let provider = this._providers[providerName]

    provider.loadUserData(request, response, next)
      .then(profile => {
        request.session.currentAuthProvider = null
        request.session.nextAuthStep = null
        request.session.profiles[providerName] = profile
        this._options.onSuccess(request, response, next, providerName)
      })
      .catch(error => {
        request.session.currentAuthProvider = null
        request.session.nextAuthStep = null
        this._options.onError(error, request, response, next, providerName)
      })
  }

  /**
   * Used to allow the callback as a subroute of the auth route.
   */
  @autobind
  _skipCallback(request, response, next) {
    if (request.path == this._options.callbackRoute)
      next('route')
    else
      next()
  }
}

export default AuthMiddleware
