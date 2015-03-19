module UI {
    export class ModuleInitialization {
        static init($button: JQuery, editorModule: Core.EditorModule, editor: Core.RsImageEditor): Core.EditorModule {
            if (editorModule.type() == Core.ModuleType.ACTION) {
                this.initAction($button, editorModule, editor);
            }
            else if (editorModule.type() == Core.ModuleType.DELEGATE) {
                this.initDelegate($button, editorModule, editor);
            }
            else {
                alert('GROUP!!!');
            }

            return editorModule;
        }

        static initAction($button: JQuery, editorModule: Core.EditorModule, editor: Core.RsImageEditor) {

        }

        static initDelegate($button: JQuery, editorModule: Core.EditorModule, editor: Core.RsImageEditor) {
            $button.click(() =>
                {
                    if (editor.UI().getActiveModule() != null) {
                        editor.UI().getActiveModule().deinit();
                    }

                    (<Core.HtmlModule> editorModule).init(
                        editor.UI().showPopover((<Core.HtmlModule> editorModule).html())
                    );

                    editor.UI().setActiveModule(editorModule);

                    return false;
                }
            );
        }
    }
}
