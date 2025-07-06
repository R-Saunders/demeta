# Project Roadmap

This document outlines the strategic roadmap and potential future features for the Metadata Scrubber application.

## 🚀 Top Priority

- **Add Video File Support**:
  - ✅ **Basic video file detection and UI support implemented**
  - ✅ **Server-side video metadata extraction implemented**
  - ✅ **Server-side video metadata scrubbing API created**
  - 🔄 **In Progress**: Upgrade video metadata support to extract and scrub all possible metadata, including custom/user fields (e.g., Title, Comments, Directors, Producers, Publisher, etc.) that ffmpeg/ffprobe may miss.
  - **Upgrade Plan:**
    1. **Research and Evaluate Tools:** Investigate libraries/tools (e.g., mp4box, AtomicParsley, Node.js MP4 parsers) for reading/writing arbitrary MP4 atoms and custom fields.
    2. **Prototype Deep Metadata Extraction:** Build a script to extract all atoms/tags from a sample MP4, including custom/user fields. Compare with Windows Properties.
    3. **Prototype Deep Metadata Scrubbing:** Attempt to remove or blank out custom/user fields using the chosen tool. Validate by re-checking in Windows Properties and with ffprobe.
    4. **Integrate with App:** Add new extraction and scrubbing logic to the Next.js API endpoints. Update UI to show all detected fields and allow user selection for scrubbing.
    5. **Testing and Validation:** Test with a variety of video files and metadata scenarios. Ensure no video/audio quality loss and that all metadata is removed as expected.
    6. **Documentation and User Guidance:** Update documentation and UI to explain new capabilities and any limitations.
  - **Goal:** Remove all metadata (including creation date, GPS, device info, and custom/user fields) without re-encoding, for as many video formats as possible.
  - **Current Status:** Server-side processing using Next.js API routes with ffmpeg/ffprobe. Basic metadata extraction and scrubbing working. Full metadata removal (including custom/user fields) requires more advanced video container manipulation and/or new tools.

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
