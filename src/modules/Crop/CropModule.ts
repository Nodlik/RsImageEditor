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
            this.view = <UI.SingleView>this.editor.UI().getView();

            this.$cropRect = $('<div class="crop-rect"></div>');
            this.view.getAreaElement().append(this.$cropRect);

            this.cropResizableWidget = new UI.Widgets.RsResizable(this.$cropRect, this.view.getAreaElement());

            $('#crop_ok').click(() => {
                var b = this.cropResizableWidget.getBounds();

                var w = Math.round(b.width / this.view.getScale());
                this.doAction(
                     b.left / this.view.getScale(), b.top / this.view.getScale(), w, b.height / this.view.getScale()
                );
            });
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
                this.editor.UI().render();
            });
        }
    }
}