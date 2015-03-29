/// <reference path="../../Core/Module/HtmlModule.ts"/>
/// <reference path="../../Core/RsImageEditor.ts"/>
/// <reference path="../../UI/Widgets/RsSlider.ts"/>
/// <reference path="../../UI/Editor.ts"/>

module Modules {
    export class ImageModule implements Core.HtmlModule
    {
        private sliders: {[name: string]: UI.Widgets.RsSlider} = {};

        constructor(private editor: UI.Editor) {}

        html() {
            return nunjucks.render('image.html.njs', {});
        }

        viewType(): Core.ModuleViewType {
            return Core.ModuleViewType.ANY;
        }

        unSelectImage(image: Core.RsImage) {
            this.update();
        }

        selectImage(image: Core.RsImage) {
            this.update();
        }

        update() {
            var images = this.editor.selected();

            if (images.length == 1) {
                this.updateSlidersByImage(images[0]);
            }
            else if (images.length > 0) {
                this.updateSliders(images);
            }
            else {
                this.setSlidersValue(0, '-');
            }
        }

        private updateSlidersByImage(image: Core.RsImage) {
            _.map(this.sliders, (slider: UI.Widgets.RsSlider, key: string) => {
                slider.set(image[key]);
            });
        }

        private setSlidersValue(value: number, label: string = '') {
            _.map(this.sliders, (slider: UI.Widgets.RsSlider, key: string) => {
                slider.set(value, label);
            });
        }

        private updateSliders(images: Core.RsImage[]) {
            _.map(this.sliders, (slider: UI.Widgets.RsSlider, key: string) =>
                {
                    var v = images[0][key];
                    slider.set(v);

                    for (var i = 0; i < images.length; i++) {
                        if (v != images[i][key]) {
                            slider.set(0, '-');

                            return;
                        }
                    }
                }
            );
        }

        init($el: JQuery) {
            $el.find('.m__image-slider').each((i, s) => {
                var $slider = $(s);

                this.sliders[$slider.data('name')] = <UI.Widgets.RsSlider>(new UI.Widgets.RsSlider(
                        $slider, $slider.data('min'), $slider.data('max'), $slider.data('step')
                    )).on('stopmove', (e) => {
                        this.doAction(
                            (<UI.Widgets.RsSlider>e.widget).getElement().data('name'),
                            e.data
                        );
                    });
            });

            this.update();
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
            return 'image';
        }

        doAction(name, value: number) {
            this.editor.getView().showLoading();

            var promiseArray: Promise<Core.RsImage>[] = [];

            this.editor.selected().forEach((img: Core.RsImage) => {
                    var act = new ImageAction(img, name, value);
                    promiseArray.push(img.getActionDispatcher().process(act));
                }
            );

            Promise.all(promiseArray).then(() => {
                this.editor.getView().update();
            });
        }
    }
}