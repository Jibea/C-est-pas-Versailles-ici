interface SceneInfo {
    lights: string[];
    name: string;
    transitiontime: number;
    id: string; // my creation caus i need it for schedule
}

export interface Scene {
    [id: number]: SceneInfo;
}
