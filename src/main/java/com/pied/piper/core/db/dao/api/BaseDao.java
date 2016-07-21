package com.pied.piper.core.db.dao.api;

import javax.persistence.EntityManager;
import javax.validation.constraints.NotNull;
import java.io.Serializable;
import java.util.List;
import java.util.Map;

/**
 * Created by akshay.kesarwan on 21/07/16.
 */
public interface BaseDao<T, ID extends Serializable> {

    void save(T entity);

    T fetchById(long id);

    Class<T> getEntityClass();

    EntityManager getEntityManager();

    List<T> findByQueryAndNamedParams(final Integer firstResult, final Integer maxResults,
                                      @NotNull final String queryStr, @NotNull final Map<String, ?> params);
}