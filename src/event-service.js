const mongoose = require('mongoose');

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
  attendees: String,
  username: String, // Include the username of the event creator
});

const Event = mongoose.model('Event', eventSchema);

module.exports.createEvent = async function(eventData) {
  const event = new Event(eventData);
  return event.save();
};

module.exports.getAllEvents = async function() {
  return Event.find().exec();
};
