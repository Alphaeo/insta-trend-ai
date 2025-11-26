import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Calendar, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import api from "@/lib/api";

export default function LessonDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);

  const buildAssetUrl = (value?: string | null) => {
    if (!value) return null;
    // If it's already a full URL, return it
    if (/^https?:\/\//i.test(value)) return value;
    // If it starts with /files/, use API base URL
    if (value.startsWith("/files/")) {
      const apiBase = api.defaults?.baseURL || import.meta.env.VITE_API_URL || "http://localhost:8000";
      // Remove trailing slash
      const base = apiBase.replace(/\/$/, "");
      // In production, VITE_API_URL might be "/api", so we need to construct the full path
      if (base.startsWith("/")) {
        // Relative path (production)
        return `${base}${value}`;
      } else {
        // Absolute URL (development)
        return `${base}${value}`;
      }
    }
    // For backward compatibility, treat as relative path
    const apiBase = api.defaults?.baseURL || import.meta.env.VITE_API_URL || "http://localhost:8000";
    const base = apiBase.replace(/\/$/, "");
    const normalized = value.startsWith("/") ? value : `/${value}`;
    return `${base}${normalized}`;
  };

  useEffect(() => {
    const fetchLesson = async () => {
      if (!id) {
        setError("Lesson ID is missing");
        setLoading(false);
        return;
      }

      try {
        const res = await api.get(`/lessons/${id}`);
        const lessonData = res.data;
        setLesson(lessonData);
        setError(null);

        // If it's a PDF, fetch it and create a blob URL for the iframe
        if (lessonData.file && lessonData.file.toLowerCase().endsWith(".pdf")) {
          try {
            const fileUrl = buildAssetUrl(lessonData.file);
            if (fileUrl) {
              // Use fetch with the token from localStorage for authentication
              const token = localStorage.getItem("token");
              const response = await fetch(fileUrl, {
                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
              });
              if (response.ok) {
                const blob = await response.blob();
                const blobUrl = URL.createObjectURL(blob);
                setPdfBlobUrl(blobUrl);
              } else {
                console.error("Failed to load PDF:", response.statusText);
              }
            }
          } catch (err) {
            console.error("Failed to load PDF:", err);
            // Continue anyway, the download button will still work
          }
        }
      } catch (err: any) {
        console.error("Failed to fetch lesson", err);
        setError(err?.response?.data?.detail || "Failed to load lesson");
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [id]);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [pdfBlobUrl]);

  const handleDownload = async () => {
    if (!lesson?.file) return;

    try {
      const fileUrl = buildAssetUrl(lesson.file);
      if (!fileUrl) {
        throw new Error("Invalid file URL");
      }
      const token = localStorage.getItem("token");
      const response = await fetch(fileUrl, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!response.ok) {
        throw new Error("Failed to download file");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const fileExtension = lesson.file.substring(lesson.file.lastIndexOf("."));
      a.download = lesson.title.replace(/[^a-z0-9]/gi, "_").toLowerCase() + fileExtension;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading file:", error);
      const fallbackUrl = buildAssetUrl(lesson.file);
      if (fallbackUrl) {
        window.open(fallbackUrl, "_blank");
      } else {
        alert("File could not be downloaded.");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <p className="text-destructive mb-4">{error || "Lesson not found"}</p>
            <Button onClick={() => navigate("/info")} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Lessons
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const fileUrl = buildAssetUrl(lesson.file);
  const isPdf = lesson.file?.toLowerCase().endsWith(".pdf");
  const pdfUrl = isPdf && pdfBlobUrl ? pdfBlobUrl : fileUrl;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 md:px-6 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/info")}
            className="mb-6 hover:bg-muted/50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Lessons
          </Button>

          {/* Lesson Header Card */}
          <Card className="mb-6 shadow-md border-2">
            <CardContent className="pt-8 pb-8">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Thumbnail */}
                {lesson.thumbnail && (
                  <div className="flex-shrink-0">
                    <div className="w-full md:w-80 h-52 md:h-48 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 shadow-lg">
                      <img
                        src={buildAssetUrl(lesson.thumbnail) || ""}
                        alt={lesson.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = "";
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Lesson Info */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <BookOpen className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                        Lesson
                      </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
                      {lesson.title}
                    </h1>
                    {lesson.summary && (
                      <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                        {lesson.summary}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Published on {new Date(lesson.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <Button
                      onClick={handleDownload}
                      size="lg"
                      className="bg-gradient-to-r from-[#EC4899] to-[#A855F7] text-white hover:opacity-90 shadow-md hover:shadow-lg transition-all"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Viewer */}
        <Card className="shadow-lg">
          <CardContent className="pt-6 p-0">
            {isPdf && pdfUrl ? (
              <div className="relative w-full bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden">
                <div className="absolute top-4 right-4 z-10">
                  <Button
                    onClick={handleDownload}
                    size="sm"
                    variant="secondary"
                    className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 shadow-md"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
                <div 
                  className="w-full" 
                  style={{ 
                    height: "calc(100vh - 450px)", 
                    minHeight: "700px",
                    maxHeight: "1200px"
                  }}
                >
                  <iframe
                    src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                    className="w-full h-full border-0 rounded-lg"
                    title={lesson.title}
                    allow="fullscreen"
                  />
                </div>
              </div>
            ) : fileUrl ? (
              <div className="text-center py-16 px-6">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Download className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    File Preview Not Available
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    This file type cannot be previewed in the browser. Please download it to view the content.
                  </p>
                  <Button
                    onClick={handleDownload}
                    size="lg"
                    className="bg-gradient-to-r from-[#EC4899] to-[#A855F7] text-white hover:opacity-90"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Download File
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 px-6">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-8 h-8 text-destructive" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    File Not Available
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    The file for this lesson is not available at the moment.
                  </p>
                  <Button
                    onClick={() => navigate("/info")}
                    variant="outline"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Lessons
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

