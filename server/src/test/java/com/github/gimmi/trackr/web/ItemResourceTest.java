package com.github.gimmi.trackr.web;


import com.github.gimmi.trackr.configuration.AppGuiceServletContextListener;
import com.google.inject.servlet.GuiceFilter;
import com.sun.jersey.api.client.Client;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.servlet.DefaultServlet;
import org.eclipse.jetty.servlet.FilterMapping;
import org.eclipse.jetty.servlet.ServletContextHandler;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import static org.hamcrest.CoreMatchers.equalTo;
import static org.junit.Assert.assertThat;

public class ItemResourceTest {
	private Server server;

	@Before
	public void before() throws Exception {
		server = new Server(8080);

		ServletContextHandler servletContextHandler = new ServletContextHandler(ServletContextHandler.SESSIONS);
		servletContextHandler.setContextPath("/");
		servletContextHandler.addEventListener(new AppGuiceServletContextListener());
		servletContextHandler.addFilter(GuiceFilter.class, "/*", FilterMapping.DEFAULT);

		// This is a workaround
		// https://groups.google.com/d/msg/google-guice/lMmVPQQ2Soc/0QoekenBnYoJ
		// https://bugs.eclipse.org/bugs/show_bug.cgi?id=393738
		servletContextHandler.addServlet(DefaultServlet.class, "/");

		server.setHandler(servletContextHandler);

		servletContextHandler.getServletHandler();
		server.start();
	}

	@After
	public void after() throws Exception {
		server.stop();
		server.join();
	}

	@Test
	public void should_work() {
		String s = Client.create()
				.resource("http://localhost:8080/rest/items")
				.get(String.class);

		assertThat(s, equalTo("ciao"));
	}
}
