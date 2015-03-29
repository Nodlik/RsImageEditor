module UI {
    export class SingleToolbar extends Toolbar {
        constructor(page: Page, editor: UI.Editor) {
            super(page, editor);
        }

        render() {
            super.render();

            this.renderDelimiter(this.$toolbar);
            this.renderUndoRedoButton(this.$toolbar);

            var $group = $('<div class="rs-toolbar-group"></div>');
            this.$toolbar.append($group);

            this.renderModuleToolbar(Core.ModuleViewType.SINGLE, $group, 't-grid-button');
            this.$editorToolbar.append(
                ($(nunjucks.render('toolbar.button.html.njs', {
                    button: {
                        name: 'download',
                        icon: 'fa fa-download',
                        localizedName: 'download'
                    }
                })))
            );
            this.renderRemoveButton(this.$editorToolbar);

            this.editor.getInterface().initToolbar(this.$toolbar);
            this.editor.getInterface().initEditorToolbar(this.$editorToolbar);
        }
    }
}
