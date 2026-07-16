const mongoose = require('mongoose');
const { Schema } = mongoose;

// Hardcoded URI from .env
const uri = "mongodb+srv://visionaryabidi_db_user:tanoli1369@cluster0.xi8oscd.mongodb.net/eventbooking?retryWrites=true&w=majority";

mongoose.connect(uri)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB', err));

const eventSchema = new Schema({}, { strict: false });
const Event = mongoose.model('Event', eventSchema);

async function checkEventDetails() {
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
            console.log(`- Available Tickets (Global): ${event.availableTickets}`);
            console.log('--------------------------------');
            console.log('Ticket Types:');
            if (event.ticketTypes && event.ticketTypes.length > 0) {
                event.ticketTypes.forEach((tt, index) => {
                    console.log(`  [${index}] Name: "${tt.name}"`);
                    console.log(`      Price: ${tt.price}`);
                    console.log(`      Quantity: ${tt.quantity}`);
                    console.log(`      Sold: ${tt.soldCount}`);
                    console.log(`      MaxPerOrder: ${tt.maxPerOrder}`);
                });
            } else {
                console.log('  No ticket types found!');
            }
        }
    } catch (error) {
        console.error('Error fetching event:', error);
    } finally {
        mongoose.disconnect();
    }
}

checkEventDetails();
