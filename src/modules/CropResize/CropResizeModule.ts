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

        constructor(private editor: Core.RsImageEditor) {}

        init($el: JQuery) {
            this.view = <UI.GridView>this.editor.UI().getView();
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
            this.fit = new Fit(this.$el, this.images, this.editor.UI());

            this.fit.on('apply', (e) => {
                this.doAction(
                    this.createFitActions(e.data.rect, e.data.method, e.data.fitPosition, e.data.isCanCrop)
                )
            });
        }

        private initCrop() {
            this.crop = new Crop(this.$el, this.images, this.editor.UI());

            this.crop.on('apply', (e) => {
                this.doAction(
                    this.createCropActions(e.data.size, e.data.fitPosition)
                )
            });
        }

        private update() {
            this.deleteHelpers();

            this.images = this.editor.UI().selected();
            if (this.images.length > 0) {
                this.$el.show();

                this.initFit();
                this.initCrop();
            }
            else {
                this.$el.hide();
            }
        }

        private createCropActions(size: Size, position: FitPosition): Promise<Core.RsImage>[] {
            this.editor.UI().getView().showLoading();

            var result: Promise<Core.RsImage>[] = [];

            this.editor.UI().selected().forEach((img: Core.RsImage) => {
                    var act = new CropAction(img, 0, 0, size.width, size.height, position);
                    result.push(img.getActionDispatcher().process(act));
                }
            );

            return result;
        }

        private createFitActions(rect: Rect, method: FitMethod, position: FitPosition, isCanCrop: boolean): Promise<Core.RsImage>[] {
            this.editor.UI().getView().showLoading();

            var result: Promise<Core.RsImage>[] = [];

            this.editor.UI().selected().forEach((img: Core.RsImage) => {
                    var act = new FitAction(img, rect, method, position, isCanCrop);
                    result.push(img.getActionDispatcher().process(act));
                }
            );

            return result;
        }

        doAction(actions: Promise<Core.RsImage>[]) {
            Promise.all(actions).then(() => {
                this.editor.UI().getView().update();
            });
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
            this.editor.UI().clearPopover();
        }
    }
}