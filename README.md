# WonderQ - Another simple queuing system

Inspired by [AWS SQS](http://goo.gl/Bn8qaD)

WonderQ is a broker that allows producers to write to it, and consumers to read from it. It runs on a single server. Whenever a producer writes to WonderQ, a message ID is generated and returned as confirmation. Whenever a consumer polls WonderQ for new messages, it can get those messages. These messages should NOT be available for processing by any other consumer that may be concurrently accessing WonderQ.

NOTE that, when a consumer gets a set of messages, it must notify WonderQ that it has processed each message (individually). This deletes that message from the WonderQ database. If a message is received by a consumer but NOT marked as processed within a configurable amount of time, the message then becomes available to any consumer requesting again.

## Tasks

• Build a module that represents WonderQ. Please store data in-memory using data structures rather than using a database.

• Create the REST API endpoints that producers/consumers could use to generate and consume messages

Use the most efficient data structures and API endpoints possible to support a high volume of messages.

• Write documentation for your API endpoints. Talk about their inputs/outputs, formats, methods, responses, etc

• Discuss what steps would you need to take in order to scale this system to make it production ready for very high volume? What are potential issues in production that might arise and how would you go about implementing solutions? For each of the previous questions, which tools/technologies would you use and why? Please be detailed.

• Use Node.js and ES6/ES7 as that is what we use (you may also use Typescript, but it is optional)

• Add tests for the critical functionality of WonderQ
