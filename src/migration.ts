import type { PanelModel } from '@grafana/data';
import type { WindroseOptions } from './types';

interface LegacyPconfig {
  mapping?: {
    x?: string | null;
    y?: string | null;
    z?: string | null;
    color?: string | null;
    size?: string | null;
  };
  settings?: {
    plot?: 'scatter' | 'windrose';
    displayModeBar?: boolean;
    marker?: {
      size?: number;
      symbol?: string;
      color?: string;
      colorscale?: string;
      sizemode?: 'diameter' | 'area';
      sizemin?: number;
      sizeref?: number;
      showscale?: boolean;
    };
    color_option?: 'ramp' | 'solid';
    petals?: number;
    wind_speed_interval?: number;
  };
  layout?: {
    autosize?: boolean;
    showlegend?: boolean;
    legend?: { orientation?: string };
    hovermode?: string;
    plot_bgcolor?: string;
    paper_bgcolor?: string;
    font?: {
      color?: string;
      family?: string;
    };
    polar?: {
      radialaxis?: {
        angle?: number;
        ticksuffix?: string;
      };
      angularaxis?: {
        dtick?: number;
        rotation?: number;
        direction?: 'clockwise' | 'counterclockwise';
      };
    };
  };
}

export function migratePconfigToOptions(pconfig: LegacyPconfig): Partial<WindroseOptions> {
  return {
    mapping: {
      x: pconfig.mapping?.x ?? null,
      y: pconfig.mapping?.y ?? null,
      z: pconfig.mapping?.z ?? null,
      color: pconfig.mapping?.color ?? null,
      size: pconfig.mapping?.size ?? null,
    },
    settings: {
      plot: pconfig.settings?.plot ?? 'scatter',
      displayModeBar: pconfig.settings?.displayModeBar ?? false,
      marker: {
        size: pconfig.settings?.marker?.size ?? 15,
        symbol: pconfig.settings?.marker?.symbol ?? 'circle',
        color: pconfig.settings?.marker?.color ?? '#33B5E5',
        colorscale: pconfig.settings?.marker?.colorscale ?? 'YIOrRd',
        sizemode: pconfig.settings?.marker?.sizemode ?? 'diameter',
        sizemin: pconfig.settings?.marker?.sizemin ?? 3,
        sizeref: pconfig.settings?.marker?.sizeref ?? 0.2,
        showscale: pconfig.settings?.marker?.showscale ?? true,
      },
      color_option: pconfig.settings?.color_option ?? 'ramp',
      petals: pconfig.settings?.petals ?? 32,
      wind_speed_interval: pconfig.settings?.wind_speed_interval ?? 2,
    },
    layout: {
      autosize: pconfig.layout?.autosize ?? false,
      showlegend: pconfig.layout?.showlegend ?? true,
      legend: { orientation: pconfig.layout?.legend?.orientation ?? 'v' },
      hovermode: pconfig.layout?.hovermode ?? 'closest',
      plot_bgcolor: pconfig.layout?.plot_bgcolor ?? 'transparent',
      paper_bgcolor: pconfig.layout?.paper_bgcolor ?? 'transparent',
      font: {
        color: pconfig.layout?.font?.color ?? 'rgb(110,110,110)',
        family: pconfig.layout?.font?.family ?? '"Open Sans", Helvetica, Arial, sans-serif',
      },
      polar: {
        radialaxis: {
          angle: pconfig.layout?.polar?.radialaxis?.angle ?? 90,
          ticksuffix: pconfig.layout?.polar?.radialaxis?.ticksuffix ?? '%',
        },
        angularaxis: {
          dtick: pconfig.layout?.polar?.angularaxis?.dtick ?? 22.5,
          rotation: pconfig.layout?.polar?.angularaxis?.rotation ?? 0,
          direction: pconfig.layout?.polar?.angularaxis?.direction ?? 'counterclockwise',
        },
      },
    },
  };
}

export function windroseMigrationHandler(panel: PanelModel<WindroseOptions>): Partial<WindroseOptions> {
  const pconfig = (panel as unknown as { pconfig?: LegacyPconfig }).pconfig;
  if (pconfig) {
    return migratePconfigToOptions(pconfig);
  }
  return panel.options ?? {};
}
