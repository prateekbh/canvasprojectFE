package com.pied.piper.core.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import io.dropwizard.jackson.JsonSnakeCase;
import lombok.Data;

import java.util.List;

/**
 * Created by palash.v on 21/07/16.
 */
@Data
@JsonSnakeCase
@JsonIgnoreProperties(ignoreUnknown = true)
public class SearchUserRequestDto {
    private String name;
    private String accountId;
    private String userLike;
    private List<String> accountIds;
}
