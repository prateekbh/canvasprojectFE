package com.pied.piper.core.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import io.dropwizard.jackson.JsonSnakeCase;
import lombok.Data;

import javax.validation.constraints.NotNull;

/**
 * Created by ankit.c on 22/07/16.
 */
@Data
@JsonSnakeCase
@JsonIgnoreProperties(ignoreUnknown = true)
public class CreateImageLikedDto {
    @NotNull
    private Long userId;
}
