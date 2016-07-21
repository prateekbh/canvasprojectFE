package com.pied.piper.core.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

import io.dropwizard.jackson.JsonSnakeCase;
import lombok.Data;

/**
 * Created by akshay.kesarwan on 21/07/16.
 */
@JsonSnakeCase
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class SaveImageRequestDto {

    private Long imageId;

    private String image;

    private List<String> tags;

    private String description;

    private String title;
}
