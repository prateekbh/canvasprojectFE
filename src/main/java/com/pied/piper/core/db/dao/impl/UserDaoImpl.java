package com.pied.piper.core.db.dao.impl;

import com.google.inject.Inject;

import com.pied.piper.core.db.model.Image;
import com.pied.piper.core.db.model.User;
import com.pied.piper.core.dto.SearchUserRequestDto;

import org.hibernate.Criteria;
import org.hibernate.Session;
import org.hibernate.criterion.Criterion;
import org.hibernate.criterion.Restrictions;

import java.util.List;

import javax.inject.Provider;
import javax.persistence.EntityManager;

/**
 * Created by palash.v on 21/07/16.
 */
public class UserDaoImpl extends BaseDaoImpl<User, Long> {

    @Inject
    public UserDaoImpl(Provider<EntityManager> entityManagerProvider) {
        super(entityManagerProvider);
        this.entityClass = User.class;
    }

    public List<User> searchUser(SearchUserRequestDto searchUserRequestDto) {
        Session session = (Session) getEntityManager().getDelegate();
        Criteria criteria = session.createCriteria(User.class);
        if (searchUserRequestDto.getName() != null) {
            Criterion typeCriterion = Restrictions.eq("name", searchUserRequestDto.getName());
            criteria.add(typeCriterion);
        }
        if (searchUserRequestDto.getAccountId() != null) {
            Criterion accountIdCriteria = Restrictions.eq("accountId", searchUserRequestDto.getAccountId());
            criteria.add(accountIdCriteria);
        }
        return criteria.list();
    }

}
