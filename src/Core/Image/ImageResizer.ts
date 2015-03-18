/// <reference path="../Action/ActionDispatcher.ts"/>

module Core {
    class ImagePixel {
        constructor(public r:number, public g:number, public b:number, public a:number) {}

        devig(val: number): ImagePixel {
            this.r /= val;
            this.g /= val;
            this.b /= val;
            this.a /= val;

            return this;
        }
    }

    export class ImageResizer {
        private size:number;

        constructor(private original:ImageData, private newWidth:number, private newHeight:number) {
            this.size = this.original.data.length;
        }

        resize(): Promise<ImageData> {
            var wSize = this.getWidthGridSize();
            var hSize = this.getHeightGridSize();


            if ((wSize > 2) && (hSize > 2)) {
                return Promise.resolve(this.downScaleSuperSampling(wSize, hSize));
            }
            else {
                return this.upScale();
            }
        }

        private upScale(): Promise<ImageData> {
            var canvas = document.createElement('canvas');
            var context = canvas.getContext('2d');

            canvas.width = this.original.width;
            canvas.height = this.original.height;

            context.putImageData(this.original, 0, 0);

            var img = new Image();

            return new Promise<ImageData>(
                (resolve, reject) => {
                    img.onload = () => {
                        canvas.width = this.newWidth;
                        canvas.height = this.newHeight;
                        context.drawImage(img, 0, 0, this.newWidth, this.newHeight);

                        resolve(context.getImageData(0, 0, this.newWidth, this.newHeight));
                    };

                    img.src = canvas.toDataURL();
                });

        }

        private downScaleSuperSampling(wSize: number, hSize: number): ImageData {
            var canvas = document.createElement('canvas');
            var context = canvas.getContext('2d');

            var result = context.createImageData(this.newWidth, this.newHeight);

            var cut = this.cutImageData(wSize, hSize);
            var c = 0;

            for (var row = 0; row < this.newHeight; row++) {
                for (var col = 0; col < this.newWidth; col++) {
                    var p = cut[row][col];
                    if (p) {
                        result.data[c] = p.r;
                        result.data[c + 1] = p.g;
                        result.data[c + 2] = p.b;
                        result.data[c + 3] = p.a;

                        c += 4;
                    }
                }
            }

            return result;
        }

        private cutImageData(wSize, hSize):Array<ImagePixel[]> {
            var rowNumber = 0;

            var data:Array<ImagePixel[]> = [];

            for (var row = 0; row < this.original.height; row = row + hSize) {
                data[rowNumber] = [];

                for (var col = 0; col < this.original.width; col = col + wSize) {
                    var p = new ImagePixel(0, 0, 0, 0);

                    var c = 0;

                    for (var i = row; i < row + hSize; i++) {
                        for (var j = col; j < col + wSize; j++) {
                            var n = ((i * this.original.width) + j) * 4;

                            if (n + 3 < this.size) {
                                p.r = p.r + this.original.data[n];
                                p.g = p.g + this.original.data[n + 1];
                                p.b = p.b + this.original.data[n + 2];
                                p.a = p.a + this.original.data[n + 3];

                                c++;
                            }
                        }
                    }

                    data[rowNumber].push(p.devig(c));
                }

                rowNumber++;
            }

            return data;
        }

        private getWidthGridSize() {
            return Math.floor(this.original.width / this.newWidth);
        }

        private getHeightGridSize() {
            return  Math.floor(this.original.height / this.newHeight);
        }
    }
}