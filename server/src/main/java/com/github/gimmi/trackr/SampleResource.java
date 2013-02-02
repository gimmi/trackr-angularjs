package com.github.gimmi.trackr;

import com.google.inject.Inject;
import com.google.inject.servlet.RequestScoped;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

@Path("/sample")
@RequestScoped
public class SampleResource {

	private final Database database;

	@Inject
	public SampleResource(Database database) {
		this.database = database;
	}

	@GET
	@Path("{name}")
	@Produces(MediaType.TEXT_PLAIN)
	public String sayGreeting(@PathParam("name") String name) {
		return "Greetings, " + name + "!";
	}
}