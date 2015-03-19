/// <reference path="../../Core/Module/HtmlModule.ts"/>
/// <reference path="../../Core/RsImageEditor.ts"/>
/// <reference path="../../UI/Widgets/RsSlider.ts"/>

module Modules {
    export class ColorModule implements Core.HtmlModule
    {
        constructor(private editor: Core.RsImageEditor) {}

        html() {
            return nunjucks.render('color.dialog.html.njs', {});
        }

        init($el: JQuery) {
            $el.find('.m_color-ok').click(() => {
                this.doAction($el.find('.m_color-brightness').val());

                return false;
            });
        }

        icon() {
            return 'fa fa-image'
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

        doAction(brightness: number) {
            var promiseArray: Promise<Core.RsImage>[] = [];

            this.editor.UI().selected().forEach((img: Core.RsImage) =>
                {
                    //img.getActionDispatcher().createAction(BrightnessAction);
                    var act = new BrightnessAction(img, brightness);
                    promiseArray.push(img.getActionDispatcher().process(act));
                }
            );

            Promise.all(promiseArray).then(() => {
                this.editor.UI().getPage().getView().render();
            });
        }
    }
}