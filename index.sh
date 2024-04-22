#!/bin/bash

############################################
# 1. DOWNLOAD
############################################
# 「【ついにやる】東島通商語の蒐集」をダウンロード
wget --output-file="./preprocess/logs.csv" "https://docs.google.com/spreadsheets/d/1XjlK42tfTCrBegQUiv974qlC1XqrnNUbp43UJx1Qv8w/export?format=tsv&gid=0" -O "./preprocess/corpus.tsv"

wget --output-file="./preprocess/logs2.csv" "https://docs.google.com/spreadsheets/d/1XjlK42tfTCrBegQUiv974qlC1XqrnNUbp43UJx1Qv8w/export?format=tsv&gid=312538559" -O "./preprocess/links.tsv"


############################################
# 2. PREPROCESS
############################################
cd preprocess
node index.js