#!/bin/sh
# setting up the project hooks
echo "setting up project"

echo "getting submodules"

git submodule update --recursive --remote

echo "copying hooks to git hooks"

cp hooks/pre-commit .git/hooks/pre-commit

echo "hooks copied"

echo "project setup happy coding"
