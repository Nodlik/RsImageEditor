/// <reference path="../../Core/Module/HtmlModule.ts"/>
/// <reference path="../../Core/RsImageEditor.ts"/>

module Modules {
    export class ResizeModule implements Core.HtmlModule
    {
        constructor(private editor: Core.RsImageEditor) {}

        html() {
            return nunjucks.render('resize.dialog.twig', {});
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
            this.editor.UI().selected().forEach((img: Core.RsImage) =>
                {
                    var act = new ResizeAction(img, width, height);

                    img.getActionDispatcher().process(act).then(() => {
                        this.editor.UI().getPage().getView().render();
                    });
                }
            );
        }
    }
}