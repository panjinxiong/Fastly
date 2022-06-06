import { Type_Json, Type_HTMLImageElement } from "@g/Type";
import { Rectangle_FmtArr } from "@/geom/Rectangle";

type FramesSprites = Frames & Sprites;
type Frames = {
  image: Type_HTMLImageElement;
  rect: Rectangle_FmtArr;
};
type Sprites = {
  name?: string | null;
  duration?: number;
  stop?: boolean;
  next?: string | null;
  callback?: () => void;
};
type TextureAtlasCtorParam = [
  {
    image: Type_HTMLImageElement;
    width: number;
    height: number;
    frames: Rectangle_FmtArr[] | { frameWidth: number; frameHeight: number; numFrames: number };
    sprites: Type_Json<
      | number
      | (number | ({ framesIndex: number } & Sprites))[]
      | ({ from: number; to: number } & { [k: string]: Sprites })
    >;
  }
];

/**
 * 解析纹理集帧数据
 * @param atlasData 构造数据
 * @return 帧数据
 **/
function ParseTextureFrames(atlasData: TextureAtlasCtorParam[0]): Frames[] | null {
  let frameData = atlasData.frames;
  let frames: any = [];

  if (!frameData) return null;

  if (frameData instanceof Array) {
    for (let i = 0; i < frameData.length; i++) {
      frames[i] = {
        image: atlasData.image,
        rect: frameData[i],
      };
    }
  } else {
    let frameWidth = frameData.frameWidth;
    let frameHeight = frameData.frameHeight;
    let cols = (atlasData.width / frameWidth) | 0;  // | 0:取下
    let rows = (atlasData.height / frameHeight) | 0;
    let numFrames = frameData.numFrames || cols * rows;

    for (let i = 0; i < numFrames; i++) {
      frames[i] = {
        image: atlasData.image,
        rect: [(i % cols) * frameWidth, ((i / cols) | 0) * frameHeight, frameWidth, frameHeight],
      };
    }
  }

  return frames;
}

/**
 * 结合帧数据和精灵数据
 * @param frame 帧数据
 * @param sprite 精灵数据
 * @return 结合数据
 **/
function ToFrameSprite(frame: Frames, sprite?: Sprites): FramesSprites {
  let frameSprite: any = {
    image: frame.image,
    rect: frame.rect
  };

  if (sprite) {
    frameSprite.name = sprite.name || null;
    frameSprite.duration = sprite.duration || 0;
    frameSprite.stop = !!sprite.stop;
    frameSprite.next = sprite.next !== undefined ? sprite.next : null;
    frameSprite.callback = sprite.callback || null;
  }

  return frameSprite;
}

/**
 * 解析精灵数据
 * @param atlasData 构造数据
 * @param frames 纹理集帧数据
 * @return 精灵数据
 **/
function ParseTextureSprites(atlasData: TextureAtlasCtorParam[0], frames: Frames[]): Type_Json<FramesSprites> | null {
  let spriteData = atlasData.sprites;
  let frameSpritesJson: any = {};

  if (!spriteData) return null;

  for (let s in spriteData) {
    let frameSprites: any = [];
    let sprite: any = spriteData[s];

    if (typeof sprite === "number") {
      frameSprites = ToFrameSprite(frames[sprite]);
    } else if (sprite instanceof Array) {
      for (let i = 0; i < sprite.length; i++) {
        let mySprite = sprite[i];

        if (typeof mySprite === "number") frameSprites[i] = ToFrameSprite(frames[mySprite]);
        else frameSprites[i] = ToFrameSprite(frames[mySprite.framesIndex], mySprite);
      }
    } else {
      for (let i = sprite.from; i <= sprite.to; i++) {
        frameSprites[i - sprite.from] = ToFrameSprite(frames[i], sprite[i]);
      }
    }

    frameSpritesJson[s] = frameSprites;
  }

  return frameSpritesJson;
}

/**
 * TextureAtlas纹理集是将许多小的纹理图片整合到一起的一张大图
 **/
class TextureAtlas {
  /** 纹理集帧数据 */
  private _frames: Frames[] | null = null;
  /** 纹理集精灵动画 */
  private _sprites: Type_Json<FramesSprites> | null = null;

  /**
   * @param props 初始化参数
   **/
  public constructor(props: TextureAtlasCtorParam[0]) {
    this._frames = ParseTextureFrames(props);
    this._frames && (this._sprites = ParseTextureSprites(props, this._frames));
  }
  /**
   * 获取指定索引位置index的帧数据
   * @param index 要获取帧的索引位置
   * @return 帧数据
   **/
  public getFrame(index: number): Frames | null {
    let frames = this._frames;
    return frames && frames[index];
  }
  /**
   * 获取指定id的精灵数据
   * @param id 要获取精灵的id
   * @return 精灵数据
   **/
  public getSprite(id: string): FramesSprites | null {
    let sprites = this._sprites;
    return sprites && sprites[id];
  }
}

export {
  FramesSprites as TextureAtlas_FramesSprites,
  TextureAtlas
}
