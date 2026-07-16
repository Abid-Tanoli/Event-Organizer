const mongoose = require('mongoose');
const { Schema } = mongoose;

const uri = "mongodb+srv://visionaryabidi_db_user:tanoli1369@cluster0.xi8oscd.mongodb.net/eventbooking?retryWrites=true&w=majority";

mongoose.connect(uri)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB', err));

const eventSchema = new Schema({}, { strict: false });
const Event = mongoose.model('Event', eventSchema);

async function checkEvent() {
    try {
        const eventId = '699048ce28f780051fec71fe';
        const event = await Event.findById(eventId);

        if (!event) {
            console.log('Event not found');
        } else {
            console.log('Event Details (1fe):');
            console.log(`- Title: ${event.title}`);
            console.log(`- ID: ${event._id}`);
            console.log(`- Status: ${event.status}`);
            console.log(`- Is Published: ${event.isPublished}`);
            console.log(`- Available Tickets: ${event.availableTickets}`);
        }
    } catch (error) {
        console.error('Error fetching event:', error);
    } finally {
        mongoose.disconnect();
    }
}

checkEvent();
