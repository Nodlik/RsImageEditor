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
            this.page.getImagePlace().append($(
                nunjucks.render('grid.image.html.njs', {
                        image: {
                            src: image.getImageBase64(),
                            name: image.getName(),
                            id: image.getId(),
                            label: image.getLabel()
                        }
                    })
            ));
        }
    }
}
