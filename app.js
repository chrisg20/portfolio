import { projects } from './projects.js';

const gallery = document.querySelector('#gallery');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let selected = 0;
let rotating = !reducedMotion.matches;
const cards = projects.map((project, index) => {
  const card = document.createElement('button');
  card.className = 'project-card';
  card.id = `project-tab-${index}`;
  card.type = 'button';
  card.setAttribute('role', 'tab');
  card.setAttribute('aria-controls', 'project-details');
  card.setAttribute('aria-label', `${project.title}, placeholder project`);
  card.innerHTML = `<span class="card-top"><span>${String(index + 1).padStart(2, '0')} / PLACEHOLDER</span><span class="selected-label">SELECTED</span></span><span class="model-view" aria-hidden="true"></span><span class="card-bottom"><span class="card-title"></span><span class="card-arrow">↗</span></span>`;
  card.querySelector('.card-title').textContent = project.title;
  card.addEventListener('click', () => select(index));
  gallery.append(card);
  return card;
});

function select(index, scroll = true) {
  selected = Math.max(0, Math.min(projects.length - 1, index));
  const p = projects[selected];
  document.documentElement.style.setProperty('--accent', p.color);
  cards.forEach((card, i) => {
    card.setAttribute('aria-selected', String(i === selected));
    card.tabIndex = i === selected ? 0 : -1;
  });
  for (const key of ['category', 'title', 'summary', 'overview', 'approach', 'next']) {
    document.querySelector(`#project-${key}`).textContent = p[key];
  }
  document.querySelector('#project-details').setAttribute('aria-labelledby', cards[selected].id);
  document.querySelector('#project-tags').replaceChildren(...p.tags.map(tag => {
    const el = document.createElement('span'); el.textContent = tag; return el;
  }));
  document.querySelector('#project-number').textContent = `PROJECT ${String(selected + 1).padStart(2, '0')}`;
  document.querySelector('#position').textContent = `${String(selected + 1).padStart(2, '0')} / ${String(projects.length).padStart(2, '0')}`;
  document.querySelector('#previous').disabled = selected === 0;
  document.querySelector('#next').disabled = selected === projects.length - 1;
  if (scroll) gallery.scrollTo({left: cards[selected].offsetLeft - gallery.offsetLeft - (gallery.clientWidth - cards[selected].offsetWidth) / 2, behavior: reducedMotion.matches ? 'instant' : 'smooth'});
}

gallery.addEventListener('keydown', event => {
  let next;
  if (event.key === 'ArrowRight') next = Math.min(selected + 1, projects.length - 1);
  if (event.key === 'ArrowLeft') next = Math.max(selected - 1, 0);
  if (event.key === 'Home') next = 0;
  if (event.key === 'End') next = projects.length - 1;
  if (next !== undefined) { event.preventDefault(); select(next); cards[next].focus({preventScroll: true}); }
});
document.querySelector('#previous').addEventListener('click', () => select(selected - 1));
document.querySelector('#next').addEventListener('click', () => select(selected + 1));
function motionLabel() {
  document.querySelector('#motion').textContent = rotating ? 'Pause rotation' : 'Resume rotation';
  document.querySelector('#motion').setAttribute('aria-pressed', String(rotating));
}
document.querySelector('#motion').addEventListener('click', () => { rotating = !rotating; motionLabel(); });
reducedMotion.addEventListener('change', () => { rotating = !reducedMotion.matches; motionLabel(); });
motionLabel(); select(0, false);

function status(message) {
  const element = document.querySelector('#render-status');
  element.textContent = message; element.hidden = false;
}

async function initializeModels() {
  const THREE = await import('three');
  const { GLTFLoader } = await import('./vendor/GLTFLoader.js');
  const views = [];
  const loader = new GLTFLoader();
  const baseMaterial = color => new THREE.MeshStandardMaterial({color, metalness: .38, roughness: .34});
  function placeholder(project) {
    const group = new THREE.Group();
    const accent = baseMaterial(project.color), dark = baseMaterial('#39434d'), metal = baseMaterial('#b0b9c4');
    function box(w,h,d,x,y,z,mat=accent) {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);
      mesh.position.set(x,y,z); group.add(mesh); return mesh;
    }
    function cylinder(radius,height,x,y,z,mat=metal) {
      const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,height,40),mat);
      mesh.position.set(x,y,z);group.add(mesh);return mesh;
    }
    if (project.shape === 'array') {
      box(2.6,.16,2.6,0,0,0,dark);
      for(let x=-1;x<=1;x++) for(let z=-1;z<=1;z++) {
        box(.62,.09,.62,x*.82,.15,z*.82);
        cylinder(.04,.2,x*.82,.05,z*.82,metal);
      }
      box(.11,.09,2.2,0,.07,0);box(2.2,.09,.11,0,.07,0);
      for(const x of [-1.12,1.12]) for(const z of [-1.12,1.12]) cylinder(.075,.22,x,.05,z,metal);
    } else if (project.shape === 'motion') {
      box(2.8,.18,1.7,0,-.5,0,dark);
      for(const z of [-.57,.57]) { const rail=cylinder(.09,2.55,0,-.1,z);rail.rotation.z=Math.PI/2; }
      box(.9,.3,1.45,.25,.03,0);box(.7,.15,.8,.25,.25,0,metal);
      for(const x of [-1.2,1.2]) for(const z of [-.57,.57]) box(.25,.5,.3,x,-.28,z,metal);
      const screw=cylinder(.045,2.5,0,-.18,0);screw.rotation.z=Math.PI/2;
      box(.45,.65,.65,-1.5,-.15,0,dark);
    } else if (project.shape === 'board') {
      box(2.7,.12,2.05,0,0,0,baseMaterial('#376b60'));
      box(.95,.22,.95,-.15,.16,0,dark);
      for(let i=0;i<8;i++) for(const z of [-.57,.57]) box(.055,.05,.21,-.51+i*.105,.13,z,metal);
      for(let i=0;i<5;i++) {box(.15,.23,.32,.76,.18,-.7+i*.35);box(.2,.1,.11,-.9,.1,-.7+i*.35,metal);}
      box(.65,.38,.48,0,.2,-1.05,metal);
      for(let i=0;i<10;i++) cylinder(.035,.33,-1.02+i*.21,.2,.86,accent);
    } else if (project.shape === 'optic') {
      const ring=new THREE.Mesh(new THREE.TorusGeometry(.87,.15,20,80),metal);group.add(ring);
      const crystal=new THREE.Mesh(new THREE.OctahedronGeometry(.65),baseMaterial(project.color));crystal.position.set(0,1.05,0);crystal.scale.set(1,.8,.7);group.add(crystal);
      for(const x of [-.36,.36]) {const prong=cylinder(.045,.65,x,.83,0);prong.rotation.z=x;}
      group.rotation.x=.25;
    } else {
      for(const x of [-1,1]) for(const z of [-.7,.7]) { box(.1,1.8,.1,x,0,z,metal); }
      for(const y of [-.9,.9]) {for(const z of [-.7,.7]) box(2.1,.1,.1,0,y,z,accent);for(const x of [-1,1]) box(.1,.1,1.5,x,y,0,accent);}
      box(1.9,.07,1.3,0,-.45,0,dark);
      const brace=box(.07,2.6,.07,0,0,-.7);brace.rotation.z=-.84;
    }
    return group;
  }
  const observer = new IntersectionObserver(entries => {
    for(const entry of entries) { const view=views.find(v=>v.host===entry.target);if(view)view.visible=entry.isIntersecting; }
  });
  for (let index = 0; index < projects.length; index++) {
    const project = projects[index], host=cards[index].querySelector('.model-view');
    let renderer;
    try { renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'}); }
    catch {host.innerHTML='<span class="model-fallback">3D preview unavailable<br>Project details below</span>';status('3D previews require WebGL. You can still explore all project details.');continue;}
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.75));
    renderer.setClearColor(0x000000,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
    host.append(renderer.domElement);
    const scene=new THREE.Scene();
    scene.add(new THREE.HemisphereLight(0xffffff,0x38424e,2.6));
    const key=new THREE.DirectionalLight(0xffffff,3.4);key.position.set(3,6,4);scene.add(key);
    const fill=new THREE.DirectionalLight(project.color,1.4);fill.position.set(-4,1,-2);scene.add(fill);
    const camera=new THREE.PerspectiveCamera(34,1,.01,100);camera.position.set(3.5,3.1,5);camera.lookAt(0,0,0);
    const pivot=new THREE.Group();scene.add(pivot);pivot.add(placeholder(project));pivot.rotation.y=-.3;
    const view={renderer,scene,camera,pivot,host,visible:true,index};views.push(view);observer.observe(host);
    const resize=new ResizeObserver(()=> { const w=host.clientWidth,h=host.clientHeight;if(w&&h){renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();renderer.render(scene,camera);} });resize.observe(host);
    renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();status('A 3D preview was interrupted. Reload the page to restore it; project details remain available.');});
    if(project.model) {
      loader.load(project.model,gltf=>{
        const model=gltf.scene;
        const bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());
        const longest=Math.max(size.x,size.y,size.z);
        if(!Number.isFinite(longest)||longest===0){status(`${project.title}: the model has no visible geometry.`);return;}
        const normalized=new THREE.Group();model.position.sub(center);normalized.add(model);normalized.scale.setScalar(2.8/longest);
        pivot.traverse(node=>{if(node.isMesh){node.geometry.dispose();const mats=Array.isArray(node.material)?node.material:[node.material];mats.forEach(mat=>mat.dispose());}});
        pivot.clear();pivot.add(normalized);
      },undefined,()=>status(`${project.title}: the model could not load. Showing its placeholder instead.`));
    }
  }
  let last=0;
  function frame(time) {
    requestAnimationFrame(frame);
    if(document.hidden||time-last<33)return;
    const delta=Math.min((time-last)/1000,.05);last=time;
    for(const view of views) {
      if(!view.visible)continue;
      if(rotating)view.pivot.rotation.y+=delta*(view.index===selected?.27:.12);
      view.renderer.render(view.scene,view.camera);
    }
  }
  requestAnimationFrame(frame);
}
initializeModels().catch(error=>{
  console.error('3D initialization failed',error);
  status('3D previews could not start. Project details are still available. Try reloading the page.');
});
