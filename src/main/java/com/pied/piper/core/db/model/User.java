package com.pied.piper.core.db.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Version;

import io.dropwizard.jackson.JsonSnakeCase;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * Created by palash.v on 21/07/16.
 */
@Data
@Entity
@EqualsAndHashCode
@JsonSnakeCase
@JsonIgnoreProperties(value = {"hibernateLazyInitializer", "handler"}, ignoreUnknown = true)
public class User {
    @Column(name = "user_id")
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long userId;

    @Column(name = "account_id")
    private String accountId;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "version")
    @Version
    private Integer version;

}
