// --- ANIMACIÓN DE EXPLOSIÓN CIRCULAR INICIAL (Duración: 15 segundos) ---
const introLoader = document.getElementById("intro-loader");
const totalIntroStars = 150;

for (let i = 0; i < totalIntroStars; i++) {
    const star = document.createElement("div");
    star.classList.add("intro-star");
    
    const angle = Math.random() * Math.PI * 2;
    const velocity = Math.random() * 450 + 200;

    star.style.setProperty('--x', Math.cos(angle) * velocity + 'px');
    star.style.setProperty('--y', Math.sin(angle) * velocity + 'px');

    star.animate([
        { transform: 'translate(0, 0) scale(0.5)', opacity: 1 },
        { transform: `translate(${star.style.getPropertyValue('--x')}, ${star.style.getPropertyValue('--y')}) scale(1.5)`, opacity: 0 }
    ], {
        duration: 14000,
        easing: 'cubic-bezier(0.1, 0.8, 0.3, 1)',
        delay: Math.random() * 3000,
        fill: 'forwards'
    });

    introLoader.appendChild(star);
}

// --- CONFIGURACIÓN 3D (PLANETA FIJO AL CENTRO) ---
const container = document.getElementById("canvas-container");

const scene3D = new THREE.Scene();
const camera3D = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera3D.position.z = 450; // Posición de cámara fija para que el planeta no se deforme al hacer zoom

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

const planetGroup = new THREE.Group();
scene3D.add(planetGroup);

// Esfera 3D negra con brillo de borde rojo neón
const sphereGeometry = new THREE.SphereGeometry(50, 32, 32);
const sphereMaterial = new THREE.MeshStandardMaterial({
    color: 0x08080a,
    roughness: 0.1,
    metalness: 0.8,
    emissive: 0xff073a,
    emissiveIntensity: 0.5
});
const planetSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
planetGroup.add(planetSphere);

// Aro 3D rojo neón
const ringGeometry = new THREE.TorusGeometry(80, 3.5, 16, 100);
const ringMaterial = new THREE.MeshStandardMaterial({
    color: 0x111115,
    roughness: 0.2,
    metalness: 0.7,
    emissive: 0xff2a55,
    emissiveIntensity: 0.9,
    side: THREE.DoubleSide
});
const planetRing = new THREE.Mesh(ringGeometry, ringMaterial);
planetRing.rotation.x = Math.PI / 2.5;
planetGroup.add(planetRing);

// Luces
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene3D.add(ambientLight);

const pointLight = new THREE.PointLight(0xff073a, 4, 600);
pointLight.position.set(220, 220, 220);
scene3D.add(pointLight);

// --- CONFIGURACIÓN DE LA GALAXIA RELLENA ---
const universe = document.getElementById("universe");
const bouquetImages = ["ramo1.png", "ramo2.png", "ramo3.png"];
const galaxyObjects = [];

const totalBouquets = 110; 
const totalStars = 650;   

let cameraAngleX = 0;
let cameraAngleY = 0;
let targetAngleX = 0;
let targetAngleY = 0;

// Factor de zoom independiente para la galaxia (el planeta se queda estático en su tamaño)
let galaxyZoom = 1.0;
let targetZoom = 1.0;

let isDragging = false;
let startX = 0;
let startY = 0;
let initialTouchDist = 0;

// Eventos de Mouse (Rotación interactiva)
window.addEventListener("mousedown", (e) => {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
});

window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;
    startX = e.clientX;
    startY = e.clientY;

    targetAngleX += deltaX * 0.4;
    targetAngleY -= deltaY * 0.4;
});

window.addEventListener("mouseup", () => { isDragging = false; });

// Zoom real que afecta solo a la galaxia sin alterar el tamaño del planeta central
window.addEventListener("wheel", (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
        targetZoom += 0.12;
    } else {
        targetZoom -= 0.12;
    }
    targetZoom = Math.max(0.4, Math.min(2.5, targetZoom));
}, { passive: false });

// Eventos táctiles para celular (Arrastrar y Zoom de pinza)
window.addEventListener("touchstart", (e) => {
    if (e.touches.length === 1) {
        isDragging = true;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
        isDragging = false;
        initialTouchDist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
        );
    }
});

window.addEventListener("touchmove", (e) => {
    if (e.touches.length === 1 && isDragging) {
        const deltaX = e.touches[0].clientX - startX;
        const deltaY = e.touches[0].clientY - startY;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;

        targetAngleX += deltaX * 0.4;
        targetAngleY -= deltaY * 0.4;
    } else if (e.touches.length === 2) {
        const currentDist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
        );
        const diff = currentDist - initialTouchDist;
        initialTouchDist = currentDist;

        targetZoom += diff * 0.003;
        targetZoom = Math.max(0.4, Math.min(2.5, targetZoom));
    }
});

window.addEventListener("touchend", () => { isDragging = false; });

// 1. Inicializar estrellas masivas
for (let i = 0; i < totalStars; i++) {
    const star = document.createElement("div");
    star.classList.add("star-dot");
    const size = Math.random() * 2.5 + 1;
    star.style.width = size + "px";
    star.style.height = size + "px";

    galaxyObjects.push({
        element: star,
        baseX: (Math.random() - 0.5) * 1600,
        baseY: (Math.random() - 0.5) * 1600,
        z: Math.random() * 1300 - 650
    });
    universe.appendChild(star);
}

// 2. Inicializar ramos de flores masivos
for (let i = 0; i < totalBouquets; i++) {
    const item = document.createElement("div");
    item.classList.add("galaxy-bouquet");
    const img = document.createElement("img");
    img.src = bouquetImages[i % bouquetImages.length];
    item.appendChild(img);

    galaxyObjects.push({
        element: item,
        baseX: (Math.random() - 0.5) * 1300,
        baseY: (Math.random() - 0.5) * 1300,
        z: Math.random() * 1000 - 500
    });
    universe.appendChild(item);
}

window.addEventListener("resize", () => {
    camera3D.aspect = window.innerWidth / window.innerHeight;
    camera3D.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- BUCLE DE ANIMACIÓN PRINCIPAL ---
function updateGalaxy() {
    if (!isDragging) {
        targetAngleX += 0.35; 
    }

    cameraAngleX += (targetAngleX - cameraAngleX) * 0.12;
    cameraAngleY += (targetAngleY - cameraAngleY) * 0.12;
    galaxyZoom += (targetZoom - galaxyZoom) * 0.12;

    const radX = cameraAngleX * Math.PI / 180;
    const radY = cameraAngleY * Math.PI / 180;

    const cosX = Math.cos(radX);
    const sinX = Math.sin(radX);
    const cosY = Math.cos(radY);
    const sinY = Math.sin(radY);

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    // Rotación suave del planeta en su tamaño original fijo
    planetGroup.rotation.y = cameraAngleX * 0.017;
    planetGroup.rotation.x = -cameraAngleY * 0.017;
    renderer.render(scene3D, camera3D);

    const fov = 450;

    galaxyObjects.forEach(obj => {
        let x1 = obj.baseX * cosX - obj.z * sinX;
        let z1 = obj.baseX * sinX + obj.z * cosX;
        
        let y2 = obj.baseY * cosY - z1 * sinY;
        let z2 = obj.baseY * sinY + z1 * cosY;

        let scale = (fov / (fov + z2 + 300)) * galaxyZoom;
        if (scale < 0) scale = 0.01;

        let screenX = centerX + x1 * scale * (galaxyZoom / targetZoom > 0 ? 1 : 1); // Aplicando zoom proporcional
        // Coordenadas con perspectiva de profundidad de la galaxia
        let adjustedX = centerX + (x1 * (fov / (fov + z2 + 300))) * galaxyZoom;
        let adjustedY = centerY + (y2 * (fov / (fov + z2 + 300))) * galaxyZoom;

        obj.element.style.transform = `translate3d(${adjustedX}px, ${adjustedY}px, 0px) scale(${scale})`;
        obj.element.style.opacity = scale > 0.02 ? Math.min(1, scale * 1.5) : 0;
        
        // Asignar zIndex dinámico para que crucen por delante o detrás del planeta de forma natural
        obj.element.style.zIndex = Math.floor(z2 + 1000);
    });

    requestAnimationFrame(updateGalaxy);
}

updateGalaxy();

// --- AUTOPLAY AUTOMÁTICO DE MÚSICA ---
const musicBtn = document.getElementById("music-btn");
const music = document.getElementById("background-music");

window.addEventListener("DOMContentLoaded", () => {
    music.volume = 0.8;
    music.muted = false; 
    
    music.play().then(() => {
        musicBtn.innerText = "⏸️ Pausar Música";
    }).catch(() => {
        musicBtn.innerText = "🎵 Reproducir Música";
        const unlockAudio = () => {
            music.muted = false;
            music.play();
            musicBtn.innerText = "⏸️ Pausar Música";
            window.removeEventListener("click", unlockAudio);
            window.removeEventListener("touchstart", unlockAudio);
        };
        window.addEventListener("click", unlockAudio);
        window.addEventListener("touchstart", unlockAudio);
    });
});

musicBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (music.paused) {
        music.play();
        musicBtn.innerText = "⏸️ Pausar Música";
    } else {
        music.pause();
        musicBtn.innerText = "🎵 Reproducir Música";
    }
});

// Control tarjeta dedicatoria
document.getElementById("close-btn").addEventListener("click", () => {
    document.getElementById("love-card").style.display = "none";
});