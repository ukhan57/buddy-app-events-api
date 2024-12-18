// src/event-service.js
const mongoose = require('mongoose');
const logger = require('./logger');

// Comment schema
const commentSchema = new mongoose.Schema({
  user: String,
  text: String,
  timestamp: { type: Date, default: Date.now }
});

// Event schema
const eventSchema = new mongoose.Schema({
  title: String,
  description: String,
  location: String,
  address: String,
  startDate: String,
  endDate: String,
  startTime: String,
  endTime: String,
  attendees: [String],
  organizer: String,
  comments: [commentSchema], // Embed comments in event schema
  imageUrl: String 
});

const Event = mongoose.model('Event', eventSchema);

module.exports = {
  Event, 
  createEvent: async function(eventData, imageUrl) {    
    const event = new Event({ ...eventData, imageUrl }); 
    return event.save();
  },

  getAllEvents: async function() {
    return Event.find().exec();
  },
  
  getEventById: async function(id) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return null;
      }
      return Event.findById(id).exec();
    } catch (error) {
      logger.error("Could not find the event: ", error)
      return null;
    }
  },
  
  joinEvent: async function(id, username) {
    const event = await Event.findById(id).exec();
    if (event) {
      if (!event.attendees.includes(username)) {
        event.attendees.push(username);
        await event.save();
      }
    }
    return event;
  },
  leaveEvent: async function(id, username) {
    const event = await Event.findById(id).exec();
    if (event) {
      event.attendees = event.attendees.filter(attendee => attendee !== username);
      await event.save();
    }
    return event;
  },

  cancelEvent: async function(id, username) {
    try {
      const event = await Event.findById(id).exec();
      if (event && event.organizer === username) {
        await Event.findByIdAndDelete(id).exec();
        return true;
      }
      return false;
    } catch (error) {
      logger.error("Could not cancel the event: ", error);
      return false; 
    }
  }
};
