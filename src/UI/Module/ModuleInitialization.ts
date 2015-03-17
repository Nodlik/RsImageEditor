module UI {
    export class ModuleInitialization {
        static init($button: JQuery, editorModule: Core.EditorModule, editor: Core.RsImageEditor) {
            if (editorModule.type() == Core.ModuleType.ACTION) {
                this.initAction($button, editorModule, editor);
            }
            else if (editorModule.type() == Core.ModuleType.DELEGATE) {
                this.initDelegate($button, editorModule, editor);
            }
            else {
                alert('GROUP!!!');
            }
        }

        static initAction($button: JQuery, editorModule: Core.EditorModule, editor: Core.RsImageEditor) {

        }

        static initDelegate($button: JQuery, editorModule: Core.EditorModule, editor: Core.RsImageEditor) {
            $button.click(() =>
                {
                    (<Core.HtmlModule> editorModule).init(
                        editor.UI().showPopover((<Core.HtmlModule> editorModule).html())
                    );

                    return false;
                }
            );
        }
    }
}
