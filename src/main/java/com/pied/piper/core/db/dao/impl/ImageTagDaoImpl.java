package com.pied.piper.core.db.dao.impl;

import com.google.inject.Inject;
import com.pied.piper.core.db.model.ImageTags;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.criterion.Criterion;
import org.hibernate.criterion.MatchMode;
import org.hibernate.criterion.Restrictions;

import javax.inject.Provider;
import javax.persistence.EntityManager;
import java.util.List;

/**
 * Created by akshay.kesarwan on 21/07/16.
 */
@Slf4j
public class ImageTagDaoImpl extends BaseDaoImpl<ImageTags, Long> {

    @Inject
    public ImageTagDaoImpl(Provider<EntityManager> entityManagerProvider) {
        super(entityManagerProvider);
        this.entityClass = ImageTags.class;
    }

    public List<ImageTags> getImageTags(String tagText) {
        Criterion tagCriterion = Restrictions.like("tag", tagText, MatchMode.ANYWHERE);
        return findByCriteria(tagCriterion);
    }
}
