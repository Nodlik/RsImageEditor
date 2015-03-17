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
            this.$el.append($('<input type="file" id="rsFileInput" multiple />'));
            this.$el.find('#rsFileInput').on('change',
                function() {
                    editor.getLoader().load(this.files);
                }
            );

            // todo add template
            this.$el.append($('<div id="rsToolbarPlace"></div>'));
            this.$toolbarPlace = this.$el.find('#rsToolbarPlace');


            this.$el.append($('<div id="rsPopover" style="display: none"></div>'));
            this.$popOver = this.$el.find('#rsPopover');

            this.$el.append($('<div id="rsImagePlace"></div>'));
            this.$imagePlace = this.$el.find('#rsImagePlace');
        }

        initModule($button: JQuery, editorModule: Core.EditorModule) {
            ModuleInitialization.init($button, editorModule, this.editor);
        }

        initToolbar($toolbar: JQuery) {
            $toolbar.find('#a_redo').click(() => {
                this.redo();

                return false;
            });

            $toolbar.find('#a_undo').click(() => {
                this.undo();

                return false;
            });
        }

        redo() {
            this.selected().forEach((img) => {
                img.getActionDispatcher().redo()
                    .then(() => {
                        this.getPage().getView().render();
                    });
            });
        }

        undo() {
            this.selected().forEach((img) => {
                img.getActionDispatcher().undo()
                    .then(() => {
                        this.getPage().getView().render();
                    });
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
    }
}
