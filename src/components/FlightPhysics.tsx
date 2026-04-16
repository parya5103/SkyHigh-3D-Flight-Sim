import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useKeyboardControls } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../store/gameStore';
import { PLANE_STATS } from '../lib/constants';

// Simple Aerodynamic model
export function FlightPhysics({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);
  const velocity = useRef(new THREE.Vector3(0, 0, 0));
  const [, get] = useKeyboardControls();
  const updateTelemetry = useGameStore((state) => state.updateTelemetry);
  const isPlaying = useGameStore((state) => state.isPlaying);

  // Stats
  const throttleRef = useRef(0);
  const fuelRef = useRef(100);

  useEffect(() => {
    if (isPlaying) {
      velocity.current.set(0, 0, 0);
      throttleRef.current = 0;
    }
  }, [isPlaying]);

  useFrame((state, delta) => {
    if (!isPlaying || !group.current) return;

    const keys = get() as any;
    const plane = group.current;

    // 1. Controls
    // Throttle
    if (keys.throttleUp) throttleRef.current = Math.min(1, throttleRef.current + delta * 0.5);
    if (keys.throttleDown) throttleRef.current = Math.max(0, throttleRef.current - delta * 0.5);

    // Rotation inputs
    const pitchIn = (keys.pitchDown ? 1 : 0) - (keys.pitchUp ? 1 : 0);
    const rollIn = (keys.rollRight ? 1 : 0) - (keys.rollLeft ? 1 : 0);
    const yawIn = (keys.yawLeft ? 1 : 0) - (keys.yawRight ? 1 : 0);

    // 2. Physics Logic
    // Apply Rotation
    const rotationSpeed = 1.5;
    plane.rotateX(pitchIn * PLANE_STATS.controlSensitivity.pitch * rotationSpeed * delta);
    plane.rotateZ(-rollIn * PLANE_STATS.controlSensitivity.roll * rotationSpeed * delta);
    plane.rotateY(yawIn * PLANE_STATS.controlSensitivity.yaw * rotationSpeed * delta);

    // Get current vectors
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(plane.quaternion);
    const up = new THREE.Vector3(0, 1, 0).applyQuaternion(plane.quaternion);
    
    // Speed projection on forward vector
    const currentSpeed = velocity.current.length();

    // Forces
    // Thrust
    const thrust = forward.clone().multiplyScalar(throttleRef.current * PLANE_STATS.thrustMax * delta * 0.05);
    velocity.current.add(thrust);

    // Lift
    // Lift = 0.5 * rho * v^2 * S * Cl
    // Rho (air density) ~ 1.225 at sea level
    const liftMagnitude = 0.5 * 1.225 * Math.pow(currentSpeed, 2) * PLANE_STATS.wingArea * 0.1; // Simplified Cl
    const lift = up.clone().multiplyScalar(liftMagnitude * delta);
    velocity.current.add(lift);

    // Drag
    const dragMagnitude = 0.5 * 1.225 * Math.pow(currentSpeed, 2) * 0.5 * 0.2; // Simplified Cd
    const drag = velocity.current.clone().normalize().multiplyScalar(-dragMagnitude * delta);
    velocity.current.add(drag);

    // Gravity
    const gravity = new THREE.Vector3(0, -9.81 * delta * 0.5, 0); // Scaled for playability
    velocity.current.add(gravity);

    // Apply Velocity
    plane.position.add(velocity.current.clone().multiplyScalar(delta * 10));

    // Ground collision & Rolling
    const onGround = plane.position.y <= 2.1;
    if (onGround) {
       plane.position.y = 2.1;
       velocity.current.y = Math.max(0, velocity.current.y);
       
       // Friction & Braking
       const friction = keys.brake ? 0.9 : 0.98;
       velocity.current.multiplyScalar(friction);
       
       // Align to ground pitch if slow
       if (currentSpeed < 10) {
         plane.rotation.x = THREE.MathUtils.lerp(plane.rotation.x, 0, delta * 2);
         plane.rotation.z = THREE.MathUtils.lerp(plane.rotation.z, 0, delta * 2);
       }
    }

    // 3. Telemetry Update
    updateTelemetry({
      speed: Math.round(currentSpeed * 3.6), // km/h
      altitude: Math.round((plane.position.y - 2) * 3.28084), // feet above ground
      throttle: Math.round(throttleRef.current * 100),
      pitch: Math.round(THREE.MathUtils.radToDeg(plane.rotation.x)),
      roll: Math.round(THREE.MathUtils.radToDeg(plane.rotation.z)),
      yaw: Math.round(THREE.MathUtils.radToDeg(plane.rotation.y)),
      gearDown: plane.position.y < 50, // Auto gear for simplicity
    });
  });

  return (
    <group ref={group}>
      {children}
    </group>
  );
}
