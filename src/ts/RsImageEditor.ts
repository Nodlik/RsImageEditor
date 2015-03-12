$(function() {
    var m = new Modules.ResizeModule();
    var v = new UI.Editor($('#editor'));

    console.log(m.process().then(
        function(img: Core.RsImage) {
            console.log(img);

            return Promise.resolve(img);
        }
    ));
});
