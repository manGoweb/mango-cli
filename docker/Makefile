_: build

IMAGE := mango-cli
ECR := 831119889470.dkr.ecr.eu-west-1.amazonaws.com

build:
	docker build -t ${IMAGE} .

aws: aws-tag aws-push
aws-tag:
	docker tag ${IMAGE}:latest ${ECR}/${IMAGE}:latest
aws-push:
	docker push ${ECR}/${IMAGE}:latest

dockerhub: dockerhub-tag dockerhub-push
dockerhub-tag:
	docker tag ${IMAGE}:latest mangoweb/${IMAGE}:latest
dockerhub-push:
	docker push mangoweb/${IMAGE}:latest


.PHONY: build aws aws-tag aws-push dockerhub dockerhub-tag dockerhub-push
