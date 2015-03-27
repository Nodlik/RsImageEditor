/// <reference path="../../Core/Module/HtmlModule.ts"/>
/// <reference path="../../Core/RsImageEditor.ts"/>
/// <reference path="../../UI/Widgets/RsSlider.ts"/>
/// <reference path="../../UI/Editor.ts"/>

module Modules {
    export class ColorModule implements Core.HtmlModule
    {
        private brightnessSlider: UI.Widgets.RsSlider;
        private vibranceSlider: UI.Widgets.RsSlider;

        constructor(private editor: UI.Editor) {}

        html() {
            return nunjucks.render('color.dialog.html.njs', {});
        }

        viewType(): Core.ModuleViewType {
            return Core.ModuleViewType.ANY;
        }

        unSelectImage(image: Core.RsImage) {
            this.updateSelectState();
        }

        selectImage(image: Core.RsImage) {
            this.updateSelectState();
        }

        private updateSelectState() {
            var images = this.editor.selected();

            if (images.length == 1) {
                var image = images[0];

                this.brightnessSlider.set(image.brightness);
                this.vibranceSlider.set(image.vibrance);
            }
            else if (images.length > 0) {
                this.setSliderValue('brightness', this.brightnessSlider, images);
                this.setSliderValue('vibrance', this.vibranceSlider, images);
            }
            else {
                this.brightnessSlider.set(0, '-');
                this.vibranceSlider.set(0, '-');
            }
        }

        private setSliderValue(prop, slider: UI.Widgets.RsSlider, images: Core.RsImage[]) {
            var v = images[0][prop];

            for (var i = 0; i < images.length; i++) {
                if (v != images[i][prop]) {
                    slider.set(0, '-');

                    return;
                }
            }
            slider.set(v);
        }

        init($el: JQuery) {
            var brightness = 0;
            var vibrance = 0;

            if (this.editor.getType() == Core.ModuleViewType.SINGLE) {
                var img = this.editor.selected()[0];

                brightness = img.brightness;
                vibrance = img.vibrance;
            }

            this.brightnessSlider = new UI.Widgets.RsSlider( $el.find('#brightnessSlider'), -100, 100, 1, brightness);
            this.brightnessSlider.on('stopmove', (e) => {
               this.doAction(BrightnessAction, e.data);
            });

            this.vibranceSlider = new UI.Widgets.RsSlider( $el.find('#vibranceSlider'), -200, 200, 5, vibrance);
            this.vibranceSlider.on('stopmove', (e) => {
                this.doAction(VibranceAction, e.data);
            });
        }

        deinit() {
            this.editor.getInterface().clearPopover();
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
            this.editor.getView().showLoading();

            var promiseArray: Promise<Core.RsImage>[] = [];

            this.editor.selected().forEach((img: Core.RsImage) => {
                    var act = new action(img, value);
                    promiseArray.push(img.getActionDispatcher().process(act));
                }
            );

            Promise.all(promiseArray).then(() => {
                this.editor.getView().update();
            });
        }
    }
}