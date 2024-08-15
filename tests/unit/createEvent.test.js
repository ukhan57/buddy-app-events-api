const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const { createEvent } = require('../../src/event-service');

describe('Event Creation', () => {
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
    jest.clearAllTimers();
  });

  test('should create an event successfully', async () => {
    const eventData = {
      title: 'Test Event',
      description: 'This is a test event',
      location: 'Test Location',
      address: '123 Test St',
      startDate: '2024-07-25',
      endDate: '2024-07-26',
      startTime: '10:00 AM',
      endTime: '12:00 PM',
      attendees: [],
      organizer: 'testuser',
    };
    const imageUrl = 'http://example.com/image.jpg';
    const event = await createEvent(eventData, imageUrl);

    expect(event).toHaveProperty('_id');
    expect(event.title).toBe(eventData.title);
    expect(event.imageUrl).toBe(imageUrl);
  });
});
