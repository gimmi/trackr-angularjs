package com.github.gimmi.trackr;

import com.google.inject.servlet.ServletModule;

public class AppServletModule extends ServletModule {
	@Override
	protected void configureServlets() {
		serve("/helloworld").with(HelloWorldServlet.class);
	}
}
