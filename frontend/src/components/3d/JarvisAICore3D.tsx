import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshWobbleMaterial } from '@react-three/drei';
import * as THREE from 'three';

function ArmillaryCoreMesh() {
  const outerRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (outerRef.current) {
      outerRef.current.rotation.y += delta * 0.4;
      outerRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 1.5) * 0.2;
    }
    if (innerRef.current) {
      innerRef.current.rotation.y -= delta * 0.5;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.8;
    }
  });

  return (
    <group>
      {/* Outer Brass Armillary Rings */}
      <mesh ref={outerRef}>
        <icosahedronGeometry args={[1.8, 1]} />
        <meshStandardMaterial color="#c5a059" wireframe roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Orbiting Gold Ring */}
      <mesh ref={ringRef}>
        <torusGeometry args={[2.3, 0.04, 16, 64]} />
        <meshBasicMaterial color="#d4af37" wireframe transparent opacity={0.7} />
      </mesh>

      {/* Inner Glowing Burgundy Ink Core */}
      <mesh ref={innerRef}>
        <sphereGeometry args={[0.95, 32, 32]} />
        <MeshWobbleMaterial
          color="#6b1d2f"
          roughness={0.4}
          metalness={0.5}
          factor={0.3}
          speed={1.5}
        />
      </mesh>
    </group>
  );
}

export const JarvisAICore3D: React.FC = () => {
  return (
    <div className="w-full h-48 relative">
      <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
        <ambientLight intensity={0.7} color="#f4ebd9" />
        <pointLight position={[10, 10, 10]} intensity={2.5} color="#d4af37" />
        <ArmillaryCoreMesh />
      </Canvas>
    </div>
  );
};
