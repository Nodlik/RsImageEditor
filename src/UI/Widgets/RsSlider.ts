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
                $body.off('.RsSlider');

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
                    var newPos = parseInt(this.$slider.css('left'));
                    this.trigger('stopmove', this.getVal(newPos));

                    $body.off('.RsSlider');
                });
            });

            this.on('move', (e) => {
                this.$slider.text(e.data);
            });

            this.trigger('move', this.start);
        }

        public set(value: number, label = '') {
            this.$slider.css('left', this.getPixelPos(value) + 'px');

            if (label == '') {
                this.$slider.text(value.toString());
            }
            else {
                this.$slider.text(label);
            }
        }

        private getVal(pixelPos: number): number {
            return Math.round( (pixelPos * ((this.max - this.min) / this.step)) / (this.$el.width() - this.$slider.width())) * this.step + this.min;
        }

        private getPixelPos(val: number): number {
            return (((val - this.min) / this.step) * (this.$el.width() - this.$slider.width())) / ((this.max - this.min) / this.step);
        }
    }
}
