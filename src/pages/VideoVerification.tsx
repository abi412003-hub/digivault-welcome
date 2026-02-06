import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Video, Square, Play, RotateCcw, Check, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { uploadDocument } from "@/lib/api";

type RecordingState = "idle" | "requesting" | "ready" | "recording" | "recorded" | "uploading";

const MAX_RECORDING_SECONDS = 60;

const VideoVerification = () => {
  const navigate = useNavigate();
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showSampleModal, setShowSampleModal] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const serviceRequestId = localStorage.getItem("currentServiceRequestId");

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopStream();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (recordedUrl) {
        URL.revokeObjectURL(recordedUrl);
      }
    };
  }, [recordedUrl]);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const requestPermissions = async () => {
    setRecordingState("requesting");
    setPermissionDenied(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setRecordingState("ready");
    } catch (error) {
      console.error("Permission denied:", error);
      setPermissionDenied(true);
      setRecordingState("idle");
    }
  };

  const startRecording = () => {
    if (!streamRef.current) return;

    chunksRef.current = [];
    setElapsedSeconds(0);

    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
      ? "video/webm;codecs=vp9"
      : MediaRecorder.isTypeSupported("video/webm")
      ? "video/webm"
      : "video/mp4";

    const mediaRecorder = new MediaRecorder(streamRef.current, { mimeType });
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      setRecordedBlob(blob);
      const url = URL.createObjectURL(blob);
      setRecordedUrl(url);
      setRecordingState("recorded");
      stopStream();
    };

    mediaRecorder.start(1000); // Collect data every second
    setRecordingState("recording");

    // Start timer
    timerRef.current = window.setInterval(() => {
      setElapsedSeconds(prev => {
        const newValue = prev + 1;
        if (newValue >= MAX_RECORDING_SECONDS) {
          stopRecording();
        }
        return newValue;
      });
    }, 1000);
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  };

  const handleRetake = () => {
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl);
    }
    setRecordedBlob(null);
    setRecordedUrl(null);
    setElapsedSeconds(0);
    setRecordingState("idle");
  };

  const handleUseVideo = async () => {
    if (!recordedBlob || !serviceRequestId) {
      toast({
        title: "Error",
        description: "No video recorded or service request not found",
        variant: "destructive",
      });
      return;
    }

    setRecordingState("uploading");

    try {
      // Create file from blob
      const file = new File([recordedBlob], "video-verification.webm", {
        type: recordedBlob.type,
      });

      // Upload to backend
      await uploadDocument(serviceRequestId, "common", "Video Verification", file);

      toast({
        title: "Success",
        description: "Video uploaded successfully",
      });

      // Navigate back to review documents
      navigate(`/review-documents?serviceRequestId=${serviceRequestId}`);
    } catch (error) {
      console.error("Upload error:", error);
      setRecordingState("recorded");
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload video",
        variant: "destructive",
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleBack = () => {
    stopStream();
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="w-10 h-10 flex items-center justify-center text-foreground hover:text-muted-foreground transition-colors -ml-2"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-6 overflow-y-auto">
        {/* Title & Description */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-foreground mb-2">Video Verification</h1>
          <p className="text-sm text-muted-foreground">
            This video is being recorded to confirm that you are the authorized individual sharing the Power of Attorney (POA).
          </p>
        </div>

        {/* Preview Area */}
        <div className="relative aspect-[4/3] bg-muted rounded-xl overflow-hidden mb-6">
          {recordingState === "recorded" && recordedUrl ? (
            <video
              ref={previewVideoRef}
              src={recordedUrl}
              className="w-full h-full object-cover"
              controls
              playsInline
            />
          ) : recordingState === "ready" || recordingState === "recording" ? (
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-cover scale-x-[-1]"
                muted
                playsInline
              />
              {recordingState === "recording" && (
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-destructive/90 text-destructive-foreground px-3 py-1.5 rounded-full">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span className="text-sm font-medium">{formatTime(elapsedSeconds)}</span>
                </div>
              )}
              {recordingState === "recording" && (
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="h-1 bg-muted-foreground/30 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-destructive transition-all duration-1000"
                      style={{ width: `${(elapsedSeconds / MAX_RECORDING_SECONDS) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-24 h-24 bg-muted-foreground/20 rounded-full flex items-center justify-center">
                <Video className="w-12 h-12 text-muted-foreground" />
              </div>
            </div>
          )}
        </div>

        {/* Permission Denied Message */}
        {permissionDenied && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-destructive">Camera Access Denied</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Please allow camera and microphone access in your browser settings to record a video.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={requestPermissions}
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        {recordingState !== "recorded" && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-foreground mb-3">Make sure</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">Your face is clearly visible.</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">Your voice is audible.</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">You speak the full sentence in one shot.</span>
              </li>
            </ul>
            <button
              onClick={() => setShowSampleModal(true)}
              className="mt-4 text-sm text-primary hover:underline"
            >
              Click to view sample Video
            </button>
          </div>
        )}

        {/* Recorded Video Actions */}
        {recordingState === "recorded" && (
          <div className="flex gap-3 mb-6">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleRetake}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Retake
            </Button>
            <Button
              className="flex-1"
              onClick={handleUseVideo}
            >
              <Check className="w-4 h-4 mr-2" />
              Use This Video
            </Button>
          </div>
        )}
      </div>

      {/* Primary Action */}
      {recordingState !== "recorded" && (
        <div className="p-4 border-t border-border">
          {recordingState === "idle" || recordingState === "requesting" ? (
            <Button
              onClick={requestPermissions}
              disabled={recordingState === "requesting"}
              className="w-full h-12"
            >
              <Video className="w-5 h-5 mr-2" />
              {recordingState === "requesting" ? "Requesting Permissions..." : "Start Recording video"}
            </Button>
          ) : recordingState === "ready" ? (
            <Button
              onClick={startRecording}
              className="w-full h-12"
            >
              <Video className="w-5 h-5 mr-2" />
              Start Recording video
            </Button>
          ) : recordingState === "recording" ? (
            <Button
              onClick={stopRecording}
              variant="destructive"
              className="w-full h-12"
            >
              <Square className="w-5 h-5 mr-2" />
              Stop Recording
            </Button>
          ) : recordingState === "uploading" ? (
            <Button disabled className="w-full h-12">
              Uploading...
            </Button>
          ) : null}
        </div>
      )}

      {/* Sample Video Modal */}
      <Dialog open={showSampleModal} onOpenChange={setShowSampleModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Sample Video</DialogTitle>
          </DialogHeader>
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Play className="w-12 h-12 mx-auto mb-2" />
              <p className="text-sm">Sample video placeholder</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => setShowSampleModal(false)}>
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VideoVerification;
