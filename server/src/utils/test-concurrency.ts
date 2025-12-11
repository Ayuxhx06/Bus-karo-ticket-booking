import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:5000/api';
const BUS_ID = 1; // Assumes you have a bus with ID 1
const SEAT_IDS = [1, 2]; // Try to book the same seats concurrently

async function bookSeats(requestId: number) {
    try {
        const response = await axios.post(`${API_URL}/bookings`, {
            userId: requestId,
            busId: BUS_ID,
            seatIds: SEAT_IDS,
        });
        console.log(`✅ Request ${requestId} SUCCESS:`, response.data);
        return { success: true, requestId };
    } catch (error: any) {
        if (error.response?.status === 409) {
            console.log(`⚠️  Request ${requestId} CONFLICT: ${error.response.data.error}`);
        } else {
            console.log(`❌ Request ${requestId} ERROR:`, error.response?.data?.error || error.message);
        }
        return { success: false, requestId, error: error.response?.data?.error };
    }
}

async function runConcurrencyTest() {
    console.log('🚀 Starting Concurrency Test...\n');
    console.log(`Attempting to book seats ${SEAT_IDS.join(', ')} from ${BUS_ID} with 10 concurrent requests\n`);

    // Fire 10 simultaneous requests
    const requests = Array.from({ length: 10 }, (_, i) => bookSeats(i + 1));

    const results = await Promise.all(requests);

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    console.log('\n=== Test Results ===');
    console.log(`✅ Successful bookings: ${successCount}`);
    console.log(`❌ Failed bookings (expected): ${failureCount}`);

    if (successCount === 1) {
        console.log('\n🎉 PASS: Only one booking succeeded (concurrency control working!)');
    } else {
        console.log('\n💥 FAIL: Multiple bookings succeeded (overbooking detected!)');
    }
}

runConcurrencyTest().catch(console.error);
