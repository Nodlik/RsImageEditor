/// <reference path="../../Core/Module/HtmlModule.ts"/>
/// <reference path="../../Core/RsImageEditor.ts"/>

module Modules {
    export class CropModule implements Core.HtmlModule
    {
        constructor(private editor: Core.RsImageEditor) {}

        html() {
            return nunjucks.render('crop.dialog.html.njs', {});
        }

        init($el: JQuery) {
            if (this.editor.UI().getType() == Core.ModuleViewType.SINGLE) {
                var $canvas = this.editor.UI().getImagePlace().find('canvas');
            }
            //
        }

        icon() {
            return 'fa fa-crop'
        }

        type() {
            return Core.ModuleType.DELEGATE;
        }

        parent() {
            return null;
        }

        name() {
            return 'crop';
        }

        doAction() {

        }
    }
}