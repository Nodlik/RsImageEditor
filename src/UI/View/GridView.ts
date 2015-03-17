module UI {
    export class GridView implements ViewInterface {
        constructor(private page: Page, private imageCollection: Core.ImageCollection) {
            
        }

        type(): Core.ModuleViewType {
            return Core.ModuleViewType.GRID;
        }

        render() {
            this.imageCollection.getImages().forEach((img) => {
                this.renderImage(img);
            });
        }

        selected(): Core.RsImage[] {
            return [];
        }

        private renderImage(image: Core.RsImage) {
            image.getImage().then(
                (img) => {
                    var html = '<div id="' + image.getId() + '"><img style="max-width: 200px" src="' + img.src + '" /></div>';
                    this.page.getImagePlace().append($(html));
                }
            )
        }
    }
}
