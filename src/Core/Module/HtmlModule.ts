/// <reference path="EditorModule.ts"/>

module Core {
    export interface HtmlModule extends Core.EditorModule {
        html(): string;
        init($el: JQuery);
    }
}