// Get the DOM element to attach to
const container =
    document.querySelector('#container');

// Set some camera attributes.
const VIEW_ANGLE = 90;
const ASPECT = window.innerWidth / window.innerHeight;
const NEAR = 1;
const FAR = 10000;

// Create a WebGL renderer, camera
// and a scene
const renderer = new THREE.WebGLRenderer();
renderer.setClearColor(0xeeeeee, 1);
const camera =
    new THREE.PerspectiveCamera(
        VIEW_ANGLE,
        ASPECT,
        NEAR,
        FAR
    );

var controls = new THREE.OrbitControls(camera, container);
camera.position.set(0, 0, -100);
controls.update();

const scene = new THREE.Scene();

// Add the camera to the scene.
scene.add(camera);

// Start the renderer.
renderer.setSize(window.innerWidth, window.innerHeight);

// Attach the renderer-supplied
// DOM element.
container.appendChild(renderer.domElement);

// create a point light
const pointLight =
  new THREE.PointLight(0xFFFFFF);

// set its position
pointLight.position.x = 10;
pointLight.position.y = 50;
pointLight.position.z = 130;

// add to the scene
scene.add(pointLight);

var Settings = function() {
  this.maxDisplacement = 2;
  this.difficulty = 50;
  this.steps = 1;
  this.thickness = 3;
  this.seed = "seed";
};

var track, line;

function updateSettings(s) {
  // generate track
  camera.position.set(0, 0, -100);
  scene.remove(line);
  scene.remove(track);
  trackGen = new TrackGenerator(100, 100, s.maxDisplacement, s.steps, s.thickness, s.difficulty, s.seed);
  line = trackGen.drawLine();
  scene.add(line);
  track = trackGen.generateMesh();
  scene.add(track);
  renderer.render(scene, camera);
}

window.onload = function() {
  var s = new Settings();
  // generate track
  trackGen = new TrackGenerator(100, 100, s.maxDisplacement, s.steps, s.thickness, s.difficulty, s.seed);
  line = trackGen.drawLine();
  scene.add(line);
  track = trackGen.generateMesh();
  scene.add(track);
  renderer.render(scene, camera);
  var gui = new dat.GUI();
  gui.add(s, 'seed').onChange(function() {updateSettings(s);});
  gui.add(s, 'difficulty').min(1).max(100).step(1).onChange(function() {updateSettings(s);});
  gui.add(s, 'maxDisplacement').min(0).max(100).step(1).onChange(function() {updateSettings(s);});
  gui.add(s, 'thickness').min(1).max(10).step(1).onChange(function() {updateSettings(s);});
}





function update() {
	requestAnimationFrame(update);
	controls.update();
	renderer.render(scene, camera);
}

requestAnimationFrame(update);

function resize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.render(scene, camera);
}
window.addEventListener('resize', resize, false);
