
module Modules {
    export interface Size {
        width: number;
        height: number;
    }

    export enum FitMethod {
        RESIZE, WIDTH, HEIGHT, RECT
    }

    export enum FitPosition {
        LEFT_TOP, TOP, RIGHT_TOP, LEFT, CENTER, RIGHT, LEFT_BOTTOM, BOTTOM, RIGHT_BOTTOM
    }

    export class Fit extends UI.Widgets.RsWidget {
        private fitCanvas: FitMethodCanvas;
        private $methods: JQuery;
        private $button: JQuery;

        private $widthInput: JQuery;
        private $heightInput: JQuery;

        private $position: JQuery;

        private selected: FitMethod = FitMethod.RESIZE;

        constructor(private $el: JQuery, private images: Core.RsImage[], private ui: UI.Editor) {
            super();

            this.fitCanvas = new FitMethodCanvas(<HTMLCanvasElement>$el.find('#fitCanvas')[0]);

            this.$widthInput = $el.find('.sizes__width input');
            this.$heightInput = $el.find('.sizes__height input');

            this.$widthInput.val(this.images[0].width.toString());
            this.$heightInput.val(this.images[0].height.toString());

            this.$position = $el.find('#fitPosition .fp');

            this.$button = $el.find('.fit-button');

            this.$methods = $el.find('.module-list li');
            this.$methods.on('click.CropResize', (e) => {
                this.$methods.removeClass('selected');

                this.selectMethod($(e.target));
            });

            this.$button.on('click.CropResize', () => {
                if (this.isSizeValid(this.getRectSize())) {
                    this.trigger('apply', {
                            method: this.selected,
                            fitPosition: this.getPosition(),
                            rect: this.getRect(),
                            isCanCrop: $el.find('#fitCrop').is(':checked')
                        }
                    );
                }

                return false;
            });

            this.$position.on('click.CropResize', (e) => {
                this.$position.removeClass('selected');
                this.selectPosition($(e.target));
            });

            this.$widthInput.on('input.CropResize', (e) => {
                this.update();
            });

            this.$heightInput.on('input.CropResize', (e) => {
                this.update();
            });

            this.$methods.removeClass('selected');
            this.selectMethod(this.$methods.eq(0));
            this.update();
        }

        private update() {
            var size = this.getRectSize();

            if (this.isSizeValid(size)) {
                this.updateCanvas();
            }
        }

        private isSizeValid(size: Size) {
            return !(((size.width < 30) && (size.width > 9999)) ||
                ((size.height < 30) && (size.height > 9999)));
        }

        private selectPosition($el: JQuery) {
            $el.addClass('selected');

            this.updateCanvas();
        }

        getPosition(): FitPosition {
            var $selected = this.$position.filter('.selected');
            if ($selected) {
                if ($selected.hasClass('fp-left-top')) {
                    return FitPosition.LEFT_TOP;
                }
                else if ($selected.hasClass('fp-top')) {
                    return FitPosition.TOP;
                }
                else if ($selected.hasClass('fp-right-top')) {
                    return FitPosition.RIGHT_TOP;
                }
                else if ($selected.hasClass('fp-left')) {
                    return FitPosition.LEFT;
                }
                else if ($selected.hasClass('fp-center')) {
                    return FitPosition.CENTER;
                }
                else if ($selected.hasClass('fp-right')) {
                    return FitPosition.RIGHT;
                }
                else if ($selected.hasClass('fp-left-bottom')) {
                    return FitPosition.LEFT_BOTTOM;
                }
                else if ($selected.hasClass('fp-bottom')) {
                    return FitPosition.BOTTOM;
                }
                else if ($selected.hasClass('fp-right-bottom')) {
                    return FitPosition.RIGHT_BOTTOM;
                }
            }

            return null;
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
            if ($item.data('value') == 'resize-all') {
                this.selected = FitMethod.RESIZE;
            }
            else if ($item.data('value') == 'stretch-to-width') {
                this.selected = FitMethod.WIDTH;
            }
            else if ($item.data('value') == 'stretch-to-height') {
                this.selected = FitMethod.HEIGHT;
            }
            else if ($item.data('value') == 'stretch-to-rect') {
                this.selected = FitMethod.RECT;
            }

            this.updateCanvas();
        }

        private updateCanvas() {
            var rect = this.getRectSize();
            if (this.selected == FitMethod.RESIZE) {
                this.fitCanvas.drawResizeAll(rect.width, rect.height, this.images[0].getWidth(), this.images[0].getHeight(), this.getPosition());
            }
            else if (this.selected == FitMethod.WIDTH) {
                this.fitCanvas.drawStretchToWidth(rect.width, rect.height, this.images[0].getWidth(), this.images[0].getHeight(), this.getPosition());
            }
            else if (this.selected == FitMethod.HEIGHT) {
                this.fitCanvas.drawStretchToHeight(rect.width, rect.height, this.images[0].getWidth(), this.images[0].getHeight(), this.getPosition());
            }
            else if (this.selected == FitMethod.RECT) {
                this.fitCanvas.drawStretchToRect(rect.width, rect.height, this.images[0].getWidth(), this.images[0].getHeight(), this.getPosition());
            }
        }

        destroy() {
            this.$methods.off('.CropResize');
            this.$button.off('.CropResize');
            this.$position.off('.CropResize');
            this.$widthInput.off('.CropResize');
            this.$heightInput.off('.CropResize');
        }
    }
}
