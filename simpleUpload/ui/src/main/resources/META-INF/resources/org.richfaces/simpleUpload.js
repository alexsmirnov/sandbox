(function ($, rf) {

    rf.ui = rf.ui || {};

    rf.ui.SimpleUpload = function (id, options) {
        var mergedOptions = $.extend({}, defaultOptions, options);
        $super.constructor.call(this, id, mergedOptions);
        this.namespace = this.namespace || "." + rf.Event.createNamespace(this.name, this.id);
        this.attachToDom();
    };

    rf.BaseComponent.extend(rf.ui.SimpleUpload);
    var $super = rf.ui.SimpleUpload.$super;

    var defaultOptions = {
        someOption:'devaultValue'
    }

    $.extend(rf.ui.SimpleUpload.prototype, (function () {

        return {
            name:"SimpleUpload"

            // place shared prototype attributes and methods here.  Prepend "__" ahead of private methods
        };
    })());

})(jQuery, window.RichFaces);