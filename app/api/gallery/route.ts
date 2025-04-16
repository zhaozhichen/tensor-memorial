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

function getImageUrl(resource: CloudinaryResource): string {
  const baseUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/`;
  
  // For HEIC images, convert to JPEG format
  if (resource.format?.toLowerCase() === 'heic') {
    return `${baseUrl}f_jpg,q_auto/${resource.public_id}.jpg`;
  }
  
  // For other images, use auto format and quality
  return `${baseUrl}f_auto,q_auto/${resource.public_id}.${resource.format}`;
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

    // Use resources.list instead of search API
    const result = await new Promise<CloudinaryResponse>((resolve, reject) => {
      cloudinary.api.resources({
        type: 'upload',
        max_results: 500,
        next_cursor: nextCursor || undefined,
        direction: 'desc',
        ordering: 'created_at'
      }, (error, result) => {
        if (error) reject(error);
        else resolve(result as CloudinaryResponse);
      });
    });

    console.log('Cloudinary response:', {
      total: result.total_count,
      nextCursor: result.next_cursor,
      resourceCount: result.resources?.length,
      sampleResource: result.resources?.[0] ? {
        public_id: result.resources[0].public_id,
        resource_type: result.resources[0].resource_type,
        format: result.resources[0].format,
        url: result.resources[0].secure_url,
        created_at: result.resources[0].created_at,
        bytes: result.resources[0].bytes,
        width: result.resources[0].width,
        height: result.resources[0].height
      } : null
    });

    // Transform the response to match the expected format and filter out invalid resources
    const transformedResult = {
      total: result.total_count,
      next_cursor: result.next_cursor,
      resources: result.resources
        .filter((resource: CloudinaryResource) => {
          // Filter out resources that are empty or too small
          return resource.bytes > 0 && 
                 (resource.width === undefined || resource.width > 10) &&
                 (resource.height === undefined || resource.height > 10);
        })
        .map((resource: CloudinaryResource) => ({
          ...resource,
          secure_url: getImageUrl(resource),
          resource_type: 'image'
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