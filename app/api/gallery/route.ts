import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const runtime = 'nodejs';

interface CloudinaryResource {
  public_id: string;
  secure_url?: string;
  resource_type?: string;
  format: string;
  version: number;
  type: string;
  created_at: string;
  bytes: number;
  width?: number;
  height?: number;
}

interface CloudinaryResponse {
  resources: CloudinaryResource[];
  next_cursor?: string;
  total_count: number;
}

function getMediaUrl(resource: CloudinaryResource): string {
  const baseUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}`;
  
  // Handle videos
  if (resource.resource_type === 'video') {
    return `${baseUrl}/video/upload/q_auto/${resource.public_id}.${resource.format}`;
  }
  
  // Handle images
  if (resource.format?.toLowerCase() === 'heic') {
    return `${baseUrl}/image/upload/f_jpg,q_auto/${resource.public_id}.jpg`;
  }
  
  return `${baseUrl}/image/upload/f_auto,q_auto/${resource.public_id}.${resource.format}`;
}

async function fetchResources(resourceType: 'image' | 'video', nextCursor?: string): Promise<CloudinaryResponse> {
  return new Promise((resolve, reject) => {
    cloudinary.api.resources({
      type: 'upload',
      max_results: 500,
      next_cursor: nextCursor,
      direction: 'desc',
      ordering: 'created_at',
      resource_type: resourceType
    }, (error, result) => {
      if (error) reject(error);
      else resolve(result as CloudinaryResponse);
    });
  });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const nextCursor = searchParams.get('next_cursor');

    console.log('Cloudinary config:', {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      hasApiKey: !!process.env.CLOUDINARY_API_KEY,
      hasApiSecret: !!process.env.CLOUDINARY_API_SECRET
    });

    // Fetch both images and videos
    const [imagesResult, videosResult] = await Promise.all([
      fetchResources('image', nextCursor || undefined),
      fetchResources('video', nextCursor || undefined)
    ]);

    // Combine and sort resources by creation date
    const allResources = [
      ...imagesResult.resources.map(r => ({ ...r, resource_type: 'image' })),
      ...videosResult.resources.map(r => ({ ...r, resource_type: 'video' }))
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    console.log('Combined resources:', {
      totalImages: imagesResult.resources.length,
      totalVideos: videosResult.resources.length,
      sampleResource: allResources[0] ? {
        public_id: allResources[0].public_id,
        resource_type: allResources[0].resource_type,
        format: allResources[0].format,
        created_at: allResources[0].created_at,
        bytes: allResources[0].bytes,
        width: allResources[0].width,
        height: allResources[0].height
      } : null
    });

    // Transform and filter the combined resources
    const transformedResult = {
      total: allResources.length,
      next_cursor: imagesResult.next_cursor || videosResult.next_cursor,
      resources: allResources
        .filter((resource: CloudinaryResource) => {
          // Filter out resources that are empty or too small
          return resource.bytes > 0 && 
                 (resource.width === undefined || resource.width > 10) &&
                 (resource.height === undefined || resource.height > 10);
        })
        .map((resource: CloudinaryResource) => ({
          ...resource,
          secure_url: getMediaUrl(resource)
        }))
    };

    return NextResponse.json(transformedResult);
  } catch (error: any) {
    console.error('Cloudinary API error:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      http_code: error.http_code
    });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 