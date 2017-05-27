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
  accessTokenRequestUrl: 'https://graph.facebook.com/v2.8/oauth/access_token',
  authRequestUrl: 'https://www.facebook.com/dialog/oauth',
  providerName: 'facebook',
  scope: 'public_profile email'
}

export class Facebook extends OAuth2 {
  constructor(options) {
    super(defaultAssign(options, DEFAULT_OPTIONS))
  }

  loadUserData(req, res, next) {
    let bearer = req.session.bearers[this.providerName]
    return bearer.get({
      query: { fields: 'email, name, picture' },
      url: 'https://graph.facebook.com/v2.8/me'
    })
      .then(axiosRes => {
        let { email, id, name, picture: { data: { url: image }}} = axiosRes.data
        let emails = [email]
        return { emails, id, image, name }
      })
  }
}

export default Facebook
