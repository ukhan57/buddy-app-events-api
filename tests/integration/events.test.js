const request = require('supertest');
const mongoose = require('mongoose'); 
const app = require('../../src/app'); 


describe('Events API', () => {

  afterAll(async () => {
    // Close the Mongoose connection after all tests have run
    await mongoose.connection.close();
  });

  test('GET /api/events should return all events', async () => {
    const res = await request(app).get('/api/events');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.events)).toBe(true);
  });

  test('POST /api/events should create a new event', async () => {
    const newEvent = {
      title: 'Test Event',
      description: 'A test event',
      location: 'Test Location',
      startDate: '2024-12-01',
      endDate: '2024-12-01',
      startTime: '10:00',
      endTime: '12:00',
      organizer: 'Test Organizer',
    };
    const res = await request(app).post('/api/events').send(newEvent);
    expect(res.statusCode).toBe(201);
    expect(res.body.event.title).toBe('Test Event');
  });
});


describe('Events API Error Handling', () => {

  test('GET /api/events/:id should return 404 for non-existent event', async () => {
    const res = await request(app).get('/api/events/nonexistentid');
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('Event not found');
  });

  test('DELETE /api/events/:id should return 403 for unauthorized cancel', async () => {
    const res = await request(app)
      .delete('/api/events/nonexistentid')
      .send({ username: 'someuser' });
    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe('You are not authorized to cancel this event');
  });

  test('POST /api/events/:id/join should return 500 if event join fails', async () => {
    const res = await request(app).post('/api/events/invalidId/join').send({ username: 'testUser' });
    expect(res.statusCode).toBe(500);
  });
  
  test('POST /api/events should handle file upload errors gracefully', async () => {
    const res = await request(app)
      .post('/api/events')
      .field('title', 'Test Event')
      .attach('image', Buffer.from('invalid image'), { filename: 'test.txt', contentType: 'text/plain' });
    expect(res.statusCode).toBe(500); // Assuming multer throws an error for invalid image type
  });

  

});
