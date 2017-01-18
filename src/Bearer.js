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
import deepAssign from 'deep-assign'

export class Bearer {
  _headers = null
  _tokens = null

  constructor(tokens, headers={}) {
    this._headers = headers
    this._tokens = tokens
  }

  delete(url, headers={}) {
    return Axios.delete(url, this._getHeaders(headers))
  }

  get(url, headers={}) {
    return Axios.get(url, this._getHeaders(headers))
  }

  patch(url, headers={}) {
    return Axios.patch(url, this._getHeaders(headers))
  }

  post(url, headers={}) {
    return Axios.post(url, this._getHeaders(headers))
  }

  put(url, headers={}) {
    return Axios.put(url, this._getHeaders(headers))
  }

  _getHeaders(headers={}) {
    return deepAssign({}, this._headers, headers))
  }
}

export default Bearer
