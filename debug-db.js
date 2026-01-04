require('dotenv').config();
const { Client } = require('pg');

const commonPasswords = [
    process.env.POSTGRES_PASSWORD || 'postgres', // Try the one in env first
    'postgres',
    'password',
    'root',
    'admin',
    '123456',
    '12345678',
    '' // empty password
];

// Remove duplicates
const uniquePasswords = [...new Set(commonPasswords)];

const dbConfig = {
    user: process.env.POSTGRES_USER || process.env.DB_USER || 'postgres',
    host: process.env.POSTGRES_HOST || process.env.DB_HOST || 'localhost',
    port: process.env.POSTGRES_PORT || process.env.DB_PORT || 5432,
    database: process.env.POSTGRES_DB || process.env.DB_NAME || 'studyhour',
};

async function tryPassword(password) {
    const config = { ...dbConfig, password };
    const client = new Client(config);
    try {
        await client.connect();
        await client.end();
        return true;
    } catch (e) {
        // console.log(`Failed with password "${password}": ${e.message}`);
        return false;
    }
}

async function runChecks() {
    console.log(`--- Attemping to connect to ${dbConfig.user}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database} ---`);

    for (const password of uniquePasswords) {
        process.stdout.write(`Testing password: "${password === '' ? '(empty)' : password}" ... `);
        const success = await tryPassword(password);
        if (success) {
            console.log('✅ SUCCESS!');
            console.log(`\n🎉 FOUND WORKING PASSWORD: "${password}"`);
            console.log('Please update your .env file with this password.');
            return;
        } else {
            console.log('❌ Failed');
        }
    }

    console.log('\n❌ Could not find a working password among common defaults.');
    console.log('Please reset your Postgres password manually or check your installation.');
}

runChecks();
