/// <reference path="../../Core/Image/RsImage.ts"/>
/// <reference path="../../Core/Action/EditorAction.ts"/>

module Modules {
    export class ResizeAction implements Core.EditorAction {
        private oldWidth: number;
        private oldHeight: number;

        constructor(public image: Core.RsImage, private width: number, private height: number) {

        }

        execute() {
            this.oldWidth = this.image.getWidth();
            this.oldHeight = this.image.getHeight();

            this.image.width = this.width;
            this.image.height = this.height;

            return this.image.save();
        }

        unExecute() {
            this.image.width = this.oldWidth;
            this.image.height = this.oldHeight;

            return this.image.save();
        }
    }
}