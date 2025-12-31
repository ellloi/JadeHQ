// Core of the template: initializes Blockly, a simple sprite runtime and stage.
// Usage: open index.html and press the green flag to run the blocks.

// ---------- Utilities ----------
function $(id){ return document.getElementById(id); }
let running = false;
let startHandlers = []; // functions registered by when_green_flag block

function registerStart(fn){
  startHandlers.push(fn);
}

// Small async wait helper
function wait(s){
  return new Promise(res => setTimeout(res, Math.max(0, s*1000)));
}

// ---------- Stage & Sprite ----------
class Sprite {
  constructor(name){
    this.name = name || 'Sprite';
    this.x = 0; // center coordinates in stage pixels (origin center)
    this.y = 0;
    this.rotation = 0; // degrees
    this.sayText = '';
    this.sayUntil = 0;
  }

  // Move forward in direction of rotation
  async move(steps){
    // steps map to pixels; simple mapping: 1 step = 5 pixels
    const px = steps * 5;
    const rad = this.rotation * Math.PI / 180;
    const targetX = this.x + Math.cos(rad) * px;
    const targetY = this.y + Math.sin(rad) * px;
    // animate in 200ms
    const frames = 10;
    for (let i=1;i<=frames;i++){
      if (!running) return;
      this.x = this.x + (targetX - this.x) * (i/frames);
      this.y = this.y + (targetY - this.y) * (i/frames);
      renderStage();
      await wait(0.02);
    }
    this.x = targetX; this.y = targetY;
    renderStage();
  }

  async turn(deg){
    const target = this.rotation + deg;
    const frames = 6;
    for (let i=1;i<=frames;i++){
      if (!running) return;
      this.rotation = this.rotation + (deg/frames);
      renderStage();
      await wait(0.02);
    }
    this.rotation = ((target % 360) + 360) % 360;
    renderStage();
  }

  async goto(x,y){
    const targetX = x;
    const targetY = y;
    const frames = 12;
    for (let i=1;i<=frames;i++){
      if (!running) return;
      this.x = this.x + (targetX - this.x) * (i/frames);
      this.y = this.y + (targetY - this.y) * (i/frames);
      renderStage();
      await wait(0.02);
    }
    this.x = targetX; this.y = targetY;
    renderStage();
  }

  async say(text, seconds){
    this.sayText = String(text);
    this.sayUntil = performance.now() + (seconds * 1000);
    renderStage();
    await wait(seconds);
    this.sayText = '';
    renderStage();
  }
}

// ---------- Canvas Rendering ----------
const canvas = $('stage');
const ctx = canvas.getContext('2d');
const stageWidth = canvas.width;
const stageHeight = canvas.height;

const sprites = [];
let selectedSprite = null;
function renderStage(){
  // clear
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // draw background (simple grid)
  ctx.fillStyle = '#a3d4ff';
  ctx.fillRect(0,0,canvas.width,canvas.height);

  // draw coordinate origin at center
  ctx.save();
  ctx.translate(stageWidth/2, stageHeight/2);
  // draw sprites (simple triangle to indicate direction)
  sprites.forEach((s) => {
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(s.rotation * Math.PI / 180);

    // body
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(12,0);
    ctx.lineTo(-10,8);
    ctx.lineTo(-6,0);
    ctx.lineTo(-10,-8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // draw name under sprite
    ctx.font = '12px sans-serif';
    ctx.fillStyle = '#111';
    ctx.fillText(s.name, -10, 22);

    // speech bubble
    if (s.sayText) {
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ctx.strokeStyle = '#444';
      ctx.lineWidth = 1;
      ctx.fillRect(20, -30, Math.min(220, 8 + ctx.measureText(s.sayText).width), 20);
      ctx.strokeRect(20, -30, Math.min(220, 8 + ctx.measureText(s.sayText).width), 20);
      ctx.fillStyle = '#000';
      ctx.fillText(s.sayText, 24, -16);
    }

    ctx.restore();
  });

  ctx.restore();
}

// ---------- UI & Blockly ----------
let workspace = null;

function initBlockly(){
  const toolboxContainer = new DOMParser().parseFromString(window.SCRATCH_TOOLBOX_XML, 'text/xml').firstChild;
  document.getElementById('toolbox').replaceWith(toolboxContainer);

  workspace = Blockly.inject('blocklyDiv', {
    toolbox: toolboxContainer,
    grid: {spacing: 20, length: 2, colour: '#ccc', snap: true},
    zoom: {controls: true, wheel: true, startScale: 1, maxScale: 2, minScale: 0.5},
    trashcan: true
  });

  // Optional: load a starter example
  const xmlText = `
  <xml xmlns="https://developers.google.com/blockly/xml">
    <block type="when_green_flag" x="20" y="20">
      <next>
        <block type="move_steps">
          <value name="STEPS">
            <shadow type="math_number"><field name="NUM">10</field></shadow>
          </value>
        </block>
      </next>
    </block>
  </xml>`;
  const xml = Blockly.Xml.textToDom(xmlText);
  Blockly.Xml.domToWorkspace(xml, workspace);
}

// Run the generated code safely with a simple API
async function runWorkspace(){
  if (!workspace) return;
  // reset
  startHandlers = [];
  // generate code
  const code = Blockly.JavaScript.workspaceToCode(workspace);
  // wrap code into an async IIFE and let it register start functions
  const wrapped = `
    (async function(registerStart, sprite, wait, runningFlag){
      ${code}
    })
  `;
  try {
    // Use Function to create the wrapper and run it.
    const fn = eval(wrapped); // local template; acceptable for offline templates
    // Provide API objects; sprite refers to the selected sprite
    if (!selectedSprite) alert('Add a sprite first and select it from the sprites panel.');
    startHandlers = [];
    fn(registerStart, selectedSprite, wait, () => running);
    // Call each registered start handler
    running = true;
    for (const handler of startHandlers){
      handler().catch(err => {
        console.error('Handler error', err);
      });
    }
  } catch (err){
    console.error('Error running workspace code:', err);
    alert('Runtime error: ' + err.message);
    running = false;
  }
}

// Stop execution by clearing flags and re-rendering
function stopRunning(){
  running = false;
  // clear any active speech
  sprites.forEach(s => { s.sayText = ''; });
  renderStage();
}

// ---------- Sprite Panel ----------
function addSprite(name){
  const s = new Sprite(name || `Sprite${sprites.length+1}`);
  sprites.push(s);
  if (!selectedSprite) selectedSprite = s;
  refreshSpriteList();
  renderStage();
  return s;
}

function refreshSpriteList(){
  const list = $('spriteList');
  list.innerHTML = '';
  sprites.forEach((s, idx) => {
    const li = document.createElement('li');
    li.textContent = s.name;
    if (s === selectedSprite) li.classList.add('active');
    li.onclick = () => {
      selectedSprite = s;
      refreshSpriteList();
    };
    list.appendChild(li);
  });
}

// ---------- Persistence ----------
$('save').addEventListener('click', () => {
  const xml = Blockly.Xml.workspaceToDom(workspace);
  const text = Blockly.Xml.domToText(xml);
  localStorage.setItem('jadehq_workspace', text);
  alert('Workspace saved to localStorage.');
});

$('load').addEventListener('click', () => {
  const text = localStorage.getItem('jadehq_workspace');
  if (!text) { alert('No saved workspace found.'); return; }
  const xml = Blockly.Xml.textToDom(text);
  workspace.clear();
  Blockly.Xml.domToWorkspace(xml, workspace);
  alert('Workspace loaded.');
});

// Controls
$('greenFlag').addEventListener('click', async () => {
  // reset positions
  sprites.forEach(s => { s.x = 0; s.y = 0; s.rotation = 0; s.sayText = ''; });
  renderStage();
  await runWorkspace();
});

$('stop').addEventListener('click', () => {
  stopRunning();
});

// Add sprite button
$('addSprite').addEventListener('click', () => {
  const name = prompt('Sprite name', `Sprite${sprites.length+1}`);
  if (name !== null) {
    addSprite(name);
  }
});

// Init on load
window.addEventListener('load', () => {
  initBlockly();
  // put toolbox xml into DOM for inspector
  document.getElementById('toolbox').remove();
  // add an initial sprite named for the project
  addSprite('Jade');
  renderStage();
});
