const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const { createEvent, getEventById } = require('../../src/event-service');

describe('Get Event By ID', () => {
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

  test('should retrieve an event by ID', async () => {
    const eventData = { title: 'Event 1' };
    const createdEvent = await createEvent(eventData);
    const foundEvent = await getEventById(createdEvent._id);

    expect(foundEvent.title).toBe(eventData.title);
  });
});
