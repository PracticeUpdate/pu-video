var jQueryScriptOutputted = false;
var PU;
function loadScript(url, callback){

    var script = document.createElement("script")
    script.type = "text/javascript";

    if (script.readyState){  //IE
        script.onreadystatechange = function(){
            if (script.readyState == "loaded" ||
                    script.readyState == "complete"){
                script.onreadystatechange = null;
                callback();
            }
        };
    } else {  //Others
        script.onload = function(){
            callback();
        };
    }

    script.src = url;
    document.body.appendChild(script);
}

function initJQuery() {
    
    //if the jQuery object isn't available
    if (typeof(jQuery) == 'undefined') {
    
        if (! jQueryScriptOutputted) {
            //only output the script once..
            jQueryScriptOutputted = true;
            
            //output the script (load it from google api)
            document.write("<scr" + "ipt type=\"text/javascript\" src=\"https://code.jquery.com/jquery-1.10.0.min.js\"></scr" + "ipt>");
        }
        setTimeout("initJQuery()", 50);
    } else {                  
        if (typeof(brightcove) == 'undefined') {
            loadScript("http://admin.brightcove.com/js/BrightcoveExperiences.js", function(){ 
                if (typeof(Handlebars) == 'undefined') {
                    loadScript("http://cdnjs.cloudflare.com/ajax/libs/handlebars.js/2.0.0/handlebars.min.js", function(){ 
                        PU = (function() {
                          var player, APIModules, mediaEvent, videoPlayer, currentVideoIndex = 0;
                          var playList;
                          var ellipsis = "...";
                          var PLAYERKEY = $('#video-attributes').data('player_key');
                          var currentVideoIndexClick; 
                          var click;

                          var addPlayer = function(videoID, playerKey, optional, totalVideos) {
                              console.log('create video with default video id ' + videoID);
                              var playerData = {
                                  "playerKey": playerKey,
                                  "width": "480",
                                  "height": "270",
                                  "videoID": videoID,
                                  "optional": optional
                                  },

                              playerTemplate = "<div style=\"display:none\"></div><object id=\"myExperience\" class=\"BrightcoveExperience\"><param name=\"bgcolor\" value=\"#FFFFFF\" /><param name=\"width\" value=\"{{width}}\" /><param name=\"height\" value=\"{{height}}\" /><param name=\"playerKey\" value=\"{{playerKey}}\" /><param name=\"isVid\" value=\"true\" /><param name=\"isUI\" value=\"true\" /><param name=\"dynamicStreaming\" value=\"true\" /><param name=\"@videoPlayer\" value=\"{{videoID}}\" /><param name=\"includeAPI\" value=\"true\" /><param name=\"templateLoadHandler\" value=\"PU.onTemplateLoad\" /><param name=\"templateReadyHandler\" value=\"PU.onTemplateReady\" /><param name=\"htmlFallback\" value=\"true\" />{{{optional}}}</object>";

                              template = Handlebars.compile(playerTemplate);
                              playerHTML = template(playerData);
                              
                              $(".video-player").html(playerHTML);
                              brightcove.createExperiences();

                              $('.video-playlist').prepend('<p class="video-label">Current Video: <span class="j-current-view">0</span> out of <span class="j-total-videos">'+ totalVideos +'</span></p>');
                          };

                          loadVideo = function (click) {
                              click != undefined ? currentVideoIndex = currentVideoIndexClick : '';

                              if (currentVideoIndex < playList.videos.length) {
                                  // set new video
                                  newVideo = playList.videos[currentVideoIndex];
                                  
                                  // load the new video
                                  videoPlayer.loadVideoByID(newVideo.id);
                                  
                                  // update the video title display
                                  $(".j-play-video").removeClass('active');
                                  $(".j-play-video:eq(" + currentVideoIndex + ")").addClass('active');
                                  
                                  // increment the current video index
                                  currentVideoIndex++;
                              }

                              $('.j-current-view').html( ($('.j-play-video.active').data('index') + 1) );
                          };

                          trimLength = function(text, maxLength) { //pass text and desire length, add ... if length goes over "maxLength"
                              text = $.trim(text);

                              if (text.length > maxLength) {
                                text = text.substring(0, maxLength - ellipsis.length)
                                return text.substring(0, text.lastIndexOf(" ")) + ellipsis;
                              } else {
                                return text;
                              }
                          };

                          centerVideo = function() {
                              $('.BrightcoveExperience').css({
                                  "margin-top" : ($('.load-player').height() - $('.BrightcoveExperience').height()) / 2 + "px"
                              });          
                          };

                          return {
                            setVideos: function(data) {
                              playList = data;
                              console.log("playList returned");
                              
                              var total = playList.videos.length;

                              $("#video-attributes").replaceWith("<div class=\"pu-embed-video-brightcove load-player\"><div class=\"video-player\"></div><div class=\"video-playlist\"><span class=\"data-drop j-drop-data\"></span></div></div>");

                              // initialize playlist
                              for (var i = 0; i < total; i++) {
                                  str = '<li class="list-group-item j-play-video" data-index="'+ i +'" data-id="' + playList.videos[i].id + '"><div class="media"><a class="pull-left" href="#"><img class="media-object img-responsive" src="' + playList.videos[i].thumbnailURL + '" alt="' + playList.videos[i].name + '" ></a><div class="media-body"><h4 class="media-heading">' + playList.videos[i].shortDescription + '</h4></div></div></li>';
                                
                                  $(".j-drop-data").append(str);

                                  if (i == 0)
                                      firstVideo = playList.videos[i].id;
                              }

                              // initialize event handler for each video in playlist
                              $(document.body).on('click', ".j-play-video", function(e) {
                                  e.preventDefault();
                                  var $this = $(this),
                                  id = $this.data('id');

                                  currentVideoIndexClick = $this.data('index'); 

                                  loadVideo(currentVideoIndexClick);
                              });  

                              // make first video active when page load
                              $(".j-drop-data li:first-child").addClass('active');

                              $('.media-body p').each(function(i, obj) {
                                  $(this).html(trimLength($(this).html(), 90));
                              });

                              // create player with first video loaded
                              addPlayer(firstVideo, PLAYERKEY, false, total); 
                            },
                            /**** template loaded event handler ****/
                            onTemplateLoad : function (experienceID) {
                                console.log('template load triggered ');
                                // get a reference to the player and API Modules and Events
                                player = brightcove.api.getExperience(experienceID);
                                APIModules = brightcove.api.modules.APIModules;
                                mediaEvent = brightcove.api.events.MediaEvent;
                                console.log(player);
                            },
                            /**** template ready event handler ****/
                            onTemplateReady : function (evt) {
                                console.log('template ready triggered');
                                // get references to modules
                                videoPlayer = player.getModule(APIModules.VIDEO_PLAYER);
                                // add an event listener for video COMPLETE events
                                videoPlayer.addEventListener(mediaEvent.COMPLETE, PU.onComplete);
                                // load the first video
                                loadVideo();
                            },
                            /**** complete event handler ****/
                            onComplete : function (evt) {
                              console.log("onComplete video");
                              loadVideo();
                            }
                          }
                        })();


                        // fetch playlist from video cloud rest api
                        (function() {
                            var script = document.createElement("script"), 
                                videoDataHolder = document.getElementById("video-attributes"),
                                path = "http://api.brightcove.com/services/library?",
                                playlistId = $('#video-attributes').data('playlist_id'),
                                listFields = $('#video-attributes').data('list_fields'),
                                videoFields = $('#video-attributes').data('video_fields'),
                                mediaDelivery =$('#video-attributes').data('media_delivery'),
                                JScallback =  $('#video-attributes').data('callback'),
                                JStoken =$('#video-attributes').data('token'),
                                rest = "command=find_playlist_by_id&playlist_id="+playlistId+"&playlist_fields="+listFields+"&video_fields="+videoFields+"&media_delivery="+mediaDelivery+"&callback="+JScallback+"&token="+ JStoken,
                                scriptSrc = path + rest;
                                 

                            //Add Video Styles
                            var head = document.head, 
                                link = document.createElement('link')
                            
                            link.type = 'text/css'
                            link.rel = 'stylesheet'
                            link.href = 'http://pushare.s3.amazonaws.com/pu-video/latest/app.css'
                            head.appendChild(link);

                            //load the actuall video.
                            script.src = scriptSrc;
                            var head = document.getElementsByTagName("head")[0];
                            head.appendChild(script);
                        })();

                    });
                }
            });
        }
    }         
}

initJQuery();