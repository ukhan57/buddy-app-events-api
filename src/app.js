// src/app.js

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const mongoose = require('mongoose');
const eventService = require('./event-service');

// Load environment variables from .env file
require('dotenv').config();

const { author, version } = require('../package.json');
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

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Health check route
app.get('/', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.status(200).json({
    status: 'ok',
    author,
    githubUrl: 'https://github.com/ukhan57/buddy-app-events-api.git',
    version,
  });
});

// Endpoint to create a new event
app.post("/api/events", async (req, res) => {
  try {
    const eventData = req.body;
    const event = await eventService.createEvent(eventData);
    res.status(201).json({ message: 'Event created successfully', event });
  } catch (error) {
    res.status(500).json({ message: 'Error creating event', error });
  }
});

// Endpoint to fetch all events
app.get("/api/events", async (req, res) => {
  try {
    const events = await eventService.getAllEvents();
    res.status(200).json({ events });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events', error });
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

app.use((err, req, res, next) => {
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
