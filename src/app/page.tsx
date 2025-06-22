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
                  This tool uses the powerful ExifReader library and supports a
                  wide range of image formats. You can upload and scrub metadata
                  from the following file types:
                </p>
                <ul className="list-disc list-inside grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                  <li>JPEG (.jpg, .jpeg)</li>
                  <li>PNG (.png)</li>
                  <li>TIFF (.tiff)</li>
                  <li>HEIC (.heic)</li>
                  <li>WebP (.webp)</li>
                  <li>GIF (.gif)</li>
                  <li>PDF (.pdf)</li>
                  <li>Word (.docx)</li>
                  <li>Excel (.xlsx)</li>
                  <li>PowerPoint (.pptx)</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </main>
  );
}
