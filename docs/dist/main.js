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
    // Create edges from relationships with curve offsets for multiple edges
    const edgeMap = new Map();
    data.relationships.forEach(rel => {
        const key = [rel.nodeA, rel.nodeB].sort().join('-');
        if (!edgeMap.has(key)) {
            edgeMap.set(key, []);
        }
        edgeMap.get(key).push({
            source: rel.nodeA,
            target: rel.nodeB,
            color: relationshipColors[rel.relationship.toLowerCase()] || "gray",
            type: rel.relationship.toLowerCase()
        });
    });
    // Assign curve offsets to edges with multiple relationships
    const edges = [];
    edgeMap.forEach((edgeList) => {
        if (edgeList.length === 1) {
            edgeList[0].curveOffset = 0;
            edges.push(edgeList[0]);
        }
        else {
            // Multiple edges between same nodes - apply curve offsets
            const offsetStep = 40;
            const startOffset = -((edgeList.length - 1) * offsetStep) / 2;
            edgeList.forEach((edge, i) => {
                edge.curveOffset = startOffset + (i * offsetStep);
                edges.push(edge);
            });
        }
    });
    // Create force simulation
    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(edges)
        .id((d) => d.id)
        .distance(180))
        .force("charge", d3.forceManyBody().strength(-600))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collision", d3.forceCollide().radius(60))
        .force("x", d3.forceX(width / 2).strength(0.03))
        .force("y", d3.forceY(height / 2).strength(0.03));
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
    // Draw edges (paths for curved lines) - must be drawn before simulation starts
    const lines = edgeGroup.selectAll("path")
        .data(edges)
        .join("path")
        .attr("stroke", (d) => d.color)
        .attr("stroke-width", 6)
        .attr("fill", "none");
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
        lines.attr("d", (d) => {
            const sourceX = d.source.x;
            const sourceY = d.source.y;
            const targetX = d.target.x;
            const targetY = d.target.y;
            if (d.curveOffset === 0) {
                // Straight line for single edges
                return `M ${sourceX},${sourceY} L ${targetX},${targetY}`;
            }
            else {
                // Curved line for multiple edges
                const dx = targetX - sourceX;
                const dy = targetY - sourceY;
                const dr = Math.sqrt(dx * dx + dy * dy);
                // Calculate perpendicular offset
                const offsetX = -dy / dr * d.curveOffset;
                const offsetY = dx / dr * d.curveOffset;
                // Control point for quadratic curve
                const cx = (sourceX + targetX) / 2 + offsetX;
                const cy = (sourceY + targetY) / 2 + offsetY;
                return `M ${sourceX},${sourceY} Q ${cx},${cy} ${targetX},${targetY}`;
            }
        });
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
}
// Draw legend in the HTML legend window
function drawLegend() {
    const legendSvg = d3.select("#legend-svg");
    legendSvg.selectAll("*").remove();
    const legendData = [
        { color: "yellow", type: "Standard" },
        { color: "red", type: "Latin" },
        { color: "green", type: "Smooth" },
        { color: "blue", type: "Rhythm" }
    ];
    const isMobile = window.innerWidth < 768;
    const legendSpacing = isMobile ? 25 : 40;
    const lineLength = isMobile ? 25 : 50;
    const textOffset = isMobile ? 30 : 60;
    const fontSize = isMobile ? 12 : 16;
    const strokeWidth = isMobile ? 3 : 5;
    // Set SVG size
    const svgHeight = legendData.length * legendSpacing + 10;
    legendSvg.attr("width", isMobile ? 150 : 200).attr("height", svgHeight);
    const legend = legendSvg.append("g")
        .attr("transform", "translate(10, 15)");
    legend.selectAll("line")
        .data(legendData)
        .join("line")
        .attr("x1", 0)
        .attr("y1", (_, i) => i * legendSpacing)
        .attr("x2", lineLength)
        .attr("y2", (_, i) => i * legendSpacing)
        .attr("stroke", (d) => d.color)
        .attr("stroke-width", strokeWidth);
    legend.selectAll("text")
        .data(legendData)
        .join("text")
        .attr("x", textOffset)
        .attr("y", (_, i) => i * legendSpacing + 5)
        .attr("font-size", `${fontSize}px`)
        .attr("font-weight", "bold")
        .attr("fill", "white")
        .attr("pointer-events", "none")
        .text((d) => d.type);
}
// Setup legend collapse functionality
function setupLegendCollapse() {
    const legendWindow = document.getElementById("legend-window");
    const legendHeader = document.getElementById("legend-header");
    if (legendHeader && legendWindow) {
        legendHeader.addEventListener("click", () => {
            legendWindow.classList.toggle("collapsed");
        });
    }
}
// Load graph data and initialize
document.addEventListener("DOMContentLoaded", () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield fetch("graph-data.json");
        const data = yield response.json();
        drawGraphWithNodesAndEdges(data);
        drawLegend();
        setupLegendCollapse();
        // Redraw on window resize
        window.addEventListener("resize", () => {
            drawGraphWithNodesAndEdges(data);
            drawLegend();
        });
    }
    catch (error) {
        console.error("Error loading graph data:", error);
    }
}));
