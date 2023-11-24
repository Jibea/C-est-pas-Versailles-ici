interface Light {
  etag: string;
  hascolor: boolean;
  manufacturername: string;
  modelid: string;
  name: string;
  pointsymbol: Record<string, unknown>;
  state: {
    alert: string;
    bri: number;
    colormode: string;
    ct: number;
    effect: string;
    hue: number;
    on: boolean;
    reachable: boolean;
    sat: number;
    xy: [number, number];
  };
  swversion: string;
  type: string;
  uniqueid: string;
}

interface LightsApiResponse {
  [key: string]: Light;
}