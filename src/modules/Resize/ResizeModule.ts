/// <reference path="../../Core/Module/HtmlModule.ts"/>
/// <reference path="../../Core/RsImageEditor.ts"/>

module Modules {
    export class ResizeModule implements Core.HtmlModule
    {
        private isLocked: boolean = true;

        private $widthInput: JQuery;
        private $heightInput: JQuery;

        private $lock: JQuery;

        private image: Core.RsImage = null;

        constructor(private editor: Core.RsImageEditor) {}

        html() {
            return nunjucks.render('resize-single.dialog.html.njs', {
                isLocked: this.isLocked
            });
        }

        deinit() {
            this.editor.UI().clearPopover();
        }

        viewType(): Core.ModuleViewType {
            return Core.ModuleViewType.SINGLE;
        }

        init($el: JQuery) {
            this.image = this.editor.UI().selected()[0];

            this.$widthInput = $el.find('.m__single-resize__val.width input');
            this.$heightInput = $el.find('.m__single-resize__val.height input');

            this.$lock = $el.find('.m__single-resize__lock');

            this.$widthInput.val(this.image.width.toString());
            this.$heightInput.val(this.image.height.toString());

            var render =
                _.debounce(() => {
                    this.doAction(this.$widthInput.val(), this.$heightInput.val());
                }, 500);

            this.$lock.click(() => {
                if (this.isLocked) {
                    this.isLocked = false;

                    this.$lock.find('i').attr('class', 'fa fa-unlock');
                }
                else {
                    this.isLocked = true;
                    this.update(this.image);
                    render();

                    this.$lock.find('i').attr('class', 'fa fa-lock');
                }
            });

            this.$widthInput.on('input', () => {
                var val = parseInt(this.$widthInput.val());

                if (!isNaN(val) && (val >= 50)) {
                    if (this.isLocked) {
                        this.$heightInput.val( Math.round(this.image.getOriginalImage().height * val / this.image.getOriginalImage().width) + '' );
                    }

                    var h = parseInt(this.$heightInput.val());
                    if (!isNaN(h) && (h >= 30)) {
                        render();
                    }
                }
            });

            this.$heightInput.on('input', () => {
                var val = parseInt(this.$heightInput.val());

                if (!isNaN(val) && (val >= 30)) {
                    if (this.isLocked) {
                        this.$widthInput.val( Math.round(this.image.getOriginalImage().width * val / this.image.getOriginalImage().height) + '' );
                    }

                    var w = parseInt(this.$widthInput.val());
                    if (!isNaN(w) && (w >= 50)) {
                        render();
                    }
                }
            });
        }


        private update(image: Core.RsImage) {
            var w = parseInt(this.$widthInput.val());
            var h = parseInt(this.$heightInput.val());

            if (!isNaN(w) && !isNaN(h) && (w >= 50) && (h >= 30)) {
                if (w > h) {
                    this.$heightInput.val( Math.round(image.getOriginalImage().height * w / image.getOriginalImage().width) + '' );
                }
                else {
                    this.$widthInput.val( Math.round(image.getOriginalImage().width * h / image.getOriginalImage().height) + '' );
                }
            }
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
            var act = new ResizeAction(this.image, width, height);

            this.image.getActionDispatcher().process(act).then(() => {
                this.editor.UI().render();
            });
        }
    }
}