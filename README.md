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

## Coverage

```
------------------------------|---------|----------|---------|---------|-------------------
File                          | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
------------------------------|---------|----------|---------|---------|-------------------
All files                     |    98.8 |       70 |     100 |   98.75 |
 wonder-queue                 |     100 |      100 |     100 |     100 |
  app.js                      |     100 |      100 |     100 |     100 |
 wonder-queue/src/controllers |     100 |      100 |     100 |     100 |
  messages.js                 |     100 |      100 |     100 |     100 |
 wonder-queue/src/services    |   97.67 |       70 |     100 |    97.5 |
  queue.js                    |   97.67 |       70 |     100 |    97.5 | 94
------------------------------|---------|----------|---------|---------|-------------------
```

## TODO & Improvements

Some changes can (always) be made to improve performance of the WonderQ. The project currently tries to have as few dependencies as possible, avoiding the use of helpful libraries as `lodash` and `uuid`, for example.

The project is missing though, some observability features like logging. Although having tests and a good coverage counts, a CI would also be helpful. Linting would help Developer Experience and a formatter (hello, `prettier`) would avoid future fights.

In order to achieve a better performance in a production environment, three major changes can be made:

1. To wait until a specific threshold happens to remove all the processed messages from the queue. This means having an index to state that all the elements behind are already processed and it's safe to remove them all. And why not using `shift()` instead of `splice()`?
2. Instead of creating the timer for the release timeout while looking for available messages, we could pass the message id in the context to another middleware make this call after the method `queue.getAvailableMessages` is complete.
3. Clustering the application to better use the server cores and increasing the memory limit in order to be able to handle more messages.
