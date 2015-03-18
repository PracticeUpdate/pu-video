# README #

This README would normally document whatever steps are necessary to get your application up and running.

### What is this repository for? ###

This repo will create a video-player with playlist. powered by [Brightcove](http://support.brightcove.com/en/video-cloud/docs)


### How to install via bower ###
Make sure to have bower already installed globally or within your project. If you do not have it installed you can find instructions here: http://bower.io/#install-bower

Install via bower with:
```
bower install pu-video
```

### How do I get set up? ###

To put the video in your site, just add the following code inside the body - the following element will later be replaced for the video player.:

For Playlist:
```
	<div id="video-attributes" class="hide"
	  data-token="wOjLIZimzyxVTO_PUfLiy8yGM4k6VHXkpDaHPpYRahivuKgPorbErg.."
	  data-callback="PU.video.setVideos"
	  data-playlist_id="3813368292001"
	  data-list_fields="id,name,playListType,videos,videoIds,shortDescription"
	  data-video_fields="id,name,shortDescription,longDescription,linkURL,linkText,thumbnailURL,VideoFullLength"
	  data-media_delivery="default"
	  data-player_key="AQ~~,AAACM9c1GWk~,cHluVGBVm_U_6lA3slZh2R6SnvZvnmwG"
	  data-account="2421677169001"
	  data-player="f73313ad-8e1b-4817-b39f-35b3b974ec9d"
	></div>
```

For single player:
```
	<div id="single-video-attributes-ad" class="single-video-attributes hide" data-video-index="0"
	  data-token="wOjLIZimzyxVTO_PUfLiy8yGM4k6VHXkpDaHPpYRahivuKgPorbErg.."
	  data-video_id="3006672189001"		
	  data-video_fields="name,length,FLVURL,VideoFullLength,id"
	  data-media_delivery="http"
	  data-callback="PU.video.setSingleVideos"
	></div>	
></div>
```

Make sure to include the js include in this repo.

For demo example review the dir folder.

### How to use css? ###
By defaul we are loading css from s3:
http://pushare.s3.amazonaws.com/pu-video/latest/pu-video.css

You can always overwrite it , or exclude it by doing one of the following:
* Creating a gloabal variable call PUVIDEO. 
* Including a pu-video.css stylesheet file 

### What does the markup looks like? ###
The html markup is super simple and looks like this:

```
<div class="pu-embed-video-brightcove load-player">
	<div class="video-player">Main Payer</div>
	<div class="video-playlist">
		<span class="data-drop">
			<li class="list-group-item" data-index="#" data-id="#">
				<div class="media">
					<a class="pull-left" href="#">
						<img class="media-object img-responsive" src="#" alt="#">
					</a>
					<div class="media-body">
						<h4 class="media-heading"> playlist short description</h4>
					</div>
				</div>
			</li>
		</span>
	</div>
</div>
```

This can not be overwritten. Markup will be the same for all PracticeUpdate players

### Definition of brightcove parameters? ###

This player use nine parameters. Here is the list:

* token
* callback
* playlist_id
* list_fields
* video_fields
* media_delivery
* player_key
* account
* player

They are self explanatory. However, if you wish to lear more about them checkout: 
http://support.brightcove.com/en/video-cloud/docs/player-configuration-parameters

### ScreenShots ###

 https://raw.githubusercontent.com/PracticeUpdate/pu-video/master/dir/screenshots/playlist.png - (single video)
 https://raw.githubusercontent.com/PracticeUpdate/pu-video/master/dir/screenshots/single.png - (playlist)


### Contribution guidelines ###

* Code review by [PracticeUpdate](http://www.practiceupdate.com) team.

### Who do I talk to? ###

[Brad Strong](https://bitbucket.org/bradstrong)
