package com.pied.piper.exception;

import javax.ws.rs.core.Response;

import io.dropwizard.jackson.JsonSnakeCase;
import lombok.Data;

/**
 * Created by ankit.c on 21/07/16.
 */
@Data
@JsonSnakeCase
public class ErrorResponse {
    private int errorCode;
    private String errorMessage;

    public ErrorResponse(){}

    public ErrorResponse(String errorMessage){
        this(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(), errorMessage);
    }

    public ErrorResponse(Response.Status status, String errorMessage){
        this(status.getStatusCode(), errorMessage);
    }

    public ErrorResponse(int errorCode, String errorMessage){
        this.errorCode =  errorCode;
        this.errorMessage = errorMessage;
    }
}
