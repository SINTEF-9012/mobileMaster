// Generated on 2013-11-11 using generator-angular 0.5.1
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'


module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);
  require('time-grunt')(grunt);

  // https://github.com/yeoman/generator-angular/issues/433#issuecomment-28280870
  var modRewrite = require('connect-modrewrite')([
    '!\\.ttf|\\.woff|\\.ttf|\\.eot|\\.html|\\.js|\\.coffee|\\.css|\\.png|\\.jpg|\\.gif|\\.svg|\\.map|\\.proto|\\.ts|\\.ico|\\.manifest$ /index.html [L]'
  ]);

  var yeoman = {
    // configurable paths
    app: require('./bower.json').appPath || 'app',
    dist: 'dist',
    test: 'test'
  };

  grunt.initConfig({
    yeoman: yeoman,
    watch: {
      compass: {
        files: ['<%= yeoman.app %>/styles/{,*/}*.{scss,sass}'],
        tasks: ['compass:server', 'autoprefixer']
      },
      styles: {
        files: ['<%= yeoman.app %>/styles/{,*/}*.css'],
        tasks: ['copy:styles', 'autoprefixer']
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          '<%= yeoman.app %>/{,*/}*.html',
          '.tmp/styles/{,*/}*.css',
          '<%= yeoman.app %>/scripts/{,*/}*.js',
          '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      },
      ts: {
          files: ['<%= yeoman.app %>/scripts/{,*/}*.ts',
                  '!<%= yeoman.app %>/scripts/reference.ts',
                  '!<%= yeoman.app %>/scripts/{,*/}*.d.ts',
                  '<%= yeoman.test %>/spec/{,*/}*.ts',
                  '!<%= yeoman.test %>/spec/{,*/}*.d.ts',
                  '<%= yeoman.app %>/scripts/masterScope.d.ts'],
          tasks: ['ts:dynamic'],
          options: {
            spawn: false, //important so that the task runs in the same context
          }
      },
      manifest: {
        files: ['<%= yeoman.app %>/index.html'],
        tasks: ['manifest:dynamic']
      }
    },
    ts: {
      options: { // use to override the default options, http://gruntjs.com/configuring-tasks#options
          //comments: false // true | false (default)
          //compile: true, // perform compilation. [true (default) | false]
          //comments: true, // same as !removeComments. [true | false (default)]
          target: 'es5', // target javascript language. [es3 (default) | es5]
          //module: 'amd', // target javascript module style. [amd (default) | commonjs]
          //sourceMap: true, // generate a source map for every output js file. [true (default) | false]
          //sourceRoot: '', // where to locate TypeScript files. [(default) '' == source ts location]
          //mapRoot: '', // where to locate .map.js files. [(default) '' == generated js location.]
          //declaration: true, // generate a declaration .d.ts file for every output js file. [true | false (default)]
          htmlModuleTemplate: 'My.Module.<%= filename %>', // Template for module name for generated ts from html files [(default) '<%= filename %>']
          htmlVarTemplate: '<%= ext %>' // Template for variable name used in generated ts from html files [(default) '<%= ext %>]
      },
      dynamic: {
          src: [],
          options: { // override the main options, http://gruntjs.com/configuring-tasks#options
              sourceMap: true,
              declaration: true,
              comments: true,
              fast: 'always'
          }
      },
      watchS: { // a particular target
          src: ['<%= yeoman.app %>/scripts/{,*/}*.ts',
                '!<%= yeoman.app %>/scripts/reference.ts',
                '!<%= yeoman.app %>/scripts/{,*/}*.d.ts',
                '<%= yeoman.test %>/spec/{,*/}*.ts',
                '!<%= yeoman.test %>/spec/{,*/}*.d.ts'
                ], // The source typescript files, http://gruntjs.com/configuring-tasks#files
          reference: '<%= yeoman.app %>/scripts/reference.ts', // If specified, generate this file that you can use for your reference management
          // out: '<%= yeoman.app %>/scripts/out.js', // If specified, generate an out.js file which is the merged js file
          watch: '<%= yeoman.app %>/scripts',
          options: { // override the main options, http://gruntjs.com/configuring-tasks#options
              sourceMap: true,
              declaration: true,
              comments: true
          },
      },
      build: { // another target
          src: 
          ['<%= yeoman.app %>/scripts/{,*/}*.ts',
                '!<%= yeoman.app %>/scripts/reference.ts',
                '!<%= yeoman.app %>/scripts/{,*/}*.d.ts',
                '<%= yeoman.test %>/spec/{,*/}*.ts',
                '!<%= yeoman.test %>/spec/{,*/}*.d.ts'
                ],
          options: { // overidet he main options for this target
              sourceMap: false,
          }
      },
  },
    autoprefixer: {
      options: ['last 1 version'],
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/styles/',
          src: '{,*/}*.css',
          dest: '.tmp/styles/'
        }]
      }
    },
    connect: {
      options: {
        port: 9000,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: '127.0.0.1',
        livereload: 35729
      },
      livereload: {
        options: {
          open: true,
          middleware: function (connect, options) {
            var serveStatic = require('serve-static');
            return [
              modRewrite,
              serveStatic('.tmp'),
              serveStatic(yeoman.app)
              // require('connect-livereload')(),
              // connect.static('.tmp'),
              // connect.static(yeoman.app)
            ];
          }
        }
      },
      test: {
        options: {
          port: 9001,
          base: [
            '.tmp',
            'test',
            '<%= yeoman.app %>'
          ]
        }
      },
      dist: {
        options: {
          base: '<%= yeoman.dist %>'
        }
      }
    },
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= yeoman.dist %>/*',
            '!<%= yeoman.dist %>/.git*'
          ]
        }]
      },
      server: '.tmp'
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: [
        'Gruntfile.js',
        '<%= yeoman.app %>/scripts/{,*/}*.js'
      ]
    },
    compass: {
      options: {
        sassDir: '<%= yeoman.app %>/styles',
        cssDir: '.tmp/styles',
        generatedImagesDir: '.tmp/images/generated',
        imagesDir: '<%= yeoman.app %>/images',
        javascriptsDir: '<%= yeoman.app %>/scripts',
        fontsDir: '<%= yeoman.app %>/fonts',
        importPath: '<%= yeoman.app %>/bower_components',
        httpImagesPath: '/images',
        httpGeneratedImagesPath: '/images/generated',
        httpFontsPath: '/fonts',
        relativeAssets: false
      },
      dist: {},
      server: {
        options: {
          debugInfo: true
        }
      }
    },
    // not used since Uglify task does concat,
    // but still available if needed
    /*concat: {
      dist: {}
    },*/
    rev: {
      dist: {
        files: {
          src: [
            '<%= yeoman.dist %>/scripts/{,*/}*.js',
            '<%= yeoman.dist %>/styles/{,*/}*.css',
            '<%= yeoman.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
            '<%= yeoman.dist %>/styles/fonts/*'
          ]
        }
      }
    },
    useminPrepare: {
      html: '<%= yeoman.app %>/index.html',
      options: {
        dest: '<%= yeoman.dist %>'
      }
    },
    usemin: {
      html: ['<%= yeoman.dist %>/{,*/}*.html'],
      css: ['<%= yeoman.dist %>/styles/{,*/}*.css'],
      options: {
        dirs: ['<%= yeoman.dist %>']
      }
    },
    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/images',
          src: '{,*/}*.{png,jpg,jpeg}',
          dest: '<%= yeoman.dist %>/images'
        }]
      }
    },
    svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/images',
          src: '{,*/}*.svg',
          dest: '<%= yeoman.dist %>/images'
        }]
      }
    },
    cssmin: {
      // By default, your `index.html` <!-- Usemin Block --> will take care of
      // minification. This option is pre-configured if you do not wish to use
      // Usemin blocks.
      // dist: {
      //   files: {
      //     '<%= yeoman.dist %>/styles/main.css': [
      //       '.tmp/styles/{,*/}*.css',
      //       '<%= yeoman.app %>/styles/{,*/}*.css'
      //     ]
      //   }
      // }
    },
    htmlmin: {
      dist: {
        options: {
          removeComments: true,
          //removeCommentsFromCDATA: true,
          // https://github.com/yeoman/grunt-usemin/issues/44
          //collapseWhitespace: true,
          /*collapseBooleanAttributes: true,
          removeAttributeQuotes: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeOptionalTags: true*/
        },
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>',
          src: ['views/*.html'],
          dest: '<%= yeoman.dist %>'
        }]
      },
      deploy: {
        options: {
          collapseWhitespace: true
        },
        files: [{
          expand: true,
          removeComments: true,
          cwd: '<%= yeoman.dist %>',
          src: ['*.html', 'views/*.html'],
          dest: '<%= yeoman.dist %>'
        }]
      }
    },
    // Put files not handled in other tasks here
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= yeoman.app %>',
          dest: '<%= yeoman.dist %>',
          src: [
            '*.{ico,png,txt}',
            'index.html',
            '.htaccess',
            'bower_components/bootstrap-sass-official/assets/fonts/**/*',
            'images/{,*/}*.{gif,webp}',
            'fonts/*'
          ]
        }, {
          expand: true,
          cwd: '.tmp/images',
          dest: '<%= yeoman.dist %>/images',
          src: [
            'generated/*'
          ]
        }]
      },
      styles: {
        expand: true,
        cwd: '<%= yeoman.app %>/styles',
        dest: '.tmp/styles/',
        src: '{,*/}*.css'
      }
    },
    concurrent: {
      watch: {
        tasks: ['watch', 'ts:watchS'],
        options: {
          logConcurrentOutput: true
        }
      },
      server: [
        'compass:server',
        'copy:styles',
        'manifest:dynamic'
      ],
      test: [
        'compass',
        'copy:styles'
      ],
      dist: [
        'compass:dist',
        'copy:styles',
        'imagemin',
        'svgmin',
        'htmlmin:dist'
      ]
    },
    karma: {
      unit: {
        configFile: 'karma.conf.js',
        autoWatch: true,
        singleRun: false
      }
    },
    cdnify: {
      dist: {
        html: ['<%= yeoman.dist %>/*.html']
      }
    },
    ngmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/concat/scripts',
          src: '*.js',
          dest: '.tmp/concat/scripts'
        }]
      }
    },
    manifest: {
      dist: {
        options: {
          basePath: './dist/',
          verbose: false,
          //preferOnline: true,
          fallback: ['/ index.html']
        },
        src: [
          'index.html',
          'styles/*.css',
          'scripts/*.js',
          'views/*.html',
          'images/*.png',
          'fonts/*-webfont.woff',
          'bower_components/bootstrap-sass-official/assets/fonts/bootstrap/*.woff'
        ],
        dest: './dist/cache.manifest'
      },
      dynamic: {
        options: {
          basePath: './app/'
        },
        src: ['index.html'],
        dest: './app/cache.manifest'
      }
    } 
  });

  grunt.event.on('watch', function(action, filepath) {
    var tsConfig = grunt.config("ts" );

    console.log(filepath);

    if (filepath.match(/\.ts$/)) {
      grunt.config("ts.dynamic.src", [filepath]);
    }
  });

  grunt.registerTask('serve', function (target) {
    grunt.task.run(['server']);
  });
  
  grunt.registerTask('server', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'clean:server',
      'concurrent:server',
      'autoprefixer',
      'connect:livereload',
      'watch'
    ]);
  });

  grunt.registerTask('tsserver', [
      'clean:server',
      'concurrent:server',
      'ts:dev',
      'autoprefixer',
      'connect:livereload',
      'watch'
    ]);

  grunt.registerTask('test', [
    'ts:dev',
    'clean:server',
    'concurrent:test',
    'autoprefixer',
    'connect:test',
    'karma'
  ]);

  grunt.registerTask('build', [
    'ts:build',
    'clean:dist',
    'useminPrepare',
    'concurrent:dist',
    'autoprefixer',
    'concat',
    'ngmin',
    'copy:dist',
    // 'cdnify', I dislike CDN
    'cssmin',
    'uglify',
    // 'rev',
    'usemin',
    'htmlmin:deploy',
    'manifest'
  ]);

  grunt.registerTask('default', [
    'jshint',
    'test',
    'build'
  ]);
};
