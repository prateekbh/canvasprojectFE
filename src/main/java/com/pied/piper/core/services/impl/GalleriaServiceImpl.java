package com.pied.piper.core.services.impl;

import com.google.inject.Inject;
import com.google.inject.persist.Transactional;
import com.pied.piper.core.db.dao.impl.ImageDaoImpl;
import com.pied.piper.core.db.model.Image;
import com.pied.piper.core.db.model.ImageTags;
import com.pied.piper.core.db.model.User;
import com.pied.piper.core.dto.*;
import com.pied.piper.core.services.interfaces.GalleriaService;
import com.pied.piper.core.services.interfaces.UserService;
import com.pied.piper.exception.ResponseException;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Created by akshay.kesarwan on 21/05/16.
 */
@Slf4j
public class GalleriaServiceImpl implements GalleriaService {

    private final ImageDaoImpl imageDao;
    private final ImageTagServiceImpl imageTagService;
    private final UserService userService;

    @Inject
    public GalleriaServiceImpl(ImageDaoImpl imageDao, ImageTagServiceImpl imageTagService, UserService userService) {
        this.imageDao = imageDao;
        this.imageTagService = imageTagService;
        this.userService = userService;
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

            imageDao.save(image);

            // Add tags
            if (!saveImageRequestDto.getTags().isEmpty()) {
                List<ImageTags> imageTagses = new ArrayList<>();
                for(String tag : saveImageRequestDto.getTags()) {
                    ImageTags imageTags = new ImageTags();
                    imageTags.setSourceImage(image);
                    imageTags.setTag(tag);
                    imageTagService.saveImageTag(imageTags);
                    imageTagses.add(imageTags);
                }
                image.setTags(imageTagses);
            }

            imageDao.save(image);

            return image.getImageId();
        } catch (Exception e) {
            log.error("Error in saving Image " + e);
            throw e;
        }
    }

    @Transactional
    public String getImageData(Long imageId) {
        Image image = getImage(imageId);
        if(image == null)
            return null;
        return image.getImage();
    }

    @Override
    @Transactional
    public ImageMetaData getImageMetaData(Long imageId) {
        Image image = getImage(imageId);
        if(image == null)
            return null;
        return new ImageMetaData(image);
    }

    @Override
    @Transactional
    public Image getImage(Long imageId) {
        try {
            return imageDao.fetchById(imageId);
        } catch (Exception e) {
            log.error("Some error while fetching for " + imageId, e);
            throw new ResponseException("Error while fetching for " + imageId + ". " + e.getMessage(), e);
        }
    }

    public SearchResponseDto search(String searchText) {
        // Search Tags
        List<ImageTags> imageTags = imageTagService.searchImageTags(searchText);
        List<String> tagStrings = imageTags.stream().map(imageTag -> imageTag.getTag()).collect(Collectors.toList());

        // Search Users
        SearchUserRequestDto searchUserRequestDto = new SearchUserRequestDto();
        searchUserRequestDto.setUserLike(searchText);
        List<User> users = userService.searchUser(searchUserRequestDto);

        SearchResponseDto searchResponseDto = new SearchResponseDto();
        searchResponseDto.setTags(tagStrings);
        List<UserResponseDto> userResponseDtos = new ArrayList<>();
        if(users!=null && users.size()>0) {
            for(User user : users) {
                UserResponseDto userResponseDto = new UserResponseDto(user);
                userResponseDtos.add(userResponseDto);
            }
            searchResponseDto.setUsers(userResponseDtos);
        }
        return searchResponseDto;
    }
}
