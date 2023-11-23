FROM golang:1.21 AS build

COPY go.mod /src/go.mod
COPY go.sum /src/go.sum

WORKDIR /src

RUN go mod download

COPY . /src

RUN CGO_ENABLED=0 go build -o agent-configurator-backend .

FROM ubi8/ubi-micro
COPY --from=build /src/agent-configurator-backend .
EXPOSE 8080
CMD ./agent-configurator-backend
