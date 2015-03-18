/// <reference path="../Action/ActionDispatcher.ts"/>

module Core {
    export interface RsImageState {
        imageData: ImageData;
        base64: string;
    }

    export class RsImage {
        private id = '';

        private actionDispatcher: ActionDispatcher = null;
        private imageData: ImageData;
        private imageBase64: string = '';

        constructor(private imageName: string, private imageType: string) {
            this.actionDispatcher = new ActionDispatcher(this);
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

                        this.imageData = context.getImageData(0, 0, img.width, img.height);

                        resolve(this);
                    });
                }
            )
        }

        update(imageData: ImageData, imageBase64: string) {
            this.imageBase64 = imageBase64;
            this.imageData = imageData;
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

        getImageData(): ImageData {
            return this.imageData;
        }

        getImageBase64(): string {
            return this.imageBase64;
        }

        getWidth(): number {
            return this.imageData.width;
        }

        getHeight(): number {
            return this.imageData.height;
        }

        getName(): string {
            return this.imageName;
        }

        getLabel(): string {
            return '';
        }

        getState(): RsImageState {
            return {
                imageData: this.getImageData(),
                base64: this.getImageBase64()
            }
        }

        setState(state: RsImageState) {
            this.update(state.imageData, state.base64);
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