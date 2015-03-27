/// <reference path="../Core/RsImageEditor.ts"/>
/// <reference path="../Core/Image/ImageCollection.ts"/>
/// <reference path="../Core/Image/RsImage.ts"/>
/// <reference path="Page.ts"/>
/// <reference path="Module/ModuleInitialization.ts"/>
/// <reference path="Widgets/RsProgressBar.ts"/>

module UI {
    export class EditorActions {
        constructor(private controller: Editor)
        {
        }

        imageUndo() {
            this.imageHistoryAction('Undo');
        }

        imageRedo() {
            this.imageHistoryAction('Redo');
        }


        redo() {

        }

        undo() {

        }

        doModuleAction(action, type: Core.ModuleViewType = Core.ModuleViewType.ANY) {
            if (this.controller.getActiveModule() != null) {
                var m = this.controller.getActiveModule();

                if ((m.viewType() == type) || (m.viewType() == Core.ModuleViewType.ANY)) {
                    action.call(this.controller, m);
                }
            }
        }

        private getView(): ViewInterface {
            return this.controller.getView();
        }

        private imageHistoryAction(action: string) {
            var p = [];
            this.getView().showLoading();

            this.getView().getActualImage().forEach((img) => {
                var act = img.getActionDispatcher()['get' + action + 'Action']();

                if ((act) && (act.needRender)) {
                    this.getView().needRefresh = true;
                }

                p.push(img.getActionDispatcher()[action.toLowerCase()]());
            });

            Promise.all(p).then(() => {
                this.getView().update();
                this.doModuleAction((m) => {
                    m.update();
                }, this.controller.getType());
            });
        }
    }
}
