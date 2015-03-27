/// <reference path="../../Core/Module/ActionModule.ts"/>
/// <reference path="../../Core/RsImageEditor.ts"/>
/// <reference path="../../UI/Widgets/RsSlider.ts"/>

module Modules {
    export class RemoveModule implements Core.ActionModule
    {
        constructor(private editor: Core.RsImageEditor) {}

        process() {
            this.editor.UI().selected().forEach((img) => {
                var act = new RemoveAction(img);
                img.getActionDispatcher().process(act);
            });

            if (this.editor.UI().getType() == Core.ModuleViewType.GRID) {
                this.editor.UI().getView().render();
            }
            else {
                this.editor.UI().back();
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