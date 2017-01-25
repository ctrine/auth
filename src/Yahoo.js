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

import defaultAssign from 'defaults-deep'

import OAuth2 from './OAuth2'

/**
 * IMPORTANT: To able to retrieve the email and name, the app needs read/write
 * access to the public and private data for Profiles in the Social Directory.
 */
export const DEFAULT_OPTIONS = {
  accessTokenRequestUrl: 'https://api.login.yahoo.com/oauth2/get_token',
  authRequestUrl: 'https://api.login.yahoo.com/oauth2/request_auth',
  providerName: 'yahoo',
  scope: 'sdpp-w'
}

export class Yahoo extends OAuth2 {
  constructor(options) {
    super(defaultAssign(options, DEFAULT_OPTIONS))
  }

  getAccessTokenRequestHeaders(request, response, next) {
    const BASE64_CREDENTIALS = Buffer.from(`${this.clientId}:${this.clientSecret}`)
      .toString('base64')
    return {Authorization:`Basic ${BASE64_CREDENTIALS}`}
  }

  getTokenRequestParameters(request, response, next) {
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

    return bearer.get({
        url: `https://social.yahooapis.com/v1/user/${xoauth_yahoo_guid}/profile`
      })
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

        return {
          id, image,
          name: `${givenName} ${familyName}`,
          emails: emails.map(email => email.handle)
        }
      })
  }
}

export default Yahoo
