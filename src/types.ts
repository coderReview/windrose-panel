export interface WindroseMapping {
  x: string | null;
  y: string | null;
  z?: string | null;
  color?: string | null;
  size?: string | null;
}

export interface WindroseMarkerSettings {
  size: number;
  symbol: string;
  color: string;
  colorscale: string;
  sizemode: 'diameter' | 'area';
  sizemin: number;
  sizeref: number;
  showscale: boolean;
}

export interface WindroseLayoutPolar {
  radialaxis: {
    angle: number;
    ticksuffix: string;
  };
  angularaxis: {
    dtick: number;
    rotation: number;
    direction: 'clockwise' | 'counterclockwise';
  };
}

export interface WindroseLayout {
  autosize: boolean;
  showlegend: boolean;
  legend: { orientation: string };
  hovermode: string;
  plot_bgcolor: string;
  paper_bgcolor: string;
  font: {
    color: string;
    family: string;
  };
  polar: WindroseLayoutPolar;
}

export interface WindroseSettings {
  plot: 'scatter' | 'windrose';
  displayModeBar: boolean;
  marker: WindroseMarkerSettings;
  color_option: 'ramp' | 'solid';
  petals: number;
  wind_speed_interval: number;
}

export interface WindroseOptions {
  mapping: WindroseMapping;
  settings: WindroseSettings;
  layout: WindroseLayout;
}
