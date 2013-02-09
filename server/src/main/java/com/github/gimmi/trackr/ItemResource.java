package com.github.gimmi.trackr;

import com.google.inject.Inject;
import com.google.inject.persist.Transactional;

import javax.persistence.EntityManager;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

@Path("/items")
public class ItemResource {
	private final EntityManager entityManager;

	@Inject
	public ItemResource(EntityManager entityManager) {
		this.entityManager = entityManager;
	}

	@GET
	@Path("{id}")
	@Produces(MediaType.APPLICATION_JSON)
	public Item get(@PathParam("id") String id) {
		return entityManager.find(Item.class, id);
	}

	@POST
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	@Transactional
	public Item post(Item item) {
		entityManager.merge(item);
		return item;
	}
}
