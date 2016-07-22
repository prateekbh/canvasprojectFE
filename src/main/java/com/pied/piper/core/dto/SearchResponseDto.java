package com.pied.piper.core.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import io.dropwizard.jackson.JsonSnakeCase;
import lombok.Data;

import java.util.List;

/**
 * Created by akshay.kesarwan on 21/07/16.
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonSnakeCase
public class SearchResponseDto {
    private List<String> tags;
    private List<UserResponseDto> users;
}
