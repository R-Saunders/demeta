import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink, readFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

export async function POST(request: NextRequest) {
  console.log('Video scrub API called');

  try {
    const formData = await request.formData();
    console.log('FormData received');

    const file = formData.get('file') as File;
    const fieldsToScrub = formData.get('fieldsToScrub') as string;

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

    console.log('Converting file to buffer...');
    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    console.log('Buffer created, size:', buffer.length);

    // Create temporary file
    const tempFilePath = join(tmpdir(), `video-${Date.now()}-${file.name}`);
    console.log('Temp file path:', tempFilePath);

    try {
      console.log('Writing file to temp directory...');
      // Write the file to temp directory
      await writeFile(tempFilePath, buffer);
      console.log('File written to temp directory');

      console.log('Reading file back...');
      // For now, we'll just return the original file
      // TODO: Implement proper video metadata scrubbing
      const fileBuffer = await readFile(tempFilePath);
      console.log('File read back, size:', fileBuffer.length);

      console.log('Cleaning up temp file...');
      // Clean up temp file
      await unlink(tempFilePath);
      console.log('Temp file cleaned up');

      console.log('Returning file response...');
      // Return the file (currently unchanged, but processed through server)
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': file.type,
          'Content-Disposition': `attachment; filename="scrubbed-${file.name}"`,
        },
      });
    } catch (error) {
      console.error('Error in file processing:', error);
      // Clean up temp file if it exists
      try {
        await unlink(tempFilePath);
        console.log('Temp file cleaned up after error');
      } catch (cleanupError) {
        console.error('Error cleaning up temp file:', cleanupError);
      }

      throw error;
    }
  } catch (error) {
    console.error('Error processing video file:', error);
    return NextResponse.json(
      {
        error: 'Failed to process video file',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
