export interface ScratchProjectObject {
  targets: Target[];
  monitors: any[];
  extensions: any[];
  meta: Meta;
}

export interface Meta {
  semver: string;
  vm: string;
  agent: string;
}

export interface Target {
  isStage: boolean;
  name: string;
  variables: Variables;
  lists: any;
  broadcasts: any;
  blocks: Blocks;
  comments: any;
  currentCostume: number;
  costumes: Costume[];
  sounds: Sound[];
  volume: number;
  layerOrder: number;
  tempo?: number;
  videoTransparency?: number;
  videoState?: string;
  textToSpeechLanguage?: null;
  visible?: boolean;
  x?: number;
  y?: number;
  size?: number;
  direction?: number;
  draggable?: boolean;
  rotationStyle?: string;
}

export interface Blocks {
  [key: string]: Block;
}

export interface Block {
  opcode: string;
  next: string;
  parent: string | null;
  inputs: Inputs;
  fields: any;
  shadow: boolean;
  topLevel: boolean;
  x: number;
  y: number;
}

export interface Inputs {
  [key: string]: any;
}

export interface Costume {
  name: string;
  dataFormat: string;
  assetId: string;
  md5ext: string;
  rotationCenterX: number;
  rotationCenterY: number;
  bitmapResolution?: number;
}

export interface Sound {
  name: string;
  assetId: string;
  dataFormat: string;
  format: string;
  rate: number;
  sampleCount: number;
  md5ext: string;
}

export interface Variables {
  [key: string]: Array<number | string>;
}
