module.exports = (grunt) ->

  grunt.initConfig
    pkg: grunt.file.readJSON 'package.json'

    less:
      default:
        options:
          paths: ['theme/default']
          cleancss: true
          report: 'gzip'
          compress: true,
          yuicompress: true,
          optimization: 2
        files:
          'build/css/rs-editor-default.css': 'theme/default/rs-editor.less'

    watch:
      typeescript:
        files: ['src/**/*.ts']
        tasks: ['typescript']
      nunjucksjs:
        files: ['src/**/*.twig']
        tasks: ['nunjucks']
      less:
        files: ['theme/**/*.less']
        tasks: ['less']

    typescript:
      base:
        src: 'src/Core/RsImageEditor.ts'
        dest: 'build/rs-image-editor.js'
        options:
          target: 'es5'
          references: [
            "packages/reference/**/*.d.ts",
            "src/Modules/**/*.ts"
          ]

    nunjucks:
      precompile:
        baseDir: 'src/'
        src: 'src/**/*.njs'
        dest: 'build/template.js'
        options:
          name: (path) ->
            path.replace(/^.*[\\\/]/, '')

    copy:
      main:
        files: [
            expand: true
            src: ['theme/default/fonts/**']
            dest: 'build/fonts/'
            flatten: true,
            filter: 'isFile'
          ,
            expand: true
            src: ['img/**']
            dest: 'build/'
          ,
            expand: true
            src: 'packages/js/jquery/dist/jquery.min.js'
            dest: 'build/'
            flatten: true,
            filter: 'isFile'
          ,
            expand: true
            src: 'packages/js/jquery/dist/jquery.min.map'
            dest: 'build/'
            flatten: true,
            filter: 'isFile'
          ,
            expand: true
            src: 'packages/js/underscore/underscore-min.js'
            dest: 'build/'
            flatten: true,
            filter: 'isFile'
          ,
            expand: true
            src: 'packages/js/underscore/underscore-min.map'
            dest: 'build/'
            flatten: true,
            filter: 'isFile'
          ,
            expand: true
            src: 'packages/js/nunjucks/browser/nunjucks.min.js'
            dest: 'build/'
            flatten: true,
            filter: 'isFile'
          ,
            expand: true
            src: 'packages/js/caman/dist/caman.pack.js'
            dest: 'build/'
            flatten: true,
            filter: 'isFile'
        ]

    clean:
      build:
        src: ["build"]

    uglify:
      dist:
        files:
          'build/rs-image-editor.min.js': [
            'build/template.js'
            'build/rs-image-editor.js'
          ]

  grunt.loadNpmTasks 'grunt-contrib-less'
  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-contrib-clean'
  grunt.loadNpmTasks 'grunt-contrib-uglify'
  grunt.loadNpmTasks 'grunt-contrib-copy'
  grunt.loadNpmTasks 'grunt-typescript'
  grunt.loadNpmTasks 'grunt-nunjucks'


  grunt.registerTask('build', [
    'clean:build'
    'less'
    'typescript'
    'nunjucks'
    'uglify'
    'copy'
  ])