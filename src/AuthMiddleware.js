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

import AuthDenied from './AuthDenied'
import autobind from 'autobind-decorator'
import deepAssign from 'deep-assign'
import defaultAssign from 'object-defaults'
import { AVAILABLE_PROVIDERS, DEFAULT_OPTIONS, DEFAULT_SESSION_KEYS } from './constants'
import { Router } from 'express'

/**
 * Middleware used to authenticate.
 */
class AuthMiddleware {
  /**
   * Router used to intercept the authentication and callback routes.
   */
  router = new Router

  /**
   * All settings.
   */
  _options = DEFAULT_OPTIONS

  /**
   * Configured providers.
   */
  _providers = {}

  constructor(options) {
    deepAssign(this._options, options)

    let { authRoute, callbackRoute, domain, providers } = this._options
    let callbackUrl = `${domain}${callbackRoute}`

    if (!providers)
      throw new Error('No providers configured.')

    // Configure the providers with the client’s credentials and the callback
    // URL that can be used to process additional steps.
    Object.entries(providers).forEach(([ providerName, config ]) => {
      this._providers[providerName] = new AVAILABLE_PROVIDERS[providerName]({
        callbackUrl,
        ...config
      })
    })

    // Loop used to process additional steps required to authenticate the user.
    // This function may be called multiple times, the state/step must be stored
    // in the session. Usually the callback route is a subroute of the authentication
    // route so, it is important that this route gets checked first.
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
  authenticate(req, res, next) {
    defaultAssign(req.session, DEFAULT_SESSION_KEYS)

    let providerName = req.params.provider
    let provider = this._providers[providerName]

    if (!provider)
      throw new Error(`Provider "${providerName}" not configured.`)

    // Save the provider in the session which can be used later to execute the
    // additional steps required.
    req.session.currentAuthProvider = providerName

    // Initiates authentication.
    provider.authenticate(req, res, next)
      .catch(err => {
        req.session.currentAuthProvider = null
        req.session.nextAuthStep = null
        this._options.onError(providerName, err, req, res, next)
      })
  }

  @autobind
  processCallback(req, res, next) {
    defaultAssign(req.session, DEFAULT_SESSION_KEYS)

    let providerName = req.session.currentAuthProvider
    let provider = this._providers[providerName]

    provider.processCallback(req, res, next)
      .then(({ bearer, tokens }) => {
        req.session.bearers[providerName] = bearer
        req.session.tokens[providerName] = tokens
        next()
      })
      .catch(err => {
        req.session.currentAuthProvider = null
        req.session.nextAuthStep = null

        if (err instanceof AuthDenied)
          this._options.onAuthDenied(providerName, err, req, res, next)
        else
          this._options.onError(providerName, err, req, res, next)
      })
  }

  /**
   * The authentication has finished, now it needs to load the basic user profile.
   */
  @autobind
  _authenticated(req, res, next) {
    defaultAssign(req.session, DEFAULT_SESSION_KEYS)

    let providerName = req.session.currentAuthProvider
    let provider = this._providers[providerName]

    provider.loadUserData(req, res, next)
      .then(profile => {
        req.session.currentAuthProvider = null
        req.session.nextAuthStep = null
        req.session.profiles[providerName] = profile
        this._options.onSuccess(providerName, req, res, next)
      })
      .catch(err => {
        req.session.currentAuthProvider = null
        req.session.nextAuthStep = null
        this._options.onError(providerName, err, req, res, next)
      })
  }

  /**
   * Used to allow the callback as a subroute of the authentication route.
   */
  @autobind
  _skipCallback(req, res, next) {
    if (req.path === this._options.callbackRoute)
      next('route')
    else
      next()
  }
}

export default AuthMiddleware
