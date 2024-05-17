"use strict";
let controller = null;
const isError = (a) => a instanceof Error;
const isAbortError = (err) => err.name === 'AbortError';
async function display_result() {
    // If there's an ongoing task, cancel it
    if (controller) {
        controller.abort();
    }
    // Create a new controller for the new task
    controller = new AbortController();
    const signal = controller.signal;
    const search_string = document.getElementById("search-bar").value;
    if (search_string === "") {
        document.getElementById("search-count").style.visibility = "hidden";
        document.getElementById("results-section").textContent = "東島通商語コーパス検索システム「ビシェ」へようこそ。";
        document.getElementById("search-bar").style.backgroundColor = "#ffffff";
        return;
    }
    document.getElementById("search-count").style.visibility = "visible";
    try {
        let items;
        try {
            items = get_matches(search_string);
        }
        catch (e) {
            // RegExp compilation failed
            document.getElementById("search-count").textContent = "正規表現の構文エラーです。";
            document.getElementById("search-bar").style.backgroundColor = "#ffaaaa";
            return;
        }
        document.getElementById("search-bar").style.backgroundColor = "#ffffff";
        const search_count = items.map(item => item.matched_portions.length).reduce((a, b) => a + b, 0);
        document.getElementById("search-count").textContent = search_count === 0 ? "見つかりませんでした。" : search_count + " 個見つかりました。";
        /*
        Each item is of the following form:
        {"item":{"source":"プロパガンダかるた","pmcp":"icco cecnutit lata pi lata cecnutit icco","direct_ja":"","ja":"国が人を守り、人が国を守る","en":""},"matched_portions":[{"match":"cecnutit","beginIndex":5,"endIndex":13},{"match":"cecnutit","beginIndex":27,"endIndex":35}]}
    
        I would like to turn this into
        <div class="searched-item">
            <div class="corpus-text">icco <strong class="matched-portion">cecnutit</strong> lata pi lata cecnutit icco</div>
            <div class="translation-ja">国が人を守り、人が国を守る</div>
          </div>
          <div class="searched-item">
            <div class="corpus-text">icco cecnutit lata pi lata <strong class="matched-portion">cecnutit</strong> icco</div>
            <div class="translation-ja">国が人を守り、人が国を守る</div>
          </div>
        */
        document.getElementById("results-section").innerHTML = "";
        for (const item of items) {
            // Check if the task has been cancelled
            if (signal.aborted) {
                throw new Error("cancelled");
            }
            const { pmcp: pmcp_text, ja, direct_ja, en } = item.item;
            const { matched_portions } = item;
            const kana = (() => {
                try {
                    return kana_words(pmcp_text);
                }
                catch (e) {
                    return "";
                }
            })();
            const div = document.createElement("div");
            div.className = "searched-item";
            div.appendChild(getCorpusTextElement(pmcp_text, matched_portions));
            if (kana != "") {
                const transliteration = document.createElement("div");
                transliteration.textContent = kana;
                transliteration.style.fontSize = "90%";
                transliteration.style.color = "#424242";
                div.appendChild(transliteration);
                div.appendChild(document.createElement("hr"));
            }
            const translationJa = document.createElement("div");
            translationJa.className = "translation-ja";
            translationJa.textContent = ja;
            div.appendChild(translationJa);
            if (direct_ja !== "") {
                const translationJaDirect = document.createElement("div");
                translationJaDirect.className = "translation-ja-direct";
                translationJaDirect.textContent = direct_ja;
                div.appendChild(translationJaDirect);
            }
            if (en !== "") {
                const translationEn = document.createElement("div");
                translationEn.className = "translation-en";
                translationEn.textContent = en;
                div.appendChild(translationEn);
            }
            div.appendChild(document.createElement("hr"));
            const details = document.createElement("details");
            const summary = document.createElement("summary");
            const source_signifier = item.item.source;
            if (!is_valid_source(source_signifier)) {
                throw new Error(`Invalid source signifier: ${source_signifier}`);
            }
            summary.textContent = `出典: ${source_signifier}`;
            details.appendChild(summary);
            const ul = document.createElement("ul");
            details.appendChild(ul);
            const links = HYPERLINKS[source_signifier] ?? [];
            for (const url of links) {
                const a = document.createElement("a");
                a.href = url;
                a.textContent = url;
                a.target = "_blank";
                const li = document.createElement("li");
                li.appendChild(a);
                ul.appendChild(li);
            }
            div.appendChild(details);
            document.getElementById("results-section").appendChild(div);
            await new Promise(resolve => setTimeout(resolve, 0));
        }
    }
    catch (e) {
        if (isError(e)) {
            if (isAbortError(e)) {
                // Do nothing
            }
            else {
                throw e;
            }
        }
        else {
            throw e;
        }
    }
}
/**
 * The basic functionality is to highlight the matched portion.
 * That is, we want
 *
 *  <div class="corpus-text">icco <strong class="matched-portion">cecnutit</strong> lata pi lata cecnutit icco</div>
 *
 * However, the tricky thing is that
 * - anything between an `{` and a `}` should be given a special font
 * - we also want to add tooltips to each word
 *
 * which makes the whole thing so much trickier.
 */
function getCorpusTextElement(pmcp_text, matched_portions) {
    const corpusText = document.createElement("div");
    if (!location.href.includes("search_")) {
        corpusText.style.fontFamily = "rounded";
    }
    corpusText.className = "corpus-text";
    for (const { match, beginIndex, endIndex } of matched_portions) {
        const internal_div = document.createElement("div");
        const beforeMatch = document.createTextNode(pmcp_text.slice(0, beginIndex));
        const matchedPortion = document.createElement("strong");
        matchedPortion.classList.add("matched-portion");
        if (beginIndex === endIndex) {
            matchedPortion.classList.add("zero-width");
        }
        matchedPortion.textContent = match;
        const afterMatch = document.createTextNode(pmcp_text.slice(endIndex));
        internal_div.appendChild(beforeMatch);
        internal_div.appendChild(matchedPortion);
        internal_div.appendChild(afterMatch);
        // To account for the {} part, I'll brutally edit the resulting innerHTML:
        internal_div.innerHTML = handle_brace(internal_div.innerHTML);
        corpusText.appendChild(internal_div);
        corpusText.appendChild(document.createElement("hr"));
    }
    return corpusText;
}
function handle_brace(str) {
    // This is a brutal hack that can potentially destroy the DOM structure, but who cares?
    return str.replaceAll(/(\{[\s\S]*?\})/g, "<span class='problematic_brace'>$1</span>");
}
