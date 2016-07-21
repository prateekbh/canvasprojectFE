package com.pied.piper.core.services.impl;

import com.google.inject.Inject;
import com.google.inject.persist.Transactional;

import com.pied.piper.core.db.dao.impl.UserDaoImpl;
import com.pied.piper.core.db.model.User;
import com.pied.piper.core.dto.SearchUserRequestDto;
import com.pied.piper.core.services.interfaces.GalleriaService;
import com.pied.piper.core.services.interfaces.UserService;

import java.util.List;

/**
 * Created by palash.v on 21/07/16.
 */
public class UserServiceImpl implements UserService {

    private final UserDaoImpl userDao;
    private final GalleriaService galleriaService;

    @Inject
    public UserServiceImpl(UserDaoImpl userDao, GalleriaService galleriaService) {
        this.userDao = userDao;
        this.galleriaService = galleriaService;
    }

    @Override
    @Transactional
    public List<User> searchUser(SearchUserRequestDto searchUserRequestDto) {
        return userDao.searchUser(searchUserRequestDto);
    }

    @Override
    @Transactional
    public List<String> getImagesForUser(String accountId) {
//        SearchUserRequestDto searchUserRequestDto = new SearchUserRequestDto();
//        searchUserRequestDto.setAccountId(accountId);
//        List<User> users = userDao.searchUser(searchUserRequestDto);
//        galleriaService.
    return null;
    }
}
