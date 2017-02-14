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
import OAuth1a from './OAuth1a'

export const DEFAULT_OPTIONS = {
  accessTokenRequestUrl: 'https://api.twitter.com/oauth/access_token',
  authRequestUrl: 'https://api.twitter.com/oauth/authenticate',
  providerName: 'twitter',
  tokenRequestUrl: 'https://api.twitter.com/oauth/request_token'
}

export class Twitter extends OAuth1a {
  constructor(options) {
    super(defaultAssign(options, DEFAULT_OPTIONS))
  }

  loadUserData(request, response, next) {
    let bearer = request.session.bearers[this.providerName]

    return bearer.get({
      query: {
        include_email: true
      },
      url: 'https://api.twitter.com/1.1/account/verify_credentials.json'
    })
      .then(axiosResponse => {
        let {
          name,
          email,
          id_str: id,
          profile_image_url: image
        } = axiosResponse.data

        return {
          emails: [email],
          id,
          image,
          name
        }
      })
  }
}

export default Twitter
