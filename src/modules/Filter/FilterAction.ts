/// <reference path="../../Core/Image/RsImage.ts"/>
/// <reference path="../../Core/Image/ImageResizer.ts"/>
/// <reference path="../../Core/Action/ImageAction.ts"/>

module Modules {
    export class FilterAction implements Core.ImageAction {
        public needRender: boolean = false;

        private oldFilter = {
            name: '',
            parameters: []
        };

        constructor(public image: Core.RsImage, private filterName: string, private vignette: boolean = false) {

        }

        execute() {
            this.oldFilter = this.image.filter;

            if (this.filterName == 'reset') {
                this.image.filter = null;
            }
            else {
                this.image.filter = {
                    name: this.filterName,
                    parameters: [this.vignette]
                };
            }

            return this.image.save();
        }

        unExecute() {
            this.image.filter = this.oldFilter;

            return this.image.save();
        }
    }
}