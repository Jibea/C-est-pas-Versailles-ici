export interface Group {
    action: {
      bri: number;
      ct: number;
      effect: string;
      hue: number;
      on: boolean;
      sat: number;
      xy: [number, number];
    };
    devicemembership: string[];
    etag: string;
    hidden: boolean;
    id: string;
    lights: string[];
    lightsequence: string[];
    multideviceids: string[];
    name: string;
    scenes: { id: string; name: string }[];
    state: number;
  }