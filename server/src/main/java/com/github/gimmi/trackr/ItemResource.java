package com.github.gimmi.trackr;

import com.github.gimmi.trackr.domain.Item;
import com.google.inject.Inject;
import com.google.inject.persist.Transactional;

import javax.persistence.EntityManager;
import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriInfo;

@Path("/items")
@Consumes("application/json")
@Produces("application/json")
public class ItemResource {
	@Inject
	EntityManager entityManager;

	@GET
	@Path("{id}")
	public Item get(@PathParam("id") String id) {
		Item item = entityManager.find(Item.class, id);
		if (item == null) {
			throw new WebApplicationException(Response.Status.NOT_FOUND);
		}
		return item;
	}

	@POST
	@Transactional
	public Response post(Item item, @Context UriInfo ui) {
		entityManager.merge(item);
		return Response.created(ui.getAbsolutePathBuilder().path(item.getId()).build()).build();
	}
}
