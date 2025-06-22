'use client';

import { useState, ChangeEvent, FC, DragEvent } from 'react';
import ExifReader from 'exifreader';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import * as music from 'music-metadata';
import {
  FileUp,
  ScanLine,
  ShieldCheck,
  Download,
  Trash2,
  Loader2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type Metadata = Record<string, string>;
type Step = 'upload' | 'review' | 'download';
type FileType = 'image' | 'pdf' | 'office' | 'audio' | 'video';

// Define the structure for Office document metadata XML
const xmlParserOptions = {
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
};

export function MetadataScrubber() {
  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<FileType | null>(null);
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [fieldsToScrub, setFieldsToScrub] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const startOver = () => {
    setStep('upload');
    setFile(null);
    setMetadata(null);
    setFieldsToScrub([]);
    setIsProcessing(false);
    setProgress(0);
  };

  const processFile = async (selectedFile: File) => {
    setFile(selectedFile);
    setIsProcessing(true);
    setProgress(0);
    setMetadata(null);

    try {
      if (selectedFile.type.startsWith('image/')) {
        setFileType('image');
        await processImageFile(selectedFile);
      } else if (selectedFile.type === 'application/pdf') {
        setFileType('pdf');
        await processPdfFile(selectedFile);
      } else if (
        [
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        ].includes(selectedFile.type)
      ) {
        setFileType('office');
        await processOfficeFile(selectedFile);
      } else if (selectedFile.type.startsWith('audio/')) {
        setFileType('audio');
        await processAudioFile(selectedFile);
      } else if (selectedFile.type.startsWith('video/')) {
        setFileType('video');
        await processVideoFile(selectedFile);
      } else {
        throw new Error(
          'Unsupported file type. Please upload a supported image, PDF, Office document, audio, or video file.'
        );
      }

      await new Promise((resolve) => setTimeout(resolve, 250));
      setProgress(100);

      await new Promise((resolve) => setTimeout(resolve, 500));
      setStep('review');
    } catch (error: any) {
      console.error('Error processing file:', error);
      toast({
        title: 'Error Processing File',
        description:
          error.message ||
          'Could not process this file. It may be corrupted or an unsupported file type.',
        variant: 'destructive',
      });
      startOver();
    } finally {
      setIsProcessing(false);
    }
  };

  const processImageFile = async (selectedFile: File) => {
    await new Promise((resolve) => setTimeout(resolve, 250));
    setProgress(30);

    const tags = await ExifReader.load(selectedFile);
    setProgress(70);

    delete tags['MakerNote'];
    delete tags['UserComment'];
    delete tags['thumbnail'];

    const extractedMetadata: Metadata = {};
    for (const tagName in tags) {
      if (Object.prototype.hasOwnProperty.call(tags, tagName)) {
        const tag = tags[tagName];
        if (tag.description) {
          extractedMetadata[tagName] = Array.isArray(tag.description)
            ? tag.description.join(', ')
            : tag.description;
        }
      }
    }

    if (Object.keys(extractedMetadata).length === 0) {
      extractedMetadata['Status'] =
        'No readable EXIF metadata found. The file may not contain any, or it might not be a supported format.';
    }

    setMetadata(extractedMetadata);
    setFieldsToScrub([]);
  };

  const processPdfFile = async (selectedFile: File) => {
    await new Promise((resolve) => setTimeout(resolve, 250));
    setProgress(30);

    const fileBuffer = await selectedFile.arrayBuffer();
    const pdfDoc = await PDFDocument.load(fileBuffer);

    setProgress(70);

    const extractedMetadata: Metadata = {};
    const author = pdfDoc.getAuthor();
    const creationDate = pdfDoc.getCreationDate();
    const creator = pdfDoc.getCreator();
    const keywords = pdfDoc.getKeywords();
    const modificationDate = pdfDoc.getModificationDate();
    const producer = pdfDoc.getProducer();
    const subject = pdfDoc.getSubject();
    const title = pdfDoc.getTitle();

    if (author) extractedMetadata['Author'] = author;
    if (creator) extractedMetadata['Creator'] = creator;
    if (producer) extractedMetadata['Producer'] = producer;
    if (subject) extractedMetadata['Subject'] = subject;
    if (title) extractedMetadata['Title'] = title;
    if (keywords) extractedMetadata['Keywords'] = keywords;
    if (creationDate)
      extractedMetadata['Creation Date'] = creationDate.toLocaleString();
    if (modificationDate)
      extractedMetadata['Modification Date'] =
        modificationDate.toLocaleString();

    if (Object.keys(extractedMetadata).length === 0) {
      extractedMetadata['Status'] = 'No readable metadata found in this PDF.';
    }

    setMetadata(extractedMetadata);
    setFieldsToScrub([]);
  };

  const processOfficeFile = async (selectedFile: File) => {
    // New logic for Office files
    await new Promise((resolve) => setTimeout(resolve, 250));
    setProgress(30);

    const fileBuffer = await selectedFile.arrayBuffer();
    const zip = await JSZip.loadAsync(fileBuffer);
    const coreXmlFile = zip.file('docProps/core.xml');
    const appXmlFile = zip.file('docProps/app.xml');

    setProgress(70);
    const extractedMetadata: Metadata = {};

    if (coreXmlFile) {
      const coreXmlText = await coreXmlFile.async('text');
      const parser = new XMLParser(xmlParserOptions);
      const coreXml = parser.parse(coreXmlText);
      const props = coreXml['cp:coreProperties'];

      if (props['dc:creator'])
        extractedMetadata['Author'] = props['dc:creator'];
      if (props['cp:lastModifiedBy'])
        extractedMetadata['Last Modified By'] = props['cp:lastModifiedBy'];
      if (props['cp:revision'])
        extractedMetadata['Revision'] = props['cp:revision'];
      if (props['dcterms:created'])
        extractedMetadata['Creation Date'] = new Date(
          props['dcterms:created']['#text']
        ).toLocaleString();
      if (props['dcterms:modified'])
        extractedMetadata['Modification Date'] = new Date(
          props['dcterms:modified']['#text']
        ).toLocaleString();
    }

    if (appXmlFile) {
      const appXmlText = await appXmlFile.async('text');
      const parser = new XMLParser(xmlParserOptions);
      const appXml = parser.parse(appXmlText);
      const props = appXml['Properties'];

      if (props['Company']) extractedMetadata['Company'] = props['Company'];
    }

    if (Object.keys(extractedMetadata).length === 0) {
      extractedMetadata['Status'] = 'No readable metadata found in this file.';
    }

    setMetadata(extractedMetadata);
    setFieldsToScrub([]);
  };

  const processAudioFile = async (selectedFile: File) => {
    // New logic for audio files
    await new Promise((resolve) => setTimeout(resolve, 250));
    setProgress(30);

    const metadata = await music.parseBlob(selectedFile);
    setProgress(70);

    const extractedMetadata: Metadata = {};
    if (metadata.common.title)
      extractedMetadata['Title'] = metadata.common.title;
    if (metadata.common.artist)
      extractedMetadata['Artist'] = metadata.common.artist;
    if (metadata.common.album)
      extractedMetadata['Album'] = metadata.common.album;
    if (metadata.common.year)
      extractedMetadata['Year'] = metadata.common.year.toString();
    if (metadata.common.track.no)
      extractedMetadata['Track Number'] = metadata.common.track.no.toString();
    if (metadata.common.genre)
      extractedMetadata['Genre'] = metadata.common.genre.join(', ');

    if (Object.keys(extractedMetadata).length === 0) {
      extractedMetadata['Status'] = 'No readable metadata found in this file.';
    }

    setMetadata(extractedMetadata);
    setFieldsToScrub([]);
  };

  const processVideoFile = async (selectedFile: File) => {
    // Server-side video file processing
    await new Promise((resolve) => setTimeout(resolve, 250));
    setProgress(30);

    try {
      // Create FormData to send to server
      const formData = new FormData();
      formData.append('file', selectedFile);

      setProgress(50);

      // Call the server API
      const response = await fetch('/api/video-metadata', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process video metadata');
      }

      const data = await response.json();
      setProgress(70);

      if (data.success && data.metadata) {
        setMetadata(data.metadata);
        setFieldsToScrub([]);
      } else {
        throw new Error('No metadata returned from server');
      }
    } catch (error) {
      console.error('Error processing video file:', error);

      // Fallback to basic file information if server processing fails
      const extractedMetadata: Metadata = {};
      extractedMetadata['File Name'] = selectedFile.name;
      extractedMetadata['File Size'] =
        `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`;
      extractedMetadata['File Type'] = selectedFile.type;
      extractedMetadata['Last Modified'] = new Date(
        selectedFile.lastModified
      ).toLocaleString();
      extractedMetadata['Error'] =
        'Server-side video metadata extraction failed';
      extractedMetadata['Details'] =
        error instanceof Error ? error.message : 'Unknown error';
      extractedMetadata['Status'] =
        'Basic file information available. Server processing failed.';

      setMetadata(extractedMetadata);
      setFieldsToScrub([]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  const handleScrubSelectionChange = (
    field: string,
    checked: boolean | 'indeterminate'
  ) => {
    setFieldsToScrub((prev) => {
      if (checked) {
        return [...prev, field];
      } else {
        return prev.filter((f) => f !== field);
      }
    });
  };

  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked && metadata) {
      setFieldsToScrub(Object.keys(metadata));
    } else {
      setFieldsToScrub([]);
    }
  };

  const scrubMetadata = async () => {
    setIsProcessing(true);
    await downloadCleanedFile();
    setIsProcessing(false);
    setStep('upload'); // Go back to the beginning after download
    // Reset file state after a delay to allow for the next upload
    setTimeout(() => {
      setFile(null);
      setMetadata(null);
      setFieldsToScrub([]);
    }, 500);
  };

  const downloadCleanedFile = async () => {
    if (!file) return;

    if (fileType === 'image') {
      await downloadCleanedImage();
    } else if (fileType === 'pdf') {
      await downloadCleanedPdf();
    } else if (fileType === 'office') {
      await downloadCleanedOfficeFile();
    } else if (fileType === 'audio') {
      await downloadCleanedAudioFile();
    } else if (fileType === 'video') {
      await downloadCleanedVideoFile();
    }
  };

  const downloadCleanedImage = () => {
    if (!file) return;
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          toast({
            title: 'Download Failed',
            description: 'Could not process the image for download.',
            variant: 'destructive',
          });
          return;
        }
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `scrubbed-${file.name}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          } else {
            toast({
              title: 'Download Failed',
              description: 'Failed to create a scrubbed version of the image.',
              variant: 'destructive',
            });
          }
        }, file.type || 'image/jpeg');
      };
      img.onerror = () => {
        toast({
          title: 'Image Load Failed',
          description: 'Could not load the image to process it.',
          variant: 'destructive',
        });
      };
      if (event.target?.result) {
        img.src = event.target.result as string;
      }
    };

    reader.onerror = () => {
      toast({
        title: 'Error Reading File',
        description: 'Could not read the file for scrubbing.',
        variant: 'destructive',
      });
    };

    reader.readAsDataURL(file);
  };

  const downloadCleanedPdf = async () => {
    if (!file) return;

    try {
      const fileBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(fileBuffer);

      if (fieldsToScrub.includes('Author')) pdfDoc.setAuthor('');
      if (fieldsToScrub.includes('Creator')) pdfDoc.setCreator('');
      if (fieldsToScrub.includes('Producer')) pdfDoc.setProducer('');
      if (fieldsToScrub.includes('Subject')) pdfDoc.setSubject('');
      if (fieldsToScrub.includes('Title')) pdfDoc.setTitle('');
      if (fieldsToScrub.includes('Keywords')) pdfDoc.setKeywords([]);
      if (fieldsToScrub.includes('Creation Date'))
        pdfDoc.setCreationDate(new Date(0));
      if (fieldsToScrub.includes('Modification Date'))
        pdfDoc.setModificationDate(new Date());

      const pdfBytes = await pdfDoc.save();

      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `scrubbed-${file.name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error scrubbing PDF:', error);
      toast({
        title: 'PDF Scrubbing Failed',
        description: 'Could not process the PDF for scrubbing.',
        variant: 'destructive',
      });
    }
  };

  const downloadCleanedOfficeFile = async () => {
    if (!file) return;

    try {
      const fileBuffer = await file.arrayBuffer();
      const zip = await JSZip.loadAsync(fileBuffer);
      const coreXmlFile = zip.file('docProps/core.xml');
      const appXmlFile = zip.file('docProps/app.xml');

      if (coreXmlFile) {
        let coreXmlText = await coreXmlFile.async('text');

        // Use regex to surgically replace metadata in the XML string
        if (fieldsToScrub.includes('Author')) {
          coreXmlText = coreXmlText.replace(
            /<dc:creator>.*?<\/dc:creator>/g,
            '<dc:creator></dc:creator>'
          );
        }
        if (fieldsToScrub.includes('Last Modified By')) {
          coreXmlText = coreXmlText.replace(
            /<cp:lastModifiedBy>.*?<\/cp:lastModifiedBy>/g,
            '<cp:lastModifiedBy></cp:lastModifiedBy>'
          );
        }
        if (fieldsToScrub.includes('Revision')) {
          coreXmlText = coreXmlText.replace(
            /<cp:revision>.*?<\/cp:revision>/g,
            '<cp:revision>1</cp:revision>'
          );
        }

        const now = new Date().toISOString();
        if (fieldsToScrub.includes('Creation Date')) {
          coreXmlText = coreXmlText.replace(
            /<dcterms:created xsi:type="dcterms:W3CDTF">.*?<\/dcterms:created>/g,
            `<dcterms:created xsi:type="dcterms:W3CDTF">${now}</dcterms:created>`
          );
        }
        if (fieldsToScrub.includes('Modification Date')) {
          coreXmlText = coreXmlText.replace(
            /<dcterms:modified xsi:type="dcterms:W3CDTF">.*?<\/dcterms:modified>/g,
            `<dcterms:modified xsi:type="dcterms:W3CDTF">${now}</dcterms:modified>`
          );
        }

        zip.file('docProps/core.xml', coreXmlText);
      }

      if (appXmlFile) {
        let appXmlText = await appXmlFile.async('text');

        if (fieldsToScrub.includes('Company')) {
          appXmlText = appXmlText.replace(
            /<Company>.*?<\/Company>/g,
            '<Company></Company>'
          );
        }

        zip.file('docProps/app.xml', appXmlText);
      }

      const newFileBuffer = await zip.generateAsync({ type: 'arraybuffer' });
      const blob = new Blob([newFileBuffer], { type: file.type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `scrubbed-${file.name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error scrubbing Office file:', error);
      toast({
        title: 'Office File Scrubbing Failed',
        description: 'Could not process the Office file for scrubbing.',
        variant: 'destructive',
      });
    }
  };

  const downloadCleanedAudioFile = async () => {
    if (!file) return;

    try {
      let buffer = await file.arrayBuffer();

      // Check for and remove ID3v2 tag (at the beginning of the file)
      const view = new DataView(buffer);
      if (
        view.byteLength > 10 &&
        view.getUint8(0) === 0x49 &&
        view.getUint8(1) === 0x44 &&
        view.getUint8(2) === 0x33
      ) {
        const tagSize =
          (view.getUint8(6) << 21) |
          (view.getUint8(7) << 14) |
          (view.getUint8(8) << 7) |
          view.getUint8(9);
        const totalSize = 10 + tagSize;
        buffer = buffer.slice(totalSize);
      }

      // Check for and remove ID3v1 tag (at the end of the file)
      const viewEnd = new DataView(buffer);
      if (
        viewEnd.byteLength > 128 &&
        viewEnd.getUint8(viewEnd.byteLength - 128) === 0x54 &&
        viewEnd.getUint8(viewEnd.byteLength - 127) === 0x41 &&
        viewEnd.getUint8(viewEnd.byteLength - 126) === 0x47
      ) {
        buffer = buffer.slice(0, buffer.byteLength - 128);
      }

      const blob = new Blob([buffer], { type: file.type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `scrubbed-${file.name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error scrubbing audio file:', error);
      toast({
        title: 'Audio File Scrubbing Failed',
        description: 'Could not process the audio file for scrubbing.',
        variant: 'destructive',
      });
    }
  };

  const downloadCleanedVideoFile = async () => {
    // Server-side video file scrubbing
    if (!file) return;

    try {
      console.log('Starting video file scrubbing...');
      console.log('File info:', {
        name: file.name,
        size: file.size,
        type: file.type,
      });

      // Create FormData to send to server
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fieldsToScrub', JSON.stringify(fieldsToScrub));

      console.log('Calling server API...');
      // Call the server API for scrubbing
      const response = await fetch('/api/video-scrub', {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        throw new Error(errorData.error || 'Failed to scrub video metadata');
      }

      console.log('Getting response blob...');
      // Get the scrubbed file as blob
      const scrubbedBlob = await response.blob();
      console.log('Blob received, size:', scrubbedBlob.size);

      // Create download link
      const url = URL.createObjectURL(scrubbedBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `scrubbed-${file.name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log('File downloaded successfully');
      toast({
        title: 'Video File Scrubbed and Downloaded',
        description:
          'Video metadata has been processed and the cleaned file has been downloaded.',
      });
    } catch (error) {
      console.error('Error scrubbing video file:', error);
      toast({
        title: 'Video File Scrubbing Failed',
        description:
          error instanceof Error
            ? error.message
            : 'Could not scrub the video file.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="relative">
      {step === 'upload' && (
        <UploadStep
          onFileChange={handleFileChange}
          onDrop={handleDrop}
          isProcessing={isProcessing}
          progress={progress}
        />
      )}
      {step === 'review' && file && metadata && (
        <ReviewStep
          fileName={file.name}
          metadata={metadata}
          fieldsToScrub={fieldsToScrub}
          onScrubSelectionChange={handleScrubSelectionChange}
          onSelectAll={handleSelectAll}
          onScrub={scrubMetadata}
          isProcessing={isProcessing}
          onCancel={startOver}
        />
      )}
    </div>
  );
}

const UploadStep: FC<{
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onDrop: (e: DragEvent<HTMLLabelElement>) => void;
  isProcessing: boolean;
  progress: number;
}> = ({ onFileChange, onDrop, isProcessing, progress }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <Card className="w-full animate-in fade-in-50 duration-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileUp className="text-primary" /> 1. Upload Your File
        </CardTitle>
        <CardDescription>
          Select a file from your device. We&apos;ll extract the metadata for
          you to review.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isProcessing ? (
          <label
            htmlFor="file-upload"
            className={cn(
              'flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-card transition-colors',
              'hover:bg-muted hover:border-primary/30',
              isDragging && 'bg-primary/10 border-primary'
            )}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={(e) => {
              onDrop(e);
              setIsDragging(false);
            }}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6 pointer-events-none">
              <FileUp className="w-10 h-10 mb-3 text-muted-foreground" />
              <p className="mb-2 text-sm text-muted-foreground">
                <span className="font-semibold text-primary">
                  Click to upload
                </span>{' '}
                or drag and drop
              </p>
              <p className="text-xs text-muted-foreground">
                Supports images, PDF, Office, and audio files
              </p>
            </div>
            <Input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={onFileChange}
              disabled={isProcessing}
              accept="image/*,application/pdf,.docx,.xlsx,.pptx,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.openxmlformats-officedocument.presentationml.presentation,audio/*,video/*"
            />
          </label>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="mt-4 text-muted-foreground">Analyzing file...</p>
            <Progress value={progress} className="w-4/5 mt-2" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const ReviewStep: FC<{
  fileName: string;
  metadata: Metadata;
  fieldsToScrub: string[];
  onScrubSelectionChange: (
    field: string,
    checked: boolean | 'indeterminate'
  ) => void;
  onSelectAll: (checked: boolean | 'indeterminate') => void;
  onScrub: () => void;
  isProcessing: boolean;
  onCancel: () => void;
}> = ({
  fileName,
  metadata,
  fieldsToScrub,
  onScrubSelectionChange,
  onSelectAll,
  onScrub,
  isProcessing,
  onCancel,
}) => {
  const allSelected =
    metadata &&
    Object.keys(metadata).length > 0 &&
    fieldsToScrub.length === Object.keys(metadata).length;
  const isIndeterminate = fieldsToScrub.length > 0 && !allSelected;

  return (
    <Card className="w-full animate-in fade-in-50 duration-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ScanLine className="text-primary" /> 2. Review & Scrub Metadata
        </CardTitle>
        <CardDescription>
          Review extracted metadata for{' '}
          <span className="font-semibold text-primary">{fileName}</span>. Select
          the fields you wish to remove.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg max-h-96 overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-muted/50 backdrop-blur-sm">
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={isIndeterminate ? 'indeterminate' : allSelected}
                    onCheckedChange={(checked) => onSelectAll(!!checked)}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead>Field</TableHead>
                <TableHead>Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(metadata).map(([key, value]) => (
                <TableRow key={key}>
                  <TableCell>
                    <Checkbox
                      checked={fieldsToScrub.includes(key)}
                      onCheckedChange={(checked) =>
                        onScrubSelectionChange(key, checked)
                      }
                      aria-label={`Select ${key}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{key}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {value}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2 mt-4">
        <Button variant="outline" onClick={onCancel} disabled={isProcessing}>
          <Trash2 className="mr-2 h-4 w-4" />
          Cancel
        </Button>
        <Button onClick={onScrub} disabled={isProcessing}>
          {isProcessing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <ShieldCheck className="mr-2 h-4 w-4" />
          )}
          Scrub & Download
        </Button>
      </CardFooter>
    </Card>
  );
};
