import React, { useRef, useState, useLayoutEffect, useCallback, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment, Center, Bounds, useBounds, Html } from '@react-three/drei';
import * as THREE from 'three';

function AutoZoom() {
    const bounds = useBounds();
    useLayoutEffect(() => {
        if (bounds) bounds.refresh().clip().fit();
    }, [bounds]);
    return null;
}

// Colores debug por grupo
const COLORES_DEBUG = {
    torso:    '#2563eb',
    pantalon: '#16a34a',
    zapatos:  '#eab308',
    cuerpo:   '#f97316',
    base:     '#6b7280',
};

const GRUPOS_LISTA = ['torso', 'pantalon', 'zapatos', 'cuerpo'];

const COLORES_LABELS = {
    torso:    'SACO / CAMISA',
    pantalon: 'PANTALÓN',
    zapatos:  'ZAPATOS',
    cuerpo:   'CUERPO / PIEL',
    base:     'BASE',
};

/**
 * Clasificación inicial automática por posición Y
 */
function clasificarAutomatico(clone) {
    const meshData = [];
    
    clone.traverse((child) => {
        if (child.isMesh) {
            const box = new THREE.Box3().setFromObject(child);
            const center = new THREE.Vector3();
            box.getCenter(center);
            meshData.push({ mesh: child, centerY: center.y, minY: box.min.y, maxY: box.max.y });
        }
    });

    if (meshData.length === 0) return {};

    const allMinY = Math.min(...meshData.map(m => m.minY));
    const allMaxY = Math.max(...meshData.map(m => m.maxY));
    const totalHeight = allMaxY - allMinY;

    const asignaciones = {}; // meshName → grupoKey

    meshData.forEach(m => {
        if (m.mesh.name === 'Cube') {
            asignaciones[m.mesh.name] = 'base';
            return;
        }
        const yPercent = (m.centerY - allMinY) / totalHeight;

        if (yPercent <= 0.05) {
            asignaciones[m.mesh.name] = 'zapatos';
        } else if (yPercent <= 0.45) {
            asignaciones[m.mesh.name] = 'pantalon';
        } else if (yPercent <= 0.82) {
            asignaciones[m.mesh.name] = 'torso';
        } else {
            asignaciones[m.mesh.name] = 'cuerpo';
        }
    });

    return asignaciones;
}

function ModeloInteractivo({ outfit, rotationVal, asignaciones, debugMode, onMeshClick, selectedMesh }) {
    const { scene } = useGLTF("/modelo 3d/maniki.glb");
    const group = useRef();
    const clone = useMemo(() => scene.clone(), [scene]);

    // Aplicar colores según asignaciones
    useLayoutEffect(() => {
        if (!asignaciones) return;

        clone.traverse((child) => {
            if (!child.isMesh) return;

            if (child.material?.clone) {
                child.material = child.material.clone();
                child.material.roughness = 0.55;
                child.material.metalness = 0.15;
                child.castShadow = true;
                child.receiveShadow = true;
            }

            const grupo = asignaciones[child.name] || 'cuerpo';

            if (debugMode) {
                mesh_applyDebugColor(child, grupo, selectedMesh);
            } else {
                const data = outfit[grupo];
                if (data) {
                    child.visible = data.on;
                    if (data.on && data.color) {
                        child.material.color.set(data.color);
                    }
                } else {
                    child.visible = true;
                }
            }
        });
    }, [clone, asignaciones, outfit, debugMode, selectedMesh]);

    useFrame((state, delta) => {
        if (group.current) {
            if (rotationVal === -1) {
                group.current.rotation.y += delta * 0.4;
            } else {
                group.current.rotation.y = 0;
            }
        }
    });

    return (
        <group ref={group} dispose={null}>
            <primitive 
                object={clone} 
                onClick={(e) => {
                    if (debugMode) {
                        e.stopPropagation();
                        onMeshClick(e.object.name, e.point);
                    }
                }}
            />
        </group>
    );
}

function mesh_applyDebugColor(mesh, grupo, selectedMesh) {
    const color = COLORES_DEBUG[grupo] || '#ff00ff';
    mesh.material.color.set(color);
    mesh.visible = true;

    // Highlight si está seleccionado
    if (selectedMesh === mesh.name) {
        mesh.material.emissive.setHex(0xffffff);
        mesh.material.emissiveIntensity = 0.4;
    } else {
        mesh.material.emissive.setHex(0x000000);
        mesh.material.emissiveIntensity = 0;
    }
}

export default function ManiquiGLB({ outfit = {}, autoRotate = false }) {
    const [asignaciones, setAsignaciones] = useState(null);
    const [debugMode, setDebugMode] = useState(true);
    const [selectedMesh, setSelectedMesh] = useState(null);
    const [clickPos, setClickPos] = useState(null);
    const [resumen, setResumen] = useState({});
    const sceneRef = useRef(null);

    // Clasificación inicial
    const { scene } = useGLTF("/modelo 3d/maniki.glb");
    
    useLayoutEffect(() => {
        const initial = clasificarAutomatico(scene);
        setAsignaciones(initial);
        actualizarResumen(initial);
        console.log("Clasificación inicial:", initial);
    }, [scene]);

    const actualizarResumen = (asigs) => {
        const r = {};
        for (const grupo of [...GRUPOS_LISTA, 'base']) {
            r[grupo] = Object.values(asigs).filter(g => g === grupo).length;
        }
        setResumen(r);
    };

    // Click en un mesh: mostrar menú de reasignación
    const handleMeshClick = useCallback((meshName, point) => {
        setSelectedMesh(meshName);
        setClickPos(point);
    }, []);

    // Reasignar un mesh a otro grupo
    const reasignar = useCallback((nuevoGrupo) => {
        if (!selectedMesh || !asignaciones) return;
        const newAsigs = { ...asignaciones, [selectedMesh]: nuevoGrupo };
        setAsignaciones(newAsigs);
        actualizarResumen(newAsigs);
        setSelectedMesh(null);
        console.log(`Reasignado: ${selectedMesh} → ${nuevoGrupo}`);
    }, [selectedMesh, asignaciones]);

    // Mapear outfit a grupos
    const outfitGroups = {
        torso: { 
            on: (outfit.saco?.on || outfit.camisa?.on) ?? true, 
            color: (outfit.saco?.on ? outfit.saco?.color : outfit.camisa?.color) || '#1e3a8a'
        },
        pantalon: { on: outfit.pantalon?.on ?? true, color: outfit.pantalon?.color || '#1a1a1a' },
        zapatos:  { on: outfit.zapatos?.on ?? true, color: outfit.zapatos?.color || '#111111' },
        cuerpo:   { on: true, color: '#d4a574' },
        base:     { on: true, color: '#333333' }
    };

    return (
        <div className="w-full h-full relative cursor-move" style={{ minHeight: '400px' }}>
            <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 10], fov: 50 }}>
                <ambientLight intensity={0.6} />
                <spotLight position={[5, 10, 5]} angle={0.5} penumbra={1} intensity={1} castShadow />
                <spotLight position={[-5, 5, 5]} intensity={0.4} color="#dbeafe" />
                <Environment preset="city" />

                <React.Suspense fallback={null}>
                    <Bounds fit clip observe margin={1.1}>
                        <Center>
                            <ModeloInteractivo 
                                outfit={outfitGroups}
                                rotationVal={autoRotate ? -1 : 0}
                                asignaciones={asignaciones}
                                debugMode={debugMode}
                                onMeshClick={handleMeshClick}
                                selectedMesh={selectedMesh}
                            />
                        </Center>
                        <AutoZoom />
                    </Bounds>
                </React.Suspense>

                <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 1.9} enablePan={false} />
            </Canvas>

            {/* Panel de control */}
            <div className="absolute top-3 left-3 bg-black/90 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-2xl z-50 min-w-[230px]">
                <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-black uppercase tracking-widest text-white">
                        🎨 GRUPOS
                    </h4>
                    <button 
                        onClick={() => { setDebugMode(!debugMode); setSelectedMesh(null); }}
                        className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-lg transition-all ${
                            debugMode 
                                ? 'bg-yellow-500 text-black' 
                                : 'bg-white/10 text-gray-400 hover:bg-white/20'
                        }`}
                    >
                        {debugMode ? '🔍 DEBUG ON' : 'DEBUG OFF'}
                    </button>
                </div>

                <div className="space-y-1.5">
                    {Object.entries(resumen).map(([grupo, count]) => (
                        <div key={grupo} className="flex items-center gap-2 text-[11px]">
                            <div 
                                className="w-4 h-4 rounded border border-white/20" 
                                style={{ backgroundColor: COLORES_DEBUG[grupo] }}
                            />
                            <span className="font-bold text-white flex-1">
                                {COLORES_LABELS[grupo] || grupo}
                            </span>
                            <span className="text-gray-500 font-mono text-[10px]">{count}</span>
                        </div>
                    ))}
                </div>

                {debugMode && (
                    <div className="mt-3 p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                        <p className="text-[9px] text-blue-400 leading-relaxed font-bold">
                            👆 HAZ CLICK en cualquier pieza del modelo para reasignarla a otro grupo.
                        </p>
                    </div>
                )}

                {/* Menú de reasignación */}
                {debugMode && selectedMesh && (
                    <div className="mt-3 p-3 bg-white/10 rounded-xl border border-white/20 animate-pulse-once">
                        <p className="text-[10px] text-white font-bold mb-2 truncate">
                            Pieza: <span className="text-yellow-400">{selectedMesh}</span>
                        </p>
                        <p className="text-[9px] text-gray-400 mb-2">
                            Actual: <span className="text-white font-bold">{COLORES_LABELS[asignaciones?.[selectedMesh]] || asignaciones?.[selectedMesh]}</span>
                        </p>
                        <p className="text-[9px] text-gray-500 mb-2">Mover a:</p>
                        <div className="grid grid-cols-2 gap-1.5">
                            {GRUPOS_LISTA.map(grupo => (
                                <button
                                    key={grupo}
                                    onClick={() => reasignar(grupo)}
                                    className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all hover:scale-105 border"
                                    style={{ 
                                        backgroundColor: COLORES_DEBUG[grupo] + '33',
                                        borderColor: COLORES_DEBUG[grupo] + '66',
                                        color: COLORES_DEBUG[grupo]
                                    }}
                                >
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORES_DEBUG[grupo] }} />
                                    {grupo}
                                </button>
                            ))}
                        </div>
                        <button 
                            onClick={() => setSelectedMesh(null)}
                            className="w-full mt-2 text-[9px] text-gray-500 hover:text-white transition-colors"
                        >
                            ✕ Cancelar
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

useGLTF.preload("/modelo 3d/maniki.glb");
