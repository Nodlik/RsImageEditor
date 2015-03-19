module UI {
    export class GridView implements ViewInterface {
        constructor(private page: Page, private imageCollection: Core.ImageCollection) {
        }

        type(): Core.ModuleViewType {
            return Core.ModuleViewType.GRID;
        }

        render() {
            this.page.getImagePlace().html("");
            this.imageCollection.getImages().forEach((img) => {
                this.renderImage(img);
            });
        }

        selected(): Core.RsImage[] {
            var ids: string[] = [];
            this.page.getImagePlace().find('.rs-image-selected').each((i: number, $el: Element) => {
                ids.push($($el).data('id'));
            });

            return this.imageCollection.findImage(ids);
        }

        private renderImage(image: Core.RsImage) {
            var $block = $(
                nunjucks.render('grid.image.html.njs', {
                    image: {
                        //src: image.getImageBase64(),
                        name: image.getName(),
                        id: image.getId(),
                        label: image.getLabel()
                    }
                })
            );
            this.page.getImagePlace().append($block);

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
            );
        }
    }
}
