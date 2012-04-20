package org.richfaces.upload;

import static org.junit.Assert.*;

import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;

import org.jboss.test.faces.htmlunit.HtmlUnitEnvironment;
import org.jboss.test.faces.jetty.JettyServer;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import com.gargoylesoftware.htmlunit.FailingHttpStatusCodeException;
import com.gargoylesoftware.htmlunit.Page;
import com.gargoylesoftware.htmlunit.html.HtmlPage;

public class UploadTest {

    private HtmlUnitEnvironment enviroment;

    @Before
    public void setUp(){
        enviroment = new HtmlUnitEnvironment(new JettyServer());
        enviroment.withWebRoot(new File("src/main/webapp"));
        enviroment.start();
    }
    
    @After
    public void tearDown() {
        enviroment.release();
    }
    
    @Test
    public void test() throws Exception {
        HtmlPage page = enviroment.getPage("/samples/sample_1.jsf");
        System.out.println(page.asXml());
    }

}
