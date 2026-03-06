import React, { useState, useRef, useEffect } from "react";
import "./MusicPlayer.css";

const trackList = [
  { id: 1, title: "Dancing In The Dark", url: "https://res.cloudinary.com/dudh0rcav/video/upload/v1772817709/SOOBIN_-_Dancing_In_The_Dark_B%E1%BA%ACT_N%C3%93_L%C3%8AN_Album_Official_MV_hgs3qz.mp3" },
  { id: 2, title: "Vỗ Tay", url: "https://res.cloudinary.com/dudh0rcav/video/upload/v1772817708/PH%C6%AF%C6%A0NG_LY_-_V%E1%BB%96_TAY_EM_TH%C3%82N_Y%C3%8AU_EM_GI%E1%BB%8EI_QU%C3%81_%C4%90I_VERSION_OFFICIAL_MUSIC_VIDEO_ju9dn7.mp3" },
  { id: 3, title: "Nàng Thơ", url: "https://res.cloudinary.com/dudh0rcav/video/upload/v1772818121/N%C3%A0ng_Th%C6%A1_Ho%C3%A0ng_D%C5%A9ng_Official_MV_lg0eke.mp3" },
  { id: 4, title: "漫步香港1999", url: "https://res.cloudinary.com/dudh0rcav/video/upload/v1772817709/%E5%B8%83%E9%B2%81%E6%98%94_-_%E6%BC%AB%E6%AD%A5%E9%A6%99%E6%B8%AF1999_zilulo.mp3" },
  { id: 5, title: "Ordinary", url: "https://res.cloudinary.com/dudh0rcav/video/upload/v1772817716/Alex_Warren_-_Ordinary_Lyrics_rmh4wv.mp3" },
];

const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(() => 
    Math.floor(Math.random() * trackList.length)
  );
  const audioRef = useRef(null);

  // 1. Đồng bộ hóa trạng thái Play/Pause
  const togglePlay = (e) => {
    if (e) e.stopPropagation(); // Ngăn chặn sự kiện click lan ra ngoài
    
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => console.error("Trình duyệt chặn phát:", err));
    }
  };

  // 2. Tự động phát ngẫu nhiên khi người dùng tương tác lần đầu
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (audioRef.current && !isPlaying) {
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(() => {});
        // Chỉ chạy 1 lần duy nhất
        window.removeEventListener("click", handleFirstInteraction);
      }
    };
    window.addEventListener("click", handleFirstInteraction);
    return () => window.removeEventListener("click", handleFirstInteraction);
  }, [isPlaying]);

  // 3. Xử lý logic chuyển bài
  const selectTrack = (index) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setCurrentTrackIndex(index);
    setIsPlaying(false);
  };

  // 4. Luôn load lại audio khi index thay đổi
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      }
    }
  }, [currentTrackIndex]);

  return (
    <div className="music-player-fixed" onClick={(e) => e.stopPropagation()}>
      <audio
        ref={audioRef}
        src={trackList[currentTrackIndex].url}
        onEnded={() => selectTrack((currentTrackIndex + 1) % trackList.length)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      
      <div className="player-controls">
        <button 
          className={`btn-toggle ${isPlaying ? 'active' : ''}`} 
          onClick={togglePlay}
        >
          {isPlaying ? "⏸ TẮT NHẠC" : "▶️ PHÁT NHẠC"}
        </button>
        
        <div className="track-select">
          <select 
            value={currentTrackIndex} 
            onChange={(e) => selectTrack(parseInt(e.target.value))}
          >
            {trackList.map((track, index) => (
              <option key={track.id} value={index}>
                {track.title}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {isPlaying && (
        <div className="music-wave-container">
          <div className="music-wave">🎵 {trackList[currentTrackIndex].title}</div>
        </div>
      )}
    </div>
  );
};

export default MusicPlayer;