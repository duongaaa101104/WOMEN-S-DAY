import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { Image, OrbitControls, Stars, Float, PerspectiveCamera, Sparkles } from '@react-three/drei';
import { Bloom, EffectComposer, Noise, Vignette } from '@react-three/postprocessing';
import axios from 'axios';
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
          emissiveIntensity={10}
          toneMapped={false}
        />
      </mesh>
      <Sparkles count={120} scale={6} size={2} speed={0.4} color="#f06292" />
    </group>
  );
}

// 2. Hiệu ứng Sao băng (Shooting Stars)
function SingleShootingStar({ speed, angle, color }) {
  const mesh = useRef();
  const trailLength = useMemo(() => 2 + Math.random() * 4, []);

  useFrame((state, delta) => {
    mesh.current.position.x += Math.cos(angle) * speed * delta;
    mesh.current.position.y += Math.sin(angle) * speed * delta;
    
    if (mesh.current.position.distanceTo(new THREE.Vector3(0,0,0)) > 50) {
      const resetAngle = angle + Math.PI + (Math.random() - 0.5);
      const spawnRadius = 30 + Math.random() * 10;
      mesh.current.position.x = Math.cos(resetAngle) * spawnRadius;
      mesh.current.position.y = Math.sin(resetAngle) * spawnRadius;
      mesh.current.position.z = (Math.random() - 0.5) * 15;
    }
  });

  return (
    <mesh ref={mesh} rotation={[0, 0, angle + Math.PI / 2]}>
      <cylinderGeometry args={[0.015, 0.015, trailLength, 8]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={15} toneMapped={false} transparent opacity={0.8} />
    </mesh>
  );
}

function ShootingStars({ count = 12 }) {
  const starsData = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const angle = -Math.PI / 4 + (Math.random() - 0.5) * 0.5;
      const speed = 12 + Math.random() * 18;
      const color = Math.random() > 0.3 ? "#ffffff" : "#f06292";
      temp.push({ angle, speed, color });
    }
    return temp;
  }, [count]);
  return <group>{starsData.map((star, i) => <SingleShootingStar key={i} {...star} />)}</group>;
}

// 3. Vành đai ảnh (Photo Ring)
function PhotoRing({ images = [], radius }) {
  const group = useRef();
  const validImages = useMemo(() => images.filter(url => !!url), [images]);

  const photoPositions = useMemo(() => {
    const temp = [];
    const count = validImages.length || 1;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const randomRadius = radius + (Math.random() - 0.5) * 1.5;
      const randomHeight = (Math.random() - 0.5) * 0.8;
      const position = new THREE.Vector3(Math.cos(angle) * randomRadius, randomHeight, Math.sin(angle) * randomRadius);
      temp.push({ position, url: validImages[i], rotation: [0, -angle + Math.PI / 2, 0] });
    }
    return temp;
  }, [validImages, radius]);

  useFrame((state, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.1;
  });

  return (
    <group ref={group}>
      {photoPositions.map((p, i) => (
        <Float key={i} speed={1.5} rotationIntensity={0.3} floatIntensity={0.4}>
          <Image url={p.url} position={p.position} rotation={p.rotation} scale={[2.2, 3]} side={THREE.DoubleSide} transparent />
        </Float>
      ))}
    </group>
  );
}

const EffectShowcase = ({ users = [] }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [targetUser, setTargetUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const found = users.find(u => u._id === id);
    if (found) {
      setTargetUser(found);
      setLoading(false);
    } else {
      const fetchDirect = async () => {
        try {
          const res = await axios.get('https://women-s-day-guym.onrender.com/api/users/all');
          const user = res.data.find(u => u._id === id);
          setTargetUser(user);
        } catch (err) { console.error("Lỗi lấy dữ liệu:", err); } 
        finally { setLoading(false); }
      };
      fetchDirect();
    }
  }, [id, users]);

  if (loading) return <div className="loading-screen"><h3>Đang mở cổng không gian... ✨</h3></div>;

  return (
    <div className="galaxy-container">
      <div className="galaxy-header">
        <button className="btn-back-fancy" onClick={() => navigate('/home')}><span>⬅ QUAY LẠI</span></button>
      </div>

      <Canvas dpr={[1, 2]} gl={{ antialias: false }}>
        <PerspectiveCamera makeDefault position={[0, 6, 22]} fov={60} far={2000} />
        <Stars radius={250} depth={100} count={8000} factor={4} fade speed={1} />
        <ambientLight intensity={0.6} />
        <pointLight position={[0, 0, 0]} intensity={12} color="#f06292" />

        <CentralSun />
        <ShootingStars count={15} />
        <PhotoRing images={targetUser?.images || []} radius={9} />

        <EffectComposer disableNormalPass>
          <Bloom luminanceThreshold={1} intensity={2} mipmapBlur radius={0.4} />
          <Vignette offset={0.3} darkness={0.9} />
        </EffectComposer>

        <OrbitControls enablePan={false} minDistance={7} maxDistance={200} enableDamping />
      </Canvas>

      <div className="galaxy-footer-fancy">
        <h1 className="glow-text">{targetUser?.nickname || targetUser?.fullname}</h1>
        <p className="subtitle">"{targetUser?.userWish}"</p>
      </div>
    </div>
  );
};

export default EffectShowcase;