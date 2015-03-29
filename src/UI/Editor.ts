/// <reference path="../Core/RsImageEditor.ts"/>
/// <reference path="../Core/Image/ImageCollection.ts"/>
/// <reference path="../Core/Image/RsImage.ts"/>
/// <reference path="../Core/Action/EditorActionDispatcher.ts"/>
/// <reference path="Page.ts"/>
/// <reference path="Module/ModuleInitialization.ts"/>
/// <reference path="Widgets/RsProgressBar.ts"/>
/// <reference path="EditorInterface.ts"/>
/// <reference path="EditorActions.ts"/>

module UI {
    export class Editor {
        private page: Page = null;

        private gridPage = null;
        private singlePage = null;

        private activeModule: Core.EditorModule = null;

        private editorView: EditorInterface;
        private editorAction: EditorActions;

        private actionController: Core.EditorActionDispatcher;

        constructor(private $el: JQuery, private editor: Core.RsImageEditor, private images: Core.ImageCollection)
        {
            this.editorView = new EditorInterface($el, this);
            this.editorAction = new EditorActions(this);

            this.gridPage = new Page(this, this.images);
            this.singlePage = new Page(this, this.images, this.gridPage);

            this.actionController = new Core.EditorActionDispatcher();
        }

        getActionDispatcher(): Core.EditorActionDispatcher {
            return this.actionController;
        }

        getInterface(): EditorInterface {
            return this.editorView;
        }

        getActions(): EditorActions {
            return this.editorAction;
        }

        initModule($button: JQuery, editorModule: Core.EditorModule) {
            ModuleInitialization.init($button, editorModule, this);
        }

        getActiveModule(): Core.EditorModule {
            return this.activeModule;
        }

        setActiveModule(editorModule: Core.EditorModule) {
            this.activeModule = editorModule;
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
            if (this.activeModule != null) {
                this.activeModule.deinit();
            }

            this.getPage().render();

            this.getActions().doModuleAction(() => {
                ModuleInitialization.renderModule(this.activeModule, this);
            }, this.getType());
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

        openImageEditor(image: Core.ImageCollection) {
            this.singlePage.setImages(image);
            this.page = this.singlePage;

            this.render();
        }

        getImages(): Core.ImageCollection {
            return this.images;
        }

        unSelectImage(image: Core.RsImage) {
            this.page.renderToolbar();

            this.getActions().doModuleAction(() => {
                this.activeModule.unSelectImage(image);
            }, this.getType());
        }

        selectImage(image: Core.RsImage) {
            this.page.renderToolbar();

            this.getActions().doModuleAction(() => {
                this.activeModule.selectImage(image);
            }, this.getType());
        }
    }
}
