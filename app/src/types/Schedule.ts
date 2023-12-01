export interface Schedule {
    autodelete: boolean;
    command: {
      address: string;
      method: string;
      body?: Record<string, any>;
    };
    description: string;
    etag: string;
    name: string;
    status: string;
    time: string;
    id: string; // Ajout de l'id pour le front
}