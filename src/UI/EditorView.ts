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

        constructor(private $el: JQuery)
        {
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
    }
}
