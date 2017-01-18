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

import Axios from 'axios'
import QueryString from 'querystring'

import OAuth2Bearer from './OAuth2Bearer'

/**
 * Abstract base class for OAuth2 authentication.
 */
export class OAuth2 {
  /**
   * Provider’s name used to store the tokens.
   */
  providerName = null

  /**
   * URL used to process additional steps required by the strategy.
   */
  callbackUrl = null

  /**
   * Client’s ID.
   */
  clientId = null

  /**
   * Client’s password.
   */
  clientSecret = null

  /**
   * API access required.
   */
  scope = null

  /**
   * Authentication request URL.
   */
  authUrl = null

  /**
   * Token request URL.
   */
  tokenRequestUrl = null

  constructor({callbackUrl, clientId, clientSecret, scope}) {
    this.callbackUrl = callbackUrl
    this.clientId = clientId
    this.clientSecret = clientSecret

    if (Array.isArray(scope))
      this.scope = scope.join(' ')
    else
      this.scope = scope
  }

  /**
   * Initiates the authentication, sends the user to the provider.
   */
  authenticate(request, response, next) {
    if (!this.authUrl)
      throw new Error('Auth URL not defined.')

    let query = QueryString.stringify(
      this.getAuthQuery(request, response, next)
    )

    response.redirect(`${this.authUrl}?${query}`)
  }

  getAuthQuery(request, response, next) {
    return {
      client_id: this.clientId,
      redirect_uri: this.callbackUrl,
      response_type: 'code',
      scope: this.scope
    }
  }

  getTokenRequestHeaders(request, response, next) {
    // Most providers don’t require custom headers.
  }

  getTokenRequestQuery(request, response, next) {
    return {
      client_id: this.clientId,
      client_secret: this.clientSecret,
      redirect_uri: this.callbackUrl,
      grant_type: 'authorization_code',
      code: request.query.code
    }
  }

  /**
   * Must be implemented in a subclass.
   */
  loadUserData(request, response, next) {
    throw new Error('Not implemented.')
  }

  /**
   * The callback is called to exchange the code for an actual token.
   */
  processCallback(request, response, next) {
    let headers = this.getTokenRequestHeaders()
    let axiosInstance = headers
      ? Axios.create({headers})
      : Axios

    // The query will be sent in the post body.
    let query = QueryString.stringify(
      this.getTokenRequestQuery(request, response, next)
    )

    // Exchange the code for the tokens.
    axiosInstance.post(this.tokenRequestUrl, query)
      .then(axiosResponse => {
        // Save the tokens in the session.
        request.session.tokens[this.providerName] = axiosResponse.data

        // Saves a bearer for the provider in the session.
        request.session.bearers[this.providerName] = new OAuth2Bearer(axiosResponse.data)

        // Next step is to retrieve the user‘s data.
        next()
      }).catch(error => {
        next(error)
      })
  }
}

export default OAuth2
