let nodes = [], // All nodes (vertices)
  edges = [], // All edges (lines)
  selectedNode = null, // For creating edges between two nodes
  canvas, // Canvas element
  traversalResult = [], // Stores traversal order
  traversalIndex = 0, // Animation step index
  isAnimating = false, // Whether animation is in progress
  currentMode = 'draw'; // Modes: draw, deleteNode, deleteEdge

// Runs once to set up the canvas
function setup() {
  canvas = createCanvas(800, 400);
  canvas.parent('canvas-holder');
  textAlign(CENTER, CENTER);
}

// Redraws everything continuously
function draw() {
  background(245);

  // Draw all edges
  stroke(120);
  edges.forEach((edge) => {
    line(edge.a.x, edge.a.y, edge.b.x, edge.b.y);
  });

  // Draw all nodes
  nodes.forEach((node) => {
    // Highlight traversal path with green
    if (
      traversalResult.includes(node.label) &&
      traversalResult.indexOf(node.label) <= traversalIndex
    ) {
      fill('lightgreen');
    } else {
      fill('#fff');
    }

    stroke('#333');
    ellipse(node.x, node.y, 40);
    fill('#000');
    noStroke();
    text(node.label, node.x, node.y);
  });

  // Slow animation frame rate during traversal
  if (isAnimating && traversalIndex < traversalResult.length - 1) {
    frameRate(1); // Slow down for visible animation
    traversalIndex++;
  } else {
    frameRate(60);
    isAnimating = false;
  }
}

// Respond to mouse clicks on canvas
function mousePressed() {
  if (mouseY > height) return; // Ignore if clicked outside canvas

  // DELETE NODE MODE
  if (currentMode === 'deleteNode') {
    for (let i = 0; i < nodes.length; i++) {
      if (dist(mouseX, mouseY, nodes[i].x, nodes[i].y) < 20) {
        let label = nodes[i].label;
        nodes.splice(i, 1);
        edges = edges.filter((e) => e.a.label !== label && e.b.label !== label);
        updateStartNodeDropdown();
        return;
      }
    }
    return;
  }

  // DELETE EDGE MODE
  if (currentMode === 'deleteEdge') {
    for (let i = 0; i < edges.length; i++) {
      const { a, b } = edges[i];
      if (isPointNearEdge(mouseX, mouseY, a, b)) {
        edges.splice(i, 1);
        return;
      }
    }
    return;
  }

  // DRAW MODE (Create or connect nodes)
  for (let node of nodes) {
    if (dist(mouseX, mouseY, node.x, node.y) < 20) {
      if (selectedNode && selectedNode !== node) {
        edges.push({ a: selectedNode, b: node });
        selectedNode = null;
      } else {
        selectedNode = node;
      }
      return;
    }
  }

  // Create new node
  let label = String.fromCharCode(65 + nodes.length); // Auto-increment A, B, C...
  let newNode = { x: mouseX, y: mouseY, label };
  nodes.push(newNode);
  updateStartNodeDropdown();
}

// Distance from point to edge
function isPointNearEdge(px, py, a, b) {
  const d1 = dist(px, py, a.x, a.y);
  const d2 = dist(px, py, b.x, b.y);
  const lineLen = dist(a.x, a.y, b.x, b.y);
  const buffer = 5;
  return d1 + d2 >= lineLen - buffer && d1 + d2 <= lineLen + buffer;
}

// Reset all data
function resetGraph() {
  nodes = [];
  edges = [];
  selectedNode = null;
  traversalResult = [];
  traversalIndex = 0;
  isAnimating = false;
  updateStartNodeDropdown();
  document.getElementById('output').textContent = 'None yet';
  document.getElementById('structureUsed').textContent = '-';
  document.getElementById('chosenMethod').textContent = '-';
}

// Dropdown for selecting start node
function updateStartNodeDropdown() {
  const dropdown = document.getElementById('startNode');
  dropdown.innerHTML = '';
  nodes.forEach((n) => {
    const opt = document.createElement('option');
    opt.value = n.label;
    opt.textContent = n.label;
    dropdown.appendChild(opt);
  });
}

// Create adjacency list from graph
function buildAdjList() {
  let adj = {};
  nodes.forEach((n) => (adj[n.label] = []));
  edges.forEach((e) => {
    adj[e.a.label].push(e.b.label);
    adj[e.b.label].push(e.a.label);
  });
  return adj;
}

// BFS Traversal with queue
function bfs(graph, start) {
  let visited = new Set();
  let queue = [start];
  let result = [];

  while (queue.length) {
    let node = queue.shift();
    if (!visited.has(node)) {
      visited.add(node);
      result.push(node);
      queue.push(...graph[node].filter((n) => !visited.has(n)));
    }
  }

  return { order: result, structure: 'Queue' };
}

// DFS Traversal with recursion
function dfs(graph, start) {
  let visited = new Set();
  let result = [];

  function explore(node) {
    visited.add(node);
    result.push(node);
    for (let n of graph[node]) {
      if (!visited.has(n)) explore(n);
    }
  }

  explore(start);
  return { order: result, structure: 'Stack (recursive)' };
}

// Update UI display based on method selected
function updateStructureDisplay() {
  const method = document.getElementById('method').value;
  document.getElementById('structureUsed').textContent =
    method === 'bfs' ? 'Queue' : 'Stack (recursive)';
}

// Run traversal animation
function runTraversal() {
  if (!nodes.length) return;

  const start = document.getElementById('startNode').value;
  const method = document.getElementById('method').value;
  const graph = buildAdjList();
  let resultObj;

  if (method === 'bfs') {
    resultObj = bfs(graph, start);
  } else {
    resultObj = dfs(graph, start);
  }

  traversalResult = resultObj.order;
  traversalIndex = 0;
  isAnimating = true;

  document.getElementById('chosenMethod').textContent = method.toUpperCase();
  document.getElementById('structureUsed').textContent = resultObj.structure;
  document.getElementById('output').textContent = resultObj.order.join(' ➝ ');
}

// UI mode switch
function setMode(mode) {
  currentMode = mode;
  document.getElementById('currentMode').textContent = {
    draw: 'Draw',
    deleteNode: 'Delete Node',
    deleteEdge: 'Delete Edge',
  }[mode];
}
