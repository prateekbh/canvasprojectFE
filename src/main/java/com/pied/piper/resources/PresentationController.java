package com.pied.piper.resources;

import com.google.inject.Inject;
import com.pied.piper.core.services.interfaces.GalleriaService;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

/**
 * Created by akshay.kesarwan on 21/05/16.
 */
@Path("/ppt")
@Produces(MediaType.APPLICATION_JSON)
public class PresentationController {

    private GalleriaService galleriaService;

    @Inject
    public PresentationController(GalleriaService galleriaService) {
        this.galleriaService = galleriaService;
    }

    @GET
    @Path("/test")
    public Response test() {
        String result = "Testing Successful";
        return Response.status(Response.Status.OK).entity(result).build();
    }
}
