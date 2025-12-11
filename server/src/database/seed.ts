import pool from '../config/database';
import * as fs from 'fs';
import * as path from 'path';

async function seed() {
    const client = await pool.connect();

    try {
        console.log('🌱 Starting database seed...');

        // Read and execute schema
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf-8');
        await client.query(schema);
        console.log('✅ Schema created');

        // Create sample users
        await client.query(`
      INSERT INTO users (name, email, role) VALUES 
      ('Admin User', 'admin@busbook.com', 'admin'),
      ('John Doe', 'john@example.com', 'user'),
      ('Jane Smith', 'jane@example.com', 'user')
      ON CONFLICT (email) DO NOTHING
    `);
        console.log('✅ Users created');

        // Create sample buses
        const now = new Date();
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        const buses = [
            { name: 'Mumbai Express', startTime: tomorrow.toISOString(), totalSeats: 40 },
            { name: 'Delhi Superfast', startTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(), totalSeats: 36 },
            { name: 'Bangalore Sleeper', startTime: nextWeek.toISOString(), totalSeats: 50 }
        ];

        for (const bus of buses) {
            const busResult = await client.query(
                'INSERT INTO buses (name, start_time, total_seats) VALUES ($1, $2, $3) RETURNING id',
                [bus.name, bus.startTime, bus.totalSeats]
            );
            const busId = busResult.rows[0].id;

            // Create seats for this bus
            const seatValues = [];
            for (let i = 1; i <= bus.totalSeats; i++) {
                seatValues.push(`(${busId}, ${i}, 'AVAILABLE')`);
            }
            await client.query(
                `INSERT INTO seats (bus_id, seat_number, status) VALUES ${seatValues.join(',')}
         ON CONFLICT (bus_id, seat_number) DO NOTHING`
            );
            console.log(`✅ Bus "${bus.name}" created with ${bus.totalSeats} seats`);
        }

        console.log('🎉 Database seeded successfully!');
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

seed().catch(console.error);
