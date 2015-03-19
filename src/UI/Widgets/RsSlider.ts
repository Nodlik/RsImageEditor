/// <reference path="RsWidget.ts"/>

module UI.Widgets {
    export class RsSlider extends RsWidget {
        private $slider: JQuery;

        constructor(private $el: JQuery, private min: number, private max: number, private step: number = 1, private start: number = 0) {
            super();

            this.$slider = $('<div class="rs-slider-handle"></div>');
            this.$el.html("");
            this.$el.addClass('rs-slider');
            this.$el.append(this.$slider);

            this.$slider.css('left', this.getPixelPos(this.start) + 'px');

            var $body: JQuery = $(document);
            this.$slider.mousedown((downEvent: JQueryMouseEventObject) => {
                var x = downEvent.clientX - parseInt(this.$slider.css('left'));

                $body.on('mousemove.RsSlider', (moveEvent: JQueryMouseEventObject) => {
                    var pos = moveEvent.clientX - x;

                    if (pos < 0) {
                        pos = 0;
                    }

                    var size = this.$el.width() - this.$slider.width();
                    if (pos > size) {
                        pos = size;
                    }

                    this.$slider.css('left', pos + 'px');
                    this.trigger('move', this.getVal(pos));
                });

                $body.on('mouseup.RsSlider', () => {
                    $body.off('.RsSlider');
                });
            });
        }

        private getVal(pixelPos: number): number {
            return Math.round( (pixelPos * ((this.max - this.min) / this.step)) / (this.$el.width() - this.$slider.width())) * this.step + this.min;
        }

        private getPixelPos(val: number): number {
            return (((val - this.min) / this.step) * (this.$el.width() - this.$slider.width())) / ((this.max - this.min) / this.step);
        }
    }
}
