package org.richfaces.renderkit;

import org.richfaces.component.SimpleUpload;

import javax.faces.application.ResourceDependencies;
import javax.faces.application.ResourceDependency;
import javax.faces.component.UIComponent;

@ResourceDependencies({
        @ResourceDependency(library = "org.richfaces", name = "ajax.reslib"),
        @ResourceDependency(library = "org.richfaces", name = "base-component.reslib"),
        @ResourceDependency(library = "org.richfaces", name = "simpleUpload.js"),
        @ResourceDependency(library = "org.richfaces", name = "simpleUpload.css")})
public abstract class SimpleUploadRendererBase extends RendererBase {
    public static final String RENDERER_TYPE = "org.richfaces.SimpleUploadRenderer";

    // A workaround for RF-11668
    public SimpleUpload castComponent(UIComponent component) {
        return (SimpleUpload) component;
    }
}
