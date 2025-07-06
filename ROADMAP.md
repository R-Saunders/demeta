# Project Roadmap

This document outlines the strategic roadmap and potential future features for the Metadata Scrubber application.

## 🚀 Top Priority

- **Add Video File Support**:
  - ✅ **Basic video file detection and UI support implemented**
  - ✅ **Server-side video metadata extraction implemented**
  - ✅ **Server-side video metadata scrubbing API created**
  - 🔄 **In Progress**: Enhance video metadata scrubbing with more sophisticated container manipulation.
  - This involves handling various metadata streams (video, audio, subtitles) and complex container structures (`moov` atoms in MP4/MOV, etc.).
  - The goal is to remove data like creation date, GPS coordinates, and device information without re-encoding the video.
  - **Current Status**: Server-side processing using Next.js API routes with `fast-video-metadata` library. Basic metadata extraction and scrubbing working. Full metadata removal requires more sophisticated video container manipulation.
  - **Next Steps**: Implement advanced video container manipulation for complete metadata removal, add support for more video formats, and optimize performance for large video files.

## Medium Priority

- **Add Apple iWork Document Support**:

  - **Pages (`.pages`)**: Support for Apple's word processing documents.
  - **Numbers (`.numbers`)**: Support for Apple's spreadsheet documents.
  - **Keynote (`.key`)**: Support for Apple's presentation documents.
  - _Note: These are zipped packages similar to MS Office files, but with a different internal structure._

- **Add More Audio File Formats**:
  - **AIFF (`.aiff`, `.aif`)**: Re-attempt implementation of full read and scrub support. The previous attempt was blocked by a stubborn linter error.
  - **Apple Containers (`.m4a`)**: Add support for AAC and Apple Lossless (ALAC) files.
  - **Open Source Formats (`.ogg`, `.opus`)**: Add support for Ogg Vorbis and Opus.

## Future Ambitions & Enhancements

- **Batch Processing**: Allow users to upload and scrub multiple files at once.
- **Detailed Metadata View**: Implement an advanced view that shows all available metadata tags, not just the common ones.
- **GPS Data Visualization**: If a file contains GPS coordinates, display a small map showing the location.
- **Selective Scrubbing**: Allow users to check/uncheck individual metadata fields to remove, giving them more control.
- **Expanded File Support**:
  - **Legacy MS Office (`.xls`, `.doc`, `.ppt`)**: Re-evaluate support for older binary Office formats.
  - **Other Document Types**: Look into supporting formats like `.rtf`.
