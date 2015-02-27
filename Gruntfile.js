
module.exports = function(grunt) {

  grunt.loadNpmTasks("grunt-aws");

  grunt.initConfig({
    aws: grunt.file.readJSON("aws-credentials.json"),
    s3: {
      options: {
        accessKeyId: "<%= aws.accessKeyId %>",
        secretAccessKey: "<%= aws.secretAccessKey %>",
        bucket: "pu-video-bucket"
      },
      build: {
        cwd: "dist/",
        src: "**"
      }
    }
  });

  grunt.registerTask("default", ["s3"]);
};