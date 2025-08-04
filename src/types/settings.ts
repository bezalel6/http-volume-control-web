export interface ProcessSettings {
  whitelist: string[];
  mode: 'whitelist' | 'all';
}

export interface Settings {
  processes: ProcessSettings;
}