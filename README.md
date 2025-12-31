# jadeHQ — Scratch-like Game Template

This is a minimal template for a Scratch-like game editor using Blockly, renamed and packaged as "jadeHQ". It provides:
- A block-based programming workspace (Blockly).
- A simple stage rendered on an HTML5 canvas.
- A sprite model with basic actions (move, turn, goto, say).
- A "when green flag clicked" hat block that registers start scripts.
- Save/load (localStorage) and Run/Stop controls.

Important: This is an educational template — not Scratch. It uses Blockly to provide a similar visual programming experience. The runtime is a tiny custom async interpreter that maps blocks to sprite methods.

How to use:
1. Open `index.html` in a modern browser (Chrome, Firefox, Edge).
2. Add sprites using the "Add Sprite" button (or use the default "Jade").
3. Build scripts in the Blockly workspace. Use "when green flag clicked" as the start block.
4. Click the green flag button to run. Click Stop to stop scripts.
5. Save and load the workspace using the Save/Load buttons (uses localStorage).

Files:
- index.html — main page and UI (project title updated to "jadeHQ").
- styles.css — layout and styling.
- blocks.js — custom block definitions and JavaScript generators.
- app.js — runtime, stage rendering and Blockly initialization (default sprite = "Jade").
- README.md — this file.

Extending ideas:
- Add more blocks (sensing, variables, operators).
- Add multiple scripts per sprite and script targeting (currently scripts run for the selected sprite).
- Persist sprites and their costumes.
- Add a block-to-JS sandbox for safety or a visual "thread" debugger.

License:
Use and modify freely for your projects. Avoid copying Scratch assets or code.
