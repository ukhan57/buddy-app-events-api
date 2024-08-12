const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const { createEvent, joinEvent, leaveEvent } = require('../../src/event-service');

describe('Leave Event', () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  test('should allow a user to leave an event', async () => {
    const eventData = { title: 'Event 1', attendees: ['testuser'] };
    const createdEvent = await createEvent(eventData);
    const updatedEvent = await leaveEvent(createdEvent._id, 'testuser');

    expect(updatedEvent.attendees).not.toContain('testuser');
  });
});
