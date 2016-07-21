package com.pied.piper.core.db.dao.impl;

/**
 * Created by divya.rai on 04/03/16.
 */

import com.google.inject.Inject;
import com.google.inject.persist.Transactional;
import com.pied.piper.core.db.dao.api.BaseDao;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.Criteria;
import org.hibernate.LockMode;
import org.hibernate.Session;
import org.hibernate.criterion.Criterion;
import org.hibernate.criterion.Order;

import javax.inject.Provider;
import javax.persistence.EntityManager;
import javax.persistence.LockModeType;
import javax.persistence.Query;
import javax.validation.constraints.NotNull;
import java.io.Serializable;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.util.List;
import java.util.Map;

@Slf4j
public class BaseDaoImpl<T, ID extends Serializable> implements BaseDao<T, ID> {

    protected Class<T> entityClass;
    private final Provider<EntityManager> entityManagerProvider;
    private final Integer lockTimeout = 10;

    @Inject
    public BaseDaoImpl(Provider<EntityManager> entityManagerProvider) {
        this.entityManagerProvider = entityManagerProvider;
    }

    @Override
    public EntityManager getEntityManager() {
        return entityManagerProvider.get();
    }

    @Override
    @Transactional
    public void save(T entity) {
        EntityManager em = getEntityManager();
        if (em.contains(entity) ) {
            em.merge(entity);
        } else {
            em.persist(entity);
        }
        em.flush();
    }

    @Override
    public T fetchById(final long id) {
        EntityManager em = getEntityManager();
        T entity = em.find(getEntityClass(), id);
        em.flush();
        return entity;
    }

    @Override
    public Class<T> getEntityClass() {
        if (entityClass == null) {
            Type type = getClass().getGenericSuperclass();
            log.info(type.toString() + "---- Type -----" + ParameterizedType.class);
            if (type instanceof ParameterizedType) {
                ParameterizedType paramType = (ParameterizedType) type;
                entityClass = (Class<T>) paramType.getActualTypeArguments()[0];
            } else {
                throw new IllegalArgumentException("Could not guess entity class by reflection");
            }
        }
        return entityClass;
    }

    protected List<T> findByCriteria(final Criterion... criterion) {
        Session session = (Session) getEntityManager().getDelegate();
        Criteria crit = session.createCriteria(getEntityClass());

        for (final Criterion c : criterion) {
            crit.add(c);
        }
        final List<T> result = crit.list();
        return result;
    }

    @Override
    public List<T> findByQueryAndNamedParams(final Integer firstResult, final Integer maxResults,
                                             @NotNull final String queryStr, @NotNull final Map<String, ?> params) {
        Query query = getEntityManager().createQuery(queryStr);
        for (final Map.Entry<String, ? extends Object> param : params.entrySet()) {
            query.setParameter(param.getKey(), param.getValue());
        }

        if(firstResult != null) query.setFirstResult(firstResult);
        if(maxResults != null) query.setMaxResults(maxResults);
        final List<T> result = (List<T>) query.getResultList();
        return result;
    }

    @Transactional
    public T fetchEntity(final ID id, LockModeType lockModeType) {
        EntityManager em = getEntityManager();
        T entity = em.find(getEntityClass(), id, lockModeType);
        em.flush();
        return entity;
    }

    protected List<T> findByCriteriaLockNode(LockMode lockMode, final Criterion... criterion) {
        return findByCriteria(0, 10, lockMode, criterion);
    }

    protected List<T> findByCriteria(final int firstResult, final int maxResults, LockMode lockMode, final Criterion... criterion) {
        return findByCriteria(firstResult, maxResults, null, lockMode, criterion);
    }

    protected List<T> findByCriteria(final int firstResult, final int maxResults, final Order order, LockMode lockMode, final Criterion... criterion) {
        Session session = (Session) getEntityManager().getDelegate();
        Criteria crit = session.createCriteria(getEntityClass());

        for (final Criterion c : criterion) {
            crit.add(c);
        }

        if (order !=  null) {
            crit.addOrder(order);
        }

        if (firstResult > 0) {
            crit.setFirstResult(firstResult);
        }

        if (maxResults > 0) {
            crit.setMaxResults(maxResults);
        }

        if(lockMode != null) {
            crit.setLockMode(lockMode);
            crit.setTimeout(lockTimeout);
        }
        final List<T> result = crit.list();
        return result;
    }


}
