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
import defaultAssign from 'object-defaults'
import QueryString from 'querystring'

export class Bearer {
  _defaultHeaders = null

  constructor(defaultHeaders={}) {
    this._defaultHeaders = defaultHeaders
  }

  delete({url, query, headers={}}) {
    return this._getAxios(headers)
      .delete(this._getRequest(url, query))
  }

  get({url, query, headers={}}) {
    return this._getAxios(headers)
      .get(this._getRequest(url, query))
  }

  patch({url, query, data, headers={}}) {
    return this._getAxios(headers)
      .patch(this._getRequest(url, query), data)
  }

  post({url, query, data, headers={}}) {
    return this._getAxios(headers)
      .post(this._getRequest(url, query), data)
  }

  put({url, query, data, headers={}}) {
    return this._getAxios(headers)
      .put(this._getRequest(url, query), data)
  }

  _getAxios(headers={}) {
    return Axios.create({
      headers: defaultAssign(headers, this._defaultHeaders)
    })
  }

  _getRequest(url, query) {
    return query
      ? `${url}?${QueryString.stringify(query)}`
      : url
  }
}

export default Bearer
