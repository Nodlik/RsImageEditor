/// <reference path="../Image/RsImage.ts"/>

module Core {
    export interface CanvasObject {
        canvas: HTMLCanvasElement;
        context: CanvasRenderingContext2D;
    }

    export class AbstractAction implements EditorAction
    {
        public oldImage: {data: ImageData; base64: string};

        constructor(public image: RsImage) {
            this.saveOldImage();
        }

        drawTempImage(): CanvasObject {
            var canvas = document.createElement('canvas');
            var context = canvas.getContext('2d');

            canvas.width = this.image.getWidth();
            canvas.height = this.image.getHeight();
            context.putImageData(this.image.getImageData(), 0, 0);

            return {
                canvas: canvas,
                context: context
            };
        }

        saveOldImage() {
            this.oldImage = {
                data: this.image.getImageData(),
                base64: this.image.getImageBase64()
            }
        }

        execute(): Promise<RsImage> {
            return Promise.resolve(this.image);
        }

        unExecute(): Promise<RsImage> {
            this.image.update(this.oldImage.data, this.oldImage.base64);

            return Promise.resolve(this.image);
        }
    }
}