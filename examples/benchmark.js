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

// load up and initialise ewd-qoper8
var qoper8 = require('ewd-qoper8');
var q = new qoper8.masterProcess();

// set the benchmark parameters - can be over-ridden from command-line parameters

var poolSize = parseInt(process.argv[2]) || 1;  // how many workers?
var max = parseInt(process.argv[3]) || 10000;   // how many messages to create in the database queue
var log = process.argv[4] || false;   // verbose logging (if true, it will slow the benchmark down)
var queueDocument = process.argv[5];   // document name to use for the database queue



// Define ewd-qoper8's event handlers

q.on('start', function() {
  this.worker.module = 'ewd-qoper8-dbq/examples/benchmark-worker';
  this.setWorkerPoolSize(poolSize);

  // connect to Cache
  var connectCacheTo = require('ewd-qoper8-cache');
  // ** IMPORTANT ** lock must be set to 1 for safe use of asynch cache.node APIs
  var params = {
    lock: 1
  };
  connectCacheTo(this);
});

q.on('dbqReady', function() {
  // ewd-qoper8-dbq is ready for use

  // add document name to user-defined data for transmission to worker(s)
  this.userDefined = {
    queueDocument: this.dbQueue.mainNode.global
  };

  // we'll create a queue of requests on disk.  max defines how many
  //  As we're not going to do anything else right now, we can safely
  //  do this synchronously for simplicity...

  var messageObj;
  var node;
  var messageContents =  {
    hello: 'world',
    a: 12345
  };

  node = {
    global: this.dbQueue.mainNode.global,
    subscripts: []
  };
  this.db.kill(node);

  for (var i = 0; i < max; i++) {
    messageObj = {
      type: 'qoper8-test',
      messageNo: i,
      time: new Date().getTime(),
      contents: messageContents
    };
    node = {
      global: this.dbQueue.mainNode.global,
      subscripts: ['queue', i],
      data: JSON.stringify(messageObj)
    };
    this.db.set(node);
  }
  node = {
    global: this.dbQueue.mainNode.global,
    subscripts: ['queue'],
    data: i - 1
  };
  this.db.set(node);
  console.log('queue created: ' + i + ' records');  
});

var startTime;

q.on('started', function() {
  // OK let's start the benchmark
  this.log = log;
  console.log('Benchmark will start now..');
  // note: it will process the queue asynchronously in the master process
  startTime = new Date().getTime();
  // start processing the queue
  this.processQueue(true);
});

var noOfResponses = 0;

q.on('dbqResponse', function(responseObj, pid) {
  // count the returned responses, stop ewd-qoper8 when the max is reached (so queue exhausted)
  noOfResponses++;
  if (noOfResponses === max) {
      console.log('');
      console.log('===========================');
      var elapsed = (new Date().getTime() - startTime) / 1000;
      var rate = max / elapsed;
      console.log(noOfResponses + ' messages: ' + elapsed + ' sec');
      console.log('Processing rate: ' + rate + ' message/sec');
      for (var pid in this.worker.process) {
        console.log('Worker ' + pid + ': ' + this.worker.process[pid].totalRequests + ' requests handled');
      }
      console.log('');
      console.log('===========================');
      // set flag to tell this.responseFinished to shutdown ewd-qoper8
      this.shutdown = true;
  }
});

// OK start it all up

// load up and start up the ewd-qoper8-db plug-in

var dbq = require('ewd-qoper8-dbq');
dbq.master(q, false, queueDocument);

q.start();
