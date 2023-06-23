#!/usr/bin/env bash

set -e

echo "base artifact to compare with path path $1"
echo "artifact path: $2"

NEW_SIZE_RES=$(curl $2 -sI | grep -i Content-Length)
OLD_SIZE_RES=$(curl $1 -sI | grep -i Content-Length)

NEW_SIZE=${NEW_SIZE_RES/"content-length: "/""}
OLD_SIZE=${OLD_SIZE_RES/"content-length: "/""}

OLD_SIZE_FORMATTED="$((${OLD_SIZE//[ $'\001'-$'\037']}))"
NEW_SIZE_FORMATTED="$((${NEW_SIZE//[ $'\001'-$'\037']}))"

MAX_ALLOWED_SIZE=$(echo "$OLD_SIZE_FORMATTED * $3" | bc)

echo "new size:$NEW_SIZE"
echo "old size:$OLD_SIZE"
echo "max allowed size increase coefficient $3"
echo "max allowed size: $MAX_ALLOWED_SIZE"

result=$(echo "$NEW_SIZE_FORMATTED < $MAX_ALLOWED_SIZE" | bc)

# # if you have considerably more, there is a chance that you accidentally included
# # parts of code that shouldn't be in this build.
if [[ "$result" -eq 1 ]]
then
    echo "size seems ok"
else   
    echo "suspiciously large build detected!"
    exit 1;
fi

# https://gitlab.com/satoshilabs/trezor/trezor-suite/-/jobs/4530912073/artifacts/raw/packages/connect-web/build/trezor-connect.js?inline=false
# https://gitlab.com/api/v4/projects/14570634/jobs/artifacts/check-build-size/raw/packages/connect-web/build/trezor-connect.js?job=connect-web%20build
# https://gitlab.com/api/v4/projects/<project-id>/jobs/artifacts/main          /raw/review/index.html?job=build

# /projects/:id/jobs/:job_id/artifacts/*artifact_path
# https://gitlab.com/api/v4/projects/14570634/jobs/artifacts/check-build-size/raw/packages/connect-web/build/trezor-connect.js?job=connect-web%20build

