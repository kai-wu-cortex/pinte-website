
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { X, MousePointer2, AlertCircle, Loader2 } from 'lucide-react';
import * as THREE from 'three';

interface Scene {
  id: string;
  name: string;
  image: string; 
  hotspots: Hotspot[];
}

interface Hotspot {
  id: string;
  x: number; // Percent 0-100 (Longitude)
  y: number; // Percent 0-100 (Latitude)
  label: string;
  targetSceneId: string;
}

// Safe fallback image (Unsplash) if the user's custom image fails completely
const SAFE_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1557971370-e7298ed473ab?q=80&w=2560&auto=format&fit=crop';

// Mock Data for Factory Scenes
const SCENES: Record<string, Scene> = {
  'lobby': {
    id: 'lobby',
    name: 'Factory Entrance',
    // High-res image provided by user
    image: 'https://cos.pintecl.com/pano/AGC_20260104_111134262.PHOTOSPHERE%20%282%29.jpg', 
    hotspots: [
      { id: 'h1', x: 25, y: 55, label: 'Go to Production Line', targetSceneId: 'production' },
      { id: 'h2', x: 75, y: 55, label: 'Visit Showroom', targetSceneId: 'showroom' }
    ]
  },
  'production': {
    id: 'production',
    name: 'Coating Production Line',
    image: 'https://cos.pintecl.com/pano/AGC_20260104_112425867.PHOTOSPHERE%20%282%29.jpg',
    hotspots: [
      { id: 'p1', x: 50, y: 70, label: 'Back to Lobby', targetSceneId: 'lobby' },
      { id: 'p2', x: 90, y: 50, label: 'Go to Warehouse', targetSceneId: 'warehouse' }
    ]
  },
  'warehouse': {
    id: 'warehouse',
    name: 'Logistics Warehouse',
    image: 'https://cos.pintecl.com/pano/AGC_20260104_112622403.PHOTOSPHERE%20%282%29.jpg',
    hotspots: [
      { id: 'w1', x: 10, y: 60, label: 'Back to Production', targetSceneId: 'production' }
    ]
  },
  'showroom': {
    id: 'showroom',
    name: 'Product Showroom',
    image: 'https://cos.pintecl.com/pano/AGC_20260104_112832421.PHOTOSPHERE%20%282%29.jpg',
    hotspots: [
      { id: 's1', x: 50, y: 60, label: 'Exit to Lobby', targetSceneId: 'lobby' }
    ]
  },
  'showroom2': {
    id: 'showroom2',
    name: 'Product Showroom 2',
    image: 'https://cos.pintecl.com/pano/AGC_20260104_113103477.PHOTOSPHERE%20%282%29.jpg',
    hotspots: [
      { id: 's1', x: 50, y: 60, label: 'Exit to Lobby', targetSceneId: 'lobby' }
    ]
  },
  'showroom3': {
    id: 'showroom3',
    name: 'Product Showroom 3',
    image: 'https://cos.pintecl.com/pano/AGC_20260104_113426100.PHOTOSPHERE%20%282%29.jpg',
    hotspots: [
      { id: 's1', x: 50, y: 60, label: 'Exit to Lobby', targetSceneId: 'lobby' }
    ]
  },
  'showroom4': {
    id: 'showroom4',
    name: 'Product Showroom 4',
    image: 'https://cos.pintecl.com/pano/AGC_20260104_113829272.PHOTOSPHERE%20%282%29.jpg',
    hotspots: [
      { id: 's1', x: 50, y: 60, label: 'Exit to Lobby', targetSceneId: 'lobby' }
    ]
  }
};

interface FactoryTour360Props {
  onClose: () => void;
}

const FactoryTour360: React.FC<FactoryTour360Props> = ({ onClose }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [currentSceneId, setCurrentSceneId] = useState<string>('lobby');
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hoveredHotspot, setHoveredHotspot] = useState<{ x: number, y: number, label: string } | null>(null);
  const [cursorCoords, setCursorCoords] = useState<{ x: number; y: number; screenX: number; screenY: number } | null>(null);
  
  // Refs for Three.js objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sphereRef = useRef<THREE.Mesh | null>(null);
  const hotspotsGroupRef = useRef<THREE.Group | null>(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  
  // Interaction Refs
  const isDragging = useRef(false);
  const isUserInteracting = useRef(false);
  const onMouseDownMouseX = useRef(0);
  const onMouseDownMouseY = useRef(0);
  const lonRef = useRef(0);
  const onMouseDownLon = useRef(0);
  const latRef = useRef(0);
  const onMouseDownLat = useRef(0);
  const phiRef = useRef(0);
  const thetaRef = useRef(0);
  const clickStartTime = useRef(0);

  const currentScene = SCENES[currentSceneId];

  // Helper to create hotspot texture on the fly
  const createHotspotTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.arc(32, 32, 16, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(59, 130, 246, 0.8)'; // pinte-blue with opacity
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.stroke();
      
      // Inner dot
      ctx.beginPath();
      ctx.arc(32, 32, 6, 0, 2 * Math.PI);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }
    return new THREE.CanvasTexture(canvas);
  }, []);

  // --- CORE IMAGE LOADER (Resizes and returns Texture) ---
  const loadAndProcessImage = async (url: string, renderer: THREE.WebGLRenderer): Promise<THREE.Texture> => {
    const loader = new THREE.ImageLoader();
    loader.setCrossOrigin('anonymous');

    return new Promise((resolve, reject) => {
        loader.load(
            url,
            (image) => {
                // Resize Logic for Big Textures (8k -> 4k on mobile/standard gpu)
                const maxTextureSize = renderer.capabilities.maxTextureSize;
                let finalImage: HTMLImageElement | HTMLCanvasElement = image;

                if (image.width > maxTextureSize || image.height > maxTextureSize) {
                    const scale = Math.min(maxTextureSize / image.width, maxTextureSize / image.height);
                    const width = Math.floor(image.width * scale);
                    const height = Math.floor(image.height * scale);
                    
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.drawImage(image, 0, 0, width, height);
                        finalImage = canvas;
                    }
                }

                const texture = new THREE.Texture(finalImage);
                texture.colorSpace = THREE.SRGBColorSpace;
                texture.minFilter = THREE.LinearFilter;
                texture.generateMipmaps = false;
                texture.needsUpdate = true;
                resolve(texture);
            },
            undefined,
            (e) => {
                // Ensure we pass a proper Error object or string
                reject(e instanceof Error ? e : new Error('Image Load Error'));
            }
        );
    });
  };

  // --- ORCHESTRATOR: Direct -> Proxy -> Fallback ---
  const getTextureForScene = async (url: string, renderer: THREE.WebGLRenderer) => {
      // 1. Attempt Direct Load
      try {
          return await loadAndProcessImage(url, renderer);
      } catch (e) {
        console.warn(e);
          console.warn("Direct load failed (CORS?), attempting proxy...");
      }

      // 2. Attempt Proxy Load
      try {
          const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
          return await loadAndProcessImage(proxyUrl, renderer);
      } catch (e) {
          console.warn("Proxy load failed, switching to fallback image.");
          setLoadError("Network: Custom image failed. Showing demo.");
      }

      // 3. Fallback (If both above fail, return this so app doesn't crash)
      return await loadAndProcessImage(SAFE_FALLBACK_IMAGE, renderer);
  };

  useEffect(() => {
    if (!mountRef.current) return;

    try {
        // --- 1. Setup Scene ---
        const scene = new THREE.Scene();
        sceneRef.current = scene;

        // --- 2. Setup Camera ---
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.set(0, 0, 0.1); // Slight offset to ensure we are inside
        cameraRef.current = camera;

        // --- 3. Setup Renderer ---
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(width, height);
        mountRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // --- 4. Create Sphere Geometry ---
        const geometry = new THREE.SphereGeometry(500, 60, 40);
        geometry.scale(-1, 1, 1); // Invert to view from inside
        // Initial material (dark grey until texture loads)
        const material = new THREE.MeshBasicMaterial({ color: 0x222222 }); 
        const sphere = new THREE.Mesh(geometry, material);
        scene.add(sphere);
        sphereRef.current = sphere;

        // --- 5. Hotspots Group ---
        const hotspotsGroup = new THREE.Group();
        scene.add(hotspotsGroup);
        hotspotsGroupRef.current = hotspotsGroup;

        // --- 6. Event Listeners ---
        const onPointerDown = (clientX: number, clientY: number) => {
            isUserInteracting.current = true;
            isDragging.current = false;
            onMouseDownMouseX.current = clientX;
            onMouseDownMouseY.current = clientY;
            onMouseDownLon.current = lonRef.current;
            onMouseDownLat.current = latRef.current;
            clickStartTime.current = Date.now();
        };

        const onPointerMove = (clientX: number, clientY: number) => {
            if (isUserInteracting.current === true) {
                isDragging.current = true;
                lonRef.current = (onMouseDownMouseX.current - clientX) * 0.1 + onMouseDownLon.current;
                latRef.current = (clientY - onMouseDownMouseY.current) * 0.1 + onMouseDownLat.current;
            }

            if (cameraRef.current && mountRef.current) {
                const rect = mountRef.current.getBoundingClientRect();
                mouseRef.current.x = ((clientX - rect.left) / rect.width) * 2 - 1;
                mouseRef.current.y = -((clientY - rect.top) / rect.height) * 2 + 1;

                // --- NEW: Calculate Coordinates for Debugging ---
                // We reuse the raycaster to hit the sphere and get UVs
                if (sphereRef.current) {
                    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
                    const intersects = raycasterRef.current.intersectObject(sphereRef.current);
                    if (intersects.length > 0) {
                        const uv = intersects[0].uv;
                        if (uv) {
                            // Convert UV to our hotspot percentage system
                            // X = UV.x * 100
                            // Y = (1 - UV.y) * 100 (Since V=1 is top, but our system Y=0 is top/North)
                            const pX = Math.round(uv.x * 100);
                            const pY = Math.round((1 - uv.y) * 100);
                            setCursorCoords({ x: pX, y: pY, screenX: clientX, screenY: clientY });
                        }
                    } else {
                        setCursorCoords(null);
                    }
                }
            }
        };

        const onPointerUp = (clientX: number, clientY: number) => {
            isUserInteracting.current = false;
            
            // Detect Click (if not dragged significantly and short duration)
            const dist = Math.sqrt(Math.pow(clientX - onMouseDownMouseX.current, 2) + Math.pow(clientY - onMouseDownMouseY.current, 2));
            const duration = Date.now() - clickStartTime.current;

            if (dist < 5 && duration < 300) {
                handleRaycastClick();
            }
        };

        // --- NEW: Zoom Functionality ---
        const onWheel = (e: WheelEvent) => {
            if (cameraRef.current) {
                e.preventDefault();
                // Adjust FOV
                const fov = cameraRef.current.fov + e.deltaY * 0.05;
                // Clamp FOV between 30 (zoomed in) and 100 (wide angle)
                cameraRef.current.fov = THREE.MathUtils.clamp(fov, 30, 100);
                cameraRef.current.updateProjectionMatrix();
            }
        };

        // Mouse Events
        const onMouseDown = (e: MouseEvent) => onPointerDown(e.clientX, e.clientY);
        const onMouseMove = (e: MouseEvent) => onPointerMove(e.clientX, e.clientY);
        const onMouseUp = (e: MouseEvent) => onPointerUp(e.clientX, e.clientY);

        // Touch Events
        const onTouchStart = (e: TouchEvent) => {
            if (e.touches.length === 1) onPointerDown(e.touches[0].clientX, e.touches[0].clientY);
        };
        const onTouchMove = (e: TouchEvent) => {
            if (e.touches.length === 1) onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
        };
        const onTouchEnd = (e: TouchEvent) => {
             if (isDragging.current === false) handleRaycastClick();
             isUserInteracting.current = false;
        };

        const onWindowResize = () => {
            if (cameraRef.current && rendererRef.current && mountRef.current) {
                const w = mountRef.current.clientWidth;
                const h = mountRef.current.clientHeight;
                cameraRef.current.aspect = w / h;
                cameraRef.current.updateProjectionMatrix();
                rendererRef.current.setSize(w, h);
            }
        };

        const domEl = renderer.domElement;
        domEl.style.touchAction = 'none'; // Prevent scrolling on mobile
        domEl.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        domEl.addEventListener('touchstart', onTouchStart, { passive: false });
        domEl.addEventListener('touchmove', onTouchMove, { passive: false });
        domEl.addEventListener('touchend', onTouchEnd);
        domEl.addEventListener('wheel', onWheel, { passive: false }); // Add Zoom Listener
        window.addEventListener('resize', onWindowResize);

        // --- 7. Animation Loop ---
        let frameId: number;
        const animate = () => {
            frameId = requestAnimationFrame(animate);

            if (!cameraRef.current || !rendererRef.current || !sceneRef.current) return;

            // Update Camera Rotation
            latRef.current = Math.max(-85, Math.min(85, latRef.current));
            phiRef.current = THREE.MathUtils.degToRad(90 - latRef.current);
            thetaRef.current = THREE.MathUtils.degToRad(lonRef.current);

            const target = new THREE.Vector3();
            target.x = 500 * Math.sin(phiRef.current) * Math.cos(thetaRef.current);
            target.y = 500 * Math.cos(phiRef.current);
            target.z = 500 * Math.sin(phiRef.current) * Math.sin(thetaRef.current);
            cameraRef.current.lookAt(target);

            // Animate Hotspots (Pulse effect)
            if (hotspotsGroupRef.current) {
                const time = Date.now() * 0.003;
                hotspotsGroupRef.current.children.forEach((child) => {
                    const scale = 1 + Math.sin(time) * 0.1;
                    child.scale.set(60 * scale, 60 * scale, 1);
                });
            }

            // Raycasting for Hover (Hotspots only)
            // Note: Coordinate raycasting happens in onPointerMove for efficiency
            raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
            if (hotspotsGroupRef.current) {
                const intersects = raycasterRef.current.intersectObjects(hotspotsGroupRef.current.children);
                if (intersects.length > 0) {
                    domEl.style.cursor = 'pointer';
                    const userData = intersects[0].object.userData;
                    
                    const vector = intersects[0].object.position.clone();
                    vector.project(cameraRef.current);
                    const w = mountRef.current!.clientWidth;
                    const h = mountRef.current!.clientHeight;
                    const x = (vector.x * .5 + .5) * w;
                    const y = (-(vector.y * .5) + .5) * h;
                    setHoveredHotspot({ x, y, label: userData.label });
                } else {
                    domEl.style.cursor = 'move';
                    setHoveredHotspot(null);
                }
            }

            rendererRef.current.render(sceneRef.current, cameraRef.current);
        };
        animate();

        // Cleanup
        return () => {
            cancelAnimationFrame(frameId);
            domEl.removeEventListener('mousedown', onMouseDown);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            domEl.removeEventListener('touchstart', onTouchStart);
            domEl.removeEventListener('touchmove', onTouchMove);
            domEl.removeEventListener('touchend', onTouchEnd);
            domEl.removeEventListener('wheel', onWheel);
            window.removeEventListener('resize', onWindowResize);
            
            if (mountRef.current && renderer.domElement) {
                mountRef.current.removeChild(renderer.domElement);
            }
            geometry.dispose();
            material.dispose();
        };
    } catch (err) {
        console.error("Three.js Init Error:", err);
        setLoadError("Failed to initialize 3D view.");
    }
  }, []);

  // Handler for Click Raycasting
  const handleRaycastClick = () => {
      if (!raycasterRef.current || !hotspotsGroupRef.current || !cameraRef.current) return;
      
      const intersects = raycasterRef.current.intersectObjects(hotspotsGroupRef.current.children);
      if (intersects.length > 0) {
          const targetId = intersects[0].object.userData.targetSceneId;
          if (targetId && SCENES[targetId]) {
              handleSceneChange(targetId);
          }
      }
  };

  // Update Texture & Hotspots when scene changes
  useEffect(() => {
    let isMounted = true;
    if (!rendererRef.current || !sphereRef.current) return;

    setIsLoaded(false);
    setLoadError(null);
    setHoveredHotspot(null);

    const updateScene = async () => {
        try {
            // Waterfall Strategy: Direct -> Proxy -> Fallback
            // This function handles catching internally and returning a valid texture
            const texture = await getTextureForScene(currentScene.image, rendererRef.current!);

            if (!isMounted) return;

            // Apply texture to sphere
            const material = sphereRef.current!.material as THREE.MeshBasicMaterial;
            if (material.map) material.map.dispose();
            material.map = texture;
            material.color.set(0xffffff); // Ensure full brightness (white multiplies texture color)
            material.needsUpdate = true;

            // Update Hotspots
            if (hotspotsGroupRef.current) {
                // Clear old hotspots
                while(hotspotsGroupRef.current.children.length > 0){ 
                    hotspotsGroupRef.current.remove(hotspotsGroupRef.current.children[0]); 
                }

                // Create new hotspots
                currentScene.hotspots.forEach(hotspot => {
                    const material = new THREE.SpriteMaterial({ map: createHotspotTexture });
                    const sprite = new THREE.Sprite(material);
                    
                    // Convert percentages to spherical coordinates
                    const latRad = THREE.MathUtils.degToRad(90 - (hotspot.y / 100) * 180); 
                    const lonRad = THREE.MathUtils.degToRad((hotspot.x / 100) * 360);
                    const r = 450; 

                    sprite.position.x = r * Math.cos(latRad) * Math.cos(lonRad);
                    sprite.position.y = r * Math.sin(latRad);
                    sprite.position.z = r * Math.cos(latRad) * Math.sin(lonRad);

                    sprite.scale.set(60, 60, 1);
                    sprite.userData = { targetSceneId: hotspot.targetSceneId, label: hotspot.label };
                    
                    hotspotsGroupRef.current?.add(sprite);
                });
            }

            setIsLoaded(true);

        } catch (fatalError) {
            // This should ideally never be reached unless the Fallback also fails
            if (isMounted) {
                console.error("Fatal error loading 360 scene:", fatalError);
                setLoadError("Failed to load scene (Network Error).");
                setIsLoaded(true); 
            }
        }
    };

    updateScene();

    return () => { isMounted = false; };
  }, [currentSceneId]);

  const handleSceneChange = (id: string) => {
    // Only change if different to avoid reload flickering
    if (id !== currentSceneId) {
        setCurrentSceneId(id);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black text-white font-sans overflow-hidden animate-in fade-in duration-500">
      
      {/* 3D Canvas Mount Point */}
      <div ref={mountRef} className="absolute inset-0 cursor-move active:cursor-grabbing bg-black" />

      {/* --- UI Overlays --- */}

      {/* NEW: Debug Coordinate Tooltip (Near Cursor) */}
      {cursorCoords && !hoveredHotspot && (
         <div 
            className="fixed z-[110] pointer-events-none bg-black/70 text-green-400 font-mono text-[10px] px-2 py-1 rounded border border-green-500/30 backdrop-blur-sm"
            style={{ 
                left: cursorCoords.screenX + 15, 
                top: cursorCoords.screenY + 15 
            }}
         >
            X: {cursorCoords.x} | Y: {cursorCoords.y}
         </div>
      )}

      {/* Top Header */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start pointer-events-none z-50">
         <div className="bg-black/40 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 pointer-events-auto transition-transform hover:scale-105">
            <h2 className="font-display font-bold text-xl flex items-center gap-3">
                <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                {currentScene.name}
            </h2>
         </div>
         <button 
            onClick={onClose}
            className="bg-white/10 hover:bg-red-500/80 backdrop-blur-md p-3 rounded-full border border-white/10 transition-colors pointer-events-auto"
         >
            <X size={24} />
         </button>
      </div>

      {/* Hotspot Tooltip */}
      {hoveredHotspot && (
         <div 
            className="absolute z-50 pointer-events-none bg-white text-pinte-blue px-4 py-2 rounded-xl font-bold text-sm shadow-xl animate-in fade-in duration-200"
            style={{ 
                left: hoveredHotspot.x, 
                top: hoveredHotspot.y - 50, // Floating above cursor
                transform: 'translateX(-50%)' 
            }}
         >
            {hoveredHotspot.label}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45"></div>
         </div>
      )}

      {/* Loading Screen */}
      {!isLoaded && !loadError && (
         <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-20 transition-opacity duration-500">
             <div className="flex flex-col items-center gap-4">
                <Loader2 size={48} className="text-pinte-blue animate-spin" />
                <p className="font-display font-bold tracking-widest uppercase text-lg animate-pulse">Loading Scene...</p>
                <p className="text-white/50 text-xs">Downloading High-Res Texture (May take a moment)</p>
             </div>
         </div>
      )}

      {/* Error/Notice Screen (Non-blocking if fallback works, Blocking if total fail) */}
      {loadError && (
         <div className="absolute top-24 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
             <div className="bg-black/80 backdrop-blur px-6 py-3 rounded-xl border border-red-500/50 flex items-center gap-3">
                <AlertCircle size={20} className="text-orange-500" />
                <span className="text-sm font-bold text-white">{loadError}</span>
             </div>
         </div>
      )}

      {/* Instructions */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-0 animate-[fade-out_4s_ease-in-out_forwards] delay-1000 z-10">
         <div className="bg-black/60 backdrop-blur px-6 py-4 rounded-2xl flex flex-col items-center gap-2">
            <MousePointer2 size={32} className="animate-bounce" />
            <span className="font-bold text-sm uppercase tracking-widest">Drag to Look • Scroll to Zoom • Click Dots</span>
         </div>
      </div>

      {/* Scene Selector Footer */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-auto max-w-[90vw] z-50">
         <div className="flex gap-4 overflow-x-auto p-2 no-scrollbar bg-black/20 backdrop-blur-md rounded-2xl border border-white/5">
            {Object.values(SCENES).map(scene => (
                <button
                    key={scene.id}
                    onClick={() => handleSceneChange(scene.id)}
                    className={`relative w-28 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 group ${currentSceneId === scene.id ? 'border-pinte-blue scale-105 shadow-lg shadow-pinte-blue/30' : 'border-white/20 hover:border-white/60 opacity-70 hover:opacity-100'}`}
                >
                    <img src={scene.image} className="w-full h-full object-cover" alt={scene.name} />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors"></div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-1.5">
                        <p className="text-[10px] font-bold text-center truncate text-white">{scene.name}</p>
                    </div>
                </button>
            ))}
         </div>
      </div>

    </div>
  );
};

export default FactoryTour360;
