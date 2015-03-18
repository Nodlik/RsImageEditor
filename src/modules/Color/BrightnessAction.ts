/// <reference path="../../Core/Image/RsImage.ts"/>
/// <reference path="../../Core/Image/ImageResizer.ts"/>
/// <reference path="../../Core/Action/EditorAction.ts"/>
/// <reference path="../../Core/Action/AbstractAction.ts"/>
/// <reference path="../../Core/Action/CamanJSAction.ts"/>


module Modules {
    export class BrightnessAction extends Core.CamanJSAction {
        constructor(image: Core.RsImage, private brightness: number) {
            super(image);

            this.image = image;
        }

        camanAction(camanObject) {
            camanObject.brightness(this.brightness);
        }
    }
}