package com.pied.piper.core.services.interfaces;

import com.pied.piper.core.db.model.User;
import com.pied.piper.core.dto.SearchUserRequestDto;
import com.pied.piper.core.dto.UserDetails;

import java.util.List;

/**
 * Created by palash.v on 21/07/16.
 */
public interface UserService {

    List<User> searchUser(SearchUserRequestDto searchUserRequestDto);

    List<String> getImagesForUser(String accountId);

    User findByAccountId(String accountId);

    UserDetails getUserDetailsByUserId(Long userId);
}
