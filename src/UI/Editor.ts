/// <reference path="../Core/RsImageEditor.ts"/>
/// <reference path="../Core/Image/ImageCollection.ts"/>
/// <reference path="../Core/Image/RsImage.ts"/>
/// <reference path="Page.ts"/>
/// <reference path="Module/ModuleInitialization.ts"/>

module UI {
    export class Editor {
        private page: Page = null;
        private $imagePlace: JQuery;
        private $toolbarPlace: JQuery;
        private $popOver: JQuery;

        constructor(private $el: JQuery, private editor: Core.RsImageEditor, private images: Core.ImageCollection)
        {
            this.$el.html(nunjucks.render('editor.html.njs', {}));

            var $fileLoader = this.$el.find('#rsFileInput');
            $fileLoader.on('change',
                function() {
                    editor.getLoader().load(this.files);
                }
            );

            this.$el.on('click', '#t-button__upload', () => {
                $fileLoader.trigger('click');

                return false;
            });

            this.$el.on('click', '.rs-image-block, .rs-image-data__inf', (e: JQueryEventObject) => {
                this.editImage(
                    $(e.target).closest('.rs-image').data('id')
                );
            });

            this.$el.on('click', '#t-button__back', () => {
                this.back();

                return false;
            });

            this.$el.on('click', '.rs-image-selection-checkbox', (e: JQueryEventObject) => {
                this.selectImage($(e.target).closest('.rs-image'));
            });

            this.$toolbarPlace = this.$el.find('#rsToolbarPlace');
            this.$popOver = this.$el.find('#rsPopover');
            this.$imagePlace = this.$el.find('#rsImagePlace');
        }


        initModule($button: JQuery, editorModule: Core.EditorModule) {
            ModuleInitialization.init($button, editorModule, this.editor);
        }

        initToolbar($toolbar: JQuery) {
            $toolbar.find('#t-button__redo').click(() => {
                this.redo();

                return false;
            });

            $toolbar.find('#t-button__undo').click(() => {
                this.undo();

                return false;
            });
        }

        redo() {
            var p = [];
            this.selected().forEach((img) => {
                p.push(img.getActionDispatcher().redo());
            });

            Promise.all(p).then(() => {
                this.getPage().getView().render();
            });
        }

        undo() {
            var p = [];
            this.selected().forEach((img) => {
                p.push(img.getActionDispatcher().undo());
            });

            Promise.all(p).then(() => {
                this.getPage().getView().render();
            });
        }

        showPopover(content: string): JQuery {
            this.$popOver.html(content);
            this.$popOver.show();

            return this.$popOver;
        }

        back() {
            if (this.page.hasParent()) {
                this.page = this.page.getParent();

                this.render();
            }
        }

        getImagePlace(): JQuery {
            return this.$imagePlace;
        }

        getToolbarPlace(): JQuery {
            return this.$toolbarPlace;
        }

        /**
         * Get selected image in editor
         * @returns Core.RsImage[]
         */
        selected(): Core.RsImage[] {
            return this.getPage().getView().selected();
        }

        getEditor(): Core.RsImageEditor {
            return this.editor;
        }

        getPage(): Page {
            if (this.page == null) {
                this.page = new Page(this, this.images);
            }

            return this.page;
        }

        getType(): Core.ModuleViewType {
            return this.getPage().getView().type();
        }

        render() {
            this.getPage().render();
        }


        /**
         * Go to single image editor
         *
         * @param imageId
         */
        private editImage(imageId: string) {
            var image = this.images.getImage(imageId);

            this.page = new Page(this, image, this.page);
            this.render();
        }

        private selectImage($el: JQuery) {
            if ($el.hasClass('rs-image-selected')) {
                $el.removeClass('rs-image-selected');
            }
            else {
                $el.addClass('rs-image-selected');
            }
        }
    }
}
