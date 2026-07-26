/* ==========================================================================
   Twinfinity - Three.js 3D Canon DSLR/Mirrorless Camera & L-Lens Engine
   ========================================================================== */

(function () {
  const container = document.getElementById('canvas-container');
  if (!container || typeof THREE === 'undefined') return;

  // 1. Scene, Camera, Renderer Setup
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0b0f19, 0.025);

  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 13);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);

  // 2. 3D Canon Camera Master Assembly Group
  const canonCameraGroup = new THREE.Group();

  // A) Canon Camera Main Body Box (Black Matte Texture)
  const bodyGeo = new THREE.BoxGeometry(3.6, 2.4, 1.4);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x111827,
    metalness: 0.85,
    roughness: 0.25
  });
  const cameraBody = new THREE.Mesh(bodyGeo, bodyMat);
  canonCameraGroup.add(cameraBody);

  // B) Right Hand Grip Extension
  const gripGeo = new THREE.BoxGeometry(0.7, 2.3, 1.6);
  const gripMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    metalness: 0.7,
    roughness: 0.4
  });
  const cameraGrip = new THREE.Mesh(gripGeo, gripMat);
  cameraGrip.position.set(1.65, -0.05, 0.2);
  canonCameraGroup.add(cameraGrip);

  // C) Top Viewfinder Prism Bump (Pentaprism)
  const prismGeo = new THREE.CylinderGeometry(0.8, 1.3, 0.8, 4);
  const prismMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.9,
    roughness: 0.2
  });
  const prismMesh = new THREE.Mesh(prismGeo, prismMat);
  prismMesh.rotation.y = Math.PI / 4;
  prismMesh.position.set(0, 1.5, 0);
  canonCameraGroup.add(prismMesh);

  // Hotshoe Flash Mount on Top Prism
  const hotshoeGeo = new THREE.BoxGeometry(0.6, 0.1, 0.6);
  const hotshoeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95 });
  const hotshoe = new THREE.Mesh(hotshoeGeo, hotshoeMat);
  hotshoe.position.set(0, 1.95, 0);
  canonCameraGroup.add(hotshoe);

  // D) Top Mode Dial & Shutter Button (Canon Red Ring Accent)
  const dialGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.25, 32);
  const dialMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9 });
  const modeDial = new THREE.Mesh(dialGeo, dialMat);
  modeDial.position.set(-1.2, 1.3, 0);
  canonCameraGroup.add(modeDial);

  const shutterGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.15, 32);
  const shutterMat = new THREE.MeshStandardMaterial({ color: 0x00f2fe, metalness: 0.9, emissive: 0x003b46 });
  const shutterButton = new THREE.Mesh(shutterGeo, shutterMat);
  shutterButton.position.set(1.3, 1.35, 0.4);
  canonCameraGroup.add(shutterButton);

  // E) Canon Professional L-Series Lens Assembly
  const lensGroup = new THREE.Group();

  // Lens Metal Mount Ring
  const mountGeo = new THREE.CylinderGeometry(1.35, 1.35, 0.3, 64);
  const mountMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.95, roughness: 0.1 });
  const mountMesh = new THREE.Mesh(mountGeo, mountMat);
  mountMesh.rotation.x = Math.PI / 2;
  mountMesh.position.z = 0.8;
  lensGroup.add(mountMesh);

  // Main Lens Barrel
  const lensBarrelGeo = new THREE.CylinderGeometry(1.5, 1.4, 2.2, 64);
  const lensBarrelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.2 });
  const lensBarrel = new THREE.Mesh(lensBarrelGeo, lensBarrelMat);
  lensBarrel.rotation.x = Math.PI / 2;
  lensBarrel.position.z = 1.9;
  lensGroup.add(lensBarrel);

  // ** SIGNATURE CANON RED RING (L-Series Luxury Lens Line) **
  const redRingGeo = new THREE.TorusGeometry(1.52, 0.04, 16, 100);
  const redRingMat = new THREE.MeshStandardMaterial({
    color: 0xef4444, // Iconic Canon Red
    metalness: 0.8,
    roughness: 0.2,
    emissive: 0x991b1b,
    emissiveIntensity: 0.4
  });
  const redRing = new THREE.Mesh(redRingGeo, redRingMat);
  redRing.position.z = 2.8;
  lensGroup.add(redRing);

  // Knurled Rubber Focus Ring
  const focusRingGeo = new THREE.TorusGeometry(1.53, 0.08, 16, 100);
  const focusRingMat = new THREE.MeshStandardMaterial({ color: 0x00f2fe, metalness: 0.95, roughness: 0.1 });
  const focusRing = new THREE.Mesh(focusRingGeo, focusRingMat);
  focusRing.position.z = 2.2;
  lensGroup.add(focusRing);

  // Front Lens Element (Glass with Optical Flare)
  const glassGeo = new THREE.CylinderGeometry(1.38, 1.38, 0.15, 64);
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x7f00ff,
    metalness: 0.1,
    roughness: 0.05,
    transmission: 0.85,
    ior: 1.5,
    reflectivity: 0.9,
    clearcoat: 1.0
  });
  const glassLens = new THREE.Mesh(glassGeo, glassMat);
  glassLens.rotation.x = Math.PI / 2;
  glassLens.position.z = 3.0;
  lensGroup.add(glassLens);

  canonCameraGroup.add(lensGroup);

  // Outer Floating Optical Halo Rings
  const haloGeo1 = new THREE.TorusGeometry(4.2, 0.02, 16, 100);
  const haloMat1 = new THREE.MeshBasicMaterial({ color: 0x00f2fe, transparent: true, opacity: 0.4 });
  const haloRing1 = new THREE.Mesh(haloGeo1, haloMat1);
  scene.add(haloRing1);

  const haloGeo2 = new THREE.TorusGeometry(5.0, 0.015, 16, 100);
  const haloMat2 = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.3 });
  const haloRing2 = new THREE.Mesh(haloGeo2, haloMat2);
  scene.add(haloRing2);

  // Position Canon Camera Group on Hero Right Side
  canonCameraGroup.position.set(3.2, 0, 0);
  scene.add(canonCameraGroup);

  // 3. Studio Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
  scene.add(ambientLight);

  const cyanSpot = new THREE.PointLight(0x00f2fe, 4, 25);
  cyanSpot.position.set(5, 6, 6);
  scene.add(cyanSpot);

  const redSpot = new THREE.PointLight(0xef4444, 3, 20);
  redSpot.position.set(-5, -5, 6);
  scene.add(redSpot);

  const goldLight = new THREE.PointLight(0xffd700, 2, 15);
  goldLight.position.set(0, 5, 4);
  scene.add(goldLight);

  // 4. Floating Dust Particles
  const particleCount = 250;
  const particleGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 35;
    positions[i + 1] = (Math.random() - 0.5) * 35;
    positions[i + 2] = (Math.random() - 0.5) * 20;
  }

  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particleMat = new THREE.PointsMaterial({
    size: 0.07,
    color: 0x00f2fe,
    transparent: true,
    opacity: 0.6
  });
  const particleSystem = new THREE.Points(particleGeo, particleMat);
  scene.add(particleSystem);

  // 5. Mouse Parallax & Window Resizing
  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX - window.innerWidth / 2) * 0.001;
    mouseY = (e.clientY - window.innerHeight / 2) * 0.001;
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

    if (window.innerWidth < 992) {
      canonCameraGroup.position.set(0, 1.5, -2);
    } else {
      canonCameraGroup.position.set(3.2, 0, 0);
    }
  });

  if (window.innerWidth < 992) {
    canonCameraGroup.position.set(0, 1.5, -2);
  }

  // 6. Animation Loop
  function animate() {
    requestAnimationFrame(animate);

    // Continuous 3D rotation of Canon Camera body & lens
    canonCameraGroup.rotation.y += 0.007;
    canonCameraGroup.rotation.x = Math.sin(Date.now() * 0.001) * 0.1;

    focusRing.rotation.z += 0.005;

    haloRing1.rotation.z -= 0.002;
    haloRing2.rotation.z += 0.003;

    // Smooth Mouse Interpolation
    targetX += (mouseX - targetX) * 0.05;
    targetY += (mouseY - targetY) * 0.05;

    camera.position.x = targetX * 3;
    camera.position.y = -targetY * 3;
    camera.lookAt(scene.position);

    particleSystem.rotation.y += 0.0005;

    renderer.render(scene, camera);
  }

  animate();
})();
