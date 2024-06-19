// navigation.js
document.addEventListener('DOMContentLoaded', function () {
    const prevChapterButton = document.getElementById('prev-chapter');
    const nextChapterButton = document.getElementById('next-chapter');
    const chapterContent = document.getElementById('chapter-content');
    let currentChapterIndex = {{ current_chapter_index }};
    let chapters = JSON.parse('{{ book_data["chapters"] | tojson | safe }}');

    function renderChapter(index) {
        const chapter = chapters[index];
        let content = `<h2>${chapter.title}</h2>`;
        chapter.paragraphs.forEach(paragraph => {
            content += `<p class="paragraph" data-paragraph-id="${paragraph.paragraph_id}">${paragraph.text}</p>`;
        });
        chapterContent.innerHTML = content;

        // Re-initialize paragraph event listeners
        document.querySelectorAll('.paragraph').forEach(paragraph => {
            paragraph.addEventListener('click', function () {
                const audio = document.querySelector('audio');
                if (!audio.isRequestPending) {
                    audio.currentParagraphIndex = parseInt(paragraph.getAttribute('data-paragraph-id')) - 1;
                    audio.playParagraphAudio(paragraph);
                }
            });
        });
    }

    prevChapterButton.addEventListener('click', function () {
        if (currentChapterIndex > 0) {
            currentChapterIndex--;
            renderChapter(currentChapterIndex);
        }
    });

    nextChapterButton.addEventListener('click', function () {
        if (currentChapterIndex < chapters.length - 1) {
            currentChapterIndex++;
            renderChapter(currentChapterIndex);
        }
    });

    renderChapter(currentChapterIndex);
});
