/// <reference path="../Action/ActionDispatcher.ts"/>

module Core {
    interface CamanFiler  {
        name: string;
        parameters: any[];
    }

    export class RsImage {
        private id = '';

        private actionDispatcher: ActionDispatcher = null;

        private originalImage: ImageData;
        private processedImage: ImageData;

        private imageBase64: string = ''; // BASE 64 processed image
        private image: HTMLImageElement = null;

        private imagePromise: Promise<HTMLImageElement>;

        private caman: CamanObject = null;
        private forceCamanUpdate: boolean = false;

        public isDeleted = false;

        public width: number;
        public height: number;

        public brightness: number = 0;
        public vibrance: number = 0;
        public hue: number = 0;
        public gamma: number = 0;
        public clip: number = 0;
        public stackBlur: number = 0;
        public contrast: number = 0;
        public saturation: number = 0;
        public exposure: number = 0;
        public sepia: number = 0;
        public noise: number = 0;
        public sharpen: number = 0;

        public filter: CamanFiler = null;


        constructor(private imageName: string, private imageType: string) {
            this.actionDispatcher = new ActionDispatcher(<RsImage>this);
        }

        create(imageBase64: string): Promise<RsImage> {
            this.imageBase64 = imageBase64;

            return new Promise<RsImage>(
                (resolve, reject) => {
                    this.createImagePromise();

                    this.getImage().then((img) =>
                    {
                        var canvas = document.createElement('canvas');
                        var context = canvas.getContext('2d');

                        canvas.width = img.width;
                        canvas.height = img.height;

                        context.drawImage(img, 0, 0);

                        this.originalImage = context.getImageData(0, 0, img.width, img.height);
                        this.imageBase64 = canvas.toDataURL(this.imageType, 0.8);

                        canvas.width = 1;
                        canvas.height = 1;

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

        private getOriginalCoordinates(x: number, y: number) {
            return {
                x: (this.originalImage.width * x) / this.processedImage.width | 0,
                y: (this.originalImage.height * y) / this.processedImage.height | 0
            }
        }

        public getOriginalImage(): ImageData {
            return this.originalImage;
        }

        public replaceOriginal(image: ImageData) {
            this.originalImage = image;
        }

        public crop(left: number, top: number, width: number, height: number) {
            var canvas = document.createElement('canvas');
            var context = canvas.getContext('2d');
            canvas.width = this.originalImage.width;
            canvas.height = this.originalImage.height;
            context.putImageData(this.originalImage, 0, 0);

            var corner = this.getOriginalCoordinates(left, top);
            var size = this.getOriginalCoordinates(width, height);

            this.originalImage = null;
            this.originalImage = context.getImageData(corner.x, corner.y, size.x, size.y);

            this.width = width;
            this.height = height;

            this.forceCamanUpdate = true;
        }

        private getCaman(imageData: ImageData, update: boolean = false): Promise<CamanObject> {
            if ((!update) && (this.caman != null)) {
                return Promise.resolve(this.caman);
            }

            return new Promise<CamanObject>(
                (resolve, reject) => {
                    var camanCanvas = document.createElement('canvas');
                    var camanContext = camanCanvas.getContext('2d');

                    camanCanvas.width = imageData.width;
                    camanCanvas.height = imageData.height;
                    camanContext.putImageData(imageData, 0, 0);

                    Caman(camanCanvas, function() {
                        resolve(this);
                    });
                }
            );
        }

        public save(): Promise<RsImage> {
            var canvas = document.createElement('canvas');
            var context = canvas.getContext('2d');

            canvas.width = this.originalImage.width;
            canvas.height = this.originalImage.height;

            console.time('save');

            context.putImageData(this.originalImage, 0, 0);

            /* RESIZE */
            var resizePromise: Promise<ImageData>;

            var updateCaman = false;
            if (this.forceCamanUpdate) {
                updateCaman = true;
                this.forceCamanUpdate = false;
            }

            if ((this.width != this.processedImage.width) && (this.height != this.processedImage.height)) {
                updateCaman = true;
            }

            if ((this.width != this.originalImage.width) || (this.height != this.originalImage.height)) {
                resizePromise = (new ImageResizer(this.originalImage, this.width, this.height)).resize();
            }
            else {
                resizePromise = Promise.resolve(context.getImageData(0, 0, this.width, this.height));
            }

            canvas.width = 1;
            canvas.height = 1;

            canvas = null;

            /* CAMAN */
            return resizePromise.then(
                (imageData: ImageData) => {
                    return this.getCaman(imageData, updateCaman);
                }
            ).then(
                (caman) =>
                {
                    this.caman = caman;

                    this.caman.revert();
                    this.caman.brightness(this.brightness);
                    this.caman.vibrance(this.vibrance);

                    if (this.filter !== null) {
                        this.caman[this.filter.name].apply(this.caman, this.filter.parameters);
                    }


                    return new Promise<ImageData>(
                        (resolve, reject) => {
                            this.caman.render(() => {
                                resolve(this.caman.imageData);
                            });
                        }
                    )
                }
            ).then(
                (imageData: ImageData) => {

                    var canvas = document.createElement('canvas');
                    var context = canvas.getContext('2d');

                    this.processedImage = null;
                    this.processedImage = imageData;

                    canvas.width = this.processedImage.width;
                    canvas.height = this.processedImage.height;

                    context.putImageData(this.processedImage, 0, 0);
                    this.imageBase64 = canvas.toDataURL(this.imageType, 0.8);

                    canvas.width = 1;
                    canvas.height = 1;

                    canvas = null;

                    this.getImage().then(() => {
                        this.createImagePromise();
                    });

                    console.timeEnd('save');
                    return this;
                }
            );
        }

        getSize(): number {
            return Math.round( atob(this.getImageBase64().substr(this.getImageBase64().indexOf(';base64') + 8)).length / (1000))
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

        getType(): string {
            return this.imageType;
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

        createImagePromise() {
            this.imagePromise = new Promise<HTMLImageElement>(
                (resolve, reject) => {
                    var img = new Image();

                    img.onload = () => {
                        if (this.image != null) {
                            this.image.src = "about:blank";
                        }

                        this.image = img;

                        resolve(this.image);
                    };

                    img.src = this.imageBase64;
                });
        }

        getImage(): Promise<HTMLImageElement> {
            return this.imagePromise;
        }
    }
}