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

    // clear message from queue and release the worker
    
    var q = this;
    var dbQueue = this.dbQueue;
    var beingProcessed = dbQueue.beingProcessed;
    var mainNode = dbQueue.mainNode;
    var indexNode = dbQueue.indexNode;

    function deleteFromQueue(ix) {
      var subs = mainNode.subscripts.slice(0);
      subs.push(ix);
      var node = {
        global: mainNode.global,
        subscripts: subs,
      };
      q.db.kill(node, function(error) {
        //  record is now removed from the dbQueue
        //  get rid of the saved callback, if present
        delete q.callbacks[ix];
        //  now it's safe to get rid of the marked flag
        delete beingProcessed[ix];
        //  and now also safe to release the worker
        responseFinished.call(q, pid);

      });
    }

    // locate the record that the worker had been processing
    //  from the queue index and delete it from the dbQueue

    var ix = this.workerMessage[pid];
    deleteFromQueue(ix);
};
