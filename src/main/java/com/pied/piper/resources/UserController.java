package com.pied.piper.resources;

import com.google.inject.Inject;
import com.pied.piper.core.dto.UserDetails;
import com.pied.piper.core.services.interfaces.UserService;
import com.pied.piper.exception.ErrorResponse;
import com.pied.piper.exception.ResponseException;
import lombok.extern.slf4j.Slf4j;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

/**
 * Created by ankit.c on 21/07/16.
 */
@Path("/user")
@Produces(MediaType.APPLICATION_JSON)
@Slf4j
public class UserController {
    @Inject
    private UserService userService;

    @GET
    @Path("/{user_id}/details")
    public Response getUserDetails(@PathParam("user_id") Long userId) {
        try {
            UserDetails userDetails = userService.getUserDetailsByUserId(userId);
            if (userDetails == null) {
                ErrorResponse error = new ErrorResponse(Response.Status.NOT_FOUND.getStatusCode(), "user not found");
                return Response.status(Response.Status.NOT_FOUND).entity(error).build();
            }
            return Response.status(Response.Status.OK).entity(userDetails).build();
        } catch (ResponseException e) {
            return Response.status(e.getErrorResponse().getErrorCode()).entity(e.getErrorResponse()).build();
        } catch (Exception e){
            String errorMsg = String.format("Error while fetching user details for user id %d.", userId);
            log.error(errorMsg, e);
            ErrorResponse errorResponse = new ErrorResponse(errorMsg + " " + e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(errorResponse).build();
        }
    }
}
