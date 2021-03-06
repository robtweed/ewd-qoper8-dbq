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

var clearDownQueue = require('./clearDownQueue');

module.exports = function(clearDown, queueDocumentName) {

  // Define the database storage nodes

  this.dbQueue = {
    mainNode: {
      global: queueDocumentName,
      subscripts: ['queue']
    },
    indexNode: {
      global: queueDocumentName,
      subscripts: ['byWorker']
    },
    beingProcessed: {}
  };

  this.callbacks = {};
  this.workerMessage = {};

  this.db.kill(this.dbQueue.indexNode);

  if (clearDown) {
    clearDownQueue.call(this);
  }

  this.emit('dbqReady'); 

};