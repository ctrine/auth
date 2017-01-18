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

import OAuth2 from './OAuth2'

export const DEFAULT_OPTIONS = {
  scope: 'email profile'
}

export class Google extends OAuth2 {
  providerName = 'google'
  authUrl = 'https://accounts.google.com/o/oauth2/v2/auth'
  tokenRequestUrl = 'https://www.googleapis.com/oauth2/v4/token'

  constructor(options) {
    options = {
      ...DEFAULT_OPTIONS,
      ...options
    }
    super(options)
  }

  loadUserData(request, response, next) {
    let bearer = request.session.ctrine.bearers[this.providerName]

    bearer.get('https://www.googleapis.com/plus/v1/people/me')
      .then(axiosResponse => {
        let {
          displayName:name,
          emails: [{value:email}],
          id,
          image: {url:image}
        } = axiosResponse.data

        request.session.ctrine.profiles[this.providerName] = {
          id, email, image, name
        }
      })
      .catch(error => {
        next(error)
      })
  }
}

export default Google
