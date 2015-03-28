module Modules {
    export class FilterWidget extends UI.Widgets.RsWidget {
        private canvasWidth = 50;
        private $block: JQuery;

        constructor(private $el: JQuery, private filterName, private displayFilterName, private isSelected: boolean = false) {
            super();

            this.render();
        }

        render() {
            this.$block = $(nunjucks.render('filter.html.njs', {
                'filter': {
                    'name': this.filterName,
                    'displayName': this.displayFilterName
                }
            }));

            if (this.isSelected) {
                this.$block.addClass('selected');
            }

            this.$block.on('click.FilterWidget', (e) => {
                if ($(e.target).attr('type') != 'checkbox') {
                    this.trigger('select', {
                        block: this.$block,
                        name: this.filterName,
                        vignette: this.$block.find('#mFilter-' + this.filterName + '-vignette').is(':checked')
                    })
                }
                else {
                    this.trigger('update', {
                        block: this.$block,
                        name: this.filterName,
                        vignette: this.$block.find('#mFilter-' + this.filterName + '-vignette').is(':checked')
                    })
                }
            });

            this.$el.append(this.$block);
        }

        draw(caman: CamanObject, w: number, h: number): Promise<CamanObject> {
            caman.revert();
            caman[this.filterName]();

            var canvas = (<HTMLCanvasElement>this.$block.find('canvas')[0]);
            canvas.width = w;
            canvas.height = 33;

            var context = canvas.getContext('2d');
            context.fillRect(0, 0, w, h);

            return new Promise<CamanObject>(
                (resolve, reject) => {
                    caman.render(() => {
                        context.putImageData(caman.imageData, 0, 0);


                        return resolve(caman);
                    });
                }
            );
        }

        destroy() {
            var c = (<HTMLCanvasElement>this.$block.find('canvas')[0]);
            c.width = 1;
            c.height = 1;

            c = null;

            this.$block.off('.FilterWidget');
            this.$block.html("");
        }
    }
}
