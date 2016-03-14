# ewd-qoper8-dbq: ewd-qoper8 plug-in to switch it to use a Global Storage Database queue
 
Rob Tweed <rtweed@mgateway.com>  
24 February 2016, M/Gateway Developments Ltd [http://www.mgateway.com](http://www.mgateway.com)  

Twitter: @rtweed

Google Group for discussions, support, advice etc: [http://groups.google.co.uk/group/enterprise-web-developer-community](http://groups.google.co.uk/group/enterprise-web-developer-community)


## ewd-qoper8-dbq

This is a plug-in module for ewd-qoper8, over-riding its default memory-based queue and substituting it with a database-based
queue using a Global Storage Database such as InterSystems Cache or the Open Source GT.M.

For more informaation on ewd-qoper8:

[https://github.com/robtweed/ewd-qoper8](https://github.com/robtweed/ewd-qoper8)


## Installing

       npm install ewd-qoper8-dbq
	   
## Using ewd-qoper8-dbq

The /examples directory contains three examples of how to use ewd-qoper8-dbq:

- express-dbq.js: demonstrating how to use ewd-qoper8 with Express, using ewd-qoper8-dbq to provide a database-based queue
- express-qx-dbq.js: demonstrating how to use ewd-qoper8 and ewd-qoper8-express with Express, 
   using ewd-qoper8-dbq to provide a database-based queue
- benchmark.js: provides a performance benchmark, demonstrating the throughput using a database-based queue

In summary, to use ewd-qoper8-dbq, you must do the following:

### ewd-qoper8 Master Process

First make sure you have loaded and initialised ewd-qoper8 in your master process, eg:

        var qoper8 = require('ewd-qoper8');
        var q = new qoper8.masterProcess();

Next load ewd-qoper8-dbq and run its initialisation function which extends the ewd-qoper8 master process:

        var dbq = require('ewd-qoper8-dbq');
        dbq.master(q);

If you want to clear down anything in the queue when you start the master process, you can set the master() function's
optional second argument to true, eg:

        var clearDown = true;
        dbq.master(q, clearDown);

By default, however, any records still in the database queue will be processed when you start it up.  This is useful if
something unexpectedly brought ewd-qoper8 down and left some queued requests unprocessed.

In order to generate the database-based queue from within the master process, you must connect it to a
database that is supported by ewd-document-store, eg:

- InterSystems Cache, using ewd-qoper8-cache: [https://github.com/robtweed/ewd-qoper8-cache](https://github.com/robtweed/ewd-qoper8-cache)
- GT.M using ewd-qoper8-gtm [https://github.com/robtweed/ewd-qoper8-gtm](https://github.com/robtweed/ewd-qoper8-gtm)

You should connect the database within ewd-qoper8's 'start' event handler, eg:

      q.on('start', function() {
        var connectCacheTo = require('ewd-qoper8-cache');
        var params = {
          lock: 1
        };
        connectCacheTo(this);
      });

Note the params.lock parameter which MUST be set to 1.  This is because the database must be accessed asynchronously within 
the master process, and the lock parameter ensures that the cache.node APIs will work correctly in this mode.

Amongst other things, the ewd-qoper8-dbq initialisation function - dbq.master() - over-rides the standard ewd-qoper8 methods:

- addToQueue
- handleMessage

with modified versions that make use of the database queue.  So you can usually use ewd-qoper8 as normal, and behind the
scenes the over-ride methods will automatically use the database queue instead.


### ewd-qoper8 Worker Module


You must also instruct your Worker Module to use the database queue instead of the default memory-based one.

In the on('start') event handler, you load ewd-qoper8-dbq and invoke its worker() function.  Then connect to your
database, for example:

      this.on('start', function(isFirst) {
        var dbq = require('ewd-qoper8-dbq');
        dbq.worker.call(this);

        var connectCacheTo = require('ewd-qoper8-cache');
        connectCacheTo(this);
      });

That's all you need to do.  You can handle any incoming messages using ewd-qoper8's on('message') handler as
normal, eg:

      this.on('message', function(messageObj, send, finished) {
        // handle the incoming message that has been passed in from the database queue
        // in the usual ewd-qoper8 way
      });

### Adding messages to the database queue

In your master process, if you want to add a message object to the database queue, use the special API:

        dbq.addToQueue(requestObj);

Requests objects are exactly the same as those that you would use with standard ewd-qoper8.

Adding a message to the database queue will trigger the processing of the queue.

### Handling responses returned from Worker(s)

ewd-qoper8-dbq adds a new event: 'dbqResponse' which is emitted when a response is received from a worker.  You should use this
instead of the standard 'response' event.  Its arguments are identical to the standard response event, eg:

      q.on('dbqResponse', function(responseObj, pid) {
        // handle the response from the worker with this pid
      });


### Using ewd-qoper8-dbq with Express

Instead of manually adding messages to the database queue and handling returned responses within your master
process, you can use the d.handleMessage() function which will have been over-ridden by the ewd-qoper8-dbq version 
that uses the database queue, eg:

        app.post('/qoper8', function (req, res) {
          q.handleMessage(req.body, function(response) {
            res.send(response);
          });
        });

You can also use this for handling web-socket messages within the master process.


### Using ewd-qoper8-dbq with ewd-qoper8-express and Express

ewd-qoper8-express adds additional functionality to ewd-qoper8 when using Express, in particular:

- a special version of the handleMessage function which automatically creates a request message from the various
  components of Express's req object
- a router for Express which also creates a request message from the components of Express's req object

Provided you load the ewd-qoper8-dbq module and initialise it in both your master and worker modules, you just use these
ewd-qoper8-express externsions as normal, and they will use the database queue instead.  

For a worked example/ demonstration, see in the /examples directory: look for express-qx-dbq.js

For more informaation on ewd-qoper8-express:

[https://github.com/robtweed/ewd-qoper8-express](https://github.com/robtweed/ewd-qoper8-express)


## License

 Copyright (c) 2016 M/Gateway Developments Ltd,                           
 Reigate, Surrey UK.                                                      
 All rights reserved.                                                     
                                                                           
  http://www.mgateway.com                                                  
  Email: rtweed@mgateway.com                                               
                                                                           
                                                                           
  Licensed under the Apache License, Version 2.0 (the "License");          
  you may not use this file except in compliance with the License.         
  You may obtain a copy of the License at                                  
                                                                           
      http://www.apache.org/licenses/LICENSE-2.0                           
                                                                           
  Unless required by applicable law or agreed to in writing, software      
  distributed under the License is distributed on an "AS IS" BASIS,        
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. 
  See the License for the specific language governing permissions and      
   limitations under the License.      
