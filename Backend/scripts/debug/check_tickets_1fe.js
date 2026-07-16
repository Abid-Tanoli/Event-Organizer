const mongoose = require('mongoose');
const { Schema } = mongoose;

const uri = "mongodb+srv://visionaryabidi_db_user:tanoli1369@cluster0.xi8oscd.mongodb.net/eventbooking?retryWrites=true&w=majority";

mongoose.connect(uri)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB', err));

const eventSchema = new Schema({}, { strict: false });
const Event = mongoose.model('Event', eventSchema);

async function checkTicketTypes() {
    try {
        const eventId = '699048ce28f780051fec71fe';
        const event = await Event.findById(eventId);

        if (!event) {
            console.log('Event not found');
        } else {
            console.log(`Event: "${event.title}"`);
            console.log('Ticket Types:');
            if (event.ticketTypes && event.ticketTypes.length > 0) {
                event.ticketTypes.forEach(tt => {
                    console.log(`- Name: "${tt.name}", Qty: ${tt.quantity}, Price: ${tt.price}`);
                });
            } else {
                console.log('No ticket types found');
            }
        }
    } catch (error) {
        console.error('Error fetching event:', error);
    } finally {
        mongoose.disconnect();
    }
}

checkTicketTypes();
