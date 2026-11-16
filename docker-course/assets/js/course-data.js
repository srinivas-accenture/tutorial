/* Course map (weeks → days → topics with search keywords), career ladder, DCA exam map and glossary.
   Single source of truth: the sidebar, home page, router and pager all read from here.
   Topic ids must match the ids in content/weekN.js. */
window.JSC = window.JSC || {};
JSC.COURSE=[
{w:1,title:"Docker foundations: from zero to Compose",sub:"Containers vs VMs, architecture, lifecycle, images and Dockerfiles, BuildKit, networking, storage and multi-container Compose stacks",days:[
{n:1,t:"Foundations and architecture",tp:[["d1-why-containers","What Docker solves: containers vs VMs vs processes","containerization vm hypervisor process image container"],["d1-architecture","Docker architecture: client, Engine, API, containerd, runc and OCI","daemon dockerd rest api socket desktop registry hub repository tag containerd runc oci shim"],["d1-lifecycle","The container lifecycle and what docker run really does","namespaces cgroups run pull create start stop kill rm pause exit code nginx"]]},
{n:2,t:"Images and Dockerfiles",tp:[["d2-images-layers","Images, layers, copy-on-write and image management","overlayfs overlay2 copy-on-write writable layer tag digest id save load export import commit history prune"],["d2-dockerfile","Dockerfile instructions in depth","from workdir copy add run cmd entrypoint env arg expose user label volume healthcheck shell exec form"],["d2-builds","Build context, cache, multi-stage builds and BuildKit","dockerignore cache invalidation multi-stage buildx multi-platform cache mount build secret target fastapi"]]},
{n:3,t:"Networking",tp:[["d3-networks","Container networking: namespaces, bridges, host, none and DNS","network namespace veth bridge docker0 custom bridge host none overlay macvlan ipvlan dns 127.0.0.11 alias iptables"],["d3-ports","Ports, publishing and connectivity (why localhost:5432 fails)","expose publish -p 0.0.0.0 127.0.0.1 localhost host.docker.internal container-to-container postgres"]]},
{n:4,t:"Storage",tp:[["d4-storage","Container storage: writable layer, bind mounts, volumes and tmpfs","ephemeral bind mount named volume anonymous volume tmpfs --mount -v volume driver permissions uid"],["d4-persistence","Data persistence, database volumes and backups","postgres pgdata persistence recreate backup restore storage driver overlay2"]]},
{n:5,t:"Docker Compose",tp:[["d5-compose","Compose files: services, networks, volumes and configuration","compose yaml services build image ports environment env_file interpolation profiles override include"],["d5-compose-stack","A four-service stack: React → FastAPI → Redis → PostgreSQL","depends_on healthcheck condition restart service discovery up down logs exec ps watch"]]}]},
{w:2,title:"Production, operations and DCA",sub:"Production images and runtime, registries and CI, security, troubleshooting, internals, Swarm, Kubernetes, real architecture and DCA revision",days:[
{n:6,t:"Production Docker",tp:[["d6-prod-images","Production images: minimal bases, non-root and health checks","slim alpine distroless musl non-root healthcheck digest pinning image size"],["d6-runtime","Running in production: limits, OOM, signals, PID 1 and logging","cpu memory limit oom 137 sigterm sigkill pid 1 tini init graceful shutdown restart policy logging driver rotation"],["d6-registries","Registries, tagging, CI pipelines and daemon configuration","docker login tag push pull private registry ci pipeline daemon.json registry mirror insecure registry context"]]},
{n:7,t:"Security",tp:[["d7-security","Container security: capabilities, seccomp, AppArmor, user namespaces and rootless","cap-drop cap-add seccomp apparmor selinux userns-remap rootless read-only no-new-privileges privileged docker socket"],["d7-supply-chain","Supply-chain security: scanning, SBOMs, signing and secrets","cve scan scout trivy sbom provenance content trust notary signing build secret swarm secret mke msr rbac"]]},
{n:8,t:"Troubleshooting and internals",tp:[["d8-troubleshooting","Troubleshooting broken containers: a systematic method","exits immediately logs inspect exec stats top events network inspect volume inspect system df prune unreachable"],["d8-internals","Internals end to end: CLI → Engine → containerd → runc → kernel","containerd shim runc namespaces pid net mnt uts ipc user cgroups v2 overlayfs storage driver logging driver"]]},
{n:9,t:"Orchestration",tp:[["d9-swarm","Docker Swarm: services, stacks, Raft, routing mesh and rolling updates","swarm init join manager worker raft quorum service replicated global scale update rollback constraint drain stack overlay ingress secret config autolock"],["d9-kubernetes","Kubernetes essentials for Docker users","pod deployment replicaset service configmap secret kubectl ingress compose limitations docker vs kubernetes"]]},
{n:10,t:"Architecture and DCA revision",tp:[["d10-architecture","Real architecture: scaling stateless services behind a load balancer","load balancer horizontal scaling stateless sessions redis shared database failure recovery deployment ci/cd"],["d10-dca-revision","DCA exam map, terminology and rapid-fire revision","dca domains orchestration image registry installation networking security storage rapid fire"],["d10-mock-exam","Mock certification exam with explanations","mock exam domc scenario questions practice test"]]}]}
];

/* DCA blueprint as commonly published. Weights and format can change: confirm against the current official exam guide. */
JSC.EXAM=[
["Orchestration","25%","Days 9, 10","Swarm init/join, managers and workers, Raft quorum, services, stacks, scaling, rolling updates, placement, secrets/configs, Kubernetes basics"],
["Image creation, management and registry","20%","Days 2, 6, 7","Dockerfile instructions, multi-stage builds, tagging, inspect/history, pruning, pushing/pulling, registries, signing"],
["Installation and configuration","15%","Days 1, 6, 8","Engine install, daemon.json, storage and logging drivers, contexts, rootless, enterprise components"],
["Networking","15%","Days 3, 9","bridge/host/none/overlay/macvlan, DNS, publishing, routing mesh, troubleshooting connectivity"],
["Security","15%","Days 7, 9","capabilities, seccomp, AppArmor, user namespaces, Content Trust, secrets, RBAC concepts, mutually-authenticated TLS in Swarm"],
["Storage and volumes","10%","Days 4, 8","volumes vs bind mounts vs tmpfs, volume drivers, storage drivers, persistence, cleanup"]
];

JSC.GLOSSARY=[
["Container","A normal Linux process (or group of processes) isolated with namespaces and limited with cgroups, running from an image's filesystem."],
["Image","A read-only, layered filesystem plus metadata (entrypoint, env, ports) used to create containers. Identified by a content digest."],
["Layer","One read-only filesystem diff in an image, usually produced by one Dockerfile instruction. Layers are shared between images."],
["Copy-on-write","A file from a lower read-only layer is copied up into the container's writable layer only when it is modified."],
["OverlayFS / overlay2","The Linux union filesystem (and Docker's default storage driver) that stacks image layers under a writable layer."],
["Dockerfile","A text recipe of instructions (FROM, RUN, COPY…) that BuildKit executes to produce an image."],
["Build context","The set of files sent to the builder with docker build. .dockerignore removes files from it."],
["Multi-stage build","A Dockerfile with several FROM stages, copying only the needed artifacts into a small final image."],
["BuildKit","Docker's modern build engine: parallel stages, better caching, cache and secret mounts, multi-platform builds via buildx."],
["Registry","A server that stores and serves images (Docker Hub, GHCR, ECR, a self-hosted registry)."],
["Repository","A named collection of related images in a registry, distinguished by tags (nginx:1.27, nginx:alpine)."],
["Tag","A mutable, human-friendly pointer to an image in a repository. latest is just a default tag name, not 'the newest'."],
["Digest","An immutable sha256 content hash that identifies an exact image (name@sha256:…)."],
["Docker Engine (dockerd)","The daemon that serves the Docker API and manages images, containers, networks and volumes."],
["Docker socket","The Unix socket (/var/run/docker.sock) where dockerd listens. Access to it is equivalent to root on the host."],
["containerd","The container runtime daemon that manages container lifecycle, images and snapshots beneath dockerd."],
["runc","The low-level OCI runtime that creates namespaces and cgroups and starts the container process, then exits."],
["containerd-shim","A small per-container process that keeps the container's stdio and exit status, so dockerd/containerd can restart without killing containers."],
["OCI","Open Container Initiative: open standards for image format, runtime and distribution."],
["Namespace","A kernel feature that gives a process its own view of a resource: pid, net, mnt, uts, ipc, user, cgroup."],
["cgroup","Control group: a kernel feature that limits and accounts CPU, memory, I/O and process counts."],
["Bridge network","A virtual switch on the host; containers on the same user-defined bridge reach each other by name through Docker's DNS."],
["Overlay network","A multi-host network (VXLAN) used by Swarm services to talk across nodes."],
["Embedded DNS","Docker's resolver at 127.0.0.11 inside containers on user-defined networks; it resolves service and container names."],
["Port publishing","Mapping a host port to a container port (-p 8080:80) using NAT rules on the host."],
["Bind mount","Mounting a specific host path into a container. Great for development, host-dependent in production."],
["Named volume","Docker-managed storage that outlives containers; the default way to persist database data."],
["tmpfs mount","An in-memory mount that is never written to disk; disappears when the container stops."],
["Docker Compose","A tool that defines and runs a multi-container application from a YAML file on one host."],
["Health check","A command Docker runs periodically inside a container to mark it healthy or unhealthy."],
["Restart policy","Rule for restarting a container when it exits: no, on-failure, always, unless-stopped."],
["PID 1","The first process in a container's PID namespace. It receives stop signals and must reap zombie children."],
["Exit code 137","128 + 9: the process was killed with SIGKILL, often by the OOM killer or after the stop timeout."],
["Capability","A slice of root's power (NET_ADMIN, SYS_ADMIN…). Containers get a reduced default set; drop more with --cap-drop."],
["seccomp","A kernel filter that limits which system calls a process may make. Docker applies a default profile."],
["Rootless mode","Running the Docker daemon and containers as an unprivileged user, limiting the damage of a breakout."],
["SBOM","Software Bill of Materials: a list of every package inside an image, used for vulnerability and license tracking."],
["Docker Content Trust","Image signing and verification (Notary). With DOCKER_CONTENT_TRUST=1, unsigned images are refused."],
["Swarm","Docker's built-in orchestrator: a cluster of managers (Raft consensus) and workers running services."],
["Service (Swarm)","The desired state of a set of identical tasks (containers): image, replicas, networks, update policy."],
["Raft quorum","A majority of managers ((N/2)+1). Without quorum the cluster cannot change state. Use 3 or 5 managers."],
["Routing mesh","Swarm's ingress network: a published port on any node is load-balanced to a healthy task on any node."],
["Stack","A group of Swarm services deployed together from a Compose file with docker stack deploy."],
["Pod","Kubernetes' smallest unit: one or more containers sharing a network namespace and volumes."],
["Stateless service","A service that keeps no client state in its own process or disk, so any replica can serve any request."]
];

JSC.LADDER=[
["Fresher","Days 1-4","Explain containers vs VMs, images vs containers, and the lifecycle. Run, inspect and clean up containers; write a simple Dockerfile; use volumes and user-defined networks."],
["Mid-level","Days 1-5, 8","Write cached, multi-stage Dockerfiles; build a Compose stack with health-checked dependencies; debug a container that exits, can't be reached, or can't reach its database."],
["Senior","Days 6-8","Ship production images (small, non-root, pinned), set limits and graceful shutdown, configure logging, push through CI to a registry, and harden containers."],
["Lead / DevOps","Days 6-9","Define team standards for images and Compose, run Swarm services with rolling updates and secrets, and decide when a team needs Kubernetes."],
["Architect","Days 9-10","Design stateless, horizontally scaled services with shared state in Redis/PostgreSQL, plan failure recovery and deployments, and justify Compose vs Swarm vs Kubernetes."],
["DCA candidate","All, then Day 10","Know every exam domain, answer scenario questions without notes, and back it with months of real hands-on use."]
];
