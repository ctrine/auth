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
import Crypto from 'crypto'
import QueryString from 'querystring'
import Uuid from 'uuid'
import defaultAssign from 'object-defaults'

import Bearer from './Bearer'

export class OAuth1aBearer extends Bearer {
  constructor({consumerKey, consumerSecret, signatureMethod, tokens}, defaultHeaders={}) {
    super(defaultHeaders)
    this.accessToken = tokens.oauth_token
    this.consumerKey = consumerKey
    this.consumerSecret = consumerSecret
    this.signatureMethod = signatureMethod
    this.tokenSecret = tokens.oauth_token_secret
  }

  // TODO
  delete({url, query, headers={}}) {
    throw new Error('Not implemented.')
  }

  get({url, query, headers={}}) {
    let parameters = {
      oauth_consumer_key: this.consumerKey,
      oauth_nonce: Uuid.v4(),
      oauth_signature_method: this.signatureMethod,
      oauth_timestamp: Math.floor(Date.now() / 1000),
      oauth_token: this.accessToken,
      oauth_version: '1.0',
      ...query
    }

    parameters.oauth_signature = this._generateSignature({
      data: parameters,
      method: 'GET',
      url
    })

    return super.get({
        query: parameters,
        url
      })
  }

  // TODO
  patch({url, query, data, headers={}}) {
    throw new Error('Not implemented.')
  }

  // TODO
  post({url, query, data, headers={}}) {
    throw new Error('Not implemented.')
  }

  // TODO
  put({url, query, data, headers={}}) {
    throw new Error('Not implemented.')
  }

  _generateSignature({data, method, url}) {
    // Sort the parameters.
    data = Object.entries(data)
      .map(([key, value]) => `${key}=${QueryString.escape(value)}`)
      .sort()
      .reduce((result, pair) => `${result}&${pair}`)

    // Prepare the base string.
    const ESCAPED_PARAMETERS = QueryString.escape(data)
    const ESCAPED_URL = QueryString.escape(url)
    const BASE_STRING = `${method}&${ESCAPED_URL}&${ESCAPED_PARAMETERS}`

    // TODO: Add more methods.
    switch (this.signatureMethod) {
      case 'HMAC-SHA1':
        return Crypto.createHmac('sha1', `${this.consumerSecret}&${this.tokenSecret}`)
          .update(BASE_STRING)
          .digest('base64')
    }

    throw new Error('Unsupported signature method.')
  }
}

export default OAuth1aBearer
