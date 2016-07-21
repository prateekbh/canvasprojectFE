package com.pied.piper;

import com.google.inject.AbstractModule;
import com.google.inject.Singleton;
import com.pied.piper.core.services.impl.GalleriaServiceImpl;
import com.pied.piper.core.services.interfaces.GalleriaService;


/**
 * Created by akshay.kesarwan on 21/05/16.
 */
public class GalleriaModule extends AbstractModule {
    @Override
    protected void configure() {
        bind(GalleriaService.class).to(GalleriaServiceImpl.class).in(Singleton.class);
    }
}
