import React from 'react';
import { compile, templates } from 'core/js/reactHelpers';

function MediaPlayer(props) {
  const {
    _media,
    _useClosedCaptions,
    _playsinline,
    _shouldSetSize,
    _videoDimensions
  } = props;

  return (
    <div className='component__widget media__widget'>

      {((_media?.mp3 || _media?.ogg) && _media.poster) &&
        <img className='media__poster is-audio' src={_media.poster} alt='' aria-hidden='true' />
      }

      {/* eslint-disable jsx-a11y/media-has-caption */}
      {_media?.mp3
        ? <audio src={_media.mp3} type='audio/mp3' style={{ width: '100%', height: '100%' }} />
        : _media?.ogg
          ? <audio src={_media.ogg} type='audio/ogg' style={{ width: '100%', height: '100%' }} />
          : <video
            aria-hidden='true'
            preload='none'
            width={_shouldSetSize ? _videoDimensions?.width : undefined}
            height={_shouldSetSize ? _videoDimensions?.height : undefined}
            playsInline={_playsinline || undefined}
            poster={_media?.poster}
            style={{ maxWidth: '100%' }}
            controls
          >
            {_media?.source
              ? <source src={_media.source} type={_media.type} />
              : <>
                {_media?.mp4 && <source src={_media.mp4} type='video/mp4' />}
                {_media?.ogv && <source src={_media.ogv} type='video/ogg' />}
                {_media?.webm && <source src={_media.webm} type='video/webm' />}
              </>
            }
            {_useClosedCaptions && _media?.cc?.map((track, index) =>
              <track
                key={index}
                kind='subtitles'
                src={track.src}
                type='text/vtt'
                srcLang={track.srclang}
              />
            )}
          </video>
      }
      {/* eslint-enable jsx-a11y/media-has-caption */}

    </div>
  );
}

// Prevent re-renders to protect MEJS DOM
const MemoMediaPlayer = React.memo(MediaPlayer, () => true);

export default function Media(props) {
  const completedLabel = props._globals?._accessibility?._ariaLabels?.complete;
  const mediaGlobals = props._globals?._components?._media;
  const {
    _media,
    _transcript,
    _useClosedCaptions,
    _playsinline,
    _shouldSetSize,
    _videoDimensions,
    _isComplete,
    _isInlineTranscriptOpen,
    _hasTranscript,
    inlineButtonText,
    transcriptRegionLabel,
    onToggleInlineTranscript,
    onExternalTranscriptClicked,
    onSkipToTranscript
  } = props;

  return (
    <div className='component__inner media__inner'>

      <templates.header {...props} />

      {_hasTranscript &&
        <button
          className='btn-text media__skip-to-transcript js-skip-to-transcript'
          onClick={onSkipToTranscript}
        >
          {mediaGlobals?.skipToTranscript}
        </button>
      }

      <MemoMediaPlayer
        _media={_media}
        _useClosedCaptions={_useClosedCaptions}
        _playsinline={_playsinline}
        _shouldSetSize={_shouldSetSize}
        _videoDimensions={_videoDimensions}
      />

      {_transcript &&
        <div className='media__transcript-container'>

          {_transcript._inlineTranscript &&
            <button
              className='media__transcript-btn media__transcript-btn-inline js-media-inline-transcript-toggle'
              onClick={onToggleInlineTranscript}
              aria-expanded={!!_isInlineTranscriptOpen}
            >
              {_isComplete && completedLabel &&
                <span className='aria-label'>
                  {completedLabel}.
                </span>
              }
              <span
                className='media__transcript-btn-text'
                dangerouslySetInnerHTML={{ __html: compile(inlineButtonText || '') }}
              />
              <span className='media__transcript-btn-icon'>
                <span className='icon' aria-hidden='true' />
              </span>
            </button>
          }

          {_transcript._externalTranscript &&
            <button
              className='media__transcript-btn media__transcript-btn-external js-media-external-transcript-click'
              onClick={onExternalTranscriptClicked}
            >
              {_isComplete && completedLabel &&
                <span className='aria-label'>
                  {completedLabel}.
                </span>
              }
              <span
                className='media__transcript-btn-text'
                dangerouslySetInnerHTML={{ __html: compile(_transcript.transcriptLinkButton || _transcript.transcriptLink || '') }}
              />
              <span className='media__transcript-btn-icon'>
                <span className='icon' aria-hidden='true' />
              </span>
            </button>
          }

          {_transcript._inlineTranscript &&
            <div
              className='media__transcript-body-inline'
              role='region'
              aria-label={transcriptRegionLabel}
            >
              <div
                className='media__transcript-body-inline-inner'
                dangerouslySetInnerHTML={{ __html: compile(_transcript.inlineTranscriptBody) }}
              />
            </div>
          }

        </div>
      }

    </div>
  );
}
