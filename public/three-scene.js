// three-scene.js — Three.js animated sacred background
// රන්වන් ආලෝක අංශු (golden light particles) පාවෙන animation එකක්

(function () {
  const container = document.getElementById('bg-canvas');

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 30;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // --- Golden particle field ---
  const particleCount = 500;
  const positions = new Float32Array(particleCount * 3);
  const speeds = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 80;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 60;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
    speeds[i] = 0.02 + Math.random() * 0.05;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0xffcf7a,
    size: 0.35,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  // --- Soft glowing torus (dharma-wheel-like ring) ---
  const ringGeo = new THREE.TorusGeometry(10, 0.15, 16, 100);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xffd98a, transparent: true, opacity: 0.35 });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.position.set(0, 0, -20);
  scene.add(ring);

  const ring2 = ring.clone();
  ring2.scale.set(1.6, 1.6, 1.6);
  ring2.material = ringMat.clone();
  ring2.material.opacity = 0.15;
  scene.add(ring2);

  function animate() {
    requestAnimationFrame(animate);

    const pos = geometry.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3 + 1] += speeds[i];
      if (pos[i * 3 + 1] > 30) pos[i * 3 + 1] = -30;
    }
    geometry.attributes.position.needsUpdate = true;

    ring.rotation.z += 0.0015;
    ring2.rotation.z -= 0.001;
    points.rotation.y += 0.0006;

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();
