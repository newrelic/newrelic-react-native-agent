FROM node:10.16.3-jessie
RUN apt-get update
RUN apt-get install -y rsync zip jq
RUN npm i -g npm@latest
RUN npm set audit false -g
RUN npm set loglevel=error
RUN npm set set progress=false -g
RUN npm set @datanerd:registry=https://pdx-artifacts.pdx.vm.datanerd.us/api/npm/newrelic-mobile-rn/ -g
