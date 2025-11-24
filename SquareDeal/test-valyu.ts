import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env file
dotenv.config({ path: resolve(__dirname, '.env') });

// Map EXPO_PUBLIC_VALYU_API_KEY to VALYU_API_KEY if needed
if (process.env.EXPO_PUBLIC_VALYU_API_KEY && !process.env.VALYU_API_KEY) {
    process.env.VALYU_API_KEY = process.env.EXPO_PUBLIC_VALYU_API_KEY;
}

import { searchUnverifiedVendors } from './src/services/valyuSearch';

async function testSearch() {
    try {
        console.log('\n=== Testing Valyu Search ===');

        const result = await searchUnverifiedVendors({
            latitude: 51.5074,
            longitude: -0.1278,
            searchRadiusMiles: 5,
            problemDescription: 'plumbing repair and maintenance services'
        });

        console.log('\n=== Results ===');
        if (result) {
            console.log('Location:', result.user_location.resolved_address);
            console.log('Companies found:', result.companies.length);
            console.log('\nFirst 3 companies:');
            result.companies.slice(0, 3).forEach((company, i) => {
                console.log(`\n${i + 1}. ${company.company_name}`);
                console.log(`   Phone: ${company.phone_number || 'N/A'}`);
                console.log(`   Website: ${company.website_url || 'N/A'}`);
                console.log(`   Address: ${company.address}`);
                console.log(`   Rating: ${company.rating || 'N/A'}`);
            });
        } else {
            console.log('No results returned');
        }
    } catch (error: any) {
        console.error('\n=== Error ===');
        console.error('Error message:', error?.message);
        console.error('Stack:', error?.stack);
    }
} testSearch();
