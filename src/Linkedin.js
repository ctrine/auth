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
  authRequestUrl: 'https://www.linkedin.com/oauth/v2/authorization',
  providerName: 'linkedin',
  scope: 'r_basicprofile r_emailaddress',
  tokenRequestUrl: 'https://www.linkedin.com/oauth/v2/accessToken'
}

export class Linkedin extends OAuth2 {
  constructor(options) {
    super(defaultAssign(options, DEFAULT_OPTIONS))
  }

  loadUserData(request, response, next) {
    let bearer = request.session.bearers[this.providerName]

    return bearer.get('https://api.linkedin.com/v1/people/~:(id,email-address,picture-url,first-name,last-name)?format=json')
      .then(axiosResponse => {
        let {
          firstName,
          lastName,
          emailAddress:email,
          id,
          pictureUrl:image
        } = axiosResponse.data

        return {
          id, image,
          name: `${firstName} ${lastName}`,
          emails: [email]
        }
      })
  }
}

export default Linkedin
