package com.pied.piper.core.dto;

import com.pied.piper.core.db.model.Image;
import com.pied.piper.core.db.model.ImageTags;

import java.util.List;

import io.dropwizard.jackson.JsonSnakeCase;
import lombok.Data;

/**
 * Created by ankit.c on 21/07/16.
 */
@Data
@JsonSnakeCase
public class ImageMetaData {
    private Long imageId;
    private String title;
    private String description;
    private String accountId;
    private Integer numOfLikes;
    private Boolean isCloned;
    private List<ImageTags> tags;

    public ImageMetaData(){}

    public ImageMetaData(Image image){
        this.imageId = image.getImageId();
        this.title = image.getTitle();
        this.description = image.getDescription();
        this.accountId = image.getAccountId();
        this.numOfLikes = image.getNumOfLikes();
        this.isCloned = image.getIsCloned();
        this.tags = image.getTags();
    }
}
