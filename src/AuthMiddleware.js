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
import defaultAssign from 'object-defaults'
import express from 'express'

import {
  AVAILABLE_PROVIDERS,
  DEFAULT_OPTIONS,
  EXPECTED_SESSION_KEYS
} from './constants'

/**
 * Make sure the expected keys exists in the session.
 */
function checkSessionKeys(request) {
  defaultAssign(request.session, EXPECTED_SESSION_KEYS)
}

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
  _options = {}

  /**
   * Configured providers.
   */
  _providers = {}

  constructor(options:Options) {
    this._options = {
      ...DEFAULT_OPTIONS,
      ...options
    }

    let {authRoute, callbackRoute, domain, providers} = this._options
    let callbackUrl = `${domain}${callbackRoute}`

    // Configure the providers with the client’s credentials and the callback
    // URL that can be used to process additional steps.
    Object.entries(providers).forEach(([provider, config]) => {
      this._providers[provider] = new AVAILABLE_PROVIDERS[provider]({
        callbackUrl,
        ...config
      })
    })

    // Loop used to process additional steps required to authenticate the user.
    // This function may be called multiple times, the state/step must be stored
    // in the session. Usually the callback route is a subroute of the auth route,
    // it is important that this route gets processed first.
    this.router.get(callbackRoute, this.processCallback)
    this.router.get(callbackRoute, this.authenticated)

    // Authenticates the user. Some providers will require multiple steps which
    // will be processed in the callback route.
    this.router.get(authRoute, this.authenticate)
    this.router.get(authRoute, this.authenticated)

    this.router.post(authRoute, this.authenticate)
    this.router.post(authRoute, this.authenticated)
  }

  @autobind
  authenticate(request, response, next) {
    checkSessionKeys(request)

    let providerName = request.params.provider
    let provider = this._providers[providerName]

    // Save the provider in the session which can be used later determine the
    // provider used and execute the additional steps required.
    request.session.currentAuthProvider = provider

    // Initiates authentication.
    provider.authenticate(request, response, next)
  }

  @autobind
  authenticated(request, response, next) {
    checkSessionKeys(request)

    let providerName = request.session.currentAuthProvider
    let provider = this._providers[providerName]

    provider.loadUserData(request, response, next)
  }

  @autobind
  processCallback(request, response, next) {
    checkSessionKeys(request)

    let providerName = request.session.currentAuthProvider
    let provider = this._providers[providerName]

    provider.processCallback(request, response, next)
  }
}

export default AuthMiddleware
