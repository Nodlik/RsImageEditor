/// <reference path="../../ts/Module/HtmlModule.ts" />
/// <reference path="../../ts/Module/ModuleType.ts" />
/// <reference path="../../ts/Module/ModuleType.ts" />
/// <reference path="ResizeAction.ts" />

module Modules {
    export class ResizeModule implements Core.HtmlModule, Core.ActionModule {
        actions: ResizeAction[] = [];

        html() {
            return 'good';
        }

        init($el) {

        }

        icon() {
            return 'fa fa-icon'
        }

        type() {
            return Core.ModuleType.ACTION;
        }

        parent() {
            return null;
        }

        process() {
            var i: Core.RsImage = new Core.RsImage();

            var act = new ResizeAction(i);
            return i.getActionDispatcher().process(act);
        }
    }
}