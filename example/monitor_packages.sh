#!/usr/bin/env bash
while true
do
  fswatch -o ../packages/** | sh copy_packages.sh
done
