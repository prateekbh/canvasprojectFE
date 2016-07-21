package com.pied.piper.core.services.interfaces;

import com.pied.piper.core.db.model.ImageTags;

import java.util.List;

/**
 * Created by akshay.kesarwan on 21/07/16.
 */
public interface ImageTagService {

    List<ImageTags> searchImageTags(String tagText);

    void saveImageTag(ImageTags imageTags);
}
