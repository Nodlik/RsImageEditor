module UI {
    export class Toolbar {
        $toolbar: JQuery;
        $editorToolbar: JQuery;

        constructor(private page: Page, public editor: UI.Editor) {
            this.$toolbar = this.editor.getInterface().getToolbarPlace().find('#rsToolbarMainAction');
            this.$editorToolbar =  this.editor.getInterface().getToolbarPlace().find('#rsToolbarEditorAction');
        }

        render() {
            this.$toolbar.html("");
            this.$editorToolbar.html("");
            if ((this.page.getParent() !== null) && (this.page.getParent().images().count() > 1)) {
                this.renderBackButton(this.$toolbar);
            }

            this.renderCommonButton(this.$toolbar);
        }

        renderDelimiter($el: JQuery) {
            $el.append($('<div class="t-delimeter"></div>'));
        }

        renderModuleToolbar(type: Core.ModuleViewType, $el: JQuery, css: string = '') {
            var modules = this.editor.getEditor().getModuleManager().getModules( this.editor.getType(), null );

            modules.forEach((m: Core.EditorModule) =>
                {
                    var $button = $(nunjucks.render('toolbar.button.html.njs', {
                        button: {
                            name: m.name(),
                            icon: m.icon(),
                            localizedName: m.name(),
                            css: css
                        }
                    }));

                    $el.append($button);

                    this.editor.initModule($button, m);
                }
            )
        }

        renderRemoveButton($el: JQuery) {
            $el.append($(nunjucks.render('toolbar.button.html.njs', {
                button: {
                    name: 'remove',
                    icon: 'fa fa-remove',
                    localizedName: 'remove'
                }
            })));
        }

        renderCommonButton($el: JQuery) {
            $el.append($(nunjucks.render('toolbar.button.html.njs', {
                button: {
                    name: 'upload',
                    icon: 'fa fa-upload',
                    localizedName: 'upload'
                }
            })));
        }

        renderUndoRedoButton($el: JQuery) {
            $el.append($(nunjucks.render('toolbar.button.html.njs', {
                button: {
                    name: 'undo',
                    icon: 'fa fa-undo',
                    localizedName: 'undo'
                }
            })));

            $el.append($(nunjucks.render('toolbar.button.html.njs', {
                button: {
                    name: 'redo',
                    icon: 'fa fa-repeat',
                    localizedName: 'redo'
                }
            })));
        }


        renderBackButton($el: JQuery) {
            $el.append($(nunjucks.render('toolbar.button.html.njs', {
                button: {
                    name: 'back',
                    icon: 'fa fa-arrow-left',
                    localizedName: 'back'
                }
            })));
        }
    }
}
