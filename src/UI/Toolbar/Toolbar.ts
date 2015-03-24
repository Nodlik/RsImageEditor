module UI {
    export class Toolbar {
        $toolbar: JQuery;

        constructor(private page: Page, public editor: Core.RsImageEditor) {
            this.$toolbar = this.editor.UI().getToolbarPlace();
        }

        render() {
            this.$toolbar.html("");
            if ((this.page.getParent() !== null) && (this.page.getParent().images().count() > 1)) {
                this.renderBackButton(this.$toolbar);
            }
            
            this.renderCommonButton(this.$toolbar);
        }

        renderModuleToolbar(type: Core.ModuleViewType, $el: JQuery) {
            var modules = this.editor.getModuleManager().getModules( this.editor.UI().getType(), null );

            modules.forEach((m: Core.EditorModule) =>
                {
                    var $button = $(nunjucks.render('toolbar.button.html.njs', {
                        button: {
                            name: m.name(),
                            icon: m.icon(),
                            localizedName: m.name()
                        }
                    }));

                    $el.append($button);

                    this.editor.UI().initModule($button, m);
                }
            )
        }

        renderCommonButton($el: JQuery) {
            $el.append($(nunjucks.render('toolbar.button.html.njs', {
                button: {
                    name: 'upload',
                    icon: 'fa fa-upload',
                    localizedName: 'upload'
                }
            })));

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
