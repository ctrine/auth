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
import defaultAssign from 'defaults-deep'
import QueryString from 'querystring'
import Uuid from 'uuid'

import Bearer from './Bearer'
import {generateSignature} from './OAuth1a'

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

    parameters.oauth_signature = generateSignature({
      consumerSecret: this.consumerSecret,
      data: parameters,
      method: 'GET',
      tokenSecret: this.tokenSecret,
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
}

export default OAuth1aBearer
