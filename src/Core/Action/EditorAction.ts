/// <reference path="../Image/RsImage.ts"/>

module Core {
    export interface EditorAction {
        image: RsImage;

        execute(): Promise<RsImage>;
        unExecute(): Promise<RsImage>;
    }
}