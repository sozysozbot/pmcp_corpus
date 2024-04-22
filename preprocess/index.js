const fs = require('fs');
const corpus = fs.readFileSync('corpus.tsv', 'utf8').split(/\r\n|\n/).map(line => {
  const [source, pmcp, direct_ja, ja, en] = line.split('\t');
  return { source, pmcp: pmcp.toLowerCase(), direct_ja, ja, en };
});

const links = fs.readFileSync('links.tsv', 'utf8').split(/\r\n|\n/).map(line => {
  const [source, ...links] = line.split('\t');

  // Remove the trailing empty strings
  while (links[links.length - 1] === '') {
    links.pop();
  }

  return { source, links };
});

const linkMap = links.reduce((acc, { source, links }) => {
  acc[source] = links;
  return acc;
}, {});

fs.writeFileSync('../docs/corpus.js', `/* AUTOMATICALLY GENERATED. DO NOT EDIT MANUALLY */
const CORPUS = ${JSON.stringify(corpus, null, 2)};`);
fs.writeFileSync('../docs/linkMap.js', `/* AUTOMATICALLY GENERATED. DO NOT EDIT MANUALLY */
const HYPERLINKS = ${JSON.stringify(linkMap, null, 2)};`);
