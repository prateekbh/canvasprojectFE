package com.pied.piper.core.services.impl;

import com.google.inject.Inject;

import com.pied.piper.core.db.dao.impl.UserDaoImpl;
import com.pied.piper.core.db.model.User;
import com.pied.piper.core.dto.SearchUserRequestDto;
import com.pied.piper.core.services.interfaces.UserService;

import java.util.List;

/**
 * Created by palash.v on 21/07/16.
 */
public class UserServiceImpl implements UserService {

    private final UserDaoImpl userDao;

    @Inject
    public UserServiceImpl(UserDaoImpl userDao) {
        this.userDao = userDao;
    }

    @Override
    public List<User> searchUser(SearchUserRequestDto searchUserRequestDto) {
        return userDao.searchUser(searchUserRequestDto);
    }
}
