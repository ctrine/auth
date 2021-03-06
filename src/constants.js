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

import Dropbox from './Dropbox'
import Facebook from './Facebook'
import Github from './Github'
import Google from './Google'
import Linkedin from './Linkedin'
import Twitter from './Twitter'
import Yahoo from './Yahoo'

export const AVAILABLE_PROVIDERS = {
  dropbox: Dropbox,
  facebook: Facebook,
  github: Github,
  google: Google,
  linkedin: Linkedin,
  twitter: Twitter,
  yahoo: Yahoo
}

const HTTP_UNAUTHORIZED = 401
const HTTP_INTERNAL_SERVER_ERROR = 500

export const DEFAULT_OPTIONS = {
  authRoute: '/auth/:provider',
  callbackRoute: '/auth/callback',
  onAuthDenied(prov, err, req, res, next) {
    res.status(HTTP_UNAUTHORIZED).json({
      err: err.stack || err,
      prov
    })
  },
  onError(prov, err, req, res, next) {
    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      err: err.stack || err,
      prov
    })
  },
  onSuccess(prov, req, res, next) {
    res.json({
      profile: req.session.profiles[prov],
      prov
    })
  }
}

export const DEFAULT_SESSION_KEYS = {
  /**
   * Used to make HTTP requests using the provider’s tokens.
   */
  bearers: {},

  /**
   * Current provider doing the authentication.
   */
  currentAuthProvider: null,

  /**
   * Used by the current provider to determine the authentication step to be
   * executed.
   */
  nextAuthStep: null,

  /**
   * Loaded profiles for each provider.
   */
  profiles: {},

  /**
   * Retrieved tokens for each provider.
   */
  tokens: {}
}
