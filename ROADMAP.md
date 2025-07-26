# Project Roadmap

This document outlines the strategic roadmap for DeMeta, including both application development (features, technical improvements) and site/business expansion (SEO, content, outreach).

---

## App Development

### Phase 1 (Now): User Base Growth & Quick Wins

**Focus:** Expand file format support to attract more users and address common requests.

- **Apple iWork Document Support**
  - Pages (`.pages`): Support for Apple's word processing documents.
  - Numbers (`.numbers`): Support for Apple's spreadsheet documents.
  - Keynote (`.key`): Support for Apple's presentation documents.
  - _Note: These are zipped packages similar to MS Office files, but with a different internal structure._
- **More Audio File Formats**
  - AIFF (`.aiff`, `.aif`): Re-attempt implementation of full read and scrub support. The previous attempt was blocked by a stubborn linter error.
  - Apple Containers (`.m4a`): Add support for AAC and Apple Lossless (ALAC) files.
  - Open Source Formats (`.ogg`, `.opus`): Add support for Ogg Vorbis and Opus.

### Phase 2 (Next): Power User Features & Scalability

**Focus:** Enhance usability and control for advanced users, and lay the groundwork for future scalability.

- **Batch Processing**: Allow users to upload and scrub multiple files at once.
- **Detailed Metadata View**: Implement an advanced view that shows all available metadata tags, not just the common ones.
- **Selective Scrubbing**: Allow users to check/uncheck individual metadata fields to remove, giving them more control.

### Phase 3 (Later): Niche & Advanced Enhancements

**Focus:** Add features for specialized use cases and revisit legacy format support.

- **GPS Data Visualization**: If a file contains GPS coordinates, display a small map showing the location.
- **Expanded File Support**:
  - Legacy MS Office (`.xls`, `.doc`, `.ppt`): Re-evaluate support for older binary Office formats.
  - Other Document Types: Look into supporting formats like `.rtf`.

---

## Site & Business Expansion

### SEO & Discoverability

- Add clear, keyword-rich `<title>` and `<meta name="description">` tags to all pages.
- **Include Open Graph meta tags for social sharing on all major pages.**
- Implement Twitter Card meta tags for social sharing.
- Create SEO-friendly landing pages for each supported feature/format (e.g., `/remove-metadata-from-mp4`, `/remove-metadata-from-m4a`, `/remove-metadata-from-pages`).
- Add an FAQ page and how-to guides (e.g., "How to remove metadata from a video file").
- Generate and submit a sitemap.xml; ensure robots.txt allows crawling.
- Maintain high site performance and accessibility.

### Content & Engagement

- Add a blog or resources section with articles about metadata, privacy, and file formats.
- Create a "Use Cases" page to highlight who benefits from DeMeta (journalists, activists, content creators, etc.).
- Add social sharing buttons and a feedback/suggestion form.

### Outreach & Community

- Make the GitHub repo public (if possible) with a strong README and relevant tags.
- Announce launches/updates on Product Hunt, Reddit, Hacker News, and relevant communities.
- Add "Tell a friend" or pre-filled tweet links to encourage word-of-mouth sharing.

### Analytics & Iteration

- Use free analytics tools (e.g., Vercel Analytics) to monitor traffic and user behavior.
- Adjust content and features based on analytics and user feedback.

---

**Strategy:**

- Release new format support and features incrementally.
- Expand site content and SEO in parallel with app development.
- Gather user feedback after each release to guide priorities and catch edge cases.
- Maintain a changelog and communicate updates clearly.
