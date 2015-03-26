module Modules {
    interface FitSize {
        rect: Size;
        image: Size;
    }

    interface Cord {
        x: number;
        y: number;
    }

    interface StartCord {
        rect: Cord;
        image: Cord;
    }

    export class FitMethodCanvas {
        private context: CanvasRenderingContext2D;

        private canvasWidth = 120;
        private canvasHeight = 90;
        private canvasPadding = 5;

        constructor(private canvas: HTMLCanvasElement) {
            this.context = this.canvas.getContext('2d');
        }

        private initCanvas() {
            this.canvas.width = this.canvasWidth;
            this.canvas.height = this.canvasHeight;

            this.context.fillStyle = '#FFFFFF';
            this.context.strokeStyle = '#000000';
            this.context.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
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

        /**
         * dw = (rect.width - image.width) * k
         * dh = (rect.height - image.height) * k
         *
         * @param image
         * @param rect
         * @param dw
         * @param dh
         */
        private getCalculatedPosition(image: Size, rect: Size, dw: number, dh: number): StartCord {
            var dRect: Cord = {x: 0, y: 0};
            var dImage: Cord = {x: 0, y: 0};

            if (rect.height >= image.height) {
                dImage.y = dh;
                dRect.y = 0;
            }
            else {
                dImage.y = 0;
                dRect.y = -dh;
            }

            if (rect.width >= image.width) {
                dImage.x = dw;
                dRect.x = 0;
            }
            else {
                dImage.x = 0;
                dRect.x = -dw;
            }

            return {
                'image': dImage,
                'rect': dRect
            }
        }

        private getStartCord(image: Size, rect: Size, fitPoint: FitPosition): StartCord {
            if (fitPoint == FitPosition.LEFT_TOP) {
                return {'rect': {x: 0, y: 0}, 'image':  {x: 0, y: 0}};
            }
            else if (fitPoint == FitPosition.TOP) {
                return this.getCalculatedPosition(image, rect, (rect.width - image.width) / 2, 0);
            }
            else if (fitPoint == FitPosition.RIGHT_TOP) {
                return this.getCalculatedPosition(image, rect, rect.width - image.width, 0);
            }
            else if (fitPoint == FitPosition.LEFT) {
                return this.getCalculatedPosition(image, rect, 0, (rect.height - image.height) / 2);
            }
            else if (fitPoint == FitPosition.RIGHT) {
                return this.getCalculatedPosition(image, rect, rect.width - image.width, (rect.height - image.height) / 2);
            }
            else if (fitPoint == FitPosition.LEFT_BOTTOM) {
                return this.getCalculatedPosition(image, rect, 0, (rect.height - image.height));
            }
            else if (fitPoint == FitPosition.BOTTOM) {
                return this.getCalculatedPosition(image, rect, (rect.width - image.width) / 2, rect.height - image.height);
            }
            else if (fitPoint == FitPosition.RIGHT_BOTTOM) {
                return this.getCalculatedPosition(image, rect, rect.width - image.width, rect.height - image.height);
            }
        }

        private drawIntersect(rect: Rect, image: Rect) {
            this.context.setLineDash([]);

            this.context.fillStyle = 'gray';
            this.context.fillRect(
                Math.max(rect.left, image.left),
                Math.max(rect.top, image.top),
                Math.min(rect.width, image.width),
                Math.min(rect.height, image.height)
            );
        }

        private draw(rect: Rect, image: Rect) {
            this.context.strokeRect(rect.left, rect.top, rect.width, rect.height);
            this.context.strokeStyle = '#FF0000';

            this.context.setLineDash([2]);
            this.context.strokeRect(image.left, image.top, image.width, image.height);

            this.drawIntersect(rect, image);
        }

        private render(sizes, fitPoint: FitPosition) {
            this.initCanvas();

            var start = this.getStartCord(sizes.image, sizes.rect, fitPoint);

            this.draw(
                {left: this.canvasPadding + start.rect.x, top: this.canvasPadding + start.rect.y, width: sizes.rect.width, height: sizes.rect.height},
                {left: this.canvasPadding + start.image.x, top: this.canvasPadding + start.image.y, width: sizes.image.width, height: sizes.image.height}
            );
        }

        drawResizeAll(rectWidth, rectHeight, imageWidth, imageHeight, fitPoint: FitPosition) {
            this.render(
                this.getNewSize(
                    {width: rectWidth, height: rectHeight},
                    SizeCalculation.getFitSize(rectWidth, rectHeight, imageWidth, imageHeight)
                ),
                fitPoint
            )
        }

        drawStretchToWidth(rectWidth, rectHeight, imageWidth, imageHeight, fitPoint: FitPosition) {
            this.render(
                this.getNewSize(
                    {width: rectWidth, height: rectHeight},
                    SizeCalculation.getStretchWidthSize(rectWidth, rectHeight, imageWidth, imageHeight)
                ),
                fitPoint
            )
        }

        drawStretchToHeight(rectWidth, rectHeight, imageWidth, imageHeight, fitPoint: FitPosition) {
            this.render(
                this.getNewSize(
                    {width: rectWidth, height: rectHeight},
                    SizeCalculation.getStretchHeightSize(rectWidth, rectHeight, imageWidth, imageHeight)
                ),
                fitPoint
            )
        }

        drawStretchToRect(rectWidth, rectHeight, imageWidth, imageHeight, fitPoint: FitPosition) {
            this.render(
                this.getNewSize(
                    {width: rectWidth, height: rectHeight},
                    SizeCalculation.getStretchRectSize(rectWidth, rectHeight, imageWidth, imageHeight)
                ),
                fitPoint
            )
        }
    }
}
