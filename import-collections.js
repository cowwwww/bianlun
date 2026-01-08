#!/usr/bin/env node

/**
 * PocketBase Collections Import Script
 * This script imports collections from a JSON file using the PocketBase API
 */

const fs = require('fs');
const path = require('path');

// Configuration
const POCKETBASE_URL = process.env.POCKETBASE_URL || 'http://127.0.0.1:8090';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'password123';
const COLLECTIONS_FILE = process.argv[2] || 'collections_export.json';

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

async function makeRequest(endpoint, options = {}) {
    const url = `${POCKETBASE_URL}${endpoint}`;
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    };

    const finalOptions = { ...defaultOptions, ...options };

    try {
        const response = await fetch(url, finalOptions);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${data.message || response.statusText}`);
        }

        return data;
    } catch (error) {
        log(`Request failed: ${error.message}`, 'red');
        throw error;
    }
}

async function authenticate() {
    log('Authenticating with PocketBase...', 'blue');

    try {
        const response = await makeRequest('/api/admins/auth-with-password', {
            method: 'POST',
            body: JSON.stringify({
                identity: ADMIN_EMAIL,
                password: ADMIN_PASSWORD
            })
        });

        log('Authentication successful!', 'green');
        return response.token;
    } catch (error) {
        log(`Authentication failed: ${error.message}`, 'red');
        log('Please make sure:', 'yellow');
        log('1. PocketBase is running', 'yellow');
        log('2. Admin credentials are correct', 'yellow');
        log('3. Set ADMIN_EMAIL and ADMIN_PASSWORD environment variables if needed', 'yellow');
        process.exit(1);
    }
}

async function importCollections(token, collectionsFile) {
    log(`\nImporting collections from ${collectionsFile}...`, 'blue');

    // Read the collections file
    const filePath = path.join(__dirname, 'pocketbase', collectionsFile);
    if (!fs.existsSync(filePath)) {
        log(`File not found: ${filePath}`, 'red');
        process.exit(1);
    }

    let collections;
    try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        collections = JSON.parse(fileContent);
    } catch (error) {
        log(`Failed to read/parse collections file: ${error.message}`, 'red');
        process.exit(1);
    }

    if (!Array.isArray(collections)) {
        log('Collections file must contain an array of collection objects', 'red');
        process.exit(1);
    }

    log(`Found ${collections.length} collections to import`, 'cyan');

    // Import collections one by one
    const results = {
        success: [],
        failed: []
    };

    for (const collection of collections) {
        try {
            log(`\nImporting collection: ${collection.name}`, 'magenta');

            // Check if collection already exists
            let existingCollection = null;
            try {
                existingCollection = await makeRequest(`/api/collections/${collection.name}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
            } catch (error) {
                // Collection doesn't exist, which is fine
            }

            if (existingCollection) {
                log(`Collection '${collection.name}' already exists, updating...`, 'yellow');

                // For updates, create a copy without the 'id' field
                const updateData = { ...collection };
                delete updateData.id;

                // Update existing collection
                await makeRequest(`/api/collections/${collection.name}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(updateData)
                });
            } else {
                // For new collections, also remove the 'id' field to let PocketBase generate it
                const createData = { ...collection };
                delete createData.id;

                // Create new collection
                await makeRequest('/api/collections', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(createData)
                });
            }

            results.success.push(collection.name);
            log(`✅ Successfully imported: ${collection.name}`, 'green');

        } catch (error) {
            results.failed.push({ name: collection.name, error: error.message });
            log(`❌ Failed to import ${collection.name}: ${error.message}`, 'red');
        }
    }

    // Summary
    log('\n' + '='.repeat(50), 'cyan');
    log('IMPORT SUMMARY', 'cyan');
    log('='.repeat(50), 'cyan');

    if (results.success.length > 0) {
        log(`✅ Successfully imported: ${results.success.length} collections`, 'green');
        results.success.forEach(name => log(`   - ${name}`, 'green'));
    }

    if (results.failed.length > 0) {
        log(`❌ Failed to import: ${results.failed.length} collections`, 'red');
        results.failed.forEach(item => {
            log(`   - ${item.name}: ${item.error}`, 'red');
        });
    }

    return results;
}

async function main() {
    log('🚀 PocketBase Collections Import Tool', 'cyan');
    log('=====================================', 'cyan');

    if (!COLLECTIONS_FILE) {
        log('Usage: node import-collections.js [collections_file.json]', 'yellow');
        log('Default file: collections_export.json', 'yellow');
        process.exit(1);
    }

    try {
        const token = await authenticate();
        const results = await importCollections(token, COLLECTIONS_FILE);

        if (results.failed.length === 0) {
            log('\n🎉 All collections imported successfully!', 'green');
            process.exit(0);
        } else {
            log(`\n⚠️  Import completed with ${results.failed.length} errors`, 'yellow');
            process.exit(1);
        }

    } catch (error) {
        log(`\n💥 Script failed: ${error.message}`, 'red');
        process.exit(1);
    }
}

// Handle command line execution
if (require.main === module) {
    main().catch(error => {
        console.error('Unhandled error:', error);
        process.exit(1);
    });
}

module.exports = { importCollections, authenticate, makeRequest };
