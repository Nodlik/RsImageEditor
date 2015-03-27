/// <reference path="../Core/RsImageEditor.ts"/>
/// <reference path="../Core/Image/ImageCollection.ts"/>
/// <reference path="../Core/Image/RsImage.ts"/>
/// <reference path="Page.ts"/>
/// <reference path="Module/ModuleInitialization.ts"/>
/// <reference path="Widgets/RsProgressBar.ts"/>

module UI {
    export class EditorView {
        private progressBar: Widgets.RsProgressBar;
        private $popOver: JQuery;

        private $imagePlace: JQuery;
        private $toolbarPlace: JQuery;
        private $informationPlace: JQuery;

        constructor(private $el: JQuery, private controller: Editor)
        {
            this.$el.html(nunjucks.render('editor.html.njs', {}));

            var $fileLoader = this.$el.find('#rsFileInput');
            $fileLoader.on('change',
                function() {
                    controller.getEditor().getLoader().load(this.files);
                }
            );

            this.$el.on('click', '#t-button__upload', () => {
                $fileLoader.trigger('click');

                return false;
            });

            this.$el.on('click', '.rs-image-block, .rs-image-data__inf', (e: JQueryEventObject) => {
                this.editImage(
                    $(e.target).closest('.rs-image').data('id')
                );
            });

            this.$el.on('click', '#t-button__back', () => {
                this.controller.back();

                return false;
            });

            this.$el.on('click', '.rs-image-selection-checkbox', (e: JQueryEventObject) => {
                this.selectImage($(e.target).closest('.rs-image'));
            });

            this.$popOver = this.$el.find('#rsPopover');

            this.$toolbarPlace = this.$el.find('#rsToolbarPlace');
            this.$imagePlace = this.$el.find('#rsImagePlace');
            this.$informationPlace = this.$el.find('#rsInformation');

            this.progressBar = new UI.Widgets.RsProgressBar(this.$el.find('#rsProgressBar'));
            this.progressBar.on('stop', (e) => {
                this.progressBar.stop('Loading complete!');
            });
        }

        showProgressBar(opCount: number) {
            this.progressBar.start('Loading image...', opCount);
        }

        progress(op: number) {
            this.progressBar.setProgress(op, 'Image ' + op + ' from ' + this.progressBar.getOpCount());
        }


        showPopover(content: string): JQuery {
            this.$popOver.html(content);
            this.$popOver.show();

            return this.$popOver;
        }

        clearPopover() {
            this.$popOver.html("");
            this.$popOver.hide();
        }

        getImagePlace(): JQuery {
            return this.$imagePlace;
        }

        getToolbarPlace(): JQuery {
            return this.$toolbarPlace;
        }

        getInformationPlace(): JQuery {
            return this.$informationPlace;
        }


        initToolbar($toolbar: JQuery) {
            if (this.controller.getActiveModule() != null) {
                $toolbar.find('#t-button__' + this.controller.getActiveModule().name()).addClass('active');
            }

            $toolbar.find('#t-button__redo').click(() => {
                this.controller.getActions().imageRedo();

                return false;
            });

            $toolbar.find('#t-button__undo').click(() => {
                this.controller.getActions().imageUndo();

                return false;
            });
        }

        private editImage(imageId: string) {
            this.controller.openImageEditor( this.controller.getImages().getImage(imageId) );
        }


        private selectImage($el: JQuery) {
            var image = this.controller.getImages().getImage($el.data('id')).getImages()[0];

            if ($el.hasClass('rs-image-selected')) {
                $el.removeClass('rs-image-selected');

                this.controller.unSelectImage(image);
            }
            else {
                $el.addClass('rs-image-selected');

                this.controller.selectImage(image);
            }
        }
    }
}
