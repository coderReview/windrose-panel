import type { WindroseOptions } from './types';

export interface DataSeries {
  name: string;
  points: number[] | string[] | boolean[];
  type: string;
}

export type PlotlyTrace = Record<string, unknown>;

export interface ProcessedData {
  data: Record<string, DataSeries & { idx?: number; missing?: number }>;
  traces: PlotlyTrace[];
}

function expandToFan(angArr: number[], rArr: number[]): [number[], number[]] {
  const ptNum = 15;
  const angArr360 = angArr.slice();
  angArr360.push(360);
  const newAngArr: number[] = [];
  const newRArr: number[] = [];
  for (let p = 0; p < angArr.length; p++) {
    const dAng = (angArr360[p + 1] - angArr[p]) / ptNum;
    for (let i = 0; i < ptNum; i++) {
      newAngArr.push(angArr[p] + dAng * i);
      newRArr.push(rArr[p]);
    }
    newAngArr.push(0);
    newRArr.push(0);
  }
  return [newAngArr, newRArr];
}

export function processDataToTraces(
  dataMap: Record<string, DataSeries & { idx?: number; missing?: number }>,
  options: WindroseOptions
): PlotlyTrace[] {
  const { mapping, settings } = options;
  const xKey = mapping.x || Object.keys(dataMap).find((k) => k !== '@time' && k !== '@index');
  let dX = xKey ? dataMap[xKey] : undefined;
  let dY = mapping.y ? dataMap[mapping.y] : undefined;

  if (!dX) {
    throw new Error('Unable to find X: ' + (mapping.x || 'no field selected'));
  }
  if (!dY) {
    dY = dX;
    const timeData = dataMap['@time'];
    if (timeData?.points?.length) {
      dX = timeData;
    }
  }

  const trace: PlotlyTrace = {
    type: 'scatterpolar',
    fill: 'none',
  };

  if (settings.plot === 'scatter') {
    trace.name = dY.name;
    trace.theta = dX.points as number[];
    trace.r = dY.points as number[];
    trace.mode = 'markers';
    trace.marker = { ...settings.marker } as Record<string, unknown>;

    if (mapping.size && dataMap[mapping.size]) {
      (trace.marker as Record<string, unknown>).size = dataMap[mapping.size].points as number[];
    }

    if (settings.color_option === 'ramp') {
      const colorField = mapping.color || '@index';
      const dC = dataMap[colorField];
      if (dC) {
        (trace.marker as Record<string, unknown>).color = dC.points as number[];
      }
    }

    return [trace];
  }

  if (settings.plot === 'windrose') {
    // Match fatcloud windrose-panel: classify points into n directions, compute m speed bins
    const theta = dX.points as number[];
    const r = dY.points as number[];
    const numPoints = theta.length;
    const numAngle = settings.petals;
    const angle = 360 / numAngle;

    const pointsOnDir: number[][] = [];
    for (let i = 0; i < numAngle; i++) {
      pointsOnDir.push([]);
    }

    for (let p = 0; p < numPoints; p++) {
      const angleIdx = ((Math.floor(theta[p] / angle + 0.5) % numAngle) + numAngle) % numAngle;
      pointsOnDir[angleIdx].push(r[p]);
    }

    const maxSpeed = r.length > 0 ? r.reduce((a, b) => Math.max(a, b), r[0]) : 0;
    const binSize = settings.wind_speed_interval;
    const binNum = Math.ceil(maxSpeed / binSize);
    const speedLevels: number[] = [];
    for (let binIdx = 0; binIdx <= binNum; binIdx++) {
      speedLevels.push(binSize * binIdx);
    }

    const baseLengths: number[] = new Array(numAngle).fill(0);
    const petals: number[][] = [];

    for (let binIdx = 0; binIdx < binNum; binIdx++) {
      petals.push([]);
      for (let angleIdx = 0; angleIdx < numAngle; angleIdx++) {
        const pts = pointsOnDir[angleIdx];
        let binCounter = 0;
        for (let idx = 0; idx < pts.length; idx++) {
          if (pts[idx] >= speedLevels[binIdx] && pts[idx] < speedLevels[binIdx + 1]) {
            binCounter++;
          }
        }
        const totalLength = pts.length / numPoints;
        const deltaLength = pts.length > 0 ? (binCounter / pts.length) * totalLength : 0;
        baseLengths[angleIdx] += 100 * deltaLength;
        petals[binIdx].push(baseLengths[angleIdx]);
      }
    }

    const baseThetas: number[] = [];
    for (let angleIdx = 0; angleIdx < numAngle; angleIdx++) {
      baseThetas.push(angleIdx * angle - 0.5 * angle);
    }

    const traceData: Array<{ theta: number[]; r: number[] }> = [];
    for (let i = 0; i < binNum; i++) {
      const [angs, rVals] = expandToFan(baseThetas, petals[i]);
      traceData.push({ theta: angs, r: rVals });
    }

    const traces: PlotlyTrace[] = [];
    for (let binIdx = 0; binIdx < binNum; binIdx++) {
      const lowerLevel = speedLevels[binIdx];
      const upperLevel = speedLevels[binIdx + 1];
      const hue = binNum > 1 ? 255 * (1 - binIdx / (binNum - 1)) : 255;
      traces.unshift({
        type: 'scatterpolar',
        mode: 'lines',
        name: `${lowerLevel} - ${upperLevel} m/s`,
        theta: traceData[binIdx].theta,
        r: traceData[binIdx].r,
        fill: 'toself',
        opacity: 1,
        line: { color: 'rgb(0,0,0)', width: 0 },
        fillcolor: `hsl(${hue},100%,60%)`,
      });
    }
    return traces;
  }

  return [];
}

import type { DataFrame, Field } from '@grafana/data';

export function buildDataMapFromDataFrames(
  frames: DataFrame[],
  getFieldDisplayName: (field: Field, frame?: DataFrame) => string
): Record<string, DataSeries & { idx?: number; missing?: number }> {
  const data: Record<string, DataSeries & { idx?: number; missing?: number }> = {};

  if (frames.length === 0) {
    return data;
  }

  const key = { name: '@time', type: 'ms', missing: 0, idx: -1, points: [] as number[] };
  const idx = { name: '@index', type: 'number', missing: 0, idx: -1, points: [] as number[] };
  data[key.name] = key;
  data[idx.name] = idx;

  let seriesIdx = 0;
  for (const frame of frames) {
    const fields = frame.fields;
    const timeField = fields.find((f) => f.name === 'Time' || String(f.type) === '1');
    const timeValues = timeField?.values ? Array.from(timeField.values as Iterable<number>) : [];
    const valueFields = fields.filter((f) => f !== timeField && f.values);

    for (let i = 0; i < valueFields.length; i++) {
      const field = valueFields[i];
      const name = getFieldDisplayName(field, frame);
      const values = field.values ? Array.from(field.values as Iterable<unknown>) : [];
      let fieldType = 'number';
      if (values.length > 0) {
        if (typeof values[0] === 'string') {
          fieldType = 'string';
        } else if (typeof values[0] === 'boolean') {
          fieldType = 'boolean';
        }
      }

      const val = {
        name,
        type: fieldType,
        missing: 0,
        idx: seriesIdx,
        points: values as number[] | string[] | boolean[],
      };

      data[name] = val;
      seriesIdx++;

      if (key.points.length === 0 && values.length > 0) {
        for (let j = 0; j < values.length; j++) {
          key.points.push(timeValues[j] ?? j);
          idx.points.push(j);
        }
      }
    }
  }

  return data;
}
