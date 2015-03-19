/// <reference path="../Action/ActionDispatcher.ts"/>

module Core {
    export interface RsImageState {
        imageData: ImageData;
        base64: string;
    }

    export class RsImage {
        private id = '';

        private actionDispatcher: ActionDispatcher = null;

        private originalImage: ImageData;
        private processedImage: ImageData;

        private imageBase64: string = ''; // BASE 64 processed image

        public width: number;
        public height: number;
        public brightness: number;

        constructor(private imageName: string, private imageType: string) {
            this.actionDispatcher = new ActionDispatcher(<RsImage>this);
        }

        create(imageBase64: string): Promise<RsImage> {
            this.imageBase64 = imageBase64;

            return new Promise<RsImage>(
                (resolve, reject) => {
                    this.getImage().then((img) =>
                    {
                        var canvas = document.createElement('canvas');
                        var context = canvas.getContext('2d');

                        canvas.width = img.width;
                        canvas.height = img.height;

                        context.drawImage(img, 0, 0);

                        this.originalImage = context.getImageData(0, 0, img.width, img.height);
                        this.init();

                        resolve(this);
                    });
                }
            )
        }

        private init() {
            this.processedImage = this.originalImage;

            this.width = this.originalImage.width;
            this.height = this.originalImage.height;
            this.brightness = 0;
        }

        public save(): Promise<RsImage> {
            var canvas = document.createElement('canvas');
            var context = canvas.getContext('2d');
            canvas.width = this.width;
            canvas.height = this.height;
            context.putImageData(this.originalImage, 0, 0);

            /* RESIZE */
            var resizePromise: Promise<ImageData>;
            if ((this.width != this.originalImage.width) || (this.height != this.originalImage.height)) {
                resizePromise = (new ImageResizer(this.originalImage, this.width, this.height)).resize();
            }
            else {
                resizePromise = Promise.resolve(context.getImageData(0, 0, this.width, this.height));
            }

            /* CAMAN */
            return resizePromise.then(
                (imageData: ImageData) =>
                {
                    canvas.width = imageData.width;
                    canvas.height = imageData.height;
                    context.putImageData(imageData, 0, 0);

                    return new Promise<ImageData>(
                        (resolve, reject) => {
                            var self = this;
                            Caman(canvas, function() {
                                var caman = <CamanObject>this;

                                caman.brightness(self.brightness);

                                caman.render(() => {
                                    resolve(context.getImageData(0, 0, imageData.width, imageData.height));
                                });
                            });
                        }
                    )
                }
            ).then(
                (imageData: ImageData) => {
                    this.processedImage = imageData;

                    var canvas: HTMLCanvasElement = document.createElement('canvas');
                    var context = canvas.getContext('2d');
                    canvas.width = this.processedImage.width;
                    canvas.height = this.processedImage.height;

                    context.putImageData(this.processedImage, 0, 0);
                    this.imageBase64 = canvas.toDataURL();

                    return this;
                }
            );
        }


        getImageData(): ImageData {
            return this.processedImage;
        }

        getWidth(): number {
            return this.processedImage.width;
        }

        getHeight(): number {
            return this.processedImage.height;
        }

        getName(): string {
            return this.imageName;
        }

        getLabel(): string {
            return '';
        }

        getImageBase64(): string {
            return this.imageBase64;
        }

        getActionDispatcher(): ActionDispatcher {
            return this.actionDispatcher;
        }

        setId(id: string) {
            this.id = id;
        }

        getId(): string {
            return this.id;
        }

        getImage(): Promise<HTMLImageElement> {
            return new Promise<HTMLImageElement>(
                (resolve, reject) => {
                    var img = new Image();

                    img.onload = () => {
                        resolve(img);
                    };

                    img.src = this.imageBase64;
                });
        }
    }
}