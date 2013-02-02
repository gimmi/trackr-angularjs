package com.github.gimmi.trackr;

import com.google.inject.servlet.RequestScoped;
import com.google.inject.servlet.ServletModule;
import com.google.inject.servlet.ServletScopes;
import com.sun.jersey.guice.spi.container.servlet.GuiceContainer;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

public class AppServletModule extends ServletModule {
	@Override
	protected void configureServlets() {
		serve("/helloworld").with(HelloWorldServlet.class);

		bind(Database.class);
		bind(SampleResource.class);

		Map<String, String> initParams = Collections.singletonMap("com.sun.jersey.config.feature.Trace", "true");
		serve("/rest/*").with(GuiceContainer.class, initParams);
	}
}
