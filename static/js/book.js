document.addEventListener('DOMContentLoaded', function () {
    const paragraphs = document.querySelectorAll('.paragraph');
    const playButton = document.getElementById('play-audio');
    const pauseButton = document.getElementById('pause-audio');
    const stopButton = document.getElementById('stop-audio');
    let audio = new Audio();
    let currentParagraphIndex = -1;
    let isPaused = false;
    let nextTimeout = null;
    let isRequestPending = false;

    paragraphs.forEach(paragraph => {
        paragraph.addEventListener('click', function () {
            if (!isRequestPending) {
                currentParagraphIndex = parseInt(paragraph.getAttribute('data-paragraph-id')) - 1;
                playParagraphAudio(paragraph);
            }
        });
    });

    playButton.addEventListener('click', function () {
        if (isPaused && !isRequestPending) {
            audio.play();
            isPaused = false;
        } else if (currentParagraphIndex >= 0 && !isRequestPending) {
            playParagraphAudio(paragraphs[currentParagraphIndex]);
        }
    });

    pauseButton.addEventListener('click', function () {
        audio.pause();
        isPaused = true;
        clearTimeout(nextTimeout);
    });

    stopButton.addEventListener('click', function () {
        audio.pause();
        audio.currentTime = 0;
        isPaused = false;
        currentParagraphIndex = -1;
        clearTimeout(nextTimeout);
    });

    function playParagraphAudio(paragraph) {
        const paragraphId = paragraph.getAttribute('data-paragraph-id');
        const text = paragraph.textContent;
        const voiceSelect = document.getElementById('voice-select').value;
        const language = document.body.getAttribute('data-language') || 'en';
        const referenceAudioUrl = `static/audio/${language}_${voiceSelect}.mp3`;

        if (isRequestPending) {
            return;
        }

        isRequestPending = true;

        fetch('/process', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: text,
                style: `${language}_default`,
                file_path: referenceAudioUrl,
                agree: true
            })
        })
        .then(response => response.json())
        .then(data => {
            isRequestPending = false;
            if (data.error) {
                console.error('Error:', data.error);
            } else if (data.synthesised_audio_path) {
                audio.src = `/${data.synthesised_audio_path}?timestamp=${new Date().getTime()}`;
                audio.play();
                audio.onended = function () {
                    currentParagraphIndex++;
                    if (currentParagraphIndex < paragraphs.length) {
                        nextTimeout = setTimeout(() => {
                            playParagraphAudio(paragraphs[currentParagraphIndex]);
                        }, 1); 
                    }
                };
            }
        })
        .catch(error => {
            isRequestPending = false;
            console.error('Error:', error);
        });
    }
});

