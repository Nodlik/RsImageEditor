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
        files: ['src/modules/**/*.twig']
        tasks: ['nunjucks']

    typescript:
      base:
        src: 'src/ts/RsImageEditor.ts'
        dest: 'build/rs-image-editor.js'
        options:
          target: 'es5'
          references: [
            "packages/reference/**/*.d.ts",
            "src/Modules/**/*.ts",
            "src/UI/**/*.ts",
            "src/Core/**/*.ts"
          ]

    nunjucks:
      precompile:
        baseDir: 'src/coffee'
        src: 'src/coffee/**/*.twig'
        dest: 'src/js/templates/view.html.js'
        options:
          name: (path) ->
            path.replace(/^.*[\\\/]/, '')

    copy:
      main:
        files: [
            expand: true
            src: ['fonts/**']
            dest: 'build/'
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
        ]

    clean:
      build:
        src: ["build"]

    uglify:
      dist:
        files:
          'build/rs-image-editor.min.js': [
            'build/rs-image-editor.js'
          ]

  grunt.loadNpmTasks 'grunt-contrib-less'
  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-contrib-clean'
  grunt.loadNpmTasks 'grunt-contrib-uglify'
  grunt.loadNpmTasks 'grunt-contrib-copy'
  grunt.loadNpmTasks 'grunt-typescript'


  grunt.registerTask('build', [
    'clean:build'
    'less'
    'typescript'
    'uglify'
    'copy'
  ])