export interface Group {
    devicemembership: string[];
    etag: string;
    hidden: boolean;
    name: string;
    isOn: boolean; // custom property pour savoir si le groupe est allumé ou éteint
  }