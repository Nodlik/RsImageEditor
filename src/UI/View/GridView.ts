module UI {
    export class GridView implements ViewInterface {
        constructor(private page: Page, private imageCollection: Core.ImageCollection) {
        }

        type(): Core.ModuleViewType {
            return Core.ModuleViewType.GRID;
        }

        render() {
            this.page.getImagePlace().html("");
            var images = this.imageCollection.getImages();

            if (images.length > 0) {
                var i = 0;
                var intervalId = setInterval(() => {
                    this.renderImage(images[i]);

                    i++;
                    if (i == images.length) {
                        clearInterval(intervalId);
                    }
                }, 10);
            }
        }


        getInformation(): string {
            if (this.imageCollection.count() > 0) {
                var r = this.imageCollection.getResolutionStats();

                return nunjucks.render('grid.information.html.njs', {
                    count: this.imageCollection.count(),
                    minResolution: r.min.width + 'x' + r.min.height,
                    maxResolution: r.max.width + 'x' + r.max.height
                });
            }

            return '';
        }


        selected(): Core.RsImage[] {
            var ids: string[] = [];
            this.page.getImagePlace().find('.rs-image-selected').each((i: number, $el: Element) => {
                ids.push($($el).data('id'));
            });

            return this.imageCollection.findImage(ids);
        }

        private renderImage(image: Core.RsImage) {
            image.getImage().then((img) => {
                var $block = $(
                    nunjucks.render('grid.image.html.njs', {
                        image: {
                            src: img,
                            name: image.getName(),
                            id: image.getId(),
                            label: image.getLabel()
                        }
                    })
                );
                $block.find('.rs-image-block')[0].appendChild(img);
                this.page.getImagePlace().append($block);
                /*
                var $canvas = $('<canvas id="' + image.getId() + '"></canvas>');
                $block.find('.rs-image-block').append($canvas);
                var c = <HTMLCanvasElement>$canvas[0];
                var ctx = c.getContext('2d');

                c.width = 150;
                c.height = 120;

                // todo keep ratio
                new Core.ImageResizer(image.getImageData(), 150, 120).resize().then(
                    (imageData) => {
                        ctx.putImageData(imageData, 0, 0);
                    }
                );*/
            });
        }
    }
}
