import GUI from 'lil-gui';
import * as THREE from 'three';
import { ResourceLoader } from './ResourceLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TickFunction } from './types/tick-function.type';
import { Inputs } from './Inputs';

export class Core {
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public scene: THREE.Scene;
  public loader = new ResourceLoader();
  public controls: OrbitControls;
  public gui = new GUI();
  public inputs = new Inputs();

  private sun: THREE.DirectionalLight;
  public clock = new THREE.Clock();

  private sizes = { width: window.innerWidth, height: window.innerHeight };
  private now = Date.now();
  private $canvas: HTMLCanvasElement;

  constructor() {
    this.$canvas = document.createElement('canvas') as HTMLCanvasElement;
    this.$canvas.setAttribute('class', 'webgl');
    document.body.appendChild(this.$canvas);

    this.scene = new THREE.Scene();
    this.camera = this.setupCamera();
    this.renderer = this.setupRenderer();
    this.controls = this.setupControls();

    this.sun = this.createSun();
    this.scene.add(this.sun);
    this.scene.add(new THREE.AmbientLight('#9999ee', 1.0));

    this.setupListeners();
  }

  public update() {
    this.controls.update();
  }

  public loop(tick: TickFunction) {
    const now = Date.now();
    const deltaT = now - this.now;
    this.now = now;
    tick(deltaT, this);
    this.update();
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this.loop(tick));
  }

  public add(...objects: THREE.Object3D<THREE.Event>[]) {
    this.scene.add(...objects);
  }

  public remove(...objects: THREE.Object3D<THREE.Event>[]) {
    this.scene.remove(...objects);
  }

  public clear() {
    this.scene.clear();
  }

  public setFog(fog: THREE.Fog) {
    this.scene.fog = fog;
  }

  public setBackgroundColor(color: THREE.ColorRepresentation) {
    this.renderer.setClearColor(color);
  }

  public setBackgroundMap(map: THREE.Texture | null) {
    this.scene.background = map;
    this.scene.environment = map;
  }

  public traverse(cb: (child: THREE.Object3D) => void) {
    return this.scene.traverse(cb);
  }

  public goFullscreen() {
    if (!document.fullscreenElement) {
      this.$canvas.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  private setupRenderer() {
    const renderer = new THREE.WebGLRenderer({
      canvas: this.$canvas,
      antialias: true,
    });
    renderer.setSize(this.sizes.width, this.sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    return renderer;
  }

  private setupControls() {
    const controls = new OrbitControls(this.camera, this.$canvas);
    this.gui.add(
      { 'Go Fullscreen': this.goFullscreen.bind(this) },
      'Go Fullscreen',
    );
    return controls;
  }

  private setupCamera() {
    const fov = 75;
    const aspect = this.sizes.width / this.sizes.height;
    const camera = new THREE.PerspectiveCamera(fov, aspect);
    camera.position.set(4, 1, -4);
    this.scene.add(camera);
    return camera;
  }

  private setupListeners() {
    window.addEventListener('dblclick', () => {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    });

    window.addEventListener('resize', () => {
      this.sizes.width = window.innerWidth;
      this.sizes.height = window.innerHeight;

      this.camera.aspect = this.sizes.width / this.sizes.height;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(this.sizes.width, this.sizes.height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
  }

  private createSun() {
    const sunlight = new THREE.DirectionalLight('#ffffff', 1);
    sunlight.position.set(0.25, 3, -2.25);
    sunlight.intensity = 1.5;
    sunlight.castShadow = true;
    sunlight.shadow.camera.far = 40;
    sunlight.shadow.mapSize.set(1024, 1024);
    sunlight.shadow.normalBias = 0.05;

    const lightGui = this.gui.addFolder('Sun Light');
    lightGui
      .add(sunlight, 'intensity')
      .min(0)
      .max(10)
      .step(0.001)
      .name('Intensity');
    lightGui
      .add(sunlight.position, 'x')
      .min(-5)
      .max(5)
      .step(0.001)
      .name('Position X');
    lightGui
      .add(sunlight.position, 'y')
      .min(-5)
      .max(5)
      .step(0.001)
      .name('Position Y');
    lightGui
      .add(sunlight.position, 'z')
      .min(-5)
      .max(5)
      .step(0.001)
      .name('Position Z');

    return sunlight;
  }
}
