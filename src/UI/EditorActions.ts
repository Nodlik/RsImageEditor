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

        }

        imageRedo() {

        }


        redo() {
            this.imageHistoryAction('Redo');
        }

        undo() {
            this.imageHistoryAction('Undo');
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
/*
                if (this.activeModule) {
                    if ((this.activeModule.viewType() == this.getType()) || (this.activeModule.viewType() == Core.ModuleViewType.ANY)) {
                        this.activeModule.selectImage(null);
                    }
                }*/
            });
        }
    }
}
