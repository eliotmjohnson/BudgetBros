# syntax=docker/dockerfile:1.4

ARG RUST_VERSION=1.78.0
ARG APP_NAME=budget-bros-backend

################################################################################
# Create a stage for building the application.

FROM --platform=linux/amd64 rust:${RUST_VERSION}-slim AS build
ARG APP_NAME
WORKDIR /app

# Install build dependencies, including OpenSSL and LLVM for bindgen.
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    clang pkg-config libssl-dev llvm-15-dev libclang-15-dev && \
    rm -rf /var/lib/apt/lists/*

# Set PKG_CONFIG_PATH and LIBCLANG_PATH for OpenSSL and libclang
ENV PKG_CONFIG_PATH=/usr/lib/x86_64-linux-gnu/pkgconfig
ENV LIBCLANG_PATH=/usr/lib/llvm-15/lib

# Verify if libclang is available
RUN ldconfig -p | grep libclang || true

# Build the application.
COPY . .
RUN cargo build --locked --release && \
    cp ./target/release/$APP_NAME /bin/server

################################################################################
# Create a new stage for running the application with minimal runtime dependencies.

FROM --platform=linux/amd64 debian:bookworm-slim AS final

# Install OpenSSL runtime libraries (OpenSSL 3).
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    libssl3 ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Create a non-privileged user for the application.
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

# Copy the executable from the "build" stage.
COPY --from=build /bin/server /bin/

# Expose the port that the application listens on.
EXPOSE 8080

# Command to run the application.
CMD ["/bin/server"]
