#!/bin/bash

# ensure the variables required by this script are set
check_variable_is_set(){
    if [[ -z ${!1} ]]; then
        echo "$1 must be set and non empty"
        exit 1
    fi
}

check_variable_is_set BIN_DIR
check_variable_is_set GH_WRITE_TOKEN

# download the deployment script(s)
mkdir -p ${BIN_DIR}
rm -rf ${BIN_DIR}/deployment-scripts
mkdir ${BIN_DIR}/deployment-scripts

curl -H "Authorization: token ${GH_WRITE_TOKEN}" -s https://api.github.com/repos/DepartmentOfHealth-htbhf/htbhf-deployment-scripts/releases/latest \
| grep zipball_url \
| cut -d'"' -f4 \
| wget -qO deployment-scripts.zip -i -

unzip deployment-scripts.zip
mv -f DepartmentOfHealth-htbhf-htbhf-deployment-scripts-*/* ${BIN_DIR}/deployment-scripts
rm -rf DepartmentOfHealth-htbhf-htbhf-deployment-scripts-*
rm deployment-scripts.zip

export SCRIPT_DIR=${BIN_DIR}/deployment-scripts

# define the space to deploy to
export CF_SPACE=development

# run the deployment script
/bin/bash ${SCRIPT_DIR}/deploy.sh
