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

    // 2. Physics Logic - Controls
    const rotationSpeed = 1.5;
    plane.rotateX(pitchIn * PLANE_STATS.controlSensitivity.pitch * rotationSpeed * delta);
    plane.rotateZ(-rollIn * PLANE_STATS.controlSensitivity.roll * rotationSpeed * delta);
    plane.rotateY(yawIn * PLANE_STATS.controlSensitivity.yaw * rotationSpeed * delta);

    // Aerodynamics
    const currentSpeed = velocity.current.length();
    const normalizeSpeed = Math.max(0.1, currentSpeed);

    // Coordinate System Vectors
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(plane.quaternion);
    const up = new THREE.Vector3(0, 1, 0).applyQuaternion(plane.quaternion);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(plane.quaternion);
    
    // Relative Wind (assumed to be opposite of velocity)
    const velNorm = currentSpeed > 0.1 ? velocity.current.clone().normalize() : forward.clone();
    
    // Angle of Attack (AoA)
    // Angle between forward chord line and relative wind
    let aoa = 0;
    if (currentSpeed > 0.1) {
      const aoaCos = Math.max(-1, Math.min(1, forward.dot(velNorm)));
      aoa = Math.acos(aoaCos);
      // Determine sign (positive if wind is coming from below)
      const aoaSign = Math.sign(up.dot(velNorm)) * -1;
      aoa *= aoaSign;
    }

    // 1. Lift Calculation
    const stallAngleRad = THREE.MathUtils.degToRad(PLANE_STATS.stallAngleDeg);
    let liftCoeff = PLANE_STATS.liftCoefficientSlope * aoa;
    
    // Stall Characteristics
    let isStalling = false;
    if (Math.abs(aoa) > stallAngleRad) {
      isStalling = true;
      // Sharp drop in lift after stall peak
      const stallFactor = Math.exp(-5 * (Math.abs(aoa) - stallAngleRad));
      liftCoeff *= 0.3 * stallFactor;
    }

    // Ground Effect
    // Increases lift and reduces induced drag within one wingspan of ground
    const altitudeMeters = Math.max(0.1, plane.position.y - 2);
    const hOverB = altitudeMeters / PLANE_STATS.wingspan;
    const groundEffectFactor = Math.max(0, Math.min(1, Math.pow((16 * hOverB) / (1 + 16 * hOverB), 2)));
    
    // Ground effect on lift slope
    const geLiftSlopeBoost = hOverB < 1.0 ? 1 / (1 - 0.1 / hOverB) : 1;
    const effectiveLiftCoeff = liftCoeff * Math.min(1.2, geLiftSlopeBoost);

    const rho = 1.225; // Sea level air density
    const liftMag = 0.5 * rho * Math.pow(currentSpeed, 2) * PLANE_STATS.wingArea * effectiveLiftCoeff;
    
    // Lift direction: Perpendicular to velocity and wing axis
    const liftDir = new THREE.Vector3().crossVectors(velNorm, right).normalize();
    const lift = liftDir.multiplyScalar(liftMag * delta);
    velocity.current.add(lift);

    // 2. Drag Calculation (Parasitic + Induced)
    // Induced Drag: Di = Cl^2 / (pi * AR * e)
    let inducedDragCoeff = (Math.pow(effectiveLiftCoeff, 2)) / (Math.PI * PLANE_STATS.aspectRatio * PLANE_STATS.oswaldEfficiency);
    
    // Ground effect significantly reduces induced drag
    inducedDragCoeff *= groundEffectFactor;

    // Stall increases drag significantly (pressure drag)
    const stallDrag = isStalling ? Math.abs(aoa) * 0.5 : 0;
    
    const totalDragCoeff = PLANE_STATS.dragCoefficientZero + inducedDragCoeff + stallDrag;
    const dragMag = 0.5 * rho * Math.pow(currentSpeed, 2) * PLANE_STATS.wingArea * totalDragCoeff;
    const drag = velNorm.clone().multiplyScalar(-dragMag * delta);
    velocity.current.add(drag);

    // 3. Thrust
    const thrust = forward.clone().multiplyScalar(throttleRef.current * PLANE_STATS.thrustMax * delta);
    velocity.current.add(thrust.divideScalar(PLANE_STATS.mass)); // Force to acceleration

    // 4. Gravity
    const gravity = new THREE.Vector3(0, -9.81 * delta, 0);
    velocity.current.add(gravity);

    // Apply Velocity
    const displacement = velocity.current.clone().multiplyScalar(delta);
    plane.position.add(displacement);

    // Ground collision & Rolling
    const onGround = plane.position.y <= 2.1;
    if (onGround) {
       // Damage on hard landing
       if (velocity.current.y < -5) { // If falling faster than 5m/s
         const { takeDamage } = useGameStore.getState();
         takeDamage(Math.round(Math.abs(velocity.current.y) * 5));
       }

       plane.position.y = 2.1;
       velocity.current.y = Math.max(0, velocity.current.y);
       
       // Friction & Braking
       const friction = keys.brake ? 0.95 : 0.99;
       velocity.current.multiplyScalar(friction);
       
       // Align to ground pitch if slow (simulating landing gear compression)
       if (currentSpeed < 15) {
         plane.rotation.x = THREE.MathUtils.lerp(plane.rotation.x, 0, delta * 3);
         plane.rotation.z = THREE.MathUtils.lerp(plane.rotation.z, 0, delta * 3);
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
