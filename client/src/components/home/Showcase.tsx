import { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { Line } from '@react-three/drei';
import { damp } from 'maath/easing';

interface Node {
  color: string;
  position: [number, number, number];
}

// Floating provider node
function ProviderNode({ color, position }: Node) {
  const ref = useRef<THREE.Mesh>(null!);
  const [x, y, z] = position;

  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.getElapsedTime() + (x + y) * 2;
      ref.current.position.y = y + Math.sin(t) * 0.3; // floating
      ref.current.rotation.y = Math.sin(t) * 0.5;     // subtle rotation
    }
  });

  return (
    <mesh ref={ref} position={[x, y, z]}>
      <sphereGeometry args={[0.3, 32, 32]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
    </mesh>
  );
}

// Connecting lines
function ConnectionLines({ nodes }: { nodes: Node[] }) {
  return (
    <>
      {nodes.map((node, idx) => (
        <Line
          key={idx}
          points={[
            [0, 0, 0], // central user node
            node.position
          ]}
          color={node.color}
          lineWidth={1}
          dashed={true}
          dashSize={0.2}
          gapSize={0.2}
        />
      ))}
    </>
  );
}

// Main animation
const SkillConnectShowcase = () => {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((_, delta) => {
    if (groupRef.current) {
      damp(groupRef.current.rotation, 'y', groupRef.current.rotation.y + delta * 0.05, 0.5, delta);
    }
  });

  const nodes: Node[] = useMemo(() => [
    { color: '#38bdf8', position: [2, 1, -1] },   // technical
    { color: '#f472b6', position: [-2, 0.5, 1.5] }, // creative
    { color: '#facc15', position: [1.5, -1, 2] }, // manual
    { color: '#34d399', position: [-1, 1.5, -2] }, // creative
    { color: '#fb7185', position: [0, -1.5, -1] }, // manual
  ], []);

  return (
    <group ref={groupRef}>
      {/* Central User Node */}
      <Sphere args={[0.7, 64, 64]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2} />
      </Sphere>

      {/* Provider Nodes */}
      {nodes.map((node, i) => (
        <ProviderNode key={i} {...node} />
      ))}

      {/* Connection Lines */}
      <ConnectionLines nodes={nodes} />
    </group>
  );
};

// Showcase Section
const Showcase = () => {
  return (
    <div className="bg-slate-900 h-[800px] w-full cursor-grab">
      <Canvas camera={{ position: [0, 2, 12], fov: 70 }}>
        <Suspense fallback={null}>
          {/* Background Stars */}
          <Stars radius={100} depth={80} count={5000} factor={4} saturation={0} fade speed={3} />

          <ambientLight intensity={0.6} />
          <pointLight position={[10, 10, 10]} intensity={4} />

          <SkillConnectShowcase />

          <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Showcase;
