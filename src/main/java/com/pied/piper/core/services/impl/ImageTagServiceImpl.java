package com.pied.piper.core.services.impl;

import com.google.inject.Inject;
import com.pied.piper.core.db.dao.impl.ImageTagDaoImpl;
import com.pied.piper.core.db.model.ImageTags;
import com.pied.piper.core.services.interfaces.ImageTagService;

import java.util.List;

/**
 * Created by akshay.kesarwan on 21/07/16.
 */
public class ImageTagServiceImpl implements ImageTagService {

    private final ImageTagDaoImpl imageTagDao;

    @Inject
    public ImageTagServiceImpl(ImageTagDaoImpl imageTagDao) {
        this.imageTagDao = imageTagDao;
    }

    @Override
    public List<ImageTags> searchImageTags(String tagText) {
        return imageTagDao.getImageTags(tagText);
    }

    @Override
    public void saveImageTag(ImageTags imageTags) {
        imageTagDao.save(imageTags);
    }
}
