// Declare arrays to store nodes and edges
let nodes = [], // Stores all the nodes placed on the canvas
  edges = [], // Stores all the edges (connections) between nodes
  selectedNode = null, // Used to track node selection when connecting edges
  canvas; // Will reference the p5.js canvas

/**
 * p5.js function called once when the program starts.
 * Sets up the canvas and alignment for text.
 */
function setup() {
  // Create a canvas of 800px width and 400px height
  canvas = createCanvas(800, 400);

  // Attach canvas to a container div in HTML with id 'canvas-holder'
  canvas.parent('canvas-holder');

  // Center-align text horizontally and vertically
  textAlign(CENTER, CENTER);
}

/**
 * p5.js function that runs in a loop.
 * Continuously redraws canvas and all elements on it.
 */
function draw() {
  background(245); // Set a light background color for the canvas

  // Draw all the edges (lines between connected nodes)
  stroke(120); // Set stroke color for lines
  edges.forEach((edge) => {
    line(edge.a.x, edge.a.y, edge.b.x, edge.b.y); // Draw line between node a and b
  });

  // Draw all the nodes (circles with labels)
  nodes.forEach((node) => {
    fill('#fff'); // White fill for node circle
    stroke('#333'); // Dark border
    ellipse(node.x, node.y, 40); // Draw node circle
    fill('#000'); // Text color black
    noStroke(); // No border for text
    text(node.label, node.x, node.y); // Draw label in center
  });
}

/**
 * Handles user mouse click interactions on the canvas.
 * - Adds a new node at click position if no existing node is clicked.
 * - Connects nodes (creates an edge) if a second node is selected.
 */
function mousePressed() {
  // Ignore clicks outside the canvas area
  if (mouseY > height) return;

  // Check if user clicked on an existing node
  for (let node of nodes) {
    if (dist(mouseX, mouseY, node.x, node.y) < 20) {
      // If a node is already selected and the new click is another node
      if (selectedNode && selectedNode !== node) {
        edges.push({ a: selectedNode, b: node }); // Create edge between two nodes
        selectedNode = null; // Reset selection
      } else {
        selectedNode = node; // Select the clicked node
      }
      return; // Exit to avoid creating a new node
    }
  }

  // Create a new node if no existing node was clicked
  let label = String.fromCharCode(65 + nodes.length); // Generate label A, B, C, ...
  let newNode = { x: mouseX, y: mouseY, label };
  nodes.push(newNode); // Add node to nodes array
  updateStartNodeDropdown(); // Refresh start node dropdown
}

/**
 * Updates the dropdown list with available node labels
 * so the user can pick a starting node.
 */
function updateStartNodeDropdown() {
  const dropdown = document.getElementById('startNode');
  dropdown.innerHTML = ''; // Clear current options

  // Add all node labels as dropdown options
  nodes.forEach((n) => {
    const opt = document.createElement('option');
    opt.value = n.label;
    opt.textContent = n.label;
    dropdown.appendChild(opt);
  });
}

/**
 * Builds an adjacency list from the current nodes and edges.
 * This is used as the internal graph representation.
 */
function buildAdjList() {
  let adj = {};

  // Initialize adjacency list with all nodes
  nodes.forEach((n) => (adj[n.label] = []));

  // Add connections (edges are undirected)
  edges.forEach((e) => {
    adj[e.a.label].push(e.b.label); // Edge from A to B
    adj[e.b.label].push(e.a.label); // Edge from B to A
  });

  return adj;
}

/**
 * Performs Breadth-First Search (BFS) traversal on the graph.
 * Returns the traversal order and the data structure used.
 */
function bfs(graph, start) {
  let visited = new Set(); // Tracks visited nodes
  let queue = [start]; // Initialize queue with start node
  let result = []; // Store traversal order

  while (queue.length) {
    let node = queue.shift(); // Get next node from queue
    if (!visited.has(node)) {
      visited.add(node); // Mark node as visited
      result.push(node); // Add to traversal result
      // Add unvisited neighbors to queue
      queue.push(...graph[node].filter((n) => !visited.has(n)));
    }
  }

  return { order: result, structure: 'Queue' };
}

/**
 * Performs Depth-First Search (DFS) traversal on the graph.
 * Returns the traversal order and the data structure used.
 */
function dfs(graph, start) {
  let visited = new Set(); // Tracks visited nodes
  let result = []; // Store traversal order

  // Recursive function to explore each node
  function explore(node) {
    visited.add(node); // Mark current node as visited
    result.push(node); // Add to traversal result

    // Recursively visit each unvisited neighbor
    for (let n of graph[node]) {
      if (!visited.has(n)) explore(n);
    }
  }

  explore(start); // Start exploring from the selected node
  return { order: result, structure: 'Stack (implicit via recursion)' };
}

/**
 * Updates the UI to display the type of data structure used
 * based on the selected traversal method.
 */
function updateStructureDisplay() {
  const method = document.getElementById('method').value;
  document.getElementById('structureUsed').textContent =
    method === 'bfs' ? 'Queue' : 'Stack (recursive)';
}

/**
 * Triggers the traversal process when user clicks "Run".
 * Shows the traversal order, data structure used, and method.
 */
function runTraversal() {
  if (!nodes.length) return; // No graph drawn yet

  const start = document.getElementById('startNode').value;
  const method = document.getElementById('method').value;
  const graph = buildAdjList();
  let resultObj;

  // Execute chosen traversal algorithm
  if (method === 'bfs') {
    resultObj = bfs(graph, start);
  } else {
    resultObj = dfs(graph, start);
  }

  // Display results in UI
  document.getElementById('chosenMethod').textContent = method.toUpperCase();
  document.getElementById('structureUsed').textContent = resultObj.structure;
  document.getElementById('output').textContent = resultObj.order.join(' ➝ ');
}
