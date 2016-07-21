package com.pied.piper.core.dto;

import com.pied.piper.core.db.model.Image;
import io.dropwizard.jackson.JsonSnakeCase;
import lombok.Data;

import javax.persistence.Column;
import javax.persistence.Version;

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

    public ImageMetaData(){}

    public ImageMetaData(Image image){
        this.imageId = image.getImageId();
        this.title = image.getTitle();
        this.description = image.getDescription();
        this.accountId = image.getAccountId();
        this.numOfLikes = image.getNumOfLikes();
    }
}
