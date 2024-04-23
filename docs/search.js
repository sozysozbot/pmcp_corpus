function get_matches(regex_str) {
    return CORPUS.filter(item => item.pmcp.includes(regex_str)).map(item => {
        const matched_portions = [];
        /* 
        g - global 
        i - case insensitive
        d - get the indices */
        const myRe = new RegExp(regex_str, "gid");
        let myArray;
        while ((myArray = myRe.exec(item.pmcp)) !== null) {
            matched_portions.push({
                match: myArray[0],
                beginIndex: myArray.indices[0][0],
                endIndex: myRe.lastIndex
            });
        }
        return { item, matched_portions };
    });
}

async function display_result() {
    const search_string = document.getElementById("search-bar").value;

    if (search_string === "") {
        document.getElementById("search-count").style.visibility = "hidden";
        document.getElementById("results-section").textContent = "東島通商語コーパス検索システム「ビシェ」へようこそ。";
        return;
    }

    document.getElementById("search-count").style.visibility = "visible";


    const items = get_matches(search_string);

    const search_count = items.map(item => item.matched_portions.length).reduce((a, b) => a + b, 0);
    document.getElementById("search-count").textContent = search_count === 0 ? "見つかりませんでした。" : search_count + " 個見つかりました。"

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
        const { pmcp, ja } = item.item;
        const { matched_portions } = item;

        let result = pmcp;
        const div = document.createElement("div");
        div.className = "searched-item";

        const corpusText = document.createElement("div");
        corpusText.style.fontFamily = "rounded";
        corpusText.className = "corpus-text";
        for (const { match, beginIndex, endIndex } of matched_portions) {
            const beforeMatch = document.createTextNode(result.slice(0, beginIndex));
            const matchedPortion = document.createElement("strong");
            matchedPortion.className = "matched-portion";
            matchedPortion.textContent = match;
            const afterMatch = document.createTextNode(result.slice(endIndex));

            corpusText.appendChild(beforeMatch);
            corpusText.appendChild(matchedPortion);
            corpusText.appendChild(afterMatch);
            corpusText.appendChild(document.createElement("hr"));
        }
        div.appendChild(corpusText);

        const translationJa = document.createElement("div");
        translationJa.className = "translation-ja";
        translationJa.textContent = ja;
        div.appendChild(translationJa);

        div.appendChild(document.createElement("hr"));

        const details = document.createElement("details");
        const summary = document.createElement("summary");
        const source_signifier = item.item.source;
        summary.textContent = `出典: ${source_signifier}`;
        details.appendChild(summary);
        const ul = document.createElement("ul");
        details.appendChild(ul);
        const links = HYPERLINKS[source_signifier] ?? [];
        for (const url of links) {
            const a = document.createElement("a");
            a.href = url;
            a.textContent = url;
            const li = document.createElement("li");
            li.appendChild(a);
            ul.appendChild(li);
        }

        div.appendChild(details);

        document.getElementById("results-section").appendChild(div);
        await new Promise(resolve => setTimeout(resolve, 0));
    }
}

