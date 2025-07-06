import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import ffprobeInstaller from '@ffprobe-installer/ffprobe';

// Set the path for the ffmpeg and ffprobe binaries
ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg.setFfprobePath(ffprobeInstaller.path);

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

    const metadata = await new Promise<ffmpeg.FfprobeData>(
      (resolve, reject) => {
        ffmpeg.ffprobe(tempFilePath, (err, data) => {
          if (err) {
            return reject(err);
          }
          if (!data || !data.format) {
            return reject(new Error('No metadata found in video file'));
          }
          return resolve(data);
        });
      }
    );

    const extractedMetadata: Record<string, any> = {};

    if (metadata.format && metadata.format.tags) {
      for (const [key, value] of Object.entries(metadata.format.tags)) {
        const formattedKey = key
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase());
        extractedMetadata[formattedKey] = value;
      }
    }

    if (metadata.streams && metadata.streams.length > 0) {
      metadata.streams.forEach((stream, index) => {
        const prefix = stream.codec_type === 'video' ? 'Video' : 'Audio';
        if (stream.codec_name)
          extractedMetadata[`${prefix} Codec`] = stream.codec_name;

        if (stream.codec_type === 'video') {
          if (stream.width && stream.height)
            extractedMetadata[`${prefix} Dimensions`] =
              `${stream.width}x${stream.height}`;
          if (stream.r_frame_rate)
            extractedMetadata[`${prefix} Frame Rate`] = stream.r_frame_rate;
          if (stream.bit_rate)
            extractedMetadata[`${prefix} Bitrate`] =
              `${Math.round(parseInt(String(stream.bit_rate)) / 1000)} kbps`;
        }
        if (stream.codec_type === 'audio') {
          if (stream.sample_rate)
            extractedMetadata[`${prefix} Sample Rate`] =
              `${parseInt(String(stream.sample_rate)) / 1000} kHz`;
          if (stream.channels)
            extractedMetadata[`${prefix} Channels`] = stream.channels;
          if (stream.channel_layout)
            extractedMetadata[`${prefix} Channel Layout`] =
              stream.channel_layout;
          if (stream.bit_rate)
            extractedMetadata[`${prefix} Bitrate`] =
              `${Math.round(parseInt(String(stream.bit_rate)) / 1000)} kbps`;
        }
      });
    }

    if (metadata.format.duration) {
      extractedMetadata['Duration'] = new Date(
        parseFloat(String(metadata.format.duration)) * 1000
      )
        .toISOString()
        .substr(11, 8);
    }

    // Add basic file information
    extractedMetadata['File Name'] = file.name;
    extractedMetadata['File Size'] =
      `${(file.size / 1024 / 1024).toFixed(2)} MB`;
    extractedMetadata['File Type'] = file.type;

    if (Object.keys(extractedMetadata).length <= 3) {
      // Only basic info
      extractedMetadata['Status'] =
        'No readable metadata found in this video file.';
    }

    return NextResponse.json({
      success: true,
      metadata: extractedMetadata,
    });
  } catch (error) {
    console.error('Error processing video metadata:', error);
    return NextResponse.json(
      {
        error: 'Failed to process video metadata with ffprobe',
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
