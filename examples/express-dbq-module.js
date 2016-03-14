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

    var dbq = require('ewd-qoper8-dbq');
    dbq.worker.call(this);

    var connectCacheTo = require('ewd-qoper8-cache');
    connectCacheTo(this);
    // this.documentStore has now been instantiated

    if (isFirst) {
      var log = new this.documentStore.DocumentNode('ewdTestLog');
      log.delete();
    }
  });

  this.on('message', function(messageObj, send, finished) {
    
    var results = {
      youSent: messageObj,
      workerSent: 'hello from worker ' + process.pid,
      time: new Date().toString()
    };
    var log = new this.documentStore.DocumentNode('ewdTestLog');
    var ix = log.increment();
    log.$(ix).setDocument(results);
    finished(results);
  });

  this.on('stop', function() {
    console.log('Connection to Cache closed');
  });
  
};
