import * as THREE from 'three';
import { AudioLoader, CubeTextureLoader, TextureLoader } from 'three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { LoaderList } from './interfaces/loader-list.interface';
import { LoaderOutput } from './interfaces/loader-output.interface';
import { LoaderType } from './types/loader-type.type';

const loaders = (() => {
  let cubeTextureLoader: CubeTextureLoader | null = null;
  let gltfLoader: GLTFLoader | null = null;
  let textureLoader: TextureLoader | null = null;
  let audioLoader: AudioLoader | null = null;

  function get(loader: 'cube'): CubeTextureLoader;
  function get(loader: 'gltf'): GLTFLoader;
  function get(loader: 'texture'): TextureLoader;
  function get(loader: 'audio'): AudioLoader;
  function get(loader: LoaderType): LoaderList[LoaderType] | undefined {
    switch (loader) {
      case 'cube': {
        if (cubeTextureLoader === null) {
          cubeTextureLoader = new CubeTextureLoader();
          return cubeTextureLoader;
        }
        return cubeTextureLoader;
      }

      case 'texture': {
        if (textureLoader === null) {
          textureLoader = new TextureLoader();
          return textureLoader;
        }
        return textureLoader;
      }

      case 'gltf': {
        if (gltfLoader === null) {
          gltfLoader = new GLTFLoader();
          return gltfLoader;
        }
        return gltfLoader;
      }

      case 'audio': {
        if (audioLoader === null) {
          audioLoader = new AudioLoader();
          return audioLoader;
        }
        return audioLoader;
      }
    }
  }

  return {
    get,
  };
})();

export class ResourceLoader {
  private models: Map<string, GLTF> = new Map();
  private textures: Map<string, THREE.Texture> = new Map();
  private sounds: Map<string, AudioBuffer> = new Map();

  public getTexture(name: string): THREE.Texture | undefined {
    return this.textures.get(name);
  }

  public getModel(name: string): GLTF | undefined {
    return this.models.get(name);
  }

  public getsound(name: string): AudioBuffer | undefined {
    return this.sounds.get(name);
  }

  public async loadCubeTexture(
    name: string,
    urls: string[],
  ): Promise<THREE.CubeTexture | undefined> {
    const resource = await new Promise<THREE.CubeTexture>((res, rej) => {
      loaders.get('cube').load(urls, res, undefined, rej);
    });
    if (resource) {
      this.textures.set(name, resource);
    }
    return resource;
  }

  public async loadGltf(name: string, path: string): Promise<GLTF> {
    const resource = await new Promise<GLTF>((res, rej) =>
      loaders.get('gltf').load(path, res, undefined, rej),
    );
    if (resource) {
      this.models.set(name, resource);
    }
    return resource;
  }

  public async loadTexture(name: string, path: string): Promise<THREE.Texture> {
    const resource = await new Promise<THREE.Texture>((res, rej) => {
      loaders.get('texture').load(path, res, undefined, rej);
    });
    if (resource) {
      this.textures.set(name, resource);
    }
    return resource;
  }

  public async loadAudio(name: string, path: string): Promise<AudioBuffer> {
    const resource = await new Promise<AudioBuffer>((res, rej) => {
      loaders.get('audio').load(path, res, undefined, rej);
    });
    if (resource) {
      this.sounds.set(name, resource);
    }
    return resource;
  }
}
