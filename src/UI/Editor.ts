/// <reference path="../Core/RsImageEditor.ts"/>
/// <reference path="../Core/Image/ImageCollection.ts"/>
/// <reference path="../Core/Image/RsImage.ts"/>
/// <reference path="Page.ts"/>
/// <reference path="Module/ModuleInitialization.ts"/>
/// <reference path="Widgets/RsProgressBar.ts"/>

/// <reference path="EditorView.ts"/>
/// <reference path="EditorActions.ts"/>

module UI {
    export class Editor {
        private page: Page = null;

        private gridPage = null;
        private singlePage = null;

        private activeModule: Core.EditorModule = null;

        private editorView: EditorView;
        private editorAction: EditorActions;

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

            this.editorView = new EditorView($el);
            this.editorAction = new EditorActions(this);

            this.gridPage = new Page(this, this.images);
            this.singlePage = new Page(this, this.images, this.gridPage);
        }

        getInterface(): EditorView {
            return this.editorView;
        }

        getActions(): EditorActions {
            return this.editorAction;
        }

        initModule($button: JQuery, editorModule: Core.EditorModule) {
            ModuleInitialization.init($button, editorModule, this);
        }

        getActiveModule(): Promise<Core.EditorModule> {
            if (this.activeModule) {
                return Promise.resolve(this.activeModule);
            }

            return Promise.reject(null);
        }

        setActiveModule(editorModule: Core.EditorModule) {
            this.activeModule = editorModule;
        }

        initToolbar($toolbar: JQuery) {
            if (this.activeModule != null) {
                $toolbar.find('#t-button__' + this.activeModule.name()).addClass('active');
            }

            $toolbar.find('#t-button__redo').click(() => {
                this.editorAction.redo();

                return false;
            });

            $toolbar.find('#t-button__undo').click(() => {
                this.editorAction.undo();

                return false;
            });
        }

        getView(): ViewInterface {
            return this.getPage().getView();
        }


        back() {
            if (this.page.hasParent()) {
                this.page = this.page.getParent();

                this.render();
            }
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
            this.getActiveModule().then((m) => {
                m.deinit();
            });

            this.getPage().render();

            this.getActiveModule().then((m) => {
                if ((m.viewType() == this.getType()) || (m.viewType() == Core.ModuleViewType.ANY)) {
                    ModuleInitialization.renderModule(m, this);
                }
            });
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

                this.getActiveModule().then((m) => {
                    if ((m.viewType() == this.getType()) || (m.viewType() == Core.ModuleViewType.ANY)) {
                        m.unSelectImage(image);
                    }
                });
            }
            else {
                $el.addClass('rs-image-selected');

                this.getActiveModule().then((m) => {
                    if ((m.viewType() == this.getType()) || (m.viewType() == Core.ModuleViewType.ANY)) {
                        m.selectImage(image);
                    }
                });
            }
        }
    }
}
