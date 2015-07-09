var jQueryScriptOutputted = false;
var PU = PU || {};
var PUPLAYER;
var playlistCreated = false;


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
                    var ellipsis = "...";
                    var singleCalled = false;
                    var count = 1;

                    var executeScript = function (accountID, playerID, videoOrPlaylistID, type) {
                        // add and execute the player script tag
                        var s = document.createElement("script");
                        s.src = "//players.brightcove.net/" + accountID + "/" + playerID + "_default/index.min.js";
                        document.body.appendChild(s);

                        s.onload = function () {
                            console.log('loaded')
                            onScriptReady(videoOrPlaylistID, type);
                        };
                    };

                    var onScriptReady = function(videoOrPlaylistID, type) {
                        switch (type) {
                            case 'playlist':
                                videojs("pu_video").ready(function() {
                                    PUPLAYER = this;
                                    PUPLAYER.playlist.autoadvance(0);

                                    PUPLAYER.on('loadstart', function() {
                                        $('.j-current-view').html(count);
                                        count++;
                                    });

                                    PUPLAYER.on('loadedmetadata', function() {
                                        if (!playlistCreated) {
                                            initPlaylist();
                                            playlistCreated = true;
                                        }

                                    });
                                    $(".video-player").css('opacity', '1');
                                });
                                break;
                            case 'singleVideo':
                                videojs("singleVideo-" + videoOrPlaylistID).ready(function() {
                                    var singlePlayer = this;
                                    if ($('#pu_video').length === 0 && singleCalled === false && $("#singleVideo-" + videoOrPlaylistID).data('auto_play') === true) {
                                        singlePlayer.play();
                                        singleCalled = true;
                                    }
                                });
                                break;
                        }
                    };

                    var initPlaylist = function() {
                        var videos = PUPLAYER.playlist();
                        var total = videos.length;

                        if (total != 0)
                            $('.video-playlist').prepend('<p class="video-label">Current Video: <span class="j-current-view">1</span> out of <span class="j-total-videos">' + total + '</span></p>');

                        // initialize playlist
                        for (var i = 0; i < total; i++) {
                            str = '<li class="media-list j-play-video" data-index="' + i + '" data-id="' + videos[i].id + '"><div class="media"><a class="pull-left" href="#"><img class="media-object img-responsive j-pu-ellipse" src="' + videos[i].thumbnail + '" alt="' + videos[i].name + '" ></a><div class="media-body"><h4 class="media-heading">' + videos[i].description + '</h4></div></div></li>';

                            $(".j-drop-data").append(str);
                        }

                        $(".j-play-video").click(function (e) {
                            e.preventDefault();
                            var $this = $(this),
                                id = $this.data('id');
                            currentVideoIndex = $this.data('index');

                            // update the video title display
                            $(".j-play-video").removeClass('active');
                            $(".j-play-video:eq(" + currentVideoIndex + ")").addClass('active');
                            

                            count = currentVideoIndex + 1;

                            // play selected video
                            PUPLAYER.playlist.currentItem(currentVideoIndex);
                            PUPLAYER.play();
                        });

                        // make first video active when page load
                        $(".j-drop-data li:first-child").addClass('active');

                        // truncate long description
                        $('.media-body .j-pu-ellipse').each(function (i, obj) {
                            $(this).html(trimLength($(this).html(), 90));
                        });
                    };

                    var addPlayer = function (accountID, playerID, videoOrPlaylistID, type, auto_play) {
                        playerData = {
                            "accountID": accountID,
                            "playerID": playerID,
                            "videoOrPlaylistID": videoOrPlaylistID
                        };

                        paddingBottom = 56.25;

                        switch (type) {
                            case 'playlist':
                                $(".video-attributes[data-type='playlist']").replaceWith("<div class=\"pu-embed-video-brightcove load-player clearfix\"><div class=\"video-player\" style='opacity:0'></div><div class=\"video-playlist\"><ul class=\"data-drop j-drop-data\"></ul></div></div>");
                                playerTemplate = '<video id="pu_video" data-account="{{accountID}}" data-player="{{playerID}}" data-playlist-id="{{videoOrPlaylistID}}" data-embed="default" class="video-js" controls width="auto" height="auto"></video>';
                                template = Handlebars.compile(playerTemplate);
                                playerHTML = template(playerData);

                                $(".video-player").html(playerHTML).find('video').attr('autoplay', auto_play);

                                $('.pu-embed-video-brightcove.load-player .video-player').css({
                                    paddingBottom: paddingBottom + '%'
                                });

                                break;
                            case 'singleVideo':
                                playerTemplate = '<div class="pu-embed-video-brightcove clearfix"><video id="singleVideo-'+videoOrPlaylistID+'" data-account="{{accountID}}" data-player="{{playerID}}" data-video-id="{{videoOrPlaylistID}}" data-embed="default" class="video-js" controls width="auto" height="auto"></video></div>';
                                template = Handlebars.compile(playerTemplate);
                                playerHTML = template(playerData);

                                $(".video-attributes[data-video_id='"+videoOrPlaylistID+"']").replaceWith(playerHTML);


                                $("#singleVideo-"+videoOrPlaylistID).attr('autoplay', auto_play);

                                $("#singleVideo-"+videoOrPlaylistID).css({
                                    paddingBottom: paddingBottom + '%'
                                });
                                break;
                        }

                        // add and execute the player script tag
                        executeScript(accountID, playerID, videoOrPlaylistID, type);
                    };

                    var trimLength = function (text, maxLength) { //pass text and desire length, add ... if length goes over "maxLength"
                        text = $.trim(text);

                        if (text.length > maxLength) {
                            text = text.substring(0, maxLength - ellipsis.length)
                            return text.substring(0, text.lastIndexOf(" ")) + ellipsis;
                        } else {
                            return text;
                        }
                    };

                    return {
                        addPlayer: addPlayer,
                        
                        stop: function() {
                            $(".vjs-control-text:contains('Pause')").trigger('click');
                        },

                        play: function(id) {
                            $("#singleVideo-"+id+" .vjs-control-text:contains('Play')").trigger('click');
                        }
                    }
                })();

                // fetch playlist from video cloud rest api
                (function () {
                    var path = "http://api.brightcove.com/services/library?";

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

                    //for each player
                    $( ".video-attributes" ).each(function() {
                        var $this = $(this),
                            type = $this.data('type'),
                            accountID = $this.data('account'),
                            playerID = $this.data('player'),
                            videoOrPlaylistID = '',
                            auto_play = false;
                        switch (type) {
                            case 'playlist':
                                videoOrPlaylistID = $this.data('playlist_id');
                                auto_play = $this.data("auto_play");
                                break;
                            
                            case 'singleVideo':
                                videoOrPlaylistID = $this.data('video_id');
                                auto_play = $this.data("auto_play");
                                break;
                        }

                        PU.video.addPlayer(accountID, playerID, videoOrPlaylistID, type, auto_play);
                    });
                })();
            });
        }
    }
}

initJQuery();