/// <reference path="../../Core/Image/RsImage.ts"/>
/// <reference path="../../Core/Action/ImageAction.ts"/>

module Modules {
    export class FitAction implements Core.ImageAction {
        public needRender: boolean = false;

        private originalImage: ImageData;
        private oldWidth: number;
        private oldHeight: number;

        private isCropped: boolean = false;

        private size: Size;

        constructor(public image: Core.RsImage, private rect: Rect, private method: FitMethod, private position: FitPosition, private isCanCrop: boolean) {
            if (method == FitMethod.RESIZE) {
                this.size = SizeCalculation.getFitSize(rect.width, rect.height, this.image.width, this.image.height);
            }
            else if (method == FitMethod.WIDTH) {
                this.size = SizeCalculation.getStretchWidthSize(rect.width, rect.height, this.image.width, this.image.height);
            }
            else if (method == FitMethod.HEIGHT) {
                this.size = SizeCalculation.getStretchHeightSize(rect.width, rect.height, this.image.width, this.image.height);
            }
            else {
                this.size = SizeCalculation.getStretchRectSize(rect.width, rect.height, this.image.width, this.image.height);
            }
        }

        execute() {
            this.oldWidth = this.image.getWidth();
            this.oldHeight = this.image.getHeight();

            if ((this.size.width > this.rect.width) || (this.size.height > this.rect.height)) {
                this.originalImage = this.image.getOriginalImage();
                this.isCropped = true;
            }

            this.image.width = this.size.width | 0;
            this.image.height = this.size.height | 0;

            return this.image.save().then((image) => {
                if ((this.isCropped) && (this.isCanCrop)) {
                    var x = 0;
                    var y = 0;

                    var w = this.image.width;
                    if (w > this.rect.width) {
                        w = this.rect.width;


                        if ((this.position == FitPosition.TOP) || (this.position == FitPosition.BOTTOM)) {
                            x = (this.image.width - this.rect.width) / 2;
                        }
                        else if ((this.position == FitPosition.RIGHT_TOP) || (this.position == FitPosition.RIGHT) || (this.position == FitPosition.RIGHT_BOTTOM)) {
                            x = (this.image.width - this.rect.width);
                        }
                    }

                    var h = this.image.height;
                    if (h > this.rect.height) {
                        h = this.rect.height;

                        if ((this.position == FitPosition.LEFT) || (this.position == FitPosition.RIGHT)) {
                            y = (this.image.height - this.rect.height) / 2;
                        }
                        else if ((this.position == FitPosition.LEFT_BOTTOM) || (this.position == FitPosition.BOTTOM) || (this.position == FitPosition.RIGHT_BOTTOM)) {
                            y = (this.image.height - this.rect.height);
                        }
                    }

                    return this.image.getImage().then((img) => {
                        this.image.crop(x, y, w, h);
                        return this.image.save();
                    });

                }
                else {
                    return Promise.resolve(image)
                }
            });
        }

        unExecute() {
            this.image.width = this.oldWidth;
            this.image.height = this.oldHeight;

            if ((this.isCropped) && (this.isCanCrop)) {
                this.image.replaceOriginal(this.originalImage);
            }

            return this.image.save();
        }
    }
}