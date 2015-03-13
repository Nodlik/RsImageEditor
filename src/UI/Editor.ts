module UI {
    export class Editor {
        private page: Page = null;
        private $imagePlace: JQuery;

        constructor(private $el: JQuery, private editor: Core.RsImageEditor, private images: Core.ImageCollection)
        {
            this.$el.append($('<input type="file" id="rsFileInput" multiple />'));
            this.$el.find('#rsFileInput').on('change',
                function() {
                    editor.getLoader().load(this.files);
                }
            );

            this.$el.append($('<div id="rsImagePlace"></div>'));
            this.$imagePlace = this.$el.find('#rsImagePlace');
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

        /**
         * Get selected image in editor
         * @returns {any[]}
         */
        selected(): Core.RsImage[] {
            return [];
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

        render() {
            this.getPage().render();
        }
    }
}
