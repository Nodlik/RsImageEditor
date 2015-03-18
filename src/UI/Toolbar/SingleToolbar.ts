module UI {
    export class SingleToolbar extends Toolbar {
        constructor(page: Page, editor: Core.RsImageEditor) {
            super(page, editor);
        }

        render() {
            super.render();

            this.renderModuleToolbar(Core.ModuleViewType.SINGLE, this.$toolbar);

            this.editor.UI().initToolbar(this.$toolbar);
        }
    }
}
