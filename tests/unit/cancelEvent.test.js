const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const { createEvent, cancelEvent, getEventById } = require('../../src/event-service');

describe('Cancel Event', () => {
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

  test('should allow the organizer to cancel an event', async () => {
    const eventData = { title: 'Event 1', organizer: 'organizerUser' };
    const createdEvent = await createEvent(eventData);
    const result = await cancelEvent(createdEvent._id, 'organizerUser');

    expect(result).toBe(true);
    const event = await getEventById(createdEvent._id);
    expect(event).toBeNull();
  });

  test('should not allow a non-organizer to cancel an event', async () => {
    const eventData = { title: 'Event 2', organizer: 'organizerUser' };
    const createdEvent = await createEvent(eventData);
    const result = await cancelEvent(createdEvent._id, 'nonOrganizerUser');

    expect(result).toBe(false);
    const event = await getEventById(createdEvent._id);
    expect(event).not.toBeNull();
  });
});
