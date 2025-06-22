import { MetadataScrubber } from '@/components/metadata-scrubber';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold font-headline">
            Metadata Scrubber
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Protect your privacy by removing metadata from your files.
          </p>
        </header>

        <MetadataScrubber />

        <div className="mt-12 mb-20">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-xl font-headline">
                Why should I remove metadata?
              </AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground space-y-4 pt-4">
                <p>
                  Almost every digital photo you take contains hidden
                  information called metadata (or EXIF data). This can include
                  sensitive details like the exact date, time, and GPS location
                  of where the photo was taken, plus the make and model of your
                  camera or phone.
                </p>
                <p>
                  When you share these photos online, you could be unknowingly
                  broadcasting this personal information. Social media
                  platforms, forums, and other websites can collect this data.
                  More recently, this information is being used to train AI
                  models, often without your consent. Removing metadata is a
                  critical step in protecting your privacy, controlling your
                  digital footprint, and ensuring your personal data isn&apos;t
                  harvested for profit.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
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
                      <li>Coming Soon!</li>
                    </ul>
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
