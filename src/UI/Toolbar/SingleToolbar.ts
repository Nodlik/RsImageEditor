module UI {
    export class SingleToolbar extends Toolbar {
        constructor(page: Page, editor: UI.Editor) {
            super(page, editor);
        }

        render() {
            super.render();

            this.renderModuleToolbar(Core.ModuleViewType.SINGLE, this.$toolbar);

            this.editor.initToolbar(this.$toolbar);
        }
    }
}
