# Mermaid to Draw.io Co## Features

- **Perfect Layout Matching**: Extracts exact x,y,width,height coordinates from Mermaid's Dagre layout engine
- **Precise Edge Routing**: Translates SVG path data into Draw.io waypoints for curved and complex connections
- **Shape Detection**: Automatically detects Mermaid node shapes (rectangles, diamonds, circles, etc.) and maps to Draw.io equivalents
- **Subgraph Support**: Handles Mermaid subgraphs as Draw.io groups
- **Coordinate Normalization**: Removes margins by normalizing coordinates to start from (0,0)
- **Font Scaling**: Sets appropriate font sizes to prevent label overflow
- **Z-Index Management**: Ensures proper layering with clusters behind nodes
- **Markdown Support**: Wraps labels in CDATA for HTML/Markdown renderingr

A CLI tool that converts Mermaid flowcharts to Draw.io format by extracting exact coordinates from rendered SVG using Playwright.

## Installation

1. Clone or download this repository
2. Run `npm install` to install dependencies
3. Run `npx playwright install chromium` to install the browser

## Usage

```bash
node converter.js -i input.mmd -o output.drawio
```

### Options

- `-i, --input <file>`: Input Mermaid file (.mmd) - required
- `-o, --output <file>`: Output Draw.io file (.drawio) - required
- `-v, --version`: Show version number
- `-h, --help`: Show help

## Features

- **Perfect Layout Matching**: Extracts exact x,y,width,height coordinates from Mermaid's Dagre layout engine
- **Subgraph Support**: Handles Mermaid subgraphs as Draw.io groups
- **Edge Routing**: Attempts to preserve curved edge paths
- **Markdown Support**: Wraps labels in CDATA for HTML/Markdown rendering

## Example

Given a `flowchart.mmd`:

```
graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> B
    C --> E[End]
```

Run:

```bash
node converter.js -i flowchart.mmd -o flowchart.drawio
```

The resulting `.drawio` file can be opened directly in Draw.io with perfect layout preservation.

## Technical Implementation

The tool uses Playwright to render Mermaid diagrams in a headless browser and extracts:

- **Node Coordinates**: Exact x,y,width,height from SVG bounding boxes
- **Edge Waypoints**: Parses SVG path `d` attributes to extract coordinate points
- **Shape Detection**: Identifies node shapes by SVG element types (rect, polygon, circle, etc.)
- **Source/Target IDs**: Parses edge path IDs to determine connections

## Final Checklist ✅

- ✅ Coordinate extraction from Dagre layout
- ✅ SVG path parsing for edge waypoints  
- ✅ Shape mapping (rectangles, diamonds, circles)
- ✅ Coordinate normalization (remove margins)
- ✅ Z-index management (clusters before nodes)
- ✅ Font size scaling (14px default)
- ✅ Subgraph support as Draw.io groups
- ✅ Edge routing with orthogonal styles
- ✅ CDATA wrapping for HTML/Markdown labels
