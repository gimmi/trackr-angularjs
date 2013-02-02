package com.github.gimmi.trackr;

import com.google.inject.Singleton;
import com.google.inject.servlet.ServletModule;
import com.sun.jersey.guice.spi.container.servlet.GuiceContainer;
import org.codehaus.jackson.jaxrs.JacksonJsonProvider;

import java.util.HashMap;
import java.util.Map;

public class AppServletModule extends ServletModule {
	@Override
	protected void configureServlets() {
		serve("/helloworld").with(HelloWorldServlet.class);

		bind(ItemResource.class);

		bind(JacksonJsonProvider.class).in(Singleton.class);
		Map<String, String> initParams = new HashMap<String, String>();
		initParams.put("com.sun.jersey.config.feature.Trace", "true");
		serve("/rest/*").with(GuiceContainer.class, initParams);
	}
}
