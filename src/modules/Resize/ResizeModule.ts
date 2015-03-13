module Modules {
    export class ResizeModule implements Core.HtmlModule, Core.ActionModule {
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

        name() {
            return 'resize';
        }

        process(): Promise<Core.RsImage> {
            var i: Core.RsImage = new Core.RsImage('1', '2', '3');

            var act = new ResizeAction(i);
            return i.getActionDispatcher().process(act);
        }
    }
}