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

var qoper8;

var clearDownQueue = require('./proto/clearDownQueue');
var addToCustomQueue = require('./proto/addToCustomQueue');
var master = require('./proto/master');
var worker = require('./proto/worker');

function init(q, clearDown, queueDocumentName) {
  qoper8 = q;
  master.call(q, clearDown, queueDocumentName);
  q.addToQueue = addToQueue;
  q.handleMessage = handleMessage;
}

function handleMessage(message, callback) {
  message.callback = callback;
  addToCustomQueue.call(qoper8, message);
}

function addToQueue(requestObject) {
  addToCustomQueue.call(qoper8, requestObj);
}

module.exports = {
  master: init,
  clearDownQueue: clearDownQueue,
  addToQueue: addToQueue,
  handleMessage: handleMessage,
  worker: worker
};


