package com.github.gimmi.trackr.domain;

import javax.persistence.*;
import java.util.*;

@Entity
public class Item {
	@Id
	@Column(columnDefinition = "CHAR(36)")
	private String id = UUID.randomUUID().toString();
	@Version
	private int version;
	private String title;

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
}
