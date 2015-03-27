module UI {
    export class GridToolbar extends Toolbar {
        constructor(page: Page, editor: UI.Editor) {
            super(page, editor);
        }

        render() {
            super.render();

            this.renderDelimiter(this.$toolbar);

            if (this.editor.selected().length > 0) {
                var $group = $('<div class="rs-toolbar-group"></div>');
                this.$toolbar.append($group);

                this.renderUndoRedoButton($group);
                this.renderDelimiter($group);
                this.renderModuleToolbar(Core.ModuleViewType.GRID, $group, 't-grid-button');
                this.renderDelimiter($group);
                this.renderRemoveButton($group);
            }

            if (this.editor.getActionDispather().canUndo()) {
                this.$editorToolbar.append($(nunjucks.render('toolbar.button.html.njs', {
                    button: {
                        name: 'undo-editor',
                        icon: 'fa fa-undo',
                        localizedName: 'undo-editor'
                    }
                })));
            }

            if (this.editor.getActionDispather().canRedo()) {
                this.$editorToolbar.append($(nunjucks.render('toolbar.button.html.njs', {
                    button: {
                        name: 'redo-editor',
                        icon: 'fa fa-repeat',
                        localizedName: 'redo-editor'
                    }
                })));
            }

            this.editor.getInterface().initToolbar(this.$toolbar);
            this.editor.getInterface().initEditorToolbar(this.$editorToolbar);
        }
    }
}
