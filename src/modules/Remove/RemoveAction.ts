/// <reference path="../../Core/Image/RsImage.ts"/>
/// <reference path="../../Core/Image/ImageResizer.ts"/>
/// <reference path="../../Core/Action/ImageAction.ts"/>


module Modules {
    export class RemoveAction implements Core.ImageAction {
        public needRender: boolean = true;

        constructor(public image: Core.RsImage) {

        }

        execute() {
            this.image.isDeleted = true;
            return Promise.resolve(this.image);
        }

        unExecute() {
            this.image.isDeleted = false;
            return Promise.resolve(this.image);
        }
    }
}