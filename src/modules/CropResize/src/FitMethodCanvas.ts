
module Modules {
    interface FitSize {
        rect: Size;
        image: Size;
    }

    export class FitMethodCanvas {
        private context: CanvasRenderingContext2D;

        private canvasWidth = 120;
        private canvasHeight = 120;
        private canvasPadding = 20;

        constructor(private canvas: HTMLCanvasElement) {
            this.context = this.canvas.getContext('2d');
        }

        private initCanvas() {
            this.canvas.width = this.canvasWidth;
            this.canvas.height = this.canvasHeight;

            this.context.fillStyle = '#FFFFFF';
            this.context.strokeStyle = '#000000';
            this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        }

        private getNewSize(rect: Size, image: Size): FitSize {
            var k = Math.min(
                    (this.canvasWidth - this.canvasPadding * 2) / Math.max(rect.width, image.width),
                    (this.canvasHeight - this.canvasPadding * 2) / Math.max(rect.height, image.height)
            );

            return {
                rect: {width: rect.width * k, height: rect.height * k},
                image: {width: image.width * k, height: image.height * k}
            }
        }

        drawResizeAll(rectWidth, rectHeight, imageWidth, imageHeight) {
            this.initCanvas();

            var sizes = this.getNewSize(
                {width: rectWidth, height: rectHeight},
                SizeCalculation.getFitSize(rectWidth, rectHeight, imageWidth, imageHeight)
            );

            this.context.strokeRect(this.canvasPadding, this.canvasPadding, sizes.rect.width, sizes.rect.height);
            this.context.strokeStyle = '#FF0000';

            this.context.strokeRect(this.canvasPadding, this.canvasPadding, sizes.image.width, sizes.image.height);
        }

        drawStretchToWidth(rectWidth, rectHeight, imageWidth, imageHeight) {
            this.initCanvas();

            var sizes = this.getNewSize(
                {width: rectWidth, height: rectHeight},
                SizeCalculation.getStretchWidthSize(rectWidth, rectHeight, imageWidth, imageHeight)
            );

            this.context.strokeRect(this.canvasPadding, this.canvasPadding, sizes.rect.width, sizes.rect.height);
            this.context.strokeStyle = '#FF0000';

            var visibleRect: Size = {
                width: sizes.image.width,
                height: sizes.image.height
            };

            if (sizes.image.height > sizes.rect.height) {
                visibleRect.height = sizes.rect.height;
            }

            this.context.strokeRect(this.canvasPadding, this.canvasPadding, visibleRect.width, visibleRect.height);

            if (sizes.image.height > sizes.rect.height) {
                this.context.setLineDash([2]);
                this.context.strokeRect(this.canvasPadding, this.canvasPadding + visibleRect.height, visibleRect.width, sizes.image.height - visibleRect.height);
            }
        }

        drawStretchToHeight(rectWidth, rectHeight, imageWidth, imageHeight) {
            this.initCanvas();

            var sizes = this.getNewSize(
                {width: rectWidth, height: rectHeight},
                SizeCalculation.getStretchHeightSize(rectWidth, rectHeight, imageWidth, imageHeight)
            );

            this.context.strokeRect(this.canvasPadding, this.canvasPadding, sizes.rect.width, sizes.rect.height);
            this.context.strokeStyle = '#FF0000';

            var visibleRect: Size = {
                width: sizes.image.width,
                height: sizes.image.height
            };

            if (sizes.image.width > sizes.rect.width) {
                visibleRect.width = sizes.rect.width;
            }

            this.context.strokeRect(this.canvasPadding, this.canvasPadding, visibleRect.width, visibleRect.height);

            if (sizes.image.width > sizes.rect.width) {
                this.context.setLineDash([2]);
                this.context.strokeRect(this.canvasPadding+ visibleRect.width, this.canvasPadding, sizes.image.width - visibleRect.width, sizes.image.height);
            }
        }

        drawStretchToRect(rectWidth, rectHeight, imageWidth, imageHeight) {
            this.initCanvas();

            var sizes = this.getNewSize(
                {width: rectWidth, height: rectHeight},
                SizeCalculation.getStretchRectSize(rectWidth, rectHeight, imageWidth, imageHeight)
            );

            this.context.strokeRect(this.canvasPadding, this.canvasPadding, sizes.rect.width, sizes.rect.height);
            this.context.strokeStyle = '#FF0000';

            var visibleRect: Size = {
                width: sizes.image.width,
                height: sizes.image.height
            };

            if (sizes.image.width > sizes.rect.width) {
                visibleRect.width = sizes.rect.width;
            }

            if (sizes.image.height > sizes.rect.height) {
                visibleRect.height = sizes.rect.height;
            }

            this.context.strokeRect(this.canvasPadding, this.canvasPadding, visibleRect.width, visibleRect.height);

            if (sizes.image.width > sizes.rect.width) {
                this.context.setLineDash([2]);
                this.context.strokeRect(this.canvasPadding+ visibleRect.width, this.canvasPadding, sizes.image.width - visibleRect.width, sizes.image.height);
            }

            if (sizes.image.height > sizes.rect.height) {
                this.context.setLineDash([2]);
                this.context.strokeRect(this.canvasPadding, this.canvasPadding + visibleRect.height, visibleRect.width, sizes.image.height - visibleRect.height);
            }
        }
    }
}
