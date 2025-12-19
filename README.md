# Mermaid to Draw.io Converter

A professional CLI tool that converts Mermaid flowcharts to Draw.io format with pixel-perfect accuracy using the SVG Relay Method.

## Features

- **SVG Relay Method**: Uses Mermaid CLI to generate SVG, then extracts exact coordinates for perfect layout matching
- **Auto Start/End Nodes**: Automatically adds "Start" and "End" nodes to complete flowcharts
- **Professional Styling**: Larger diamonds (140x80), normal text (no bold), clean arrowheads
- **Precise Edge Routing**: Translates SVG path data into Draw.io waypoints for curved connections
- **Shape Detection**: Automatically detects Mermaid node shapes and maps to Draw.io equivalents
- **Smart Layout**: Preserves Mermaid's Dagre layout engine coordinates exactly
- **Clean Output**: Professional flowchart appearance ready for enterprise use

## Installation

1. Install globally: `npm install -g @mermaid-js/mermaid-cli`
2. Clone or download this repository
3. Run `npm install` to install dependencies

## Usage

```bash
node converter.js -i input.mmd -o output.drawio
```

### Options

- `-i, --input <file>`: Input Mermaid file (.mmd) - required
- `-o, --output <file>`: Output Draw.io file (.drawio) - required
- `-v, --version`: Show version number
- `-h, --help`: Show help

## Example

Given a `user_logout_flow.mmd`:

```
graph TD
    A[User Clicks Logout] --> B{Confirm Logout?}
    B -->|Yes| C[Clear User Session]
    B -->|No| D[Cancel Logout]
    C --> E[Delete Session Cookies]
    E --> F[Update User Status to Offline]
    F --> G[Log Logout Event]
    G --> H[Redirect to Login Page]
    H --> I[Show Logout Success Message]
    D --> K[Return to Current Page]
```

Run:

```bash
node converter.js -i user_logout_flow.mmd -o user_logout_flow.drawio
```

The resulting `.drawio` file includes auto-added Start/End nodes and opens directly in Draw.io with perfect layout preservation.

## Technical Implementation

The tool uses the **SVG Relay Method**:

1. **Mermaid CLI Generation**: Uses `@mermaid-js/mermaid-cli` to render diagrams to SVG
2. **SVG Parsing**: Extracts exact coordinates using Cheerio XML parsing
3. **Shape Detection**: Identifies node shapes by SVG element types and applies professional styling
4. **Edge Extraction**: Parses SVG path `d` attributes to extract precise waypoints
5. **Auto Enhancement**: Adds Start/End nodes and applies enterprise-ready styling
6. **Draw.io XML Generation**: Creates clean XML with xmlbuilder2

## Professional Features

- **Enhanced Diamonds**: Decision points are sized 140x80 pixels (vs default 100x60)
- **Clean Typography**: Normal font weight, 12pt size, no bold formatting
- **Perfect Arrows**: Classic filled arrowheads with 2px stroke width
- **Complete Flowcharts**: Auto-added Start/End nodes for professional appearance
- **Layout Preservation**: Zero deviation from Mermaid's layout algorithm

## Final Checklist ✅

- ✅ SVG Relay Method (Mermaid CLI + coordinate extraction)
- ✅ Auto Start/End node addition
- ✅ Professional diamond sizing (140x80 minimum)
- ✅ Clean typography (normal weight, 12pt)
- ✅ Classic filled arrowheads with proper stroke width
- ✅ Precise waypoint extraction from SVG paths
- ✅ Shape mapping (rectangles, diamonds, circles)
- ✅ Coordinate normalization and layout preservation
- ✅ Enterprise-ready output formatting
