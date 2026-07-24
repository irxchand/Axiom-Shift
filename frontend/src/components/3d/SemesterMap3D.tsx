import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Text } from '@react-three/drei';
import * as THREE from 'three';
import type { Semester3DNodeDTO } from '../../types/dto';

interface SemesterMap3DProps {
  nodes: Semester3DNodeDTO[];
  onSelectNode: (node: Semester3DNodeDTO) => void;
}

function HolographicNode({
  node,
  onSelect
}: {
  node: Semester3DNodeDTO;
  onSelect: (node: Semester3DNodeDTO) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const statusColor = React.useMemo(() => {
    switch (node.status) {
      case 'SAFE': return '#10b981';      // Emerald
      case 'WARNING': return '#f59e0b';   // Amber
      case 'CRITICAL': return '#f43f5e';  // Rose
      case 'COMPLETED': return '#06b6d4'; // Cyan
      default: return '#3b82f6';
    }
  }, [node.status]);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.8;
      ringRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 2) * 0.2;
    }
  });

  return (
    <group position={node.position}>
      {/* Outer Holographic Ring */}
      <mesh ref={ringRef}>
        <torusGeometry args={[hovered ? 0.9 : 0.7, 0.02, 16, 32]} />
        <meshBasicMaterial color={statusColor} wireframe transparent opacity={0.7} />
      </mesh>

      {/* Core Node Sphere */}
      <mesh
        ref={meshRef}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
        onPointerOut={() => setHovered(false)}
        onClick={(e) => { e.stopPropagation(); onSelect(node); }}
      >
        <sphereGeometry args={[hovered ? 0.5 : 0.38, 32, 32]} />
        <meshStandardMaterial
          color={statusColor}
          emissive={statusColor}
          emissiveIntensity={hovered ? 1.2 : 0.6}
          roughness={0.2}
          metalness={0.8}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Floating 3D Text Label */}
      <Text
        position={[0, 0.9, 0]}
        fontSize={0.28}
        color={hovered ? '#06b6d4' : '#e2e8f0'}
        anchorX="center"
        anchorY="middle"
      >
        {node.label}
      </Text>

      {/* HTML Hover Overlay */}
      {hovered && (
        <Html position={[0, -0.8, 0]} center>
          <div className="glass-panel px-3 py-1.5 rounded-lg border border-cyan-500/40 text-xs shadow-xl pointer-events-none whitespace-nowrap bg-slate-900/90 text-cyan-300 font-mono-tech">
            <span className="font-bold text-white block">{node.category}</span>
            <span>{node.details}</span>
          </div>
        </Html>
      )}
    </group>
  );
}

function NodeConnections({ nodes }: { nodes: Semester3DNodeDTO[] }) {
  const lineMeshes = React.useMemo(() => {
    const centerNode = nodes.find(n => n.category === 'EXAM') || nodes[0];
    if (!centerNode) return [];

    return nodes.map(n => {
      if (n.id === centerNode.id) return null;
      const points = [
        new THREE.Vector3(...centerNode.position),
        new THREE.Vector3(...n.position)
      ];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: n.status === 'CRITICAL' ? '#f43f5e' : '#06b6d4',
        transparent: true,
        opacity: 0.35
      });
      return { id: n.id, lineObj: new THREE.Line(geometry, material) };
    }).filter(Boolean);
  }, [nodes]);

  return (
    <>
      {lineMeshes.map(item => item && (
        <primitive key={item.id} object={item.lineObj} />
      ))}
    </>
  );
}

export const SemesterMap3D: React.FC<SemesterMap3DProps> = ({ nodes, onSelectNode }) => {
  return (
    <div className="w-full h-[450px] relative rounded-xl overflow-hidden glass-panel border border-cyan-500/30">
      <div className="absolute top-3 left-4 z-10 flex items-center space-x-2 bg-slate-950/80 px-3 py-1 rounded-md border border-cyan-500/20 text-xs font-mono-tech text-cyan-400">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        <span>3D SEMESTER HOLOGRAPHIC MAP // ROTATE & CLICK NODES</span>
      </div>

      <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#06b6d4" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#6366f1" />
        
        {nodes.map(node => (
          <HolographicNode key={node.id} node={node} onSelect={onSelectNode} />
        ))}

        <NodeConnections nodes={nodes} />

        <OrbitControls
          enableZoom={true}
          maxDistance={18}
          minDistance={4}
          autoRotate={true}
          autoRotateSpeed={0.8}
        />
      </Canvas>

      <div className="absolute bottom-3 right-4 z-10 text-[11px] font-mono-tech text-slate-400 flex items-center gap-3 bg-slate-950/80 px-3 py-1 rounded-md border border-slate-800">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Safe</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Warning</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500" /> Critical</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-500" /> Completed</span>
      </div>
    </div>
  );
};
