"use strict";
/**
 * getHoverableText(["pi"], {
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
            <span class="tooltip-translation">～して、～したが、～すると</span>
        </span>
    </span>
</span>
 */
function getHoverableText(maybe_highlighted_lemma, description) {
    const fragment = document.importNode(document.querySelector("#hoverable-text-template").content, true);
    fragment.querySelector(".main-text").textContent = "";
    fragment.querySelector(".main-text").append(...maybe_highlighted_lemma);
    fragment.querySelector(".tooltip-headword").textContent = description.headword.toUpperCase();
    fragment.querySelector(".tooltip-pronunciation").textContent = `［${to_kana(description.headword)}］`;
    fragment.querySelector(".tooltip-part-of-speech").textContent = description.part_of_speech;
    fragment.querySelector(".tooltip-translation").textContent = description.content;
    const hover_text = document.createElement("span");
    hover_text.classList.add("hover-text");
    hover_text.append(fragment);
    return hover_text;
}
