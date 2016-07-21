package com.pied.piper.core.db.dao.impl;

import com.google.inject.Inject;
import com.pied.piper.core.db.model.Image;

import javax.inject.Provider;
import javax.persistence.EntityManager;

/**
 * Created by akshay.kesarwan on 21/07/16.
 */
public class ImageDaoImpl extends BaseDaoImpl<Image, Long> {

    @Inject
    public ImageDaoImpl(Provider<EntityManager> entityManagerProvider) {
        super(entityManagerProvider);
        this.entityClass = Image.class;
    }
}
