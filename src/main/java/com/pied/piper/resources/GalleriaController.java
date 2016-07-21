package com.pied.piper.resources;

import com.google.inject.Inject;

import com.pied.piper.core.dto.SaveImageRequestDto;
import com.pied.piper.core.services.interfaces.GalleriaService;

import java.util.HashMap;

import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

/**
 * Created by akshay.kesarwan on 21/05/16.
 */
@Path("/galleria")
@Produces(MediaType.APPLICATION_JSON)
public class GalleriaController {

    private GalleriaService galleriaService;

    @Inject
    public GalleriaController(GalleriaService galleriaService) {
        this.galleriaService = galleriaService;
    }

    @GET
    @Path("/test")
    public Response test() {
        String result = "Testing Successful";
        return Response.status(Response.Status.OK).entity(result).build();
    }

    @POST
    @Path("/save")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response saveImage(SaveImageRequestDto saveImageRequestDto) {
        HashMap response = new HashMap();
        try {
            Long imageId = galleriaService.saveImage(saveImageRequestDto);
            response.put("image_id", imageId);
        } catch (Exception e) {
            return Response.status(500).build();
        }
        return Response.status(200).entity(response).build();
    }
}
