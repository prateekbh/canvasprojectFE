package com.pied.piper.serialiser;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.pied.piper.core.db.model.Image;

import java.io.IOException;

/**
 * Created by ankit.c on 22/07/16.
 */
public class ImageSerialiser extends JsonSerializer<Image> {
    @Override
    public void serialize(Image value, JsonGenerator gen, SerializerProvider serializers) throws IOException, JsonProcessingException {
        gen.writeNumber(value.getImageId());
    }
}
