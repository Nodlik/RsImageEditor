module UI {
    export class SingleView implements ViewInerface {
        private canvas: HTMLCanvasElement = null;
        private context: CanvasRenderingContext2D;
        private htmlImage: HTMLImageElement;

        constructor(private page: Page, private image: Core.RsImage) {

        }

        render() {
            this.getCanvas().then(
                () => {
                    this.renderImage();
                }
            );
        }

        private renderImage() {
            this.context.drawImage(this.htmlImage, 0, 0);
        }

        private getCanvas(): Promise<boolean> {
            return new Promise<boolean>(
                (resolve, reject) =>
                    {
                        this.page.getImagePlace().append($('<canvas id="' + this.image.getId() + '"></canvas>'));
                        this.canvas = <HTMLCanvasElement>this.page.getImagePlace().find('#' + this.image.getId())[0];

                        this.image.getImage().then(
                            (img: HTMLImageElement) => {
                                this.htmlImage = img;
                                this.canvas.width = img.width;
                                this.canvas.height = img.height;

                                this.context = this.canvas.getContext('2d');
                                resolve(true);
                            }
                        )
                    }
            );
        }
    }
}
