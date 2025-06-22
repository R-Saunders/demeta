import { NextRequest, NextResponse } from 'next/server';
import { read } from 'fast-video-metadata';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

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

    // Create temporary file
    const tempFilePath = join(tmpdir(), `video-${Date.now()}-${file.name}`);

    try {
      // Write the file to temp directory
      await writeFile(tempFilePath, buffer);

      // Extract metadata using fast-video-metadata
      const metadata = await read(tempFilePath, true); // true for extended metadata

      // Clean up temp file
      await unlink(tempFilePath);

      // Process the metadata
      const processedMetadata: Record<string, any> = {};

      if (metadata && Array.isArray(metadata)) {
        // Full atom tree - extract useful information
        const moovAtom = metadata.find((atom) => atom.type === 'moov');
        if (moovAtom && moovAtom.atoms) {
          const mvhdAtom = moovAtom.atoms.find((atom) => atom.type === 'mvhd');
          if (mvhdAtom && mvhdAtom.content) {
            if (mvhdAtom.content.creationTime) {
              processedMetadata['Creation Time'] =
                mvhdAtom.content.creationTime.toLocaleString();
            }
            if (mvhdAtom.content.modificationTime) {
              processedMetadata['Modification Time'] =
                mvhdAtom.content.modificationTime.toLocaleString();
            }
          }
        }

        // Look for other useful atoms
        processedMetadata['Total Atoms'] = metadata.length;
        processedMetadata['Atom Types'] = metadata
          .map((atom) => atom.type)
          .join(', ');
      } else if (
        metadata &&
        typeof metadata === 'object' &&
        'creationTime' in metadata
      ) {
        // Essentials object
        if (metadata.creationTime) {
          processedMetadata['Creation Time'] =
            metadata.creationTime.toLocaleString();
        }
        if (metadata.modificationTime) {
          processedMetadata['Modification Time'] =
            metadata.modificationTime.toLocaleString();
        }
        if (metadata.meta) {
          Object.entries(metadata.meta).forEach(([key, value]) => {
            processedMetadata[key] = value;
          });
        }
      }

      // Add basic file info
      processedMetadata['File Name'] = file.name;
      processedMetadata['File Size'] =
        `${(file.size / 1024 / 1024).toFixed(2)} MB`;
      processedMetadata['File Type'] = file.type;
      processedMetadata['Last Modified'] = new Date(
        file.lastModified
      ).toLocaleString();

      return NextResponse.json({
        success: true,
        metadata: processedMetadata,
        rawMetadata: metadata,
      });
    } catch (error) {
      // Clean up temp file if it exists
      try {
        await unlink(tempFilePath);
      } catch (cleanupError) {
        console.error('Error cleaning up temp file:', cleanupError);
      }

      throw error;
    }
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
