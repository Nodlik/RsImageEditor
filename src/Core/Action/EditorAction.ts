/// <reference path="../Image/RsImage.ts"/>

module Core {
    export interface EditorAction {
        editor: RsImageEditor;

        execute(): boolean;
        unExecute(): boolean;
    }
}