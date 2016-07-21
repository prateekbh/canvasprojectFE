package com.pied.piper;

import com.google.inject.Stage;
import com.hubspot.dropwizard.guice.GuiceBundle;
import io.dropwizard.Application;
import io.dropwizard.setup.Bootstrap;
import io.dropwizard.setup.Environment;

/**
 * Created by akshay.kesarwan on 21/05/16.
 */
public class GalleriaApplication extends Application<GalleriaConfiguration> {

    private GuiceBundle<GalleriaConfiguration> guiceBundle;

    @Override
    public void initialize(Bootstrap<GalleriaConfiguration> bootstrap) {
        guiceBundle = GuiceBundle.<GalleriaConfiguration>newBuilder()
                .addModule(new GalleriaModule())
                .addModule(new JPADatabaseModule())
                .enableAutoConfig("com.pied.piper")
                .setConfigClass(GalleriaConfiguration.class)
                .build(Stage.DEVELOPMENT);
        bootstrap.addBundle(guiceBundle);
    }

    @Override
    public void run(GalleriaConfiguration configuration, Environment environment) throws Exception {
    }

    public static void main(String args[]) throws Exception {
        new GalleriaApplication().run(args);
    }
}
