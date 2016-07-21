package com.pied.piper.core.services.interfaces;

import com.pied.piper.core.dto.SaveImageRequestDto;

/**
 * Created by akshay.kesarwan on 21/05/16.
 */
public interface GalleriaService {
    Long saveImage(SaveImageRequestDto saveImageRequestDto) throws Exception;
}
