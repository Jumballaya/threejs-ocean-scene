import { Core } from './core/Core';

export const loadSkyBox = async (core: Core) => {
  const cubeTexture = await core.loader.loadCubeTexture('sky', [
    '/textures/sky/bluecloud_ft.jpg',
    '/textures/sky/bluecloud_bk.jpg',
    '/textures/sky/bluecloud_up.jpg',
    '/textures/sky/bluecloud_dn.jpg',
    '/textures/sky/bluecloud_rt.jpg',
    '/textures/sky/bluecloud_lf.jpg',
  ]);

  if (cubeTexture) core.setBackgroundMap(cubeTexture);
};
