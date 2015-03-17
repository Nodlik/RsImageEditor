module UI {
    export class SingleView implements ViewInterface {
        private canvas: HTMLCanvasElement = null;
        private context: CanvasRenderingContext2D;

        constructor(private page: Page, private image: Core.RsImage) {

        }

        type(): Core.ModuleViewType {
            return Core.ModuleViewType.SINGLE;
        }

        render() {
            this.getCanvas();
            this.renderImage();
        }

        selected(): Core.RsImage[] {
            return [this.image];
        }

        private renderImage() {
            this.context.putImageData(this.image.getImageData(), 0, 0);
        }

        private getCanvas() {
            this.page.getImagePlace().append($('<canvas id="' + this.image.getId() + '"></canvas>'));
            this.canvas = <HTMLCanvasElement>this.page.getImagePlace().find('#' + this.image.getId())[0];

            this.canvas.width = this.image.getWidth();
            this.canvas.height = this.image.getHeight();

            this.context = this.canvas.getContext('2d');
        }
    }
}
