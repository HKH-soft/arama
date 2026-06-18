"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export interface Track {
  id: string;
  title: string;
  artist: string;
  cover: string;
  duration: number; // seconds
  src: string;
}

export const sampleTracks: Track[] = [
  {
    id: "1",
    title: "آرامش ذهن",
    artist: "آراما",
    cover: "",
    duration: 180,
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  },
  {
    id: "2",
    title: "مدیتیشن صبحگاهی",
    artist: "آراما",
    cover: "",
    duration: 240,
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  },
  {
    id: "3",
    title: "تنفس عمیق",
    artist: "آراما",
    cover: "",
    duration: 150,
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  },
  {
    id: "4",
    title: "یوگای آرامش",
    artist: "آراما",
    cover: "",
    duration: 200,
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
  },
  {
    id: "5",
    title: "خواب راحت",
    artist: "آراما",
    cover: "",
    duration: 300,
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
  },
];

export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [queue, setQueue] = useState<Track[]>(sampleTracks);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = volume;
    }

    const audio = audioRef.current;

    const onTimeUpdate = () => setProgress(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onEnded = () => playNext();

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, [queue, currentTrack]);

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
      audio.src = track.src;
      audio.play();
      setCurrentTrack(track);
      setIsPlaying(true);
    },
    [currentTrack, isPlaying]
  );

  const togglePlay = useCallback(() => {
    if (!audioRef.current || !currentTrack) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
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
    togglePlay,
    seek,
    changeVolume,
    playNext,
    playPrev,
  };
}
