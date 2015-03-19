/// <reference path="../../Core/Image/RsImage.ts"/>
/// <reference path="../../Core/Action/EditorAction.ts"/>

module Modules {
    export class CropAction implements Core.EditorAction {
        private originalImage: ImageData;
        private oldWidth: number;
        private oldHeight: number;

        constructor(public image: Core.RsImage, private left: number, private top: number, private width: number, private height: number) {

        }

        execute() {
            this.oldWidth = this.image.getWidth();
            this.oldHeight = this.image.getHeight();
            this.originalImage = this.image.getOriginalImage();

            this.image.crop(this.left, this.top, this.width, this.height);

            return this.image.save();
        }

        unExecute() {
            this.image.width = this.oldWidth;
            this.image.height = this.oldHeight;
            this.image.replaceOriginal(this.originalImage);

            return this.image.save();
        }
    }
}