#!/bin/bash

_WaitCmdSuccess()
{
    # Wait for a command to succeed
    #
    # Usage: _WaitCmd command message max-loop
    local cmd="$1"
    local message="$2"
    local max="$3"

    declare -i i
    local i=0
    while ! eval $cmd ; do
        # Print something each time through the loop.
        if [ "$i" == 0 ]; then
            printf "$message"
        else
            printf "."
        fi

        # Give up after the max number of iterations.
        ((i++))
        if [ "$i" -gt "$max" ]; then
            echo " timeout"
            return 1
        fi

        # Delay and try again
        sleep 3
    done

    if [ "$i" -gt 0 ]; then
        echo ""
    fi
    return 0
}

set -ev

if [ "$TRAVIS_BRANCH" == "master" ] && [ "$TRAVIS_PULL_REQUEST" == "false" ]; then
    sudo apt-get update -qq
    sudo apt-get install -y -qq dnsmasq iptables openvpn lcov
    sudo pip install awscli

    if [ "$OPENVPN_AWS_ACCESS_KEY_ID" ]
    then
        echo "Override AWS_ACCESS_KEY_ID"
        export AWS_ACCESS_KEY_ID=$OPENVPN_AWS_ACCESS_KEY_ID
    fi
    if [ "$OPENVPN_AWS_SECRET_ACCESS_KEY" ]
    then
        echo "Override AWS_SECRET_ACCESS_KEY"
        export AWS_SECRET_ACCESS_KEY=$OPENVPN_AWS_SECRET_ACCESS_KEY
    fi

    sudo iptables -t nat -A POSTROUTING -o tun0 -j MASQUERADE

    aws configure set default.s3.signature_version s3v4
    aws s3 cp s3://external-certs/Certs/builder02.newstore.io client.ovpn
    touch ovpn.log
    sudo openvpn client.ovpn > ovpn.log 2>&1 &
    set +e
    _WaitCmdSuccess "grep 'Initialization Sequence Completed' ovpn.log >/dev/null 2>&1 && curl -I http://sonarqube.newstore.io >/dev/null 2>&1" "Waiting for successful connection to sonarqube " 60
    cat ovpn.log
    
    make sonar-upload
fi
