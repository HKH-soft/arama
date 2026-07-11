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
    title: "آرامش صبحگاهی",
    artist: "موسیقی آرام‌بخش",
    cover: "",
    duration: 600,
    src: "/audio/calm-warm-drone.mp3",
    category: "آرامش",
  },
  {
    id: "m2",
    title: "مدیتیشن خداحافظی",
    artist: "صدای مراقب",
    cover: "",
    duration: 900,
    src: "/audio/calm-ambient-space.mp3",
    category: "خواب",
  },
  {
    id: "m3",
    title: "تنفس عمیق",
    artist: "راهنمای تنفسی",
    cover: "",
    duration: 300,
    src: "/audio/calm-wandering.mp3",
    category: "تنفسی",
  },
  {
    id: "m4",
    title: "ذهن‌آگاهی روزانه",
    artist: "گروه روانشناسی مثبت",
    cover: "",
    duration: 720,
    src: "/audio/calm-forest-meditation.mp3",
    category: "ذهن‌آگاهی",
  },
  {
    id: "m5",
    title: "شکرگزاری صبح",
    artist: "موسیقی مثبت‌اندیشی",
    cover: "",
    duration: 480,
    src: "/audio/calm-peaceful-water.mp3",
    category: "مثبت‌اندیشی",
  },
  {
    id: "m6",
    title: "شفقت با خود",
    artist: "موسیقی کم‌نوا",
    cover: "",
    duration: 720,
    src: "/audio/calm-decline.mp3",
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
    [currentTrack, isPlaying],
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
