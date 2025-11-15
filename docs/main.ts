// Sample TypeScript file for GitHub Pages

declare const d3: any;

interface GraphNode {
 id: string;
 x: number;
 y: number;
}

interface GraphEdge {
 source: string;
 target: string;
 color: string;
}

function greet(name: string): string {
 return `Hello, ${name}! Welcome to GitHub Pages with TypeScript.`;
}

function drawGraphWithNodesAndEdges() {
 const svg = d3.select("#d3-graph");
 const width = +svg.attr("width");
 const height = +svg.attr("height");

 // Clear previous content
 svg.selectAll("*").remove();

 // Define nodes and edges
 const nodes: GraphNode[] = [
   { id: "A", x: 100, y: 150 },
   { id: "B", x: 300, y: 50 },
   { id: "C", x: 500, y: 150 }
 ];

 const edges: GraphEdge[] = [
   { source: "A", target: "B", color: "red" },
   { source: "B", target: "C", color: "green" },
   { source: "A", target: "C", color: "blue" }
 ];

 // Draw edges (lines)
 svg.selectAll("line")
   .data(edges)
   .join("line")
   .attr("x1", (d: GraphEdge) => nodes.find(n => n.id === d.source)!.x)
   .attr("y1", (d: GraphEdge) => nodes.find(n => n.id === d.source)!.y)
   .attr("x2", (d: GraphEdge) => nodes.find(n => n.id === d.target)!.x)
   .attr("y2", (d: GraphEdge) => nodes.find(n => n.id === d.target)!.y)
   .attr("stroke", (d: GraphEdge) => d.color)
   .attr("stroke-width", 3);

 // Draw nodes (circles)
 svg.selectAll("circle")
   .data(nodes)
   .join("circle")
   .attr("cx", (d: GraphNode) => d.x)
   .attr("cy", (d: GraphNode) => d.y)
   .attr("r", 30)
   .attr("fill", "#69b3a2");

 // Draw node labels (text)
 svg.selectAll("text")
   .data(nodes)
   .join("text")
   .attr("x", (d: GraphNode) => d.x)
   .attr("y", (d: GraphNode) => d.y + 5)
   .attr("text-anchor", "middle")
   .attr("font-size", "20px")
   .attr("fill", "white")
   .text((d: GraphNode) => d.id);
}

document.addEventListener("DOMContentLoaded", () => {
 const el = document.getElementById("ts-greeting");
 if (el) {
   el.textContent = greet("Visitor");
 }
 drawGraphWithNodesAndEdges();
});