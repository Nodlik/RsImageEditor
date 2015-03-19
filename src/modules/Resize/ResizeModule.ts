/// <reference path="../../Core/Module/HtmlModule.ts"/>
/// <reference path="../../Core/RsImageEditor.ts"/>

module Modules {
    export class ResizeModule implements Core.HtmlModule
    {
        constructor(private editor: Core.RsImageEditor) {}

        html() {
            return nunjucks.render('resize.dialog.html.njs', {});
        }

        deinit() {

        }

        init($el: JQuery) {
            $el.find('.m_resize-ok').click(() => {
                this.doAction($el.find('.m_resize-width').val(), $el.find('.m_resize-height').val());

                return false;
            });
        }

        icon() {
            return 'fa fa-expand'
        }

        type() {
            return Core.ModuleType.DELEGATE;
        }

        parent() {
            return null;
        }

        name() {
            return 'resize';
        }

        doAction(width: number, height: number) {
            var promiseArray: Promise<Core.RsImage>[] = [];

            this.editor.UI().selected().forEach((img: Core.RsImage) =>
                {
                    var act = new ResizeAction(img, width, height);
                    promiseArray.push(img.getActionDispatcher().process(act));
                }
            );

            Promise.all(promiseArray).then(() => {
                this.editor.UI().getPage().getView().render();
            });
        }
    }
}