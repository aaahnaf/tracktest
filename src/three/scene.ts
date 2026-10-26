import * as THREE from 'three';

/* ------------------------------------------------------------------ */
/*  Global scene bus — lets React components drive the Three.js world  */
/* ------------------------------------------------------------------ */

export interface Bar3D {
  value: number;   // target height 0..1
  color?: string;  // hex, defaults to monochrome ink
}

export type BurstType = 'success' | 'page' | 'nav';

type SceneEvents = {
  burst: (x: number, y: number, kind: BurstType) => void;
};

class SceneBus {
  private el = new EventTarget();
  on<K extends keyof SceneEvents>(e: K, fn: SceneEvents[K]) {
    const h = ((ev: any) => fn(ev.detail)) as EventListener;
    this.el.addEventListener(e, h);
    return () => this.el.removeEventListener(e, h);
  }
  emit<K extends keyof SceneEvents>(e: K, ...args: Parameters<SceneEvents[K]>) {
    this.el.dispatchEvent(new CustomEvent(e, { detail: args }));
  }
}

export const bus = new SceneBus();

/** Trigger a particle burst at normalized screen coords (-1..1) */
export function burstAt(nx: number, ny: number, kind: BurstType = 'success') {
  bus.emit('burst', nx, ny, kind);
}

/** Fire a burst centered on a DOM element */
export function burstFromElement(el: Element | null, kind: BurstType = 'success') {
  if (!el) return;
  const r = el.getBoundingClientRect();
  const nx = ((r.left + r.width / 2) / window.innerWidth) * 2 - 1;
  const ny = -(((r.top + r.height / 2) / window.innerHeight) * 2 - 1);
  burstAt(nx, ny, kind);
}

/* ------------------------------------------------------------------ */
/*  Renderer / scene bootstrap                                         */
/* ------------------------------------------------------------------ */

let renderer: THREE.WebGLRenderer | null = null;
let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let raf = 0;
const disposables: { dispose(): void }[] = [];

// mouse state (smoothed)
const mouse = { x: 0, y: 0 };
const smouse = { x: 0, y: 0 };
let scrollY = 0;
let sroll = 0;
let timeScale = 1;

function setTimescale() {
  try {
    timeScale = parseFloat(localStorage.getItem('wdis-motion') || '1');
  } catch {
    timeScale = 1;
  }
}
setTimescale();
window.addEventListener('wdis:motion', setTimescale);

if (typeof window !== 'undefined') {
  window.addEventListener('pointermove', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });
  window.addEventListener('scroll', () => {
    scrollY = window.scrollY || 0;
  }, { passive: true });
}

export function getCamera(): THREE.PerspectiveCamera | null {
  return camera;
}

function ensureRenderer() {
  if (renderer) return;
  let canvas = document.getElementById('wdis-gl') as HTMLCanvasElement | null;
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'wdis-gl';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);
  }
  renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
  });
  renderer.setClearColor(0x000000, 0);
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 200);
  camera.position.set(0, 0, 26);

  resize();
}

function resize() {
  if (!renderer || !camera) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(dpr);
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);

/* ------------------------------------------------------------------ */
/*  Shared GLSL                                                        */
/* ------------------------------------------------------------------ */

const SRGB_FN = /* glsl */ `
vec3 toSRGB(vec3 c){
  c = clamp(c, 0.0, 1.0);
  return mix(c * 12.92,
             1.055 * pow(max(c, vec3(0.0)), vec3(1.0/2.4)) - 0.055,
             step(vec3(0.0031308), c));
}`;

const NOISE_FN = /* glsl */ `
float hash21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  float a = hash21(i), b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0)), d = hash21(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}`;

/* ------------------------------------------------------------------ */
/*  Layer 1 — liquid glass blob background                             */
/* ------------------------------------------------------------------ */

const blobUniforms = {
  uTime: { value: 0 },
  uDark: { value: 0 },
  uMouse: { value: new THREE.Vector2() },
  uScroll: { value: 0 },
};

const blobMat = new THREE.ShaderMaterial({
  uniforms: blobUniforms,
  transparent: true,
  depthTest: false,
  depthWrite: false,
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main(){
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`,
  fragmentShader: /* glsl */ `
    precision highp float;
    varying vec2 vUv;
    uniform float uTime;
    uniform float uDark;
    uniform vec2 uMouse;
    uniform float uScroll;
    ${NOISE_FN}
    ${SRGB_FN}

    float fbm(vec2 p){
      float v = 0.0, a = 0.5;
      for(int i = 0; i < 4; i++){
        v += a * vnoise(p);
        p = p * 2.03 + vec2(19.1, 7.3);
        a *= 0.5;
      }
      return v;
    }

    void main(){
      vec2 p = vUv * 2.0 - 1.0;
      p.x *= 1.6;
      float t = uTime * 0.11;

      vec2 q = vec2(fbm(p * 1.4 + vec2(t, -t * 0.7)),
                     fbm(p * 1.4 + vec2(-t * 0.6, t) + 4.3));

      float field = fbm(p * 1.15 + q * 1.7 + vec2(uScroll * 0.02, 0.0));

      // mouse parallax shifts the whole fluid slightly
      vec2 pm = p - uMouse * 0.22;
      float rings = sin(length(pm) * 9.0 - field * 10.0 - uTime * 0.7);
      rings = smoothstep(0.72, 1.0, rings) * 0.5;

      float lum = smoothstep(0.22, 0.92, field) + rings * 0.35;

      // vignette keeps edges clean & minimal
      float vig = smoothstep(1.55, 0.25, length(p * vec2(0.72, 1.0)));
      lum *= mix(0.35, 1.0, vig);

      vec3 colLight = mix(vec3(0.965, 0.965, 0.97), vec3(0.80, 0.81, 0.835), lum);
      vec3 colDark  = mix(vec3(0.030, 0.030, 0.036), vec3(0.155, 0.16, 0.18), lum);
      vec3 col = mix(colLight, colDark, uDark);

      float alpha = mix(0.95, 1.0, uDark);
      gl_FragColor = vec4(toSRGB(col), alpha);
    }`,
});
disposables.push(blobMat);

let blobMesh: THREE.Mesh | null = null;
function getBlob() {
  if (blobMesh) return blobMesh;
  ensureRenderer();
  const geo = new THREE.PlaneGeometry(1, 1, 1, 1);
  disposables.push(geo);
  blobMesh = new THREE.Mesh(geo, blobMat);
  blobMesh.frustumCulled = false;
  blobMesh.renderOrder = -30;
  scene!.add(blobMesh);
  return blobMesh;
}

function layoutBlob() {
  const mesh = getBlob();
  if (!camera) return;
  const dist = 30;
  const h = 2 * Math.tan((camera.fov * Math.PI) / 360) * dist;
  const w = h * camera.aspect;
  mesh.scale.set(w, h, 1);
  mesh.position.set(0, 0, camera.position.z - dist);
}

/* ------------------------------------------------------------------ */
/*  Layer 2 — morphing wireframe sculpture (icosahedron <-> torus knot) */
/* ------------------------------------------------------------------ */

const morphUniforms = {
  uTime: { value: 0 },
  uMorph: { value: 0 },
  uInk: { value: new THREE.Color('#0a0a0a') },
  uOpacity: { value: 0.22 },
};

const morphMat = new THREE.ShaderMaterial({
  uniforms: morphUniforms,
  transparent: true,
  depthWrite: false,
  vertexShader: /* glsl */ `
    attribute vec3 aTorusPos;
    attribute vec3 aTorusNorm;
    uniform float uMorph;
    uniform float uTime;
    varying vec3 vN;
    varying vec3 vP;
    void main(){
      vec3 pos = mix(position, aTorusPos, uMorph);
      vec3 nrm = normalize(mix(normal, aTorusNorm, uMorph));
      // gentle organic breathing
      float wob = sin(pos.x * 1.7 + uTime * 0.9) * cos(pos.y * 1.9 - uTime * 0.7) * 0.07;
      pos += nrm * wob;
      vN = normalize(normalMatrix * nrm);
      vP = (modelViewMatrix * vec4(pos, 1.0)).xyz;
      gl_Position = projectionMatrix * vec4(vP, 1.0);
    }`,
  fragmentShader: /* glsl */ `
    precision highp float;
    varying vec3 vN;
    varying vec3 vP;
    uniform vec3 uInk;
    uniform float uOpacity;
    ${SRGB_FN}
    void main(){
      vec3 N = normalize(vN);
      vec3 V = normalize(-vP);
      float fres = pow(1.0 - abs(dot(N, V)), 2.0);
      float lambert = 0.35 + 0.65 * max(dot(N, normalize(vec3(0.5, 0.8, 0.6))), 0.0);
      vec3 col = uInk * lambert + uInk * fres * 0.9;
      float a = uOpacity * (0.35 + 0.65 * fres);
      gl_FragColor = vec4(toSRGB(col), a);
    }`,
});
disposables.push(morphMat);

function buildMorphGeometry(): THREE.BufferGeometry {
  const ico = new THREE.IcosahedronGeometry(2.6, 4);
  const tk = new THREE.TorusKnotGeometry(1.85, 0.62, 220, 32);

  const iP = ico.getAttribute('position').array as Float32Array;
  const iN = ico.getAttribute('normal').array as Float32Array;
  const tP = tk.getAttribute('position').array as Float32Array;
  const tN = tk.getAttribute('normal').array as Float32Array;

  const ratio = iP.length / tP.length;
  const count = iP.length / 3;
  const torusPos = new Float32Array(iP.length);
  const torusNorm = new Float32Array(iN.length);
  for (let i = 0; i < count; i++) {
    const j = Math.min(Math.floor(i * ratio), count - 1) * 3;
    torusPos[i * 3] = tP[j];
    torusPos[i * 3 + 1] = tP[j + 1];
    torusPos[i * 3 + 2] = tP[j + 2];
    torusNorm[i * 3] = tN[j];
    torusNorm[i * 3 + 1] = tN[j + 1];
    torusNorm[i * 3 + 2] = tN[j + 2];
  }

  const g = ico.clone();
  g.setAttribute('aTorusPos', new THREE.BufferAttribute(torusPos, 3));
  g.setAttribute('aTorusNorm', new THREE.BufferAttribute(torusNorm, 3));
  ico.dispose();
  tk.dispose();
  return g;
}

let morphGroup: THREE.Group | null = null;
function getSculpture() {
  if (morphGroup) return morphGroup;
  ensureRenderer();
  morphGroup = new THREE.Group();

  const solidGeo = buildMorphGeometry();
  disposables.push(solidGeo);
  const solid = new THREE.Mesh(solidGeo, morphMat);
  morphGroup.add(solid);

  const wireMat = new THREE.MeshBasicMaterial({
    wireframe: true,
    transparent: true,
    opacity: 0.07,
    depthWrite: false,
  });
  disposables.push(wireMat);
  const wire = new THREE.Mesh(solidGeo, wireMat);
  wire.scale.setScalar(1.015);
  morphGroup.add(wire);

  // orbital ring
  const ringGeo = new THREE.TorusGeometry(4.1, 0.012, 8, 200);
  disposables.push(ringGeo);
  const ringMat = new THREE.MeshBasicMaterial({
    color: '#888888',
    transparent: true,
    opacity: 0.25,
    depthWrite: false,
  });
  disposables.push(ringMat);
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 2.4;
  morphGroup.add(ring);

  morphGroup.position.set(8.5, 1.5, -6);
  morphGroup.renderOrder = -20;
  scene!.add(morphGroup);
  return morphGroup;
}

/* ------------------------------------------------------------------ */
/*  Layer 3 — floating monochrome particles                            */
/* ------------------------------------------------------------------ */

const PARTICLE_COUNT = 240;
const partUniforms = {
  uTime: { value: 0 },
  uSize: { value: 3.2 },
  uInk: { value: new THREE.Color('#111111') },
  uOpacity: { value: 0.5 },
};

const partMat = new THREE.ShaderMaterial({
  uniforms: partUniforms,
  transparent: true,
  depthWrite: false,
  blending: THREE.NormalBlending,
  vertexShader: /* glsl */ `
    attribute float aPhase;
    attribute float aSpeed;
    uniform float uTime;
    uniform float uSize;
    varying float vFade;
    void main(){
      vec3 p = position;
      float t = uTime * aSpeed;
      p.x += sin(t + aPhase) * 1.4;
      p.y += cos(t * 0.8 + aPhase * 2.0) * 1.1;
      p.z += sin(t * 0.6 + aPhase) * 0.8;
      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      gl_PointSize = uSize * (24.0 / -mv.z);
      gl_Position = projectionMatrix * mv;
      vFade = 0.4 + 0.6 * abs(sin(uTime * 0.5 + aPhase * 3.0));
    }`,
  fragmentShader: /* glsl */ `
    precision highp float;
    uniform vec3 uInk;
    uniform float uOpacity;
    varying float vFade;
    ${SRGB_FN}
    void main(){
      vec2 c = gl_PointCoord - 0.5;
      float d = length(c);
      float a = smoothstep(0.5, 0.12, d) * vFade * uOpacity;
      if (a < 0.01) discard;
      gl_FragColor = vec4(toSRGB(uInk), a);
    }`,
});
disposables.push(partMat);

let points: THREE.Points | null = null;
function getParticles() {
  if (points) return points;
  ensureRenderer();
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(PARTICLE_COUNT * 3);
  const phase = new Float32Array(PARTICLE_COUNT);
  const speed = new Float32Array(PARTICLE_COUNT);
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 44;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 26;
    pos[i * 3 + 2] = -2 - Math.random() * 14;
    phase[i] = Math.random() * Math.PI * 2;
    speed[i] = 0.15 + Math.random() * 0.5;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1));
  geo.setAttribute('aSpeed', new THREE.BufferAttribute(speed, 1));
  disposables.push(geo);
  points = new THREE.Points(geo, partMat);
  points.frustumCulled = false;
  points.renderOrder = -15;
  scene!.add(points);
  return points;
}

/* ------------------------------------------------------------------ */
/*  Layer 4 — 3D data sculpture (bars mounted on a rotating carousel)  */
/* ------------------------------------------------------------------ */

export function setBars3D(values: number[]) {
  bars3d.length = 0;
  for (const v of values) bars3d.push({ value: Math.max(0, Math.min(1, v)) });
  const show = currentPage === 'analytics' && bars3d.length > 0;
  barGroupState.active = show;
  if (show) {
    getBarGroup().visible = true;
    layoutBars();
  }
}

const barGroupState = { active: false, appear: 0 };
const bars3d: Bar3D[] = [];
let barGroup: THREE.Group | null = null;
let barPivot: THREE.Group | null = null;
let barMeshes: THREE.Mesh[] = [];
let barCaps: THREE.Mesh[] = [];
const BAR_W = 0.62;
const BAR_GAP = 0.92;
const BAR_MAX_H = 4.6;
const BAR_RADIUS = 7.2;
const BAR_BASE_Y = -5.4;

const barGlowMat = new THREE.MeshBasicMaterial({
  color: '#ffffff',
  transparent: true,
  opacity: 0.16,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});
disposables.push(barGlowMat);

function makeBarMaterials() {
  const inkMat = new THREE.MeshStandardMaterial({
    color: '#101010',
    roughness: 0.35,
    metalness: 0.1,
    transparent: true,
    opacity: 0.92,
  });
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: '#ffffff',
    metalness: 0,
    roughness: 0.08,
    transmission: 1,
    thickness: 1.4,
    ior: 1.45,
    transparent: true,
    opacity: 1,
    envMapIntensity: 1.2,
  });
  disposables.push(inkMat, glassMat);
  return [inkMat, glassMat];
}

function getBarGroup() {
  if (barGroup) return barGroup;
  ensureRenderer();
  barGroup = new THREE.Group();
  barPivot = new THREE.Group();
  barGroup.add(barPivot);

  const [inkMat, glassMat] = makeBarMaterials();

  // lights only affect the bars layer
  const dir = new THREE.DirectionalLight(0xffffff, 2.2);
  dir.position.set(4, 8, 6);
  dir.layers.set(1);
  const amb = new THREE.AmbientLight(0xffffff, 0.85);
  amb.layers.set(1);
  barGroup.add(dir, amb);

  const geo = new THREE.BoxGeometry(BAR_W, 1, BAR_W);
  geo.translate(0, 0.5, 0); // grow from base
  disposables.push(geo);

  for (let i = 0; i < 16; i++) {
    const mat = i % 4 === 3 ? glassMat : inkMat;
    const m = new THREE.Mesh(geo, mat);
    m.layers.set(1);
    m.visible = false;
    m.scale.y = 0.001;
    barPivot.add(m);
    barMeshes.push(m);
  }

  // glowing top caps
  const capGeo = new THREE.BoxGeometry(BAR_W * 1.06, 0.035, BAR_W * 1.06);
  disposables.push(capGeo);
  for (let i = 0; i < 16; i++) {
    const cap = new THREE.Mesh(capGeo, barGlowMat);
    cap.layers.set(1);
    cap.visible = false;
    barPivot.add(cap);
    barCaps.push(cap);
  }

  barGroup.visible = false;
  barGroup.renderOrder = 5;
  scene!.add(barGroup);
  return barGroup;
}

function layoutBars() {
  if (!camera) return;
  const g = getBarGroup();
  const halfW = (camera.fov * Math.PI) / 360;
  const visH = 2 * Math.tan(halfW) * camera.position.z;
  const visW = visH * camera.aspect;
  const r = BAR_RADIUS;
  const span = 2 * Math.asin(Math.min(1, (r * 0.92) / Math.max(r, 0.001)));
  void span;
  const diameter = r * 2 + BAR_W;
  const scale = Math.min(1, (visW * 0.9) / diameter, (visH * 0.62) / (BAR_MAX_H + 1.5));
  g.scale.setScalar(scale);
  g.position.set(0, -visH / (2 * scale) + visH * 0.34, -3);
}

/* ------------------------------------------------------------------ */
/*  Layer 5 — burst particles (confetti of light)                      */
/* ------------------------------------------------------------------ */

const BURST_MAX = 140;
const burstState = Array.from({ length: BURST_MAX }, () => ({
  life: 0,
  vel: new THREE.Vector3(),
}));

const burstUniforms = {
  uSize: { value: 6 },
  uInk: { value: new THREE.Color('#111111') },
};

const burstMat = new THREE.ShaderMaterial({
  uniforms: burstUniforms,
  transparent: true,
  depthWrite: false,
  blending: THREE.NormalBlending,
  vertexShader: /* glsl */ `
    attribute float aLife;
    uniform float uSize;
    varying float vLife;
    void main(){
      vLife = aLife;
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      float s = aLife > 0.0 ? (0.5 + aLife) : 0.0;
      gl_PointSize = uSize * s * (24.0 / -mv.z);
      gl_Position = projectionMatrix * mv;
    }`,
  fragmentShader: /* glsl */ `
    precision highp float;
    uniform vec3 uInk;
    varying float vLife;
    ${SRGB_FN}
    void main(){
      if (vLife <= 0.0) discard;
      vec2 c = gl_PointCoord - 0.5;
      float d = length(c);
      float a = smoothstep(0.5, 0.05, d) * vLife;
      gl_FragColor = vec4(toSRGB(uInk), a);
    }`,
});
disposables.push(burstMat);

let burstPoints: THREE.Points | null = null;
let burstPos!: Float32Array;
let burstLife!: Float32Array;

function getBurstSystem() {
  if (burstPoints) return burstPoints;
  ensureRenderer();
  const geo = new THREE.BufferGeometry();
  burstPos = new Float32Array(BURST_MAX * 3);
  burstLife = new Float32Array(BURST_MAX);
  geo.setAttribute('position', new THREE.BufferAttribute(burstPos, 3));
  geo.setAttribute('aLife', new THREE.BufferAttribute(burstLife, 1));
  disposables.push(geo);
  burstPoints = new THREE.Points(geo, burstMat);
  burstPoints.frustumCulled = false;
  burstPoints.renderOrder = 20;
  scene!.add(burstPoints);
  return burstPoints;
}

function unproject(nx: number, ny: number, z: number): THREE.Vector3 {
  if (!camera) return new THREE.Vector3();
  const v = new THREE.Vector3(nx, ny, 0.5);
  v.unproject(camera);
  const dirV = v.sub(camera.position).normalize();
  const dist = (camera.position.z - z) / dirV.z;
  return camera.position.clone().add(dirV.multiplyScalar(dist));
}

bus.on('burst', (nx: number, ny: number, kind: BurstType) => {
  getBurstSystem();
  if (!camera) return;
  const origin = unproject(nx, ny, 0);
  const count = kind === 'success' ? 70 : kind === 'nav' ? 45 : 30;
  let spawned = 0;
  for (let i = 0; i < BURST_MAX && spawned < count; i++) {
    if (burstState[i].life > 0) continue;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const sp = 3 + Math.random() * 6;
    burstState[i].vel.set(
      Math.sin(phi) * Math.cos(theta) * sp,
      Math.sin(phi) * Math.sin(theta) * sp * 0.8 + 2.5,
      Math.cos(phi) * sp * 0.4
    );
    burstState[i].life = 1;
    burstPos[i * 3] = origin.x;
    burstPos[i * 3 + 1] = origin.y;
    burstPos[i * 3 + 2] = origin.z;
    spawned++;
  }
});

/* ------------------------------------------------------------------ */
/*  Theme sync                                                         */
/* ------------------------------------------------------------------ */

let dark = false;
function applyTheme() {
  dark = document.documentElement.classList.contains('dark');
  blobUniforms.uDark.value = dark ? 1 : 0;
  morphUniforms.uInk.value.set(dark ? '#cfcfcf' : '#0a0a0a');
  morphUniforms.uOpacity.value = dark ? 0.3 : 0.2;
  partUniforms.uInk.value.set(dark ? '#d8d8d8' : '#111111');
  partUniforms.uOpacity.value = dark ? 0.45 : 0.4;
  burstUniforms.uInk.value.set(dark ? '#eaeaea' : '#161616');
  barGlowMat.color.set(dark ? '#ffffff' : '#cccccc');
  if (barGroup) {
    barGroup.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!(m as any).isMesh) return;
      const mat = m.material as THREE.Material & { color?: THREE.Color };
      if (mat === barGlowMat) return;
      if (mat.color && (mat as any).isMeshStandardMaterial) {
        mat.color.set(dark ? '#f2f2f2' : '#101010');
      }
    });
  }
}

new MutationObserver(() => applyTheme()).observe(document.documentElement, {
  attributeFilter: ['class'],
});

/* ------------------------------------------------------------------ */
/*  Page orchestration                                                 */
/* ------------------------------------------------------------------ */

let currentPage = '';
let morphTarget = 0;
let sculptureSpread = 1;

function setPageEffects(page: string) {
  currentPage = page;
  const showBars = page === 'analytics' && bars3d.length > 0;
  barGroupState.active = showBars;
  const g = getBarGroup();
  if (showBars) {
    g.visible = true;
    layoutBars();
  }

  switch (page) {
    case 'overview':
      morphTarget = 0; sculptureSpread = 1; break;
    case 'transactions':
      morphTarget = 0.35; sculptureSpread = 1.25; break;
    case 'memory':
      morphTarget = 0.75; sculptureSpread = 1.1; break;
    case 'analytics':
      morphTarget = 1; sculptureSpread = 0.7; break;
    case 'replay':
      morphTarget = 0.55; sculptureSpread = 1.35; break;
    case 'settings':
      morphTarget = 0.15; sculptureSpread = 0.9; break;
    default:
      morphTarget = 0; sculptureSpread = 1;
  }
}

window.addEventListener('wdis:page', (e) => {
  const page = (e as CustomEvent<string>).detail || '';
  setPageEffects(page);
});

/* ------------------------------------------------------------------ */
/*  Main loop                                                          */
/* ------------------------------------------------------------------ */

ensureRenderer();
getBlob();
getSculpture();
getParticles();
getBurstSystem();
applyTheme();
layoutBlob();
window.addEventListener('resize', layoutBlob);

const clock = new THREE.Clock();
let elapsed = 0;

function tick() {
  raf = requestAnimationFrame(tick);
  if (document.hidden || !renderer || !scene || !camera) return;

  const dt = Math.min(clock.getDelta(), 0.05) * timeScale;
  elapsed += dt;

  // smooth inputs
  smouse.x += (mouse.x - smouse.x) * 0.05;
  smouse.y += (mouse.y - smouse.y) * 0.05;
  sroll += (scrollY - sroll) * 0.08;

  blobUniforms.uTime.value = elapsed;
  blobUniforms.uMouse.value.set(smouse.x, -smouse.y);
  blobUniforms.uScroll.value = sroll;
  partUniforms.uTime.value = elapsed;

  // sculpture
  const grp = morphGroup!;
  morphUniforms.uTime.value = elapsed;
  morphUniforms.uMorph.value += (morphTarget - morphUniforms.uMorph.value) * Math.min(dt * 1.6, 1);

  const isMobile = window.innerWidth < 768;
  const spread = isMobile ? 0.55 : sculptureSpread;
  const tx = (isMobile ? 5.2 : 8.5) + smouse.x * 1.6 * spread;
  const ty = (isMobile ? 4.2 : 1.5) - smouse.y * 1.1 * spread;
  grp.position.x += (tx - grp.position.x) * 0.04;
  grp.position.y += (ty - grp.position.y) * 0.04;
  grp.rotation.y += dt * 0.22;
  grp.rotation.x = Math.sin(elapsed * 0.23) * 0.18 - smouse.y * 0.1;
  const pulse = 1 + Math.sin(elapsed * 0.8) * 0.02;
  grp.scale.setScalar(pulse);

  // particles drift with scroll
  if (points) points.rotation.y = elapsed * 0.015 + sroll * 0.0002;

  // 3D bars — rotating carousel sculpture
  {
    const g = barGroup!;
    barGroupState.appear += ((barGroupState.active ? 1 : 0) - barGroupState.appear) * Math.min(dt * 4, 1);
    if (!barGroupState.active && barGroupState.appear < 0.02) {
      g.visible = false;
    } else {
      g.visible = true;
      const n = Math.max(bars3d.length, 1);
      if (barPivot) barPivot.rotation.y = elapsed * 0.18;
      for (let i = 0; i < barMeshes.length; i++) {
        const m = barMeshes[i];
        if (i >= bars3d.length) { m.visible = false; if (barCaps[i]) barCaps[i].visible = false; continue; }
        m.visible = true;
        const a = (i / n) * Math.PI * 2;
        m.position.set(Math.sin(a) * BAR_RADIUS, BAR_BASE_Y, Math.cos(a) * BAR_RADIUS);
        m.rotation.set(0, a, 0);
        const target = Math.max(bars3d[i].value, 0.02) * BAR_MAX_H * barGroupState.appear;
        m.scale.y += (target - m.scale.y) * 0.12;
        const cap = barCaps[i];
        if (cap) {
          cap.visible = true;
          cap.position.copy(m.position);
          cap.position.y += m.scale.y + 0.03;
          cap.rotation.copy(m.rotation);
        }
      }
    }
  }

  // bursts
  {
    let anyAlive = false;
    for (let i = 0; i < BURST_MAX; i++) {
      const st = burstState[i];
      if (st.life <= 0) continue;
      anyAlive = true;
      st.life -= dt * 0.9;
      st.vel.y -= 9.5 * dt;
      st.vel.multiplyScalar(1 - 0.6 * dt);
      burstPos[i * 3] += st.vel.x * dt;
      burstPos[i * 3 + 1] += st.vel.y * dt;
      burstPos[i * 3 + 2] += st.vel.z * dt;
      if (st.life < 0) st.life = 0;
    }
    if (anyAlive) {
      const geo = burstPoints!.geometry;
      for (let i = 0; i < BURST_MAX; i++) burstLife[i] = burstState[i].life;
      (geo.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true;
      (geo.getAttribute('aLife') as THREE.BufferAttribute).needsUpdate = true;
    }
  }

  // subtle camera sway + scroll dolly
  camera.position.x += (smouse.x * 0.7 - camera.position.x) * 0.03;
  camera.position.y += (-smouse.y * 0.45 + sroll * 0.0018 - camera.position.y) * 0.03;
  camera.lookAt(0, 0, 0);

  renderer.render(scene, camera);
}

tick();
