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

module.exports = function() {

  this.on('start', function(isFirst) {

    var queueDocument;
    if (this.userDefined && this.userDefined.queueDocument) queueDocument = this.userDefined.queueDocument;

    var dbq = require('ewd-qoper8-dbq');
    dbq.worker.call(this, queueDocument);

    // connect Cache

    var connectCacheTo = require('ewd-qoper8-cache');
    connectCacheTo(this);

    //console.log('worker ' + process.pid + ' started!!');

    /*

    // set up pointers to the database queue records we'll need to keep accessing
    var queueNode = new this.documentStore.DocumentNode('ewdq');
    this.queue = queueNode.$('queue');
    this.queueIndex = queueNode.$('byWorker');

    var worker = this;

    var messageHandler = require('ewd-qoper8/lib/worker/proto/messageHandler');

    process.on('SIGUSR2', function() {
      // signal received from master process to handle a message

      //console.log('worker ' + process.pid + ': signal received');

      //locate the message in the database queue index for this worker process pid
      var ix = worker.queueIndex.$(process.pid).value;
      // and now pick up the message contents from the database queue
      var messageObj = JSON.parse(worker.queue.$(ix).value);

      //console.log('worker ' + process.pid + ': picked up message ' + JSON.stringify(messageObj));

      // invoke the standard ewd-qoper8 message handler function and carry on as normal
      messageHandler.call(worker, messageObj);
    });

    */

  });

  
};
