/// <reference path="RsWidget.ts"/>

module UI.Widgets {
    export class RsProgressBar extends RsWidget {
        private $line: JQuery;
        private $label: JQuery;

        private opCount: number;

        constructor(private $el: JQuery) {
            super();

            this.$label = $('<div class="rs-progress-label"></div>');
            this.$line = $('<div class="rs-progress-line"></div>');

            this.$el.html("");

            this.$el.append(this.$label);
            this.$el.append(this.$line);
        }

        getOpCount(): number {
            return this.opCount;
        }

        start(label: string, opCount: number) {
            this.opCount = opCount;
            this.setProgress(0, label);

            this.trigger('start');
            this.$el.show();
        }

        setProgress(op: number, label: string) {
            this.$label.text(label);
            this.$line.css('width', ((op / this.opCount) * 100) + '%');

            if (op >= this.opCount) {
                this.trigger('stop');
            }
            else {
                this.trigger('progress', op);
            }
        }

        stop(label: string) {
            this.$label.text(label);

            setTimeout(() => {
                this.$el.hide();
            }, 200);
        }
    }
}
