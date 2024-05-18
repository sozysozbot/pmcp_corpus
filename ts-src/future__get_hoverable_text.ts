/**
 * getHoverableText("pi", {
 *  headword: "pi",
 *  part_of_speech: "文接続詞",
 *  content: "～して、～したが、～すると"
 * })
 * returns 
 * 
<span class="hover-text">
    <span class="main-text">pi</span>
    <span class="tooltip-text bottom-tooltip-text">
        <span class="tooltip-headword">PI</span>
        <span class="tooltip-pronunciation" lang="ja">［ピ］</span>
        <br>
        <span class="tooltip-word-description" lang="ja">
            <span class="tooltip-part-of-speech">文接続詞</span>
            ～して、～したが、～すると
        </span>
    </span>
</span>
 */
function getHoverableText(lemma: "pi", description: { headword: "pi", part_of_speech: "文接続詞", content: "～して、～したが、～すると" }) {
    const hover_text = document.createElement("span");
    hover_text.classList.add("hover-text");
    {
        const main_text = document.createElement("span");
        main_text.classList.add("main-text");
        main_text.textContent = lemma;
        hover_text.appendChild(main_text);
    }
    {
        const tooltip = document.createElement("span");
        tooltip.classList.add("tooltip-text", "bottom-tooltip-text");
        {
            const headword = document.createElement("span");
            headword.classList.add("tooltip-headword");
            headword.appendChild(document.createTextNode(description.headword.toUpperCase()));
            tooltip.appendChild(headword);
        }
        {
            const pronunciation = document.createElement("span");
            pronunciation.classList.add("tooltip-pronunciation");
            pronunciation.lang = "ja";
            pronunciation.appendChild(
                document.createTextNode(`［${to_kana(description.headword)}］`)
            );
            tooltip.appendChild(pronunciation);
        }
        tooltip.appendChild(document.createElement("br"));
        {
            const word_description = document.createElement("span");
            word_description.classList.add("tooltip-word-description");
            word_description.lang = "ja";
            {
                const part_of_speech = document.createElement("span");
                part_of_speech.classList.add("tooltip-part-of-speech");
                part_of_speech.appendChild(document.createTextNode(description.part_of_speech));
                word_description.appendChild(part_of_speech);
            }
            word_description.appendChild(document.createTextNode(description.content));
            tooltip.appendChild(word_description);
        }
        hover_text.appendChild(tooltip);
    }
    return hover_text;
}