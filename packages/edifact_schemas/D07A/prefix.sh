#!/bin/bash
while IFS= read -r -d '' filename; do
  mv "$filename" "${filename#D07A_}"
done < <(find . -type f -name 'D07A_*' -print0)
