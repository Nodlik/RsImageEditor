module Modules {
    export class FiltersListWidget extends UI.Widgets.RsWidget {
        private canvasWidth = 50;
        private $filtersList: JQuery;

        private filters: FilterWidget[] = [];

        constructor(private $el: JQuery, selected = '') {
            super();

            this.$filtersList = $el.find('.m-filters__filters-list');

            this.createFilter('lomo', 'Lomo', selected);
            this.createFilter('vintage', 'Vintage', selected);

            this.createFilter('clarity', 'Clarity', selected);
            this.createFilter('sinCity', 'Sin City', selected);
            this.createFilter('sunrise', 'Sunrise', selected);
            this.createFilter('crossProcess', 'Cross Process', selected);
            this.createFilter('orangePeel', 'Orange Peel', selected);
            this.createFilter('love', 'Love', selected);
            this.createFilter('grungy', 'Grungy', selected);
            this.createFilter('jarques', 'Jarques', selected);
            this.createFilter('pinhole', 'Pinhole', selected);
            this.createFilter('oldBoot', 'Old Boot', selected);
            this.createFilter('glowingSun', 'Glowing Sun', selected);

            this.createFilter('hazyDays', 'Hazy Days', selected);
            this.createFilter('herMajesty', 'Her Majesty', selected);
            this.createFilter('nostalgia', 'Nostalgia', selected);
            this.createFilter('hemingway', 'Hemingway', selected);
            this.createFilter('concentrate', 'Concentrate', selected);
        }

        draw(image: Core.RsImage) {
            var w = this.canvasWidth;
            var h = image.height * this.canvasWidth / image.width;

            this.initCaman(image, w, h).then((caman: CamanObject) => {
                var drawPromise: Promise<CamanObject> = null;

                this.filters.forEach((f) => {
                    if (drawPromise != null) {
                        drawPromise = drawPromise.then((c) => {
                            return f.draw(c, w, h);
                        });
                    }
                    else {
                        drawPromise = f.draw(caman, w, h);
                    }
                })
            });
        }

        destroy() {
            this.filters.forEach((f) => {
                f.destroy();
            });

            this.filters = [];
        }

        private initCaman(image: Core.RsImage, w, h): Promise<CamanObject> {
            return new Promise<CamanObject>(
                (resolve, reject) => {
                    (new Core.ImageResizer(image.getImageData(), w, h)).resize().then((imageData: ImageData) => {
                        var canvas = document.createElement('canvas');
                        var context = canvas.getContext('2d');
                        canvas.width = w;
                        canvas.height = 33;
                        context.putImageData(imageData, 0, 0);

                        Caman(canvas, function() {
                            resolve(<CamanObject>this);
                        });
                    });
                });
        }

        private createFilter(name: string, displayName: string, selectedFilter: string) {
            var isSelected = false;
            if (selectedFilter == name) {
                isSelected = true;
            }

            this.filters.push(
                <FilterWidget>(new FilterWidget(this.$filtersList, name, displayName, isSelected)).on('select', (e) => {
                    this.selectFilter(e.data.block, e.data.name, e.data.vignette);
                }).on('update', (e) => {
                    this.setFilter(e.data.block, e.data.name, e.data.vignette);
                })
            )
        }

        private setFilter($el: JQuery, name: string, vignette: boolean) {
            this.$el.find('.m-filter').removeClass('selected');
            $el.addClass('selected');
            this.trigger('filter', {filter: name,  vignette: vignette});
        }

        private selectFilter($el: JQuery, name: string, vignette: boolean) {
            if ($el.hasClass('selected')) {
                this.trigger('reset');
                this.$el.find('.m-filter').removeClass('selected');
            }
            else {
                this.$el.find('.m-filter').removeClass('selected');
                $el.addClass('selected');
                this.trigger('filter', {filter: name,  vignette: vignette});
            }
        }
    }
}
