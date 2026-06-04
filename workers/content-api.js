// workers/content-api.js
// Cloudflare Worker API for bilingual content management

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // 🔐 CORS headers for browser requests
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    // 🔐 Simple auth check for protected routes
    const authHeader = request.headers.get('Authorization');
    const isAdmin = authHeader === `Bearer ${env.ADMIN_TOKEN}`;
    
    // ─────────────────────────────────────────────────────────────
    // GET /content?locale=en&section=hero → Fetch content from D1
    // ─────────────────────────────────────────────────────────────
    if (path === '/content' && request.method === 'GET') {
      const locale = url.searchParams.get('locale') || 'en';
      const section = url.searchParams.get('section'); // optional filter
      
      // Validate locale
      if (!['en', 'zh'].includes(locale)) {
        return new Response(JSON.stringify({ error: 'Invalid locale' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      try {
        // Build query
        let query = 'SELECT section, key_path, value FROM content WHERE locale = ?';
        let params = [locale];
        
        if (section) {
          query += ' AND section = ?';
          params.push(section);
        }
        
        // Execute query
        const { results } = await env.DB.prepare(query).bind(...params).all();
        
        // Transform flat results into nested object
        const content = {};
for (const row of results) {
  // ✅ Group by section first to avoid key collisions
  content[row.section] = content[row.section] || {};
  const keys = row.key_path.split('.');
  let target = content[row.section];
  for (let i = 0; i < keys.length - 1; i++) {
    target[keys[i]] = target[keys[i]] || {};
    target = target[keys[i]];
  }
  target[keys[keys.length - 1]] = row.value;
}
        
        return new Response(JSON.stringify(content), {
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=300' // 5 min cache
          }
        });
        
      } catch (error) {
        console.error('D1 query error:', error);
        return new Response(JSON.stringify({ error: 'Database error' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }
    
    // ─────────────────────────────────────────────────────────────
    // POST /content → Save content to D1 (admin only)
    // ─────────────────────────────────────────────────────────────
    if (path === '/content' && request.method === 'POST') {
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      try {
        const { locale, section, updates } = await request.json();
        
        // Validate input
        if (!locale || !section || !updates) {
          return new Response(JSON.stringify({ error: 'Missing required fields' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        
        if (!['en', 'zh'].includes(locale)) {
          return new Response(JSON.stringify({ error: 'Invalid locale' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        
        // Prepare statement for upsert
        const stmt = env.DB.prepare(`
          INSERT INTO content (locale, section, key_path, value, updated_at)
          VALUES (?, ?, ?, ?, strftime('%s', 'now'))
          ON CONFLICT(locale, section, key_path) 
          DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
        `);
        
        // Execute updates in batch
        const promises = [];
        for (const [keyPath, value] of Object.entries(updates)) {
          promises.push(stmt.bind(locale, section, keyPath, String(value)).run());
        }
        
        await Promise.all(promises);
        
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
        
      } catch (error) {
        console.error('Save error:', error);
        return new Response(JSON.stringify({ error: 'Failed to save content' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }
        // ─────────────────────────────────────────────────────────────
    // POST /content/batch → Save BOTH en & zh in one call (admin only)
    // ─────────────────────────────────────────────────────────────
    if (path === '/content/batch' && request.method === 'POST') {
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      try {
        const { section, updates } = await request.json();
        // updates = { en: { 'tagline': 'New EN' }, zh: { 'tagline': '新的中文' } }
        
        // Validate input
        if (!section || !updates || !updates.en || !updates.zh) {
          return new Response(JSON.stringify({ error: 'Missing required fields' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        
        // Prepare statement for upsert
        const stmt = env.DB.prepare(`
          INSERT INTO content (locale, section, key_path, value, updated_at)
          VALUES (?, ?, ?, ?, strftime('%s', 'now'))
          ON CONFLICT(locale, section, key_path) 
          DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
        `);
        
        const promises = [];
        
        // Save English updates
        for (const [keyPath, value] of Object.entries(updates.en)) {
          promises.push(stmt.bind('en', section, keyPath, String(value)).run());
        }
        
        // Save Chinese updates
        for (const [keyPath, value] of Object.entries(updates.zh)) {
          promises.push(stmt.bind('zh', section, keyPath, String(value)).run());
        }
        
        await Promise.all(promises);
        
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
        
      } catch (error) {
        console.error('Batch save error:', error);
        return new Response(JSON.stringify({ error: 'Failed to save content' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }
    // ─────────────────────────────────────────────────────────────
    // POST /upload → Upload image to R2
    // ─────────────────────────────────────────────────────────────
    if (path === '/upload' && request.method === 'POST') {
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      try {
        const formData = await request.formData();
        const file = formData.get('file');
        const folder = formData.get('folder') || 'uploads';
        
        // Validate file
        if (!file || !file.type?.startsWith('image/')) {
          return new Response(JSON.stringify({ error: 'Invalid file type' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        
        // Generate unique filename
        const ext = file.name.split('.').pop();
        const timestamp = Date.now();
        const random = Math.random().toString(36).slice(2, 8);
        const filename = `${folder}/${timestamp}-${random}.${ext}`;
        
        // Upload to R2
        await env.IMAGES.put(filename, file.stream(), {
          httpMetadata: { 
            contentType: file.type,
            cacheControl: 'public, max-age=31536000' // 1 year cache
          }
        });
        
        // Return public URL
        const publicUrl = `${env.R2_PUBLIC_URL}/${filename}`;
        
        return new Response(JSON.stringify({ 
          success: true, 
          url: publicUrl,
          filename: filename
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
        
      } catch (error) {
        console.error('R2 upload error:', error);
        return new Response(JSON.stringify({ error: 'Upload failed' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }
    
    // ─────────────────────────────────────────────────────────────
    // Fallback: 404 for unknown routes
    // ─────────────────────────────────────────────────────────────
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  },
};