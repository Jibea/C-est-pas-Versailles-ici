interface SceneInfo {
    lights: string[];
    name: string;
    transitiontime: number;
}

export interface Scene {
    [id: number]: SceneInfo;
}
