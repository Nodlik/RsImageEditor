/// <reference path="../Image/RsImage.ts"/>

module Core {
    export interface EditorAction {
        editor: UI.Editor;

        execute(): boolean;
        unExecute(): boolean;
    }
}