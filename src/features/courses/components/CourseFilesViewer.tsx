"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FileText,
  File as FileIcon,
  Download,
  ExternalLink,
} from "lucide-react";

interface CourseFile {
  id: string;
  name: string;
  description?: string | null;
  fileName: string;
  fileType: string;
  fileSize: number;
}

interface CourseFilesViewerProps {
  courseId: string;
  files: CourseFile[];
}

export function CourseFilesViewer({ courseId, files }: CourseFilesViewerProps) {
  const [selectedFile, setSelectedFile] = useState<CourseFile | null>(null);
  const [viewerUrl, setViewerUrl] = useState<string>("");

  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case "pdf":
        return <FileText className="w-5 h-5 text-red-500" />;
      case "pptx":
      case "ppt":
        return <FileIcon className="w-5 h-5 text-orange-500" />;
      case "docx":
      case "doc":
        return <FileIcon className="w-5 h-5 text-blue-500" />;
      case "xlsx":
      case "xls":
        return <FileIcon className="w-5 h-5 text-green-500" />;
      default:
        return <FileIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + " MB";
  };

  const handleOpenFile = async (file: CourseFile) => {
  setSelectedFile(file);

  const res = await fetch(
    `/api/courses/${courseId}/files/${file.id}/view`
  );

  if (!res.ok) return;

  const { url } = await res.json();

  if (file.fileType.toLowerCase() === "pdf") {
    setViewerUrl(url);
    return;
  }

  const encodedUrl = encodeURIComponent(url);

  if (["pptx", "ppt", "docx", "doc", "xlsx", "xls"].includes(file.fileType.toLowerCase())) {
    setViewerUrl(
      `https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}`
    );
  }
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
              
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!selectedFile} onOpenChange={() => setSelectedFile(null)}>
        <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold">{selectedFile?.name}</h2>

            {selectedFile?.description && (
              <p className="text-sm text-muted-foreground">
                {selectedFile.description}
              </p>
            )}
          </div>

          <div className="flex-1">
            {viewerUrl && (
              <iframe
                src={viewerUrl}
                className="w-full h-full border-0"
                title={selectedFile?.name}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
