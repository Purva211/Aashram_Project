import React, { useState, useEffect, useRef } from 'react';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaYoutube, FaMusic } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';

const AudioPlayerWithLyrics = () => {
  const [track, setTrack] = useState(null);
  const [lyrics, setLyrics] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [activeLyricIndex, setActiveLyricIndex] = useState(-1);
  const [loading, setLoading] = useState(true);
  
  const audioRef = useRef(null);
  const lyricsContainerRef = useRef(null);
  const activeLyricRef = useRef(null);

  useEffect(() => {
    fetchActiveTrack();
  }, []);

  // Auto-scroll lyrics smoothly to the center
  useEffect(() => {
    if (activeLyricRef.current && lyricsContainerRef.current) {
      activeLyricRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeLyricIndex]);

  const fetchActiveTrack = async () => {
    try {
      const res = await api.get('/audio/active');
      if (res.data.data) {
        setTrack(res.data.data);
        if (res.data.data.lyricsDataUrl) {
          fetchAndParseVtt(res.data.data.lyricsDataUrl);
        }
      }
    } catch (error) {
      console.error("Failed to load audio track");
    } finally {
      setLoading(false);
    }
  };

  const parseTime = (timeString) => {
    // 00:00:00.000 or 00:00.000
    const parts = timeString.split(':');
    let seconds = 0;
    if (parts.length === 3) {
      seconds = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseFloat(parts[2]);
    } else if (parts.length === 2) {
      seconds = parseInt(parts[0]) * 60 + parseFloat(parts[1]);
    }
    return seconds;
  };

  const fetchAndParseVtt = async (vttUrl) => {
    try {
      const response = await fetch(vttUrl);
      const text = await response.text();
      
      const lines = text.split('\n');
      const parsedLyrics = [];
      let currentCue = null;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || line === 'WEBVTT') continue;

        if (line.includes('-->')) {
          const times = line.split('-->');
          currentCue = {
            start: parseTime(times[0].trim()),
            end: parseTime(times[1].trim()),
            text: ''
          };
        } else if (currentCue) {
          if (line.match(/^[0-9]+$/)) {
            continue; // Skip cue identifiers
          }
          currentCue.text += (currentCue.text ? ' ' : '') + line;
          
          // Look ahead to see if next line is empty or a timestamp (end of cue)
          if (i + 1 >= lines.length || !lines[i + 1].trim() || lines[i+1].includes('-->')) {
             if(currentCue.text.trim()) {
                // remove HTML tags sometimes present in auto-subs (like <c>...</c>)
                currentCue.text = currentCue.text.replace(/<[^>]+>/g, '');
                parsedLyrics.push(currentCue);
             }
             currentCue = null;
          }
        }
      }
      setLyrics(parsedLyrics);
    } catch (error) {
      console.error("Error parsing VTT", error);
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const time = audioRef.current.currentTime;
    setCurrentTime(time);

    // Find active lyric
    const index = lyrics.findIndex(lyric => time >= lyric.start && time <= lyric.end);
    if (index !== -1 && index !== activeLyricIndex) {
      setActiveLyricIndex(index);
      
      // Auto scroll
      if (activeLyricRef.current && lyricsContainerRef.current) {
        const container = lyricsContainerRef.current;
        const element = activeLyricRef.current;
        
        container.scrollTo({
          top: element.offsetTop - container.offsetHeight / 2 + element.offsetHeight / 2,
          behavior: 'smooth'
        });
      }
    }
  };

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "00:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) return null; // Don't show anything if loading
  if (!track) return null; // Don't show anything if no active track

  return (
    <div className="w-full max-w-5xl mx-auto my-6 md:my-12 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl shadow-xl overflow-hidden flex flex-col-reverse md:flex-row relative border border-orange-100">
      
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>

      <audio 
        ref={audioRef}
        src={track.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={(e) => setDuration(e.target.duration)}
        onEnded={() => setIsPlaying(false)}
        muted={isMuted}
      />

      {/* Left side: Player Controls */}
      <div className="w-full md:w-5/12 p-5 sm:p-8 md:p-10 flex flex-col justify-center relative z-10 border-t md:border-t-0 md:border-r border-orange-200/50 backdrop-blur-sm">
        
        <div className="mb-6 md:mb-8 text-center md:text-left">
          <h3 className="text-orange-600 text-[10px] md:text-sm font-bold tracking-wider uppercase mb-2 flex items-center justify-center md:justify-start">
             {track.sourceType === 'youtube' && <FaYoutube className="mr-2" />}
             Daily {track.language} Audio
          </h3>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-mahakal-burgundy mb-2 leading-tight">{track.title}</h2>
          <p className="text-gray-600 font-semibold text-xs md:text-base">Listen and follow along with the divine verses.</p>
        </div>

        {/* Controls */}
        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="group relative">
            <input 
              type="range" 
              min="0" 
              max={duration || 100} 
              value={currentTime} 
              onChange={handleSeek}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer overflow-hidden"
              style={{
                background: `linear-gradient(to right, #f97316 0%, #f97316 ${(currentTime / duration) * 100}%, #e5e7eb ${(currentTime / duration) * 100}%, #e5e7eb 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2 font-medium">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className="text-gray-500 hover:text-orange-600 transition-colors"
            >
              {isMuted ? <FaVolumeMute size={20}/> : <FaVolumeUp size={20}/>}
            </button>

            <button 
              onClick={togglePlay}
              className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/30 transform transition-transform hover:scale-105 active:scale-95"
            >
              {isPlaying ? <FaPause size={24} /> : <FaPlay size={24} className="ml-1" />}
            </button>
            
            <div className="w-5"></div> {/* Spacer for symmetry */}
          </div>
        </div>
      </div>

      {/* Right side: Lyrics Display or Thumbnail */}
      <div className={`w-full md:w-7/12 relative z-10 flex flex-col ${track.thumbnailUrl && lyrics.length === 0 ? 'h-auto md:min-h-full' : 'h-64 sm:h-80 md:h-[400px] p-4 sm:p-6 md:p-10'}`}>
        {lyrics.length > 0 ? (
          <div 
            ref={lyricsContainerRef}
            className="h-full w-full overflow-y-auto no-scrollbar pr-4 space-y-6 pb-[200px]"
            style={{ maskImage: 'linear-gradient(to bottom, transparent, black 10%, black 70%, transparent)', WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 10%, black 70%, transparent)' }}
          >
            {lyrics.map((lyric, index) => (
              <motion.div 
                key={index}
                ref={index === activeLyricIndex ? activeLyricRef : null}
                initial={{ opacity: 0, y: 10 }}
                animate={{ 
                  opacity: index === activeLyricIndex ? 1 : 0.6,
                  scale: index === activeLyricIndex ? 1.05 : 1,
                  filter: 'blur(0px)'
                }}
                transition={{ duration: 0.3 }}
                className={`text-center transition-all duration-300 transform origin-center flex-1 ${
                  index === activeLyricIndex 
                    ? 'text-3xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-red-500 to-orange-600 drop-shadow-md' 
                    : 'text-lg sm:text-xl md:text-2xl font-bold text-gray-400 cursor-pointer hover:text-orange-500'
                }`}
                onClick={() => {
                  audioRef.current.currentTime = lyric.start;
                  if (!isPlaying) togglePlay();
                }}
              >
                {lyric.text}
              </motion.div>
            ))}
          </div>
        ) : track.thumbnailUrl ? (
          <div className="w-full h-full overflow-hidden group bg-stone-50 flex items-center justify-center border-b md:border-b-0 md:border-l border-orange-100">
             <img 
               src={track.thumbnailUrl} 
               alt={track.title} 
               className="w-full h-auto md:h-full md:object-cover lg:object-contain object-cover max-h-[250px] sm:max-h-[300px] md:max-h-none group-hover:scale-105 transition-transform duration-700" 
             />
          </div>
        ) : (
          <div className="h-full flex flex-1 items-center justify-center min-h-[150px]">
             <div className="text-center text-gray-400">
               <FaMusic className="text-3xl md:text-4xl mx-auto mb-2 md:mb-4 opacity-30 text-orange-600" />
               <p className="text-sm md:text-xl font-bold text-gray-600">Looks like we don't have the lyrics for this audio.</p>
             </div>
          </div>
        )}
      </div>

      {/* Custom CSS for hiding scrollbar */}
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
};

export default AudioPlayerWithLyrics;
