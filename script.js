let nodes = [],
  edges = [],
  selectedNode = null,
  canvas;

function setup() {
  canvas = createCanvas(800, 400);
  canvas.parent('canvas-holder');
  textAlign(CENTER, CENTER);
}

function draw() {
  background(245);

  // Draw edges
  stroke(120);
  edges.forEach((edge) => {
    line(edge.a.x, edge.a.y, edge.b.x, edge.b.y);
  });

  // Draw nodes
  nodes.forEach((node) => {
    fill('#fff');
    stroke('#333');
    ellipse(node.x, node.y, 40);
    fill('#000');
    noStroke();
    text(node.label, node.x, node.y);
  });
}

function mousePressed() {
  if (mouseY > height) return;

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

  let label = String.fromCharCode(65 + nodes.length);
  let newNode = { x: mouseX, y: mouseY, label };
  nodes.push(newNode);
  updateStartNodeDropdown();
}

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

function buildAdjList() {
  let adj = {};
  nodes.forEach((n) => (adj[n.label] = []));
  edges.forEach((e) => {
    adj[e.a.label].push(e.b.label);
    adj[e.b.label].push(e.a.label);
  });
  return adj;
}

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
  return { order: result, structure: 'Stack (implicit via recursion)' };
}

function updateStructureDisplay() {
  const method = document.getElementById('method').value;
  document.getElementById('structureUsed').textContent =
    method === 'bfs' ? 'Queue' : 'Stack (recursive)';
}

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

  document.getElementById('chosenMethod').textContent = method.toUpperCase();
  document.getElementById('structureUsed').textContent = resultObj.structure;
  document.getElementById('output').textContent = resultObj.order.join(' ➝ ');
}
