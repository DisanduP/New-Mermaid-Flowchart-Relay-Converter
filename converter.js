#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const { create } = require('xmlbuilder2');
const cheerio = require('cheerio');
const { program } = require('commander');

async function runConversion(inputFile, outputFile) {
    if (!fs.existsSync(inputFile)) {
        console.error("Error: Input file does not exist.");
        process.exit(1);
    }

    console.log("🚀 Generating SVG with Mermaid CLI...");

    // Step 1: Use Mermaid CLI to generate SVG
    const tempSvgFile = 'temp_diagram.svg';
    try {
        execSync(`mmdc -i "${inputFile}" -o "${tempSvgFile}"`, { stdio: 'inherit' });
    } catch (error) {
        console.error("Error: Failed to generate SVG with Mermaid CLI. Make sure @mermaid-js/mermaid-cli is installed globally.");
        console.error("Run: npm install -g @mermaid-js/mermaid-cli");
        process.exit(1);
    }

    // Step 2: Read and parse the SVG
    const svgContent = fs.readFileSync(tempSvgFile, 'utf8');
    const $ = cheerio.load(svgContent, { xmlMode: true });

    console.log("📊 Extracting coordinates from SVG...");

    // Step 3: Extract nodes
    const nodes = [];
    $('g.node').each((i, el) => {
        const $el = $(el);

        // Extract X and Y from transform="translate(x, y)"
        const transform = $el.attr('transform') || '';
        const translateMatch = transform.match(/translate\(([^,]+),\s*([^)]+)\)/);
        let x = 0, y = 0;
        if (translateMatch) {
            x = parseFloat(translateMatch[1]);
            y = parseFloat(translateMatch[2]);
        }

        // Extract Width/Height from the shape inside (rect, ellipse, etc.)
        const rect = $el.find('rect, ellipse, polygon');
        let w = 100, h = 50; // defaults
        if (rect.length > 0) {
            w = parseFloat(rect.attr('width') || rect.attr('rx') * 2 || 100);
            h = parseFloat(rect.attr('height') || rect.attr('ry') * 2 || 50);
        }

        // Extract label from text elements
        let label = '';
        $el.find('span, text, foreignObject').each((j, textEl) => {
            const text = $(textEl).text().trim();
            if (text && text.length > label.length) {
                label = text;
            }
        });

        // Fallback to any text content
        if (!label) {
            label = $el.text().trim();
        }

        // Determine shape style
        let style = "whiteSpace=wrap;html=1;fontSize=12;fillColor=#ffffff;strokeColor=#000000;";
        if ($el.find('polygon').length > 0) {
            style = "shape=rhombus;whiteSpace=wrap;html=1;fontSize=12;";
            // Increase diamond size for better visibility
            w = Math.max(w, 140); // Increased minimum width for diamonds
            h = Math.max(h, 80);  // Increased minimum height for diamonds
        } else if ($el.find('ellipse').length > 0) {
            style = "shape=ellipse;whiteSpace=wrap;html=1;";
        }

        nodes.push({
            id: $el.attr('id') || `node_${i}`,
            x, y, w, h, label, style
        });
    });

    // Step 4: Extract edges
    const edges = [];
    $('g.edgePaths path').each((i, pathEl) => {
        const $path = $(pathEl);
        const d = $path.attr('d') || '';

        // Parse path data to extract waypoints
        const points = [];
        const commands = d.match(/[MLHVCSQTAZ][^MLHVCSQTAZ]*/gi) || [];
        let currentX = 0, currentY = 0;

        commands.forEach(cmd => {
            const type = cmd[0];
            const coords = cmd.slice(1).trim().split(/[\s,]+/).map(Number);

            if (type === 'M' || type === 'L') {
                currentX = coords[0];
                currentY = coords[1];
                points.push({ x: currentX, y: currentY });
            } else if (type === 'C') {
                // For curves, add control points and end point
                points.push({ x: coords[4], y: coords[5] });
                currentX = coords[4];
                currentY = coords[5];
            }
        });

        let edgeStyle = "edgeStyle=orthogonalEdgeStyle;rounded=1;curved=1;html=1;endArrow=classic;";
        if ($path.hasClass('edge-thickness-thick')) edgeStyle += "strokeWidth=3;";
        if ($path.hasClass('edge-pattern-dotted')) edgeStyle += "dashed=1;";

        edges.push({
            id: `edge_${i}`,
            style: edgeStyle,
            points
        });
    });

    console.log(`✅ Extracted ${nodes.length} nodes and ${edges.length} edges`);

    // Auto-add Start and End nodes if not present
    const hasStartNode = nodes.some(n => n.label.toLowerCase().includes('start'));
    const hasEndNode = nodes.some(n => n.label.toLowerCase().includes('end'));

    if (!hasStartNode) {
        // Add Start node at the beginning
        const startNode = {
            id: 'auto_start',
            x: nodes.length > 0 ? nodes[0].x : 100,
            y: nodes.length > 0 ? nodes[0].y - 120 : 50,
            w: 100,
            h: 50,
            label: 'Start',
            style: "whiteSpace=wrap;html=1;fontSize=12;fillColor=#ffffff;strokeColor=#000000;"
        };
        nodes.unshift(startNode);

        // Add edge from Start to first node
        if (nodes.length > 1) {
            edges.unshift({
                id: 'auto_start_edge',
                style: "edgeStyle=orthogonalEdgeStyle;rounded=1;curved=1;html=1;endArrow=classic;",
                points: [
                    { x: startNode.x + startNode.w/2, y: startNode.y + startNode.h },
                    { x: startNode.x + startNode.w/2, y: nodes[1].y }
                ]
            });
        }
    }

    if (!hasEndNode) {
        // Add End node at the end
        const lastNode = nodes[nodes.length - 1];
        const endNode = {
            id: 'auto_end',
            x: lastNode.x,
            y: lastNode.y + lastNode.h + 60,
            w: 100,
            h: 50,
            label: 'End',
            style: "whiteSpace=wrap;html=1;fontSize=12;fillColor=#ffffff;strokeColor=#000000;"
        };
        nodes.push(endNode);

        // Add edge from last node to End
        edges.push({
            id: 'auto_end_edge',
            style: "edgeStyle=orthogonalEdgeStyle;rounded=1;curved=1;html=1;endArrow=classic;",
            points: [
                { x: lastNode.x + lastNode.w/2, y: lastNode.y + lastNode.h },
                { x: lastNode.x + lastNode.w/2, y: endNode.y }
            ]
        });
    }

    console.log(`📝 Final diagram: ${nodes.length} nodes and ${edges.length} edges (auto-added start/end if needed)`);
    const root = create({ version: '1.0', encoding: 'UTF-8' }).ele('mxGraphModel').ele('root');
    root.ele('mxCell', { id: '0' });
    root.ele('mxCell', { id: '1', parent: '0' });

    // Add nodes
    nodes.forEach(n => {
        root.ele('mxCell', {
            id: n.id,
            value: n.label,
            style: n.style,
            vertex: "1",
            parent: "1"
        }).ele('mxGeometry', {
            x: n.x,
            y: n.y,
            width: n.w,
            height: n.h,
            as: "geometry"
        });
    });

    // Add edges
    edges.forEach(e => {
        const edgeCell = root.ele('mxCell', {
            id: e.id,
            style: e.style,
            edge: "1",
            parent: "1"
        });

        const geo = edgeCell.ele('mxGeometry', { relative: "1", as: "geometry" });
        const array = geo.ele('Array', { as: "points" });

        // Add waypoints
        e.points.forEach(pt => {
            array.ele('mxPoint', { x: pt.x, y: pt.y });
        });
    });

    // Write output
    fs.writeFileSync(outputFile, root.end({ prettyPrint: true }));

    // Clean up temp file
    if (fs.existsSync(tempSvgFile)) {
        fs.unlinkSync(tempSvgFile);
    }

    console.log(`✅ Success! Diagram converted and saved to: ${outputFile}`);
}

program
    .requiredOption('-i, --input <file>', 'Input .mmd')
    .requiredOption('-o, --output <file>', 'Output .drawio')
    .action((options) => runConversion(options.input, options.output));

program.parse();