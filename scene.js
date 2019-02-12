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

var controls = new THREE.OrbitControls(camera);
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
  this.pushIterations = 3;
  this.steps = 5;
  this.thickness = 3;
};

var track, line;

function updateSettings(s) {
  // generate track
  camera.position.set(0, 0, -100);
  scene.remove(line);
  scene.remove(track);
  trackGen = new TrackGenerator(100, 100, s.pushIterations, s.steps, s.thickness);
  line = trackGen.drawLine();
  scene.add(line);
  track = trackGen.generateMesh();
  scene.add(track);
  renderer.render(scene, camera);
}

window.onload = function() {
  var s = new Settings();
  // generate track
  trackGen = new TrackGenerator(100, 100, s.pushIterations, s.steps, s.thickness);
  line = trackGen.drawLine();
  scene.add(line);
  track = trackGen.generateMesh();
  scene.add(track);
  renderer.render(scene, camera);
  var gui = new dat.GUI();
  gui.add(s, 'pushIterations').min(1).max(10).step(1).onChange(function() {updateSettings(s);});
  gui.add(s, 'steps').min(1).max(10).step(1).onChange(function() {updateSettings(s);});
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
