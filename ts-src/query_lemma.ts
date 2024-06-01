const words = WORDS.filter(w => !w.目録から排除);

const normalize_word = (w: Word) =>
    w.語.toLowerCase()
        .replaceAll(/-leti\b(?!-)/g, "leti");
/* ハイフン + leti の後に語境界があって、そしてハイフンが直後に後続しないなら、前の単語とくっつける */

// 実際には無い語形も登場する、緩めのリスト
const loose_list = words
    .map(normalize_word)
    .flatMap(phrase => phrase.split(/[^a-z]/))
    .flatMap(word => {
        if (word.endsWith("it") && word.length > 2) {
            return [word, word.slice(0, -2)];
        } else if (word !== "moleti" && word.endsWith("leti") && word.length > 4) {
            return [word, word.slice(0, -4)];
        } else {
            return [word];
        }
    })
    ;

loose_list.sort();

function queryLemma(word: string, allow_strip: boolean): Word | null {
    if (allow_strip) {
        if (word.endsWith("it") && word.length > 2 && queryLemma(word.slice(0, -2), false)) {
            return queryLemma(word.slice(0, -2), false);
        } else if (word !== "moleti" && word.endsWith("leti") && word.length > 4 && queryLemma(word.slice(0, -4), false)) {
            return queryLemma(word.slice(0, -4), false);
        }
    }

    if (
        loose_list.indexOf(word) !== loose_list.lastIndexOf(word)
    ) {
        // not unique; not yet handlable
        return null;
    } else {
        const filtered = words.filter(w => normalize_word(w).split(/[^a-z]/).includes(word));
        if (filtered.length > 0) {
            return filtered[0];
        }
    }
    return null;
}

function getHighlightableWords(full_text: string) {
    const highlightable: string[] = [];
    const non_highlightable: string[] = [];
    const tokens = tokenize(full_text);
    for (const tok of tokens) {
        if (tok.kind === "pmcp-word") {
            const query_res = queryLemma(tok.content, true);
            if (query_res) {
                highlightable.push(tok.content);
            } else {
                non_highlightable.push(tok.content);
            }
        }
    }
    return { highlightable, non_highlightable };
}