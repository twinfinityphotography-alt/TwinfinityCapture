/* ==========================================================================
   TWINFINITY CAPTURES - Three.js Interactive 3D Canon DSLR Camera Engine
   ========================================================================== */

(function () {
  const container = document.getElementById('canvas-container');
  if (!container || typeof THREE === 'undefined') return;

  // 1. Three.js Scene & Camera Initialization
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x06070b, 0.025);

  const camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 11);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);

  // 2. Canon DSLR Camera Master Assembly Group
  const canonCameraGroup = new THREE.Group();

  // A) Main Camera Body Box
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

  // C) Viewfinder Pentaprism Bump
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

  // D) Canon Red Ring L-Series Lens Assembly
  const lensBaseGeo = new THREE.CylinderGeometry(1.2, 1.2, 1.6, 32);
  const lensMat = new THREE.MeshStandardMaterial({
    color: 0x090d16,
    metalness: 0.9,
    roughness: 0.15
  });
  const lensBase = new THREE.Mesh(lensBaseGeo, lensMat);
  lensBase.rotation.x = Math.PI / 2;
  lensBase.position.set(0, 0, 1.5);
  canonCameraGroup.add(lensBase);

  // Canon Signature Red Ring Accent
  const redRingGeo = new THREE.TorusGeometry(1.21, 0.04, 16, 32);
  const redRingMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
  const redRing = new THREE.Mesh(redRingGeo, redRingMat);
  redRing.position.set(0, 0, 2.1);
  canonCameraGroup.add(redRing);

  // Front Lens Glass Element (Cyan Reflective Glass)
  const glassGeo = new THREE.CylinderGeometry(1.05, 1.05, 0.1, 32);
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x00f2fe,
    metalness: 0.1,
    roughness: 0.05,
    transmission: 0.85,
    thickness: 0.5,
    reflectivity: 0.9
  });
  const frontGlass = new THREE.Mesh(glassGeo, glassMat);
  frontGlass.rotation.x = Math.PI / 2;
  frontGlass.position.set(0, 0, 2.3);
  canonCameraGroup.add(frontGlass);

  // Add Camera Assembly to Scene
  scene.add(canonCameraGroup);

  // 3. Studio Lighting Setup
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  const spotLight1 = new THREE.SpotLight(0x00f2fe, 4);
  spotLight1.position.set(10, 10, 10);
  scene.add(spotLight1);

  const spotLight2 = new THREE.SpotLight(0x7f00ff, 3);
  spotLight2.position.set(-10, -10, 10);
  scene.add(spotLight2);

  // 4. Mouse Move & Scroll Reaction Engine
  let targetRotationY = 0;
  let targetRotationX = 0;
  let mouseX = 0;
  let mouseY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX - window.innerWidth / 2) * 0.0008;
    mouseY = (e.clientY - window.innerHeight / 2) * 0.0008;
  });

  window.addEventListener('scroll', () => {
    targetRotationY = window.scrollY * 0.002;
  });

  function animate() {
    requestAnimationFrame(animate);

    // Smooth Interpolation (Lerp)
    canonCameraGroup.rotation.y += (mouseX + targetRotationY - canonCameraGroup.rotation.y) * 0.05;
    canonCameraGroup.rotation.x += (mouseY - canonCameraGroup.rotation.x) * 0.05;

    // Gentle Hover Float Animation
    canonCameraGroup.position.y = Math.sin(Date.now() * 0.0015) * 0.2;

    renderer.render(scene, camera);
  }

  animate();

  // Resize Handler
  window.addEventListener('resize', () => {
    if (!container) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });
})();
