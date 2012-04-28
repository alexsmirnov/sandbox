/*
 * JBoss, Home of Professional Open Source
 * Copyright ${year}, Red Hat, Inc. and individual contributors
 * by the @authors tag. See the copyright.txt in the distribution for a
 * full listing of individual contributors.
 *
 * This is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as
 * published by the Free Software Foundation; either version 2.1 of
 * the License, or (at your option) any later version.
 *
 * This software is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this software; if not, write to the Free
 * Software Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
 * 02110-1301 USA, or see the FSF site: http://www.fsf.org.
 */
(function(richfaces, jQuery) {

    richfaces.ui = richfaces.ui || {};

    richfaces.ui.SimpleUpload = function(id, options) {
        this.id = id;

        jQuery.extend(this, options);
        if (this.acceptedTypes) {
            this.acceptedTypes = jQuery.trim(this.acceptedTypes).toUpperCase().split(/\s*,\s*/);
        }
        this.element = jQuery(this.attachToDom());
        this.form = this.element.parents("form:first");
        this.uploadButton = this.element.children().first();
        this.inputContainer = this.uploadButton.children().first();
        this.input = this.inputContainer.children("input");
        this.hiddenContainer = this.uploadButton.next();
        this.iframe = this.hiddenContainer.next();
        this.status = this.hiddenContainer.children().first();
        this.progressBarElement = this.status.next();
        this.progressBar = richfaces.$(this.progressBarElement);
        if(this.progressBar){
        	this.progressBarElement.hide();
        }
        this.cleanInput = this.input.clone();
        this.addProxy = jQuery.proxy(this.__addItem, this);
        this.input.change(this.addProxy);
        this.iframe.load(jQuery.proxy(this.__load, this));
        if (this.onfilesubmit) {
            richfaces.Event.bind(this.element, "onfilesubmit", new Function("event", this.onfilesubmit));
        }
        if (this.ontyperejected) {
            richfaces.Event.bind(this.element, "ontyperejected", new Function("event", this.ontyperejected));
        }
        if (this.onuploadcomplete) {
            richfaces.Event.bind(this.element, "onuploadcomplete", new Function("event", this.onuploadcomplete));
        }
    }

    var UID = "rf_fu_uid";
    var UID_ALT = "rf_fu_uid_alt";
    var FAKE_PATH = "C:\\fakepath\\";
    var ITEM_HTML = '<div class="rf-su-itm">'
        + '<span class="rf-su-itm-lft"><span class="rf-su-itm-lbl"/><span class="rf-su-itm-st"/></span>'
        + '<span class="rf-su-itm-rgh"><a href="javascript:void(0)" class="rf-su-itm-lnk"/></span></div>';

    var ITEM_STATE = {
        NEW: "new",
        UPLOADING: "uploading",
        DONE: "done",
        SIZE_EXCEEDED: "sizeExceeded",
        STOPPED: "stopped",
        SERVER_ERROR: "serverError"
    };


    richfaces.BaseComponent.extend(richfaces.ui.SimpleUpload);

    $.extend(richfaces.ui.SimpleUpload.prototype, (function () {

        return {
            name: "SimpleUpload",

            doneLabel: "Done",
            doneClass: "rf-su-st-dn",
            sizeExceededLabel: "File size is exceeded",
            sizeExceededClass: "rf-su-st-szex",
            stoppedLabel: "",
            serverErrorLabel: "Server error",
            serverErrorClass: "rf-su-st-er",

            __addItem: function() {
                var fileName = this.input.val();
                if (!navigator.platform.indexOf("Win")) {
                    fileName = fileName.match(/[^\\]*$/)[0];
                } else {
                    if (!fileName.indexOf(FAKE_PATH)) {
                        fileName = fileName.substr(FAKE_PATH.length);
                    } else {
                        fileName = fileName.match(/[^\/]*$/)[0];
                    }
                }
                this.input.hide();
                if (this.__accept(fileName)) {
                    this.input.unbind("change", this.addProxy);
                    this.model = {name: fileName, state: ITEM_STATE.NEW};
                    this.__startUpload();
                }
                this.input.remove();
                this.input = this.cleanInput.clone();
                this.inputContainer.append(this.input);
                this.input.change(this.addProxy);
            },


            __startUpload: function() {
                this.model.state = ITEM_STATE.UPLOADING;
                var uid = Math.random();
                this.model.uid = uid;
                this.__submit(uid);
                if (this.progressBar) {
                	this.status.hide();
                	this.status.removeClass(this.doneClass+" "+this.serverErrorClass+" "+this.sizeExceededClass);
                    this.progressBar.setValue(0);
                    var params = {};
                    params[UID_ALT] = uid;
                    this.progressBar.enable(params);
                	this.progressBarElement.show();

                }
            },

            __finishUploading: function(state) {
                if (this.progressBar) {
                    this.progressBar.disable();
                	this.progressBarElement.hide();
                }
                this.status.html(this[state + "Label"]).addClass(this[state + "Class"]).show();
                this.model.state = state;
            },

            __submit: function(uid) {
                var originalAction = this.form.attr("action");
                var originalEncoding = this.form.attr("encoding");
                var originalEnctype = this.form.attr("enctype");
                try {
                    this.input.attr("name", this.id);
                    var delimiter = originalAction.indexOf("?") == -1 ? "?" : "&";
                    this.form.attr("action", originalAction + delimiter + UID + "=" + uid);
                    this.form.attr("encoding", "multipart/form-data");
                    this.form.attr("enctype", "multipart/form-data");
                    richfaces.submitForm(this.form, {"org.richfaces.ajax.component": this.id}, this.id);
                    richfaces.Event.fire(this.element, "onfilesubmit", this.model);
                } finally {
                    this.form.attr("action", originalAction);
                    this.form.attr("encoding", originalEncoding);
                    this.form.attr("enctype", originalEnctype);
                    this.input.removeAttr("name");
                }
            },

            __load: function(event) {
            	if(this.model) {
                    var contentDocument = event.target.contentWindow.document;
                    contentDocument = contentDocument.XMLDocument || contentDocument;
                    var documentElement = contentDocument.documentElement;
                    var responseStatus, id;
                    if (documentElement.tagName.toUpperCase() == "PARTIAL-RESPONSE") {
                        var errors = jQuery(documentElement).children("error");
                        responseStatus = errors.length > 0 ? ITEM_STATE.SERVER_ERROR : ITEM_STATE.DONE;
                    } else if ((id = documentElement.id) && id.indexOf(UID + this.model.uid + ":") === 0) {
                        responseStatus = id.split(":")[1];
                    }
                    if (responseStatus) {
                        var responseContext = {
                            source: this.element[0],
                            /* hack for MyFaces */
                            _mfInternal: {
                                _mfSourceControlId: this.element.attr('id')
                            }
                        };
                        if(responseStatus === ITEM_STATE.DONE ){
                        	jsf.ajax.response({responseXML: contentDocument}, responseContext);
                        }
                        this.__finishUploading(responseStatus);
                        richfaces.Event.fire(this.element, "onuploadcomplete", this.model);
                        this.model = null;
                    }
            	}
            },

            __accept: function(fileName) {
                fileName = fileName.toUpperCase();
                var result = !this.acceptedTypes;
                var extension;
                for (var i = 0; !result && i < this.acceptedTypes.length; i++) {
                    extension = this.acceptedTypes[i];
                    result = fileName.indexOf(extension, fileName.length - extension.length) !== -1;
                }
                if (!result) {
                    richfaces.Event.fire(this.element, "ontyperejected", fileName);
                }
                return result;
            }

        };
    })());



}(window.RichFaces, jQuery));
