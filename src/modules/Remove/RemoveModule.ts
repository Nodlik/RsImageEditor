/// <reference path="../../Core/Module/ActionModule.ts"/>
/// <reference path="../../Core/RsImageEditor.ts"/>
/// <reference path="../../UI/Widgets/RsSlider.ts"/>

module Modules {
    export class RemoveModule implements Core.ActionModule
    {
        constructor(private editor: UI.Editor) {}

        process() {
            this.editor.selected().forEach((img) => {
                var act = new RemoveAction(img);
                img.getActionDispatcher().process(act);
            });

            if (this.editor.getType() == Core.ModuleViewType.GRID) {
                this.editor.getView().render();
            }
            else {
                this.editor.back();
            }
        }

        viewType(): Core.ModuleViewType {
            return Core.ModuleViewType.ANY;
        }

        unSelectImage(image: Core.RsImage) {

        }

        selectImage(image: Core.RsImage) {

        }

        init($el: JQuery) {
        }

        deinit() {

        }

        icon() {
            return 'fa fa-remove'
        }

        type() {
            return Core.ModuleType.ACTION;
        }

        parent() {
            return null;
        }

        name() {
            return 'remove';
        }
    }
}