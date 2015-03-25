module Modules {
    export class SizeCalculation {
        static getFitSize(rectWidth: number, rectHeight: number, imageWidth: number, imageHeight: number): Size {
            if ((imageWidth <= rectWidth) && (imageHeight <= rectHeight)) {
                return {width: imageWidth, height: imageHeight}
            }

            var k = Math.min(rectWidth / imageWidth, rectHeight / imageHeight);
            return {width: imageWidth * k, height: imageHeight * k}
        }

        static getStretchWidthSize(rectWidth: number, rectHeight: number, imageWidth: number, imageHeight: number): Size {
            return {
                width: rectWidth,
                height: rectWidth / ( imageWidth / imageHeight )
            }
        }

        static getStretchHeightSize(rectWidth: number, rectHeight: number, imageWidth: number, imageHeight: number): Size {
            return {
                width: rectHeight * (imageWidth / imageHeight),
                height: rectHeight
            }
        }

        static getStretchRectSize(rectWidth: number, rectHeight: number, imageWidth: number, imageHeight: number): Size {
            var k = Math.max(rectWidth / imageWidth, rectHeight / imageHeight);

            return {width: imageWidth * k, height: imageHeight * k}
        }
    }
}
