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

export const DEFAULT_OPTIONS = {
  accessTokenRequestUrl: 'https://graph.facebook.com/v2.8/oauth/access_token',
  authRequestUrl: 'https://www.facebook.com/dialog/oauth',
  providerName: 'facebook',
  scope: 'public_profile email'
}

export class Facebook extends OAuth2 {
  constructor(options) {
    super(defaultAssign(options, DEFAULT_OPTIONS))
  }

  loadUserData(request, response, next) {
    let bearer = request.session.bearers[this.providerName]

    return bearer.get({
        url: 'https://graph.facebook.com/v2.8/me',
        query: {
          fields: 'email, name, picture'
        }
      })
      .then(axiosResponse => {
        let {
          name,
          email,
          id,
          picture: {
            data: {url:image}
          }
        } = axiosResponse.data

        return {id, image, name, emails: [email]}
      })
  }
}

export default Facebook
