import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { TilesRenderer } from '3d-tiles-renderer';
import * as THREE from 'three';
import { useGameStore } from '../store/gameStore';

// ECEF conversion helper
function latLongToECEF(lat: number, lon: number, alt: number) {
  const a = 6378137;
  const eSq = 6.69437999014e-3;
  const phi = (lat * Math.PI) / 180;
  const lambda = (lon * Math.PI) / 180;
  const N = a / Math.sqrt(1 - eSq * Math.sin(phi) * Math.sin(phi));
  const x = (N + alt) * Math.cos(phi) * Math.cos(lambda);
  const y = (N + alt) * Math.cos(phi) * Math.sin(lambda);
  const z = (N * (1 - eSq) + alt) * Math.sin(phi);
  return new THREE.Vector3(x, z, -y); // Y-Up scene conversion
}

export function MapLayer() {
  const { scene, camera, gl } = useThree();
  const tilesRef = useRef<TilesRenderer | null>(null);
  const selectedCity = useGameStore((state) => state.selectedCity);

  useEffect(() => {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY || '';
    if (!apiKey || !selectedCity) return;

    const url = `https://tile.googleapis.com/v1/3dtiles/root.json?key=${apiKey}`;
    const tiles = new TilesRenderer(url);
    
    tiles.setCamera(camera);
    tiles.setResolutionFromRenderer(camera, gl);
    
    // Position tileset so city is at origin
    const cityECEF = latLongToECEF(selectedCity.lat, selectedCity.lng, 0);
    tiles.group.position.copy(cityECEF).multiplyScalar(-1);
    
    // Orient tileset correctly (simplified rotation for local plane)
    // In a full implementation, we'd apply the Up vector rotation
    tiles.group.rotation.set(-Math.PI / 2, 0, 0);

    tilesRef.current = tiles;
    scene.add(tiles.group);

    return () => {
      scene.remove(tiles.group);
      tiles.dispose();
    };
  }, [selectedCity, scene, camera, gl]);

  useFrame(() => {
    if (tilesRef.current) {
      tilesRef.current.update();
    }
  });

  return null;
}
