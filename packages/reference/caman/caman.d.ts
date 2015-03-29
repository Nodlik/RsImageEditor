interface PixelRGB {
    red: number;
    green: number;
    blue: number;
}

interface CamanObject {
    brightness(brightness: number): void;
    vibrance(vibrance: number): void;
    hue(hue: number): void;
    gamma(gamma: number): void;
    clip(clip: number): void;
    stackBlur(stackBlur: number): void;
    contrast(contrast: number): void;
    saturation(saturation: number): void;
    exposure(exposure: number): void;
    sepia(sepia: number): void;
    noise(noise: number): void;
    sharpen(sharpen: number): void;
    crop(x: number, y: number): void;

    channels(color: PixelRGB): CamanObject;

    revert(): void;
    revert(updateContext: boolean): void;

    render(callback: () => any): void;
    render(): void;

    imageData: ImageData;
}

interface CamanInitCallback {
    (): any;
}

declare function Caman(canvas: HTMLCanvasElement, callback: CamanInitCallback);
