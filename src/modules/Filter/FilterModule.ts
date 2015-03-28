/// <reference path="../../Core/Module/HtmlModule.ts"/>
/// <reference path="../../Core/RsImageEditor.ts"/>
/// <reference path="../../UI/Widgets/RsSlider.ts"/>
/// <reference path="../../UI/Editor.ts"/>

module Modules {
    export class FilterModule implements Core.HtmlModule
    {
        private image: Core.RsImage = null;
        private $el: JQuery;

        private widget: FiltersListWidget;

        constructor(private editor: UI.Editor) {}

        html() {
            return nunjucks.render('filters.html.njs', {});
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

        update() {
            this.updateSelectState(true);
        }

        private updateSelectState(forceUpdate = false) {
            if (this.editor.selected().length > 0) {
                this.$el.show();

                var img = this.editor.selected()[0];
                if ((img != this.image) || (forceUpdate)) {
                    if (this.widget != null) {
                        this.widget.destroy();
                    }

                    this.image = img;
                    this.initWidget();
                }

                if (this.widget == null) {
                    this.initWidget();
                }
            }
            else {
                this.$el.hide();
            }
        }

        private initWidget() {
            var filter = '';
            if (this.image.filter != null) {
                filter = this.image.filter.name;
            }

            this.widget = new FiltersListWidget(this.$el, filter);
            this.widget.draw(this.image);

            this.widget.on('filter', (e) => {
                this.doAction(e.data.filter, e.data.vignette);
            });

            this.widget.on('reset', (e) => {
                this.doAction('reset');
            });
        }

        init($el: JQuery) {
            this.$el = $el;

            this.updateSelectState(true);
        }

        deinit() {
            if (this.widget != null) {
                this.widget.destroy();
                this.widget = null;
            }

            this.editor.getInterface().clearPopover();
        }

        icon() {
            return 'fa fa-filter'
        }

        type() {
            return Core.ModuleType.DELEGATE;
        }

        parent() {
            return null;
        }

        name() {
            return 'filter';
        }

        doAction(filterName, vignette: boolean = false) {
            this.editor.getView().showLoading();

            var promiseArray: Promise<Core.RsImage>[] = [];

            this.editor.selected().forEach((img: Core.RsImage) => {
                    var act = new FilterAction(img, filterName, vignette);
                    promiseArray.push(img.getActionDispatcher().process(act));
                }
            );

            Promise.all(promiseArray).then(() => {
                this.editor.getView().update();
            });
        }
    }
}