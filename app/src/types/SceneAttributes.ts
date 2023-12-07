interface Attributes {
    bri: number;
    colormode: string;
    ct?: number;
    id: string;
    on: boolean;
    transitiontime: number;
    x?: number;
    y?: number;
}

export interface SceneAttributes {
    lights: Attributes[];
    name: string;
    state: number;
}
