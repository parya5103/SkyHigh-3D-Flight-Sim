import React, { useEffect, useRef, useState } from 'react';
import { Viewer, Entity, Scene, Globe, CameraFlyTo, Cesium3DTileset, ImageryLayer } from 'resium';
import * as Cesium from 'cesium';
import { useGameStore } from '../store/gameStore';
import { MISSIONS, AIRCRAFT_MODELS } from '../lib/constants';

// Cesium ION Token (Placeholder - should be provided by user)
Cesium.Ion.defaultAccessToken = process.env.CESIUM_ION_TOKEN || '';

export function CesiumScene() {
  const isPlaying = useGameStore((state) => state.isPlaying);
  const telemetry = useGameStore((state) => state.telemetry);
  const selectedCity = useGameStore((state) => state.selectedCity);
  const aiTraffic = useGameStore((state) => state.aiTraffic);
  
  const viewerRef = useRef<any>(null);

  // Convert telemetry to Cesium Cartesian3
  // In a real simulator, we'd use local ENU coordinates or direct Lat/Lng
  const playerPosition = Cesium.Cartesian3.fromDegrees(
    selectedCity?.lng || -122.4194,
    selectedCity?.lat || 37.7749,
    telemetry.altitude * 0.3048 // Converting FT to Meters for Cesium
  );

  // Calculate orientation
  const hpr = new Cesium.HeadingPitchRoll(
     telemetry.yaw, 
     telemetry.pitch, 
     telemetry.roll
  );
  const orientation = Cesium.Transforms.headingPitchRollQuaternion(playerPosition, hpr);

  return (
    <div className="w-full h-full relative">
       <Viewer
         ref={viewerRef}
         full
         animation={false}
         baseLayerPicker={false}
         fullscreenButton={false}
         vrButton={false}
         geocoder={false}
         homeButton={false}
         infoBox={false}
         sceneModePicker={false}
         selectionIndicator={false}
         timeline={false}
         navigationHelpButton={false}
         scene3DOnly={true}
       >
         <Scene 
            requestRenderMode={true} 
            maximumRenderTimeChange={Infinity} 
         />
         <Globe 
            enableLighting={true}
            showGroundAtmosphere={true}
            maximumScreenSpaceError={2} // LOD Control: High quality
         />

         {/* Photoreal Reality Layer (Requires Cesium Ion Token) */}
         {Cesium.Ion.defaultAccessToken && (
           <Cesium3DTileset url={Cesium.IonResource.fromAssetId(96471)} />
         )}

         {/* Fallback Terrain/Imagery */}
         <ImageryLayer imageryProvider={new Cesium.OpenStreetMapImageryProvider({
            url: "https://a.tile.openstreetmap.org/"
         })} />

         {/* Player Aircraft */}
         {isPlaying && (
           <Entity
             position={playerPosition}
             orientation={orientation}
             model={{
               uri: "/models/airliner.glb", // Placeholder local dist path
               minimumPixelSize: 64,
               maximumScale: 20000,
               silhouetteColor: Cesium.Color.AQUA.withAlpha(0.2),
               silhouetteSize: 1,
             }}
           />
         )}

         {/* AI Traffic with Instancing (Cesium automatically optimizes recurring model entities) */}
         {aiTraffic.map((ai) => (
            <Entity
              key={ai.id}
              position={Cesium.Cartesian3.fromDegrees(
                 (selectedCity?.lng || 0) + ai.position[0]/100000, // Relative mock positioning
                 (selectedCity?.lat || 0) + ai.position[1]/100000,
                 ai.position[2] * 0.3048
              )}
              model={{
                uri: ai.type === 'AIRLINER' ? "/models/commercial.glb" : "/models/private.glb",
                minimumPixelSize: 32,
                scale: 1.0,
              }}
            />
         ))}

         {/* Mission Indicators */}
         {MISSIONS.map(mission => (
           <Entity
             key={mission.id}
             position={Cesium.Cartesian3.fromDegrees(mission.target.lng, mission.target.lat, 0)}
             point={{ pixelSize: 10, color: Cesium.Color.CYAN }}
             label={{
               text: mission.title,
               font: "10px JetBrains Mono",
               fillColor: Cesium.Color.CYAN,
               outlineColor: Cesium.Color.BLACK,
               outlineWidth: 2,
               style: Cesium.LabelStyle.FILL_AND_OUTLINE,
               verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
               pixelOffset: new Cesium.Cartesian2(0, -20),
             }}
           />
         ))}
       </Viewer>

       {/* Camera logic needs to follow the plane in 3D scene */}
       <CesiumFollowCamera 
          viewer={viewerRef.current?.cesiumElement}
          position={playerPosition} 
          hpr={hpr}
          active={isPlaying}
       />
    </div>
  );
}

function CesiumFollowCamera({ viewer, position, hpr, active }: { viewer: any, position: any, hpr: any, active: boolean }) {
   useEffect(() => {
      if (!viewer || !active) return;
      
      // Set camera to follow the point with an offset
      viewer.camera.lookAt(
         position, 
         new Cesium.Cartesian3(-50.0, 0.0, 20.0) // Offset from plane (Behind and slightly above)
      );
      
      // Allow user to rotate camera around the point if they want, 
      // but for sim we usually want it fixed relative to the plane
      // viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY); 
   }, [viewer, position, active]);
   
   return null;
}
