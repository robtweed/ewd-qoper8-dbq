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

module.exports = function(pid, stop) {

  // release worker process

  if (this.log) console.log('*Master process has finished processing response from worker process ' + pid + ' which is back in available pool');
  // this check for worker is needed as custom handler may have stopped it

  var worker = this.worker.process[pid];
  if (worker) {
    // release the worker back to the available pool
    worker.isAvailable = true;
    worker.time = new Date().getTime();
  }

  // now that this worker is available, process the queue again, unless told otherwise
  // by dispatch handler

  if (!stop) {
    this.processQueue(true);
  }
  else {
    // should ewd-qoper8 be shut down?
    if (this.shutdown) {
      delete this.shutdown;
      this.stop();
    }
  }
};
