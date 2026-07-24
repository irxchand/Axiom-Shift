import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface SpatialUniverse3DProps {
  activePortal: string;
  onSelectSubject?: (code: string) => void;
}

// Golden Dust Particles Floating in Night Library Ambient Light
function NightLibraryDustParticles() {
  const count = 800;
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const palette = [new THREE.Color('#c9a45c'), new THREE.Color('#d4af37'), new THREE.Color('#6b1d2f'), new THREE.Color('#f5ebe0')];

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 45;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 45;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 35;

      const color = palette[Math.floor(Math.random() * palette.length)];
      col[i * 3] = color.r;
      col[i * 3 + 1] = color.g;
      col[i * 3 + 2] = color.b;
    }
    return [pos, col];
  }, []);

  const pointsRef = useRef<THREE.Points>(null);
  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.008;
      pointsRef.current.rotation.x += delta * 0.002;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.06} vertexColors transparent opacity={0.45} />
    </points>
  );
}

// Camera Movement Rig
function CameraRig({ activePortal }: { activePortal: string }) {
  useFrame((state) => {
    const targetPos = new THREE.Vector3(0, 0, 15);
    if (activePortal === '/subjects') targetPos.set(0, 1, 12);
    else if (activePortal === '/timetable') targetPos.set(-2, -0.5, 13);
    else if (activePortal === '/evaluations') targetPos.set(2, 0.5, 13);
    else if (activePortal === '/ai-chat') targetPos.set(0, -1, 10);

    state.camera.position.lerp(targetPos, 0.02);
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

export const SpatialUniverse3D: React.FC<SpatialUniverse3DProps> = ({ activePortal }) => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none bg-[#0b0806] overflow-hidden">
      <Canvas camera={{ position: [0, 0, 15], fov: 55 }}>
        {/* Subtle Ambient Lighting & Warm Spotlights */}
        <ambientLight intensity={0.4} color="#f5ebe0" />
        <pointLight position={[8, 12, 10]} intensity={1.8} color="#d4af37" />
        <pointLight position={[-10, -10, -10]} intensity={1.2} color="#6b1d2f" />
        <spotLight position={[0, 14, 6]} intensity={2.0} color="#d4af37" angle={0.5} penumbra={0.9} />

        <NightLibraryDustParticles />
        <CameraRig activePortal={activePortal} />

        <OrbitControls enableZoom={false} enableRotate={false} />
      </Canvas>
    </div>
  );
};
