package com.github.gimmi.trackr.domain;

import org.junit.After;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.Persistence;
import java.util.List;
import java.util.Properties;

import static org.hamcrest.Matchers.equalTo;
import static org.junit.Assert.assertThat;

public class ItemTest {
	private EntityManagerFactory emf;

	@Before
	public void beforeClass() {
		Properties map = new Properties();

		map.put("javax.persistence.jdbc.driver", "org.h2.Driver");
		map.put("javax.persistence.jdbc.url", "jdbc:h2:mem:db1;DB_CLOSE_DELAY=-1;MVCC=TRUE");
		map.put("javax.persistence.jdbc.user", "sa");
		map.put("javax.persistence.jdbc.password", "");

		// See http://wiki.eclipse.org/EclipseLink/Examples/JPA/Logging
		map.put("eclipselink.logging.logger", "DefaultLogger");
		map.put("eclipselink.logging.level", "ALL");

		// See http://wiki.eclipse.org/EclipseLink/Examples/JPA/DDL
		map.put("eclipselink.ddl-generation", "drop-and-create-tables");

		emf = Persistence.createEntityManagerFactory("com.github.gimmi.trackr", map);
	}

	@After
	public void afterClass() {
		emf.close();
	}

	@Test
	public void should_save_then_retrieve() {
		EntityManager entityManager = emf.createEntityManager();
		entityManager.getTransaction().begin();
		Item task = new Item();
		task.setTitle("Our very first task!");
		entityManager.persist(task);
		entityManager.getTransaction().commit();
		entityManager.close();

		entityManager = emf.createEntityManager();
		entityManager.getTransaction().begin();
		List<Item> result = entityManager.createQuery("SELECT i FROM Item i", Item.class).getResultList();
		Assert.assertEquals(1, result.size());
		Assert.assertEquals("Our very first task!", result.get(0).getTitle());
		Assert.assertEquals(task.getId(), result.get(0).getId());
		entityManager.getTransaction().commit();
		entityManager.close();
	}

	@Test
	public void should_handle_version_field() {
		Item task = new Item();
		assertThat(task.getVersion(), equalTo(0));

		EntityManager entityManager = emf.createEntityManager();
		entityManager.getTransaction().begin();
		entityManager.persist(task);
		Assert.assertEquals(0, task.getVersion());
		entityManager.getTransaction().commit();
		entityManager.close();

		assertThat(task.getVersion(), equalTo(1));
	}
}
