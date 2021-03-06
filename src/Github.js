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
  accessTokenRequestUrl: 'https://github.com/login/oauth/access_token',
  authRequestUrl: 'https://github.com/login/oauth/authorize',
  providerName: 'github',
  scope: 'user'
}

export class Github extends OAuth2 {
  constructor(options) {
    super(defaultAssign(options, DEFAULT_OPTIONS))
  }

  getAccessTokenRequestHeaders(req, res, next) {
    return { Accept: 'application/json' }
  }

  loadUserData(req, res, next) {
    let bearer = req.session.bearers[this.providerName]
    return bearer.get({ url: 'https://api.github.com/user' })
      .then(axiosRes => {
        let { avatar_url: image, email, id, name } = axiosRes.data
        let emails = [email]
        return { emails, id, image, name }
      })
  }
}

export default Github
