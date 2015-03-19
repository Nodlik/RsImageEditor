
/// <reference path="../../Core/Image/RsImage.ts"/>
/// <reference path="../../Core/Action/EditorAction.ts"/>

module Modules {
    export class CropAction implements Core.EditorAction {
        private oldWidth: number;
        private oldHeight: number;

        constructor(public image: Core.RsImage, private left: number, private top: number, private width: number, private height: number) {

        }

        execute() {

            return this.image.save();
        }

        unExecute() {
            return this.image.save();
        }
    }
}