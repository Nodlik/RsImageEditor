/// <reference path="../../ts/Action/EditorAction.ts" />
/// <reference path="../../ts/Image/RsImage.ts" />

module Modules {
    export class ResizeAction implements Core.EditorAction {
        public image: Core.RsImage;

        constructor(image: Core.RsImage) {
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