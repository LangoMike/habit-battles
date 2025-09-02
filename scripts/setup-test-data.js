const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nPlease add these to your .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupTestData() {
  console.log('🚀 Setting up test data for performance testing...\n');

  try {
    // Create test users
    console.log('1. Creating test users...');
    
    const { data: user1, error: user1Error } = await supabase.auth.admin.createUser({
      email: 'testuser1@example.com',
      password: 'password123',
      email_confirm: true
    });

    if (user1Error) {
      console.log('   User 1 already exists or error:', user1Error.message);
    } else {
      console.log('   ✅ Created testuser1@example.com');
    }

    const { data: user2, error: user2Error } = await supabase.auth.admin.createUser({
      email: 'testuser2@example.com',
      password: 'password123',
      email_confirm: true
    });

    if (user2Error) {
      console.log('   User 2 already exists or error:', user2Error.message);
    } else {
      console.log('   ✅ Created testuser2@example.com');
    }

    // Get user IDs
    const { data: users } = await supabase.auth.admin.listUsers();
    const testUser1 = users.users.find(u => u.email === 'testuser1@example.com');
    const testUser2 = users.users.find(u => u.email === 'testuser2@example.com');

    if (!testUser1 || !testUser2) {
      console.error('❌ Could not find test users');
      return;
    }

    // Create profiles
    console.log('\n2. Creating user profiles...');
    
    await supabase.from('profiles').upsert([
      {
        id: testUser1.id,
        username: 'TestUser1',
        avatar_url: null
      },
      {
        id: testUser2.id,
        username: 'TestUser2',
        avatar_url: null
      }
    ]);
    console.log('   ✅ Created user profiles');

    // Create test habits
    console.log('\n3. Creating test habits...');
    
    const habits = [
      {
        user_id: testUser1.id,
        name: 'Exercise',
        target_per_week: 5,
        schedule: 'daily'
      },
      {
        user_id: testUser1.id,
        name: 'Reading',
        target_per_week: 7,
        schedule: 'daily'
      },
      {
        user_id: testUser1.id,
        name: 'Meditation',
        target_per_week: 3,
        schedule: 'weekly'
      },
      {
        user_id: testUser2.id,
        name: 'Coding',
        target_per_week: 6,
        schedule: 'daily'
      },
      {
        user_id: testUser2.id,
        name: 'Walking',
        target_per_week: 4,
        schedule: 'weekly'
      }
    ];

    const { data: createdHabits, error: habitsError } = await supabase
      .from('habits')
      .upsert(habits, { onConflict: 'user_id,name' })
      .select();

    if (habitsError) {
      console.error('   ❌ Error creating habits:', habitsError.message);
    } else {
      console.log(`   ✅ Created ${createdHabits.length} test habits`);
    }

    // Create some initial check-ins for testing
    console.log('\n4. Creating initial check-ins...');
    
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    
    const checkins = [
      // User 1 - Exercise (done today and yesterday)
      {
        user_id: testUser1.id,
        habit_id: createdHabits.find(h => h.name === 'Exercise')?.id,
        checkin_date: today
      },
      {
        user_id: testUser1.id,
        habit_id: createdHabits.find(h => h.name === 'Exercise')?.id,
        checkin_date: yesterday
      },
      // User 1 - Reading (done today)
      {
        user_id: testUser1.id,
        habit_id: createdHabits.find(h => h.name === 'Reading')?.id,
        checkin_date: today
      },
      // User 2 - Coding (done today)
      {
        user_id: testUser2.id,
        habit_id: createdHabits.find(h => h.name === 'Coding')?.id,
        checkin_date: today
      }
    ].filter(c => c.habit_id); // Remove any undefined habit IDs

    if (checkins.length > 0) {
      const { data: createdCheckins, error: checkinsError } = await supabase
        .from('checkins')
        .upsert(checkins, { onConflict: 'user_id,habit_id,checkin_date' })
        .select();

      if (checkinsError) {
        console.error('   ❌ Error creating check-ins:', checkinsError.message);
      } else {
        console.log(`   ✅ Created ${createdCheckins.length} initial check-ins`);
      }
    }

    console.log('\n🎉 Test data setup complete!');
    console.log('\n📋 Test Accounts:');
    console.log('   User 1: testuser1@example.com / password123');
    console.log('   User 2: testuser2@example.com / password123');
    console.log('\n🚀 You can now run performance tests:');
    console.log('   npm run test:performance');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.error(error);
  }
}

// Run setup if called directly
if (require.main === module) {
  setupTestData();
}

module.exports = { setupTestData };
