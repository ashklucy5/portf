// lib/oss.ts
import OSS from 'ali-oss'

/**
 * Upload image directly to OSS from browser
 * Uses deterministic key: same logicalPath = automatic replace
 */
export async function uploadToOSSReplace(
  file: File,
  logicalPath: string,  // e.g., 'hero/hero-image', 'team/ceo-avatar'
  stsCredentials: {
    accessKeyId: string;
    accessKeySecret: string;
    stsToken: string;
    region: string;
    bucket: string;
    endpoint: string;
  }
): Promise<string> {
  const ext = file.type.split('/')[1] || 'jpg'
  // ✅ Same logicalPath = same OSS key = automatic replace
  const objectKey = `${logicalPath}.${ext}`
  
  const client = new OSS({
    region: stsCredentials.region,
    accessKeyId: stsCredentials.accessKeyId,
    accessKeySecret: stsCredentials.accessKeySecret,
    stsToken: stsCredentials.stsToken,
    bucket: stsCredentials.bucket,
    endpoint: stsCredentials.endpoint,
    secure: true,
  })
  
  const buffer = Buffer.from(await file.arrayBuffer())
  
  await client.put(objectKey, buffer, {
    mime: file.type,
    headers: {
      'Cache-Control': 'public, max-age=31536000' // 1 year cache
    }
  })
  
  // Build public URL
  const cleanEndpoint = stsCredentials.endpoint.replace(/^https?:\/\//, '')
  return `https://${stsCredentials.bucket}.${cleanEndpoint}/${objectKey}`
}

/**
 * Get temporary STS credentials for OSS upload
 * ⚠️ In production, fetch this from a secure backend (not hardcoded)
 */
export async function getOSSStsCredentials() {
  // ⚠️ TEMPORARY: For development only
  // In production, replace with a call to your secure backend that returns STS
  return {
    accessKeyId: process.env.NEXT_PUBLIC_OSS_ACCESS_KEY_ID,
    accessKeySecret: process.env.NEXT_PUBLIC_OSS_ACCESS_KEY_SECRET, // ⚠️ Not ideal for prod
    stsToken: '', // STS token would come from Aliyun STS service
    region: process.env.NEXT_PUBLIC_OSS_REGION,
    bucket: process.env.NEXT_PUBLIC_OSS_BUCKET,
    endpoint: process.env.NEXT_PUBLIC_OSS_ENDPOINT,
  }
}