
var camera, scene, renderer, geometry, material, mesh,camDistance;

init();
animate();

function init() {

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(50, 320/240, 1, 10000);
    camDistance = 1000;
    camera.position.z = camDistance;
    scene.add(camera);

    geometry = new THREE.CubeGeometry(500, 200, 200);
    material = new THREE.MeshNormalMaterial();
    //geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );

    mesh = new THREE.Mesh(geometry, material);
    //mesh.rotation.order = "ZYX"; // three.js r.65

    scene.add(mesh);
    var canvas = $('#cubecanvas')[0];
    renderer = new THREE.CanvasRenderer({ canvas: canvas });
    //renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setSize(320, 240);

    //document.body.appendChild(renderer.domElement);

}

function animate() {

    requestAnimationFrame(animate);
    render();

}

var initYaw = 0;
function rotateCube(x,y,z){

	//rotate cube using axis given.
	mesh.rotation.x= x * Math.PI / 180;
	mesh.rotation.z= z * Math.PI / 180;

	if (!initYaw) initYaw = y;
	//for yaw, we need to rotate camera not the object.
	y+=initYaw;
	camera.position.x = mesh.position.x + camDistance * Math.cos( y * Math.PI / 180);         
	camera.position.z = mesh.position.z + camDistance * Math.sin( y * Math.PI / 180);
	camera.lookAt( mesh.position );

	
	
	
}

function render() {

renderer.render(scene, camera);

}
