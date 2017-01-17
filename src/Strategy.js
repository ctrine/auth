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

export interface Strategy {
  /**
   * Authenticates or initiates authentication.
   */
  authenticate(request:Object, response:Object, next:Function):void;

  /**
   * Loads the authenticated user ID, profile picture, full name and emails.
   * This data must be stored inside “profiles” key for each provider.
   */
  loadUserData(request:Object, response:Object, next:Function):void;

  /**
   * Loop used to process additional steps.
   */
  processCallback(request:Object, response:Object, next:Function):void;
}

export default Strategy