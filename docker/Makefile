_: build

build:
	docker build -t mango-cli .

aws: aws-tag aws-push
aws-tag:
	docker tag mango-cli:latest 831119889470.dkr.ecr.eu-west-1.amazonaws.com/mango-cli:latest
aws-push:
	docker push 831119889470.dkr.ecr.eu-west-1.amazonaws.com/mango-cli:latest

dockerhub: dockerhub-tag dockerhub-push
dockerhub-tag:
	docker tag mango-cli:latest mangoweb/mango-cli:latest
dockerhub-push:
	docker push mangoweb/mango-cli:latest


.PHONY: build aws aws-tag aws-push dockerhub dockerhub-tag dockerhub-push
