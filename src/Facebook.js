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

export const DEFAULT_OPTIONS = {
  authUrl: 'https://www.facebook.com/dialog/oauth',
  scope: 'public_profile email',
  providerName: 'facebook',
  tokenRequestUrl: 'https://graph.facebook.com/v2.8/oauth/access_token'
}

export class Facebook extends OAuth2 {
  constructor(options) {
    super(defaultAssign(options, DEFAULT_OPTIONS))
  }

  loadUserData(request, response, next) {
    let bearer = request.session.bearers[this.providerName]

    bearer.get('https://graph.facebook.com/v2.8/me?fields=email,name,picture')
      .then(axiosResponse => {
        let {
          name,
          email,
          id,
          picture: {
            data: {url:image}
          }
        } = axiosResponse.data

        request.session.profiles[this.providerName] = {
          id, image, name, emails: [email]
        }

        next()
      })
      .catch(error => {
        next(new Error(error))
      })
  }
}

export default Facebook
