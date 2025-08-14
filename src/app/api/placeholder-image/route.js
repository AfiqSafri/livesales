export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const text = searchParams.get('text') || 'No Image';
    const size = searchParams.get('size') || '300x300';
    
    // Parse size
    const [width, height] = size.split('x').map(Number);
    const w = width || 300;
    const h = height || 300;
    
    // Create a simple SVG placeholder
    const svg = `
      <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <rect x="0" y="0" width="100%" height="100%" fill="url(#gradient)"/>
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#e5e7eb;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#d1d5db;stop-opacity:1" />
          </linearGradient>
        </defs>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${Math.min(w, h) / 10}" 
              fill="#6b7280" text-anchor="middle" dominant-baseline="middle">
          ${text}
        </text>
        <text x="50%" y="70%" font-family="Arial, sans-serif" font-size="${Math.min(w, h) / 20}" 
              fill="#9ca3af" text-anchor="middle" dominant-baseline="middle">
          Placeholder
        </text>
      </svg>
    `;
    
    return new Response(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (error) {
    console.error('Placeholder image error:', error);
    
    // Fallback to a simple error SVG
    const errorSvg = `
      <svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#fee2e2"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" 
              fill="#dc2626" text-anchor="middle" dominant-baseline="middle">
          Error Loading Image
        </text>
      </svg>
    `;
    
    return new Response(errorSvg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'no-cache',
      },
    });
  }
}
