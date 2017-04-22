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

import Bearer from './Bearer'
import Uuid from 'uuid'
import { generateSignature } from './OAuth1a'

export class OAuth1aBearer extends Bearer {
  constructor({ consumerKey, consumerSecret, signatureMethod, tokens }, defaultHeaders = {}) {
    super(defaultHeaders)
    this.accessToken = tokens.oauth_token
    this.consumerKey = consumerKey
    this.consumerSecret = consumerSecret
    this.signatureMethod = signatureMethod
    this.tokenSecret = tokens.oauth_token_secret
  }

  delete({ url, query, headers = {}}) {
    return super.delete({
      headers,
      query: this._getParameters({
        method: 'DELETE', query, url
      }),
      url
    })
  }

  get({ url, query, headers = {}}) {
    return super.get({
      headers,
      query: this._getParameters({
        method: 'GET', query, url
      }),
      url
    })
  }

  patch({ url, query, data, headers = {}}) {
    return super.patch({
      data,
      headers,
      query: this._getParameters({
        data, method: 'PATCH', query, url
      }),
      url
    })
  }

  post({ url, query, data, headers = {}}) {
    return super.post({
      data,
      headers,
      query: this._getParameters({
        data, method: 'POST', query, url
      }),
      url
    })
  }

  put({ url, query, data, headers = {}}) {
    return super.get({
      data,
      headers,
      query: this._getParameters({
        data, method: 'PUT', query, url
      }),
      url
    })
  }

  _getParameters({ method, url, query, data }) {
    let parameters = {
      oauth_consumer_key: this.consumerKey,
      oauth_nonce: Uuid.v4(),
      oauth_signature_method: this.signatureMethod,
      oauth_timestamp: Math.floor(Date.now() / 1000),
      oauth_token: this.accessToken,
      oauth_version: '1.0',
      ...query,
      ...data
    }

    parameters.oauth_signature = generateSignature({
      consumerSecret: this.consumerSecret,
      data: parameters,
      httpMethod: method,
      tokenSecret: this.tokenSecret,
      url
    })

    return parameters
  }
}

export default OAuth1aBearer
