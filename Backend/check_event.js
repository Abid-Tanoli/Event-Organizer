const mongoose = require('mongoose');
const { Schema } = mongoose;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/event_organizer_db')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB', err));

const eventSchema = new Schema({}, { strict: false });
const Event = mongoose.model('Event', eventSchema);

async function checkEventStatus() {
    try {
        const eventId = '699048ce28f780051fec7200';
        const event = await Event.findById(eventId);

        if (!event) {
            console.log('Event not found');
        } else {
            console.log('Event Details:');
            console.log(`- Title: ${event.title}`);
            console.log(`- ID: ${event._id}`);
            console.log(`- Status: ${event.status}`);
            console.log(`- Is Published: ${event.isPublished}`);
            console.log(`- Total Tickets: ${event.totalTickets}`);
            console.log(`- Sold Tickets: ${event.soldTickets}`);
            console.log(`- Available Tickets: ${event.availableTickets}`);
        }
    } catch (error) {
        console.error('Error fetching event:', error);
    } finally {
        mongoose.disconnect();
    }
}

checkEventStatus();
