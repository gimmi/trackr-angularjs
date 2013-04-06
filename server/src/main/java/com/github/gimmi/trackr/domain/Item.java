package com.github.gimmi.trackr.domain;

import javax.persistence.*;
import java.util.*;

@Entity
@Table(name = "ITEMS")
public class Item {
	@Id
	@Column(columnDefinition = "CHAR(36)")
	private String id = UUID.randomUUID().toString();

	@Version
	private int version;

	private String title;

	@ElementCollection
	@CollectionTable(name = "TAGS", joinColumns = {@JoinColumn(name = "ITEM_ID")}, uniqueConstraints = {@UniqueConstraint(columnNames = {"ITEM_ID", "TAG"})})
	@Column(name = "TAG")
	private Set<String> tags = new HashSet<>();

	public int getVersion() {
		return version;
	}

	public String getId() {
		return id;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public Set<String> getTags() {
		return tags;
	}
}
