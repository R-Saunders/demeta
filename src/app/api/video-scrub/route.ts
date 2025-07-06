import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink, readFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

export const maxDuration = 60; // 1 minute

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  const fieldsToScrub = formData.get('fieldsToScrub') as string;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  // Parse the fields to scrub
  let fieldsToRemove: string[] = [];
  try {
    if (fieldsToScrub) {
      fieldsToRemove = JSON.parse(fieldsToScrub);
    }
  } catch (error) {
    console.error('Error parsing fieldsToScrub:', error);
    return NextResponse.json(
      { error: 'Invalid fieldsToScrub parameter' },
      { status: 400 }
    );
  }

  const tempInputPath = join(tmpdir(), `input-${Date.now()}-${file.name}`);
  const tempOutputPath = join(tmpdir(), `output-${Date.now()}-${file.name}`);

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(tempInputPath, buffer);

    console.log(`[FFMPEG] Starting scrub for: ${file.name}`);
    console.log(`[FFMPEG] Fields to remove:`, fieldsToRemove);

    await new Promise<void>((resolve, reject) => {
      const ffmpegCommand = ffmpeg(tempInputPath);

      // If specific fields are selected, we need to be more careful
      // For now, we'll strip all metadata but log what was requested
      if (fieldsToRemove.length > 0) {
        console.log(
          `[FFMPEG] Removing specific fields: ${fieldsToRemove.join(', ')}`
        );
        // TODO: Implement selective metadata removal when FFmpeg supports it
        // For now, we strip all metadata as FFmpeg doesn't support selective removal
      }

      ffmpegCommand
        .outputOptions([
          '-c:v copy', // Copy video stream without re-encoding
          '-c:a copy', // Copy audio stream without re-encoding
          '-map_metadata -1', // Strip all metadata
        ])
        .save(tempOutputPath)
        .on('start', (commandLine) => {
          console.log(`[FFMPEG] Spawned Ffmpeg with command: ${commandLine}`);
        })
        .on('end', () => {
          console.log(
            `[FFMPEG] Scrubbing finished successfully for: ${tempOutputPath}`
          );
          resolve();
        })
        .on('error', (err, stdout, stderr) => {
          console.error('[FFMPEG] Error:', err.message);
          console.error('[FFMPEG] Stdout:', stdout);
          console.error('[FFMPEG] Stderr:', stderr);
          reject(err);
        });
    });

    const scrubbedFileBuffer = await readFile(tempOutputPath);

    return new NextResponse(scrubbedFileBuffer, {
      headers: {
        'Content-Type': file.type,
        'Content-Disposition': `attachment; filename="scrubbed-${file.name}"`,
      },
    });
  } catch (error) {
    console.error('[API] Error scrubbing video metadata:', error);
    return NextResponse.json(
      {
        error: 'Failed to scrub video metadata with ffmpeg',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  } finally {
    // Clean up both temporary files
    await unlink(tempInputPath).catch((err) =>
      console.error(
        `[CLEANUP] Failed to delete temp input file: ${tempInputPath}`,
        err
      )
    );
    await unlink(tempOutputPath).catch((err) =>
      console.error(
        `[CLEANUP] Failed to delete temp output file: ${tempOutputPath}`,
        err
      )
    );
  }
}
