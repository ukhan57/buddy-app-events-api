//src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const mongoose = require('mongoose');
const multer = require('multer');
const { Event, createEvent, getAllEvents, getEventById, joinEvent, leaveEvent, cancelEvent } = require('./event-service');

// Load environment variables from .env file
require('dotenv').config();

const logger = require('./logger');
const pino = require('pino-http')({
  logger,
});

const app = express();
app.use(pino);
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

if (process.env.NODE_ENV !== 'test') {
  app.use(pino);
}

mongoose.connect(process.env.MONGODB_URI, { })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Multer setup for image uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post("/api/events", upload.single('image'), async (req, res) => {
  try {
    const eventData = req.body;
    const imageUrl = req.file ? `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}` : null;
    const event = await createEvent(eventData, imageUrl);
    res.status(201).json({ message: 'Event created successfully', event });
  } catch (error) {
    res.status(500).json({ message: 'Error creating event', error });
  }
});

app.get("/api/events", async (req, res) => {
  try {
    const events = await getAllEvents();
    res.status(200).json({ events });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events', error });
  }
});

app.get("/api/events/:id", async (req, res) => {
  try {
    const event = await getEventById(req.params.id);
    if (event) {
      res.status(200).json({ event });
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching event', error });
  }
});

app.post("/api/events/:id/join", async (req, res) => {
  try {
    const { id } = req.params;
    const { username } = req.body;
    const event = await joinEvent(id, username);
    res.status(200).json({ message: 'Joined event successfully', event });
  } catch (error) {
    res.status(500).json({ message: 'Error joining event', error });
  }
});

app.post("/api/events/:id/leave", async (req, res) => {
  try {
    const { username } = req.body;
    const event = await leaveEvent(req.params.id, username);
    if (event) {
      res.status(200).json({ event });
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error leaving event', error });
  }
});

app.post("/api/events/:id/comments", async (req, res) => {
  try {
    const eventId = req.params.id;
    const { user, text } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    event.comments.push({ user, text });
    await event.save();

    res.status(201).json({ message: 'Comment added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding comment', error });
  }
});

app.get("/api/events/:id/comments", async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await Event.findById(eventId, 'comments');
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.status(200).json({ comments: event.comments });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching comments', error });
  }
});

// Endpoint to cancel an event
app.delete("/api/events/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { username } = req.body;
    const success = await cancelEvent(id, username);
    if (success) {
      res.status(200).json({ message: 'Event canceled successfully' });
    } else {
      res.status(403).json({ message: 'You are not authorized to cancel this event' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error canceling event', error });
  }
});

app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    error: {
      message: 'not found',
      code: 404,
    },
  });
});

app.use((err, req, res) => {
  const status = err.status || 500;
  const message = err.message || 'unable to process request';
  if (status > 499) {
    logger.error({ err }, `Error processing request`);
  }
  res.status(status).json({
    status: 'error',
    error: {
      message,
      code: status,
    },
  });
});

module.exports = app;
