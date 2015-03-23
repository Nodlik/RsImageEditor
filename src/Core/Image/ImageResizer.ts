/// <reference path="../Action/ActionDispatcher.ts"/>

module Core {
    export class ImageResizer {
        private size: number;

        constructor(private original: ImageData, private newWidth: number, private newHeight: number) {
            this.size = this.original.data.length;
        }

        resize(): Promise<ImageData> {
            return this.picaResize();
        }

        private picaResize(quality: number = 3): Promise<ImageData> {
            return new Promise<ImageData>(
                (resolve, reject) => {
                    pica.resizeBuffer({
                            src: this.original.data,
                            width: this.original.width,
                            height: this.original.height,
                            toWidth: this.newWidth,
                            toHeight: this.newHeight,
                            alpha: true,
                            quality: quality
                        },
                        (err, data: Uint8Array) => {
                            var canvas = document.createElement('canvas');
                            var context = canvas.getContext('2d');
                            var newImageData = context.createImageData(this.newWidth, this.newHeight);

                            for (var i = 0; i < data.length; i++) {
                                newImageData.data[i] = data[i];
                            }

                            canvas.width = 1;
                            canvas.height = 1;

                            resolve(newImageData);
                        });
                }
            );
        }
    }
}