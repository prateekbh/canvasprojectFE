package com.pied.piper.core.db.dao.impl;

import com.google.inject.Inject;
import com.pied.piper.core.db.model.ImageRelation;

import javax.inject.Provider;
import javax.persistence.EntityManager;

/**
 * Created by akshay.kesarwan on 22/07/16.
 */
public class ImageRelationDaoImpl extends BaseDaoImpl<ImageRelation, Long> {
    @Inject
    public ImageRelationDaoImpl(Provider<EntityManager> entityManagerProvider) {
        super(entityManagerProvider);
        this.entityClass = ImageRelation.class;
    }
}
