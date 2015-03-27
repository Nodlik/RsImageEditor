/// <reference path="../../Core/Image/RsImage.ts"/>
/// <reference path="../../Core/Image/ImageResizer.ts"/>
/// <reference path="../../Core/Action/ImageAction.ts"/>


module Modules {
    export class BrightnessAction implements Core.ImageAction {
        public needRender: boolean = false;
        private oldBrightness: number;

        constructor(public image: Core.RsImage, private brightness: number) {

        }

        execute() {
            this.oldBrightness = this.image.brightness;

            this.image.brightness = this.brightness;

            return this.image.save();
        }

        unExecute() {
            this.image.brightness = this.oldBrightness;

            return this.image.save();
        }
    }
}