#!/bin/bash
for file in prefix*;
do
    mv "$file" "${file#D07A_}"
done
