type MovingAverageData = {
  series: number[],
  seriesMax: number,
  lastAverage: number
}

export function isMovingAverageDataFormat(obj:any):boolean {
  return obj &&
    Array.isArray(obj.series) &&
    typeof obj.seriesMax === 'number' &&
    typeof obj.lastAverage === 'number' &&
    obj.series.every((val:any) => typeof val === 'number');
}

export default MovingAverageData;