module UI {
    export class Toolbar {
        $toolbar: JQuery;

        constructor(private page: Page, public editor: Core.RsImageEditor) {
            this.$toolbar = this.editor.UI().getToolbarPlace();
        }

        render() {
            this.$toolbar.html("");
        }

        renderModuleToolbar(type: Core.ModuleViewType, $el: JQuery) {
            var modules = this.editor.getModuleManager().getModules( this.editor.UI().getType(), null );

            modules.forEach((m: Core.EditorModule) =>
                {
                    $el.append($('<div id="_m' + m.name() + '"><i class="' + m.icon() + '"</div>'));

                    this.editor.UI().initModule($el, m);
                }
            )
        }

        renderCommonButton($el: JQuery) {
            $el.append($('<div id="a_redo"><i class="fa fa-repeat"</div>'));
            $el.append($('<div id="a_undo"><i class="fa fa-undo"</div>'));
        }
    }
}
