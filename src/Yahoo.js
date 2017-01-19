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

import defaultAssign from 'object-defaults'

import OAuth2 from './OAuth2'

/**
 * IMPORTANT: To able to retrieve the email and name, the app needs read/write
 * access to the public and private data for Profiles in the Social Directory.
 */
export const DEFAULT_OPTIONS = {
  authUrl: 'https://api.login.yahoo.com/oauth2/request_auth',
  providerName: 'yahoo',
  scope: 'sdpp-w',
  tokenRequestUrl: 'https://api.login.yahoo.com/oauth2/get_token'
}

export class Yahoo extends OAuth2 {
  constructor(options) {
    super(defaultAssign(options, DEFAULT_OPTIONS))
  }

  getTokenRequestHeaders(request, response, next) {
    let base64Credentials = new Buffer(`${this.clientId}:${this.clientSecret}`)
      .toString('base64')
    return {Authorization: `Basic ${base64Credentials}`}
  }

  getTokenRequestQuery(request, response, next) {
    let {code} = request.query
    return {
      grant_type: 'authorization_code',
      redirect_uri: this.callbackUrl,
      code
    }
  }

  loadUserData(request, response, next) {
    let bearer = request.session.bearers[this.providerName]
    let {xoauth_yahoo_guid} = request.session.tokens[this.providerName]

    bearer.get(`https://social.yahooapis.com/v1/user/${xoauth_yahoo_guid}/profile`)
      .then(axiosResponse => {
        let {
          profile: {
            emails,
            familyName,
            givenName,
            guid:id,
            image: {imageUrl:image}
          }
        } = axiosResponse.data

        request.session.profiles[this.providerName] = {
          id, image,
          name: `${givenName} ${familyName}`,
          emails: emails.map(email => email.handle)
        }

        next()
      })
      .catch(error => {
        next(new Error(error))
      })
  }
}

export default Yahoo
