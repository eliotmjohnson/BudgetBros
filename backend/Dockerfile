FROM --platform=${BUILDPLATFORM} rust:latest AS build

WORKDIR /app

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    clang llvm-dev

COPY . .
RUN cargo build --locked --release && \
    cp ./target/release/budget-bros-backend /bin/server

FROM --platform=${TARGETARCH} debian:bookworm-slim AS final

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    libssl3 && \
    rm -rf /var/lib/apt/lists/*

ARG UID=10001
RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/nonexistent" \
    --shell "/sbin/nologin" \
    --no-create-home \
    --uid "${UID}" \
    appuser
USER appuser

COPY --from=build /bin/server /bin/

EXPOSE 8080

CMD ["/bin/server"]

