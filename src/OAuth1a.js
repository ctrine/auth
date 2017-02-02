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

import OAuth1aBearer from './OAuth1aBearer'
import Provider from './Provider'

export type SignatureMethods = 'HMAC-SHA1'
export type SignatureOptions = {
  consumerSecret:string,
  data:Object,
  httpMethod:string,
  signatureMethod:SignatureMethods,
  tokenSecret:string,
  url:string
}

export function generateSignature(options:SignatureOptions) {
  let {
    consumerSecret,
    data,
    httpMethod,
    signatureMethod='HMAC-SHA1',
    tokenSecret='',
    url
  } = options

  data = Object.entries(data)
    .map(([key, value]) => `${key}=${QueryString.escape(value)}`)
    .sort()
    .reduce((result, pair) => `${result}&${pair}`)

  // Prepare the base string.
  const ESCAPED_PARAMETERS = QueryString.escape(data)
  const ESCAPED_URL = QueryString.escape(url)
  const BASE_STRING = `${httpMethod}&${ESCAPED_URL}&${ESCAPED_PARAMETERS}`

  // TODO: Add more methods.
  switch (signatureMethod) {
    case 'HMAC-SHA1':
      return Crypto.createHmac('sha1', `${consumerSecret}&${tokenSecret}`)
        .update(BASE_STRING)
        .digest('base64')
  }

  throw new Error('Unsupported signature method.')
}

/**
 * Abstract base class for OAuth 1a authentication.
 */
export class OAuth1a extends Provider {
  accessTokenRequestUrl = null
  authRequestUrl = null
  consumerKey = null
  consumerSecret = null
  hashFunction = null
  signatureMethod = null
  tokenRequestUrl = null

  constructor(options) {
    super(options)

    let {
      accessTokenRequestUrl,
      authRequestUrl,
      consumerKey,
      consumerSecret,
      signatureMethod = 'HMAC-SHA1',
      tokenRequestUrl
    } = options

    this.accessTokenRequestUrl = accessTokenRequestUrl
    this.authRequestUrl = authRequestUrl
    this.consumerKey = consumerKey
    this.consumerSecret = consumerSecret
    this.signatureMethod = signatureMethod
    this.tokenRequestUrl = tokenRequestUrl
  }

  authenticate(request, response, next) {
    let parameters = {
      oauth_callback: this.callbackUrl,
      oauth_consumer_key: this.consumerKey,
      oauth_nonce: Uuid.v4(),
      oauth_signature_method: this.signatureMethod,
      oauth_timestamp: Math.floor(Date.now() / 1000),
      oauth_version: '1.0'
    }

    parameters.oauth_signature = generateSignature({
      consumerSecret: this.consumerSecret,
      data: parameters,
      httpMethod: 'POST',
      url: this.tokenRequestUrl
    })

    return Axios.create({
        headers: {
          Authorization: 'OAuth ' + QueryString.stringify(parameters, ',')
        }
      })
      .post(this.tokenRequestUrl)
      .then(axiosResponse => {
        let {
          oauth_token,
          oauth_token_secret
        } = QueryString.parse(axiosResponse.data)

        this._step1Token = oauth_token
        this._step1TokenSecret = oauth_token_secret

        response.redirect(`${this.authRequestUrl}?oauth_token=${oauth_token}`)
      })
  }

  processCallback(request, response, next) {
    let {
      oauth_token,
      oauth_verifier
    } = request.query

    if (oauth_token != this._step1Token)
      throw new Error('Invalid token.')

    let parameters = {
      oauth_callback: this.callbackUrl,
      oauth_consumer_key: this.consumerKey,
      oauth_nonce: Uuid.v4(),
      oauth_signature_method: this.signatureMethod,
      oauth_timestamp: Math.floor(Date.now() / 1000),
      oauth_token,
      oauth_version: '1.0'
    }

    parameters.oauth_signature = generateSignature({
      consumerSecret: this.consumerSecret,
      data: parameters,
      httpMethod: 'POST',
      tokenSecret: this._step1TokenSecret,
      url: this.accessTokenRequestUrl
    })

    return Axios.create({
        headers: {
          Authorization: 'OAuth ' + QueryString.stringify(parameters, ',')
        }
      })
      .post(this.accessTokenRequestUrl, `oauth_verifier=${oauth_verifier}`)
      .then(axiosResponse => {
        let tokens = QueryString.parse(axiosResponse.data)
        let bearer = new OAuth1aBearer({
          consumerKey: this.consumerKey,
          consumerSecret: this.consumerSecret,
          signatureMethod: this.signatureMethod,
          tokens
        })
        return {bearer, tokens}
      })
  }
}

export default OAuth1a
