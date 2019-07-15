ORG = mangoweb
REPO = mango-cli
TAG = latest

all: build publish

build: Dockerfile
	docker build --build-arg VERSION=$(TAG) -t $(REPO):$(TAG) .

publish: Dockerfile
	docker tag $(REPO):$(TAG) $(ORG)/$(REPO):$(TAG)
	docker push $(ORG)/$(REPO):$(TAG)
