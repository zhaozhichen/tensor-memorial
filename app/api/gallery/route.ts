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
}

interface CloudinaryResponse {
  resources: CloudinaryResource[];
  next_cursor?: string;
  total_count: number;
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
        url: result.resources[0].secure_url,
      } : null
    });

    // Transform the response to match the expected format
    const transformedResult = {
      total: result.total_count,
      next_cursor: result.next_cursor,
      resources: result.resources.map((resource: CloudinaryResource) => ({
        ...resource,
        secure_url: resource.secure_url || `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${resource.public_id}`,
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