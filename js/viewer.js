document.addEventListener('DOMContentLoaded', function() {
  const initialImage = document.getElementById('initial-image');
  const modelViewer = document.getElementById('model-viewer');
  const spritesView = document.getElementById('sprites-view');
  const prevButton = document.getElementById('prev-button');
  const nextButton = document.getElementById('next-button');
  let threeJsCanvas = null;
  let currentStep = 0;
  const totalSteps = 2; // 0: initial image, 1: 3D model, 2: sprites

  function updateNavButtons() {
    prevButton.disabled = currentStep === 0;
    nextButton.disabled = currentStep === totalSteps;
  }

  function showStep(step) {
    // Hide all views
    initialImage.style.display = 'none';
    if (threeJsCanvas) {
      threeJsCanvas.style.display = 'none';
    }
    modelViewer.style.display = 'none';
    spritesView.style.display = 'none';

    // Show current step
    switch(step) {
      case 0:
        initialImage.style.display = 'block';
        break;
      case 1:
        modelViewer.style.display = 'block';
        if (threeJsCanvas) {
          threeJsCanvas.style.display = 'block';
        } else {
          loadThreeJS();
        }
        break;
      case 2:
        spritesView.style.display = 'block';
        break;
    }

    currentStep = step;
    updateNavButtons();
  }

  prevButton.addEventListener('click', function() {
    if (currentStep > 0) {
      showStep(currentStep - 1);
    }
  });

  nextButton.addEventListener('click', function() {
    if (currentStep < totalSteps) {
      showStep(currentStep + 1);
    }
  });

  // Initialize
  updateNavButtons();

  function loadThreeJS() {
    const scripts = [
      'js/three.min.js',
      'js/OrbitControls.js',
      'js/FBXLoader.js'
    ];

    let loaded = 0;
    scripts.forEach(src => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => {
        loaded++;
        if (loaded === scripts.length) {
          initViewer();
        }
      };
      document.body.appendChild(script);
    });
  }

  function initViewer() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true });

    const container = document.getElementById('model-viewer');
    renderer.setSize(container.clientWidth, container.clientHeight);
    
    // Insert the canvas before the button
    const button = document.getElementById('show-animation');
    container.insertBefore(renderer.domElement, button);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
    directionalLight.position.set(0, 1, 0);
    scene.add(directionalLight);
    const pointLight = new THREE.PointLight(0xffffff, 0.7);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.7);
    hemisphereLight.position.set(0, 20, 0);
    scene.add(hemisphereLight);

    // Set up OrbitControls
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;
    controls.maxPolarAngle = Math.PI;

    // Set renderer to have a light grey background
    renderer.setClearColor(0x7f7f7f, 1);

    // Load the 3D model
    const loader = new THREE.FBXLoader();
    loader.load(
      'demo.fbx',
      function (object) {
        const box = new THREE.Box3().setFromObject(object);
        const center = box.getCenter(new THREE.Vector3());
        object.position.sub(center);
        
        const scale = 1;
        object.scale.set(scale, scale, scale);
        object.rotation.y = Math.PI;
        scene.add(object);

        // Adjust camera position
        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        camera.position.set(0, 0, maxDim * 1.5);
        camera.lookAt(0, 0, 0);

        controls.target.set(0, 0, 0);
        controls.update();
      },
      function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      },
      function (error) {
        console.error('An error happened', error);
      }
    );

    // Animation loop
    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);
    function onWindowResize() {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    }

    // Store reference to canvas
    threeJsCanvas = renderer.domElement;
  }
});
