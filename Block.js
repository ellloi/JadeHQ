// Custom Blockly blocks & the toolbox XML for a Scratch-like experience.

// Toolbox XML (categories and blocks)
const toolboxXml = `
<xml id="toolbox" style="display: none">
  <category name="Events" colour="#FFBF00">
    <block type="when_green_flag"></block>
  </category>

  <category name="Motion" colour="#4C97FF">
    <block type="move_steps">
      <value name="STEPS">
        <shadow type="math_number">
          <field name="NUM">10</field>
        </shadow>
      </value>
    </block>
    <block type="turn_right">
      <value name="DEG">
        <shadow type="math_number">
          <field name="NUM">15</field>
        </shadow>
      </value>
    </block>
    <block type="turn_left">
      <value name="DEG">
        <shadow type="math_number">
          <field name="NUM">15</field>
        </shadow>
      </value>
    </block>
    <block type="go_to_xy">
      <value name="X">
        <shadow type="math_number"><field name="NUM">0</field></shadow>
      </value>
      <value name="Y">
        <shadow type="math_number"><field name="NUM">0</field></shadow>
      </value>
    </block>
  </category>

  <category name="Looks" colour="#9966FF">
    <block type="say_for_seconds">
      <value name="TEXT">
        <shadow type="text">
          <field name="TEXT">Hello!</field>
        </shadow>
      </value>
      <value name="SECONDS">
        <shadow type="math_number"><field name="NUM">2</field></shadow>
      </value>
    </block>
  </category>

  <category name="Control" colour="#FFAB19">
    <block type="wait_seconds">
      <value name="SECONDS">
        <shadow type="math_number"><field name="NUM">1</field></shadow>
      </value>
    </block>
    <block type="repeat_times">
      <value name="TIMES">
        <shadow type="math_number"><field name="NUM">10</field></shadow>
      </value>
    </block>
    <block type="forever"></block>
  </category>

  <category name="Operators" colour="#59C059">
    <block type="math_number"></block>
    <block type="text"></block>
  </category>
</xml>
`;

// Define custom blocks
Blockly.defineBlocksWithJsonArray([
  {
    "type": "when_green_flag",
    "message0": "when green flag clicked",
    "nextStatement": null,
    "colour": 120,
    "tooltip": "Start block",
    "helpUrl": "",
    "hat": "cap"
  },
  {
    "type": "move_steps",
    "message0": "move %1 steps",
    "args0":[{"type":"input_value","name":"STEPS"}],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 230
  },
  {
    "type": "turn_right",
    "message0": "turn right %1 degrees",
    "args0":[{"type":"input_value","name":"DEG"}],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 230
  },
  {
    "type": "turn_left",
    "message0": "turn left %1 degrees",
    "args0":[{"type":"input_value","name":"DEG"}],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 230
  },
  {
    "type":"go_to_xy",
    "message0":"go to x: %1 y: %2",
    "args0":[{"type":"input_value","name":"X"},{"type":"input_value","name":"Y"}],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 230
  },
  {
    "type":"say_for_seconds",
    "message0":"say %1 for %2 seconds",
    "args0":[{"type":"input_value","name":"TEXT"},{"type":"input_value","name":"SECONDS"}],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 160
  },
  {
    "type":"wait_seconds",
    "message0":"wait %1 seconds",
    "args0":[{"type":"input_value","name":"SECONDS"}],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 120
  },
  {
    "type":"repeat_times",
    "message0":"repeat %1 times %2",
    "args0":[{"type":"input_value","name":"TIMES"},{"type":"input_statement","name":"DO"}],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 120
  },
  {
    "type":"forever",
    "message0":"forever %1",
    "args0":[{"type":"input_statement","name":"DO"}],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 120
  }
]);

// JavaScript generators for the custom blocks.
// They generate code that calls functions in the runtime API.
Blockly.JavaScript['when_green_flag'] = function(block) {
  // Register a handler function named by block id
  var code = '';
  var next = Blockly.JavaScript.statementToCode(block, 'NEXT');
  code += `registerStart(async function(){\n${next}\n});\n`;
  return code;
};

Blockly.JavaScript['move_steps'] = function(block) {
  var steps = Blockly.JavaScript.valueToCode(block, 'STEPS', Blockly.JavaScript.ORDER_ATOMIC) || '0';
  return `await sprite.move(${steps});\n`;
};

Blockly.JavaScript['turn_right'] = function(block) {
  var deg = Blockly.JavaScript.valueToCode(block, 'DEG', Blockly.JavaScript.ORDER_ATOMIC) || '15';
  return `await sprite.turn(${deg});\n`;
};

Blockly.JavaScript['turn_left'] = function(block) {
  var deg = Blockly.JavaScript.valueToCode(block, 'DEG', Blockly.JavaScript.ORDER_ATOMIC) || '15';
  return `await sprite.turn(-(${deg}));\n`;
};

Blockly.JavaScript['go_to_xy'] = function(block) {
  var x = Blockly.JavaScript.valueToCode(block, 'X', Blockly.JavaScript.ORDER_ATOMIC) || '0';
  var y = Blockly.JavaScript.valueToCode(block, 'Y', Blockly.JavaScript.ORDER_ATOMIC) || '0';
  return `await sprite.goto(${x}, ${y});\n`;
};

Blockly.JavaScript['say_for_seconds'] = function(block) {
  var txt = Blockly.JavaScript.valueToCode(block, 'TEXT', Blockly.JavaScript.ORDER_ATOMIC) || "''";
  var sec = Blockly.JavaScript.valueToCode(block, 'SECONDS', Blockly.JavaScript.ORDER_ATOMIC) || '1';
  return `await sprite.say(${txt}, ${sec});\n`;
};

Blockly.JavaScript['wait_seconds'] = function(block) {
  var sec = Blockly.JavaScript.valueToCode(block, 'SECONDS', Blockly.JavaScript.ORDER_ATOMIC) || '1';
  return `await wait(${sec});\n`;
};

Blockly.JavaScript['repeat_times'] = function(block) {
  var times = Blockly.JavaScript.valueToCode(block, 'TIMES', Blockly.JavaScript.ORDER_ATOMIC) || '10';
  var branch = Blockly.JavaScript.statementToCode(block, 'DO');
  var code = `for (let i=0;i<${times};i++){ ${branch} }\n`;
  return code;
};

Blockly.JavaScript['forever'] = function(block) {
  var branch = Blockly.JavaScript.statementToCode(block, 'DO');
  // Make a cancellable loop by checking a global running flag
  var code = `while (running) { ${branch} await wait(0); }\n`;
  return code;
};

// Export the toolbox XML so the app can inject it
window.SCRATCH_TOOLBOX_XML = toolboxXml;
