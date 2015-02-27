
module.exports = function(grunt) {

  grunt.loadNpmTasks("grunt-aws");

  grunt.initConfig({
    aws: grunt.file.readJSON("credentials.json"),
    s3: {
      options: {
        accessKeyId: "<%= aws.accessKeyId %>",
        secretAccessKey: "<%= aws.secretAccessKey %>",
        bucket: "my-awesome-bucket"
      },
      build: {
        cwd: "build/",
        src: "**"
      }
    }
  });
  
  grunt.registerTask("default", ["s3"]);
};