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

var responseFinished = require('./responseFinished');

module.exports = function(pid) {

    // Get the first record from the dbQueue that isn't already marked as being processed

    var q = this;
    var dbQueue = this.dbQueue;
    var beingProcessed = dbQueue.beingProcessed;
    var mainNode = dbQueue.mainNode;
    var indexNode = dbQueue.indexNode;

    function getFirstOnQueue(node) {
      q.db.next(node, function(error, results) {
        var ix = results.result;
        if (ix === '') {
          // nothing left on the queue - release the worker
          console.log('queue exhausted');
          responseFinished.call(q, pid, true);
          return; // nothing left on the queue
        }
        if (beingProcessed[ix]) {
          // try the next record
          getFirstOnQueue(results);
        }
        else {
          // mark it!
          beingProcessed[ix] = pid;
          createPidPointer(ix, pid);
        }
      });
    }

    function createPidPointer(ix, pid) {
      // create index record in queue that allows the worker to retrieve the correct message from the queue
      // also create local one for faster lookup in master
 
      q.workerMessage[pid] = ix;

      var subs = indexNode.subscripts.slice(0);
      subs.push(pid);
      var node = {
        global: indexNode.global,
        subscripts: subs,
        data: ix
      };
      q.db.set(node, function(error, result) {
        // Now that the pointer is in place, signal the worker to pick up and process the record from the queue
        //console.log('signalling worker');
        q.worker.process[pid].kill('SIGUSR2');

        // check to see if we should start a new worker
        if (q.worker.list.length < q.worker.poolSize) {
          q.db.get(q.dbQueue.mainNode, function(error, result) {
            if (!error && result.data > ix) {
              // there's more on the queue than the records currently being processed,
              // so start a new worker
              q.processQueue(true);
            }
          });
        }

      });
    }

    var subs = mainNode.subscripts.slice(0);
    subs.push('');
    var node = {
      global: mainNode.global,
      subscripts: subs,
    };
    getFirstOnQueue(node);

};