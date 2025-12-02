/**
 * Test script to verify OpenAI integration
 */

import 'dotenv/config';
import { OmniDev } from './src/omnidev.js';
import { ConfigLoader } from './src/config.js';

async function testOpenAI() {
  console.log('🧪 Testing OpenAI Integration...\n');

  try {
    // Load config from environment
    const envConfig = ConfigLoader.fromEnv();
    console.log('✅ Configuration loaded from .env');
    console.log(`   Provider: ${envConfig.provider?.name}`);
    console.log(`   Endpoint: ${envConfig.provider?.endpoint}`);
    console.log(
      `   API Key: ${envConfig.provider?.apiKey ? '***' + envConfig.provider.apiKey.slice(-4) : 'Not set'}\n`
    );

    if (!envConfig.provider) {
      throw new Error('Provider configuration not found in .env');
    }

    // Create OmniDev instance
    const omnidev = new OmniDev(envConfig as any);
    console.log('✅ OmniDev instance created\n');

    // Test chat
    console.log('📤 Sending test message to OpenAI...');
    const response = await omnidev.chat([
      {
        role: 'user',
        content: 'Say "Hello from OmniDev V3.0!" and nothing else.',
      },
    ]);

    console.log('✅ Response received:');
    console.log(`   ${response}\n`);

    console.log('🎉 OpenAI integration test PASSED!\n');
    return true;
  } catch (error) {
    console.error('❌ OpenAI integration test FAILED:');
    if (error instanceof Error) {
      console.error(`   ${error.message}`);
      if (error.stack) {
        console.error(`\nStack trace:\n${error.stack}`);
      }
    } else {
      console.error(`   ${String(error)}`);
    }
    return false;
  }
}

// Run test
testOpenAI().then((success) => {
  process.exit(success ? 0 : 1);
});
