# WindRose Panel for Grafana

A Grafana panel plugin for windrose and scatter polar visualizations using Plotly.

![Grafana Dependency](https://img.shields.io/badge/dynamic/json?logo=grafana&query=%24.grafanaDependency&url=https%3A%2F%2Fgrafana.com%2Fapi%2Fplugins%2Fcoder-windrose-panel&label=Grafana)
![Downloads](https://img.shields.io/badge/dynamic/json?logo=grafana&query=%24.downloads&url=https%3A%2F%2Fgrafana.com%2Fapi%2Fplugins%2Fcoder-windrose-panel&label=Downloads)

## Overview

WindRose Panel provides polar chart visualizations for wind and directional data in Grafana dashboards. It supports two plot types:

- **Scatter polar**: Plot angle vs distance (e.g., wind direction vs speed) with configurable markers, colors, and size. Ideal for raw data points.
- **Wind rose**: Classify data into directional bins and display as a polar histogram. Ideal for aggregated wind frequency analysis.

Both modes use polar coordinates to visualize directional data effectively.

## Requirements

- **Grafana**: 11.0.0 or higher
- **Data**: Time series or table data with at least two numeric fields (angle/direction and distance/speed)

## Getting Started

### Installation

**From Grafana catalog** (when published):

```bash
grafana cli plugins install coder-windrose-panel
```

**From ZIP URL**:

```bash
grafana cli --pluginUrl https://example.com/coder-windrose-panel-1.0.0.zip plugins install coder-windrose-panel
```

**Manual installation**:

1. Build the plugin:
   ```bash
   npm install
   npm run build
   ```
2. Copy the `dist` folder contents into `coder-windrose-panel` inside your Grafana plugins directory:
   - **Linux**: `/var/lib/grafana/plugins/`
   - **macOS**: `/usr/local/var/lib/grafana/plugins/` (or `$GF_PATHS_PLUGINS`)
   - **Windows**: `<grafana-install-dir>\data\plugins\`
3. Restart Grafana.

### Configuration

1. Add a new panel and select **WindRose Panel**.
2. Configure your data source query to return at least two numeric fields.
3. In the panel options, map the fields:
   - **Angle (X)**: Field for direction/angle (e.g., wind direction in degrees, 0–360).
   - **Distance (Y)**: Field for magnitude (e.g., wind speed in m/s).

### Plot Types

**Scatter** (default):

- Maps each data point as a marker in polar coordinates.
- Options: marker symbol, size (fixed or from a metric), color (solid or ramp from a metric), color scale.
- Use when you want to see individual measurements.

**Wind Rose**:

- Bins data by direction and speed, then displays as stacked polar segments.
- Options: number of petals (directional bins), wind speed interval (bin size in m/s).
- Use when you want frequency distribution by direction and speed.

### Additional Options

- **Rotation**: Rotate the angular axis (e.g., to align 0° with North).
- **Direction**: Clockwise or counterclockwise for angular axis.
- **Toolbar**: Show or hide the Plotly mode bar (zoom, pan, etc.).

## Development

### Prerequisites

- Node.js 22 or higher
- npm 10.x

### Build and Run

```bash
# Install dependencies
npm install

# Development build (watch mode)
npm run dev

# Production build
npm run build

# Run Grafana with the plugin (Docker)
npm run server

# Lint and type check
npm run lint
npm run typecheck
```

### Project Structure

- `src/components/WindrosePanel.tsx` – Main panel component
- `src/windroseUtils.ts` – Data processing for scatter and wind rose
- `src/module.ts` – Plugin registration and options
- `src/types.ts` – TypeScript interfaces

## Documentation

- [Grafana Plugin Development](https://grafana.com/developers/plugins/)
- [Plotly.js Polar Charts](https://plotly.com/javascript/polar-chart/)

## Contributing

Contributions are welcome. Please open an issue or pull request in the repository.
