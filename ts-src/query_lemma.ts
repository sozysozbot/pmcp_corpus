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

function queryLemma(word: string, allow_strip: boolean): { kind: "ok", word: Word } | { kind: "err", msg: "KA" | "多" | "無" } {

    if (word === "kaleti") {
        /** 
         * kaleti「2つの」vs. ka「これ」（leti がスペース無しでよい特殊な名詞）の勝負で「2 つの」が勝ってしまって困るので、
         * とりあえずブロック
         *  */
        return { kind: "err", msg: "KA" };
    }

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
        return { kind: "err", msg: "多" };
    } else {
        const filtered = words.filter(w => normalize_word(w).split(/[^a-z]/).includes(word));
        if (filtered.length > 0) {
            return { kind: "ok", word: filtered[0] };
        }
    }
    return { kind: "err", msg: "無" };
}

