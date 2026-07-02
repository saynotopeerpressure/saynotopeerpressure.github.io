import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const palettes = {
  research: {
    grass: [0x61b84c, 0x3f9437, 0x91d75c],
    earth: [0x8d5b36, 0x5d3d28, 0xb47a45],
    accent: [0x8b9288, 0x5f675f, 0xc4c8bb],
    glow: [0xf2b642, 0xd17929, 0xffdf73],
    sky: 0x8ed2ff,
  },
  projects: {
    grass: [0x67b447, 0x458f36, 0x94d45b],
    earth: [0x9a6337, 0x623d24, 0xc2834b],
    accent: [0xc69454, 0x8f5d34, 0xe0b374],
    glow: [0xf2b642, 0xd17929, 0xffdf73],
    sky: 0x82c7ee,
  },
  papers: {
    grass: [0x7aaa55, 0x547f3b, 0xa5c86b],
    earth: [0x6d4529, 0x4e3525, 0x9a6a3d],
    accent: [0xf8e8bd, 0x8b3f45, 0x2e83d7],
    glow: [0xf2b642, 0xd17929, 0xffdf73],
    sky: 0x7fc5ea,
  },
  contact: {
    grass: [0x6f876d, 0x4e5e51, 0x9aa39a],
    earth: [0xd3bb7f, 0x987047, 0xf0d799],
    accent: [0x3ba4d8, 0x256fae, 0x7fd5e8],
    glow: [0xf2b642, 0xd17929, 0xffdf73],
    sky: 0x74bddf,
  },
};

function colorStyle(color) {
  return `#${color.toString(16).padStart(6, '0')}`;
}

function shade(color, amount) {
  const threeColor = new THREE.Color(color);
  threeColor.offsetHSL(0, amount > 0 ? 0.06 : -0.04, amount);
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
  context.fillRect(3, 5, 3, 3);
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

function makeMaterial(color, roughness = 0.84, accent, dark) {
  return new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: makePixelTexture(color, accent, dark),
    roughness,
    metalness: 0.01,
    flatShading: true,
  });
}

function addCube(parent, geometry, material, position, scale = [1, 1, 1]) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...position);
  mesh.scale.set(...scale);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function markInteractive(root, kind) {
  root.userData.interactiveKind = kind;
  root.userData.homePosition = root.position.clone();
  root.userData.moveOffset = new THREE.Vector3();
  root.userData.targetOffset = new THREE.Vector3();
  root.userData.actionUntil = 0;
  root.userData.clickSeed = 0;
  return root;
}

function addClickPuffs(group, geometry, materials, position, kind, time) {
  const palette =
    kind === 'pig'
      ? [materials.snout, materials.pig, materials.path]
      : kind === 'chicken'
        ? [materials.white, materials.lantern, materials.red]
        : kind === 'cow'
          ? [materials.white, materials.black, materials.path]
          : [materials.lantern, materials.paper, materials.green];

  for (let i = 0; i < 7; i += 1) {
    const angle = (i / 7) * Math.PI * 2;
    const radius = 0.28 + (i % 3) * 0.12;
    const puff = addCube(
      group,
      geometry,
      palette[i % palette.length],
      [position.x + Math.cos(angle) * radius, position.y + 0.8 + (i % 2) * 0.18, position.z + Math.sin(angle) * radius],
      [0.16, 0.16, 0.16],
    );
    puff.castShadow = false;
    puff.receiveShadow = false;
    puff.userData.puffBorn = time;
    puff.userData.puffLife = 0.82 + i * 0.035;
    puff.userData.puffSeed = i * 0.6 + position.x;
    puff.userData.puffOrigin = puff.position.clone();
  }
}

function makeMaterials(palette) {
  return {
    grass: palette.grass.map((color) => makeMaterial(color)),
    earth: palette.earth.map((color) => makeMaterial(color)),
    accent: palette.accent.map((color) => makeMaterial(color)),
    glow: palette.glow.map((color) => makeMaterial(color, 0.64)),
    path: makeMaterial(0xd9c17a, 0.86, 0xf1dea0, 0xa77c45),
    sand: makeMaterial(0xe7d39a, 0.86, 0xffedb7, 0xb8955f),
    wood: makeMaterial(0x8f5d34, 0.88, 0xb77c48, 0x4b301f),
    darkWood: makeMaterial(0x4e3525, 0.9, 0x7a5132, 0x2f2117),
    stone: makeMaterial(0x7f877d, 0.86, 0xa8afa4, 0x4d554d),
    brick: makeMaterial(0x9a6a3d, 0.88, 0xc38a52, 0x5f3d24),
    roof: makeMaterial(0x425047, 0.9, 0x65766b, 0x242f29),
    glass: makeMaterial(0x8dd4ee, 0.62, 0xcdf8ff, 0x2d83a2),
    water: makeMaterial(0x48b7df, 0.58, 0x87e5ff, 0x23739d),
    skin: makeMaterial(0xd99b72, 0.8, 0xf2bf97, 0xa76345),
    skinDark: makeMaterial(0xb97855, 0.82, 0xd6936f, 0x74422c),
    hair: makeMaterial(0x2f211a, 0.9, 0x5b4032, 0x1c1210),
    white: makeMaterial(0xf6f1df, 0.88, 0xffffff, 0xd8cfb9),
    paper: makeMaterial(0xf8e8bd, 0.88, 0xfff5d4, 0xd1b778),
    pig: makeMaterial(0xeaa0a9, 0.82, 0xffbdc7, 0xbf6f7d),
    snout: makeMaterial(0xf5b5bd, 0.82, 0xffcbd2, 0xc57b88),
    black: makeMaterial(0x1f211b, 0.94, 0x34382d, 0x090a08),
    red: makeMaterial(0xc9453e, 0.82, 0xf06d61, 0x7f2926),
    blue: makeMaterial(0x3778c6, 0.82, 0x6da9e6, 0x204a84),
    green: makeMaterial(0x3f9437, 0.86, 0x6fbe55, 0x245e25),
    crop: makeMaterial(0xcbb644, 0.86, 0xf1da67, 0x837428),
    leafSakura: makeMaterial(0xe9a8b4, 0.82, 0xf4c8cf, 0xc77f91),
    leafOak: makeMaterial(0x6fbd4a, 0.84, 0x9cdd68, 0x3d7d35),
    lantern: makeMaterial(0xffd66f, 0.58, 0xffedaa, 0xc98527),
    iron: makeMaterial(0xbfc8c8, 0.78, 0xf0ffff, 0x6b7473),
  };
}

function buildTerrain(group, geometry, materials, variant) {
  const radiusX = variant === 'contact' ? 10 : 11;
  const radiusZ = variant === 'papers' ? 7 : 6;
  for (let x = -radiusX; x <= radiusX; x += 1) {
    for (let z = -radiusZ; z <= radiusZ; z += 1) {
      const softCorner = Math.abs(x) / radiusX + Math.abs(z) / radiusZ;
      const terrace = Math.sin(x * 0.62 + z * 0.38) + Math.cos((x - z) * 0.34);
      const wave = terrace > 1.1 ? 0.38 : terrace < -1.12 ? -0.22 : 0;
      const isHarbor = variant === 'contact' && z > 2 && x < -1;
      const isLibraryFloor = variant === 'papers' && x > 0 && z < 3;
      const islandEdge = softCorner > 1.03;

      if (softCorner < 1.19 && !isHarbor) {
        const topMaterial = isLibraryFloor
          ? materials.path
          : materials.grass[Math.abs(x + z + 24) % materials.grass.length];
        addCube(group, geometry, topMaterial, [x, wave, z]);

        const layers = islandEdge ? 3 : 2;
        for (let layer = 1; layer <= layers; layer += 1) {
          const sideMaterial =
            layer === layers && islandEdge
              ? materials.stone
              : materials.earth[Math.abs(x * 2 + z + layer) % materials.earth.length];
          addCube(group, geometry, sideMaterial, [x, wave - layer * 0.96, z]);
        }

        if ((x + z) % 5 === 0 && !isLibraryFloor && !islandEdge) {
          addCube(group, geometry, materials.grass[1], [x, wave + 0.52, z], [0.18, 0.18, 0.18]);
        }
      } else if (variant === 'contact' && softCorner < 1.42) {
        addCube(group, geometry, materials.sand, [x, -0.46, z], [1, 0.52, 1]);
      }
    }
  }
}

function addPath(group, geometry, materials, tiles, material = materials.path) {
  tiles.forEach(([x, z, scaleX = 1, scaleZ = 1]) => {
    addCube(group, geometry, material, [x, 0.55, z], [scaleX, 0.12, scaleZ]);
  });
}

function addPathLine(group, geometry, materials, start, end, material = materials.path) {
  const [x1, z1] = start;
  const [x2, z2] = end;
  const steps = Math.max(Math.abs(x2 - x1), Math.abs(z2 - z1));
  const tiles = [];
  for (let i = 0; i <= steps; i += 1) {
    const t = steps === 0 ? 0 : i / steps;
    tiles.push([Math.round(x1 + (x2 - x1) * t), Math.round(z1 + (z2 - z1) * t)]);
  }
  addPath(group, geometry, materials, tiles, material);
}

function addTree(group, geometry, materials, x, z, kind = 'oak') {
  const leafMaterial = kind === 'sakura' ? materials.leafSakura : materials.leafOak;
  for (let y = 0.85; y <= 2.55; y += 0.86) {
    addCube(group, geometry, materials.wood, [x, y, z], [0.42, 0.82, 0.42]);
  }
  const leaves = [
    [0, 3.05, 0],
    [0.8, 2.75, 0],
    [-0.8, 2.75, 0],
    [0, 2.75, 0.8],
    [0, 2.75, -0.8],
    [0.6, 3.45, 0.6],
    [-0.6, 3.45, -0.6],
  ];
  leaves.forEach(([dx, y, dz], index) =>
    addCube(group, geometry, leafMaterial, [x + dx, y, z + dz], [0.82 + (index % 2) * 0.08, 0.82, 0.82]),
  );
}

function addBush(group, geometry, materials, x, z, kind = 'oak') {
  const leafMaterial = kind === 'sakura' ? materials.leafSakura : materials.leafOak;
  addCube(group, geometry, leafMaterial, [x, 0.9, z], [0.72, 0.52, 0.72]);
  addCube(group, geometry, leafMaterial, [x + 0.5, 0.72, z - 0.16], [0.46, 0.38, 0.46]);
  addCube(group, geometry, leafMaterial, [x - 0.42, 0.7, z + 0.22], [0.42, 0.34, 0.42]);
}

function addFence(group, geometry, materials, tiles, rotation = 0) {
  tiles.forEach(([x, z, length = 1]) => {
    const root = new THREE.Group();
    addCube(root, geometry, materials.wood, [-0.44 * length, 0.84, 0], [0.16, 0.62, 0.16]);
    addCube(root, geometry, materials.wood, [0.44 * length, 0.84, 0], [0.16, 0.62, 0.16]);
    addCube(root, geometry, materials.wood, [0, 1.02, 0], [0.94 * length, 0.14, 0.14]);
    addCube(root, geometry, materials.wood, [0, 0.66, 0], [0.94 * length, 0.12, 0.12]);
    root.position.set(x, 0.48, z);
    root.rotation.y = rotation;
    group.add(root);
  });
}

function addLamp(group, geometry, materials, x, z) {
  addCube(group, geometry, materials.darkWood, [x, 0.9, z], [0.18, 0.9, 0.18]);
  addCube(group, geometry, materials.darkWood, [x, 1.78, z], [0.18, 0.7, 0.18]);
  addCube(group, geometry, materials.glow[0], [x, 2.33, z], [0.34, 0.34, 0.34]);
}

function addScaffold(group, geometry, materials, x, z) {
  const root = new THREE.Group();
  [-1.25, 1.25].forEach((dx) => {
    [-1.05, 1.05].forEach((dz) => {
      addCube(root, geometry, materials.wood, [dx, 0.72, dz], [0.2, 0.9, 0.2]);
      addCube(root, geometry, materials.wood, [dx, 1.65, dz], [0.2, 0.9, 0.2]);
    });
  });
  addCube(root, geometry, materials.wood, [0, 2.25, -1.05], [2.8, 0.18, 0.22]);
  addCube(root, geometry, materials.wood, [0, 2.25, 1.05], [2.8, 0.18, 0.22]);
  addCube(root, geometry, materials.wood, [-1.25, 2.25, 0], [0.22, 0.18, 2.4]);
  addCube(root, geometry, materials.wood, [1.25, 2.25, 0], [0.22, 0.18, 2.4]);
  addCube(root, geometry, materials.stone, [0, 0.22, 0], [2.2, 0.34, 1.8]);
  addCube(root, geometry, materials.glow[1], [1.9, 1.0, -1.25], [0.34, 0.34, 0.34]);
  root.position.set(x, 0.52, z);
  root.rotation.y = -0.32;
  group.add(root);
  return root;
}

function addCrane(group, geometry, materials, x, z) {
  const root = new THREE.Group();
  addCube(root, geometry, materials.darkWood, [0, 1.15, 0], [0.24, 1.5, 0.24]);
  addCube(root, geometry, materials.darkWood, [0, 2.7, 0], [0.28, 1.48, 0.28]);
  addCube(root, geometry, materials.wood, [1.15, 3.36, 0], [2.7, 0.16, 0.18]);
  addCube(root, geometry, materials.wood, [-0.9, 3.12, 0], [1.36, 0.14, 0.16]);
  addCube(root, geometry, materials.darkWood, [2.38, 2.72, 0], [0.08, 1.04, 0.08]);
  addCube(root, geometry, materials.stone, [2.38, 2.06, 0], [0.46, 0.36, 0.46]);
  addCube(root, geometry, materials.lantern, [-1.58, 2.66, 0], [0.32, 0.32, 0.32]);
  root.position.set(x, 0.52, z);
  root.rotation.y = -0.38;
  group.add(root);
  return root;
}

function addCrates(group, geometry, materials, x, z, count = 4) {
  for (let i = 0; i < count; i += 1) {
    const dx = (i % 2) * 0.54;
    const dz = Math.floor(i / 2) * 0.54;
    const y = i > 2 ? 1.04 : 0.62;
    addCube(group, geometry, i % 3 === 0 ? materials.wood : materials.path, [x + dx, y, z + dz], [0.45, 0.45, 0.45]);
  }
}

function addWorkbench(group, geometry, materials, x, z) {
  const root = new THREE.Group();
  addCube(root, geometry, materials.wood, [0, 0.74, 0], [0.9, 0.28, 0.62]);
  addCube(root, geometry, materials.darkWood, [-0.32, 0.36, -0.18], [0.12, 0.44, 0.12]);
  addCube(root, geometry, materials.darkWood, [0.32, 0.36, -0.18], [0.12, 0.44, 0.12]);
  addCube(root, geometry, materials.iron, [0.18, 1.0, -0.08], [0.36, 0.12, 0.12]);
  addCube(root, geometry, materials.paper, [-0.24, 0.98, 0.06], [0.3, 0.06, 0.28]);
  root.position.set(x, 0.5, z);
  root.rotation.y = 0.36;
  group.add(root);
  return root;
}

function addReadingTable(group, geometry, materials, x, z) {
  const root = new THREE.Group();
  addCube(root, geometry, materials.darkWood, [0, 0.78, 0], [1.1, 0.18, 0.7]);
  addCube(root, geometry, materials.paper, [-0.24, 0.92, -0.08], [0.42, 0.06, 0.36]);
  addCube(root, geometry, materials.blue, [0.24, 0.94, 0.06], [0.34, 0.08, 0.42]);
  addCube(root, geometry, materials.lantern, [0, 1.24, 0.42], [0.22, 0.28, 0.22]);
  [-0.46, 0.46].forEach((dx) => {
    addCube(root, geometry, materials.wood, [dx, 0.4, -0.24], [0.12, 0.42, 0.12]);
    addCube(root, geometry, materials.wood, [dx, 0.4, 0.24], [0.12, 0.42, 0.12]);
  });
  root.position.set(x, 0.5, z);
  root.rotation.y = -0.55;
  group.add(root);
  return root;
}

function addBookStack(group, geometry, materials, x, z) {
  const colors = [materials.paper, materials.blue, materials.red, materials.green];
  colors.forEach((material, index) => {
    addCube(group, geometry, material, [x, 0.63 + index * 0.12, z], [0.62 - index * 0.05, 0.08, 0.42]);
  });
}

function addCropPatch(group, geometry, materials, x, z) {
  for (let dx = -1; dx <= 1; dx += 1) {
    for (let dz = -1; dz <= 1; dz += 1) {
      addCube(group, geometry, materials.earth[1], [x + dx * 0.72, 0.58, z + dz * 0.72], [0.58, 0.14, 0.58]);
      addCube(group, geometry, materials.crop, [x + dx * 0.72, 0.88, z + dz * 0.72], [0.14, 0.34, 0.14]);
    }
  }
}

function addHouse(group, geometry, materials, x, z, scale = 0.68) {
  const root = new THREE.Group();
  for (let dx = -1; dx <= 1; dx += 1) {
    for (let dz = -1; dz <= 1; dz += 1) {
      const wall = Math.abs(dx) === 1 || Math.abs(dz) === 1;
      if (wall) addCube(root, geometry, materials.accent[0], [dx, 0.9, dz], [0.86, 0.82, 0.86]);
      if (wall && !(dx === 0 && dz === -1)) addCube(root, geometry, materials.accent[0], [dx, 1.72, dz], [0.86, 0.82, 0.86]);
    }
  }
  addCube(root, geometry, materials.darkWood, [0, 0.9, -1.05], [0.48, 0.82, 0.12]);
  addCube(root, geometry, materials.glass, [-1.04, 1.45, 0], [0.12, 0.38, 0.4]);
  addCube(root, geometry, materials.glass, [1.04, 1.45, 0], [0.12, 0.38, 0.4]);
  addCube(root, geometry, materials.lantern, [0.62, 1.65, -1.08], [0.18, 0.22, 0.18]);
  for (let dx = -1.5; dx <= 1.5; dx += 1) {
    for (let dz = -1.5; dz <= 1.5; dz += 1) {
      const roofMaterial = Math.abs(dx) === 1.5 || Math.abs(dz) === 1.5 ? materials.roof : materials.darkWood;
      addCube(root, geometry, roofMaterial, [dx, 2.35 + (Math.abs(dx) + Math.abs(dz) < 1 ? 0.22 : 0), dz], [0.9, 0.36, 0.9]);
    }
  }
  addCube(root, geometry, materials.darkWood, [0, 2.86, 0], [1.2, 0.28, 1.2]);
  root.position.set(x, 0.52, z);
  root.scale.setScalar(scale);
  root.rotation.y = 0.35;
  group.add(root);
  return root;
}

function addLibrary(group, geometry, materials, x, z) {
  const root = addHouse(group, geometry, materials, x, z, 0.62);
  for (let i = 0; i < 5; i += 1) {
    addCube(root, geometry, materials.accent[(i % 2) + 1] ?? materials.glow[0], [-1.22 + i * 0.48, 1.1, -1.55], [0.18, 0.72, 0.18]);
  }
  addCube(root, geometry, materials.paper, [0, 1.68, -1.55], [1.18, 0.16, 0.18]);
  addCube(root, geometry, materials.darkWood, [-1.65, 0.95, 0.4], [0.2, 1.0, 1.1]);
  addCube(root, geometry, materials.paper, [-1.78, 1.12, 0.05], [0.1, 0.7, 0.16]);
  addCube(root, geometry, materials.blue, [-1.78, 1.12, 0.32], [0.1, 0.7, 0.16]);
  addCube(root, geometry, materials.red, [-1.78, 1.12, 0.59], [0.1, 0.7, 0.16]);
  addCube(root, geometry, materials.glow[0], [0, 2.72, -0.2], [0.32, 0.44, 0.32]);
  return root;
}

function addLabTower(group, geometry, materials, x, z) {
  const root = new THREE.Group();
  for (let y = 0.8; y <= 2.45; y += 0.82) {
    addCube(root, geometry, materials.stone, [0, y, 0], [0.92, 0.76, 0.92]);
  }
  addCube(root, geometry, materials.glass, [0, 1.62, -0.52], [0.56, 0.46, 0.1]);
  addCube(root, geometry, materials.glass, [0.52, 1.62, 0], [0.1, 0.46, 0.56]);
  addCube(root, geometry, materials.roof, [0, 3.03, 0], [1.3, 0.34, 1.3]);
  addCube(root, geometry, materials.lantern, [0, 3.38, 0], [0.38, 0.38, 0.38]);
  addCube(root, geometry, materials.iron, [0, 3.92, 0], [0.12, 0.9, 0.12]);
  addCube(root, geometry, materials.glass, [0, 4.48, 0], [0.28, 0.28, 0.28]);
  root.position.set(x, 0.52, z);
  root.rotation.y = -0.5;
  root.scale.setScalar(0.72);
  group.add(root);
  return root;
}

function addVillageGate(group, geometry, materials, x, z) {
  const root = new THREE.Group();
  [-1.0, 1.0].forEach((dx) => {
    addCube(root, geometry, materials.darkWood, [dx, 0.94, 0], [0.32, 1.1, 0.32]);
    addCube(root, geometry, materials.darkWood, [dx, 2.05, 0], [0.32, 1.1, 0.32]);
  });
  addCube(root, geometry, materials.roof, [0, 2.78, 0], [2.7, 0.34, 0.5]);
  addCube(root, geometry, materials.lantern, [0, 1.96, -0.15], [0.34, 0.36, 0.24]);
  addCube(root, geometry, materials.paper, [0, 2.24, -0.24], [0.82, 0.28, 0.08]);
  root.position.set(x, 0.52, z);
  root.rotation.y = -0.68;
  group.add(root);
  return root;
}

function addDock(group, geometry, materials, x, z) {
  const root = new THREE.Group();
  for (let i = 0; i < 5; i += 1) {
    addCube(root, geometry, materials.wood, [i * 0.78, 0.64, 0], [0.68, 0.12, 1.2]);
  }
  [0, 1.56, 3.12].forEach((dx) => {
    addCube(root, geometry, materials.darkWood, [dx, 0.45, -0.55], [0.14, 0.6, 0.14]);
    addCube(root, geometry, materials.darkWood, [dx, 0.45, 0.55], [0.14, 0.6, 0.14]);
  });
  addCube(root, geometry, materials.lantern, [3.38, 1.22, -0.55], [0.28, 0.28, 0.28]);
  root.position.set(x, 0.34, z);
  root.rotation.y = -0.62;
  group.add(root);
  return root;
}

function addBoat(group, geometry, materials, x, z) {
  const root = new THREE.Group();
  addCube(root, geometry, materials.darkWood, [0, 0.42, 0], [1.2, 0.24, 0.46]);
  addCube(root, geometry, materials.wood, [-0.5, 0.56, 0], [0.2, 0.28, 0.58]);
  addCube(root, geometry, materials.wood, [0.5, 0.56, 0], [0.2, 0.28, 0.58]);
  addCube(root, geometry, materials.paper, [0.05, 0.98, -0.06], [0.08, 0.82, 0.48]);
  addCube(root, geometry, materials.darkWood, [0, 0.86, -0.05], [0.08, 0.86, 0.08]);
  root.position.set(x, -0.5, z);
  root.rotation.y = -0.92;
  group.add(root);
  return root;
}

function addPortal(group, geometry, materials, x, z) {
  const root = new THREE.Group();
  const frame = materials.stone;
  const core = materials.accent[0];
  [-0.72, 0.72].forEach((dx) => {
    addCube(root, geometry, frame, [dx, 0.85, 0], [0.32, 0.86, 0.32]);
    addCube(root, geometry, frame, [dx, 1.7, 0], [0.32, 0.86, 0.32]);
  });
  addCube(root, geometry, frame, [0, 2.35, 0], [1.78, 0.32, 0.34]);
  addCube(root, geometry, core, [0, 1.4, -0.05], [0.82, 1.32, 0.08]);
  addCube(root, geometry, materials.glow[0], [1.25, 2.7, 0], [0.32, 0.32, 0.32]);
  root.position.set(x, 0.7, z);
  root.rotation.y = -0.45;
  group.add(root);
  return root;
}

function addVoxelPerson(group, geometry, materials, x, z, kind = 'builder') {
  const root = new THREE.Group();
  const shirt =
    kind === 'builder'
      ? materials.lantern
      : kind === 'reader'
        ? materials.white
        : kind === 'gardener'
          ? materials.green
          : kind === 'villager'
            ? materials.brick
            : materials.blue;
  const pants = kind === 'builder' ? materials.darkWood : kind === 'reader' ? materials.blue : materials.roof;
  const skin = kind === 'villager' ? materials.skinDark : materials.skin;

  addCube(root, geometry, skin, [0, 1.68, 0], [0.58, 0.62, 0.58]);
  addCube(root, geometry, materials.hair, [0, 2.05, -0.02], [0.66, 0.18, 0.66]);
  addCube(root, geometry, materials.hair, [-0.28, 1.76, 0], [0.14, 0.42, 0.62]);
  addCube(root, geometry, materials.hair, [0.28, 1.76, 0], [0.14, 0.42, 0.62]);
  addCube(root, geometry, materials.black, [-0.17, 1.75, -0.32], [0.08, 0.08, 0.04]);
  addCube(root, geometry, materials.black, [0.17, 1.75, -0.32], [0.08, 0.08, 0.04]);
  addCube(root, geometry, skin, [0, 1.62, -0.38], [0.14, 0.12, 0.1]);
  addCube(root, geometry, shirt, [0, 1.02, 0], [0.58, 0.72, 0.36]);
  addCube(root, geometry, shirt, [-0.48, 1.03, -0.03], [0.18, 0.62, 0.22]);
  addCube(root, geometry, shirt, [0.48, 1.03, -0.03], [0.18, 0.62, 0.22]);
  addCube(root, geometry, pants, [-0.2, 0.36, 0], [0.2, 0.62, 0.24]);
  addCube(root, geometry, pants, [0.2, 0.36, 0], [0.2, 0.62, 0.24]);
  addCube(root, geometry, materials.black, [-0.2, 0.02, -0.02], [0.22, 0.12, 0.28]);
  addCube(root, geometry, materials.black, [0.2, 0.02, -0.02], [0.22, 0.12, 0.28]);
  addCube(root, geometry, materials.black, [0, -0.08, 0.08], [0.66, 0.05, 0.42]);

  if (kind === 'builder') {
    addCube(root, geometry, materials.wood, [0.7, 1.18, -0.14], [0.12, 0.64, 0.12]);
    addCube(root, geometry, materials.iron, [0.82, 1.48, -0.18], [0.34, 0.1, 0.1]);
  }
  if (kind === 'reader') {
    addCube(root, geometry, materials.paper, [-0.34, 1.08, -0.34], [0.42, 0.08, 0.3]);
    addCube(root, geometry, materials.blue, [0.06, 1.08, -0.34], [0.34, 0.08, 0.3]);
  }
  if (kind === 'map') {
    addCube(root, geometry, materials.paper, [0.02, 1.08, -0.38], [0.68, 0.08, 0.34]);
    addCube(root, geometry, materials.green, [0.2, 1.15, -0.44], [0.12, 0.03, 0.12]);
  }
  if (kind === 'gardener') {
    addCube(root, geometry, materials.crop, [0.7, 1.0, -0.2], [0.12, 0.54, 0.12]);
    addCube(root, geometry, materials.iron, [0.82, 0.74, -0.2], [0.28, 0.1, 0.1]);
  }
  if (kind === 'villager') {
    addCube(root, geometry, materials.paper, [0, 1.1, -0.39], [0.46, 0.1, 0.28]);
  }
  root.position.set(x, 0.65, z);
  root.rotation.y =
    kind === 'reader' ? -2.35 : kind === 'map' ? -0.8 : kind === 'gardener' ? -1.45 : kind === 'villager' ? -2.72 : -0.64;
  root.scale.setScalar(0.82);
  markInteractive(root, 'npc');
  group.add(root);
  return root;
}

function addPig(group, geometry, materials, x, z) {
  const root = new THREE.Group();
  addCube(root, geometry, materials.pig, [0, 0.55, 0], [0.86, 0.42, 0.48]);
  addCube(root, geometry, materials.pig, [0.58, 0.66, 0], [0.38, 0.38, 0.38]);
  addCube(root, geometry, materials.snout, [0.84, 0.62, 0], [0.18, 0.17, 0.22]);
  addCube(root, geometry, materials.black, [0.86, 0.65, -0.08], [0.03, 0.03, 0.03]);
  addCube(root, geometry, materials.black, [0.86, 0.65, 0.08], [0.03, 0.03, 0.03]);
  addCube(root, geometry, materials.black, [0.68, 0.74, -0.17], [0.05, 0.05, 0.03]);
  addCube(root, geometry, materials.black, [0.68, 0.74, 0.17], [0.05, 0.05, 0.03]);
  addCube(root, geometry, materials.pig, [0.55, 0.93, -0.2], [0.12, 0.16, 0.12]);
  addCube(root, geometry, materials.pig, [0.55, 0.93, 0.2], [0.12, 0.16, 0.12]);
  [-0.28, 0.28].forEach((dx) => {
    addCube(root, geometry, materials.pig, [dx, 0.18, -0.16], [0.12, 0.28, 0.12]);
    addCube(root, geometry, materials.pig, [dx, 0.18, 0.16], [0.12, 0.28, 0.12]);
  });
  addCube(root, geometry, materials.snout, [-0.52, 0.67, 0], [0.12, 0.08, 0.08]);
  root.position.set(x, 0.55, z);
  root.rotation.y = -0.35;
  root.userData.bobSeed = x + z;
  markInteractive(root, 'pig');
  group.add(root);
  return root;
}

function addChicken(group, geometry, materials, x, z) {
  const root = new THREE.Group();
  addCube(root, geometry, materials.white, [0, 0.55, 0], [0.46, 0.42, 0.38]);
  addCube(root, geometry, materials.white, [0.38, 0.76, 0], [0.3, 0.3, 0.3]);
  addCube(root, geometry, materials.white, [-0.08, 0.58, -0.28], [0.2, 0.28, 0.1]);
  addCube(root, geometry, materials.white, [-0.08, 0.58, 0.28], [0.2, 0.28, 0.1]);
  addCube(root, geometry, materials.red, [0.36, 0.98, 0], [0.16, 0.1, 0.12]);
  addCube(root, geometry, materials.glow[0], [0.58, 0.74, 0], [0.16, 0.1, 0.12]);
  addCube(root, geometry, materials.black, [0.52, 0.82, -0.09], [0.04, 0.04, 0.03]);
  addCube(root, geometry, materials.black, [0.52, 0.82, 0.09], [0.04, 0.04, 0.03]);
  addCube(root, geometry, materials.glow[1], [0.02, 0.18, -0.12], [0.08, 0.24, 0.08]);
  addCube(root, geometry, materials.glow[1], [0.22, 0.18, -0.12], [0.08, 0.24, 0.08]);
  root.position.set(x, 0.52, z);
  root.rotation.y = -0.7;
  root.userData.bobSeed = x * 0.4 + z;
  markInteractive(root, 'chicken');
  group.add(root);
  return root;
}

function addCow(group, geometry, materials, x, z) {
  const root = new THREE.Group();
  addCube(root, geometry, materials.white, [0, 0.7, 0], [0.96, 0.52, 0.52]);
  addCube(root, geometry, materials.black, [-0.22, 0.76, -0.27], [0.28, 0.24, 0.05]);
  addCube(root, geometry, materials.black, [0.18, 0.64, 0.27], [0.24, 0.2, 0.05]);
  addCube(root, geometry, materials.white, [0.66, 0.82, 0], [0.42, 0.42, 0.42]);
  addCube(root, geometry, materials.black, [0.84, 0.9, -0.13], [0.05, 0.05, 0.03]);
  addCube(root, geometry, materials.black, [0.84, 0.9, 0.13], [0.05, 0.05, 0.03]);
  addCube(root, geometry, materials.snout, [0.92, 0.72, 0], [0.16, 0.15, 0.24]);
  addCube(root, geometry, materials.white, [0.52, 1.1, -0.22], [0.12, 0.14, 0.12]);
  addCube(root, geometry, materials.white, [0.52, 1.1, 0.22], [0.12, 0.14, 0.12]);
  [-0.34, 0.3].forEach((dx) => {
    addCube(root, geometry, materials.black, [dx, 0.25, -0.18], [0.12, 0.36, 0.12]);
    addCube(root, geometry, materials.black, [dx, 0.25, 0.18], [0.12, 0.36, 0.12]);
  });
  root.position.set(x, 0.52, z);
  root.rotation.y = -0.54;
  root.userData.bobSeed = x - z;
  markInteractive(root, 'cow');
  group.add(root);
  return root;
}

function addFloaters(group, geometry, materials, variant) {
  const positions = [
    [-8.8, 3.2, -3.4],
    [-6.6, 4.4, 1.8],
    [-4.1, 3.85, -4.8],
    [-1.2, 4.7, -2.7],
    [2.6, 4.15, -4.4],
    [5.4, 3.62, 1.1],
    [7.2, 4.8, -2.4],
    [9.3, 3.5, 0.8],
  ];
  positions.forEach(([x, y, z], index) => {
    const palette = index % 3 === 0 ? materials.glow : index % 3 === 1 ? materials.earth : materials.accent;
    const cube = addCube(group, geometry, palette[index % palette.length], [x, y, z], [0.45, 0.45, 0.45]);
    cube.userData.floatSeed = index * 0.6 + variant.length;
  });

  const chainStart = variant === 'projects' ? [2.8, 3.6, -1.8] : variant === 'papers' ? [-0.8, 3.2, 2.6] : [-6.8, 3.1, 0.6];
  for (let i = 0; i < 5; i += 1) {
    const cube = addCube(
      group,
      geometry,
      i % 2 === 0 ? materials.lantern : materials.path,
      [chainStart[0] + i * 0.62, chainStart[1] + Math.sin(i) * 0.18, chainStart[2] - i * 0.48],
      [0.34, 0.34, 0.34],
    );
    cube.userData.floatSeed = i * 0.42 + 8 + variant.length;
  }
}

function buildScene(group, geometry, materials, type) {
  buildTerrain(group, geometry, materials, type);
  addFloaters(group, geometry, materials, type);
  addPathLine(group, geometry, materials, [-8, 1], [7, -1]);
  addPathLine(group, geometry, materials, [-2, 4], [3, -4]);
  addLamp(group, geometry, materials, -6.4, 1.6);
  addLamp(group, geometry, materials, 6.8, -1.1);
  addBush(group, geometry, materials, -7.6, -0.7, type === 'papers' ? 'oak' : 'sakura');
  addBush(group, geometry, materials, 7.6, 1.8, type === 'research' ? 'sakura' : 'oak');

  if (type === 'research') {
    addTree(group, geometry, materials, -7.2, -2.6, 'sakura');
    addTree(group, geometry, materials, 4.8, 2.7, 'sakura');
    addLabTower(group, geometry, materials, 5.3, -2.1);
    addHouse(group, geometry, materials, 7.4, 1.1, 0.48);
    addReadingTable(group, geometry, materials, 0.6, 0.25);
    addBookStack(group, geometry, materials, -0.75, 0.65);
    addBookStack(group, geometry, materials, 1.72, -0.42);
    addCropPatch(group, geometry, materials, -4.7, 2.8);
    addFence(group, geometry, materials, [[-5.7, 2.1], [-4.6, 2.1], [-3.5, 2.1], [-5.7, 3.5], [-4.6, 3.5], [-3.5, 3.5]]);
    addPig(group, geometry, materials, -3.2, 2.8);
    addChicken(group, geometry, materials, 2.9, 2.8);
    addCow(group, geometry, materials, -6.2, -0.2);
    addVoxelPerson(group, geometry, materials, -0.2, 0.8, 'reader');
    addVoxelPerson(group, geometry, materials, 2.2, -0.7, 'map');
    addVoxelPerson(group, geometry, materials, -4.0, 2.2, 'gardener');
  } else if (type === 'projects') {
    addTree(group, geometry, materials, -7.2, -2.1, 'oak');
    addScaffold(group, geometry, materials, 4.7, -1.6);
    addCrane(group, geometry, materials, 1.8, -2.7);
    addHouse(group, geometry, materials, 7.0, 1.6, 0.42);
    addCrates(group, geometry, materials, -1.0, 1.6, 6);
    addWorkbench(group, geometry, materials, 0.4, 0.15);
    addFence(group, geometry, materials, [[3.2, 0.8], [4.3, 0.8], [5.4, 0.8], [6.5, 0.8]]);
    addPig(group, geometry, materials, -4.8, 3.0);
    addChicken(group, geometry, materials, -2.9, 2.5);
    addVoxelPerson(group, geometry, materials, 2.6, 0.5, 'builder');
    addVoxelPerson(group, geometry, materials, 6.5, -0.2, 'builder');
    addVoxelPerson(group, geometry, materials, -0.8, 0.4, 'map');
  } else if (type === 'papers') {
    addTree(group, geometry, materials, -7.3, -2.4, 'oak');
    addTree(group, geometry, materials, 4.8, 2.7, 'sakura');
    addLibrary(group, geometry, materials, 5.0, -1.1);
    addReadingTable(group, geometry, materials, -0.1, 0.1);
    addBookStack(group, geometry, materials, -1.5, 0.8);
    addBookStack(group, geometry, materials, 1.1, -0.55);
    addBookStack(group, geometry, materials, 2.0, 1.1);
    addPath(group, geometry, materials, [[-2, -1, 1.2, 1], [-1, -1, 1.2, 1], [0, -1, 1.2, 1], [1, -1, 1.2, 1]], materials.paper);
    addFence(group, geometry, materials, [[3.4, 1.6], [4.5, 1.6], [5.6, 1.6], [6.7, 1.6]]);
    addPig(group, geometry, materials, -5.3, 2.6);
    addChicken(group, geometry, materials, 2.8, 2.8);
    addCow(group, geometry, materials, -6.5, -0.5);
    addVoxelPerson(group, geometry, materials, 0.6, 0.72, 'reader');
    addVoxelPerson(group, geometry, materials, 6.8, 0.15, 'reader');
    addVoxelPerson(group, geometry, materials, -2.6, -0.6, 'villager');
  } else {
    addPathLine(group, geometry, materials, [-7, -3], [4, 2], materials.sand);
    addDock(group, geometry, materials, -6.2, 3.2);
    addBoat(group, geometry, materials, -4.2, 5.0);
    addVillageGate(group, geometry, materials, 2.8, -0.7);
    addPortal(group, geometry, materials, 5.8, -1.8);
    addHouse(group, geometry, materials, 7.7, 1.1, 0.46);
    addCrates(group, geometry, materials, -1.3, 2.4, 5);
    addFence(group, geometry, materials, [[1.2, 1.2], [2.3, 1.2], [3.4, 1.2], [4.5, 1.2]]);
    addTree(group, geometry, materials, -7.7, -1.7, 'oak');
    addPig(group, geometry, materials, 0.7, 2.2);
    addChicken(group, geometry, materials, -2.0, 1.6);
    addCow(group, geometry, materials, -6.8, 0.4);
    addVoxelPerson(group, geometry, materials, 0.6, 0.2, 'map');
    addVoxelPerson(group, geometry, materials, 4.7, 0.15, 'villager');
    addVoxelPerson(group, geometry, materials, -2.8, 2.7, 'builder');
  }
}

function VoxelSectionWorld({ type }) {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return undefined;

    const mount = mountRef.current;
    const palette = palettes[type] ?? palettes.research;
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(palette.sky, 12, 34);

    const camera = new THREE.PerspectiveCamera(39, mount.clientWidth / mount.clientHeight, 0.1, 70);
    camera.position.set(7.6, 5.8, 9.4);

    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: true,
      preserveDrawingBuffer: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.35));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    const ambient = new THREE.HemisphereLight(0xe8f6ff, 0x4f6b43, 2.2);
    scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xffd26d, 4.4);
    sun.position.set(5, 11, 6);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 1024;
    sun.shadow.mapSize.height = 1024;
    scene.add(sun);

    const geometry = new THREE.BoxGeometry(0.95, 0.95, 0.95);
    const materials = makeMaterials(palette);
    const world = new THREE.Group();
    world.position.set(1.05, -0.12, 0.18);
    world.rotation.y = -0.08;
    world.scale.setScalar(1.06);
    scene.add(world);
    buildScene(world, geometry, materials, type);

    const interactiveMeshes = [];
    world.traverse((object) => {
      if (!object.userData.interactiveKind) return;
      object.userData.baseRotationY = object.rotation.y;
      object.userData.baseRotationZ = object.rotation.z;
      object.userData.baseScale = object.scale.clone();
      object.traverse((child) => {
        if (!child.isMesh) return;
        child.userData.interactiveRoot = object;
        interactiveMeshes.push(child);
      });
    });

    const waterGeometry = new THREE.PlaneGeometry(36, 36, 8, 8);
    const water = new THREE.Mesh(
      waterGeometry,
      new THREE.MeshStandardMaterial({
        color: 0x3ba4d8,
        transparent: true,
        opacity: type === 'contact' ? 0.3 : 0.18,
        roughness: 0.64,
        side: THREE.DoubleSide,
      }),
    );
    water.rotation.x = -Math.PI / 2;
    water.position.y = -1.52;
    scene.add(water);

    const mouse = { x: 0, y: 0 };
    const target = new THREE.Vector3(0.55, 1.02, -0.18);
    const cameraLookAt = target.clone();
    const cameraBasePosition = new THREE.Vector3();
    const cameraDesiredPosition = new THREE.Vector3();
    const cameraFocusPosition = new THREE.Vector3();
    const cameraFocusPoint = target.clone();
    const pickedWorldPosition = new THREE.Vector3();
    const groundClickPoint = new THREE.Vector3();
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const zeroOffset = new THREE.Vector3();
    const clickGroundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.62);
    const cameraFocus = {
      start: 0,
      until: 0,
      duration: 1.7,
      strength: 0,
      side: 1,
      kind: 'ground',
    };
    const clock = new THREE.Clock();
    let interactionClearId = 0;

    const pickInteractive = (event) => {
      if (!interactiveMeshes.length) return null;
      const rect = mount.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(interactiveMeshes, false);
      return hits[0]?.object.userData.interactiveRoot ?? null;
    };

    const setCameraFocus = (point, kind, time, side = 1) => {
      cameraFocusPoint.copy(point);
      cameraFocus.start = time;
      cameraFocus.duration = kind === 'ground' ? 1.05 : 1.75;
      cameraFocus.until = time + cameraFocus.duration;
      cameraFocus.strength = kind === 'ground' ? 0.34 : 1;
      cameraFocus.side = side || 1;
      cameraFocus.kind = kind;
      mount.dataset.cameraFocus = kind;
      window.clearTimeout(interactionClearId);
      interactionClearId = window.setTimeout(() => {
        delete mount.dataset.lastInteraction;
        delete mount.dataset.cameraFocus;
      }, 900);
    };

    const handlePointer = (event) => {
      const rect = mount.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      mouse.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      mount.classList.toggle('is-clickable', Boolean(pickInteractive(event)));
    };

    const handlePointerLeave = () => {
      mount.classList.remove('is-clickable');
    };

    const handlePointerDown = (event) => {
      const root = pickInteractive(event);
      const time = clock.getElapsedTime();
      if (!root) {
        const groundHit = raycaster.ray.intersectPlane(clickGroundPlane, groundClickPoint);
        if (groundHit && Number.isFinite(groundClickPoint.x)) {
          setCameraFocus(groundClickPoint, 'ground', time, groundClickPoint.x > target.x ? 1 : -1);
        }
        return;
      }

      const kind = root.userData.interactiveKind;
      const away = new THREE.Vector3(root.position.x - target.x, 0, root.position.z - target.z);
      if (away.lengthSq() < 0.08) away.set(Math.cos(time * 2), 0, Math.sin(time * 2));
      away.normalize();

      const distance = kind === 'pig' ? 1.55 : kind === 'chicken' ? 1.12 : kind === 'cow' ? 0.78 : 0.44;
      const limit = kind === 'pig' ? 2.45 : kind === 'chicken' ? 1.82 : kind === 'cow' ? 1.16 : 0.72;
      root.userData.targetOffset.add(away.multiplyScalar(distance));
      root.userData.targetOffset.x = THREE.MathUtils.clamp(root.userData.targetOffset.x, -limit, limit);
      root.userData.targetOffset.z = THREE.MathUtils.clamp(root.userData.targetOffset.z, -limit, limit);
      root.userData.actionUntil = time + (kind === 'pig' ? 1.45 : kind === 'chicken' ? 1.2 : 1.05);
      root.userData.clickSeed += 1;
      root.rotation.y = Math.atan2(away.x, away.z) - Math.PI / 2;
      addClickPuffs(world, geometry, materials, root.position, kind, time);
      mount.dataset.lastInteraction = kind;
      root.getWorldPosition(pickedWorldPosition);
      pickedWorldPosition.y += kind === 'npc' ? 1.05 : 0.62;
      setCameraFocus(pickedWorldPosition, kind, time, away.x >= 0 ? 1 : -1);
    };

    const resize = () => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    mount.addEventListener('pointermove', handlePointer);
    mount.addEventListener('pointerleave', handlePointerLeave);
    mount.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('resize', resize);

    let frameId = 0;
    const animate = () => {
      const time = clock.getElapsedTime();
      frameId = window.requestAnimationFrame(animate);
      const compact = mount.clientWidth < 680;
      const baseX = compact ? 6.7 : 7.6;
      const baseY = compact ? 5.95 : 5.8;
      const baseZ = compact ? 10.3 : 9.4;
      const focusRemaining = Math.max(0, cameraFocus.until - time);
      const focusProgress =
        focusRemaining > 0 ? THREE.MathUtils.clamp((time - cameraFocus.start) / cameraFocus.duration, 0, 1) : 1;
      const focusPulse = focusRemaining > 0 ? Math.sin(focusProgress * Math.PI) * cameraFocus.strength : 0;

      cameraBasePosition.set(
        baseX + mouse.x * 0.65 + Math.sin(time * 0.2) * 0.22,
        baseY - mouse.y * 0.36 + Math.sin(time * 0.24) * 0.12,
        baseZ + Math.cos(time * 0.16) * 0.18,
      );
      cameraFocusPosition.copy(cameraBasePosition);
      cameraFocusPosition.x += (cameraFocusPoint.x - target.x) * 0.34 + cameraFocus.side * 0.58 * focusPulse;
      cameraFocusPosition.y -= 0.5 * focusPulse;
      cameraFocusPosition.z -= (cameraFocus.kind === 'ground' ? 0.55 : 1.24) * focusPulse;
      cameraDesiredPosition.copy(cameraBasePosition).lerp(cameraFocusPosition, focusPulse * 0.82);
      camera.position.copy(cameraDesiredPosition);

      cameraLookAt.lerp(cameraFocusPoint, focusPulse * 0.1);
      if (focusPulse <= 0.02) cameraLookAt.lerp(target, 0.08);
      camera.lookAt(cameraLookAt);
      const desiredFov = 39 - 4.4 * focusPulse;
      if (Math.abs(camera.fov - desiredFov) > 0.01) {
        camera.fov = THREE.MathUtils.lerp(camera.fov, desiredFov, 0.1);
        camera.updateProjectionMatrix();
      }
      world.rotation.y = -0.08 + Math.sin(time * 0.18) * 0.026 + cameraFocus.side * focusPulse * 0.012;
      world.traverse((object) => {
        if (object.userData.puffBorn !== undefined) {
          const age = time - object.userData.puffBorn;
          const progress = age / object.userData.puffLife;
          if (progress >= 1) {
            object.parent?.remove(object);
            return;
          }
          object.position.y = object.userData.puffOrigin.y + progress * 0.9;
          object.position.x = object.userData.puffOrigin.x + Math.cos(object.userData.puffSeed) * progress * 0.22;
          object.position.z = object.userData.puffOrigin.z + Math.sin(object.userData.puffSeed) * progress * 0.22;
          object.rotation.y += 0.04;
          object.scale.setScalar(THREE.MathUtils.lerp(0.18, 0.02, progress));
          return;
        }
        if (object.userData.floatSeed !== undefined) {
          object.rotation.y += 0.008;
          object.position.y += Math.sin(time * 1.2 + object.userData.floatSeed) * 0.002;
        }
        if (object.userData.interactiveKind !== undefined) {
          const kind = object.userData.interactiveKind;
          const speed = kind === 'pig' ? 0.1 : kind === 'chicken' ? 0.13 : kind === 'cow' ? 0.055 : 0.075;
          const active = Math.max(0, object.userData.actionUntil - time);
          const seed = object.userData.bobSeed ?? object.userData.homePosition.x + object.userData.homePosition.z;
          object.userData.moveOffset.lerp(object.userData.targetOffset, speed);
          if (active <= 0) object.userData.targetOffset.lerp(zeroOffset, kind === 'cow' ? 0.01 : 0.017);

          const bob = Math.sin(time * 2.1 + seed) * 0.035;
          const hopSpeed = kind === 'pig' ? 13 : kind === 'chicken' ? 18 : kind === 'cow' ? 8 : 10;
          const hopHeight = kind === 'pig' ? 0.2 : kind === 'chicken' ? 0.28 : kind === 'cow' ? 0.08 : 0.16;
          const hop = active > 0 ? Math.abs(Math.sin(time * hopSpeed + object.userData.clickSeed)) * hopHeight : 0;
          object.position.x = object.userData.homePosition.x + object.userData.moveOffset.x;
          object.position.y = object.userData.homePosition.y + bob + hop;
          object.position.z = object.userData.homePosition.z + object.userData.moveOffset.z;

          const wobble = active > 0 ? Math.sin(time * hopSpeed + object.userData.clickSeed) : 0;
          object.rotation.z = object.userData.baseRotationZ + wobble * (kind === 'chicken' ? 0.16 : 0.07);
          if (active <= 0) {
            object.rotation.y = THREE.MathUtils.lerp(object.rotation.y, object.userData.baseRotationY, 0.025);
          }
          const squash = active > 0 ? Math.abs(wobble) * 0.05 : 0;
          object.scale.set(
            object.userData.baseScale.x * (1 + squash),
            object.userData.baseScale.y * (1 - squash * 0.65),
            object.userData.baseScale.z * (1 + squash),
          );
          return;
        }
        if (object.userData.bobSeed !== undefined) {
          if (object.userData.baseY === undefined) object.userData.baseY = object.position.y;
          object.position.y = object.userData.baseY + Math.sin(time * 2.1 + object.userData.bobSeed) * 0.035;
          object.rotation.y += Math.sin(time * 1.35 + object.userData.bobSeed) * 0.0008;
        }
      });
      water.rotation.z = Math.sin(time * 0.16) * 0.012;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(interactionClearId);
      mount.removeEventListener('pointermove', handlePointer);
      mount.removeEventListener('pointerleave', handlePointerLeave);
      mount.removeEventListener('pointerdown', handlePointerDown);
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
  }, [type]);

  return <div className="voxel-section-canvas" ref={mountRef} aria-hidden="true" />;
}

export default VoxelSectionWorld;
