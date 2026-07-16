const mongoose = require('mongoose');
const { Schema } = mongoose;

const uri = "mongodb+srv://visionaryabidi_db_user:tanoli1369@cluster0.xi8oscd.mongodb.net/eventbooking?retryWrites=true&w=majority";

mongoose.connect(uri)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB', err));

const eventSchema = new Schema({}, { strict: false });
const Event = mongoose.model('Event', eventSchema);

async function forceFix() {
    try {
        const eventId = '699048ce28f780051fec7200';
        // Use findOneAndUpdate to be atomic and return new doc
        const updatedEvent = await Event.findByIdAndUpdate(
            eventId,
            {
                $set: {
                    status: 'approved',
                    isPublished: true,
                    availableTickets: 300
                }
            },
            { new: true } // Return the modified document
        );

        if (!updatedEvent) {
            console.log('Event not found');
        } else {
            console.log('Force Update Successful:');
            console.log(`- ID: ${updatedEvent._id}`);
            console.log(`- Title: ${updatedEvent.title}`);
            console.log(`- Status: ${updatedEvent.status}`);
            console.log(`- Is Published: ${updatedEvent.isPublished}`);
            console.log(`- Available Tickets: ${updatedEvent.availableTickets}`);
        }
    } catch (error) {
        console.error('Error updating event:', error);
    } finally {
        mongoose.disconnect();
    }
}

forceFix();
