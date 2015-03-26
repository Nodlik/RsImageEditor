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

        constructor(private editor: Core.RsImageEditor) {}

        init($el: JQuery) {
            this.view = <UI.GridView>this.editor.UI().getView();
            this.$el = $el;

            this.update();
        }

        private update() {
            if (this.fit != null) {
                this.fit.destroy();
                this.fit = null;
            }

            this.images = this.editor.UI().selected();
            if (this.images.length > 0) {
                this.$el.show();
                this.fit = new Fit(this.$el, this.images, this.editor.UI());

                this.fit.on('apply', (e) => {
                    this.doAction(
                        this.createFitActions(e.data.rect, e.data.method, e.data.fitPosition, e.data.isCanCrop)
                    )
                });
            }
            else {
                this.$el.hide();
            }
        }

        createFitActions(rect: Rect, method: FitMethod, position: FitPosition, isCanCrop: boolean): Promise<Core.RsImage>[] {
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
            if (this.fit != null) {
                this.fit.destroy();
                this.fit = null;
            }

            this.editor.UI().clearPopover();
        }
    }
}