"use client";

import { useState, ChangeEvent, FC, DragEvent } from "react";
import ExifReader from "exifreader";
import { PDFDocument } from "pdf-lib";
import {
	FileUp,
	ScanLine,
	ShieldCheck,
	Download,
	Trash2,
	Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type Metadata = Record<string, string>;
type Step = "upload" | "review" | "download";
type FileType = "image" | "pdf";

export function MetadataScrubber() {
	const [step, setStep] = useState<Step>("upload");
	const [file, setFile] = useState<File | null>(null);
	const [fileType, setFileType] = useState<FileType | null>(null);
	const [metadata, setMetadata] = useState<Metadata | null>(null);
	const [fieldsToScrub, setFieldsToScrub] = useState<string[]>([]);
	const [isProcessing, setIsProcessing] = useState(false);
	const [progress, setProgress] = useState(0);
	const { toast } = useToast();

	const startOver = () => {
		setStep("upload");
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
			if (selectedFile.type.startsWith("image/")) {
				setFileType("image");
				await processImageFile(selectedFile);
			} else if (selectedFile.type === "application/pdf") {
				setFileType("pdf");
				await processPdfFile(selectedFile);
			} else {
				throw new Error(
					"Unsupported file type. Please upload a supported image or PDF file."
				);
			}

			await new Promise((resolve) => setTimeout(resolve, 250));
			setProgress(100);

			await new Promise((resolve) => setTimeout(resolve, 500));
			setStep("review");
		} catch (error: any) {
			console.error("Error processing file:", error);
			toast({
				title: "Error Processing File",
				description:
					error.message ||
					"Could not process this file. It may be corrupted or an unsupported file type.",
				variant: "destructive",
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

		delete tags["MakerNote"];
		delete tags["UserComment"];
		delete tags["thumbnail"];

		const extractedMetadata: Metadata = {};
		for (const tagName in tags) {
			if (Object.prototype.hasOwnProperty.call(tags, tagName)) {
				const tag = tags[tagName];
				if (tag.description) {
					extractedMetadata[tagName] = Array.isArray(tag.description)
						? tag.description.join(", ")
						: tag.description;
				}
			}
		}

		if (Object.keys(extractedMetadata).length === 0) {
			extractedMetadata["Status"] =
				"No readable EXIF metadata found. The file may not contain any, or it might not be a supported format.";
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

		if (author) extractedMetadata["Author"] = author;
		if (creator) extractedMetadata["Creator"] = creator;
		if (producer) extractedMetadata["Producer"] = producer;
		if (subject) extractedMetadata["Subject"] = subject;
		if (title) extractedMetadata["Title"] = title;
		if (keywords) extractedMetadata["Keywords"] = keywords;
		if (creationDate)
			extractedMetadata["Creation Date"] = creationDate.toLocaleString();
		if (modificationDate)
			extractedMetadata["Modification Date"] =
				modificationDate.toLocaleString();

		if (Object.keys(extractedMetadata).length === 0) {
			extractedMetadata["Status"] = "No readable metadata found in this PDF.";
		}

		setMetadata(extractedMetadata);
		setFieldsToScrub([]);
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
		checked: boolean | "indeterminate"
	) => {
		setFieldsToScrub((prev) => {
			if (checked) {
				return [...prev, field];
			} else {
				return prev.filter((f) => f !== field);
			}
		});
	};

	const handleSelectAll = (checked: boolean | "indeterminate") => {
		if (checked && metadata) {
			setFieldsToScrub(Object.keys(metadata));
		} else {
			setFieldsToScrub([]);
		}
	};

	const scrubMetadata = async () => {
		setIsProcessing(true);
		await new Promise((resolve) => setTimeout(resolve, 1000));
		setIsProcessing(false);
		setStep("download");
	};

	const downloadCleanedFile = async () => {
		if (!file) return;

		if (fileType === "image") {
			await downloadCleanedImage();
		} else if (fileType === "pdf") {
			await downloadCleanedPdf();
		}
	};

	const downloadCleanedImage = () => {
		if (!file) return;
		const reader = new FileReader();

		reader.onload = (event) => {
			const img = new Image();
			img.onload = () => {
				const canvas = document.createElement("canvas");
				canvas.width = img.width;
				canvas.height = img.height;
				const ctx = canvas.getContext("2d");
				if (!ctx) {
					toast({
						title: "Download Failed",
						description: "Could not process the image for download.",
						variant: "destructive",
					});
					return;
				}
				ctx.drawImage(img, 0, 0);
				canvas.toBlob((blob) => {
					if (blob) {
						const url = URL.createObjectURL(blob);
						const a = document.createElement("a");
						a.href = url;
						a.download = `scrubbed-${file.name}`;
						document.body.appendChild(a);
						a.click();
						document.body.removeChild(a);
						URL.revokeObjectURL(url);
					} else {
						toast({
							title: "Download Failed",
							description: "Failed to create a scrubbed version of the image.",
							variant: "destructive",
						});
					}
				}, file.type || "image/jpeg");
			};
			img.onerror = () => {
				toast({
					title: "Image Load Failed",
					description: "Could not load the image to process it.",
					variant: "destructive",
				});
			};
			if (event.target?.result) {
				img.src = event.target.result as string;
			}
		};

		reader.onerror = () => {
			toast({
				title: "Error Reading File",
				description: "Could not read the file for scrubbing.",
				variant: "destructive",
			});
		};

		reader.readAsDataURL(file);
	};

	const downloadCleanedPdf = async () => {
		if (!file) return;

		try {
			const fileBuffer = await file.arrayBuffer();
			const pdfDoc = await PDFDocument.load(fileBuffer);

			if (fieldsToScrub.includes("Author")) pdfDoc.setAuthor("");
			if (fieldsToScrub.includes("Creator")) pdfDoc.setCreator("");
			if (fieldsToScrub.includes("Producer")) pdfDoc.setProducer("");
			if (fieldsToScrub.includes("Subject")) pdfDoc.setSubject("");
			if (fieldsToScrub.includes("Title")) pdfDoc.setTitle("");
			if (fieldsToScrub.includes("Keywords")) pdfDoc.setKeywords([]);
			if (fieldsToScrub.includes("Creation Date"))
				pdfDoc.setCreationDate(new Date(0));
			if (fieldsToScrub.includes("Modification Date"))
				pdfDoc.setModificationDate(new Date());

			const pdfBytes = await pdfDoc.save();

			const blob = new Blob([pdfBytes], { type: "application/pdf" });
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `scrubbed-${file.name}`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		} catch (error) {
			console.error("Error scrubbing PDF:", error);
			toast({
				title: "PDF Scrubbing Failed",
				description: "Could not process the PDF for scrubbing.",
				variant: "destructive",
			});
		}
	};

	return (
		<div className="relative">
			{step === "upload" && (
				<UploadStep
					onFileChange={handleFileChange}
					onDrop={handleDrop}
					isProcessing={isProcessing}
					progress={progress}
				/>
			)}
			{step === "review" && file && metadata && (
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
			{step === "download" && file && (
				<DownloadStep
					fileName={file.name}
					onDownload={downloadCleanedFile}
					onStartOver={startOver}
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
							"flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-card transition-colors",
							"hover:bg-muted hover:border-primary/30",
							isDragging && "bg-primary/10 border-primary"
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
								</span>{" "}
								or drag and drop
							</p>
							<p className="text-xs text-muted-foreground">
								Supports images and PDF files
							</p>
						</div>
						<Input
							id="file-upload"
							type="file"
							className="hidden"
							onChange={onFileChange}
							disabled={isProcessing}
							accept="image/*,application/pdf"
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
		checked: boolean | "indeterminate"
	) => void;
	onSelectAll: (checked: boolean | "indeterminate") => void;
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
					Review extracted metadata for{" "}
					<span className="font-semibold text-primary">{fileName}</span>. Select
					the fields you wish to remove.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="border rounded-lg max-h-96 overflow-y-auto">
					<Table>
						<TableHeader className="sticky top-0 bg-muted/50 backdrop-blur-sm">
							<TableRow>
								<TableHead className="w-12">
									<Checkbox
										onCheckedChange={onSelectAll}
										checked={isIndeterminate ? "indeterminate" : allSelected}
										aria-label="Select all rows"
									/>
								</TableHead>
								<TableHead className="w-1/3">Field</TableHead>
								<TableHead>Value</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{Object.entries(metadata).map(([key, value]) => {
								return (
									<TableRow
										key={key}
										data-state={fieldsToScrub.includes(key) ? "selected" : ""}
									>
										<TableCell>
											<Checkbox
												checked={fieldsToScrub.includes(key)}
												onCheckedChange={(checked) =>
													onScrubSelectionChange(key, checked)
												}
											/>
										</TableCell>
										<TableCell className="font-medium">
											<div className="flex items-center gap-2">
												<span>{key}</span>
											</div>
										</TableCell>
										<TableCell className="font-mono text-xs break-all">
											{value}
										</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				</div>
			</CardContent>
			<CardFooter className="flex justify-between flex-wrap gap-4">
				<Button variant="ghost" onClick={onCancel} disabled={isProcessing}>
					Cancel
				</Button>
				<Button
					onClick={onScrub}
					disabled={isProcessing || fieldsToScrub.length === 0}
					size="lg"
				>
					{isProcessing ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Scrubbing...
						</>
					) : (
						<>
							<Trash2 className="mr-2 h-4 w-4" />
							Scrub {fieldsToScrub.length} field(s)
						</>
					)}
				</Button>
			</CardFooter>
		</Card>
	);
};

const DownloadStep: FC<{
	fileName: string;
	onDownload: () => void;
	onStartOver: () => void;
}> = ({ fileName, onDownload, onStartOver }) => (
	<Card className="w-full animate-in fade-in-50 duration-500">
		<CardHeader>
			<CardTitle className="flex items-center gap-2">
				<Download className="text-primary" /> 3. Download Your Cleaned File
			</CardTitle>
			<CardDescription>
				We&apos;ve scrubbed the selected metadata from{" "}
				<span className="font-semibold text-primary">{fileName}</span>.
			</CardDescription>
		</CardHeader>
		<CardContent className="text-center">
			<p className="text-muted-foreground mb-6">
				Download the new, privacy-safe version of your file.
			</p>
			<div className="flex gap-4 justify-center">
				<Button size="lg" variant="outline" onClick={onStartOver}>
					Start Over
				</Button>
				<Button
					size="lg"
					onClick={onDownload}
					className="bg-primary hover:bg-primary/90"
				>
					<Download className="mr-2 h-5 w-5" />
					Download Cleaned File
				</Button>
			</div>
		</CardContent>
	</Card>
);
