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
            var brightness = 0;
            var vibrance = 0;
            if (this.editor.UI().getType() == Core.ModuleViewType.SINGLE) {
                var img = this.editor.UI().selected()[0];

                brightness = img.brightness;
                vibrance = img.vibrance;
            }

            new UI.Widgets.RsSlider( $el.find('#brightnessSlider'), -100, 100, 1, brightness).on('stopmove', (e) => {
               this.doAction(BrightnessAction, e.data);
            });

            new UI.Widgets.RsSlider( $el.find('#vibranceSlider'), -200, 200, 5, vibrance).on('stopmove', (e) => {
                this.doAction(VibranceAction, e.data);
            });
        }

        deinit() {
            this.editor.UI().clearPopover();
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
            return 'color';
        }

        doAction(action, value: number) {
            var promiseArray: Promise<Core.RsImage>[] = [];

            this.editor.UI().selected().forEach((img: Core.RsImage) =>
                {
                    var act = new action(img, value);
                    promiseArray.push(img.getActionDispatcher().process(act));
                }
            );

            Promise.all(promiseArray).then(() => {
                this.editor.UI().render();
            });
        }
    }
}