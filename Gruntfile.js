module.exports = function gruntfile(grunt) {
  grunt.loadNpmTasks('grunt-solc')
  grunt.loadNpmTasks('grunt-contrib-watch')
  grunt.loadNpmTasks('grunt-mocha-test')

  grunt.initConfig({
    watch: {
      contracts: {
        files: ['contracts/*'],
        tasks: ['solc', 'mochaTest']
      },
      tests: {
        files: ['test/*'],
        tasks: ['mochaTest']
      },
    },
    solc: {
      default: {
        options: {
          files: ['contracts/*'],
          output: 'generated/contracts.json',
          doOptimize: true
        }
      }
    },
    mochaTest: {
      test: {
        src: ['test/**/*.js']
      }
    },
  })

  grunt.registerTask('init', [
    'solc',
    'mochaTest',
    'watch'
  ])
}
