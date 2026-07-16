const mongoose = require('mongoose');
const { Schema } = mongoose;

// Hardcoded URI from .env
const uri = "mongodb+srv://visionaryabidi_db_user:tanoli1369@cluster0.xi8oscd.mongodb.net/eventbooking?retryWrites=true&w=majority";

mongoose.connect(uri)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB', err));

const eventSchema = new Schema({}, { strict: false });
const Event = mongoose.model('Event', eventSchema);

async function fixEvent() {
    try {
        const eventId = '699048ce28f780051fec7200';
        const event = await Event.findById(eventId);

        if (!event) {
            console.log('Event not found');
            return;
        }

        console.log('Current Status:', event.status);
        console.log('Current isPublished:', event.isPublished);
        console.log('Current availableTickets:', event.availableTickets);
        console.log('Current date:', event.eventDate);

        // Update fields to make it bookable
        event.status = 'approved';
        event.isPublished = true;

        // Ensure future date if it's in the past (just in case, though logic doesn't strictly check date in controller snippet seen, it might elsewhere)
        // Actually ticket controller didn't check date, but let's be safe.
        // event.eventDate = new Date(Date.now() + 86400000); // Tomorrow

        if (event.availableTickets <= 0) {
            event.availableTickets = 100;
            event.totalTickets = 100;
            event.isSoldOut = false;
        }

        const updated = await event.save();
        console.log('--------------------------------');
        console.log('Event UPDATED to be bookable:');
        console.log('New Status:', updated.status);
        console.log('New isPublished:', updated.isPublished);
        console.log('New matches requirements: APPROVED and PUBLISHED');

    } catch (error) {
        console.error('Error updating event:', error);
    } finally {
        mongoose.disconnect();
    }
}

fixEvent();
