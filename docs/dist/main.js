"use strict";
// Sample TypeScript file for GitHub Pages
function greet(name) {
    return `Hello, ${name}! Welcome to GitHub Pages with TypeScript.`;
}
function drawGraphWithNodesAndEdges() {
    const svg = d3.select("#d3-graph");
    const width = +svg.attr("width");
    const height = +svg.attr("height");
    // Clear previous content
    svg.selectAll("*").remove();
    // Define nodes and edges
    const nodes = [
        { id: "A", x: 100, y: 150 },
        { id: "B", x: 300, y: 50 },
        { id: "C", x: 500, y: 150 }
    ];
    const edges = [
        { source: "A", target: "B", color: "red" },
        { source: "B", target: "C", color: "green" },
        { source: "A", target: "C", color: "blue" }
    ];
    // Draw edges (lines)
    svg.selectAll("line")
        .data(edges)
        .join("line")
        .attr("x1", (d) => nodes.find(n => n.id === d.source).x)
        .attr("y1", (d) => nodes.find(n => n.id === d.source).y)
        .attr("x2", (d) => nodes.find(n => n.id === d.target).x)
        .attr("y2", (d) => nodes.find(n => n.id === d.target).y)
        .attr("stroke", (d) => d.color)
        .attr("stroke-width", 3);
    // Draw nodes (circles)
    svg.selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("cx", (d) => d.x)
        .attr("cy", (d) => d.y)
        .attr("r", 30)
        .attr("fill", "#69b3a2");
    // Draw node labels (text)
    svg.selectAll("text")
        .data(nodes)
        .join("text")
        .attr("x", (d) => d.x)
        .attr("y", (d) => d.y + 5)
        .attr("text-anchor", "middle")
        .attr("font-size", "20px")
        .attr("fill", "white")
        .text((d) => d.id);
}
document.addEventListener("DOMContentLoaded", () => {
    const el = document.getElementById("ts-greeting");
    if (el) {
        el.textContent = greet("Visitor");
    }
    drawGraphWithNodesAndEdges();
});
