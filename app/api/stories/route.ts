import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    // Fetch all images and videos from the 'stories' folder, sorted by upload date descending, and include context
    const result = await cloudinary.search
      .expression("folder:stories AND (resource_type:image OR resource_type:video)")
      .sort_by('created_at','desc')
      .max_results(100)
      .with_field('context')
      .execute();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 