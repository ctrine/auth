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

import Facebook from './Facebook'
import Google from './Google'
import Local from './Local'
import Twitter from './Twitter'
import Yahoo from './Yahoo'

export const AVAILABLE_STRATEGIES = {
  facebook: Facebook,
  google: Google,
  local: Local,
  twitter: Twitter,
  yahoo: Yahoo
}

export const DEFAULT_OPTIONS = {
  authRoute: '/auth/:provider',
  callbackRoute: '/auth/callback'
}

export const EXPECTED_SESSION_KEYS = {
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
   * Used to make http requests using the access tokens retrived.
   */
  bearers: {},

  /**
   * Loaded profiles for each provider.
   */
  profiles: {},

  /**
   * Retrieved tokens for each provider.
   */
  tokens: {}
}