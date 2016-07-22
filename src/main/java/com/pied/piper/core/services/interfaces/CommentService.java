package com.pied.piper.core.services.interfaces;

import com.pied.piper.core.db.model.Comment;
import com.pied.piper.core.db.model.ImageLikes;
import com.pied.piper.core.dto.CreateCommentDto;

import java.util.List;

/**
 * Created by ankit.c on 22/07/16.
 */
public interface CommentService {
    Comment save(Long imageId, CreateCommentDto dto);
    List<Comment> findByImageId(Long imageId);
    List<Comment> findByAccountId(String accountId);
}
