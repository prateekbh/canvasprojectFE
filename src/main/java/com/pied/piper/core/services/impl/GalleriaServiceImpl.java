package com.pied.piper.core.services.impl;

import com.google.inject.Inject;
import com.google.inject.persist.Transactional;
import com.pied.piper.core.db.dao.impl.ImageDaoImpl;
import com.pied.piper.core.db.model.Image;
import com.pied.piper.core.dto.SaveImageRequestDto;
import com.pied.piper.core.services.interfaces.GalleriaService;
import lombok.extern.slf4j.Slf4j;

/**
 * Created by akshay.kesarwan on 21/05/16.
 */
@Slf4j
public class GalleriaServiceImpl implements GalleriaService {

    private final ImageDaoImpl imageDao;

    @Inject
    public GalleriaServiceImpl(ImageDaoImpl imageDao) {
        this.imageDao = imageDao;
    }

    @Override
    @Transactional
    public Long saveImage(SaveImageRequestDto saveImageRequestDto) throws Exception {
        try {
            Image image = null;
            if(saveImageRequestDto.getImageId()!=null) {
                image = imageDao.fetchById(saveImageRequestDto.getImageId());
            }
            if (image == null) {
                image = new Image();
            }

            if (saveImageRequestDto.getImage() != null)
                image.setImage(saveImageRequestDto.getImage());

            if (saveImageRequestDto.getDescription() != null)
                image.setDescription(saveImageRequestDto.getDescription());

            if (saveImageRequestDto.getTitle() != null)
                image.setTitle(saveImageRequestDto.getTitle());

            // Add tags

            imageDao.save(image);

            return image.getImageId();
        } catch (Exception e) {
            log.error("Error in db " + e);
            throw e;
        }
    }
}
