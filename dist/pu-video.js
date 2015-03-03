PU.events = (function ($) {
  "use strict";
  var SELF,
      ORGMSG,
      UPDATEMSG,
      EDITINGPOSTID,
      FILEADDED  = false,
      FIRSTTIMER = true,
      PLAYERKEY  = $('#video-attributes').data('player_key'),
      URL        = window.location.href;

  return {
    init: function () {
      var parts     = URL.split("/"),
          activeNav = parts[parts.length - 2];

      $('.tab-item[href="/' + activeNav + '"]').addClass('active');

      if (URL.indexOf("user") > -1)
        $('.tab-item.dropdown').addClass('active');

      SELF = PU.events;

      //initialize all this methods on page load.
      SELF.clickEvents();
      SELF.togglable();

      if (!$('html').hasClass('lt-ie9'))
        SELF.headroom();

      SELF.subnav();
      // SELF.creeper();
      SELF.search();
      SELF.detectBrowser();
      SELF['sticky-footer']();

      var ellipsis   = "...",
          backToTop  = $('.j-back-to-top'),
          trimLength = function (text, maxLength) { //pass text and desire length, add ... if length goes over "maxLength"
            text = $.trim(text);

            if (text.length > maxLength) {
              text = text.substring(0, maxLength - ellipsis.length);
              return text.substring(0, text.lastIndexOf(" ")) + ellipsis;
            } else
              return text;
          };

      //Alway ellipse any elemnt with the class of "j-ellipsis-me"
      $('.j-ellipsis-me').each(function (i, obj) {
        $(this).html(trimLength($(this).html(), 84));
      });

      //SHow back to top after user scroll pass screen view
      $(window).scroll(function () {
        $(this).scrollTop() > 50 ? backToTop.fadeIn() : backToTop.fadeOut();
      });

      //On backto top click, scroll to the top.
      backToTop.click(function (e) {
        e.preventDefault();

        backToTop.tooltip('hide');

        $('body, html').animate({
          scrollTop: 0
        }, 800);
      });

      backToTop.tooltip('show');

      //check if email-to-friend is present on the page
      if ($('#mail-to-friend').length > 0)
        SELF['email-to-friend']();


      //check if prestitial in page
      if ($('#modalPrestitial').length !== 0) {
        setTimeout(function () {
          $("#modalPrestitial").modal("show").on("shown", function () {
            window.setTimeout(function () {
              $("#modalPrestitial").modal("hide");
            }, 5000);
          });
        }, 1000);
      }

      $('[data-pu-toggle="scroll"]').click(function () {
        if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
          var target = $(this.hash);
          target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
          if (target.length) {
            $('html,body').animate({
              scrollTop: target.offset().top
            }, 1000);
            return false;
          }
        }
      });
    },

    clickEvents: function () {
      //***** [ Smooth scroll url fragment links ] ******/
      $(document).on('click', '[data-pu-toggle="scroll"]', function () {
        $(this).puSmoothScroll();
      });

      //disable .disabled links
      $('.disabled a').click(function (e) {
        e.preventDefault();
        //console.log(e);
      });

      $(document).on('click', '.j-brightcovevideo', function (e) {
        var singleVideo = document.getElementById("pu-single-embed-video-brightcove-3006672189001"); 
        e.preventDefault();

        singleVideo.play(); 
        PUPLAYER.pause();

        $("#modal-video-ad").modal('show');
      });


      $("#modal-video-ad").on('hidden.bs.modal', function () {
        var singleVideo = document.getElementById("pu-single-embed-video-brightcove-3006672189001"); 
        singleVideo.pause();
      });

      $(document).on('click', '#dashboard #readingList[data-toggle="tab"]', function (e) {
        PU.events.masonry();
      });

      $(document).on('click', '[data-pu-action="save"]', function (e) {
        e.preventDefault();
        SELF.contentSave(e);
      });

      $(document).on('click', '[data-pu-action="recommend"]', function (e) {
        e.preventDefault();
        SELF.contentRecommend(e);
      });
    },

    pref: function () {
      //script use on the setting page.
      $(document.body).on('click touchstart', '.j-save', function (e) {
        e.preventDefault();

        var $this = $(this);

        $.growl('Your changes have been saved.', {
          type: 'success'
        });
      });

      $(document.body).on('click touchstart', '.j-save-password', function (e) {
        e.preventDefault();

        var $this = $(this);

        $.growl('Your password has been updated.', {
          type: 'success',
          onHidden: function() {
            //var validator = $("#ChangePasswordForm").validate();
          }
        });
      });

      var validator = $('#ChangePasswordForm').validate({
        submitHandler: function (form) {
          $.growl('Your changes have been saved.', {
            type: 'success'
          });
        },

        rules: {
          Password: {
            required: true,
            minlength: 6,
            maxlength: 20
          },

          VerifyPassword: {
            equalTo: "#Password"
          }
        },

        messages: {
          Password: {
            required: "New Password required",
            minlength: "Password must be 6-20 characters (letters, numbers and hyphens are ccepted but not spaces)"
          },

          VerifyPassword: "Passwords do not match"
        }
      });
    },

    commenting: function () {
      var summit = function () {
        $('.j-pending-template').htmlInclusive();

        $('.comment-author').text('Brad Strong');
        $('.comment-body').text($('.j-add-comment').val());

        $('.j-comments li:last').fadeIn(200);

        $('.j-add-comment')
          .val('')
          .fadeOut(200);

        $('.j-msg-comment').delay(280).fadeIn(200);
        $('.j-msg-follow-comment').fadeIn(200);

        $('.j-post-follow').trigger('click');
      };

      PU.util.extend();

      $(".j-add-comment").growTextarea();

      function getCaret(el) {
        if (el.selectionStart) {
          return el.selectionStart;
        } else if (document.selection) {
          el.focus();

          var r = document.selection.createRange();
          if (r === null) {
            return 0;
          }

          var re = el.createTextRange(),
              rc = re.duplicate();
          re.moveToBookmark(r.getBookmark());
          rc.setEndPoint('EndToStart', re);

          return rc.text.length;
        }
        return 0;
      }

      $(document.body).on('keypress', '.j-add-comment', function (e) {
        if ($.trim($(this).val()) !== '') {
          $('.j-submit-comment').attr('disabled', false);
        }

        if (e.shiftKey) {
          e.preventDefault();
          summit();
        }
      });

      $(".j-comment-form").submit(function (e) {
        e.preventDefault();

        if ($.trim($('.j-add-comment').val()) !== '')
          summit();
      });


      $(document.body).on('click', '.j-delete', function (e) {
        e.preventDefault();
        var $this = $(this),
            id    = $this.parents('.j-comment').data('id');

        $('li[data-id=' + id + '] .j-delete').fadeOut(200);
        $('li[data-id=' + id + '] .j-prompt-deletion').delay(280).fadeIn(200);

        setTimeout(function () {
          $('li[data-id=' + id + '] .j-post-delete-action').css('display', 'block');
        }, 300);
      });

      $(document.body).on('click', '.j-delete-selection', function (e) {
        e.preventDefault();
        var $this   = $(this),
            $delete = $this.data('delete'),
            $parent = $this.parents('.j-comment'),
            id      = $parent.data('id'),
            no      = function () {
              $('li[data-id=' + id + '] .j-prompt-deletion').fadeOut(200);
              $('li[data-id=' + id + '] .j-delete').delay(280).fadeIn('fast');
              $('li[data-id=' + id + '] .j-post-delete-action').removeAttr('style');
            },
            yes     = function () {
              var noPending = function () {
                    $('li.media[data-id=' + id + ']').replaceWith('<li class="media coment comment-deleted alert alert-warning">Comment deleted by user.</li><hr />');
                  },
                  pending   = function () {
                    $parent.fadeOut(200);

                    $('li[data-id=' + id + '] .j-prompt-deletion').fadeOut(200);
                    $('li[data-id=' + id + '] .j-delete').fadeIn('fast');

                    $('.j-msg-comment').fadeOut(200);

                    $('.j-add-comment')
                      .delay(280).fadeIn(200);
                  };

              $parent.hasClass('j-pending-template') ? pending() : noPending();
            };

        $delete == 'no' ? no() : yes();
      });

      $(document.body).on('click', '.j-post-follow', function (e) {
        e.preventDefault();

        $('.j-post-follow').html('Unfollow');
        $('.j-post-follow').prop('class', 'btn btn-success btn-empty post-option j-post-unfollow');
      });

      $(document.body).on('click', '.j-post-unfollow', function (e) {
        e.preventDefault();

        var $this = $(this);

        $('.j-post-unfollow').html('Follow');
        $('.j-post-unfollow').prop('class', 'btn btn-success btn-empty post-option j-post-follow');


        if ($this.parents('.j-on-commit-follow').length) {
          $('.j-msg-follow-comment').delay(2000).fadeOut().daley(300).removeAttr('style').toggleClass('hide');
        }
      });

      // Hammer('.j-comment.owner').on("tap", function(e) {
      //   var $this = $(this),
      //     id = $this.data('id'),
      //     elm = $('li[data-id=' + id + '] .media-body .post-action'),
      //     check = elm.css('visibility'),
      //     prompt = $('.j-prompt-deletion');

      //   if ($(e.target).closest('button').length) {
      //     return;
      //   }

      //   if ($('html').hasClass('touch'))
      //     prompt.length !== 0 ? elm.css('display', 'block') : elm.css('display', 'none');
      // });
    },

    fileUpload: function () {
      function getSize() {
        var myFSO    = new ActiveXObject("Scripting.FileSystemObject"),
            filepath = document.upload.file.value,
            thefile  = myFSO.getFile(filepath),
            size     = thefile.size;

        alert(size + " bytes");
      }

      function fileSize(bytes) {
        var exp    = Math.log(bytes) / Math.log(1024) | 0,
            result = (bytes / Math.pow(1024, exp)).toFixed(2);

        return result + ' ' + (exp === 0 ? 'bytes' : 'KMGTPEZY' [exp - 1] + 'B');
      }

      $(document).on('click', '.j-file-cursor', function (e) {
        e.preventDefault();

        $("input:file").trigger('click');
      });

      $('.j-submit-file input').attr("disabled", true);

      $(document).on('keyup', '.j-textarea-field', function (e) {
        var $elm = $('.j-submit-file input');

        if (e.keyCode == 13 && e.shiftKey)
          e.stopPropagation();

        this.value.length > 25 ? $elm.attr("disabled", false) : $elm.attr("disabled", true);
      });

      $(document).on('change', '.btn-file :file', function () {
        var input    = $(this),
            numFiles = input.get(0).files ? input.get(0).files.length : 1,
            label    = input.val().replace(/\\/g, '/').replace(/.*\//, '');

        input.trigger('fileselect', [numFiles, label]);
      });

      $('.btn-file :file').on('fileselect', function (event, numFiles, label) {
        var input = $(this).parents('.input-group').find(':text'),
            log   = numFiles > 1 ? numFiles + ' files selected' : label;

        if (input.length) {
          input.val(log);

          try {
            var ua   = window.navigator.userAgent,
                msie = ua.indexOf("MSIE ");

            if (msie > 0) {
              getSize();
            } else {
              if (this.files[0].size > 5242880) {
                $.growl('Filesize must be 5MB or below', {
                  onHidden: function() {
                    $('.j-file-upload-name').val('');
                    $('.j-title-field').val('');
                    $('.j-textarea-field').val('');
                    $('.j-submit-file input').attr("disabled", true);
                  },
                  type: 'danger'
                });
              } else {
                $('.j-file-upload-remove').toggleClass('hide');

                if ($.trim($('.j-title-field').val()) !== '') {
                  $('.j-submit-file input').attr("disabled", false);
                  FILEADDED = true;
                }
              }
            }
          } catch (e) {
            alert("we can't get file size - send it to backend");
          }
        } else {
          //if(log)
        }
      });

      $(document).on('click', '.j-file-upload-name', function () {
        $('.btn-file :file').trigger('click');
      });

      $(".j-form-submit-case").submit(function (e) {
        e.preventDefault();

        $('.j-progress, .j-file-upload-remove').toggleClass('hide');
        $('.j-submit-file input').attr("disabled", true);

        $('.j-meter').countTo({
          from: 0,
          to: 100,
          speed: 5000,
          refreshInterval: 50,
          onComplete: function (value) {
            $('.j-progress').toggleClass('hide');
            $('.j-meter').removeAttr('style');

            $.growl({
                icon: 'fa fa-check-circle',
                title: '<strong> Success! </strong>',
                message: '<br>Thank you, we\'ve received your case and one of our editors will review it shortly. <br> PracticeUpdate staff may contact you via email regarding questions, editing, and possible publication on http://PracticeUpdate.com',
                },{
                type: 'success',
                allow_dismiss: true,
                delay: 250000,
                onHidden: function() {
                  $('.j-textarea-field, .j-file-upload-name, .j-title-field').val('');
                }
              });
          }
        });
      });

      $('.j-title-field').unbind('keyup change input paste').bind('keyup change input paste', function (e) {
        var $this     = $(this),
            val       = $this.val(),
            valLength = val.length,
            maxCount  = $this.attr('maxlength');

        if (valLength > maxCount)
          $this.val($this.val().substring(0, maxCount));

        if (!FILEADDED || $.trim($this.val()) === '')
          $('.j-submit-file input').attr("disabled", true);

        if (FILEADDED && $.trim($this.val()) !== '')
          $('.j-submit-file input').attr("disabled", false);
      });

      $(document).on('click', '.j-file-upload-remove', function (e) {
        e.preventDefault();

        $('.j-file-upload-name').val('');
        $('.j-title-field').val('');
        $('.j-textarea-field').val('');
        $('.j-file-upload-remove').toggleClass('hide');
        $('.j-submit-file input').attr("disabled", true);
      });
    },

    parallax: function () {
      //used to anumate background on RC title
      //script will take the inline value of the BG
      var parallax = $(".j-parallax"),
          speed    = 1,
          active   = $('span[data-active]').data('active');

      window.onscroll = function () {
        var yOffset = window.pageYOffset;
        parallax.css("background-position", "0px " + (yOffset / speed) + "px");
      }

      $(".j-parallax ul ul li a:contains('" + active + "')").parent('li').replaceWith("<li class='active'>" + active + "</li>");
    },

    //general toggle script to play with "active".
    togglable: function () {
      $(document.body).on('click', '.j-toggle-me', function (e) {
        e.preventDefault();

        var $this = $(this);

        $this.toggleClass('active');

        setTimeout(function () {
          console.log($this.data('pu-action'));
          $this.data('pu-action') == 'save' ? $("i", $this).toggleClass("fa-bookmark fa-bookmark-o") : $("i", $this).toggleClass("fa-thumbs-up fa-thumbs-o-up");
        }, 200);
      });
    },

    contentSave: function () {
      if (PU.user.getRegistered() === false) {
        $('#modalActionUnregistered').modal('show');
      } else if (PU.user.firstSave === true) {
        $('#saveNotification').modal('show');
        PU.ISCONTENTSAVED = true;
        PU.user.firstSave = false;
      }
    },

    contentRecommend: function (e) {
      if (PU.user.firstRecommend === true) {
        $('#recommendNotification').modal('show');
        PU.ISCONTENTSAVED = true;
        PU.user.firstRecommend = false;
      }
    },

    'email-to-friend': function (e) {
      //form validation for email-to-friend
      $.validator.addMethod(
        "multiemails",
        function (value, element) {
          if (this.optional(element))
            return true;
          var emails = value.split(/[;,]+/);
          valid = true;
          for (var i in emails) {
            value = emails[i];
            valid = valid &&
            $.validator.methods.email.call(this, $.trim(value), element);
          }
          return valid;
        },

        $.validator.messages.multiemails
      );

      $(".j-email-to-friend-form").validate({
        rules: {
          emails: {
            required: true,
            multiemails: true
          },
          from: {
            required: true
          }
        },
        messages: {
          emails: {
            required: "Email is required",
            multiemails: "You must enter a valid e-mail address of your friend (in)."
          }
        }
      });
    },

    //header script. Do not edit!!!
    headroom: function () {
      $(".j-header").headroom({
        offset: $('#leaderboardouter').height() || 0,
        classes: {
          // when scrolling up
          pinned: "headroom--pinned",
          // when scrolling down
          unpinned: "headroom--unpinned",
          // when above offset
          top: "headroom--top",
          // when below offset
          notTop: "headroom--not-top"
        },
        onTop: function () {
          $('.j-header').removeAttr('style');
        },
        onNotTop: function () {
          $('.j-header').css('position', 'fixed');
        }
      });
    },

    unsubscribe: function () {
      $(document.body).on('submit', "#form-unsubscribe", function (e) {
        e.preventDefault();

        //small email validation for unsubscribe.
        var email = $('#form-unsubscribe input').val(),
            re    = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        if (!email.match(re)) {
          $('.j-help-text').fadeIn();
        } else {
          $('.unsubscribe-panel').hide();
          $('.unsubscribe-success, .remove-from-all').fadeIn();
        }
      });

      $(document.body).on('submit', ".unsubscribe-success form", function (e) {
        e.preventDefault();
        $('.unsubscribe-success strong, .j-text-feedback').hide();
        $(this).html('<p class="lead alert alert-success center-text">Thank you, your feedback will help us make PracticeUpdate better.</p>');
      });
    },

    signin: function () {
      // TODO: make password field shake on failed validation
      // var animationName = 'animated shake';
      // var animationEnd = 'webkitAnimationEnd mozAnimationEndMSAnimnationEnd oanimationend animationend';
      // $(this).addClass('animationName').one(animationend, function(){
      //   $(this).removeClass('animationName');
      // });

      $(document.body).on('submit', "#form-signin, #form-signin", function (e) {
        e.preventDefault();

        //small email validation for unsubscribe.
        var email = $('.form-signin #email').val(),
            psw   = $('.form-signin #password').val(),
            re    = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        if (!email.match(re)) {
          $('.j-help-text').fadeIn();
        } else {
          $('.j-help-text').fadeOut();
        }

        if (psw === "") {
          $('.jp-help-text').fadeIn();
        } else {
          $('.jp-help-text').fadeOut();
        }

        if (psw !== "" && email.match(re))
          window.location = '/explore/';

      });

      $(document.body).on('submit', ".unsubscribe-success form", function (e) {
        e.preventDefault();
        $('.unsubscribe-success strong, .j-text-feedback').hide();
        $(this).html('<p class="lead alert alert-success center-text">Thank you, your feedback will help us make PracticeUpdate better.</p>');
      });
    },

    'ad-modal': function () {
      $('#ad-modal').modal('show');
    },

    subnav: function () {
      $(document.body).on('click', ".j-fa-search", function (e) {
        e.preventDefault();

        var width = $(document).width();

        if (768 > width) {
          $(this).css('display', 'none');
          $('.fa-times').css('display', 'block');
          $('.full-search').css('left', '0');
          $('.content-right').css('border-width', '0');
        }
      });

      $(document.body).on('click', ".j-fa-times", function (e) {
        e.preventDefault();

        $(this).css('display', 'none');
        $('.fa-search').css('display', 'block');
        $('.full-search').css('left', '-99999999px');
        $('.content-right').css('border-width', '1px');
      });

      $(window).resize(function () {
        var width = $(document).width();
        if (760 < width) {
          $('.j-fa-times').trigger('click');
        }
      });
    },

    creeper: function () {
      var open = false;

      $(document).scroll(function () {
        var y    = $(this).scrollTop(),
            half = $(document).height() / 3;

        if (y > half && open === false) {
          $('.j-creeper').animate({"left": "0px"}, "fast");
          open = true;
        }
      });

      $(document.body).on('click', ".j-creeper .close", function (e) {
        e.preventDefault();

        $('.j-creeper').animate({"left": "-340px"}, "fast");
      });
    },

    search: function () {
      $(document.body).on('click touchstart', ".module-search .control-label", function (e) {
        if ($(window).width() <= 768) {
          e.preventDefault();

          $('.j-typeahead-search').toggle();
          $('.nav-local .module-menu').toggleClass('hide');
          $(this).find('.fa.fa-search.fa-2x').toggleClass('fa-times');
        }
      });

      $(window).resize(function () {
        if ($(window).width() > 768) {
          $('.j-typeahead-search').removeClass('hide').removeAttr('style');
          $('.nav-local .module-menu').removeClass('hide');
          $('.fa.fa-search.fa-2x').removeClass('fa-times');
        }
      });
    },

    personalValidation: function () {
      var oldPassword = $('#oldPassword'),
          newPassword = $('#newPassword'),
          passwordUpdated = function() {
            //$('.change-password').toggleClass('hidden');
            oldPassword.val('');
            newPassword.val('');
            $('.change-password .form-group').removeClass('has-error');

            $('.change-password, .hide-on-change-password').toggleClass('hidden');
            $('.j-change-password').fadeIn();
            $.growl({
                icon: 'fa fa-thumbs-up',
                title: ' Your Password has been Changed!',
                },{
              element: '.change-password-toggle',
              type: 'success',
              offset: {
                y: 10
              }
            });
          };

      var validator = $("#formPersonal").validate({
            ignore: '.ignore',
            errorClass: 'help-block text-error',
            errorElement: 'span',
            errorPlacement: function(error, element) {
                if(element.parent('.input-group').length) {
                    error.insertAfter(element.parent());
                } else {
                    error.insertAfter(element);
                }
            },
            rules: {
              ignore: '.hidden',
              email: {
                required: true
              },
              fname: {
                required: true
              },
              lname: {
                required: true
              },
              oldPassword: {
                required: '.change-password.open'
              },
              newPassword: {
                required: '.change-password.open'
              }
            },
            messages: {
              email: {
                required: "Email is required"
              },
              fname: {
                required: "First name is required"
              },
              lname: {
                required: "Last name is required"
              }
            },
            highlight: function (element) {
              $(element).removeClass("has-error");
              $(element).parent('.form-group').addClass("has-error");
              $(element).parent('.input-group').addClass("has-error");
            },
            submitHandler: function (form) {
              if ($(".preferences-content").data('pu-view') == 'register') {
                window.location = "/user/register/professional/";
              } else {
                $.growl('Your changes have been Saved!', {
                  type: 'success'
                });
              }
            }
          });

      $(document.body).on('click', '.j-cancel', function(e) {
        validator.resetForm();

        $('.input-group, .form-group').removeClass('has-error');
        $('#email').val('');
        $('#fname').val('John');
        $('#lname').val('Smith');
      });

      $(document.body).on('click', '.j-change-password', function(e) {
        $(this).fadeOut();
        $('.change-password, .hide-on-change-password').toggleClass('hidden');
        $('#oldPassword').focus();
      });

      $(document.body).on('click', '.j-cancel-update-password', function (e) {
        e.preventDefault();
        $('.change-password, .hide-on-change-password').toggleClass('hidden');
        $('.j-change-password').fadeIn();
        oldPassword.val('');
        newPassword.val('');
        $('.change-password .input-group').next('span.help-block').remove();
        $('.change-password .input-group').removeClass('has-error');
      });

      $(document.body).on('click', '.j-update-password', function (e) {
        e.preventDefault();

        var newPasswordLength = newPassword.val().length;

        $('.j-password-error').remove();
        $('.change-password .input-group').removeClass("has-error");

        //newPassword.valid();

        if (newPasswordLength > 20) {
          newPassword.after('<span class="help-block j-password-error">Please enter no more than 20 characters.</span>');
          newPassword.parent('.input-group').addClass("has-error");
        }

        if (newPasswordLength < 6) {
          newPassword.parent('.input-group').after('<span class="help-block j-password-error" style="color: #a94442;">Please enter at least 6 characters.</span>');
          newPassword.parent('.input-group').addClass("has-error");
        }

        if ($.trim(oldPassword) === '') {
          oldPassword.after('<span class="help-block j-password-error">Please provide current password</span>');
          oldPassword.parent('.input-group').addClass("has-error");
        }

        if ($.trim(oldPassword) !== '' && $.trim(oldPassword.val()) != oldPassword.data('current')) {
          oldPassword.parent('.input-group').after('<span class="help-block j-password-error" style="color: #a94442;">Password is incorrect.</span>');
          oldPassword.parent('.input-group').addClass("has-error");
        }

        if ($('.j-password-error').length === 0) {
          passwordUpdated();
        }
      });

      $(document.body).on('keypress', '#oldPassword, #newPassword', function (e) {
        var key = e.which;

        if (key == 13) {
          $('.j-update-password').click();
          return false;
        }
      });

    },

    professionalValidation: function () {
      var hcpArray         = ["1", "7", "8", "11", "6", "5"],
          selectProfession = $('#selectProfession'),
          selectPrimary    = $('#selectPrimary');

      $(document.body).on('change', selectProfession, function (e) {
        var selectedProfession = $(selectProfession).val();
        var checkProfession = $.inArray(selectedProfession, hcpArray);

        if (checkProfession >= 0) { // is HCP
          $('.select-primary').removeClass('hidden');
          $(selectPrimary).removeAttr('disabled').attr('required', 'true');
        } else { // is not HCP
          $('.select-primary').addClass('hidden');
          $(selectPrimary).attr('disabled', 'true').removeAttr('required');
        }
      });

      $(document.body).on('click', '.radio-inline input', function (e) {
        $('.form-group').removeClass('hidden');
      });

      $(document.body).on('submit', 'form', function (e) {
        e.preventDefault();
          if ( $( ".preferences-content").data('pu-view') == 'register' ) {
            window.location = "/user/register/content-subscription/";
          } else {
            $.growl('Your changes have been Saved!', {
              type: 'success'
            });
          }
      });
    },

    contentSubscription: function () {
      $(document.body).on('click', '.enabled .settings-options [type="checkbox"]', function (e) {
        PU.card.saveSettings($(this));
      });

      $(document.body).on('click', ".enabled.card-settings:not('.open') .card-banner", function (e) {
        PU.card.disableCard($(this));
        $(this).find('[data-toggle="popover"]').popover('destroy');
      });

      $(document.body).on('click', ".disabled.card-settings .card-banner", function (e) {
        PU.card.enableCard($(this));
      });

      $('[data-toggle="popover"]').popover({container: 'body'});

      $('[data-toggle="popover"]').on('click', function (e) {
        $('[data-toggle="popover"]').not(this).popover('hide');
      });

      $(window).resize(function () {
        $('[data-toggle="popover"]').popover('hide');
      });

      $(document.body).on('click', ".j-cancel", function (e) {
        e.preventDefault();

        $.growl('Your changes have been reset.', {
          type: 'info'
        });

        $("html, body").animate({scrollTop: 0}, "slow");
      });

      $("#formContent").submit(function (e) {
        e.preventDefault();


        $.growl('Your changes have been saved.', {
          type: 'info'
        });
      });

      PU.card.popoverState();
    },

    'pref-nav': function () {
      if ($(".preferences-nav li:contains('Personal')").hasClass('active'))
        PU.events.personalValidation();

      if ($(".preferences-nav li:contains('Professional')").hasClass('active'))
        PU.events.professionalValidation();

      if ($(".preferences-nav li:contains('Content & Subscriptions')").hasClass('active'))
        PU.events.contentSubscription();

      if ($(window).width() < 768) {
        $('.preferences-nav ul').addClass('mobile-nav');
      }

      $(window).resize(function () {
        if ($(window).width() < 768) {
          $('.preferences-nav ul').addClass('mobile-nav');
        } else {
          $('.preferences-nav ul').removeClass('mobile-nav');
        }
      });

      $(document.body).on('click', '.mobile-nav', function (e) {
        e.preventDefault();
        $(this).toggleClass("open");
      });

      $(document.body).on('click', '.mobile-nav.open a', function (e) {
        e.preventDefault();

        var $this = $(this);

        $('.mobile-nav li').removeClass('active');
        $this.parent('li').addClass('active');

        $('.mobile-nav').unbind();
        setTimeout(function () {
          window.location = $this.attr('href');
        }, 500);
      });

      $(document.body).on('click', '.preferences-nav .active a', function (e) {
        e.preventDefault();
      });
    },

    'masonry': function () {
      if ($('.masonry-grid').length > 0) {
        var $container = $('.masonry-grid');

        if ($container) {
          $container.imagesLoaded(function () {
            $container.isotope({
              itemSelector: '.masonry-cell:not(.masonry-stamp)',
              stamp: '.masonry-stamp',
              isAnimated: true,
              isResizable: true
            });
          });
        }
      }

      if ($('.list-group-grid').length > 0) {
        var $container2    = $('.list-group-grid'),
            getSelector2   = $container2.children().attr('class'),
            $itemSelector2 = '.' + getSelector2.replace(/\s+/g, '.');

        if ($container2) {
          $container.imagesLoaded( function() {
            $container.isotope({
              itemSelector: $itemSelector,
              stamp: '.masonry-stamp',
              layoutMode: 'fitRows',
              isAnimated: true,
              isResizable: true
            });
          });
        }
      }

      if ($('.expert-list').length > 0) {
        var $container3    = $('.expert-list'),
            getSelector3   = $container3.children().attr('class'),
            $itemSelector3 = '.' + getSelector3.replace(/\s+/g, '.');

        if ($container3) {
          $container3.imagesLoaded(function () {
            $container3.isotope({
              itemSelector: $itemSelector3,
              stamp: '.masonry-stamp',
              layoutMode: 'fitRows',
              isAnimated: true,
              isResizable: true
            });
          });
        }
      }

      if ($('.gallery').length > 0) {
        var $container4 = $('.gallery');

        if ($container4) {
          $container4.imagesLoaded(function () {
            $container4.isotope({
              itemSelector: '.thumb',
              isAnimated: true,
              isResizable: true
            });
          });
        }
      }

      if ($('.coe-widget').length > 0) {
        var $container5 = $('.coe-widget');

        if ($container5) {
          $container5.imagesLoaded(function () {
            $container5.isotope({
              itemSelector: $('.layout-item'),
              stamp: '.masonry-stamp',
              isAnimated: true,
              isResizable: true
            });
          });
        }
      }

      if ($.isotope) {
        $(window).resize(function () {
          $container.isotope('bindResize');
        });
      }
    },

    'sticky-footer': function () {
      function stickyFooter() {
        $("html").removeClass('sticky-footer');

        var b = $(document.body).height(),
            w = $(window).height();

        //console.log(w > b)

        if (w > b)
          $("html").addClass('sticky-footer');
        else
          $("html").removeClass('sticky-footer');
      }

      stickyFooter();

      $(window).resize(function () {
        stickyFooter();
      });
    },

    detectBrowser: function () {
      navigator.ver = (function () {
        var l    = navigator.userAgent,
            f, M = l.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];

        if (/trident/i.test(M[1])) {
          f = /\brv[ :]+(\d+)/g.exec(l) || [];
          return 'IE ' + (f[1] || '');
        }

        if (M[1] === 'Chrome') {
          f = l.match(/\bOPR\/(\d+)/);
          if (f !== null) return 'Opera ' + f[1];
        }

        M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
        if ((f = l.match(/version\/(\d+)/i)) !== null) M.splice(1, 1, f[1]);

        return M.join(' ');
      })();


      if (navigator.ver === 'Safari 5') {
        $('.primary').css('width', '66.66666667%');
        $('.main-content').css('display', 'block');
      }
    }
  };
}(jQuery));

//Methods to handle card events
PU.card = (function ($) {
  "use strict";
  return {
    popoverState: function () {
      $('[data-toggle="popover"]').popover('enable');

      $(".disabled").each(function () {
        $(this).find('[type="checkbox"]').attr("disabled", true);
        $(this).find('[data-toggle="popover"]').popover('disable');
      });
    },

    enableCard: function (items) {
      var $card    = items.parents('.card'),
          $title   = $card.find('.card-title').html(),
          formData = {
            enable: $title
          };

      //console.log( formData );

      items.parents('.card').toggleClass('disabled enabled');
      items.parents('.card').find('.card-state-control').removeAttr("disabled");
      items.parents('.card').find('.card-state-control .fa').toggleClass('fa-check-circle-o fa-circle-o');
      items.parents('.card').find('[type="checkbox"]').removeAttr("disabled");


      PU.card.popoverState();
    },

    disableCard: function (items) {
      var $card    = items.parents('.card'),
          $title   = $card.find('.card-title').html(),

          formData = {
            disable: $title
          };

      //console.log( formData )

      items.parents('.card').toggleClass('disabled enabled');
      items.parents('.card').find('.card-state-control').attr("disabled", true);
      items.parents('.card').find('.card-state-control .fa').toggleClass('fa-check-circle-o fa-circle-o');
      items.parents('.card').find('[type="checkbox"]').attr("disabled", true);

      PU.card.popoverState();
    },

    saveSettings: function (items) {
      var $card      = items.parents('.card'),
          $title     = $card.find('.card-title').html(),
          $setting   = $card.find('.settings-options'),
          $checkboxs = $setting.find("input:checked"),
          arr        = [],
          formData   = {
            category: $title,
            selection: arr
          };

      $checkboxs.map(function (key, item) {
        arr.push(this.value);
      });

      //console.log( 'saveSettings' )
      //console.log( formData )
    }
  };
}(jQuery));

$(document).ready(function () {
  PU.util.init();
  PU.user.init();
});
