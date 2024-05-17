
/**
 * The basic functionality is to highlight the matched portion.
 * That is, we want
 * 
 *  <div>icco <strong class="matched-portion">cecnutit</strong> lata pi lata cecnutit icco</div>
 * 
 * However, the tricky thing is that
 * - anything between an `{` and a `}` should be given a special font
 * - we also want to add tooltips to each word
 * 
 * which makes the whole thing so much trickier.
 

- 検索ハイライトは単に背景色がつくだけであり、その背景色付与は単一の HTML タグによって行わなくてもよい
- 単語ツールチップは単一タグで行うことがマスト
- 波カッコ内部においては単語ツールチップが出ることはないが、検索ハイライトはつく


ということで、設計はこうあるべき：

テキストは「単語」と「非単語」に分けられる
- 「非単語」はパンクチュエーションやスペースや燐字や波カッコ

マッチがゼロ幅であれば：
    「非単語」の一種としてカーソル用の空 span を配置すればよい

そうでなければ：
    各文字はハイライトされるかどうかの 2 値を持つ。これは「単語」と「非単語」に分けられたやつとは独立に作用する。

 */
function getSinglyHighlightedLine(o: { full_text: string, beginIndex: number, endIndex: number, match: string }) {
    const single_line = document.createElement("div");

    const beforeMatch = document.createTextNode(o.full_text.slice(0, o.beginIndex));
    const matchedPortion = document.createElement("strong");
    matchedPortion.classList.add("matched-portion");
    if (o.beginIndex === o.endIndex) {
        matchedPortion.classList.add("zero-width");
    }
    matchedPortion.textContent = o.match;
    const afterMatch = document.createTextNode(o.full_text.slice(o.endIndex));

    single_line.appendChild(beforeMatch);
    single_line.appendChild(matchedPortion);
    single_line.appendChild(afterMatch);

    // To account for the {} part, I'll brutally edit the resulting innerHTML:
    // To add text tooltip to `PI`, I'll brutally edit the resulting innerHTML:
    single_line.innerHTML = handle_pi(handle_brace(single_line.innerHTML));
    return single_line;
}

function handle_brace(innerHTML: string) {
    // This is a brutal hack that can potentially destroy the DOM structure, but who cares?
    return innerHTML.replaceAll(/(\{[\s\S]*?\})/g, "<span class='problematic_brace'>$1</span>");
}

function handle_pi(innerHTML: string) {
    // This is a brutal hack that can potentially destroy the DOM structure, which will surely bite me in the future
    return innerHTML.replaceAll(/\bpi\b/g, `<span class="hover-text"><span class="main-text">pi</span><span class="tooltip-text bottom-tooltip-text"><span class="tooltip-headword">PI</span><span class="tooltip-pronunciation" lang="ja">［ピ］</span><br><span class="tooltip-word-description" lang="ja"><span class="tooltip-part-of-speech">文接続詞</span>～して、～したが、～すると</span></span></span>`);
}
