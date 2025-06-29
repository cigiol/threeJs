import * as THREE from "three";
import { Client, getStateCallbacks } from "colyseus.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    100,
    window.innerWidth / window.innerHeight,
    0.2,
    1000
);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

camera.position.set(0, 5, 10);
camera.lookAt(0, 0, 0);

const geometry = new THREE.BoxGeometry();
const cubes = {}; // sessionId -> THREE.Mesh
const client = new Client("ws://localhost:2567");
const params = new URLSearchParams(window.location.search);
const roomId = params.get("roomId");
const roomIdEl = document.getElementById("roomId");
const inviteLinkEl = document.getElementById("inviteLink");
const copyBtn = document.getElementById("copyBtn");

async function start() {
    const room = roomId ? await client.joinById(roomId) : await client.joinOrCreate("my_room");
    const $ = getStateCallbacks(room);
    const inviteUrl = `${window.location.origin}/game?roomId=${room.roomId}`;

    roomIdEl.innerText = room.roomId;
    inviteLinkEl.value = inviteUrl;

    copyBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(inviteUrl)
            .then(() => {
                copyBtn.innerText = "Kopyalandı!";
                setTimeout(() => copyBtn.innerText = "Kopyala", 2000);
            });
    });

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
            cube.position.set(player.x, player.y, player.z);
        });
    });

    // Listen to 'player' instance removals
    $(room.state).players.onRemove((player, sessionId) => {
        scene.remove(cubes[sessionId]);
        delete cubes[sessionId];
    });

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
