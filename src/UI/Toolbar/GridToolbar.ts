module UI {
    export class GridToolbar extends Toolbar {
        constructor(page: Page, editor: UI.Editor) {
            super(page, editor);
        }

        render() {
            super.render();

            this.renderModuleToolbar(Core.ModuleViewType.GRID, this.$toolbar);

            this.editor.getInterface().initToolbar(this.$toolbar);
        }
    }
}
