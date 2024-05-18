"use strict";
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
function getSinglyHighlightedLine(o) {
    const tokens = tokenize(o.full_text);
    console.log(tokens);
    const single_line = document.createElement("div");
    for (const tok of tokens) {
        switch (tok.kind) {
            case "pmcp-word":
                {
                    if (tok.content === "pi") {
                        single_line.append(getHoverableText("pi", {
                            headword: "pi",
                            part_of_speech: "文接続詞",
                            content: "～して、～したが、～すると"
                        }));
                    }
                    else {
                        single_line.append(document.createTextNode(tok.content));
                    }
                }
                break;
            case "others":
                {
                    single_line.append(document.createTextNode(tok.content));
                }
                break;
            case "problematic-brace":
                {
                    const problematic_brace = document.createElement("span");
                    problematic_brace.classList.add('problematic_brace');
                    problematic_brace.textContent = tok.content;
                    single_line.appendChild(problematic_brace);
                }
                break;
            default: {
                tok;
                throw new Error("unreachable");
            }
        }
    }
    const beforeMatch = document.createTextNode(o.full_text.slice(0, o.beginIndex));
    const matchedPortion = document.createElement("strong");
    matchedPortion.classList.add("matched-portion");
    if (o.beginIndex === o.endIndex) {
        matchedPortion.classList.add("zero-width");
    }
    matchedPortion.textContent = o.match;
    const afterMatch = document.createTextNode(o.full_text.slice(o.endIndex));
    //  single_line.appendChild(beforeMatch);
    //  single_line.appendChild(matchedPortion);
    //  single_line.appendChild(afterMatch);
    // To account for the {} part, I'll brutally edit the resulting innerHTML:
    // To add text tooltip to `PI`, I'll brutally edit the resulting innerHTML:
    //  single_line.innerHTML = handle_pi(handle_brace(single_line.innerHTML));
    return single_line;
}
function tokenize(full_text) {
    const ans = [];
    let state = { kind: "handling-word", current: "" };
    for (let i = 0; i < full_text.length; i++) {
        // Since we will be using regex's index, we need the surrogate pair to be separated
        const c = full_text[i];
        switch (state.kind) {
            case "handling-word":
                {
                    if (c === '{') {
                        if (state.current !== "") {
                            ans.push({ kind: "pmcp-word", content: state.current });
                        }
                        state = { kind: "inside-brace", depth: 1, content: "{" };
                    }
                    else if (c === '}') {
                        throw new Error(`Unexpected closing } encountered while handling words. The full text is:\n\n${full_text}`);
                    }
                    else if (/[a-zA-Z]/.exec(c)) { // word character
                        state.current += c;
                    }
                    else { // other character; word ends
                        if (state.current !== "") {
                            ans.push({ kind: "pmcp-word", content: state.current });
                        }
                        state = { kind: "handling-others", current: c };
                    }
                }
                break;
            case "handling-others":
                {
                    if (c === '{') {
                        if (state.current !== "") {
                            ans.push({ kind: "others", content: state.current });
                        }
                        state = { kind: "inside-brace", depth: 1, content: "{" };
                    }
                    else if (c === '}') {
                        throw new Error(`Unexpected closing } encountered while handling words. The full text is:\n\n${full_text}`);
                    }
                    else if (/[a-zA-Z]/.exec(c)) { // word character; word begins
                        if (state.current !== "") {
                            ans.push({ kind: "others", content: state.current });
                        }
                        state = { kind: "handling-word", current: c };
                    }
                    else { // other character;
                        state.current += c;
                    }
                }
                break;
            case "inside-brace":
                {
                    if (c === '{') {
                        state = { kind: "inside-brace", depth: state.depth + 1, content: state.content + "{" };
                    }
                    else if (c === '}') {
                        if (state.depth === 1) {
                            ans.push({ kind: "problematic-brace", content: state.content + "}" });
                            state = { kind: "handling-word", current: "" };
                        }
                        else {
                            state = { kind: "inside-brace", depth: state.depth - 1, content: state.content + "}" };
                        }
                    }
                    else {
                        state.content += c;
                    }
                }
                break;
            default:
                state;
                throw new Error("unreachable");
        }
    }
    if (state.kind === "handling-word") {
        if (state.current !== "") {
            ans.push({ kind: "pmcp-word", content: state.current });
        }
    }
    else if (state.kind === "handling-others") {
        if (state.current !== "") {
            ans.push({ kind: "others", content: state.current });
        }
    }
    else if (state.kind === "inside-brace") {
        throw new Error(`Closing } not encountered. The full text is:\n\n${full_text}`);
    }
    else {
        state;
        throw new Error("unreachable");
    }
    return ans;
}
function handle_brace(innerHTML) {
    // This is a brutal hack that can potentially destroy the DOM structure, but who cares?
    return innerHTML.replaceAll(/(\{[\s\S]*?\})/g, "<span class='problematic_brace'>$1</span>");
}
function handle_pi(innerHTML) {
    // This is a brutal hack that can potentially destroy the DOM structure, which will surely bite me in the future
    return innerHTML.replaceAll(/\bpi\b/g, `<span class="hover-text"><span class="main-text">pi</span><span class="tooltip-text bottom-tooltip-text"><span class="tooltip-headword">PI</span><span class="tooltip-pronunciation" lang="ja">［ピ］</span><br><span class="tooltip-word-description" lang="ja"><span class="tooltip-part-of-speech">文接続詞</span>～して、～したが、～すると</span></span></span>`);
}
