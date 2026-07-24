"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Mic, Square, Loader2, Sparkles, MessageCircleHeart } from "lucide-react";
import Link from "next/link";

const MAX_RECORDING_TIME = 180; // 3 minutes in seconds

export function VoiceJournalCard() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ transcript: string; insight: string; moodLabel: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, []);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= MAX_RECORDING_TIME - 1) {
            stopRecording();
            return MAX_RECORDING_TIME;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording, stopRecording]);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setResult(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        // Stop all tracks to release microphone
        stream.getTracks().forEach((track) => track.stop());
        await processAudio(audioBlob, recordingTime);
      };

      mediaRecorder.start();
      // eslint-disable-next-line react-hooks/purity
      startTimeRef.current = Date.now();
      setRecordingTime(0);
      setIsRecording(true);
    } catch (err) {
      console.error(err);
      setError("دسترسی به میکروفون داده نشد یا خطایی رخ داد.");
    }
  }, []);


  const processAudio = async (blob: Blob, durationSeconds: number) => {
    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("audio", blob, "voice.webm");
      formData.append("duration", String(durationSeconds));

      const res = await fetch("/api/voice-journal", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "خطایی در سرور رخ داد");
      }

      const data = await res.json();
      setResult(data);
      router.refresh(); // Refresh dashboard to show the new mood
    } catch (err: any) {
      setError(err.message || "اتصال برقرار نشد.");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <section className="card-soft overflow-hidden rounded-[1.5rem] p-5 sm:rounded-[1.75rem] sm:p-7 relative">
      {/* Decorative Blob */}
      <div className="pointer-events-none absolute -start-20 -top-20 size-64 rounded-full bg-brand-glow/20 blur-3xl" />
      
      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-base font-extrabold text-ink">
            <Sparkles className="size-5 text-brand" />
            صدای روزت
          </h2>
          <p className="mt-1 max-w-sm text-xs leading-5 text-soft">
            احساست رو با صدای خودت ضبط کن. من گوش می‌دم و برات یه یادداشت کوچیک می‌نویسم. (حداکثر ۳ دقیقه)
          </p>
        </div>

        <div className="shrink-0">
          {!isRecording && !isProcessing && !result && (
            <button
              onClick={startRecording}
              className="group flex items-center gap-2 rounded-2xl bg-brand-deep px-5 py-3 text-sm font-black text-white shadow-[var(--shadow-brand)] transition-transform hover:scale-105 active:scale-95"
            >
              <Mic className="size-5" />
              شروع ضبط
            </button>
          )}

          {isRecording && (
            <div className="flex items-center gap-2 sm:gap-3 rounded-2xl border border-danger/20 bg-danger/5 px-3 sm:px-4 py-2">
              <span className="relative flex size-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-danger opacity-75"></span>
                <span className="relative inline-flex size-3 rounded-full bg-danger"></span>
              </span>
              <span className="w-12 text-center text-sm font-black text-danger tabular-nums" dir="ltr">
                {formatTime(recordingTime)}
              </span>
              <button
                onClick={stopRecording}
                className="grid size-10 place-items-center rounded-xl bg-danger/10 text-danger transition-colors hover:bg-danger hover:text-white"
              >
                <Square className="size-4 fill-current" />
              </button>
            </div>
          )}

          {isProcessing && (
            <div className="flex items-center gap-3 rounded-2xl border border-line bg-canvas/50 px-5 py-3">
              <Loader2 className="size-5 animate-spin text-brand" />
              <span className="text-xs font-bold text-ink animate-pulse">در حال گوش دادن به احساساتت...</span>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="relative z-10 mt-4 rounded-xl bg-danger/10 p-4 text-xs font-semibold text-danger">
          {error}
        </div>
      )}

      {result && (
        <div className="relative z-10 mt-6 rounded-2xl border border-line bg-canvas p-5">
          <div className="mb-4 flex items-center gap-2">
            <span className="rounded-full bg-tint-strong px-3 py-1 text-[10px] font-black text-brand-ink">
              {result.moodLabel}
            </span>
            <span className="text-xs font-semibold text-faint">تحلیل هوش مصنوعی</span>
          </div>
          
          <p className="text-sm font-medium leading-7 text-ink">
            {result.insight}
          </p>

          <div className="mt-4 border-t border-line pt-4">
            <p className="mb-3 text-[10px] font-semibold text-faint">متن پیاده‌سازی شده:</p>
            <p className="text-xs leading-6 text-soft italic opacity-80">
              «{result.transcript}»
            </p>
          </div>

          <div className="mt-5 flex items-center justify-between">
            <button
              onClick={() => setResult(null)}
              className="text-xs font-bold text-faint hover:text-ink"
            >
              ضبط دوباره
            </button>
            <Link
              href="/chat"
              className="flex items-center gap-2 rounded-xl bg-tint px-4 py-2 text-xs font-black text-brand-ink transition-colors hover:bg-tint-strong"
            >
              <MessageCircleHeart className="size-4" />
              ادامه در گفتگو
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
