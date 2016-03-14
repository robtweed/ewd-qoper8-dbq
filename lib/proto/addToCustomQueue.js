/*

 ----------------------------------------------------------------------------
 | ewd-qoper8-dbq: ewd-qoper8 Custom Database Queue using Cache or GT.M     |
 |                                                                          |
 | Copyright (c) 2016 M/Gateway Developments Ltd,                           |
 | Reigate, Surrey UK.                                                      |
 | All rights reserved.                                                     |
 |                                                                          |
 | http://www.mgateway.com                                                  |
 | Email: rtweed@mgateway.com                                               |
 |                                                                          |
 |                                                                          |
 | Licensed under the Apache License, Version 2.0 (the "License");          |
 | you may not use this file except in compliance with the License.         |
 | You may obtain a copy of the License at                                  |
 |                                                                          |
 |     http://www.apache.org/licenses/LICENSE-2.0                           |
 |                                                                          |
 | Unless required by applicable law or agreed to in writing, software      |
 | distributed under the License is distributed on an "AS IS" BASIS,        |
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. |
 | See the License for the specific language governing permissions and      |
 |  limitations under the License.                                          |
 ----------------------------------------------------------------------------

*/

module.exports = function(requestObj) {

  var q = this;
  var mainNode = this.dbQueue.mainNode;

  function addToDBQueue(requestObj, ix) {

    if (requestObj.callback) {
      q.callbacks[ix] = requestObj.callback;
      delete requestObj.callback;
    }

    var subs = mainNode.subscripts.slice(0);
    subs.push(ix);
    var node = {
      global: mainNode.global,
      subscripts: subs,
      data: JSON.stringify(requestObj)
    };
    q.db.set(node, function(error, result) {
      q.processQueue(true);
    });
  }

  this.db.increment(mainNode, function(error, result) {
    if (!error) addToDBQueue(requestObj, result.data);
  });

};