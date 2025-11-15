"use strict";
// Ballroom Partnership Graph
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// Map relationship types to colors
const relationshipColors = {
    standard: "yellow",
    latin: "red",
    smooth: "green",
    rhythm: "blue"
};
function drawGraphWithNodesAndEdges(data) {
    const svg = d3.select("#d3-graph");
    const width = window.innerWidth;
    const height = window.innerHeight;
    // Set SVG dimensions
    svg.attr("width", width).attr("height", height);
    // Clear previous content
    svg.selectAll("*").remove();
    // Extract unique nodes from relationships
    const nodeSet = new Set();
    data.relationships.forEach(rel => {
        nodeSet.add(rel.nodeA);
        nodeSet.add(rel.nodeB);
    });
    const nodeNames = Array.from(nodeSet);
    // Create nodes with initial random positions
    const nodes = nodeNames.map((name) => ({
        id: name,
        x: width / 2 + (Math.random() - 0.5) * 200,
        y: height / 2 + (Math.random() - 0.5) * 200
    }));
    // Create edges from relationships
    const edges = data.relationships.map(rel => ({
        source: rel.nodeA,
        target: rel.nodeB,
        color: relationshipColors[rel.relationship.toLowerCase()] || "gray",
        type: rel.relationship.toLowerCase()
    }));
    // Create force simulation
    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(edges)
        .id((d) => d.id)
        .distance(200))
        .force("charge", d3.forceManyBody().strength(-1000))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collision", d3.forceCollide().radius(60));
    // Create a container group for zoom/pan
    const container = svg.append("g").attr("class", "container");
    // Create separate groups for different element types
    const edgeGroup = container.append("g").attr("class", "edges");
    const nodeGroup = container.append("g").attr("class", "nodes");
    const labelGroup = container.append("g").attr("class", "labels");
    // Add zoom behavior
    const zoom = d3.zoom()
        .scaleExtent([0.1, 10]) // Allow zoom from 10% to 1000%
        .on("zoom", (event) => {
        container.attr("transform", event.transform);
    });
    // Apply zoom to SVG
    svg.call(zoom);
    // Draw edges (lines) - must be drawn before simulation starts
    const lines = edgeGroup.selectAll("line")
        .data(edges)
        .join("line")
        .attr("stroke", (d) => d.color)
        .attr("stroke-width", 6);
    // Draw nodes (circles)
    const circles = nodeGroup.selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("cx", (d) => d.x)
        .attr("cy", (d) => d.y)
        .attr("r", 50)
        .attr("fill", "#69b3a2")
        .attr("stroke", "#2d5f4f")
        .attr("stroke-width", 3)
        .attr("cursor", "move");
    // Draw node labels (text)
    const labels = labelGroup.selectAll("text")
        .data(nodes)
        .join("text")
        .attr("x", (d) => d.x)
        .attr("y", (d) => d.y + 7)
        .attr("text-anchor", "middle")
        .attr("font-size", "24px")
        .attr("fill", "white")
        .attr("stroke", "#000")
        .attr("stroke-width", 1)
        .attr("paint-order", "stroke")
        .attr("pointer-events", "none")
        .text((d) => d.id);
    // Function to update positions
    function updatePositions() {
        lines
            .attr("x1", (d) => d.source.x)
            .attr("y1", (d) => d.source.y)
            .attr("x2", (d) => d.target.x)
            .attr("y2", (d) => d.target.y);
        circles
            .attr("cx", (d) => d.x)
            .attr("cy", (d) => d.y);
        labels
            .attr("x", (d) => d.x)
            .attr("y", (d) => d.y + 7);
    }
    // Update positions on each simulation tick
    simulation.on("tick", updatePositions);
    // Create drag behavior
    const drag = d3.drag()
        .on("start", function (event, d) {
        if (!event.active)
            simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
        d3.select(this).raise().attr("stroke", "#000").attr("stroke-width", 5);
    })
        .on("drag", function (event, d) {
        d.fx = event.x;
        d.fy = event.y;
    })
        .on("end", function (event, d) {
        if (!event.active)
            simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
        d3.select(this).attr("stroke", "#2d5f4f").attr("stroke-width", 3);
    });
    // Apply drag behavior to circles
    circles.call(drag);
    // Draw legend (outside container so it doesn't zoom)
    const legendData = [
        { color: "yellow", type: "standard" },
        { color: "blue", type: "latin" },
        { color: "green", type: "smooth" },
        { color: "red", type: "rhythm" }
    ];
    const legendX = 40;
    const legendY = height - 200;
    const legendSpacing = 45;
    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${legendX},${legendY})`);
    legend.selectAll("line")
        .data(legendData)
        .join("line")
        .attr("x1", 0)
        .attr("y1", (_, i) => i * legendSpacing)
        .attr("x2", 60)
        .attr("y2", (_, i) => i * legendSpacing)
        .attr("stroke", (d) => d.color)
        .attr("stroke-width", 6);
    legend.selectAll("text")
        .data(legendData)
        .join("text")
        .attr("x", 70)
        .attr("y", (_, i) => i * legendSpacing + 6)
        .attr("font-size", "22px")
        .attr("font-weight", "bold")
        .attr("fill", "white")
        .attr("stroke", "#000")
        .attr("stroke-width", 3)
        .attr("paint-order", "stroke")
        .text((d) => d.type.charAt(0).toUpperCase() + d.type.slice(1));
}
// Load graph data and initialize
document.addEventListener("DOMContentLoaded", () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield fetch("graph-data.json");
        const data = yield response.json();
        drawGraphWithNodesAndEdges(data);
        // Redraw on window resize
        window.addEventListener("resize", () => {
            drawGraphWithNodesAndEdges(data);
        });
    }
    catch (error) {
        console.error("Error loading graph data:", error);
    }
}));
