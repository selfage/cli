import { MessageDescriptor, PrimitiveType } from '@selfage/message/descriptor';

export interface Mtime {
  fileName?: string,
  mtimeMs?: number,
}

export let MTIME: MessageDescriptor<Mtime> = {
  name: 'Mtime',
  factoryFn: () => {
    return new Object();
  },
  fields: [
    {
      name: 'fileName',
      primitiveType: PrimitiveType.STRING,
    },
    {
      name: 'mtimeMs',
      primitiveType: PrimitiveType.NUMBER,
    },
  ]
};

export interface MtimeList {
  mtimes?: Array<Mtime>,
}

export let MTIME_LIST: MessageDescriptor<MtimeList> = {
  name: 'MtimeList',
  factoryFn: () => {
    return new Object();
  },
  fields: [
    {
      name: 'mtimes',
      messageDescriptor: MTIME,
      arrayFactoryFn: () => {
        return new Array<any>();
      },
    },
  ]
};
