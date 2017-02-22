var glob = require('glob');
var _ = require('lodash');
var fs = require('fs');

module.exports = function (grunt) {
    // load all grunt tasks matching the ['grunt-*', '@*/grunt-*'] patterns
    require('jit-grunt')(grunt);

    grunt.initConfig({
        paths: {
            tmp: './.tmp',
            dest: './dist',
            src: './src',
            sass: '<%=paths.src%>/assets/scss',
            css: '<%=paths.src%>/assets/css',
            js: '<%=paths.src%>/assets/js',
            img: '<%=paths.src%>/assets/img',
            data: '<%=paths.src%>/assets/data',
            svg: '<%=paths.src%>/assets/svg',
            data: '<%=paths.src%>/assets/data'
        },
        sass: {
            },
            dev: {
                files: {
                '<%=paths.tmp%>/assets/styles.css': '<%=paths.sass%>/styles.scss'
                }
            }
        },
        concat: {
            options: {
                process: function(src, filepath) {
                    return "// Source: " + filepath + "\n" +
                    (filepath.indexOf('_intro') === -1 ? ";(function( window, $, Phaser, undefined ){ \n 'use strict';\n\n":"") + 
                    src + 
                    (filepath.indexOf('_intro') === -1 ? "\n\n}( window, jQuery, window.Phaser ));":"");
                }
            },
            dev: {
                files: {
                    '<%=paths.tmp%>/assets/app.js': ['<%=paths.js%>/**.js', '!<%=paths.js%>/_intro.js']
                }
            }
        },
        uglify: {
            options: {
                drop_console: true
            },
            prod: {
                options: {

                },
                files: {
                    '<%=paths.tmp%>/assets/js/app.min.js': ['<%=paths.tmp%>/assets/js/app.js'],
                }
            }
        },
        cssmin: {
            options: {},
            prod: {
                files: {
                    '<%=paths.tmp%>/assets/styles.min.css': '<%=paths.tmp%>/assets/styles.css',
                    '<%=paths.tmp%>/assets/critical.min.css': '<%=paths.tmp%>/assets/critical.css'
                }
            }
        },
        bake:  {
            options: {
                content: '<%=paths.src%>/language.json',
                removeUndefined: false,
                basePath: '/tpl',
                transforms: {
                    toJson: function (str) {
                        return JSON.stringify(str);  
                    },
                    url: function(str) {
                        if (process.env.NODE_ENV !== 'production') {
                            if (str.includes('/de')) {
                                str = 'index_de.html';
                                console.log('> replaced "http://juliankern.com/de" with "' + str + '"');
                                
                            }
                            
                            if (str.includes('/en')) {
                                str = 'index_en.html';
                                console.log('> replaced "http://juliankern.com/en" with "' + str + '"');
                            }
                        } 

                        if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
                            if (str.includes('contact.php')) {
                                str = 'http://dev.jukn.de/juliankern_com/contact.php';
                                console.log('> replaced "contact.php" with "' + str + '"');
                            }
                        }
                        
                        return str;
                    }
                }
            },
            de: {
                options: { section: 'de' },
                files:  {
                    '<%=paths.tmp%>/index_de.html': '<%=paths.src%>/index.html'
                }
            },
            en: {
                options: { section: 'en' },
                files:  {
                    '<%=paths.tmp%>/index_en.html': '<%=paths.src%>/index.html'
                }
            },
        },
        connect:  {
            options: {
                port: 3000,
                useAvailablePort: true,
                livereload: 9003,
                open: true,
                hostname: 'localhost'
            },
            dev:  {
                options:  {
                    base: '<%=paths.tmp%>'
                }
            }
        },
        watch: {
            options: {
                interrupt: true,
                livereload: 9003
            },
            sass: {
                files: '<%=paths.sass%>/**.scss',
                tasks: ['sass:dev']
            },
            css: {
                files: ['<%=paths.css%>/**.css'],
                tasks: ['copy:dev']
            },
            js: {
                files: '<%=paths.js%>/**.js',
                tasks: [
                    'copy:dev'
                ]
            },
            html: {
                files: [
                    '<%=paths.src%>/**.html', 
                    '<%=paths.src%>/language.json', 
                    '<%=paths.src%>/tpl/**.html', 
                    '<%=paths.src%>/tpl/includes/**.html'
                ],
                tasks: ['bake']
            },
            svg: {
                files: ['<%=paths.svg%>/**.svg'],
                tasks: ['svgstore:dev']
            },
            configFiles: {
                files: [ 'Gruntfile.js', 'config/*.js'],
                tasks: ['build_dev'],
                options: {
                    reload: true
                }
            }
        },
        copy:  {
            dev:  {
                files: 
                [
                    { expand: true, cwd:'<%=paths.svg%>/', src: ['**'], dest: '<%=paths.tmp%>/assets/svg/' },
                    // { expand: true, cwd:'<%=paths.img%>/', src: ['**'], dest: '<%=paths.tmp%>/assets/img/' },
                    { expand: true, cwd:'<%=paths.img%>/', src: ['logo-square.png', 'clear.gif'], dest: '<%=paths.tmp%>/assets/img/' },
                    { expand: true, cwd:'<%=paths.css%>/', src: ['**'], dest: '<%=paths.tmp%>/assets/css/' },
                    { expand: true, cwd:'<%=paths.data%>/', src: ['**'], dest: '<%=paths.tmp%>/assets/data/' },
                    { expand: true, cwd:'<%=paths.js%>/', src: ['**'], dest: '<%=paths.tmp%>/assets/js/' },
                    { expand: true, cwd:'<%=paths.src%>/', src: ['manifest.json', 'favicon.ico', 'browserconfig.xml', 'robots.txt', '*.{php,html}', '!index.html'], dest: '<%=paths.tmp%>/' },
                ]
            },
            prod: {
                files: 
                [
                    { expand: true, cwd:'<%=paths.tmp%>/', src: ['**'], dest: '<%=paths.dest%>/' },
                    { expand: true, cwd:'./', src: ['vendor/**'], dest: '<%=paths.dest%>/' },
                    // { expand: true, cwd:'./', src: ['*.php', '{vendor,uploads}/**'], dest: '<%=paths.dest%>/' },
                ]
            }
        },
        svgstore: {
            options: {
                symbol: {
                    viewBox: '0 0 100 100',
                    xmlns: 'http://www.w3.org/2000/svg'
                },
                formatting : {
                    indent_size : 2
                },
                cleanup: ['fill'],
                cleanupdefs: true
            },
            dev: {
                files: {
                    '<%=paths.tmp%>/assets/svg/sprite.svg': ['<%=paths.svg%>/*.svg'],
                }
            }
        },
        clean: {
            dev: ['<%=paths.tmp%>'],
            prod: 
            [
                '<%=paths.dest%>/**/*.css',
                '<%=paths.dest%>/**/*.js',
                '!<%=paths.dest%>/**/*.min.css',
                '!<%=paths.dest%>/**/*.min.js',
                '<%=paths.tmp%>'
            ],
            rebuild: ['<%=paths.tmp%>/assets/*.js'],
            build: ['<%=paths.dest%>']
        },
        responsive_images: {
            base: {
                options: {
                    sizes: [
                        { name: 'blur', width: 20 },
                        { width: 200 },
                        { width: 480 },
                        { width: 640 },
                        { width: 960 },
                        { width: 1280 },
                        { width: 1440 },
                        { width: 1920 },
                        { name: 'square-blur', width: 20, height: 20, gravity: 'NorthWest', aspectRatio: false },
                        { name: 'square-200', width: 200, height: 200, gravity: 'NorthWest', aspectRatio: false },
                        { name: 'square-480', width: 480, height: 480, gravity: 'NorthWest', aspectRatio: false },
                        { name: 'square-640', width: 640, height: 640, gravity: 'NorthWest', aspectRatio: false },
                        { name: 'square-960', width: 960, height: 960, gravity: 'NorthWest', aspectRatio: false },
                        { name: 'square-1280', width: 1280, height: 1280, gravity: 'NorthWest', aspectRatio: false },
                    ]
                },
                files: [
                    {
                        expand: true,
                        cwd: '<%=paths.img%>/',
                        dest: '<%=paths.tmp%>/assets/img/',
                        src: ['**.{jpg,gif,png}', '!logo-square.png', '!clear.gif']
                    }
                ]
            }
        },
        image: {
            static: {
                options: {
                    pngquant: true,
                    optipng: false,
                    zopflipng: true,
                    jpegRecompress: false,
                    jpegoptim: true,
                    mozjpeg: true,
                    gifsicle: true,
                    svgo: true
                },
                files: [{
                    expand: true, 
                    cwd: '<%=paths.tmp%>/assets/img/',               
                    src: ['**/*.{png,jpg,gif}'],   
                    dest: '<%=paths.tmp%>/assets/img/'              
                }]
            },
        },
        inline: {
            all: {
                files: [{
                    expand: true, 
                    cwd: '<%=paths.dest%>/',               
                    src: ['**.html'],   
                    dest: '<%=paths.dest%>'              
                }]
            },
        },
        webp: {
            files: {
                expand: true, 
                cwd: '<%=paths.tmp%>/assets/img/',               
                src: ['**/*.{png,jpg,gif}', '!*-blur.*'],   
                dest: '<%=paths.tmp%>/assets/img/'              
            },
            options: {
                binpath: process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test' ? '/usr/bin/cwebp' : require('webp-bin').path,
                verbose: true,
                quality: 80,
                alphaQuality: 80,
                compressionMethod: 6,
                segments: 4,
                psnr: 42,
                sns: 50,
                filterStrength: 40,
                filterSharpness: 3,
                simpleFilter: true,
                partitionLimit: 50,
                analysisPass: 6,
                multiThreading: true,
                lowMemory: false,
                alphaMethod: 0,
                alphaFilter: 'best',
                alphaCleanup: true,
                noAlpha: false,
                lossless: false
            }
        },
        cdnify: {
            dev: {
                options: {
                    css: false,
                    html: {
                        'img[data-src]': false,
                        'img[src]': false,
                        'link[rel="]': false,
                        'link[rel="shortcut icon"]': false,
                        'link[rel=icon]': false,
                        'link[rel=stylesheet]': 'href',
                        'script[src]': 'src',
                        'source[src]': false,
                        'video[poster]': false
                    },
                    rewriter: function(url) {
                        var preurl = url;
                        
                        if (url.indexOf('?__nocdn') !== -1 || url.indexOf('.min.') !== -1 || (url.indexOf('.css') === -1 && url.indexOf('.js') === -1)) {
                            return url;
                        } 
                        
                        url = url.split('.'); 
                        url.splice(url.length - 1, 0, 'min');
                        url = url.join('.');  
                        
                        console.log('rewrite:', preurl, '=>', url);
                        
                        return url;
                    }
                },
                files: [{
                    expand: true,
                    cwd: '<%=paths.dest%>',
                    src: '*.html',
                    dest: '<%=paths.dest%>'
                }]
            }
        },
        htmlmin: {                                    
            dist: {                                     
                options: {                               
                    removeComments: true,
                    collapseWhitespace: true,
                    customAttrCollapse: /data-srcset/
                },
                files: [{
                    expand: true,
                    cwd: '<%=paths.dest%>',
                    src: '*.html',
                    dest: '<%=paths.dest%>'
                }]
            },
            dev: {                                    
                files: [{
                    expand: true,
                    cwd: '<%=paths.tmp%>',
                    src: '*.html',
                    dest: '<%=paths.tmp%>'
                }]
            }
        },
        realFavicon: {
            favicons: {
                src: '<%=paths.src%>/assets/img/logo-square.png',
                dest: '<%=paths.tmp%>/assets/img/favicon/',
                options: {
                    iconsPath: 'assets/img/favicon/',
                    html: [ '<%=paths.tmp%>/index_*.html' ],
                    design: {
                        ios: {
                            pictureAspect: 'noChange',
                            assets: {
                                ios6AndPriorIcons: true,
                                ios7AndLaterIcons: true,
                                precomposedIcons: true,
                                declareOnlyDefaultIcon: true
                            },
                            appName: 'juliankern.com'
                        },
                        desktopBrowser: {},
                        windows: {
                            pictureAspect: 'noChange',
                            backgroundColor: '#565656',
                            onConflict: 'override',
                            assets: {
                                windows80Ie10Tile: true,
                                windows10Ie11EdgeTiles: {
                                    small: true,
                                    medium: true,
                                    big: true,
                                    rectangle: true
                                }
                            },
                            appName: 'juliankern.com'
                        },
                        androidChrome: {
                            pictureAspect: 'noChange',
                            themeColor: '#565656',
                            manifest: {
                                name: 'juliankern.com',
                                display: 'browser',
                                orientation: 'notSet',
                                onConflict: 'override',
                                declared: true
                            },
                            assets: {
                                legacyIcon: false,
                                lowResolutionIcons: true
                            }
                        },
                        safariPinnedTab: {
                            pictureAspect: 'blackAndWhite',
                            threshold: 30,
                            themeColor: '#565656'
                        }
                    },
                    settings: {
                        compression: 5,
                        scalingAlgorithm: 'Cubic',
                        errorOnImageTooSmall: false
                    },
                    versioning: {
                        paramName: 'v',
                        paramValue: 'zXdGl9zdlr'
                    }
                }
            }
        },
        postcss: {
            options: {
                processors: [
                    require('pixrem')(), // add fallbacks for rem units
                    require('autoprefixer')({
                        browsers: [
                            '> 3% in DE',
                            'last 2 versions',
                            'ie >= 10'
                        ]
                    }), // add vendor prefixes
                ]
            },
            dist: {
                src: '<%=paths.tmp%>/assets/styles.css'
            }
        },
        critical: {
            test: {
                options: {
                    base: './',
                    css: [
                        '<%=paths.tmp%>/assets/styles.css',
                    ],
                    width: 320,
                    height: 568
                },
                src: '<%=paths.tmp%>/index_de.html',
                dest: '<%=paths.tmp%>/assets/critical.css'
            }
        }
    });
    
    grunt.registerTask('build_dev', [
        'sass:dev', 
        'bake',
        'copy:dev',
        'svgstore:dev',
        'responsive_images',
        'webp',
        'critical'
    ]);
    
    grunt.registerTask('build', [
        'clean:dev',
        'clean:build',
        'build_dev', 
        'realFavicon',
        'image',
        'webp',
        'postcss',
        'cssmin:prod',
        'uglify:prod',
        'copy:prod', 
        'cdnify',
        'inline',
        'htmlmin:dist',
        'clean:prod'
    ]);
    
    grunt.registerTask('serve', [
        'build_dev', 
        'htmlmin:dev',
        'connect:dev', 
        'watch'
    ]);
}



