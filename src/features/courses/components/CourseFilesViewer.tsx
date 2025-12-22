"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTitle,
  DialogContent,
} from "@/components/ui/dialog";
import {
  FileText,
  File,
  ExternalLink,
  Download,
} from "lucide-react";

interface CourseFile {
  id: string;
  name: string;
  description?: string | null;
  fileName: string;
  fileType: string;
  fileSize: number;
  downloadable?: boolean; // NEW
}

interface CourseFilesViewerProps {
  courseId: string;
  files: CourseFile[];
}

export function CourseFilesViewer({ courseId, files }: CourseFilesViewerProps) {
  const [selectedFile, setSelectedFile] = useState<CourseFile | null>(null);

  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case "pdf":
        return <FileText className="w-5 h-5 text-red-500" />;
      case "pptx":
      case "ppt":
        return <File className="w-5 h-5 text-orange-500" />;
      case "docx":
      case "doc":
        return <File className="w-5 h-5 text-blue-500" />;
      case "xlsx":
      case "xls":
        return <File className="w-5 h-5 text-green-500" />;
      default:
        return <File className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + " MB";
  };

  const handleOpenFile = async (file: CourseFile) => {
    setSelectedFile(file);
  };

  return (
    <>
      <div className="space-y-3">
        {files.map((file) => (
          <div
            key={file.id}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={() => handleOpenFile(file)}
          >
            <div className="flex items-center gap-3 flex-1">
              {getFileIcon(file.fileType)}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{file.name}</p>
                {file.description && (
                  <p className="text-sm text-muted-foreground truncate">
                    {file.description}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {file.fileName} • {formatFileSize(file.fileSize)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="default"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenFile(file);
                }}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open
              </Button>

              {file.downloadable && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async (e) => {
                    e.stopPropagation();
                    const res = await fetch(`/api/courses/${courseId}/files/${file.id}/download`);
                    const { url } = await res.json();
                    window.open(url, "_blank");
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!selectedFile} onOpenChange={() => setSelectedFile(null)}>
        <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0">
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg font-semibold truncate">{selectedFile?.name}</DialogTitle>
              {selectedFile?.description && (
                <p className="text-sm text-muted-foreground truncate">
                  {selectedFile.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            {selectedFile && (
              <SecurePDFViewer
                courseId={courseId}
                fileId={selectedFile.id}
                fileName={selectedFile.name}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function SecurePDFViewer({
  courseId,
  fileId,
  fileName,
}: {
  courseId: string;
  fileId: string;
  fileName: string;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [pdfDoc, setPdfDoc] = useState<any>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.async = true;
    script.onload = () => {
      // @ts-ignore
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      loadPDF();
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const loadPDF = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/courses/${courseId}/files/${fileId}/view`);

      if (!response.ok) throw new Error("Failed to load document");

      const arrayBuffer = await response.arrayBuffer();

      // @ts-ignore
      const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;

      setPdfDoc(pdf);
      setNumPages(pdf.numPages);
      setLoading(false);
      renderPage(1, pdf);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load PDF");
      setLoading(false);
    }
  };

  const renderPage = async (pageNum: number, pdf: any = pdfDoc) => {
    if (!pdf) return;

    const page = await pdf.getPage(pageNum);
    const canvas = document.getElementById("pdf-canvas") as HTMLCanvasElement;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const viewport = page.getViewport({ scale });

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise;
  };

  useEffect(() => {
    if (pdfDoc) renderPage(currentPage);
  }, [currentPage, scale, pdfDoc]);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < numPages) setCurrentPage(currentPage + 1);
  };

  const handleZoomIn = () => setScale(Math.min(scale + 0.25, 3));
  const handleZoomOut = () => setScale(Math.max(scale - 0.25, 0.5));

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    return false;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading document...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <FileText className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={handlePrevPage} disabled={currentPage === 1}>
            Previous
          </Button>
          <span className="text-sm px-3">
            Page {currentPage} of {numPages}
          </span>
          <Button size="sm" variant="outline" onClick={handleNextPage} disabled={currentPage === numPages}>
            Next
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={handleZoomOut}>
            -
          </Button>
          <span className="text-sm px-3">{Math.round(scale * 100)}%</span>
          <Button size="sm" variant="outline" onClick={handleZoomIn}>
            +
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-gray-100 p-4">
        <div className="flex justify-center">
          <canvas
            id="pdf-canvas"
            className="shadow-lg bg-white"
            onContextMenu={handleContextMenu}
            style={{ userSelect: "none" }}
          />
        </div>
      </div>
    </div>
  );
}
