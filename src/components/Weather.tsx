import { Cloud, Clouds } from '@react-three/drei';
import * as THREE from 'three';

export function Weather() {
  return (
    <Clouds material={THREE.MeshLambertMaterial}>
      <Cloud 
        seed={10} 
        bounds={[50, 20, 50]} 
        volume={10} 
        color="#f0f0f0" 
        position={[0, 500, -500]}
        opacity={0.4}
        speed={1}
      />
      <Cloud 
        seed={42} 
        bounds={[100, 30, 100]} 
        volume={20} 
        color="#e0e0e0" 
        position={[500, 1000, 500]}
        opacity={0.3}
        speed={0.5}
      />
       <Cloud 
        seed={7} 
        bounds={[100, 40, 100]} 
        volume={15} 
        color="#fff" 
        position={[-800, 800, -300]}
        opacity={0.5}
        speed={0.8}
      />
    </Clouds>
  );
}
