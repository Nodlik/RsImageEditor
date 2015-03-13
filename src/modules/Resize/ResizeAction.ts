module Modules {
    export class ResizeAction implements Core.EditorAction {
        constructor(public image: Core.RsImage) {
            this.image = image;
        }

        execute() {
            return Promise.resolve(this.image);
        }

        unExecute() {
            return Promise.resolve(this.image);
        }
    }
}