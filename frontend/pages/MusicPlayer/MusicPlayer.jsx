import React, { useState, useRef, useEffect } from "react";
import "./MusicPlayer.css";

const trackList = [
  { id: 1, title: "Dancing In The Dark", url: "https://res.cloudinary.com/dudh0rcav/video/upload/v1772817709/SOOBIN_-_Dancing_In_The_Dark_B%E1%BA%ACT_N%C3%93_L%C3%8AN_Album_Official_MV_hgs3qz.mp3" },
  { id: 2, title: "Vỗ Tay", url: "https://res.cloudinary.com/dudh0rcav/video/upload/v1772817708/PH%C6%AF%C6%A0NG_LY_-_V%E1%BB%96_TAY_EM_TH%C3%82N_Y%C3%8AU_EM_GI%E1%BB%8EI_QU%C3%81_%C4%90I_VERSION_OFFICIAL_MUSIC_VIDEO_ju9dn7.mp3" },
  { id: 3, title: "Nàng Thơ", url: "https://res.cloudinary.com/dudh0rcav/video/upload/v1772818121/N%C3%A0ng_Th%C6%A1_Ho%C3%A0ng_D%C5%A9ng_Official_MV_lg0eke.mp3" },
  { id: 4, title: "漫步香港1999", url: "https://res.cloudinary.com/dudh0rcav/video/upload/v1772817709/%E5%B8%83%E9%B2%81%E6%98%94_-_%E6%BC%AB%E6%AD%A5%E9%A6%99%E6%B8%AF1999_zilulo.mp3" },
  { id: 5, title: "Ordinary", url: "https://res.cloudinary.com/dudh0rcav/video/upload/v1772817716/Alex_Warren_-_Ordinary_Lyrics_rmh4wv.mp3" },
  { id: 6, title: "Đơn_Giản_Anh_Yêu_Em", url: "https://res.cloudinary.com/dudh0rcav/video/upload/v1772874413/%C4%90%C6%A1n_Gi%E1%BA%A3n_Anh_Y%C3%AAu_Em_-_H%E1%BB%93_Qu%E1%BB%91c_Vi%E1%BB%87t_Lyric_Video_Nh%E1%BA%A1c_Hot_Tiktok_uaksmr.mp3" },
  { id: 7, title: "CÓ_CHẮC_YÊU_LÀ_ĐÂY", url: "https://res.cloudinary.com/dudh0rcav/video/upload/v1772874404/C%C3%93_CH%E1%BA%AEC_Y%C3%8AU_L%C3%80_%C4%90%C3%82Y___S%C6%A0N_T%C3%99NG_M-TP___Lyric_Video_rg5cPEf18IU_idp1ds.mp3" },
  { id: 8, title: "Lan_Man", url: "https://res.cloudinary.com/dudh0rcav/video/upload/v1772874404/Lan_Man_Ronboogz_Lyrics_Video_i06j4p.mp3" },
  { id: 9, title: "Dành_Cho_Em", url: "https://res.cloudinary.com/dudh0rcav/video/upload/v1772874404/Ho%C3%A0ng_D%C5%A9ng_x_Orange_-_D%C3%A0nh_Cho_Em_-_Live_at_y%C3%AAn_Concert_ue5kbk.mp3" },
  { id: 10, title: "Phép_Màu", url: "https://res.cloudinary.com/dudh0rcav/video/upload/v1772874404/Ph%C3%A9p_M%C3%A0u_%C4%90%C3%A0n_C%C3%A1_G%E1%BB%97_OST_-_Mounter_x_MAYDAYs_Minh_T%E1%BB%91c_Official_MV_gkemhh.mp3" },
  { id: 11, title: "1000 Ánh Mắt", url: "https://res.cloudinary.com/dudh0rcav/video/upload/v1772874404/AJDEu1-nSTI_proym8.mp3" },
  
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