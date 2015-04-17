/// <reference path="../../Core/Module/HtmlModule.ts"/>
/// <reference path="../../Core/RsImageEditor.ts"/>

module Modules {
    export interface Rect {
        left: number;
        top: number;
        width: number;
        height: number;
    }

    export class CropResizeModule implements Core.HtmlModule
    {
        private images: Core.RsImage[] = [];
        private view: UI.GridView;
        private $el: JQuery;

        private fit: Fit = null;
        private crop: Crop = null;

        constructor(private editor: UI.Editor) {}

        init($el: JQuery) {
            this.view = <UI.GridView>this.editor.getView();
            this.$el = $el;

            this.update();
        }

        private deleteHelpers() {
            if (this.fit != null) {
                this.fit.destroy();
                this.fit = null;
            }

            if (this.crop != null) {
                this.crop.destroy();
                this.crop = null;
            }
        }

        private initFit() {
            this.fit = new Fit(this.$el, this.images, this.editor);

            this.fit.on('apply', (e) => {
                this.doFitActions(e.data.rect, e.data.method, e.data.fitPosition, e.data.isCanCrop)
            });
        }

        private initCrop() {
            this.crop = new Crop(this.$el, this.images, this.editor);

            this.crop.on('apply', (e) => {
                this.doCropActions(e.data.size, e.data.fitPosition);
            });
        }

        public update() {
            this.deleteHelpers();

            this.images = this.editor.selected();
            if (this.images.length > 0) {
                this.$el.show();

                this.initFit();
                this.initCrop();
            }
            else {
                this.$el.hide();
            }
        }

        private doCropActions(size: Size, position: FitPosition) {
            this.editor.getView().showLoading();


            this.editor.selected().forEach((img: Core.RsImage) => {
                    var act = new CropAction(img, 0, 0, size.width, size.height, position);
                    img.getActionDispatcher().process(act).then((image) => {
                        this.editor.getView().update(image);
                    });
                }
            );
        }

        private doFitActions(rect: Rect, method: FitMethod, position: FitPosition, isCanCrop: boolean) {
            this.editor.getView().showLoading();

            this.editor.selected().forEach((img: Core.RsImage) => {
                    var act = new FitAction(img, rect, method, position, isCanCrop);
                    img.getActionDispatcher().process(act).then((image) => {
                        this.editor.getView().update(image);
                    });
                }
            );
        }

        html() {
            return nunjucks.render('crop-resize.dialog.html.njs', {});
        }

        selectImage(image: Core.RsImage) {
            this.update();
        }

        unSelectImage(image: Core.RsImage) {
            this.update();
        }

        viewType(): Core.ModuleViewType {
            return Core.ModuleViewType.GRID;
        }

        icon() {
            return 'fa fa-crop'
        }

        type() {
            return Core.ModuleType.DELEGATE;
        }

        parent() {
            return null;
        }

        name() {
            return 'crop-resize';
        }

        deinit() {
            this.deleteHelpers();
            this.editor.getInterface().clearPopover();
        }
    }
}