/// <reference path="../../Core/Image/RsImage.ts"/>
/// <reference path="../../Core/Image/ImageResizer.ts"/>
/// <reference path="../../Core/Action/EditorAction.ts"/>


module Modules {
    export class VibranceAction implements Core.EditorAction {
        private oldValue: number;

        constructor(public image: Core.RsImage, private value: number) {

        }

        execute() {
            this.oldValue = this.image.vibrance;

            this.image.vibrance = this.value;

            return this.image.save();
        }

        unExecute() {
            this.image.vibrance = this.oldValue;

            return this.image.save();
        }
    }
}