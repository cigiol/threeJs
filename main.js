import * as THREE from "three";
import { Client, getStateCallbacks } from "colyseus.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

camera.position.set(0, 5, 10);
camera.lookAt(0, 0, 0);

const geometry = new THREE.BoxGeometry();
const cubes = {}; // sessionId -> THREE.Mesh

console.log("typeof cubes:", typeof cubes); // object olmalı
console.log("cubes constructor:", cubes.constructor.name); // Object olmalı
console.log("Object.keys(cubes):", Object.keys(cubes)); // sessionId dizisi olmalı
const client = new Client("ws://localhost:2567");

async function start() {
    const room = await client.joinOrCreate("my_room");
    const $ = getStateCallbacks(room);

    // Listen to 'player' instance additions
    $(room.state).players.onAdd((player, sessionId) => {
        const material = new THREE.MeshBasicMaterial({
            color: sessionId === room.sessionId ? 0x0000ff : 0xff0000,
        });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(player.x, player.y, player.z);
        scene.add(cube);
        cubes[sessionId] = cube;
        $(player).onChange(() => {
            console.log('Player changed:', player.x, player.y);
            cube.position.set(player.x, player.y, player.z);
        });
    });

    // Listen to 'player' instance removals
    $(room.state).players.onRemove((player, sessionId) => {
        scene.remove(cubes[sessionId]);
        delete cubes[sessionId];
        console.log("Player removed:", sessionId);
    });


    // Klavye kontrolü
    const keys = {};
    document.addEventListener("keydown", (e) => (keys[e.key] = true));
    document.addEventListener("keyup", (e) => (keys[e.key] = false));

    function animate() {
        requestAnimationFrame(animate);

        let dx = 0,
            dz = 0;
        if (keys["w"]) dz -= 0.1;
        if (keys["s"]) dz += 0.1;
        if (keys["a"]) dx -= 0.1;
        if (keys["d"]) dx += 0.1;

        if (dx !== 0 || dz !== 0) {
            room.send("move", { x: dx, y: 0, z: dz });
        }

        renderer.render(scene, camera);
    }

    animate();
}

start();
