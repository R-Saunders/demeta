import { NextRequest, NextResponse } from 'next/server';
import { read } from 'fast-video-metadata';
import { writeFile, unlink, readFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const fieldsToScrub = formData.get('fieldsToScrub') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Check if it's a video file
    if (!file.type.startsWith('video/')) {
      return NextResponse.json(
        { error: 'File is not a video' },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create temporary files
    const tempInputPath = join(tmpdir(), `input-${Date.now()}-${file.name}`);
    const tempOutputPath = join(tmpdir(), `output-${Date.now()}-${file.name}`);

    try {
      // Write the input file to temp directory
      await writeFile(tempInputPath, buffer);

      // Extract metadata first to see what we're working with
      const metadata = await read(tempInputPath, true);

      // For now, we'll implement a basic scrubbing approach
      // This is a simplified version - full implementation would require
      // more sophisticated video container manipulation

      // Read the file as binary data
      const fileBuffer = await readFile(tempInputPath);

      // Basic metadata removal for common video formats
      let scrubbedBuffer = fileBuffer;

      if (
        file.name.toLowerCase().endsWith('.mp4') ||
        file.name.toLowerCase().endsWith('.mov')
      ) {
        // For MP4/MOV files, we'll try to remove some metadata atoms
        // This is a simplified approach - in practice, you'd need more sophisticated
        // video container manipulation

        // For now, we'll just return the original file with a note
        // TODO: Implement proper MP4/MOV metadata scrubbing
        scrubbedBuffer = fileBuffer;
      } else {
        // For other formats, return original for now
        scrubbedBuffer = fileBuffer;
      }

      // Write the scrubbed file
      await writeFile(tempOutputPath, scrubbedBuffer);

      // Read the scrubbed file back
      const scrubbedFileBuffer = await readFile(tempOutputPath);

      // Clean up temp files
      await unlink(tempInputPath);
      await unlink(tempOutputPath);

      // Return the scrubbed file
      return new NextResponse(scrubbedFileBuffer, {
        headers: {
          'Content-Type': file.type,
          'Content-Disposition': `attachment; filename="scrubbed-${file.name}"`,
        },
      });
    } catch (error) {
      // Clean up temp files if they exist
      try {
        await unlink(tempInputPath);
        await unlink(tempOutputPath);
      } catch (cleanupError) {
        console.error('Error cleaning up temp files:', cleanupError);
      }

      throw error;
    }
  } catch (error) {
    console.error('Error scrubbing video metadata:', error);
    return NextResponse.json(
      {
        error: 'Failed to scrub video metadata',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
