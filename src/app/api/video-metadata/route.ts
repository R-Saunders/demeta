import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { execFile } from 'child_process';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const tempFilePath = join(tmpdir(), `video-${Date.now()}-${file.name}`);

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(tempFilePath, buffer);

    // Use ExifTool to extract all metadata as JSON
    const metadata = await new Promise<any[]>((resolve, reject) => {
      execFile('exiftool', ['-json', tempFilePath], (err, stdout, stderr) => {
        if (err) {
          return reject(err);
        }
        try {
          const json = JSON.parse(stdout);
          resolve(json);
        } catch (parseErr) {
          reject(parseErr);
        }
      });
    });

    // ExifTool returns an array of objects (one per file)
    const extractedMetadata = metadata && metadata[0] ? metadata[0] : {};

    // Add basic file information if not present
    extractedMetadata['File Name'] = file.name;
    extractedMetadata['File Size'] =
      `${(file.size / 1024 / 1024).toFixed(2)} MB`;
    extractedMetadata['File Type'] = file.type;

    return NextResponse.json({
      success: true,
      metadata: extractedMetadata,
    });
  } catch (error) {
    console.error('Error processing video metadata:', error);
    return NextResponse.json(
      {
        error: 'Failed to process video metadata with ExifTool',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  } finally {
    await unlink(tempFilePath).catch((err) =>
      console.error(`Failed to delete temp file: ${tempFilePath}`, err)
    );
  }
}
