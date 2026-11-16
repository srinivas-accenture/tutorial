/* Week 2: Production, operations and DCA — content only. Rendered by assets/js/render.js; loaded on demand by assets/js/app.js.
   The week revision sheet is built from each day's "rev" bullets. */
JSC.registerWeek({w:2,days:[
/* ===== Day 6 ===== */
{
  n: 6,
  title: "Production Docker",
  goal: `<b>By the end of today</b> you can build small, non-root, pinned and labelled production images; run them with sane CPU, memory, PID, restart, signal and logging settings; diagnose an exit code 137; and ship them through a registry with a tag strategy and a CI pipeline you can defend in an interview or on the DCA.`,
  rev: [
    `<b>Production images:</b> multi-stage builds; <code>-slim</code> (glibc) is the safe default for Python, Alpine is musl (wheel and DNS quirks), distroless/scratch remove the shell; run as a numeric non-root <code>USER</code>, <code>COPY --chown</code>; <code>HEALTHCHECK</code>; OCI labels; pin <code>FROM</code> by digest.`,
    `<b>Runtime:</b> <code>--memory</code> is a hard cap (exceed it → kernel OOM kill → exit 137, <code>.State.OOMKilled=true</code>); <code>--cpus</code> is a hard quota, <code>--cpu-shares</code> a relative weight under contention; <code>--pids-limit</code> stops fork bombs.`,
    `<b>Signals:</b> <code>docker stop</code> = SIGTERM, wait 10 s, SIGKILL. PID 1 ignores signals it has no handler for, so use exec-form <code>CMD</code>, <code>exec</code> in entrypoint scripts and <code>--init</code> (tini) for zombie reaping; set the stop timeout above your app's graceful timeout.`,
    `<b>Restart and logs:</b> <code>no</code> / <code>on-failure[:N]</code> / <code>always</code> / <code>unless-stopped</code> (differ after a manual stop + daemon restart). Log to stdout/stderr; <code>json-file</code> does not rotate by default; set <code>max-size</code>/<code>max-file</code> or use <code>local</code>.`,
    `<b>Registries:</b> name = <code>registry/namespace/repo:tag</code> (defaults <code>docker.io/library/…:latest</code>); log in with credential helpers; tag with semver + git SHA, deploy by immutable tag or digest, never <code>:latest</code>; <code>daemon.json</code> sets log driver, mirrors, insecure registries, data-root, live-restore and address pools; <code>docker context</code> targets remote engines.`
  ],
  topics: [
    {
      id: "d6-prod-images",
      title: "Production images: minimal bases, non-root and health checks",
      lv: ["mid", "senior", "lead", "dca"],
      eli5: `<p>Think of a <b>moving truck</b>. When you build furniture you need a whole workshop: saws, glue, sandpaper, offcuts. But when you move into your new apartment you only take the finished furniture. A production image is the moving truck: it should carry the finished app and nothing from the workshop.</p>
<p>The <b>multi-stage build</b> is the workshop and the truck in one plan: stage one has all the tools, stage two copies only the finished pieces. The <b>base image</b> is the truck itself: a big comfortable truck (full Debian) carries everything, a small van (slim, Alpine) is cheaper, and an empty trailer (distroless, scratch) has no seats, no radio and no toolbox, which is great until something breaks on the road.</p>
<p>Running as <b>non-root</b> is like giving the delivery driver a key to one apartment instead of the master key to the whole building. A <b>health check</b> is the driver phoning in every 30 seconds: "still alive, still delivering". <b>Pinning by digest</b> is writing down the truck's VIN, not just "a white van", so next month you get exactly the same truck.</p>`,
      what: `<p>A <b>production image</b> is an image designed for the runtime, not for development: it contains only what the process needs to run, runs as an unprivileged user, declares how to check its health, carries metadata that links it back to source, and is built from inputs that are pinned so the build can be repeated.</p>
<p><b>Multi-stage builds.</b> A Dockerfile can have several <code>FROM</code> lines. Each starts a new stage; only the last stage (or the one chosen with <code>--target</code>) becomes the image. Later stages copy artifacts from earlier ones with <code>COPY --from=&lt;stage&gt;</code>. Compilers, headers, <code>node_modules</code> used only for the build, pip caches and test tools stay behind. BuildKit (the default builder) also skips stages the target does not depend on and builds independent stages in parallel.</p>
<p><b>Choosing a base image.</b></p>
<ul class="pts">
<li><b>Full Debian/Ubuntu</b> (<code>python:3.12</code>, <code>node:22</code>): hundreds of MB, includes compilers and many libraries. Good for build stages, rarely for runtime.</li>
<li><b>Slim</b> (<code>python:3.12-slim</code>, <code>node:22-slim</code>): Debian with most packages removed. Uses <b>glibc</b>, so prebuilt <code>manylinux</code> Python wheels and most native npm binaries just work. The safe default for FastAPI.</li>
<li><b>Alpine</b> (<code>python:3.12-alpine</code>, <code>nginx:1.27-alpine</code>): very small (a few MB base), uses <b>musl libc</b> and BusyBox. Trade-offs: Python packages need <code>musllinux</code> wheels; where a project only publishes <code>manylinux</code> (glibc) wheels, pip compiles from source, which needs <code>gcc</code>, <code>musl-dev</code> and headers, makes builds slow and the image can end up bigger than slim. musl's DNS resolver behaves differently from glibc's (historically no TCP fallback for large responses before musl 1.2.4, different handling of <code>search</code>/<code>ndots</code> and of multiple nameservers), which has caused intermittent lookup failures, especially in Kubernetes. musl's default thread stack size and <code>malloc</code> performance also differ. Alpine is excellent for static binaries and Nginx serving a React build; think twice for Python with native dependencies.</li>
<li><b>Distroless</b> (for example <code>gcr.io/distroless/python3-debian12</code>, <code>gcr.io/distroless/static-debian12</code>, <code>…:nonroot</code> variants): only the runtime and its libraries; no shell, no package manager, no <code>ls</code>. Smaller attack surface and fewer CVEs to triage; debugging needs other tools (Day 8). Exec form is mandatory because there is no <code>/bin/sh</code>.</li>
<li><b>scratch</b>: the empty image. Only for fully static binaries (Go with <code>CGO_ENABLED=0</code>, Rust with musl). You must add CA certificates, <code>/etc/passwd</code> if you want a named user, and time-zone data yourself.</li>
<li>Hardened/minimal images from vendors (for example Docker Hardened Images, Chainguard, Ubuntu Chisel) follow the same idea; check their licensing and tag policies.</li>
</ul>
<p><b>Image optimisation</b> is mostly about layers and cache:</p>
<ul class="pts">
<li>Order instructions from least to most frequently changing: base, system packages, dependency manifest, dependency install, then source.</li>
<li>Install and clean up in the <b>same</b> <code>RUN</code> (<code>apt-get install --no-install-recommends … &amp;&amp; rm -rf /var/lib/apt/lists/*</code>); deleting in a later layer does not shrink the image, it only hides the file.</li>
<li>Use BuildKit cache mounts (<code>RUN --mount=type=cache,target=/root/.cache/pip</code>) so caches speed up rebuilds without being stored in the image.</li>
<li>Use a tight <code>.dockerignore</code> (<code>.git</code>, <code>node_modules</code>, <code>.env</code>, tests, local venvs) so the build context is small and secrets are not sent to the builder.</li>
<li>Inspect with <code>docker history</code>, <code>docker image ls</code> and tools like <code>dive</code> to find the layer that is unexpectedly large.</li>
</ul>
<p><b>Non-root.</b> By default the process runs as UID 0 inside the container. Without user-namespace remapping that is the same UID 0 as on the host, constrained only by capabilities, seccomp and LSMs. Create a user and switch with <code>USER</code>:</p>
<ul class="pts">
<li>Prefer a <b>numeric</b> UID:GID (<code>USER 10001:10001</code>). Kubernetes' <code>runAsNonRoot</code> can only verify a numeric user; a name requires reading <code>/etc/passwd</code> and a name that does not exist fails at start.</li>
<li>Files copied by <code>COPY</code> are owned by root unless you use <code>COPY --chown=10001:10001</code> (and optionally <code>--chmod=</code> with BuildKit). A separate <code>RUN chown -R</code> duplicates every file into a new layer and can double the image size.</li>
<li>Code should be owned by root and read-only to the app user; only directories the app must write (uploads, <code>/tmp</code>) should be writable. This means a compromised app cannot rewrite its own code.</li>
<li>Non-root cannot bind ports below 1024 on a normal host, but Docker sets <code>net.ipv4.ip_unprivileged_port_start=0</code> inside container network namespaces on current engines, so it usually works in containers; still, listening on 8000/8080 is simpler and portable.</li>
</ul>
<p><b>HEALTHCHECK</b> tells the engine how to probe the app: <code>HEALTHCHECK --interval=30s --timeout=3s --start-period=20s --retries=3 CMD …</code>. Exit 0 = healthy, 1 = unhealthy. The status moves <code>starting → healthy</code> or <code>unhealthy</code> after <code>retries</code> consecutive failures. Docker itself only <b>reports</b> health; it does not restart an unhealthy container. Compose uses it for <code>depends_on: condition: service_healthy</code>; Swarm replaces unhealthy tasks. Distroless images have no <code>curl</code>, so the check must be a binary that exists (for Python: <code>CMD ["python","-c","…urllib…"]</code>).</p>
<p><b>Labels and OCI annotations.</b> <code>LABEL</code> adds key/value metadata to the image config. Use the standard <code>org.opencontainers.image.*</code> keys: <code>source</code>, <code>revision</code>, <code>version</code>, <code>created</code>, <code>title</code>, <code>description</code>, <code>licenses</code>, <code>vendor</code>. Registries such as GHCR use <code>source</code> to link a package to a repository. Pass dynamic values as build args from CI.</p>
<p><b>Pinning and reproducibility.</b> A tag is a movable pointer; <code>python:3.12-slim</code> changes whenever upstream rebuilds. A <b>digest</b> (<code>@sha256:…</code>) is the hash of the manifest (or multi-platform index) and never changes. <code>FROM python:3.12-slim@sha256:&lt;digest&gt;</code> keeps the tag for humans and uses the digest for the machine. Combine with lock files (<code>requirements.txt</code> with hashes, <code>package-lock.json</code> + <code>npm ci</code>), pinned OS package versions where it matters, and an automated bot (Renovate, Dependabot) to bump digests so pinning does not mean never patching. Fully bit-for-bit reproducible images also need fixed timestamps (<code>SOURCE_DATE_EPOCH</code>, supported by BuildKit) and deterministic package installs.</p>`,
      why: `<p>Early container images were "a VM in a tarball": <code>FROM ubuntu</code>, <code>apt-get install</code> everything, copy the repository, run as root. They were 1-2 GB, pulled slowly on every deploy and autoscale event, shipped compilers and shells an attacker could use, produced hundreds of CVE findings nobody could triage, and silently changed whenever <code>:latest</code> moved.</p>
<p>Production images exist to fix that: smaller images pull and start faster (important for autoscaling and rollbacks), fewer packages mean fewer vulnerabilities and a smaller blast radius, non-root limits what an exploit can do, health checks let orchestrators route around broken instances, labels give traceability from a running container back to a commit, and digest pinning makes "it worked yesterday" builds repeatable.</p>`,
      diagram: {
        html: flow([["Stage: deps", "python:3.12-slim + gcc, build wheels", "w"], ["Stage: test", "optional: run pytest", "w"], ["Stage: runtime", "slim base pinned by digest", "g"], ["COPY --from + --chown", "only wheels and app code", "g"], ["USER 10001", "HEALTHCHECK, LABELs, exec CMD", "g"]]),
        steps: [
          `The <b>build stage</b> has compilers and headers; it turns <code>requirements.txt</code> into wheels in <code>/wheels</code>. Nothing here reaches production except what you copy.`,
          `An optional <b>test stage</b> runs the test suite; CI builds it with <code>--target test</code>, the production build skips it because the final stage does not depend on it.`,
          `The <b>runtime stage</b> starts from a slim base pinned by digest, installs wheels without network access and copies the app code owned by root but readable by the app user.`,
          `It switches to a <b>numeric non-root user</b>, declares a <b>HEALTHCHECK</b> and OCI <b>labels</b>, and uses an <b>exec-form CMD</b> so the server is PID 1 and receives SIGTERM.`
        ]
      },
      cmds: [
        {
          t: "Production Dockerfile for the FastAPI service (multi-stage, slim, non-root, healthcheck, labels, digest)",
          lang: "dockerfile",
          code: `# syntax=docker/dockerfile:1
# Pin the base by tag AND digest (get the digest with: docker buildx imagetools inspect python:3.12-slim)
ARG PYTHON_IMAGE=python:3.12-slim@sha256:<digest-from-imagetools>

FROM \${PYTHON_IMAGE} AS build
RUN apt-get update && apt-get install -y --no-install-recommends gcc libpq-dev \\
 && rm -rf /var/lib/apt/lists/*
WORKDIR /src
COPY requirements.txt .
RUN --mount=type=cache,target=/root/.cache/pip \\
    pip wheel --wheel-dir /wheels -r requirements.txt

FROM build AS test
COPY . .
RUN pip install /wheels/* && pip install pytest && pytest -q

FROM \${PYTHON_IMAGE} AS runtime
ARG VERSION=dev
ARG GIT_SHA=unknown
LABEL org.opencontainers.image.title="orders-api" \\
      org.opencontainers.image.source="https://github.com/acme/orders-api" \\
      org.opencontainers.image.version="\${VERSION}" \\
      org.opencontainers.image.revision="\${GIT_SHA}" \\
      org.opencontainers.image.licenses="MIT"
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
RUN groupadd --system --gid 10001 app && useradd --system --uid 10001 --gid app --no-create-home app
COPY --from=build /wheels /wheels
RUN pip install --no-cache-dir --no-index /wheels/* && rm -rf /wheels
WORKDIR /app
# code owned by root, readable by everyone: the app cannot modify itself
COPY --chmod=755 ./app ./app
USER 10001:10001
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=3s --start-period=20s --retries=3 \\
  CMD ["python", "-c", "import urllib.request,sys; sys.exit(0 if urllib.request.urlopen('http://127.0.0.1:8000/healthz', timeout=2).status == 200 else 1)"]
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--timeout-graceful-shutdown", "20"]`,
          note: `<p>The <code>test</code> stage is only built when you ask for it (<code>--target test</code>). <code>libpq-dev</code> and <code>gcc</code> never reach the runtime stage. If your wheels need shared libraries at runtime (for example <code>libpq5</code> for <code>psycopg2</code> without <code>-binary</code>), install just those runtime libraries in the final stage. Replace <code>&lt;digest-from-imagetools&gt;</code> with a real digest; the build fails on a placeholder.</p>`
        },
        {
          t: "Find a digest, build with labels and compare sizes",
          lang: "sh",
          code: `docker buildx imagetools inspect python:3.12-slim | head -5
docker build --target test -t orders-api:test .
docker build \\
  --build-arg VERSION=1.4.2 \\
  --build-arg GIT_SHA=$(git rev-parse --short HEAD) \\
  -t orders-api:1.4.2 .
docker image ls orders-api
docker image ls python --format '{{.Repository}}:{{.Tag}}  {{.Size}}'`,
          out: `Name:      docker.io/library/python:3.12-slim
MediaType: application/vnd.oci.image.index.v1+json
Digest:    sha256:4b8c…e1a2
…
REPOSITORY   TAG     IMAGE ID       CREATED          SIZE
orders-api   1.4.2   9f1c2b7d8a10   10 seconds ago   182MB
orders-api   test    c03b4e1a77de   1 minute ago     611MB
python:3.12          1.02GB
python:3.12-slim     124MB
python:3.12-alpine   57MB`,
          note: `<p>The digest printed for a multi-platform tag is the <b>index</b> digest; pinning it still lets each platform resolve its own manifest. Sizes are illustrative; they vary by version and platform.</p>`
        },
        {
          t: "Verify the user, labels, health status and layers",
          lang: "sh",
          code: `docker run -d --name api -p 8000:8000 orders-api:1.4.2
docker exec api id
docker inspect -f '{{.Config.User}}' orders-api:1.4.2
docker inspect -f '{{json .Config.Labels}}' orders-api:1.4.2
docker inspect -f '{{.State.Health.Status}}' api
docker inspect -f '{{range .State.Health.Log}}{{.ExitCode}} {{.Output}}{{end}}' api
docker history --format '{{.Size}}\\t{{.CreatedBy}}' orders-api:1.4.2 | head`,
          out: `uid=10001(app) gid=10001(app) groups=10001(app)
10001:10001
{"org.opencontainers.image.licenses":"MIT","org.opencontainers.image.revision":"3f9e2c1",…}
healthy
0
…`
        },
        {
          t: "Alpine vs slim: the Python wheel problem in one experiment",
          lang: "sh",
          code: `# glibc: downloads a prebuilt manylinux wheel in seconds
docker run --rm python:3.12-slim pip download --only-binary=:all: --no-deps psycopg2-binary -d /tmp 2>&1 | tail -1
# musl: works only if the project publishes a musllinux wheel; otherwise pip falls back to an sdist
docker run --rm python:3.12-alpine pip download --only-binary=:all: --no-deps psycopg2-binary -d /tmp 2>&1 | tail -1
# check which libc a binary links against
docker run --rm python:3.12-alpine ldd /usr/local/bin/python3
docker run --rm python:3.12-slim ldd /usr/local/bin/python3 | grep libc`,
          note: `<p>Results change over time as projects add <code>musllinux</code> wheels; the point is to check before choosing Alpine. If <code>--only-binary=:all:</code> fails on Alpine, a normal <code>pip install</code> would compile from source and need a toolchain.</p>`
        },
        {
          t: "Distroless runtime and a static binary on scratch",
          lang: "dockerfile",
          code: `# --- Python on distroless (Python version is fixed by the distroless image) ---
FROM python:3.11-slim AS build
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir --target /app/deps -r requirements.txt
COPY app ./app

FROM gcr.io/distroless/python3-debian12:nonroot
WORKDIR /app
COPY --from=build /app /app
ENV PYTHONPATH=/app/deps
# no shell: exec form only; the entrypoint of this image is python3
CMD ["-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

# --- Go on scratch ---
# FROM golang:1.23 AS gobuild
# WORKDIR /src
# COPY . .
# RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /out/worker ./cmd/worker
# FROM scratch
# COPY --from=gobuild /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
# COPY --from=gobuild /out/worker /worker
# USER 65532:65532
# ENTRYPOINT ["/worker"]`,
          note: `<p>The distroless Python image ships a specific Python minor version (check the image documentation); build the dependencies with the <b>same</b> minor version or compiled extensions will not load. The <code>:nonroot</code> tag runs as UID 65532.</p>`
        },
        {
          t: "React static build served by unprivileged Nginx",
          lang: "dockerfile",
          code: `FROM node:22-slim AS build
WORKDIR /web
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY . .
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.27-alpine
COPY --from=build /web/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
# listens on 8080 as UID 101
EXPOSE 8080
HEALTHCHECK CMD wget -qO- http://127.0.0.1:8080/ >/dev/null || exit 1`,
          note: `<p>Here Alpine is a good fit: Nginx and static files have no glibc-only dependencies. The final image has no Node.js and no <code>node_modules</code>.</p>`
        }
      ],
      internals: `<p><b>What a multi-stage build is to BuildKit.</b> BuildKit converts the Dockerfile into an LLB graph (a DAG of operations). Each stage is a subgraph; <code>COPY --from</code> is an edge. BuildKit solves only the part of the graph reachable from the target, runs independent vertices in parallel and caches each vertex by a key computed from its inputs (parent cache key, instruction, and for <code>COPY</code> a checksum of the copied files). That is why changing <code>app/main.py</code> does not reinstall dependencies: the dependency step's key did not change.</p>
<p><b>What ends up in the image.</b> An image is a manifest pointing at a config JSON and an ordered list of compressed layer tarballs. Only the final stage's layers are in the manifest; the build stage's layers stay in the builder cache. <code>USER</code>, <code>HEALTHCHECK</code>, <code>LABEL</code>, <code>ENV</code>, <code>EXPOSE</code> and <code>CMD</code> create no filesystem layer; they edit the config JSON (<code>config.User</code>, <code>config.Healthcheck</code>, <code>config.Labels</code>…), which you see with <code>docker inspect</code> and as 0B rows in <code>docker history</code>. Deleting files in a later <code>RUN</code> writes a whiteout entry in the new layer; the bytes are still in the lower layer and still downloaded.</p>
<p><b>Non-root at runtime.</b> When the container starts, dockerd passes the user to containerd in the OCI runtime spec (<code>process.user.uid/gid</code>); runc calls <code>setgroups</code>, <code>setgid</code>, <code>setuid</code> before <code>execve</code>. If <code>USER</code> is a name, runc resolves it from the container's <code>/etc/passwd</code>; if that file lacks it you get <code>unable to find user app: no matching entries in passwd file</code>. A numeric UID does not need an entry. File access checks are ordinary kernel permission checks against that UID; that is why ownership from <code>COPY --chown</code> matters.</p>
<p><b>Health checks.</b> dockerd itself runs the probe: at each interval it performs the equivalent of an exec inside the container (same namespaces, same user), waits up to <code>timeout</code>, and stores the last few results (exit code, truncated output, timestamps) in <code>.State.Health</code>, persisted in <code>/var/lib/docker/containers/&lt;id&gt;/config.v2.json</code>. Each status change emits a <code>health_status</code> event (<code>docker events</code>). A probe that takes CPU and spawns processes every few seconds is real load; keep it cheap.</p>
<p><b>Digests.</b> On pull, the engine resolves a tag to a digest via the registry, then fetches the manifest by digest and verifies every blob's SHA-256. With <code>FROM image@sha256:…</code> the resolution step is skipped and the content is verified against the pinned hash, so a compromised or re-pushed tag cannot change your base silently.</p>`,
      prod: `<p>In the running example (React → FastAPI → Redis → PostgreSQL):</p>
<ul class="pts">
<li><b>web</b>: multi-stage Node build, final <code>nginx-unprivileged:1.27-alpine</code> image of 20-50 MB with only static assets and the Nginx config; health check on <code>/</code>.</li>
<li><b>api</b>: the Dockerfile above on <code>python:3.12-slim</code> pinned by digest, UID 10001, health check on <code>/healthz</code> that does <b>not</b> depend on PostgreSQL (liveness), while a separate <code>/readyz</code> checks DB and Redis for load-balancer readiness; labels injected by CI with the version and commit.</li>
<li><b>worker</b>: same image as the api with a different command, so it shares layers and patching.</li>
<li><b>redis</b> and <b>postgres</b>: official images pinned by digest (<code>postgres:16@sha256:…</code>, <code>redis:7-alpine@sha256:…</code>), already running as non-root users internally after start-up; health checks with <code>pg_isready</code> and <code>redis-cli ping</code> in Compose.</li>
</ul>
<p>Renovate opens a PR weekly bumping base digests; CI rebuilds, runs tests and a scan (Day 7), and only then are the new images promoted. A rollback is deploying the previous immutable tag, which is fast because the image is small and the layers are often still cached on the nodes.</p>`,
      iq: [
        ["dca", "Which Dockerfile instruction sets the user for subsequent RUN, CMD and ENTRYPOINT instructions, and which option sets ownership of copied files in the same step?", `<p><code>USER</code> (it applies to later <code>RUN</code> steps in the same stage and to the container process) and <code>COPY --chown=&lt;user&gt;:&lt;group&gt;</code> (also on <code>ADD</code>). A separate <code>RUN chown -R</code> works but duplicates the files into a new layer. <code>WORKDIR</code> does not change the user; <code>ENV USER=…</code> only sets a variable.</p>`],
        ["dca", "A Dockerfile declares HEALTHCHECK and the check starts failing. What does Docker Engine do (standalone, no Swarm)?", `<p>After <code>--retries</code> consecutive failures it marks the container <b>unhealthy</b>, records the result in <code>.State.Health</code> and emits a <code>health_status</code> event. It does <b>not</b> restart or stop it; restart policies react to the process exiting, not to health. In Swarm mode, the orchestrator replaces unhealthy tasks. Compose uses health for <code>depends_on</code> conditions.</p>`],
        ["mid", "Why might python:3.12-alpine produce a slower build and a bigger image than python:3.12-slim for a FastAPI app?", `<p>Alpine uses musl libc. Packages that only publish glibc <code>manylinux</code> wheels must be compiled from source on Alpine, so you install <code>gcc</code>, <code>musl-dev</code> and headers, wait for compilation, and if you do not use a multi-stage build those toolchains stay in the image. Slim uses glibc and installs prebuilt wheels in seconds. Alpine is still great for Nginx, static binaries and pure-Python apps.</p>`],
        ["senior", "What are the trade-offs of distroless images and how do you debug one?", `<p>Pros: no shell, package manager or coreutils, so fewer CVEs and nothing for an attacker to use after a code-execution bug; small size. Cons: you cannot <code>docker exec … sh</code>; shell-form <code>CMD</code>/<code>HEALTHCHECK</code> do not work; you must know which runtime version the image ships. Debug with a <code>:debug</code> variant (has BusyBox) in non-production, <code>docker debug</code> where available, or a sidecar container joined to the target's PID and network namespaces (<code>--pid=container:api --network=container:api</code>) and inspect files through <code>/proc/1/root</code>.</p>`],
        ["senior", "Explain the difference between pinning to a tag and pinning to a digest, and how you keep digest-pinned images patched.", `<p>A tag is a mutable pointer the publisher can move; a digest is the content hash of the manifest or index and is immutable and verified on pull. Digests give reproducible builds and protect against tag tampering, but they freeze security patches too. Use <code>tag@digest</code> for readability and let a bot (Renovate/Dependabot) open PRs that update digests; CI rebuilds and tests, so patching is a reviewed change instead of a surprise.</p>`],
        ["mid", "Why prefer a numeric UID in USER?", `<p>It works even if <code>/etc/passwd</code> has no entry (distroless, scratch), it is unambiguous across images, and orchestrators such as Kubernetes can verify <code>runAsNonRoot</code> only for numeric users. A name is resolved at container start from the image's passwd file and fails if missing.</p>`],
        ["lead", "What metadata would you require on every production image in your organisation and why?", `<p>OCI labels <code>org.opencontainers.image.source</code>, <code>revision</code> (git SHA), <code>version</code>, <code>created</code>, plus owner/team and licence labels. With these, any running container (or a CVE report) can be traced to the commit and team that produced it. Add SBOM and provenance attestations (Day 7) so the dependency list and build process are also attached to the image.</p>`],
        ["dca", "Which TWO statements about multi-stage builds are true? (a) Only the final stage's layers are in the resulting image by default. (b) Each stage must use the same base image. (c) COPY --from can copy from a named stage or from another image. (d) Multi-stage builds require Swarm mode.", `<p><b>(a) and (c).</b> Stages can use any base (b is false), <code>COPY --from=nginx:1.27 /etc/nginx/nginx.conf .</code> works with an image reference, and multi-stage is a build feature unrelated to Swarm (d is false).</p>`]
      ],
      gotchas: [
        `<code>RUN rm</code> in a later layer does not reduce image size; the file is still in the lower layer. Install, use and delete in one <code>RUN</code>, or use a separate stage.`,
        `<code>USER app</code> before a <code>RUN apt-get install</code> makes that install fail with permission errors; do root-only work first, switch user near the end.`,
        `A shell-form <code>HEALTHCHECK CMD curl …</code> fails in distroless and in slim images without <code>curl</code>; the container stays <code>starting</code> then goes <code>unhealthy</code> while the app is fine.`,
        `A health check that queries PostgreSQL makes the API "unhealthy" whenever the DB blips; in Swarm that causes all API replicas to be replaced at once. Separate liveness from readiness.`,
        `Named volumes are initialised from the image directory's content and ownership on first use; if the directory is root-owned in the image, the non-root app cannot write to the new volume. Create and <code>chown</code> the mount point in the Dockerfile.`,
        `Bind-mounted host directories keep host ownership; a container running as UID 10001 cannot write to a host folder owned by UID 1000 unless you align the UIDs or permissions.`,
        `The <code>.dockerignore</code> is read from the root of the build context; a missing one sends <code>.git</code>, <code>node_modules</code> and <code>.env</code> to the builder and can bake secrets into <code>COPY . .</code>.`,
        `Pinning <code>FROM</code> by digest does not pin <code>apt-get install</code> or unpinned <code>pip install</code>; reproducibility needs lock files too.`
      ],
      best: [
        `Use multi-stage builds for anything with a compile or bundle step; keep a <code>test</code> stage CI can target.`,
        `Default to <code>-slim</code> for Python/Node; use Alpine where musl is known to be fine; use distroless/scratch when your team has a debugging story for them.`,
        `Run as a numeric non-root UID, <code>COPY --chown</code> only the writable paths, and keep code root-owned and read-only.`,
        `Add a cheap <code>HEALTHCHECK</code> that tests the process, not its dependencies, using a binary that exists in the image.`,
        `Add OCI labels from CI build args; pin bases as <code>tag@sha256:…</code> and automate digest bumps.`,
        `Measure: track image size and CVE count per release and fail CI on unexpected jumps.`
      ],
      lab: [
        `Write the multi-stage FastAPI Dockerfile above (with a tiny <code>/healthz</code> endpoint) and build it; also build a naive single-stage <code>FROM python:3.12</code> version. Compare sizes with <code>docker image ls</code>.`,
        `Run the image and confirm <code>docker exec api id</code> shows UID 10001; try <code>docker exec api touch /app/x</code> and observe <i>Permission denied</i>.`,
        `Watch <code>docker inspect -f '{{.State.Health.Status}}' api</code> go from <code>starting</code> to <code>healthy</code>; then break the endpoint (return 500) and watch it become <code>unhealthy</code> while the container keeps running.`,
        `Get the digest of <code>python:3.12-slim</code> with <code>docker buildx imagetools inspect</code> and pin it in <code>FROM</code>; rebuild and verify the build uses the pinned base.`,
        `Run <code>docker history orders-api:1.4.2</code> and identify which rows are config-only (0B) and which layer is the largest.`,
        `<b>Done when:</b> your image is under ~250 MB, runs as UID 10001, reports <code>healthy</code>, shows your OCI labels in <code>docker inspect</code>, and builds from a digest-pinned base.`
      ],
      teach: `<p>"A production image should contain only what the process needs at runtime. I use multi-stage builds: a build stage with compilers creates wheels or a JS bundle, and the final stage copies only the result. For Python I default to the slim, glibc-based images, because Alpine uses musl and many wheels then have to be compiled; for Nginx serving React, Alpine is fine. Distroless or scratch go further by removing the shell, which is safer but harder to debug.</p>
<p>The process runs as a numeric non-root user, set with <code>USER 10001</code>, and files get the right owner with <code>COPY --chown</code>, not a separate chown layer. The image declares a cheap <code>HEALTHCHECK</code>; Docker only reports health, Swarm or Compose act on it. Finally I add OCI labels with version and commit, and pin the base image by digest so builds are repeatable, with a bot bumping the digest so we still get patches."</p>`
    },
    {
      id: "d6-runtime",
      title: "Running in production: limits, OOM, signals, PID 1 and logging",
      lv: ["mid", "senior", "lead", "dca"],
      eli5: `<p>Imagine a shared office kitchen. Without rules, one person can take every plate (memory), hog the cooker all day (CPU) or invite a thousand friends (processes). <b>Limits</b> are the house rules: "you get two plates and half the cooker". If someone grabs a third plate, the building manager (the kernel) throws them out on the spot. That is the <b>OOM kill</b>, and it is recorded as exit code 137.</p>
<p>At closing time the manager knocks politely (<b>SIGTERM</b>): "please finish your sandwich and leave". After ten seconds they drag you out (<b>SIGKILL</b>). But in a container, the person standing closest to the door (<b>PID 1</b>) is special: if they have not been told what a knock means, they simply ignore it. That is why you put a doorman (<b>tini</b>) there who listens for knocks and passes them on.</p>
<p>The <b>restart policy</b> is what the manager does when someone collapses: never call them back, call them back a few times, or always. <b>Logs</b> are what everyone says out loud in the kitchen: they should talk to the room (stdout), and someone must make sure the notebook recording it does not grow until it fills the whole building.</p>`,
      what: `<p><b>Configuration, secrets and environment (12-factor).</b> The same image runs in dev, staging and production; what changes is <b>configuration</b>, supplied at run time. Non-sensitive config goes in environment variables (<code>-e</code>, <code>--env-file</code>, Compose <code>environment:</code>/<code>env_file:</code>). <b>Secrets</b> (DB passwords, API keys) are different: environment variables are visible in <code>docker inspect</code>, inherited by every child process and often dumped into crash reports. Prefer secrets mounted as files (<code>/run/secrets/db_password</code> via Swarm or Compose <code>secrets:</code>, or a secret manager) and support a <code>*_FILE</code> convention (the official <code>postgres</code> image reads <code>POSTGRES_PASSWORD_FILE</code>). Never bake either into the image.</p>
<p><b>Restart policies</b> (<code>--restart</code>, Compose <code>restart:</code>):</p>
<ul class="pts">
<li><code>no</code> (default): never restart automatically.</li>
<li><code>on-failure[:N]</code>: restart only when the process exits with a non-zero code, optionally at most N times. A clean exit 0 is left stopped.</li>
<li><code>always</code>: restart whatever the exit code. If you stop it manually it stays stopped, but it is started again when the <b>daemon restarts</b> (host reboot, engine upgrade).</li>
<li><code>unless-stopped</code>: like <code>always</code>, except a container that was manually stopped stays stopped after a daemon restart.</li>
</ul>
<p>Restarts back off exponentially (starting at 100 ms and doubling, capped) to avoid hot loops; the delay resets after the container runs successfully for a while (documented as 10 seconds). A restart policy only becomes active once the container has started successfully. <code>docker update --restart unless-stopped api</code> changes it on a running container. In Swarm, <code>deploy.restart_policy</code> is a different mechanism handled by the orchestrator.</p>
<p><b>CPU limits.</b></p>
<ul class="pts">
<li><code>--cpus=1.5</code>: hard quota; the container's processes together get at most 1.5 CPU-seconds per second (implemented as CFS quota/period, <code>cpu.max = 150000 100000</code> on cgroup v2). Exceeding it means throttling (latency), not death.</li>
<li><code>--cpu-shares=512</code>: relative weight (default 1024) used only when CPUs are contended; an idle host lets a low-share container use all CPUs. On cgroup v2 it maps to <code>cpu.weight</code>.</li>
<li><code>--cpuset-cpus=0,1</code>: pin to specific cores.</li>
</ul>
<p><b>Memory limits.</b></p>
<ul class="pts">
<li><code>--memory=512m</code> (<code>-m</code>): hard limit on RAM (including page cache the cgroup is charged for). Exceed it and reclaim fails → the kernel OOM killer kills a process in the cgroup.</li>
<li><code>--memory-swap</code>: total of memory <b>plus</b> swap. Equal to <code>--memory</code> = no swap; <code>-1</code> = unlimited swap; unset = swap allowed up to the same amount as memory (if the host has swap). Setting it without <code>--memory</code> is an error.</li>
<li><code>--memory-reservation=256m</code>: a soft limit, lower than <code>--memory</code>; under host memory pressure the kernel reclaims the container back toward it (<code>memory.low</code> on cgroup v2). Not a guarantee and not a cap.</li>
<li><code>--oom-kill-disable</code> exists but is dangerous without a memory limit (the host's OOM killer then hits other processes) and is not supported on cgroup v2.</li>
</ul>
<p><b>OOM and exit 137.</b> A container killed by SIGKILL exits with 128 + 9 = <b>137</b>. Two common causes: the kernel OOM killer (then <code>docker inspect -f '{{.State.OOMKilled}}'</code> is <code>true</code> and <code>docker events</code> shows an <code>oom</code> event) or <code>docker stop</code> escalating to SIGKILL after the timeout (<code>OOMKilled=false</code>). Exit 143 (128 + 15) means the process died from an unhandled SIGTERM. Note that the OOM killer may kill a child process (a gunicorn worker) rather than PID 1; the container keeps running, the master spawns a new worker, and you only see it in logs, events or <code>memory.events</code>.</p>
<p><b><code>--pids-limit=200</code></b> caps the number of processes/threads in the container (<code>pids.max</code>), protecting the host from fork bombs and runaway thread pools. Hitting it makes <code>fork()</code> fail with <i>Resource temporarily unavailable</i>.</p>
<p><b>Signals and PID 1.</b> <code>docker stop</code> sends the image's <code>STOPSIGNAL</code> (default SIGTERM) to PID 1, waits the stop timeout (default 10 s; <code>docker stop -t</code>, <code>docker run --stop-timeout</code>, Compose <code>stop_grace_period</code>), then sends SIGKILL. PID 1 in a PID namespace is special: the kernel does not apply the default action for signals it has not installed a handler for, so SIGTERM to a PID 1 that never registered a handler does <b>nothing</b>. PID 1 must also <b>reap zombies</b>: orphaned children are re-parented to it and stay as zombies (<code>&lt;defunct&gt;</code>) until it calls <code>wait()</code>.</p>
<ul class="pts">
<li><b>Shell form</b> <code>CMD uvicorn app:app</code> runs <code>/bin/sh -c "uvicorn app:app"</code>. Depending on the shell, sh may stay as PID 1 and not forward SIGTERM; then every stop waits 10 s and ends in SIGKILL (exit 137), cutting in-flight requests. Use <b>exec form</b> <code>CMD ["uvicorn","app.main:app",…]</code>.</li>
<li>Entrypoint scripts must end with <code>exec "$@"</code> so the script is replaced by the app.</li>
<li><code>docker run --init</code> (Compose <code>init: true</code>) injects <b>tini</b> (<code>docker-init</code>) as PID 1: it forwards signals to the child and reaps zombies. Or install <code>tini</code>/<code>dumb-init</code> in the image as <code>ENTRYPOINT</code>.</li>
</ul>
<p><b>Graceful shutdown in Python servers.</b> Uvicorn on SIGTERM stops accepting new connections, waits for in-flight requests and runs lifespan shutdown handlers (<code>--timeout-graceful-shutdown</code> caps the wait). Gunicorn treats SIGTERM as graceful: workers finish current requests for up to <code>--graceful-timeout</code> (default 30 s) and are then killed; SIGINT/SIGQUIT are quick shutdowns. Because Docker's default stop timeout is 10 s, a gunicorn with a 30 s graceful timeout is SIGKILLed early unless you raise <code>stop_grace_period</code> above it.</p>
<p><b>Logging.</b> The app writes to stdout/stderr; the container's stdio is captured by the shim and handed to the engine's <b>logging driver</b>:</p>
<ul class="pts">
<li><code>json-file</code> (default): one JSON line per log line in <code>/var/lib/docker/containers/&lt;id&gt;/&lt;id&gt;-json.log</code>. <b>No rotation by default</b>; set <code>max-size</code> and <code>max-file</code>.</li>
<li><code>local</code>: compact protobuf format with rotation and compression enabled by default; recommended by Docker for local storage.</li>
<li><code>journald</code>, <code>syslog</code>: send to the host's system logger.</li>
<li><code>fluentd</code>, <code>awslogs</code>, <code>gelf</code>, <code>splunk</code>, <code>gcplogs</code>: ship to remote systems.</li>
<li><code>docker logs</code> natively reads <code>json-file</code>, <code>local</code> and <code>journald</code>. For remote drivers, current engines keep a local "dual logging" cache so <code>docker logs</code> still works unless that cache is disabled (<code>cache-disabled</code> log-opt); on older engines <code>docker logs</code> failed with those drivers.</li>
<li>Delivery mode: <code>blocking</code> (default; a slow driver can stall the app's writes) vs <code>non-blocking</code> with a <code>max-buffer-size</code> ring buffer (may drop logs).</li>
<li>Logging config set in <code>daemon.json</code> applies to <b>new</b> containers only; existing ones keep their driver until recreated.</li>
</ul>`,
      why: `<p>On a shared host, containers are just processes. Without limits, a memory leak in one API replica can trigger the host's OOM killer, which may pick PostgreSQL; a CPU-heavy report can starve the web tier; a thread leak can exhaust the PID table. Limits turn "one bad container takes down the host" into "one bad container gets throttled or killed and restarted".</p>
<p>Deploys and scaling constantly stop containers. If the app does not handle SIGTERM, every deploy waits the full timeout, then cuts connections mid-request: users see 502s, background jobs are lost, transactions are aborted. The PID 1 rules are why "it shuts down fine on my laptop" does not hold in a container.</p>
<p>And logs: unrotated <code>json-file</code> logs are one of the most common causes of full disks on Docker hosts, which in turn breaks PostgreSQL writes and image pulls. Treating logs as an event stream on stdout, rotated locally and shipped centrally, is the 12-factor answer.</p>`,
      diagram: {
        html: lanes([["docker run flags", ["--memory / --memory-swap / --memory-reservation", "--cpus / --cpu-shares / --cpuset-cpus", "--pids-limit", "--restart, --init, --stop-timeout", "--log-driver, --log-opt"]], ["Engine / runtime", ["dockerd writes HostConfig", "containerd + shim keep stdio and exit status", "runc creates the cgroup and namespaces", "tini as PID 1 if --init"]], ["Kernel", ["cgroup v2: memory.max, memory.low, cpu.max, cpu.weight, pids.max", "OOM killer → SIGKILL → exit 137", "PID 1 ignores unhandled signals", "zombie reaping by PID 1"]]]),
        steps: [
          `<code>docker run</code> flags become the container's <code>HostConfig</code> and then an OCI runtime spec (<code>linux.resources</code>, <code>process</code>).`,
          `runc creates the container's cgroup and writes the limits to cgroup files; the kernel enforces them: throttling for CPU, OOM kill for memory, <code>fork()</code> failure for PIDs.`,
          `The shim reports the exit status to containerd/dockerd, which records <code>ExitCode</code> and <code>OOMKilled</code>, then applies the restart policy.`,
          `<code>docker stop</code> sends SIGTERM to PID 1 (tini forwards it to the app), waits the stop timeout, then SIGKILLs. Meanwhile stdout/stderr flow through the shim into the logging driver.`
        ]
      },
      cmds: [
        {
          t: "Run the API with production limits, init, restart policy and rotated logs",
          lang: "sh",
          code: `docker run -d --name api \\
  --restart unless-stopped \\
  --init \\
  --memory 512m --memory-swap 512m --memory-reservation 384m \\
  --cpus 1.5 \\
  --pids-limit 256 \\
  --stop-timeout 30 \\
  --log-driver local --log-opt max-size=20m --log-opt max-file=5 \\
  --env-file ./prod.env \\
  -p 8000:8000 orders-api:1.4.2

docker stats --no-stream api
docker inspect -f '{{.HostConfig.Memory}} {{.HostConfig.NanoCpus}} {{.HostConfig.PidsLimit}} {{.HostConfig.RestartPolicy.Name}}' api`,
          out: `CONTAINER ID   NAME   CPU %   MEM USAGE / LIMIT   MEM %    NET I/O       BLOCK I/O   PIDS
5c1d9e0f2a33   api    0.42%   96.3MiB / 512MiB    18.81%   1.2kB / 0B    0B / 0B     7
536870912 1500000000 256 unless-stopped`,
          note: `<p><code>--memory-swap</code> equal to <code>--memory</code> disables swap for the container, making OOM behaviour predictable. <code>NanoCpus</code> is CPUs × 10<sup>9</sup>.</p>`
        },
        {
          t: "Reproduce an OOM kill and read the evidence",
          lang: "sh",
          code: `docker run --name hog --memory 64m --memory-swap 64m python:3.12-slim \\
  python -c "x = bytearray(200 * 1024 * 1024); print('allocated')"
echo "exit code: $?"
docker inspect -f 'ExitCode={{.State.ExitCode}} OOMKilled={{.State.OOMKilled}}' hog
docker events --since 5m --filter container=hog --filter event=oom --until "$(date -u +%Y-%m-%dT%H:%M:%S)"
# on the host (Linux, cgroup v2): kernel log
sudo dmesg | grep -i -E 'oom|killed process' | tail -3`,
          out: `exit code: 137
ExitCode=137 OOMKilled=true
2026-11-16T10:02:11.481Z container oom 8e1f… (image=python:3.12-slim, name=hog)
Memory cgroup out of memory: Killed process 41233 (python) total-vm:…, anon-rss:…`,
          note: `<p>Compare with <code>docker run -d --name sleeper alpine sleep 600</code> then <code>docker stop sleeper</code>: <code>sleep</code> as PID 1 has no SIGTERM handler, so after 10 s it is SIGKILLed: exit 137 but <code>OOMKilled=false</code>.</p>`
        },
        {
          t: "PID 1: no handler vs --init, shell form vs exec form",
          lang: "sh",
          code: `# 1. sleep as PID 1 has no SIGTERM handler, so SIGTERM is ignored: 10 s, then SIGKILL
docker run -d --name noinit alpine sleep 600
time docker stop noinit
docker inspect -f '{{.State.ExitCode}}' noinit

# 2. same command with --init: tini is PID 1 and forwards SIGTERM; sleep is not PID 1, so the default action kills it
docker run -d --name withinit --init alpine sleep 600
docker top withinit
time docker stop withinit
docker inspect -f '{{.State.ExitCode}}' withinit

# 3. shell form wrapper: sh is PID 1, the app is its child and never sees SIGTERM
docker run -d --name shellform python:3.12-slim sh -c "python -m http.server 8000; echo done"
docker top shellform
time docker stop shellform`,
          out: `real    0m10.3s
137
UID    PID     PPID    C   STIME  TTY  TIME      CMD
root   51022   51001   0   10:05  ?    00:00:00  /sbin/docker-init -- sleep 600
root   51047   51022   0   10:05  ?    00:00:00  sleep 600
real    0m0.4s
143
UID    PID     PPID    C   STIME  TTY  TIME      CMD
root   51210   51190   0   10:06  ?    00:00:00  sh -c python -m http.server 8000; echo done
root   51236   51210   0   10:06  ?    00:00:00  python -m http.server 8000
real    0m10.4s`,
          note: `<p>143 = 128 + SIGTERM: the process died from the signal, which is a clean, expected stop. The shell-form example has two commands so the shell cannot simply <code>exec</code> the last one (some shells do that optimisation for a single command, which is why behaviour varies). Exec form alone is not always enough: <code>python -m http.server</code> installs no SIGTERM handler, so as PID 1 it would also ignore SIGTERM. Uvicorn and gunicorn do install handlers. Always time <code>docker stop</code> for your own image. <code>docker top</code> runs <code>ps</code> on the host, so it works even when the image has no <code>ps</code>.</p>`
        },
        {
          t: "Entrypoint script that does not break signals",
          lang: "sh",
          code: `#!/bin/sh
# docker-entrypoint.sh
set -eu
# read a secret from a file if provided (the *_FILE convention)
if [ -n "\${DATABASE_PASSWORD_FILE:-}" ]; then
  DATABASE_PASSWORD="$(cat "$DATABASE_PASSWORD_FILE")"
  export DATABASE_PASSWORD
fi
python -m app.migrate --check
# replace this shell with the CMD so the app becomes PID 1 (or tini's child)
exec "$@"`,
          note: `<p>Use with <code>ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]</code> and <code>CMD ["gunicorn", …]</code>. Without <code>exec</code>, the shell stays PID 1 and swallows SIGTERM.</p>`
        },
        {
          t: "Compose: graceful gunicorn/uvicorn, limits, restart, secrets and logging",
          lang: "yaml",
          code: `services:
  api:
    image: registry.example.com/acme/orders-api:1.4.2
    command: ["gunicorn", "app.main:app", "-k", "uvicorn.workers.UvicornWorker",
              "-w", "4", "-b", "0.0.0.0:8000", "--graceful-timeout", "25", "--timeout", "60"]
    init: true
    restart: unless-stopped
    stop_signal: SIGTERM
    stop_grace_period: 35s          # > gunicorn graceful-timeout
    mem_limit: 768m
    memswap_limit: 768m
    mem_reservation: 512m
    cpus: 1.5
    pids_limit: 256
    environment:
      APP_ENV: production
      DATABASE_HOST: postgres
      DATABASE_PASSWORD_FILE: /run/secrets/db_password
    secrets: [db_password]
    healthcheck:
      test: ["CMD", "python", "-c", "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/healthz', timeout=2)"]
      interval: 15s
      timeout: 3s
      retries: 3
      start_period: 20s
    logging:
      driver: local
      options:
        max-size: "20m"
        max-file: "5"
secrets:
  db_password:
    file: ./secrets/db_password.txt`,
          note: `<p>Compose v2 applies <code>mem_limit</code>/<code>cpus</code>/<code>pids_limit</code> directly; <code>deploy.resources.limits</code> is also honoured by <code>docker compose</code> and is the form Swarm uses. In plain Compose, file-based secrets are bind mounts (not encrypted), but they are kept out of <code>docker inspect</code>'s environment.</p>`
        },
        {
          t: "Restart policies and the daemon restart",
          lang: "sh",
          code: `docker run -d --name a --restart always alpine sleep 3600
docker run -d --name u --restart unless-stopped alpine sleep 3600
docker run -d --name f --restart on-failure:3 alpine sh -c "exit 1"
docker stop a u
sudo systemctl restart docker          # Linux host
docker ps -a --format '{{.Names}}\\t{{.Status}}'
docker inspect -f '{{.RestartCount}}' f`,
          out: `a   Up 3 seconds
u   Exited (137) 40 seconds ago
f   Exited (1) 30 seconds ago
3`,
          note: `<p><code>a</code> (always) comes back after the daemon restart even though you stopped it; <code>u</code> (unless-stopped) stays stopped. <code>f</code> was restarted 3 times and then given up on. The exit code shown for <code>u</code> depends on how <code>sleep</code> handled the stop.</p>`
        },
        {
          t: "Logs: tail, follow, time window, and where they live",
          lang: "sh",
          code: `docker logs --tail 50 -f --timestamps api
docker logs --since 10m api 2>&1 | grep -i error
docker inspect -f '{{.HostConfig.LogConfig.Type}} {{.HostConfig.LogConfig.Config}}' api
docker inspect -f '{{.LogPath}}' api          # set only for json-file
sudo du -sh /var/lib/docker/containers/*/*-json.log | sort -h | tail -3`,
          out: `local map[max-file:5 max-size:20m]
…
1.8G  /var/lib/docker/containers/7d2e…/7d2e…-json.log`
        }
      ],
      internals: `<p><b>Where the limits live.</b> dockerd stores the flags in <code>/var/lib/docker/containers/&lt;id&gt;/hostconfig.json</code> and translates them into the OCI spec's <code>linux.resources</code>. runc creates a cgroup for the container (with the systemd cgroup driver, typically <code>/sys/fs/cgroup/system.slice/docker-&lt;id&gt;.scope/</code> on cgroup v2) and writes: <code>memory.max</code> (from <code>--memory</code>), <code>memory.swap.max</code> (from <code>--memory-swap</code> minus <code>--memory</code>), <code>memory.low</code> (reservation), <code>cpu.max</code> ("quota period"), <code>cpu.weight</code> (converted from shares), <code>pids.max</code>. On cgroup v1 hosts the same values live in per-controller hierarchies (<code>memory.limit_in_bytes</code>, <code>cpu.cfs_quota_us</code>…). Day 8 shows how to read these files.</p>
<p><b>OOM path.</b> When an allocation would push the cgroup above <code>memory.max</code>, the kernel first tries to reclaim page cache from that cgroup; if that fails it invokes the OOM killer scoped to the cgroup, which picks the process with the highest badness score and sends SIGKILL. The counter <code>oom_kill</code> in <code>memory.events</code> increments; containerd's cgroup monitor sees the event and dockerd records <code>OOMKilled</code> and emits an <code>oom</code> event. Because SIGKILL cannot be caught, no cleanup code runs.</p>
<p><b>Stop path.</b> <code>docker stop</code> → dockerd → containerd <code>Kill(SIGTERM)</code> → the shim signals the container's init process. After the timeout dockerd asks for SIGKILL. The kernel's rule for PID 1 of a namespace: signals whose disposition is "default" are not delivered to it from inside the namespace, and from an ancestor namespace only SIGKILL and SIGSTOP are forced. That is why a process with no SIGTERM handler ignores <code>docker stop</code> when it is PID 1 but would die if it were PID 7.</p>
<p><b>tini.</b> With <code>--init</code>, dockerd bind-mounts its <code>docker-init</code> binary (tini) into the container and makes it the entrypoint. tini registers handlers for the forwardable signals, relays them to its child (or the child's process group with <code>-g</code>), loops on <code>waitpid(-1)</code> to reap zombies, and exits with the child's exit code.</p>
<p><b>Log path.</b> The process's stdout/stderr are pipes (or a PTY with <code>-t</code>) held by <code>containerd-shim-runc-v2</code>, which exposes them as FIFOs that dockerd reads. dockerd's log copier splits lines and passes them to the driver. For <code>json-file</code> each line becomes <code>{"log":"…\\n","stream":"stdout","time":"…"}</code>; rotation renames to <code>-json.log.1</code> etc. Since the shim holds the pipes, the container keeps running while dockerd restarts with <code>live-restore</code>; output written meanwhile is buffered in the pipe (and the app blocks if the pipe fills).</p>`,
      prod: `<p>A typical single-host production Compose stack for React → FastAPI → Redis → PostgreSQL:</p>
<ul class="pts">
<li><b>web</b> (Nginx): <code>cpus: 0.5</code>, <code>mem_limit: 128m</code>, <code>restart: unless-stopped</code>.</li>
<li><b>api</b> (gunicorn + uvicorn workers): <code>init: true</code>, 4 workers sized to <code>cpus: 2</code>, <code>mem_limit</code> = workers × measured peak + headroom, <code>stop_grace_period: 35s</code>, gunicorn <code>--graceful-timeout 25</code>, <code>--max-requests</code> to recycle leaky workers. Alert on <code>oom</code> events and restart counts.</li>
<li><b>redis</b>: set <code>maxmemory</code> inside Redis below the container limit (for example 400 MB of a 512 MB cap) so Redis evicts keys instead of being OOM-killed.</li>
<li><b>postgres</b>: <code>shm_size: 256m</code> (default <code>/dev/shm</code> is 64 MB, too small for parallel queries), memory limit above <code>shared_buffers + work_mem × connections</code>, <code>stop_grace_period: 60s</code> so it can checkpoint and shut down cleanly instead of crash-recovering.</li>
<li><b>logging</b>: daemon-wide <code>local</code> driver with rotation in <code>daemon.json</code>, plus a Fluent Bit or Vector agent tailing them, or <code>awslogs</code> on EC2. Apps log JSON lines to stdout with a request ID.</li>
<li><b>secrets</b>: DB password and JWT key mounted as files; non-secret config (<code>APP_ENV</code>, hostnames, pool sizes) as env vars.</li>
</ul>`,
      iq: [
        ["dca", "A container exits with code 137. Which command tells you whether it was killed by the OOM killer?", `<p><code>docker inspect -f '{{.State.OOMKilled}}' &lt;container&gt;</code> (also <code>docker events --filter event=oom</code> and the kernel log). 137 only means SIGKILL (128+9); it can also come from <code>docker stop</code>/<code>docker kill</code> after the timeout, in which case <code>OOMKilled</code> is false. <code>docker logs</code> usually shows nothing because SIGKILL gives the app no chance to log.</p>`],
        ["dca", "Which restart policy restarts a container after a Docker daemon restart even if an administrator had stopped it manually before?", `<p><code>always</code>. <code>unless-stopped</code> leaves manually stopped containers stopped across daemon restarts; <code>on-failure</code> only restarts on non-zero exit; <code>no</code> never restarts.</p>`],
        ["dca", "What does --memory-swap=1g --memory=1g mean? And --memory=1g with --memory-swap unset?", `<p>Equal values mean the container may use 1 GB of RAM and <b>no</b> swap. With <code>--memory-swap</code> unset, the container may use up to 1 GB of swap in addition to 1 GB of RAM (total 2 GB) if the host has swap enabled. <code>-1</code> means unlimited swap. <code>--memory-swap</code> is the <b>total</b>, not the swap amount.</p>`],
        ["mid", "What is the difference between --cpus and --cpu-shares?", `<p><code>--cpus</code> is a hard ceiling enforced every scheduling period; the container is throttled even if the host is idle. <code>--cpu-shares</code> is a relative weight (default 1024) that matters only when CPU is contended; an idle host lets a 512-share container use all cores. Use <code>--cpus</code> for predictable isolation and shares for fair-share priorities.</p>`],
        ["senior", "Why does docker stop take exactly 10 seconds for your container, and how do you fix it?", `<p>PID 1 is not handling SIGTERM: usually a shell-form <code>CMD</code> (sh is PID 1 and does not forward), an entrypoint script missing <code>exec "$@"</code>, or an app without a SIGTERM handler, which as PID 1 ignores the signal. After the 10 s default timeout Docker sends SIGKILL (exit 137). Fix: exec-form <code>CMD</code>, <code>exec</code> in scripts, <code>--init</code>/tini, and a real SIGTERM handler that drains requests; set <code>stop_grace_period</code> above the app's own graceful timeout.</p>`],
        ["senior", "What is a zombie process and why can it appear in containers but rarely on a normal host?", `<p>A zombie is a process that has exited but whose parent has not called <code>wait()</code> to collect its status; it keeps a PID table entry. On a host, orphans are adopted by systemd, which reaps them. In a container, orphans are adopted by the container's PID 1, which is often an app (Python, Node) that never calls <code>wait()</code> for children it did not spawn, so zombies accumulate and can exhaust <code>--pids-limit</code>. tini (<code>--init</code>) reaps them.</p>`],
        ["mid", "Why is putting a database password in an environment variable discouraged, even though 12-factor says config goes in env?", `<p>Env vars are visible to anyone who can run <code>docker inspect</code>, are inherited by all child processes, appear in <code>/proc/&lt;pid&gt;/environ</code>, and are often logged by crash reporters or debug pages. 12-factor's point is separating config from code; for secrets prefer files mounted from a secret store (<code>/run/secrets</code>) with a <code>*_FILE</code> variable pointing at them.</p>`],
        ["dca", "Your hosts' disks fill up with container logs. Which daemon.json settings fix it, and do they affect running containers?", `<p>Set <code>"log-driver": "json-file"</code> with <code>"log-opts": {"max-size": "10m", "max-file": "3"}</code>, or switch to <code>"log-driver": "local"</code> which rotates by default. Restart the daemon. The settings apply only to containers <b>created</b> afterwards; existing containers must be recreated to pick them up.</p>`],
        ["lead", "How would you size memory limits for a gunicorn FastAPI service?", `<p>Measure per-worker RSS under realistic load (including peak payloads), multiply by worker count, add the master and headroom (20-30%), and set <code>--memory</code> with swap disabled. Recycle workers (<code>--max-requests</code> with jitter) to bound leaks. Alert on OOM events and on memory approaching the limit, and load-test so the first OOM happens in staging, not production.</p>`]
      ],
      gotchas: [
        `Exit 137 is not always OOM. Check <code>.State.OOMKilled</code>; a slow shutdown ending in SIGKILL also gives 137.`,
        `An OOM kill of a <b>child</b> process (gunicorn worker) does not stop the container; it looks like random 502s. Check <code>docker events</code>, <code>dmesg</code> and <code>memory.events</code>.`,
        `Runtimes that size themselves from host resources (older JVMs, Node's heap defaults, worker counts from <code>os.cpu_count()</code>) may ignore container limits; <code>os.cpu_count()</code> in Python returns host CPUs, not <code>--cpus</code>. Set worker counts explicitly.`,
        `<code>--cpus</code> throttling shows up as latency spikes, not errors; check <code>cpu.stat</code> (<code>nr_throttled</code>, <code>throttled_usec</code>).`,
        `Page cache counts toward the memory cgroup; a container doing heavy file I/O can show high usage that is reclaimable. <code>docker stats</code> subtracts some cache but numbers differ between cgroup v1 and v2.`,
        `<code>restart: always</code> on a container that crashes immediately becomes a restart loop with exponential back-off; <code>docker ps</code> shows <i>Restarting (1) …</i>. Read logs of the previous run with <code>docker logs</code>.`,
        `Changing log settings in <code>daemon.json</code> does not affect existing containers; you must recreate them (<code>docker compose up -d --force-recreate</code>).`,
        `With the default <code>blocking</code> log mode, a stalled remote logging endpoint can block the app's writes to stdout and hang requests.`,
        `<code>docker run -t</code> merges stderr into stdout (a TTY has one stream) and can add carriage returns; do not use <code>-t</code> for production services.`
      ],
      best: [
        `Set memory limits on every container (swap disabled for latency-sensitive services), CPU limits on noisy ones, and <code>--pids-limit</code> everywhere.`,
        `Use exec-form <code>CMD</code>, <code>exec "$@"</code> in entrypoints and <code>init: true</code>; test that <code>docker stop</code> returns in well under the timeout with exit 0 or 143 handled.`,
        `Align timeouts: load-balancer drain &lt; app graceful timeout &lt; <code>stop_grace_period</code>.`,
        `Use <code>unless-stopped</code> for long-running services on single hosts; let the orchestrator handle restarts in Swarm/Kubernetes.`,
        `Configure log rotation daemon-wide; log structured JSON to stdout; ship logs off-host.`,
        `Keep secrets out of env vars and images; use files and a secret manager.`
      ],
      lab: [
        `Run <code>docker run --name hog --memory 64m --memory-swap 64m python:3.12-slim python -c "bytearray(200*1024*1024)"</code>; confirm exit 137 and <code>OOMKilled=true</code>.`,
        `Run <code>alpine sleep 600</code> with and without <code>--init</code>; time <code>docker stop</code> for each and compare exit codes.`,
        `Create three containers with <code>always</code>, <code>unless-stopped</code> and <code>on-failure:3</code>; stop the first two, restart the daemon (Linux) or Docker Desktop, and record which come back.`,
        `Run <code>docker run --rm --pids-limit 20 alpine sh -c 'for i in $(seq 50); do sleep 100 &amp; done; wait'</code> and observe fork failures.`,
        `Start a container with <code>--log-opt max-size=1m --log-opt max-file=2</code> that prints in a loop; check that the log files on disk never exceed ~2 MB.`,
        `<b>Done when:</b> you can explain each result: why 137, why 10 s, why the restart behaviour differed, and where the logs were rotated.`
      ],
      teach: `<p>"In production every container gets limits. Memory is a hard cap: exceed it and the kernel's OOM killer SIGKILLs the process, which Docker shows as exit 137 with <code>OOMKilled</code> true. CPU via <code>--cpus</code> is a quota that throttles; <code>--cpu-shares</code> is just a weight under contention. <code>--pids-limit</code> stops fork bombs.</p>
<p>Stopping is SIGTERM, a grace period of 10 seconds by default, then SIGKILL. The catch is PID 1: the kernel will not apply default signal actions to it, so if your app is behind a shell or has no handler, it ignores SIGTERM and gets killed mid-request. Use exec-form CMD, <code>exec</code> in entrypoint scripts and <code>--init</code>, which runs tini to forward signals and reap zombies, and make the grace period longer than gunicorn's graceful timeout.</p>
<p>Restart policies: on-failure for non-zero exits, always and unless-stopped for services, and they differ only after a manual stop plus daemon restart. Logs go to stdout; the default json-file driver does not rotate, so set max-size and max-file or use the local driver, and remember those settings only apply to new containers."</p>`
    },
    {
      id: "d6-registries",
      title: "Registries, tagging, CI pipelines and daemon configuration",
      lv: ["fresher", "mid", "senior", "lead", "dca"],
      eli5: `<p>A <b>registry</b> is a warehouse for images. Docker Hub is the big public warehouse; GHCR, ECR, ACR and Artifact Registry are warehouses run by GitHub and the clouds; you can also run your own small warehouse in the back yard (<code>registry:2</code>).</p>
<p>Every box in the warehouse has an address label: <i>which warehouse / whose shelf / which product : which version</i>, for example <code>ghcr.io/acme/orders-api:1.4.2</code>. <b>Tagging</b> is writing a label; <b>pushing</b> is delivering the box; <b>pulling</b> is fetching it. A label like <code>latest</code> is a sticky note that keeps getting moved to the newest box, so it is a terrible way to say exactly which box you want.</p>
<p>The <b>CI pipeline</b> is the factory conveyor belt: code comes in, gets tested, packed into an image, X-rayed for problems (scanning), labelled and put in the warehouse; the delivery truck (deployment) only takes boxes from the warehouse. <code>daemon.json</code> is the instruction sheet taped inside each delivery truck: where to keep logs, which nearby warehouse to try first (mirror), which warehouses do not need ID checks.</p>`,
      what: `<p>A <b>registry</b> is an HTTP service implementing the OCI Distribution API (<code>/v2/…</code>): it stores <b>blobs</b> (layers and configs, addressed by SHA-256 digest) and <b>manifests</b> (and multi-platform indexes), organised into <b>repositories</b>, with <b>tags</b> as mutable names pointing at manifests.</p>
<ul class="pts">
<li><b>Docker Hub</b> (<code>docker.io</code>, the default): official images under <code>library/</code>, public and private repos, pull rate limits for anonymous and free users.</li>
<li><b>GHCR</b> (<code>ghcr.io/&lt;owner&gt;/&lt;image&gt;</code>): GitHub Container Registry, auth via <code>GITHUB_TOKEN</code> in Actions or a PAT.</li>
<li><b>Amazon ECR</b> (<code>&lt;account&gt;.dkr.ecr.&lt;region&gt;.amazonaws.com/&lt;repo&gt;</code>): repositories must be created first; supports tag immutability, lifecycle policies and scanning.</li>
<li><b>Azure ACR</b> (<code>&lt;name&gt;.azurecr.io</code>) and <b>Google Artifact Registry</b> (<code>&lt;region&gt;-docker.pkg.dev/&lt;project&gt;/&lt;repo&gt;/&lt;image&gt;</code>; the older Container Registry <code>gcr.io</code> has been superseded by Artifact Registry).</li>
<li><b>Self-hosted</b>: <code>registry:2</code> (CNCF Distribution) for simple cases; Harbor, Nexus, Artifactory or Mirantis Secure Registry for RBAC, scanning, replication and UI.</li>
</ul>
<p><b>Naming.</b> A full reference is <code>[registry-host[:port]/][namespace/]repository[:tag][@digest]</code>. If the first component has no <code>.</code> or <code>:</code> and is not <code>localhost</code>, it is not a registry host, so <code>nginx</code> means <code>docker.io/library/nginx:latest</code> and <code>acme/api</code> means <code>docker.io/acme/api:latest</code>. Repository names are lowercase (letters, digits, separators <code>.</code> <code>_</code> <code>-</code> and <code>/</code>); tags are up to 128 characters of <code>[A-Za-z0-9_.-]</code> and cannot start with <code>.</code> or <code>-</code>.</p>
<p><b>Authentication.</b> <code>docker login &lt;registry&gt;</code> stores credentials for that host in <code>~/.docker/config.json</code>. Without a credential helper they are stored only base64-encoded (Docker warns "unencrypted"). Configure <code>"credsStore"</code> (<code>desktop</code>, <code>osxkeychain</code>, <code>wincred</code>, <code>pass</code>, <code>secretservice</code>) to use the OS keychain, or per-registry <code>"credHelpers"</code> (for example <code>ecr-login</code>, <code>gcloud</code>) that mint short-lived tokens. In CI use <code>--password-stdin</code> and short-lived tokens (OIDC to the cloud), never a password in the command line (it ends up in shell history and process lists).</p>
<p><b>Tag, push, pull.</b> <code>docker tag SOURCE TARGET</code> adds another name to the same image ID (no copy). <code>docker push</code> uploads only the blobs the registry does not already have (cross-repository blob mounts avoid re-uploading shared base layers). <code>docker pull</code> resolves tag → manifest (or index → platform manifest) → blobs. <code>docker image push --all-tags</code> pushes every tag of a repository.</p>
<p><b>Rate limits.</b> Docker Hub limits pulls (manifest requests) by IP for anonymous users and by account for authenticated users, with higher or no limits for paid plans; the exact numbers have changed over time, so check Docker's current documentation. Mitigate with authentication in CI, a pull-through cache (<code>registry-mirrors</code> or a cloud pull-through cache), and mirroring base images into your own registry.</p>
<p><b>Tag strategy.</b></p>
<ul class="pts">
<li>Every build gets an <b>immutable, unique</b> tag: the git SHA (<code>sha-3f9e2c1</code>) and, for releases, semver (<code>1.4.2</code>), optionally moving convenience tags (<code>1.4</code>, <code>1</code>) for humans.</li>
<li><b>Never deploy <code>:latest</code></b>: it is just the default tag name, not "the newest"; it moves, so two nodes can run different code under the same name, rollbacks are ambiguous, and <code>docker run</code> does not re-pull it if a local copy exists.</li>
<li>Turn on <b>tag immutability</b> in the registry (ECR, ACR, Harbor, MSR support it) so a tag cannot be overwritten; deploy by digest for maximum certainty.</li>
<li>Promote the <b>same</b> image across environments (re-tag or copy <code>staging</code> → <code>prod</code>); never rebuild per environment.</li>
</ul>
<p><b>A typical pipeline:</b> Git push → CI → lint and unit tests → <code>docker build</code> (BuildKit, with registry or GHA cache) → integration tests against the built image (Compose with Postgres/Redis) → security scan (fail on fixable critical/high) → push with SHA and version tags (plus SBOM/provenance) → deploy by tag/digest (Compose on a host via <code>docker context</code>, Swarm, Kubernetes, ECS) → smoke test and rollback on failure.</p>
<p><b>Daemon configuration.</b> <code>dockerd</code> reads <code>/etc/docker/daemon.json</code> on Linux (Docker Desktop exposes it in Settings → Docker Engine; Windows Server uses <code>C:\\ProgramData\\docker\\config\\daemon.json</code>). Key options:</p>
<ul class="pts">
<li><code>log-driver</code>, <code>log-opts</code>: defaults for new containers.</li>
<li><code>registry-mirrors</code>: pull-through mirrors, used <b>only for Docker Hub</b> images.</li>
<li><code>insecure-registries</code>: registries allowed over plain HTTP or with untrusted TLS (localhost/127.0.0.0/8 is already allowed). Prefer proper TLS or adding a CA under <code>/etc/docker/certs.d/&lt;host:port&gt;/ca.crt</code>.</li>
<li><code>data-root</code>: where images, containers and volumes live (default <code>/var/lib/docker</code>); move it to a bigger disk.</li>
<li><code>live-restore</code>: keep containers running while dockerd is stopped or upgraded (not compatible with Swarm mode).</li>
<li><code>default-address-pools</code>: subnets for user-defined networks, to avoid clashing with VPN or corporate ranges (the defaults include 172.17-31.x.x and 192.168.x.x).</li>
<li>Also: <code>features</code> (for example <code>"containerd-snapshotter": true</code> for the containerd image store), <code>storage-driver</code>, <code>dns</code>, <code>userns-remap</code>, <code>no-new-privileges</code>, <code>metrics-addr</code>.</li>
</ul>
<p>An option must not be set both in <code>daemon.json</code> and as a <code>dockerd</code> flag (for example <code>hosts</code> vs <code>-H</code> in the systemd unit): the daemon refuses to start. Some options can be reloaded with <code>SIGHUP</code> (<code>systemctl reload docker</code>), for example <code>debug</code>, <code>labels</code>, <code>live-restore</code>, <code>insecure-registries</code>, <code>registry-mirrors</code>; most others need a restart. Recent engines can validate the file with <code>dockerd --validate</code>.</p>
<p><b>docker context</b> stores named endpoints (local socket, <code>ssh://user@host</code>, <code>tcp://host:2376</code> with TLS) so the same CLI drives remote engines: <code>docker context create</code>, <code>docker context use</code>, per-command <code>docker --context prod …</code>, or <code>DOCKER_CONTEXT</code>. <code>DOCKER_HOST</code> overrides the context.</p>`,
      why: `<p>Images built on a laptop and copied with <code>docker save | ssh | docker load</code> do not scale: no history, no access control, no way to know what runs where. Registries give a single source of truth with content-addressed, verifiable images, access control and replication; tags and digests let every environment refer to exactly the same bits.</p>
<p>The pipeline exists because humans forget steps: tests, scans, labels and SBOMs are only consistent when a machine does them on every commit. Tag discipline exists because "which version is in production?" must have a one-word answer, and rollbacks must be instant and unambiguous. Daemon configuration exists because defaults (unrotated logs, Docker Hub only, overlapping subnets, <code>/var/lib/docker</code> on a small root disk) are reasonable for a laptop and wrong for a fleet.</p>`,
      diagram: {
        html: flow([["Git push", "PR or main", "w"], ["CI", "lint + unit tests"], ["docker build", "BuildKit + cache"], ["Integration test", "compose: pg + redis"], ["Scan", "Trivy / Scout, fail on high", "r"], ["Registry", "push :sha + :1.4.2, SBOM", "g"], ["Deploy", "by tag or digest", "g"]]),
        steps: [
          `A push triggers CI, which runs fast checks before spending time on images.`,
          `BuildKit builds the image using a cache (GitHub Actions cache or a registry cache) so only changed layers rebuild.`,
          `The built image is tested as-is with real PostgreSQL and Redis containers, then scanned; the pipeline fails on fixable high/critical CVEs.`,
          `Only a passing image is pushed with immutable tags (git SHA, semver) plus attestations; deployment pulls exactly that tag or digest, and promotion to production re-uses it rather than rebuilding.`
        ]
      },
      cmds: [
        {
          t: "Log in to common registries without leaking passwords",
          lang: "sh",
          code: `# Docker Hub (use an access token, not your password)
echo "$DOCKERHUB_TOKEN" | docker login -u acmebot --password-stdin
# GitHub Container Registry
echo "$GHCR_TOKEN" | docker login ghcr.io -u acme-ci --password-stdin
# Amazon ECR (token valid for 12 hours)
aws ecr get-login-password --region eu-west-1 | docker login --username AWS --password-stdin 123456789012.dkr.ecr.eu-west-1.amazonaws.com
# Azure Container Registry
az acr login --name acmeregistry
# Google Artifact Registry (installs gcloud as a credential helper)
gcloud auth configure-docker europe-west1-docker.pkg.dev
cat ~/.docker/config.json`,
          out: `Login Succeeded
{
  "auths": { "ghcr.io": {}, "https://index.docker.io/v1/": {} },
  "credsStore": "desktop",
  "credHelpers": { "europe-west1-docker.pkg.dev": "gcloud" }
}`,
          note: `<p>With a <code>credsStore</code>, <code>auths</code> entries are empty placeholders and the secrets are in the OS keychain. Without one, each entry has an <code>"auth"</code> field that is just base64 of <code>user:password</code>.</p>`
        },
        {
          t: "Tag and push with immutable tags; pull by digest",
          lang: "sh",
          code: `SHA=$(git rev-parse --short HEAD)
REPO=ghcr.io/acme/orders-api
docker tag orders-api:1.4.2 $REPO:1.4.2
docker tag orders-api:1.4.2 $REPO:sha-$SHA
docker push $REPO:1.4.2
docker push $REPO:sha-$SHA
docker buildx imagetools inspect $REPO:1.4.2 --format '{{json .Manifest.Digest}}'
docker pull $REPO@sha256:<digest>
docker image ls --digests $REPO`,
          out: `The push refers to repository [ghcr.io/acme/orders-api]
5f70bf18a086: Pushed
a1c3b2d4e5f6: Mounted from library/python
…
1.4.2: digest: sha256:7e1a…c9 size: 1786`,
          note: `<p>"Mounted from" means the registry linked an existing blob instead of uploading it again. Both tags point at the same digest; the second push uploads nothing.</p>`
        },
        {
          t: "Run a private registry (registry:2) and push to it",
          lang: "sh",
          code: `docker run -d --name registry --restart unless-stopped -p 5000:5000 \\
  -v registry-data:/var/lib/registry registry:2
docker tag orders-api:1.4.2 localhost:5000/acme/orders-api:1.4.2
docker push localhost:5000/acme/orders-api:1.4.2
curl -s http://localhost:5000/v2/_catalog
curl -s http://localhost:5000/v2/acme/orders-api/tags/list`,
          out: `{"repositories":["acme/orders-api"]}
{"name":"acme/orders-api","tags":["1.4.2"]}`,
          note: `<p><code>localhost:5000</code> works over HTTP because loopback registries are trusted by default. From another machine, <code>registry.internal:5000</code> needs TLS (put the CA in <code>/etc/docker/certs.d/registry.internal:5000/ca.crt</code>) or an <code>insecure-registries</code> entry. For real use add authentication (htpasswd or token auth) and TLS.</p>`
        },
        {
          t: "Check your Docker Hub rate-limit headers",
          lang: "sh",
          code: `TOKEN=$(curl -s "https://auth.docker.io/token?service=registry.docker.io&scope=repository:ratelimitpreview/test:pull" | jq -r .token)
curl -s --head -H "Authorization: Bearer $TOKEN" https://registry-1.docker.io/v2/ratelimitpreview/test/manifests/latest | grep -i ratelimit`,
          out: `ratelimit-limit: 100;w=21600
ratelimit-remaining: 97;w=21600`,
          note: `<p>The numbers shown are an example of the header format (limit; window in seconds); actual limits depend on your plan and Docker's current policy.</p>`
        },
        {
          t: "GitHub Actions: build, test, scan and push with cache",
          lang: "yaml",
          code: `name: orders-api
on:
  push:
    branches: [main]
    tags: ["v*"]
permissions:
  contents: read
  packages: write
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: \${{ github.actor }}
          password: \${{ secrets.GITHUB_TOKEN }}
      - id: meta
        uses: docker/metadata-action@v5
        with:
          images: ghcr.io/acme/orders-api
          tags: |
            type=sha,prefix=sha-
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
      - name: Run tests in the test stage
        uses: docker/build-push-action@v6
        with:
          target: test
          cache-from: type=gha
          cache-to: type=gha,mode=max
      - name: Build image for scanning
        uses: docker/build-push-action@v6
        with:
          load: true
          tags: orders-api:ci
          cache-from: type=gha
      - name: Scan
        uses: aquasecurity/trivy-action@0.28.0
        with:
          image-ref: orders-api:ci
          severity: CRITICAL,HIGH
          ignore-unfixed: true
          exit-code: "1"
      - name: Push
        uses: docker/build-push-action@v6
        with:
          push: true
          tags: \${{ steps.meta.outputs.tags }}
          labels: \${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          sbom: true
          provenance: mode=max`,
          note: `<p><code>metadata-action</code> generates tags and the OCI labels (source, revision, created…). <code>type=gha</code> stores BuildKit cache in the GitHub Actions cache; <code>mode=max</code> also caches intermediate stages. The third build reuses the cache, so it is fast. Pin action versions (ideally by commit SHA) in real pipelines; versions shown are examples.</p>`
        },
        {
          t: "A production daemon.json",
          lang: "json",
          code: `{
  "data-root": "/data/docker",
  "log-driver": "local",
  "log-opts": { "max-size": "20m", "max-file": "5" },
  "registry-mirrors": ["https://mirror.internal.example.com"],
  "insecure-registries": ["registry.lab.internal:5000"],
  "live-restore": true,
  "default-address-pools": [
    { "base": "10.210.0.0/16", "size": 24 }
  ],
  "features": { "buildkit": true }
}`,
          note: `<p>Apply with <code>sudo systemctl restart docker</code> (or <code>reload</code> for reloadable keys) and check with <code>docker info</code>. Moving <code>data-root</code> does not migrate existing data; stop Docker and copy (<code>rsync -aHAX</code>) the old directory first. Do not combine <code>live-restore</code> with Swarm mode.</p>`
        },
        {
          t: "Verify the daemon configuration and drive a remote engine with docker context",
          lang: "sh",
          code: `sudo dockerd --validate --config-file /etc/docker/daemon.json
sudo systemctl restart docker
docker info --format '{{.DockerRootDir}} {{.LoggingDriver}} {{.LiveRestoreEnabled}}'
docker info | sed -n '/Registry Mirrors/,/Live Restore/p'

docker context create prod --description "prod host" --docker "host=ssh://deploy@prod-1.example.com"
docker context ls
docker --context prod ps
docker context use prod
docker compose -f compose.prod.yaml up -d
docker context use default`,
          out: `configuration OK
/data/docker local true
 Registry Mirrors:
  https://mirror.internal.example.com/
 Live Restore Enabled: true
NAME        DESCRIPTION                               DOCKER ENDPOINT
default *   Current DOCKER_HOST based configuration   unix:///var/run/docker.sock
prod        prod host                                 ssh://deploy@prod-1.example.com`,
          note: `<p>The SSH context needs key-based SSH access and the remote user must be allowed to use the Docker socket (membership in the <code>docker</code> group is effectively root on that host). <code>--validate</code> exists on recent engines only.</p>`
        }
      ],
      internals: `<p><b>Push.</b> The client asks dockerd to push; dockerd (or the containerd image store) authenticates with a bearer token obtained from the registry's token service (the <code>WWW-Authenticate</code> challenge on <code>/v2/</code>), then for each layer does <code>HEAD /v2/&lt;repo&gt;/blobs/&lt;digest&gt;</code>; missing blobs are uploaded via <code>POST</code> + <code>PATCH</code>/<code>PUT /blobs/uploads/</code> (or cross-mounted from another repository with <code>?mount=&lt;digest&gt;&amp;from=&lt;repo&gt;</code>). Finally <code>PUT /v2/&lt;repo&gt;/manifests/&lt;tag&gt;</code> uploads the manifest; the registry computes its digest and moves the tag.</p>
<p><b>Pull.</b> <code>GET /v2/&lt;repo&gt;/manifests/&lt;tag&gt;</code> with <code>Accept</code> headers for OCI/Docker index and manifest types returns either a manifest or an index; for an index the engine picks the entry matching its platform (<code>linux/amd64</code>, <code>linux/arm64</code>…). Blobs are fetched in parallel (<code>max-concurrent-downloads</code>), verified by SHA-256, decompressed and unpacked by the storage driver into layer directories. Docker Hub counts manifest GETs toward rate limits; blob GETs do not count.</p>
<p><b>Credentials.</b> The CLI, not dockerd, reads <code>~/.docker/config.json</code>, calls the credential helper binary (<code>docker-credential-&lt;name&gt; get</code> with the server URL on stdin) and sends the credentials with the API request to dockerd as an <code>X-Registry-Auth</code> header. That is why <code>sudo docker pull</code> uses root's config, not yours.</p>
<p><b>Mirrors.</b> With <code>registry-mirrors</code>, a pull of a Docker Hub image first tries the mirror; on failure it falls back to Docker Hub. Images from other registries ignore mirrors. A <code>registry:2</code> configured with <code>proxy.remoteurl: https://registry-1.docker.io</code> acts as a pull-through cache.</p>
<p><b>daemon.json and systemd.</b> On Linux, systemd starts <code>dockerd</code> with flags from <code>docker.service</code> (often <code>-H fd:// --containerd=/run/containerd/containerd.sock</code>); dockerd merges them with <code>daemon.json</code> and errors on conflicts. Override flags with <code>systemctl edit docker</code> (a drop-in), not by editing the packaged unit. <code>docker info</code> shows the effective configuration.</p>
<p><b>Contexts</b> are stored under <code>~/.docker/contexts/</code> (metadata and TLS material). With an <code>ssh://</code> host, the CLI runs <code>ssh … docker system dial-stdio</code> on the remote and tunnels the API over SSH; no TCP port needs to be opened on the engine.</p>`,
      prod: `<p>For the React/FastAPI/Redis/PostgreSQL product:</p>
<ul class="pts">
<li><b>Images:</b> <code>ghcr.io/acme/web</code> and <code>ghcr.io/acme/orders-api</code> built by the workflow above. Every main-branch commit produces <code>sha-&lt;sha&gt;</code>; a git tag <code>v1.4.2</code> produces <code>1.4.2</code> and <code>1.4</code>. Postgres and Redis images are mirrored into the company registry pinned by digest to avoid Docker Hub limits and surprise updates.</li>
<li><b>Environments:</b> staging deploys <code>sha-…</code> automatically; production deploys the same digest after approval. The deploy step writes the tag into an env file used by <code>compose.prod.yaml</code> (<code>image: ghcr.io/acme/orders-api:\${API_TAG}</code>) and runs <code>docker --context prod compose up -d</code>; rollback means setting the previous tag.</li>
<li><b>Hosts:</b> <code>daemon.json</code> managed by Ansible/cloud-init: <code>local</code> log driver with rotation, <code>data-root</code> on a separate volume, <code>live-restore</code> so engine upgrades do not restart Postgres, address pools that do not overlap the VPN, and a registry mirror.</li>
<li><b>Registry hygiene:</b> tag immutability on; lifecycle rules delete untagged and old <code>sha-</code> images after N days but keep released semver tags; vulnerability scanning on push with notifications.</li>
</ul>`,
      iq: [
        ["dca", "What is the full name of the image referenced as 'nginx'? And 'myuser/app'?", `<p><code>docker.io/library/nginx:latest</code> and <code>docker.io/myuser/app:latest</code>. The registry defaults to Docker Hub, the namespace for single-component names to <code>library</code> (official images), and the tag to <code>latest</code>. A first component containing <code>.</code> or <code>:</code> (or <code>localhost</code>) is treated as a registry host.</p>`],
        ["dca", "You run a registry at registry.lab:5000 with a self-signed certificate and docker pull fails with 'x509: certificate signed by unknown authority'. Which TWO fixes work? (a) Copy the CA to /etc/docker/certs.d/registry.lab:5000/ca.crt (b) Add registry.lab:5000 to insecure-registries in daemon.json and restart/reload (c) Run docker login with --insecure (d) Set registry-mirrors to the registry", `<p><b>(a) and (b).</b> (a) makes the engine trust the CA for that host and is the preferred fix; (b) disables certificate verification for that registry (less secure). <code>docker login</code> has no <code>--insecure</code> flag, and <code>registry-mirrors</code> only applies to Docker Hub images.</p>`],
        ["dca", "Where is the Docker daemon configuration file on a Linux host, and what happens if you set 'hosts' in it while the systemd unit also passes -H?", `<p><code>/etc/docker/daemon.json</code>. dockerd refuses to start because the same option is configured both as a flag and in the file. Remove one of them, typically by adding a systemd drop-in that clears <code>ExecStart</code> and starts <code>dockerd</code> without <code>-H</code>.</p>`],
        ["mid", "Why should production never deploy the :latest tag?", `<p><code>latest</code> is only the default tag name. It moves with every push, so the same reference can mean different code on different nodes or at different times; <code>docker run</code> will not re-pull it if a local copy exists; and rollback is ambiguous. Deploy unique immutable tags (git SHA, semver) or digests, and enable tag immutability in the registry.</p>`],
        ["mid", "What does docker tag actually do?", `<p>It creates another reference (name) to an existing local image ID. No data is copied and no new image is created; <code>docker image ls</code> shows two rows with the same IMAGE ID. Pushing the new name uploads only blobs the target registry is missing.</p>`],
        ["senior", "How do you keep registry credentials safe on developer machines and in CI?", `<p>On machines: a credential store (<code>credsStore</code>: keychain, wincred, pass, Desktop) instead of base64 in <code>config.json</code>. In CI: short-lived tokens (GitHub's <code>GITHUB_TOKEN</code>, OIDC federation to AWS/Azure/GCP so no long-lived keys exist), <code>--password-stdin</code>, least-privilege robot accounts (push only to their repos), and logout/ephemeral runners.</p>`],
        ["lead", "Design a promotion flow from staging to production that guarantees the tested bits are deployed.", `<p>Build once per commit, push with an immutable SHA tag and record the digest. Staging deploys that digest; after tests and approval, production deploys the <b>same digest</b> (optionally adding a <code>prod-YYYYMMDD</code> or semver tag via <code>docker buildx imagetools create --tag</code> without rebuilding, or copying between registries with <code>crane</code>/<code>skopeo</code>). Enable tag immutability, sign the image and verify signature/attestations at deploy (Day 7). Never rebuild for production: a rebuild can pick up different dependencies.</p>`],
        ["dca", "Which daemon.json option keeps containers running while the Docker daemon is restarted, and in which mode is it not supported?", `<p><code>"live-restore": true</code>. It is not compatible with Swarm mode (Swarm manages task restarts itself). It also only covers daemon restarts/upgrades within compatible versions, not host reboots.</p>`]
      ],
      gotchas: [
        `<code>registry-mirrors</code> only affects Docker Hub images; pulls from <code>ghcr.io</code> or ECR never use it.`,
        `<code>sudo docker login</code> writes to root's <code>~/.docker/config.json</code>; a later non-sudo <code>docker pull</code> does not see those credentials (and vice versa).`,
        `ECR repositories must exist before you push, and ECR tokens expire after 12 hours; long-running hosts need the <code>ecr-login</code> credential helper.`,
        `Uppercase letters in a repository name are rejected (<i>repository name must be lowercase</i>), a common surprise when using the GitHub org name in GHCR paths.`,
        `Changing <code>default-address-pools</code> or <code>data-root</code> does not move existing networks or data; existing networks keep their subnets and old data stays in the old directory.`,
        `Pushing the same tag again silently overwrites it in registries without immutability; a cached node then runs old code while a fresh node runs new code under the same name.`,
        `Deleting a tag in <code>registry:2</code> does not free disk space; you must run its garbage collector (with the registry read-only or stopped).`,
        `<code>DOCKER_HOST</code> set in your shell silently overrides <code>docker context use</code>.`
      ],
      best: [
        `Use a credential helper everywhere and short-lived OIDC tokens in CI.`,
        `Tag every image with the git SHA, add semver for releases, enable immutability, and deploy by tag or digest, never <code>latest</code>.`,
        `Build once, test the built image, scan, then promote the same digest through environments.`,
        `Mirror or cache base images in your own registry and pin them by digest.`,
        `Manage <code>daemon.json</code> as code (Ansible, cloud-init) with rotation, data-root, live-restore and non-overlapping address pools.`,
        `Use <code>docker context</code> with SSH for remote hosts instead of exposing the TCP API; if you must expose TCP, require mutual TLS on port 2376.`
      ],
      lab: [
        `Start <code>registry:2</code> on port 5000 with a named volume; tag your <code>orders-api</code> image as <code>localhost:5000/acme/orders-api:1.0.0</code> and <code>…:sha-&lt;git sha&gt;</code> and push both.`,
        `Query <code>/v2/_catalog</code> and <code>/v2/acme/orders-api/tags/list</code> with curl; delete the local image and pull it back by digest.`,
        `Add <code>log-driver</code>/<code>log-opts</code> and <code>default-address-pools</code> to <code>daemon.json</code> (Linux, or Docker Desktop's Docker Engine settings), restart, and confirm with <code>docker info</code> and by creating a new network.`,
        `Create a <code>docker context</code> to a second machine or VM over SSH and run <code>docker --context &lt;name&gt; ps</code>.`,
        `Write the GitHub Actions workflow above for a sample repo (or read it carefully and annotate each step).`,
        `<b>Done when:</b> you can pull your image by digest from your own registry, <code>docker info</code> shows your log driver and live-restore settings, and you can explain each pipeline stage and why <code>latest</code> is not deployed.`
      ],
      teach: `<p>"A registry stores image layers and manifests by content hash, and tags are just movable names on top. An image reference is registry, namespace, repo and tag; if you omit them you get <code>docker.io</code>, <code>library</code> and <code>latest</code>. I log in with credential helpers so passwords are not sitting base64-encoded in <code>config.json</code>, and in CI with short-lived tokens via <code>--password-stdin</code>.</p>
<p>Every build gets an immutable tag: the git SHA, and semver for releases. We never deploy <code>latest</code>, because it moves and is not even re-pulled if cached. The pipeline is: test, build with cache, test the image, scan it, push with tags and SBOM, then deploy the same digest to staging and production.</p>
<p>On each host, <code>daemon.json</code> sets the log driver with rotation, registry mirrors for Docker Hub, insecure registries if we must, the data root, live-restore so containers survive engine restarts, and address pools that do not clash with our VPN. To manage remote hosts I use <code>docker context</code> over SSH instead of opening the Docker API port."</p>`
    }
  ],
  quiz: [
    {
      q: `Your FastAPI container restarts every few hours. <code>docker ps</code> shows <i>Up 12 minutes</i>, and <code>docker inspect</code> shows the following. What happened and what do you do first?`,
      code: `$ docker inspect -f '{{.RestartCount}} {{.State.ExitCode}} {{.State.OOMKilled}}' api
4 137 true`,
      lang: "sh",
      ans: `The process exceeded its memory limit and the kernel OOM killer SIGKILLed it; the restart policy brought it back four times.`,
      why: `137 = 128 + SIGKILL and <code>OOMKilled=true</code> confirms the cgroup OOM killer, not a slow <code>docker stop</code>. First measure memory over time (<code>docker stats</code>, metrics) to tell a leak from an undersized limit; then fix the leak, reduce workers, recycle workers with <code>--max-requests</code>, or raise the limit. Raising the limit blindly just delays a leak.`
    },
    {
      q: `Deploys of the API always take about 10 seconds per container and users see a few 502 errors during each deploy. The Dockerfile ends like this. What is wrong?`,
      code: `COPY entrypoint.sh /entrypoint.sh
ENTRYPOINT /entrypoint.sh
# entrypoint.sh ends with:  gunicorn app.main:app -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000`,
      lang: "dockerfile",
      ans: `Shell-form ENTRYPOINT and no exec in the script: a shell is PID 1 and never forwards SIGTERM, so gunicorn is SIGKILLed after 10 s.`,
      why: `Use <code>ENTRYPOINT ["/entrypoint.sh"]</code>, end the script with <code>exec gunicorn …</code> (or <code>exec "$@"</code> with a CMD), and consider <code>init: true</code>. Then gunicorn receives SIGTERM and drains requests; set <code>stop_grace_period</code> above gunicorn's <code>--graceful-timeout</code>. Raising the stop timeout alone would only make deploys slower.`
    },
    {
      q: `A team switches its Python base image from <code>python:3.12-slim</code> to <code>python:3.12-alpine</code> "to save space". The build now takes 12 minutes instead of 1 and the image is bigger. Why?`,
      ans: `Alpine uses musl, so dependencies without musllinux wheels compile from source, requiring compilers that end up in the image.`,
      why: `On glibc-based slim images pip downloads prebuilt manylinux wheels. On Alpine it needs <code>gcc</code>, <code>musl-dev</code>, headers, and compiles. Without a multi-stage build those tools stay in the image. Go back to slim (or distroless) with a multi-stage build; Alpine is a good fit for Nginx and static binaries, not automatically for Python.`
    },
    {
      q: `An administrator stopped a container for maintenance. After a kernel patch and reboot, the container is running again although nobody started it. Which restart policy was set, and which would have kept it stopped?`,
      ans: `It was <code>--restart always</code>; <code>unless-stopped</code> would have kept it stopped.`,
      why: `Both <code>always</code> and <code>unless-stopped</code> restart on failures and on daemon start, but <code>always</code> ignores a previous manual stop when the daemon starts. <code>on-failure</code> would not have started it either (it had not failed), and <code>no</code> never restarts.`
    },
    {
      q: `CI pushes <code>ghcr.io/acme/orders-api:latest</code> on every merge and production hosts run <code>docker compose up -d</code>. After a bad release, half the hosts run the new code and half the old. Explain and propose a fix.`,
      ans: `<code>latest</code> is mutable and only re-pulled when explicitly pulled; hosts with a cached copy kept the old image. Deploy immutable SHA/semver tags or digests.`,
      why: `<code>docker compose up -d</code> does not pull a tag that already exists locally (unless <code>--pull always</code> or <code>pull_policy</code> is set). Use unique tags written into the deploy config, enable registry tag immutability, and roll back by redeploying the previous tag.`
    },
    {
      q: `Developers at a new office cannot reach any service after <code>docker compose up</code>; their VPN uses 172.20.0.0/14. What daemon.json setting do you change?`,
      code: `{
  "default-address-pools": [ { "base": "10.210.0.0/16", "size": 24 } ]
}`,
      lang: "json",
      ans: `Set <code>default-address-pools</code> to a range that does not overlap the VPN, restart the daemon and recreate the networks.`,
      why: `Docker allocates user-defined (Compose) networks from 172.17-31.x.x and 192.168.x.x by default; an overlapping bridge subnet hijacks routes to the VPN. Existing networks keep their subnets, so run <code>docker compose down</code> and <code>up</code> again after the change. <code>bip</code> changes only the default <code>docker0</code> bridge.`
    }
  ]
},
/* ===== Day 7 ===== */
{
  n: 7,
  title: "Security",
  goal: `<b>By the end of today</b> you can explain the container threat model (a shared kernel), harden a container with capabilities, seccomp, AppArmor/SELinux, a read-only root filesystem, <code>no-new-privileges</code>, user namespaces and rootless mode, and secure the supply chain with scanning, SBOMs, provenance, signing and build secrets, including the enterprise concepts the DCA still asks about.`,
  rev: [
    `<b>Threat model:</b> containers share the host kernel; isolation = namespaces + cgroups + capabilities + seccomp + LSM (AppArmor/SELinux). Root in a container is host root with fewer privileges unless user namespaces are used.`,
    `<b>Hardening flags:</b> <code>--cap-drop ALL --cap-add NET_BIND_SERVICE</code>, <code>--security-opt no-new-privileges</code>, <code>--read-only --tmpfs /tmp</code>, non-root <code>--user</code>, memory/CPU/<code>--pids-limit</code>, separate networks. Never <code>--privileged</code> or mount <code>/var/run/docker.sock</code> without understanding it equals host root.`,
    `<b>Daemon-level:</b> <code>userns-remap</code> maps container root to an unprivileged host UID range; rootless mode runs dockerd itself as a normal user; default seccomp profile blocks dozens of dangerous syscalls; <code>docker-default</code> AppArmor profile on Debian/Ubuntu.`,
    `<b>Supply chain:</b> scan images (<code>docker scout cves</code>, <code>trivy image</code>), rebuild on base updates, attach SBOM and provenance (<code>buildx --sbom --provenance</code>), sign (DCT <code>DOCKER_CONTENT_TRUST=1</code> + <code>docker trust sign</code>; cosign/Notation today).`,
    `<b>Secrets:</b> <code>ARG</code>/<code>ENV</code> values leak into <code>docker history</code>/<code>inspect</code>; use <code>RUN --mount=type=secret</code> for build secrets and Swarm/Compose secrets at run time (<code>/run/secrets/&lt;name&gt;</code>). Enterprise (MKE/MSR, formerly UCP/DTR): RBAC grants, scanning, promotion policies.`
  ],
  topics: [
    {
      id: "d7-security",
      title: "Container security: capabilities, seccomp, AppArmor, user namespaces and rootless",
      lv: ["mid", "senior", "lead", "architect", "dca"],
      eli5: `<p>Containers are like <b>apartments in one building</b>. Each apartment has its own door, its own mailbox and its own view (namespaces), and a meter limiting water and electricity (cgroups). But all apartments share the same foundations, pipes and electrical system: the <b>kernel</b>. A virtual machine is a separate house; a container is an apartment. If someone finds a crack in the shared foundations, they can reach other apartments.</p>
<p>So the building adds more rules. <b>Capabilities</b> split the master key into fourteen small keys and give each tenant only the ones they need. <b>Seccomp</b> is a list of things you are not allowed to ask the building manager to do ("rewire the building", "reboot the lifts"). <b>AppArmor/SELinux</b> are security guards with a list of rooms each tenant may enter. <b>User namespaces</b> mean the person who calls themselves "owner" inside the apartment is, to the building, just a visitor with a badge number.</p>
<p><code>--privileged</code> hands a tenant every key, removes the guards and the list. Mounting the Docker socket gives a tenant the building manager's phone: they can order a new apartment with the foundations wired straight into it. Both turn an apartment back into the whole building.</p>`,
      what: `<p><b>Threat model.</b> A container is a set of ordinary Linux processes in the host's kernel. Isolation comes from several layers, each of which can be weakened by configuration:</p>
<ul class="pts">
<li><b>Namespaces</b> (pid, net, mnt, uts, ipc, user, cgroup) limit what the process can <i>see</i>.</li>
<li><b>cgroups</b> limit what it can <i>consume</i> (memory, CPU, PIDs, I/O); without them one container can DoS the host.</li>
<li><b>Capabilities</b> split root's power into units; Docker gives containers a reduced default set.</li>
<li><b>seccomp</b> filters which system calls the process may make at all.</li>
<li><b>LSMs</b> (AppArmor on Debian/Ubuntu, SELinux on RHEL/Fedora) restrict file, mount and other operations by policy.</li>
<li><b>User namespaces</b> make UID 0 inside the container map to an unprivileged UID on the host.</li>
</ul>
<p>The main risks are: a kernel vulnerability (shared kernel, so a container escape affects the host; seccomp shrinks the attack surface), a misconfiguration that removes layers (<code>--privileged</code>, extra capabilities, host namespaces, sensitive mounts, the Docker socket), a compromised app abusing its legitimate access (secrets, network reach), and resource exhaustion. If you need a hard boundary between mutually hostile tenants, use VMs or sandboxed runtimes (gVisor, Kata Containers) rather than plain containers.</p>
<p><b>Linux capabilities.</b> Docker's default set for a container's root user is 14: <code>CHOWN</code>, <code>DAC_OVERRIDE</code>, <code>FOWNER</code>, <code>FSETID</code>, <code>KILL</code>, <code>SETGID</code>, <code>SETUID</code>, <code>SETPCAP</code>, <code>NET_BIND_SERVICE</code>, <code>NET_RAW</code>, <code>SYS_CHROOT</code>, <code>MKNOD</code>, <code>AUDIT_WRITE</code>, <code>SETFCAP</code>. Missing by default, among others: <code>SYS_ADMIN</code> (mount, many namespace operations; "the new root"), <code>NET_ADMIN</code> (change interfaces, iptables), <code>SYS_PTRACE</code>, <code>SYS_MODULE</code>, <code>SYS_TIME</code>, <code>SYS_RAWIO</code>. <code>--cap-drop ALL --cap-add NET_BIND_SERVICE</code> follows least privilege. A non-root process normally has an empty effective set anyway, so capability dropping matters most for containers that run as root (often at start-up, like the official <code>postgres</code> entrypoint, which needs <code>CHOWN</code>, <code>DAC_OVERRIDE</code>, <code>FOWNER</code>, <code>SETUID</code>, <code>SETGID</code> to fix ownership and switch to the <code>postgres</code> user).</p>
<p><b>seccomp.</b> Docker applies a default seccomp profile (a JSON allowlist) that blocks dozens of syscalls out of the 300+ available, for example <code>mount</code>/<code>umount2</code>, <code>reboot</code>, <code>kexec_load</code>, <code>init_module</code>/<code>delete_module</code>, <code>swapon</code>, <code>clock_settime</code>, <code>add_key</code>/<code>keyctl</code>, <code>bpf</code>, <code>unshare</code>/<code>setns</code> and <code>clone</code> with namespace flags (several are allowed only when the matching capability is granted). Use <code>--security-opt seccomp=profile.json</code> for a custom profile; <code>seccomp=unconfined</code> disables it (avoid). The profile is not applied with <code>--privileged</code>.</p>
<p><b>AppArmor / SELinux.</b> On AppArmor hosts Docker loads and applies the <code>docker-default</code> profile, which denies writes to sensitive <code>/proc</code> and <code>/sys</code> paths, mounting, and more. Custom profile: <code>--security-opt apparmor=my-profile</code> (loaded with <code>apparmor_parser</code>). On SELinux hosts (with <code>"selinux-enabled": true</code> in the daemon config) containers run as <code>container_t</code> with unique MCS labels; bind mounts need <code>:z</code> (shared label) or <code>:Z</code> (private label) to be readable, and <code>--security-opt label=…</code> customises labels. Docker Desktop and many cloud images have one or the other; check <code>docker info</code> → <i>Security Options</i>.</p>
<p><b>User-namespace remapping.</b> With <code>"userns-remap": "default"</code> in <code>daemon.json</code>, dockerd creates a <code>dockremap</code> user and uses its ranges in <code>/etc/subuid</code> and <code>/etc/subgid</code> (for example <code>dockremap:100000:65536</code>). UID 0 in every container becomes UID 100000 on the host; a process escaping the container is an unprivileged user. Costs: images and containers are stored under a separate subdirectory of <code>data-root</code> (existing images are not visible and are re-pulled), bind-mounted host files appear as <code>nobody</code> unless their ownership matches the mapped range, and some features (<code>--privileged</code>, <code>--pid=host</code>, <code>--network=host</code> in some combinations) need <code>--userns=host</code> per container. It is a daemon-wide setting.</p>
<p><b>Rootless mode.</b> The whole engine (dockerd, containerd, the containers) runs as a normal user inside a user namespace created by RootlessKit; networking goes through a user-mode network stack (slirp4netns or pasta) or <code>vpnkit</code>. A full engine compromise only yields that user's privileges. Limitations (vary by version and distro): binding ports below 1024 needs <code>net.ipv4.ip_unprivileged_port_start</code> or a capability on rootlesskit, resource limits need cgroup v2 with systemd delegation, overlay storage needs a recent kernel (otherwise fuse-overlayfs), some network performance cost, no AppArmor, no <code>--privileged</code> equivalent of real root. Socket at <code>$XDG_RUNTIME_DIR/docker.sock</code>.</p>
<p><b>Read-only root filesystem.</b> <code>--read-only</code> mounts the container's root filesystem read-only; add writable places explicitly with <code>--tmpfs /tmp:rw,noexec,nosuid,size=64m</code> or volumes. An attacker cannot drop tools into <code>/usr/bin</code> or modify app code, and drift is impossible.</p>
<p><b><code>no-new-privileges</code>.</b> <code>--security-opt no-new-privileges</code> sets the kernel's <code>PR_SET_NO_NEW_PRIVS</code> flag: <code>execve</code> can never grant more privileges than the parent had, so setuid binaries (<code>sudo</code>, <code>su</code>, <code>passwd</code>) and file capabilities do not elevate. Can be made the default with <code>"no-new-privileges": true</code> in <code>daemon.json</code>.</p>
<p><b>Why <code>--privileged</code> is dangerous.</b> It grants all capabilities, disables seccomp and the AppArmor/SELinux confinement, exposes all host devices (<code>/dev/sda</code>…), and mounts <code>/sys</code> read-write. A root process can mount the host disk and edit <code>/etc/shadow</code>, load kernel modules or write to cgroup release agents: it is effectively root on the host. Use specific <code>--cap-add</code> and <code>--device</code> instead.</p>
<p><b>Why mounting <code>/var/run/docker.sock</code> is dangerous.</b> The socket is the full Docker API, served by a root daemon. Anyone who can talk to it can run <code>docker run --privileged -v /:/host …</code> and own the host. Group membership in <code>docker</code> is equivalent to root for the same reason. If a tool needs it (Traefik, CI runners, monitoring), prefer a filtering socket proxy that exposes only read-only endpoints, rootless Docker, or a different design (Kubernetes API with RBAC, BuildKit daemons for CI).</p>
<p><b>Resource limits as DoS protection</b> (Day 6): memory, CPU and <code>--pids-limit</code> stop one compromised or buggy container from starving the host. <b>Non-root users</b> make most of the above harder to exploit. <b>Network segmentation</b>: put services on separate user-defined networks (frontend vs backend), mark backend networks <code>internal: true</code> where they need no outbound internet, publish only the edge port, and bind admin ports to <code>127.0.0.1</code>; the default bridge lets every container talk to every other.</p>`,
      why: `<p>Docker's early popularity came with root daemons, root containers and copy-pasted <code>--privileged</code> flags. Real incidents followed the same patterns: exposed Docker APIs on port 2375 hijacked for crypto-mining, CI containers with the Docker socket used to take over build hosts, kernel bugs (for example in <code>runc</code> itself, CVE-2019-5736, where a malicious container could overwrite the host's runc binary) turning a container compromise into host compromise.</p>
<p>The defence is depth: no single mechanism is perfect, but a non-root process, with no capabilities, under seccomp and AppArmor, on a read-only filesystem, in a user namespace, with limits and a private network, needs a chain of separate bugs to escape. These controls are cheap to apply at build and run time and are expected in any security review, interview or the DCA's security domain.</p>`,
      diagram: {
        html: flow([["Process in container", "app, UID 10001", "g"], ["Capabilities", "--cap-drop ALL", "g"], ["seccomp", "syscall allowlist", "g"], ["AppArmor / SELinux", "path and label policy", "g"], ["Namespaces + userns", "what it sees, who it is", "g"], ["cgroups", "what it may consume", "g"], ["Shared host kernel", "the real boundary", "r"]]),
        steps: [
          `Every syscall from the containerised process goes to the <b>same host kernel</b> as every other container. The layers in green each filter or reduce what reaches it.`,
          `The kernel first checks <b>seccomp</b> (is this syscall allowed at all?), then normal permission checks using the process's UID and <b>capabilities</b>, then the <b>LSM</b> hooks (AppArmor profile or SELinux label).`,
          `<b>Namespaces</b> decide which resources the call even refers to (its own PID 1, its own network stack, its own mount table); a <b>user namespace</b> makes "root" an unprivileged host UID.`,
          `<b>cgroups</b> cap consumption. Options like <code>--privileged</code>, <code>--pid=host</code>, <code>--network=host</code> or mounting the Docker socket remove layers, which is why they count as host-level access.`
        ]
      },
      cmds: [
        {
          t: "See the default security settings of a container",
          lang: "sh",
          code: `docker info --format '{{json .SecurityOptions}}'
docker run --rm alpine sh -c 'grep -E "Cap(Prm|Eff|Bnd)|NoNewPrivs|Seccomp" /proc/self/status'
docker run --rm alpine cat /proc/self/attr/current        # AppArmor label on AppArmor hosts
# decode a capability mask (capsh is in libcap / libcap2-bin on the host)
capsh --decode=00000000a80425fb`,
          out: `["name=apparmor","name=seccomp,profile=builtin","name=cgroupns"]
CapPrm: 00000000a80425fb
CapEff: 00000000a80425fb
CapBnd: 00000000a80425fb
NoNewPrivs:     0
Seccomp:        2
docker-default (enforce)
0x00000000a80425fb=cap_chown,cap_dac_override,cap_fowner,cap_fsetid,cap_kill,cap_setgid,cap_setuid,cap_setpcap,cap_net_bind_service,cap_net_raw,cap_sys_chroot,cap_mknod,cap_audit_write,cap_setfcap`,
          note: `<p><code>Seccomp: 2</code> means filter mode is active. Security options and the AppArmor line depend on the host (SELinux hosts show <code>name=selinux</code>; rootless shows <code>name=rootless</code>; user-namespace remapping shows <code>name=userns</code>).</p>`
        },
        {
          t: "Capabilities: drop all, add one, observe what breaks",
          lang: "sh",
          code: `# default root can chown, use raw sockets (ping) etc.
docker run --rm alpine sh -c 'chown nobody /tmp && echo chown ok'
# drop everything
docker run --rm --cap-drop ALL alpine sh -c 'chown nobody /tmp && echo chown ok'
# a web server that only needs to bind to port 80 as root
docker run -d --name web --cap-drop ALL --cap-add NET_BIND_SERVICE --cap-add CHOWN --cap-add SETUID --cap-add SETGID -p 8080:80 nginx:1.27-alpine
docker inspect -f '{{.HostConfig.CapDrop}} {{.HostConfig.CapAdd}}' web
# SYS_ADMIN is needed for mount: denied by default
docker run --rm alpine mount -t tmpfs none /mnt`,
          out: `chown ok
chown: /tmp: Operation not permitted
[ALL] [NET_BIND_SERVICE CHOWN SETUID SETGID]
mount: permission denied (are you root?)`,
          note: `<p>Standard Nginx starts as root and switches workers to the <code>nginx</code> user, so it needs <code>SETUID</code>/<code>SETGID</code> and may need <code>CHOWN</code> for its cache directories. The <code>nginx-unprivileged</code> image needs none of them and listens on 8080. Find the minimal set by starting from <code>ALL</code> dropped and adding back only what fails.</p>`
        },
        {
          t: "A hardened run of the FastAPI container",
          lang: "sh",
          code: `docker network create --internal backend
docker network create frontend
docker run -d --name api \\
  --user 10001:10001 \\
  --cap-drop ALL \\
  --security-opt no-new-privileges \\
  --read-only --tmpfs /tmp:rw,noexec,nosuid,size=64m \\
  --memory 512m --memory-swap 512m --cpus 1 --pids-limit 128 \\
  --network backend \\
  orders-api:1.4.2
docker network connect frontend api
docker exec api sh -c 'touch /app/hacked' || true
docker exec api sh -c 'id; grep NoNewPrivs /proc/self/status'`,
          out: `touch: cannot touch '/app/hacked': Read-only file system
uid=10001(app) gid=10001(app) groups=10001(app)
NoNewPrivs:     1`,
          note: `<p>The <code>backend</code> network is <code>--internal</code>: containers on it can reach each other but not the internet and cannot publish ports. The API is also attached to <code>frontend</code> so the reverse proxy can reach it.</p>`
        },
        {
          t: "Custom seccomp profile and AppArmor profile",
          lang: "sh",
          code: `# start from Docker's default profile (moby repository: profiles/seccomp/default.json)
curl -sLo seccomp-default.json https://raw.githubusercontent.com/moby/moby/master/profiles/seccomp/default.json
# edit it (for example remove a syscall from the allow list), then:
docker run --rm --security-opt seccomp=./seccomp-default.json alpine uname -a
# compare: unconfined (do not do this in production)
docker run --rm --security-opt seccomp=unconfined alpine sh -c 'grep Seccomp: /proc/self/status'

# AppArmor (Ubuntu/Debian hosts): load and apply a custom profile
sudo apparmor_parser -r -W ./apparmor-api-profile
docker run --rm --security-opt apparmor=api-profile alpine cat /proc/self/attr/current`,
          out: `Linux 3c9a… 6.8.0-… x86_64 Linux
Seccomp:        0
api-profile (enforce)`
        },
        {
          t: "Why the Docker socket and --privileged equal host root (run only on a throwaway VM)",
          lang: "sh",
          code: `# a container that has the socket can start a privileged sibling that mounts the host's /
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock docker:27-cli \\
  docker run --rm -v /:/host alpine cat /host/etc/shadow | head -2

# --privileged sees host block devices and can mount them
docker run --rm --privileged alpine sh -c 'ls /dev | grep -E "^(sd|nvme|vd)" | head -3'`,
          out: `root:*:19700:0:99999:7:::
daemon:*:19700:0:99999:7:::
nvme0n1
nvme0n1p1
nvme0n1p2`,
          note: `<p>This is the whole argument in two commands. On Docker Desktop the "host" is the Linux VM, not your laptop, but the principle is the same. Tools that need Docker API access should get a filtered, read-only proxy instead of the raw socket.</p>`
        },
        {
          t: "Enable user-namespace remapping",
          lang: "sh",
          code: `# /etc/docker/daemon.json
#   { "userns-remap": "default" }
sudo systemctl restart docker
grep dockremap /etc/subuid /etc/subgid
docker run -d --name remapped alpine sleep 600
ps -o user,pid,cmd -C sleep           # on the host
docker run --rm alpine id             # inside: still uid=0
sudo ls /var/lib/docker/
docker run --rm --userns=host alpine id   # opt one container out`,
          out: `/etc/subuid:dockremap:100000:65536
/etc/subgid:dockremap:100000:65536
USER       PID CMD
100000   61234 sleep 600
uid=0(root) gid=0(root) groups=0(root),…
100000.100000  buildkit  containers  image  network  overlay2  …`,
          note: `<p>The <code>100000.100000</code> directory is a separate storage area for the remapped engine; images pulled before enabling remapping are not visible there.</p>`
        },
        {
          t: "Install and use rootless Docker",
          lang: "sh",
          code: `# as a normal user on a supported Linux host (needs uidmap/newuidmap and subuid entries)
dockerd-rootless-setuptool.sh install
systemctl --user start docker
docker context use rootless
docker info --format '{{.SecurityOptions}}'
docker run -d -p 8080:80 nginx:1.27-alpine
ps -o user,cmd -C dockerd`,
          out: `[name=seccomp,profile=builtin name=rootless name=cgroupns]
USER     CMD
alice    dockerd`,
          note: `<p>Package names and setup steps vary by distribution; follow the official rootless guide for your OS. Port 80 on the host would need extra configuration in rootless mode.</p>`
        },
        {
          t: "Compose: a hardened React/FastAPI/Redis/PostgreSQL stack",
          lang: "yaml",
          code: `x-hardening: &hardening
  security_opt: ["no-new-privileges:true"]
  cap_drop: [ALL]
  pids_limit: 256
services:
  web:
    image: ghcr.io/acme/web:1.4.2
    <<: *hardening
    read_only: true
    tmpfs: ["/tmp", "/var/cache/nginx"]
    ports: ["443:8443"]
    networks: [frontend]
  api:
    image: ghcr.io/acme/orders-api:1.4.2
    <<: *hardening
    user: "10001:10001"
    read_only: true
    tmpfs: ["/tmp"]
    networks: [frontend, backend]
  redis:
    image: redis:7.4-alpine
    <<: *hardening
    cap_add: [SETUID, SETGID]
    command: ["redis-server", "--appendonly", "yes"]
    volumes: [redis-data:/data]
    networks: [backend]
  postgres:
    image: postgres:16
    <<: *hardening
    cap_add: [CHOWN, DAC_OVERRIDE, FOWNER, SETUID, SETGID]
    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
    secrets: [db_password]
    volumes: [pg-data:/var/lib/postgresql/data]
    networks: [backend]
networks:
  frontend: {}
  backend:
    internal: true
volumes:
  redis-data: {}
  pg-data: {}
secrets:
  db_password:
    file: ./secrets/db_password.txt`,
          note: `<p>Only <code>web</code> publishes a port. Redis and PostgreSQL are on an internal network and unreachable from outside the host. The capabilities added back for <code>postgres</code> and <code>redis</code> are what their entrypoints need to fix data-directory ownership and drop to their service users; verify against the image versions you use.</p>`
        }
      ],
      internals: `<p><b>Where each control is applied.</b> dockerd builds an OCI runtime spec (<code>config.json</code> in the containerd bundle directory, under <code>/run/containerd/io.containerd.runtime.v2.task/moby/&lt;id&gt;/</code>) with <code>process.capabilities</code> (bounding, effective, permitted sets), <code>process.noNewPrivileges</code>, <code>process.apparmorProfile</code> or <code>process.selinuxLabel</code>, <code>linux.seccomp</code> (the full profile, translated to JSON), <code>root.readonly</code>, <code>linux.namespaces</code>, <code>linux.uidMappings</code> and <code>linux.resources</code>. runc then, in order: creates namespaces (<code>clone</code>/<code>unshare</code>), writes UID/GID maps (user namespaces), sets up mounts and <code>pivot_root</code>, writes the AppArmor/SELinux label to <code>/proc/self/attr/…</code> for the exec, applies capabilities with <code>capset</code> and the bounding set with <code>prctl(PR_CAPBSET_DROP)</code>, sets <code>PR_SET_NO_NEW_PRIVS</code>, installs the seccomp BPF filter with <code>seccomp(SECCOMP_SET_MODE_FILTER)</code> as late as possible, then <code>execve</code>s your process. The filter and dropped capabilities are inherited by every child and cannot be undone from inside.</p>
<p><b>seccomp in the kernel</b> is a BPF program attached to the task; every syscall entry runs it, and it returns allow, <code>ERRNO(EPERM)</code> (Docker's default action for blocked calls) or kill. That is why blocked calls show up as "Operation not permitted" rather than a crash.</p>
<p><b>Capabilities</b> are checked inside the kernel wherever a privileged operation happens (<code>capable(CAP_SYS_ADMIN)</code> in the mount code, for example). With user namespaces, capabilities are relative to the namespace: root in a user namespace has full capabilities over resources <i>owned by that namespace</i> but none over the host's.</p>
<p><b>The Docker socket</b> is a Unix socket owned by <code>root:docker</code> with mode 660; dockerd runs as root and executes whatever the API requests. There is no per-endpoint authorisation in the Engine itself (authorisation plugins exist but are rarely used); enterprise platforms (MKE) and socket proxies add it in front.</p>
<p><b>Rootless</b>: <code>rootlesskit</code> creates a user namespace and a network namespace with a TAP device bridged to a user-space TCP/IP stack; dockerd runs inside, believes it is root, and creates containers in nested namespaces. Data lives under <code>~/.local/share/docker</code>. Port publishing is implemented by a port driver in rootlesskit rather than iptables DNAT rules on the host.</p>`,
      prod: `<p>For the React → FastAPI → Redis → PostgreSQL stack on a single host (see the Compose example above):</p>
<ul class="pts">
<li>Every service has <code>cap_drop: [ALL]</code>, <code>no-new-privileges</code>, limits and <code>pids_limit</code>. Only the edge proxy publishes 443; Postgres and Redis sit on an <code>internal</code> backend network and are never published (or published on <code>127.0.0.1</code> only for admin tunnels).</li>
<li><code>web</code> and <code>api</code> run non-root with read-only root filesystems and tmpfs for scratch; uploads go to a dedicated volume or object storage.</li>
<li>The host has AppArmor or SELinux in enforcing mode, <code>"no-new-privileges": true</code> and <code>"live-restore": true</code> in <code>daemon.json</code>, the Docker API not exposed on TCP, and only the deploy user in the <code>docker</code> group (treated as root access in access reviews). CI builds happen on separate, ephemeral runners, not on the production host.</li>
<li>Remember that Docker publishes ports by inserting iptables rules that are evaluated before host firewalls such as UFW's INPUT rules; filter published ports in the <code>DOCKER-USER</code> chain or at a cloud security group.</li>
<li>Higher-risk workloads (running untrusted user code, for example a notebook feature) use a sandboxed runtime such as gVisor (<code>--runtime=runsc</code>) or separate VMs.</li>
</ul>`,
      iq: [
        ["dca", "Which command runs a container with all Linux capabilities removed except the ability to bind to ports below 1024?", `<p><code>docker run --cap-drop ALL --cap-add NET_BIND_SERVICE &lt;image&gt;</code>. Order of flags does not matter; drops are applied, then adds. <code>--privileged</code> would do the opposite (all capabilities). <code>--security-opt no-new-privileges</code> does not remove capabilities; it only prevents gaining more on exec.</p>`],
        ["dca", "Which TWO statements about --privileged are true? (a) It disables the default seccomp profile. (b) It only adds the NET_ADMIN capability. (c) It gives the container access to host devices. (d) It enables user-namespace remapping for that container.", `<p><b>(a) and (c).</b> <code>--privileged</code> grants all capabilities, gives access to all host devices, and lifts seccomp and AppArmor/SELinux confinement. It is not limited to one capability (b), and it is incompatible with, not an enabler of, user-namespace remapping (d): remapped daemons need <code>--userns=host</code> for privileged containers.</p>`],
        ["dca", "How do you enable user-namespace remapping, and what is the effect on root inside the container?", `<p>Set <code>"userns-remap": "default"</code> (or a specific <code>user:group</code>) in <code>/etc/docker/daemon.json</code> (or <code>dockerd --userns-remap</code>) and restart the daemon. Docker uses the subordinate ranges in <code>/etc/subuid</code>/<code>/etc/subgid</code>; UID 0 in containers maps to an unprivileged host UID such as 100000. It is daemon-wide; individual containers can opt out with <code>--userns=host</code>.</p>`],
        ["mid", "Why is mounting /var/run/docker.sock into a container considered equivalent to giving it root on the host?", `<p>The socket exposes the full Docker API of a daemon running as root, without fine-grained authorisation. The container can ask the daemon to start a new container with <code>--privileged</code> or with <code>/</code> bind-mounted and then read or modify anything on the host. Same reason <code>docker</code> group membership is root-equivalent.</p>`],
        ["senior", "What is the difference between userns-remap and rootless mode?", `<p><code>userns-remap</code>: dockerd still runs as root, but containers run in a user namespace so their root maps to an unprivileged host UID; a container escape lands as an unprivileged user, but a daemon compromise is still root. Rootless: dockerd, containerd and containers all run as a normal user inside a user namespace; even an engine compromise only yields that user. Rootless has more limitations (networking, ports &lt; 1024, cgroup delegation, storage drivers).</p>`],
        ["senior", "A container runs as non-root. Does dropping capabilities still matter?", `<p>Less, but yes. A non-root process starts with an empty effective set, but it could gain capabilities through setuid-root binaries or file capabilities in the image; <code>--cap-drop ALL</code> also empties the bounding set so that path is closed, and <code>no-new-privileges</code> blocks setuid elevation entirely. Many images also start as root and drop later (postgres, nginx), so capabilities matter during start-up.</p>`],
        ["mid", "What does --read-only do and what do you need to add for typical apps?", `<p>It mounts the container's root filesystem read-only, so neither the app nor an attacker can modify binaries or code. Apps usually need scratch space: add <code>--tmpfs /tmp</code> (and e.g. <code>/var/cache/nginx</code>, <code>/var/run</code>) and volumes for real data. Python may try to write <code>.pyc</code> files; set <code>PYTHONDONTWRITEBYTECODE=1</code> or precompile at build time.</p>`],
        ["dca", "Which file defines the syscalls a container may use by default, and how do you run a container without that restriction?", `<p>Docker's built-in default seccomp profile (published in the moby repository as <code>profiles/seccomp/default.json</code>). <code>--security-opt seccomp=unconfined</code> disables it, and <code>--security-opt seccomp=/path/profile.json</code> applies a custom one. Disabling is strongly discouraged; <code>--privileged</code> also disables it.</p>`],
        ["architect", "When are plain containers not a sufficient security boundary, and what do you use instead?", `<p>When workloads are mutually hostile (multi-tenant platforms, running customer-supplied code) or compliance requires hardware-level isolation. The shared kernel means one kernel bug can break isolation. Use VMs per tenant, micro-VM runtimes (Kata Containers, Firecracker-based), or user-space kernels (gVisor), and keep the container hardening as an additional layer.</p>`]
      ],
      gotchas: [
        `Published ports bypass host firewalls like UFW because Docker's iptables rules (in the nat/FORWARD paths) are evaluated before UFW's INPUT rules; put your filtering in the <code>DOCKER-USER</code> chain or an external firewall.`,
        `<code>-p 5432:5432</code> publishes on all host interfaces (0.0.0.0 and ::). For local admin access use <code>-p 127.0.0.1:5432:5432</code>.`,
        `<code>--cap-drop ALL</code> often breaks official images that start as root and <code>chown</code>/<code>gosu</code> to a service user; add back exactly <code>CHOWN</code>, <code>DAC_OVERRIDE</code>, <code>FOWNER</code>, <code>SETUID</code>, <code>SETGID</code> as needed or use images that start non-root.`,
        `On SELinux hosts a bind mount without <code>:z</code>/<code>:Z</code> gives "Permission denied" even as root; <code>:Z</code> on a system directory like <code>/home</code> relabels it and can break the host.`,
        `Enabling <code>userns-remap</code> makes existing images and containers invisible (separate storage directory) and makes bind-mounted host files show as <code>nobody</code>.`,
        `<code>NET_RAW</code> is in the default set (it allows ping but also ARP and packet spoofing on the bridge); dropping it is a cheap win for most services.`,
        `<code>--network host</code>, <code>--pid host</code> and <code>--ipc host</code> each remove a namespace; <code>--pid host</code> plus <code>SYS_PTRACE</code> lets a container inspect every host process.`,
        `Docker Desktop runs containers in a VM, so an escape reaches the VM first; that is not a reason to skip hardening, because the same images run on Linux servers.`
      ],
      best: [
        `Run as non-root, <code>--cap-drop ALL</code> plus minimal adds, <code>no-new-privileges</code>, read-only root filesystem with tmpfs, and resource limits, by default for every service.`,
        `Keep the default seccomp and AppArmor/SELinux profiles enabled; write custom profiles only to tighten.`,
        `Never use <code>--privileged</code> or the Docker socket in application containers; treat <code>docker</code> group membership and API access as root.`,
        `Segment networks: edge proxy on <code>frontend</code>, data stores on an <code>internal</code> backend network, publish only what users must reach.`,
        `Consider rootless mode or <code>userns-remap</code> for hosts that run less-trusted workloads, and sandboxed runtimes for untrusted code.`,
        `Audit regularly: Docker Bench for Security checks a host against the CIS Docker Benchmark.`
      ],
      lab: [
        `Run <code>docker run --rm alpine grep Cap /proc/self/status</code> and decode the mask with <code>capsh --decode</code>; repeat with <code>--cap-drop ALL</code> and with <code>--privileged</code>.`,
        `Run Nginx with <code>--cap-drop ALL</code>, read the error, then add back capabilities one at a time until it starts. Record the minimal set.`,
        `Run the API with <code>--read-only</code> and no tmpfs; fix the first write error with <code>--tmpfs</code>. Confirm <code>touch /app/x</code> fails.`,
        `On a throwaway Linux VM, demonstrate the Docker socket escape from the commands above, then explain it in one sentence.`,
        `Create <code>frontend</code> and <code>internal</code> <code>backend</code> networks, put Postgres on <code>backend</code> only, and show that <code>docker run --rm --network backend alpine wget -qO- https://example.com</code> fails while the API can still reach Postgres.`,
        `<b>Done when:</b> your API container runs with UID 10001, <code>CapEff: 0000000000000000</code>, <code>NoNewPrivs: 1</code>, a read-only root and no published database ports, and the app still works.`
      ],
      teach: `<p>"Containers are processes sharing the host kernel, isolated by layers: namespaces for what they see, cgroups for what they use, capabilities for which root powers they have, seccomp for which syscalls they can make, and AppArmor or SELinux for which files and operations the policy allows. Docker gives root in a container a reduced set of fourteen capabilities and a default seccomp profile, but root in a container is still host root unless you use user namespaces.</p>
<p>So I harden every service: non-root user, <code>--cap-drop ALL</code> and add back only what's needed, <code>no-new-privileges</code> so setuid binaries can't elevate, a read-only root filesystem with tmpfs for scratch, resource limits against DoS, and separate networks so the database isn't reachable from the edge. At the daemon level, <code>userns-remap</code> maps container root to an unprivileged host UID, and rootless mode runs the whole engine as a normal user.</p>
<p>And two things I never do in app containers: <code>--privileged</code>, which removes all of those layers, and mounting the Docker socket, which lets the container ask a root daemon to mount the host's filesystem. Both are host root in disguise."</p>`
    },
    {
      id: "d7-supply-chain",
      title: "Supply-chain security: scanning, SBOMs, signing and secrets",
      lv: ["mid", "senior", "lead", "architect", "dca"],
      eli5: `<p>Think about <b>food safety</b>. Every packet in the supermarket has an <b>ingredients list</b> (the SBOM), a <b>"made in factory X on date Y"</b> stamp (provenance), and a <b>tamper-evident seal</b> (a signature). Inspectors regularly check ingredients against a list of known problems, like a recall list (CVE scanning). If the flour supplier has a recall, you need to know which of your products contain that flour and bake new batches (rebuild on base-image updates).</p>
<p><b>Secrets</b> are the factory's safe combination. If someone writes it on a sticky note and the note gets baked into the bread (an <code>ARG</code> or <code>ENV</code> in an image layer), anyone who buys a loaf can read it. Build secrets are like showing the combination to the baker for one minute, then taking the note away before the bread goes in the oven.</p>
<p>Big companies add a <b>quality-control department</b> (enterprise registries with RBAC and promotion policies): only products that passed inspection move from the "test kitchen" shelf to the "shop" shelf, and only certain people can move them.</p>`,
      what: `<p><b>The supply chain</b> of an image is everything that ends up in it or produces it: base image, OS packages, language dependencies, your code, the Dockerfile, the build system and the registry. An attacker or an accident at any link affects what runs in production.</p>
<p><b>Vulnerabilities and CVEs.</b> A CVE is a public identifier for a known vulnerability in a specific package version, with a severity (often CVSS-based: low, medium, high, critical). A scanner reads the packages in an image (from the OS package database such as <code>/var/lib/dpkg/status</code> or <code>/lib/apk/db/installed</code>, and from language metadata like <code>site-packages/*.dist-info</code>, <code>package-lock.json</code>, Go build info) and matches them against vulnerability databases. Key ideas:</p>
<ul class="pts">
<li>Most findings come from the <b>base image</b>. Smaller bases (slim, distroless) mean fewer packages and fewer findings; rebuilding on a patched base fixes most of them.</li>
<li>Images do not patch themselves: a running image is frozen at build time. Rebuild regularly (weekly, or triggered by base-image updates), not only when your code changes.</li>
<li>Prioritise: <b>fixable</b> (a fixed version exists), <b>reachable</b>/exploitable in your context, and severity. "0 CVEs" is not a realistic goal; a policy such as "no fixable critical/high at release" is.</li>
<li>Scanners disagree because of different databases and distro backport handling (Debian may patch a vulnerability without changing the upstream version number). Pick one as source of truth and record accepted risks with expiry dates (VEX statements or ignore files).</li>
</ul>
<p><b>Scanning tools.</b> <b>Docker Scout</b> is built into the Docker CLI/Desktop (<code>docker scout quickview</code>, <code>cves</code>, <code>recommendations</code>, <code>compare</code>, <code>sbom</code>); some features require a Docker account and plan. <b>Trivy</b> (Aqua Security, open source) scans images, filesystems, IaC and Kubernetes; also Grype (Anchore), Snyk, and registry-native scanners (ECR, ACR, Artifact Registry, Harbor, MSR). Scan in CI before push and continuously in the registry, because new CVEs are published against old images every day.</p>
<p><b>SBOMs and provenance attestations.</b> An <b>SBOM</b> (software bill of materials, in SPDX or CycloneDX format) lists every component and version in the image. <b>Provenance</b> (SLSA format) records how the image was built: source repository and commit, build arguments, builder, base images, timestamps. BuildKit can generate both and attach them to the image in the registry as <b>attestations</b> (stored as additional manifests in the image index): <code>docker buildx build --sbom=true --provenance=mode=max --push …</code>. Minimal provenance is added by default when pushing with recent Buildx versions. Inspect with <code>docker buildx imagetools inspect &lt;image&gt; --format '{{ json .SBOM }}'</code>. Attestations need a registry or the containerd image store; loading into the classic image store drops them.</p>
<p><b>Signing.</b> A signature proves an image digest was approved by a key holder and was not altered.</p>
<ul class="pts">
<li><b>Docker Content Trust (DCT)</b> is Docker's original mechanism, built on <b>Notary v1</b> and The Update Framework (TUF). Enable it on the client with <code>export DOCKER_CONTENT_TRUST=1</code>: <code>docker push</code> signs, and <code>docker pull</code>/<code>run</code>/<code>build</code> (<code>FROM</code>) refuse unsigned tags. Manage with <code>docker trust key generate</code>, <code>docker trust signer add</code>, <code>docker trust sign</code>, <code>docker trust inspect --pretty</code>, <code>docker trust revoke</code>. Keys: an offline <b>root</b> key, a per-repository <b>targets</b> (repository) key, <b>delegation</b> keys for signers, and server-managed <b>snapshot</b>/<b>timestamp</b> keys; private keys live under <code>~/.docker/trust/private</code>. <code>--disable-content-trust</code> bypasses it per command. DCT is still a classic DCA topic, but Notary v1 has seen little development and Docker has signalled moving away from it, so check current Docker documentation before adopting it for new systems.</li>
<li><b>Sigstore cosign</b>: signs by digest and stores signatures as OCI artifacts next to the image in any registry; supports key pairs or keyless signing with short-lived certificates bound to an OIDC identity (for example a GitHub Actions workflow) and a transparency log. <b>Notation</b> (Notary Project v2, CNCF) is the other common standard, popular with Azure and AWS signer integrations.</li>
<li>Verification must happen where images are admitted: in the deploy pipeline or a Kubernetes admission controller (Kyverno, Sigstore policy-controller, Ratify).</li>
</ul>
<p><b>Build secrets vs ARG/ENV leaks.</b> Values passed with <code>--build-arg</code> are recorded in the image history for every <code>RUN</code> that uses them, and <code>ENV</code> values are stored in the image config: both are visible to anyone who can pull the image (<code>docker history --no-trunc</code>, <code>docker inspect</code>). Files copied then deleted remain in lower layers. BuildKit's secret mounts solve this: <code>docker build --secret id=npmrc,src=$HOME/.npmrc .</code> plus <code>RUN --mount=type=secret,id=npmrc,target=/root/.npmrc npm ci</code> exposes the file only during that <code>RUN</code> (on a tmpfs, default path <code>/run/secrets/&lt;id&gt;</code>), and it is never written into a layer or the cache key. <code>--mount=type=ssh</code> forwards an SSH agent for private Git dependencies. BuildKit's build checks warn about likely secrets in <code>ARG</code>/<code>ENV</code> names.</p>
<p><b>Runtime secrets: Swarm preview.</b> In Swarm mode (covered fully on Day 9), <code>docker secret create</code> stores a secret encrypted in the managers' Raft log; it is sent over mutual TLS only to nodes running tasks that use it and mounted as a file on an in-memory filesystem at <code>/run/secrets/&lt;name&gt;</code>. Secrets are immutable (rotate by creating a new one and updating the service), up to 500 KB, and <code>docker secret inspect</code> never shows the value. Compose supports the same <code>secrets:</code> syntax; without Swarm, file-based secrets are bind mounts (convenient, not encrypted).</p>
<p><b>Enterprise registries and RBAC (DCA context).</b> The DCA was designed around Docker Enterprise, whose products were acquired by Mirantis in 2019 and renamed: <b>UCP</b> (Universal Control Plane) became <b>Mirantis Kubernetes Engine (MKE)</b> and <b>DTR</b> (Docker Trusted Registry) became <b>Mirantis Secure Registry (MSR)</b>. As commonly described in study material (check the current exam guide and Mirantis documentation for specifics):</p>
<ul class="pts">
<li><b>MKE RBAC</b> uses <b>grants</b>: a <i>subject</i> (user, team, organisation, service account) + a <i>role</i> (built-ins such as None, View Only, Restricted Control, Scheduler, Full Control, or custom) + a <i>resource set</i> (a Swarm <b>collection</b> or a Kubernetes namespace). MKE can also enforce that only signed images run.</li>
<li><b>MSR</b> provides private repositories with team permissions, <b>image scanning</b> against a CVE database, <b>tag immutability</b>, <b>promotion policies</b> (automatically copy an image from <code>dev/app</code> to <code>prod/app</code> when it meets criteria such as tag pattern or vulnerability thresholds), mirroring between registries, webhooks, garbage collection and integration with signing.</li>
<li>Open-source and cloud equivalents: Harbor (RBAC, scanning, replication, immutability), ECR/ACR/Artifact Registry with IAM and scanning.</li>
</ul>`,
      why: `<p>Most container images are assembled from hundreds of third-party packages you never reviewed. Attacks have shifted to this chain: typosquatted and compromised packages on npm and PyPI, malicious images on public registries, a compromised build tool injecting code into signed releases (the SolarWinds pattern), leaked credentials baked into public images (researchers routinely find thousands of API keys in Docker Hub layers). Meanwhile, ordinary CVEs in base images accumulate silently because images are immutable.</p>
<p>Supply-chain controls answer the questions an incident or an auditor will ask: <i>What exactly is in this image?</i> (SBOM) <i>Who built it, from which commit, how?</i> (provenance) <i>Is this the image we approved?</i> (signature, digest) <i>Does it contain known vulnerabilities and are we patching?</i> (scanning, rebuilds) <i>Did any secret leak?</i> (build secrets). Regulations and customer contracts increasingly require SBOMs and signed artifacts.</p>`,
      diagram: {
        html: flow([["Source", "lock files, pinned base digest", "w"], ["Build", "BuildKit, --mount=type=secret", "g"], ["Attest", "SBOM + SLSA provenance", "g"], ["Scan", "Scout / Trivy: block fixable high", "r"], ["Sign", "cosign / Notation / DCT", "g"], ["Registry", "immutable tags, RBAC, rescans", "g"], ["Deploy", "verify signature + policy", "g"]]),
        steps: [
          `Inputs are pinned: base image by digest, dependencies via lock files. Secrets reach the build only through secret mounts, never through <code>ARG</code>, <code>ENV</code> or <code>COPY</code>.`,
          `BuildKit builds the image and, with <code>--sbom</code> and <code>--provenance</code>, attaches attestations describing contents and build process.`,
          `The scanner checks the image against vulnerability databases; the pipeline fails on fixable critical/high findings unless an exception with an expiry exists.`,
          `The image digest is signed and pushed to a registry with RBAC and immutable tags, which keeps rescanning as new CVEs appear; the deploy step or admission controller verifies the signature and policies before running it.`
        ]
      },
      cmds: [
        {
          t: "Scan an image with Docker Scout",
          lang: "sh",
          code: `docker scout quickview orders-api:1.4.2
docker scout cves --only-severity critical,high --only-fixed orders-api:1.4.2
docker scout recommendations orders-api:1.4.2
docker scout compare --to orders-api:1.4.1 orders-api:1.4.2`,
          out: `  Target     │  orders-api:1.4.2  │    0C     2H     9M    31L
    digest   │  9f1c2b7d8a10      │
  Base image │  python:3.12-slim  │    0C     2H     9M    31L
  Updated base image │ python:3.12-slim │ 0C  0H  6M  29L
…
## Recommended fixes
  Base image is python:3.12-slim … Rebuild the image using a newer base image version to fix 2 high …`,
          note: `<p>Output format and available subcommands evolve; some features require signing in with a Docker account. Note how the base image accounts for all findings in this example: rebuilding on the updated base fixes them.</p>`
        },
        {
          t: "Scan with Trivy and fail the build on fixable high/critical",
          lang: "sh",
          code: `trivy image --severity HIGH,CRITICAL --ignore-unfixed --exit-code 1 orders-api:1.4.2
echo "exit: $?"
# generate an SBOM file with Trivy
trivy image --format cyclonedx --output sbom.cdx.json orders-api:1.4.2
# scan the Dockerfile and Compose files for misconfigurations
trivy config .`,
          out: `orders-api:1.4.2 (debian 12.7)
Total: 2 (HIGH: 2, CRITICAL: 0)
┌──────────────┬────────────────┬──────────┬───────────────────┬───────────────┬──────────────────────────────┐
│   Library    │ Vulnerability  │ Severity │ Installed Version │ Fixed Version │            Title             │
├──────────────┼────────────────┼──────────┼───────────────────┼───────────────┼──────────────────────────────┤
│ libexample1  │ CVE-2026-XXXXX │ HIGH     │ 1.2.3-1           │ 1.2.3-1+deb12u1 │ …                          │
└──────────────┴────────────────┴──────────┴───────────────────┴───────────────┴──────────────────────────────┘
exit: 1`,
          note: `<p>The CVE row is illustrative. Keep accepted risks in a <code>.trivyignore</code> (or VEX file) with a comment and review date rather than lowering the threshold.</p>`
        },
        {
          t: "Build with SBOM and provenance attestations and inspect them",
          lang: "sh",
          code: `docker buildx build \\
  --sbom=true --provenance=mode=max \\
  -t ghcr.io/acme/orders-api:1.4.2 --push .
docker buildx imagetools inspect ghcr.io/acme/orders-api:1.4.2
docker buildx imagetools inspect ghcr.io/acme/orders-api:1.4.2 --format '{{ json .SBOM.SPDX.packages }}' | head -c 400
docker buildx imagetools inspect ghcr.io/acme/orders-api:1.4.2 --format '{{ json .Provenance.SLSA.invocation.configSource }}'`,
          out: `Name:      ghcr.io/acme/orders-api:1.4.2
MediaType: application/vnd.oci.image.index.v1+json
Digest:    sha256:7e1a…c9
Manifests:
  Name:      ghcr.io/acme/orders-api:1.4.2@sha256:51d0…
  Platform:  linux/amd64
  Name:      ghcr.io/acme/orders-api:1.4.2@sha256:a33f…
  Platform:  unknown/unknown
  Annotations:
    vnd.docker.reference.type: attestation-manifest
…`,
          note: `<p>The <code>unknown/unknown</code> entry is the attestation manifest; older tools that do not understand it may show it as an extra platform. The exact JSON paths available via <code>--format</code> depend on the provenance version (SLSA v0.2 vs v1); explore with <code>--format '{{ json .Provenance }}'</code>.</p>`
        },
        {
          t: "The ARG/ENV leak, and the build-secret fix",
          lang: "dockerfile",
          code: `# syntax=docker/dockerfile:1
# --- BAD: the token ends up in image metadata and history ---
FROM node:22-slim AS bad
ARG NPM_TOKEN
RUN echo "//registry.npmjs.org/:_authToken=\${NPM_TOKEN}" > ~/.npmrc && npm ci && rm ~/.npmrc

# --- GOOD: secret mounted only for this RUN, never stored ---
FROM node:22-slim AS good
WORKDIR /web
COPY package.json package-lock.json ./
RUN --mount=type=secret,id=npmrc,target=/root/.npmrc \\
    --mount=type=cache,target=/root/.npm \\
    npm ci
# private Git dependency over the forwarded SSH agent
# RUN --mount=type=ssh git clone git@github.com:acme/private-lib.git`,
          note: `<p>Build the good stage with <code>docker build --target good --secret id=npmrc,src=$HOME/.npmrc .</code> (and <code>--ssh default</code> for the SSH mount). Recent Dockerfile syntax also supports exposing a secret as an environment variable for one <code>RUN</code> with <code>--mount=type=secret,id=TOKEN,env=TOKEN</code>.</p>`
        },
        {
          t: "Prove the leak with docker history",
          lang: "sh",
          code: `docker build --target bad --build-arg NPM_TOKEN=npm_SuperSecret123 -t leaky .
docker history --no-trunc leaky | grep -o 'NPM_TOKEN=[^ ]*'
docker build --target good --secret id=npmrc,src=$HOME/.npmrc -t clean .
docker history --no-trunc clean | grep -c SuperSecret`,
          out: `NPM_TOKEN=npm_SuperSecret123
0`,
          note: `<p>The <code>rm ~/.npmrc</code> in the bad version did not help: the build arg is recorded in the history entry of the <code>RUN</code> that used it. If a secret ever reached an image that was pushed, rotate the secret; deleting the tag does not remove copies others have pulled.</p>`
        },
        {
          t: "Docker Content Trust: generate keys, sign, inspect, enforce",
          lang: "sh",
          code: `export DOCKER_CONTENT_TRUST=1
# delegation key for the signer "alice" (writes alice.pub, private key under ~/.docker/trust/private)
docker trust key generate alice
docker trust signer add --key alice.pub alice registry.example.com/acme/orders-api
docker trust sign registry.example.com/acme/orders-api:1.4.2
docker trust inspect --pretty registry.example.com/acme/orders-api:1.4.2
# with DCT on, pulling an unsigned tag fails
docker pull registry.example.com/acme/orders-api:unsigned-test
# bypass for a single command (explicit and auditable)
docker pull --disable-content-trust registry.example.com/acme/orders-api:unsigned-test`,
          out: `Signatures for registry.example.com/acme/orders-api:1.4.2
SIGNED TAG   DIGEST                                                             SIGNERS
1.4.2        7e1a…c9                                                            alice
List of signers and their keys …
Administrative keys for registry.example.com/acme/orders-api:
  Repository Key: 3cb2…
  Root Key:       a91e…
Error: remote trust data does not exist for registry.example.com/acme/orders-api: … does not have trust data for …`,
          note: `<p>DCT requires a Notary server alongside the registry (Docker Hub provided one; self-hosted registries need their own). The first <code>signer add</code> on a repository initialises it and prompts for root and repository key passphrases.</p>`
        },
        {
          t: "Modern signing with cosign (by digest)",
          lang: "sh",
          code: `DIGEST=$(docker buildx imagetools inspect ghcr.io/acme/orders-api:1.4.2 --format '{{json .Manifest.Digest}}' | tr -d '"')
cosign generate-key-pair
cosign sign --key cosign.key ghcr.io/acme/orders-api@$DIGEST
cosign verify --key cosign.pub ghcr.io/acme/orders-api:1.4.2
# keyless (in CI with OIDC): sign without managing keys, verify by identity
cosign verify ghcr.io/acme/orders-api:1.4.2 \\
  --certificate-identity-regexp 'https://github.com/acme/orders-api/.github/workflows/.*' \\
  --certificate-oidc-issuer https://token.actions.githubusercontent.com`,
          note: `<p>Always sign the <b>digest</b>, not a tag. Signatures are stored as OCI artifacts in the same repository. Notation follows a similar flow (<code>notation sign</code>, <code>notation verify</code>) with trust policies.</p>`
        },
        {
          t: "Swarm secrets preview",
          lang: "sh",
          code: `docker swarm init
printf 'S3cure-pg-pass' | docker secret create db_password -
docker secret ls
docker secret inspect db_password --format '{{json .Spec}}'
docker service create --name pg --secret db_password \\
  -e POSTGRES_PASSWORD_FILE=/run/secrets/db_password postgres:16
docker exec $(docker ps -q -f name=pg) ls -l /run/secrets/
# rotate: new secret, swap it in the service
printf 'N3w-pass' | docker secret create db_password_v2 -
docker service update --secret-rm db_password --secret-add source=db_password_v2,target=db_password pg`,
          out: `ID                          NAME          DRIVER    CREATED          UPDATED
k3j2…                       db_password             10 seconds ago   10 seconds ago
{"Name":"db_password","Labels":{}}
-r--r--r-- 1 root root 14 Nov 16 10:20 db_password`,
          note: `<p>The value is never returned by the API. Rotating a database password also requires changing it inside the database; the secret update only changes what the container reads.</p>`
        }
      ],
      internals: `<p><b>How scanners see packages.</b> A scanner pulls or reads the image layers, reconstructs the filesystem (applying whiteouts), and parses package databases: <code>/var/lib/dpkg/status</code> (Debian/Ubuntu), <code>/lib/apk/db/installed</code> (Alpine), <code>/var/lib/rpm</code> (RHEL), plus language manifests and binaries' embedded metadata. Distroless images keep minimal dpkg metadata (under <code>/var/lib/dpkg/status.d/</code>) so they remain scannable. A binary copied in with no metadata (for example a curl you <code>COPY</code>ed from elsewhere) is often invisible to scanners: another reason to install through package managers or emit SBOMs at build time.</p>
<p><b>Attestations in the registry.</b> With <code>--sbom</code>/<code>--provenance</code>, BuildKit produces an OCI <b>image index</b> containing the platform image manifests plus an attestation manifest per platform. The attestation manifest's layers are in-toto statements (predicate types <code>https://spdx.dev/Document</code> and <code>https://slsa.dev/provenance/…</code>), and its annotations (<code>vnd.docker.reference.digest</code>) point at the image manifest they describe. The SBOM is produced by a scanner plugin running inside BuildKit (Syft-based by default) over the final filesystem and, optionally, build stages.</p>
<p><b>DCT/Notary.</b> With <code>DOCKER_CONTENT_TRUST=1</code> the CLI (not the daemon) talks to the Notary server for the registry: on pull it downloads signed TUF metadata (root → targets → delegations, plus snapshot and timestamp), verifies the chain, finds the digest for the tag, and then asks the daemon to pull <b>by digest</b>. That is why trust is enforced per client and why a client without the variable bypasses it; enforcing it cluster-wide was an MKE feature. The timestamp key (held by the server) gives freshness and prevents replaying old metadata.</p>
<p><b>cosign</b> computes the signature over a payload containing the image digest and stores it as an OCI artifact tagged <code>sha256-&lt;digest&gt;.sig</code> (or via the OCI referrers API) in the same repository; keyless mode records the signing certificate in the Rekor transparency log.</p>
<p><b>Secret mounts.</b> BuildKit receives secrets from the client over the session (gRPC) channel at build time, never in the build context. For the <code>RUN</code> that requests it, runc mounts a tmpfs file at the target path; the content is not part of the cache key and not written to the snapshot that becomes the layer. Build args, by contrast, are part of the instruction's cache key and history metadata.</p>
<p><b>Swarm secrets</b> live in the Raft store encrypted at rest (with optional autolock so managers need an unlock key after restart). The manager's dispatcher sends a secret only to workers assigned a task that references it; the worker's executor mounts it on a tmpfs under the task's directory and bind-mounts it into the container at <code>/run/secrets</code>; it is removed when the task stops.</p>`,
      prod: `<p>Supply chain for the React → FastAPI → Redis → PostgreSQL product:</p>
<ul class="pts">
<li><b>Inputs:</b> bases pinned by digest and bumped by Renovate; <code>package-lock.json</code> and hashed <code>requirements.txt</code>; private npm and PyPI tokens provided via <code>--secret</code> from CI secrets; no <code>ARG</code>s that carry credentials. A pre-commit and CI secret scanner (gitleaks, trufflehog) runs on the repository.</li>
<li><b>CI:</b> <code>docker/build-push-action</code> with <code>sbom: true</code> and <code>provenance: mode=max</code>; Trivy blocks fixable critical/high; keyless cosign signing using the workflow's OIDC identity; push to GHCR with immutable SHA tags.</li>
<li><b>Registry:</b> tag immutability, continuous rescanning with alerts to the owning team (from the OCI <code>source</code> label), lifecycle cleanup.</li>
<li><b>Deploy:</b> the deploy job verifies the cosign signature and identity before <code>docker compose up</code>; on Kubernetes an admission policy does the same and rejects unsigned images or images from other registries.</li>
<li><b>Runtime secrets:</b> PostgreSQL and API credentials as files (<code>/run/secrets</code>) from Swarm secrets or a secret manager; rotation runbook tested.</li>
<li><b>Patching:</b> a weekly scheduled pipeline rebuilds all images even without code changes, so base-image fixes reach production within days.</li>
</ul>`,
      iq: [
        ["dca", "Which environment variable enables Docker Content Trust on the client, and what happens to docker pull of an unsigned tag when it is set?", `<p><code>DOCKER_CONTENT_TRUST=1</code>. Pulls (and <code>run</code>, <code>build</code> <code>FROM</code>, <code>create</code>) of tags without trust data fail with an error that no trust data exists; pushes are signed. It is a client-side setting: other clients without the variable are not restricted. <code>--disable-content-trust</code> bypasses it for one command.</p>`],
        ["dca", "Which command adds a signer to a repository for Docker Content Trust, and which signs a specific tag?", `<p><code>docker trust signer add --key &lt;name&gt;.pub &lt;name&gt; &lt;registry/repo&gt;</code> adds a delegation signer (initialising the repository's root and targets keys the first time), and <code>docker trust sign &lt;registry/repo:tag&gt;</code> signs the tag. <code>docker trust inspect --pretty</code> shows signers; <code>docker trust key generate</code> creates a key pair. <code>docker sign</code> and <code>docker image sign</code> do not exist.</p>`],
        ["dca", "A developer passed an API key with --build-arg and deleted the file at the end of the RUN step. Is the key exposed? Which TWO statements are true? (a) docker history --no-trunc can reveal the build-arg value. (b) Deleting the file removes all traces. (c) BuildKit secret mounts avoid storing the value in layers. (d) Using ENV instead of ARG would hide it.", `<p><b>(a) and (c).</b> Build-arg values used by a <code>RUN</code> appear in the image history; deleting a file does not remove the history metadata (b is false), and <code>ENV</code> is even worse because it is stored in the image config and visible in <code>docker inspect</code> and to the running container (d is false). Use <code>RUN --mount=type=secret</code> and rotate the leaked key.</p>`],
        ["dca", "Where does a container read a Swarm secret, and how are secrets protected?", `<p>As a file at <code>/run/secrets/&lt;secret_name&gt;</code> (or a custom <code>target</code>) on an in-memory filesystem. Secrets are encrypted at rest in the managers' Raft log, sent over mutual TLS only to nodes running tasks that need them, never shown by <code>docker secret inspect</code>, and removed from the node when the task stops. They are immutable; rotate by adding a new secret.</p>`],
        ["mid", "What is an SBOM and why attach it to the image rather than keep it in CI logs?", `<p>A machine-readable inventory (SPDX or CycloneDX) of every package and version in the image. Attached as an attestation, it travels with the image digest, so when a new CVE appears (like Log4Shell) you can query which deployed images contain the affected component without rebuilding or rescanning, and customers or auditors can retrieve it from the registry.</p>`],
        ["senior", "Your scanner reports 140 CVEs in the API image. How do you triage?", `<p>Filter to <b>fixable</b> findings first; check how many come from the base image (usually most) and rebuild on the latest patched base or switch to a smaller base. For the remainder, prioritise critical/high in packages that are actually used/reachable (runtime vs build-only, network-exposed). Record accepted risks with justification and expiry (VEX, ignore files). Set a policy: block releases on fixable critical/high, schedule rebuilds weekly, and track the trend.</p>`],
        ["senior", "What does provenance add beyond a signature?", `<p>A signature says "this key holder approved this digest". Provenance (SLSA) says how the artifact was built: source repo and commit, builder identity, build parameters and base images. Together they let a deploy policy require "signed by our CI identity <b>and</b> built from the main branch of this repo by our builder", which stops an attacker who stole a signing key from signing an image built elsewhere (if provenance itself is signed and verified).</p>`],
        ["dca", "In Mirantis Kubernetes Engine (formerly UCP), what three elements make up an RBAC grant?", `<p>A <b>subject</b> (user, team, organisation or service account), a <b>role</b> (a set of permitted operations, for example View Only, Restricted Control, Full Control), and a <b>resource set</b> (a Swarm collection or a Kubernetes namespace). This is enterprise functionality; open-source Docker Engine has no built-in RBAC. Exact role names and features vary by version; check current documentation.</p>`],
        ["lead", "Design an image promotion process with registry features.", `<p>Separate repositories or projects per stage (<code>dev/</code>, <code>prod/</code>) with different push permissions: CI can push to dev; only a promotion job (or MSR/Harbor promotion policy) can write to prod, and only images whose scan meets the threshold, with a valid signature and attestations. Tags are immutable; promotion copies by digest without rebuilding. Production hosts pull only from <code>prod/</code> and verify signatures.</p>`]
      ],
      gotchas: [
        `Images are frozen: an image scanned clean last month can have new critical CVEs today. Rescan continuously and rebuild on a schedule.`,
        `<code>DOCKER_CONTENT_TRUST</code> is per client and per shell; a CI job or colleague without it pulls unsigned images happily. Enforcement must be at a central point.`,
        `Signing a tag that is later overwritten: signatures bind to digests. Always deploy and verify by digest or with immutable tags.`,
        `<code>docker build --load</code> into the classic image store drops SBOM/provenance attestations; push to a registry or use the containerd image store to keep them.`,
        `An <code>ARG</code> used only in an earlier build stage does not appear in the final image's history, but the value still exists in the builder cache and in that stage's image if you build and push it with <code>--target</code>. Multi-stage is not a secrets mechanism.`,
        `Scanners can miss binaries added with <code>COPY</code> or <code>curl</code> without package metadata; prefer package managers or generate SBOMs at build time.`,
        `<code>.env</code> files copied by <code>COPY . .</code> are a classic leak; keep them in <code>.dockerignore</code>.`,
        `MKE/MSR features and names are vendor-specific and have changed across versions; for the exam learn the concepts (grants, collections, scanning, promotion, immutability) rather than exact UI steps.`
      ],
      best: [
        `Scan in CI and in the registry; block on fixable critical/high; rebuild weekly on patched bases.`,
        `Generate SBOM and provenance for every pushed image and keep them with the image.`,
        `Sign by digest in CI (cosign keyless or Notation) and verify at deploy/admission; know DCT for the exam.`,
        `Pass build secrets only with <code>--mount=type=secret</code>/<code>--mount=type=ssh</code>; never <code>ARG</code>, <code>ENV</code> or <code>COPY</code> for credentials; rotate anything that leaked.`,
        `Use runtime secrets as files from Swarm secrets or a secret manager.`,
        `Separate push and pull permissions by environment; make production repositories immutable and writable only by promotion.`
      ],
      lab: [
        `Scan your <code>orders-api</code> image with <code>docker scout quickview</code> or <code>trivy image</code>; note how many findings come from the base. Rebuild on <code>python:3.12-slim</code> latest digest (or distroless) and compare.`,
        `Build the "bad" ARG stage with a fake token and find it with <code>docker history --no-trunc</code>; rebuild with <code>--secret</code> and show the token is absent.`,
        `Push an image to a registry with <code>--sbom=true --provenance=mode=max</code> (a local <code>registry:2</code> works) and inspect the attestations with <code>docker buildx imagetools inspect</code>.`,
        `Sign the pushed image with cosign using a key pair and verify it; change the tag to a different image and observe verification fail.`,
        `Optional: in a single-node swarm, create a secret and run <code>postgres:16</code> with <code>POSTGRES_PASSWORD_FILE</code>; confirm the file in <code>/run/secrets</code>.`,
        `<b>Done when:</b> your pipeline (or a script) builds, scans with a failing threshold, attaches SBOM/provenance, signs and verifies an image, and no secret appears in <code>docker history</code>.`
      ],
      teach: `<p>"An image is only as trustworthy as everything that went into it. First, vulnerabilities: scanners like Docker Scout or Trivy read the package databases in the image and match CVEs. Most findings come from the base image, and images don't patch themselves, so we block fixable highs in CI and rebuild weekly on patched bases.</p>
<p>Second, transparency: BuildKit can attach an SBOM, the list of every package, and provenance, how and from what commit it was built, as attestations next to the image. Third, integrity: we sign the image digest. Docker's original mechanism is Content Trust with Notary: set <code>DOCKER_CONTENT_TRUST=1</code> and pushes are signed and unsigned pulls fail, managed with <code>docker trust</code> commands. Today cosign or Notation are more common, and verification happens at deploy time.</p>
<p>Finally, secrets: anything passed with <code>ARG</code> or <code>ENV</code> is visible in <code>docker history</code> or <code>inspect</code>, so build secrets go through <code>RUN --mount=type=secret</code>, and runtime secrets are files in <code>/run/secrets</code>, from Swarm or a secret manager. In enterprise setups like Mirantis Kubernetes Engine and Secure Registry, RBAC grants and promotion policies make sure only scanned, signed images reach production."</p>`
    }
  ],
  quiz: [
    {
      q: `A monitoring tool's documentation says to run it like this on every production host. What is the risk, and what would you do instead?`,
      code: `docker run -d --name monitor -v /var/run/docker.sock:/var/run/docker.sock vendor/monitor:latest`,
      lang: "sh",
      ans: `The container gets full control of a root daemon, which is equivalent to root on the host; and <code>:latest</code> means its code can change at any time.`,
      why: `Anything that can call the Docker API can start a privileged container mounting <code>/</code>. If the vendor image or its update channel is compromised, every host is compromised. Use a read-only filtering socket proxy exposing only the endpoints it needs (for example container list and stats), pin the image by digest, and drop capabilities. Mounting the socket <code>:ro</code> does not help: read-only applies to the socket file, not to API calls over it.`
    },
    {
      q: `After adding <code>--cap-drop ALL</code> to the official <code>postgres:16</code> container, it fails to start with <i>chown: changing ownership of '/var/lib/postgresql/data': Operation not permitted</i>. Fix it without going back to the default capability set.`,
      ans: `Add back only what the entrypoint needs: <code>--cap-add CHOWN --cap-add DAC_OVERRIDE --cap-add FOWNER --cap-add SETUID --cap-add SETGID</code>.`,
      why: `The postgres entrypoint starts as root, fixes ownership of the data directory and then switches to the <code>postgres</code> user with gosu, which needs <code>CHOWN</code>/<code>FOWNER</code>/<code>DAC_OVERRIDE</code> and <code>SETUID</code>/<code>SETGID</code>. Alternatively prepare the volume ownership and run with <code>--user 999:999</code> (the image's postgres UID; verify for your image). <code>--privileged</code> would "fix" it by removing all protection.`
    },
    {
      q: `A security review finds the token below in a public image. The developer says "but I deleted .npmrc in the same RUN". Who is right and what now?`,
      code: `$ docker history --no-trunc acme/web:2.3.0 | grep NPM
RUN |1 NPM_TOKEN=npm_9aF… /bin/sh -c echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > ~/.npmrc && npm ci && rm ~/.npmrc`,
      lang: "sh",
      ans: `The reviewer: build-arg values used by RUN are recorded in image history. Revoke the token now, then switch to a BuildKit secret mount.`,
      why: `The file is gone from the layer, but the history entry contains the argument value. Since the image was public, assume the token is compromised: revoke/rotate first, then fix the Dockerfile with <code>RUN --mount=type=secret,id=npmrc,target=/root/.npmrc npm ci</code> and remove the vulnerable tags. Deleting the tag does not undo existing pulls.`
    },
    {
      q: `With <code>export DOCKER_CONTENT_TRUST=1</code> set, a developer runs <code>docker pull registry.example.com/acme/orders-api:1.5.0</code> and gets "remote trust data does not exist". The image definitely exists in the registry. What is going on?`,
      ans: `The tag was pushed without being signed (or the registry has no Notary trust data), so DCT refuses to pull it.`,
      why: `With DCT enabled the client first looks up signed trust data for the tag and only then pulls by digest. Sign it with <code>docker trust sign</code> (or push with DCT enabled from an authorised signer) and check with <code>docker trust inspect --pretty</code>. <code>--disable-content-trust</code> would bypass the check but defeats its purpose.`
    },
    {
      q: `A team wants "maximum isolation" and proposes running every service with <code>--privileged</code> inside a user namespace-remapped daemon "so root is unprivileged anyway". Evaluate.`,
      ans: `Wrong on two counts: privileged containers are not supported with userns-remap unless the container opts out with <code>--userns=host</code>, and <code>--privileged</code> removes capabilities, seccomp and LSM protections.`,
      why: `With remapping enabled, a privileged container requires <code>--userns=host</code>, so its root is real host root again with every protection disabled. Maximum isolation comes from the opposite direction: non-root, <code>--cap-drop ALL</code>, default seccomp/AppArmor, read-only root, user namespaces or rootless, and sandboxed runtimes for untrusted code.`
    },
    {
      q: `The scanner shows 0 critical findings in CI on Monday, but on Thursday the registry flags the same digest with a critical CVE. Nothing was rebuilt. Explain and describe the process you would put in place.`,
      ans: `The image did not change; the vulnerability database did. Images must be rescanned continuously and rebuilt when fixes appear.`,
      why: `New CVEs are disclosed daily against existing package versions. Registry-side continuous scanning is what caught it. Process: alert the owner (via the <code>source</code> label), check fix availability, rebuild on the patched base through the normal pipeline (scan, sign, push new immutable tag), deploy, and use SBOMs to find every other image containing the same package.`
    }
  ]
},
/* ===== Day 8 ===== */
{
  n: 8,
  title: "Troubleshooting and internals",
  goal: `<b>By the end of today</b> you can debug the three classic failures (a container that exits immediately, an API that runs but cannot be reached, an API that cannot reach PostgreSQL) with a repeatable method and the right Docker tools, and you can prove on a real host how <code>docker run</code> becomes CLI → dockerd → containerd → shim → runc → kernel namespaces and cgroups → your process.`,
  rev: [
    `<b>Method:</b> observe (<code>docker ps -a</code>, <code>logs</code>, <code>inspect</code> State/ExitCode/OOMKilled) → form a hypothesis → test it from <b>inside</b> the network/namespace (<code>exec</code>, a debug sidecar) → change one thing → verify.`,
    `<b>Exit codes:</b> 0 command finished, 1 app error, 2 misuse/missing file (Python), 126 not executable, 127 not found, 137 SIGKILL (OOM or stop timeout), 139 segfault, 143 SIGTERM; <i>exec format error</i> = wrong CPU architecture.`,
    `<b>Networking failures:</b> app bound to <code>127.0.0.1</code> inside the container, wrong container port in <code>-p host:container</code>, containers on different networks, host firewall; inside a container <code>localhost</code> is the container itself, so FastAPI must use <code>postgres:5432</code>, not <code>localhost:5432</code> or the host-published port.`,
    `<b>Tools:</b> <code>logs --since/-f/--tail</code>, <code>inspect --format</code> Go templates, <code>stats</code>, <code>top</code>, <code>events</code>, <code>network inspect</code>, <code>volume inspect</code>, <code>system df</code>/<code>prune</code>, <code>cp</code>, <code>diff</code>, <code>docker debug</code> or a <code>--pid</code>/<code>--network container:</code> sidecar for distroless.`,
    `<b>Internals:</b> dockerd → containerd → <code>containerd-shim-runc-v2</code> (parent of your process, survives daemon restarts) → runc (creates namespaces + cgroups, then exits). Evidence: <code>/proc/&lt;pid&gt;/ns</code>, <code>lsns</code>, <code>nsenter</code>, <code>/sys/fs/cgroup/…/memory.max</code>, overlay mounts, <code>/var/lib/docker</code>, <code>ctr -n moby</code>.`
  ],
  topics: [
    {
      id: "d8-troubleshooting",
      title: "Troubleshooting broken containers: a systematic method",
      lv: ["fresher", "mid", "senior", "dca"],
      eli5: `<p>A good doctor does not guess. They ask what happened (<b>logs</b>), take your temperature and pulse (<b>inspect</b>, <b>stats</b>), look at the X-ray (<b>network inspect</b>, <b>volume inspect</b>), form a theory, and run one test at a time. Troubleshooting containers is the same: observe, hypothesise, test, change one thing, check again.</p>
<p>The most common container illnesses are simple once you know them. <b>"It died at birth"</b>: the container did exactly what it was told and the command finished, or the command could not be found. <b>"It is alive but nobody can visit"</b>: the app is listening on its own private doorbell (127.0.0.1) instead of the front door (0.0.0.0), or the front door number on the street (host port) points to the wrong room (container port). <b>"It cannot phone its friend"</b>: it is dialling its own number (<code>localhost</code>) instead of the friend's name (<code>postgres</code>), or the friend is in a different building (another network), or the friend has not woken up yet.</p>
<p>And when the patient cannot talk (a distroless image with no shell), you send in a second doctor who shares the same room (a debug container joined to the same namespaces).</p>`,
      what: `<p><b>The method.</b> Work from the outside in and from symptoms to evidence:</p>
<ul class="pts">
<li><b>1. Observe state:</b> <code>docker ps -a</code> (status, restarts, ports), <code>docker inspect</code> (<code>.State.Status</code>, <code>ExitCode</code>, <code>Error</code>, <code>OOMKilled</code>, <code>Health</code>, <code>RestartCount</code>, <code>StartedAt</code>/<code>FinishedAt</code>).</li>
<li><b>2. Read what the process said:</b> <code>docker logs --tail 100</code>, <code>--since 10m</code>, <code>-f</code>, <code>--timestamps</code>. Logs survive while the container exists, even after it exits.</li>
<li><b>3. Look at the environment:</b> the effective command (<code>.Config.Entrypoint</code>, <code>.Config.Cmd</code>), env, mounts, networks, ports, user, image platform.</li>
<li><b>4. Test from the right place:</b> network problems must be tested from inside the same network namespace (<code>docker exec</code>, or a debug container with <code>--network container:&lt;name&gt;</code>), not just from your laptop.</li>
<li><b>5. Watch over time:</b> <code>docker events</code> (die, oom, kill, health_status, restart), <code>docker stats</code>, <code>docker top</code>.</li>
<li><b>6. Change one thing, verify, record.</b></li>
</ul>
<p><b>Scenario 1: the container exits immediately.</b> A container lives exactly as long as its main process. Typical causes:</p>
<ul class="pts">
<li><b>The command finished</b> (exit 0): a CMD that runs a script and returns, an image whose default command is a shell or REPL (<code>python:3.12-slim</code> runs <code>python3</code>, which exits without a TTY), or a server that daemonises (Nginx without <code>daemon off;</code>, a service started with <code>service x start</code>). Fix: run the server in the foreground.</li>
<li><b>Missing file or module</b>: <i>python: can't open file '/app/main.py'</i> (exit 2), <i>ModuleNotFoundError</i> (exit 1), wrong <code>WORKDIR</code>, a bind mount hiding the image's <code>/app</code>, a <code>.dockerignore</code> that excluded the file.</li>
<li><b>Command not found / not executable</b>: <i>exec: "uvicorn": executable file not found in $PATH</i> (exit 127), <i>permission denied</i> (126; missing <code>chmod +x</code>), or an entrypoint script with Windows CRLF line endings, which fails with <i>no such file or directory</i> because the kernel looks for an interpreter named <code>/bin/sh\r</code>.</li>
<li><b>Exec format error</b>: <i>exec /usr/local/bin/app: exec format error</i>: the binary is for another CPU architecture, typically an arm64 image built on Apple silicon running on an amd64 server. Check <code>docker image inspect -f '{{.Os}}/{{.Architecture}}'</code>; build with <code>--platform linux/amd64</code> or multi-platform with <code>buildx</code>.</li>
<li><b>Configuration error at start-up</b>: missing env var, failed migration, DB unreachable and the app exits instead of retrying. Logs show it.</li>
<li><b>Killed</b>: 137 with <code>OOMKilled=true</code> (Day 6).</li>
</ul>
<p>To investigate a container that exits too fast to <code>exec</code> into: read <code>docker logs</code>; run the image with a shell as the command (<code>docker run --rm -it --entrypoint sh &lt;image&gt;</code>) and run the CMD by hand; or <code>docker cp</code> files out of the stopped container; or commit it to an image and inspect.</p>
<p><b>Scenario 2: the API is running but inaccessible.</b></p>
<ul class="pts">
<li><b>Bind address:</b> a server listening on <code>127.0.0.1</code> inside the container only accepts connections from inside that container's network namespace; port publishing delivers traffic to the container's <code>eth0</code> address, so it is refused. Uvicorn's default <code>--host</code> is <code>127.0.0.1</code>; Vite/webpack dev servers too. Symptom: <code>curl localhost:8000</code> on the host gives <i>Connection reset by peer</i> or <i>Empty reply</i>. Fix: <code>--host 0.0.0.0</code>.</li>
<li><b>Port mapping:</b> <code>-p HOST:CONTAINER</code>. <code>-p 8000:80</code> when the app listens on 8000 inside is wrong. <code>EXPOSE</code> documents a port but publishes nothing. Check <code>docker port api</code> and <code>docker ps</code>' PORTS column (no <code>0.0.0.0:8000-&gt;8000/tcp</code> means nothing is published).</li>
<li><b>Published on the wrong interface:</b> <code>-p 127.0.0.1:8000:8000</code> is unreachable from other machines (sometimes intentional).</li>
<li><b>Wrong network</b> for container-to-container traffic: the proxy and the API must share a user-defined network; published ports are irrelevant between containers.</li>
<li><b>Firewall / cloud:</b> security group, host firewall rules in the <code>DOCKER-USER</code> chain, corporate proxy, or Docker Desktop's VM networking.</li>
<li><b>The app is not actually listening yet</b> (still starting, crashed worker, health <code>starting</code>).</li>
</ul>
<p><b>Scenario 3: the API cannot connect to PostgreSQL.</b> The classic: <code>DATABASE_URL=postgresql://app:pw@localhost:5432/app</code> fails with <i>Connection refused</i> while <code>postgres:5432</code> works. Inside the API container <code>localhost</code> is the API container's own loopback; PostgreSQL is a different container with a different network namespace. Checklist:</p>
<ul class="pts">
<li><b>Hostname/DNS:</b> use the Compose service name (or container name / network alias). Embedded DNS (<code>127.0.0.11</code>) only works on <b>user-defined</b> networks; on the default <code>bridge</code> names do not resolve. Test: <code>docker exec api getent hosts postgres</code>.</li>
<li><b>Network:</b> both containers on the same network (<code>docker network inspect</code>); an <code>internal</code> network is fine for this.</li>
<li><b>Port:</b> containers talk to the <b>container port</b> (5432), not the host-published port (for example 15432 in <code>-p 15432:5432</code>).</li>
<li><b>Credentials:</b> <i>password authentication failed</i>. <code>POSTGRES_PASSWORD</code>/<code>POSTGRES_USER</code>/<code>POSTGRES_DB</code> are applied <b>only when the data directory is empty</b> (first initialisation). Changing them later does nothing for an existing volume.</li>
<li><b>Readiness:</b> <code>depends_on</code> without a condition only orders start-up; PostgreSQL may still be initialising. Use a <code>pg_isready</code> health check with <code>condition: service_healthy</code>, and make the app retry with back-off anyway.</li>
<li><b>Listen/HBA config:</b> custom <code>postgresql.conf</code> with <code>listen_addresses='localhost'</code> or a restrictive <code>pg_hba.conf</code> blocks other containers.</li>
</ul>
<p><b>The toolbox.</b></p>
<ul class="pts">
<li><code>docker exec -it &lt;c&gt; sh</code>: run a process inside the container's namespaces (needs the container running and a shell in the image).</li>
<li><code>docker logs</code>: <code>--tail N</code>, <code>-f</code>, <code>--since 10m</code> / <code>--since 2026-11-16T10:00:00</code>, <code>--until</code>, <code>-t</code>.</li>
<li><code>docker inspect --format</code> (<code>-f</code>) with Go templates: <code>{{.State.ExitCode}}</code>, <code>{{json .Mounts}}</code>, <code>{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}</code>, <code>{{index .Config.Labels "key"}}</code>; pipe <code>{{json .}}</code> into <code>jq</code>.</li>
<li><code>docker stats</code> (live CPU, memory vs limit, net/block I/O, PIDs), <code>docker top</code> (processes, via host <code>ps</code>), <code>docker events</code> (filter by <code>container</code>, <code>event</code>, <code>type</code>, <code>--since</code>).</li>
<li><code>docker network inspect</code> (subnet, gateway, attached containers and IPs), <code>docker volume inspect</code> (driver, <code>Mountpoint</code> on the host), <code>docker port</code>.</li>
<li><code>docker system df</code> (<code>-v</code> for detail) and <code>docker system prune</code> (stopped containers, unused networks, dangling images, build cache; <code>-a</code> for all unused images; <code>--volumes</code> to include unused volumes, which on recent engines means anonymous volumes only).</li>
<li><code>docker cp</code> to copy files in or out (works on stopped containers and images without shells), <code>docker diff</code> to list files added (<code>A</code>), changed (<code>C</code>) or deleted (<code>D</code>) in the container's writable layer.</li>
<li><b>Distroless debugging:</b> <code>docker debug &lt;container&gt;</code> (a Docker Desktop feature that attaches a toolbox shell without modifying the image; availability depends on version and subscription), or a sidecar: <code>docker run -it --rm --network container:api --pid container:api nicolaka/netshoot</code>; the target's filesystem is visible at <code>/proc/1/root</code> (may need <code>--cap-add SYS_PTRACE</code>).</li>
</ul>`,
      why: `<p>Containers fail in a small number of recurring ways, but the surface symptoms ("it doesn't work", "connection refused", "it keeps restarting") look the same for very different causes. Random fixes (rebuild, add <code>--privileged</code>, open all ports, restart Docker) waste hours and sometimes create security holes.</p>
<p>A systematic method plus knowing which tool shows which piece of state turns most incidents into a 5-minute diagnosis. It is also what interviewers and the DCA test: "the container exits immediately, what do you check?", "which command shows the IP address of a container?", "the app works with <code>docker run</code> but not in Compose".</p>`,
      diagram: {
        html: flow([["Symptom", "exits / unreachable / cannot connect", "r"], ["State", "ps -a, inspect State, events", "w"], ["Output", "logs --tail --since", "w"], ["Config", "inspect Cmd, Env, Mounts, Networks, Ports", "w"], ["Test inside", "exec, sidecar, getent, curl, ss", "w"], ["Change one thing", "rebuild / rerun / recreate", "g"], ["Verify", "health, curl, logs clean", "g"]]),
        steps: [
          `Start from the symptom and classify it: never ran properly, runs but unreachable, or runs but its dependencies fail.`,
          `Collect state and output first (<code>ps -a</code>, <code>inspect</code>, <code>logs</code>, <code>events</code>); exit codes and the last log lines usually point straight at the cause.`,
          `Check effective configuration (the command actually run, env, mounts, networks, published ports), then test hypotheses from inside the container's network namespace.`,
          `Change one thing at a time and verify with an objective check (health status, <code>curl</code>, query succeeds); write the cause down for the runbook.`
        ]
      },
      cmds: [
        {
          t: "Scenario 1: a container that exits immediately",
          lang: "sh",
          code: `docker run -d --name api1 orders-api:broken
docker ps -a --filter name=api1 --format '{{.Names}}  {{.Status}}'
docker inspect -f 'status={{.State.Status}} exit={{.State.ExitCode}} oom={{.State.OOMKilled}} err={{.State.Error}}' api1
docker logs --tail 20 api1
docker inspect -f 'entrypoint={{json .Config.Entrypoint}} cmd={{json .Config.Cmd}} workdir={{.Config.WorkingDir}}' api1
# reproduce interactively: replace the entrypoint with a shell
docker run --rm -it --entrypoint sh orders-api:broken
#   inside: ls -la /app; which uvicorn; cat /etc/os-release; uname -m`,
          out: `api1  Exited (2) 3 seconds ago
status=exited exit=2 oom=false err=
python: can't open file '/srv/main.py': [Errno 2] No such file or directory
entrypoint=null cmd=["python","main.py"] workdir=/srv`,
          note: `<p>Here the code was copied to <code>/app</code> but <code>WORKDIR</code> is <code>/srv</code>. The exit code (2) plus one log line solved it. <code>State.Error</code> is filled when the runtime itself failed to start the process (for example executable not found), in which case <code>docker run</code> also prints an <i>OCI runtime create failed</i> error.</p>`
        },
        {
          t: "Exit causes you should recognise on sight",
          lang: "sh",
          code: `# command finished: python REPL with no TTY exits 0
docker run -d --name repl python:3.12-slim; sleep 1; docker ps -a --filter name=repl --format '{{.Status}}'
# daemonising server: nginx forks to background and PID 1 exits
docker run -d --name ngx nginx:1.27-alpine nginx; sleep 1; docker ps -a --filter name=ngx --format '{{.Status}}'
# executable not found
docker run --rm alpine uvicorn
# wrong architecture
docker run --rm --platform linux/arm64 alpine uname -m      # works only with emulation (Docker Desktop / binfmt)
docker image inspect -f '{{.Os}}/{{.Architecture}}' orders-api:1.4.2
# CRLF entrypoint script (made on Windows)
file docker-entrypoint.sh`,
          out: `Exited (0) 1 second ago
Exited (0) 1 second ago
docker: Error response from daemon: failed to create task for container: … exec: "uvicorn": executable file not found in $PATH: unknown.
aarch64
linux/arm64
docker-entrypoint.sh: POSIX shell script, ASCII text executable, with CRLF line terminators`,
          note: `<p>An <code>linux/arm64</code> image on an amd64 server without emulation fails with <i>exec format error</i>. Fix CRLF with <code>.gitattributes</code> (<code>*.sh text eol=lf</code>) or <code>dos2unix</code>, then rebuild.</p>`
        },
        {
          t: "Scenario 2: the API runs but cannot be reached",
          lang: "sh",
          code: `docker run -d --name api2 -p 8000:8000 orders-api:1.4.2 uvicorn app.main:app --port 8000
curl -sS http://localhost:8000/healthz
docker ps --filter name=api2 --format '{{.Ports}}'
docker port api2
# what is the process listening on, inside the container's network namespace?
docker exec api2 sh -c 'cat /proc/net/tcp | head -3'
docker run --rm --network container:api2 nicolaka/netshoot ss -lntp
# fix: listen on all interfaces
docker rm -f api2
docker run -d --name api2 -p 8000:8000 orders-api:1.4.2 uvicorn app.main:app --host 0.0.0.0 --port 8000
curl -sS http://localhost:8000/healthz`,
          out: `curl: (56) Recv failure: Connection reset by peer
0.0.0.0:8000->8000/tcp, [::]:8000->8000/tcp
8000/tcp -> 0.0.0.0:8000
State  Recv-Q Send-Q  Local Address:Port  Peer Address:Port Process
LISTEN 0      2048        127.0.0.1:8000       0.0.0.0:*     users:(("uvicorn",pid=1,fd=3))
{"status":"ok"}`,
          note: `<p>The port mapping was fine; the app was bound to 127.0.0.1 inside the container. <code>/proc/net/tcp</code> shows addresses in hex (<code>0100007F:1F40</code> = 127.0.0.1:8000) and works even when the image has no <code>ss</code> or <code>netstat</code>. On Docker Desktop the error message can differ (for example <i>Empty reply from server</i>).</p>`
        },
        {
          t: "Scenario 2b: wrong container port and wrong network",
          lang: "sh",
          code: `# app listens on 8000, but the mapping targets container port 80
docker run -d --name api3 -p 8000:80 orders-api:1.4.2
curl -sS http://localhost:8000/healthz
docker inspect -f '{{json .NetworkSettings.Ports}}' api3
# proxy and api on different networks: name resolution fails
docker network create front
docker run -d --name proxy --network front nginx:1.27-alpine
docker exec proxy wget -qO- http://api3:8000/healthz
docker network connect front api3
docker exec proxy getent hosts api3`,
          out: `curl: (56) Recv failure: Connection reset by peer
{"80/tcp":[{"HostIp":"0.0.0.0","HostPort":"8000"}],"8000/tcp":null}
wget: bad address 'api3:8000'
172.20.0.3      api3`,
          note: `<p><code>"8000/tcp":null</code> means the container port 8000 is exposed (by <code>EXPOSE</code>) but not published. Between containers, published ports do not matter; a shared user-defined network and the container port do.</p>`
        },
        {
          t: "Scenario 3: the API cannot connect to PostgreSQL",
          lang: "yaml",
          code: `# compose.yaml (broken version: three bugs)
services:
  api:
    image: orders-api:1.4.2
    environment:
      DATABASE_URL: postgresql://app:secret@localhost:15432/app
    depends_on: [postgres]
    ports: ["8000:8000"]
  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: app
    ports: ["15432:5432"]
    volumes: [pg-data:/var/lib/postgresql/data]
volumes:
  pg-data: {}`,
          note: `<p>Bugs: <code>localhost</code> (the API container itself), <code>15432</code> (the host-published port, not the container port), and <code>depends_on</code> without readiness. The fixed version uses <code>@postgres:5432</code>, a health check and <code>condition: service_healthy</code> (next block).</p>`
        },
        {
          t: "Investigate and fix scenario 3 step by step",
          lang: "sh",
          code: `docker compose up -d
docker compose logs --tail 20 api
docker compose exec api getent hosts localhost postgres
docker compose exec api python -c "import socket; s=socket.create_connection(('postgres', 5432), 3); print('tcp ok')"
docker network inspect -f '{{range .Containers}}{{.Name}} {{.IPv4Address}}{{println}}{{end}}' $(basename $PWD)_default
docker compose exec postgres pg_isready -U app
docker compose exec postgres psql -U app -d app -c 'select 1'
# after fixing DATABASE_URL to postgres:5432 and adding the healthcheck:
docker compose up -d
docker compose ps`,
          out: `sqlalchemy.exc.OperationalError: (psycopg.OperationalError) connection failed: connection to server at "127.0.0.1", port 15432 failed: Connection refused
::1             localhost
172.21.0.2      postgres
tcp ok
myproj-api-1 172.21.0.3/16
myproj-postgres-1 172.21.0.2/16
/var/run/postgresql:5432 - accepting connections
NAME                STATUS
myproj-api-1        Up 5 seconds (healthy)
myproj-postgres-1   Up 20 seconds (healthy)`,
          note: `<p>The network name is <code>&lt;project&gt;_default</code>; <code>docker network ls</code> shows it. If after the fix you see <i>password authentication failed</i>, check whether the <code>pg-data</code> volume was initialised earlier with a different password: the <code>POSTGRES_*</code> variables are ignored once the data directory exists. Change the password in the database (<code>ALTER USER</code>) or, in development only, recreate the volume.</p>`
        },
        {
          t: "The fixed Compose service definitions",
          lang: "yaml",
          code: `services:
  api:
    image: orders-api:1.4.2
    environment:
      DATABASE_URL: postgresql://app:secret@postgres:5432/app
    depends_on:
      postgres:
        condition: service_healthy
    ports: ["8000:8000"]
  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: app
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app -d app"]
      interval: 5s
      timeout: 3s
      retries: 10
      start_period: 10s
    volumes: [pg-data:/var/lib/postgresql/data]
volumes:
  pg-data: {}`,
          note: `<p>The <code>ports</code> entry for PostgreSQL is gone: the API does not need it. Publish it only on <code>127.0.0.1</code> if a developer needs a local client. The app should still retry DB connections, because the database can restart later too.</p>`
        },
        {
          t: "inspect with Go templates: the queries you will use most",
          lang: "sh",
          code: `docker inspect -f '{{.State.Status}} {{.State.ExitCode}} {{.State.StartedAt}} {{.RestartCount}}' api
docker inspect -f '{{range $net, $cfg := .NetworkSettings.Networks}}{{$net}}={{$cfg.IPAddress}} {{end}}' api
docker inspect -f '{{range .Mounts}}{{.Type}} {{.Source}} -> {{.Destination}}{{println}}{{end}}' api
docker inspect -f '{{json .Config.Env}}' api | jq .
docker inspect -f '{{index .Config.Labels "org.opencontainers.image.revision"}}' api
docker inspect -f '{{.HostConfig.Memory}} {{.HostConfig.RestartPolicy.Name}} {{.Config.User}}' api
docker inspect -f '{{json .State.Health}}' api | jq '.Status, .Log[-1]'`,
          out: `running 0 2026-11-16T09:12:44.913Z 0
myproj_default=172.21.0.3
volume /var/lib/docker/volumes/uploads/_data -> /app/uploads
[ "APP_ENV=production", "DATABASE_URL=postgresql://…", … ]
3f9e2c1
536870912 unless-stopped 10001:10001`,
          note: `<p><code>docker inspect</code> works on containers, images, networks, volumes, and more; use <code>--type</code> if names collide. <code>{{println}}</code> inserts a newline inside range loops.</p>`
        },
        {
          t: "stats, top, events, df, prune, cp and diff",
          lang: "sh",
          code: `docker stats --no-stream --format 'table {{.Name}}\\t{{.CPUPerc}}\\t{{.MemUsage}}\\t{{.PIDs}}'
docker top api -o pid,user,rss,cmd
docker events --since 30m --filter type=container --filter event=die --filter event=oom --filter event=health_status --until "$(date -u +%Y-%m-%dT%H:%M:%S)"
docker system df
docker system df -v | head -20
docker system prune            # stopped containers, unused networks, dangling images, build cache
docker cp api:/app/config/settings.py ./settings-from-container.py
docker diff api`,
          out: `NAME   CPU %   MEM USAGE / LIMIT    PIDS
api    1.12%   143.2MiB / 512MiB    9
TYPE            TOTAL     ACTIVE    SIZE      RECLAIMABLE
Images          23        6         7.41GB    5.02GB (67%)
Containers      9         6         1.2MB     0B (0%)
Local Volumes   5         3         2.13GB    120MB (5%)
Build Cache     88        0         3.9GB     3.9GB
C /tmp
A /tmp/uvicorn.lock
C /app/uploads`,
          note: `<p>Read <code>docker system prune</code>'s confirmation text before agreeing; add <code>-a</code> to remove all images not used by a container and <code>--volumes</code> only if you are sure which volumes are unused. Never run prune with <code>--volumes</code> on a database host you have not checked.</p>`
        },
        {
          t: "Debugging a distroless or shell-less container",
          lang: "sh",
          code: `docker exec api-distroless sh
# Docker Desktop: attach a toolbox shell without changing the image
docker debug api-distroless
# Anywhere: a sidecar sharing the target's network and PID namespaces
docker run -it --rm --network container:api-distroless --pid container:api-distroless \\
  --cap-add SYS_PTRACE nicolaka/netshoot
#   inside the sidecar:
#   ps aux                      -> the app is visible
#   ss -lntp                    -> its listening sockets
#   ls /proc/1/root/app         -> its filesystem
#   curl -s localhost:8000/healthz
# copy files out without any shell
docker cp api-distroless:/app/app/main.py ./main.py`,
          out: `OCI runtime exec failed: exec failed: unable to start container process: exec: "sh": executable file not found in $PATH: unknown`,
          note: `<p>The sidecar has its own filesystem (with all the tools) but shares the target's network stack and process table, so <code>localhost</code> means the target. Removing the sidecar leaves the target untouched.</p>`
        }
      ],
      internals: `<p><b>What each tool actually reads.</b></p>
<ul class="pts">
<li><code>docker ps</code>/<code>inspect</code>: dockerd's in-memory container store, persisted in <code>/var/lib/docker/containers/&lt;id&gt;/config.v2.json</code> (state, config, network settings) and <code>hostconfig.json</code> (run-time options).</li>
<li><code>docker logs</code>: the logging driver's storage, for <code>json-file</code> <code>/var/lib/docker/containers/&lt;id&gt;/&lt;id&gt;-json.log</code>. Removing the container deletes it.</li>
<li><code>docker exec</code>: dockerd asks containerd to start an additional process in the existing container; the shim calls <code>runc exec</code>, which joins the container's namespaces (<code>setns</code>) and cgroup and applies the same capabilities/seccomp/user, then <code>execve</code>s your command. It needs that binary inside the container's filesystem; that is why distroless fails.</li>
<li><code>docker top</code>: runs <code>ps</code> on the host restricted to the PIDs in the container's cgroup, so it works without <code>ps</code> in the image.</li>
<li><code>docker stats</code>: reads the cgroup's accounting files (<code>memory.current</code>, <code>memory.stat</code>, <code>cpu.stat</code>, <code>pids.current</code>, <code>io.stat</code> on cgroup v2) and network counters from the container's network namespace.</li>
<li><code>docker events</code>: a stream from dockerd's event bus (container lifecycle, image, network, volume, daemon events); dockerd keeps a limited in-memory backlog for <code>--since</code>.</li>
<li><code>docker diff</code>/<code>cp</code>: work on the container's writable layer (<code>UpperDir</code> for overlay2) and its mounted root filesystem; <code>cp</code> on a stopped container mounts the layers temporarily.</li>
<li><b>Embedded DNS</b>: on user-defined networks, the container's <code>/etc/resolv.conf</code> points at <code>127.0.0.11</code>; dockerd answers names of containers, services and aliases on that network (via iptables rules redirecting port 53 inside the namespace) and forwards other names to the host's resolvers. On the default bridge, <code>/etc/resolv.conf</code> is a copy of the host's and container names are not resolvable.</li>
<li><b>Port publishing</b>: dockerd adds DNAT rules in the <code>nat</code> table's <code>DOCKER</code> chain (host port → container IP:port) and, for some paths such as localhost, starts a <code>docker-proxy</code> userland process. Traffic arrives at the container's <code>eth0</code> address, which is why a listener on 127.0.0.1 never sees it.</li>
</ul>`,
      prod: `<p>A runbook for the React → FastAPI → Redis → PostgreSQL stack, derived from these scenarios:</p>
<ul class="pts">
<li><b>"Site is down":</b> <code>docker compose ps</code> (which service is not <i>healthy</i>?), <code>docker compose logs --since 15m &lt;svc&gt;</code>, <code>docker events --since 30m --filter event=die --filter event=oom</code>, <code>docker system df</code> and <code>df -h</code> (full disk from logs or images is common).</li>
<li><b>"502 from Nginx":</b> from the proxy container: <code>getent hosts api</code>, <code>wget -qO- http://api:8000/healthz</code>; check the API binds 0.0.0.0 and is on the proxy's network.</li>
<li><b>"API 500s, DB errors":</b> from the API container: resolve <code>postgres</code>, open a TCP connection, run <code>pg_isready</code> in the DB container, check credentials and connection limits (<code>max_connections</code> vs gunicorn workers × pool size).</li>
<li><b>"Random restarts":</b> <code>RestartCount</code>, exit code, <code>OOMKilled</code>, health log; compare memory usage to limits.</li>
<li><b>Distroless API:</b> the on-call engineer uses the netshoot sidecar pattern or <code>docker debug</code>; nobody adds a shell to the production image "just for debugging".</li>
<li><b>Prevention:</b> health checks on every service, <code>depends_on</code> with <code>service_healthy</code>, apps that retry connections, structured logs with request IDs, log rotation, disk alerts, and a weekly look at <code>docker system df</code> with a safe prune policy (images and build cache, not volumes).</li>
</ul>`,
      iq: [
        ["dca", "A container exits immediately after docker run -d. Which commands do you use first to find out why?", `<p><code>docker ps -a</code> to see the exit status, <code>docker logs &lt;container&gt;</code> for the process output, and <code>docker inspect &lt;container&gt;</code> (for example <code>-f '{{.State.ExitCode}} {{.State.Error}} {{.State.OOMKilled}}'</code>) for the exit code and runtime errors. <code>docker exec</code> is not possible because the container is not running; <code>docker stats</code> shows nothing for a stopped container.</p>`],
        ["dca", "Which command displays the IP address of a running container on each of its networks?", `<p><code>docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}} {{end}}' &lt;container&gt;</code>, or <code>docker network inspect &lt;network&gt;</code>, which lists attached containers and their addresses. <code>docker port</code> shows published ports, not IPs; <code>docker ps</code> does not show container IPs.</p>`],
        ["dca", "What does docker system prune remove by default? Which TWO are correct? (a) Stopped containers (b) Named volumes in use (c) Dangling images and build cache (d) All images not used by running containers", `<p><b>(a) and (c)</b>, plus unused networks. <code>-a</code> extends image removal to all images not used by any container (d), and <code>--volumes</code> adds unused volumes; volumes used by containers (b) are never removed.</p>`],
        ["mid", "Uvicorn runs fine in the container and docker ps shows 0.0.0.0:8000-&gt;8000/tcp, but curl localhost:8000 from the host fails. What is the most likely cause?", `<p>Uvicorn is listening on <code>127.0.0.1</code> inside the container (its default). Published traffic arrives on the container's <code>eth0</code> address, so nothing accepts it. Start uvicorn with <code>--host 0.0.0.0</code>. Verify with <code>ss -lntp</code> from a sidecar or <code>/proc/net/tcp</code>.</p>`],
        ["mid", "FastAPI with DATABASE_URL=...@localhost:5432 fails in Compose but postgres:5432 works. Explain.", `<p>Each container has its own network namespace, so <code>localhost</code> inside the API container is the API container itself, where nothing listens on 5432. Compose puts services on a user-defined network with embedded DNS, so the service name <code>postgres</code> resolves to the database container's IP. It worked on the laptop before containers because the DB was then really on localhost.</p>`],
        ["senior", "You changed POSTGRES_PASSWORD in compose.yaml and redeployed; now the API gets 'password authentication failed'. Why, and how do you fix it without losing data?", `<p>The postgres image applies <code>POSTGRES_*</code> only when initialising an empty data directory. The existing volume still has the old password. Fix inside the database: <code>docker compose exec postgres psql -U app -c "ALTER USER app PASSWORD '…'"</code> (using the old credentials or local trust), then update the app's secret. Deleting the volume would "fix" it by destroying the data.</p>`],
        ["senior", "How do you debug a distroless container that has no shell?", `<p>Read logs and <code>inspect</code>; copy files out with <code>docker cp</code>; use <code>docker debug</code> where available; or start a tools container sharing its namespaces: <code>docker run -it --rm --network container:app --pid container:app nicolaka/netshoot</code>, then use <code>ss</code>, <code>curl localhost</code>, <code>ps</code> and browse <code>/proc/1/root</code> for its filesystem. In non-production you can also run the image's <code>:debug</code> variant.</p>`],
        ["dca", "A container fails with 'exec format error'. What is the cause and how do you confirm it?", `<p>The image (or a binary in it) was built for a different CPU architecture than the host, for example linux/arm64 on an amd64 server. Confirm with <code>docker image inspect -f '{{.Os}}/{{.Architecture}}' &lt;image&gt;</code> and <code>uname -m</code> on the host. Rebuild with <code>--platform linux/amd64</code> or as a multi-platform image with <code>docker buildx build --platform linux/amd64,linux/arm64</code>.</p>`]
      ],
      gotchas: [
        `<code>docker run --rm</code> deletes the container and its logs when it exits; remove <code>--rm</code> while debugging start-up failures.`,
        `A bind mount over <code>/app</code> (common in dev Compose files) hides the code baked into the image; "file not found" may be the mount, not the image.`,
        `<code>depends_on</code> without <code>condition: service_healthy</code> only orders container start; the DB may not accept connections yet.`,
        `<code>POSTGRES_PASSWORD</code> and friends are only used on first initialisation of an empty volume.`,
        `On the default <code>bridge</code> network containers cannot resolve each other by name; <code>--link</code> is legacy. Use user-defined networks.`,
        `<code>docker exec</code> runs with the container's user and environment; use <code>-u 0</code> to become root for debugging (if the security policy allows), and remember changes are lost when the container is recreated.`,
        `<code>docker logs</code> shows nothing if the app logs to files instead of stdout/stderr, or if the logging driver does not support reading (on older engines).`,
        `<code>docker system prune --volumes -a</code> on a production host can delete database volumes of stopped stacks. Know what is unused before pruning.`,
        `Docker Desktop: <code>host.docker.internal</code> reaches the host from containers; on Linux it needs <code>--add-host host.docker.internal:host-gateway</code>.`
      ],
      best: [
        `Follow the same order every time: state → logs → config → test from inside → one change → verify.`,
        `Bind servers to <code>0.0.0.0</code> in containers; call dependencies by service name and container port.`,
        `Give every service a health check and make apps retry their dependencies with back-off.`,
        `Keep a tools image (netshoot, busybox) ready for sidecar debugging instead of adding tools to production images.`,
        `Learn a handful of <code>inspect --format</code> templates and <code>jq</code>; they answer most "what is the actual config?" questions.`,
        `Write down every incident's cause and the command that revealed it; turn them into a runbook.`
      ],
      lab: [
        `Break it on purpose: build an API image with the wrong <code>WORKDIR</code>; diagnose with <code>ps -a</code>, <code>logs</code> and <code>inspect</code> only, then fix.`,
        `Run uvicorn without <code>--host 0.0.0.0</code> and <code>-p 8000:8000</code>; prove the bind address is the problem with a netshoot sidecar (<code>ss -lntp</code>), then fix.`,
        `Use the broken Compose file above; find all three bugs from the API container (<code>getent hosts</code>, a TCP connection test, <code>pg_isready</code>), then fix them.`,
        `Change <code>POSTGRES_PASSWORD</code> after the first start, observe the auth error, and fix it with <code>ALTER USER</code> without deleting the volume.`,
        `Run <code>docker events</code> in one terminal while you stop, kill and OOM-kill containers in another; identify each event.`,
        `<b>Done when:</b> you can explain each failure from evidence (an exit code, a log line, an <code>ss</code> output, a DNS lookup) rather than from guessing, and the fixed stack shows all services <i>healthy</i>.`
      ],
      teach: `<p>"When a container misbehaves I don't guess. First state: <code>docker ps -a</code> and <code>docker inspect</code> for status, exit code, OOMKilled and health. Then output: <code>docker logs --tail</code> or <code>--since</code>. Then configuration: what command, env, mounts, networks and ports are actually in effect. Then I test from inside the container's network namespace with <code>exec</code> or a sidecar.</p>
<p>Three failures cover most cases. It exits immediately: the command finished, a file or binary is missing, it's the wrong architecture with exec format error, or it was OOM killed. It runs but I can't reach it: the app is bound to 127.0.0.1 inside the container, or the port mapping points at the wrong container port, or it's on the wrong network. It can't reach PostgreSQL: it's using localhost, which is itself, instead of the service name; or the host-published port instead of 5432; or the DB isn't ready, or the password changed after the volume was initialised.</p>
<p>For images without a shell I use <code>docker debug</code> or a netshoot sidecar sharing the network and PID namespaces."</p>`
    },
    {
      id: "d8-internals",
      title: "Internals end to end: CLI → Engine → containerd → runc → kernel",
      lv: ["mid", "senior", "architect", "dca"],
      eli5: `<p>Ordering a pizza: you (the <b>CLI</b>) phone the restaurant's front desk (<b>dockerd</b>), which handles orders, menus (images), delivery addresses (networks) and storage (volumes). The front desk passes the order to the kitchen manager (<b>containerd</b>), who tracks every pizza being made. For each pizza a dedicated waiter (<b>containerd-shim</b>) is assigned and stays with that pizza until it is eaten. The chef (<b>runc</b>) actually builds the pizza, puts it in its box, and then walks away to make the next one.</p>
<p>The box is made by the building itself, the <b>Linux kernel</b>: <b>namespaces</b> are the box's walls (what the pizza can see), <b>cgroups</b> are the portion limits (how much it can take). Inside the box is just an ordinary <b>process</b>.</p>
<p>Because the waiter, not the front desk, looks after each pizza, the front desk can close for a few minutes (dockerd restart with <i>live-restore</i>) and the pizzas are fine. Today you will open the boxes and look at the walls yourself.</p>`,
      what: `<p><b>The chain.</b> <code>docker run nginx</code> involves these components, each with one job:</p>
<ul class="pts">
<li><b>Docker CLI</b> (<code>docker</code>): a client that turns commands into REST calls on the Docker Engine API, over <code>/var/run/docker.sock</code> (or a context: SSH, TCP+TLS). It also reads <code>~/.docker/config.json</code> for credentials and contexts.</li>
<li><b>Docker Engine</b> (<code>dockerd</code>): the API server and the high-level logic: images (pull, build via BuildKit), networks (libnetwork, iptables/nftables, embedded DNS, <code>docker-proxy</code>), volumes, logging drivers, restart policies, Swarm. It turns a container request into an OCI runtime spec and asks containerd to run it.</li>
<li><b>containerd</b>: a CNCF container runtime daemon with a gRPC API at <code>/run/containerd/containerd.sock</code>. Manages container metadata, tasks (running processes), snapshots (filesystem layers) and, with the containerd image store, images. Docker uses the containerd namespace <code>moby</code>; Kubernetes uses <code>k8s.io</code>.</li>
<li><b>containerd-shim-runc-v2</b>: one shim per container (or group). It calls runc to create and start the container, then stays as the container process's parent: holds its stdio pipes, reaps it and reports the exit status. Because the shim is independent, dockerd and containerd can restart without killing containers.</li>
<li><b>runc</b>: the low-level OCI runtime. Reads the bundle (<code>config.json</code> + root filesystem), creates namespaces, configures cgroups, mounts, capabilities, seccomp, LSM labels, <code>pivot_root</code>s into the root filesystem and <code>execve</code>s the process. Then runc itself <b>exits</b>.</li>
<li><b>Linux kernel</b>: provides the actual isolation. <b>Namespaces</b>: <code>pid</code> (own PID 1), <code>net</code> (own interfaces, routes, iptables, ports), <code>mnt</code> (own mount table/root filesystem), <code>uts</code> (own hostname), <code>ipc</code> (own SysV IPC/shared memory), <code>user</code> (UID mapping, when enabled), <code>cgroup</code> (own view of the cgroup tree). <b>cgroups</b> (v2 on modern distros): <code>memory.max</code>, <code>cpu.max</code>, <code>cpu.weight</code>, <code>pids.max</code>, <code>io.max</code>.</li>
<li><b>Process</b>: what remains is your process, visible in host <code>ps</code> with a normal host PID.</li>
</ul>
<p><b>Storage.</b> Images are stacks of read-only layers; a container adds a thin writable layer. The <b>storage driver</b> combines them: <code>overlay2</code> (default on most Linux hosts) uses OverlayFS with <code>lowerdir</code> (image layers), <code>upperdir</code> (container changes), <code>workdir</code> and a <code>merged</code> view that becomes the container's root. Others: <code>fuse-overlayfs</code> (rootless on older kernels), <code>btrfs</code>, <code>zfs</code>, <code>vfs</code> (no copy-on-write, for testing); <code>aufs</code> and <code>devicemapper</code> are deprecated or removed in current engines. With the <b>containerd image store</b> (opt-in via <code>"features": {"containerd-snapshotter": true}</code> on older engines; newer engines and Docker Desktop default to it for fresh installs, check your version), images and layers are managed by containerd <b>snapshotters</b> under <code>/var/lib/containerd</code> instead of <code>/var/lib/docker/overlay2</code>; behaviour is the same, paths differ.</p>
<p><b>/var/lib/docker layout</b> (classic store; varies by version):</p>
<ul class="pts">
<li><code>containers/&lt;id&gt;/</code>: <code>config.v2.json</code>, <code>hostconfig.json</code>, <code>&lt;id&gt;-json.log</code>, <code>hostname</code>, <code>hosts</code>, <code>resolv.conf</code>, <code>mounts/</code> (shm).</li>
<li><code>image/overlay2/</code>: image metadata (<code>imagedb/content/sha256</code> configs, <code>layerdb</code> mapping layer chain IDs to cache IDs, <code>repositories.json</code> tags).</li>
<li><code>overlay2/</code>: layer directories (<code>&lt;cache-id&gt;/diff</code>, <code>link</code>, <code>lower</code>, <code>work</code>, <code>merged</code>) and <code>l/</code> with short symlinks to keep mount options short.</li>
<li><code>volumes/&lt;name&gt;/_data</code> and <code>metadata.db</code>; <code>network/files/local-kv.db</code>; <code>buildkit/</code>; <code>swarm/</code>; <code>plugins/</code>; <code>tmp/</code>.</li>
</ul>
<p><b>Logging drivers recap</b>: the shim holds stdout/stderr; dockerd reads them and passes lines to the driver (<code>json-file</code>, <code>local</code>, <code>journald</code>, <code>syslog</code>, <code>fluentd</code>, <code>awslogs</code>, <code>gelf</code>…), configured per container or in <code>daemon.json</code>.</p>
<p><b>live-restore</b>: with <code>"live-restore": true</code>, stopping dockerd does not stop containers; the shims keep them running and hold their stdio. When dockerd starts again it reconnects to containerd, rediscovers running tasks and resumes log copying and management. Without live-restore, dockerd stops all containers on shutdown (and restart policies bring some back on start). Not supported with Swarm mode. A long dockerd outage can still block apps whose log pipe buffers fill.</p>
<p><b>Other clients of containerd</b>: <code>ctr</code> (containerd's low-level debug CLI: <code>ctr -n moby containers ls</code>, <code>ctr -n moby tasks ls</code>), <code>nerdctl</code> (Docker-compatible CLI for containerd), and <code>crictl</code> (talks to the Kubernetes CRI endpoint; Docker's bundled containerd usually has the CRI plugin disabled, so <code>crictl</code> is for Kubernetes nodes). Kubernetes removed dockershim in 1.24 and talks to containerd (or CRI-O) directly, using the same runc underneath.</p>
<p><b>Docker Desktop</b> (macOS, Windows) runs dockerd, containerd and all containers inside a lightweight Linux VM (on Windows typically a WSL 2 distro). Everything in this topic happens inside that VM; your host's <code>ps</code> shows only the VM process. To look around, a commonly used trick is a privileged container that enters the VM's PID 1 namespaces: <code>docker run -it --rm --privileged --pid=host alpine nsenter -t 1 -m -u -n -i sh</code>; the exact VM layout and paths differ between Desktop versions. On Linux, everything is directly on the host.</p>`,
      why: `<p>Memorising "Docker uses namespaces and cgroups" is not the same as understanding it. When you can see the shim as the parent of your process, the namespace inodes in <code>/proc</code>, the memory limit as a number in a cgroup file and the overlay mount, many otherwise mysterious behaviours become obvious: why containers survive a daemon restart, why <code>docker top</code> works without <code>ps</code> in the image, why exit 137 happens, why <code>localhost</code> differs per container, why deleting a file does not shrink an image, why Kubernetes could drop Docker and still run the same images.</p>
<p>The split itself exists for good reasons: Docker extracted containerd and runc (2015-2016) so the low-level runtime could be standardised (OCI runtime and image specs), shared with Kubernetes and other platforms, and upgraded or restarted independently of the high-level engine.</p>`,
      diagram: {
        html: flow([["docker CLI", "REST over /var/run/docker.sock"], ["dockerd", "images, networks, volumes, logs, OCI spec"], ["containerd", "gRPC, namespace moby, tasks, snapshots"], ["containerd-shim-runc-v2", "parent of the process, holds stdio", "w"], ["runc", "creates the container, then exits", "w"], ["Linux kernel", "namespaces + cgroups + overlayfs", "g"], ["Your process", "ordinary host PID", "g"]], { v: true }),
        steps: [
          `<code>docker run</code> → the CLI sends <code>POST /containers/create</code> and <code>POST /containers/&lt;id&gt;/start</code> to dockerd (pulling the image first if needed).`,
          `dockerd prepares the root filesystem (overlay mount or containerd snapshot), the network namespace configuration and the OCI spec, then calls containerd's gRPC API to create and start a task.`,
          `containerd launches a <b>containerd-shim-runc-v2</b> process; the shim runs <code>runc create</code>/<code>start</code> with the bundle directory.`,
          `runc asks the kernel for new namespaces, creates the cgroup and writes the limits, sets up mounts, capabilities, seccomp, then <code>execve</code>s the process and exits. The shim remains its parent.`,
          `The process runs as a normal host process; dockerd connects the network (veth pair into the bridge, iptables rules), streams logs from the shim and records state.`
        ]
      },
      cmds: [
        {
          t: "See the process tree on a Linux host",
          lang: "sh",
          code: `docker run -d --name web -p 8080:80 nginx:1.27-alpine
ps -eo pid,ppid,user,cmd --forest | grep -E 'dockerd|containerd|nginx|docker-proxy' | grep -v grep
PID=$(docker inspect -f '{{.State.Pid}}' web)
echo "host PID of nginx master: $PID"
docker top web
docker exec web ps          # inside: nginx master is PID 1`,
          out: `    812       1 root     /usr/bin/containerd
    990       1 root     /usr/bin/dockerd -H fd:// --containerd=/run/containerd/containerd.sock
  45110     990 root      \\_ /usr/bin/docker-proxy -proto tcp -host-ip 0.0.0.0 -host-port 8080 -container-ip 172.17.0.2 -container-port 80
  45127       1 root     /usr/bin/containerd-shim-runc-v2 -namespace moby -id 3f2a9c… -address /run/containerd/containerd.sock
  45148   45127 root      \\_ nginx: master process nginx -g daemon off;
  45190   45148 101           \\_ nginx: worker process
host PID of nginx master: 45148
PID   USER     TIME  COMMAND
    1 root      0:00 nginx: master process nginx -g daemon off;
   30 nginx     0:00 nginx: worker process`,
          note: `<p>Notice: no <code>runc</code> process (it exited), the shim's parent is PID 1 (systemd), not dockerd or containerd, and the same nginx is PID 45148 on the host and PID 1 inside. Whether <code>docker-proxy</code> appears depends on version and the <code>userland-proxy</code> setting.</p>`
        },
        {
          t: "Namespaces: /proc/&lt;pid&gt;/ns, lsns and nsenter",
          lang: "sh",
          code: `sudo ls -l /proc/$PID/ns
sudo ls -l /proc/self/ns | grep -E ' (net|pid|mnt) '     # the host's, for comparison
sudo lsns -p $PID
# enter only the network namespace: host tools, container's network
sudo nsenter -t $PID -n ip -br addr
sudo nsenter -t $PID -n ss -lntp
# enter mount + uts + ipc + net + pid: the container's filesystem and tools
sudo nsenter -t $PID -m -u -i -n -p sh -c 'hostname; ls /etc/nginx; ps'`,
          out: `lrwxrwxrwx 1 root root 0 … cgroup -> 'cgroup:[4026532511]'
lrwxrwxrwx 1 root root 0 … ipc -> 'ipc:[4026532449]'
lrwxrwxrwx 1 root root 0 … mnt -> 'mnt:[4026532447]'
lrwxrwxrwx 1 root root 0 … net -> 'net:[4026532452]'
lrwxrwxrwx 1 root root 0 … pid -> 'pid:[4026532450]'
lrwxrwxrwx 1 root root 0 … user -> 'user:[4026531837]'
lrwxrwxrwx 1 root root 0 … uts -> 'uts:[4026532448]'
lrwxrwxrwx 1 root root 0 … net -> 'net:[4026531840]'
        NS TYPE   NPROCS   PID USER COMMAND
4026532447 mnt         2 45148 root nginx: master process nginx -g daemon off;
4026532448 uts         2 45148 root nginx: master process …
4026532449 ipc         2 45148 root …
4026532450 pid         2 45148 root …
4026532452 net         2 45148 root …
4026532511 cgroup      2 45148 root …
lo               UNKNOWN        127.0.0.1/8
eth0@if23        UP             172.17.0.2/16
LISTEN 0 511 0.0.0.0:80 0.0.0.0:* users:(("nginx",pid=45148,fd=6))
3f2a9c1d0b77
conf.d  fastcgi.conf  mime.types  nginx.conf  …`,
          note: `<p>The <code>user</code> namespace inode equals the host's (4026531837 is the initial user namespace) because user-namespace remapping is off by default. Two processes in the same container share inode numbers; that is what "being in the same namespace" means. <code>docker exec</code> does the equivalent of the last <code>nsenter</code> line (plus cgroup, user, capabilities and seccomp).</p>`
        },
        {
          t: "cgroups v2: find the container's cgroup and read its limits",
          lang: "sh",
          code: `docker run -d --name limited --memory 256m --cpus 0.5 --pids-limit 100 nginx:1.27-alpine
LPID=$(docker inspect -f '{{.State.Pid}}' limited)
ID=$(docker inspect -f '{{.Id}}' limited)
stat -fc %T /sys/fs/cgroup                  # cgroup2fs = cgroup v2
cat /proc/$LPID/cgroup
docker info --format '{{.CgroupDriver}} {{.CgroupVersion}}'
CG=/sys/fs/cgroup/system.slice/docker-$ID.scope     # systemd driver; cgroupfs driver: /sys/fs/cgroup/docker/$ID
cat $CG/memory.max $CG/cpu.max $CG/pids.max
cat $CG/memory.current $CG/pids.current
grep -E 'oom|oom_kill' $CG/memory.events
cat $CG/cgroup.procs`,
          out: `cgroup2fs
0::/system.slice/docker-8c41e2….scope
systemd 2
268435456
50000 100000
100
5394432
3
oom 0
oom_kill 0
46012
46059`,
          note: `<p><code>cpu.max</code> = 50 ms of CPU per 100 ms period = 0.5 CPU. Changing the limit with <code>docker update --memory 512m limited</code> rewrites <code>memory.max</code> live. On cgroup v1 hosts the files are <code>/sys/fs/cgroup/memory/docker/&lt;id&gt;/memory.limit_in_bytes</code>, <code>cpu/…/cpu.cfs_quota_us</code>, etc.</p>`
        },
        {
          t: "The overlay filesystem: GraphDriver, mount and the layers on disk",
          lang: "sh",
          code: `docker inspect -f '{{.GraphDriver.Name}}' web
docker inspect -f '{{json .GraphDriver.Data}}' web | jq .
mount | grep overlay | grep $(docker inspect -f '{{.Id}}' web | cut -c1-12) || mount | grep overlay | head -2
docker exec web sh -c 'echo hello > /tmp/new.txt'
UPPER=$(docker inspect -f '{{.GraphDriver.Data.UpperDir}}' web)
sudo ls -l $UPPER/tmp
docker diff web`,
          out: `overlay2
{
  "LowerDir": "/var/lib/docker/overlay2/9e1…-init/diff:/var/lib/docker/overlay2/b77…/diff:…",
  "MergedDir": "/var/lib/docker/overlay2/9e1…/merged",
  "UpperDir": "/var/lib/docker/overlay2/9e1…/diff",
  "WorkDir": "/var/lib/docker/overlay2/9e1…/work"
}
overlay on /var/lib/docker/overlay2/9e1…/merged type overlay (rw,relatime,lowerdir=/var/lib/docker/overlay2/l/QX7…:/var/lib/docker/overlay2/l/K2P…,upperdir=/var/lib/docker/overlay2/9e1…/diff,workdir=/var/lib/docker/overlay2/9e1…/work)
-rw-r--r-- 1 root root 6 Nov 16 10:31 new.txt
C /tmp
A /tmp/new.txt`,
          note: `<p>The <code>-init</code> layer holds files Docker generates per container (<code>/etc/hosts</code>, <code>/etc/resolv.conf</code> placeholders). With the containerd image store, <code>GraphDriver</code> output differs and the snapshots live under <code>/var/lib/containerd/io.containerd.snapshotter.v1.overlayfs/</code>; the mount line still shows <code>type overlay</code>.</p>`
        },
        {
          t: "Look at /var/lib/docker and containerd's view",
          lang: "sh",
          code: `sudo ls /var/lib/docker
sudo ls /var/lib/docker/containers/$(docker inspect -f '{{.Id}}' web)
docker info --format '{{.DockerRootDir}} {{.Driver}} {{.LoggingDriver}}'
sudo ctr -n moby containers ls
sudo ctr -n moby tasks ls
sudo ctr namespaces ls
sudo ls /run/containerd/io.containerd.runtime.v2.task/moby/
sudo runc --root /run/docker/runtime-runc/moby list`,
          out: `buildkit  containers  engine-id  image  network  overlay2  plugins  runtimes  swarm  tmp  volumes
3f2a9c…-json.log  checkpoints  config.v2.json  hostconfig.json  hostname  hosts  mounts  resolv.conf  resolv.conf.hash
/var/lib/docker overlay2 json-file
CONTAINER       IMAGE    RUNTIME
3f2a9c1d0b77…   -        io.containerd.runc.v2
TASK            PID      STATUS
3f2a9c1d0b77…   45148    RUNNING
NAME   LABELS
moby
3f2a9c1d0b77…
ID              PID      STATUS    BUNDLE                                                            CREATED  OWNER
3f2a9c1d0b77…   45148    running   /run/containerd/io.containerd.runtime.v2.task/moby/3f2a9c…   …        root`,
          note: `<p>The <code>IMAGE</code> column is empty in <code>ctr</code> with the classic store because dockerd manages images itself; with the containerd image store you also see images in <code>ctr -n moby images ls</code>. The bundle directory contains the OCI <code>config.json</code> runc used. The runc state directory shown is typical for Docker; paths can differ by version. Use <code>ctr</code> only for looking: changing Docker-managed containers through it confuses dockerd.</p>`
        },
        {
          t: "Prove that containers survive a daemon restart (live-restore)",
          lang: "sh",
          code: `docker info --format '{{.LiveRestoreEnabled}}'
# enable: add "live-restore": true to /etc/docker/daemon.json, then
sudo systemctl reload docker
docker run -d --name survivor nginx:1.27-alpine
SPID=$(docker inspect -f '{{.State.Pid}}' survivor)
sudo systemctl stop docker docker.socket
ps -o pid,ppid,cmd -p $SPID                          # still running; parent is the shim
sudo systemctl start docker
docker ps --filter name=survivor --format '{{.Names}} {{.Status}}'`,
          out: `true
    PID    PPID CMD
  47011   46990 nginx: master process nginx -g daemon off;
survivor Up 2 minutes`,
          note: `<p>Without live-restore, stopping dockerd stops the containers. Port publishing via <code>docker-proxy</code> and DNS are served by dockerd, so some networking features pause while it is down even though processes keep running.</p>`
        },
        {
          t: "Docker Desktop: get a shell inside the VM (hedged)",
          lang: "sh",
          code: `docker run -it --rm --privileged --pid=host alpine nsenter -t 1 -m -u -n -i sh
#   inside the VM:
#   ps | grep -E 'dockerd|containerd'
#   ls /var/lib/docker 2>/dev/null || ls /var/lib/containerd
#   cat /sys/fs/cgroup/cgroup.controllers
#   exit`,
          note: `<p>This enters the namespaces of PID 1 of the Linux VM that Docker Desktop runs. It is a well-known community technique, not an official interface; the VM's contents and paths change between Desktop versions (and with WSL 2 the engine runs in a separate <code>docker-desktop</code> distro). Never modify things in there; use it to observe.</p>`
        }
      ],
      internals: `<p><b>A full <code>docker run -d -p 8080:80 nginx</code>, step by step:</b></p>
<ul class="pts">
<li><b>CLI</b>: parses flags, builds a <code>ContainerCreate</code> body (Config + HostConfig + NetworkingConfig), calls <code>POST /vX/containers/create</code>. If the daemon replies "No such image", the CLI calls <code>POST /images/create</code> (pull) and retries, then <code>POST /containers/&lt;id&gt;/start</code>.</li>
<li><b>dockerd create</b>: allocates an ID and name, stores <code>config.v2.json</code>/<code>hostconfig.json</code>, creates the writable layer (overlay2: a new <code>&lt;id&gt;-init</code> and <code>&lt;id&gt;</code> directory on top of the image layers).</li>
<li><b>dockerd start</b>: mounts the overlay (<code>merged</code>), generates <code>/etc/hosts</code>, <code>/etc/resolv.conf</code>, <code>/etc/hostname</code>, prepares the network sandbox via libnetwork (a network namespace, a veth pair with one end in the <code>docker0</code> or user bridge, an IP from IPAM, iptables DNAT for 8080 → 172.17.0.2:80 and possibly a <code>docker-proxy</code>), builds the OCI spec (process args/env/user, mounts, namespaces, cgroup path and resources, capabilities, seccomp, AppArmor) and calls containerd <code>Containers.Create</code> + <code>Tasks.Create</code> + <code>Tasks.Start</code>.</li>
<li><b>containerd</b>: writes the bundle in <code>/run/containerd/io.containerd.runtime.v2.task/moby/&lt;id&gt;/</code> (<code>config.json</code>, <code>rootfs</code>), starts <code>containerd-shim-runc-v2</code> (which double-forks so its parent becomes PID 1) and talks to it over a ttrpc socket.</li>
<li><b>shim → runc create</b>: runc forks <code>runc init</code>, which calls <code>clone</code>/<code>unshare</code> for the namespaces (the network namespace is the one dockerd prepared, passed by path), places itself in the cgroup (writing limits to <code>memory.max</code>, <code>cpu.max</code>, <code>pids.max</code>), sets up mounts (<code>/proc</code>, <code>/dev</code>, <code>/sys</code>, bind mounts, masked paths) and <code>pivot_root</code>s into <code>merged</code>, sets hostname, then waits on a FIFO. <b>runc start</b> signals the FIFO: <code>runc init</code> applies capabilities, <code>no_new_privs</code>, AppArmor label, seccomp filter and <code>execve</code>s nginx, which keeps the PID. runc exits.</li>
<li><b>Running</b>: the kernel schedules nginx like any process, but its view of PIDs, network, mounts and hostname is namespaced and its resource use is charged to the cgroup. The shim holds stdio; dockerd's log copier reads it into the logging driver.</li>
<li><b>Exit</b>: the process exits (or is killed); the kernel notifies the shim (its parent) via <code>SIGCHLD</code>; the shim reaps it, publishes a <code>TaskExit</code> event to containerd → dockerd, which records the exit code, OOM flag, tears down networking, and applies the restart policy.</li>
</ul>
<p><b>Why it is built this way.</b> Daemonless containers (the shim model) mean dockerd and containerd can be upgraded without stopping workloads. The OCI specs mean images built by Docker run under containerd, CRI-O, Podman or Kubernetes, and runc can be replaced by other runtimes (<code>crun</code>, gVisor's <code>runsc</code>, Kata) via <code>--runtime</code>, without changing images.</p>`,
      prod: `<p>How internals knowledge pays off in the React → FastAPI → Redis → PostgreSQL production setup:</p>
<ul class="pts">
<li><b>Engine upgrades</b>: with <code>live-restore</code> on single-host Compose deployments, upgrading Docker Engine does not restart PostgreSQL or Redis; you verify with the shim PIDs before and after.</li>
<li><b>Capacity and noisy neighbours</b>: when the API is slow, you read <code>cpu.stat</code> (<code>nr_throttled</code>) in its cgroup to prove CPU throttling, or <code>memory.events</code> to see near-OOM pressure, instead of guessing from <code>docker stats</code>.</li>
<li><b>Network debugging</b>: <code>nsenter -t &lt;pid&gt; -n tcpdump -i eth0 port 5432</code> with the host's tcpdump captures API ↔ PostgreSQL traffic without installing anything in the image.</li>
<li><b>Disk incidents</b>: knowing where <code>/var/lib/docker/overlay2</code>, <code>containers/*-json.log</code>, <code>volumes/</code> and <code>buildkit/</code> live (or <code>/var/lib/containerd</code> with the containerd store) tells you what is safe to clean (build cache, unused images) and what is not (volumes holding PostgreSQL data).</li>
<li><b>Kubernetes migration</b>: the same images run unchanged on containerd-based Kubernetes nodes; on those nodes you use <code>crictl ps</code>/<code>crictl logs</code> instead of <code>docker</code>, and the same <code>/proc</code> and cgroup evidence applies.</li>
</ul>`,
      iq: [
        ["dca", "Which component is the parent process of a running container's main process on a Docker host, and why does that matter?", `<p><code>containerd-shim-runc-v2</code> (the shim). Not runc, which exits after creating the container, and not dockerd or containerd. Because the shim holds the process's stdio and reaps it, dockerd and containerd can be restarted (with live-restore for dockerd) without killing containers.</p>`],
        ["dca", "Which TWO kernel features provide container isolation and resource limits respectively? (a) namespaces (b) SELinux (c) cgroups (d) overlayfs", `<p><b>(a) and (c).</b> Namespaces isolate what a process sees (PID, network, mounts, hostname, IPC, users); cgroups limit and account resources (memory, CPU, PIDs, I/O). SELinux is a mandatory access control layer and overlayfs is a union filesystem used by the storage driver; both matter but are not the isolation/limit mechanisms the question asks for.</p>`],
        ["dca", "What is the default storage driver on current Linux distributions, and which file or command shows it?", `<p><code>overlay2</code> (where the kernel and backing filesystem support it). <code>docker info</code> shows <i>Storage Driver</i> (and whether the containerd image store is in use); it can be set with <code>"storage-driver"</code> in <code>daemon.json</code>. Changing it makes existing images and containers invisible until you switch back.</p>`],
        ["mid", "How can you see the namespaces of a container from the host?", `<p>Get the host PID with <code>docker inspect -f '{{.State.Pid}}' &lt;c&gt;</code>, then <code>ls -l /proc/&lt;pid&gt;/ns</code> (inode numbers per namespace type) or <code>lsns -p &lt;pid&gt;</code>. Compare with <code>/proc/1/ns</code> to see which namespaces differ from the host. <code>nsenter -t &lt;pid&gt; -n …</code> runs a host command inside one of them.</p>`],
        ["mid", "Where would you find a container's memory limit on a cgroup v2 host?", `<p>In the container's cgroup directory, for the systemd cgroup driver typically <code>/sys/fs/cgroup/system.slice/docker-&lt;full-id&gt;.scope/memory.max</code> (path from <code>/proc/&lt;pid&gt;/cgroup</code>). <code>max</code> means unlimited. <code>memory.current</code> is the usage and <code>memory.events</code> counts OOM kills.</p>`],
        ["senior", "Explain what live-restore does and what it does not cover.", `<p>With <code>"live-restore": true</code>, stopping or upgrading dockerd leaves containers running (their shims keep them alive) and dockerd reattaches on start. It does not cover host reboots, containerd/shim crashes, major-version upgrades that change internal formats, or Swarm mode (unsupported). While dockerd is down, API calls, DNS and userland-proxy port forwarding are unavailable and stdout pipes may fill.</p>`],
        ["senior", "Why does Kubernetes not need Docker to run Docker-built images?", `<p>Images follow the OCI image spec and runtimes follow the OCI runtime spec. Kubernetes talks to a CRI runtime (containerd or CRI-O), which pulls OCI images and uses runc (or another OCI runtime) to create the same namespaces and cgroups. Docker was one client of containerd; Kubernetes removed its dockershim adapter in 1.24 and uses containerd directly.</p>`],
        ["architect", "When might you replace runc with another OCI runtime?", `<p>For stronger isolation of untrusted workloads (gVisor <code>runsc</code> implements syscalls in user space; Kata runs each container in a micro-VM), or for performance/footprint (<code>crun</code>, written in C, starts faster with less memory). Configure via <code>"runtimes"</code> in <code>daemon.json</code> and <code>docker run --runtime</code>, or RuntimeClass in Kubernetes. Images do not change.</p>`]
      ],
      gotchas: [
        `runc is not running while your container runs; looking for it in <code>ps</code> is a common interview trap.`,
        `<code>nsenter -n</code> alone uses the <b>host's</b> binaries and filesystem with the container's network; add <code>-m</code> to see the container's filesystem.`,
        `cgroup paths depend on the cgroup driver (systemd vs cgroupfs) and version (v1 vs v2); always start from <code>/proc/&lt;pid&gt;/cgroup</code>.`,
        `On Docker Desktop, <code>/var/lib/docker</code> and container PIDs are inside the VM; on macOS or Windows host <code>ps</code> shows none of this.`,
        `With the containerd image store enabled, images, layers and snapshot paths move to <code>/var/lib/containerd</code>; scripts that read <code>/var/lib/docker/overlay2</code> break.`,
        `Editing files under <code>/var/lib/docker</code> or using <code>ctr</code> to modify Docker's containers can corrupt dockerd's state; observe only.`,
        `<code>docker inspect</code>'s <code>.State.Pid</code> is 0 for stopped containers.`,
        `Changing <code>storage-driver</code> or <code>data-root</code> hides existing images, containers and volumes rather than migrating them.`
      ],
      best: [
        `Explain Docker as a chain of small components and be able to point to each one in <code>ps</code> on a Linux host.`,
        `Use <code>/proc/&lt;pid&gt;/ns</code>, <code>lsns</code>, <code>nsenter</code> and cgroup files to get facts when <code>docker</code> commands are not enough.`,
        `Enable <code>live-restore</code> on standalone production hosts (not Swarm) so engine upgrades do not restart workloads.`,
        `Keep <code>data-root</code> on a dedicated, monitored disk; know which subdirectories are caches and which hold data.`,
        `Do the internals labs on a real Linux VM, not only on Docker Desktop.`
      ],
      lab: [
        `On a Linux VM, run <code>nginx:1.27-alpine</code> and find its process tree with <code>ps --forest</code>: identify containerd, dockerd, the shim and nginx; confirm there is no runc process.`,
        `List <code>/proc/&lt;pid&gt;/ns</code> for nginx and for <code>/proc/1</code>; mark which namespaces differ. Use <code>nsenter -t &lt;pid&gt; -n ip addr</code> and compare with <code>docker exec web ip addr</code>.`,
        `Start a container with <code>--memory 256m --cpus 0.5 --pids-limit 100</code>; find its cgroup and read <code>memory.max</code>, <code>cpu.max</code>, <code>pids.max</code>; run <code>docker update --memory 512m</code> and read again.`,
        `Write a file inside a container and find it in <code>UpperDir</code> from <code>docker inspect</code>; match it with <code>docker diff</code>.`,
        `Enable <code>live-restore</code>, stop dockerd, show the container process still running with its shim parent, start dockerd again.`,
        `<b>Done when:</b> you can draw CLI → dockerd → containerd → shim → runc → kernel and back up every arrow with a command output you produced yourself.`
      ],
      teach: `<p>"<code>docker run</code> is a chain. The CLI calls the Engine API over the Docker socket. dockerd handles the high-level work: images, networks, volumes, logs, and it builds an OCI runtime spec. It hands that to containerd over gRPC. containerd starts a small shim per container, and the shim calls runc. runc asks the kernel for namespaces, so the process gets its own PID 1, network stack, mounts and hostname, creates a cgroup and writes the limits like <code>memory.max</code> and <code>cpu.max</code>, applies capabilities and seccomp, pivots into the overlay filesystem and execs the process. Then runc exits; the shim stays as the parent.</p>
<p>You can prove all of it on a Linux host: <code>ps --forest</code> shows the shim parenting nginx and no runc; <code>/proc/&lt;pid&gt;/ns</code> shows different namespace inodes from the host; the cgroup directory contains the exact limit; <code>mount</code> shows the overlay with lower, upper and work dirs under <code>/var/lib/docker</code>. Because the shim owns the process, dockerd can restart with live-restore and containers keep running. On Docker Desktop all of this lives inside a Linux VM."</p>`
    }
  ],
  quiz: [
    {
      q: `A developer on an M-series Mac builds and pushes the API image; on the amd64 production server the container exits immediately. The log shows one line. What happened and what is the fix?`,
      code: `$ docker logs api
exec /usr/local/bin/uvicorn: exec format error`,
      lang: "sh",
      ans: `The image was built for linux/arm64 and the server is linux/amd64. Build for the server's platform or as a multi-platform image.`,
      why: `<i>exec format error</i> is the kernel refusing to execute a binary for another architecture. Check with <code>docker image inspect -f '{{.Architecture}}'</code>. Fix in CI with <code>docker buildx build --platform linux/amd64,linux/arm64 --push</code>, so each host pulls the right variant. Reinstalling uvicorn or changing the CMD would not help.`
    },
    {
      q: `Nginx in front of FastAPI returns 502. <code>docker compose ps</code> shows both containers <i>Up</i>. From the nginx container, <code>wget -qO- http://api:8000/healthz</code> returns <i>Connection refused</i>, and DNS resolves <code>api</code> correctly. What do you check next, and what is the most likely cause?`,
      ans: `Check what the API process is listening on from inside its network namespace; most likely uvicorn is bound to 127.0.0.1 (its default).`,
      why: `DNS works and the address is reachable (refused, not timed out), so the network is fine but nothing listens on the container's eth0 address at port 8000. <code>docker run --rm --network container:&lt;api&gt; nicolaka/netshoot ss -lntp</code> shows <code>127.0.0.1:8000</code>. Start uvicorn with <code>--host 0.0.0.0</code>. Also verify the port number matches what nginx proxies to.`
    },
    {
      q: `The API container logs <i>connection to server at "127.0.0.1", port 5432 failed: Connection refused</i>. PostgreSQL runs in the same Compose project and <code>psql -h localhost -p 5432</code> works from the host. Why does the host work but not the API?`,
      ans: `On the host, localhost:5432 is the published port; inside the API container, localhost is the API container itself. Use <code>postgres:5432</code>.`,
      why: `Each container has its own network namespace and loopback. The host reaches PostgreSQL through the published port mapping. Containers on the same Compose network reach it by service name via embedded DNS at its container port. Don't "fix" it with <code>network_mode: host</code>; that removes isolation and breaks portability.`
    },
    {
      q: `During an incident someone suggests running the command below on the production database host "to free space quickly". What do you say?`,
      code: `docker system prune -a --volumes -f`,
      lang: "sh",
      ans: `Stop: this can delete volumes of stopped stacks (possibly database data) and every unused image. Check <code>docker system df -v</code> first and prune selectively.`,
      why: `<code>-a</code> removes all images not used by a container (slower redeploys, rollback images gone) and <code>--volumes</code> removes unused volumes; if the PostgreSQL stack is stopped at that moment, its volume counts as unused (on older engines even named volumes; on newer ones anonymous volumes, still risky). Usually the space is in logs (unrotated json-file), build cache (<code>docker builder prune</code>) or old images (<code>docker image prune -a --filter until=…</code>).`
    },
    {
      q: `After <code>sudo systemctl restart docker</code> on a standalone host, all containers restarted and PostgreSQL ran crash recovery. The team expected them to keep running. Which setting was missing and why does it work?`,
      code: `$ docker info --format '{{.LiveRestoreEnabled}}'
false`,
      lang: "sh",
      ans: `<code>"live-restore": true</code> in <code>daemon.json</code>. Containers are parented by containerd shims, so they can outlive dockerd if the daemon does not stop them on shutdown.`,
      why: `By default dockerd stops containers when it shuts down. With live-restore it leaves them to their shims and reattaches when it comes back. Enable it, reload the daemon (it is a reloadable option), and test. Note it is not supported in Swarm mode and does not survive host reboots.`
    },
    {
      q: `In an interview: "Where is runc while my container is running?"`,
      ans: `It is not running. runc creates the container and exits; the containerd-shim is the long-lived parent of the container process.`,
      why: `runc is a short-lived CLI that sets up namespaces, cgroups, mounts and security settings, then execs the process. The shim keeps stdio, reaps the process and reports its exit to containerd and dockerd. <code>ps --forest</code> on a Linux host shows <code>containerd-shim-runc-v2</code> → your process, with no runc in between.`
    }
  ]
},
/* ===== Day 9 ===== */
{
  n: 9,
  title: "Orchestration",
  goal: "<b>By the end of today</b> you can build a multi-node Swarm, reason about Raft quorum and recovery, deploy and roll out a React → FastAPI → Redis → PostgreSQL stack with secrets, constraints and zero-downtime updates, and explain how the same ideas map onto Kubernetes objects and <code>kubectl</code>.",
  rev: [
    "Orchestration = <b>desired state + reconciliation</b>: you declare <i>what</i> (3 replicas of <code>api:1.4</code>), the managers continuously compare actual vs desired and create/kill tasks to converge.",
    "Swarm ports: <b>2377/tcp</b> cluster management (managers), <b>7946/tcp+udp</b> node gossip, <b>4789/udp</b> VXLAN overlay data (plus IP protocol 50/ESP for <code>--opt encrypted</code>). Quorum = floor(N/2)+1: 3 managers tolerate 1 loss, 5 tolerate 2, 7 tolerate 3; even numbers add no tolerance.",
    "Service → tasks → containers. Replicated = N tasks spread by the scheduler; global = one task per eligible node. Update knobs: <code>--update-parallelism</code>, <code>--update-delay</code>, <code>--update-failure-action</code>, <code>--update-order start-first</code>; undo with <code>docker service rollback</code>.",
    "Secrets live encrypted in the Raft log, travel over mutual TLS, appear in-container at <code>/run/secrets/&lt;name&gt;</code> (tmpfs on Linux), and are immutable: rotate by adding a new secret and swapping it with <code>--secret-rm</code>/<code>--secret-add</code>.",
    "Kubernetes mapping: service → Deployment (+ReplicaSet), task → Pod, routing mesh/VIP → Service (ClusterIP/NodePort/LoadBalancer), stack file → manifests, Swarm secret/config → Secret/ConfigMap. Images built with Docker run unchanged on containerd via CRI."
  ],
  topics: [
    {
      id: "d9-swarm",
      title: "Docker Swarm: services, stacks, Raft, routing mesh and rolling updates",
      lv: ["mid", "senior", "lead", "dca"],
      eli5: `<p>Until today you have been a chef cooking in one kitchen. <code>docker run</code> and <code>docker compose up</code> are you personally standing at the stove: if you go home, nobody re-lights a burner that went out. Swarm is a <b>restaurant group with head office</b>. You stop cooking; instead you hand head office an order sheet: "always have three pizza stations open and one salad station in every branch". Head office (the managers) keeps checking every branch and, if a station closes, opens a replacement somewhere else.</p>
<p>Head office is not one person: it is a <b>committee of managers</b> that must agree before any change to the order sheet is written down. A committee of three can still decide if one member is ill, because two out of three is a majority. If two are ill, the remaining one cannot outvote anyone, so no new decisions are made; the kitchens keep cooking what they were already cooking, but nobody can change the menu. That is Raft quorum.</p>
<p>The branches (worker nodes) just cook what they are told. Customers can walk into <i>any</i> branch and ask for pizza; if that branch has no pizza station, the waiter quietly forwards the order to one that does. That is the <b>routing mesh</b>. And the secret recipe? It is handed only to the stations that need it, in a sealed envelope, and never written on the public menu board: Swarm <b>secrets</b>.</p>`,
      what: `<p><b>Swarm mode</b> is the orchestrator built into Docker Engine (the SwarmKit project compiled into <code>dockerd</code>). Running <code>docker swarm init</code> turns an engine into a cluster <b>manager</b>; other engines join as managers or <b>workers</b>. You no longer create containers directly: you create <b>services</b>, which are declarations of desired state, and Swarm turns them into <b>tasks</b>, each of which runs exactly one <b>container</b>.</p>
<h4>Desired state and reconciliation</h4>
<ul class="pts">
<li><b>Declarative:</b> <code>docker service create --replicas 3 api:1.4</code> records "3 running tasks of api:1.4" in the cluster store. It does not mean "run three containers now and forget".</li>
<li><b>Reconciliation loop:</b> manager components (orchestrator, allocator, scheduler, dispatcher) continuously compare desired vs observed state. A container exits, a node dies, a node is drained: the orchestrator notices the gap and creates replacement tasks; the scheduler places them.</li>
<li>Tasks are <b>never restarted in place</b>. A failed task stays in history as <code>Failed</code>/<code>Shutdown</code> and a <i>new</i> task (new container ID, maybe on another node) replaces it. <code>docker service ps</code> shows that history.</li>
</ul>
<h4>Nodes: managers and workers</h4>
<ul class="pts">
<li><b>Managers</b> hold the Raft-replicated cluster state (services, tasks, networks, secrets, configs, nodes), schedule tasks, and serve the Swarm API. One manager is the Raft <b>leader</b>; others forward writes to it. Managers also run tasks by default.</li>
<li><b>Workers</b> only run tasks and report status. They have no cluster state and cannot run <code>docker service</code> / <code>docker node</code> commands (you get "This node is not a swarm manager").</li>
<li><code>docker node promote &lt;node&gt;</code> makes a worker a manager; <code>docker node demote &lt;node&gt;</code> the reverse. Always demote a manager <i>before</i> removing it, otherwise the cluster still counts it towards quorum.</li>
<li>To keep managers dedicated to management, drain them: <code>docker node update --availability drain mgr1</code>.</li>
</ul>
<h4>Init, join, tokens, ports</h4>
<ul class="pts">
<li><code>docker swarm init --advertise-addr 10.0.0.11</code>: creates the cluster, a root CA, the first manager certificate, two join tokens (manager and worker) and the <code>ingress</code> overlay network. <code>--advertise-addr</code> is the address other nodes use to reach this one; required when the host has several interfaces. <code>--listen-addr</code> (default <code>0.0.0.0:2377</code>) and <code>--data-path-addr</code> (separate NIC for VXLAN traffic) exist too.</li>
<li>Join token format: <code>SWMTKN-1-&lt;root CA digest&gt;-&lt;secret&gt;</code>. The digest lets a joining node verify it is talking to the right manager (no MITM); the secret decides whether it joins as manager or worker. Print with <code>docker swarm join-token worker</code> / <code>manager</code>; rotate with <code>--rotate</code> (existing nodes are unaffected).</li>
<li>Ports that must be open between nodes: <b>2377/tcp</b> (cluster management, to managers), <b>7946/tcp and udp</b> (node-to-node gossip / network discovery), <b>4789/udp</b> (VXLAN overlay data plane), and <b>IP protocol 50 (ESP)</b> if you use encrypted overlays.</li>
</ul>
<h4>Raft consensus and quorum math</h4>
<table><tr><th>Managers</th><th>Quorum (majority)</th><th>Failures tolerated</th></tr>
<tr><td>1</td><td>1</td><td>0</td></tr><tr><td>2</td><td>2</td><td>0 (worse than 1: two things to fail)</td></tr>
<tr><td>3</td><td>2</td><td>1</td></tr><tr><td>4</td><td>3</td><td>1</td></tr>
<tr><td>5</td><td>3</td><td>2</td></tr><tr><td>6</td><td>4</td><td>2</td></tr><tr><td>7</td><td>4</td><td>3</td></tr></table>
<ul class="pts">
<li>Quorum = <b>floor(N/2) + 1</b>. Tolerated failures = <b>floor((N-1)/2)</b>. Even counts add a node to fail without adding tolerance, so use 3, 5 or 7. Docker's guidance is not to exceed 7: every write must be acknowledged by a majority, so more managers means slower writes.</li>
<li>Spread managers across failure domains (3 AZs for 3 or 5 managers). Two managers in AZ-a and one in AZ-b: losing AZ-a loses quorum.</li>
<li><b>Quorum lost:</b> running tasks keep running (workers don't need managers to keep containers alive) and the routing mesh keeps forwarding, but the control plane is read-only at best: you cannot create/update/scale services, join nodes, or rotate secrets, and failed tasks are <b>not</b> rescheduled.</li>
<li><b>Recovery:</b> best is to bring the missing managers back. If they are gone for good, on one surviving manager run <code>docker swarm init --force-new-cluster --advertise-addr &lt;ip&gt;</code>. It keeps the state (services, secrets, workers) but rewrites membership to a single-manager cluster; then promote new managers back to 3 or 5.</li>
</ul>
<h4>Autolock and backup</h4>
<ul class="pts">
<li>The Raft log is encrypted at rest, and the TLS key and Raft encryption key live on each manager's disk. <b>Autolock</b> (<code>docker swarm init --autolock</code> or <code>docker swarm update --autolock=true</code>) encrypts those keys with an <b>unlock key</b>; after a manager restarts, it stays locked until someone runs <code>docker swarm unlock</code> and pastes the key. View it with <code>docker swarm unlock-key</code>, rotate with <code>docker swarm unlock-key --rotate</code>.</li>
<li><b>Backup:</b> state is in <code>/var/lib/docker/swarm</code> on each manager. Stop Docker on a (non-leader) manager, copy the directory, start Docker. Restore on a node with the same Engine version: stop Docker, replace <code>/var/lib/docker/swarm</code>, start, then <code>docker swarm init --force-new-cluster</code>. With autolock on you also need the unlock key that was active when the backup was taken.</li>
</ul>
<h4>Services, modes and lifecycle commands</h4>
<ul class="pts">
<li><b>Replicated</b> (default): <code>--replicas N</code>, scheduler spreads tasks across nodes. <b>Global</b>: <code>--mode global</code>, exactly one task on every eligible node, including nodes that join later (agents, log shippers, node exporters). You cannot <code>scale</code> a global service. Newer engines also have <code>replicated-job</code> and <code>global-job</code> modes for run-to-completion work.</li>
<li><code>docker service create/ls/ps/inspect/logs/scale/update/rollback/rm</code>. <code>docker service logs</code> aggregates logs of all tasks; it relies on the logging driver being readable by the engine (json-file/local/journald, or dual logging).</li>
</ul>
<h4>Rolling updates and rollback</h4>
<ul class="pts">
<li><code>--update-parallelism</code> (default 1; 0 = all at once), <code>--update-delay</code> (pause between batches, default 0s), <code>--update-monitor</code> (how long after each task update to watch for failure, default 5s), <code>--update-max-failure-ratio</code>, <code>--update-failure-action pause|continue|rollback</code> (default <b>pause</b>), <code>--update-order stop-first|start-first</code> (default <b>stop-first</b>).</li>
<li><code>start-first</code> starts the new task before stopping the old one: brief overlap, no capacity dip; needs spare resources and must not be used for something that cannot run twice (a single PostgreSQL on a volume).</li>
<li>Rollback has its own mirror settings: <code>--rollback-parallelism</code>, <code>--rollback-delay</code>, <code>--rollback-monitor</code>, <code>--rollback-failure-action</code>, <code>--rollback-order</code>. Swarm keeps the <b>previous spec</b> (<code>PreviousSpec</code> in inspect); <code>docker service rollback api</code> (or <code>docker service update --rollback api</code>) reverts to it. There is only one level of previous spec.</li>
</ul>
<h4>Placement and node availability</h4>
<ul class="pts">
<li><b>Constraints</b> are hard filters: <code>--constraint node.role==manager</code>, <code>node.hostname!=db2</code>, <code>node.labels.disk==ssd</code>, <code>node.platform.os==linux</code>, <code>engine.labels.*</code>. Multiple constraints are ANDed. If nothing matches, tasks stay <b>Pending</b> forever (no error at create time).</li>
<li><b>Preferences</b> are soft: <code>--placement-pref spread=node.labels.zone</code> spreads tasks evenly across label values. <code>--replicas-max-per-node 1</code> caps tasks per node.</li>
<li><b>Node labels</b> (set by managers, trusted): <code>docker node update --label-add zone=a node1</code>. Engine labels (in daemon.json) are set by the node itself, so don't use them for security decisions.</li>
<li><b>Availability:</b> <code>active</code> (schedulable), <code>pause</code> (no new tasks, existing keep running), <code>drain</code> (no new tasks and existing tasks are shut down and rescheduled elsewhere). Drain before maintenance; set back to active afterwards. Swarm does not rebalance existing tasks onto a node that becomes active again; new tasks or a forced update (<code>docker service update --force</code>) spread them.</li>
</ul>
<h4>Networking: overlay, ingress, endpoint modes</h4>
<ul class="pts">
<li><b>Overlay networks</b> (<code>docker network create -d overlay appnet</code>) span nodes using VXLAN. Only created on a manager; extended lazily to a worker when a task on that network is scheduled there. <code>--attachable</code> lets standalone <code>docker run</code> containers join (useful for debugging and one-off migrations). <code>--opt encrypted</code> adds IPsec (ESP) encryption of the data plane between nodes; the control plane is always encrypted by mTLS.</li>
<li><b>Ingress routing mesh</b> (default publish mode): <code>--publish published=8080,target=8000</code> opens 8080 on <b>every</b> node; a request hitting any node is IPVS-load-balanced over the <code>ingress</code> overlay to a healthy task anywhere. Source IP is lost (SNAT).</li>
<li><b>Host mode</b>: <code>--publish published=80,target=80,mode=host</code> binds only on nodes running a task, no mesh, client IP preserved. Typically with <code>--mode global</code> so each node has one, or behind an external LB.</li>
<li><b>Endpoint mode</b>: <code>vip</code> (default) gives the service one virtual IP; DNS <code>api</code> → VIP → IPVS → tasks. <code>dnsrr</code>: DNS returns task IPs directly (round-robin), for clients that do their own balancing; cannot be combined with ingress publishing (use host mode). <code>tasks.api</code> always resolves to all task IPs.</li>
</ul>
<h4>Secrets and configs</h4>
<ul class="pts">
<li><code>docker secret create db_password ./pw.txt</code> (or from stdin with <code>-</code>). Max size 500 KB. Stored encrypted in the Raft log, delivered over mTLS only to nodes running a task that was granted it, mounted at <code>/run/secrets/db_password</code> on an in-memory filesystem (Linux), never in <code>docker inspect</code> output or env.</li>
<li><code>docker config create nginx_conf ./nginx.conf</code>: same distribution, not encrypted, mounted anywhere (<code>--config source=nginx_conf,target=/etc/nginx/nginx.conf</code>), default mount at <code>/&lt;config-name&gt;</code>.</li>
<li>Both are <b>immutable</b>, and you cannot remove one in use by a service. Rotate: create <code>db_password_v2</code>, then <code>docker service update --secret-rm db_password --secret-add source=db_password_v2,target=db_password api</code>. The app keeps reading the same path; tasks are replaced in a rolling update.</li>
<li>Many official images accept <code>*_FILE</code> env vars (<code>POSTGRES_PASSWORD_FILE=/run/secrets/db_password</code>) for exactly this.</li>
</ul>
<h4>Stacks</h4>
<ul class="pts">
<li><code>docker stack deploy -c compose.yml shop</code> turns a Compose file into services, networks, secrets and configs, all prefixed <code>shop_</code>. Re-running it applies changes (it is idempotent, like <code>apply</code>). <code>docker stack ls/services/ps/rm</code>. Use <code>--with-registry-auth</code> for private images.</li>
<li>The <code>deploy:</code> key is honoured here: <code>mode</code>, <code>replicas</code>, <code>resources</code> (limits and reservations), <code>restart_policy</code>, <code>update_config</code>, <code>rollback_config</code>, <code>placement</code>, <code>endpoint_mode</code>, <code>labels</code>.</li>
<li>Ignored by stacks: <code>build:</code> (images must already be in a registry), <code>container_name</code>, <code>depends_on</code> ordering, <code>links</code>, and some host-specific options. Your app must retry connections instead of relying on start order.</li>
</ul>
<h4>Health checks and TLS</h4>
<ul class="pts">
<li>If the image or service has a <code>HEALTHCHECK</code>, a task is only considered running (and added to the VIP load balancing) once healthy; an unhealthy task is killed and replaced. Rolling updates use health during <code>--update-monitor</code> to decide failure. Override with <code>--health-cmd</code>, <code>--health-interval</code>, <code>--health-retries</code>, <code>--no-healthcheck</code>.</li>
<li>Every node gets a certificate from the swarm root CA; all node-to-node control traffic is <b>mutually authenticated TLS</b>. Certificates rotate automatically (default validity 90 days, <code>docker swarm update --cert-expiry 720h</code> to change). <code>docker swarm ca --rotate</code> rotates the root CA itself (e.g., after a manager compromise); you can also supply an external CA.</li>
</ul>`,
      why: `<p>Compose solved "run my five containers together" on <b>one</b> host. Production needs more: if that host dies, everything is down; if one container crashes at 3 a.m., something must notice and replace it somewhere healthy; deploying v1.5 must not take the site down; traffic must be spread across replicas; passwords must not sit in environment variables visible to anyone who can run <code>docker inspect</code>.</p>
<p>Before orchestrators, teams wrote this themselves: Ansible playbooks that SSH'd into hosts in a loop, cron jobs that checked <code>docker ps</code>, hand-maintained HAProxy backends, and shell scripts for "rolling" restarts that forgot to wait for the new process to be healthy. Each piece was fragile and nothing held a single source of truth for "what should be running".</p>
<p>An orchestrator gives you: a replicated, consistent <b>store of desired state</b> (Raft), a <b>scheduler</b> that knows node resources and constraints, <b>self-healing</b>, <b>service discovery and load balancing</b> built in, <b>rolling updates with automatic rollback</b>, and <b>secret distribution</b> with identity (mTLS) for every node. Swarm does this with almost no new concepts for someone who knows Compose, which is why it is still the heart of the DCA orchestration domain even though Kubernetes dominates the job market.</p>`,
      diagram: {
        html: lanes([
          ["Managers (Raft group)", ["mgr1 <b>leader</b>: Raft log, scheduler, dispatcher", "mgr2 follower: replica of log", "mgr3 follower: replica of log", "quorum = 2 of 3"]],
          ["Workers", ["wrk1: api.1, web.1, ingress endpoint", "wrk2: api.2, redis.1", "wrk3: api.3, db.1 (constraint node.labels.db==true)"]],
          ["Networks", ["ingress overlay: routing mesh on :80 of every node", "shop_backend overlay (encrypted): api ↔ redis ↔ db", "docker_gwbridge: overlay → host egress"]],
          ["Data", ["secrets: /run/secrets/db_password (tmpfs)", "configs: /etc/nginx/nginx.conf", "volume pgdata on wrk3 only"]]
        ]) + flow([["docker service update --image api:1.5", "CLI → manager API", "w"], ["Raft write", "leader + majority ack", "g"], ["Orchestrator", "diff desired vs actual"], ["Scheduler", "filter constraints, spread"], ["Dispatcher", "assigns task to worker over mTLS"], ["Worker engine", "pull image, create container, health check", "g"]]),
        steps: [
          "You run a <code>docker service</code> command against a manager. A follower forwards the write to the leader, which appends it to the Raft log and commits once a majority of managers acknowledge.",
          "The orchestrator sees the new desired state (e.g., new image) and creates new task objects; the allocator assigns overlay IPs and VIPs; the scheduler filters nodes by availability, constraints and resources, then spreads tasks.",
          "The dispatcher hands each task to its worker over the mTLS gRPC session; the worker's engine pulls the image, attaches overlay networks, mounts secrets/configs, starts the container and reports status back.",
          "Rolling updates do this batch by batch (<code>--update-parallelism</code>), waiting <code>--update-delay</code> and watching each batch for <code>--update-monitor</code>; on failure they pause or roll back according to <code>--update-failure-action</code>.",
          "Clients hit port 80 on any node; IPVS in the ingress namespace forwards to a healthy task's overlay IP. Inside the backend network, <code>api</code> resolves to the service VIP, <code>tasks.api</code> to individual task IPs."
        ]
      },
      cmds: [
        { t: "Create the swarm and join nodes", lang: "sh", code: `# on mgr1 (10.0.0.11)
docker swarm init --advertise-addr 10.0.0.11

# print join commands (run on mgr1)
docker swarm join-token worker
docker swarm join-token manager

# on each worker
docker swarm join --token SWMTKN-1-3pu6hszjas...-1awxwuwd3z9j1z3puu7rcgdbx 10.0.0.11:2377

# on mgr2 and mgr3, with the MANAGER token
docker swarm join --token SWMTKN-1-3pu6hszjas...-7p73s1dx5in4tatdymyhg9hu2 10.0.0.11:2377

docker node ls`, out: `ID                            HOSTNAME   STATUS    AVAILABILITY   MANAGER STATUS   ENGINE VERSION
q3k1...  *                    mgr1       Ready     Active         Leader           27.x
w8d2...                       mgr2       Ready     Active         Reachable        27.x
z1x9...                       mgr3       Ready     Active         Reachable        27.x
a7c4...                       wrk1       Ready     Active                          27.x
b2e5...                       wrk2       Ready     Active                          27.x`, note: `<p>An empty MANAGER STATUS means worker. <code>*</code> marks the node you are connected to. If a join hangs, check 2377/tcp reachability and that <code>--advertise-addr</code> is the private IP, not a NAT or Docker bridge address.</p>` },
        { t: "Firewall ports between nodes (ufw example)", lang: "sh", code: `sudo ufw allow 2377/tcp      # cluster management (to managers)
sudo ufw allow 7946/tcp      # node gossip / discovery
sudo ufw allow 7946/udp
sudo ufw allow 4789/udp      # VXLAN overlay data plane
sudo ufw allow proto esp from 10.0.0.0/24   # only if using encrypted overlays` },
        { t: "Manage nodes: promote, demote, labels, availability", lang: "sh", code: `docker node promote wrk1          # worker -> manager
docker node demote wrk1           # manager -> worker (do this before removing a manager)

docker node update --label-add zone=a --label-add disk=ssd wrk1
docker node update --label-add db=true wrk3
docker node inspect wrk3 --format '{{ .Spec.Labels }}'

docker node update --availability drain mgr1   # keep managers free of workload
docker node update --availability pause wrk2   # no new tasks, keep existing
docker node update --availability active wrk2

# remove a dead worker
docker node rm --force wrk9`, out: `map[db:true]` },
        { t: "Create a replicated and a global service", lang: "sh", code: `docker network create -d overlay --attachable --opt encrypted backend

docker service create --name api --replicas 3 \\
  --network backend \\
  --publish published=8000,target=8000 \\
  --health-cmd "curl -fsS http://localhost:8000/health || exit 1" \\
  --health-interval 10s --health-retries 3 \\
  --limit-memory 512M --reserve-memory 256M \\
  registry.example.com/shop/api:1.4

docker service create --name node-exporter --mode global \\
  --mount type=bind,src=/proc,dst=/host/proc,readonly \\
  prom/node-exporter:v1.8.2 --path.procfs=/host/proc

docker service ls
docker service ps api`, out: `ID        NAME            MODE         REPLICAS   IMAGE                                PORTS
k2h...    api             replicated   3/3        registry.example.com/shop/api:1.4    *:8000->8000/tcp
p9q...    node-exporter   global       5/5        prom/node-exporter:v1.8.2

ID        NAME    IMAGE      NODE   DESIRED STATE   CURRENT STATE
x1...     api.1   …api:1.4   wrk1   Running         Running 40 seconds ago
x2...     api.2   …api:1.4   wrk2   Running         Running 41 seconds ago
x3...     api.3   …api:1.4   mgr2   Running         Running 40 seconds ago` },
        { t: "Inspect, logs, scale", lang: "sh", code: `docker service inspect --pretty api
docker service inspect api --format '{{ json .Spec.UpdateConfig }}'
docker service logs -f --tail 50 api
docker service logs api.2                 # a single task

docker service scale api=6
docker service update --replicas 6 api    # same thing
docker service scale api=6 web=3          # several at once

# which tasks failed and why
docker service ps --no-trunc --filter desired-state=shutdown api`, out: `ID:             k2h...
Name:           api
Service Mode:   Replicated
 Replicas:      3
UpdateConfig:
 Parallelism:   1
 On failure:    pause
 Monitoring Period: 5s
 Update order:      stop-first
…` },
        { t: "Rolling update with automatic rollback", lang: "sh", code: `docker service update \\
  --image registry.example.com/shop/api:1.5 \\
  --update-parallelism 1 \\
  --update-delay 10s \\
  --update-monitor 30s \\
  --update-max-failure-ratio 0 \\
  --update-failure-action rollback \\
  --update-order start-first \\
  --rollback-parallelism 2 \\
  api

# watch it
docker service ps api
docker service inspect api --format '{{ .UpdateStatus.State }} {{ .UpdateStatus.Message }}'

# manual rollback to PreviousSpec
docker service rollback api

# resume a paused update after fixing the cause
docker service update --image registry.example.com/shop/api:1.5.1 api

# force a redeploy with the same spec (rebalance, re-pull a moved tag)
docker service update --force api`, out: `api
overall progress: 3 out of 3 tasks
1/3: running   [==================================================>]
2/3: running   [==================================================>]
3/3: running   [==================================================>]
verify: Service api converged` },
        { t: "Placement constraints and preferences", lang: "sh", code: `# PostgreSQL pinned to the node holding its volume
docker service create --name db --replicas 1 \\
  --constraint node.labels.db==true \\
  --mount type=volume,src=pgdata,dst=/var/lib/postgresql/data \\
  --secret db_password \\
  -e POSTGRES_PASSWORD_FILE=/run/secrets/db_password \\
  --network backend postgres:16

# spread API replicas evenly across zones, max 2 per node
docker service update --placement-pref-add spread=node.labels.zone \\
  --replicas-max-per-node 2 api

# only Linux workers
docker service update --constraint-add node.role==worker --constraint-add node.platform.os==linux api` },
        { t: "Publishing: routing mesh vs host mode, VIP vs dnsrr", lang: "sh", code: `# routing mesh (default): port 80 open on EVERY node
docker service create --name web --replicas 2 --publish published=80,target=80 nginx:1.27-alpine

# host mode: port only on nodes running a task, client IP preserved
docker service create --name edge --mode global \\
  --publish published=443,target=443,mode=host traefik:v3.1

# DNS round robin instead of a VIP (no ingress publishing allowed)
docker service create --name cache --endpoint-mode dnsrr --network backend redis:7-alpine

# see the VIPs
docker service inspect api --format '{{ json .Endpoint.VirtualIPs }}'

# resolve from a debug container on the attachable network
docker run --rm --network backend busybox:1.36 nslookup api
docker run --rm --network backend busybox:1.36 nslookup tasks.api`, out: `Name:   api
Address: 10.0.1.5            <- the VIP

Name:   tasks.api
Address: 10.0.1.7
Address: 10.0.1.8
Address: 10.0.1.9            <- each task` },
        { t: "Secrets and configs, including rotation", lang: "sh", code: `printf 's3cr3t-v1' | docker secret create db_password -
docker config create nginx_conf ./nginx.conf
docker secret ls
docker secret inspect db_password      # metadata only, never the value

docker service update --secret-add db_password api
docker exec $(docker ps -q -f name=api | head -1) cat /run/secrets/db_password

# rotate: secrets are immutable
printf 's3cr3t-v2' | docker secret create db_password_v2 -
docker service update \\
  --secret-rm db_password \\
  --secret-add source=db_password_v2,target=db_password \\
  api
docker secret rm db_password            # only works once no service uses it

# configs mount at any path
docker service update --config-add source=nginx_conf,target=/etc/nginx/nginx.conf,mode=0444 web` },
        { t: "Stack file with the deploy key (compose.yml)", lang: "yaml", code: `services:
  web:
    image: registry.example.com/shop/web:2.3      # React build served by nginx
    ports:
      - "80:80"
    networks: [frontend]
    deploy:
      replicas: 2
      update_config: { parallelism: 1, delay: 10s, order: start-first }
  api:
    image: registry.example.com/shop/api:1.5      # FastAPI
    environment:
      DATABASE_HOST: db
      REDIS_URL: redis://redis:6379/0
      DB_PASSWORD_FILE: /run/secrets/db_password
    secrets: [db_password]
    networks: [frontend, backend]
    healthcheck:
      test: ["CMD", "curl", "-fsS", "http://localhost:8000/health"]
      interval: 10s
      timeout: 3s
      retries: 3
      start_period: 20s
    deploy:
      replicas: 3
      resources:
        limits: { cpus: "0.50", memory: 512M }
        reservations: { memory: 256M }
      restart_policy: { condition: on-failure, delay: 5s, max_attempts: 3, window: 60s }
      update_config:
        parallelism: 1
        delay: 10s
        monitor: 30s
        failure_action: rollback
        order: start-first
      rollback_config: { parallelism: 2, order: stop-first }
      placement:
        constraints: [node.role == worker]
        preferences:
          - spread: node.labels.zone
  redis:
    image: redis:7-alpine
    networks: [backend]
    deploy: { replicas: 1 }
  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
    secrets: [db_password]
    volumes: [pgdata:/var/lib/postgresql/data]
    networks: [backend]
    deploy:
      replicas: 1
      placement:
        constraints: [node.labels.db == true]
networks:
  frontend: { driver: overlay }
  backend: { driver: overlay, driver_opts: { encrypted: "true" } }
volumes:
  pgdata: {}
secrets:
  db_password:
    external: true` },
        { t: "Deploy and manage the stack", lang: "sh", code: `docker stack deploy -c compose.yml --with-registry-auth shop
docker stack ls
docker stack services shop
docker stack ps shop --no-trunc
# edit compose.yml (new image tag), then simply re-deploy: only changed services update
docker stack deploy -c compose.yml --with-registry-auth shop
docker stack rm shop`, out: `ID        NAME        MODE         REPLICAS   IMAGE                                   PORTS
a1…       shop_api    replicated   3/3        registry.example.com/shop/api:1.5
b2…       shop_db     replicated   1/1        postgres:16
c3…       shop_redis  replicated   1/1        redis:7-alpine
d4…       shop_web    replicated   2/2        registry.example.com/shop/web:2.3       *:80->80/tcp` },
        { t: "Raft health, quorum loss recovery, autolock, backup", lang: "sh", code: `docker info --format '{{ json .Swarm }}' | head -c 400
docker node ls                       # MANAGER STATUS: Leader / Reachable / Unreachable

# quorum permanently lost (e.g. 2 of 3 managers destroyed): on the survivor
docker swarm init --force-new-cluster --advertise-addr 10.0.0.11
docker node promote wrk1 wrk2        # back to 3 managers

# autolock
docker swarm update --autolock=true
docker swarm unlock-key              # store this in a password manager
docker swarm unlock                  # after a manager restart
docker swarm unlock-key --rotate

# backup a manager's state (prefer a non-leader)
sudo systemctl stop docker
sudo tar -czf /backup/swarm-$(date +%F).tgz -C /var/lib/docker swarm
sudo systemctl start docker

# certificates
docker swarm update --cert-expiry 720h
docker swarm ca --rotate`, out: `Swarm initialized: current node (q3k1...) is now a manager.
…
To unlock a swarm manager after it restarts, run the \`docker swarm unlock\`
command and provide the following key:

    SWMKEY-1-7c37Cc8654o6p38HnroywCi19pllOnGtbdZEgtKxZu8` }
      ],
      internals: `<p><b>Inside dockerd.</b> Swarm mode is SwarmKit linked into the engine. On a manager, <code>dockerd</code> runs the Raft node, the store (an in-memory database whose every write goes through Raft), and the control loops: the <b>orchestrator</b> (replicated/global; creates and deletes tasks to match the service spec), the <b>allocator</b> (overlay subnets, task IPs, VIPs), the <b>scheduler</b> (assigns tasks to nodes after filtering by readiness, availability, constraints, platform, resource reservations, then picks by spread), and the <b>dispatcher</b> (long-lived gRPC streams to every node, carrying assignments and heartbeats). On every node, the <b>agent/executor</b> receives assignments and turns each task into ordinary engine operations: pull, create container, connect networks, start, the same path as <code>docker run</code>, down through containerd and runc.</p>
<p><b>On disk</b> under <code>/var/lib/docker/swarm/</code>: <code>certificates/</code> (the node's TLS cert and key, the root CA cert), <code>raft/</code> (the write-ahead log <code>wal-v3-encrypted</code> and snapshots <code>snap-v3-encrypted</code>), <code>worker/</code> (task database on workers) and <code>state.json</code>/<code>docker-state.json</code>. The Raft data is encrypted with a data key that is itself protected by the node's TLS key; autolock encrypts that key with the unlock key (KEK) so a stolen disk image is useless without it.</p>
<p><b>Raft.</b> Managers elect a leader by randomized timeouts. Every change is a log entry the leader replicates; it is committed when a majority have persisted it. That is why a minority partition can never commit anything: if a network split leaves two managers on one side and one on the other, the pair still has 2 of 3 and keeps working, while the lone manager cannot commit and its side becomes read-only. Two leaders can never both commit, so there is no split brain. Snapshots compact the log (<code>--snapshot-interval</code>, default 10000 entries).</p>
<p><b>Identity.</b> The first manager generates a root CA. Each joining node sends a CSR signed with the token secret; the CA issues a cert whose OU is <code>swarm-manager</code> or <code>swarm-worker</code> and whose CN is the node ID. Role is therefore cryptographically bound: promoting a node just issues a new cert. Certs are renewed automatically before expiry; <code>docker swarm ca --rotate</code> introduces a new root and cross-signs during the transition.</p>
<p><b>Networking.</b> Each overlay is a Linux bridge inside its own network namespace on every participating node, with a VXLAN interface (UDP 4789) whose VNI identifies the network. Peer/MAC/IP mappings are distributed by the gossip layer on 7946, so there is no external key-value store. The <code>ingress</code> network has a hidden <code>ingress-sbox</code> namespace on every node: iptables in the host marks packets arriving at a published port (<code>DOCKER-INGRESS</code> chain), forwards them into <code>ingress-sbox</code>, and <b>IPVS</b> there load-balances to task IPs. Service VIPs on other overlays are implemented by IPVS inside each container's own namespace, so <code>curl api:8000</code> from a task is balanced locally. The embedded DNS (127.0.0.11) answers <code>api</code> with the VIP and <code>tasks.api</code> with task IPs. <code>docker_gwbridge</code> connects overlay containers to the host for outbound traffic.</p>
<p><b>Secrets</b> are stored in the Raft store (encrypted at rest), sent only to the nodes running a task that references them, kept in memory by the worker, and exposed through a tmpfs mount under <code>/run/secrets</code> in the container. When the task stops, the node drops them.</p>`,
      prod: `<p><b>The shop on Swarm.</b> Three managers in three availability zones (small instances, drained so they run no workload), four or more workers. The React app is built into an nginx image (<code>web</code>), FastAPI is <code>api</code> with 3+ replicas, Redis and PostgreSQL run as single-replica services. A cloud load balancer sends 443 to all workers; Traefik or nginx as a <b>global</b> service in host mode terminates TLS, or the routing mesh forwards port 80 to <code>web</code>.</p>
<ul class="pts">
<li><b>PostgreSQL is the hard part.</b> Swarm will happily reschedule <code>db</code> to another node, where its local volume is empty. Either pin it with a node label constraint (and accept that the node is a single point of failure, with backups), use a volume plugin backed by network storage, or, most commonly, use a managed database (RDS/Cloud SQL) and keep Swarm for stateless services.</li>
<li><b>Never use start-first for the database</b>: two Postgres processes on the same data directory corrupt it. Use the default stop-first for stateful services and start-first for stateless APIs.</li>
<li><b>FastAPI connects to <code>db:5432</code></b>, the service name on the <code>backend</code> overlay, never <code>localhost:5432</code> (that is the API task itself), the same lesson as Compose.</li>
<li><b>Health checks gate traffic</b>: FastAPI exposes <code>/health</code> that checks it can serve, with a short timeout. A task that fails health is removed from the VIP and replaced. Keep the check cheap: a health check that hits PostgreSQL makes a DB blip restart every API task at once.</li>
<li><b>CI/CD</b> builds, tags with the git SHA, pushes, then runs <code>docker stack deploy -c compose.yml --with-registry-auth shop</code> against a manager (via a Docker context over SSH). <code>failure_action: rollback</code> plus a 30s <code>monitor</code> gives automatic rollback if the new image crashes.</li>
<li><b>Operations</b>: back up <code>/var/lib/docker/swarm</code> on a manager nightly, keep the autolock key in a vault, monitor <code>docker node ls</code> for <code>Unreachable</code> managers, alert when <code>REPLICAS</code> shows less than desired.</li>
</ul>`,
      iq: [
        ["dca", "You have 5 managers. How many can fail while the swarm can still schedule new services? What if you add a 6th?", "<p><b>2.</b> Quorum for 5 is 3, so 2 can be lost. With 6 managers quorum is 4, so still only <b>2</b> can be lost: the 6th adds a node that can fail without adding tolerance. Use odd numbers (3, 5, 7).</p>"],
        ["dca", "Which ports must be open between Swarm nodes, and what is each for?", "<p><b>2377/tcp</b> cluster management (Raft and API between managers, node to manager), <b>7946/tcp and udp</b> container network discovery / gossip, <b>4789/udp</b> VXLAN overlay data traffic. Encrypted overlays also need IP protocol <b>50 (ESP)</b>. Distractors like 2376 (Docker daemon TLS) and 2375 (unencrypted daemon API) are not Swarm ports.</p>"],
        ["dca", "Two of three managers are permanently destroyed. Workers are still running tasks. What works, what doesn't, and how do you recover?", "<p>Existing tasks keep running and the routing mesh still forwards, but quorum is lost: no service create/update/scale, no rescheduling of failed tasks, no joins. On the surviving manager run <code>docker swarm init --force-new-cluster --advertise-addr &lt;ip&gt;</code>; it becomes a one-manager cluster with all services and secrets intact, then <code>docker node promote</code> two nodes to return to three managers. Re-running <code>docker swarm init</code> without the flag fails because the node is already part of a swarm; <code>docker swarm leave --force</code> would destroy the state.</p>"],
        ["dca", "What is the difference between <code>pause</code> and <code>drain</code> node availability?", "<p><b>pause</b>: the scheduler assigns no new tasks to the node; existing tasks keep running. <b>drain</b>: no new tasks, and existing tasks are stopped and rescheduled on other active nodes (global service tasks on it are simply stopped). Neither removes the node from the swarm and neither affects the node's manager role.</p>"],
        ["dca", "Which TWO statements about Swarm secrets are true? (a) They are mounted at /run/secrets/&lt;name&gt; (b) They can be updated in place with docker secret update (c) They are encrypted in the Raft log (d) They are visible in docker service inspect", "<p><b>(a) and (c).</b> There is no <code>docker secret update</code>: secrets are immutable, so you create a new one and use <code>--secret-rm</code>/<code>--secret-add</code>. Inspect shows only metadata (name, ID, labels, created), never the value.</p>"],
        ["dca", "A service was created with <code>--constraint node.labels.ssd==true</code> and shows 0/3 replicas with tasks in Pending. Why, and how do you fix it?", "<p>No active node has the label <code>ssd=true</code> (or matching nodes are drained or lack resources). Swarm accepts the service but cannot place tasks; <code>docker service ps --no-trunc</code> shows \"no suitable node\". Fix with <code>docker node update --label-add ssd=true &lt;node&gt;</code> or <code>docker service update --constraint-rm …</code>. Labels in daemon.json are <i>engine</i> labels and would need <code>engine.labels.ssd</code>, a common trap.</p>"],
        ["dca", "What does <code>--update-failure-action</code> default to, and what are the alternatives?", "<p>Default <b>pause</b>: the update stops and the service sits in a mixed-version state until you act. Alternatives: <b>continue</b> (ignore failures) and <b>rollback</b> (revert to the previous spec automatically). Failure is judged during <code>--update-monitor</code> against <code>--update-max-failure-ratio</code>.</p>"],
        ["dca", "Compare the ingress routing mesh with host-mode publishing.", "<p>Ingress (default): the published port is open on every node; IPVS forwards to any healthy task cluster-wide; client source IP is NATed away; you cannot run two services on the same published port. Host mode (<code>mode=host</code>): the port is bound only on nodes running a task, traffic stays local, client IP preserved, but you can run at most one task per node per port and the client must know which nodes have a task (usually solved with <code>--mode global</code> or an external LB).</p>"],
        ["dca", "How do you prevent a stolen manager disk from exposing the Raft encryption key, and what is the operational cost?", "<p>Enable autolock: <code>docker swarm update --autolock=true</code>. The keys on disk are encrypted with an unlock key; after any Docker restart the manager stays locked until an operator runs <code>docker swarm unlock</code> with the key. Cost: manual intervention on restarts, and losing the key (with all managers restarted) means you cannot unlock. Rotate with <code>docker swarm unlock-key --rotate</code>.</p>"],
        ["mid", "What are service, task and container, and which one gets restarted when a container crashes?", "<p>A service is the desired state; a task is one scheduling slot (immutable: one container, one node); the container is the runtime process. Nothing is restarted in place: the failed task becomes Failed/Shutdown and the orchestrator creates a <b>new task</b> with a new container, possibly on a different node. That is why <code>docker service ps</code> shows a history of tasks.</p>"],
        ["senior", "Why is <code>--update-order start-first</code> dangerous for PostgreSQL but good for FastAPI?", "<p>start-first runs the new task alongside the old one before stopping it. For a stateless API that avoids a capacity dip. For PostgreSQL both processes would open the same volume (if on the same node) or the new one would start on an empty volume elsewhere; data corruption or split brain. Stateful singletons use stop-first (and ideally are not in Swarm at all).</p>"],
        ["senior", "What does <code>docker stack deploy</code> ignore from a Compose file, and why does it matter?", "<p>Notably <code>build</code> (images must be pushed to a registry first), <code>container_name</code> (tasks get generated names), <code>depends_on</code> start ordering and <code>links</code>. Apps must retry their DB and Redis connections at startup rather than assuming order; CI must push images before deploy.</p>"],
        ["lead", "How would you lay out managers across two data centres?", "<p>You can't make two sites survive the loss of either: with 3 managers split 2+1, losing the site with 2 loses quorum; 2+2 has quorum 3 and loses it with either site. Use a third site (or cloud AZ) as a tie-breaker, e.g., 2+2+1 for 5 managers, or accept that the primary site is required. Same rule applies to etcd in Kubernetes.</p>"],
        ["mid", "How do containers in a Swarm service find Redis?", "<p>Both services attach to the same overlay network; the embedded DNS resolves the service name <code>redis</code> to its VIP, and IPVS balances to the task. In a stack the service is <code>shop_redis</code> but is also reachable as <code>redis</code> through the network alias the stack sets. <code>tasks.redis</code> lists task IPs.</p>"]
      ],
      gotchas: [
        "<b>Swarm does not rebalance.</b> When a drained node returns to active, existing tasks stay where they are. Use <code>docker service update --force &lt;svc&gt;</code> during a quiet period to spread them again.",
        "<b>Overlay networks appear lazily on workers.</b> <code>docker network ls</code> on a worker won't show <code>backend</code> until a task using it is scheduled there; this is normal, not a failure.",
        "<b>Local volumes are per node.</b> A <code>pgdata</code> volume is created empty on whatever node the task lands on. Without a placement constraint, a rescheduled database starts with no data.",
        "<b>Moving tags.</b> Swarm resolves <code>api:latest</code> to a digest at create/update time and pins it in the spec, so all replicas run the same image. Pushing a new <code>latest</code> does nothing until you <code>update --image</code> (or <code>--force</code>); disabling this with <code>--no-resolve-image</code> invites mixed versions.",
        "<b>Private registry auth.</b> Without <code>--with-registry-auth</code>, workers can't pull private images and tasks fail with \"No such image\" or \"pull access denied\" only on some nodes.",
        "<b>The advertise address.</b> On hosts with several interfaces (or VPN, or Docker Desktop), init picks the wrong IP or refuses to guess. Always pass <code>--advertise-addr</code> explicitly.",
        "<b>Removing a manager without demoting it first</b> leaves a ghost member in Raft and reduces your failure tolerance. Demote, then leave/remove.",
        "<b>dnsrr + ingress</b> is rejected: DNS round robin services cannot publish through the routing mesh; publish with <code>mode=host</code> instead.",
        "<b>Health checks that depend on downstream services</b> (DB in <code>/health</code>) cause cascading restarts across all replicas during a dependency hiccup. Separate liveness (process is fine) from readiness concerns.",
        "<b>Overlay subnet collisions.</b> The default ingress/overlay ranges (10.0.0.0/8 pool) can overlap your VPC; set <code>--default-addr-pool</code> at init or specify <code>--subnet</code> on networks."
      ],
      best: [
        "Run 3 managers (5 for large/critical clusters) across failure domains; drain them so they only manage; never an even number.",
        "Enable autolock, store the unlock key in a secret manager, and back up <code>/var/lib/docker/swarm</code> from a non-leader manager on a schedule; test restore.",
        "Every service gets a health check, resource reservations and limits, and an <code>update_config</code> with <code>monitor</code> plus <code>failure_action: rollback</code>.",
        "Deploy via <code>docker stack deploy</code> from version-controlled Compose files in CI, with immutable image tags (git SHA or digest), never <code>latest</code>.",
        "Use secrets (and <code>*_FILE</code> env vars) for credentials, configs for config files, versioned names (<code>db_password_v2</code>) for rotation.",
        "Use encrypted overlays for traffic that crosses untrusted networks; put front-end and back-end on separate overlays so the web tier cannot reach PostgreSQL.",
        "Keep stateful services pinned with node labels or, better, outside the swarm as managed services."
      ],
      lab: [
        "Create three nodes (three VMs, or Play with Docker, or <code>docker:dind</code> containers on one host). On node1: <code>docker swarm init --advertise-addr &lt;ip&gt;</code>; join node2 and node3 as <b>managers</b> with the manager token. Run <code>docker node ls</code> and identify the leader.",
        "Create an encrypted overlay <code>backend</code> and a secret <code>db_password</code>. Deploy the stack file above (use public images like <code>nginx:1.27-alpine</code> and <code>traefik/whoami</code> for web/api if you have no registry). <code>docker stack services shop</code> should show all replicas.",
        "Curl port 80 on each node, including one with no web task: the routing mesh still answers. Scale <code>api</code> to 6 and watch <code>docker service ps</code>.",
        "Do a rolling update to a deliberately broken image tag (e.g., a non-existent tag or one whose command exits 1) with <code>--update-failure-action rollback --update-monitor 15s</code>. Watch it roll back automatically.",
        "Drain node3, watch tasks move, set it active again, and note that nothing moves back until <code>docker service update --force api</code>.",
        "Stop Docker on two managers. Try <code>docker service scale api=2</code> on the survivor (it fails: no quorum). Run <code>docker swarm init --force-new-cluster --advertise-addr &lt;ip&gt;</code>, confirm the services are intact, then re-join and promote the others.",
        "Rotate the secret: create <code>db_password_v2</code>, swap it with <code>--secret-rm/--secret-add</code> keeping the target name, then remove the old one.",
        "<b>Done when:</b> you have demonstrated self-healing, an automatic rollback, a drain, quorum loss and <code>--force-new-cluster</code> recovery, and a secret rotation, and you can explain each from <code>docker service ps</code> output."
      ],
      teach: `<p>"Compose runs my containers on one machine. Swarm runs <i>services</i> on many. I tell the managers what I want, three replicas of the API, and they keep it true forever: if a container dies or a node dies, they schedule a new task somewhere else. The managers agree on that state with Raft, so I run an odd number, three tolerates one failure, five tolerates two, and if I lose the majority the apps keep running but I can't change anything until I bring managers back or force a new cluster from a survivor."</p>
<p>"Nodes talk on 2377 for management, 7946 for gossip and 4789 for VXLAN, all with mutual TLS identities from the swarm's own CA. Services publish through the routing mesh, so any node answers on the port, and inside overlay networks the service name is a virtual IP. Updates roll one batch at a time with a delay and a monitor window, and if the new tasks fail, Swarm can roll back on its own. Passwords go in secrets, encrypted in Raft and mounted at /run/secrets. And a stack is just my Compose file with a deploy section, applied with docker stack deploy."</p>`
    },
    {
      id: "d9-kubernetes",
      title: "Kubernetes essentials for Docker users",
      lv: ["mid", "senior", "architect", "dca"],
      eli5: `<p>If Swarm is a restaurant group with a small head office, Kubernetes is an <b>international hotel chain</b>. It does the same core job, keep the promised rooms open, replace what breaks, but it has a department for everything: a reception desk where every request is filed (the API server), a filing cabinet that is the single source of truth (etcd), a room-assignment office (scheduler), many floor managers each watching one kind of promise (controllers), and a concierge on every floor (kubelet) who actually opens rooms.</p>
<p>Guests don't get a single room; they get a <b>suite</b> (a Pod): one or more containers that share an address and can talk to each other via <code>localhost</code>, like rooms connected by an inner door. You never book a suite directly in practice: you tell a manager "always keep 3 suites like this" (a Deployment). The hotel's switchboard number (a Service) never changes even though suites are constantly re-assigned.</p>
<p>The good news for a Docker user: the luggage is the same. The images you built with <code>docker build</code> are exactly what Kubernetes runs; only the paperwork (YAML) and the staff change.</p>`,
      what: `<p><b>Kubernetes</b> (K8s) is an open-source container orchestrator. Like Swarm it is declarative and reconciling, but it is a separate system with its own API, objects and CLI (<code>kubectl</code>). The DCA expects Kubernetes <i>essentials</i> as part of the orchestration domain (as commonly published; check the current exam guide): core objects, how a Docker workload maps to them, and basic <code>kubectl</code> usage.</p>
<h4>Control plane and nodes</h4>
<ul class="pts">
<li><b>kube-apiserver</b>: the only component that talks to etcd; everything (kubectl, controllers, kubelets) talks to it over HTTPS. Authentication, RBAC authorization and admission control happen here.</li>
<li><b>etcd</b>: a Raft-replicated key-value store holding all cluster state. Same quorum math as Swarm managers (3 or 5 members).</li>
<li><b>kube-scheduler</b>: assigns unscheduled Pods to nodes (resources, affinity, taints/tolerations).</li>
<li><b>kube-controller-manager</b>: the reconciliation loops (Deployment, ReplicaSet, Node, Job, endpoints…). <b>cloud-controller-manager</b> talks to the cloud for LoadBalancers and volumes.</li>
<li><b>Worker nodes</b> run <b>kubelet</b> (makes the Pods assigned to its node exist, runs probes, reports status), <b>kube-proxy</b> (implements Services with iptables/IPVS, or replaced by an eBPF CNI), a <b>container runtime</b> speaking CRI (containerd or CRI-O), and a <b>CNI</b> plugin for Pod networking.</li>
</ul>
<h4>Core objects</h4>
<ul class="pts">
<li><b>Pod</b>: the smallest deployable unit; one or more containers that share a network namespace (one IP, talk over <code>localhost</code>), can share volumes, and are scheduled together. Patterns: app + sidecar (log shipper, proxy), init containers that run to completion first (e.g., wait for the DB, run migrations). Pods are ephemeral and get a new IP when recreated.</li>
<li><b>ReplicaSet</b>: keeps N identical Pods running (matches by label selector). You rarely create one directly.</li>
<li><b>Deployment</b>: manages ReplicaSets to give rolling updates and rollbacks (<code>strategy.rollingUpdate.maxSurge</code>/<code>maxUnavailable</code>, <code>kubectl rollout undo</code>). Equivalent of a replicated Swarm service. <b>DaemonSet</b> ≈ global service. <b>StatefulSet</b>: stable names (<code>db-0</code>) and per-replica volumes, for databases. <b>Job/CronJob</b>: run to completion.</li>
<li><b>Service</b>: a stable virtual IP and DNS name (<code>api.default.svc.cluster.local</code>, or just <code>api</code> in the same namespace) in front of Pods matched by labels. Types: <b>ClusterIP</b> (default, internal only), <b>NodePort</b> (opens a port, by default in 30000-32767, on every node, a bit like the routing mesh), <b>LoadBalancer</b> (asks the cloud for an external LB that forwards to the NodePorts), <b>ExternalName</b> (DNS CNAME). Headless (<code>clusterIP: None</code>) ≈ Swarm dnsrr.</li>
<li><b>Ingress</b>: HTTP(S) routing rules (host/path → Service, TLS) implemented by an <b>Ingress controller</b> you install (ingress-nginx, Traefik…). The newer Gateway API is the successor model.</li>
<li><b>ConfigMap</b>: non-secret config as env vars or files. <b>Secret</b>: same shape for sensitive data; values are only <b>base64-encoded</b> in the API, so enable encryption at rest in etcd and restrict access with RBAC. Swarm secrets are encrypted in Raft by default; K8s Secrets are not unless configured.</li>
<li><b>Volumes</b>: per-Pod (<code>emptyDir</code>, <code>configMap</code>, <code>secret</code>, <code>hostPath</code>) and persistent: a <b>PersistentVolumeClaim</b> requests storage; a <b>StorageClass</b> provisions a <b>PersistentVolume</b> dynamically (EBS, PD, Ceph).</li>
<li><b>Namespace</b>: a scope for names, RBAC and quotas (<code>dev</code>, <code>prod</code>, <code>kube-system</code>). Not a security boundary on its own.</li>
<li><b>Probes</b>: <code>livenessProbe</code> (restart if failing), <code>readinessProbe</code> (remove from Service endpoints if failing), <code>startupProbe</code>. Richer than Docker's single <code>HEALTHCHECK</code>, which Kubernetes ignores.</li>
</ul>
<h4>Docker images and runtimes</h4>
<ul class="pts">
<li>Kubernetes talks to runtimes through the <b>CRI</b>. Early versions talked to Docker Engine through a built-in adapter called <b>dockershim</b>; it was deprecated and then <b>removed in Kubernetes 1.24</b>. Clusters now use containerd or CRI-O directly (Mirantis maintains <code>cri-dockerd</code> if you really need Docker Engine as the runtime).</li>
<li>This changes nothing for images: Docker builds <b>OCI images</b>, and containerd runs them unchanged. What changes is on the node: <code>docker ps</code> no longer shows Kubernetes containers; use <code>crictl ps</code> (or <code>ctr -n k8s.io</code>). Docker-in-Docker builds that mounted <code>/var/run/docker.sock</code> on nodes break.</li>
</ul>
<h4>Mapping Docker / Compose / Swarm to Kubernetes</h4>
<table><tr><th>Docker / Compose / Swarm</th><th>Kubernetes</th></tr>
<tr><td>container</td><td>container inside a Pod</td></tr>
<tr><td>Swarm task</td><td>Pod</td></tr>
<tr><td>replicated service</td><td>Deployment (+ ReplicaSet)</td></tr>
<tr><td>global service</td><td>DaemonSet</td></tr>
<tr><td>single DB container + named volume</td><td>StatefulSet + PVC</td></tr>
<tr><td>service name / VIP on overlay</td><td>Service (ClusterIP) + cluster DNS</td></tr>
<tr><td>routing mesh published port</td><td>NodePort / LoadBalancer Service</td></tr>
<tr><td>nginx/Traefik reverse proxy</td><td>Ingress + Ingress controller</td></tr>
<tr><td>Swarm secret / config</td><td>Secret / ConfigMap</td></tr>
<tr><td>HEALTHCHECK</td><td>liveness / readiness / startup probes</td></tr>
<tr><td>deploy.resources</td><td>resources.requests / limits</td></tr>
<tr><td>placement constraints / node labels</td><td>nodeSelector, affinity, taints/tolerations</td></tr>
<tr><td>drain node</td><td><code>kubectl cordon</code> / <code>kubectl drain</code></td></tr>
<tr><td>compose.yml / stack</td><td>manifests (often templated by Helm or Kustomize)</td></tr>
<tr><td>docker stack deploy</td><td>kubectl apply -f</td></tr>
<tr><td>managers (Raft)</td><td>control plane + etcd (Raft)</td></tr></table>
<h4>Compose limitations and Docker vs Swarm vs Kubernetes</h4>
<ul class="pts">
<li><b>Compose</b> is single-host: no scheduling across machines, no rescheduling if the host dies (restart policies only restart on the same host), no cross-host networking, limited rolling updates. Perfect for development, CI and small single-server production.</li>
</ul>
<table><tr><th></th><th>Docker + Compose</th><th>Swarm</th><th>Kubernetes</th></tr>
<tr><td>Hosts</td><td>1</td><td>many</td><td>many (thousands)</td></tr>
<tr><td>Setup</td><td>none</td><td>one command</td><td>managed service (EKS/GKE/AKS) or significant ops</td></tr>
<tr><td>Self-healing across hosts</td><td>no</td><td>yes</td><td>yes</td></tr>
<tr><td>Rolling update / rollback</td><td>basic</td><td>yes, simple</td><td>yes, rich (surge, probes, canary via tooling)</td></tr>
<tr><td>Autoscaling</td><td>no</td><td>no built-in</td><td>HPA, cluster autoscaler</td></tr>
<tr><td>Ecosystem</td><td>dev tooling</td><td>small</td><td>huge (Helm, operators, service mesh, GitOps)</td></tr>
<tr><td>Best for</td><td>dev, CI, one server</td><td>small teams, simple multi-host</td><td>platform teams, many services, cloud-native</td></tr></table>`,
      why: `<p>Swarm proved that "Compose for a cluster" is valuable, but large organisations needed more: autoscaling on metrics, many teams sharing a cluster with RBAC and quotas, stateful workloads with per-replica storage, pluggable networking and storage, custom controllers (operators) that encode how to run a database, and first-class support from every cloud provider. Kubernetes, born from Google's internal Borg experience, became that standard platform, and every major cloud sells it as a managed service.</p>
<p>For a Docker user, Kubernetes exists for the moment Compose stops being enough: you need more than one host, zero-downtime deploys with readiness gating, autoscaling, and a shared platform for many services. Everything you learned still applies: images, layers, registries, health, the network model of "one IP per thing, talk by name". Kubernetes just adds the layer above.</p>
<p>For the DCA, Kubernetes appears because Docker Enterprise (now Mirantis Kubernetes Engine) ran Swarm and Kubernetes side by side; you are expected to know the core objects and how a Docker application maps onto them (as commonly published; check the current guide).</p>`,
      diagram: {
        html: lanes([
          ["Control plane", ["kube-apiserver (HTTPS, RBAC, admission)", "etcd (Raft, 3 or 5 members)", "kube-scheduler", "kube-controller-manager", "cloud-controller-manager"]],
          ["Node 1", ["kubelet", "kube-proxy (iptables / IPVS)", "containerd via CRI → runc", "Pod api-7d9f-abc: api container + log sidecar"]],
          ["Node 2", ["kubelet", "kube-proxy", "containerd → runc", "Pod api-7d9f-def", "Pod db-0 + PVC data-db-0"]],
          ["Traffic", ["Cloud LB → Ingress controller", "Ingress: shop.example.com / → web, /api → api", "Service api (ClusterIP) → Pod IPs (readiness gated)"]]
        ]) + flow([["kubectl apply -f api.yaml", "", "w"], ["apiserver", "authn, RBAC, admission, store in etcd"], ["Deployment controller", "creates ReplicaSet"], ["ReplicaSet controller", "creates 3 Pods"], ["Scheduler", "binds Pods to nodes"], ["kubelet", "CRI → containerd → runc", "g"]]),
        steps: [
          "<code>kubectl apply</code> sends the manifest to the API server, which authenticates you, checks RBAC, runs admission controllers and persists the object in etcd.",
          "The Deployment controller notices a Deployment with no matching ReplicaSet and creates one for the current Pod template; the ReplicaSet controller creates Pod objects until the count matches.",
          "The scheduler sees Pods with no node and binds each to a node that satisfies resource requests and affinity rules.",
          "The kubelet on that node sees a Pod bound to it, asks the runtime over CRI to pull the image and create a pod sandbox (the shared network namespace, set up by the CNI plugin) plus the containers.",
          "When readiness probes pass, the Pod's IP is added to the Service's EndpointSlices; kube-proxy programs iptables/IPVS so the Service's ClusterIP balances to it. An Ingress controller routes external HTTP to the Service."
        ]
      },
      cmds: [
        { t: "Get a local cluster and talk to it", lang: "sh", code: `# Options: Docker Desktop (Settings → Kubernetes → Enable), kind, minikube, k3d
kind create cluster --name shop
kubectl cluster-info
kubectl get nodes -o wide
kubectl config get-contexts
kubectl config use-context kind-shop`, out: `NAME                 STATUS   ROLES           AGE   VERSION   INTERNAL-IP   OS-IMAGE   CONTAINER-RUNTIME
shop-control-plane   Ready    control-plane   1m    v1.3x.x   172.18.0.2    Debian…    containerd://1.7.x` },
        { t: "Deployment + Service for the FastAPI image (api.yaml)", lang: "yaml", code: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
  labels: { app: api }
spec:
  replicas: 3
  selector:
    matchLabels: { app: api }
  strategy:
    type: RollingUpdate
    rollingUpdate: { maxSurge: 1, maxUnavailable: 0 }
  template:
    metadata:
      labels: { app: api }
    spec:
      containers:
        - name: api
          image: registry.example.com/shop/api:1.5     # the same image Docker built
          ports: [{ containerPort: 8000 }]
          env:
            - name: DATABASE_HOST
              value: db
            - name: REDIS_URL
              valueFrom: { configMapKeyRef: { name: api-config, key: REDIS_URL } }
            - name: DB_PASSWORD
              valueFrom: { secretKeyRef: { name: db-secret, key: password } }
          resources:
            requests: { cpu: 250m, memory: 256Mi }
            limits:   { memory: 512Mi }
          readinessProbe:
            httpGet: { path: /health, port: 8000 }
            periodSeconds: 5
          livenessProbe:
            httpGet: { path: /health, port: 8000 }
            initialDelaySeconds: 20
            periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: api
spec:
  type: ClusterIP
  selector: { app: api }
  ports:
    - port: 8000
      targetPort: 8000` },
        { t: "ConfigMap, Secret, namespace, apply", lang: "sh", code: `kubectl create namespace shop
kubectl config set-context --current --namespace=shop

kubectl create configmap api-config --from-literal=REDIS_URL=redis://redis:6379/0
kubectl create secret generic db-secret --from-literal=password='s3cr3t'
kubectl get secret db-secret -o jsonpath='{.data.password}' | base64 -d   # only base64!

kubectl apply -f api.yaml
kubectl get deploy,rs,pods,svc -o wide`, out: `NAME                  READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/api   3/3     3            3           40s

NAME                             DESIRED   CURRENT   READY   AGE
replicaset.apps/api-7d9f8c6b5d   3         3         3       40s

NAME                       READY   STATUS    RESTARTS   AGE   IP
pod/api-7d9f8c6b5d-abcde   1/1     Running   0          40s   10.244.0.7
…
NAME          TYPE        CLUSTER-IP     PORT(S)
service/api   ClusterIP   10.96.120.15   8000/TCP` },
        { t: "Inspect and debug: describe, logs, exec, port-forward", lang: "sh", code: `kubectl describe pod api-7d9f8c6b5d-abcde      # events: pulls, probe failures, OOMKilled
kubectl logs -f deploy/api                      # one pod of the deployment
kubectl logs api-7d9f8c6b5d-abcde --previous    # the crashed container's logs
kubectl exec -it deploy/api -- sh
kubectl port-forward svc/api 8000:8000          # http://localhost:8000/health
kubectl get events --sort-by=.lastTimestamp
kubectl get endpointslices -l kubernetes.io/service-name=api` },
        { t: "Rollouts, scaling, rollback", lang: "sh", code: `kubectl set image deploy/api api=registry.example.com/shop/api:1.6
kubectl rollout status deploy/api
kubectl rollout history deploy/api
kubectl rollout undo deploy/api                    # back to the previous ReplicaSet
kubectl rollout undo deploy/api --to-revision=2
kubectl scale deploy/api --replicas=5
kubectl autoscale deploy/api --min=3 --max=10 --cpu-percent=70
kubectl rollout restart deploy/api                 # like docker service update --force`, out: `Waiting for deployment "api" rollout to finish: 1 out of 3 new replicas have been updated...
deployment "api" successfully rolled out` },
        { t: "PostgreSQL with a PVC (StatefulSet, abbreviated)", lang: "yaml", code: `apiVersion: apps/v1
kind: StatefulSet
metadata: { name: db }
spec:
  serviceName: db
  replicas: 1
  selector: { matchLabels: { app: db } }
  template:
    metadata: { labels: { app: db } }
    spec:
      containers:
        - name: postgres
          image: postgres:16
          env:
            - name: POSTGRES_PASSWORD
              valueFrom: { secretKeyRef: { name: db-secret, key: password } }
            - name: PGDATA
              value: /var/lib/postgresql/data/pgdata
          volumeMounts: [{ name: data, mountPath: /var/lib/postgresql/data }]
  volumeClaimTemplates:
    - metadata: { name: data }
      spec:
        accessModes: [ReadWriteOnce]
        resources: { requests: { storage: 10Gi } }
---
apiVersion: v1
kind: Service
metadata: { name: db }
spec:
  clusterIP: None          # headless: like Swarm dnsrr, db-0.db resolves to the pod
  selector: { app: db }
  ports: [{ port: 5432 }]` },
        { t: "Ingress and a node drain", lang: "yaml", code: `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata: { name: shop }
spec:
  ingressClassName: nginx
  rules:
    - host: shop.example.com
      http:
        paths:
          - path: /api
            pathType: Prefix
            backend: { service: { name: api, port: { number: 8000 } } }
          - path: /
            pathType: Prefix
            backend: { service: { name: web, port: { number: 80 } } }
# Node maintenance (shell):
#   kubectl cordon node2                       # like Swarm pause
#   kubectl drain node2 --ignore-daemonsets    # like Swarm drain
#   kubectl uncordon node2` },
        { t: "On the node: Docker is not the runtime any more", lang: "sh", code: `# on a kind/kubeadm node
docker ps                      # (on the node) does NOT list Kubernetes pods
sudo crictl ps                 # CRI view of the same containers
sudo crictl images
sudo ctr -n k8s.io containers ls

# converting a Compose file as a starting point (review the output!)
kompose convert -f compose.yml`, out: `CONTAINER     IMAGE          CREATED        STATE    NAME   POD ID   POD
3f1c…         4b2d…          2 minutes ago  Running  api    9ab1…    api-7d9f8c6b5d-abcde` }
      ],
      internals: `<p><b>A Pod is a set of containers sharing namespaces.</b> When kubelet starts a Pod it first asks the runtime (over CRI gRPC, typically containerd's CRI plugin) to create a <b>pod sandbox</b>: a tiny "pause" container whose only job is to hold the network (and IPC/UTS) namespace. The CNI plugin (Calico, Cilium, Flannel…) gives that namespace an IP and routes. Each app container is then created by containerd → containerd-shim → runc <i>joining</i> the sandbox's namespaces, which is why containers in a Pod share <code>localhost</code> and port space. This is the same mechanism as <code>docker run --network container:&lt;id&gt;</code>.</p>
<p><b>Same kernel features underneath.</b> runc still creates pid/mnt/uts/ipc/user namespaces and cgroups; kubelet places Pods in a cgroup hierarchy by QoS class (Guaranteed, Burstable, BestEffort) derived from requests/limits. A memory limit breach is the same OOM kill you saw in Docker, reported as <code>OOMKilled</code>.</p>
<p><b>Images.</b> containerd pulls the same OCI manifests and layers from the same registries and unpacks them with its overlayfs snapshotter into <code>/var/lib/containerd</code> (not <code>/var/lib/docker</code>). Image caches are separate from any Docker Engine on the same machine.</p>
<p><b>Services.</b> A Service is not a process. The EndpointSlice controller keeps the list of ready Pod IPs; kube-proxy on every node watches it and writes iptables (or IPVS) rules that DNAT the ClusterIP to a Pod IP. CoreDNS answers <code>api.shop.svc.cluster.local</code>. NodePort adds rules on every node's IP, the functional cousin of Swarm's ingress mesh.</p>
<p><b>Reconciliation everywhere.</b> Every controller is a loop: watch objects through the API server, compare <code>spec</code> with <code>status</code>, act. A Deployment rollout is the Deployment controller scaling a new ReplicaSet up and the old one down within <code>maxSurge</code>/<code>maxUnavailable</code>, waiting on readiness. Old ReplicaSets are kept (scaled to 0, <code>revisionHistoryLimit</code> default 10) which is what <code>rollout undo</code> uses; Swarm keeps only one previous spec.</p>
<p><b>dockershim removal.</b> Before 1.24, kubelet → dockershim → dockerd → containerd → runc. Now kubelet → containerd (CRI) → runc: one less daemon, and nothing about images or the kernel changed.</p>`,
      prod: `<p><b>The shop on Kubernetes</b> (typically a managed cluster: EKS, GKE, AKS):</p>
<ul class="pts">
<li><b>web</b>: Deployment of the nginx image that serves the React build, 2+ replicas, Service ClusterIP.</li>
<li><b>api</b>: Deployment of the FastAPI image, readiness probe on <code>/health</code>, requests/limits, <code>maxUnavailable: 0</code> for zero-downtime rollouts, HorizontalPodAutoscaler on CPU, PodDisruptionBudget so node drains never take all replicas. A Job or init container runs Alembic migrations before the new version takes traffic.</li>
<li><b>redis</b>: a single Deployment for cache, or a managed Redis (ElastiCache/Memorystore) for anything important.</li>
<li><b>PostgreSQL</b>: almost always a managed database. If in-cluster, a StatefulSet with a PVC, or an operator (CloudNativePG, Zalando) that handles replication, failover and backups.</li>
<li><b>Ingress</b> (ingress-nginx or the cloud's controller) with cert-manager for TLS: <code>/</code> → web, <code>/api</code> → api.</li>
<li><b>Config</b>: ConfigMaps for non-secret config, Secrets from an external secret manager (External Secrets Operator, Vault) with etcd encryption at rest; RBAC so only CI can apply to <code>prod</code>.</li>
<li><b>Delivery</b>: CI builds with Docker/BuildKit, pushes an image tagged by git SHA, updates a Helm values file or Kustomize overlay; Argo CD/Flux (GitOps) applies it. The image is byte-for-byte what you tested with <code>docker compose</code> locally.</li>
</ul>
<p><b>Where it enters the architecture:</b> local dev and CI stay on Docker and Compose; Kubernetes replaces Compose/Swarm only at the "run many services on many machines" layer. A team of 3 with one product often does better with Compose on one VM or Swarm; a platform team running 50 services gets the most from Kubernetes.</p>`,
      iq: [
        ["dca", "Which Kubernetes object is the closest equivalent of a Swarm replicated service, and which of a global service?", "<p><b>Deployment</b> (which manages ReplicaSets) for replicated; <b>DaemonSet</b> for global (one Pod per eligible node). A ReplicaSet alone keeps a count but provides no rolling update; a StatefulSet is for stable identity and per-replica storage; a Pod alone is not self-healing.</p>"],
        ["dca", "Which Service type exposes an application on a static port on every node's IP?", "<p><b>NodePort</b> (default range 30000-32767). ClusterIP is internal only; LoadBalancer builds on NodePort and provisions an external load balancer through the cloud provider; ExternalName just returns a DNS CNAME.</p>"],
        ["dca", "How do you store a database password for a Pod, and is it encrypted?", "<p>A <b>Secret</b> (<code>kubectl create secret generic db-secret --from-literal=password=…</code>), consumed via <code>secretKeyRef</code> env or a volume mount. Values are only base64-encoded in the API; encryption at rest in etcd must be configured, and RBAC must restrict <code>get secrets</code>. A ConfigMap is for non-sensitive data. By contrast, Swarm secrets are encrypted in the Raft log by default.</p>"],
        ["dca", "Kubernetes removed dockershim. Do images built with <code>docker build</code> still run on new clusters?", "<p><b>Yes.</b> Docker produces standard OCI images; containerd and CRI-O run them unchanged. Only the node runtime changed: kubelet now talks CRI to containerd directly, so <code>docker ps</code> on a node doesn't show Pods (use <code>crictl</code>) and workloads that mount the node's Docker socket break.</p>"],
        ["dca", "Which command rolls a Deployment back to its previous version, and which shows progress of a rollout?", "<p><code>kubectl rollout undo deployment/api</code> (optionally <code>--to-revision=N</code>) and <code>kubectl rollout status deployment/api</code>. <code>kubectl rollout history</code> lists revisions. <code>kubectl delete</code> would remove it; <code>kubectl apply</code> of the old file also works but is not \"the rollback command\".</p>"],
        ["mid", "Two containers in the same Pod: how do they talk, and what do they share?", "<p>They share the Pod's network namespace (one IP, same port space), so they talk over <code>localhost</code>. They can share volumes (e.g., an <code>emptyDir</code>) and are scheduled together on one node. They do not share a filesystem by default, and each has its own resource limits. Containers in <i>different</i> Pods talk through a Service name.</p>"],
        ["mid", "What is the difference between a liveness and a readiness probe?", "<p>Failing <b>liveness</b> makes kubelet restart the container. Failing <b>readiness</b> removes the Pod from Service endpoints (no traffic) without restarting it. Docker's <code>HEALTHCHECK</code> is ignored by Kubernetes; you define probes in the Pod spec.</p>"],
        ["senior", "Give three reasons you would stay on Compose or Swarm instead of moving to Kubernetes.", "<p>Small team without platform engineers; few services that fit on one or a handful of hosts; simplicity (one binary, no separate control plane, no CNI/ingress/CSI choices, fewer moving parts to secure and upgrade). Kubernetes pays off with many services/teams, autoscaling, multi-tenant RBAC and the operator/GitOps ecosystem.</p>"],
        ["architect", "Map the shop's Compose file to Kubernetes objects.", "<p><code>web</code> → Deployment + ClusterIP Service; <code>api</code> → Deployment + Service + HPA + PDB; <code>redis</code> → Deployment + Service (or managed); <code>db</code> → StatefulSet + headless Service + PVC (or managed DB); <code>ports: 80:80</code> on nginx → Ingress + controller + LoadBalancer Service; <code>environment</code> → ConfigMap; secrets → Secret; healthcheck → probes; <code>deploy.resources</code> → requests/limits; named volume → PVC/StorageClass.</p>"]
      ],
      gotchas: [
        "<b>K8s Secrets are base64, not encryption.</b> Anyone with <code>get secret</code> RBAC, or etcd access without encryption at rest, can read them.",
        "<b>Docker HEALTHCHECK is ignored</b> by Kubernetes. Without a readiness probe, Pods receive traffic as soon as the container starts.",
        "<b>Pods are cattle.</b> Their IPs change on every restart; never hard-code Pod IPs, always use Service names (the same lesson as Compose service names).",
        "<b>Labels drive everything.</b> A Service whose <code>selector</code> doesn't match the Pod labels has no endpoints; traffic times out with no obvious error. <code>kubectl get endpointslices</code> shows it.",
        "<b>Local images and kind/minikube.</b> The cluster's containerd doesn't see images in your Docker Engine; use <code>kind load docker-image</code> / <code>minikube image load</code> or push to a registry, and avoid <code>imagePullPolicy: Always</code> for local tags.",
        "<b>No memory limit means BestEffort/Burstable.</b> Under node pressure those Pods are evicted first.",
        "<b>ENTRYPOINT/CMD vs command/args.</b> In a Pod spec, <code>command</code> overrides the image ENTRYPOINT and <code>args</code> overrides CMD, a frequent source of confusion."
      ],
      best: [
        "Build once with Docker, run everywhere: the same immutable image tag (git SHA) flows from Compose in dev to Kubernetes in prod.",
        "Always set readiness and liveness probes, resource requests and memory limits, and a PodDisruptionBudget for anything with replicas.",
        "Use Deployments for stateless services; use managed databases or operators for PostgreSQL instead of hand-rolled StatefulSets.",
        "Keep manifests in git and apply them through CI or GitOps, never ad-hoc <code>kubectl edit</code> in production.",
        "Enable etcd encryption at rest and RBAC least privilege; source Secrets from an external manager.",
        "Use namespaces per environment or team, with ResourceQuotas and NetworkPolicies."
      ],
      lab: [
        "Enable Kubernetes in Docker Desktop or run <code>kind create cluster</code>. Confirm with <code>kubectl get nodes -o wide</code> and note the CONTAINER-RUNTIME column says containerd.",
        "Deploy <code>traefik/whoami</code> (or your FastAPI image loaded with <code>kind load docker-image</code>) with the Deployment + Service above, 3 replicas. <code>kubectl port-forward svc/api 8000:8000</code> and curl it several times; see different Pod hostnames.",
        "Delete one Pod (<code>kubectl delete pod …</code>) and watch the ReplicaSet create a replacement with <code>kubectl get pods -w</code>.",
        "Roll to a non-existent image tag; watch <code>kubectl rollout status</code> hang with <code>ImagePullBackOff</code> while the old Pods keep serving (maxUnavailable 0). Then <code>kubectl rollout undo</code>.",
        "Create a Secret and ConfigMap, consume them as env vars, and <code>kubectl exec</code> in to print them. Decode the Secret with <code>base64 -d</code> to see it is not encrypted.",
        "Write a two-column table mapping each service in your Day 5 Compose file to Kubernetes objects.",
        "<b>Done when:</b> you have shown self-healing, a stuck rollout and an undo, and you can explain why <code>docker ps</code> on a node doesn't show your Pods."
      ],
      teach: `<p>"Kubernetes is an orchestrator like Swarm, but bigger. The control plane is an API server in front of etcd, a scheduler, and controllers that reconcile desired state; on each node, the kubelet asks containerd to run containers. Since dockershim was removed, Docker Engine isn't the runtime, but my Docker images run unchanged because they're OCI images."</p>
<p>"The smallest unit is a Pod, one or more containers sharing an IP. I don't create Pods directly; a Deployment keeps N of them and rolls updates through ReplicaSets, which I can undo with kubectl rollout undo. A Service gives Pods a stable name and IP: ClusterIP inside, NodePort on every node, LoadBalancer from the cloud, and an Ingress routes HTTP by host and path. Config goes in ConfigMaps, passwords in Secrets, which are only base64 unless I enable encryption. Compose is one host; Swarm is simple multi-host; Kubernetes is the platform when you have many services, many teams, and need autoscaling."</p>`
    }
  ],
  quiz: [
    { q: "A 3-manager swarm runs in one AWS region with managers in AZ-a, AZ-a and AZ-b. AZ-a has an outage. The API keeps serving traffic, but CI's <code>docker stack deploy</code> fails. What is happening and what should the layout have been?", ans: "Quorum is lost (1 of 3 managers left), so the control plane cannot commit changes; running tasks are unaffected.", why: "Quorum for 3 is 2. Put one manager in each of three AZs so that losing any single AZ leaves 2. To recover now, either wait for AZ-a, or run <code>docker swarm init --force-new-cluster --advertise-addr &lt;ip&gt;</code> on the AZ-b manager and promote two new managers in healthy AZs." },
    { q: "You run this update. Ten minutes later, one of three API tasks runs 1.5, two run 1.4, and <code>docker service inspect</code> shows UpdateStatus <i>paused</i>. Why, and what are your options?", code: "docker service update --image registry.example.com/shop/api:1.5 api", lang: "sh", ans: "The first new task failed within the monitor window; the default failure action is pause, leaving a mixed-version service.", why: "Check <code>docker service ps --no-trunc api</code> for the error (crash, failed health check, pull denied). Then either <code>docker service rollback api</code>, or fix and push 1.5.1 and update again. For next time, add <code>--update-failure-action rollback --update-monitor 30s</code> (or <code>failure_action: rollback</code> in the stack file)." },
    { q: "After a node failure, the <code>db</code> service (postgres:16 with a named volume <code>pgdata</code>, no constraints) was rescheduled to another worker. The API is up but all users and orders are gone. What happened?", ans: "The task started on a different node, where the local volume <code>pgdata</code> was created empty, so PostgreSQL initialised a fresh database.", why: "Named volumes with the default local driver exist per node. Pin stateful services with <code>--constraint node.labels.db==true</code>, use a shared-storage volume driver, or use a managed database. The original data is still on the failed node's disk under <code>/var/lib/docker/volumes/shop_pgdata</code> if the disk survives." },
    { q: "A Traefik service is published with <code>--publish published=443,target=443</code>. Access logs show every client IP as 10.0.0.x, breaking rate limiting. Fix it.", ans: "Publish in host mode as a global service: <code>--mode global --publish published=443,target=443,mode=host</code>.", why: "The ingress routing mesh SNATs traffic through the <code>ingress</code> network, so the original source IP is lost. Host mode binds directly on each node running a task and preserves the client IP; with global mode every node has one, and the external load balancer targets all nodes." },
    { q: "You must change the PostgreSQL password used by the API service without downtime. <code>docker secret update</code> does not exist. Give the sequence.", ans: "Create <code>db_password_v2</code>, change the password in PostgreSQL to accept the new one, then <code>docker service update --secret-rm db_password --secret-add source=db_password_v2,target=db_password api</code>, then remove the old secret.", why: "Secrets are immutable. Mounting the new secret at the old target path means the app code doesn't change; the update rolls through tasks one by one. If the DB only accepts one password at a time, use a second DB role (e.g., <code>app_v2</code>) during the cut-over so old and new tasks both work." },
    { q: "Your team moves the shop to Kubernetes. The api Pods are Running, but <code>curl http://api:8000</code> from the web Pod times out. <code>kubectl get endpointslices -l kubernetes.io/service-name=api</code> shows no endpoints. Most likely cause?", ans: "The Service's selector does not match the Pod labels (or the Pods are not Ready because the readiness probe fails).", why: "A Service only routes to Pods whose labels match its selector and that are Ready. Compare <code>kubectl get svc api -o yaml</code> selector with <code>kubectl get pods --show-labels</code>, and check <code>kubectl describe pod</code> for readiness probe failures. This is the Kubernetes equivalent of putting a container on the wrong Docker network." }
  ]
},
/* ===== Day 10 ===== */
{
  n: 10,
  title: "Architecture and DCA revision",
  goal: "<b>By the end of today</b> you can draw and build a horizontally scaled React → nginx → FastAPI ×3 → Redis → PostgreSQL system in Compose and Swarm, explain how it survives failures and deploys without downtime, and sit a full mock DCA exam with a clear plan for the weeks before the real one.",
  rev: [
    "Scale <b>stateless</b> services horizontally; keep state in Redis (sessions, cache) and PostgreSQL (truth). Any replica must be able to serve any request, so sticky sessions are a workaround, not a design.",
    "Health checks decide load-balancer membership: a replica that is starting, unhealthy or draining must not receive traffic. Rolling, blue-green and canary all depend on that, and on <b>backward-compatible database migrations</b> (expand → migrate → contract).",
    "Compose = one host, Swarm = simple multi-host with the routing mesh, Kubernetes = the platform for many services and teams. The same image flows through all three.",
    "DCA domains as commonly published (check the current guide): Orchestration 25%, Image creation/management/registry 20%, Installation and configuration 15%, Networking 15%, Security 15%, Storage and volumes 10%.",
    "DOMC questions show options one at a time and ask yes/no for each; judge every option on its own and don't go back. Read for qualifiers: <i>default</i>, <i>TWO</i>, <i>minimum</i>, <i>without downtime</i>."
  ],
  topics: [
    {
      id: "d10-architecture",
      title: "Real architecture: scaling stateless services behind a load balancer",
      lv: ["mid", "senior", "lead", "architect", "dca"],
      eli5: `<p>A busy bank branch with one cashier has a long queue, and if that cashier gets sick the branch closes. The fix is obvious: open three counters and put a <b>greeter at the door</b> who sends each customer to whichever counter is free. That greeter is the <b>load balancer</b>, the counters are your API <b>replicas</b>.</p>
<p>This only works if <i>any</i> cashier can serve <i>any</i> customer. If cashier 2 kept your paperwork in her own drawer, you would have to wait for her specifically (a <b>sticky session</b>), and if she went home your paperwork would be gone. So the bank keeps all paperwork in a shared filing room (<b>Redis</b> for quick notes, the <b>PostgreSQL</b> vault for the official records). Cashiers become interchangeable, or <b>stateless</b>.</p>
<p>The greeter also checks each counter's light: green means open, red means closed. A cashier who faints switches to red, the greeter stops sending people there, and the manager (the orchestrator) brings in a replacement. To renovate counters without closing the bank, you swap one counter at a time while the others keep serving: a <b>rolling deployment</b>.</p>`,
      what: `<p>This topic connects everything from the course to the system-design picture. The reference architecture:</p>
<ul class="pts">
<li><b>Client</b>: the React SPA, built to static files and served by nginx (or a CDN).</li>
<li><b>Load balancer / reverse proxy</b>: terminates TLS, serves static files, forwards <code>/api</code> to a pool of API replicas, removes unhealthy ones. nginx or Traefik in Compose; the Swarm routing mesh plus a proxy; a cloud LB (ALB/NLB, GCP LB) in front of the nodes.</li>
<li><b>API ×3</b>: identical FastAPI containers from one image. Stateless: no local session storage, no uploads on local disk, config from env/secrets.</li>
<li><b>Redis</b>: shared cache, sessions, rate-limit counters, short-lived locks, background job queue.</li>
<li><b>PostgreSQL</b>: the system of record; one primary (plus replicas/backups), reached through a connection pooler.</li>
</ul>
<h4>Horizontal scaling and statelessness</h4>
<ul class="pts">
<li><b>Vertical</b> scaling = a bigger machine (limited, needs downtime, single point of failure). <b>Horizontal</b> = more identical replicas behind a balancer (near-linear for stateless services, survives a replica loss).</li>
<li>A service is <b>stateless</b> when any replica can handle any request because everything that must survive the request lives elsewhere: sessions in Redis or in a signed token, files in object storage (S3), data in PostgreSQL, config in env/secrets.</li>
<li>Things that silently break statelessness: in-memory caches assumed to be global, file uploads written to the container's writable layer, in-process schedulers (cron inside every replica runs N times), WebSocket connection state, local rate limiters.</li>
</ul>
<h4>Sessions</h4>
<ul class="pts">
<li><b>Sticky sessions</b> (LB pins a client to a replica by cookie or IP hash): easy, but uneven load, and sessions are lost when that replica dies or is redeployed. Acceptable as a temporary crutch.</li>
<li><b>Shared session store</b>: session ID in a cookie, session data in Redis (with TTL). Any replica can read it. Redis becomes critical, so give it persistence or a managed service.</li>
<li><b>JWT / signed tokens</b>: the client carries signed claims; replicas verify with a shared key, no lookup needed. Trade-off: revocation is hard (short expiry plus refresh tokens, or a Redis deny-list).</li>
</ul>
<h4>Shared database and connection pooling</h4>
<ul class="pts">
<li>Every API replica opens a pool of connections (SQLAlchemy default pool_size 5 + max_overflow 10). 3 replicas × 4 workers × 15 = 180 connections, and PostgreSQL's <code>max_connections</code> defaults to 100. Scaling the API can take the database down.</li>
<li>Fixes: size pools deliberately; put <b>PgBouncer</b> (transaction pooling) between API and PostgreSQL so thousands of client connections share a few dozen server connections; read replicas for read-heavy endpoints.</li>
<li>The database does not scale horizontally like the API; it scales up, with replicas, with caching (Redis) in front, and eventually by sharding or a managed distributed SQL service.</li>
</ul>
<h4>Failure, restart and recovery</h4>
<ul class="pts">
<li><b>Process crash</b>: restart policy (<code>restart: unless-stopped</code> in Compose; Swarm/Kubernetes create a replacement task/Pod).</li>
<li><b>Hung process</b> (alive but not answering): only a <b>health check</b> catches it. Compose marks it unhealthy but does not restart it; Swarm replaces unhealthy tasks; Kubernetes restarts on liveness failure.</li>
<li><b>Host failure</b>: Compose can't help (single host). Swarm/Kubernetes reschedule onto healthy nodes, if capacity exists (N+1 sizing).</li>
<li><b>Dependency failure</b> (PostgreSQL restarting): APIs must retry with backoff, fail fast with 503, and not crash-loop. Startup must not assume the DB is up (<code>depends_on</code> with <code>condition: service_healthy</code> helps only at first start, on one host).</li>
</ul>
<h4>Health checks drive load-balancer membership</h4>
<ul class="pts">
<li>The LB only routes to members that pass checks: nginx passive checks (<code>max_fails</code>/<code>fail_timeout</code>), Traefik active health checks, Swarm VIP only includes healthy tasks, Kubernetes readiness removes Pods from endpoints, cloud LB target-group health checks.</li>
<li>Liveness ("restart me") and readiness ("send me traffic") are different questions. During shutdown an app should fail readiness, finish in-flight requests, then exit on SIGTERM within the stop grace period (<code>stop_grace_period</code>, default 10s in Docker).</li>
</ul>
<h4>Load balancing options</h4>
<table><tr><th>Where</th><th>Tool</th><th>Notes</th></tr>
<tr><td>Compose, one host</td><td>nginx/HAProxy/Traefik container</td><td>nginx resolves <code>api</code> to all replica IPs via Docker DNS; Traefik discovers containers by labels.</td></tr>
<tr><td>Swarm</td><td>VIP + IPVS, ingress routing mesh</td><td>L4 round robin, built-in; add Traefik/nginx for L7 (paths, TLS, headers).</td></tr>
<tr><td>Kubernetes</td><td>Service (kube-proxy), Ingress controller</td><td>L4 Service + L7 Ingress/Gateway.</td></tr>
<tr><td>Cloud</td><td>ALB/NLB, GCP/Azure LB</td><td>In front of nodes; health checks against a node port or the proxy.</td></tr></table>
<h4>Zero-downtime deployment strategies</h4>
<ul class="pts">
<li><b>Rolling</b>: replace replicas a batch at a time (Swarm <code>update_config</code>, K8s <code>maxSurge/maxUnavailable</code>). Old and new versions run side by side for a while: APIs and DB schema must be compatible both ways.</li>
<li><b>Blue-green</b>: run the full new stack (green) next to the old (blue), test it, then switch the LB in one step; instant rollback by switching back. Costs double capacity during the switch.</li>
<li><b>Canary</b>: send a small share (5%) of traffic to the new version, watch error rates and latency, then widen. Needs an L7 router that can weight traffic (Traefik weighted services, Ingress controllers, service mesh) or replica ratios (1 canary among 10).</li>
</ul>
<h4>Database migrations in deployments</h4>
<ul class="pts">
<li>Run migrations <b>once</b>, as a separate step (a one-off <code>docker compose run --rm api alembic upgrade head</code>, a Swarm <code>replicated-job</code>, a Kubernetes Job), never in every replica's startup (N replicas race).</li>
<li><b>Expand → migrate → contract</b>: add new columns/tables (nullable or with defaults) first; deploy code that writes both and reads new; backfill; deploy code that only uses new; drop old columns in a later release. Every step is compatible with the version before it, so rolling updates and rollbacks are safe.</li>
<li>Avoid long locks: <code>CREATE INDEX CONCURRENTLY</code>, batch backfills, add constraints as <code>NOT VALID</code> then validate.</li>
</ul>
<h4>Registries and CI/CD</h4>
<ul class="pts">
<li>Pipeline: test → <code>docker build</code> (BuildKit, cache from registry) → scan → tag with git SHA (plus semver) → push → deploy that exact tag/digest → smoke test → promote. Never rebuild per environment; promote the same digest from staging to prod.</li>
<li>Deploy step: <code>docker compose pull &amp;&amp; docker compose up -d</code> on one host, <code>docker stack deploy</code> on Swarm, <code>kubectl apply</code>/Helm/GitOps on Kubernetes.</li>
</ul>
<h4>Compose limits and where Kubernetes enters</h4>
<ul class="pts">
<li>Compose on one VM is a legitimate production setup for small systems: simple, cheap, easy to reason about. Its ceiling: one host is a single point of failure, scaling is bounded by that host, <code>docker compose up -d</code> recreates containers (brief downtime unless you add a proxy-based dance), no cross-host networking, no scheduler.</li>
<li>Swarm lifts the single-host limit with almost no new concepts. Kubernetes enters when you need autoscaling, many teams/services, multi-tenant RBAC, a rich ecosystem (operators, service mesh, GitOps), or a cloud-managed control plane.</li>
</ul>`,
      why: `<p>Docker on its own answers "how do I package and run this process consistently". System design asks a different question: "how does this keep working when traffic grows ten times, when a machine dies at 3 a.m., and when we deploy twenty times a day?" Interviews for mid and senior roles live at this intersection: they expect you to draw the boxes <i>and</i> explain which Docker, Compose, Swarm or Kubernetes feature implements each arrow.</p>
<p>Before containers, scaling meant cloning VMs from golden images, hand-editing HAProxy backend lists, and deploys that took the site down "for maintenance". Containers made replicas cheap and identical; orchestrators made placement, health and rollout automatic. But they cannot fix an application that keeps state in memory or a migration that locks the main table for ten minutes. This topic is about those design decisions.</p>`,
      diagram: {
        html: flow([["Users", "browser runs React SPA", "w"], ["Load balancer", "cloud LB / nginx / Traefik, TLS, health checks", "g"], ["API ×3", "FastAPI replicas, stateless, same image", "g"], ["Redis", "sessions, cache, rate limits, queue"], ["PgBouncer", "transaction pooling"], ["PostgreSQL", "primary + backups / replica", "r"]]) + lanes([
          ["Failure handling", ["replica crash → restart / new task", "replica hang → health check fails → removed from LB", "host dies → Swarm/K8s reschedule (Compose cannot)", "DB restart → API retries with backoff, returns 503"]],
          ["Deploy", ["CI builds image :sha, pushes", "migration job: expand step", "rolling update start-first, monitor, auto-rollback", "contract migration next release"]],
          ["Scale", ["API: add replicas (horizontal)", "Redis: memory, replicas", "PostgreSQL: bigger instance, read replicas, pooling", "LB: managed, scales itself"]]
        ]),
        steps: [
          "A request from the React app arrives at the load balancer, which terminates TLS, serves static assets and forwards <code>/api/*</code> to one API replica that is currently passing its health check.",
          "The API replica reads the session (Redis key or JWT), checks the cache in Redis, and on a miss queries PostgreSQL through PgBouncer; it stores nothing locally, so the next request can go to any other replica.",
          "If a replica crashes or its health check fails, the LB stops sending it traffic and the orchestrator replaces it; the other replicas absorb the load because the system is sized N+1.",
          "On deploy, a migration job applies a backward-compatible schema change, then replicas are replaced one at a time (start-first), each joining the pool only when healthy; failure during the monitor window triggers rollback."
        ]
      },
      cmds: [
        { t: "Compose: nginx load-balancing 3 FastAPI replicas + Redis + PostgreSQL (compose.yml)", lang: "yaml", code: `name: shop
services:
  lb:
    image: nginx:1.27-alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
      - ./web-dist:/usr/share/nginx/html:ro          # React build output
    depends_on:
      api:
        condition: service_healthy
    restart: unless-stopped
    networks: [frontend]

  api:
    image: registry.example.com/shop/api:\${API_TAG:-1.5}
    # no ports: only nginx reaches it
    environment:
      DATABASE_URL: postgresql+psycopg://app@pgbouncer:6432/shop
      REDIS_URL: redis://redis:6379/0
      SESSION_BACKEND: redis
    secrets: [db_password]
    healthcheck:
      test: ["CMD", "python", "-c", "import urllib.request; urllib.request.urlopen('http://localhost:8000/health', timeout=2)"]
      interval: 10s
      timeout: 3s
      retries: 3
      start_period: 20s
    deploy:
      replicas: 3
      resources:
        limits: { cpus: "0.50", memory: 512M }
    restart: unless-stopped
    networks: [frontend, backend]

  migrate:
    image: registry.example.com/shop/api:\${API_TAG:-1.5}
    command: ["alembic", "upgrade", "head"]
    environment:
      DATABASE_URL: postgresql+psycopg://app@db:5432/shop
    secrets: [db_password]
    depends_on:
      db: { condition: service_healthy }
    profiles: ["ops"]                               # run explicitly, once
    networks: [backend]

  redis:
    image: redis:7-alpine
    command: ["redis-server", "--appendonly", "yes"]
    volumes: [redisdata:/data]
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
    restart: unless-stopped
    networks: [backend]

  pgbouncer:
    image: edoburu/pgbouncer:latest   # pin a specific version in real use
    environment:
      DB_HOST: db
      DB_USER: app
      POOL_MODE: transaction
      MAX_CLIENT_CONN: "500"
      DEFAULT_POOL_SIZE: "20"
    depends_on:
      db: { condition: service_healthy }
    networks: [backend]

  db:
    image: postgres:16
    environment:
      POSTGRES_USER: app
      POSTGRES_DB: shop
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
    secrets: [db_password]
    volumes: [pgdata:/var/lib/postgresql/data]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app -d shop"]
      interval: 5s
      retries: 10
    restart: unless-stopped
    networks: [backend]

networks:
  frontend: {}
  backend: { internal: true }        # no outbound internet for the data tier
volumes:
  pgdata: {}
  redisdata: {}
secrets:
  db_password:
    file: ./secrets/db_password.txt`, note: `<p>Compose v2 honours <code>deploy.replicas</code>, giving <code>shop-api-1..3</code>. The API has no <code>ports:</code>, so you can scale it without host-port conflicts. The <code>backend</code> network is <code>internal</code>; the API reaches PostgreSQL only through it. Credentials are wired loosely here (the pgbouncer image needs the password via its own env/auth file); adapt to your pooler image. The <code>\${API_TAG}</code> is Compose interpolation from <code>.env</code>.</p>` },
        { t: "nginx.conf: upstream over Docker DNS, passive health, SPA fallback", lang: "text", code: `upstream api_pool {
    # "api" resolves (via 127.0.0.11) to all 3 replica IPs when nginx starts
    server api:8000 max_fails=3 fail_timeout=10s;
    keepalive 32;
}

server {
    listen 80;

    location /api/ {
        proxy_pass http://api_pool;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Request-ID $request_id;
        proxy_next_upstream error timeout http_502 http_503;
    }

    location / {
        root /usr/share/nginx/html;
        try_files $uri /index.html;        # React router fallback
    }
}`, note: `<p>nginx resolves upstream names <b>once at startup</b>. After <code>docker compose up -d --scale api=5</code> you must <code>docker compose exec lb nginx -s reload</code>, or use Traefik (label-based discovery) or a <code>resolver 127.0.0.11 valid=10s;</code> with a variable in <code>proxy_pass</code>.</p>` },
        { t: "Operate the Compose version", lang: "sh", code: `docker compose up -d
docker compose --profile ops run --rm migrate          # migrations, once
docker compose ps
for i in $(seq 1 6); do curl -s localhost/api/whoami; echo; done   # different replica hostnames

docker compose up -d --scale api=5 --no-recreate
docker compose exec lb nginx -s reload

# kill one replica: nginx retries on the next, restart policy brings it back
docker kill shop-api-2
docker compose ps api`, out: `NAME          IMAGE                                 SERVICE   STATUS
shop-api-1    registry.example.com/shop/api:1.5     api       Up 2 minutes (healthy)
shop-api-2    registry.example.com/shop/api:1.5     api       Up 3 seconds (health: starting)
shop-api-3    registry.example.com/shop/api:1.5     api       Up 2 minutes (healthy)` },
        { t: "Swarm stack version (stack.yml)", lang: "yaml", code: `services:
  lb:
    image: registry.example.com/shop/lb:1.0          # nginx + nginx.conf + React build baked in
    ports:
      - target: 80
        published: 80
        mode: ingress                                # routing mesh: any node answers
    networks: [frontend]
    deploy:
      replicas: 2
      update_config: { parallelism: 1, order: start-first }

  api:
    image: registry.example.com/shop/api:1.5
    environment:
      DATABASE_URL: postgresql+psycopg://app@pgbouncer:6432/shop
      REDIS_URL: redis://redis:6379/0
    secrets: [db_password]
    networks: [frontend, backend]
    healthcheck:
      test: ["CMD", "python", "-c", "import urllib.request; urllib.request.urlopen('http://localhost:8000/health', timeout=2)"]
      interval: 10s
      retries: 3
      start_period: 20s
    stop_grace_period: 30s
    deploy:
      replicas: 3
      resources:
        limits: { cpus: "0.50", memory: 512M }
        reservations: { memory: 256M }
      restart_policy: { condition: any, delay: 5s }
      update_config:
        parallelism: 1
        delay: 10s
        monitor: 30s
        failure_action: rollback
        order: start-first
      rollback_config: { parallelism: 0, order: stop-first }
      placement:
        max_replicas_per_node: 1
        preferences: [{ spread: node.labels.zone }]

  redis:
    image: redis:7-alpine
    command: ["redis-server", "--appendonly", "yes"]
    volumes: [redisdata:/data]
    networks: [backend]
    deploy:
      placement: { constraints: [node.labels.cache == true] }

  pgbouncer:
    image: edoburu/pgbouncer:latest   # pin a version in real use
    environment: { DB_HOST: db, DB_USER: app, POOL_MODE: transaction }
    networks: [backend]
    deploy: { replicas: 2 }

  db:
    image: postgres:16
    environment:
      POSTGRES_USER: app
      POSTGRES_DB: shop
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
    secrets: [db_password]
    volumes: [pgdata:/var/lib/postgresql/data]
    networks: [backend]
    deploy:
      replicas: 1
      update_config: { order: stop-first }           # never two Postgres on one data dir
      placement: { constraints: [node.labels.db == true] }

networks:
  frontend: { driver: overlay }
  backend: { driver: overlay, driver_opts: { encrypted: "true" } }
volumes:
  pgdata: {}
  redisdata: {}
secrets:
  db_password: { external: true }`, note: `<p>Differences from Compose: no <code>build</code> or bind-mounted config (bake it into the image or use <code>configs:</code>), no <code>depends_on</code> ordering (the API must retry), overlays instead of bridges, placement for stateful services, and nginx can simply proxy to <code>api:8000</code>, the service VIP, so scaling needs no nginx reload.</p>` },
        { t: "Deploy, scale and roll on Swarm", lang: "sh", code: `printf 'change-me' | docker secret create db_password -
docker node update --label-add db=true wrk3
docker node update --label-add cache=true wrk2
docker stack deploy -c stack.yml --with-registry-auth shop

# migration as a one-off job (engines with job support)
docker service create --name shop_migrate --mode replicated-job \\
  --network shop_backend --secret db_password \\
  -e DATABASE_URL=postgresql+psycopg://app@db:5432/shop \\
  registry.example.com/shop/api:1.6 alembic upgrade head

# then roll the API
docker service update --image registry.example.com/shop/api:1.6 shop_api
docker service ps shop_api
docker service scale shop_api=6` },
        { t: "Blue-green on one host with Compose projects and a proxy switch", lang: "sh", code: `# green next to blue, attached to the same external network as the proxy
docker compose -p shop-green -f compose.app.yml up -d
curl -fsS http://shop-green-api-1:8000/health     # from a debug container on that network

# switch the upstream and reload the proxy (Traefik: change the router's service)
sed -i 's/shop-blue-api/shop-green-api/' nginx.conf
docker compose -p edge exec lb nginx -s reload

# rollback = switch back; later remove blue
docker compose -p shop-blue -f compose.app.yml down` },
        { t: "CI/CD pipeline (GitHub Actions excerpt)", lang: "yaml", code: `jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: docker/login-action@v3
        with: { registry: registry.example.com, username: ci, password: "\${{ secrets.REGISTRY_TOKEN }}" }
      - uses: docker/build-push-action@v6
        with:
          context: ./api
          push: true
          tags: registry.example.com/shop/api:\${{ github.sha }}
          cache-from: type=registry,ref=registry.example.com/shop/api:buildcache
          cache-to: type=registry,ref=registry.example.com/shop/api:buildcache,mode=max
      - name: Deploy to Swarm over SSH
        env: { DOCKER_HOST: "ssh://deploy@mgr1.example.com" }
        run: |
          API_TAG=\${{ github.sha }} docker stack deploy -c stack.yml --with-registry-auth shop` }
      ],
      internals: `<p><b>Compose load balancing.</b> Compose creates one container per replica, all attached to the project network with the network alias <code>api</code>. Docker's embedded DNS (127.0.0.11, answered by dockerd for each container's namespace) returns <i>all</i> replica IPs for <code>api</code>, in rotating order. nginx resolves those once at startup and balances itself; there is no VIP. A dead replica's IP stays in nginx's list until reload; <code>max_fails</code> and <code>proxy_next_upstream</code> paper over it.</p>
<p><b>Swarm load balancing.</b> Each service gets a VIP; inside every container's network namespace, IPVS rules map VIP:port to the IPs of <i>healthy</i> tasks, updated by the engine as tasks come and go. Published ports go through the <code>ingress</code> network and the <code>ingress-sbox</code> namespace's IPVS. That is why scaling or replacing an API task needs no proxy reload in Swarm.</p>
<p><b>Health and membership.</b> dockerd runs the health check command inside the container's namespaces (like <code>docker exec</code>) at each interval and stores the last results in the container state (<code>docker inspect --format '{{json .State.Health}}'</code>). Compose only uses the status for <code>depends_on: condition: service_healthy</code>. SwarmKit's executor reads it: a task does not count as running until healthy, and an unhealthy task is shut down and replaced.</p>
<p><b>Graceful shutdown.</b> On stop or update, Docker sends <code>STOPSIGNAL</code> (SIGTERM by default) to PID 1, waits the grace period, then SIGKILL. If PID 1 is a shell that doesn't forward signals, uvicorn never sees SIGTERM and in-flight requests are cut after the timeout: use exec-form <code>CMD</code> or <code>--init</code>. In Swarm, the task is removed from the VIP before the signal is sent, so new connections stop arriving first.</p>
<p><b>Connections.</b> Each API worker's SQLAlchemy pool keeps TCP connections to PgBouncer; PgBouncer multiplexes transactions onto a small pool of PostgreSQL backends (each one a full OS process with its own memory, which is why Postgres connections are expensive).</p>`,
      prod: `<p>A realistic progression for the shop:</p>
<ul class="pts">
<li><b>Stage 1, one VM with Compose</b>: the compose file above, nightly <code>pg_dump</code> to object storage, Caddy/nginx with Let's Encrypt. Good for an MVP; deploys cause a few seconds of 502s unless you scale up before recreating.</li>
<li><b>Stage 2, managed data</b>: move PostgreSQL to RDS/Cloud SQL and Redis to a managed service; the VMs become cattle. This one change removes most of the operational risk.</li>
<li><b>Stage 3, multiple hosts</b>: Swarm across 3 managers + N workers behind a cloud LB, or a managed Kubernetes cluster. API autoscaling (K8s HPA), canaries via the ingress controller, GitOps.</li>
</ul>
<p>Cross-cutting concerns at every stage: <b>observability</b> (structured JSON logs to stdout shipped by a log driver or agent, request IDs propagated from nginx through FastAPI, metrics endpoint scraped by Prometheus, alerts on 5xx rate and p95 latency); <b>capacity</b> (N+1 replicas so a node loss doesn't overload the rest); <b>backups and restore drills</b> for PostgreSQL; <b>security</b> (non-root images, internal backend network, secrets not env vars, scanned images).</p>
<p>The famous "FastAPI connects to <code>localhost:5432</code> and fails" lesson scales up here: in every topology the API reaches its dependencies by <b>service name</b> (<code>pgbouncer</code>, <code>redis</code>, <code>db</code>) through DNS on a shared network, never <code>localhost</code>, never container IPs.</p>`,
      iq: [
        ["architect", "Draw and explain a horizontally scalable architecture for a FastAPI app with Redis and PostgreSQL.", "<p>LB (TLS, health checks) → N stateless FastAPI replicas (same image, no local state) → Redis (sessions, cache, rate limits) and PgBouncer → PostgreSQL primary with backups/replica. Explain: any replica serves any request; health checks gate membership; the orchestrator replaces failed replicas; deploys roll one replica at a time with backward-compatible migrations; the DB scales vertically/read replicas and is protected by pooling and caching.</p>"],
        ["senior", "Sticky sessions vs a Redis session store vs JWT?", "<p>Sticky: simplest but uneven load and lost sessions on replica death or deploy. Redis store: replicas interchangeable, server-side revocation, Redis becomes critical. JWT: no lookup, scales trivially, but revocation needs short TTLs plus refresh or a deny-list, and tokens grow. Common choice: short-lived JWT access tokens + refresh tokens in Redis, or server sessions in Redis.</p>"],
        ["senior", "You scaled the API from 3 to 10 replicas and PostgreSQL started refusing connections. Why and how do you fix it?", "<p>Each replica (times workers) opens its own pool; total connections exceeded <code>max_connections</code> (default 100). Fix: PgBouncer in transaction mode, smaller per-process pools, read replicas for heavy reads, and capacity math in the scaling plan. Raising <code>max_connections</code> a lot just trades the error for memory pressure.</p>"],
        ["dca", "In a Swarm stack, how do you ensure an API task only receives traffic after it is ready, and that a broken release reverts automatically?", "<p>Give the service a <code>healthcheck</code> (tasks join the VIP only when healthy) and set <code>deploy.update_config</code> with <code>monitor: 30s</code> and <code>failure_action: rollback</code> (optionally <code>order: start-first</code>). <code>restart_policy</code> alone restarts failed tasks but doesn't gate traffic or revert versions; <code>depends_on</code> is ignored by <code>docker stack deploy</code>.</p>"],
        ["dca", "Which publish mode keeps the client's source IP for a Swarm service, and what is the trade-off?", "<p><code>mode=host</code>. It binds only on nodes running a task and bypasses the routing mesh, so the source IP is preserved, but you lose any-node access and can run only one task per node per published port (usually paired with <code>--mode global</code> and an external LB). The default <code>ingress</code> mode SNATs.</p>"],
        ["lead", "How do you run a column rename on a live table with rolling deployments?", "<p>Expand/contract: release 1 adds the new column and code writes both, reads old; backfill in batches; release 2 reads new; release 3 stops writing old; release 4 drops old. Each release is compatible with its predecessor, so mixed versions during a rolling update and a rollback both work. Never <code>ALTER TABLE … RENAME COLUMN</code> in the same deploy that changes the code.</p>"],
        ["mid", "Why can't you just add <code>ports: \"8000:8000\"</code> to the API and scale it to 3 in Compose?", "<p>All three replicas would try to bind host port 8000; the second fails with \"port is already allocated\". Put a proxy (nginx/Traefik) in front with the only published port and leave the API unpublished, or publish a range / random ports (<code>\"8000\"</code> lets Docker choose host ports).</p>"],
        ["senior", "Compare rolling, blue-green and canary deployments.", "<p>Rolling: in-place batch replacement, no extra capacity, mixed versions during rollout, rollback is another rolling update. Blue-green: full parallel environment, atomic switch and instant rollback, double cost, DB must serve both. Canary: small traffic share to the new version, data-driven promotion, needs weighted routing and good metrics. All require health-gated LB membership and compatible schemas.</p>"],
        ["architect", "When is Compose on one VM the right production answer?", "<p>Low traffic, a small team, tolerance for minutes of downtime on host failure (with good backups and an automated rebuild), and a desire to minimise operational complexity. Moving data to managed services removes most of the risk. Move to Swarm/Kubernetes when you need host-failure tolerance, more capacity than one VM, or zero-downtime deploys as a hard requirement.</p>"]
      ],
      gotchas: [
        "<b>nginx caches DNS.</b> With Compose, scaling the API without reloading nginx means new replicas get no traffic and removed ones cause errors.",
        "<b>Migrations at startup</b> in every replica race each other and can lock tables during a rolling update. Run them once, as a job.",
        "<b>In-process cron/schedulers</b> run once per replica. Use one dedicated worker service, a Swarm replicated-job, or a K8s CronJob, or a Redis lock.",
        "<b>Health checks that call the database</b> make every replica fail at once when the DB blips, removing all capacity. Keep liveness local; make readiness tolerant.",
        "<b>start-first needs headroom.</b> With memory reservations near node capacity, the new task can't be scheduled and the update stalls in Pending.",
        "<b>Shell-form CMD</b> (<code>CMD uvicorn main:app</code>) puts <code>/bin/sh</code> at PID 1; SIGTERM never reaches uvicorn, so every deploy kills in-flight requests after 10s.",
        "<b>Uploads on local disk</b> disappear when the replica is replaced and are invisible to other replicas. Use object storage or a shared volume."
      ],
      best: [
        "Design every service to be stateless and disposable; push state to Redis, PostgreSQL and object storage.",
        "One image per commit, tagged by git SHA, promoted through environments unchanged.",
        "Health checks on every service, separate liveness and readiness semantics, graceful SIGTERM handling with exec-form CMD.",
        "Expand/contract migrations run once as a job before the rolling update.",
        "Pool database connections (PgBouncer) and do the connection arithmetic before scaling.",
        "Size for N+1 and spread replicas across nodes and zones; prefer managed databases.",
        "Only the load balancer publishes ports; data tier on an internal/encrypted network."
      ],
      lab: [
        "Build a tiny FastAPI image with <code>/health</code> and <code>/api/whoami</code> (returns <code>socket.gethostname()</code>) and a counter stored in Redis.",
        "Bring up the Compose file above (you can drop PgBouncer at first). Curl <code>/api/whoami</code> 6 times and see 3 different hostnames; the Redis counter keeps increasing regardless of replica.",
        "<code>docker kill shop-api-2</code> while running a loop of curls (<code>while true; do curl -s -o /dev/null -w '%{http_code}\\n' localhost/api/whoami; sleep 0.2; done</code>). Note whether any non-200 appears and how restart brings it back.",
        "Scale to 5 without reloading nginx; observe that new replicas get no traffic. Reload nginx and confirm.",
        "Deploy the stack version on a 3-node swarm, roll to a new tag with <code>start-first</code> while the curl loop runs: zero non-200 responses expected. Then roll to a broken tag and watch the automatic rollback.",
        "<b>Done when:</b> you can show (with the curl loop output) a replica failure and a rolling deploy with no failed requests on Swarm, and explain why Compose behaved differently."
      ],
      teach: `<p>"Here's the shop: a load balancer in front, three identical FastAPI containers, Redis and PostgreSQL behind. The API is stateless: sessions are in Redis or in a JWT, files in object storage, data in Postgres, so the load balancer can send any request to any replica. The load balancer only sends traffic to replicas that pass their health check; if one crashes or hangs it's removed and the orchestrator starts a new one."</p>
<p>"Scaling the API is just more replicas, but each one opens database connections, so I put PgBouncer in front of Postgres. Deploys are rolling: one replica at a time, start the new one first, watch it, roll back automatically if it fails. That only works if the schema is compatible with both versions, so migrations are expand-then-contract and run once as a job. In Compose I do this on one host with nginx; in Swarm the routing mesh and VIP do the balancing across hosts; Kubernetes is where I'd go for autoscaling and many teams."</p>`
    },
    {
      id: "d10-dca-revision",
      title: "DCA exam map, terminology and rapid-fire revision",
      lv: ["fresher", "mid", "dca"],
      eli5: `<p>Revising for a certification is like packing for a trip with a checklist. You don't re-read every guidebook; you go through the list (passport, charger, tickets) and check each one off, paying extra attention to the things you always forget.</p>
<p>The DCA's list has six sections, and they are not equal. Orchestration is the biggest suitcase. Storage is the smallest. If you spend your last week polishing Dockerfile tricks and skip Swarm quorum, you packed three toothbrushes and no passport.</p>
<p>This topic is the checklist: the domains and their weights, the words you must be able to define in one sentence, the commands you must type without thinking, and the traps the exam sets on purpose.</p>`,
      what: `<h4>The exam at a glance (as commonly published; check the current official exam guide before booking)</h4>
<ul class="pts">
<li>The Docker Certified Associate is administered by <b>Mirantis</b> (which acquired Docker Enterprise). It is commonly reported as <b>about 55 questions in 90 minutes</b>, online proctored, mixing standard multiple choice and <b>DOMC</b> (Discrete Option Multiple Choice). Passing score, exact counts, price and retake rules change: confirm on the official page.</li>
<li>It tests a practitioner who has used Docker for months: Engine and Swarm administration more than application code, with Kubernetes essentials and enterprise features (UCP/DTR, now Mirantis Kubernetes Engine / Mirantis Secure Registry) at the concept level.</li>
</ul>
<h4>Domain map (consistent with the course home page)</h4>
<table><tr><th>Domain</th><th>Weight*</th><th>Course days</th><th>What to know cold</th></tr>
<tr><td>Orchestration</td><td>25%</td><td>9, 10</td><td>Swarm init/join, managers and workers, Raft quorum, services, stacks, scaling, rolling updates, placement, secrets/configs, Kubernetes basics</td></tr>
<tr><td>Image creation, management and registry</td><td>20%</td><td>2, 6, 7</td><td>Dockerfile instructions, multi-stage builds, tagging, inspect/history, pruning, pushing/pulling, registries, signing</td></tr>
<tr><td>Installation and configuration</td><td>15%</td><td>1, 6, 8</td><td>Engine install, daemon.json, storage and logging drivers, contexts, rootless, enterprise components</td></tr>
<tr><td>Networking</td><td>15%</td><td>3, 9</td><td>bridge/host/none/overlay/macvlan, DNS, publishing, routing mesh, troubleshooting connectivity</td></tr>
<tr><td>Security</td><td>15%</td><td>7, 9</td><td>capabilities, seccomp, AppArmor, user namespaces, Content Trust, secrets, RBAC concepts, mutually-authenticated TLS in Swarm</td></tr>
<tr><td>Storage and volumes</td><td>10%</td><td>4, 8</td><td>volumes vs bind mounts vs tmpfs, volume drivers, storage drivers, persistence, cleanup</td></tr></table>
<p class="note">*Weights as commonly published. With ~55 questions, 25% is roughly 13-14 orchestration questions and 10% roughly 5-6 storage questions.</p>
<h4>DOMC: how it works and how to approach it</h4>
<ul class="pts">
<li>A DOMC item shows the question stem and then <b>one option at a time</b>; you answer YES (this option is correct) or NO. The item may end as soon as your answers determine the result, so you might see only one or two options. You typically cannot go back to an earlier option.</li>
<li>Strategy: <b>predict the answer before options appear</b>; judge each option on its own merits, not relative to the others; watch for options that are <i>almost</i> right (right command, wrong flag; right idea, wrong default). Don't assume there must be a "better" option coming.</li>
<li>For multi-select ("Which TWO…") in standard multiple choice, eliminate certainly-wrong options first; exactly the requested number are correct.</li>
<li>Time: about 1.5 minutes per question. Flag-and-return is limited or unavailable for DOMC, so decide and move on.</li>
</ul>
<h4>Terminology checklist (define each in one sentence)</h4>
<ul class="pts">
<li><b>Engine/runtime:</b> dockerd, containerd, containerd-shim, runc, OCI (image/runtime/distribution specs), namespaces (pid, net, mnt, uts, ipc, user, cgroup), cgroups, CRI, dockershim.</li>
<li><b>Images:</b> layer, image manifest, manifest list / image index (multi-arch), digest vs tag, dangling image, build context, <code>.dockerignore</code>, BuildKit, multi-stage, build cache, <code>ENTRYPOINT</code> vs <code>CMD</code>, exec vs shell form, <code>ARG</code> vs <code>ENV</code>, <code>ONBUILD</code>, <code>HEALTHCHECK</code>.</li>
<li><b>Registry:</b> repository, namespace, Docker Hub official images, private registry (<code>registry:2</code>), insecure registry, Docker Content Trust (Notary, signing keys: root, repository/targets, delegation), MSR/DTR.</li>
<li><b>Config:</b> daemon.json, storage driver (overlay2), logging driver (json-file default, local, journald, syslog, fluentd, awslogs…), log rotation opts, live-restore, contexts, rootless mode, systemd drop-ins.</li>
<li><b>Networking:</b> default bridge vs user-defined bridge, embedded DNS 127.0.0.11, host, none, overlay, macvlan/ipvlan, ingress, docker_gwbridge, routing mesh, VIP vs dnsrr, published vs exposed ports, iptables DOCKER chains.</li>
<li><b>Security:</b> capabilities, <code>--privileged</code>, seccomp profile, AppArmor/SELinux, user namespace remapping, rootless, <code>no-new-privileges</code>, read-only rootfs, DCT, secrets, mTLS, CA rotation, autolock, RBAC (subjects, roles, grants, collections in MKE/UCP), docker group = root.</li>
<li><b>Storage:</b> named volume, anonymous volume, bind mount, tmpfs, volume driver/plugin, storage driver, copy-on-write, writable layer, <code>-v</code> vs <code>--mount</code> semantics.</li>
<li><b>Orchestration:</b> service, task, replicated/global, desired state, Raft, quorum, leader, join token, availability (active/pause/drain), constraint, placement preference, stack, update/rollback config, secret, config; Pod, Deployment, ReplicaSet, DaemonSet, StatefulSet, Service types, Ingress, ConfigMap, Secret, PVC, namespace.</li>
</ul>
<h4>Common traps</h4>
<ul class="pts">
<li><b>Defaults</b>: default network is <code>bridge</code> (no name DNS); default logging driver <code>json-file</code>; default storage driver <code>overlay2</code>; default update failure action <code>pause</code>; default update order <code>stop-first</code>; default publish mode <code>ingress</code>; default endpoint mode <code>vip</code>; default restart policy <code>no</code>.</li>
<li><b>Which node</b>: service/node/secret/stack commands run on a <b>manager</b>; workers can't.</li>
<li><b>-v vs --mount</b>: <code>-v /missing/path:/data</code> creates the host directory; <code>--mount type=bind,src=/missing/path</code> errors.</li>
<li><b>export vs save</b>: <code>docker save</code>/<code>load</code> = images with layers and metadata; <code>docker export</code>/<code>import</code> = a container's flattened filesystem, no history, no CMD.</li>
<li><b>prune scope</b>: <code>docker image prune</code> = dangling only; <code>-a</code> = all unused. <code>docker system prune</code> doesn't remove volumes unless <code>--volumes</code>. Recent engines' <code>docker volume prune</code> removes only anonymous volumes unless <code>--all</code>.</li>
<li><b>-p vs -P vs EXPOSE</b>: <code>EXPOSE</code> documents only; <code>-P</code> publishes all exposed ports to random host ports; <code>-p</code> maps explicitly.</li>
<li><b>Quorum math</b> and "even numbers don't help"; quorum loss doesn't stop running containers.</li>
<li><b>Secrets</b>: immutable; at <code>/run/secrets</code>; Swarm only (Compose emulates with bind mounts); K8s Secrets are base64.</li>
<li><b>Reload vs restart</b>: some daemon.json options (debug, labels, insecure-registries, registry mirrors, live-restore…) apply on SIGHUP/<code>systemctl reload docker</code>; storage driver changes need a restart and hide existing images.</li>
</ul>
<h4>Two-week post-course practice plan</h4>
<table><tr><th>Day</th><th>Focus</th><th>Output</th></tr>
<tr><td>1</td><td>Install Engine on a fresh Linux VM, daemon.json (log rotation, storage driver check), contexts over SSH, rootless try-out</td><td>notes of every file touched</td></tr>
<tr><td>2</td><td>Dockerfile drills: every instruction, multi-stage, cache order, ENTRYPOINT/CMD combinations</td><td>3 images, sizes compared</td></tr>
<tr><td>3</td><td>Registry: run <code>registry:2</code>, push/pull, insecure registry config, tags vs digests, save/load, prune</td><td>command log</td></tr>
<tr><td>4</td><td>Content Trust: <code>DOCKER_CONTENT_TRUST=1</code>, <code>docker trust sign/inspect</code>; image scanning</td><td>signed tag</td></tr>
<tr><td>5</td><td>Networking: all drivers, DNS tests, publishing, iptables inspection, troubleshooting drills</td><td>diagram per driver</td></tr>
<tr><td>6</td><td>Storage: volumes, bind, tmpfs, <code>--mount</code> syntax, volume copy-up, backup/restore a Postgres volume</td><td>restore proof</td></tr>
<tr><td>7</td><td>Mock exam #1 (this course) under exam conditions; review every miss</td><td>score per domain</td></tr>
<tr><td>8</td><td>Swarm build: 3 managers + 2 workers, quorum loss and <code>--force-new-cluster</code>, autolock, backup</td><td>runbook</td></tr>
<tr><td>9</td><td>Services: create/update/rollback flags, constraints, labels, drain, global vs replicated</td><td>flag cheat sheet</td></tr>
<tr><td>10</td><td>Stacks, secrets, configs, overlay encryption, routing mesh vs host mode</td><td>working stack</td></tr>
<tr><td>11</td><td>Security: capabilities, seccomp, AppArmor, userns-remap, daemon TLS, MKE/UCP RBAC concepts</td><td>hardened run command</td></tr>
<tr><td>12</td><td>Kubernetes essentials: Pod, Deployment, Service types, ConfigMap/Secret, rollout</td><td>mapping table</td></tr>
<tr><td>13</td><td>Mock exam #2 (re-take, shuffled, plus your own questions from the weak domains)</td><td>score ≥ 85%</td></tr>
<tr><td>14</td><td>Light review of traps and defaults; rest; check exam logistics (ID, room, webcam, system check)</td><td>ready</td></tr></table>`,
      why: `<p>Ten days of depth leaves you knowing a lot, but exams reward fast, exact recall under time pressure, and DOMC punishes "I recognise it when I see all the options". Revision converts understanding into instant answers: which flag, which default, which file, which port.</p>
<p>Weighting your revision by the domain weights is simple expected-value thinking: an hour on orchestration is worth more points than an hour on storage, and the orchestration domain also has the most counter-intuitive facts (quorum, defaults of update config, publish modes).</p>`,
      diagram: {
        html: flow([["Orchestration", "25%", "g"], ["Image &amp; registry", "20%", "g"], ["Install &amp; config", "15%"], ["Networking", "15%"], ["Security", "15%"], ["Storage", "10%", "w"]]) + lanes([
          ["Read the question", ["find the qualifier: default, TWO, minimum, first, without downtime", "identify the domain"]],
          ["Predict", ["answer before seeing options", "recall the exact command/flag/port"]],
          ["Judge each option", ["DOMC: yes/no on its own merits", "almost-right = wrong (flag, default, scope)"]],
          ["Move on", ["~1.5 min per item", "no going back on DOMC"]]
        ]),
        steps: [
          "Allocate revision time roughly by weight: orchestration first, then images/registry, then the three 15% domains, storage last (but don't skip it).",
          "For each domain, check the terminology list, then type the top commands from memory on a real machine.",
          "Drill the traps list: defaults, manager-only commands, save vs export, -v vs --mount, prune scopes, quorum.",
          "Sit the mock exam under exam conditions, score per domain, and spend the next study block on the weakest domain."
        ]
      },
      cmds: [
        { t: "Orchestration: top commands", lang: "sh", code: `docker swarm init --advertise-addr 10.0.0.11
docker swarm join-token manager           # / worker, --rotate
docker swarm join --token <token> 10.0.0.11:2377
docker node ls | promote | demote | update --availability drain | update --label-add k=v
docker service create --name api --replicas 3 -p 8000:8000 --network backend img
docker service create --mode global ...
docker service ps | logs | inspect --pretty | scale api=5
docker service update --image img:2 --update-parallelism 2 --update-delay 10s --update-failure-action rollback --update-order start-first api
docker service rollback api
docker stack deploy -c stack.yml app ; docker stack ls | services | ps | rm
docker secret create name - ; docker config create name file
docker swarm update --autolock=true ; docker swarm unlock ; docker swarm unlock-key --rotate
docker swarm init --force-new-cluster --advertise-addr <ip>
kubectl apply -f x.yaml ; kubectl get pods ; kubectl describe ; kubectl logs ; kubectl rollout undo deploy/api` },
        { t: "Images and registry: top commands", lang: "sh", code: `docker build -t app:1.0 --target runtime -f Dockerfile .
docker image ls --filter dangling=true
docker image inspect app:1.0 --format '{{.Config.Entrypoint}} {{.Config.Cmd}}'
docker image history app:1.0
docker tag app:1.0 registry.example.com/team/app:1.0
docker login registry.example.com ; docker push registry.example.com/team/app:1.0
docker pull nginx@sha256:<digest>
docker image prune ; docker image prune -a ; docker system df
docker save -o app.tar app:1.0 ; docker load -i app.tar
docker export <container> > fs.tar ; docker import fs.tar app:flat
docker run -d -p 5000:5000 --name registry registry:2
export DOCKER_CONTENT_TRUST=1 ; docker trust sign registry.example.com/team/app:1.0 ; docker trust inspect --pretty registry.example.com/team/app
docker search --filter is-official=true nginx
docker buildx build --platform linux/amd64,linux/arm64 -t reg/app:1.0 --push .` },
        { t: "Installation and configuration: top commands and files", lang: "sh", code: `docker version ; docker info
sudo systemctl status docker ; sudo journalctl -u docker --since "10 min ago"
cat /etc/docker/daemon.json
#  { "log-driver": "json-file", "log-opts": {"max-size": "10m", "max-file": "3"},
#    "storage-driver": "overlay2", "live-restore": true, "debug": false,
#    "insecure-registries": ["registry.local:5000"], "userns-remap": "default" }
sudo systemctl reload docker      # SIGHUP: reloadable options only
sudo systemctl restart docker
docker info --format '{{.Driver}} {{.LoggingDriver}} {{.CgroupDriver}}'
docker context create prod --docker host=ssh://deploy@prod1 ; docker context use prod
dockerd-rootless-setuptool.sh install
sudo usermod -aG docker $USER      # = root-equivalent access` },
        { t: "Networking: top commands", lang: "sh", code: `docker network ls ; docker network inspect bridge
docker network create appnet ; docker network create -d overlay --attachable --opt encrypted ov
docker network create -d macvlan --subnet 192.168.1.0/24 --gateway 192.168.1.1 -o parent=eth0 lan
docker network create --internal backend
docker run -d --name api --network appnet -p 8000:8000 img ; docker run -P nginx:1.27-alpine
docker port api
docker network connect backend api ; docker network disconnect backend api
docker run --rm --network appnet busybox:1.36 nslookup api
docker run --rm --network container:api nicolaka/netshoot ss -lntp
sudo iptables -t nat -L DOCKER -n` },
        { t: "Security: top commands", lang: "sh", code: `docker run --cap-drop ALL --cap-add NET_BIND_SERVICE --read-only --tmpfs /tmp \\
  --security-opt no-new-privileges --user 10001:10001 img
docker run --security-opt seccomp=/path/profile.json img
docker run --security-opt apparmor=docker-default img
docker run --privileged img          # avoid: all caps, all devices, no seccomp/AppArmor confinement
# daemon TLS: dockerd --tlsverify --tlscacert ca.pem --tlscert server.pem --tlskey key.pem -H tcp://0.0.0.0:2376
docker --tlsverify -H tcp://host:2376 info
docker swarm ca --rotate ; docker swarm update --cert-expiry 720h
docker scout cves img                # or trivy image img` },
        { t: "Storage: top commands", lang: "sh", code: `docker volume create pgdata ; docker volume ls ; docker volume inspect pgdata
docker run -d -v pgdata:/var/lib/postgresql/data postgres:16
docker run --mount type=volume,src=pgdata,dst=/var/lib/postgresql/data postgres:16
docker run --mount type=bind,src=$(pwd)/conf,dst=/etc/app,readonly img
docker run --mount type=tmpfs,dst=/cache,tmpfs-size=64m img
docker volume prune            # anonymous unused volumes (recent engines); add --all for named
docker run --rm -v pgdata:/data -v $(pwd):/backup busybox:1.36 tar czf /backup/pgdata.tgz -C /data .
docker volume create -d <plugin> --opt k=v shared
docker info --format '{{.Driver}}'   # storage driver, e.g. overlay2` }
      ],
      internals: `<p><b>How the exam is built.</b> Certification exams are written against a published blueprint: each domain gets a share of items, each item maps to an objective (e.g., "describe and demonstrate how to configure a rolling update"). Items are usually written by practitioners and reviewed for a single unambiguous answer, which is why the exam leans heavily on <b>defaults, exact flags and documented behaviour</b> rather than opinion.</p>
<p><b>Why DOMC.</b> Discrete Option Multiple Choice reduces "test-wiseness": you can't compare options or eliminate by elimination across the list, and seeing fewer options reduces question leakage. Psychologically, the risk is accepting the first plausible option. Defend against it by forming your own answer first and asking of each option "is this exactly true as written?"</p>
<p><b>Mapping recall to internals.</b> Most "trap" facts become obvious once you remember the mechanism from the course: the default bridge has no DNS because the embedded resolver is wired only for user-defined networks; quorum is majority because Raft commits on majority acknowledgement; <code>docker export</code> loses CMD because it tars a container filesystem, not an image config; <code>-v</code> creates a missing host directory for historical compatibility while <code>--mount</code> is strict. When unsure, reason from the mechanism.</p>`,
      prod: `<p>The DCA domains are not just exam buckets; they are the checklist of a production Docker platform review:</p>
<ul class="pts">
<li><b>Installation/config</b>: daemon.json with log rotation and live-restore, consistent Engine versions, monitoring of the daemon.</li>
<li><b>Images/registry</b>: minimal multi-stage images, pinned base images, immutable tags, private registry with scanning and signing, pruning on build hosts.</li>
<li><b>Networking</b>: separate front-end and back-end networks, only the proxy publishes ports, encrypted overlays across hosts.</li>
<li><b>Security</b>: non-root users, dropped capabilities, default seccomp/AppArmor, secrets not env vars, TLS-protected daemon or SSH contexts, no docker group sprawl.</li>
<li><b>Storage</b>: named volumes for PostgreSQL/Redis, tested backups, no data in writable layers.</li>
<li><b>Orchestration</b>: odd managers across zones, health checks, rollback config, placement for stateful services.</li>
</ul>
<p>Use the revision sheet as a quarterly audit of the shop's stack: each line is either "done" or a ticket.</p>`,
      iq: [
        ["dca", "Default logging driver, and which drivers let <code>docker logs</code> read logs?", "<p><code>json-file</code>. <code>docker logs</code> works natively with <code>json-file</code>, <code>local</code> and <code>journald</code>; with other drivers recent engines use <b>dual logging</b> (a local cache) so <code>docker logs</code> still works unless disabled.</p>"],
        ["dca", "Where is the daemon configuration file on Linux?", "<p><code>/etc/docker/daemon.json</code> (rootless: <code>~/.config/docker/daemon.json</code>). Options set there must not also be passed as dockerd flags, or the daemon refuses to start.</p>"],
        ["dca", "How many managers to tolerate 2 manager failures?", "<p><b>5</b> (quorum 3). 4 managers still tolerate only 1.</p>"],
        ["dca", "Command to make an existing worker a manager?", "<p><code>docker node promote &lt;node&gt;</code> (equivalently <code>docker node update --role manager</code>), run on a manager.</p>"],
        ["dca", "Where are Swarm secrets mounted in a container?", "<p><code>/run/secrets/&lt;secret_name&gt;</code> on an in-memory filesystem (Linux), unless a different <code>target</code> is given.</p>"],
        ["dca", "What does <code>docker image prune -a</code> remove that <code>docker image prune</code> does not?", "<p>All images not used by any container (tagged ones too), not just dangling (untagged, unreferenced) images.</p>"],
        ["dca", "Difference between <code>docker save</code> and <code>docker export</code>?", "<p><code>save</code> writes an <b>image</b> (all layers, tags, config) for <code>docker load</code>. <code>export</code> writes a <b>container's</b> flattened filesystem without history or config (CMD, ENV, ENTRYPOINT lost), for <code>docker import</code>.</p>"],
        ["dca", "Which network driver gives containers a MAC address on the physical LAN?", "<p><code>macvlan</code> (or ipvlan L2 with a shared MAC). The host typically can't talk to its own macvlan containers without an extra macvlan interface.</p>"],
        ["dca", "Why can't containers on the default bridge resolve each other by name?", "<p>Automatic DNS-based service discovery is only provided on <b>user-defined</b> networks. On the default bridge you'd need the legacy <code>--link</code>. Create a user-defined bridge.</p>"],
        ["dca", "Which environment variable enables Docker Content Trust for the CLI?", "<p><code>DOCKER_CONTENT_TRUST=1</code>. Then <code>push</code> signs and <code>pull</code>/<code>run</code> refuse unsigned tags.</p>"],
        ["dca", "Two ways to give a container only the capability to bind to port 80 as non-root?", "<p><code>--cap-drop ALL --cap-add NET_BIND_SERVICE</code> (with a non-root user). Or listen on a high port and publish <code>-p 80:8080</code>, which needs no capability at all in the container.</p>"],
        ["dca", "What does userns-remap do?", "<p>Configured in daemon.json (<code>\"userns-remap\": \"default\"</code>), it maps container root (UID 0) to an unprivileged subordinate UID range on the host (from <code>/etc/subuid</code>), so a breakout lands as a non-root user. It changes the storage path and is incompatible with some features (e.g., host network/PID sharing in some cases).</p>"],
        ["dca", "<code>-v /data/conf:/conf</code> vs <code>--mount type=bind,src=/data/conf,dst=/conf</code> when /data/conf doesn't exist?", "<p><code>-v</code> silently creates an empty directory on the host; <code>--mount</code> fails with an error. That strictness is why <code>--mount</code> is recommended for scripts.</p>"],
        ["dca", "Which mount type never writes data to the host disk?", "<p><b>tmpfs</b> (<code>--tmpfs /cache</code> or <code>--mount type=tmpfs,dst=/cache</code>). Linux only; content vanishes when the container stops.</p>"],
        ["dca", "Default <code>--update-order</code> and <code>--update-failure-action</code> for Swarm services?", "<p><code>stop-first</code> and <code>pause</code>. So by default each batch briefly reduces capacity, and a failed update stops half-way until you roll back or fix it.</p>"],
        ["dca", "Which Kubernetes object exposes a Deployment inside the cluster only?", "<p>A <b>Service of type ClusterIP</b> (the default type).</p>"],
        ["dca", "What happens to running containers when <code>dockerd</code> restarts with <code>live-restore</code> enabled?", "<p>They keep running (containerd and the shims keep them alive) and dockerd reattaches on start. Without live-restore, containers are stopped on daemon shutdown. Not supported for Swarm-mode tasks in the same way.</p>"],
        ["dca", "Which instruction should you prefer to copy local files, COPY or ADD, and why?", "<p><code>COPY</code>: explicit and predictable. <code>ADD</code> also auto-extracts local tar archives and can fetch remote URLs, which surprises readers and hurts caching; use it only when you want those features.</p>"],
        ["mid", "What does <code>docker system df</code> show?", "<p>Disk usage by images, containers, local volumes and build cache, including how much is reclaimable. <code>-v</code> breaks it down per object.</p>"]
      ],
      gotchas: [
        "<b>Studying only what you like.</b> Developers over-study Dockerfiles and under-study Swarm administration and security, the opposite of the weights.",
        "<b>Version drift.</b> Older study material uses <code>docker-compose</code>, devicemapper, <code>docker service rollback</code> absent, or removed flags. Prefer current docs and say \"recent engines\" for behaviours that changed (e.g., volume prune).",
        "<b>DOMC first-plausible trap.</b> Saying YES to the first option that sounds right without checking the exact flag or scope.",
        "<b>\"Which TWO\" questions</b> require exactly two; if you have three candidates, one has a subtle error.",
        "<b>Enterprise naming.</b> Questions may say UCP/DTR (older) or MKE/MSR (newer). They are the same products renamed; know RBAC grants (subject + role + collection/namespace) conceptually.",
        "<b>Exam logistics</b> (ID, webcam, clean desk, supported browser, system check) cause more failed attempts than you'd think. Do the system check days before."
      ],
      best: [
        "Revise in proportion to the weights, then rebalance based on mock-exam scores per domain.",
        "Type commands on a real machine; muscle memory beats reading.",
        "Make a one-page sheet of defaults and ports and read it the morning of the exam.",
        "For every wrong mock answer, write the mechanism behind the right answer, not just the letter.",
        "Check the current official exam guide for format, weights and objectives before booking."
      ],
      lab: [
        "Print or copy the terminology checklist; next to each term write a one-sentence definition from memory. Mark the ones you couldn't define.",
        "On a fresh VM, type every command in the six cheat-sheet blocks above, fixing each one that errors until it works. Note the defaults you discover with <code>docker info</code> and <code>docker service inspect --pretty</code>.",
        "Answer the rapid-fire questions above with the answers hidden; score yourself.",
        "Fill in the two-week plan in your calendar with real dates and book the exam for the end of it (after checking the official guide).",
        "<b>Done when:</b> you can define every term in one sentence, you've typed every cheat-sheet command successfully, and you score 17/19 or better on the rapid-fire set."
      ],
      teach: `<p>"The DCA has six domains. As commonly published: orchestration is a quarter of it, images and registries a fifth, installation, networking and security fifteen percent each, storage ten. Always check the current guide. Questions are often DOMC: you see one option at a time and say yes or no, so I predict the answer first and then judge each option strictly on its own."</p>
<p>"The traps are mostly defaults and exact scopes: json-file logging, overlay2 storage, bridge networking with no DNS on the default bridge, stop-first and pause for service updates, ingress publishing, VIP endpoints; managers only for swarm commands; save versus export; dash-v versus dash-dash-mount; prune scopes. And quorum: odd numbers of managers, five tolerates two. My plan: two weeks of hands-on drills by domain, two mock exams, and the weakest domain gets the extra time."</p>`
    },
    {
      id: "d10-mock-exam",
      title: "Mock certification exam with explanations",
      lv: ["mid", "senior", "dca"],
      eli5: `<p>A fire drill isn't a fire, but it shows you whether you know where the exits are while the alarm is ringing. A mock exam is the fire drill for the DCA: same kind of questions, same time pressure, nobody's job on the line.</p>
<p>The score matters less than the review afterwards. Every wrong answer is a door you didn't know was there. Every right answer you guessed is a door you'd better check again.</p>`,
      what: `<p>This is a <b>45-question mock DCA exam</b>. Questions are distributed roughly in proportion to the domain weights on the home page (Orchestration ~11, Image creation/management/registry ~9, Installation and configuration ~7, Networking ~7, Security ~7, Storage ~4). They are written in exam style: single answer, "which TWO", "what happens when", and broken-setup scenarios.</p>
<ul class="pts">
<li>The questions are in section 7 below. Each answer gives the <b>correct option</b> and <b>why each distractor is wrong</b>.</li>
<li>To practise DOMC, cover the options and answer from the stem first, then reveal options one at a time and decide YES/NO for each before looking at the next.</li>
<li>Time limit: <b>70 minutes</b> for 45 questions (the same ~1.5 min/question pace as the real exam as commonly reported).</li>
<li>Scoring: 1 point per question; for "which TWO" both must be right. Target <b>≥ 80%</b> overall and ≥ 70% in every domain before booking the real exam (a practice target, not the official pass mark).</li>
</ul>
<h4>Question numbering by domain</h4>
<table><tr><th>Domain</th><th>Questions</th></tr>
<tr><td>Orchestration</td><td>Q1-Q11</td></tr>
<tr><td>Image creation, management and registry</td><td>Q12-Q20</td></tr>
<tr><td>Installation and configuration</td><td>Q21-Q27</td></tr>
<tr><td>Networking</td><td>Q28-Q34</td></tr>
<tr><td>Security</td><td>Q35-Q41</td></tr>
<tr><td>Storage and volumes</td><td>Q42-Q45</td></tr></table>`,
      why: `<p>Knowing the material and performing under exam conditions are different skills. A timed mock reveals pacing problems, reveals domains where your knowledge is recognition-only, and trains the habit of reading qualifiers ("default", "TWO", "first"). Reviewing explanations for distractors teaches the boundaries of each fact, which is exactly what exam writers test.</p>`,
      diagram: {
        html: flow([["Set up", "timer 70 min, no notes, no terminal", "w"], ["Answer Q1-Q45", "predict, then judge options"], ["Score", "per domain"], ["Review", "every miss and every guess", "g"], ["Drill", "weakest domain, then re-take shuffled", "g"]]),
        steps: [
          "Sit the 45 questions in one block without notes or a terminal, writing your answers (and a ? next to guesses) on paper.",
          "Open the answers, score 1 per question, and total per domain using the numbering table.",
          "For each miss and each guessed hit, write the mechanism in one sentence and the command that proves it, then run that command on a lab machine.",
          "Spend the next study session on the lowest-scoring domain; re-take the exam in shuffled order a few days later."
        ]
      },
      cmds: [
        { t: "Cold cheat sheet: Orchestration", lang: "text", code: `Ports           2377/tcp mgmt · 7946/tcp+udp gossip · 4789/udp VXLAN · ESP (proto 50) encrypted overlay
Quorum          floor(N/2)+1 · tolerate floor((N-1)/2) · 3→1 · 5→2 · 7→3 · even adds nothing
Init/join       docker swarm init --advertise-addr IP · docker swarm join-token worker|manager [--rotate]
Recover         docker swarm init --force-new-cluster --advertise-addr IP
Autolock        docker swarm update --autolock=true · docker swarm unlock · docker swarm unlock-key [--rotate]
Backup          stop docker on a manager · copy /var/lib/docker/swarm · start docker
Nodes           docker node promote|demote|ls|ps|rm · update --availability active|pause|drain · --label-add
Services        create --replicas N | --mode global · scale svc=N · update · rollback · ps · logs · inspect --pretty
Update flags    --update-parallelism (1) --update-delay (0s) --update-monitor (5s) --update-failure-action pause|continue|rollback (pause) --update-order stop-first|start-first (stop-first)
Placement       --constraint node.role==manager | node.labels.k==v | node.hostname | engine.labels.k · --placement-pref spread=node.labels.zone
Publishing      --publish published=80,target=80[,mode=host] (default ingress) · --endpoint-mode vip|dnsrr
Secrets/configs docker secret create NAME FILE|- · /run/secrets/NAME · immutable · --secret-rm/--secret-add
Stacks          docker stack deploy -c file.yml NAME [--with-registry-auth] · ls · services · ps · rm  (build ignored)
Kubernetes      Pod · Deployment/ReplicaSet · DaemonSet · StatefulSet · Service ClusterIP|NodePort|LoadBalancer · Ingress · ConfigMap · Secret · PVC
kubectl         apply -f · get · describe · logs · exec -it · rollout status|history|undo · scale` },
        { t: "Cold cheat sheet: Images and registry", lang: "text", code: `Build           docker build -t name:tag -f Dockerfile --target stage --build-arg K=V --no-cache .
Instructions    FROM RUN COPY ADD CMD ENTRYPOINT ENV ARG WORKDIR USER EXPOSE VOLUME LABEL HEALTHCHECK SHELL STOPSIGNAL ONBUILD
CMD+ENTRYPOINT  exec form: ENTRYPOINT ["x"] + CMD ["arg"] → x arg · docker run img newarg replaces CMD · --entrypoint replaces ENTRYPOINT
ARG vs ENV      ARG build-time only (before FROM: only for FROM) · ENV persists into containers
Inspect         docker image inspect · docker image history · docker manifest inspect / buildx imagetools inspect
Tag/push        docker tag src dst · docker login REG · docker push REG/ns/repo:tag · pull by @sha256:digest
Prune           image prune (dangling) · image prune -a (all unused) · system prune [-a] [--volumes] · builder prune
Move            save/load = image with layers · export/import = container fs flattened
Registry        docker run -d -p 5000:5000 registry:2 · daemon.json "insecure-registries" for HTTP · delete needs storage delete enabled + garbage-collect
Trust           DOCKER_CONTENT_TRUST=1 · docker trust sign|inspect|revoke · docker trust key generate · signer add
Search          docker search --filter is-official=true --filter stars=100 TERM` },
        { t: "Cold cheat sheet: Installation and configuration", lang: "text", code: `Files           /etc/docker/daemon.json · /var/lib/docker · /var/run/docker.sock · systemd unit docker.service (+ drop-ins)
Conflicts       same option in daemon.json AND dockerd flags → daemon fails to start
Reload          SIGHUP / systemctl reload docker: debug, labels, insecure-registries, registry-mirrors, live-restore, max-concurrent-*
Logging         default json-file · log-opts max-size, max-file · per container --log-driver / --log-opt
Storage driver  overlay2 default · changing it hides existing images/containers
Info            docker info · docker version · docker system df · docker system events
Contexts        docker context create NAME --docker host=ssh://user@host · use · ls
Remote TLS      dockerd -H tcp://0.0.0.0:2376 --tlsverify ... · client --tlsverify -H tcp://host:2376
Rootless        dockerd-rootless-setuptool.sh install · no privileged ports below 1024 by default
Users           docker group = root-equivalent
Enterprise      MKE (UCP) management UI/RBAC · MSR (DTR) registry: scanning, signing, promotion` },
        { t: "Cold cheat sheet: Networking", lang: "text", code: `Drivers         bridge (default) · host · none · overlay (multi-host) · macvlan/ipvlan · plugins
DNS             127.0.0.11 on user-defined networks only · service name · --network-alias · tasks.SVC in swarm
Publishing      -p host:container[/udp] · -p 127.0.0.1:8080:80 · -P random high ports for EXPOSEd · docker port C
Containers      docker network create|connect|disconnect|inspect|prune · --internal (no external access)
Share stack     --network container:NAME · --network host
Overlay         swarm required (or --attachable for docker run) · --opt encrypted · ingress + docker_gwbridge
Mesh            ingress publish = every node · mode=host = only task nodes, keeps client IP
Debug           docker exec C ip a | ss -lntp · nicolaka/netshoot · iptables -t nat -L DOCKER -n · docker network inspect` },
        { t: "Cold cheat sheet: Security", lang: "text", code: `Capabilities    --cap-drop ALL --cap-add NET_BIND_SERVICE · --privileged = everything (avoid)
Profiles        default seccomp profile blocks dangerous syscalls · --security-opt seccomp=file.json | seccomp=unconfined
                AppArmor docker-default · SELinux labels (:z/:Z on bind mounts)
Hardening       --user UID · --read-only --tmpfs /tmp · --security-opt no-new-privileges · --pids-limit · --memory
User namespaces daemon.json "userns-remap": "default" · /etc/subuid /etc/subgid
Trust           DOCKER_CONTENT_TRUST=1 · signed tags only
Secrets         swarm secrets encrypted in Raft, mTLS in transit, tmpfs at /run/secrets · K8s Secrets base64
Swarm PKI       mTLS between nodes · cert expiry default 90 days · docker swarm ca --rotate · autolock
Daemon          protect docker.sock · TLS on 2376 or SSH contexts · never 2375 unauthenticated
RBAC (MKE)      grant = subject (user/team/org) + role (permissions) + resource set (collection/namespace)` },
        { t: "Cold cheat sheet: Storage and volumes", lang: "text", code: `Types           named volume · anonymous volume · bind mount · tmpfs
Syntax          -v name:/path[:ro] · -v /host:/path · --mount type=volume|bind|tmpfs,src=,dst=,readonly
Strictness      -v creates missing host dir · --mount bind errors if missing
Copy-up         empty named volume is populated from image content at the mount path; bind mounts hide it
Location        /var/lib/docker/volumes/NAME/_data (local driver)
Lifecycle       docker volume create|ls|inspect|rm|prune · docker rm -v removes anonymous volumes
Prune           recent engines: volume prune = anonymous only, --all for named · system prune needs --volumes
Drivers         volume driver/plugin (NFS, cloud block storage) vs storage driver (overlay2 for image layers)
Backup          docker run --rm -v vol:/data -v $PWD:/b busybox tar czf /b/vol.tgz -C /data .` }
      ],
      internals: `<p><b>How the mock was built.</b> Each question targets one objective from the domain list and has one defensible answer under current Docker Engine and Swarm behaviour. Distractors are built from the most common real mistakes: a correct command with the wrong flag, a correct concept with the wrong default, an outdated behaviour, or a feature from the wrong tool (Compose vs Swarm vs Kubernetes).</p>
<p><b>Why distractor analysis matters.</b> The real exam rarely asks the thing you remember most clearly; it asks the boundary: "which does NOT", "what is the default", "which node". Reading why each wrong option is wrong maps those boundaries. Where behaviour differs between versions (prune scopes, job modes, dual logging), the answers say so; the real exam targets the version in its guide.</p>`,
      prod: `<p>Every question here is also an incident you could face. Q3 (quorum loss) is a region outage; Q8 (pending tasks) is a typo in a constraint during a Friday deploy; Q24 (daemon won't start) is a config-management change that set an option both as a flag and in daemon.json; Q28 (default bridge DNS) is the classic "works with IPs, fails by name"; Q42 (data lost) is the PostgreSQL container recreated without a volume. When you review a missed question, also ask "how would I detect and fix this in the shop's production stack?"</p>`,
      iq: [
        ["dca", "Q1 (Orchestration). A swarm has 7 managers. What is the maximum number of managers that can be unavailable while the swarm can still accept service updates? A) 2 B) 3 C) 4 D) 6", "<p><b>B) 3.</b> Quorum for 7 is 4, so 3 may fail. A is the answer for 5 or 6 managers. C would leave 3 of 7, below majority. D confuses \"one survivor keeps containers running\" with control-plane availability.</p>"],
        ["dca", "Q2 (Orchestration). Which command, run on a manager, prints the command a new node needs to join as a manager? A) docker swarm join --manager B) docker swarm join-token manager C) docker node promote --token D) docker swarm init --manager", "<p><b>B.</b> <code>docker swarm join-token manager</code> prints the full <code>docker swarm join --token …</code> line. A: <code>join</code> has no <code>--manager</code> flag; the token decides the role. C: promote works on existing nodes and has no token flag. D: init creates a new swarm.</p>"],
        ["dca", "Q3 (Orchestration). In a 3-manager swarm, two managers are permanently lost. Which is the correct recovery? A) docker swarm leave --force on the survivor, then init B) docker swarm init --force-new-cluster on the survivor C) docker node demote on the two lost managers D) Restart Docker on all workers", "<p><b>B.</b> It rebuilds a single-manager cluster from the survivor's state, keeping services, secrets and workers; then promote nodes back to 3. A destroys the swarm state. C fails: demote needs quorum to commit. D does nothing for the control plane.</p>"],
        ["dca", "Q4 (Orchestration). Which TWO statements about global services are true? A) They run one task on every eligible node B) They can be scaled with docker service scale C) New nodes that join automatically get a task D) They cannot use placement constraints", "<p><b>A and C.</b> B is false: scaling applies only to replicated services (the CLI rejects it for global). D is false: constraints restrict which nodes are eligible, e.g., <code>--mode global --constraint node.role==worker</code>.</p>"],
        ["dca", "Q5 (Orchestration). A service update should start the new task before stopping the old one. Which flag? A) --update-parallelism 0 B) --update-order start-first C) --update-delay 0s D) --rollback-order start-first", "<p><b>B.</b> A updates all tasks at once (not ordering). C only removes the pause between batches. D affects rollbacks, not updates.</p>"],
        ["dca", "Q6 (Orchestration). An update fails on the first task and the service stays half-updated. No update flags were set. Why? A) Default failure action is rollback, which failed B) Default failure action is pause C) Default failure action is continue D) Swarm never monitors updates", "<p><b>B.</b> The default <code>--update-failure-action</code> is <code>pause</code>. A: rollback must be configured. C would have carried on updating the rest. D: Swarm monitors each task for <code>--update-monitor</code> (default 5s).</p>"],
        ["dca", "Q7 (Orchestration). Which availability setting stops new tasks from being scheduled on a node but leaves existing tasks running? A) drain B) pause C) active D) down", "<p><b>B) pause.</b> Drain also reschedules existing tasks elsewhere. Active is normal scheduling. \"down\" is a node <i>status</i> (reported), not an availability you set.</p>"],
        ["dca", "Q8 (Orchestration). A service shows 0/2 and its tasks are Pending with \"no suitable node (scheduling constraints not satisfied)\". The constraint is node.labels.region==eu. What is the most likely fix? A) docker service scale svc=2 B) docker node update --label-add region=eu &lt;node&gt; C) Add region=eu to daemon.json labels D) Restart the service", "<p><b>B.</b> <code>node.labels</code> are set by managers with <code>docker node update --label-add</code>. C sets an <i>engine</i> label, matched only by <code>engine.labels.region</code>. A and D don't change eligibility.</p>"],
        ["dca", "Q9 (Orchestration). Which statement about docker stack deploy is correct? A) It builds images from the build: key B) It honours depends_on ordering C) Running it again with a changed file updates the stack in place D) It only works with version: \"2\" files", "<p><b>C.</b> Re-deploying applies differences. A: <code>build</code> is ignored; images must be in a registry. B: <code>depends_on</code> start ordering is ignored. D: stacks need Compose file format 3+ / the Compose Specification; v2 files with v2-only keys are rejected.</p>"],
        ["dca", "Q10 (Orchestration). Which Kubernetes object provides rolling updates and rollbacks for stateless Pods? A) ReplicaSet B) Deployment C) DaemonSet D) Service", "<p><b>B.</b> A Deployment manages ReplicaSets and records revisions for <code>kubectl rollout undo</code>. A keeps a count but has no rollout logic. C runs one Pod per node. D is networking, not workload management.</p>"],
        ["dca", "Q11 (Orchestration). A Swarm service must read a TLS key file that must not appear in docker inspect or environment variables. Which TWO are appropriate? A) docker secret create and --secret B) An ENV instruction in the Dockerfile C) docker config create and --config D) Mounting at /run/secrets/tls.key via the secret's default target", "<p><b>A and D.</b> Secrets are encrypted in Raft and mounted in-memory at <code>/run/secrets/&lt;name&gt;</code>. B bakes the key into image metadata, visible to anyone with the image. C configs are not encrypted at rest and are meant for non-sensitive files.</p>"],
        ["dca", "Q12 (Images). A Dockerfile has ENTRYPOINT [\"python\", \"app.py\"] and CMD [\"--port\", \"8000\"]. What runs for docker run img --port 9000? A) python app.py --port 8000 --port 9000 B) python app.py --port 9000 C) --port 9000 D) python app.py", "<p><b>B.</b> Arguments after the image name replace <code>CMD</code> and are appended to the exec-form <code>ENTRYPOINT</code>. A would need both. C would happen only if ENTRYPOINT were empty. D ignores the args.</p>"],
        ["dca", "Q13 (Images). Which command shows the instructions and size of each layer of an image? A) docker image inspect B) docker image history C) docker container diff D) docker manifest inspect", "<p><b>B.</b> <code>history</code> lists layers with CREATED BY and SIZE. A shows config and the layer digests, not per-instruction sizes. C shows changes in a container's writable layer. D shows the registry manifest (platforms, digests).</p>"],
        ["dca", "Q14 (Images). Which removes all images not referenced by any container, including tagged ones? A) docker image prune B) docker image prune -a C) docker rmi $(docker images -q --filter dangling=true) D) docker system prune", "<p><b>B.</b> A and C remove only dangling images. D (without <code>-a</code>) removes stopped containers, unused networks, dangling images and build cache, but not unused tagged images.</p>"],
        ["dca", "Q15 (Images). You need to move an image to an air-gapped host with its tags and history intact. Which pair? A) docker export / docker import B) docker save / docker load C) docker commit / docker push D) docker cp / docker build", "<p><b>B.</b> <code>save</code> writes layers, tags and config to a tar; <code>load</code> restores them. A flattens a container filesystem and loses history and CMD/ENTRYPOINT. C needs a registry. D is unrelated.</p>"],
        ["dca", "Q16 (Images). In a multi-stage build, how do you copy /app/dist from a stage named build? A) COPY build:/app/dist ./ B) COPY --from=build /app/dist ./ C) ADD --stage=build /app/dist ./ D) FROM build COPY /app/dist", "<p><b>B.</b> <code>COPY --from=&lt;stage name or index or image&gt;</code>. A is <code>docker cp</code> syntax. C has no such flag. D is not valid Dockerfile syntax.</p>"],
        ["dca", "Q17 (Images). docker push fails with \"http: server gave HTTP response to HTTPS client\" for registry.local:5000. What fixes it on the client host? A) docker login --insecure B) Add registry.local:5000 to insecure-registries in daemon.json and reload/restart Docker C) Use docker push --tls=false D) Set DOCKER_CONTENT_TRUST=0", "<p><b>B</b> (or, better, give the registry a TLS certificate). A and C: those flags don't exist for this. D controls signing, not transport.</p>"],
        ["dca", "Q18 (Images). With DOCKER_CONTENT_TRUST=1 set, what happens on docker pull of an unsigned tag? A) The pull succeeds with a warning B) The pull fails because no trust data exists for the tag C) Docker signs it automatically D) Only the digest is pulled", "<p><b>B.</b> With Content Trust enabled, the client only pulls signed tags. A describes no enforcement. C: signing happens on push by the publisher with their keys. D is not a behaviour.</p>"],
        ["dca", "Q19 (Images). Which practice MOST improves build cache reuse for a FastAPI image? A) COPY . . before RUN pip install B) COPY requirements.txt, RUN pip install, then COPY . . C) Using ADD instead of COPY D) Adding --no-cache to every build", "<p><b>B.</b> Dependencies change rarely, so their layer stays cached when only source code changes. A invalidates the install layer on every code change. C has no cache benefit. D disables caching.</p>"],
        ["dca", "Q20 (Images). What does an image digest guarantee that a tag does not? A) The image is the latest B) The exact, immutable content C) The image is signed D) The image is multi-arch", "<p><b>B.</b> A digest is a content hash; tags are mutable pointers. A: <code>latest</code> is just a name. C: signing is separate (DCT). D: a digest can refer to a single-platform manifest or an index.</p>"],
        ["dca", "Q21 (Install/config). Where do you set the default logging driver for all new containers on a Linux host? A) /etc/docker/daemon.json \"log-driver\" B) ~/.docker/config.json C) /var/lib/docker/logging.conf D) docker run --log-driver only", "<p><b>A.</b> B is the <i>client</i> config (auth, CLI settings). C does not exist. D sets it per container, not the default.</p>"],
        ["dca", "Q22 (Install/config). Which daemon.json settings rotate json-file logs at 10 MB keeping 3 files? A) \"log-opts\": {\"max-size\": \"10m\", \"max-file\": \"3\"} B) \"log-rotate\": \"10m/3\" C) \"log-opts\": {\"max-size\": 10, \"max-file\": 3} D) \"logging\": {\"size\": \"10m\"}", "<p><b>A.</b> Log-opt values must be <b>strings</b> in daemon.json, which is why C fails validation. B and D are not real keys.</p>"],
        ["dca", "Q23 (Install/config). Which command shows the storage driver, logging driver, cgroup driver and swarm state of the engine? A) docker version B) docker info C) docker system df D) docker inspect engine", "<p><b>B.</b> A shows client/server versions and API versions. C shows disk usage. D: there is no \"engine\" object to inspect.</p>"],
        ["dca", "Q24 (Install/config). After adding \"debug\": true to daemon.json, dockerd fails to start with \"the following directives are specified both as a flag and in the configuration file: debug\". Fix? A) Remove -D/--debug from the systemd unit or drop-in B) Move daemon.json to ~/.docker C) Run docker system prune D) Set DOCKER_DEBUG=1", "<p><b>A.</b> The same option can't be set in both places. B moves the file to the client config location, which the daemon ignores. C and D are unrelated.</p>"],
        ["dca", "Q25 (Install/config). Which feature keeps containers running while dockerd is restarted for an upgrade? A) restart: always B) live-restore C) --init D) userns-remap", "<p><b>B.</b> <code>\"live-restore\": true</code> lets containers survive daemon downtime (containerd and the shims keep them). A restarts containers <i>after</i> they stop. C adds an init process inside the container. D is a security feature.</p>"],
        ["dca", "Q26 (Install/config). You manage three remote engines from your laptop over SSH without exporting DOCKER_HOST each time. What should you use? A) docker context create … --docker host=ssh://user@host B) docker swarm join C) docker login D) docker network connect", "<p><b>A.</b> Contexts store endpoints; <code>docker context use</code> or <code>--context</code> switches. B joins a cluster. C authenticates to a registry. D is networking.</p>"],
        ["dca", "Q27 (Install/config). Which TWO statements about adding a user to the docker group are true? A) It grants root-equivalent access to the host B) It is the recommended least-privilege setup for CI runners C) It lets the user talk to /var/run/docker.sock without sudo D) It enables rootless mode", "<p><b>A and C.</b> Anyone with socket access can run <code>docker run -v /:/host --privileged</code>. B is the opposite of least privilege. D: rootless mode runs a separate daemon as the user, unrelated to the docker group.</p>"],
        ["dca", "Q28 (Networking). Two containers on the default bridge can ping each other's IPs but not names. What is the recommended fix? A) Use --link B) Create a user-defined bridge and attach both C) Add --dns 8.8.8.8 D) Use --network host", "<p><b>B.</b> Embedded DNS name resolution is only provided on user-defined networks. A works but is legacy/deprecated. C points to a public resolver that doesn't know container names. D removes isolation and port separation.</p>"],
        ["dca", "Q29 (Networking). Which command publishes container port 80 only on the host's loopback interface at port 8080? A) -p 8080:80 B) -p 127.0.0.1:8080:80 C) -p 80:8080 D) --expose 8080", "<p><b>B.</b> A binds on all interfaces (0.0.0.0). C reverses host/container ports. D only documents a port, publishes nothing.</p>"],
        ["dca", "Q30 (Networking). What does docker run -P do? A) Publishes all EXPOSEd ports to random high host ports B) Publishes port 80 C) Makes the container privileged D) Uses the host network", "<p><b>A.</b> Check the chosen ports with <code>docker port</code>. B needs <code>-p 80:80</code>. C is <code>--privileged</code>. D is <code>--network host</code>.</p>"],
        ["dca", "Q31 (Networking). A standalone container (docker run) must join an overlay network used by Swarm services. What is required? A) Nothing, overlays accept any container B) The overlay was created with --attachable C) The container uses --network host D) The overlay is encrypted", "<p><b>B.</b> Without <code>--attachable</code>, only services can use the overlay. C bypasses Docker networking. D affects encryption, not attachability.</p>"],
        ["dca", "Q32 (Networking). A service publishes port 8080 in default mode on a 5-node swarm with 2 replicas. On which nodes does port 8080 accept connections? A) Only the 2 nodes running tasks B) All 5 nodes C) Only managers D) Only the leader", "<p><b>B.</b> The ingress routing mesh listens on every node and forwards to a task. A describes <code>mode=host</code>. C and D are not how publishing works.</p>"],
        ["dca", "Q33 (Networking). Which network driver gives each container its own IP and MAC on the physical network, so legacy systems see it as a separate host? A) bridge B) overlay C) macvlan D) none", "<p><b>C.</b> A uses NAT behind the host IP. B is a VXLAN between Docker hosts. D gives only loopback.</p>"],
        ["dca", "Q34 (Networking). Inside a swarm overlay, a client service needs the individual IPs of all tasks of service db (not the VIP). What does it query? A) db B) tasks.db C) db.vip D) _db._tcp", "<p><b>B.</b> <code>tasks.&lt;service&gt;</code> returns task IPs. A returns the VIP (unless the service uses <code>--endpoint-mode dnsrr</code>). C and D are not Docker DNS names.</p>"],
        ["dca", "Q35 (Security). A container must bind to port 443 as a non-root user, with no other privileges. Which is best? A) --privileged B) --cap-drop ALL --cap-add NET_BIND_SERVICE --user 10001 C) --cap-add SYS_ADMIN D) --security-opt seccomp=unconfined", "<p><b>B.</b> Grants exactly the capability needed. A grants everything. C is close to root (mounts, namespaces) and unrelated. D removes syscall filtering and grants nothing useful here.</p>"],
        ["dca", "Q36 (Security). Which statement about Docker's default seccomp profile is true? A) It is applied only with --privileged B) It blocks a set of dangerous syscalls by default for every container C) It must be enabled in daemon.json D) It replaces capabilities", "<p><b>B.</b> The default profile is applied automatically (on kernels with seccomp) and blocks syscalls such as <code>reboot</code>, <code>kexec_load</code> and mount-related ones unless capabilities allow. A: <code>--privileged</code> actually disables it. C: on by default. D: it works alongside capabilities.</p>"],
        ["dca", "Q37 (Security). How do you map container root to an unprivileged host UID for all containers on a host? A) docker run --user 0 B) \"userns-remap\": \"default\" in daemon.json C) --cap-drop ALL D) USER root in the Dockerfile", "<p><b>B.</b> Remapping uses <code>/etc/subuid</code> ranges (the <code>dockremap</code> user by default). A and D run as root. C reduces privileges but UID 0 is still host UID 0.</p>"],
        ["dca", "Q38 (Security). Which TWO are true about Swarm's node security? A) Node-to-node control traffic uses mutual TLS B) Node certificates never expire C) docker swarm ca --rotate rotates the root CA D) Workers store the full Raft log", "<p><b>A and C.</b> B: certificates expire (default 90 days) and auto-renew. D: only managers hold the Raft log.</p>"],
        ["dca", "Q39 (Security). The Docker daemon must accept remote API calls securely. Which is correct? A) -H tcp://0.0.0.0:2375 B) -H tcp://0.0.0.0:2376 --tlsverify with CA, server cert and key; clients present certs C) Add the remote users to the docker group D) Enable live-restore", "<p><b>B</b> (or use SSH contexts instead of TCP). A is unauthenticated, unencrypted root access to anyone who can reach the port. C applies only to local socket access. D is unrelated.</p>"],
        ["dca", "Q40 (Security). In Mirantis Kubernetes Engine (formerly UCP) RBAC, what does a grant combine? A) User + password + host B) Subject + role + resource set (collection or namespace) C) Image + tag + signature D) Node + label + constraint", "<p><b>B.</b> A subject (user, team, org, service account) gets a role (set of permissions) over a resource set. A is authentication. C is content trust. D is scheduling.</p>"],
        ["dca", "Q41 (Security). Which practice prevents a compromised app from writing to the image filesystem while still allowing temporary files? A) --read-only --tmpfs /tmp B) --privileged C) -v /:/host D) --user root", "<p><b>A.</b> The root filesystem becomes read-only; <code>/tmp</code> is an in-memory writable mount. B and C massively increase privileges. D increases impact of a compromise.</p>"],
        ["dca", "Q42 (Storage). A <code>postgres:16</code> container was run without any <code>-v</code>/<code>--mount</code> option. It was removed with docker rm and recreated. What happened to the data? A) Preserved in an anonymous volume B) Lost: it lived in the container's writable layer C) Preserved in the image D) Copied automatically into the new container", "<p><b>A (the trap).</b> The <code>postgres</code> image declares <code>VOLUME /var/lib/postgresql/data</code>, so Docker created an anonymous volume; it survives <code>docker rm</code> (not <code>docker rm -v</code>), but the <i>new</i> container gets a new anonymous volume, so the database appears empty and the old data sits orphaned in <code>/var/lib/docker/volumes/&lt;hash&gt;</code>. B is true for images without a VOLUME instruction. C: containers never write to images. D: Docker never copies data between containers; the new container gets a fresh, empty anonymous volume. The lesson: always use a <b>named</b> volume. Exam items like this test whether you know about the image's VOLUME instruction.</p>"],
        ["dca", "Q43 (Storage). Which TWO statements about --mount vs -v are true? A) --mount type=bind fails if the host path does not exist B) -v creates a missing host directory C) Only -v supports tmpfs D) --mount cannot mount named volumes", "<p><b>A and B.</b> C: <code>--mount type=tmpfs</code> works (and <code>--tmpfs</code>). D: <code>--mount type=volume,src=name,dst=/path</code> mounts named volumes.</p>"],
        ["dca", "Q44 (Storage). An empty named volume is mounted at /usr/share/nginx/html in nginx:1.27-alpine. What does the container see? A) An empty directory B) The image's default files, copied into the volume C) An error D) The host's /usr/share/nginx/html", "<p><b>B.</b> Docker copies image content at the mount point into an <i>empty named</i> volume on first mount. A would happen with a bind mount of an empty host dir (which hides the image content). C and D are wrong.</p>"],
        ["dca", "Q45 (Storage). What is the difference between a storage driver and a volume driver? A) None B) Storage driver manages image layers and the container writable layer (e.g., overlay2); a volume driver manages volumes (local, NFS, cloud block storage) C) Storage driver is for Swarm only D) Volume drivers replace overlay2", "<p><b>B.</b> They are different subsystems: one stacks layers for container root filesystems, the other provisions persistent mounts. C and D are false; A ignores the distinction the exam tests.</p>"]
      ],
      gotchas: [
        "<b>Reading too fast:</b> \"stops new tasks but keeps existing\" (pause) vs \"moves tasks away\" (drain) differ by one clause.",
        "<b>Which TWO:</b> a third plausible option always hides one wrong detail: a flag that doesn't exist, a default that's different, a feature of another tool.",
        "<b>Behaviour that changed across versions</b> (volume prune scope, dual logging, job modes): if an option depends on version, prefer the answer that matches the documented current behaviour.",
        "<b>Q42-style questions</b> hide an image-level detail (the VOLUME instruction) behind a container-level question.",
        "<b>Spending 5 minutes on one item.</b> At ~1.5 minutes per question, an overrun on two items costs you a question at the end.",
        "<b>Scoring only the total.</b> A good total can hide a weak domain; the real exam may weight it more heavily than your mock did."
      ],
      best: [
        "Sit the mock in one block, timed, with no notes or terminal.",
        "Mark guesses; review guessed-correct answers as if they were wrong.",
        "Score per domain and drill the weakest domain on a real machine.",
        "Re-take in shuffled order after a few days; then write five of your own questions per weak domain.",
        "Stop taking mocks the day before the exam; review the cold cheat sheets instead."
      ],
      lab: [
        "<b>Set up exam conditions</b>: a quiet room, 70-minute timer, phone away, no notes or terminal. Have paper with numbers 1-45; write a letter (or two for TWO-type) and a ? for guesses.",
        "<b>DOMC practice</b>: for at least 15 questions, read only the stem, write your predicted answer, then read options one at a time, deciding YES/NO for each before reading the next. Don't change earlier decisions.",
        "<b>Score</b>: open the answers, 1 point each (both letters must be right for TWO-type). Total per domain with the table: Orchestration /11, Images /9, Install /7, Networking /7, Security /7, Storage /4.",
        "<b>Review</b>: for every miss and every ?, write one sentence on the mechanism and run the command that proves it on a lab machine (e.g., create the default-bridge DNS failure for Q28, a pending constraint for Q8).",
        "<b>Interpret</b>: ≥ 80% overall and ≥ 70% per domain means book the real exam (after checking the official guide); 65-79% means one more week focused on the weak domains; below 65% means redo the course days mapped to that domain.",
        "<b>Done when:</b> you have a per-domain score sheet, a written mechanism for every miss, and a re-take score of 85% or more."
      ],
      teach: `<p>"I sit the mock exactly like the real one: 45 questions, 70 minutes, no notes. For DOMC practice I read the stem, predict my answer, then judge each option alone, yes or no. Afterwards I don't just count; I score per domain, and for every wrong answer and every lucky guess I write the mechanism and prove it on a machine."</p>
<p>"The distractors teach the most: a real command with a fake flag, the right idea with the wrong default, the Compose behaviour offered for a Swarm question, an image detail hidden behind a container question. When I can explain why each wrong option is wrong, I'm ready to book."</p>`
    }
  ],
  quiz: [
    { q: "Monday 09:00: the shop runs on one VM with Compose (nginx, api ×3, redis, postgres). Marketing expects 5× traffic on Friday. Monitoring shows the VM at 85% CPU and PostgreSQL at 90 of 100 connections. Give a step-by-step plan for Friday.", ans: "Add PgBouncer and right-size pools first, cache hot reads in Redis, then add capacity: move PostgreSQL to a managed instance and run the stateless tier on multiple hosts (Swarm or a bigger VM) behind a load balancer; load-test before Friday.", why: "Connections, not CPU, will fail first: more API replicas on the same DB would exceed <code>max_connections</code>. PgBouncer in transaction mode multiplexes them. Caching reduces DB load. One VM can't scale 5×, so separate data (managed DB/Redis) from the stateless API, which can then scale horizontally across nodes (Swarm stack with the routing mesh behind a cloud LB). Verify with a load test and set alerts on 5xx and p95 latency." },
    { q: "A Swarm rolling update to <code>api:2.0</code> adds a NOT NULL column <code>orders.currency</code> via a migration that runs in the container entrypoint. Halfway through, old 1.9 tasks start failing inserts, the update monitor sees errors and rolls back, and now 1.9 tasks <i>still</i> fail. Explain the chain and the correct process.", ans: "The schema change was not backward compatible and migrations ran per replica: 1.9 code inserts without currency and violates NOT NULL; rolling back the code doesn't roll back the schema. Use expand/contract and a one-off migration job.", why: "Correct process: release A runs a single migration job adding <code>currency</code> as nullable (or with a default), code writes it; backfill in batches; release B makes it NOT NULL once all writers set it. Each step works with the previous code version, so mixed versions during rolling updates and rollbacks are safe. Immediate fix now: <code>ALTER TABLE orders ALTER COLUMN currency SET DEFAULT 'EUR'</code> (or drop NOT NULL) so 1.9 works, then redo the release properly." },
    { q: "Users report being logged out at random after the API was scaled from 1 to 3 replicas behind nginx. Sessions were stored in a Python dict in the FastAPI process. Diagnose and give two fixes, with trade-offs.", ans: "Each replica has its own in-memory session store; requests land on different replicas, which don't know the session. Fix with a shared Redis session store or stateless signed tokens (JWT).", why: "Redis sessions: simple, server-side revocation, Redis must be highly available. JWT: no shared lookup, but revocation needs short expiry plus refresh tokens (often stored in Redis anyway). Sticky sessions (<code>ip_hash</code> in nginx) hide the bug but lose sessions on deploys and replica failures and unbalance load." },
    { q: "During every deploy on Swarm (start-first, parallelism 1), clients see a burst of 502s lasting about 10 seconds per replica. The Dockerfile ends with <code>CMD uvicorn main:app --host 0.0.0.0 --port 8000</code>. There is no healthcheck. Find both problems and fix them.", code: "CMD uvicorn main:app --host 0.0.0.0 --port 8000", lang: "dockerfile", ans: "No health check, so new tasks get traffic before the app is ready; shell-form CMD, so SIGTERM goes to /bin/sh and uvicorn is SIGKILLed after 10 s with requests in flight.", why: "Use exec form <code>CMD [\"uvicorn\", \"main:app\", \"--host\", \"0.0.0.0\", \"--port\", \"8000\"]</code> so uvicorn is PID 1 and shuts down gracefully; add a <code>HEALTHCHECK</code> (or stack <code>healthcheck</code>) with a <code>start_period</code> so the task joins the VIP only when healthy; optionally raise <code>stop_grace_period</code> for long requests and set <code>update_config.monitor</code> with <code>failure_action: rollback</code>." },
    { q: "Saturday 02:00: a 3-manager, 4-worker swarm. A hypervisor failure takes down mgr2, mgr3 and wrk4 permanently. The shop is still serving traffic, but <code>wrk4</code>'s tasks were never replaced and CI cannot deploy. Write the recovery runbook in order.", ans: "On mgr1: <code>docker swarm init --force-new-cluster --advertise-addr &lt;mgr1-ip&gt;</code>; remove the dead nodes; promote two healthy workers (in different failure domains) to managers; verify services reconcile and replace wrk4's tasks; then restore capacity and fix the manager placement.", why: "With 1 of 3 managers, quorum is lost: running tasks continue but nothing is rescheduled and no deploys commit. Force-new-cluster keeps state with a single manager; <code>docker node rm --force</code> any dead nodes still listed (you cannot demote them first because they are gone); <code>docker node promote wrk1 wrk2</code>; check <code>docker node ls</code>, <code>docker service ls</code> for full replicas, and <code>docker stack ps shop</code>. If autolock is on, you need the unlock key after any restart. Post-incident: managers on separate hosts/AZs, and verify the latest <code>/var/lib/docker/swarm</code> backup." },
    { q: "A security review of the production stack finds: the API runs as root, <code>/var/run/docker.sock</code> is bind-mounted into the monitoring container, the DB password is in <code>environment:</code> in the stack file, and dockerd listens on <code>tcp://0.0.0.0:2375</code>. Prioritise and fix.", ans: "First close 2375 (unauthenticated root over the network), then remove or proxy the socket mount, then move the password to a Swarm secret, then run the API as a non-root user with dropped capabilities.", why: "2375 lets anyone who can reach it run privileged containers: switch to TLS on 2376 with client certs or SSH contexts, and firewall it. The socket mount is root on the host for whoever compromises the monitoring container: use a read-only socket proxy that allows only the needed API calls, or an agent that doesn't need the socket. Secrets: <code>docker secret create</code> and <code>POSTGRES_PASSWORD_FILE</code>/<code>DB_PASSWORD_FILE</code>, then rotate the leaked password. Finally <code>USER 10001</code> in the Dockerfile, <code>cap_drop: [ALL]</code>, <code>read_only: true</code> with a tmpfs for <code>/tmp</code>." }
  ]
}
]});
