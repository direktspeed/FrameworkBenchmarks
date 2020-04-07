FROM couchbase:latest
# Only needed during first-time setup:
RUN sudo apt-get install build-essential python-dev python-pip
RUN sudo -H pip install couchbase