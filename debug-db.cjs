
const mongoose = require('mongoose');
require('dotenv').config({ path: 'apps/whatsnxt-bff/.env' });

async function checkData() {
    try {
        console.log('Connecting to:', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const collections = ['blogPosts', 'drafts', 'blogTutorials', 'users'];

        for (const name of collections) {
            try {
                // We use mongoose.connection.db to query directly, bypassing schema validation
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
