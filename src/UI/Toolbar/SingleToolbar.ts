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
            this.renderRemoveButton($group);


            this.editor.getInterface().initToolbar(this.$toolbar);
            this.editor.getInterface().initEditorToolbar(this.$editorToolbar);
        }
    }
}
