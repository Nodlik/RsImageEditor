/// <reference path="../../Core/Module/HtmlModule.ts"/>
/// <reference path="../../Core/RsImageEditor.ts"/>
/// <reference path="../../UI/Widgets/RsSlider.ts"/>
/// <reference path="../../UI/Editor.ts"/>

module Modules {
    export class ColorModule implements Core.HtmlModule
    {
        private sliders: {[name: string]: UI.Widgets.RsSlider} = {};
        private channels: Core.Channels = {
            red: 0,
            green: 0,
            blue: 0
        };

        constructor(private editor: UI.Editor) {}

        html() {
            return nunjucks.render('color.html.njs', {});
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
                slider.set(image.channels[key]);
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
                    var v = images[0].channels[key];
                    slider.set(v);

                    for (var i = 0; i < images.length; i++) {
                        if (v != images[i].channels[key]) {
                            slider.set(0, '-');

                            return;
                        }
                    }
                }
            );
        }

        init($el: JQuery) {
            $el.find('.m__color-slider').each((i, s) => {
                var $slider = $(s);

                this.sliders[$slider.data('name')] = <UI.Widgets.RsSlider>(new UI.Widgets.RsSlider(
                        $slider, $slider.data('min'), $slider.data('max'), $slider.data('step')
                    )).on('stopmove', (e) => {
                        var name = (<UI.Widgets.RsSlider>e.widget).getElement().data('name');
                        this.channels[name] = e.data;

                        this.doAction();
                    });
            });

            this.update();
        }

        deinit() {
            this.editor.getInterface().clearPopover();
        }

        icon() {
            return 'fa fa-stumbleupon-circle'
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

        doAction() {
            this.editor.getView().showLoading();

            var promiseArray: Promise<Core.RsImage>[] = [];

            this.editor.selected().forEach((img: Core.RsImage) => {
                    var act = new ChannelsAction(img, this.channels.red, this.channels.green, this.channels.blue);
                    promiseArray.push(img.getActionDispatcher().process(act));
                }
            );

            Promise.all(promiseArray).then(() => {
                this.editor.getView().update();
            });
        }
    }
}