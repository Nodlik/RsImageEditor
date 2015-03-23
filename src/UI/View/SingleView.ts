module UI {
    enum ZoomType {WIDTH, HEIGHT, SOURCE}

    export class SingleView implements ViewInterface {
        private canvas: HTMLCanvasElement = null;
        private context: CanvasRenderingContext2D;

        private scale: number = 1;

        constructor(private page: Page, private image: Core.RsImage) {
            this.scale = 1;
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

            this.setScale(this.scale);

            $('#fitToWidth').click(() => {
                this.setZoom(ZoomType.WIDTH);

                return false;
            });

            $('#sourceSize').click(() => {
                this.setZoom(ZoomType.SOURCE);

                return false;
            });
        }

        setZoom(zoom: ZoomType) {
            var $container = this.page.getImagePlace().find('.rs-single-image');
            var $canvas = $container.find('canvas');

            var value = 1;
            if (zoom == ZoomType.WIDTH) {
                value = ($container.width() / $canvas.width());
                $container.css('overflow', 'hidden');
            }
            else if (zoom == ZoomType.SOURCE) {
                $container.css('overflow', 'scroll');
            }

            this.setScale(value);
        }

        private setScale(scale: number) {
            var $container = this.page.getImagePlace().find('.rs-single-image');
            var $canvas = $container.find('canvas');

            $container.scrollLeft(0);
            $container.scrollTop(0);
            $canvas.css('transform-origin', '0 0');
            $canvas.css('transform', 'scale(' + scale + ')');

            this.scale = scale;

            $("#zoomValue").text(Math.floor(scale * 100) + '%');
        }

        getScale(): number {
            return this.scale;
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
