# WindRose Panel for Grafana

A Grafana panel plugin for windrose and scatter polar visualizations using Plotly.

## Features

- **Scatter polar**: Plot angle vs distance with configurable markers, colors, and size
- **Wind rose**: Classify data into directional bins and display as polar histogram

## Installation

### Using Grafana CLI

If the plugin is published to the Grafana catalog:

```bash
grafana cli plugins install coder-windrose-panel
```

To install from a ZIP file URL:

```bash
grafana cli --pluginUrl https://example.com/coder-windrose-panel-1.0.0.zip plugins install coder-windrose-panel
```

Restart Grafana after installation.

### Manual installation

1. Build the plugin:

   ```bash
   npm install
   npm run build
   ```

2. Copy the `dist` folder contents into a new folder named `coder-windrose-panel` inside your Grafana plugins directory:

   - **Linux**: `/var/lib/grafana/plugins/`
   - **macOS**: `/usr/local/var/lib/grafana/plugins/` (or `$GF_PATHS_PLUGINS` if set)
   - **Windows**: `<grafana-install-dir>\data\plugins\`

   ```bash
   cp -r dist /var/lib/grafana/plugins/coder-windrose-panel
   ```

3. Restart Grafana.

## Development

### Build

1. Install dependencies

   ```bash
   npm install
   ```

2. Build plugin in development mode (watch)

   ```bash
   npm run dev
   ```

3. Build plugin for production

   ```bash
   npm run build
   ```

4. Run Grafana with the plugin (Docker)

   ```bash
   npm run server
   ```

5. Lint and typecheck

   ```bash
   npm run lint
   npm run typecheck
   ```
