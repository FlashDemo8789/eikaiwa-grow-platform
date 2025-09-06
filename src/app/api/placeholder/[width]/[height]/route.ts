import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ width: string; height: string }> }
) {
  const { width, height } = await params
  
  const w = parseInt(width) || 400
  const h = parseInt(height) || 300
  
  // Create an SVG placeholder image
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <rect width="${w}" height="${h}" fill="#E5E7EB"/>
    <text x="50%" y="50%" font-family="system-ui, sans-serif" font-size="20" fill="#6B7280" text-anchor="middle" dy=".35em">${w} × ${h}</text>
  </svg>`
  
  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}