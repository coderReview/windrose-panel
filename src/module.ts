import { PanelPlugin } from '@grafana/data';
import { WindroseOptions } from './types';
import { WindrosePanel } from './components/WindrosePanel';
import { PLOTLY_SYMBOLS, COLORSCALE_OPTIONS } from './constants';
import { windroseMigrationHandler } from './migration';

const defaultOptions: WindroseOptions = {
  mapping: {
    x: null,
    y: null,
    z: null,
    color: null,
    size: null,
  },
  settings: {
    plot: 'scatter',
    displayModeBar: false,
    marker: {
      size: 15,
      symbol: 'circle',
      color: '#33B5E5',
      colorscale: 'YIOrRd',
      sizemode: 'diameter',
      sizemin: 3,
      sizeref: 0.2,
      showscale: true,
    },
    color_option: 'ramp',
    petals: 32,
    wind_speed_interval: 2,
  },
  layout: {
    autosize: false,
    showlegend: true,
    legend: { orientation: 'v' },
    hovermode: 'closest',
    plot_bgcolor: 'transparent',
    paper_bgcolor: 'transparent',
    font: {
      color: 'rgb(110,110,110)',
      family: '"Open Sans", Helvetica, Arial, sans-serif',
    },
    polar: {
      radialaxis: {
        angle: 90,
        ticksuffix: '%',
      },
      angularaxis: {
        dtick: 22.5,
        rotation: 0,
        direction: 'counterclockwise',
      },
    },
  },
};

export const plugin = new PanelPlugin<WindroseOptions>(WindrosePanel)
  .setDefaults(defaultOptions)
  .setMigrationHandler(windroseMigrationHandler)
  .setPanelOptions((builder) => {
    return builder
      .addFieldNamePicker({
        path: 'mapping.x',
        name: 'Angle (X)',
        description: 'Field for angle/direction',
      })
      .addFieldNamePicker({
        path: 'mapping.y',
        name: 'Distance (Y)',
        description: 'Field for distance/speed',
      })
      .addSelect({
        path: 'settings.plot',
        name: 'Plot type',
        settings: {
          options: [
            { value: 'scatter', label: 'Scatter' },
            { value: 'windrose', label: 'Wind Rose' },
          ],
        },
      })
      .addNumberInput({
        path: 'layout.polar.angularaxis.rotation',
        name: 'Rotation',
        defaultValue: 0,
      })
      .addSelect({
        path: 'layout.polar.angularaxis.direction',
        name: 'Direction',
        settings: {
          options: [
            { value: 'clockwise', label: 'Clockwise' },
            { value: 'counterclockwise', label: 'Counterclockwise' },
          ],
        },
      })
      .addBooleanSwitch({
        path: 'settings.displayModeBar',
        name: 'Toolbar',
        defaultValue: false,
      })
      .addNumberInput({
        path: 'settings.petals',
        name: 'Petals',
        description: 'Number of directional bins for wind rose',
        defaultValue: 32,
        showIf: (opts) => opts.settings?.plot === 'windrose',
      })
      .addNumberInput({
        path: 'settings.wind_speed_interval',
        name: 'Wind speed interval',
        description: 'Bin size for wind speed (m/s)',
        defaultValue: 2,
        showIf: (opts) => opts.settings?.plot === 'windrose',
      })
      .addSelect({
        path: 'settings.marker.symbol',
        name: 'Symbol',
        settings: {
          options: PLOTLY_SYMBOLS.map((s) => ({ value: s, label: s })),
        },
        showIf: (opts) => opts.settings?.plot === 'scatter',
      })
      .addFieldNamePicker({
        path: 'mapping.size',
        name: 'Size (metric)',
        description: 'Field for marker size, or leave empty for fixed size',
        showIf: (opts) => opts.settings?.plot === 'scatter',
      })
      .addNumberInput({
        path: 'settings.marker.size',
        name: 'Marker size (pixels)',
        defaultValue: 15,
        showIf: (opts) => opts.settings?.plot === 'scatter' && !opts.mapping?.size,
      })
      .addNumberInput({
        path: 'settings.marker.sizemin',
        name: 'Size min',
        defaultValue: 3,
        showIf: (opts) => !!(opts.settings?.plot === 'scatter' && opts.mapping?.size),
      })
      .addNumberInput({
        path: 'settings.marker.sizeref',
        name: 'Size ref',
        defaultValue: 0.2,
        showIf: (opts) => !!(opts.settings?.plot === 'scatter' && opts.mapping?.size),
      })
      .addSelect({
        path: 'settings.marker.sizemode',
        name: 'Size mode',
        settings: {
          options: [
            { value: 'diameter', label: 'Diameter' },
            { value: 'area', label: 'Area' },
          ],
        },
        showIf: (opts) => !!(opts.settings?.plot === 'scatter' && opts.mapping?.size),
      })
      .addSelect({
        path: 'settings.color_option',
        name: 'Color',
        settings: {
          options: [
            { value: 'ramp', label: 'Ramp' },
            { value: 'solid', label: 'Solid' },
          ],
        },
        showIf: (opts) => opts.settings?.plot === 'scatter',
      })
      .addColorPicker({
        path: 'settings.marker.color',
        name: 'Solid color',
        showIf: (opts) => opts.settings?.plot === 'scatter' && opts.settings?.color_option === 'solid',
      })
      .addFieldNamePicker({
        path: 'mapping.color',
        name: 'Color metric',
        showIf: (opts) =>
          opts.settings?.plot === 'scatter' && opts.settings?.color_option === 'ramp',
      })
      .addSelect({
        path: 'settings.marker.colorscale',
        name: 'Color scale',
        settings: {
          options: COLORSCALE_OPTIONS,
        },
        showIf: (opts) =>
          opts.settings?.plot === 'scatter' && opts.settings?.color_option !== 'solid',
      })
      .addBooleanSwitch({
        path: 'settings.marker.showscale',
        name: 'Show color scale',
        defaultValue: true,
        showIf: (opts) =>
          opts.settings?.plot === 'scatter' && opts.settings?.color_option !== 'solid',
      });
  });
