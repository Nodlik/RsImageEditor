module UI {
    export class Editor {
        private $editor: JQuery;

        constructor($editor: JQuery) {
            this.$editor = $editor;

            this.$editor.css('background-color', 'blue');
        }
    }
}
