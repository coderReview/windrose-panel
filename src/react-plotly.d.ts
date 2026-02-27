declare module 'react-plotly.js/factory' {
  import type { ComponentType } from 'react';

  interface PlotParams {
    data: unknown[];
    layout?: Record<string, unknown>;
    config?: Record<string, unknown>;
    frames?: unknown[];
    revision?: number;
    style?: React.CSSProperties;
    className?: string;
    useResizeHandler?: boolean;
    onInitialized?: (figure: unknown, graphDiv: HTMLElement) => void;
    onUpdate?: (figure: unknown, graphDiv: HTMLElement) => void;
    onPurge?: (figure: unknown, graphDiv: HTMLElement) => void;
    onError?: (err: Error) => void;
  }

  function createPlotlyComponent(Plotly: unknown): ComponentType<PlotParams>;
  export default createPlotlyComponent;
}
