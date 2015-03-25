/// <reference path="../Core/RsImageEditor.ts"/>
/// <reference path="../Core/Image/ImageCollection.ts"/>
/// <reference path="../Core/Image/RsImage.ts"/>
/// <reference path="Page.ts"/>
/// <reference path="Module/ModuleInitialization.ts"/>
/// <reference path="Widgets/RsProgressBar.ts"/>

module UI {
    export class Editor {
        private page: Page = null;

        private gridPage = null;
        private singlePage = null;

        private $imagePlace: JQuery;
        private $toolbarPlace: JQuery;
        private $popOver: JQuery;
        private $informationPlace: JQuery;

        private progressBar: Widgets.RsProgressBar;

        private activeModule: Core.EditorModule = null;

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
            this.$informationPlace = this.$el.find('#rsInformation');

            this.progressBar = new UI.Widgets.RsProgressBar(this.$el.find('#rsProgressBar'));
            this.progressBar.on('stop', (e) => {
                this.progressBar.stop('Loading complete!');
            });

            this.gridPage = new Page(this, this.images);
            this.singlePage = new Page(this, this.images, this.gridPage);
        }


        showLoader(opCount: number) {
            this.progressBar.start('Loading image...', opCount);
        }

        progressLoader(op: number) {
            this.progressBar.setProgress(op, 'Image ' + op + ' from ' + this.progressBar.getOpCount());
        }


        initModule($button: JQuery, editorModule: Core.EditorModule) {
            ModuleInitialization.init($button, editorModule, this.editor);
        }

        getActiveModule(): Core.EditorModule {
            return this.activeModule;
        }

        setActiveModule(editorModule: Core.EditorModule) {
            this.activeModule = editorModule;
        }


        initToolbar($toolbar: JQuery) {
            if (this.activeModule != null) {
                $toolbar.find('#t-button__' + this.activeModule.name()).addClass('active');
            }

            $toolbar.find('#t-button__redo').click(() => {
                this.redo();

                return false;
            });

            $toolbar.find('#t-button__undo').click(() => {
                this.undo();

                return false;
            });
        }

        getView(): ViewInterface {
            return this.getPage().getView();
        }

        redo() {
            var p = [];
            this.selected().forEach((img) => {
                p.push(img.getActionDispatcher().redo());
            });

            Promise.all(p).then(() => {
                this.render();
            });
        }

        undo() {
            var p = [];
            this.selected().forEach((img) => {
                p.push(img.getActionDispatcher().undo());
            });

            Promise.all(p).then(() => {
                this.render();
            });
        }

        showPopover(content: string): JQuery {
            this.$popOver.html(content);
            this.$popOver.show();

            return this.$popOver;
        }

        clearPopover() {
            this.$popOver.html("");
            this.$popOver.hide();
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

        getInformationPlace(): JQuery {
            return this.$informationPlace;
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
                if (this.images.count() == 1) {
                    this.page = this.singlePage;
                }
                else {
                    this.page = this.gridPage;
                }
            }

            return this.page;
        }

        getType(): Core.ModuleViewType {
            return this.getPage().getView().type();
        }

        render() {
            if (this.activeModule != null) {
                this.activeModule.deinit();
            }

            this.getPage().render();

            if (this.activeModule != null) {
                if ((this.activeModule.viewType() == this.getType()) || (this.activeModule.viewType() == Core.ModuleViewType.ANY)) {
                    ModuleInitialization.renderModule(this.activeModule, this.editor);
                }
            }
        }

        appendImage(image: Core.RsImage) {
            this.gridPage.appendImage(image);

            if (this.images.count() == 1) {
                this.singlePage.setImages(this.images.getImage(this.images.getImages()[0].getId()));
                this.page = this.singlePage;
            }
            else {
                this.page = this.gridPage;
            }
        }

        /**
         * Go to single image editor
         *
         * @param imageId
         */
        private editImage(imageId: string) {
            var image = this.images.getImage(imageId);

            this.singlePage.setImages(image);
            this.page = this.singlePage;

            this.render();
        }

        private selectImage($el: JQuery) {
            var image = this.images.getImage($el.data('id')).getImages()[0];

            if ($el.hasClass('rs-image-selected')) {
                $el.removeClass('rs-image-selected');

                if (this.activeModule) {
                    this.activeModule.unSelectImage( image );
                }
            }
            else {
                $el.addClass('rs-image-selected');

                if (this.activeModule) {
                    this.activeModule.selectImage( image );
                }
            }
        }
    }
}
