package com.pied.piper.core.services.interfaces;

import com.pied.piper.core.db.model.Image;
import com.pied.piper.core.dto.ImageMetaData;
import com.pied.piper.core.dto.SaveImageRequestDto;
import com.pied.piper.core.dto.SearchResponseDto;

import java.util.List;

/**
 * Created by akshay.kesarwan on 21/05/16.
 */
public interface GalleriaService {
    Long saveImage(SaveImageRequestDto saveImageRequestDto) throws Exception;
    String getImageData(Long imageId);
    ImageMetaData getImageMetaData(Long imageId);
    List<ImageMetaData> getImageMetaData(String accountId);
    List<Image> findByAccountId(String accountId);
    Image getImage(Long imageId);
    SearchResponseDto search(String searchText);
}
