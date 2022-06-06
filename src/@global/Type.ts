type Type_Window = (Window & typeof globalThis) | any;
type Type_HTMLElement = HTMLElement;

type Type_HTMLCanvasElement = HTMLCanvasElement;
type Type_HTMLImageElement = HTMLImageElement;
type Type_CanvasRenderingContext2D = CanvasRenderingContext2D;
type Type_GlobalCompositeOperation = CanvasCompositing["globalCompositeOperation"];
type Type_CanvasImageSource = CanvasImageSource;
type Type_CanvasGradient = CanvasGradient;
type Type_CanvasPattern = CanvasPattern;

type Type_AudioContext = AudioContext;
type Type_GainNode = GainNode;
type Type_AudioBuffer = AudioBuffer;
type Type_AudioBufferSourceNode = AudioBufferSourceNode;

type Type_XMLHttpRequest = XMLHttpRequest;
type Type_XMLHttpRequestResponseType = XMLHttpRequestResponseType;

type Type_ArrayBuffer = ArrayBuffer;

interface Type_Json<T> { [k: string]: T; }

export {
  Type_Window,
  Type_HTMLElement,
  Type_HTMLCanvasElement,
  Type_HTMLImageElement,
  Type_CanvasRenderingContext2D,
  Type_GlobalCompositeOperation,
  Type_CanvasImageSource,
  Type_CanvasGradient,
  Type_CanvasPattern,
  Type_AudioContext,
  Type_GainNode,
  Type_AudioBuffer,
  Type_AudioBufferSourceNode,
  Type_XMLHttpRequest,
  Type_XMLHttpRequestResponseType,
  Type_ArrayBuffer,
  Type_Json
}
