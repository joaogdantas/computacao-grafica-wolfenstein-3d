import * as THREE from 'three';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x3c3c3c);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const textureLoader = new THREE.TextureLoader();
const wallTexture = textureLoader.load('images/wall.png');
const doorTexture = textureLoader.load('images/door.png');
const gunTexture = textureLoader.load('images/gun.png');

const geometry = new THREE.BoxGeometry(2, 2, 2);
const doorGeometry = new THREE.BoxGeometry(2, 2, 0.5);
const gunGeometry = new THREE.PlaneGeometry(10, 10);
const wallsMaterial = new THREE.MeshBasicMaterial({ map: wallTexture });
const groundMaterial = new THREE.MeshBasicMaterial({ color: 0x808080, wireframe: false });
const doorMaterial = new THREE.MeshBasicMaterial({ map: doorTexture });
const gunMaterial = new THREE.MeshBasicMaterial({ map: gunTexture });

//Aqui se pode criar um mapa do tamanho desejado, 
//no qual cada 1 na matriz vai ser um cubo e 0 um espaço livre
const wallsMatrix = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 0, 0, 1, 1, 0, 1, 1],
    [1, 1, 0, 0, 1, 1, 0, 1, 1],
    [1, 1, 0, 0, 1, 1, 1, 1, 1],
    [1, 1, 0, 0, 1, 0, 0, 1, 1],
	[1, 1, 0, 0, 1, 0, 0, 1, 1],
	[1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 1, 1],
	[1, 1, 1, 1, 1, 1, 1, 1, 1],
	[1, 1, 0, 0, 0, 0, 0, 1, 1],
	[1, 1, 0, 0, 0, 0, 0, 1, 1],
	[1, 1, 1, 1, 1, 1, 1, 1, 1],
	[1, 1, 1, 1, 1, 1, 1, 1, 1]
];

//Aqui colocar os cubos da matriz da parede que são portas
const doorCubes = [{ x: 3, y: 7 }, { x: 5, y: 7 }, { x: 6, y: 4 }, { x: 4, y: 13 }];

//Matriz para criar o chão da cena, ela precisa ser do mesmo tamanho
//que a matriz das paredes, mas com tudo 1. 
const groundMatrix = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
	[1, 1, 1, 1, 1, 1, 1, 1, 1],
	[1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
	[1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
	[1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1]
];

function createCubesFromMatrix(matrix, yOffset, wallMaterial, doorMaterial, doorCubes) {
    const numRows = matrix.length;
    const numCols = matrix[0].length;

    for (let i = 0; i < numRows; i++) {
        for (let j = 0; j < numCols; j++) {
            if (matrix[i][j] === 1) {
                let cubeGeometry = geometry;
                let cubeMaterial = wallMaterial;

                const isDoor = doorCubes.some(cube => cube.x === j && cube.y === i);
                if (isDoor) {
                    cubeGeometry = doorGeometry;
                    cubeMaterial = doorMaterial;
                }

                const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
                cube.position.set(j * 2, yOffset, i * 2);
                scene.add(cube);
            }
        }
    }
}


createCubesFromMatrix(wallsMatrix, 0, wallsMaterial, doorMaterial, doorCubes);
createCubesFromMatrix(groundMatrix, -2, groundMaterial, doorMaterial, []);


// Aqui se pode posicionar a câmera na posição desejada, 
//basta tratar a const cameraX como a posição na coluna - 1 e cameraZ como a posição na linha - 1
function positionCameraAtMatrixPosition(matrix, camera, cubeDistance) {
    const cameraX = 4 * cubeDistance;
    const cameraZ = 14 * cubeDistance;
    camera.position.set(cameraX, 0, cameraZ);
}

positionCameraAtMatrixPosition(wallsMatrix, camera, 2);

const moveSpeed = 0.1;
const keysPressed = {};

function checkCollision() {
    scene.traverse(function(object) {
        if (object instanceof THREE.Mesh) {
            const boundingBox = new THREE.Box3().setFromObject(object);

            if (boundingBox.containsPoint(camera.position)) {
                const cameraDirection = new THREE.Vector3();
                camera.getWorldDirection(cameraDirection);
                const cameraNextPosition = camera.position.clone().add(cameraDirection);

                if (keysPressed['z'] && doorCubes.some(cube => cube.x === Math.round(cameraNextPosition.x / 2) && cube.y === Math.round(cameraNextPosition.z / 2))) {
                   
                    const doorCubeIndex = doorCubes.findIndex(cube => cube.x === Math.round(cameraNextPosition.x / 2) && cube.y === Math.round(cameraNextPosition.z / 2));
                    const doorCube = doorCubes[doorCubeIndex];

                    const doorMesh = scene.children.find(child => child.position.x === doorCube.x * 2 && child.position.z === doorCube.y * 2);
                    doorMesh.position.x += doorCube.isOpen ? -2 : 2;
                    doorCube.isOpen = !doorCube.isOpen;
                }

                if (keysPressed['ArrowLeft']) {
                    camera.position.x += moveSpeed;
                }
                if (keysPressed['ArrowRight']) {
                    camera.position.x -= moveSpeed;
                }
                if (keysPressed['ArrowUp']) {
                    camera.position.z += moveSpeed;
                }
                if (keysPressed['ArrowDown']) {
                    camera.position.z -= moveSpeed;
                }
            }
        }
    });
}

function handleKeyDown(event) {
    keysPressed[event.key] = true;
}

function handleKeyUp(event) {
    keysPressed[event.key] = false;
}

document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);

function animate() {
	requestAnimationFrame(animate);
  
	if (keysPressed['ArrowLeft']) {
		camera.position.x -= moveSpeed;
	}
	if (keysPressed['ArrowRight']) {
		camera.position.x += moveSpeed;
	}
	if (keysPressed['ArrowUp']) {
		camera.position.z -= moveSpeed;
	}
	if (keysPressed['ArrowDown']) {
		camera.position.z += moveSpeed;
	}

	checkCollision();
	
	renderer.render(scene, camera);
}
  
animate();
