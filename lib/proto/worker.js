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

module.exports = function(queueDocumentName) {

  queueDocumentName = queueDocumentName || 'ewdq';

  this.on('DocumentStoreStarted', function() {

    var queueNode = new this.documentStore.DocumentNode(queueDocumentName);
    this.queue = queueNode.$('queue');
    this.queueIndex = queueNode.$('byWorker');

    var worker = this;

    var messageHandler = require('ewd-qoper8/lib/worker/proto/messageHandler');

    // Listen for SIGUSR2 signals from master

    process.on('SIGUSR2', function() {
      //console.log(process.pid + ': signal received from master');
      // locate the queued record allocated for this worker
      var ix = worker.queueIndex.$(process.pid).value;
      var messageObj = JSON.parse(worker.queue.$(ix).value);
      // now invoke the standard ewd-qoper8 worker message handler
      messageHandler.call(worker, messageObj);
    });

  }); 

};
