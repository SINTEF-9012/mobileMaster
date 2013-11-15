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
    '!\\.ttf|\\.woff|\\.ttf|\\.eot|\\.html|\\.js|\\.coffee|\\.css|\\.png|\\.jpg|\\.gif|\\.svg|\\.map$ /index.html [L]'
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
      // coffee: {
      //   files: ['<%= yeoman.app %>/scripts/{,*/}*.coffee'],
      //   tasks: ['coffee:dist']
      // },
      // coffeeTest: {
      //   files: ['test/spec/{,*/}*.coffee'],
      //   tasks: ['coffee:test']
      // },
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
          '{.tmp,<%= yeoman.app %>}/scripts/{,*/}*.js',
          '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      },
      ts: {
          files: ['<%= yeoman.app %>/scripts/{,*/}*.ts',
                  '!<%= yeoman.app %>/scripts/reference.ts',
                  '!<%= yeoman.app %>/scripts/{,*/}*.d.ts',
                  '<%= yeoman.test %>/spec/{,*/}*.ts',
                  '!<%= yeoman.test %>/spec/{,*/}*.d.ts'],
          tasks: ['ts:dev']
      }
    },
    ts: {
    options: { // use to override the default options, http://gruntjs.com/configuring-tasks#options
        target: 'es3', // es3 (default) / or es5
        //module: 'commonjs', // amd , commonjs (default)
        sourcemap: true, // true (default) | false
        //declaration: false, // true | false (default)
        //nolib: false, // true | false (default)
        //comments: false // true | false (default)
    },
    dev: { // a particular target
        src: ['<%= yeoman.app %>/scripts/{,*/}*.ts',
              '!<%= yeoman.app %>/scripts/reference.ts',
              '!<%= yeoman.app %>/scripts/{,*/}*.d.ts',
              '<%= yeoman.test %>/spec/{,*/}*.ts',
              '!<%= yeoman.test %>/spec/{,*/}*.d.ts'
              ], // The source typescript files, http://gruntjs.com/configuring-tasks#files
        reference: '<%= yeoman.app %>/scripts/reference.ts', // If specified, generate this file that you can use for your reference management
        // out: '<%= yeoman.app %>/scripts/out.js', // If specified, generate an out.js file which is the merged js file
        options: { // override the main options, http://gruntjs.com/configuring-tasks#options
            sourcemap: true,
            declaration: true,
            comments: true,
            target: 'es5'
        },
    },
    build: { // another target
        src: ['<%= yeoman.app %>/scripts/*.ts'],
        options: { // overide the main options for this target
            sourcemap: false,
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
            return [
              modRewrite,
              // require('connect-livereload')(),
              connect.static('.tmp'),
              connect.static(yeoman.app)
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
    // coffee: {
    //   options: {
    //     sourceMap: true,
    //     sourceRoot: ''
    //   },
    //   dist: {
    //     files: [{
    //       expand: true,
    //       cwd: '<%= yeoman.app %>/scripts',
    //       src: '{,*/}*.coffee',
    //       dest: '.tmp/scripts',
    //       ext: '.js'
    //     }]
    //   },
    //   test: {
    //     files: [{
    //       expand: true,
    //       cwd: 'test/spec',
    //       src: '{,*/}*.coffee',
    //       dest: '.tmp/spec',
    //       ext: '.js'
    //     }]
    //   }
    // },
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
        assetsDirs: ['<%= yeoman.dist %>']
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
          /*removeCommentsFromCDATA: true,
          // https://github.com/yeoman/grunt-usemin/issues/44
          //collapseWhitespace: true,
          collapseBooleanAttributes: true,
          removeAttributeQuotes: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeOptionalTags: true*/
        },
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>',
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
            '.htaccess',
            'bower_components/**/*',
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
      server: [
        //'coffee:dist',
        'compass:server',
        'copy:styles'
      ],
      test: [
        //'coffee',
        'compass',
        'copy:styles'
      ],
      dist: [
        //'coffee',
        'compass:dist',
        'copy:styles',
        'imagemin',
        'svgmin',
        'htmlmin'
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
    uglify: {
      dist: {
        files: {
          '<%= yeoman.dist %>/scripts/scripts.js': [
            '<%= yeoman.dist %>/scripts/scripts.js'
          ]
        }
      }
    }
  });

  grunt.registerTask('server', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'clean:server',
      'concurrent:server',
      'ts:dev',
      'autoprefixer',
      'connect:livereload',
      'watch'
    ]);
  });

  grunt.registerTask('test', [
    'ts:dev',
    'clean:server',
    'concurrent:test',
    'autoprefixer',
    'connect:test',
    'karma'
  ]);

  grunt.registerTask('build', [
    'ts',
    'clean:dist',
    'useminPrepare',
    'concurrent:dist',
    'autoprefixer',
    'concat',
    'copy:dist',
    // 'cdnify', I dislike CDN
    'ngmin',
    'cssmin',
    // 'uglify',
    'rev',
    'usemin'
  ]);

  grunt.registerTask('default', [
    'jshint',
    'test',
    'build'
  ]);
};
