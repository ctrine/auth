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

export type Profile = {
  id:string,
  name:string,
  emails:Array<string>
}

export type SuccessCallback = (provider:string, req:any, res:any, next:Function) => void
export type ErrorCallback = (provider:string, err:any, req:any, res:any, next:Function) => void

/**
 * Any provider using the OAuth 1a will require these options.
 */
export type OAuth1aOptions = {
  consumerKey:string,
  consumerSecret:string
}

/**
 * Any provider using the OAuth2 will require these options.
 */
export type OAuth2Options = {
  clientId:string,
  clientSecret:string,
  scope?:string|Array<string>
}

/**
 * Available providers.
 */
export type ProvidersOptions = {
  facebook?: OAuth2Options,
  github?: OAuth2Options,
  google?: OAuth2Options,
  linkedin?: OAuth2Options,
  twitter?: OAuth1aOptions,
  yahoo?: OAuth2Options
}

/**
 * The middleware options.
 */
export type Options = {
  /**
   * The user was authenticated.
   */
  onSuccess:SuccessCallback,

  /**
   * The credentials were invalid or the user did not authorize access to the
   * profile data.
   */
  onAuthDenied:ErrorCallback,

  /**
   * Any other error.
   */
  onError:ErrorCallback,

  /**
   * Domain required for the callback URL.
   */
  domain:string,

  /**
   * Route used to initiate the authentication.
   */
  authRoute:string,

  /**
   * Route used to process additional steps.
   */
  callbackRoute:string,

  /**
   * Providers settings.
   */
  providers:ProvidersOptions
}
