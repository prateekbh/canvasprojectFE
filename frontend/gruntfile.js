var fluxFiles = [
    "./actions/userActions.js",
    "./actions/navigationActions.js",
    "./actions/imageActions.js",
    "./stores/userStore.js",
    "./stores/routeStore.js",
    "./stores/navigationStore.js",
    "./stores/imageStore.js",
];
var vendorFiles = [
    "./node_modules/node-lzw/lib/lzw.js", 
    "./node_modules/riot/riot.js", 
    "./node_modules/riot-mui/build/js/riot-mui.js",
    "./node_modules/veronica-x/veronica.js",
    "./node_modules/tocca/Tocca.js"
];

module.exports = function(grunt) {


    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),


        concat: {
            concat_js: {
                src: vendorFiles,
                dest: "./bin/js/vendor.js"
            },
            concat_tags: {
                src: ["./tags/**/*.html"].concat(fluxFiles),
                dest: "./bin/tags/concat_tags.tag",
            },

            concat_scss: {
                src: ["./node_modules/riot-mui/build/styles/riot-mui.min.css", "./styles/*.scss", "./tags/**/*.scss"],
                dest: "./bin/tags/concat_css.scss",
            }
        },

        sass: {
            transpile_scss: {
                options: {
                    compass: true,
                    trace: true
                },
                files: [{
                    expand: true,
                    src: "./bin/tags/concat_css.scss",
                    ext: '.css',
                    dest: "./"
                }]
            }
        },


        riot: {
            options: {
                compact: true
            },
            tags: {
                src: "./bin/tags/concat_tags.tag",
                dest: "./bin/tags/tags.js"
            }
        },

        babel: {
            options: {
                sourceMap: true,
                presets: ['es2015-riot']
            },
            dist: {
                files: {
                    './bin/tags/tags.es5.js':'./bin/tags/tags.js'
                }
            }
        },

        watch: {
          scripts: {
            files: ['./styles/*', './actions/*','./stores/*','./tags/**/*'],
            tasks: ['default']
          },
        }
    });

    // Load the plugin that provides the "riot" task.
    grunt.loadNpmTasks("grunt-contrib-concat");

    // Load the plugin that provides the "riot" task.
    grunt.loadNpmTasks("grunt-riot");

    // Load the plugin that provides the "sass" task.
    grunt.loadNpmTasks('grunt-sass');

    // Load the grunt riot so that transformation of tags is done on server itself
    grunt.loadNpmTasks('grunt-riot');

    // Load the plugin that provides the "babel" task.
    grunt.loadNpmTasks('grunt-babel');

    // Load the plugin that provides the "watch" task.
    grunt.loadNpmTasks('grunt-contrib-watch');

    //Task for building css static contents of the application
    grunt.registerTask("make-css", ["concat:concat_scss", "sass"]);

    //Task for building javascript static contents of the application
    grunt.registerTask("make-js", ["concat:concat_js", "concat:concat_tags", "riot", "babel"]);

    //Task for building the static contents of the application
    grunt.registerTask("default", ["make-css", "make-js"]);

};
