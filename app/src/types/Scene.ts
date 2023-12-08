export interface SceneInfo {
    lights: string[];
    name: string;
    transitiontime: number;
    id: string; // needed for schedule
}

export interface Scene {
    [id: number]: SceneInfo;
}
