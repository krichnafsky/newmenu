;(function( $, window, document, undefined ) {
	var isTouch		  = 'ontouchstart' in window,
		eStart		  = isTouch ? 'touchstart'	: 'mousedown',
		eMove		  = isTouch ? 'touchmove'	: 'mousemove',
		eEnd		  = isTouch ? 'touchend'	: 'mouseup',
		eCancel		  = isTouch ? 'touchcancel'	: 'mouseup',
		secondsToTime = function( secs ) {
			var hoursDiv = secs / 3600, hours = Math.floor( hoursDiv ), minutesDiv = secs % 3600 / 60, minutes = Math.floor( minutesDiv ), seconds = Math.ceil( secs % 3600 % 60 );
			if( seconds > 59 ) { seconds = 0; minutes = Math.ceil( minutesDiv ); }
			if( minutes > 59 ) { minutes = 0; hours = Math.ceil( hoursDiv ); }
			return ( hours == 0 ? '' : hours > 0 && hours.toString().length < 2 ? '0'+hours+':' : hours+':' ) + ( minutes.toString().length < 2 ? '0'+minutes : minutes ) + ':' + ( seconds.toString().length < 2 ? '0'+seconds : seconds );
		};

	$.fn.audioPlayer = function( params ) {
		var params		= $.extend( {
			controlsTemplate: null,
			classPrefix: 'audioPlayer',
			strPlay: 'Play',
			strPause: 'Pause',
			strReload: 'Reload',
			strVolume: 'Volume',
			strMuted: 'Muted',
			reloadFunction: null }, params ),
			cssClass	= {},
			cssClassSub = {
				playPause:	 	'PlayPause',
				playing:		'Playing',
				stopped:		'Stopped',
				loading:	    'Loading',
				reload:		    'Reload',
				time:		 	'Time',
				timeCurrent:	'TimeCurrent',
				timeDuration: 	'TimeDuration',
				bar: 			'Bar',
				barLoaded:		'BarLoaded',
				barPlayed:		'BarPlayed',
				volume:		 	'Volume',
				volumeButton: 	'VolumeButton',
				volumeAdjust: 	'VolumeAdjust',
				volumeAdjuster: 'VolumeAdjuster',
				volumeBar:      'VolumeBar',
				noVolume: 		'NoVolume',
				muted: 			'Muted'
			};

		for ( var subName in cssClassSub )
			cssClass[ subName ] = params.classPrefix + '' + cssClassSub[ subName ];

		this.each( function() {
			if ( params.controlsTemplate == null )
				return false;

			var $this = $( this );

			if ( $this.prop( 'tagName' ).toLowerCase() != 'audio' )
				return false;

			if ( $this.data( 'jquery.audioPlayer' ))
				return false;

			$this.data( 'jquery.audioPlayer', true );

			var audioFile  = $this.attr( 'src' ),
				isAutoPlay = $this.prop( 'autoplay' ), isAutoPlay = isAutoPlay === '' || isAutoPlay === 'autoplay' ? true : false,
				isLoop	   = $this.prop( 'loop' ), isLoop = isLoop === '' || isLoop	 === 'loop' ? true : false,
				hasVolume  = true;
			    theParent  = $this.parent(),
			    thePlayer  = $(params.controlsTemplate).clone().attr( 'id', $this.attr( 'id' ) + '_audioPlayerControls' ).prepend( $this ),
			    $theAudio  = thePlayer.find( 'audio' ), theAudio = $theAudio.get( 0 );

			$(params.controlsTemplate).hide();
			$theAudio.css( { 'width': 0, 'height': 0 } ).hide();
			theParent.append( thePlayer );
			thePlayer.removeClass( cssClass.playing ).addClass( cssClass.stopped + ' ' + cssClass.loading ).show();

			var volumeTestDefault = theAudio.volume, volumeTestValue = theAudio.volume = 0.111;
			if( Math.round( theAudio.volume * 1000 ) / 1000 == volumeTestValue ) {
				theAudio.volume = volumeTestDefault;
			} else {
				hasVolume = false;
				thePlayer.addClass( cssClass.noVolume );
			}

			var thePlayPause      = thePlayer.find( '.' + cssClass.playPause ),
			    theReload	 	  = thePlayer.find( '.' + cssClass.reload ),
			    theBar			  = thePlayer.find( '.' + cssClass.bar ),
			    theBarPlayed 	  = thePlayer.find( '.' + cssClass.barPlayed ),
			    theBarLoaded 	  = thePlayer.find( '.' + cssClass.barLoaded ),
			    theTimeCurrent	  = thePlayer.find( '.' + cssClass.timeCurrent ),
			    theTimeDuration	  = thePlayer.find( '.' + cssClass.timeDuration ),
			    theVolume         = thePlayer.find( '.' + cssClass.volume ),
			    theVolumeBar      = thePlayer.find( '.' + cssClass.volumeBar ),
				theVolumeAdjuster = thePlayer.find( '.' + cssClass.volumeAdjuster ),
				theVolumeButton	  = thePlayer.find( '.' + cssClass.volumeButton ),
				percentLoaded     = 0,
				percentPlayed     = 0,
			    volumeDefault	  = 0;

			if ( thePlayPause.length > 0 ) {
				thePlayPause.attr( 'title', '' );
				if ( thePlayPause.find( 'a span').length > 0 ) {
					thePlayPause.find( 'a span' ).html( '-' );
				} else {
					thePlayPause.find( 'a' ).html( '-' );
				}
				thePlayPause.on( 'click', function() {
					if ( thePlayer.hasClass( cssClass.loading ) )
						return false;
					if ( thePlayer.hasClass( cssClass.playing ) ) {
					    theAudio.pause();
		            } else {
					    theAudio.play();
		            }
					return false;
				});
			}

			if ( theTimeCurrent.length > 0 ) {
				theTimeCurrent.html( secondsToTime( 0 ) );
			}

			if ( theTimeDuration.length > 0 ) {
				theTimeDuration.html( '&#8230;' );
			}

			var adjustCurrentTime = function( e ) {
				if ( ( theBar.length == 0 ) || !( $.isNumeric( theAudio.duration ) ) ) return;
				var theRealEvent = isTouch ? e.originalEvent.touches[ 0 ] : e;
				theAudio.currentTime = Math.round( ( theAudio.duration * ( theRealEvent.pageX - theBar.offset().left ) ) / theBar.width() );
			},
			updateLoadBar = function() {
				if ( theBarLoaded.length == 0 ) return;
				if ( !( $.isNumeric( theAudio.duration ) ) ) {
					theBarLoaded.width( '100%' );
					return;
				}
				var interval = setInterval( function() {
					if ( ( theAudio.buffered.length < 1 ) || ( percentLoaded >= 100 ) ) {
						clearInterval( interval );
						return true;
					}
					percentLoaded = ( theAudio.buffered.end( 0 ) / theAudio.duration ) * 100;
					theBarLoaded.width( percentLoaded + '%' );
				}, 100 );
			},
			adjustVolume = function( e ) {
				if ( theVolumeAdjuster.length == 0 ) return;
				var theRealEvent = isTouch ? e.originalEvent.touches[ 0 ] : e;
				theAudio.volume = Math.abs( ( theRealEvent.pageY - ( theVolumeAdjuster.offset().top + theVolumeAdjuster.height() ) ) / theVolumeAdjuster.height() );
			};

			if ( theBar.length > 0 ) {
				theBar.on( eStart, function( e ) {
					adjustCurrentTime( e );
					theBar.on( eMove, function( e ) { adjustCurrentTime( e ); } );
				}).on( eCancel, function() {
					theBar.unbind( eMove );
				});
			}

			if ( theReload.length > 0 ) {
				theReload.on( 'click', function() {
					if ( hasVolume && ( theVolume.length > 0 ) )
						theVolume.hide();
					if ( thePlayPause.length > 0 ) {
						thePlayPause.attr( 'title', '' );
						if ( thePlayPause.find( 'a span').length > 0 ) {
							thePlayPause.find( 'a span' ).html( '-' );
						} else {
							thePlayPause.find( 'a' ).html( '-' );
						}
					}
					thePlayer.removeClass( cssClass.playing ).addClass( cssClass.stopped + ' ' + cssClass.loading );
					if ( theBarPlayed.length > 0 )
						theBarPlayed.width( '0%' );
					if ( theBarLoaded.length > 0 )
						theBarLoaded.width( '0%' );
					if ( theTimeCurrent.length > 0 )
						theTimeCurrent.html( secondsToTime( 0 ) );
					if ( theTimeDuration.length > 0 )
						theTimeDuration.html( '&#8230;' );
					if ( $.isFunction( params.reloadFunction ) ) {
						params.reloadFunction();
					} else {
						theAudio.load();
					}
				return false;
				});
			}

			if ( theVolumeAdjuster.length > 0 ) {
				theVolumeAdjuster.on( eStart, function( e ) {
					adjustVolume( e );
					theVolumeAdjuster.on( eMove, function( e ) { adjustVolume( e ); } );
				}).on( eCancel, function() {
					theVolumeAdjuster.unbind( eMove );
				});
			}

			if ( theVolumeButton.length > 0 ) {
				theVolumeButton.on( 'click', function() {
					if( thePlayer.hasClass( cssClass.muted ) ) {
						$( this ).attr( 'title', params.strVolume );
						if ( $( this ).find( 'a span').length > 0 ) {
							$( this ).find( 'a span' ).html( params.strVolume );
						} else {
							$( this ).find( 'a' ).html( params.strVolume );
						}
						thePlayer.removeClass( cssClass.muted );
						theAudio.volume = volumeDefault;
					} else {
						$( this ).attr( 'title', params.strMuted );
						if ( $( this ).find( 'a span').length > 0 ) {
							$( this ).find( 'a span' ).html( params.strMuted );
						} else {
							$( this ).find( 'a' ).html( params.strMuted );
						}
						thePlayer.addClass( cssClass.muted );
						volumeDefault = theAudio.volume;
						theAudio.volume = 0;
					}
					return false;
				});
			}

			theAudio.addEventListener( 'timeupdate', function() {
				if ( theTimeCurrent.length > 0 )
					theTimeCurrent.html( secondsToTime( theAudio.currentTime ) );
				if ( theBarPlayed.length > 0 ) {
					if ( !( $.isNumeric( theAudio.duration ) ) ) {
						if (percentPlayed < 100) {
							percentPlayed += 10;
						}
						theBarPlayed.width( percentPlayed + '%' );
					} else {
						theBarPlayed.width( ( theAudio.currentTime / theAudio.duration ) * 100 + '%' );
					}
				}
			});

			theAudio.addEventListener( 'loadstart', function() {
				percentLoaded = 0;
				percentPlayed = 0;
				if ( theBarPlayed.length > 0 )
					theBarPlayed.width( '0%' );
			});

			theAudio.addEventListener( 'loadeddata', function() {
				updateLoadBar();
			});

			theAudio.addEventListener( 'loadedmetadata', function() {
				if ( hasVolume && ( theVolume.length > 0 ) )
					theVolume.show();
				if ( theVolumeBar.length > 0 )
					theVolumeBar.height( theAudio.volume * 100 + '%' );
				volumeDefault = theAudio.volume;
				if ( thePlayPause.length > 0 ) {
					thePlayPause.attr( 'title', params.strPlay );
					if ( thePlayPause.find( 'a span').length > 0 ) {
						thePlayPause.find( 'a span' ).html( params.strPlay );
					} else {
						thePlayPause.find( 'a' ).html( params.strPlay );
					}
				}
			    thePlayer.removeClass( cssClass.playing + ' ' + cssClass.loading ).addClass( cssClass.stopped );
			});

			theAudio.addEventListener( 'durationchange', function() {
				if ( theTimeDuration.length > 0 )
					theTimeDuration.html( $.isNumeric( theAudio.duration ) ? secondsToTime( theAudio.duration ) : '&#8230;' );
			});

			theAudio.addEventListener( 'volumechange', function() {
				if ( theVolumeBar.length > 0 )
					theVolumeBar.height( theAudio.volume * 100 + '%' );
				if ( theAudio.volume > 0 && thePlayer.hasClass( cssClass.muted ) ) {
					if ( theVolumeButton.length > 0 ) {
						theVolumeButton.attr( 'title', params.strVolume );
						if ( theVolumeButton.find( 'a span').length > 0 ) {
							theVolumeButton.find( 'a span' ).html( params.strVolume );
						} else {
							theVolumeButton.find( 'a' ).html( params.strVolume );
						}
					}
					thePlayer.removeClass( cssClass.muted );
				}
				if ( theAudio.volume <= 0 && !thePlayer.hasClass( cssClass.muted ) ) {
					if ( theVolumeButton.length > 0 ) {
						theVolumeButton.attr( 'title', params.strMuted );
						if ( theVolumeButton.find( 'a span').length > 0 ) {
							theVolumeButton.find( 'a span' ).html( params.strMuted );
						} else {
							theVolumeButton.find( 'a' ).html( params.strMuted );
						}
					}
					thePlayer.addClass( cssClass.muted );
				}
			});

			theAudio.addEventListener( 'ended', function() {
				if ( thePlayPause.length > 0 ) {
					thePlayPause.attr( 'title', '' );
					if ( thePlayPause.find( 'a span').length > 0 ) {
						thePlayPause.find( 'a span' ).html( '-' );
					} else {
						thePlayPause.find( 'a' ).html( '-' );
					}
				}
				thePlayer.removeClass( cssClass.playing ).addClass( cssClass.stopped + ' ' + cssClass.loading );
			});

			theAudio.addEventListener( 'playing', function() {
				if ( thePlayPause.length > 0 ) {
					thePlayPause.attr( 'title', params.strPause );
					if ( thePlayPause.find( 'a span').length > 0 ) {
						thePlayPause.find( 'a span' ).html( params.strPause );
					} else {
						thePlayPause.find( 'a' ).html( params.strPause );
					}
				}
			    thePlayer.addClass( cssClass.playing ).removeClass( cssClass.stopped );
			});

			theAudio.addEventListener( 'pause', function() {
				if ( thePlayPause.length > 0 ) {
					thePlayPause.attr( 'title', params.strPlay );
					if ( thePlayPause.find( 'a span').length > 0 ) {
						thePlayPause.find( 'a span' ).html( params.strPlay );
					} else {
						thePlayPause.find( 'a' ).html( params.strPlay );
					}
				}
			    thePlayer.removeClass( cssClass.playing ).addClass( cssClass.stopped );
			});
		});
		return this;
	};
})( jQuery, window, document );