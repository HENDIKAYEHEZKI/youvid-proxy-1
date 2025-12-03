/**
 * Vercel Edge Function for M3U8/Video Proxy
 * 
 * Features:
 * - M3U8 playlist rewriting
 * - TS segment proxying
 * - CORS bypass
 * - Edge caching
 */

export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  const url = new URL(request.url)
  
  // Handle OPTIONS for CORS preflight
  if (request.method === 'OPTIONS') {
    return handleOptions()
  }
  
  // Get parameters
  const videoUrl = url.searchParams.get('url')
  const referer = url.searchParams.get('referer') || ''
  
  if (!videoUrl) {
    return new Response('Missing URL parameter', { 
      status: 400,
      headers: getCorsHeaders()
    })
  }
  
  // Validate URL
  try {
    new URL(videoUrl)
  } catch (e) {
    return new Response('Invalid URL', { 
      status: 400,
      headers: getCorsHeaders()
    })
  }
  
  try {
    // Build request headers
    const headers = new Headers({
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': '*/*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Connection': 'keep-alive',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'cross-site'
    })
    
    // Add referer
    if (referer) {
      headers.set('Referer', referer)
    } else {
      const parsedUrl = new URL(videoUrl)
      headers.set('Referer', `${parsedUrl.protocol}//${parsedUrl.host}/`)
    }
    
    // Fetch the resource
    const response = await fetch(videoUrl, {
      method: 'GET',
      headers: headers,
    })
    
    if (!response.ok) {
      return new Response(`Source returned status: ${response.status}`, {
        status: response.status,
        headers: getCorsHeaders()
      })
    }
    
    // Check if this is M3U8 playlist
    const contentType = response.headers.get('content-type') || ''
    const isM3u8 = videoUrl.includes('.m3u8') || contentType.includes('mpegurl')
    
    if (isM3u8) {
      // Read and rewrite M3U8 playlist
      const text = await response.text()
      const rewrittenPlaylist = rewriteM3u8(text, videoUrl, referer, url.origin)
      
      return new Response(rewrittenPlaylist, {
        status: 200,
        headers: {
          ...getCorsHeaders(),
          'Content-Type': 'application/vnd.apple.mpegurl',
          'Content-Length': rewrittenPlaylist.length.toString(),
          'Cache-Control': 'public, max-age=3600'
        }
      })
    } else {
      // For TS segments and other files, just proxy
      const newHeaders = new Headers(response.headers)
      
      // Add CORS headers
      Object.entries(getCorsHeaders()).forEach(([key, value]) => {
        newHeaders.set(key, value)
      })
      
      return new Response(response.body, {
        status: response.status,
        headers: newHeaders
      })
    }
    
  } catch (error) {
    return new Response(`Edge Function Error: ${error.message}`, {
      status: 500,
      headers: getCorsHeaders()
    })
  }
}

/**
 * Rewrite M3U8 playlist URLs to use edge function proxy
 */
function rewriteM3u8(content, originalUrl, referer, edgeFunctionUrl) {
  const lines = content.split('\n')
  const baseUrl = originalUrl.substring(0, originalUrl.lastIndexOf('/'))
  const parsedUrl = new URL(originalUrl)
  const protocol = parsedUrl.protocol
  const host = parsedUrl.host
  
  const rewrittenLines = lines.map(line => {
    line = line.trim()
    
    // Keep comments and empty lines
    if (!line || line.startsWith('#')) {
      return line
    }
    
    // This is a URL line
    let segmentUrl = line
    
    // Convert relative URL to absolute
    if (!segmentUrl.startsWith('http')) {
      if (segmentUrl.startsWith('/')) {
        segmentUrl = `${protocol}//${host}${segmentUrl}`
      } else {
        segmentUrl = `${baseUrl}/${segmentUrl}`
      }
    }
    
    // Rewrite to use edge function proxy
    const proxiedUrl = `${edgeFunctionUrl}/api/proxy?url=` + encodeURIComponent(segmentUrl)
    if (referer) {
      return proxiedUrl + '&referer=' + encodeURIComponent(referer)
    }
    return proxiedUrl
  })
  
  return rewrittenLines.join('\n')
}

/**
 * Get CORS headers
 */
function getCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Expose-Headers': 'Content-Length, Content-Range, Accept-Ranges',
    'Access-Control-Max-Age': '86400'
  }
}

/**
 * Handle OPTIONS request
 */
function handleOptions() {
  return new Response(null, {
    status: 200,
    headers: getCorsHeaders()
  })
}
