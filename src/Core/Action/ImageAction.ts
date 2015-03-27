/// <reference path="../Image/RsImage.ts"/>

module Core {
    export interface ImageAction {
        image: RsImage;
        needRender: boolean;

        execute(): Promise<RsImage>;
        unExecute(): Promise<RsImage>;
    }
}