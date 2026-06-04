// test-oss.ts
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' }); // ✅ Loads your .env.local file

import OSS from 'ali-oss'

const config = {
  region: process.env.ALIYUN_OSS_REGION || 'cn-guangzhou',
  accessKeyId: process.env.ALIYUN_OSS_ACCESS_KEY_ID!,
  accessKeySecret: process.env.ALIYUN_OSS_ACCESS_KEY_SECRET!,
  bucket: process.env.ALIYUN_OSS_BUCKET!,
  // Ensure endpoint doesn't have https:// prefix for the SDK config
  endpoint: process.env.ALIYUN_OSS_ENDPOINT?.replace(/^https?:\/\//, ''),
  secure: true,
}

const client = new OSS(config)

async function testOSS() {
  console.log('🔌 Testing OSS connection...')
  
  try {
    // 1. Test connection: put a small text file
    const testKey = 'test/connection-check.txt'
    await client.put(testKey, Buffer.from('OSS connection successful!'), {
      // ✅ FIX: Use 'mime' instead of 'contentType'
      mime: 'text/plain',
    })
    console.log('✅ Connection test passed')
    
    // 2. Test REPLACE workflow: upload same key twice
    const replaceKey = 'hero/hero-image.jpg'
    const publicUrl = `https://${config.bucket}.${config.endpoint}/${replaceKey}`
    
    // First upload
    await client.put(replaceKey, Buffer.from('First version'), {
      // ✅ FIX: Use 'mime'
      mime: 'image/jpeg',
      headers: { 'Cache-Control': 'public, max-age=31536000' }
    })
    console.log(`📤 First upload: ${publicUrl}`)
    
    // Wait a moment
    await new Promise(r => setTimeout(r, 1000))
    
    // Second upload (REPLACES first)
    await client.put(replaceKey, Buffer.from('Second version - REPLACED!'), {
      // ✅ FIX: Use 'mime'
      mime: 'image/jpeg',
      headers: { 'Cache-Control': 'public, max-age=31536000' }
    })
    console.log(`🔄 Replaced with new version: ${publicUrl}`)
    
    // 3. Verify by getting URL
    console.log(`🔗 Public URL (open to verify): ${publicUrl}`)
    
    // 4. Cleanup test files (optional)
    // await client.delete(testKey)
    // await client.delete(replaceKey)
    
    console.log('✅ OSS replace workflow test PASSED')
    
  } catch (error) {
    console.error('❌ OSS test failed:', error)
    process.exit(1)
  }
}

testOSS()