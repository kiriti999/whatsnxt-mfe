
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function checkData() {
    try {
        console.log('Connecting to:', process.env.MONGO_URI);
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is undefined. Check .env');
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const collections = ['blogPosts', 'drafts', 'blogTutorials'];

        for (const name of collections) {
            try {
                // We use mongoose.connection.db to query directly
                const count = await mongoose.connection.db.collection(name).countDocuments();
                console.log(`Collection '${name}': ${count} documents`);

                if (count > 0) {
                    const sample = await mongoose.connection.db.collection(name).findOne({});
                    console.log(`  Sample from '${name}':`, JSON.stringify(sample, null, 2).substring(0, 200) + '...');
                }
            } catch (err) {
                console.log(`Error checking '${name}':`, err.message);
            }
        }

    } catch (error) {
        console.error('Script error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

checkData();
