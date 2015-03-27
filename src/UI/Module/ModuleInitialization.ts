module UI {
    export class ModuleInitialization {
        static init($button: JQuery, editorModule: Core.EditorModule, editor: UI.Editor): Core.EditorModule {
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

        static initAction($button: JQuery, editorModule: Core.EditorModule, editor: UI.Editor) {
            $button.click(() =>
                {
                    (<Core.ActionModule>editorModule).process();
                }
            );
        }

        static initDelegate($button: JQuery, editorModule: Core.EditorModule, editor: UI.Editor) {
            $button.click(() =>
                {
                    $('.rs-toolbar-button').removeClass('active');

                    $button.addClass('active');
                    this.renderModule(editorModule, editor);
                }
            );
        }

        static renderModule(editorModule: Core.EditorModule, editor: UI.Editor) {
            editor.getActiveModule().then((m) => {
                m.deinit();
            });

            (<Core.HtmlModule> editorModule).init(
                editor.getInterface().showPopover((<Core.HtmlModule> editorModule).html())
            );

            editor.setActiveModule(editorModule);

            return false;
        }
    }
}
