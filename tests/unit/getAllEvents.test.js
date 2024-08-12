const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const { createEvent, getAllEvents } = require('../../src/event-service');

describe('Get All Events', () => {
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

  test('should retrieve all events', async () => {
    await createEvent({ title: 'Event 1' });
    await createEvent({ title: 'Event 2' });

    const events = await getAllEvents();
    expect(events.length).toBe(2);
    expect(events[0].title).toBe('Event 1');
    expect(events[1].title).toBe('Event 2');
  });
});

