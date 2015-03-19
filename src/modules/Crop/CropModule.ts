/// <reference path="../../Core/Module/HtmlModule.ts"/>
/// <reference path="../../Core/RsImageEditor.ts"/>
/// <reference path="../../UI/Widgets/RsResizable.ts"/>

module Modules {
    export class CropModule implements Core.HtmlModule
    {
        private $cropRect: JQuery;
        private cropResizableWidget: UI.Widgets.RsResizable;
        private view: UI.SingleView = null;

        constructor(private editor: Core.RsImageEditor) {}

        html() {
            return nunjucks.render('crop.dialog.html.njs', {});
        }

        deinit() {
            if (this.view != null) {
                this.$cropRect.remove();
                this.view.getAreaElement().find('.rs-resizable-item').remove();
            }
        }

        init($el: JQuery) {
            if (this.editor.UI().getType() == Core.ModuleViewType.SINGLE) {
                this.view = <UI.SingleView>this.editor.UI().getView();

                this.$cropRect = $('<div class="crop-rect"></div>');
                this.view.getAreaElement().append(this.$cropRect);

                this.cropResizableWidget = new UI.Widgets.RsResizable(this.$cropRect, this.view.getAreaElement());

                $('#crop_ok').click(() => {
                    var b = this.cropResizableWidget.getBounds();

                    this.doAction(
                        b.left, b.top, b.width, b.height
                    );
                });
            }
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
            return 'crop';
        }

        doAction(left: number, top: number, width: number, height: number) {
            var promiseArray: Promise<Core.RsImage>[] = [];

            this.editor.UI().selected().forEach((img: Core.RsImage) =>
                {
                    var act = new CropAction(img, left, top, width, height);
                    promiseArray.push(img.getActionDispatcher().process(act));
                }
            );

            Promise.all(promiseArray).then(() => {
                this.editor.UI().getPage().getView().render();
            });
        }
    }
}