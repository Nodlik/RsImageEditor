/// <reference path="../../Core/Image/RsImage.ts"/>
/// <reference path="../../Core/Action/ImageAction.ts"/>

module Modules {
    export class CropAction implements Core.ImageAction {
        public needRender: boolean = false;

        private originalImage: ImageData;
        private oldWidth: number;
        private oldHeight: number;

        constructor(public image: Core.RsImage, private left: number, private top: number, private width: number, private height: number, private position: FitPosition = null) {

        }

        execute() {
            this.oldWidth = this.image.getWidth();
            this.oldHeight = this.image.getHeight();
            this.originalImage = this.image.getOriginalImage();

            var x = this.left;
            var y = this.top;

            if (this.position != null) {
                if ((this.position == FitPosition.TOP) || (this.position == FitPosition.BOTTOM)|| (this.position == FitPosition.CENTER)) {
                    x = (this.image.width - this.width) / 2;
                }
                else if ((this.position == FitPosition.RIGHT_TOP) || (this.position == FitPosition.RIGHT) || (this.position == FitPosition.RIGHT_BOTTOM)) {
                    x = (this.image.width - this.width);
                }
                if ((this.position == FitPosition.LEFT) || (this.position == FitPosition.RIGHT) || (this.position == FitPosition.CENTER)) {
                    y = (this.image.height - this.height) / 2;
                }
                else if ((this.position == FitPosition.LEFT_BOTTOM) || (this.position == FitPosition.BOTTOM) || (this.position == FitPosition.RIGHT_BOTTOM)) {
                    y = (this.image.height - this.height);
                }
            }

            this.image.crop(x, y, this.width, this.height);

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