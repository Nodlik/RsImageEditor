/// <reference path="../../Core/Image/RsImage.ts"/>
/// <reference path="../../Core/Image/ImageResizer.ts"/>
/// <reference path="../../Core/Action/ImageAction.ts"/>


module Modules {
    export class ChannelsAction implements Core.ImageAction {
        public needRender: boolean = false;
        private oldValue: Core.Channels;

        constructor(public image: Core.RsImage, private red: number, private green: number, private blue: number) {

        }

        execute() {
            this.oldValue = this.image.channels;

            this.image.channels = {
                red: this.red,
                green: this.green,
                blue: this.blue
            };

            return this.image.save();
        }

        unExecute() {
            this.image.channels = this.oldValue;

            return this.image.save();
        }
    }
}