import React, { useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom'; // Thêm để lấy ID từ URL
import { Canvas, useFrame } from '@react-three/fiber';
import { Image, OrbitControls, Stars, Float, PerspectiveCamera, Sparkles } from '@react-three/drei';
import { Bloom, EffectComposer, Noise, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import './EffectShowcase.css';

// 1. Lõi phát sáng trung tâm
function CentralSun() {
  const sunRef = useRef();
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    sunRef.current.rotation.y = t * 0.3;
    const pulse = 1.8 + Math.sin(t * 2) * 0.08;
    sunRef.current.scale.set(pulse, pulse, pulse);
  });

  return (
    <group>
      <mesh ref={sunRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#f06292"
          emissiveIntensity={12}
          toneMapped={false}
        />
      </mesh>
      <Sparkles count={150} scale={5} size={2} speed={0.6} color="#f06292" />
    </group>
  );
}

// 2. Vành đai hạt ánh sáng
function ParticleRing({ radius }) {
  const points = useRef();
  const count = 1000;
  
  const particles = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = radius + (Math.random() - 0.5) * 2;
      pos[i * 3] = Math.cos(angle) * r;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.8;
      pos[i * 3 + 2] = Math.sin(angle) * r;
    }
    return pos;
  }, [radius]);

  useFrame((state) => {
    points.current.rotation.y = state.clock.getElapsedTime() * 0.07;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={particles} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.06} color="#ffb2d9" transparent opacity={0.7} />
    </points>
  );
}

// 3. Quả cầu ảnh hiển thị riêng cho 1 người
function PhotoSphere({ images, radius }) {
  const group = useRef();
  
  const photoPositions = useMemo(() => {
    const temp = [];
    const count = images.length || 1;
    for (let i = 0; i < count; i++) {
      const phi = Math.acos(-1 + (2 * i) / count);
      const theta = Math.sqrt(count * Math.PI) * phi;
      const position = new THREE.Vector3().setFromSphericalCoords(radius, phi, theta);
      temp.push({ position, url: images[i], rotation: [0, -theta, 0] });
    }
    return temp;
  }, [images, radius]);

  useFrame((state, delta) => {
    group.current.rotation.y += delta * 0.15; // Xoay nhanh hơn một chút vì ít ảnh hơn
  });

  return (
    <group ref={group}>
      {photoPositions.map((p, i) => (
        <Float key={i} speed={2.5} rotationIntensity={0.6} floatIntensity={1}>
          <Image 
            url={p.url} 
            position={p.position} 
            rotation={p.rotation} 
            scale={[1.8, 2.4]} // Phóng to ảnh lên để không gian không bị trống
            side={THREE.DoubleSide} 
            transparent 
            opacity={1} 
          />
        </Float>
      ))}
    </group>
  );
}

const EffectShowcase = ({ users = [] }) => {
  const { id } = useParams(); // Lấy ID từ trình duyệt

  // Tìm người dùng cụ thể dựa trên ID
  const currentUser = useMemo(() => {
    return users.find(u => u._id === id);
  }, [users, id]);

  // Nếu chưa có dữ liệu hoặc không tìm thấy người dùng
  if (!currentUser) {
    return (
      <div className="loading-screen" style={{ color: 'white', background: 'black', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <h3>Đang khởi tạo không gian riêng... ✨</h3>
      </div>
    );
  }

  const userImages = currentUser.images || [];

  return (
    <div className="galaxy-container">
      <div className="galaxy-header">
        <button className="btn-back-fancy" onClick={() => window.history.back()}>
          <span>⬅ QUAY LẠI</span>
        </button>
      </div>

      <Canvas dpr={[1, 2]} gl={{ antialias: false }}>
        <PerspectiveCamera makeDefault position={[0, 0, 16]} fov={60} />
        
        <Stars radius={100} depth={50} count={8000} factor={5} fade speed={1.5} />
        <ambientLight intensity={0.5} />
        <pointLight position={[0, 0, 0]} intensity={5} color="#f06292" />

        <CentralSun />
        <ParticleRing radius={3} />
        
        {/* Chỉ hiển thị ảnh của người được chọn */}
        <PhotoSphere images={userImages} radius={7.5} />

        <EffectComposer disableNormalPass>
          <Bloom luminanceThreshold={1} intensity={3} mipmapBlur radius={0.5} />
          <Noise opacity={0.05} />
          <Vignette eskil={false} offset={0.1} darkness={1.2} />
        </EffectComposer>

        <OrbitControls enablePan={false} minDistance={5} maxDistance={25} enableDamping />
      </Canvas>

      <div className="galaxy-footer-fancy">
        {/* Hiện tên và lời chúc riêng của người đó */}
        <h1 className="glow-text">{currentUser.nickname || currentUser.fullname}</h1>
        <p className="subtitle">"{currentUser.userWish}"</p>
      </div>
    </div>
  );
};

export default EffectShowcase;