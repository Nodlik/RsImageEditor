/// <reference path="../../Core/Image/RsImage.ts"/>
/// <reference path="../../Core/Image/ImageResizer.ts"/>
/// <reference path="../../Core/Action/ImageAction.ts"/>


module Modules {
    export class ImageAction implements Core.ImageAction {
        public needRender: boolean = false;
        private oldValue: number;

        constructor(public image: Core.RsImage, public prop: string, private newValue: number) {

        }

        execute() {
            this.oldValue = this.image[this.prop];

            this.image[this.prop] = this.newValue;

            return this.image.save();
        }

        unExecute() {
            this.image[this.prop] = this.oldValue;

            return this.image.save();
        }
    }
}