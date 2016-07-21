package com.pied.piper.resources;

import com.google.inject.Inject;
import com.pied.piper.core.dto.ImageMetaData;
import com.pied.piper.core.services.interfaces.GalleriaService;
import com.pied.piper.exception.ErrorResponse;
import com.pied.piper.exception.ResponseException;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

/**
 * Created by ankit.c on 21/07/16.
 */
@Path("/image")
@Produces(MediaType.APPLICATION_JSON)
public class ImageController {
    @Inject
    private GalleriaService galleriaService;

    public ImageController() {
    }

    @GET
    @Path("/{image_id}/data")
    public Response getImageData(@PathParam("image_id") Long imageId) {
        try {
            String imageData = galleriaService.getImageData(imageId);
            if (imageData == null) {
                ErrorResponse error = new ErrorResponse(Response.Status.NOT_FOUND.getStatusCode(), "image not found");
                return Response.status(Response.Status.NOT_FOUND).entity(error).build();
            }
            return Response.status(Response.Status.OK).entity(imageData).build();
        } catch (ResponseException e) {
            return Response.status(e.getErrorResponse().getErrorCode()).entity(e.getErrorResponse()).build();
        }
    }

    @GET
    @Path("/{image_id}/metadata")
    public Response getImageMetaData(@PathParam("image_id") Long imageId) {
        try {
            ImageMetaData imageMetaData = galleriaService.getImageMetaData(imageId);
            if (imageMetaData == null) {
                ErrorResponse error = new ErrorResponse(Response.Status.NOT_FOUND.getStatusCode(), "image not found");
                return Response.status(Response.Status.NOT_FOUND).entity(error).build();
            }
            return Response.status(Response.Status.OK).entity(imageMetaData).build();
        } catch (ResponseException e) {
            return Response.status(e.getErrorResponse().getErrorCode()).entity(e.getErrorResponse()).build();
        }
    }
}
