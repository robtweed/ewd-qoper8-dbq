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

  1 March 2016

*/

var express = require('express');
var bodyParser = require('body-parser');
var qoper8 = require('ewd-qoper8');
var qx = require('ewd-qoper8-express');
var dbq = require('ewd-qoper8-dbq');

var app = express();
app.use(bodyParser.json());

var q = new qoper8.masterProcess();
var clearDown = (process.argv[2] === '-c')
dbq.master(q, clearDown);

qx.addTo(q);

app.get('/test', function (req, res) {
  qx.handleMessage(req, res);
});

app.use('/qoper8', qx.router());

q.on('start', function() {
  var connectCacheTo = require('ewd-qoper8-cache');
  var params = {
    lock: 1
  };
  connectCacheTo(this);
});

q.on('started', function() {
  this.worker.module = 'ewd-qoper8-dbq/examples/express-dbq-module';
  var server = app.listen(8080);
});

q.start();

