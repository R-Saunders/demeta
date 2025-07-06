import { MetadataScrubber } from '@/components/metadata-scrubber';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold font-headline">
            <Link href="/" className="transition-colors text-primary">
              DeMeta
            </Link>
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Demeta helps you decide what information leaves your device. Remove
            hidden metadata before you upload to social media, AI platforms, or
            anywhere else.
          </p>
        </header>

        <MetadataScrubber />

        <div className="w-full text-center my-8">
          <div className="inline-block bg-muted/30 rounded-lg px-6 py-4 text-base text-muted-foreground shadow-sm">
            <strong>Pro Tip:</strong> When you upload a file, you&apos;re also
            sharing a trove of invisible data. Before sharing on social media or
            using with AI, a quick clean ensures your privacy remains intact.
          </div>
        </div>

        <div className="mt-12 mb-20">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-xl font-headline">
                Take Control of Your Digital Footprint
              </AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground space-y-4 pt-4">
                <p>
                  Every photo you take, every document you create, and every
                  video you record contains hidden information called metadata.
                  While this data can be useful, it often includes sensitive
                  details you might not want to share publicly.
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <strong>Images:</strong> Digital photos can reveal the exact
                    date, time, and GPS location of where the photo was taken,
                    plus the make and model of your camera or phone.
                  </li>
                  <li>
                    <strong>Documents (PDF, Word, etc.):</strong> These files
                    often store author names, company details, editing history,
                    and the exact dates the file was created and modified.
                  </li>
                  <li>
                    <strong>Audio Files:</strong> Music and sound files can
                    contain artist names, album titles, and even the software
                    used for editing, which could link back to you.
                  </li>
                  <li>
                    <strong>Video Files:</strong> Videos can contain device
                    information, GPS location, creator details, and tags that
                    may reveal more than you intend.
                  </li>
                </ul>
                <h3 className="text-xl font-bold font-headline">
                  Why does this matter?
                </h3>
                <p>
                  When you upload files to social media, cloud storage, or AI
                  platforms, this metadata is often collected and analyzed. It
                  can be used to build a detailed profile of your habits, your
                  location history, and your personal life.
                  <br />
                  By removing metadata, you&apos;re not just deleting data;
                  you&apos;re taking a crucial step in digital privacy. You are
                  ensuring that the file you share is just the file, nothing
                  more. It allows you to interact with the digital world on your
                  own terms.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-xl font-headline">
                Who sees my metadata?
              </AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground space-y-4 pt-4">
                <p>
                  Potentially, anyone who has access to your original file. More
                  specifically, the platforms we use every day are designed to
                  read it:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <strong>Social Media Platforms:</strong> Use it to better
                    understand their users&apos; behavior and locations, which
                    can be used for targeted advertising and content algorithms.
                  </li>
                  <li>
                    <strong>AI and Machine Learning Models:</strong> Are often
                    trained on vast datasets of publicly available files.
                    Removing metadata from your images or documents prevents
                    your personal data from becoming part of this training data.
                  </li>
                  <li>
                    <strong>Online Forums & Image Boards:</strong> Can expose
                    your data to a wide, anonymous audience if not removed.
                  </li>
                </ul>
                <p>
                  Demeta allows you to wipe this information before it ever
                  leaves your computer.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-xl font-headline">
                What file types are supported?
              </AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground pt-4">
                <p>
                  This tool supports a wide range of file formats. You can
                  upload and scrub metadata from the following file types:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-4 mt-4">
                  <div>
                    <h4 className="font-semibold text-foreground">Images</h4>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>JPEG (.jpg, .jpeg)</li>
                      <li>PNG (.png)</li>
                      <li>TIFF (.tiff)</li>
                      <li>HEIC (.heic)</li>
                      <li>WebP (.webp)</li>
                      <li>GIF (.gif)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Documents</h4>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>PDF (.pdf)</li>
                      <li>Word (.docx)</li>
                      <li>Excel (.xlsx)</li>
                      <li>PowerPoint (.pptx)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Audio</h4>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>MP3 (.mp3)</li>
                      <li>FLAC (.flac)</li>
                      <li>WAV (.wav)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Video</h4>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>MP4 (.mp4)</li>
                      <li>MOV (.mov)</li>
                      <li>MKV (.mkv)</li>
                      <li>AVI (.avi)</li>
                      <li>WebM (.webm)</li>
                    </ul>
                    <p className="text-xs text-muted-foreground mt-2">
                      All major video formats are fully supported.
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </main>
  );
}
