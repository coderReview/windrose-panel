import React, { useEffect, useRef, useMemo } from 'react';
import { PanelProps, getFieldDisplayName } from '@grafana/data';
import { PanelDataErrorView } from '@grafana/runtime';
import { useTheme2 } from '@grafana/ui';
import Plotly from 'plotly.js-dist-min';
import type { WindroseOptions } from '../types';
import { buildDataMapFromDataFrames, processDataToTraces } from '../windroseUtils';

interface Props extends PanelProps<WindroseOptions> {}

type PlotlyTrace = Record<string, unknown>;

const MARGIN = 20;

export const WindrosePanel: React.FC<Props> = ({ options, data, width, height, id, fieldConfig }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const plotRef = useRef<Plotly.PlotlyHTMLElement | null>(null);
  const theme = useTheme2();

  const traces = useMemo((): PlotlyTrace[] => {
    if (data.series.length === 0) {
      return [];
    }

    try {
      console.log('[Windrose] data:', data);
      const dataMap = buildDataMapFromDataFrames(data.series, getFieldDisplayName);
      const fieldNames = Object.keys(dataMap).filter((k) => k !== '@time' && k !== '@index');
      console.log('[Windrose] data:', { seriesCount: data.series.length, fields: fieldNames });

      const mapping = {
        ...options.mapping,
        x: options.mapping.x || fieldNames[0] || null,
        y: options.mapping.y || fieldNames[1] || fieldNames[0] || null,
        color: options.mapping.color || fieldNames[2] || null,
      };

      const opts = { ...options, mapping };
      return processDataToTraces(dataMap, opts);
    } catch (err) {
      console.error('Windrose data processing error:', err);
      return [];
    }
  }, [data.series, options]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || traces.length === 0) return;

    const plotSize = Math.min(
      width - 2 * MARGIN,
      height - 2 * MARGIN
    );
    const marginLeft = (width - plotSize) / 2;
    const marginRight = (width - plotSize) / 2;
    const marginTop = (height - plotSize) / 2;
    const marginBottom = (height - plotSize) / 2;

    const r = Math.max(MARGIN, marginRight);

    const tracesWithColorbar = traces.map((trace) => {
      const marker = trace.marker as Record<string, unknown> | undefined;
      if (marker?.showscale) {
        return {
          ...trace,
          marker: {
            ...marker,
            colorbar: {
              ...(typeof marker.colorbar === 'object' && marker.colorbar !== null
                ? (marker.colorbar as Record<string, unknown>)
                : {}),
              x: 1.1,
              xanchor: 'left',
              xpad: 20,
            },
          },
        };
      }
      return trace;
    });

    const plotType = options.settings?.plot ?? 'scatter';
    const showlegend = plotType === 'windrose';
    const radialTicksuffix = plotType === 'scatter' ? ' m/s' : '%';

    const layout: Partial<Plotly.Layout> = {
      ...options.layout,
      width,
      height,
      showlegend,
      margin: {
        l: Math.max(MARGIN, marginLeft),
        r: Math.max(MARGIN, r),
        t: Math.max(MARGIN, marginTop),
        b: Math.max(MARGIN, marginBottom),
      },
      font: {
        ...options.layout.font,
        color: theme.colors.text.primary,
      },
      plot_bgcolor: 'transparent',
      paper_bgcolor: 'transparent',
      polar: {
        ...(options.layout.polar ?? {}),
        radialaxis: {
          ...(options.layout.polar?.radialaxis ?? {}),
          ticksuffix: radialTicksuffix,
          angle: options.layout.polar?.radialaxis?.angle ?? 90,
        },
      },
      legend: {
        ...options.layout.legend,
        x: 0.05,
        xanchor: 'right',
        y: 0.95,
        yanchor: 'middle',
      },
    };

    const plotOptions: Partial<Plotly.PlotConfig> = {
      showLink: false,
      displaylogo: false,
      displayModeBar: options.settings.displayModeBar,
      modeBarButtonsToRemove: ['sendDataToCloud'],
    };

    if (!plotRef.current) {
      Plotly.newPlot(container, tracesWithColorbar, layout, plotOptions);
      plotRef.current = container as Plotly.PlotlyHTMLElement;
    } else {
      Plotly.react(container, tracesWithColorbar, layout, plotOptions);
    }

    return () => {
      if (container && plotRef.current === container) {
        Plotly.purge(container);
        plotRef.current = null;
      }
    };
  }, [traces, options, width, height, theme.colors.text.primary]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !plotRef.current) return;

    Plotly.Plots.resize(container as Plotly.PlotlyHTMLElement);
  }, [width, height]);

  if (data.series.length === 0) {
    return (
      <PanelDataErrorView
        fieldConfig={fieldConfig}
        panelId={id}
        data={data}
        needsStringField={false}
      />
    );
  }

  if (traces.length === 0) {
    return (
      <div style={{ padding: 20, color: 'var(--text-color)' }}>
        No valid data to display. Ensure you have at least Angle (X) and Distance (Y) metrics configured.
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        minHeight: 100,
      }}
    />
  );
};
