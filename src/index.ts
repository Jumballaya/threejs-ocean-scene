import * as THREE from 'three';
import './styles/main.css';
import { Core } from './core/Core';

import waterFragmentShader from './shaders/water/fragment.glsl';
import waterVertexShader from './shaders/water/vertex.glsl';

const state = {
  core: new Core(),

  depthColor: '#186691',
  surfaceColor: '#9bd8ff',
};

const fogGuiSetup = (material: THREE.ShaderMaterial) => {
  const fogGui = state.core.gui.addFolder('Fog');

  const fog = new THREE.Fog('#21232c', 1, 12);
  state.core.setFog(fog);

  fogGui
    .addColor(material.uniforms.uFogColor, 'value')
    .name('Fog Color')
    .onChange((color: string) => {
      (material.uniforms.uFogColor.value as THREE.Color).set(color);
      state.core.scene.background = new THREE.Color(color);
      fog.color = new THREE.Color(color);
    });

  fogGui
    .add(material.uniforms.uFogDistance, 'value')
    .min(0)
    .max(20)
    .step(0.001)
    .name('Fog Distance')
    .onChange((dist: number) => {
      fog.near = dist / 100;
      fog.far = dist;
    });
};

const colorGuiSetup = (material: THREE.ShaderMaterial) => {
  const colorGui = state.core.gui.addFolder('Colors');
  colorGui
    .addColor(material.uniforms.uDepthColor, 'value')
    .name('Depth Color')
    .onChange((color: string) => {
      (material.uniforms.uDepthColor.value as THREE.Color).set(color);
    });

  colorGui
    .addColor(material.uniforms.uSurfaceColor, 'value')
    .name('Surface Color')
    .onChange((color: string) => {
      (material.uniforms.uSurfaceColor.value as THREE.Color).set(color);
    });

  colorGui
    .add(material.uniforms.uColorOffset, 'value')
    .min(0)
    .max(1)
    .step(0.001)
    .name('Color Offset');

  colorGui
    .add(material.uniforms.uColorMultiplier, 'value')
    .min(0)
    .max(10)
    .step(0.001)
    .name('Color Offset Multiplier');
};

const bigWavesGuiSetup = (material: THREE.ShaderMaterial) => {
  const bigWavesGui = state.core.gui.addFolder('Big Waves');

  bigWavesGui
    .add(material.uniforms.uBigWavesElevation, 'value')
    .min(0)
    .max(1)
    .step(0.001)
    .name('uBigWavesElevation');

  bigWavesGui
    .add(material.uniforms.uBigWavesSpeed, 'value')
    .min(0)
    .max(1)
    .step(0.001)
    .name('uBigWavesSpeed');

  bigWavesGui
    .add(material.uniforms.uBigWavesFrequency.value, 'x')
    .min(0)
    .max(Math.PI * 10)
    .step(0.001)
    .name('uBigWavesFrequency - X');

  bigWavesGui
    .add(material.uniforms.uBigWavesFrequency.value, 'y')
    .min(0)
    .max(Math.PI * 10)
    .step(0.001)
    .name('uBigWavesFrequency - Y');
};

const smallWavesGuiSetup = (material: THREE.ShaderMaterial) => {
  const bigWavesGui = state.core.gui.addFolder('Small Waves');
  bigWavesGui
    .add(material.uniforms.uSmallWavesElevation, 'value')
    .min(0)
    .max(1)
    .step(0.001)
    .name('uSmallWavesElevation');

  bigWavesGui
    .add(material.uniforms.uSmallWavesFrequency, 'value')
    .min(0)
    .max(10)
    .step(0.01)
    .name('uSmallWavesFrequency');

  bigWavesGui
    .add(material.uniforms.uSmallWavesSpeed, 'value')
    .min(0)
    .max(5)
    .step(0.1)
    .name('uSmallWavesSpeed');

  bigWavesGui
    .add(material.uniforms.uSmallWavesIterations, 'value')
    .min(0)
    .max(5)
    .step(1)
    .name('uSmallWavesIterations');
};

const ragingSea = () => {
  const geometry = new THREE.PlaneBufferGeometry(1, 1, 256, 256);
  const material = new THREE.ShaderMaterial({
    fragmentShader: waterFragmentShader,
    vertexShader: waterVertexShader,
    uniforms: {
      uTime: { value: 0 },

      uBigWavesElevation: { value: 0.2 },
      uBigWavesFrequency: { value: new THREE.Vector2(1.5, 1.5) },
      uBigWavesSpeed: { value: 0.75 },

      uSmallWavesElevation: { value: 0.15 },
      uSmallWavesFrequency: { value: 3 },
      uSmallWavesSpeed: { value: 0.2 },
      uSmallWavesIterations: { value: 4 },

      uDepthColor: { value: new THREE.Color(state.depthColor) },
      uSurfaceColor: { value: new THREE.Color(state.surfaceColor) },
      uColorOffset: { value: 0.08 },
      uColorMultiplier: { value: 5 },

      uFogColor: { value: new THREE.Color('#21232c') },
      uFogDistance: { value: 10 },
    },
  });

  return {
    geometry,
    material,
    sea() {
      const sea = new THREE.Mesh(this.geometry, this.material);
      sea.rotateX(-Math.PI / 2);
      return sea;
    },
  };
};

// Main function
const main = async () => {
  const sea = ragingSea();
  state.core.setBackgroundColor(sea.material.uniforms.uFogColor.value);

  const size = 20;
  const width = 1;

  for (let row = 0; row < size; row++) {
    const y = size * (width / 2) - (row + size / 2);
    for (let col = 0; col < size; col++) {
      const x = size * (width / 2) - (col + size / 2);
      const tile = sea.sea();
      tile.translateX(x + size / 2);
      tile.translateY(y + size / 2);
      state.core.add(tile);
    }
  }

  bigWavesGuiSetup(sea.material);
  smallWavesGuiSetup(sea.material);
  colorGuiSetup(sea.material);
  fogGuiSetup(sea.material);

  const boat = await state.core.loader.loadGltf('ship', '/models/ship.glb');
  boat.scene.scale.set(0.1, 0.1, 0.1);
  state.core.add(boat.scene);

  state.core.loop((deltaT: number) => {
    const et = state.core.clock.getElapsedTime();
    sea.material.uniforms.uTime.value = et;

    const pos = new THREE.Vector3();
    boat.scene.getWorldPosition(pos);

    const bigWaveFreq = sea.material.uniforms.uBigWavesFrequency.value;
    const bigWaveSpeed = sea.material.uniforms.uBigWavesSpeed.value;
    const bigWaveElev = sea.material.uniforms.uBigWavesElevation.value;

    const newY =
      -Math.sin(bigWaveFreq.x + et * bigWaveSpeed) *
      Math.sin(bigWaveFreq.y + et * bigWaveSpeed) *
      bigWaveElev;
    boat.scene.position.set(pos.x, newY - 0.33, pos.z);
  });
};

main();
