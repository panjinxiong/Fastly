import * as Quickly from "@quickly";
import * as Global from "@g/Global";
import * as Polygon from "@/geom/Polygon";
import * as Browser from "@/util/Browser";
import * as PerfMon from "@/util/PerfMon";
import * as Util from "@/util/Util";
import { Camera } from "@/display/camera/Camera";
import { Container } from "@/display/nodes/Container";
import { Node } from "@/display/nodes/Node";
import { Particle } from "@/display/particles/Particle";
import { ParticleSystem } from "@/display/particles/ParticleSystem";
import { Drawable } from "@/display/tool/Drawable";
import { TextureAtlas } from "@/display/tool/TextureAtlas";
import { Bitmap } from "@/display/ui/Bitmap";
import { BitmapText } from "@/display/ui/BitmapText";
import { Button } from "@/display/ui/Button";
import { Graphics } from "@/display/ui/Graphics";
import { Sprite } from "@/display/ui/Sprite";
import { Text } from "@/display/ui/Text";
import { Stage } from "@/display/Stage";
import { Event } from "@/event/Event";
import { EventEmitter_Mixins } from "@/event/EventEmitter";
import { Matrix } from "@/geom/Matrix";
import { Rectangle } from "@/geom/Rectangle";
import { Vector } from "@/geom/Vector";
import { WebAudio } from "@/media/WebAudio";
import { Ajax } from "@/net/Ajax";
import { LoadQueue } from "@/resource/LoadQueue";
import { Ticker } from "@/system/Ticker";
import { Ease } from "@/tween/Ease";
import { EaseSports } from "@/tween/EaseSports";
import { Tween } from "@/tween/Tween";

export default {
  Quickly,
  Global,
  "display": {
    Camera,
    Node,
    Container,
    Particle,
    ParticleSystem,
    Drawable,
    TextureAtlas,
    Bitmap,
    BitmapText,
    Button,
    Graphics,
    Sprite,
    Text,
    Stage
  },
  "event": {
    Event,
    EventEmitter_Mixins,
  },
  "geom": {
    Matrix,
    Polygon,
    Rectangle,
    Vector,
  },
  "media": {
    WebAudio,
  },
  "net": {
    Ajax,
  },
  "resource": {
    LoadQueue,
  },
  "system": {
    Ticker,
  },
  "tween": {
    Ease,
    EaseSports,
    Tween,
  },
  "util": {
    Browser,
    Util,
    PerfMon,
  }
};
