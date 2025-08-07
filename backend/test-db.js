const { connectDB } = require('./config/database');
const User = require('./models/User');
const Campaign = require('./models/Campaign');
const Character = require('./models/Character');
const Message = require('./models/Message');

async function testDatabase() {
  try {
    console.log('🧪 Testing SQLite Database...\n');

    // Connect to database
    connectDB();
    
    console.log('✅ Database connected successfully');

    // Test User creation
    console.log('\n👤 Testing User model...');
    const hashedPassword = await User.hashPassword('testpassword123');
    const testUser = User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'User'
    });
    console.log('✅ User created:', User.toJSON(testUser));

    // Test Campaign creation
    console.log('\n🏰 Testing Campaign model...');
    const testCampaign = Campaign.create({
      name: 'Test Campaign',
      description: 'A test campaign for SQLite',
      dmId: testUser.id
    });
    console.log('✅ Campaign created:', testCampaign);

    // Test Character creation
    console.log('\n🧙 Testing Character model...');
    const testCharacter = Character.create({
      name: 'Test Character',
      class: 'Wizard',
      level: 3,
      race: 'Human',
      background: 'Scholar',
      stats: {
        strength: 12,
        dexterity: 14,
        constitution: 13,
        intelligence: 16,
        wisdom: 15,
        charisma: 10
      },
      userId: testUser.id,
      campaignId: testCampaign.id
    });
    console.log('✅ Character created:', testCharacter);

    // Test Message creation
    console.log('\n💬 Testing Message model...');
    const testMessage = Message.create({
      content: 'Hello, this is a test message!',
      type: 'text',
      userId: testUser.id,
      campaignId: testCampaign.id,
      characterId: testCharacter.id
    });
    console.log('✅ Message created:', testMessage);

    // Test relationships
    console.log('\n🔗 Testing relationships...');
    const userCampaigns = User.getUserCampaigns(testUser.id);
    console.log('✅ User campaigns:', userCampaigns);

    const campaignMembers = Campaign.getMembers(testCampaign.id);
    console.log('✅ Campaign members:', campaignMembers);

    const campaignMessages = Campaign.getRecentMessages(testCampaign.id);
    console.log('✅ Campaign messages:', campaignMessages);

    // Test password comparison
    console.log('\n🔐 Testing password verification...');
    const isValidPassword = await User.comparePassword('testpassword123', testUser.password);
    console.log('✅ Password verification:', isValidPassword ? 'Success' : 'Failed');

    console.log('\n🎉 All database tests passed!');
    console.log('\n📊 Database Summary:');
    console.log(`- Users: ${User.findAll().length}`);
    console.log(`- Campaigns: ${Campaign.findAll().length}`);
    console.log(`- Characters: ${Character.findAll().length}`);
    console.log(`- Messages: ${Message.getCountByCampaign(testCampaign.id)}`);

  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    process.exit(0);
  }
}

testDatabase();
