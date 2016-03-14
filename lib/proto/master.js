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

var dbOpenedHandler = require('./dbOpenedHandler');
var dispatchHandler = require('./dispatchHandler');
var responseHandler = require('./responseHandler');
var responseFinishedHandler = require('./responseFinishedHandler');

module.exports = function(clearDown, queueDocumentName) {

  queueDocumentName = queueDocumentName || 'ewdq';

  var onDbOpened = dbOpenedHandler.bind(this, clearDown, queueDocumentName);
  var onDispatch = dispatchHandler.bind(this);
  var onResponse = responseHandler.bind(this);
  var onResponseFinished = responseFinishedHandler.bind(this);
  

  this.on('dbOpened', onDbOpened);

  // New dispatch event handler - emitted by processQueue once a worker process is allocated

  this.on('dispatch', onDispatch);

  // custom response handler for messages with stacked callbacks

  this.on('response', onResponse);

  // Custom response handler for processing responses from workers
  //  and clearing down queued record and flags

  // At the end of your 'response' handler, emit a responseFinished event
  //  This should now be emitted for intermediate messages as it will
  //  release the worker back to the available pool, so check
  //  that responseObj.finished === true before emitting this event!

  this.on('responseFinished', onResponseFinished);

};
