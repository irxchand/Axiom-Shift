import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Text } from '@react-three/drei';
import * as THREE from 'three';
import type { KnowledgeConceptNodeDTO } from '../../types/dto';

interface KnowledgeGraph3DProps {
  concepts: KnowledgeConceptNodeDTO[];
  onConceptSelect?: (concept: KnowledgeConceptNodeDTO) => void;
}

function DarkAcademiaConceptNode({
  concept,
  onSelect
}: {
  concept: KnowledgeConceptNodeDTO;
  onSelect?: (concept: KnowledgeConceptNodeDTO) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const nodeColor = React.useMemo(() => {
    switch (concept.status) {
      case 'MASTERED': return '#2a3c2a';
      case 'REVIEW_NEEDED': return '#801c2e';
      case 'LOCKED': return '#1e1914';
      default: return '#c9a45c';
    }
  }, [concept.status]);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.25;
      meshRef.current.rotation.z = Math.sin(state.clock.getElapsedTime() + concept.position[0]) * 0.08;
    }
  });

  return (
    <group position={concept.position}>
      {/* Outer Ring */}
      <mesh>
        <torusGeometry args={[hovered ? 0.52 : 0.4, 0.018, 16, 32]} />
        <meshBasicMaterial color="#c9a45c" wireframe transparent opacity={0.65} />
      </mesh>

      {/* Central Node */}
      <mesh
        ref={meshRef}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
        onPointerOut={() => setHovered(false)}
        onClick={(e) => { e.stopPropagation(); onSelect?.(concept); }}
      >
        <cylinderGeometry args={[0.28, 0.28, 0.07, 16]} />
        <meshStandardMaterial
          color={nodeColor}
          roughness={0.35}
          metalness={0.45}
        />
      </mesh>

      {/* Concept Title Text */}
      <Text
        position={[0, 0.55, 0]}
        fontSize={0.22}
        color={hovered ? '#d4af37' : '#e8dcc8'}
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/cinzel/v23/8vIJ7ww63mVu7gt780w.woff"
      >
        {concept.title}
      </Text>

      {/* Hover Card */}
      {hovered && (
        <Html position={[0, -0.65, 0]} center>
          <div className="modern-card px-3.5 py-2.5 rounded-xl border border-[#c9a45c] text-xs shadow-2xl pointer-events-none w-48 text-[#d8cebe] font-sans">
            <div className="font-bold text-[#d4af37] flex justify-between items-center mb-1">
              <span>{concept.title}</span>
              <span className="text-[10px] text-[#f5ebe0] font-bold">{concept.masteryLevelPercent}%</span>
            </div>
            <p className="text-[11px] text-[#9a9082]">{concept.category}</p>
            <div className="w-full bg-[#0f0c0a] h-1.5 rounded-full mt-1.5 overflow-hidden border border-[#28211a]">
              <div className="bg-[#6b1d2f] h-full rounded-full" style={{ width: `${concept.masteryLevelPercent}%` }} />
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

function BrassConceptEdges({ concepts }: { concepts: KnowledgeConceptNodeDTO[] }) {
  const edgeLineObjects = React.useMemo(() => {
    const lines: Array<{ id: string; lineObj: THREE.Line }> = [];

    concepts.forEach(source => {
      source.connectedConceptIds.forEach(targetId => {
        const target = concepts.find(c => c.id === targetId);
        if (target) {
          const points = [
            new THREE.Vector3(...source.position),
            new THREE.Vector3(...target.position)
          ];
          const geometry = new THREE.BufferGeometry().setFromPoints(points);
          const color = source.status === 'MASTERED' && target.status === 'MASTERED' ? '#2a3c2a' : '#c9a45c';
          const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.55 });
          lines.push({
            id: `${source.id}-${target.id}`,
            lineObj: new THREE.Line(geometry, material)
          });
        }
      });
    });

    return lines;
  }, [concepts]);

  return (
    <>
      {edgeLineObjects.map(edge => (
        <primitive key={edge.id} object={edge.lineObj} />
      ))}
    </>
  );
}

export const KnowledgeGraph3D: React.FC<KnowledgeGraph3DProps> = ({ concepts, onConceptSelect }) => {
  return (
    <div className="w-full h-[400px] relative rounded-2xl overflow-hidden modern-card border border-[#28211a]">
      <div className="absolute top-3 left-4 z-10 flex items-center space-x-2 bg-[#14100c]/90 px-3 py-1 rounded-xl border border-[#28211a] text-xs font-sans text-[#d4af37] font-semibold shadow-md">
        <span>3D COURSE KNOWLEDGE NETWORK</span>
      </div>

      <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
        <ambientLight intensity={0.6} color="#e8dcc8" />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#d4af37" />
        
        {concepts.map(concept => (
          <DarkAcademiaConceptNode key={concept.id} concept={concept} onSelect={onConceptSelect} />
        ))}

        <BrassConceptEdges concepts={concepts} />

        <OrbitControls enableZoom={true} maxDistance={14} minDistance={3} />
      </Canvas>
    </div>
  );
};
