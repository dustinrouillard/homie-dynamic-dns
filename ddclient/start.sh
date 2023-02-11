#!/bin/sh

set -e

echo "verbose=${DDCLIENT_CONF_VERBOSE:-yes}
foreground=yes
daemon=${DDCLIENT_CONF_DAEMON:-1800}
ssl=${DDCLIENT_CONF_SSL:-yes}
daemon=1m
syslog=yes
ssl=yes
use=web
web=https://ip.dstn.to/raw/
protocol=changeip
max-interval=28d
login=${HOMIE_RECORD_ID}
password='${HOMIE_ACCESS_TOKEN}'
server=dns.homie.sh
${HOMIE_RECORD_NAME}.homie.sh" > /etc/ddclient/ddclient.conf

ddclient