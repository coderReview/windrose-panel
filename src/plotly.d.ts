declare module 'plotly.js-dist-min' {
  namespace Plotly {
    interface PlotlyHTMLElement extends HTMLElement {}
    interface Layout {}
    interface PlotConfig {}
  }
  const Plotly: {
    newPlot: (element: HTMLElement, data: unknown[], layout?: unknown, config?: unknown) => Promise<void>;
    react: (element: HTMLElement, data: unknown[], layout?: unknown, config?: unknown) => Promise<void>;
    purge: (element: HTMLElement) => void;
    Plots: {
      resize: (element: HTMLElement) => void;
    };
  };
  export default Plotly;
}
