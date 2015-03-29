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

            this.initSelectBlock(this.page.getInformationPlace().find('#rsSelect'));
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
                this.initSelectBlock(this.page.getInformationPlace().find('#rsSelect'));
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

        private initSelectBlock($el: JQuery) {
            $el.find('#rsSelectAll').click((e) => {
                $el.find('.rs-select__link').removeClass('selected');
                this.selectImage(this.imageCollection.getImages());
                $(e.target).addClass('selected');

                return false;
            });

            $el.find('#rsSelectNew').click((e) => {
                $el.find('.rs-select__link').removeClass('selected');
                this.selectImage(this.imageCollection.getNotSaved());
                $(e.target).addClass('selected');

                return false;
            });

            $el.find('#rsDeselectAll').click(() => {
                $el.find('.rs-select__link').removeClass('selected');
                this.deselectAll();
                this.page.renderToolbar();

                return false;
            });
        }

        private selectImage(images: Core.RsImage[]) {
            this.deselectAll();

            images.forEach((img) => {
                var $el = this.page.getImagePlace().find('#img__' + img.getId());
                $el.addClass('rs-image-selected');
                $el.find('input').prop("checked", "true");

                this.page.getEditor().selectImage(img);
            });

            this.updateModule();
        }

        private deselectAll() {
            var $images = this.page.getImagePlace().find('.rs-image');
            $images.removeClass('rs-image-selected');
            $images.find('input').removeAttr('checked');

            this.updateModule();
        }

        private updateModule() {
            this.page.getEditor().getActions().doModuleAction((m) => {
                m.update();
            }, Core.ModuleViewType.GRID)
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
