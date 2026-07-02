import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const blockPalette = {
  grass: [0x5daf46, 0x3f8e34, 0x86cf55],
  earth: [0x8d5b36, 0x5d3d28, 0xb47a45],
  sakura: [0xe9a8b4, 0xd98398, 0xf4c8cf],
  stone: [0x8b9288, 0x5f675f, 0xc4c8bb],
  water: [0x3ba4d8, 0x256fae, 0x7fd5e8],
  lantern: [0xf2b642, 0xd17929, 0xffdf73],
};

function colorStyle(color) {
  return `#${color.toString(16).padStart(6, '0')}`;
}

function shade(color, amount) {
  const threeColor = new THREE.Color(color);
  threeColor.offsetHSL(0, amount > 0 ? 0.08 : -0.04, amount);
  return Number(`0x${threeColor.getHexString()}`);
}

function makePixelTexture(color, accent = shade(color, 0.12), dark = shade(color, -0.16)) {
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;
  const context = canvas.getContext('2d');

  context.fillStyle = colorStyle(color);
  context.fillRect(0, 0, 16, 16);
  context.fillStyle = colorStyle(accent);
  context.fillRect(0, 0, 16, 3);
  context.fillRect(2, 5, 3, 3);
  context.fillRect(10, 2, 4, 4);
  context.fillRect(7, 11, 2, 2);
  context.fillStyle = colorStyle(dark);
  context.fillRect(0, 13, 16, 3);
  context.fillRect(5, 8, 2, 2);
  context.fillRect(12, 10, 3, 3);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  return texture;
}

function makeMaterial(color, roughness = 0.82, accent, dark) {
  return new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: makePixelTexture(color, accent, dark),
    roughness,
    metalness: 0.01,
    flatShading: true,
  });
}

function addBlock(scene, geometry, material, x, y, z, scale = 1) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  mesh.scale.setScalar(scale);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}

function buildIsland(scene, blocks, geometry, materials) {
  for (let x = -8; x <= 8; x += 1) {
    for (let z = -6; z <= 7; z += 1) {
      const radius = Math.abs(x) * 0.68 + Math.abs(z) * 0.86;
      if (radius < 9.25) {
        const height = radius < 4.4 ? 0 : -0.1;
        blocks.push(addBlock(scene, geometry, materials.grass[(x + z + 12) % 3], x, height, z));
        if ((x + z) % 2 === 0 || radius > 7.4) {
          blocks.push(addBlock(scene, geometry, materials.earth[Math.abs(x + z) % 3], x, -1, z));
        }
        if (radius > 8.1 && (x + z) % 3 === 0) {
          blocks.push(addBlock(scene, geometry, materials.stone[Math.abs(x * z + 2) % 3], x, -2, z));
        }
      }
    }
  }
}

function addSakuraTree(scene, blocks, geometry, materials, x, z) {
  for (let y = 0.8; y < 3.5; y += 1) {
    blocks.push(addBlock(scene, geometry, materials.earth[0], x, y, z, 0.78));
  }

  const crown = [
    [0, 3.6, 0],
    [1, 3.3, 0],
    [-1, 3.3, 0],
    [0, 3.3, 1],
    [0, 3.3, -1],
    [0.7, 4.15, 0.7],
    [-0.7, 4.15, -0.7],
    [0.2, 4.55, 0.1],
  ];

  crown.forEach(([dx, y, dz], index) => {
    blocks.push(addBlock(scene, geometry, materials.sakura[index % 3], x + dx, y, z + dz, 0.9));
  });
}

function addTorii(scene, blocks, geometry, materials) {
  const red = makeMaterial(0xef4d57, 0.78, 0xff8791, 0x9a2630);
  const dark = makeMaterial(0x4b302e, 0.9, 0x6c4b47, 0x271819);
  [-1.3, 1.3].forEach((x) => {
    for (let y = 0.6; y <= 2.6; y += 1) {
      blocks.push(addBlock(scene, geometry, red, x, y, -3.2, 0.55));
    }
  });
  for (let x = -2.2; x <= 2.2; x += 0.7) {
    blocks.push(addBlock(scene, geometry, red, x, 3.05, -3.2, 0.58));
  }
  for (let x = -2.7; x <= 2.7; x += 0.9) {
    blocks.push(addBlock(scene, geometry, dark, x, 3.58, -3.2, 0.52));
  }
}

function addTopTile(parent, geometry, material, x, z, y = 0.52, scale = [0.92, 0.09, 0.92]) {
  const tile = addCharacterPart(parent, geometry, material, [x, y, z], scale);
  tile.castShadow = false;
  return tile;
}

function addVillagePath(scene, geometry) {
  const path = makeMaterial(0xc2a66b, 0.9, 0xe2c88d, 0x8a6a3e);
  const pathBlocks = [
    [-5, 1],
    [-4, 1],
    [-3, 1],
    [-2, 1],
    [-1, 1],
    [0, 1],
    [1, 1],
    [2, 1],
    [3, 1],
    [4, 1],
    [5, 1],
    [2, 2],
    [2, 3],
    [2, 4],
    [-4, 0],
    [-5, -1],
    [4, 0],
    [5, -1],
  ];
  pathBlocks.forEach(([x, z]) => addTopTile(scene, geometry, path, x, z));
}

function addLamp(scene, geometry, x, z) {
  const post = makeMaterial(0x6d4529, 0.9, 0x97643b, 0x3c2719);
  const glow = makeMaterial(0xf2b642, 0.62, 0xffe38c, 0xc97428);
  const cap = makeMaterial(0x424841, 0.86, 0x687166, 0x20261f);

  for (let y = 0.8; y <= 2.1; y += 0.5) {
    addCharacterPart(scene, geometry, post, [x, y, z], [0.18, 0.52, 0.18]);
  }
  addCharacterPart(scene, geometry, glow, [x, 2.52, z], [0.34, 0.34, 0.34]);
  addCharacterPart(scene, geometry, cap, [x, 2.86, z], [0.42, 0.12, 0.42]);

  const point = new THREE.PointLight(0xffc766, 0.7, 6);
  point.position.set(x, 2.45, z);
  scene.add(point);
}

function addVillageHouse(scene, geometry, x, z, rotation = 0, scale = 0.72) {
  const group = new THREE.Group();
  const wall = makeMaterial(0xb5854e, 0.88, 0xd2a66c, 0x704728);
  const beam = makeMaterial(0x5d3b25, 0.92, 0x7d5434, 0x2d1c12);
  const roof = makeMaterial(0x7b3f26, 0.9, 0xa65b35, 0x442315);
  const window = makeMaterial(0x8dd4ee, 0.66, 0xcdf8ff, 0x2d83a2);
  const door = makeMaterial(0x4a2e1c, 0.9, 0x7b4f31, 0x24150e);

  for (let dx = -1; dx <= 1; dx += 1) {
    for (let dz = -1; dz <= 1; dz += 1) {
      addCharacterPart(group, geometry, beam, [dx, 0.16, dz], [0.9, 0.22, 0.9]);
    }
  }

  for (let y = 0.9; y <= 1.8; y += 0.9) {
    for (let dx = -1; dx <= 1; dx += 1) {
      for (let dz = -1; dz <= 1; dz += 1) {
        const edge = Math.abs(dx) === 1 || Math.abs(dz) === 1;
        const doorway = dz === -1 && dx === 0 && y < 1.8;
        if (edge && !doorway) {
          addCharacterPart(group, geometry, wall, [dx, y, dz], [0.88, 0.84, 0.88]);
        }
      }
    }
  }
  addCharacterPart(group, geometry, door, [0, 0.92, -1.04], [0.52, 0.9, 0.12]);
  addCharacterPart(group, geometry, window, [-1.04, 1.45, 0], [0.12, 0.42, 0.44]);
  addCharacterPart(group, geometry, window, [1.04, 1.45, 0], [0.12, 0.42, 0.44]);

  for (let dx = -1.5; dx <= 1.5; dx += 1) {
    for (let dz = -1.5; dz <= 1.5; dz += 1) {
      addCharacterPart(group, geometry, roof, [dx, 2.35, dz], [0.92, 0.38, 0.92]);
    }
  }
  for (let dx = -0.75; dx <= 0.75; dx += 0.75) {
    for (let dz = -0.75; dz <= 0.75; dz += 0.75) {
      addCharacterPart(group, geometry, roof, [dx, 2.76, dz], [0.72, 0.34, 0.72]);
    }
  }
  addCharacterPart(group, geometry, beam, [0.9, 3.14, 0.45], [0.42, 0.58, 0.42]);

  group.position.set(x, 0.52, z);
  group.rotation.y = rotation;
  group.scale.setScalar(scale);
  scene.add(group);
  return group;
}

function addConstructionSite(scene, geometry, x, z) {
  const group = new THREE.Group();
  const beam = makeMaterial(0x8f5d34, 0.88, 0xb77c48, 0x4b301f);
  const plank = makeMaterial(0xc69454, 0.88, 0xe0b374, 0x7a4f2e);
  const stone = makeMaterial(0x7f877d, 0.86, 0xa8afa4, 0x4d554d);
  const marker = makeMaterial(0xf2b642, 0.7, 0xffdd76, 0xba6a24);

  for (let dx = -1; dx <= 1; dx += 1) {
    for (let dz = -1; dz <= 1; dz += 1) {
      addCharacterPart(group, geometry, stone, [dx, 0.15, dz], [0.86, 0.28, 0.86]);
    }
  }
  [-1.15, 1.15].forEach((dx) => {
    [-1.15, 1.15].forEach((dz) => {
      for (let y = 0.72; y <= 2.25; y += 0.55) {
        addCharacterPart(group, geometry, beam, [dx, y, dz], [0.22, 0.58, 0.22]);
      }
    });
  });
  for (let dx = -1.15; dx <= 1.15; dx += 0.58) {
    addCharacterPart(group, geometry, plank, [dx, 2.35, -1.15], [0.52, 0.18, 0.22]);
    addCharacterPart(group, geometry, plank, [dx, 2.35, 1.15], [0.52, 0.18, 0.22]);
  }
  for (let dz = -1.15; dz <= 1.15; dz += 0.58) {
    addCharacterPart(group, geometry, plank, [-1.15, 2.35, dz], [0.22, 0.18, 0.52]);
    addCharacterPart(group, geometry, plank, [1.15, 2.35, dz], [0.22, 0.18, 0.52]);
  }
  for (let i = 0; i < 5; i += 1) {
    addCharacterPart(group, geometry, marker, [1.9, 0.4 + i * 0.42, -1.35], [0.36, 0.32, 0.36]);
  }
  addCharacterPart(group, geometry, plank, [0, 2.98, -1.15], [2.8, 0.16, 0.18]);
  addCharacterPart(group, geometry, marker, [-1.25, 3.16, -1.15], [0.3, 0.3, 0.3]);

  group.position.set(x, 0.5, z);
  group.rotation.y = -0.34;
  group.scale.setScalar(0.78);
  scene.add(group);
  return group;
}

function addFarm(scene, geometry, x, z) {
  const soil = makeMaterial(0x5d3d28, 0.94, 0x7d5538, 0x332115);
  const crop = makeMaterial(0x73bf3a, 0.82, 0xa7e061, 0x3f7a28);
  const water = makeMaterial(0x3ba4d8, 0.72, 0x88e3f0, 0x236ba8);

  for (let dx = -2; dx <= 2; dx += 1) {
    for (let dz = -1; dz <= 1; dz += 1) {
      addTopTile(scene, geometry, soil, x + dx, z + dz, 0.54, [0.86, 0.1, 0.86]);
      if (dz === 0) {
        addTopTile(scene, geometry, water, x + dx, z + dz, 0.62, [0.72, 0.06, 0.72]);
      } else {
        addCharacterPart(scene, geometry, crop, [x + dx, 0.92, z + dz], [0.18, 0.45 + ((dx + dz + 4) % 2) * 0.16, 0.18]);
        addCharacterPart(scene, geometry, crop, [x + dx + 0.22, 0.86, z + dz - 0.16], [0.14, 0.34, 0.14]);
      }
    }
  }
}

function createTinyVillager(scene, geometry, options) {
  const {
    position,
    rotation = 0,
    scale = 0.54,
    shirt = 0x4e9a42,
    pants = 0x405d8f,
    hat = 0xf2b642,
    role = 'walk',
  } = options;

  const group = new THREE.Group();
  const skin = makeMaterial(0xd99b72, 0.8, 0xf2bf97, 0xa76345);
  const hair = makeMaterial(0x3a2a22, 0.92, 0x5b4032, 0x1c1210);
  const shirtMaterial = makeMaterial(shirt, 0.86);
  const pantsMaterial = makeMaterial(pants, 0.88);
  const hatMaterial = makeMaterial(hat, 0.82, 0xffd779, 0xb86d25);
  const shoes = makeMaterial(0x25251f, 0.92, 0x4a4a3e, 0x11110d);
  const toolMaterial = makeMaterial(0x6d4529, 0.88, 0x9a6a3d, 0x3a2416);
  const blockMaterial = makeMaterial(0x8d5b36, 0.88, 0xb47a45, 0x5d3d28);
  const waterMaterial = makeMaterial(0x3ba4d8, 0.72, 0x88e3f0, 0x236ba8);

  addCharacterPart(group, geometry, pantsMaterial, [-0.18, 0.28, 0], [0.18, 0.55, 0.22]);
  addCharacterPart(group, geometry, pantsMaterial, [0.18, 0.28, 0], [0.18, 0.55, 0.22]);
  addCharacterPart(group, geometry, shoes, [-0.18, -0.02, -0.03], [0.22, 0.14, 0.26]);
  addCharacterPart(group, geometry, shoes, [0.18, -0.02, -0.03], [0.22, 0.14, 0.26]);
  addCharacterPart(group, geometry, shirtMaterial, [0, 0.82, 0], [0.56, 0.62, 0.32]);
  const head = addCharacterPart(group, geometry, skin, [0, 1.35, 0], [0.48, 0.48, 0.48]);
  addCharacterPart(group, geometry, hair, [0, 1.64, 0], [0.52, 0.18, 0.52]);

  if (role === 'builder' || role === 'farmer') {
    addCharacterPart(group, geometry, hatMaterial, [0, 1.82, 0], [0.62, 0.16, 0.62]);
  }

  const leftArm = addCharacterPart(group, geometry, shirtMaterial, [-0.48, 0.82, 0], [0.16, 0.58, 0.18]);
  const rightArm = addCharacterPart(group, geometry, shirtMaterial, [0.48, 0.82, 0], [0.16, 0.58, 0.18]);
  const tool =
    role === 'builder'
      ? addCharacterPart(group, geometry, toolMaterial, [0.66, 1.2, -0.12], [0.12, 0.54, 0.12])
      : role === 'carrier'
        ? addCharacterPart(group, geometry, blockMaterial, [0, 0.98, -0.42], [0.32, 0.32, 0.32])
        : role === 'farmer'
          ? addCharacterPart(group, geometry, waterMaterial, [0.66, 0.74, -0.14], [0.24, 0.22, 0.28])
          : null;

  group.position.set(...position);
  group.rotation.y = rotation;
  group.scale.setScalar(scale);
  scene.add(group);

  return {
    role,
    group,
    head,
    leftArm,
    rightArm,
    tool,
    baseY: position[1],
    baseX: position[0],
    baseZ: position[2],
    seed: position[0] * 0.47 + position[2] * 0.73,
  };
}

function addDistantVillage(scene, geometry, materials) {
  const far = new THREE.Group();
  for (let x = -2; x <= 2; x += 1) {
    for (let z = -1; z <= 1; z += 1) {
      addCharacterPart(far, geometry, materials.grass[(x + z + 4) % 3], [x, 0, z], [0.72, 0.4, 0.72]);
      addCharacterPart(far, geometry, materials.earth[Math.abs(x + z) % 3], [x, -0.46, z], [0.72, 0.4, 0.72]);
    }
  }
  addVillageHouse(far, geometry, -0.9, 0.2, 0.2, 0.38);
  addVillageHouse(far, geometry, 1.1, -0.35, -0.3, 0.32);
  far.position.set(9.2, 1.1, -7.5);
  far.rotation.y = -0.62;
  far.scale.setScalar(0.82);
  scene.add(far);
  return far;
}

function addCharacterPart(group, geometry, material, position, scale) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...position);
  mesh.scale.set(...scale);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);
  return mesh;
}

function createVoxelScholar(scene, geometry) {
  const group = new THREE.Group();
  const skin = makeMaterial(0xffc79b, 0.76, 0xffdfbd, 0xd78b6a);
  const hair = makeMaterial(0x2c2628, 0.9, 0x51444b, 0x141012);
  const coat = makeMaterial(0xfff4dc, 0.8, 0xffffff, 0xd8c8a7);
  const shirt = makeMaterial(0x67c7d4, 0.82, 0x9eeaf0, 0x2e8897);
  const pants = makeMaterial(0x446ed2, 0.86, 0x6f92ef, 0x273b83);
  const shoes = makeMaterial(0x252a30, 0.92, 0x4b535d, 0x111316);
  const book = makeMaterial(0xff6fa5, 0.84, 0xffbfd4, 0xa93b6f);
  const glass = makeMaterial(0x1c2730, 0.76, 0x5b748a, 0x0b1117);

  const body = addCharacterPart(group, geometry, coat, [0, 1.25, 0], [0.85, 1.18, 0.42]);
  addCharacterPart(group, geometry, shirt, [0, 1.32, -0.23], [0.48, 0.78, 0.08]);

  const head = addCharacterPart(group, geometry, skin, [0, 2.25, 0], [0.76, 0.76, 0.76]);
  addCharacterPart(group, geometry, hair, [0, 2.72, 0], [0.82, 0.23, 0.82]);
  addCharacterPart(group, geometry, hair, [-0.31, 2.36, -0.41], [0.2, 0.24, 0.08]);
  addCharacterPart(group, geometry, hair, [0.32, 2.36, -0.41], [0.2, 0.24, 0.08]);
  addCharacterPart(group, geometry, glass, [-0.18, 2.3, -0.42], [0.18, 0.08, 0.06]);
  addCharacterPart(group, geometry, glass, [0.18, 2.3, -0.42], [0.18, 0.08, 0.06]);
  addCharacterPart(group, geometry, glass, [0, 2.3, -0.43], [0.08, 0.05, 0.05]);

  const leftArm = addCharacterPart(group, geometry, coat, [-0.74, 1.36, 0], [0.26, 0.88, 0.32]);
  const rightArm = addCharacterPart(group, geometry, coat, [0.74, 1.42, 0], [0.26, 0.88, 0.32]);
  rightArm.rotation.z = -0.35;
  addCharacterPart(group, geometry, skin, [-0.74, 0.85, 0], [0.24, 0.2, 0.3]);
  const hand = addCharacterPart(group, geometry, skin, [0.92, 1.93, -0.02], [0.24, 0.22, 0.3]);

  addCharacterPart(group, geometry, pants, [-0.26, 0.35, 0], [0.28, 0.78, 0.34]);
  addCharacterPart(group, geometry, pants, [0.26, 0.35, 0], [0.28, 0.78, 0.34]);
  addCharacterPart(group, geometry, shoes, [-0.26, -0.1, -0.02], [0.32, 0.2, 0.4]);
  addCharacterPart(group, geometry, shoes, [0.26, -0.1, -0.02], [0.32, 0.2, 0.4]);

  const bookMesh = addCharacterPart(group, geometry, book, [-0.66, 1.12, -0.44], [0.48, 0.12, 0.36]);
  bookMesh.rotation.x = 0.24;

  group.position.set(2.35, 0.62, 2.45);
  group.rotation.y = -2.45;
  group.scale.setScalar(1.08);
  scene.add(group);

  return { group, body, head, rightArm, leftArm, hand, book: bookMesh };
}

function MinecraftWorld() {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return undefined;

    const mount = mountRef.current;
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x9bd6ff, 15, 38);

    const camera = new THREE.PerspectiveCamera(45, mount.clientWidth / mount.clientHeight, 0.1, 80);
    camera.position.set(8, 7, 10);

    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: true,
      preserveDrawingBuffer: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    const ambient = new THREE.HemisphereLight(0xe8f6ff, 0x4f6b43, 2.35);
    scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xffd26d, 4.7);
    sun.position.set(5, 12, 6);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 1024;
    sun.shadow.mapSize.height = 1024;
    scene.add(sun);

    const geometry = new THREE.BoxGeometry(0.95, 0.95, 0.95);
    const materials = Object.fromEntries(
      Object.entries(blockPalette).map(([key, colors]) => [
        key,
        colors.map((color) => makeMaterial(color)),
      ]),
    );

    const blocks = [];
    const floating = [];
    buildIsland(scene, blocks, geometry, materials);
    addVillagePath(scene, geometry);
    addFarm(scene, geometry, -5.2, -2.8);
    addVillageHouse(scene, geometry, -4.8, 2.8, 0.35, 0.66);
    addVillageHouse(scene, geometry, 0.2, 4.55, -0.12, 0.58);
    addConstructionSite(scene, geometry, 5.1, -1.65);
    addLamp(scene, geometry, -1.4, 1);
    addLamp(scene, geometry, 3.7, 1);
    addLamp(scene, geometry, -5.2, 1.2);
    addSakuraTree(scene, blocks, geometry, materials, -2.8, -1.4);
    addSakuraTree(scene, blocks, geometry, materials, 3.2, 2.55);
    addTorii(scene, blocks, geometry, materials);
    const distantVillage = addDistantVillage(scene, geometry, materials);
    const scholar = createVoxelScholar(scene, geometry);
    const cityActors = [
      createTinyVillager(scene, geometry, {
        role: 'builder',
        position: [4.2, 0.72, -1.05],
        rotation: -0.75,
        shirt: 0xd9842f,
        pants: 0x4b6386,
        hat: 0xf2b642,
        scale: 0.58,
      }),
      createTinyVillager(scene, geometry, {
        role: 'carrier',
        position: [1.1, 0.72, 1.08],
        rotation: -1.45,
        shirt: 0x4f8cc8,
        pants: 0x365b3b,
        scale: 0.54,
      }),
      createTinyVillager(scene, geometry, {
        role: 'farmer',
        position: [-5.8, 0.72, -2.7],
        rotation: 0.7,
        shirt: 0x5aa546,
        pants: 0x6b4d35,
        hat: 0xd9b15a,
        scale: 0.52,
      }),
      createTinyVillager(scene, geometry, {
        role: 'walk',
        position: [-1.2, 0.72, 0.92],
        rotation: 1.85,
        shirt: 0x8c6ec5,
        pants: 0x41516f,
        scale: 0.5,
      }),
    ];

    const pixelSun = new THREE.Group();
    const sunMaterial = makeMaterial(0xf2b642, 0.68, 0xffdc72, 0xc97428);
    for (let x = -1; x <= 1; x += 1) {
      for (let y = -1; y <= 1; y += 1) {
        const ray = addBlock(pixelSun, geometry, sunMaterial, x * 0.55, y * 0.55, 0, 0.48);
        ray.castShadow = false;
      }
    }
    pixelSun.position.set(7.8, 6.5, -9.6);
    pixelSun.rotation.y = -0.38;
    scene.add(pixelSun);

    for (let i = 0; i < 18; i += 1) {
      const angle = (i / 18) * Math.PI * 2;
      const radius = 7.5 + (i % 3);
      const y = 1.2 + (i % 5) * 0.45;
      const palette = i % 4 === 0 ? materials.lantern : materials.stone;
      const cube = addBlock(
        scene,
        geometry,
        palette[i % palette.length],
        Math.cos(angle) * radius,
        y,
        Math.sin(angle) * radius,
        0.34 + (i % 2) * 0.1,
      );
      floating.push({ mesh: cube, seed: i * 0.73, baseY: y });
    }

    const waterGeometry = new THREE.PlaneGeometry(46, 46, 16, 16);
    const waterMaterial = new THREE.MeshStandardMaterial({
      color: 0x3ba4d8,
      transparent: true,
      opacity: 0.5,
      roughness: 0.62,
      metalness: 0.03,
      side: THREE.DoubleSide,
    });
    const water = new THREE.Mesh(waterGeometry, waterMaterial);
    water.rotation.x = -Math.PI / 2;
    water.position.y = -1.48;
    scene.add(water);

    const cloudMaterial = makeMaterial(0xf6fbff, 0.92, 0xffffff, 0xc6d8e4);
    const clouds = [];
    for (let i = 0; i < 7; i += 1) {
      const cloud = new THREE.Group();
      for (let j = 0; j < 4; j += 1) {
        const puff = new THREE.Mesh(geometry, cloudMaterial);
        puff.position.set(j * 0.72, Math.sin(j) * 0.12, (j % 2) * 0.42);
        puff.scale.set(0.85, 0.42, 0.55);
        cloud.add(puff);
      }
      cloud.position.set(-12 + i * 4.1, 6.5 + (i % 2) * 0.7, -8 - (i % 3));
      scene.add(cloud);
      clouds.push(cloud);
    }

    const mouse = { x: 0, y: 0 };
    const target = new THREE.Vector3(0, 1.15, 0);
    const clock = new THREE.Clock();

    const handlePointer = (event) => {
      const rect = mount.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      mouse.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    };

    const handleClick = () => {
      const angle = Math.random() * Math.PI * 2;
      const cube = addBlock(
        scene,
        geometry,
        materials.lantern[Math.floor(Math.random() * materials.lantern.length)],
        Math.cos(angle) * 5,
        3 + Math.random() * 2.5,
        Math.sin(angle) * 5,
        0.28,
      );
      floating.push({ mesh: cube, seed: Math.random() * 12, baseY: cube.position.y });
    };

    const resize = () => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    mount.addEventListener('pointermove', handlePointer);
    mount.addEventListener('click', handleClick);
    window.addEventListener('resize', resize);

    let frameId = 0;
    const animate = () => {
      const time = clock.getElapsedTime();
      frameId = window.requestAnimationFrame(animate);

      camera.position.x = 8 + mouse.x * 1.4 + Math.sin(time * 0.16) * 0.7;
      camera.position.y = 6.8 - mouse.y * 0.75 + Math.sin(time * 0.22) * 0.25;
      camera.lookAt(target);

      blocks.forEach((block, index) => {
        if (index % 7 === 0) {
          block.position.y += Math.sin(time * 1.4 + index) * 0.0009;
        }
      });

      floating.forEach(({ mesh, seed, baseY }) => {
        mesh.rotation.y += 0.006 + seed * 0.0006;
        mesh.position.y = baseY + Math.sin(time * 1.2 + seed) * 0.22;
      });

      scholar.group.position.y = 0.55 + Math.sin(time * 1.8) * 0.035;
      scholar.head.rotation.y = Math.sin(time * 1.15) * 0.08;
      scholar.rightArm.rotation.z = -0.72 + Math.sin(time * 3.4) * 0.44;
      scholar.leftArm.rotation.z = 0.14 + Math.sin(time * 2.2) * 0.08;
      scholar.hand.position.y = 1.96 + Math.sin(time * 3.4) * 0.16;
      scholar.book.rotation.z = Math.sin(time * 2.1) * 0.07;
      pixelSun.rotation.z += 0.003;
      distantVillage.position.y = 1.1 + Math.sin(time * 0.55) * 0.04;

      cityActors.forEach((actor, index) => {
        actor.group.position.y = actor.baseY + Math.sin(time * 2.2 + actor.seed) * 0.035;
        actor.head.rotation.y = Math.sin(time * 1.4 + actor.seed) * 0.08;

        if (actor.role === 'builder') {
          actor.rightArm.rotation.z = -0.95 + Math.sin(time * 5.2) * 0.72;
          actor.leftArm.rotation.z = 0.28;
          if (actor.tool) actor.tool.rotation.z = Math.sin(time * 5.2) * 0.45;
        } else if (actor.role === 'carrier') {
          actor.group.position.x = actor.baseX + Math.sin(time * 0.9) * 0.42;
          actor.group.position.z = actor.baseZ + Math.cos(time * 0.9) * 0.18;
          actor.group.rotation.y = -1.45 + Math.sin(time * 0.9) * 0.26;
          actor.leftArm.rotation.x = -0.34;
          actor.rightArm.rotation.x = -0.34;
          if (actor.tool) actor.tool.position.y = 0.98 + Math.sin(time * 2.4) * 0.04;
        } else if (actor.role === 'farmer') {
          actor.rightArm.rotation.z = -0.35 + Math.sin(time * 2.8) * 0.38;
          actor.leftArm.rotation.z = 0.12;
          if (actor.tool) actor.tool.rotation.x = 0.42 + Math.sin(time * 2.8) * 0.28;
        } else {
          actor.group.position.x = actor.baseX + Math.sin(time * 0.7 + index) * 0.25;
          actor.leftArm.rotation.z = Math.sin(time * 2.5 + index) * 0.28;
          actor.rightArm.rotation.z = -Math.sin(time * 2.5 + index) * 0.28;
        }
      });

      clouds.forEach((cloud, index) => {
        cloud.position.x += 0.006 + index * 0.0004;
        if (cloud.position.x > 16) cloud.position.x = -16;
      });

      water.rotation.z = Math.sin(time * 0.16) * 0.01;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.cancelAnimationFrame(frameId);
      mount.removeEventListener('pointermove', handlePointer);
      mount.removeEventListener('click', handleClick);
      window.removeEventListener('resize', resize);
      renderer.dispose();
      geometry.dispose();
      waterGeometry.dispose();
      const disposedMaterials = new Set();
      scene.traverse((object) => {
        if (!object.isMesh) return;
        const meshMaterials = Array.isArray(object.material) ? object.material : [object.material];
        meshMaterials.forEach((material) => {
          if (disposedMaterials.has(material)) return;
          disposedMaterials.add(material);
          material.map?.dispose();
          material.dispose();
        });
      });
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div className="world-canvas" ref={mountRef} aria-hidden="true" />;
}

export default MinecraftWorld;
