import React, { useMemo } from 'react';
import { PanelProps, getFieldDisplayName } from '@grafana/data';
import { PanelDataErrorView } from '@grafana/runtime';
import { useTheme2 } from '@grafana/ui';
import createPlotlyComponent from 'react-plotly.js/factory';
import Plotly from 'plotly.js-dist-min';
import type { WindroseOptions } from '../types';
import { buildDataMapFromDataFrames, processDataToTraces } from '../windroseUtils';

const Plot = createPlotlyComponent(Plotly);

interface Props extends PanelProps<WindroseOptions> {}

type PlotlyTrace = Record<string, unknown>;

const MARGIN = 20;

export const WindrosePanel: React.FC<Props> = ({ options, data, width, height, id, fieldConfig }) => {
  const theme = useTheme2();

  // Stable option fields to avoid unnecessary recomputation when options object reference changes
  const mappingX = options.mapping?.x ?? null;
  const mappingY = options.mapping?.y ?? null;
  const mappingColor = options.mapping?.color ?? null;
  const mappingSize = options.mapping?.size ?? null;
  const plotType = options.settings?.plot ?? 'scatter';
  const petals = options.settings?.petals ?? 32;
  const windSpeedInterval = options.settings?.wind_speed_interval ?? 2;
  const markerSettings = options.settings?.marker;
  const colorOption = options.settings?.color_option ?? 'ramp';
  const displayModeBar = options.settings?.displayModeBar ?? false;
  const layoutPolar = options.layout?.polar;
  const layoutFont = options.layout?.font;
  const layoutLegend = options.layout?.legend;
  const textColor = theme.colors.text.primary;

  const traces = useMemo((): PlotlyTrace[] => {
    if (data.series.length === 0) {
      return [];
    }

    try {
      const dataMap = buildDataMapFromDataFrames(data.series, getFieldDisplayName);
      const fieldNames = Object.keys(dataMap).filter((k) => k !== '@time' && k !== '@index');

      const mapping = {
        ...options.mapping,
        x: mappingX || fieldNames[0] || null,
        y: mappingY || fieldNames[1] || fieldNames[0] || null,
        color: mappingColor || fieldNames[2] || null,
      };

      const opts: WindroseOptions = {
        ...options,
        mapping,
        settings: {
          ...options.settings,
          plot: plotType,
          petals,
          wind_speed_interval: windSpeedInterval,
        },
      };
      return processDataToTraces(dataMap, opts);
    } catch (err) {
      console.error('Windrose data processing error:', err);
      return [];
    }
  }, [
    data,
    mappingX,
    mappingY,
    mappingColor,
    plotType,
    petals,
    windSpeedInterval,
    options,
  ]);

  const tracesWithColorbar = useMemo(() => {
    return traces.map((trace) => {
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
  }, [traces]);

  const plotSize = Math.min(width - 2 * MARGIN, height - 2 * MARGIN);
  const marginLeft = (width - plotSize) / 2;
  const marginRight = (width - plotSize) / 2;
  const marginTop = (height - plotSize) / 2;
  const marginBottom = (height - plotSize) / 2;
  const r = Math.max(MARGIN, marginRight);

  const layout = useMemo(
    () => ({
      ...options.layout,
      width,
      height,
      showlegend: plotType === 'windrose',
      margin: {
        l: Math.max(MARGIN, marginLeft),
        r: Math.max(MARGIN, r),
        t: Math.max(MARGIN, marginTop),
        b: Math.max(MARGIN, marginBottom),
      },
      font: {
        ...layoutFont,
        color: textColor,
      },
      plot_bgcolor: 'transparent',
      paper_bgcolor: 'transparent',
      polar: {
        ...layoutPolar,
        radialaxis: {
          ...layoutPolar?.radialaxis,
          ticksuffix: plotType === 'scatter' ? ' m/s' : '%',
          angle: layoutPolar?.radialaxis?.angle ?? 90,
        },
      },
      legend: {
        ...layoutLegend,
        x: 0.05,
        xanchor: 'right',
        y: 0.95,
        yanchor: 'middle',
      },
    }),
    [
      options.layout,
      width,
      height,
      plotType,
      marginLeft,
      r,
      marginTop,
      marginBottom,
      layoutFont,
      textColor,
      layoutPolar,
      layoutLegend,
    ]
  );

  const config = useMemo(
    () => ({
      showLink: false,
      displaylogo: false,
      displayModeBar,
      modeBarButtonsToRemove: ['sendDataToCloud'] as const,
    }),
    [displayModeBar]
  );

  if (data.series.length === 0) {
    return <PanelDataErrorView fieldConfig={fieldConfig} panelId={id} data={data} needsStringField={false} />;
  }

  if (traces.length === 0) {
    return (
      <div style={{ padding: 20, color: 'var(--text-color)' }}>
        No valid data to display. Ensure you have at least Angle (X) and Distance (Y) metrics configured.
      </div>
    );
  }

  return (
    <Plot
      data={tracesWithColorbar}
      layout={layout}
      config={config}
      style={{ width: `${width}px`, height: `${height}px`, minHeight: 100 }}
    />
  );
};
