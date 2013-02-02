package com.github.gimmi.trackr;

import com.google.inject.servlet.RequestScoped;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

@Path("/items")
public class ItemResource {

	@GET
	@Path("{id}")
	@Produces(MediaType.APPLICATION_JSON)
	public Item getJson(@PathParam("id") String id) {
		Item item = new Item();
		item.id = id;
		return item;
	}
}
