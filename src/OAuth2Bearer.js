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

import Bearer from './Bearer'

export class OAuth2Bearer extends Bearer {
  constructor(tokens, defaultHeaders={}) {
    const DEFAULT_BEARER_HEADER = {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`
      }
    }
    super(tokens, defaultAssign(defaultHeaders, DEFAULT_BEARER_HEADER))
  }
}

export default OAuth2Bearer
