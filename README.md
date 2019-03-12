# POAP
The Proof of Attendance Protocol - an EthDenver & ETHParis 2019 hack

# What is this?
Check out our cool explainer on the official POAP Website: https://www.poap.xyz/

# How do I set up a self-claim node?

Our suggested way of allowing event attendees to claim badges is to use 
our claimer Dapp and host it within your event's local WiFi network. Read on
for more detailed instructions.

## Set up an environment

For the time being the easiest way to do this is to set up a virtual 
environment on any computer at the event, connect it to the WiFi and run
the claimer Dapp from there.

A very simple way to do this is to use vagrant:

```
$ vagrant init ubuntu/bionic64
```

Edit your ``Vagrantfile`` and uncomment the ```public_network``` line to get 
bridged networking for your virtual environment. This allows it to be accessible
within the WiFi network.

Start your environment and log in to continue with the setup.
```
$ vagrant up
$ vagrant ssh
```

## Install yarn & co

Within the environment:
```
$ sudo apt-get remove cmdtest
$ sudo apt-get install build-essential nodejs ifupdown
$ curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
$ echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
$ sudo apt-get update
$ sudo apt-get install yarn
```

## Grab the claimer code and configure it

```
$ git clone https://github.com/gomox/poap.git
$ cd poap/claimer
```

Next edit ```claimer/routes/claim.js``` to add the private key of a wallet that
needs enough gas funding to mint people's tokens (the claimer as currently implemented
is gasless for users to reduce friction in getting badges, at a small cost to the organizer).

## Run your server

```
$ yarn 
$ sudo yarn start
```
