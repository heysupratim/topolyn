/// <reference types="vite/client" />

/**
 * Type definitions for html-to-image
 * https://github.com/bubkoo/html-to-image
 */
declare module "html-to-image" {
  export interface Options {
    /**
     * Width in pixels to be applied to node before rendering.
     */
    width?: number;
    /**
     * Height in pixels to be applied to node before rendering.
     */
    height?: number;
    /**
     * A string value for the background color, any valid CSS color value.
     */
    backgroundColor?: string;
    /**
     * Width in pixels to be applied to canvas on export.
     */
    canvasWidth?: number;
    /**
     * Height in pixels to be applied to canvas on export.
     */
    canvasHeight?: number;
    /**
     * An object whose properties to be copied to node's style before rendering.
     */
    style?: Partial<CSSStyleDeclaration>;
    /**
     * A function taking DOM node as argument. Should return `true` if passed
     * node should be included in the output. Excluding node means excluding
     * it's children as well.
     */
    filter?: (node: HTMLElement) => boolean;
    /**
     * A number between `0` and `1` indicating image quality (e.g. 0.92 => 92%)
     * of the JPEG image.
     */
    quality?: number;
    /**
     * A function that runs before the download.
     */
    onclone?: (node: HTMLElement) => void;
    /**
     * A function that runs after the downnload.
     */
    oncomplete?: () => void;
    /**
     * A string indicating the image format. The default type is image/png.
     */
    type?: string;
    /**
     * The pixel ratio of the captured image. Default is the actual pixel ratio of the device.
     */
    pixelRatio?: number;
    /**
     * Set to true to append the current time as a query string to the URL.
     */
    cacheBust?: boolean;
  }

  /**
   * Converts the given DOM node to a PNG image URL.
   */
  export function toPng(node: HTMLElement, options?: Options): Promise<string>;

  /**
   * Converts the given DOM node to a JPEG image URL.
   */
  export function toJpeg(node: HTMLElement, options?: Options): Promise<string>;

  /**
   * Converts the given DOM node to a SVG image URL.
   */
  export function toSvg(node: HTMLElement, options?: Options): Promise<string>;

  /**
   * Converts the given DOM node to a blob.
   */
  export function toBlob(node: HTMLElement, options?: Options): Promise<Blob>;

  /**
   * Converts the given DOM node to a canvas.
   */
  export function toCanvas(
    node: HTMLElement,
    options?: Options,
  ): Promise<HTMLCanvasElement>;

  /**
   * Converts the given DOM node to a pixel data URL.
   */
  export function toPixelData(
    node: HTMLElement,
    options?: Options,
  ): Promise<Uint8ClampedArray>;
}
