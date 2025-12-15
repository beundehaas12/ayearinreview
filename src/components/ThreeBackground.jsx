import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const HorizontalTunnel = ({ scrollY, activeColor }) => {
    const group = useRef();
    const mesh = useRef();
    const materialRef = useRef();
    const count = 1200; // Slightly more density
    const dummy = useMemo(() => new THREE.Object3D(), []);

    // Layout
    const particles = useMemo(() => new Array(count).fill().map(() => ({
        x: (Math.random() - 0.5) * 250, // Wider
        y: (Math.random() - 0.5) * 80, // Much vertical spread
        z: (Math.random() - 0.5) * 60, // Deeper depth
        rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0],
        scale: Math.random() * 0.5 + 0.1, // Smaller variants
        speed: Math.random() * 0.2,
        phase: Math.random() * Math.PI * 2
    })), []);

    const targetColor = useRef(new THREE.Color('#00f3ff'));

    useEffect(() => {
        let colorHex = activeColor;
        if (activeColor && activeColor.startsWith('var(--')) {
            const varName = activeColor.match(/var\(([^)]+)\)/)[1];
            colorHex = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
        }
        if (colorHex) {
            targetColor.current.set(colorHex);
        }
    }, [activeColor]);

    const mouse = useRef({ x: 0, y: 0 });
    const lastScroll = useRef(0);
    const velocity = useRef(0);

    useFrame((state) => {
        const time = state.clock.getElapsedTime();

        // Color Lerp
        if (materialRef.current) {
            materialRef.current.color.lerp(targetColor.current, 0.02); // Slower transition
            materialRef.current.emissive.lerp(targetColor.current, 0.02);
        }

        // Mouse Parallax
        mouse.current.x = THREE.MathUtils.lerp(mouse.current.x, state.mouse.x, 0.05);
        mouse.current.y = THREE.MathUtils.lerp(mouse.current.y, state.mouse.y, 0.05);

        if (group.current) {
            group.current.rotation.y = mouse.current.x * 0.02; // Very subtle rotation
            group.current.rotation.x = -mouse.current.y * 0.02;
        }

        // Scroll Velocity & Warp
        const currentScroll = scrollY.get();
        const delta = currentScroll - lastScroll.current;
        lastScroll.current = currentScroll;

        // Dampen velocity
        velocity.current = THREE.MathUtils.lerp(velocity.current, delta, 0.1);

        // Base drift
        const baseSpeed = time * 2;
        const scrollOffset = currentScroll * 0.05;

        particles.forEach((particle, i) => {
            // Horizontal scroll + Warp speed
            let currentX = particle.x - scrollOffset;

            // Loop functionality
            const range = 250;
            currentX = ((currentX % range) + range) % range;
            currentX -= 125;

            // Floating
            const floatY = Math.sin(time * 0.5 + particle.phase) * (2 + Math.abs(velocity.current * 0.1));
            const floatZ = Math.cos(time * 0.3 + particle.phase) * (2 + Math.abs(velocity.current * 0.1));

            dummy.position.set(currentX, particle.y + floatY, particle.z + floatZ);

            // Rotation based on time
            dummy.rotation.set(
                particle.rotation[0] + time * 0.2,
                particle.rotation[1] + time * 0.2,
                particle.rotation[2]
            );

            // Warp effect: Stretch on Z axis based on velocity
            // As you scroll fast, they stretch like "stars"
            const warp = 1 + Math.abs(velocity.current * 0.05);
            dummy.scale.set(particle.scale * warp, particle.scale, particle.scale);

            dummy.updateMatrix();
            mesh.current.setMatrixAt(i, dummy.matrix);
        });
        mesh.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <group ref={group}>
            <instancedMesh ref={mesh} args={[null, null, count]}>
                <octahedronGeometry args={[0.08, 0]} />
                <meshPhysicalMaterial
                    ref={materialRef}
                    color="#00f3ff"
                    emissive="#000000"
                    emissiveIntensity={2.0}
                    transmission={1}
                    opacity={0.3}
                    transparent
                    roughness={0}
                    thickness={0.5}
                />
            </instancedMesh>
        </group>
    );
};

export default function ThreeBackground({ scrollY, maxScroll, activeColor = '#00f3ff' }) {
    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1, background: '#020202' }}>
            <Canvas camera={{ position: [0, 0, 15], fov: 75 }} gl={{ antialias: false }}>
                <fog attach="fog" args={['#020202', 5, 40]} /> {/* Closer fog for depth */}
                <ambientLight intensity={0.2} />
                <pointLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ffffff" />

                <HorizontalTunnel scrollY={scrollY} activeColor={activeColor} />
            </Canvas>
        </div>
    );
}
