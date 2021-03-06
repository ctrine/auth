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
import Axios from 'axios'
import OAuth2Bearer from './OAuth2Bearer'
import Promise from 'bluebird'
import Provider from './Provider'
import QueryString from 'querystring'

/**
 * Abstract class for OAuth2 authentication.
 */
export class OAuth2 extends Provider {
  accessTokenRequestUrl = null
  authRequestUrl = null
  clientId = null
  clientSecret = null
  scope = null

  constructor(options) {
    super(options)

    let {
      accessTokenRequestUrl, authRequestUrl, clientId, clientSecret, scope
    } = options

    this.accessTokenRequestUrl = accessTokenRequestUrl
    this.authRequestUrl = authRequestUrl
    this.clientId = clientId
    this.clientSecret = clientSecret

    if (Array.isArray(scope))
      this.scope = scope.join(' ')
    else
      this.scope = scope
  }

  authenticate(req, res, next) {
    if (!this.authRequestUrl)
      throw new Error('Auth URL not defined.')

    let parameters = QueryString.stringify({
      client_id: this.clientId,
      redirect_uri: this.callbackUrl,
      response_type: 'code',
      scope: this.scope
    })

    res.redirect(`${this.authRequestUrl}?${parameters}`)
    return Promise.resolve()
  }

  getAccessTokenRequestHeaders(req, res, next) {
    // Most providers don’t require custom headers.
  }

  getAccessTokenRequestParameters(req, res, next) {
    return {
      client_id: this.clientId,
      client_secret: this.clientSecret,
      code: req.query.code,
      grant_type: 'authorization_code',
      redirect_uri: this.callbackUrl
    }
  }

  processCallback(req, res, next) {
    let { err, err_description } = req.query

    if (err) {
      if (err === 'access_denied')
        return Promise.reject(new AuthDenied(err_description))
      return Promise.reject(new Error(err_description))
    }

    // Request the access token.
    let headers = this.getAccessTokenRequestHeaders()
    let axiosInstance = headers
      ? Axios.create({ headers })
      : Axios

    let parameters = QueryString.stringify(
      this.getAccessTokenRequestParameters(req, res, next)
    )

    return axiosInstance.post(this.accessTokenRequestUrl, parameters)
      .then(axiosRes => {
        let tokens = axiosRes.data
        let bearer = new OAuth2Bearer(tokens)
        return { bearer, tokens }
      })
  }
}

export default OAuth2
