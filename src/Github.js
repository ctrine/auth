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
  authUrl: 'https://github.com/login/oauth/authorize',
  providerName: 'github',
  scope: 'user',
  tokenRequestUrl: 'https://github.com/login/oauth/access_token'
}

export class Github extends OAuth2 {
  constructor(options) {
    super(defaultAssign(options, DEFAULT_OPTIONS))
  }

  getTokenRequestHeaders(request, response, next) {
    return {Accept: `application/json`}
  }

  loadUserData(request, response, next) {
    let bearer = request.session.bearers[this.providerName]

    bearer.get('https://api.github.com/user')
      .then(axiosResponse => {
        let {
          name,
          email,
          id,
          avatar_url:image
        } = axiosResponse.data

        request.session.profiles[this.providerName] = {
          id, image, name,
          emails: [email]
        }

        next()
      })
      .catch(error => {
        next(error)
      })
  }
}

export default Github
