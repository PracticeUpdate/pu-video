var jQueryScriptOutputted = false;
var PU = PU || {};
var PUPLAYER;

function loadScript(url, callback) {
    var script = document.createElement("script")
    script.type = "text/javascript";

    if (script.readyState) {  //IE
        script.onreadystatechange = function () {
            if (script.readyState == "loaded" ||
                script.readyState == "complete") {
                script.onreadystatechange = null;
                callback();
            }
        };
    } else {  //Others
        script.onload = function () {
            callback();
        };
    }

    script.src = url;
    document.body.appendChild(script);
}

function initJQuery() {
    //if the jQuery object isn't available
    if (typeof(jQuery) == 'undefined') {

        if (!jQueryScriptOutputted) {
            //only output the script once..
            jQueryScriptOutputted = true;

            //output the script (load it from google api)
            document.write("<scr" + "ipt type=\"text/javascript\" src=\"https://code.jquery.com/jquery-1.10.0.min.js\"></scr" + "ipt>");
        }
        setTimeout("initJQuery()", 50);
    } else {
        if (typeof(Handlebars) == 'undefined') {
            loadScript("http://cdnjs.cloudflare.com/ajax/libs/handlebars.js/2.0.0/handlebars.min.js", function () {
                PU.video = (function () {
                    var player, currentVideoIndex = 0;
                    var playList;
                    var ellipsis = "...";
                    var currentVideoIndexClick;
                    var click;
                    var singleCalled = false;

                    var ACCOUNTID = $('#video-attributes').data('account') || $('#global-video-attributes').data('account');
                    var PLAYERID = $('#video-attributes').data('player') || $('#global-video-attributes').data('player');


                    var SINGLEVIDEOID = $('#single-video-attributes').data('video_id');

                    var executeScript = function (accountID, playerID, totalVideos, videoID) {
                        // add and execute the player script tag
                        var s = document.createElement("script");
                        s.src = "//players.brightcove.net/" + accountID + "/" + playerID + "_default/index.min.js";
                        document.body.appendChild(s);
                        s.onload = function () {
                            onScriptReady(totalVideos, videoID)
                        };
                    };

                    onScriptReady = function(totalVideos, videoID) {
                        if(totalVideos !== 0) {
                            player = videojs("pu_video");
                            PUPLAYER = videojs("pu_video");

                            // play the video
                            PUPLAYER.ready(function() {
                                loadVideo();
                                setTimeout(function() {
                                    $(".video-player").css('opacity', '1');
                                }, 1000);
                            });

                            // listen for the "ended" event and play the video
                            PUPLAYER.on("ended", function () {
                                loadVideo();
                            });
                        } else {
                            if($('#pu_video').length === 0 && singleCalled === false) {
                                player = videojs("singleVideo-"+videoID);
                                SINGLEPUPLAYER = videojs("singleVideo-"+videoID);

                                SINGLEPUPLAYER.ready(function() {
                                    player.catalog.getVideo(videoId, function (error, video) {
                                        player.src(video.sources);
                                        player.poster(video.poster);
                                        player.play();
                                    });
                                });

                                singleCalled = true;    
                            }                            
                        }
                    };

                    var addPlayer = function (accountID, playerID, videoID, totalVideos, type, paddingBottom) {
                        playerData = {
                            "accountID": accountID,
                            "playerID": playerID,
                            "videoID": videoID
                        };
                        
                        switch (type) {
                            case 'playlist':
                                playerTemplate = '<video id="pu_video" data-account="{{accountID}}" data-player="{{playerID}}" data-video-id="{{videoID}}" data-embed="default" class="video-js" controls width="auto" height="auto"></video>';
                                template = Handlebars.compile(playerTemplate);
                                playerHTML = template(playerData);


                                $(".video-player").html(playerHTML);

                                if(totalVideos != 0)
                                    $('.video-playlist').prepend('<p class="video-label">Current Video: <span class="j-current-view">1</span> out of <span class="j-total-videos">' + totalVideos + '</span></p>');

                                $('.pu-embed-video-brightcove.load-player .video-player').css({
                                    paddingBottom: paddingBottom + '%'
                                });

                                break;
                            case 'singleVideo':
                                playerTemplate = '<div class="pu-embed-video-brightcove clearfix"><video id="singleVideo-'+videoID+'" data-account="{{accountID}}" data-player="{{playerID}}" data-video-id="{{videoID}}" data-embed="default" class="video-js" controls width="auto" height="auto"></video></div>';
                                template = Handlebars.compile(playerTemplate);
                                playerHTML = template(playerData);


                                $(".single-video-attributes[data-video_id='"+videoID+"']").replaceWith(playerHTML);

                                $("#singleVideo-"+videoID).css({
                                    paddingBottom: paddingBottom + '%'
                                });
                                break;
                        }

                        // add and execute the player script tag
                        setTimeout(function() {
                            executeScript(accountID, playerID, totalVideos, videoID); 
                        }, 500);
                    };

                    loadVideo = function (click) {
                        click != undefined ? currentVideoIndex = currentVideoIndexClick : '';

                        if (currentVideoIndex < playList.videos.length) {
                            // set new video
                            newVideo = playList.videos[currentVideoIndex];

                            // load the new video
                            player.catalog.getVideo(newVideo.id, function (error, video) {
                                player.src(video.sources);
                                player.poster(video.poster);
                                player.play();
                            });

                            // update the video title display
                            $(".j-play-video").removeClass('active');
                            $(".j-play-video:eq(" + currentVideoIndex + ")").addClass('active');

                            // increment the current video index
                            currentVideoIndex++;
                        }

                        $('.j-current-view').html(($('.j-play-video.active').data('index') + 1));
                    };

                    trimLength = function (text, maxLength) { //pass text and desire length, add ... if length goes over "maxLength"
                        text = $.trim(text);

                        if (text.length > maxLength) {
                            text = text.substring(0, maxLength - ellipsis.length)
                            return text.substring(0, text.lastIndexOf(" ")) + ellipsis;
                        } else {
                            return text;
                        }
                    };

                    return {
                        setVideos: function (data) {
                            playList = data; //set it globally; 
                            
                            var total = data.videos.length,
                                //this need to be dynamic - size may vary based on video
                                w = data.videos[0].videoFullLength.frameWidth,    //
                                h = data.videos[0].videoFullLength.frameHeight,   //
                                ////////////////////////////////////////////////////////
                                num = h/(w/100),
                                paddingBottom = Math.round(num * 100) / 100;

                            $("#video-attributes").replaceWith("<div class=\"pu-embed-video-brightcove load-player clearfix\"><div class=\"video-player\" style='opacity:0'></div><div class=\"video-playlist\"><span class=\"data-drop j-drop-data\"></span></div></div>");

                            // initialize playlist
                            for (var i = 0; i < total; i++) {
                                str = '<li class="list-group-item j-play-video" data-index="' + i + '" data-id="' + data.videos[i].id + '"><div class="media"><a class="pull-left" href="#"><img class="media-object img-responsive j-pu-ellipse" src="' + data.videos[i].thumbnailURL + '" alt="' + data.videos[i].name + '" ></a><div class="media-body"><h4 class="media-heading">' + data.videos[i].shortDescription + '</h4></div></div></li>';

                                $(".j-drop-data").append(str);

                                if (i == 0)
                                    firstVideo = data.videos[i].id;
                            }

                            // initialize event handler for each video in playlist
                            $(document.body).on('click', ".j-play-video", function (e) {
                                e.preventDefault();
                                var $this = $(this),
                                    id = $this.data('id');
                                currentVideoIndexClick = $this.data('index');

                                loadVideo(currentVideoIndexClick);
                            });

                            // make first video active when page load
                            $(".j-drop-data li:first-child").addClass('active');

                            $('.media-body .j-pu-ellipse').each(function (i, obj) {
                                $(this).html(trimLength($(this).html(), 90));
                            });

                            // create player with first video loaded
                            addPlayer(ACCOUNTID, PLAYERID, firstVideo, total, 'playlist', paddingBottom);
                        },
                        
                        setSingleVideos: function (data) {
                            var w = data.videoFullLength.frameWidth, 
                                h = data.videoFullLength.frameHeight,
                                num = h/(w/100),
                                paddingBottom = Math.round(num * 100) / 100;

                                videoID = data.id,
                                check =  $(".single-video-attributes[data-video_id='"+videoID+"']").data("auto_play");
                            // create player with first video loaded
                            addPlayer(ACCOUNTID, PLAYERID, videoID, 0, 'singleVideo', paddingBottom);
                        }
                    }
                })();


                // fetch playlist from video cloud rest api
                (function () {
                    var script = document.createElement("script"),
                        script2 = document.createElement("script"),
                        path = "http://api.brightcove.com/services/library?",
                        playlistId = $('#video-attributes').data('playlist_id'),
                        listFields = $('#video-attributes').data('list_fields'),
                        videoFields = $('#video-attributes').data('video_fields'),
                        mediaDelivery = $('#video-attributes').data('media_delivery'),
                        JScallback = $('#video-attributes').data('callback'),
                        JStoken = $('#video-attributes').data('token'),
                        rest = "command=find_playlist_by_id&playlist_id=" + playlistId + "&playlist_fields=" + listFields + "&video_fields=" + videoFields + "&media_delivery=" + mediaDelivery + "&callback=" + JScallback + "&token=" + JStoken,
                        scriptSrc = path + rest;

                    //Add Video Styles
                    //only if local var is empty
                    //check if we got any css with value: 'pu-video.css'
                    if (!$("link[href*='pu-video.css']").length && typeof PUVIDEO === 'undefined') {
                        var head = document.head,
                            link = document.createElement('link')
                        
                        link.type = 'text/css'
                        link.rel = 'stylesheet'
                        link.href = 'http://pushare.s3.amazonaws.com/pu-video/latest/pu-video.css'
                        head.appendChild(link);
                    }

                    //load the actuall video.
                    if( $('#video-attributes').length > 0 ) {
                        script.src = scriptSrc;
                        var head = document.getElementsByTagName("head")[0];
                        head.appendChild(script);
                    }

                    //load single video
                    //for each player
                    $( ".single-video-attributes" ).each(function() {
                        var singleVideoId = $(this).data('video_id'),
                            singleToken = $(this).data('token'),
                            singleVideoFields = $(this).data('video_fields'),
                            singleMediaDelivery = $(this).data('media_delivery'),
                            singleCallback = $(this).data('callback'),
                            singleVideoRest = "command=find_video_by_id&video_id="+ singleVideoId +"&video_fields="+singleVideoFields+"&media_delivery="+singleMediaDelivery+"&callback=" + singleCallback + "&token=" + singleToken,
                            scriptSrcSingle = path + singleVideoRest;

                        $.getScript( scriptSrcSingle, function( data, textStatus, jqxhr ) {
                          //console.log( "Load was performed." );
                        });
                    });
                })();
            });
        }
    }
}

initJQuery();