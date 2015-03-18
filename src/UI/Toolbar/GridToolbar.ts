module UI {
    export class GridToolbar extends Toolbar {
        constructor(page: Page, editor: Core.RsImageEditor) {
            super(page, editor);
        }

        render() {
            super.render();

            this.renderModuleToolbar(Core.ModuleViewType.GRID, this.$toolbar);

            this.editor.UI().initToolbar(this.$toolbar);
        }
    }
}
