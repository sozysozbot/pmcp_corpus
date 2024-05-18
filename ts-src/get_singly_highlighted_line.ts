
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
    const tokens = tokenize(o.full_text);
    console.log(tokens);
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

type Token = { kind: "pmcp-word", content: string }
    | { kind: "other-plain-char", content: string }
    | { kind: "problematic-brace", content: string }
    ;

function tokenize(full_text: string): Token[] {
    const ans: Token[] = [];
    type TokenizerState = { kind: "handling-word", current_word: string }
        | { kind: "inside-brace", depth: number, content: string };
    let state: TokenizerState = { kind: "handling-word", current_word: "" };
    const chars = [...full_text];
    for (const c of chars) {
        switch (state.kind) {
            case "handling-word": {
                if (c === '{') {
                    if (state.current_word !== "") {
                        ans.push({ kind: "pmcp-word", content: state.current_word });
                    }
                    state = { kind: "inside-brace", depth: 1, content: "{" };
                } else if (c === '}') {
                    throw new Error(`Unexpected closing } encountered while handling words. The full text is:\n\n${full_text}`);
                } else if (/[a-zA-Z]/.exec(c)) { // word character
                    state.current_word += c;
                } else { // other character; word ends
                    if (state.current_word !== "") {
                        ans.push({ kind: "pmcp-word", content: state.current_word });
                    }
                    ans.push({ kind: "other-plain-char", content: c });
                    state = { kind: "handling-word", current_word: "" };
                }
            } break;
            case "inside-brace": {
                if (c === '{') {
                    state = { kind: "inside-brace", depth: state.depth + 1, content: state.content + "{" };
                } else if (c === '}') {
                    if (state.depth === 1) {
                        ans.push({ kind: "problematic-brace", content: state.content + "}" });
                        state = { kind: "handling-word", current_word: "" };
                    } else {
                        state = { kind: "inside-brace", depth: state.depth - 1, content: state.content + "}" };
                    }
                } else {
                    state.content += c;
                }
            } break;
            default: state satisfies never; throw new Error("unreachable");
        }
    }

    if (state.kind === "handling-word") {
        if (state.current_word !== "") {
            ans.push({ kind: "pmcp-word", content: state.current_word });
        }
    } else if (state.kind === "inside-brace") {
        throw new Error(`Closing } not encountered. The full text is:\n\n${full_text}`)
    } else {
        state satisfies never; throw new Error("unreachable");
    }

    return ans;
}

function handle_brace(innerHTML: string) {
    // This is a brutal hack that can potentially destroy the DOM structure, but who cares?
    return innerHTML.replaceAll(/(\{[\s\S]*?\})/g, "<span class='problematic_brace'>$1</span>");
}

function handle_pi(innerHTML: string) {
    // This is a brutal hack that can potentially destroy the DOM structure, which will surely bite me in the future
    return innerHTML.replaceAll(/\bpi\b/g, `<span class="hover-text"><span class="main-text">pi</span><span class="tooltip-text bottom-tooltip-text"><span class="tooltip-headword">PI</span><span class="tooltip-pronunciation" lang="ja">［ピ］</span><br><span class="tooltip-word-description" lang="ja"><span class="tooltip-part-of-speech">文接続詞</span>～して、～したが、～すると</span></span></span>`);
}
