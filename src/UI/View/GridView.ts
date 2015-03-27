module UI {
    export class GridView implements ViewInterface {
        public needRefresh: boolean = false;

        constructor(private page: Page, private imageCollection: Core.ImageCollection) {
        }

        type(): Core.ModuleViewType {
            return Core.ModuleViewType.GRID;
        }


        getActualImage(): Core.RsImage[] {
            return this.selected();
        }

        render() {
            this.page.getImagePlace().html("");
            var images = this.imageCollection.getImages();

            this.needRefresh = false;

            images.forEach((img) => {
                this.renderImage(img);
            });
        }

        setImages(images: Core.ImageCollection) {
            this.imageCollection = images;
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

        update() {
            if (!this.needRefresh) {
                var images = this.imageCollection.getImages();

                images.forEach((el: Core.RsImage) => {
                    this.updateImage(el);
                });
                this.page.renderInformation();
            }
            else {
                this.render();
            }
        }

        showLoading() {
            this.page.getImagePlace().find('.rs-image-selected').find('.rs-image-block').addClass('loading');
        }

        hideLoading() {
            this.page.getImagePlace().find('.rs-image-selected').find('.rs-image-block').removeClass('loading');
        }


        private updateImage(image: Core.RsImage) {
            var $el = this.page.getImagePlace().find('#img__' + image.getId());

            image.getImage().then((img) => {
                var $imageBlock = $el.find('.rs-image-block');
                $el.find('img').remove();

                $imageBlock[0].appendChild(img);
                $imageBlock.removeClass('loading');
            });
        }

        private renderImage(image: Core.RsImage) {
            image.getImage().then((img) => {
                if (!image.isDeleted) {
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
                }
            });
        }
    }
}
