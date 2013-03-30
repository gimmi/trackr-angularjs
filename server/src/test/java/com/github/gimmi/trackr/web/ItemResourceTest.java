package com.github.gimmi.trackr.web;


import com.github.gimmi.trackr.configuration.AppServletContextListener;
import com.google.inject.servlet.GuiceFilter;
import com.sun.jersey.api.client.Client;
import com.sun.jersey.api.client.ClientResponse;
import com.sun.jersey.api.client.config.ClientConfig;
import com.sun.jersey.api.client.config.DefaultClientConfig;
import org.codehaus.jackson.JsonNode;
import org.codehaus.jackson.jaxrs.JacksonJsonProvider;
import org.codehaus.jackson.map.ObjectMapper;
import org.codehaus.jackson.node.ObjectNode;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.servlet.DefaultServlet;
import org.eclipse.jetty.servlet.FilterMapping;
import org.eclipse.jetty.servlet.ServletContextHandler;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import javax.ws.rs.core.MediaType;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

import static org.hamcrest.CoreMatchers.endsWith;
import static org.hamcrest.CoreMatchers.equalTo;
import static org.hamcrest.CoreMatchers.startsWith;
import static org.junit.Assert.assertThat;

public class ItemResourceTest {
	private Server server;
	private Client client;

	@Before
	public void before() throws Exception {
		server = buildServer();
		server.start();

		ClientConfig clientConfig = new DefaultClientConfig();
		clientConfig.getClasses().add(JacksonJsonProvider.class);
		client = Client.create(clientConfig);
	}

	private Server buildServer() {
		Server server = new Server(8080);

		ServletContextHandler servletContextHandler = new ServletContextHandler(ServletContextHandler.SESSIONS);
		servletContextHandler.setContextPath("/");
		HashMap<String, String> jpaProperties = new HashMap<>();
		jpaProperties.put("javax.persistence.jdbc.url", "jdbc:h2:mem:test;DB_CLOSE_DELAY=-1");
		jpaProperties.put("eclipselink.ddl-generation", "drop-and-create-tables");
		servletContextHandler.addEventListener(new AppServletContextListener(jpaProperties));
		servletContextHandler.addFilter(GuiceFilter.class, "/*", FilterMapping.DEFAULT);

		// This is a workaround
		// https://groups.google.com/d/msg/google-guice/lMmVPQQ2Soc/0QoekenBnYoJ
		// https://bugs.eclipse.org/bugs/show_bug.cgi?id=393738
		servletContextHandler.addServlet(DefaultServlet.class, "/");

		server.setHandler(servletContextHandler);
		return server;
	}

	@After
	public void after() throws Exception {
		server.stop();
		server.join();
	}

	@Test
	public void should_create_and_retrieve_item() {
		ClientResponse resp = client.resource("http://localhost:8080/api/items")
				.accept("application/json")
				.type("application/json")
				.post(ClientResponse.class, "{ title: 'item title' }");

		assertThat(resp.getStatus(), equalTo(201));
		String itemLocation = resp.getHeaders().getFirst("Location");
		assertThat(itemLocation, startsWith("http://localhost:8080/api/items/"));

		resp = client.resource(itemLocation)
				.accept("application/json")
				.get(ClientResponse.class);

		assertThat(resp.getStatus(), equalTo(200));
		ObjectNode entity = resp.getEntity(ObjectNode.class);

		assertThat(entity.findValue("title").getTextValue(), equalTo("item title"));
		assertThat(itemLocation, endsWith(entity.findValue("id").getTextValue()));
	}
}
