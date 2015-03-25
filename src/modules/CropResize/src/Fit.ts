
module Modules {
    export interface Size {
        width: number;
        height: number;
    }

    export enum FitMethod {
        RESIZE, WIDTH, HEIGHT, RECT
    }

    export class Fit extends UI.Widgets.RsWidget {
        private fitCanvas: FitMethodCanvas;
        private $methods: JQuery;
        private $button: JQuery;

        private $widthInput: JQuery;
        private $heightInput: JQuery;

        private selected: FitMethod = FitMethod.RESIZE;

        constructor(private $el: JQuery, private images: Core.RsImage[], private ui: UI.Editor) {
            super();

            this.fitCanvas = new FitMethodCanvas(<HTMLCanvasElement>$el.find('#fitCanvas')[0]);

            this.$widthInput = $el.find('.sizes__width input');
            this.$heightInput = $el.find('.sizes__height input');

            this.$button = $el.find('.fit-button');

            this.$methods = $el.find('.module-list li');
            this.$methods.on('click.CropResize', (e) => {
                this.$methods.removeClass('selected');

                this.selectMethod($(e.target));
            });

            this.$button.on('click.CropResize', () => {
                this.trigger('apply', this.selected);

                return false;
            });
        }

        getSelectedMethod(): FitMethod {
            return this.selected;
        }

        getRect(): Rect {
            return {
                left: 0,
                top: 0,
                width: parseInt(this.$widthInput.val()),
                height: parseInt(this.$heightInput.val())
            }
        }

        private getRectSize(): Size {
            return {
                width: parseInt(this.$widthInput.val()),
                height: parseInt(this.$heightInput.val())
            }
        }

        private selectMethod($item: JQuery) {
            this.images = this.ui.selected();

            $item.addClass('selected');

            var rect = this.getRectSize();
            if ($item.data('value') == 'resize-all') {
                this.selected = FitMethod.RESIZE;
                this.fitCanvas.drawResizeAll(rect.width, rect.height, this.images[0].getWidth(), this.images[0].getHeight());
            }
            else if ($item.data('value') == 'stretch-to-width') {
                this.selected = FitMethod.WIDTH;
                this.fitCanvas.drawStretchToWidth(rect.width, rect.height, this.images[0].getWidth(), this.images[0].getHeight());
            }
            else if ($item.data('value') == 'stretch-to-height') {
                this.selected = FitMethod.HEIGHT;
                this.fitCanvas.drawStretchToHeight(rect.width, rect.height, this.images[0].getWidth(), this.images[0].getHeight());
            }
            else if ($item.data('value') == 'stretch-to-rect') {
                this.selected = FitMethod.RECT;
                this.fitCanvas.drawStretchToRect(rect.width, rect.height, this.images[0].getWidth(), this.images[0].getHeight());
            }
        }

        destroy() {
            this.$methods.off('.CropResize');
            this.$button.off('.CropResize');
        }
    }
}
