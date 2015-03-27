
module Modules {
    export class Crop extends UI.Widgets.RsWidget {
        private $button: JQuery;

        private $widthInput: JQuery;
        private $heightInput: JQuery;

        private $position: JQuery;

        constructor(private $el: JQuery, private images: Core.RsImage[], private ui: UI.Editor) {
            super();

            this.$widthInput = $el.find('.crop__width input');
            this.$heightInput = $el.find('.crop__height input');

            this.$widthInput.val(this.images[0].width.toString());
            this.$heightInput.val(this.images[0].height.toString());

            this.$position = $el.find('#cropPosition .fp');

            this.$button = $el.find('#cropButton');

            this.$button.on('click.CropResize', () => {
                if (this.isSizeValid(this.getRectSize())) {
                    this.trigger('apply', {
                            fitPosition: this.getPosition(),
                            size: this.getRectSize()
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

            });

            this.$heightInput.on('input.CropResize', (e) => {

            });
        }


        private isSizeValid(size: Size) {
            return !(((size.width < 30) && (size.width > 9999)) ||
                ((size.height < 30) && (size.height > 9999)));
        }

        private selectPosition($el: JQuery) {
            $el.addClass('selected');
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


        private getRectSize(): Size {
            return {
                width: parseInt(this.$widthInput.val()),
                height: parseInt(this.$heightInput.val())
            }
        }


        destroy() {
            this.$button.off('.CropResize');
            this.$position.off('.CropResize');
            this.$widthInput.off('.CropResize');
            this.$heightInput.off('.CropResize');
        }
    }
}
