"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export interface Track {
  id: string;
  title: string;
  artist: string;
  cover: string;
  duration: number; // seconds
  src: string;
  category?: string;
}

export const meditationTracks: Track[] = [
  {
    id: "m1",
    title: "آرامش ذهن",
    artist: "مدیتیشن هدایت شده",
    cover: "",
    duration: 600,
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    category: "آرامش",
  },
  {
    id: "m2",
    title: "خواب عمیق",
    artist: "صداهای طبیعت",
    cover: "",
    duration: 1800,
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    category: "خواب",
  },
  {
    id: "m3",
    title: "تنفس عمیق",
    artist: "تمرین تنفسی",
    cover: "",
    duration: 300,
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    category: "تنفسی",
  },
  {
    id: "m4",
    title: "شکرگزاری",
    artist: "مثبت‌اندیشی",
    cover: "",
    duration: 480,
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    category: "مثبت‌اندیشی",
  },
  {
    id: "m5",
    title: "اسکن بدن",
    artist: "بدن‌آگاهی",
    cover: "",
    duration: 900,
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    category: "بدن‌آگاهی",
  },
  {
    id: "m6",
    title: "مهربانی با خود",
    artist: "مدیتیشن شفقت",
    cover: "",
    duration: 720,
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    category: "شفقت",
  },
];

export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playNextRef = useRef<() => void>(() => {});
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [queue, setQueue] = useState<Track[]>(meditationTracks);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = volume;
    }

    const audio = audioRef.current;

    const onTimeUpdate = () => setProgress(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onEnded = () => playNextRef.current();

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, [queue, currentTrack]);

  // Stop audio on unmount so it doesn't keep playing after navigation
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  const playTrack = useCallback(
    (track: Track) => {
      if (!audioRef.current) return;
      const audio = audioRef.current;
      if (currentTrack?.id === track.id) {
        if (isPlaying) {
          audio.pause();
          setIsPlaying(false);
        } else {
          audio.play();
          setIsPlaying(true);
        }
        return;
      }
      audio.pause();
      audio.src = track.src;
      audio.play().catch(() => {});
      setCurrentTrack(track);
      setIsPlaying(true);
    },
    [currentTrack, isPlaying]
  );

  const pause = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setIsPlaying(false);
  }, []);

  const stop = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setCurrentTrack(null);
    setIsPlaying(false);
    setProgress(0);
  }, []);

  const togglePlay = useCallback(() => {
    if (!audioRef.current || !currentTrack) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [isPlaying, currentTrack]);

  const seek = useCallback((time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
    setProgress(time);
  }, []);

  const changeVolume = useCallback((v: number) => {
    if (!audioRef.current) return;
    audioRef.current.volume = v;
    setVolume(v);
  }, []);

  const playNext = useCallback(() => {
    if (!currentTrack) return;
    const idx = queue.findIndex((t) => t.id === currentTrack.id);
    const next = queue[(idx + 1) % queue.length];
    if (next) playTrack(next);
  }, [currentTrack, queue, playTrack]);

  playNextRef.current = playNext;

  const playPrev = useCallback(() => {
    if (!currentTrack) return;
    const idx = queue.findIndex((t) => t.id === currentTrack.id);
    const prev = queue[(idx - 1 + queue.length) % queue.length];
    if (prev) playTrack(prev);
  }, [currentTrack, queue, playTrack]);

  return {
    currentTrack,
    isPlaying,
    progress,
    duration,
    volume,
    queue,
    playTrack,
    pause,
    stop,
    togglePlay,
    seek,
    changeVolume,
    playNext,
    playPrev,
  };
}
