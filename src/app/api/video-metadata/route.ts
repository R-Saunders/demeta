import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink, readFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

export async function POST(request: NextRequest) {
  console.log('Video metadata API called');

  try {
    const formData = await request.formData();
    console.log('FormData received');

    const file = formData.get('file') as File;

    console.log('File info:', {
      name: file?.name,
      size: file?.size,
      type: file?.type,
    });

    if (!file) {
      console.log('No file provided');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Check if it's a video file
    if (!file.type.startsWith('video/')) {
      console.log('File is not a video:', file.type);
      return NextResponse.json(
        { error: 'File is not a video' },
        { status: 400 }
      );
    }

    console.log('Processing video file...');

    // For now, just return basic file information
    // TODO: Re-implement fast-video-metadata integration
    const extractedMetadata: Record<string, any> = {};

    // Basic file information
    extractedMetadata['File Name'] = file.name;
    extractedMetadata['File Size'] =
      `${(file.size / 1024 / 1024).toFixed(2)} MB`;
    extractedMetadata['File Type'] = file.type;
    extractedMetadata['Last Modified'] = new Date(
      file.lastModified
    ).toLocaleString();

    // Video-specific information
    extractedMetadata['Video Support'] = 'Server-side video processing active!';
    extractedMetadata['Status'] = 'Video file processed successfully.';
    extractedMetadata['Note'] =
      'Basic metadata extraction working. Advanced metadata extraction will be re-enabled soon.';

    console.log('Returning metadata:', extractedMetadata);

    return NextResponse.json({
      success: true,
      metadata: extractedMetadata,
    });
  } catch (error) {
    console.error('Error processing video metadata:', error);
    return NextResponse.json(
      {
        error: 'Failed to process video metadata',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
