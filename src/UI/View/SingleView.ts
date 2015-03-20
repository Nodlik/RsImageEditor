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
            this.page.getImagePlace().html(
                nunjucks.render('single.image.html.njs', {})
            );
            this.getCanvas();
            this.renderImage();
        }

        selected(): Core.RsImage[] {
            return [this.image];
        }

        getAreaElement(): JQuery {
            return this.page.getImagePlace().find('#rsSingleImage');
        }

        getInformation(): string {
            return nunjucks.render('single.information.html.njs', {
                resolution: this.image.width + 'x' + this.image.height,
                size: this.image.getSize() + ' kb',
                type: this.image.getType()
            });
        }

        private renderImage() {
            this.context.putImageData(this.image.getImageData(), 0, 0);
        }

        private getCanvas() {
            var $canvas = this.page.getImagePlace().find('#' + this.image.getId());
            if ($canvas.length == 0) {
                this.page.getImagePlace().find('#rsSingleImage').html('<canvas id="' + this.image.getId() + '"></canvas>');
            }
            this.canvas = <HTMLCanvasElement>this.page.getImagePlace().find('#' + this.image.getId())[0];

            this.canvas.width = this.image.getWidth();
            this.canvas.height = this.image.getHeight();

            this.context = this.canvas.getContext('2d');
        }
    }
}
