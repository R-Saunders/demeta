import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink, readFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { execFile } from 'child_process';

export const maxDuration = 60; // 1 minute

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const tempInputPath = join(tmpdir(), `input-${Date.now()}-${file.name}`);
  const tempOutputPath = join(tmpdir(), `output-${Date.now()}-${file.name}`);

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(tempInputPath, buffer);

    // Use ExifTool to remove all metadata
    await new Promise<void>((resolve, reject) => {
      execFile(
        'exiftool',
        ['-all=', '-o', tempOutputPath, tempInputPath],
        (err, stdout, stderr) => {
          if (err) {
            // TODO: Replace with production logger if needed
            // console.error('[ExifTool] Error:', err, stderr);
            return reject(err);
          }
          resolve();
        }
      );
    });

    const scrubbedFileBuffer = await readFile(tempOutputPath);

    return new NextResponse(scrubbedFileBuffer, {
      headers: {
        'Content-Type': file.type,
        'Content-Disposition': `attachment; filename="scrubbed-${file.name}"`,
      },
    });
  } catch (error) {
    // TODO: Replace with production logger if needed
    // console.error('[API] Error scrubbing video metadata:', error);
    return NextResponse.json(
      {
        error: 'Failed to scrub video metadata with ExifTool',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  } finally {
    // Clean up both temporary files
    await unlink(tempInputPath).catch(() => {
      // TODO: Replace with production logger if needed
    });
    await unlink(tempOutputPath).catch(() => {
      // TODO: Replace with production logger if needed
    });
  }
}
