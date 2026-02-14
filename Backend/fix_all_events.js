const mongoose = require('mongoose');
const { Schema } = mongoose;

const uri = "mongodb+srv://visionaryabidi_db_user:tanoli1369@cluster0.xi8oscd.mongodb.net/eventbooking?retryWrites=true&w=majority";

mongoose.connect(uri)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB', err));

const eventSchema = new Schema({}, { strict: false });
const Event = mongoose.model('Event', eventSchema);

async function fixAllEvents() {
    try {
        const result = await Event.updateMany(
            {}, // Filter: Match ALL documents
            {
                $set: {
                    status: 'approved',
                    isPublished: true
                }
            }
        );

        console.log('Mass Update Complete:');
        console.log(`- Matched: ${result.matchedCount}`);
        console.log(`- Modified: ${result.modifiedCount}`);

        // Quick verification list
        const events = await Event.find().select('title status isPublished');
        console.log('Current Event States:');
        events.forEach(e => {
            console.log(`- "${e.title}": ${e.status} | Pub: ${e.isPublished}`);
        });

    } catch (error) {
        console.error('Error updating events:', error);
    } finally {
        mongoose.disconnect();
    }
}

fixAllEvents();
