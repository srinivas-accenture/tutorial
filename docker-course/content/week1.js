/* Week 1: Docker foundations, from zero to Compose — content only. Rendered by assets/js/render.js; loaded on demand by assets/js/app.js.
   The week revision sheet is built from each day's "rev" bullets. */
JSC.registerWeek({w:1,days:[
/* ===== Day 1 ===== */
{
  n: 1,
  title: "Foundations and architecture",
  goal: `<b>By the end of today</b> you can explain, from first principles, why containers exist and how they differ from VMs and plain processes; trace a <code>docker run</code> from the CLI through the Engine, containerd, the shim and runc down to kernel namespaces and cgroups; and drive a container through every lifecycle state while reading its exit code like a diagnosis.`,
  rev: [
    `<b>A container is a process</b> (or process tree) started with its own <b>namespaces</b> (what it can see: pid, net, mnt, uts, ipc, user, cgroup) and <b>cgroups</b> (what it can use: CPU, memory, pids, I/O). There is no guest kernel; every container shares the host kernel. A VM virtualises hardware and boots its own kernel.`,
    `<b>Image vs container:</b> an image is an immutable, layered filesystem plus config (entrypoint, env, ports); a container is a running (or stopped) instance of it with its own writable layer, name, network and state. One image, many containers. A <b>Dockerfile</b> is the recipe that builds an image.`,
    `<b>Architecture chain:</b> <code>docker</code> CLI → REST API over <code>/var/run/docker.sock</code> → <code>dockerd</code> (images, networks, volumes, API) → <code>containerd</code> (gRPC; container and task supervision) → <code>containerd-shim-runc-v2</code> (one per container, stays alive) → <code>runc</code> (OCI runtime: creates namespaces/cgroups, execs the entrypoint, exits) → kernel. Access to the Docker socket is equivalent to root on the host.`,
    `<b>OCI</b> standardises three things: the <b>image</b> format, the <b>runtime</b> (bundle + <code>config.json</code>, implemented by runc), and the <b>distribution</b> API (how registries push/pull). Registry → repository → tag (<code>docker.io/library/nginx:1.27-alpine</code>); a digest (<code>@sha256:…</code>) pins exact content.`,
    `<b>Lifecycle:</b> created → running ⇄ paused; running → exited (stop/kill/process ends) → removed; restarting under a restart policy; dead when removal failed. <code>docker stop</code> = SIGTERM, wait 10 s, then SIGKILL; <code>docker kill</code> = SIGKILL immediately. Exit codes: 0 ok, 1 app error, 125 Docker itself failed, 126 not executable, 127 not found, 137 = 128+9 (SIGKILL or OOM), 143 = 128+15 (SIGTERM).`
  ],
  topics: [
    /* ------------------------------------------------------------------ */
    {
      id: "d1-why-containers",
      title: "What Docker solves: containers vs VMs vs processes",
      lv: ["fresher", "mid", "senior", "dca"],
      eli5: `<p>Before the 1950s, ships were loaded with loose sacks, barrels and crates of every shape. Each port needed different cranes and workers, and things got lost or broken. Then someone invented the <b>shipping container</b>: one standard steel box. The ship, the crane and the truck don't care whether the box holds bananas or laptops; they only know how to move <i>boxes</i>.</p>
<p>Software had the same problem. Your FastAPI app needs Python 3.12, a certain version of <code>libpq</code>, some environment variables and a particular folder layout. Your laptop has those; the server has slightly different ones. "It works on my machine" is the software version of the broken banana crate.</p>
<p>A <b>Docker image</b> is the standard box: your app <i>plus everything it needs</i>, packed the same way every time. A <b>container</b> is that box opened and running. Any machine with Docker can run any box, without caring what is inside.</p>
<p>And a <b>virtual machine</b>? That's shipping a whole <i>house</i> (with its own foundations, plumbing and electricity) just to move one sofa. It works, but it is heavy. A container is more like a <b>flat in an apartment block</b>: its own front door, rooms and meter, but it shares the building's foundations (the host's Linux kernel).</p>`,
      what: `<p><b>Containerization</b> is packaging an application together with its runtime, libraries, and configuration into a standard unit (an <b>image</b>) and running it as an <b>isolated process</b> (a <b>container</b>) on a shared operating-system kernel. Docker is the tool that made this practical in 2013 by combining existing Linux kernel features with a simple image format, a build tool and a registry.</p>
<h5>Container vs process: the key insight</h5>
<p>A container is <b>not</b> a tiny VM. On a Linux host a container <b>is a normal Linux process</b> (plus any children it forks) that the kernel has been told to treat specially:</p>
<ul class="pts">
<li><b>Namespaces</b> limit what the process can <i>see</i>: its own process tree where it is PID 1 (<code>pid</code>), its own network interfaces and ports (<code>net</code>), its own mount table and root filesystem (<code>mnt</code>), its own hostname (<code>uts</code>), its own System V IPC / POSIX message queues (<code>ipc</code>), optionally its own user-ID mapping (<code>user</code>) and its own view of the cgroup tree (<code>cgroup</code>).</li>
<li><b>Control groups (cgroups)</b> limit what it can <i>use</i>: memory, CPU time, number of processes, block I/O.</li>
<li>On top of that Docker adds a <b>root filesystem from an image</b> (so the process sees Debian or Alpine files, not the host's), dropped <b>Linux capabilities</b>, a <b>seccomp</b> syscall filter and an AppArmor/SELinux profile.</li>
</ul>
<p>Run <code>ps</code> on the host and you will see the container's <code>nginx</code> processes in the list like any other process. Same kernel, same scheduler, different "glasses". That is why containers start in milliseconds and cost almost nothing in memory beyond the app itself.</p>
<h5>Container vs virtual machine</h5>
<table class="tbl"><tr><th></th><th>Container</th><th>Virtual machine</th></tr>
<tr><td>What is isolated</td><td>A process tree, via kernel namespaces and cgroups</td><td>A whole computer, via virtualised hardware</td></tr>
<tr><td>Kernel</td><td>Shared with the host</td><td>Each VM boots its own guest kernel</td></tr>
<tr><td>Startup</td><td>Milliseconds to ~1 s (it is <code>fork</code>+<code>exec</code>)</td><td>Seconds to minutes (BIOS/UEFI, kernel boot, init)</td></tr>
<tr><td>Size</td><td>MBs to a few hundred MB; layers shared between images</td><td>GBs per disk image</td></tr>
<tr><td>Density</td><td>Hundreds per host</td><td>Tens per host</td></tr>
<tr><td>Isolation strength</td><td>Good, but a kernel bug can be a container escape</td><td>Stronger: the hypervisor is a smaller attack surface</td></tr>
<tr><td>OS flexibility</td><td>Linux containers need a Linux kernel (Windows containers need a Windows kernel)</td><td>Any guest OS on any host</td></tr></table>
<p>They are complementary, not rivals: in the cloud your containers almost always run <i>inside</i> VMs (an EC2 instance, a GKE node). And on a Mac or Windows laptop, Docker Desktop runs a small Linux VM so Linux containers have a Linux kernel to share.</p>
<h5>Hypervisors: type 1 vs type 2</h5>
<ul class="pts">
<li><b>Type 1 (bare-metal)</b>: the hypervisor runs directly on the hardware and the OSes run on top of it. Examples: VMware ESXi, Microsoft Hyper-V, Xen; KVM is a Linux kernel module that turns Linux itself into a type-1-style hypervisor. This is what clouds use.</li>
<li><b>Type 2 (hosted)</b>: the hypervisor is an application on a normal OS. Examples: VirtualBox, VMware Workstation/Fusion, Parallels.</li>
<li><b>Docker is neither.</b> There is no hypervisor and no virtual hardware for a Linux container on a Linux host. Docker is a <b>process manager plus packaging system</b> that asks the host kernel for isolation. The only time a hypervisor appears is when the host kernel is not Linux (Docker Desktop's VM), or when you choose a sandboxed runtime such as Kata Containers (micro-VM per container) or gVisor (user-space kernel).</li>
</ul>
<h5>Image vs container</h5>
<ul class="pts">
<li><b>Image</b>: a read-only template, made of stacked filesystem <b>layers</b> plus a JSON <b>config</b> (default command, environment, working directory, exposed ports, user). Identified by a name:tag (<code>python:3.12-slim</code>) and a content digest. Images never change; a "new version" is a new image.</li>
<li><b>Container</b>: an image + a thin <b>writable layer</b> + runtime settings (name, ports, volumes, env overrides, limits) + state (created, running, exited…). Many containers can run from one image; they share the read-only layers and each has its own writable layer.</li>
<li>The relationship is like <b>class and object</b> in programming, or <b>program file and running process</b>.</li>
</ul>
<h5>What a Dockerfile is (preview of Day 2)</h5>
<p>A <code>Dockerfile</code> is a text file of instructions (<code>FROM</code>, <code>COPY</code>, <code>RUN</code>, <code>CMD</code>…) that <code>docker build</code> executes to produce an image. It turns "how to set up the server" from a wiki page into code that is versioned, reviewed and reproducible:</p>
<pre><code>FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]</code></pre>
<p>Dockerfile → <code>docker build</code> → image → <code>docker run</code> → container. Day 2 covers every instruction.</p>`,
      why: `<p>Before containers, deploying the running example (React → FastAPI → Redis → PostgreSQL) meant:</p>
<ul class="pts">
<li><b>"Works on my machine."</b> A developer on macOS with Python 3.12 and Homebrew's OpenSSL ships code to an Ubuntu server with Python 3.10 and a different OpenSSL. Tests passed locally; production crashes on import.</li>
<li><b>Dependency conflicts.</b> Two services on one server need different versions of the same library (service A needs <code>psycopg2</code> built against libpq 13, service B needs 16; one Node app needs Node 18, another Node 22). You either buy another server or fight with virtualenvs, nvm, alternatives and LD_LIBRARY_PATH.</li>
<li><b>Environment drift.</b> Servers configured by hand (or by scripts that ran once in 2019) slowly diverge: someone ran <code>apt upgrade</code> on one box, hot-fixed a config on another. Staging no longer resembles production, and nobody knows exactly what is installed where. These are "snowflake servers".</li>
<li><b>Slow, risky onboarding and deploys.</b> A new developer spends two days installing PostgreSQL, Redis and the right Python. A deploy is a runbook of SSH commands; rollback is "hope we remember what changed".</li>
<li><b>VMs helped, but heavily.</b> One VM per service solves conflicts but costs a full OS per service: GBs of disk, minutes to boot, OS patching for each one, and poor density.</li>
</ul>
<p>Docker's answer: put the app and its <i>entire userspace</i> into an immutable image, built from a Dockerfile in the repo. The same image (same digest) runs on the laptop, in CI and in production; only configuration (env vars, secrets, volumes) differs. Conflicts vanish because every service carries its own libraries. Drift vanishes because you never patch a running container: you build a new image and replace it. Onboarding becomes <code>docker compose up</code>.</p>
<p>What Docker does <b>not</b> solve: kernel differences (a container uses the host kernel, so kernel features and syscalls depend on the host), CPU architecture (an <code>amd64</code> image will not run natively on <code>arm64</code>, see Day 2's multi-platform builds), and bad configuration (wrong env vars still break things, just reproducibly).</p>`,
      diagram: {
        html: lanes([
          ["Bare metal (pre-2005)", ["App A + App B", "Shared libraries (conflicts!)", "Host OS", "Hardware"]],
          ["Virtual machines", ["App A | App B", "Libs A | Libs B", "Guest OS + kernel | Guest OS + kernel", "Hypervisor (type 1 or 2)", "Hardware"]],
          ["Containers", ["App A | App B", "Libs A | Libs B (image layers)", "Docker Engine / containerd / runc", "ONE host Linux kernel (namespaces + cgroups)", "Hardware (or a VM)"]]
        ]),
        steps: [
          `<b>Bare metal:</b> all apps share one userspace, so their library versions collide and the server drifts over time.`,
          `<b>VMs:</b> each app gets its own complete OS including a kernel; strong isolation, but every VM pays for a kernel, init system and OS patches.`,
          `<b>Containers:</b> each app gets its own <i>userspace</i> (libraries, files) from an image, but all share the host kernel. Isolation comes from namespaces (what you see) and cgroups (what you use).`,
          `In production the third column usually sits on top of the second: containers run inside cloud VMs, which run on a type-1 hypervisor.`
        ]
      },
      cmds: [
        {
          t: "Check that Docker is installed and see both client and server",
          lang: "sh",
          code: `docker version
docker info --format '{{.ServerVersion}} {{.OperatingSystem}} {{.KernelVersion}} cgroup v{{.CgroupVersion}}'`,
          out: `Client:
 Version:           27.x
 API version:       1.47
 OS/Arch:           linux/amd64
 ...
Server: Docker Engine - Community
 Engine:
  Version:          27.x
  API version:      1.47 (minimum version 1.24)
 containerd:
  Version:          1.7.x
 runc:
  Version:          1.1.x
...
27.x Ubuntu 24.04 LTS 6.8.0-45-generic cgroup v2`,
          note: `<p><code>docker version</code> shows <b>two</b> programs: the client (CLI) and the server (Engine), plus the containerd and runc versions underneath. If the Server section errors with "Cannot connect to the Docker daemon", the CLI is fine but <code>dockerd</code> is not running or you lack permission on the socket. Exact versions differ on your machine.</p>`
        },
        {
          t: "Your first container: proof that it is just a process",
          lang: "sh",
          code: `# start a container that sleeps, in the background
docker run -d --name sleeper alpine:3.20 sleep 1000

# inside the container: sleep is PID 1 and almost nothing else exists
docker exec sleeper ps

# on the host (Linux; on Docker Desktop run this inside the VM): the same process, different PID
ps -ef | grep "sleep 1000" | grep -v grep
docker inspect --format '{{.State.Pid}}' sleeper`,
          out: `PID   USER     TIME  COMMAND
    1 root      0:00 sleep 1000
    7 root      0:00 ps
root      48213  48190  0 10:02 ?        00:00:00 sleep 1000
48213`,
          note: `<p>Inside, the process sees itself as PID 1 (pid namespace). On the host the very same process has PID 48213, and its parent (48190) is the <code>containerd-shim-runc-v2</code>. No VM, no guest kernel.</p>`
        },
        {
          t: "Same kernel, different userspace",
          lang: "sh",
          code: `uname -r                                   # host kernel
docker run --rm alpine:3.20 uname -r       # the same kernel version
docker run --rm ubuntu:24.04 cat /etc/os-release | head -2
docker run --rm alpine:3.20 cat /etc/os-release | head -2`,
          out: `6.8.0-45-generic
6.8.0-45-generic
PRETTY_NAME="Ubuntu 24.04.1 LTS"
NAME="Ubuntu"
NAME="Alpine Linux"
ID=alpine`,
          note: `<p>An "Ubuntu container" is Ubuntu's <i>userspace files</i> running on <i>your</i> kernel. That's why you cannot run a container that needs a newer kernel feature than the host has, and why a Linux image needs a Linux kernel. On Docker Desktop, <code>uname -r</code> inside a container shows the Desktop VM's kernel, not macOS or Windows.</p>`
        },
        {
          t: "Look at the namespaces of a container process",
          lang: "sh",
          code: `PID=$(docker inspect --format '{{.State.Pid}}' sleeper)
sudo ls -l /proc/$PID/ns
sudo ls -l /proc/self/ns        # compare with your shell's namespaces
sudo lsns -p $PID               # util-linux: list namespaces of a process`,
          out: `lrwxrwxrwx 1 root root 0 ... cgroup -> 'cgroup:[4026532451]'
lrwxrwxrwx 1 root root 0 ... ipc -> 'ipc:[4026532389]'
lrwxrwxrwx 1 root root 0 ... mnt -> 'mnt:[4026532387]'
lrwxrwxrwx 1 root root 0 ... net -> 'net:[4026532392]'
lrwxrwxrwx 1 root root 0 ... pid -> 'pid:[4026532390]'
lrwxrwxrwx 1 root root 0 ... user -> 'user:[4026531837]'
lrwxrwxrwx 1 root root 0 ... uts -> 'uts:[4026532388]'
...`,
          note: `<p>Different inode numbers from your shell's namespaces mean "a separate namespace". Notice <code>user</code> is usually the <b>same</b> as the host's: by default Docker does <b>not</b> use a user namespace, so root in the container is UID 0 on the host (mitigated by capabilities and seccomp). User-namespace remapping (<code>userns-remap</code>) or rootless Docker changes that.</p>`
        },
        {
          t: "Compare cost: a container vs. what a VM would need",
          lang: "sh",
          code: `time docker run --rm alpine:3.20 true
docker stats --no-stream sleeper
docker image ls alpine:3.20`,
          out: `real    0m0.42s
CONTAINER ID   NAME      CPU %     MEM USAGE / LIMIT     MEM %  ...
3f1c2a9d8e7b   sleeper   0.00%     412KiB / 15.5GiB      0.00%  ...
REPOSITORY   TAG    IMAGE ID       CREATED       SIZE
alpine       3.20   91ef0af61f39   2 weeks ago   7.8MB`,
          note: `<p>Under half a second to create, run and destroy a container; a few hundred KiB of memory for a sleeping process; an 8 MB image. A VM with a minimal OS needs hundreds of MB of RAM and many seconds to boot.</p>`
        },
        {
          t: "Clean up",
          lang: "sh",
          code: `docker rm -f sleeper`,
          out: `sleeper`
        }
      ],
      internals: `<p>When Docker starts a container, the final step is runc calling the kernel. Conceptually it does:</p>
<ul class="pts">
<li><code>clone()</code> / <code>unshare()</code> with flags <code>CLONE_NEWPID | CLONE_NEWNET | CLONE_NEWNS | CLONE_NEWUTS | CLONE_NEWIPC | CLONE_NEWCGROUP</code> (and <code>CLONE_NEWUSER</code> if user namespaces are configured). Each flag creates a fresh namespace; the namespaces appear as links in <code>/proc/&lt;pid&gt;/ns/</code>.</li>
<li>Writes the process's PID into a <b>cgroup</b> directory such as <code>/sys/fs/cgroup/system.slice/docker-&lt;id&gt;.scope/</code> (cgroup v2 with the systemd driver) and writes limits into files like <code>memory.max</code>, <code>cpu.max</code>, <code>pids.max</code>.</li>
<li>Mounts the image's merged filesystem and calls <code>pivot_root</code> so <code>/</code> is the image's root; mounts a fresh <code>/proc</code>, <code>/dev</code>, <code>/sys</code> (read-only), and <code>/etc/hosts</code>, <code>/etc/resolv.conf</code>, <code>/etc/hostname</code> files that Docker generated.</li>
<li>Drops most Linux capabilities (keeping a default set like <code>CHOWN</code>, <code>NET_BIND_SERVICE</code>, <code>KILL</code>, <code>SETUID</code>…; dropping <code>SYS_ADMIN</code>, <code>NET_ADMIN</code>, <code>SYS_MODULE</code>…), applies the default seccomp profile (which blocks dozens of dangerous syscalls) and an AppArmor/SELinux label.</li>
<li><code>execve()</code>s your entrypoint. From here on, the kernel schedules it like any other process. There is no "container object" in the kernel; "container" is a user-space concept built from these pieces.</li>
</ul>
<p>That's also why the overhead is near zero: CPU instructions run directly on the CPU (no emulation, no trap-and-emulate), and syscalls go straight to the host kernel. The small overheads come from networking (a veth pair and bridge/NAT) and the overlay filesystem on writes. A VM instead goes through hardware virtualisation (Intel VT-x/AMD-V), a virtual device layer (virtio) and a second kernel.</p>
<p>Isolation strength follows from the same fact: all containers talk to one kernel. A kernel vulnerability reachable from inside a container can affect the host. Defences are layered: non-root users in containers, dropped capabilities, seccomp, read-only root filesystems, user namespaces/rootless mode, and for hostile multi-tenant workloads, a VM boundary (Kata, Firecracker, gVisor).</p>`,
      prod: `<p>In the running example, one Linux VM in the cloud runs four containers:</p>
<ul class="pts">
<li><b>web</b>: an Nginx image with the React production build baked in (static files), listening on 80/443.</li>
<li><b>api</b>: the FastAPI image (<code>python:3.12-slim</code> base, Uvicorn), 3 replicas.</li>
<li><b>redis</b>: <code>redis:7-alpine</code> for cache and rate limiting.</li>
<li><b>db</b>: <code>postgres:16</code> with its data on a named volume so the container can be destroyed and recreated without losing data (Day 5/6 cover volumes).</li>
</ul>
<p>Each container brings its own userspace: the API's Python 3.12 and libpq don't collide with anything on the host or in the other containers. The host only needs a kernel and Docker. The CI pipeline builds <code>registry.example.com/shop/api:1.8.3</code> once; staging and production run that <i>exact digest</i>, so "it passed staging" really means the same bits.</p>
<p>Why not one VM per service? Four VMs would need four kernels, four OS patch cycles, roughly 4× the base memory, and minutes to replace. With containers, a deploy is "pull new image, start new container, stop old one" in seconds, and rollback is starting the previous tag. Strong tenant isolation (e.g. untrusted customer code) is the case where you would still put a VM boundary around containers.</p>`,
      iq: [
        ["dca", "Which statement about Linux containers is correct? A) Each container runs its own kernel. B) Containers share the host kernel and are isolated with namespaces and cgroups. C) Containers require a type-2 hypervisor. D) Containers emulate CPU instructions.", `<p><b>B.</b> A container is a host process isolated by kernel namespaces (visibility) and limited by cgroups (resources). A is a VM property. C is wrong: Docker on Linux uses no hypervisor (Docker Desktop uses a VM only because macOS/Windows don't have a Linux kernel). D is wrong: instructions run natively; emulation (QEMU) only appears when you run a foreign CPU architecture.</p>`],
        ["dca", "Which TWO kernel features does Docker primarily rely on to isolate and limit containers?", `<p><b>Namespaces</b> (isolate what a process can see: PIDs, network, mounts, hostname, IPC, users, cgroup view) and <b>control groups</b> (limit and account CPU, memory, pids, I/O). Capabilities, seccomp and AppArmor/SELinux harden the process further, and union filesystems (OverlayFS) provide the image filesystem, but the two core isolation primitives are namespaces and cgroups.</p>`],
        ["fresher", "What is the difference between an image and a container?", `<p>An <b>image</b> is a read-only, layered template (filesystem + config) identified by a name:tag and digest. A <b>container</b> is a runnable instance of an image: the image's read-only layers plus a private writable layer, runtime settings (ports, env, volumes, limits) and a state. Like a class and its objects: <code>docker run</code> five times gives five containers from one image, sharing its layers on disk.</p>`],
        ["mid", "Is a container a lightweight VM? Explain precisely.", `<p>No. A VM virtualises <i>hardware</i>: a hypervisor presents virtual CPUs, memory and devices, and a guest OS with its own kernel boots on them. A container virtualises nothing: it is a host process started inside new namespaces with cgroup limits and an image as its root filesystem. Consequences: containers start in milliseconds, share the host kernel (so can't run a different OS kernel), have near-native performance, and have a weaker isolation boundary than a VM. "Lightweight VM" is a useful analogy for beginners but wrong for reasoning about security and kernel compatibility.</p>`],
        ["mid", "What is the difference between a type 1 and a type 2 hypervisor, and where does Docker fit?", `<p>A <b>type 1</b> hypervisor runs on bare metal (ESXi, Hyper-V, Xen, KVM-based clouds). A <b>type 2</b> runs as an application on a host OS (VirtualBox, VMware Workstation, Parallels). Docker is <b>neither</b>: on Linux it uses kernel features, not virtual hardware. Docker Desktop on macOS/Windows does run a lightweight Linux VM (using the platform's virtualisation framework or WSL 2), because Linux containers need a Linux kernel; the containers then run inside that VM.</p>`],
        ["senior", "Can a container built on Ubuntu run on a host running Fedora? Can it run on a Windows host? On an ARM Mac?", `<p><b>Fedora:</b> yes, because only the kernel is shared and the Ubuntu userspace is in the image (provided the app doesn't depend on a kernel feature the host lacks). <b>Windows:</b> a Linux image needs a Linux kernel, so it runs inside Docker Desktop's Linux VM (WSL 2), not natively on the Windows kernel; Windows containers are a separate thing. <b>ARM Mac:</b> the kernel is fine (Desktop's Linux VM), but the CPU architecture matters: an <code>amd64</code>-only image runs under emulation (slow, sometimes buggy). Publish multi-platform images (<code>linux/amd64</code> + <code>linux/arm64</code>), covered on Day 2.</p>`],
        ["senior", "Why is container isolation considered weaker than VM isolation, and how do you compensate?", `<p>All containers share one kernel with a very large syscall surface; a kernel bug or a misconfiguration (<code>--privileged</code>, mounting the Docker socket, running as root with extra capabilities) can let a process escape to the host. A VM's attack surface is the much smaller hypervisor interface. Compensate with: non-root users, <code>--cap-drop ALL</code> and adding back only what's needed, the default seccomp profile (never <code>unconfined</code> casually), read-only root filesystem, user namespaces or rootless mode, keeping the host kernel patched, and for untrusted multi-tenant code a sandboxed runtime (gVisor, Kata/Firecracker micro-VMs).</p>`],
        ["lead", "A team says 'we containerised, so we no longer have environment drift.' What can still drift?", `<p>The <b>host kernel</b> and its config (cgroup v1 vs v2, sysctls, kernel version), the <b>Docker Engine</b> version, <b>mutable tags</b> (<code>python:3.12-slim</code> today is not the same bytes as next month; pin digests for reproducibility), <b>runtime configuration</b> (env vars, secrets, volume contents, network setup), the <b>CPU architecture</b>, and anything changed by <code>docker exec</code> in a running container (lost on recreate, but present until then). Containers remove userspace drift; you still need IaC for hosts, pinned image digests and config in version control.</p>`]
      ],
      gotchas: [
        `<b>Root in a container is root on the host</b> by default (no user namespace). Capabilities and seccomp make it a <i>restricted</i> root, but files written to a bind mount are owned by UID 0 on the host, and a breakout lands as root. Run apps as a non-root <code>USER</code>.`,
        `<b>The kernel is shared.</b> Sysctls like <code>vm.max_map_count</code> (needed by Elasticsearch) are host-wide and must be set on the host. Some <code>--sysctl</code> values are namespaced and can be set per container (e.g. <code>net.*</code>); most are not.`,
        `<b>Containers are not more secure by default than processes</b>: they're processes with extra restrictions. <code>--privileged</code> removes almost all of them.`,
        `<b>CPU architecture is not abstracted.</b> An image is built for an OS/architecture pair (<code>linux/amd64</code>, <code>linux/arm64</code>). "exec format error" means you are running a binary for the wrong architecture.`,
        `<b>A container is only as alive as its main process.</b> When PID 1 exits, the container stops, even if you started background daemons inside it. Containers are not mini servers you SSH into.`,
        `<b>Docker Desktop hides the VM.</b> On macOS/Windows, <code>ps</code> on your laptop won't show container processes, <code>/var/lib/docker</code> isn't on your disk, and bind-mount file I/O crosses a VM boundary (slower). Keep that in mind when following Linux-host instructions.`
      ],
      best: [
        `Think "one concern per container": the API, Redis and PostgreSQL in separate containers, so each can be scaled, upgraded and restarted independently.`,
        `Treat containers as <b>cattle, not pets</b>: never patch a running container; change the Dockerfile, build a new image, replace the container.`,
        `Pin base images to a specific version (<code>python:3.12-slim</code>, not <code>python:latest</code>) and, for strict reproducibility, by digest.`,
        `Keep configuration out of the image (env vars, secrets, mounted files) so one image runs in every environment.`,
        `Use a VM boundary (or gVisor/Kata) when running untrusted code; containers alone are not a strong multi-tenant security boundary.`
      ],
      lab: [
        `Run <code>docker version</code> and identify the client version, the Engine version, the API version and the containerd/runc versions.`,
        `Start <code>docker run -d --name sleeper alpine:3.20 sleep 1000</code>. Run <code>docker exec sleeper ps</code> and note the PID of <code>sleep</code>.`,
        `On a Linux host, find the same process with <code>ps -ef | grep "sleep 1000"</code> and compare it with <code>docker inspect --format '{{.State.Pid}}' sleeper</code>. (Docker Desktop: run <code>docker run -it --rm --privileged --pid=host alpine:3.20 ps -ef</code> to see the VM's process list.)`,
        `Compare <code>uname -r</code> on the host and inside <code>alpine:3.20</code> and <code>ubuntu:24.04</code> containers, and read <code>/etc/os-release</code> in each.`,
        `Compare <code>sudo ls -l /proc/&lt;pid&gt;/ns</code> with <code>ls -l /proc/self/ns</code> and list which namespaces differ.`,
        `<b>Done when:</b> you can show the same <code>sleep</code> process from inside (PID 1) and outside (a normal host PID), show the kernel versions match, and explain in one sentence why that proves a container is not a VM. Clean up with <code>docker rm -f sleeper</code>.`
      ],
      teach: `<p>"Every team has had the 'works on my machine' problem: different Python versions, different libraries, servers that drifted. Docker fixes it by packaging the app <i>and its whole userspace</i> into an image, which is built from a Dockerfile and never changes. You run that same image everywhere.</p>
<p>A running image is a container, and here's the key point: a container is <b>not a small VM</b>. It's an ordinary Linux process. The kernel gives it namespaces, so it sees its own process list, network, filesystem and hostname, and cgroups, so it can only use so much CPU and memory. I can literally see the container's process with <code>ps</code> on the host.</p>
<p>A VM is different: a hypervisor fakes a whole computer and a separate kernel boots inside it. Stronger isolation, but heavier and slower. Docker isn't a hypervisor at all; only Docker Desktop uses a small Linux VM, because Macs and Windows don't have a Linux kernel to share. In the cloud we usually run containers inside VMs and get both."</p>`
    },

    /* ------------------------------------------------------------------ */
    {
      id: "d1-architecture",
      title: "Docker architecture: client, Engine, API, containerd, runc and OCI",
      lv: ["fresher", "mid", "senior", "dca"],
      eli5: `<p>Think of a restaurant. You (the <b>customer</b>) don't cook. You tell the <b>waiter</b> what you want. The waiter is the <code>docker</code> command: it writes your order on a slip and carries it to the kitchen.</p>
<p>The <b>head chef</b> (<code>dockerd</code>, the Docker Engine) reads the slip, checks the pantry for ingredients (images), sends someone to the <b>supermarket</b> (a registry such as Docker Hub) for anything missing, and plans the dish (container configuration, network, storage).</p>
<p>The head chef hands the actual cooking to a <b>kitchen manager</b> (<code>containerd</code>), who assigns a <b>station cook</b> to each dish (<code>containerd-shim</code>). The station cook calls in a <b>specialist</b> (<code>runc</code>) who sets up the cooking station exactly to the house rules (namespaces, cgroups), puts the dish on the flame (starts your process) and leaves. The station cook stays and watches the dish until it's done.</p>
<p>The <b>house rules</b> that every kitchen in town agrees on (how a recipe is written, how a station is set up, how supermarkets deliver) are the <b>OCI standards</b>. That's why another kitchen (Podman, Kubernetes) can cook from the same recipes.</p>`,
      what: `<p>"Docker" is not one program. It's a client-server system with a layered runtime underneath. Each layer has one job, and each boundary is a well-defined API.</p>
<h5>The Docker client (<code>docker</code> CLI)</h5>
<ul class="pts">
<li>A command-line program that turns <code>docker run …</code> into <b>HTTP requests</b> against the Docker Engine API. It holds no containers and no images itself.</li>
<li>It finds the daemon via, in order: the <code>-H</code>/<code>--host</code> flag, the <code>DOCKER_HOST</code> environment variable, the current <b>context</b> (<code>docker context ls</code>), and finally the default <code>unix:///var/run/docker.sock</code> on Linux (<code>npipe:////./pipe/docker_engine</code> on Windows).</li>
<li>Remote daemons are reached with contexts over SSH (<code>docker context create prod --docker "host=ssh://deploy@prod-1"</code>) or TLS-protected TCP (port 2376). Never expose the unencrypted TCP port 2375.</li>
<li>Plugins such as <code>docker compose</code> and <code>docker buildx</code> are separate binaries invoked through the CLI.</li>
</ul>
<h5>The Docker daemon / Docker Engine (<code>dockerd</code>)</h5>
<ul class="pts">
<li>A long-running root process (usually a systemd service) that serves the <b>Engine API</b>. "Docker Engine" means <code>dockerd</code> plus its runtime stack (containerd, runc).</li>
<li>Owns the high-level objects: <b>images</b> (pull, build via BuildKit, store, tag), <b>containers</b> (config, writable layer, logs), <b>networks</b> (bridge, overlay, iptables/nftables rules, embedded DNS at <code>127.0.0.11</code>), <b>volumes</b>, and <b>Swarm</b> orchestration.</li>
<li>Stores state under <code>/var/lib/docker</code> (containers, images, volumes, networks) and is configured by <code>/etc/docker/daemon.json</code> (log driver, storage driver, registry mirrors, <code>live-restore</code>, default address pools…).</li>
<li>Does <b>not</b> run containers itself: it delegates to containerd over gRPC.</li>
</ul>
<h5>The Docker Engine REST API</h5>
<ul class="pts">
<li>A versioned HTTP/JSON API (paths like <code>/v1.47/containers/json</code>; omit the version to use the daemon's current one). Every CLI command maps to one or more calls: <code>docker ps</code> → <code>GET /containers/json</code>; <code>docker run</code> → <code>POST /containers/create</code> then <code>POST /containers/{id}/start</code>.</li>
<li>SDKs (Python <code>docker</code> package, Go client), CI systems, Portainer, Testcontainers and Traefik all use the same API.</li>
<li>The client and daemon negotiate an API version so an older CLI can talk to a newer daemon (within the supported range shown by <code>docker version</code> as "minimum version").</li>
</ul>
<h5>The Docker socket and why access equals root</h5>
<p><code>/var/run/docker.sock</code> is a Unix domain socket owned by <code>root:docker</code> with mode <code>660</code>. Anyone who can write to it can ask the root daemon to do anything, for example:</p>
<pre><code>docker run --rm -it -v /:/host --privileged alpine chroot /host sh</code></pre>
<p>That gives a root shell on the host filesystem. Therefore: adding a user to the <code>docker</code> group is effectively giving them passwordless root; mounting the socket into a container (<code>-v /var/run/docker.sock:/var/run/docker.sock</code>, common for CI runners, Traefik, Portainer) gives that container root on the host; and exposing the API on TCP without mutual TLS is a remote root hole. Alternatives: rootless Docker, a socket proxy that allows only read-only endpoints, or not needing the socket at all.</p>
<h5>Docker Desktop</h5>
<ul class="pts">
<li>The developer product for <b>macOS and Windows</b> (also available on Linux). Since Linux containers need a Linux kernel, Desktop runs a small <b>Linux VM</b> (on Windows typically through <b>WSL 2</b>; on macOS through Apple's virtualisation framework in current versions) and runs <code>dockerd</code> inside it. The CLI on your laptop talks to it through a forwarded socket.</li>
<li>Adds a GUI, Compose, BuildKit/buildx, Kubernetes (optional), file sharing for bind mounts, port forwarding from <code>localhost</code> to the VM, and <code>host.docker.internal</code> to reach the host from containers.</li>
<li>Licensing: free for personal use, education and small businesses; larger companies need a paid subscription (check Docker's current terms). Docker Engine on Linux is open source.</li>
</ul>
<h5>Registries, Docker Hub, repositories and tags</h5>
<ul class="pts">
<li>A <b>registry</b> is a server that stores and distributes images over the OCI Distribution API (HTTPS). Examples: <b>Docker Hub</b> (<code>docker.io</code>, the default), GitHub Container Registry (<code>ghcr.io</code>), AWS ECR, Google Artifact Registry, Azure ACR, GitLab, Harbor, and the open-source <code>registry:2</code> image (CNCF Distribution) you can self-host.</li>
<li>A <b>repository</b> is a collection of related images with the same name, e.g. <code>library/nginx</code> or <code>myorg/api</code>. <b>Official images</b> live under <code>library/</code>, so <code>nginx</code> is short for <code>docker.io/library/nginx</code>.</li>
<li>A <b>tag</b> is a human-readable, <b>mutable</b> pointer to one image in a repository (<code>1.27-alpine</code>, <code>16</code>, <code>latest</code>). <code>latest</code> is just the default tag name, not "the newest".</li>
<li>A <b>digest</b> (<code>sha256:…</code>) identifies the exact content and never changes: <code>nginx@sha256:…</code>.</li>
<li>Full reference anatomy: <code>[registry[:port]/][namespace/]repository[:tag][@digest]</code>, e.g. <code>registry.example.com:5000/shop/api:1.8.3</code>.</li>
<li>Docker Hub applies <b>pull rate limits</b> to anonymous and free users (numbers change; check current docs); <code>docker login</code> and mirrors help in CI.</li>
</ul>
<h5>containerd</h5>
<ul class="pts">
<li>An industry-standard container runtime daemon (CNCF graduated project, originally extracted from Docker). It manages the <b>container lifecycle</b> (create, start, stop, delete tasks), image pull and storage (content store + snapshotters), and talks to OCI runtimes.</li>
<li>dockerd talks to it over gRPC at <code>/run/containerd/containerd.sock</code>, using the containerd namespace <code>moby</code> (so <code>sudo ctr -n moby containers ls</code> shows Docker's containers).</li>
<li>Kubernetes uses containerd directly through its CRI plugin, without dockerd; that's why "Kubernetes removed dockershim" didn't break Docker-built images.</li>
</ul>
<h5>containerd-shim (<code>containerd-shim-runc-v2</code>)</h5>
<ul class="pts">
<li>A small per-container (per-task) process that sits between containerd and the container's process. It calls runc to create and start the container, then <b>remains the parent</b> (subreaper) of the container's PID 1.</li>
<li>It keeps the container's stdio pipes/pty open, collects the exit status when the process dies, and reports it to containerd.</li>
<li>Because the shim, not containerd or dockerd, is the parent, you can restart or upgrade dockerd/containerd without killing containers (with <code>"live-restore": true</code> in <code>daemon.json</code> for dockerd).</li>
</ul>
<h5>runc</h5>
<ul class="pts">
<li>The reference implementation of the <b>OCI Runtime Specification</b>: a CLI tool that takes a <b>bundle</b> (a root filesystem directory + <code>config.json</code>) and creates a container: namespaces, cgroups, mounts, capabilities, seccomp, then <code>execve</code> of the process.</li>
<li>runc is <b>short-lived</b>: it exits once the container process has started. It is not a daemon.</li>
<li>Alternatives that implement the same spec: <code>crun</code> (C, faster, used by Podman), <code>runsc</code> (gVisor), Kata Containers (micro-VMs), <code>youki</code> (Rust). Docker can use them via <code>--runtime</code> once registered.</li>
</ul>
<h5>OCI (Open Container Initiative)</h5>
<p>A Linux Foundation project (founded 2015 by Docker and others) that standardises containers so that tools are interchangeable:</p>
<ul class="pts">
<li><b>Image Specification</b>: the image format: a <b>manifest</b> (list of layer digests + config digest), a <b>config</b> JSON (env, cmd, entrypoint, rootfs diff IDs, history), <b>layers</b> (tar archives, usually gzip/zstd compressed) and an <b>image index</b> (manifest list) for multi-platform images.</li>
<li><b>Runtime Specification</b>: what a bundle looks like (<code>config.json</code> + rootfs) and the lifecycle operations (create, start, kill, delete, state). runc implements it.</li>
<li><b>Distribution Specification</b>: the HTTP API for pushing and pulling content to registries (<code>/v2/&lt;name&gt;/manifests/&lt;reference&gt;</code>, <code>/v2/&lt;name&gt;/blobs/&lt;digest&gt;</code>).</li>
</ul>
<p>Thanks to OCI, an image built with <code>docker build</code> runs on Podman, containerd/Kubernetes, AWS ECS or Cloud Run without conversion.</p>`,
      why: `<p>Early Docker (2013-2015) was a single monolithic daemon that did everything: API, image pulls, networking, and directly creating containers via its own library (libcontainer). That had real problems:</p>
<ul class="pts">
<li><b>Restarting or upgrading the daemon killed every container</b>, because the daemon was their parent process. Upgrading Docker in production meant downtime.</li>
<li><b>No standard</b>: the image format and runtime behaviour were "whatever Docker does", which worried the industry (vendor lock-in) and led to competing formats (CoreOS rkt/appc).</li>
<li><b>Orchestrators needed less than all of Docker.</b> Kubernetes only needed "pull image, start container, stop container", not Docker's CLI, build system, Swarm or networking.</li>
</ul>
<p>The fix was to split the monolith along clear boundaries: Docker donated its image format and libcontainer (which became <b>runc</b>) to the newly formed <b>OCI</b>, and extracted container supervision into <b>containerd</b>, which later moved to the CNCF. The shim decoupled container processes from the daemons. Today each piece can be swapped or upgraded independently: Kubernetes uses containerd without dockerd; Docker can use crun or gVisor instead of runc; any registry that speaks the Distribution spec works with any client.</p>
<p>For you this matters when debugging ("is it the CLI, the daemon, containerd, or my process?"), securing a host (the socket is root), and reading DCA questions that test exactly these component names.</p>`,
      diagram: {
        html: flow([
          ["docker CLI", "or SDK / Compose / curl", "w"],
          ["Engine API", "HTTP over /var/run/docker.sock"],
          ["dockerd", "images, networks, volumes, builds (BuildKit)", "g"],
          ["containerd", "gRPC; namespace 'moby'; tasks, snapshots"],
          ["containerd-shim-runc-v2", "one per container, stays alive"],
          ["runc", "OCI runtime; exits after start", "w"],
          ["Linux kernel", "namespaces + cgroups + seccomp + overlayfs", "r"]
        ], { v: true }) + lanes([
          ["Registries (OCI Distribution)", ["Docker Hub (docker.io)", "ghcr.io, ECR, ACR, GAR", "self-hosted registry:2 / Harbor"]],
          ["Objects owned by dockerd", ["images & layers", "containers (config, rw layer, logs)", "networks (bridge, overlay, DNS)", "volumes"]],
          ["Standards (OCI)", ["Image spec", "Runtime spec (runc)", "Distribution spec"]]
        ]),
        steps: [
          `The CLI is only a client. It serialises your command into Engine API calls and sends them to the daemon address in <code>DOCKER_HOST</code>/the current context (default: the Unix socket).`,
          `<code>dockerd</code> handles high-level work: resolving and pulling images from a registry, preparing the container's writable layer, networks and volumes, and building an OCI runtime spec.`,
          `<code>dockerd</code> asks <code>containerd</code> (gRPC) to create and start a task. containerd spawns one <code>containerd-shim-runc-v2</code> per container.`,
          `The shim runs <code>runc create</code>/<code>runc start</code>. runc asks the kernel for namespaces and cgroups, applies security settings and <code>execve</code>s your entrypoint, then exits.`,
          `The shim stays as the container's parent, holding stdio and waiting for the exit status, so dockerd and containerd can restart without killing containers.`
        ]
      },
      cmds: [
        {
          t: "See which daemon your CLI talks to (contexts)",
          lang: "sh",
          code: `docker context ls
echo "$DOCKER_HOST"          # empty means: use the current context
docker context inspect --format '{{.Endpoints.docker.Host}}'`,
          out: `NAME        DESCRIPTION                               DOCKER ENDPOINT               ERROR
default *   Current DOCKER_HOST based configuration   unix:///var/run/docker.sock

unix:///var/run/docker.sock`,
          note: `<p>On Docker Desktop you will typically see a <code>desktop-linux</code> context pointing at a socket in your home directory that is forwarded into the VM. A <code>prod</code> context with <code>ssh://user@host</code> lets you run <code>docker --context prod ps</code> against a remote engine.</p>`
        },
        {
          t: "Talk to the Engine API directly with curl over the Unix socket",
          lang: "sh",
          code: `# engine version (same data as 'docker version' server section)
curl -s --unix-socket /var/run/docker.sock http://localhost/version

# list running containers: what 'docker ps' does
curl -s --unix-socket /var/run/docker.sock http://localhost/containers/json | head -c 400; echo

# create and start a container the way the CLI does
curl -s --unix-socket /var/run/docker.sock -H "Content-Type: application/json" \\
  -d '{"Image":"nginx:1.27-alpine","HostConfig":{"PortBindings":{"80/tcp":[{"HostPort":"8081"}]}}}' \\
  -X POST "http://localhost/containers/create?name=api-made"
curl -s --unix-socket /var/run/docker.sock -X POST http://localhost/containers/api-made/start
docker ps --filter name=api-made`,
          out: `{"Platform":{"Name":"Docker Engine - Community"},"Version":"27.x","ApiVersion":"1.47","MinAPIVersion":"1.24","Os":"linux","Arch":"amd64",...}
[{"Id":"8c1e...","Names":["/web"],"Image":"nginx:1.27-alpine","State":"running","Status":"Up 3 minutes",...
{"Id":"5b0f9a3c...","Warnings":[]}
CONTAINER ID   IMAGE               COMMAND                  STATUS         PORTS                  NAMES
5b0f9a3c71d2   nginx:1.27-alpine   "/docker-entrypoint.…"   Up 2 seconds   0.0.0.0:8081->80/tcp   api-made`,
          note: `<p>The <code>create</code> call fails with "No such image" if the image isn't local: pulling is a separate API call (<code>POST /images/create?fromImage=nginx&amp;tag=1.27-alpine</code>) that the CLI makes for you. Add <code>sudo</code> if your user isn't in the <code>docker</code> group. Clean up with <code>docker rm -f api-made</code>.</p>`
        },
        {
          t: "Watch the API calls the CLI makes",
          lang: "sh",
          code: `# daemon side: stream events while running something in another terminal
docker events --filter type=container

# client side: debug output for one command
docker --debug run --rm alpine:3.20 echo hi`,
          out: `2025-... container create 1f2e... (image=alpine:3.20, name=quirky_hopper)
2025-... container attach 1f2e... (image=alpine:3.20, name=quirky_hopper)
2025-... container start 1f2e... (image=alpine:3.20, name=quirky_hopper)
2025-... container die 1f2e... (exitCode=0, image=alpine:3.20, name=quirky_hopper)
2025-... container destroy 1f2e... (image=alpine:3.20, name=quirky_hopper)`,
          note: `<p><code>docker events</code> shows the lifecycle as the daemon sees it: create → attach → start → die → destroy (because of <code>--rm</code>). It's one of the best debugging tools for "what is restarting my container?".</p>`
        },
        {
          t: "See the runtime stack as processes on the host",
          lang: "sh",
          code: `docker run -d --name web nginx:1.27-alpine
ps -eo pid,ppid,cmd --forest | grep -E "dockerd|containerd|nginx" | grep -v grep
docker info --format 'runtimes={{range $k,$v := .Runtimes}}{{$k}} {{end}} default={{.DefaultRuntime}}'
sudo ctr -n moby containers ls          # containerd's view of Docker's containers`,
          out: `   912       1 /usr/bin/containerd
  1180       1 /usr/bin/dockerd -H fd:// --containerd=/run/containerd/containerd.sock
 48190       1 /usr/bin/containerd-shim-runc-v2 -namespace moby -id 8c1e... -address /run/containerd/containerd.sock
 48213   48190  \\_ nginx: master process nginx -g daemon off;
 48260   48213      \\_ nginx: worker process
runtimes=io.containerd.runc.v2 runc  default=runc
CONTAINER    IMAGE    RUNTIME
8c1e...      -        io.containerd.runc.v2`,
          note: `<p>Read the tree: <code>containerd</code> and <code>dockerd</code> are children of systemd (PID 1). The <b>shim</b> is also re-parented to PID 1, and <b>nginx is the shim's child</b>, not dockerd's or containerd's. There is no runc process: it already exited. <code>ctr</code> is containerd's low-level debug CLI, not a user tool.</p>`
        },
        {
          t: "Registries, repositories, tags and digests",
          lang: "sh",
          code: `docker pull nginx:1.27-alpine                       # = docker.io/library/nginx:1.27-alpine
docker image ls --digests nginx
docker pull nginx@sha256:<digest-from-above>       # pin exact content
docker login ghcr.io                                # credentials stored via a credential helper
docker tag nginx:1.27-alpine ghcr.io/myorg/nginx:1.27-alpine
docker push ghcr.io/myorg/nginx:1.27-alpine`,
          out: `1.27-alpine: Pulling from library/nginx
Digest: sha256:4ff1...
Status: Downloaded newer image for nginx:1.27-alpine
docker.io/library/nginx:1.27-alpine
REPOSITORY   TAG           DIGEST          IMAGE ID       CREATED       SIZE
nginx        1.27-alpine   sha256:4ff1...  1ae23480369f   3 weeks ago   47MB`,
          note: `<p>The last line of <code>docker pull</code> prints the <b>fully-qualified</b> reference, showing the implicit <code>docker.io/library/</code>. <code>docker tag</code> doesn't copy anything: it adds a second name to the same image ID. To push you need a tag whose registry/namespace you have write access to.</p>`
        },
        {
          t: "Daemon configuration and service management (Linux)",
          lang: "sh",
          code: `cat /etc/docker/daemon.json
sudo systemctl status docker --no-pager | head -5
sudo journalctl -u docker --since "10 min ago" --no-pager | tail -20
ls -l /var/run/docker.sock
sudo ls /var/lib/docker`,
          out: `{
  "log-driver": "json-file",
  "log-opts": { "max-size": "10m", "max-file": "3" },
  "live-restore": true
}
● docker.service - Docker Application Container Engine
     Active: active (running) since ...
srw-rw---- 1 root docker 0 ... /var/run/docker.sock
buildkit  containers  engine-id  image  network  overlay2  plugins  runtimes  swarm  tmp  volumes`,
          note: `<p><code>daemon.json</code> changes need a daemon restart (<code>sudo systemctl restart docker</code>), though a few keys can be reloaded with <code>SIGHUP</code>. With <code>live-restore</code> enabled, running containers survive the restart. The socket's group is <code>docker</code> with mode <code>rw-rw----</code>: membership in that group is root-equivalent. If you see <code>/var/lib/containerd</code> holding the images instead of <code>overlay2</code>, your Engine is using the containerd image store (check <code>docker info</code>).</p>`
        }
      ],
      internals: `<p><b>Process tree and sockets.</b> systemd starts <code>containerd.service</code> and <code>docker.service</code>. <code>dockerd</code> listens on <code>/var/run/docker.sock</code> (often via systemd socket activation, which is why you see <code>-H fd://</code>) and connects to containerd at <code>/run/containerd/containerd.sock</code>. Every Docker container is a containerd <i>container</i> (metadata) plus a <i>task</i> (the running process) in the containerd namespace <code>moby</code>.</p>
<p><b>Where state lives.</b></p>
<ul class="pts">
<li><code>/var/lib/docker/containers/&lt;id&gt;/</code>: <code>config.v2.json</code> (the container's config and state), <code>hostconfig.json</code> (ports, mounts, restart policy, limits), <code>&lt;id&gt;-json.log</code> (stdout/stderr with the default <code>json-file</code> log driver), and the generated <code>hostname</code>, <code>hosts</code>, <code>resolv.conf</code> files.</li>
<li><code>/var/lib/docker/overlay2/</code> (classic storage driver) or <code>/var/lib/containerd/…</code> (containerd image store, now the default on recent Docker Desktop and new Engine installs in recent releases; check <code>docker info</code> for "Storage Driver" / "driver-type: io.containerd.snapshotter.v1"): image layers and container writable layers.</li>
<li><code>/var/lib/docker/volumes/</code>, <code>/var/lib/docker/network/</code>: volumes and network database.</li>
<li><code>/run/containerd/io.containerd.runtime.v2.task/moby/&lt;id&gt;/</code>: the <b>OCI bundle</b> containerd hands to runc: <code>config.json</code> (runtime spec: process args, env, mounts, namespaces, cgroup path, capabilities, seccomp profile) and <code>rootfs</code>.</li>
</ul>
<p><b>Shim mechanics.</b> containerd launches <code>containerd-shim-runc-v2</code> with the bundle path. The shim invokes <code>runc create</code> (sets up namespaces, cgroups and mounts, then pauses the new process right before <code>execve</code>, waiting on a FIFO), then <code>runc start</code> (signals the FIFO so the process execs the entrypoint). runc exits; the shim marks itself a child subreaper so orphaned grandchildren reparent to it, holds the stdio FIFOs that dockerd reads logs from, and on <code>SIGCHLD</code> records the exit status. When dockerd restarts with <code>live-restore</code>, it reconnects to containerd, which reconnects to the existing shims over their own sockets.</p>
<p><b>Pulling from a registry (Distribution spec).</b> For <code>nginx:1.27-alpine</code> the daemon resolves the registry (<code>registry-1.docker.io</code>), gets a bearer token from <code>auth.docker.io</code>, requests <code>GET /v2/library/nginx/manifests/1.27-alpine</code>, receives an <b>image index</b> (one manifest per platform), picks the one matching the host (<code>linux/amd64</code> or <code>linux/arm64</code>), fetches its <b>manifest</b>, then the <b>config</b> blob and each <b>layer</b> blob (<code>GET /v2/…/blobs/sha256:…</code>), skipping layers it already has. Every blob is verified against its sha256 digest.</p>
<p><b>Docker Desktop.</b> The same stack runs inside the Linux VM. A host-side component forwards the API socket and published ports (so <code>localhost:8080</code> on your Mac reaches the VM), and a file-sharing layer (virtiofs/gRPC-FUSE on macOS, the WSL 2 filesystem on Windows) implements bind mounts across the VM boundary.</p>`,
      prod: `<p><b>Deploying the React/FastAPI/Redis/PostgreSQL stack</b>: the CI runner builds and pushes <code>ghcr.io/shop/api:1.8.3</code> and <code>ghcr.io/shop/web:1.8.3</code> to a private registry. The production VM runs Docker Engine with this <code>daemon.json</code>:</p>
<pre><code>{
  "live-restore": true,
  "log-driver": "json-file",
  "log-opts": { "max-size": "20m", "max-file": "5" },
  "default-address-pools": [{ "base": "10.200.0.0/16", "size": 24 }]
}</code></pre>
<ul class="pts">
<li><b>live-restore</b> means a security update to <code>docker-ce</code> doesn't restart PostgreSQL mid-transaction.</li>
<li><b>Log rotation</b> prevents <code>/var/lib/docker/containers/*/…-json.log</code> from filling the disk (a classic outage).</li>
<li><b>Address pools</b> avoid Docker's default bridge subnets colliding with the company VPN range.</li>
</ul>
<p>Deploys are run from a laptop or CI with a Docker <b>context over SSH</b> (<code>docker --context prod compose up -d</code>), so the daemon is never exposed on TCP. Traefik, used as the edge proxy, needs to discover containers: instead of mounting the raw Docker socket into it (root on the host), the team runs a <b>socket proxy</b> that only allows <code>GET /containers</code> and <code>GET /events</code>. The CI runner that builds images uses a rootless BuildKit or a dedicated build VM, not the production daemon's socket.</p>
<p>When an engineer reports "Docker is hanging", the architecture tells you where to look: <code>docker version</code> (is the daemon reachable?), <code>journalctl -u docker</code> and <code>-u containerd</code> (daemon errors), <code>docker events</code> (is something restarting?), <code>ps --forest</code> (is the shim and process alive?).</p>`,
      iq: [
        ["dca", "Which component is responsible for actually creating the container's namespaces and cgroups on a default Docker Engine installation? A) docker CLI B) dockerd C) containerd D) runc", `<p><b>D) runc.</b> The CLI only sends API requests; dockerd manages images, networks, volumes and builds the spec; containerd supervises the lifecycle and launches a shim; the shim calls <b>runc</b>, the OCI runtime, which makes the clone/unshare and cgroup calls, then exits. Tempting wrong answer: containerd, which <i>manages</i> containers but delegates creation to the runtime.</p>`],
        ["dca", "A user is added to the docker group on a Linux host. Which statement is TRUE? A) They can only manage their own containers. B) They effectively have root access on the host. C) They need sudo to run containers. D) They can only pull images.", `<p><b>B.</b> Write access to <code>/var/run/docker.sock</code> lets them ask the root daemon to run a privileged container with the host filesystem mounted (<code>docker run -v /:/host --privileged …</code>), i.e. root. Docker has no per-user ownership of containers (A is false). C is false: the group exists precisely so sudo isn't needed. Mitigate with rootless Docker or by limiting who is in the group.</p>`],
        ["dca", "What does the OCI Runtime Specification define, and which tool is its reference implementation?", `<p>It defines the <b>bundle</b> (a root filesystem plus a <code>config.json</code> describing the process, mounts, namespaces, cgroups, capabilities, hooks) and the <b>lifecycle operations</b> (state, create, start, kill, delete). <b>runc</b> is the reference implementation. Don't confuse with the <b>Image</b> spec (manifest, config, layers, index) or the <b>Distribution</b> spec (registry HTTP API).</p>`],
        ["dca", "Which file is used to configure the Docker daemon on Linux, and what happens to running containers if you restart the daemon?", `<p><code>/etc/docker/daemon.json</code> (flags on the <code>dockerd</code> command line also work but must not conflict with it, or the daemon refuses to start). On restart, running containers are stopped <b>unless</b> <code>"live-restore": true</code> is set, in which case they keep running (shims keep them alive) and dockerd reattaches on startup. Live restore doesn't apply to Swarm-mode services in the same way and doesn't cover upgrades that skip major versions (check the docs).</p>`],
        ["fresher", "What is the difference between a registry, a repository and a tag?", `<p>A <b>registry</b> is the server (Docker Hub at <code>docker.io</code>, <code>ghcr.io</code>, ECR). A <b>repository</b> is a named collection of image versions in it (<code>library/postgres</code>, <code>shop/api</code>). A <b>tag</b> is a mutable label pointing at one image in the repository (<code>16</code>, <code>16.4</code>, <code>latest</code>). Full reference: <code>ghcr.io/shop/api:1.8.3</code>. A <b>digest</b> (<code>@sha256:…</code>) pins exact, immutable content.</p>`],
        ["mid", "Why does Docker need containerd and a shim? Couldn't dockerd just start the process?", `<p>It used to, and restarting the daemon killed every container. Splitting it out means: (1) the <b>shim</b> is the container's parent and holds its stdio and exit status, so dockerd and containerd can restart or be upgraded without killing containers; (2) <b>containerd</b> is a reusable, standard runtime daemon also used by Kubernetes; (3) <b>runc</b> can be swapped for another OCI runtime (crun, gVisor, Kata). Each layer has a narrow job and API.</p>`],
        ["mid", "How does the docker CLI on a Mac reach dockerd, and what consequences does the VM have?", `<p>Docker Desktop runs dockerd inside a Linux VM and exposes its API through a socket on the Mac (the <code>desktop-linux</code> context). Consequences: container processes are not visible in macOS <code>ps</code>; <code>/var/lib/docker</code> lives in the VM disk image; published ports are forwarded from macOS <code>localhost</code>; bind mounts go through a file-sharing layer (slower than native, and file-watch events can behave differently); host networking semantics differ (<code>--network host</code> means the VM's network, and <code>host.docker.internal</code> reaches the Mac).</p>`],
        ["senior", "Traefik needs to discover containers, so the docs say to mount /var/run/docker.sock. What is the risk and what would you do instead?", `<p>Any code execution in Traefik (a bug, a malicious plugin) becomes root on the host, because the socket gives full Engine API access, including creating privileged containers. Options: mount it read-only (<code>:ro</code> does <b>not</b> help: it prevents replacing the socket file, not sending write API requests); use a <b>socket proxy</b> (e.g. a small HAProxy-based container) that only allows <code>GET</code> on container and event endpoints; use the file provider or Swarm/Kubernetes providers instead; run rootless Docker so the daemon isn't root.</p>`],
        ["architect", "Kubernetes 'removed Docker' (dockershim). What does that mean for images built with docker build?", `<p>Nothing breaks. Kubernetes stopped talking to dockerd through the dockershim adapter and talks to containerd (or CRI-O) directly via the CRI. Images built by Docker are standard <b>OCI images</b>, pulled through the standard Distribution API and run by an OCI runtime (runc) either way. What changes: node-level tooling (no <code>docker ps</code> on nodes; use <code>crictl</code>), and workloads that mounted the Docker socket inside pods (Docker-in-Docker CI builds) must move to BuildKit/kaniko/buildah.</p>`]
      ],
      gotchas: [
        `<b><code>-v /var/run/docker.sock:/var/run/docker.sock:ro</code> is not read-only access.</b> <code>:ro</code> applies to the file, not to the API requests sent over it; the container can still create privileged containers.`,
        `<b><code>latest</code> is not "latest".</b> It's the default tag when none is given, and it's mutable. Two hosts pulling <code>myapp:latest</code> a day apart can run different code. Deploy immutable version tags or digests.`,
        `<b>The CLI and daemon can be on different machines.</b> <code>docker build .</code> sends the build context to wherever the daemon is; <code>-v ./data:/data</code> refers to the <i>daemon's</i> filesystem. With a remote context, local paths in bind mounts silently point at the remote host's paths.`,
        `<b>runc not appearing in <code>ps</code> is normal.</b> It exits after starting the container; the long-lived parent is <code>containerd-shim-runc-v2</code>. If you see stuck <code>runc</code> processes, something is wrong (often storage or cgroup issues).`,
        `<b>"Cannot connect to the Docker daemon at unix:///var/run/docker.sock. Is the docker daemon running?"</b> can mean: daemon stopped, permission denied on the socket (not in the <code>docker</code> group, or need to log out and in after being added), or <code>DOCKER_HOST</code>/context pointing somewhere else.`,
        `<b>Conflicting configuration kills startup.</b> Setting the same option in <code>daemon.json</code> and as a <code>dockerd</code> flag (e.g. <code>hosts</code> plus <code>-H fd://</code> in the systemd unit) makes the daemon refuse to start. Use a systemd drop-in to remove the flag.`,
        `<b>Docker Hub rate limits</b> hit CI farms sharing one NAT IP. Authenticate, use a pull-through cache/mirror (<code>"registry-mirrors"</code> in <code>daemon.json</code>), or mirror base images into your private registry.`
      ],
      best: [
        `Never expose the Engine API on unencrypted TCP (2375). For remote access use <b>SSH contexts</b> or TCP with mutual TLS (2376, <code>--tlsverify</code>).`,
        `Treat <code>docker</code> group membership and socket mounts as root grants; audit them, and prefer rootless Docker or a socket proxy where possible.`,
        `Enable <code>live-restore</code> and log rotation in <code>daemon.json</code> on production hosts.`,
        `Push to and deploy from a <b>private registry</b> you control (with vulnerability scanning and retention), and pin deploys by version tag or digest.`,
        `Learn <code>docker events</code>, <code>docker info</code>, <code>journalctl -u docker</code> and <code>ps --forest</code>: they map directly onto the architecture layers when debugging.`
      ],
      lab: [
        `Run <code>docker version</code>, <code>docker context ls</code> and <code>docker info</code>. Write down the API version, storage driver, cgroup driver/version, default runtime and the daemon endpoint.`,
        `Use <code>curl --unix-socket /var/run/docker.sock http://localhost/version</code> and <code>…/containers/json</code> to reproduce <code>docker version</code> and <code>docker ps</code> without the CLI.`,
        `Create and start a container with two <code>curl</code> POST calls (<code>/containers/create</code>, <code>/containers/{name}/start</code>), then confirm with <code>docker ps</code>.`,
        `In a second terminal run <code>docker events</code>, then <code>docker run --rm alpine:3.20 echo hi</code>; identify create, attach, start, die and destroy.`,
        `Start <code>docker run -d --name web nginx:1.27-alpine</code> and run <code>ps -eo pid,ppid,cmd --forest</code>. Identify containerd, dockerd, the shim and nginx, and confirm nginx's parent is the shim and there is no runc process.`,
        `<b>Done when:</b> you have started a container purely through the REST API, and you can point at each process in the <code>ps --forest</code> output and name its layer in the architecture (CLI, dockerd, containerd, shim, runc (gone), app).`
      ],
      teach: `<p>"When I type <code>docker run</code>, the <code>docker</code> command doesn't run anything. It's an HTTP client. It sends REST calls over a Unix socket, <code>/var/run/docker.sock</code>, to the Docker daemon, <code>dockerd</code>. Since that daemon runs as root, access to the socket is root access; that's why the <code>docker</code> group is dangerous.</p>
<p>dockerd handles the high-level stuff: images from registries like Docker Hub, networks, volumes, logs. It doesn't start processes itself. It asks <b>containerd</b>, over gRPC, to start a task. containerd launches a tiny <b>shim</b> for that container; the shim runs <b>runc</b>; runc asks the kernel for namespaces and cgroups and execs my program, then exits. The shim stays as the parent, so I can restart dockerd without killing containers.</p>
<p>All of this is standardised by the <b>OCI</b>: an image spec, a runtime spec that runc implements, and a distribution spec for registries. That's why a Docker image runs on Kubernetes, Podman or ECS unchanged. On a Mac or Windows, the same stack just runs inside Docker Desktop's Linux VM."</p>`
    },

    /* ------------------------------------------------------------------ */
    {
      id: "d1-lifecycle",
      title: "The container lifecycle and what docker run really does",
      lv: ["fresher", "mid", "senior", "dca"],
      eli5: `<p>Think of a container like a <b>rental car</b>. First you pick a model from the catalogue and have it delivered to your lot (<b>pull</b> the image). Then the car is assigned to you with your name on the paperwork, but the engine is off (<b>created</b>). You turn the key (<b>start</b>, now <b>running</b>). You can pause at a red light with the engine still on (<b>paused</b>). When you're done you can park it politely: indicate, pull over, turn off (<b>stop</b>), or just yank the key out at speed (<b>kill</b>). The car is now parked (<b>exited</b>) but still yours until you hand it back (<b>rm</b>).</p>
<p>And when the car stops, there's a <b>note on the dashboard</b> saying why: "trip finished normally" (exit code 0), "something went wrong" (1), "engine was yanked" (137) or "asked politely to stop" (143). Learning to read that note is half of debugging containers.</p>
<p>Under the bonnet, every car is fitted with <b>tinted windows</b> so the driver only sees their own road (namespaces) and a <b>speed limiter and fuel cap</b> so it can't take more than its share (cgroups).</p>`,
      what: `<h5>Namespaces (intro)</h5>
<p>A namespace wraps a global kernel resource so processes inside see their own isolated instance. Docker creates these by default for each container:</p>
<table class="tbl"><tr><th>Namespace</th><th>Isolates</th><th>Effect in a container</th></tr>
<tr><td><code>pid</code></td><td>Process IDs</td><td>The entrypoint is PID 1; you can't see or signal host processes. (<code>--pid=host</code> disables it.)</td></tr>
<tr><td><code>net</code></td><td>Interfaces, IPs, routes, ports, iptables</td><td>Its own <code>eth0</code> and <code>lo</code>; <code>localhost</code> means <i>this container</i>, not the host or another container.</td></tr>
<tr><td><code>mnt</code></td><td>Mount table</td><td>Its own root filesystem (the image) and mounts (volumes).</td></tr>
<tr><td><code>uts</code></td><td>Hostname, domain name</td><td>Hostname = short container ID or <code>--hostname</code>.</td></tr>
<tr><td><code>ipc</code></td><td>SysV IPC, POSIX message queues, <code>/dev/shm</code></td><td>Shared memory is private (64 MB <code>/dev/shm</code> by default; <code>--shm-size</code> raises it, PostgreSQL may need it).</td></tr>
<tr><td><code>user</code></td><td>UID/GID mapping</td><td><b>Not</b> enabled by default; with <code>userns-remap</code> or rootless mode, root in the container maps to an unprivileged host UID.</td></tr>
<tr><td><code>cgroup</code></td><td>View of the cgroup hierarchy</td><td>The container sees its own cgroup as the root of <code>/sys/fs/cgroup</code> (default on cgroup v2 hosts).</td></tr></table>
<p>This is exactly why "FastAPI → <code>localhost:5432</code> fails but <code>postgres:5432</code> works": the API container's <code>net</code> namespace has its own loopback, where nothing listens on 5432. PostgreSQL is in a different network namespace, reachable by its container/service name on a shared Docker network (Day 4).</p>
<h5>cgroups (intro)</h5>
<p>Control groups account for and limit resources for a group of processes. Docker puts each container in its own cgroup and translates flags into cgroup files:</p>
<ul class="pts">
<li><code>--memory 512m</code> → <code>memory.max</code>. Exceed it and the kernel's OOM killer kills a process in the container (often PID 1 → exit code <b>137</b>, <code>OOMKilled: true</code>).</li>
<li><code>--cpus 1.5</code> → <code>cpu.max</code> = <code>150000 100000</code> (quota per period). Exceeding means throttling, not killing.</li>
<li><code>--pids-limit 200</code> → <code>pids.max</code>: stops fork bombs.</li>
<li><code>docker pause</code> uses the cgroup <b>freezer</b>. Modern hosts use <b>cgroup v2</b> (unified hierarchy); older ones cgroup v1. <code>docker info</code> shows which, and file names differ between them.</li>
</ul>
<h5>Lifecycle states</h5>
<table class="tbl"><tr><th>State</th><th>Meaning</th><th>Reached by</th></tr>
<tr><td><b>created</b></td><td>Config and writable layer exist; no process yet</td><td><code>docker create</code>, or a <code>docker run</code> whose start failed</td></tr>
<tr><td><b>running</b></td><td>The main process (PID 1) is alive</td><td><code>docker start</code>, <code>docker run</code>, <code>docker restart</code>, <code>docker unpause</code></td></tr>
<tr><td><b>paused</b></td><td>All processes frozen by the cgroup freezer; memory kept</td><td><code>docker pause</code></td></tr>
<tr><td><b>restarting</b></td><td>The process exited and a restart policy is bringing it back (with back-off)</td><td><code>--restart on-failure|always|unless-stopped</code></td></tr>
<tr><td><b>exited</b></td><td>The main process ended; filesystem, logs and config remain</td><td>Process finished, crashed, <code>docker stop</code>, <code>docker kill</code></td></tr>
<tr><td><b>removing</b></td><td>Transient, while <code>docker rm</code> runs</td><td><code>docker rm</code></td></tr>
<tr><td><b>dead</b></td><td>Removal failed half-way (e.g. busy mount); cannot be restarted, only removed</td><td>Error during removal</td></tr></table>
<h5>Lifecycle commands</h5>
<ul class="pts">
<li><code>docker pull &lt;image&gt;</code>: download an image (all missing layers) from a registry.</li>
<li><code>docker create &lt;image&gt;</code>: create a container (state <i>created</i>) without starting it. Prints the ID.</li>
<li><code>docker start &lt;ctr&gt;</code>: start a created or exited container (same writable layer, same ID). <code>-a</code> attaches output.</li>
<li><code>docker run</code> = (pull if missing) + create + start (+ attach, unless <code>-d</code>). <code>--rm</code> removes the container when it exits.</li>
<li><code>docker stop &lt;ctr&gt;</code>: send the stop signal (default <b>SIGTERM</b>, or the image's <code>STOPSIGNAL</code>), wait the grace period (default <b>10 s</b>, change with <code>-t</code>/<code>--time</code> or <code>--stop-timeout</code> on run), then <b>SIGKILL</b>.</li>
<li><code>docker kill &lt;ctr&gt;</code>: send <b>SIGKILL</b> immediately (or any signal with <code>-s</code>, e.g. <code>docker kill -s HUP web</code> to reload Nginx config).</li>
<li><code>docker restart</code> = stop + start (same container). <code>docker pause</code>/<code>unpause</code>: freeze/thaw.</li>
<li><code>docker wait &lt;ctr&gt;</code>: block until the container stops, then print its exit code (useful in scripts and CI).</li>
<li><code>docker rm &lt;ctr&gt;</code>: delete a stopped container and its writable layer (<code>-f</code> kills it first; <code>-v</code> also removes its anonymous volumes). Named volumes survive.</li>
</ul>
<h5>stop vs kill</h5>
<p><code>docker stop</code> gives the app a chance to shut down gracefully: Uvicorn finishes in-flight requests, PostgreSQL does a fast shutdown and checkpoints, Nginx closes connections (the official Nginx image sets <code>STOPSIGNAL SIGQUIT</code> for graceful shutdown). If it hasn't exited after the grace period, Docker sends SIGKILL, which cannot be caught. <code>docker kill</code> skips the polite part. Rule: <b>stop</b> in normal operations; <b>kill</b> only for hung containers or to send a specific signal.</p>
<p>The PID 1 trap: in a pid namespace, PID 1 gets no default signal handlers. If your entrypoint is a shell script (<code>sh -c "python app.py"</code>) or a program that doesn't install a SIGTERM handler, SIGTERM is ignored, and every <code>docker stop</code> takes the full 10 s and ends in SIGKILL (exit 137). Fix: use exec form <code>CMD ["uvicorn", …]</code>, <code>exec</code> in entrypoint scripts, or <code>docker run --init</code> (tini) as PID 1.</p>
<h5>Exit codes</h5>
<table class="tbl"><tr><th>Code</th><th>Meaning</th><th>Typical cause</th></tr>
<tr><td><b>0</b></td><td>Success</td><td>A one-off job finished; or the app exited cleanly after SIGTERM</td></tr>
<tr><td><b>1</b></td><td>Generic application error</td><td>Uncaught Python exception, missing env var, failed DB connection at startup</td></tr>
<tr><td><b>125</b></td><td>Docker itself failed (the container never ran)</td><td>Unknown flag, port already allocated, invalid option to <code>docker run</code></td></tr>
<tr><td><b>126</b></td><td>Command found but cannot be invoked</td><td>Not executable (missing <code>chmod +x</code>), permission denied, it's a directory</td></tr>
<tr><td><b>127</b></td><td>Command not found</td><td>Typo, binary not in the image, wrong <code>PATH</code>, script with CRLF line endings or missing interpreter in the shebang</td></tr>
<tr><td><b>137</b></td><td>128 + 9: killed by SIGKILL</td><td><code>docker kill</code>, stop timeout expired, or the <b>OOM killer</b> (check <code>.State.OOMKilled</code>)</td></tr>
<tr><td><b>143</b></td><td>128 + 15: terminated by SIGTERM</td><td><code>docker stop</code> and the app didn't handle SIGTERM itself but died from it</td></tr></table>
<p>The pattern 128 + N means "died from signal N". (Exit code 139 = 128+11, SIGSEGV, also appears in the wild.)</p>
<h5>What happens when you type <code>docker run -d -p 8080:80 --name web nginx:1.27-alpine</code></h5>
<ol>
<li><b>CLI</b> parses flags, builds a container config (image, cmd, env, labels) and a host config (port bindings, mounts, restart policy, limits), and calls <code>POST /containers/create?name=web</code> on the Engine API.</li>
<li><b>dockerd checks the image</b> locally. If it's missing, the API returns "No such image"; the CLI then calls <code>POST /images/create</code> (pull) and retries create. You see "Unable to find image … locally" followed by pull progress.</li>
<li><b>Pull</b>: resolve <code>docker.io/library/nginx:1.27-alpine</code>, fetch the image index, select the manifest for this platform, download and verify missing <b>layers</b> by digest, unpack them into the storage driver / snapshotter.</li>
<li><b>Create</b>: dockerd generates an ID, writes <code>config.v2.json</code>/<code>hostconfig.json</code>, creates the container's <b>writable layer</b> on top of the image layers, and returns the ID. State: <i>created</i>.</li>
<li>The CLI calls <code>POST /containers/web/start</code> (and, without <code>-d</code>, <code>attach</code> first).</li>
<li><b>dockerd prepares</b>: mounts the overlay root filesystem, sets up volumes, networking (a network namespace, a <b>veth pair</b> with one end in the container and one on the <code>docker0</code> bridge, an IP from the bridge subnet, and NAT/DNAT rules for <code>-p 8080:80</code>; plus <code>docker-proxy</code> for some cases), generates <code>/etc/hosts</code>/<code>resolv.conf</code>/<code>hostname</code>, and converts everything into an <b>OCI runtime spec</b>.</li>
<li>dockerd calls <b>containerd</b> (gRPC) to create a container and task with that spec.</li>
<li>containerd writes the <b>bundle</b> and starts <b>containerd-shim-runc-v2</b>.</li>
<li>The shim runs <b>runc</b>, which creates the <b>namespaces</b>, puts the process in its <b>cgroup</b> with limits, pivots into the root filesystem, drops capabilities, applies seccomp/AppArmor, and <b><code>execve</code>s the entrypoint</b> (<code>/docker-entrypoint.sh nginx -g "daemon off;"</code>).</li>
<li><b>runc exits; the shim stays</b> as parent, holding stdio (which dockerd streams into the log driver) and waiting for the exit status. State: <i>running</i>. The CLI prints the ID.</li>
</ol>`,
      why: `<p>Containers are meant to be <b>disposable</b>: you create them, run them, stop them and throw them away, many times a day. To do that safely you need precise control over each stage:</p>
<ul class="pts">
<li><b>create and start are separate</b> so tools can prepare a container (attach networks, copy config in with <code>docker cp</code>) before its process runs; orchestrators use this split.</li>
<li><b>stop exists separately from kill</b> because data stores and APIs need a chance to flush, commit and drain. Killing PostgreSQL mid-write forces crash recovery on next start; killing an API drops in-flight requests (users see 502s during every deploy).</li>
<li><b>exited is a state, not deletion</b>, so you can read logs, inspect the exit code and OOM flag, and copy files out of a crashed container before removing it.</li>
<li><b>Exit codes and states</b> are the contract that restart policies, Compose, Swarm and Kubernetes use to decide "crashed, restart it" vs "finished, leave it".</li>
</ul>
<p>Before containers, the equivalent was init scripts and PID files: "is it running?" meant grepping <code>ps</code>, and "stop" meant <code>kill $(cat /var/run/app.pid)</code> and hoping. Docker gives every workload the same, inspectable lifecycle. And knowing what <code>docker run</code> does internally is what lets you debug failures at the right layer: a 125 is a Docker/CLI problem, a pull error is registry/auth/network, a 127 is the image contents, a 137 is signals or memory.</p>`,
      diagram: {
        html: flow([
          ["image (local)", "docker pull", "w"],
          ["created", "docker create"],
          ["running", "docker start / run", "g"],
          ["paused", "docker pause ⇄ unpause"],
          ["exited", "stop (TERM→KILL) / kill / process ends", "r"],
          ["removed", "docker rm"]
        ]) + lanes([
          ["Side paths", ["running → restarting → running (restart policy)", "exited → running (docker start: same container, same writable layer)", "removal error → dead (can only be removed)"]],
          ["docker run internally", ["CLI → POST /containers/create (pull on 404)", "dockerd: writable layer, network, OCI spec", "containerd → shim → runc", "runc: namespaces + cgroups → execve → exit", "shim stays as parent; state = running"]],
          ["Exit codes", ["0 ok · 1 app error", "125 Docker error", "126 not executable · 127 not found", "137 SIGKILL / OOM · 143 SIGTERM"]]
        ]),
        steps: [
          `<code>docker pull</code> puts the image in the local store. <code>docker create</code> makes a container (config + writable layer) in state <b>created</b>; nothing runs yet.`,
          `<code>docker start</code> asks containerd/runc to create namespaces and cgroups and exec the entrypoint: state <b>running</b>. <code>docker run</code> does pull + create + start in one go.`,
          `<code>docker pause</code> freezes every process via the cgroup freezer (<b>paused</b>); <code>unpause</code> thaws them.`,
          `When PID 1 ends (finished, crashed, <code>stop</code>, <code>kill</code>, OOM), the container becomes <b>exited</b> with an exit code. With a restart policy it may go through <b>restarting</b> instead.`,
          `<code>docker rm</code> deletes config and writable layer. If removal fails half-way the container is <b>dead</b> and can only be removed.`
        ]
      },
      cmds: [
        {
          t: "Hands-on: run Nginx and reach it",
          lang: "sh",
          code: `docker run -d --name web -p 8080:80 nginx:1.27-alpine
docker ps
curl -I http://localhost:8080
docker logs web | tail -3`,
          out: `Unable to find image 'nginx:1.27-alpine' locally
1.27-alpine: Pulling from library/nginx
...
Status: Downloaded newer image for nginx:1.27-alpine
8c1e2f4b9a03d1...
CONTAINER ID   IMAGE               COMMAND                  CREATED         STATUS         PORTS                  NAMES
8c1e2f4b9a03   nginx:1.27-alpine   "/docker-entrypoint.…"   3 seconds ago   Up 2 seconds   0.0.0.0:8080->80/tcp   web
HTTP/1.1 200 OK
Server: nginx/1.27.x
...
172.17.0.1 - - [...] "HEAD / HTTP/1.1" 200 0 "-" "curl/8.5.0" "-"`,
          note: `<p><code>-d</code> detaches, <code>-p 8080:80</code> publishes container port 80 on host port 8080. The log line shows the request coming from <code>172.17.0.1</code>: the bridge gateway, because the request was NATed into the container's network namespace.</p>`
        },
        {
          t: "Walk through every state and observe it",
          lang: "sh",
          code: `docker create --name life nginx:1.27-alpine
docker inspect --format '{{.State.Status}}' life      # created
docker start life
docker inspect --format '{{.State.Status}} pid={{.State.Pid}}' life
docker pause life
docker inspect --format '{{.State.Status}}' life      # paused
docker unpause life
docker stop life
docker inspect --format '{{.State.Status}} exit={{.State.ExitCode}}' life
docker ps -a --filter name=life --format 'table {{.Names}}\\t{{.Status}}'
docker rm life
docker inspect life                                    # error: No such object`,
          out: `3a9d...
created
life
running pid=51022
life
paused
life
life
exited exit=0
NAMES     STATUS
life      Exited (0) 2 seconds ago
life
Error: No such object: life`,
          note: `<p>Nginx exits with 0 on <code>docker stop</code> because its image sets <code>STOPSIGNAL SIGQUIT</code> and Nginx handles it as a graceful shutdown. <code>docker ps</code> (without <code>-a</code>) shows only running and paused containers; created and exited ones need <code>-a</code>. Status filters: <code>docker ps -a --filter status=exited</code>.</p>`
        },
        {
          t: "stop vs kill: timing and exit codes",
          lang: "sh",
          code: `# a process that ignores SIGTERM: sleep as PID 1 has no SIGTERM handler
docker run -d --name stubborn alpine:3.20 sleep 1000
time docker stop stubborn
docker inspect --format '{{.State.ExitCode}}' stubborn       # 137: SIGKILL after grace period

# same with a shorter grace period
docker start stubborn && time docker stop -t 2 stubborn

# kill is immediate
docker start stubborn && time docker kill stubborn
docker inspect --format '{{.State.ExitCode}}' stubborn       # 137

# with an init process (tini) as PID 1, SIGTERM is forwarded and handled
docker run -d --init --name polite alpine:3.20 sleep 1000
time docker stop polite
docker inspect --format '{{.State.ExitCode}}' polite         # 143: died from SIGTERM`,
          out: `real    0m10.3s
137
real    0m2.3s
real    0m0.2s
137
real    0m0.4s
143`,
          note: `<p>This experiment shows the PID 1 trap: the kernel doesn't apply default signal actions to PID 1 of a namespace, so a bare <code>sleep</code> ignores SIGTERM and Docker waits the full grace period before SIGKILL (137). With <code>--init</code>, <code>tini</code> is PID 1 and forwards SIGTERM to <code>sleep</code>, which dies from it (143) instantly. A well-written app (Uvicorn, PostgreSQL, Nginx) handles the signal and usually exits 0.</p>`
        },
        {
          t: "Read exit codes 1, 125, 126 and 127",
          lang: "sh",
          code: `docker run --name e1 alpine:3.20 sh -c 'exit 1';           echo "exit=$?"
docker run --name e125 --no-such-flag alpine:3.20;         echo "exit=$?"
docker run --name e126 alpine:3.20 /etc;                   echo "exit=$?"
docker run --name e127 alpine:3.20 nosuchcommand;          echo "exit=$?"
docker ps -a --filter name=e1 --format '{{.Names}}: {{.Status}}'
docker rm e1 e126 e127`,
          out: `exit=1
unknown flag: --no-such-flag
exit=125
docker: Error response from daemon: failed to create task for container: ... exec: "/etc": is a directory: permission denied: unknown.
exit=126
docker: Error response from daemon: failed to create task for container: ... exec: "nosuchcommand": executable file not found in $PATH: unknown.
exit=127
e1: Exited (1) 5 seconds ago
...`,
          note: `<p><code>docker run</code> in the foreground returns the container's exit code as its own, which is why <code>$?</code> works in CI. 125 means the <code>docker</code> command itself failed before a container ran. For 126/127 the container was <i>created</i> but runc couldn't exec the entrypoint, so the container exists in state created/exited with that code. Exact error text varies by version.</p>`
        },
        {
          t: "Detect an OOM kill (137 with OOMKilled=true)",
          lang: "sh",
          code: `docker run --name oom --memory 32m python:3.12-slim python -c "x = bytearray(200 * 1024 * 1024)"
docker inspect --format 'exit={{.State.ExitCode}} oom={{.State.OOMKilled}}' oom
docker rm oom`,
          out: `exit=137 oom=true`,
          note: `<p>Both <code>docker kill</code> and the OOM killer produce 137; only <code>.State.OOMKilled</code> (and <code>docker events</code> showing an <code>oom</code> event) tells them apart. In the cgroup, <code>memory.events</code> counts <code>oom_kill</code>. On some cgroup v2 setups the flag can be unreliable if a non-PID-1 process was killed; check <code>dmesg</code> as well.</p>`
        },
        {
          t: "See the container's process on the host",
          lang: "sh",
          code: `docker top web                                  # ps of the container, host PIDs
docker inspect --format '{{.State.Pid}}' web
ps -fp $(docker inspect --format '{{.State.Pid}}' web)
pstree -p $(pgrep -f "containerd-shim.*$(docker inspect --format '{{.Id}}' web)") 2>/dev/null
cat /proc/$(docker inspect --format '{{.State.Pid}}' web)/cgroup`,
          out: `UID    PID     PPID    C   STIME  TTY   TIME      CMD
root   48213   48190   0   10:02  ?     00:00:00  nginx: master process nginx -g daemon off;
101    48260   48213   0   10:02  ?     00:00:00  nginx: worker process
48213
UID        PID  PPID  C STIME TTY          TIME CMD
root     48213 48190  0 10:02 ?        00:00:00 nginx: master process nginx -g daemon off;
containerd-shim(48190)---nginx(48213)-+-nginx(48260)
                                      ...
0::/system.slice/docker-8c1e2f4b9a03d1....scope`,
          note: `<p><code>docker top</code> shows <b>host</b> PIDs, not the in-container ones. UID 101 is the <code>nginx</code> user from the image. The cgroup line shows cgroup v2 with the systemd driver; on cgroup v1 or with the <code>cgroupfs</code> driver it looks like <code>/docker/&lt;id&gt;</code>. On Docker Desktop these host commands must be run inside the VM.</p>`
        },
        {
          t: "wait, restart policies and the restarting state",
          lang: "sh",
          code: `# docker wait blocks until exit and prints the code
docker run -d --name job alpine:3.20 sh -c 'sleep 3; exit 3'
docker wait job

# a crashing container under a restart policy
docker run -d --name crashy --restart on-failure:3 alpine:3.20 sh -c 'sleep 1; exit 1'
for i in 1 2 3 4 5; do docker inspect --format '{{.State.Status}} restarts={{.RestartCount}}' crashy; sleep 1; done
docker rm -f job crashy web stubborn polite`,
          out: `3
running restarts=0
restarting restarts=1
running restarts=1
restarting restarts=2
exited restarts=3`,
          note: `<p><code>on-failure:3</code> restarts only on non-zero exit codes, up to 3 times, with an increasing delay between attempts. <code>always</code> and <code>unless-stopped</code> restart regardless of exit code, also when the daemon starts; <code>unless-stopped</code> stays stopped if <i>you</i> stopped it. A manual <code>docker stop</code> is never "undone" by <code>on-failure</code>.</p>`
        }
      ],
      internals: `<p><b>State is tracked by dockerd</b> in <code>/var/lib/docker/containers/&lt;id&gt;/config.v2.json</code> (the <code>State</code> object: <code>Running</code>, <code>Paused</code>, <code>Restarting</code>, <code>OOMKilled</code>, <code>Dead</code>, <code>Pid</code>, <code>ExitCode</code>, <code>StartedAt</code>, <code>FinishedAt</code>). <code>docker inspect</code> reads it. containerd tracks the <i>task</i> separately; <code>sudo ctr -n moby tasks ls</code> shows RUNNING/PAUSED/STOPPED.</p>
<p><b>Start</b> path: dockerd → containerd <code>Tasks.Create</code> → shim → <code>runc create</code>. runc's process re-executes itself as <code>runc init</code> inside the new namespaces: it sets up mounts (overlay root, <code>/proc</code>, <code>/dev</code>, volumes, the generated <code>/etc/hosts</code>), joins the cgroup at <code>/sys/fs/cgroup/system.slice/docker-&lt;id&gt;.scope</code>, sets hostname, applies capabilities, <code>no_new_privs</code>, seccomp and the LSM profile, then blocks on <code>exec.fifo</code>. <code>Tasks.Start</code> → <code>runc start</code> opens the FIFO, unblocking <code>runc init</code>, which <code>execve</code>s the entrypoint, replacing itself. The container's PID 1 is literally the process that was <code>runc init</code>.</p>
<p><b>Networking at start</b> (default bridge): libnetwork in dockerd creates a network namespace, a veth pair (<code>vethXXXX</code> on the host attached to <code>docker0</code>, <code>eth0</code> inside), assigns an IP from <code>172.17.0.0/16</code>, sets the default route via <code>172.17.0.1</code>, and installs NAT rules: <code>MASQUERADE</code> for outbound and a <code>DNAT</code> in the <code>DOCKER</code> chain for <code>-p 8080:80</code> (see <code>sudo iptables -t nat -L DOCKER -n</code>; newer releases can use nftables). The namespace path is passed to runc in the spec so runc joins it instead of creating an empty one.</p>
<p><b>Stop</b>: dockerd sends the stop signal via containerd → shim → <code>kill(pid1, SIGTERM)</code>, starts a timer, and if the task hasn't exited by the timeout sends SIGKILL. Signals sent to PID 1 of a pid namespace from inside the namespace are ignored unless PID 1 installed a handler, which is the root of the "10-second stop" problem; SIGKILL from the parent namespace always works. When PID 1 dies, the kernel kills every other process in the pid namespace.</p>
<p><b>Exit</b>: the shim receives <code>SIGCHLD</code>, reaps the process with <code>wait4</code>, gets the status (exit code or terminating signal), and publishes a <code>TaskExit</code> event. containerd forwards it to dockerd, which records <code>ExitCode</code> (128+signal when killed by a signal), checks the OOM counter in the cgroup's <code>memory.events</code> to set <code>OOMKilled</code>, tears down networking, applies the restart policy and emits a <code>die</code> event. The shim then exits. The writable layer and logs remain until <code>docker rm</code>.</p>
<p><b>Pause</b> writes to the cgroup freezer (<code>cgroup.freeze</code> = 1 on v2; <code>freezer.state</code> = FROZEN on v1). Processes stop being scheduled; they don't receive a signal and can't tell they were frozen (timeouts can fire after unpause). <b>Remove</b> unmounts and deletes the writable layer, removes the container directory, and deletes anonymous volumes only with <code>-v</code>.</p>`,
      prod: `<p><b>Graceful deploys of the FastAPI service.</b> The API image uses exec form <code>CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]</code> so Uvicorn is PID 1 and receives SIGTERM directly; Uvicorn stops accepting connections and finishes in-flight requests. Compose sets <code>stop_grace_period: 30s</code> (the CLI equivalent is <code>--stop-timeout 30</code>) because some report endpoints take up to 20 s. Before this was fixed, the Dockerfile used <code>CMD uvicorn main:app …</code> (shell form): <code>/bin/sh</code> was PID 1, ignored SIGTERM, every deploy took 10 s per container and ended with exit 137 and dropped requests.</p>
<p><b>PostgreSQL.</b> The official image's <code>STOPSIGNAL</code> is SIGINT (fast shutdown). Never <code>docker kill</code> the database in normal operation, and give it a long grace period (<code>stop_grace_period: 60s</code>) so it can checkpoint; otherwise the next start runs crash recovery. Data lives on a named volume, so <code>docker rm</code> + <code>docker run</code> with the same volume recreates the container without losing data.</p>
<p><b>Triage runbook</b> when a container is down:</p>
<ul class="pts">
<li><code>docker ps -a --filter name=api</code> → state and "Exited (N)".</li>
<li><code>docker inspect --format '{{.State.ExitCode}} {{.State.OOMKilled}} {{.State.Error}} {{.RestartCount}}' api</code>.</li>
<li><code>docker logs --tail 100 api</code> → the stack trace (exit 1), "not found" (127).</li>
<li>137 + <code>OOMKilled=true</code> → raise <code>--memory</code> or fix the leak; 137 without OOM → someone/something killed it, or the stop timeout expired; 143 → stopped by SIGTERM (deploy, orchestrator).</li>
<li><code>docker events --since 1h --filter container=api</code> → who stopped/killed/restarted it.</li>
</ul>`,
      iq: [
        ["dca", "What does docker stop do by default? A) Sends SIGKILL immediately B) Sends SIGTERM, waits 10 seconds, then sends SIGKILL C) Sends SIGSTOP D) Freezes the container's cgroup", `<p><b>B.</b> The signal is SIGTERM unless the image sets <code>STOPSIGNAL</code> or you pass <code>--stop-signal</code>; the grace period is 10 s unless changed with <code>docker stop -t</code> or <code>--stop-timeout</code>. A describes <code>docker kill</code>. D describes <code>docker pause</code> (cgroup freezer, not SIGSTOP, so C is also wrong).</p>`],
        ["dca", "A container exits with code 137 and docker inspect shows OOMKilled: false. What are the likely causes?", `<p>137 = 128 + 9: the process received <b>SIGKILL</b>. With OOMKilled false the likely causes are <code>docker kill</code> (or <code>docker rm -f</code>), or <code>docker stop</code> whose grace period expired because the app ignored SIGTERM (commonly a shell-form CMD where <code>/bin/sh</code> is PID 1). Check <code>docker events</code> for <code>kill</code> events with <code>signal=15</code> followed by <code>signal=9</code>. If OOMKilled were true, it would be the memory cgroup limit.</p>`],
        ["dca", "Which command shows the processes running inside a container, using host PIDs, without entering it?", `<p><code>docker top &lt;container&gt;</code>. It runs <code>ps</code> on the host against the container's cgroup and shows host PIDs. <code>docker exec &lt;c&gt; ps</code> also lists processes but runs inside (requires <code>ps</code> in the image and shows namespaced PIDs). <code>docker stats</code> shows resource usage, not processes.</p>`],
        ["dca", "Which TWO states can a container be in that do NOT show up in plain docker ps (without -a)?", `<p><b>created</b> and <b>exited</b> (also <b>dead</b>). <code>docker ps</code> lists running containers (including paused and restarting ones). Use <code>docker ps -a</code> or filter, e.g. <code>docker ps -a --filter status=exited</code>.</p>`],
        ["fresher", "What is the difference between docker run and docker start?", `<p><code>docker run</code> creates a <b>new</b> container from an image (pulling it if needed) and starts it. <code>docker start</code> starts an <b>existing</b> created or exited container, keeping its ID, name, writable layer and configuration. Running <code>docker run --name web …</code> twice fails with a name conflict; <code>docker start web</code> reuses the old one.</p>`],
        ["mid", "Your API container takes exactly 10 seconds to stop on every deploy and exits with 137. Why, and how do you fix it?", `<p>PID 1 is not handling SIGTERM, so Docker waits the full grace period and sends SIGKILL. Usually the Dockerfile uses <b>shell form</b> (<code>CMD uvicorn main:app</code>) so <code>/bin/sh -c</code> is PID 1 and doesn't forward signals, or an entrypoint script runs the app without <code>exec</code>. Fix: exec form <code>CMD ["uvicorn", "main:app", …]</code>; <code>exec "$@"</code> at the end of entrypoint scripts; or <code>docker run --init</code> / <code>init: true</code> in Compose to put tini as PID 1. Expect exit 0 (graceful) afterwards.</p>`],
        ["mid", "What is the difference between exit code 126 and 127?", `<p><b>127</b>: the command was not found (typo, not installed in the image, not on <code>PATH</code>, or a script's shebang interpreter like <code>/bin/bash</code> doesn't exist in an Alpine image). <b>126</b>: the command was found but can't be executed (missing execute permission, it's a directory, or a permission problem). <b>125</b>, by contrast, means the <code>docker run</code> command itself failed before the container ran.</p>`],
        ["senior", "Walk through what happens, component by component, when you run docker run -d -p 8080:80 nginx:1.27-alpine on a host that doesn't have the image.", `<p>CLI → <code>POST /containers/create</code> → dockerd returns "No such image" → CLI <code>POST /images/create</code>: dockerd authenticates to Docker Hub, fetches the index and platform manifest, downloads and verifies layers, unpacks them → CLI retries create: dockerd writes the config and creates the writable layer → CLI <code>POST /containers/{id}/start</code> → dockerd sets up the overlay mount, network namespace, veth pair on <code>docker0</code>, IP, NAT/DNAT for 8080→80, and builds the OCI spec → gRPC to containerd → containerd writes the bundle and starts <code>containerd-shim-runc-v2</code> → shim runs <code>runc create</code>/<code>start</code>: namespaces, cgroup, pivot_root, capabilities, seccomp, <code>execve</code> of the entrypoint → runc exits, shim remains parent → dockerd marks it running and the CLI prints the ID.</p>`],
        ["senior", "Why does docker pause not lose any work, and why might an application still misbehave after unpause?", `<p>Pause uses the cgroup <b>freezer</b>: processes are simply not scheduled; memory, open files and sockets stay intact, and no signal is delivered. But time keeps moving: TCP peers may time out, leases and locks (Redis locks, DB connections with keepalive) may expire, and the app may see a large wall-clock jump on resume. Pause is good for snapshots/debugging, not for "temporarily stopping" a service in production.</p>`]
      ],
      gotchas: [
        `<b>PID 1 ignores SIGTERM by default.</b> The kernel doesn't apply default signal actions to a pid namespace's init. Apps must handle SIGTERM, or use <code>--init</code>. Shell-form <code>CMD</code> is the most common cause of 10 s stops and 137s.`,
        `<b>PID 1 must reap zombies.</b> If your app spawns child processes that exit, PID 1 must <code>wait()</code> for them or zombies accumulate (and can exhaust <code>pids.max</code>). <code>--init</code> (tini) solves this too.`,
        `<b><code>docker run</code> twice creates two containers.</b> Without <code>--rm</code>, every run leaves an exited container behind. <code>docker container prune</code> cleans them; <code>--rm</code> avoids them for one-off commands.`,
        `<b>137 is ambiguous.</b> Manual kill, stop timeout and OOM all produce it; always check <code>.State.OOMKilled</code> and <code>docker events</code>.`,
        `<b><code>docker rm</code> keeps named volumes</b> and even anonymous ones (unless <code>-v</code>). That's how PostgreSQL data survives recreation, and also how disks fill up with orphaned anonymous volumes.`,
        `<b><code>restart: always</code> can hide crash loops</b>: the container appears "Up 2 seconds" every time you look. Check <code>RestartCount</code> and <code>docker events</code>.`,
        `<b>Restarting a container is not recreating it.</b> <code>docker restart</code> keeps the writable layer and the old configuration; to apply a new image or new env vars you must remove and create a new container (what Compose does when config changes).`
      ],
      best: [
        `Use exec-form <code>CMD</code>/<code>ENTRYPOINT</code> and make your app handle SIGTERM gracefully; add <code>--init</code> if the process spawns children or can't handle signals.`,
        `Set a stop grace period that matches the workload (APIs: longer than the slowest request; databases: 30-60 s+).`,
        `Use <code>docker stop</code> for normal operation; reserve <code>docker kill</code> for hung containers or for sending specific signals (<code>-s HUP</code> to reload).`,
        `Always inspect the exit code, OOM flag and logs before removing a crashed container; use <code>--rm</code> only for disposable one-off commands.`,
        `Set memory limits so a leak kills one container (137, OOMKilled) instead of triggering the host OOM killer against random processes.`
      ],
      lab: [
        `Run <code>docker run -d --name web -p 8080:80 nginx:1.27-alpine</code>, then <code>curl -I http://localhost:8080</code> and <code>docker logs web</code>.`,
        `Take a container named <code>life</code> through created → running → paused → running → exited → removed, printing <code>docker inspect --format '{{.State.Status}}' life</code> after each step and <code>docker ps -a</code> at the end.`,
        `Time <code>docker stop</code> against <code>alpine sleep 1000</code> (≈10 s, exit 137), then with <code>-t 2</code>, then <code>docker kill</code>, then a container started with <code>--init</code> (≈0 s, exit 143). Explain each result.`,
        `Reproduce exit codes 1, 125, 126, 127 and an OOM 137 (<code>--memory 32m</code> with a Python allocation), and record <code>ExitCode</code> and <code>OOMKilled</code> for each.`,
        `Find nginx on the host: <code>docker top web</code>, <code>docker inspect --format '{{.State.Pid}}' web</code>, <code>ps -fp &lt;pid&gt;</code>, <code>cat /proc/&lt;pid&gt;/cgroup</code>, and confirm its parent is the shim.`,
        `Run <code>docker events</code> in another terminal during all of the above.`,
        `<b>Done when:</b> you have a table of each experiment with state, exit code, stop time and OOM flag, and can explain why the stubborn container took 10 s and exited 137 while the <code>--init</code> one exited 143 immediately.`
      ],
      teach: `<p>"A container has a simple lifecycle. <code>docker create</code> makes it: config plus a writable layer, nothing running. <code>docker start</code> runs its main process, and now it's running. <code>pause</code> freezes it with the cgroup freezer. When the main process ends, for any reason, it's exited, but it still exists with its logs and exit code until I <code>docker rm</code> it. <code>docker run</code> is just pull + create + start.</p>
<p>Stop and kill are different. <code>stop</code> sends SIGTERM, waits ten seconds, then SIGKILL. <code>kill</code> is SIGKILL right away. If a container always takes ten seconds to stop and exits 137, PID 1 is ignoring SIGTERM, usually because of shell-form CMD. Exit codes tell you what happened: 0 fine, 1 app error, 125 Docker itself failed, 126 not executable, 127 not found, 137 killed or out of memory, 143 terminated by SIGTERM.</p>
<p>Under the hood, <code>docker run</code> goes CLI to API to dockerd, which pulls layers and prepares the writable layer and network; then containerd starts a shim, the shim runs runc, runc creates namespaces and cgroups and execs my entrypoint, and exits. The shim stays as the parent and reports the exit code back."</p>`
    }
  ],
  quiz: [
    {
      q: `A developer runs the API and PostgreSQL as two containers on the same user-defined network. The API's <code>DATABASE_URL</code> is <code>postgresql://app:secret@localhost:5432/shop</code> and it fails with "connection refused". PostgreSQL is definitely running. Why?`,
      code: `docker run -d --name postgres --network shop -e POSTGRES_PASSWORD=secret postgres:16
docker run -d --name api --network shop -e DATABASE_URL=postgresql://app:secret@localhost:5432/shop shop/api:1.0`,
      lang: "sh",
      ans: `<code>localhost</code> inside the API container is the API container's own network namespace; nothing listens on 5432 there. Use <code>postgres:5432</code>.`,
      why: `Each container has its own <code>net</code> namespace with its own loopback interface. PostgreSQL listens on <i>its</i> namespace's interfaces. On a user-defined network, Docker's embedded DNS (127.0.0.11) resolves the container name <code>postgres</code> to its IP. Publishing the port with <code>-p 5432:5432</code> wouldn't help either: that maps the host's port, not the API container's localhost.`
    },
    {
      q: `After a deploy, <code>docker ps -a</code> shows the new API container as <code>Exited (127) 3 seconds ago</code>. The Dockerfile's last line is <code>CMD ["./start.sh"]</code> and <code>start.sh</code> starts with <code>#!/bin/bash</code>. The base image is <code>python:3.12-alpine</code>. What's wrong?`,
      ans: `127 = command not found: Alpine has no <code>/bin/bash</code>, so the shebang interpreter is missing.`,
      why: `The kernel reports "not found" for a missing <i>interpreter</i> too, which surprises people because <code>start.sh</code> exists. Fix the shebang to <code>#!/bin/sh</code>, install bash, or use a Debian-based image. Another classic cause of 127 with scripts is Windows CRLF line endings (the kernel looks for <code>/bin/sh\\r</code>). If the file existed but lacked execute permission, the code would be 126.`
    },
    {
      q: `Your monitoring shows the worker container exited with code 137. A colleague says "someone must have run docker kill". What do you check before agreeing?`,
      code: `docker inspect --format '{{.State.ExitCode}} {{.State.OOMKilled}} {{.HostConfig.Memory}}' worker
docker events --since 2h --filter container=worker`,
      lang: "sh",
      ans: `Whether <code>OOMKilled</code> is true (memory limit hit), and in <code>docker events</code> whether there was a <code>kill</code> (signal=9), a <code>stop</code> whose timeout expired (signal=15 then signal=9), or an <code>oom</code> event.`,
      why: `137 only says "SIGKILL". Three common sources: <code>docker kill</code>/<code>rm -f</code>, <code>docker stop</code> after the grace period (app ignored SIGTERM), and the kernel OOM killer when the cgroup's <code>memory.max</code> is exceeded. Each has a different fix (process, signal handling, memory limit or leak).`
    },
    {
      q: `A CI job mounts <code>/var/run/docker.sock:/var/run/docker.sock:ro</code> into a third-party build container "so it can only read container info". Is the host safe?`,
      ans: `No. <code>:ro</code> only makes the socket <i>file</i> read-only; API requests (including creating a privileged container with <code>/</code> mounted) still work. It's root on the host.`,
      why: `The socket is a communication channel to a root daemon; the mount flag doesn't filter HTTP requests. Use a socket proxy that whitelists <code>GET</code> endpoints, rootless Docker, a separate build VM, or daemonless builders (BuildKit rootless, kaniko).`
    },
    {
      q: `You restart <code>dockerd</code> on a production host to apply a <code>daemon.json</code> change, and all containers including PostgreSQL restart. A teammate says that's unavoidable. Is it?`,
      code: `sudo systemctl restart docker`,
      lang: "sh",
      ans: `It's avoidable for most changes: set <code>"live-restore": true</code> so containers keep running while the daemon is down, kept alive by their shims.`,
      why: `With live restore, container processes are children of <code>containerd-shim-runc-v2</code>, not dockerd; on restart dockerd reconnects to containerd and reattaches. Without it, dockerd stops containers on shutdown. Caveats: some changes need a container recreate anyway, and Swarm services behave differently; check the docs for your version.`
    },
    {
      q: `Which TWO commands leave you with a running Nginx container named <code>web</code>, assuming the image is local and no container named <code>web</code> exists? (A) <code>docker create --name web nginx:1.27-alpine</code> (B) <code>docker run -d --name web nginx:1.27-alpine</code> (C) <code>docker create --name web nginx:1.27-alpine &amp;&amp; docker start web</code> (D) <code>docker pull nginx:1.27-alpine</code>`,
      ans: `B and C.`,
      why: `<code>docker run</code> = create + start. A only creates (state <i>created</i>, not running). D only downloads the image. C is the explicit two-step version of B.`
    }
  ]
},
/* ===== Day 2 ===== */
{
  n: 2,
  title: "Images and Dockerfiles",
  goal: `<b>By the end of today</b> you can explain how an image is stored (layers, OverlayFS, copy-on-write, digests), manage images confidently, write every Dockerfile instruction correctly (including the CMD/ENTRYPOINT rules), and turn a FastAPI app into a small, cache-friendly, multi-stage, non-root, multi-platform image with BuildKit.`,
  rev: [
    `<b>An image</b> = ordered, read-only, content-addressed <b>layers</b> (tar diffs) + a JSON <b>config</b>, described by a <b>manifest</b> (and, for multi-platform images, an <b>index</b>). A container adds one thin <b>writable layer</b>. OverlayFS stacks them: <code>lowerdir</code> (image layers) + <code>upperdir</code> (writable) → <code>merged</code> (what the process sees), with <code>workdir</code> as scratch. Writes <b>copy-up</b> the whole file; deletes create <b>whiteouts</b>. Deleting a file in a later layer never shrinks the image.`,
    `<b>Names:</b> a <b>tag</b> is a mutable pointer; an <b>image ID</b> identifies the local image (classically the config digest); a <b>repo digest</b> (<code>@sha256:…</code>) identifies the manifest in a registry and pins exact content. <code>prune</code> removes <b>dangling</b> (untagged) images; <code>prune -a</code> removes all <b>unused</b> ones. <code>save/load</code> keeps layers, tags and config; <code>export/import</code> flattens a container's filesystem and loses history and config (CMD, ENV…). <code>commit</code> is for debugging, never for production images.`,
    `<b>CMD vs ENTRYPOINT:</b> ENTRYPOINT is the executable, CMD is the default arguments (or the default command if there is no ENTRYPOINT). <code>docker run img args</code> replaces CMD; <code>--entrypoint</code> replaces ENTRYPOINT. Use <b>exec form</b> (<code>["uvicorn", "main:app"]</code>) so your app is PID 1 and receives SIGTERM. Shell form runs <code>/bin/sh -c</code>. <b>COPY</b> copies local files; <b>ADD</b> also fetches URLs and auto-extracts local tars: prefer COPY. <b>ARG</b> exists only at build time (ARG before FROM is only usable in FROM lines); <b>ENV</b> persists into containers. Never pass secrets via ARG/ENV.`,
    `<b>Cache:</b> a step is reused if its parent is cached and its instruction text is identical (for COPY/ADD, the files' content checksums too). After the first miss, every later step rebuilds. So: base → system deps → <code>COPY requirements.txt</code> → <code>RUN pip install</code> → <code>COPY . .</code>. <code>.dockerignore</code> keeps <code>.git</code>, <code>.venv</code>, <code>.env</code> and <code>node_modules</code> out of the context.`,
    `<b>BuildKit</b> (default builder) adds parallel stages, <code>RUN --mount=type=cache</code> (persistent package caches), <code>--mount=type=secret</code> (secrets never stored in a layer), <code>--target</code>, and with <code>docker buildx</code> multi-platform builds (<code>--platform linux/amd64,linux/arm64 --push</code>). Multi-stage builds copy only the artifacts into a slim final stage: e.g. a FastAPI image of ~1 GB becomes ~150-200 MB, runs as non-root, and rebuilds in seconds when only <code>main.py</code> changes.`
  ],
  topics: [
    /* ------------------------------------------------------------------ */
    {
      id: "d2-images-layers",
      title: "Images, layers, copy-on-write and image management",
      lv: ["fresher", "mid", "senior", "dca"],
      eli5: `<p>Imagine a stack of <b>transparent plastic sheets</b>, like old overhead-projector slides. The bottom sheet has a drawing of a basic house (the operating system files). The next sheet adds windows (Python). The next adds furniture (your libraries). The top one adds a name plate (your code). Look down through the stack and you see one complete picture. Each sheet is a <b>layer</b>, and the whole stack is an <b>image</b>.</p>
<p>The sheets are <b>laminated</b>: nobody can draw on them. So when you run a container, Docker puts one <b>blank sheet</b> on top. If the container wants to change the furniture, it doesn't scrub the laminated sheet; it draws a new sofa on its own top sheet, covering the old one. That's <b>copy-on-write</b>. If it wants to "delete" something, it sticks a white patch over it on the top sheet. The thing is still underneath; it's just hidden.</p>
<p>Because the laminated sheets never change, ten containers can share the same stack and each just gets its own blank top sheet. And if two images use the same bottom sheets (say, both start from <code>python:3.12-slim</code>), your computer stores those sheets only once.</p>`,
      what: `<h5>What an image really is</h5>
<p>An image is not a single file or a disk image. In OCI terms it is:</p>
<ul class="pts">
<li><b>Layers</b>: each is a tar archive (usually gzip- or zstd-compressed) containing the files <i>added, changed or deleted</i> by one build step. Each layer is identified by the sha256 digest of its content.</li>
<li>A <b>config</b> JSON: the default <code>Cmd</code>, <code>Entrypoint</code>, <code>Env</code>, <code>WorkingDir</code>, <code>User</code>, <code>ExposedPorts</code>, <code>Volumes</code>, <code>Labels</code>, <code>Healthcheck</code>, the target OS/architecture, the ordered list of uncompressed layer digests (<code>rootfs.diff_ids</code>) and a <code>history</code> of build steps.</li>
<li>A <b>manifest</b>: points to the config digest and the list of (compressed) layer digests and sizes.</li>
<li>Optionally an <b>image index</b> (a.k.a. manifest list): one manifest per platform (<code>linux/amd64</code>, <code>linux/arm64</code>…). <code>docker pull nginx</code> picks the right one automatically.</li>
</ul>
<p>Everything is <b>content-addressed</b>: change one byte and every digest above it changes. That's what makes images <b>immutable</b> and verifiable: a digest is a promise about exact bytes.</p>
<h5>Immutable images, layers and the image filesystem</h5>
<ul class="pts">
<li>Every Dockerfile instruction that changes files (<code>RUN</code>, <code>COPY</code>, <code>ADD</code>) produces a new layer. Instructions that only change metadata (<code>ENV</code>, <code>CMD</code>, <code>EXPOSE</code>, <code>LABEL</code>…) add history entries but no filesystem content (they show <code>0B</code> in <code>docker history</code>).</li>
<li>Layers are <b>shared</b>: images built <code>FROM python:3.12-slim</code> all reuse its layers on disk and in the registry. Pulling a new version of your app only downloads the layers that changed.</li>
<li>A layer is a <b>diff</b>. If layer 3 deletes a 500 MB file added in layer 2, the image still contains (and ships) those 500 MB; layer 3 only records a "deleted" marker. Clean up in the <i>same</i> <code>RUN</code> that created the files, or use multi-stage builds.</li>
<li>A <b>base image</b> is the image named in <code>FROM</code>: e.g. <code>debian:bookworm-slim</code>, <code>alpine:3.20</code>, <code>python:3.12-slim</code>, distroless images, or <code>scratch</code> (an empty image, for static binaries). Your choice of base drives size, available tools, libc (glibc vs musl on Alpine) and the CVE count.</li>
</ul>
<h5>OverlayFS and copy-on-write</h5>
<p>The default storage driver on Linux is <code>overlay2</code>, built on the kernel's <b>OverlayFS</b>. (Recent Docker versions can instead use the containerd image store with its overlayfs <i>snapshotter</i>; the mechanics are the same.) An overlay mount combines directories:</p>
<ul class="pts">
<li><b>lowerdir</b>: one or more read-only directories, the image layers, stacked (topmost first).</li>
<li><b>upperdir</b>: the container's <b>writable layer</b>, a normal directory on the host.</li>
<li><b>workdir</b>: an empty scratch directory OverlayFS needs internally to make copy-up and renames atomic. Must be on the same filesystem as upperdir.</li>
<li><b>merged</b>: the mount point showing the union; this becomes the container's <code>/</code>.</li>
</ul>
<p>Rules of the merged view:</p>
<ul class="pts">
<li><b>Read</b>: a file is served from the topmost layer that has it. No copying; reads are near-native.</li>
<li><b>Write to an existing file</b> from a lower layer: <b>copy-up</b>: the <i>whole file</i> is copied into upperdir first, then modified. The first write to a 2 GB file copies 2 GB.</li>
<li><b>Create</b>: written directly to upperdir.</li>
<li><b>Delete</b>: a <b>whiteout</b> (a character device 0/0 with the same name) is created in upperdir to hide the lower file; deleting a directory and recreating it uses an "opaque" directory marker. In image layer tars these markers appear as <code>.wh.&lt;name&gt;</code> and <code>.wh..wh..opq</code> files.</li>
</ul>
<p>The <b>writable container layer</b> lives as long as the container. <code>docker stop</code>/<code>start</code> keep it; <code>docker rm</code> deletes it. That's why data must go in <b>volumes</b> (which bypass the overlay entirely and are faster for heavy writes, e.g. PostgreSQL's data directory).</p>
<h5>Tags vs IDs vs digests</h5>
<table class="tbl"><tr><th></th><th>Example</th><th>Mutable?</th><th>Scope</th></tr>
<tr><td><b>Tag</b></td><td><code>shop/api:1.8.3</code>, <code>python:3.12-slim</code>, <code>latest</code></td><td>Yes: can be moved to another image at any time</td><td>Human-friendly name in a repository</td></tr>
<tr><td><b>Image ID</b></td><td><code>sha256:7b3f…</code> (shown short: <code>7b3f9c2e1a04</code>)</td><td>No</td><td>Local. With the classic store it's the digest of the image config; with the containerd image store it's the manifest/index digest</td></tr>
<tr><td><b>Repo digest</b></td><td><code>shop/api@sha256:4ff1…</code></td><td>No</td><td>Digest of the manifest (or index) in a registry; exists once the image has been pushed or pulled</td></tr></table>
<p>One image can have many tags (<code>1.8.3</code>, <code>1.8</code>, <code>latest</code>) and they all share one ID. Deploy by version tag; pin critical base images by digest (<code>FROM python:3.12-slim@sha256:…</code>) for full reproducibility and let a bot (Renovate/Dependabot) bump it.</p>
<h5>Image management commands</h5>
<ul class="pts">
<li><code>docker images</code> / <code>docker image ls</code>: list (<code>--digests</code>, <code>--filter dangling=true</code>, <code>--format</code>).</li>
<li><code>docker image inspect</code>: full config, layers (<code>RootFS.Layers</code>), digests, architecture, the graph driver directories.</li>
<li><code>docker history</code>: one row per build step with size and the instruction that created it. <code>&lt;missing&gt;</code> in the IMAGE column is normal for layers built elsewhere (pulled images don't carry intermediate image IDs).</li>
<li><code>docker tag SOURCE TARGET</code>: add a name. No copy; same ID.</li>
<li><code>docker rmi</code> / <code>docker image rm</code>: remove a tag; the image's layers are deleted only when no tag and no container references them. Fails if a container (even stopped) uses it, unless <code>-f</code>.</li>
<li><code>docker image prune</code>: removes <b>dangling</b> images (<code>&lt;none&gt;:&lt;none&gt;</code>, untagged, typically old builds whose tag moved). <code>docker image prune -a</code>: removes all images <b>not used by any container</b>, tagged or not. <code>--filter until=24h</code> limits by age. <code>docker system prune</code> also removes stopped containers, unused networks and build cache (add <code>--volumes</code> for anonymous volumes; be careful).</li>
<li><code>docker save</code> / <code>docker load</code>: write one or more <b>images</b> to a tar (all layers, config, tags, history) and load them back. For air-gapped transfer. Fully faithful.</li>
<li><code>docker export</code> / <code>docker import</code>: write a <b>container's</b> merged filesystem as one flat tar, and create a single-layer image from such a tar. <b>Lost</b>: layer structure and sharing, history, and all config metadata (CMD, ENTRYPOINT, ENV, WORKDIR, USER, EXPOSE, HEALTHCHECK, labels). Volume contents are not included. <code>docker import --change 'CMD ["nginx","-g","daemon off;"]'</code> can re-add some config.</li>
<li><code>docker commit</code>: snapshot a container's writable layer into a new image layer (pauses the container by default). Useful for debugging a broken container. Not for production: undocumented, unreproducible, carries leftovers (shell history, temp files, caches, maybe secrets), can't be reviewed or rebuilt for security patches.</li>
</ul>`,
      why: `<p>Before layered images, shipping an application meant either a full VM disk image (gigabytes, every version a full copy) or a tarball plus a set of install instructions run on the target (which reintroduced drift). Layered, content-addressed images solve several problems at once:</p>
<ul class="pts">
<li><b>Storage and bandwidth</b>: 20 microservices on <code>python:3.12-slim</code> store the base once. A one-line code change ships one small layer, not the whole image.</li>
<li><b>Speed</b>: starting a container doesn't copy the image; it mounts the existing layers plus an empty writable dir. That's why containers start in milliseconds.</li>
<li><b>Immutability and trust</b>: digests let you prove that production runs exactly the bytes CI scanned and tested. Signing (Docker Content Trust / Notary, Sigstore cosign) builds on digests.</li>
<li><b>Build caching</b>: because each step is a layer keyed by its inputs, unchanged steps are reused (topic 3 today).</li>
<li><b>Clean separation of code and data</b>: the image is read-only; anything written at runtime goes to the disposable writable layer or to a volume. You can always destroy and recreate a container from the image.</li>
</ul>
<p>Copy-on-write is the trick that makes sharing safe: many containers can read the same files without being able to change them for each other.</p>`,
      diagram: {
        html: lanes([
          ["Container A (merged view = /)", ["upperdir: A's writable layer (copy-ups, new files, whiteouts)", "lowerdir: COPY main.py", "lowerdir: RUN pip install …", "lowerdir: python:3.12-slim layers"]],
          ["Container B (same image)", ["upperdir: B's writable layer", "(shares the same read-only lower layers)", "", ""]],
          ["Image metadata", ["index → per-platform manifests", "manifest → config digest + layer digests", "config → Cmd, Env, User, diff_ids, history", "tag → manifest (mutable)"]]
        ]) + flow([["read", "topmost layer wins", "g"], ["write existing file", "copy-up whole file to upperdir", "w"], ["delete", "whiteout in upperdir", "r"], ["docker rm", "upperdir deleted", "r"]]),
        steps: [
          `An image is a stack of read-only layers plus a config; a manifest lists them and a tag points at the manifest (or at an index of per-platform manifests).`,
          `When a container starts, the storage driver mounts an overlay: the image layers become <code>lowerdir</code>, a new empty directory becomes <code>upperdir</code>, and the union appears at <code>merged</code>, which is the container's root.`,
          `Reads come from the highest layer that has the file. The first write to an existing file copies it up into <code>upperdir</code>; deletions create whiteouts.`,
          `Two containers from the same image share all lower layers and each has its own upperdir, so they can't see each other's changes.`,
          `<code>docker rm</code> deletes the upperdir. Anything that must survive goes in a volume, which is mounted beside the overlay rather than inside it.`
        ]
      },
      cmds: [
        {
          t: "List, inspect and look inside an image",
          lang: "sh",
          code: `docker pull python:3.12-slim
docker image ls python
docker image ls --digests python
docker image inspect python:3.12-slim --format '{{.Id}}
{{.Os}}/{{.Architecture}}
{{json .Config.Cmd}}
{{len .RootFS.Layers}} layers'`,
          out: `REPOSITORY   TAG         IMAGE ID       CREATED      SIZE
python       3.12-slim   1d4b3e0c7a1f   9 days ago   124MB
REPOSITORY   TAG         DIGEST            IMAGE ID       CREATED      SIZE
python       3.12-slim   sha256:2a6386...  1d4b3e0c7a1f   9 days ago   124MB
sha256:1d4b3e0c7a1f...
linux/amd64
["python3"]
4 layers`,
          note: `<p>Sizes and digests change with every upstream rebuild. On the containerd image store, <code>docker image ls</code> may show both the content size and the unpacked size and the ID is the index digest.</p>`
        },
        {
          t: "See how an image was built: docker history",
          lang: "sh",
          code: `docker history nginx:1.27-alpine
docker history --no-trunc --format '{{.Size}}\\t{{.CreatedBy}}' python:3.12-slim | head -5`,
          out: `IMAGE          CREATED       CREATED BY                                      SIZE      COMMENT
1ae23480369f   3 weeks ago   CMD ["nginx" "-g" "daemon off;"]                0B        buildkit.dockerfile.v0
<missing>      3 weeks ago   STOPSIGNAL SIGQUIT                              0B        buildkit.dockerfile.v0
<missing>      3 weeks ago   EXPOSE map[80/tcp:{}]                           0B        buildkit.dockerfile.v0
<missing>      3 weeks ago   ENTRYPOINT ["/docker-entrypoint.sh"]            0B        buildkit.dockerfile.v0
<missing>      3 weeks ago   COPY 30-tune-worker-processes.sh /docker-ent…   4.62kB    buildkit.dockerfile.v0
<missing>      3 weeks ago   RUN /bin/sh -c set -x     && addgroup -g 101…   35.6MB    buildkit.dockerfile.v0
...
<missing>      4 weeks ago   ADD alpine-minirootfs-3.20.x-x86_64.tar.gz / …   7.8MB     buildkit.dockerfile.v0`,
          note: `<p>Metadata instructions are 0B. <code>&lt;missing&gt;</code> just means there is no local intermediate image for that step. <code>docker history</code> is also how attackers (and auditors) read your build: <b>ARG and ENV values and RUN command lines are visible here</b>, which is why secrets never go in them.</p>`
        },
        {
          t: "See OverlayFS in action: lowerdir, upperdir, merged, workdir",
          lang: "sh",
          code: `docker run -d --name cow nginx:1.27-alpine
docker inspect --format '{{json .GraphDriver.Data}}' cow | python3 -m json.tool
# change files inside the container
docker exec cow sh -c 'echo hacked > /usr/share/nginx/html/index.html; rm /etc/nginx/conf.d/default.conf; touch /tmp/new'
docker diff cow
# on the host (Linux, overlay2 driver): the changes are in upperdir
UPPER=$(docker inspect --format '{{.GraphDriver.Data.UpperDir}}' cow)
sudo ls -la $UPPER/etc/nginx/conf.d/ $UPPER/usr/share/nginx/html/
mount | grep overlay | head -1`,
          out: `{
    "LowerDir": "/var/lib/docker/overlay2/9f1c...-init/diff:/var/lib/docker/overlay2/5ab2.../diff:...",
    "MergedDir": "/var/lib/docker/overlay2/9f1c.../merged",
    "UpperDir": "/var/lib/docker/overlay2/9f1c.../diff",
    "WorkDir": "/var/lib/docker/overlay2/9f1c.../work"
}
C /etc
C /etc/nginx
C /etc/nginx/conf.d
D /etc/nginx/conf.d/default.conf
C /usr/share/nginx/html
C /usr/share/nginx/html/index.html
A /tmp/new
c--------- 1 root root 0, 0 ... default.conf
-rw-r--r-- 1 root root    7 ... index.html
overlay on /var/lib/docker/overlay2/9f1c.../merged type overlay (rw,relatime,lowerdir=/var/lib/docker/overlay2/l/ABC…:/var/lib/docker/overlay2/l/DEF…,upperdir=…/diff,workdir=…/work)`,
          note: `<p><code>docker diff</code> shows A (added), C (changed), D (deleted) relative to the image. In the upperdir, the deleted <code>default.conf</code> is a <b>whiteout</b>: a character device with major/minor 0,0. The modified <code>index.html</code> was copied up in full. The <code>-init</code> layer is a small Docker-managed layer holding <code>/etc/hosts</code>, <code>/etc/resolv.conf</code> and similar mount points. With the containerd image store the <code>GraphDriver</code> section looks different; on Docker Desktop these paths exist inside the VM.</p>`
        },
        {
          t: "Tag, remove and prune",
          lang: "sh",
          code: `docker tag nginx:1.27-alpine myregistry.example.com/web/nginx:1.27-alpine
docker image ls --filter reference='*/web/nginx'
docker rmi myregistry.example.com/web/nginx:1.27-alpine   # removes only that tag
docker image ls --filter dangling=true                    # <none>:<none> images
docker image prune -f                                     # remove dangling images
docker image prune -a --filter until=168h                 # remove ALL unused images older than 7 days
docker system df                                          # space used by images, containers, volumes, cache`,
          out: `REPOSITORY                          TAG           IMAGE ID       CREATED       SIZE
myregistry.example.com/web/nginx    1.27-alpine   1ae23480369f   3 weeks ago   47MB
Untagged: myregistry.example.com/web/nginx:1.27-alpine
REPOSITORY   TAG       IMAGE ID       CREATED          SIZE
<none>       <none>    0b5d7a3c9e11   2 hours ago      1.1GB
Deleted Images:
deleted: sha256:0b5d7a3c9e11...
Total reclaimed space: 1.1GB
TYPE            TOTAL     ACTIVE    SIZE      RECLAIMABLE
Images          12        4         3.2GB     2.1GB (65%)
Containers      5         4         12MB      0B (0%)
Local Volumes   3         2         845MB     120MB (14%)
Build Cache     88        0         1.4GB     1.4GB`,
          note: `<p>"Untagged" vs "Deleted": <code>rmi</code> on one of several tags only untags. <b>Dangling</b> = no tag (usually the previous build of a tag you rebuilt). <b>Unused</b> = not referenced by any container (running or stopped); <code>prune -a</code> removes these even if tagged, so the next deploy will have to pull again.</p>`
        },
        {
          t: "save/load vs export/import: what survives",
          lang: "sh",
          code: `# save/load: images, faithful (layers, tags, config, history)
docker save -o nginx.tar nginx:1.27-alpine
docker rmi nginx:1.27-alpine && docker load -i nginx.tar
docker history nginx:1.27-alpine | wc -l          # all history rows are back

# export/import: a container's flat filesystem
docker export cow -o cow-fs.tar
docker import cow-fs.tar nginx-flat:1
docker history nginx-flat:1                      # one layer, "Imported from -"
docker image inspect --format '{{json .Config.Cmd}} {{json .Config.Entrypoint}}' nginx-flat:1
docker run --rm nginx-flat:1                     # fails: no command specified
docker import --change 'CMD ["nginx","-g","daemon off;"]' cow-fs.tar nginx-flat:2`,
          out: `Loaded image: nginx:1.27-alpine
18
IMAGE          CREATED          CREATED BY   SIZE      COMMENT
4e8c0a1b2d3f   5 seconds ago                 46.9MB    Imported from -
null null
docker: Error response from daemon: no command specified.`,
          note: `<p><code>export</code> captures the container's <b>merged</b> view, so your "hacked" <code>index.html</code> is in it, but volumes are not, and CMD/ENTRYPOINT/ENV/EXPOSE/USER/WORKDIR are gone. Use <code>save</code>/<code>load</code> to move images between hosts (air-gapped servers); use <code>export</code> only to extract a filesystem.</p>`
        },
        {
          t: "docker commit (for debugging, not production)",
          lang: "sh",
          code: `docker commit -m "debug snapshot after incident" cow debug/nginx-incident:2025-01-10
docker history debug/nginx-incident:2025-01-10 | head -2
docker run --rm -it --entrypoint sh debug/nginx-incident:2025-01-10
docker rm -f cow`,
          out: `sha256:6c2e...
IMAGE          CREATED          CREATED BY                                      SIZE      COMMENT
6c2e9b1d4f07   3 seconds ago    nginx -g daemon off;                            1.2kB     debug snapshot after incident`,
          note: `<p>Commit freezes the container's writable layer as a new layer, so you can inspect a broken container's state later. It pauses the container during the commit (<code>--pause=false</code> to disable). There's no Dockerfile behind it, so nobody can rebuild or patch it reproducibly: always fix the Dockerfile instead.</p>`
        }
      ],
      internals: `<p><b>On disk with overlay2</b> (classic store), <code>/var/lib/docker/overlay2/&lt;id&gt;/</code> holds one directory per layer:</p>
<ul class="pts">
<li><code>diff/</code>: the layer's files (for a container, this is the upperdir).</li>
<li><code>link</code>: a short ID; <code>/var/lib/docker/overlay2/l/&lt;short&gt;</code> are symlinks to <code>diff/</code> dirs, used to keep the <code>lowerdir=</code> mount option under the kernel's page-size limit.</li>
<li><code>lower</code>: the colon-separated list of short links below this layer.</li>
<li><code>merged/</code> and <code>work/</code>: present for container layers while mounted.</li>
</ul>
<p>Image metadata lives in <code>/var/lib/docker/image/overlay2/</code>: <code>imagedb/content/sha256/&lt;id&gt;</code> is the config JSON (its sha256 <i>is</i> the image ID), <code>layerdb/sha256/&lt;chainID&gt;/</code> maps layers to cache directories (using "chain IDs" that combine a layer with all layers below it), and <code>repositories.json</code> maps tags to IDs. With the <b>containerd image store</b>, blobs live in containerd's content store (<code>/var/lib/containerd/io.containerd.content.v1.content/blobs/sha256/</code>) and unpacked layers in snapshotter directories; the overlay mount itself is the same kernel feature.</p>
<p><b>Pull path</b>: index → platform manifest → config blob (to learn <code>diff_ids</code>) → layer blobs downloaded in parallel (compressed digests verified) → each layer decompressed and unpacked into its own directory (uncompressed digest verified against <code>diff_ids</code>). Whiteout entries in the tar (<code>.wh.name</code>) are converted to overlay whiteouts (0/0 char devices or xattrs).</p>
<p><b>Copy-up details</b>: the kernel copies the full file (data, permissions, xattrs) from the lower layer to upperdir, using <code>workdir</code> for an atomic rename, then the write proceeds on the copy. Later writes hit the copy directly. Implications: databases and log files written inside the container layer suffer on first write and keep using overlay paths; volumes avoid this. Hard links across layers can break on copy-up; <code>rename(2)</code> of directories may return <code>EXDEV</code> in some setups (applications fall back to copy).</p>
<p><b>Size accounting</b>: <code>docker image ls</code> SIZE counts all layers (shared layers counted in each image), so summing the column overstates disk use; <code>docker system df -v</code> shows the "SHARED SIZE" and "UNIQUE SIZE". <code>docker ps -s</code> shows each container's writable-layer size and "virtual" size (image + writable).</p>`,
      prod: `<p><b>Releases.</b> CI builds the FastAPI image and pushes it as <code>ghcr.io/shop/api:1.8.3</code> and <code>ghcr.io/shop/api:sha-4f2a9c1</code>. The deploy manifest references the immutable tag, and the deploy job records the repo digest (<code>docker buildx imagetools inspect</code> or the push output) so you can prove what ran. Rolling back means pointing at <code>1.8.2</code>, whose layers are still cached on the host, so it starts instantly.</p>
<p><b>Layer sharing in the stack</b>: the API and a Celery-style worker are built from the same Dockerfile base stage, so the host stores the Python and dependency layers once; only the thin code layer differs. The React frontend is built in a Node stage but ships as <code>nginx:1.27-alpine</code> plus a static <code>dist/</code> layer (~50 MB total).</p>
<p><b>Data never lives in the writable layer.</b> PostgreSQL's <code>/var/lib/postgresql/data</code> is a named volume (<code>pgdata</code>): the container can be removed and recreated with a new <code>postgres:16.x</code> patch image and the data is untouched. Redis appendonly files likewise. If someone forgets the volume, the data lives in the upperdir and disappears on <code>docker rm</code>: a classic incident.</p>
<p><b>Disk hygiene</b>: a nightly job runs <code>docker image prune -a --filter until=168h -f</code> and <code>docker builder prune --filter until=168h -f</code> on build servers; production hosts keep the last few releases for fast rollback. Air-gapped customer sites receive images via <code>docker save | gzip</code> and <code>docker load</code>, never via export/import, so CMD, ENV, USER and HEALTHCHECK survive.</p>`,
      iq: [
        ["dca", "Which command removes all images that are not referenced by any container, including tagged ones? A) docker image prune B) docker image prune -a C) docker rmi $(docker images -q) D) docker system prune", `<p><b>B.</b> <code>docker image prune</code> alone only removes <b>dangling</b> (untagged) images. C tries to remove every image and errors on those used by containers. D removes stopped containers, unused networks, dangling images and build cache, but only dangling images unless you add <code>-a</code>.</p>`],
        ["dca", "What is the difference between docker save and docker export?", `<p><code>docker save</code> operates on <b>images</b>: it writes all layers, the config (CMD, ENV, ENTRYPOINT…), tags and history to a tar; <code>docker load</code> restores them exactly. <code>docker export</code> operates on a <b>container</b>: it writes its merged filesystem as one flat tar, without layers, history or config, and without volume data; <code>docker import</code> creates a single-layer image from it (config must be re-added with <code>--change</code>). Pairing them wrongly (save→import or export→load) is a common exam trap.</p>`],
        ["dca", "A container modifies a file that exists in its image. Where is the modified file stored and what happens to it when the container is removed?", `<p>On first write the storage driver <b>copies the file up</b> from the read-only image layer into the container's <b>writable layer</b> (the overlay upperdir) and modifies the copy. The image layer is unchanged, so other containers still see the original. <code>docker rm</code> deletes the writable layer and the change is lost (stop/start keeps it). Persist data with volumes.</p>`],
        ["dca", "Which TWO statements about image tags and digests are true?", `<p>(1) <b>A tag is mutable</b>: it can be re-pointed to a different image (e.g. by pushing a new build as <code>:latest</code>). (2) <b>A digest is content-addressed and immutable</b>: <code>image@sha256:…</code> always resolves to exactly the same manifest. False statements to watch for: "<code>latest</code> always refers to the newest image" (it's just a default tag name), and "an image can only have one tag" (any number of tags can point to one image ID).</p>`],
        ["fresher", "Why doesn't deleting a large file in a later Dockerfile step make the image smaller?", `<p>Each step creates a layer that records only differences. The file still exists in the earlier layer, which is part of the image and is shipped and stored. The later layer only adds a whiteout that hides it. To avoid the bytes, create and delete in the <b>same</b> <code>RUN</code> (<code>RUN curl -o x.tgz … &amp;&amp; tar xzf x.tgz &amp;&amp; rm x.tgz</code>), or produce the file in a build stage and copy only the result into the final stage.</p>`],
        ["mid", "Explain lowerdir, upperdir, workdir and merged in an overlay2 container mount.", `<p><b>lowerdir</b>: the read-only image layers (colon-separated, top first). <b>upperdir</b>: the container's writable layer where new files, copied-up files and whiteouts go. <b>workdir</b>: an internal scratch directory OverlayFS uses for atomic copy-up/rename (same filesystem as upperdir). <b>merged</b>: the union mount point that becomes the container's root filesystem. <code>docker inspect --format '{{json .GraphDriver.Data}}'</code> shows them.</p>`],
        ["mid", "Why is docker commit discouraged for building production images?", `<p>There's no Dockerfile: the image can't be reviewed, reproduced or rebuilt when the base image gets a security patch. It captures leftovers (package caches, temp files, shell history, maybe credentials typed into the container), creates opaque layers ("what's in this 400 MB layer?"), and doesn't include volume contents, so it may silently miss data. It's fine for forensic snapshots of a broken container.</p>`],
        ["senior", "Your PostgreSQL container writes 50 GB of data and the host disk under /var/lib/docker fills up; docker system df shows a 50 GB container. What happened and what's the fix?", `<p>The data directory isn't on a volume, so PostgreSQL writes into the container's overlay <b>upperdir</b>. That's slow (copy-up, overlay overhead), lives under <code>/var/lib/docker/overlay2</code>, and is deleted by <code>docker rm</code>. Fix: stop the DB cleanly, copy the data out (<code>docker cp</code> or <code>pg_dump</code>), recreate the container with a named volume on <code>/var/lib/postgresql/data</code> (the official image declares it as a VOLUME, so check for a mount that masks it, such as a different <code>PGDATA</code> path), and restore. Monitor with <code>docker ps -s</code>.</p>`]
      ],
      gotchas: [
        `<b>Image SIZE columns overlap.</b> Shared base layers are counted in every image in <code>docker image ls</code>; use <code>docker system df -v</code> for real disk usage.`,
        `<b>Copy-up is whole-file.</b> Appending one line to a 1 GB file from the image copies 1 GB into the writable layer first. Keep large mutable files in volumes.`,
        `<b><code>chmod</code>/<code>chown</code> in a later step duplicates files.</b> <code>RUN chown -R app /app</code> after <code>COPY . /app</code> creates a second copy of every file in a new layer. Use <code>COPY --chown=app:app</code> instead.`,
        `<b>A locally built image has no repo digest</b> until it's pushed. <code>docker image ls --digests</code> shows <code>&lt;none&gt;</code> for it; the image ID is not the digest you'll see in the registry.`,
        `<b><code>docker rmi</code> of an image used by a stopped container fails.</b> Remove the container first, or use <code>-f</code> (which only untags, leaving a dangling image the container still uses).`,
        `<b>Alpine uses musl libc</b>, not glibc. Python wheels built for glibc (manylinux) may not install, forcing slow source builds; some apps behave differently (DNS resolution, performance). <code>-slim</code> (Debian) is often the pragmatic choice for Python.`,
        `<b>The writable layer survives <code>docker restart</code></b>, so "temporary" fixes made with <code>docker exec</code> persist until the container is recreated, and then silently vanish.`
      ],
      best: [
        `Start from small, maintained, pinned bases (<code>python:3.12-slim</code>, <code>node:22-alpine</code>, distroless) and update them regularly; pin by digest where reproducibility matters.`,
        `Tag every build immutably (semver and/or git SHA); treat <code>latest</code> as a convenience, never as a deploy target.`,
        `Keep runtime data in volumes, never in the container's writable layer; consider <code>--read-only</code> root filesystems with <code>--tmpfs /tmp</code>.`,
        `Move images with <code>save</code>/<code>load</code> or a registry; reserve <code>export</code>/<code>import</code> for extracting filesystems and <code>commit</code> for debugging.`,
        `Schedule pruning on build hosts (<code>image prune -a --filter until=…</code>, <code>builder prune</code>) and monitor <code>/var/lib/docker</code> disk usage.`
      ],
      lab: [
        `Pull <code>python:3.12-slim</code> and <code>nginx:1.27-alpine</code>; compare <code>docker image ls</code>, <code>docker image ls --digests</code> and <code>docker history</code> for both. Identify which history rows are 0B and why.`,
        `Run <code>docker run -d --name cow nginx:1.27-alpine</code>, modify one file, delete one and create one with <code>docker exec</code>. Check <code>docker diff cow</code>, then (Linux) inspect the upperdir and find the whiteout.`,
        `Run a second container from the same image and confirm it doesn't see the first one's changes.`,
        `<code>docker save</code> nginx, remove it, <code>docker load</code> it, and compare <code>docker history</code>. Then <code>docker export cow</code>, <code>docker import</code> it and compare history and <code>.Config.Cmd</code>.`,
        `Tag nginx twice, <code>rmi</code> one tag, and observe "Untagged" vs "Deleted". Create a dangling image by building the same tag twice with a small change, then <code>docker image prune</code>.`,
        `<b>Done when:</b> you can show a whiteout and a copied-up file in a container's upperdir (or explain them from <code>docker diff</code> on Docker Desktop), and you can state what <code>save</code>, <code>export</code> and <code>commit</code> each keep and lose.`
      ],
      teach: `<p>"An image is a stack of read-only layers plus a small JSON config. Each Dockerfile step that touches files adds a layer that records just the differences. Everything is addressed by sha256 digests, so images are immutable; a tag like <code>1.8.3</code> or <code>latest</code> is only a movable pointer, and a digest pins exact content.</p>
<p>When I run a container, Docker doesn't copy the image. It uses OverlayFS: the image layers are the read-only <code>lowerdir</code>, a fresh empty <code>upperdir</code> is the container's writable layer, and the union is mounted at <code>merged</code> as the container's root. Reading is free. Writing an existing file copies it up first. Deleting leaves a whiteout. So deleting a file in a later layer never shrinks the image, and anything written in the container disappears with <code>docker rm</code>, which is why data goes in volumes.</p>
<p>For management: <code>image ls</code>, <code>inspect</code>, <code>history</code>, <code>tag</code>, <code>rmi</code>. <code>prune</code> removes dangling images; <code>prune -a</code> removes all unused ones. <code>save/load</code> moves images faithfully; <code>export/import</code> flattens a container and loses its config; <code>commit</code> is for debugging only."</p>`
    },

    /* ------------------------------------------------------------------ */
    {
      id: "d2-dockerfile",
      title: "Dockerfile instructions in depth",
      lv: ["fresher", "mid", "senior", "dca"],
      eli5: `<p>A Dockerfile is a <b>recipe card</b>. "Start with a ready-made pizza base" (<code>FROM</code>). "Work at the big counter" (<code>WORKDIR</code>). "Bring the tomatoes from the fridge" (<code>COPY</code>). "Chop and cook them" (<code>RUN</code>). "When someone orders, serve it hot" (<code>CMD</code>).</p>
<p>Some lines are <b>cooking steps</b> that change what's on the plate (<code>RUN</code>, <code>COPY</code>, <code>ADD</code>), and each one leaves a new layer of topping. Other lines are <b>notes on the card</b> that don't change the food but tell the waiter how to serve it: "it's served on table 8000" (<code>EXPOSE</code>), "the chef's name is app, not the owner" (<code>USER</code>), "check it's still warm every 30 seconds" (<code>HEALTHCHECK</code>).</p>
<p>Two notes cause most confusion: <code>ENTRYPOINT</code> is <i>what dish this kitchen always makes</i>, and <code>CMD</code> is <i>the default toppings</i>. Customers can easily change the toppings (arguments to <code>docker run</code>), but changing the dish needs a special request (<code>--entrypoint</code>).</p>`,
      what: `<p>A <code>Dockerfile</code> is a text file read top to bottom by the builder. Lines are <code>INSTRUCTION arguments</code>; instructions are case-insensitive but written in upper case by convention; <code>#</code> starts a comment; a parser directive like <code># syntax=docker/dockerfile:1</code> must be the very first line and selects the Dockerfile frontend version (recommended: it gets you the latest stable syntax features).</p>
<h5>Shell form vs exec form</h5>
<ul class="pts">
<li><b>Shell form</b>: <code>RUN apt-get update</code>, <code>CMD uvicorn main:app</code>. Executed as <code>/bin/sh -c "…"</code> (on Linux). You get shell features: variable expansion (<code>$HOME</code>), pipes, <code>&amp;&amp;</code>, globbing.</li>
<li><b>Exec form</b>: <code>CMD ["uvicorn", "main:app", "--host", "0.0.0.0"]</code>. A JSON array executed directly, no shell. No variable expansion, no pipes. Must use <b>double quotes</b>; with single quotes it isn't valid JSON and Docker silently treats it as shell form.</li>
<li>For <code>RUN</code> shell form is normal. For <code>CMD</code> and <code>ENTRYPOINT</code>, use <b>exec form</b>: your app becomes PID 1 and receives SIGTERM from <code>docker stop</code>. With shell form, <code>/bin/sh</code> is PID 1 and typically doesn't forward signals (Day 1's 10-second stop, exit 137). Shell-form ENTRYPOINT also ignores CMD and <code>docker run</code> arguments.</li>
</ul>
<h5>Every instruction</h5>
<ul class="pts">
<li><b><code>FROM image[:tag|@digest] [AS name]</code></b>: starts a build stage from a base image. Must be the first instruction (after parser directives and global <code>ARG</code>s). Multiple <code>FROM</code>s = multi-stage build; <code>AS builder</code> names a stage. <code>FROM scratch</code> starts empty. <code>--platform=$BUILDPLATFORM</code> picks the builder's platform for cross-compilation.</li>
<li><b><code>WORKDIR /app</code></b>: sets the working directory for following <code>RUN</code>, <code>CMD</code>, <code>ENTRYPOINT</code>, <code>COPY</code>, <code>ADD</code>; creates it if missing. Relative paths are relative to the previous WORKDIR. Prefer it over <code>RUN cd /app</code> (which only affects that one RUN).</li>
<li><b><code>COPY [--chown=u:g] [--chmod=…] [--from=stage|image] [--link] src… dest</code></b>: copies files from the build context (or another stage/image with <code>--from</code>) into the image. Sources can't escape the context (<code>../</code> fails). A trailing <code>/</code> on dest means directory. <code>COPY dir/ /x/</code> copies the directory's <i>contents</i>.</li>
<li><b><code>ADD src dest</code></b>: like COPY, plus: (1) a <b>local</b> tar archive (gzip, bzip2, xz) is <b>auto-extracted</b>; (2) a <b>URL</b> source is downloaded (not extracted), optionally verified with <code>--checksum=sha256:…</code>; (3) recent frontends also accept Git repository URLs. Because of the magic, <b>prefer COPY</b> unless you need these features.</li>
<li><b><code>RUN command</code></b>: executes a command at <b>build time</b> in a temporary container and commits the filesystem changes as a new layer. Chain related commands with <code>&amp;&amp;</code> and clean up in the same RUN. BuildKit adds <code>RUN --mount=type=cache|secret|bind|ssh|tmpfs</code> and <code>--network</code> (topic 3).</li>
<li><b><code>CMD ["exe","arg"]</code></b> / <code>CMD ["arg1","arg2"]</code> / <code>CMD command arg</code>: the <b>default</b> command (or default arguments to ENTRYPOINT) when the container starts. Only the last CMD counts. Overridden by anything after the image name in <code>docker run</code>.</li>
<li><b><code>ENTRYPOINT ["exe","arg"]</code></b>: the executable the container always runs. <code>docker run</code> arguments are <i>appended</i> to it (replacing CMD). Override with <code>docker run --entrypoint</code>, which also clears the image's default CMD. Setting ENTRYPOINT in your Dockerfile also resets any CMD inherited from the base image.</li>
<li><b><code>ENV KEY=value …</code></b>: sets environment variables for later build steps <b>and</b> for running containers (persisted in the image config). Overridable at run time with <code>-e</code>. Visible in <code>docker inspect</code>/<code>history</code>.</li>
<li><b><code>ARG NAME[=default]</code></b>: a <b>build-time</b> variable set with <code>docker build --build-arg NAME=value</code>. Not present in running containers. Values are still recorded in image history/metadata in some forms, so <b>never use ARG for secrets</b>.</li>
<li><b><code>EXPOSE 8000[/tcp|/udp]</code></b>: documentation/metadata of which ports the app listens on. It does <b>not</b> publish anything. <code>docker run -P</code> publishes all exposed ports to random host ports; <code>-p 8000:8000</code> publishes explicitly (and works without EXPOSE).</li>
<li><b><code>USER name|uid[:gid]</code></b>: the user for following <code>RUN</code> steps and for the container's process. The user must exist (create it with <code>useradd</code>/<code>adduser</code>) or be given numerically. Without it, containers run as root.</li>
<li><b><code>LABEL key="value"</code></b>: metadata key-value pairs (use the standard <code>org.opencontainers.image.*</code> keys: <code>source</code>, <code>version</code>, <code>revision</code>, <code>licenses</code>). Queryable with <code>docker inspect</code> and filters (<code>--filter label=…</code>). <code>MAINTAINER</code> is deprecated in favour of a label.</li>
<li><b><code>VOLUME ["/data"]</code></b>: marks a path as a mount point: at run time, if nothing is mounted there, Docker creates an <b>anonymous volume</b>. You can't choose the host path in a Dockerfile. In the classic builder, changes to that path by later build steps are discarded. Use sparingly: each <code>docker run</code> creates a new anonymous volume that accumulates on disk.</li>
<li><b><code>HEALTHCHECK [--interval=30s --timeout=30s --start-period=0s --retries=3] CMD …</code></b>: a command Docker runs inside the container periodically; exit 0 = healthy, 1 = unhealthy. Status: <code>starting</code> → <code>healthy</code>/<code>unhealthy</code> (shown in <code>docker ps</code>). <code>HEALTHCHECK NONE</code> disables an inherited one. Standalone Docker only <i>reports</i> unhealthy; it doesn't restart the container (Swarm replaces unhealthy tasks; Compose can use it for <code>depends_on: condition: service_healthy</code>).</li>
<li><b><code>SHELL ["/bin/bash", "-o", "pipefail", "-c"]</code></b>: changes the shell used by shell-form instructions after it. Useful for <code>pipefail</code> (so <code>curl … | tar x</code> fails if curl fails) and on Windows images (PowerShell).</li>
<li><b><code>STOPSIGNAL SIGQUIT</code></b>: the signal <code>docker stop</code> sends instead of SIGTERM (Nginx uses SIGQUIT for graceful shutdown; PostgreSQL's image uses SIGINT).</li>
<li>Also: <code>ONBUILD</code> (instructions triggered when another image builds FROM this one; rarely a good idea) and the parser directives <code>syntax</code> and <code>escape</code>.</li>
</ul>
<h5>RUN vs CMD vs ENTRYPOINT</h5>
<p><b>RUN</b> executes at <b>build</b> time and changes the image. <b>CMD</b> and <b>ENTRYPOINT</b> run at <b>container start</b> and only set metadata during the build. How CMD and ENTRYPOINT combine (from the Dockerfile reference):</p>
<table class="tbl"><tr><th></th><th>No ENTRYPOINT</th><th><code>ENTRYPOINT exec_entry p1_entry</code> (shell)</th><th><code>ENTRYPOINT ["exec_entry", "p1_entry"]</code></th></tr>
<tr><td><b>No CMD</b></td><td>error: no command specified (unless inherited from the base)</td><td><code>/bin/sh -c exec_entry p1_entry</code></td><td><code>exec_entry p1_entry</code></td></tr>
<tr><td><b><code>CMD ["exec_cmd", "p1_cmd"]</code></b></td><td><code>exec_cmd p1_cmd</code></td><td><code>/bin/sh -c exec_entry p1_entry</code> (CMD ignored)</td><td><code>exec_entry p1_entry exec_cmd p1_cmd</code></td></tr>
<tr><td><b><code>CMD exec_cmd p1_cmd</code></b> (shell)</td><td><code>/bin/sh -c exec_cmd p1_cmd</code></td><td><code>/bin/sh -c exec_entry p1_entry</code> (CMD ignored)</td><td><code>exec_entry p1_entry /bin/sh -c exec_cmd p1_cmd</code></td></tr></table>
<p>Patterns that work: (1) <b>CMD only, exec form</b> for apps: <code>CMD ["uvicorn", "main:app", …]</code>; easy to override (<code>docker run img python -m pytest</code>). (2) <b>ENTRYPOINT + CMD, both exec form</b> for tool-like images: <code>ENTRYPOINT ["alembic"]</code> + <code>CMD ["upgrade", "head"]</code>, so <code>docker run img downgrade -1</code> works. (3) <b>Entrypoint script</b> that does setup then <code>exec "$@"</code> to hand PID 1 to CMD (the pattern used by the official <code>postgres</code> and <code>nginx</code> images).</p>
<h5>COPY vs ADD</h5>
<p>COPY does one thing: copy local files from the context or another stage. ADD also auto-extracts local tars and downloads URLs, which can surprise (a <code>.tar.gz</code> you meant to ship gets unpacked) and downloads can't be cached as well or cleaned up in the same layer. Use COPY; use ADD only for "extract this local tarball into the image" or a checksummed remote file; for downloads that need extracting and cleanup, use <code>RUN curl … &amp;&amp; tar … &amp;&amp; rm …</code>.</p>
<h5>ARG vs ENV</h5>
<ul class="pts">
<li><b>Lifetime</b>: ARG exists only during the build; ENV is baked into the image and present in every container.</li>
<li><b>Scope</b>: an ARG is visible from its declaration line to the end of its <b>stage</b>. Each stage must redeclare ARGs it uses.</li>
<li><b>ARG before FROM</b> is a <b>global</b> arg usable only in <code>FROM</code> lines: <code>ARG PYTHON_VERSION=3.12</code> then <code>FROM python:$PYTHON_VERSION-slim</code>. To use it inside the stage, redeclare <code>ARG PYTHON_VERSION</code> (no value) after <code>FROM</code> to inherit the global value.</li>
<li><b>Precedence</b>: an ENV with the same name overrides an ARG for later instructions. Common pattern: <code>ARG APP_VERSION</code> + <code>ENV APP_VERSION=$APP_VERSION</code> to bake a build arg into the runtime environment.</li>
<li><b>Predefined args</b>: proxy args (<code>HTTP_PROXY</code>…) and BuildKit's platform args (<code>TARGETPLATFORM</code>, <code>TARGETOS</code>, <code>TARGETARCH</code>, <code>BUILDPLATFORM</code>…), which must be declared with <code>ARG TARGETARCH</code> inside a stage to be used there.</li>
<li><b>Secrets</b>: neither. Use <code>RUN --mount=type=secret</code> for build secrets and runtime secrets/env at run time.</li>
</ul>`,
      why: `<p>Before Dockerfiles, servers were built from wikis, shell scripts and memory. Dockerfiles exist to make the environment <b>code</b>:</p>
<ul class="pts">
<li><b>Reproducible</b>: the same Dockerfile and context produce an equivalent image on any builder.</li>
<li><b>Reviewable</b>: changing the Python version or adding a system package is a pull request with a diff, not an SSH session.</li>
<li><b>Self-documenting</b>: the image config carries how to run it (CMD), which port (EXPOSE), as which user (USER), and how to check health (HEALTHCHECK).</li>
<li><b>Patchable</b>: when a base image CVE is fixed, you rebuild and redeploy; nothing is hand-made.</li>
</ul>
<p>Each instruction exists because of a concrete need: ENTRYPOINT vs CMD to separate "what this image is" from "default arguments"; ARG vs ENV to separate build-time knobs from runtime configuration; USER because root-by-default was a security problem; HEALTHCHECK because "the process is running" isn't the same as "the API answers"; STOPSIGNAL because not every app treats SIGTERM as "shut down gracefully".</p>
<p>Getting the details wrong is what causes most real-world container bugs: 10-second shutdowns from shell-form CMD, secrets leaked through ARG, images running as root, and arguments silently ignored because of a shell-form ENTRYPOINT.</p>`,
      diagram: {
        html: flow([
          ["FROM python:3.12-slim", "base layers", "g"],
          ["WORKDIR / ENV / ARG / LABEL", "metadata (0B)"],
          ["COPY / ADD / RUN", "new filesystem layers", "w"],
          ["USER / EXPOSE / VOLUME / HEALTHCHECK / STOPSIGNAL", "metadata"],
          ["ENTRYPOINT + CMD", "what runs at docker run", "g"]
        ], { v: true }) + lanes([
          ["Build time only", ["RUN executes", "ARG values", "COPY/ADD read the context", "RUN --mount (cache, secret)"]],
          ["Stored in image config", ["ENV, WORKDIR, USER", "ENTRYPOINT, CMD", "EXPOSE, VOLUME, LABEL", "HEALTHCHECK, STOPSIGNAL"]],
          ["Overridable at docker run", ["CMD: args after image name", "ENTRYPOINT: --entrypoint", "ENV: -e / --env-file", "USER: -u; WORKDIR: -w; health: --health-*"]]
        ]),
        steps: [
          `<code>FROM</code> picks the base layers and starts a stage. Metadata instructions (<code>ENV</code>, <code>WORKDIR</code>, <code>LABEL</code>, <code>USER</code>, <code>EXPOSE</code>…) change only the image config.`,
          `<code>COPY</code>, <code>ADD</code> and <code>RUN</code> run in a temporary container and commit their filesystem changes as new layers.`,
          `<code>ARG</code> values and <code>RUN</code> only exist during the build; <code>ENV</code>, <code>USER</code>, <code>CMD</code>, <code>ENTRYPOINT</code> etc. are saved in the image config.`,
          `At <code>docker run</code>, Docker combines ENTRYPOINT + CMD (per the table) and applies run-time overrides: arguments replace CMD, <code>--entrypoint</code> replaces ENTRYPOINT, <code>-e</code> overrides ENV, <code>-u</code> overrides USER.`
        ]
      },
      cmds: [
        {
          t: "A complete, commented Dockerfile using every common instruction",
          lang: "dockerfile",
          code: `# syntax=docker/dockerfile:1
ARG PYTHON_VERSION=3.12
FROM python:$PYTHON_VERSION-slim

# redeclare to use the global ARG inside this stage
ARG PYTHON_VERSION
ARG APP_VERSION=dev

LABEL org.opencontainers.image.title="shop-api" \\
      org.opencontainers.image.source="https://github.com/example/shop" \\
      org.opencontainers.image.version=$APP_VERSION

ENV PYTHONDONTWRITEBYTECODE=1 \\
    PYTHONUNBUFFERED=1 \\
    APP_VERSION=$APP_VERSION

SHELL ["/bin/bash", "-o", "pipefail", "-c"]

WORKDIR /app

RUN groupadd --system --gid 10001 app \\
 && useradd --system --uid 10001 --gid app --no-create-home app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY --chown=app:app . .

USER app
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \\
  CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/health', timeout=2)" || exit 1
STOPSIGNAL SIGTERM
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]`,
          note: `<p><code>\\</code> continues a line. <code>STOPSIGNAL SIGTERM</code> is the default and only shown for completeness. <code>VOLUME</code> is deliberately absent: an API has no local data; the PostgreSQL image is where VOLUME makes sense. <code>--host 0.0.0.0</code> matters: Uvicorn's default <code>127.0.0.1</code> would be the container's own loopback, unreachable through <code>-p</code>.</p>`
        },
        {
          t: "Shell form vs exec form: who is PID 1?",
          lang: "sh",
          code: `cat > Dockerfile.shell <<'EOF'
FROM python:3.12-slim
CMD python -m http.server 8000
EOF
cat > Dockerfile.exec <<'EOF'
FROM python:3.12-slim
CMD ["python", "-m", "http.server", "8000"]
EOF
docker build -q -t form:shell -f Dockerfile.shell .
docker build -q -t form:exec  -f Dockerfile.exec .
docker run -d --name fs form:shell && docker run -d --name fe form:exec
docker exec fs cat /proc/1/cmdline | tr '\\0' ' '; echo
docker exec fe cat /proc/1/cmdline | tr '\\0' ' '; echo
time docker stop fs; time docker stop fe`,
          out: `/bin/sh -c python -m http.server 8000
python -m http.server 8000
real    0m10.4s
real    0m0.5s`,
          note: `<p>With shell form, <code>/bin/sh</code> is PID 1. (Debian's <code>dash</code> may exec a single simple command directly, so results vary by shell and command; don't rely on it.) Exec form makes Python PID 1, which receives SIGTERM and exits promptly. Clean up: <code>docker rm -f fs fe</code>.</p>`
        },
        {
          t: "CMD and ENTRYPOINT overrides in practice",
          lang: "sh",
          code: `cat > Dockerfile.ep <<'EOF'
FROM alpine:3.20
ENTRYPOINT ["echo", "entry:"]
CMD ["default", "args"]
EOF
docker build -q -t ep -f Dockerfile.ep .
docker run --rm ep                         # ENTRYPOINT + CMD
docker run --rm ep custom                  # args replace CMD
docker run --rm --entrypoint date ep       # replace ENTRYPOINT (CMD cleared)
docker run --rm --entrypoint sh ep -c 'echo debug shell'
docker image inspect ep --format 'EP={{json .Config.Entrypoint}} CMD={{json .Config.Cmd}}'`,
          out: `entry: default args
entry: custom
Sat Jan 11 10:12:03 UTC 2025
debug shell
EP=["echo","entry:"] CMD=["default","args"]`,
          note: `<p><code>--entrypoint</code> takes a single executable; its arguments go after the image name. This is the standard trick to get a shell in an image whose ENTRYPOINT is the app.</p>`
        },
        {
          t: "An entrypoint script that hands over PID 1 with exec",
          lang: "sh",
          code: `cat > docker-entrypoint.sh <<'EOF'
#!/bin/sh
set -e
# one-time setup before the main process
if [ "$RUN_MIGRATIONS" = "1" ]; then
  alembic upgrade head
fi
# replace this shell with CMD so the app is PID 1 and gets SIGTERM
exec "$@"
EOF
chmod +x docker-entrypoint.sh
# in the Dockerfile:
#   COPY --chmod=755 docker-entrypoint.sh /usr/local/bin/
#   ENTRYPOINT ["docker-entrypoint.sh"]
#   CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]`,
          note: `<p>Without <code>exec</code>, the shell stays PID 1 and the app is its child: signals don't reach the app. Save the script with LF line endings (CRLF from Windows editors gives "not found", exit 127). <code>COPY --chmod</code> needs BuildKit, which is the default.</p>`
        },
        {
          t: "ARG vs ENV scope, and ARG before FROM",
          lang: "sh",
          code: `cat > Dockerfile.args <<'EOF'
ARG BASE_TAG=3.20
FROM alpine:$BASE_TAG
RUN echo "BASE_TAG in stage (not redeclared): '$BASE_TAG'"
ARG BASE_TAG
ARG BUILD_ID=local
ENV RUNTIME_MODE=production
RUN echo "BASE_TAG=$BASE_TAG BUILD_ID=$BUILD_ID RUNTIME_MODE=$RUNTIME_MODE"
EOF
docker build --progress=plain --no-cache --build-arg BUILD_ID=ci-42 -t args -f Dockerfile.args . 2>&1 | grep -E "BASE_TAG"
docker run --rm args sh -c 'echo "BUILD_ID=[$BUILD_ID] RUNTIME_MODE=[$RUNTIME_MODE]"'`,
          out: `#5 0.21 BASE_TAG in stage (not redeclared): ''
#6 0.19 BASE_TAG=3.20 BUILD_ID=ci-42 RUNTIME_MODE=production
BUILD_ID=[] RUNTIME_MODE=[production]`,
          note: `<p>The global ARG is empty inside the stage until redeclared. ARG values don't exist in the running container; ENV values do. <code>--progress=plain</code> shows RUN output.</p>`
        },
        {
          t: "COPY vs ADD behaviour",
          lang: "dockerfile",
          code: `# copies the archive as a file
COPY vendor.tar.gz /opt/
# auto-extracts the local archive into /opt/vendor/
ADD vendor.tar.gz /opt/vendor/
# downloads (not extracted) and verifies the checksum
ADD --checksum=sha256:<expected-sha256> https://example.com/tool-1.2.3.tar.gz /tmp/
# usual way to download + extract + clean up in ONE layer
RUN curl -fsSL https://example.com/tool-1.2.3.tar.gz | tar -xz -C /usr/local/bin tool
# copy from another image or stage
COPY --from=nginx:1.27-alpine /etc/nginx/nginx.conf /tmp/nginx.conf.example`,
          note: `<p>The <code>curl | tar</code> line relies on <code>SHELL [... "-o", "pipefail" ...]</code> (or a bash with pipefail) to fail the build if the download fails. Replace the placeholder checksum with the real one.</p>`
        },
        {
          t: "Inspect healthcheck status and other config at run time",
          lang: "sh",
          code: `docker run -d --name api -p 8000:8000 shop/api:dev
docker ps --format 'table {{.Names}}\\t{{.Status}}'
docker inspect --format '{{.State.Health.Status}}' api
docker inspect --format '{{json .State.Health.Log}}' api | python3 -m json.tool | head -12
docker inspect --format 'user={{.Config.User}} expose={{json .Config.ExposedPorts}} stop={{.Config.StopSignal}}' api`,
          out: `NAMES     STATUS
api       Up 8 seconds (health: starting)
healthy
[
    {
        "Start": "2025-01-11T10:20:01.1Z",
        "End": "2025-01-11T10:20:01.3Z",
        "ExitCode": 0,
        "Output": ""
    }
]
user=app expose={"8000/tcp":{}} stop=SIGTERM`,
          note: `<p>The health check runs <i>inside</i> the container, so the tool it uses (curl, wget, python) must exist in the image. <code>slim</code> Python images don't ship curl, hence the Python one-liner.</p>`
        }
      ],
      internals: `<p><b>How instructions become an image.</b> BuildKit parses the Dockerfile into an LLB graph (a low-level build definition). Each <code>RUN</code> executes in a temporary container (namespaces and cgroups via runc, like any container) whose root filesystem is a snapshot of the previous step; after it exits, the diff is recorded as a new layer. <code>COPY</code>/<code>ADD</code> don't start a container: BuildKit copies files from the context (transferred from the client) directly into a new snapshot. Metadata instructions just update the config JSON that will be written at the end, together with a <code>history</code> entry (<code>"created_by": "CMD [\\"uvicorn\\" …]"</code>, <code>"empty_layer": true</code>).</p>
<p><b>Where things land in the config</b> (<code>docker image inspect</code>): <code>Config.Env</code>, <code>Config.Cmd</code>, <code>Config.Entrypoint</code>, <code>Config.WorkingDir</code>, <code>Config.User</code>, <code>Config.ExposedPorts</code>, <code>Config.Volumes</code>, <code>Config.Labels</code>, <code>Config.Healthcheck</code> (durations in nanoseconds), <code>Config.StopSignal</code>, <code>Config.Shell</code>. At <code>docker run</code>, dockerd merges this with the run-time overrides and produces the OCI runtime spec's <code>process.args</code> (ENTRYPOINT + CMD per the table), <code>process.env</code>, <code>process.cwd</code> and <code>process.user</code> (resolved to UID/GID by reading the image's <code>/etc/passwd</code> and <code>/etc/group</code>; if a name doesn't resolve, the container fails to start).</p>
<p><b>Exec vs shell form</b> is decided at parse time: if the argument parses as a JSON array it's exec form, otherwise the builder wraps it as <code>["/bin/sh", "-c", "…"]</code> (or the <code>SHELL</code> value). You can see this in <code>Config.Cmd</code>: shell form <code>CMD uvicorn main:app</code> is stored as <code>["/bin/sh","-c","uvicorn main:app"]</code>.</p>
<p><b>Variable substitution</b> (<code>$VAR</code>, <code>\${VAR:-default}</code>) in instructions like <code>FROM</code>, <code>COPY</code>, <code>ENV</code>, <code>WORKDIR</code>, <code>LABEL</code>, <code>USER</code>, <code>EXPOSE</code> is performed by the builder using ARG/ENV values. Inside <code>RUN</code> shell form, the shell expands them at run time. In exec-form <code>CMD</code>/<code>ENTRYPOINT</code>, nothing expands them: <code>CMD ["echo", "$HOME"]</code> prints <code>$HOME</code> literally.</p>
<p><b>HEALTHCHECK</b>: dockerd runs the probe with an <code>exec</code> into the container every interval; it keeps the last 5 results in <code>State.Health.Log</code>, and flips to <code>unhealthy</code> after <code>retries</code> consecutive failures (failures during <code>start-period</code> don't count). A <code>health_status</code> event is emitted on change. <b>VOLUME</b>: at create time, dockerd sees <code>Config.Volumes</code>, creates an anonymous volume for any path without an explicit mount, and copies the image's content at that path into the new empty volume.</p>`,
      prod: `<p>Production conventions for the running example's images:</p>
<ul class="pts">
<li><b>API (FastAPI)</b>: <code>python:3.12-slim</code> base, non-root <code>USER 10001</code>, exec-form <code>CMD ["uvicorn", …]</code> (or <code>gunicorn -k uvicorn.workers.UvicornWorker</code>), <code>HEALTHCHECK</code> on <code>/health</code>, labels with git SHA and source URL, <code>ENV PYTHONUNBUFFERED=1</code> so logs reach <code>docker logs</code> immediately. Config (<code>DATABASE_URL=postgresql://…@postgres:5432/shop</code>, <code>REDIS_URL=redis://redis:6379/0</code>) comes from the environment at run time, never baked in with ENV.</li>
<li><b>Migrations</b>: same image, different command: <code>docker run --rm shop/api:1.8.3 alembic upgrade head</code>. CMD-only images make this trivial.</li>
<li><b>Web (React)</b>: the Nginx stage has <code>COPY --from=build /app/dist /usr/share/nginx/html</code> and inherits Nginx's <code>STOPSIGNAL SIGQUIT</code> and entrypoint script.</li>
<li><b>PostgreSQL</b>: the official image's Dockerfile declares <code>VOLUME /var/lib/postgresql/data</code>, uses an entrypoint script that initialises the database on first start and then <code>exec</code>s <code>postgres</code>, and sets <code>STOPSIGNAL SIGINT</code>. Its ENV <code>PGDATA</code> tells the server where data lives. You attach a <i>named</i> volume there so the anonymous one is never created.</li>
</ul>
<p>Reviewers block PRs that use shell-form CMD/ENTRYPOINT, <code>ADD</code> for local files, <code>ARG</code>/<code>ENV</code> for tokens, <code>latest</code> base tags, or images without <code>USER</code>. A linter (<code>hadolint</code>) and <code>docker build --check</code> (BuildKit build checks in recent versions) enforce most of this in CI.</p>`,
      iq: [
        ["dca", "A Dockerfile contains ENTRYPOINT [\"python\", \"app.py\"] and CMD [\"--port\", \"8000\"]. What runs for: docker run myimg --port 9000?", `<p><code>python app.py --port 9000</code>. Arguments after the image name <b>replace CMD</b> and are appended to the exec-form ENTRYPOINT. Without arguments it would be <code>python app.py --port 8000</code>. To replace <code>python app.py</code> you'd need <code>--entrypoint</code>. If ENTRYPOINT were in shell form, both CMD and the run arguments would be ignored.</p>`],
        ["dca", "Which instruction makes a port reachable from the host? A) EXPOSE 8000 B) docker run -p 8000:8000 C) EXPOSE 8000:8000 D) LABEL port=8000", `<p><b>B.</b> Only <b>publishing</b> at run time (<code>-p</code>, or <code>-P</code> for all EXPOSEd ports to random host ports) creates the port mapping. <code>EXPOSE</code> is documentation/metadata (A). C is not valid EXPOSE syntax for host mapping. D is arbitrary metadata.</p>`],
        ["dca", "Which TWO statements about ARG and ENV are true?", `<p>(1) <b>ARG values are available only during the build</b>; they are not set in running containers (unless copied into an ENV). (2) <b>ENV values persist in the image</b> and are present in containers, overridable with <code>docker run -e</code>. False distractors: "ARG is a safe way to pass secrets" (values can be seen in history/metadata), "an ARG declared before FROM is available in all RUN instructions" (only in FROM lines unless redeclared in the stage).</p>`],
        ["dca", "What is the difference between COPY and ADD?", `<p>Both copy files from the build context into the image. <b>ADD</b> additionally auto-extracts <b>local</b> tar archives into the destination and can fetch <b>remote URLs</b> (downloaded, not extracted; optionally checksum-verified), and recent frontends support Git URLs. Best practice is <b>COPY</b> for normal files because its behaviour is predictable; use ADD only when you need extraction of a local archive.</p>`],
        ["fresher", "What's the difference between RUN, CMD and ENTRYPOINT?", `<p><b>RUN</b> executes during <code>docker build</code> and its changes become an image layer (install packages, compile). <b>CMD</b> sets the default command or default arguments when a container starts; easily overridden by arguments to <code>docker run</code>. <b>ENTRYPOINT</b> sets the executable that always runs; run arguments are appended to it, and you need <code>--entrypoint</code> to change it. Only the last CMD and last ENTRYPOINT in a Dockerfile take effect.</p>`],
        ["mid", "Why should CMD use exec form, and what breaks with shell form?", `<p>Exec form runs the program directly as PID 1, so it receives SIGTERM from <code>docker stop</code> and can shut down gracefully. Shell form runs <code>/bin/sh -c "…"</code>; the shell is PID 1 and usually doesn't forward signals, so the app is SIGKILLed after the grace period (exit 137, dropped requests, 10 s deploy delays). With ENTRYPOINT, shell form also ignores CMD and run arguments. Exec form can't expand variables; if you need that, use an entrypoint script ending in <code>exec "$@"</code>.</p>`],
        ["mid", "Your image has USER app but the container fails with 'unable to find user app: no matching entries in passwd file'. Why?", `<p>The user doesn't exist in the final image's <code>/etc/passwd</code>, typically because it was created in a <b>different stage</b> of a multi-stage build, or the base image changed. Create the user in the final stage (<code>useradd</code>/<code>adduser</code>) or use a numeric UID (<code>USER 10001:10001</code>), which works even without a passwd entry (distroless images often use <code>65532</code>, "nonroot").</p>`],
        ["senior", "Does Docker restart a container whose HEALTHCHECK reports unhealthy?", `<p>Not standalone Docker: the status becomes <code>unhealthy</code> and a <code>health_status</code> event is emitted, but restart policies only react to the process exiting. <b>Swarm</b> replaces unhealthy service tasks; Compose can gate startup order with <code>depends_on: condition: service_healthy</code>; external tools (autoheal, orchestrators) can act on it. Kubernetes ignores Docker HEALTHCHECK entirely and uses its own probes.</p>`],
        ["senior", "Why might a VOLUME instruction in a base image cause surprises for images built on top of it?", `<p>Every container gets a new anonymous volume at that path unless you mount one, so data piles up as orphaned volumes on <code>docker rm</code> without <code>-v</code>; you can't "undeclare" a VOLUME in a child image; and with the classic builder, changes made to that path in later build steps are discarded. That's why VOLUME belongs in database images (where it's a safety net) and rarely in app images. Prefer declaring mounts at run time (Compose <code>volumes:</code>).</p>`]
      ],
      gotchas: [
        `<b>Single quotes break exec form.</b> <code>CMD ['uvicorn', 'main:app']</code> isn't valid JSON, so it becomes shell form and runs <code>/bin/sh -c "['uvicorn', 'main:app']"</code>, which fails (often exit 127).`,
        `<b>Setting ENTRYPOINT resets inherited CMD.</b> If the base image had a CMD and your Dockerfile sets ENTRYPOINT, the base CMD is cleared; set CMD again if you need defaults.`,
        `<b><code>RUN cd /x</code> doesn't persist.</b> Each RUN is a new shell; use WORKDIR.`,
        `<b>ENV in one line vs several.</b> <code>ENV A=1 B=$A</code> expands <code>$A</code> to its value <i>before</i> this instruction (empty), not 1. Put dependent ENVs on separate lines.`,
        `<b><code>COPY . .</code> with a VOLUME already declared on the destination</b> (inherited) won't behave as expected in older builders. And <code>COPY</code> of a directory copies its contents, not the directory itself, unless you name it in the destination.`,
        `<b>HEALTHCHECK tools must exist in the image.</b> A <code>curl</code>-based check in a slim/distroless image fails forever and marks the container unhealthy.`,
        `<b>USER affects subsequent RUN steps.</b> Put <code>USER app</code> after package installs, or RUN steps that need root fail with permission errors.`,
        `<b>Exec form doesn't expand variables.</b> <code>CMD ["uvicorn", "main:app", "--port", "$PORT"]</code> passes the literal string <code>$PORT</code>.`
      ],
      best: [
        `Start with <code># syntax=docker/dockerfile:1</code>, pin the base image, and lint with hadolint / <code>docker build --check</code>.`,
        `Use exec form for CMD and ENTRYPOINT; use an entrypoint script ending in <code>exec "$@"</code> when you need setup or variable expansion.`,
        `Prefer CMD-only images for apps (easy overrides for migrations, shells, tests); use ENTRYPOINT + CMD for CLI-tool images.`,
        `Create and switch to a non-root user (numeric UID) in the final stage; use <code>COPY --chown</code>/<code>--chmod</code> instead of separate <code>chown</code> RUNs.`,
        `COPY over ADD; ARG for build knobs, ENV for runtime defaults, neither for secrets; LABEL with <code>org.opencontainers.image.*</code> keys.`,
        `Add a HEALTHCHECK that uses a tool present in the image and checks a real readiness endpoint.`
      ],
      lab: [
        `Build the shell-form and exec-form images above; compare <code>/proc/1/cmdline</code> and the time <code>docker stop</code> takes for each.`,
        `Build the <code>ep</code> image and try: no args, custom args, <code>--entrypoint date</code>, <code>--entrypoint sh … -c</code>. Write down the effective command each time and match it to the CMD/ENTRYPOINT table.`,
        `Build <code>Dockerfile.args</code> with and without <code>--build-arg BUILD_ID=…</code>; prove ARG isn't in the running container but ENV is. Check <code>docker history args</code> to see what's recorded.`,
        `Add <code>USER app</code> before a <code>RUN apt-get install</code> and observe the failure; fix the order.`,
        `Write a HEALTHCHECK for a FastAPI image without curl; watch <code>docker ps</code> go from <code>health: starting</code> to <code>healthy</code>, then break <code>/health</code> and watch it become <code>unhealthy</code>.`,
        `<b>Done when:</b> you can predict, before running, the effective command for any combination of ENTRYPOINT/CMD forms and run-time overrides, and your image runs as a non-root user with a working health check.`
      ],
      teach: `<p>"A Dockerfile is a recipe. <code>FROM</code> picks the base. <code>WORKDIR</code> sets the folder. <code>COPY</code> brings files from the build context; <code>ADD</code> can also unpack local tarballs and download URLs, so I prefer COPY. <code>RUN</code> executes during the build and makes a layer. <code>ENV</code> sets variables that stay in the image; <code>ARG</code> only exists during the build, and an ARG before FROM is only usable in FROM. Neither is for secrets.</p>
<p><code>EXPOSE</code> is documentation; <code>-p</code> publishes. <code>USER</code> drops root. <code>LABEL</code> is metadata. <code>VOLUME</code> creates anonymous volumes. <code>HEALTHCHECK</code> lets Docker report healthy or unhealthy. <code>STOPSIGNAL</code> changes what <code>docker stop</code> sends.</p>
<p>The key one: <code>ENTRYPOINT</code> is the executable, <code>CMD</code> is the default arguments. <code>docker run image args</code> replaces CMD; <code>--entrypoint</code> replaces ENTRYPOINT. Always use exec form, the JSON array, so my app is PID 1 and gets SIGTERM; shell form wraps it in <code>/bin/sh -c</code> and that's where 10-second shutdowns come from."</p>`
    },

    /* ------------------------------------------------------------------ */
    {
      id: "d2-builds",
      title: "Build context, cache, multi-stage builds and BuildKit",
      lv: ["mid", "senior", "lead", "dca"],
      eli5: `<p>Imagine baking a layered cake every day. If yesterday's sponge layers are still perfect and only the icing recipe changed, you'd keep the sponge and redo just the icing. But if you change the <i>bottom</i> layer, everything on top has to be rebuilt. That's the <b>build cache</b>: Docker keeps each finished layer and reuses it as long as nothing it depends on has changed. So you put the things that rarely change (flour, eggs = system packages, dependencies) at the bottom and the thing that changes every day (icing = your code) at the top.</p>
<p>Before baking, you carry ingredients from the pantry to the kitchen. If you carry the <i>whole pantry</i> (your <code>.git</code> folder, <code>node_modules</code>, a 2 GB dataset) every time, it's slow. The <b>.dockerignore</b> file is the list of things to leave in the pantry.</p>
<p>A <b>multi-stage build</b> is having a messy workshop and a clean shop. You build furniture in the workshop with saws and glue (compilers, build tools), then carry only the finished chair into the shop (the final image). Customers never see the sawdust.</p>
<p><b>BuildKit</b> is a modern kitchen with several ovens running at once, a fridge that keeps your ingredients between bakes (cache mounts), and a locked drawer for the key to the spice cabinet that never ends up in the cake (secret mounts).</p>`,
      what: `<h5>Build context</h5>
<ul class="pts">
<li>In <code>docker build -t api:dev .</code>, the final argument (<code>.</code>) is the <b>build context</b>: the set of files the builder may use in <code>COPY</code>/<code>ADD</code>. It can be a local directory, a Git URL (<code>https://github.com/org/repo.git#main:subdir</code>), a tarball, or <code>-</code> (stdin, then no context or a tar).</li>
<li>The builder may run elsewhere (a remote daemon, a buildx builder container, a cloud builder), so the context is <b>transferred</b> to it. BuildKit transfers only the files actually referenced and reuses unchanged ones between builds, but a huge context still slows builds and can leak files into images via <code>COPY . .</code>.</li>
<li><code>-f path/Dockerfile</code> selects the Dockerfile; it doesn't have to be inside the context. <code>COPY ../shared .</code> fails: sources must be inside the context. BuildKit also supports named extra contexts (<code>--build-context shared=../shared</code>, then <code>COPY --from=shared …</code>).</li>
</ul>
<h5>.dockerignore</h5>
<p>A file at the root of the context (or <code>&lt;Dockerfile&gt;.dockerignore</code> next to a specific Dockerfile) with patterns, like <code>.gitignore</code> (Go <code>filepath.Match</code> rules plus <code>**</code>, and <code>!</code> to re-include). Excluded files are never sent and can't be copied. Typical Python entries: <code>.git</code>, <code>.venv</code>, <code>__pycache__/</code>, <code>*.pyc</code>, <code>.env</code>, <code>.pytest_cache</code>, <code>tests/</code> (if not needed), <code>node_modules</code>. It speeds up builds, keeps secrets (<code>.env</code>) out of images, and stops irrelevant changes (e.g. <code>.git</code> metadata) from invalidating <code>COPY . .</code>.</p>
<h5>Build cache and invalidation rules</h5>
<ul class="pts">
<li>Each instruction's result is cached, keyed by its <b>parent</b> (the previous step's cache key) and its <b>definition</b>.</li>
<li>For most instructions (<code>RUN</code>, <code>ENV</code>, <code>WORKDIR</code>…) the definition is the <b>instruction text</b>. <code>RUN apt-get update</code> is cache-hit forever, even when the package repos change, because the text didn't change. Use <code>--no-cache</code> or change the text (e.g. pin versions) to refresh, and combine <code>apt-get update &amp;&amp; apt-get install</code> in one RUN so they never get out of sync.</li>
<li>For <code>COPY</code>/<code>ADD</code>, the builder also computes a <b>checksum of the files' contents</b> (and relevant metadata like permissions; modification times are ignored). Change one byte of any copied file and that step misses.</li>
<li>ARG values are part of the key for steps that <b>use</b> them: changing <code>--build-arg</code> invalidates from the first instruction that references the arg.</li>
<li>Once a step misses, <b>every later step in that stage rebuilds</b>, because their parent changed.</li>
<li><code>FROM python:3.12-slim</code> uses whatever that tag resolves to locally; add <code>--pull</code> to check the registry for a newer base.</li>
</ul>
<p><b>Ordering for cache hits</b>: least-frequently-changed first. Base image → OS packages → dependency manifest only (<code>COPY requirements.txt .</code>) → install dependencies → application code (<code>COPY . .</code>). Then editing <code>main.py</code> only re-runs the final COPY.</p>
<h5>Multi-stage builds</h5>
<p>Multiple <code>FROM</code>s in one Dockerfile; each starts a new stage with a fresh filesystem. Later stages copy only what they need with <code>COPY --from=&lt;stage&gt;</code>. The final image contains only the last (or <code>--target</code>) stage's layers: compilers, headers, pip caches, <code>node_modules</code> and source maps stay behind. BuildKit builds independent stages <b>in parallel</b> and <b>skips</b> stages the target doesn't depend on. Uses: React (Node build stage → Nginx), Python (build wheels/venv with gcc → slim runtime), Go (compile → <code>scratch</code>/distroless), plus <code>test</code> and <code>dev</code> stages selected with <code>--target</code>.</p>
<h5>Image-size optimization checklist</h5>
<ul class="pts">
<li>Smaller base: <code>python:3.12</code> (~1 GB) → <code>python:3.12-slim</code> (~120-150 MB) → distroless/Alpine (with caveats: musl).</li>
<li>Multi-stage: build tools only in the builder stage.</li>
<li>Don't keep caches: <code>pip install --no-cache-dir</code> (or a cache <i>mount</i>), <code>apt-get install --no-install-recommends … &amp;&amp; rm -rf /var/lib/apt/lists/*</code> in the same RUN.</li>
<li><code>.dockerignore</code> so <code>COPY . .</code> doesn't copy <code>.git</code>, tests, datasets.</li>
<li>Avoid separate <code>chown</code>/<code>chmod</code> layers (use <code>COPY --chown/--chmod</code>).</li>
<li>Inspect with <code>docker history</code> or tools like <code>dive</code> to find the fat layer.</li>
</ul>
<h5>BuildKit and docker buildx</h5>
<ul class="pts">
<li><b>BuildKit</b> is the default builder in Docker Desktop and Docker Engine (since Engine 23.0). It builds a dependency graph (parallel stages, skipped unused stages), has a smarter cache (including remote cache export/import with <code>--cache-to</code>/<code>--cache-from</code>, e.g. <code>type=registry</code> or <code>type=gha</code>), and supports <code>RUN --mount</code>, build secrets, SSH forwarding, heredocs in Dockerfiles, and build checks.</li>
<li><b><code>docker buildx</code></b> is the CLI plugin for BuildKit (<code>docker build</code> is an alias for <code>docker buildx build</code> in current versions). It manages <b>builders</b>: the default <code>docker</code> driver (builds inside dockerd, results directly in the local image store) and the <code>docker-container</code> driver (BuildKit in a container: multi-platform, advanced cache exports), plus <code>kubernetes</code> and <code>remote</code> drivers.</li>
<li><b>Multi-platform builds</b>: <code>docker buildx build --platform linux/amd64,linux/arm64 -t ghcr.io/shop/api:1.8.3 --push .</code> builds one image per platform and pushes an <b>image index</b>. Needed because Apple Silicon laptops and AWS Graviton servers are <code>arm64</code> while most CI runners and x86 servers are <code>amd64</code>. Non-native platforms build under QEMU emulation (slow but easy; Docker Desktop includes it, Linux hosts install binfmt handlers) or via cross-compilation using <code>FROM --platform=$BUILDPLATFORM</code> + <code>ARG TARGETARCH</code>. The classic image store can't hold multi-platform images locally, so you <code>--push</code> (or enable the containerd image store).</li>
<li><b><code>RUN --mount=type=cache,target=/root/.cache/pip</code></b>: a persistent cache directory that survives between builds but is <b>not</b> part of the image. Re-installs after a requirements change reuse downloaded wheels.</li>
<li><b><code>RUN --mount=type=secret,id=pip_token</code></b>: the secret file (passed with <code>docker build --secret id=pip_token,src=./token.txt</code>) is mounted at <code>/run/secrets/pip_token</code> only during that RUN; it never touches a layer, the history or the cache key. <b>Never use ARG or ENV for secrets</b>: they're visible in <code>docker history</code>/inspect and in the layer if written to disk.</li>
<li><b><code>--target &lt;stage&gt;</code></b>: build up to a named stage (e.g. <code>test</code> in CI, <code>dev</code> for local hot-reload).</li>
<li>Other useful flags: <code>--progress=plain</code> (full logs), <code>--no-cache</code>, <code>--pull</code>, <code>--load</code>/<code>--push</code> (where the result goes with container builders), <code>--build-arg</code>, <code>--label</code>.</li>
</ul>`,
      why: `<p>Without these tools, Docker builds are slow, fat and leaky:</p>
<ul class="pts">
<li><b>Slow</b>: the naive <code>COPY . . → RUN pip install</code> order re-installs every dependency on every code change: 3-5 minutes per build instead of 5 seconds, multiplied by every developer and every CI run.</li>
<li><b>Fat</b>: a single-stage image from <code>python:3.12</code> with compilers and caches is ~1 GB. That's slower pulls on every deploy and autoscale event, more storage, and far more CVEs for the security team to triage (most in packages your app never uses).</li>
<li><b>Leaky</b>: <code>COPY . .</code> without <code>.dockerignore</code> ships <code>.env</code> and <code>.git</code> history into the image; <code>ARG NPM_TOKEN</code> leaves the token in history; a <code>RUN echo $TOKEN &gt; ~/.netrc &amp;&amp; … &amp;&amp; rm ~/.netrc</code> still leaves it in the build cache and logs.</li>
<li><b>Wrong architecture</b>: an image built on an M-series Mac is <code>arm64</code>; deployed to an <code>amd64</code> server it fails with "exec format error" (or the reverse when x86 CI builds for a Graviton cluster).</li>
</ul>
<p>The legacy builder executed steps strictly in order, had no secret support, no cache mounts and limited cache reuse. BuildKit, buildx and multi-stage builds turned image building into a fast, cacheable, reproducible pipeline step that produces small, multi-architecture images without secrets in them.</p>`,
      diagram: {
        html: flow([
          ["docker build .", "CLI / buildx", "w"],
          ["context transfer", "filtered by .dockerignore"],
          ["BuildKit graph", "stages in parallel; unused skipped", "g"],
          ["cache lookup", "parent + instruction text / file checksums"],
          ["builder stage", "gcc, pip, cache mount, secret mount"],
          ["final stage", "slim base + venv + code, USER app", "g"],
          ["--load / --push", "local store or registry index (amd64 + arm64)"]
        ], { v: true }),
        steps: [
          `The CLI sends the build request and the context (minus <code>.dockerignore</code> patterns) to the BuildKit builder, which may be local or remote.`,
          `BuildKit converts the Dockerfile into a graph. Independent stages run in parallel; stages the target doesn't need are skipped.`,
          `For each step, BuildKit computes a cache key from the parent and the instruction (plus file checksums for COPY/ADD, and used ARG values). A hit reuses the layer; the first miss forces every later step in the stage to run.`,
          `RUN steps in the builder stage can mount a persistent cache (pip/apt) and secrets (tokens) that never become part of any layer.`,
          `The final stage copies only artifacts (<code>COPY --from=builder /opt/venv /opt/venv</code>), then the image is loaded locally or pushed, as an index of per-platform manifests for multi-platform builds.`
        ]
      },
      cmds: [
        {
          t: "Hands-on: the FastAPI application (main.py, requirements.txt, .dockerignore)",
          lang: "sh",
          code: `mkdir -p fastapi-demo && cd fastapi-demo

cat > main.py <<'EOF'
import os
from fastapi import FastAPI

app = FastAPI(title="shop-api")


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.get("/")
def root() -> dict:
    return {"message": "hello from FastAPI", "version": os.getenv("APP_VERSION", "dev")}
EOF

cat > requirements.txt <<'EOF'
fastapi==0.115.6
uvicorn[standard]==0.32.1
EOF

cat > .dockerignore <<'EOF'
.git
.venv
venv/
__pycache__/
*.pyc
.pytest_cache/
.env
.env.*
Dockerfile*
.dockerignore
EOF`,
          note: `<p>Pin dependency versions (use the versions you have tested; the ones above are examples). <code>.env</code> in <code>.dockerignore</code> keeps local secrets out of the image even if someone writes <code>COPY . .</code>.</p>`
        },
        {
          t: "The naive Dockerfile (works, but slow and fat)",
          lang: "dockerfile",
          code: `# Dockerfile.naive
FROM python:3.12
COPY . /app
WORKDIR /app
RUN pip install -r requirements.txt
CMD uvicorn main:app --host 0.0.0.0 --port 8000`,
          note: `<p>Problems: (1) the full <code>python:3.12</code> base (~1 GB, compilers and dev headers included); (2) <code>COPY . /app</code> <b>before</b> <code>pip install</code>, so any code change reinstalls all dependencies; (3) pip's cache stays in the layer; (4) shell-form CMD: <code>/bin/sh</code> is PID 1, slow and unclean shutdowns; (5) runs as root; (6) no health check.</p>`
        },
        {
          t: "The optimized multi-stage, non-root Dockerfile",
          lang: "dockerfile",
          code: `# syntax=docker/dockerfile:1
ARG PYTHON_VERSION=3.12

############################ builder ############################
FROM python:\${PYTHON_VERSION}-slim AS builder
ENV PIP_DISABLE_PIP_VERSION_CHECK=1 \\
    PYTHONDONTWRITEBYTECODE=1
# build tools only needed if a dependency has no prebuilt wheel
RUN apt-get update \\
 && apt-get install -y --no-install-recommends build-essential \\
 && rm -rf /var/lib/apt/lists/*
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
WORKDIR /build
COPY requirements.txt .
RUN --mount=type=cache,target=/root/.cache/pip \\
    pip install -r requirements.txt

############################ test (optional target) ############################
FROM builder AS test
COPY . .
RUN pip install pytest httpx && python -c "import main"

############################ runtime ############################
FROM python:\${PYTHON_VERSION}-slim AS runtime
ARG APP_VERSION=dev
LABEL org.opencontainers.image.title="shop-api" \\
      org.opencontainers.image.version=$APP_VERSION
ENV PYTHONDONTWRITEBYTECODE=1 \\
    PYTHONUNBUFFERED=1 \\
    PATH="/opt/venv/bin:$PATH" \\
    APP_VERSION=$APP_VERSION
RUN groupadd --system --gid 10001 app \\
 && useradd --system --uid 10001 --gid app --no-create-home app
WORKDIR /app
COPY --from=builder /opt/venv /opt/venv
COPY --chown=app:app main.py .
USER 10001:10001
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \\
  CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/health', timeout=2)" || exit 1
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]`,
          note: `<p>The venv is created in the builder and copied whole; it works because both stages use the same Python base and path (<code>/opt/venv</code>). Build tools, apt lists and the pip cache never reach the runtime stage. Dependencies are installed before the code is copied, so code edits don't invalidate the pip layer. For a real app with packages, use <code>COPY --chown=app:app app/ ./app/</code> instead of a single file. The <code>test</code> stage is skipped unless you ask for it with <code>--target test</code>.</p>`
        },
        {
          t: "Build both and compare sizes",
          lang: "sh",
          code: `docker build -t shop-api:naive -f Dockerfile.naive .
docker build -t shop-api:opt --build-arg APP_VERSION=1.0.0 .
docker image ls shop-api
docker run -d --name api -p 8000:8000 shop-api:opt
curl -s localhost:8000/ ; echo
docker exec api id
docker ps --filter name=api --format '{{.Names}} {{.Status}}'`,
          out: `REPOSITORY   TAG     IMAGE ID       CREATED          SIZE
shop-api     opt     5c1a9e7f2b30   10 seconds ago   175MB
shop-api     naive   a3d4c8e1f927   2 minutes ago    1.05GB
{"message":"hello from FastAPI","version":"1.0.0"}
uid=10001(app) gid=10001(app) groups=10001(app)
api Up 35 seconds (healthy)`,
          note: `<p>Exact sizes depend on base image versions and your dependencies; expect roughly a 5-6× reduction. Most of the win comes from the slim base; multi-stage matters more as soon as you need compilers or system <code>-dev</code> packages. Clean up: <code>docker rm -f api</code>.</p>`
        },
        {
          t: "Prove the cache works: change only main.py",
          lang: "sh",
          code: `sed -i 's/hello from FastAPI/hello again/' main.py     # macOS: sed -i '' 's/.../.../' main.py
time docker build --progress=plain -t shop-api:opt . 2>&1 | grep -E "CACHED|DONE|\\[runtime|\\[builder" | head -20`,
          out: `#7 [builder 2/6] RUN apt-get update  && apt-get install -y ...
#7 CACHED
#9 [builder 4/6] WORKDIR /build
#9 CACHED
#10 [builder 5/6] COPY requirements.txt .
#10 CACHED
#11 [builder 6/6] RUN --mount=type=cache,target=/root/.cache/pip     pip install -r requirements.txt
#11 CACHED
#12 [runtime 2/5] RUN groupadd --system --gid 10001 app ...
#12 CACHED
#14 [runtime 4/5] COPY --from=builder /opt/venv /opt/venv
#14 CACHED
#15 [runtime 5/5] COPY --chown=app:app main.py .
#15 DONE 0.0s
real    0m1.9s`,
          note: `<p>Only the final <code>COPY main.py</code> step re-ran. Now change <code>requirements.txt</code> (add <code>redis==5.2.1</code>) and rebuild: the pip step misses, but the cache <b>mount</b> means already-downloaded wheels aren't re-downloaded. Compare with the naive Dockerfile, where editing <code>main.py</code> re-runs <code>pip install</code> from scratch.</p>`
        },
        {
          t: "Build secrets and targets",
          lang: "sh",
          code: `# Dockerfile snippet (builder stage) for a private package index:
#   RUN --mount=type=secret,id=pip_index_url \\
#       PIP_INDEX_URL="$(cat /run/secrets/pip_index_url)" pip install -r requirements.txt

printf '%s' "https://user:token@pypi.example.com/simple" > ./pip_index_url.txt
docker build --secret id=pip_index_url,src=./pip_index_url.txt -t shop-api:opt .
docker history --no-trunc shop-api:opt | grep -c token     # 0: never stored

# run only up to the test stage in CI
docker build --target test -t shop-api:test .`,
          out: `0`,
          note: `<p>The secret is mounted as a tmpfs file only for that RUN. Keep <code>pip_index_url.txt</code> out of the context with <code>.dockerignore</code> (it's read by the CLI via <code>src=</code>, not through the context). Contrast with <code>ARG PIP_INDEX_URL</code>, whose value can be recovered from the image metadata.</p>`
        },
        {
          t: "Multi-platform build with buildx (amd64 + arm64)",
          lang: "sh",
          code: `docker buildx ls
docker buildx create --name multi --driver docker-container --use
docker buildx inspect --bootstrap | grep -i platforms
# Linux hosts without Docker Desktop: install QEMU handlers once
docker run --privileged --rm tonistiigi/binfmt --install arm64,amd64

docker buildx build --platform linux/amd64,linux/arm64 \\
  -t ghcr.io/example/shop-api:1.0.0 \\
  --cache-to type=registry,ref=ghcr.io/example/shop-api:buildcache,mode=max \\
  --cache-from type=registry,ref=ghcr.io/example/shop-api:buildcache \\
  --push .
docker buildx imagetools inspect ghcr.io/example/shop-api:1.0.0`,
          out: `Platforms: linux/amd64, linux/amd64/v2, linux/arm64, linux/riscv64, linux/ppc64le, linux/s390x, linux/386, linux/arm/v7, linux/arm/v6
...
Name:      ghcr.io/example/shop-api:1.0.0
MediaType: application/vnd.oci.image.index.v1+json
Digest:    sha256:9e1f...
Manifests:
  Name:      ghcr.io/example/shop-api:1.0.0@sha256:41ab...
  Platform:  linux/amd64
  Name:      ghcr.io/example/shop-api:1.0.0@sha256:c27d...
  Platform:  linux/arm64
  ...`,
          note: `<p>The tag now points at an <b>index</b>; an M-series Mac pulls the arm64 manifest, an x86 server the amd64 one. Emulated builds of the non-native platform are slower, especially compile-heavy steps; Python wheels usually exist for both. The extra "unknown/unknown" entries you may see are build attestations (provenance/SBOM).</p>`
        }
      ],
      internals: `<p><b>BuildKit's model.</b> The Dockerfile frontend (selected by <code># syntax=</code>, itself pulled as an image) converts the file into <b>LLB</b>, a content-addressed DAG of operations (source, exec, file copy, merge). The solver walks the DAG, computes a cache key per vertex (operation definition + input keys; for file sources, a content checksum of only the referenced paths), and executes only vertices without a cache hit. Exec vertices run as containers via runc (or containerd) on snapshots; independent vertices run concurrently.</p>
<p><b>Context transfer.</b> The client doesn't tar and upload the whole directory up front (the legacy builder did, printing "Sending build context to Docker daemon 1.2GB"). BuildKit requests files lazily over a session (gRPC through the client connection) and uses a file-sync protocol so unchanged files aren't resent on the next build. <code>.dockerignore</code> filtering happens client-side before anything is sent.</p>
<p><b>Cache storage.</b> With the <code>docker</code> driver the cache lives in dockerd's BuildKit state (<code>/var/lib/docker/buildkit</code>), shown by <code>docker buildx du</code> and cleaned with <code>docker builder prune</code>. Cache mounts (<code>type=cache</code>) are separate persistent directories keyed by <code>id</code> (default: the target path), shared between builds on that builder, and pruned like other cache. Secrets come from the client over the session and are mounted on a tmpfs at <code>/run/secrets/&lt;id&gt;</code> during that exec only; they aren't part of the cache key, which is why changing a secret value doesn't invalidate the step.</p>
<p><b>Multi-platform.</b> BuildKit sets <code>BUILDPLATFORM</code> (where the build runs) and <code>TARGETPLATFORM/TARGETOS/TARGETARCH/TARGETVARIANT</code> (what's being built) for each platform. For a foreign target, exec steps run binaries of the target architecture; the kernel's <b>binfmt_misc</b> hands them to a registered QEMU user-mode emulator. With <code>FROM --platform=$BUILDPLATFORM</code> the build stage runs natively and cross-compiles for <code>$TARGETARCH</code>. The result is one manifest per platform plus an index; the classic Docker image store can only hold one platform per tag, hence <code>--push</code> or the containerd image store.</p>
<p><b>Multi-stage pruning.</b> Because LLB is a graph, BuildKit only builds what the final target depends on. With the legacy builder (no longer default), every stage before the target was built sequentially, even unused ones.</p>`,
      prod: `<p><b>CI pipeline for the running example</b> (GitHub Actions or GitLab, conceptually):</p>
<ul class="pts">
<li><code>docker buildx build --target test .</code> runs unit tests inside the same dependency layers that production uses.</li>
<li><code>docker buildx build --platform linux/amd64,linux/arm64 --build-arg APP_VERSION=$GIT_TAG --label org.opencontainers.image.revision=$GIT_SHA --cache-from type=registry,ref=…:buildcache --cache-to type=registry,ref=…:buildcache,mode=max --push -t ghcr.io/shop/api:$GIT_TAG .</code> produces the release. The registry cache means a fresh CI runner still gets cache hits; typical rebuilds after a code-only change take under a minute.</li>
<li>Private package access uses <code>--secret id=pip_index_url,env=PIP_INDEX_URL</code> (or <code>src=</code>), never build args.</li>
<li>The React app's Dockerfile has a <code>node:22-alpine</code> stage that runs <code>npm ci</code> (with <code>--mount=type=cache,target=/root/.npm</code>) and <code>npm run build</code>, then an <code>nginx:1.27-alpine</code> stage that copies <code>dist/</code>: ~50 MB final image, no Node, no <code>node_modules</code>.</li>
<li>An image scanner (Docker Scout, Trivy, Grype) runs on the pushed digest; the slim, multi-stage image has a fraction of the CVE findings of the 1 GB naive one.</li>
</ul>
<p>Developers on Apple Silicon pull the same tag and get the arm64 variant natively, while production x86 VMs get amd64. A <code>dev</code> target with <code>uvicorn --reload</code> and test tools is used in Compose for local development with the source bind-mounted.</p>`,
      iq: [
        ["dca", "A Dockerfile has COPY . /app followed by RUN pip install -r requirements.txt. Developers complain every code change reinstalls all dependencies. What's the fix?", `<p>Copy the dependency manifest first, install, then copy the rest: <code>COPY requirements.txt /app/</code> → <code>RUN pip install -r requirements.txt</code> → <code>COPY . /app</code>. COPY's cache key includes the checksum of the copied files, so with <code>COPY . /app</code> first, any file change invalidates that step and every step after it. Adding a <code>.dockerignore</code> also stops irrelevant files from causing misses. <code>--no-cache</code> is the opposite of what's needed.</p>`],
        ["dca", "Which TWO changes invalidate the build cache for a RUN instruction?", `<p>(1) <b>Changing the text of the RUN instruction</b> itself. (2) <b>A cache miss in any earlier step</b> of the stage (e.g. a changed file in a preceding COPY, a changed base image). Also a changed value of an ARG the step uses. Not on the list: changes on the internet (<code>RUN apt-get update</code> stays cached even if repositories changed) and file timestamps (ignored for COPY checksums).</p>`],
        ["dca", "What does a multi-stage build achieve and how do you copy artifacts between stages?", `<p>It separates build-time dependencies from the runtime image: the final image contains only the last stage (or the <code>--target</code> stage). Artifacts are copied with <code>COPY --from=&lt;stage-name-or-index&gt; src dest</code>, e.g. <code>COPY --from=builder /opt/venv /opt/venv</code>; <code>--from</code> can also name an external image (<code>COPY --from=nginx:1.27-alpine …</code>). Result: smaller images, fewer vulnerabilities, no compilers or secrets in production.</p>`],
        ["dca", "What is the purpose of .dockerignore?", `<p>It excludes files and directories from the build context before it's sent to the builder: faster builds, fewer accidental cache invalidations, and no secrets (<code>.env</code>, keys) or junk (<code>.git</code>, <code>node_modules</code>) copied into images by <code>COPY . .</code>. Excluded files are simply not available to COPY/ADD. It does not affect what <code>docker run</code> bind-mounts.</p>`],
        ["mid", "Why must you never pass a token with --build-arg, and what do you use instead?", `<p>Build args are recorded in the image's build metadata/history (and may be written into layers if used to create files), so anyone who can pull the image can read the token. Use BuildKit secrets: <code>docker build --secret id=token,src=token.txt</code> and <code>RUN --mount=type=secret,id=token …</code>. The secret is mounted on a tmpfs for that RUN only, not stored in any layer or cache key. Even deleting a file in the same RUN doesn't help with ARG, because the value is in metadata.</p>`],
        ["mid", "Your colleague on an M-series Mac pushed an image; production x86 servers fail with 'exec format error'. Explain and fix.", `<p>The image was built for the Mac's native <code>linux/arm64</code> platform; an amd64 host can't execute arm64 binaries. Fix: build in CI with <code>docker buildx build --platform linux/amd64,linux/arm64 --push</code> to publish an index containing both, or at least <code>--platform linux/amd64</code>. <code>docker buildx imagetools inspect</code> or <code>docker image inspect --format '{{.Architecture}}'</code> verifies what's published.</p>`],
        ["senior", "What does RUN --mount=type=cache give you that layer caching doesn't?", `<p>Layer caching is all-or-nothing per step: when <code>requirements.txt</code> changes, the whole <code>pip install</code> step reruns from an empty pip cache and re-downloads everything. A cache mount persists a directory (e.g. <code>/root/.cache/pip</code>, <code>/root/.npm</code>, <code>/var/cache/apt</code>) <b>across</b> builds without putting it in the image, so a rerun only downloads what's new. It keeps images small (no cache in layers) and rebuilds fast. It's local to the builder (not exported with <code>--cache-to</code>), so ephemeral CI runners need a persistent builder to benefit.</p>`],
        ["senior", "Explain how BuildKit decides whether a COPY step is cached.", `<p>The cache key combines the parent step's key and a checksum computed over the <b>contents and metadata</b> (permissions, ownership as applied, but not modification times) of exactly the files that the COPY's source paths match after <code>.dockerignore</code> filtering, plus the instruction's flags (destination, <code>--chown</code>, <code>--chmod</code>, <code>--link</code>). Touching a file (new mtime) doesn't invalidate; changing a byte does; adding a new file matched by <code>COPY . .</code> does.</p>`],
        ["lead", "Design the Dockerfile and CI build strategy for a team that has React + FastAPI services, Apple Silicon laptops and amd64 production.", `<p>One Dockerfile per service with stages: <code>deps</code> (lockfile-only COPY + install with cache mounts), <code>test</code> (code + test tools; CI uses <code>--target test</code>), <code>dev</code> (reload server, used by Compose), <code>runtime</code> (slim/Nginx base, non-root, exec-form CMD, HEALTHCHECK, OCI labels). <code>.dockerignore</code> shared conventions. CI: buildx with a <code>docker-container</code> builder, <code>--platform linux/amd64,linux/arm64</code>, registry cache, secrets via <code>--secret</code>, tags = semver + git SHA, push then scan and sign the digest; deploy by digest. Base images pinned and auto-updated by a bot. Build checks/hadolint gate merges.</p>`]
      ],
      gotchas: [
        `<b><code>RUN apt-get update</code> on its own line gets cached</b>, so a later <code>apt-get install</code> may use stale package lists and fail with 404s. Always <code>apt-get update &amp;&amp; apt-get install -y … &amp;&amp; rm -rf /var/lib/apt/lists/*</code> in one RUN.`,
        `<b>Cache hits can hide upstream changes.</b> A cached <code>FROM python:3.12-slim</code> is whatever you pulled last time; use <code>--pull</code> in CI to get base-image security fixes.`,
        `<b>The venv-copy trick needs matching paths and Python.</b> A venv's scripts hard-code its absolute path and interpreter; copy it to the same path in a stage with the same Python version.`,
        `<b>Multi-platform results can't be <code>--load</code>ed</b> into the classic image store; push them, or enable the containerd image store.`,
        `<b><code>.dockerignore</code> must be in the context root</b> (or named after the Dockerfile). A <code>.dockerignore</code> in a subfolder is ignored. Ignoring <code>requirements.txt</code> by accident makes <code>COPY requirements.txt</code> fail with "not found".`,
        `<b>Secrets via <code>--secret</code> aren't in the cache key</b>; rotating a token won't rerun the step. That's usually what you want, but surprising if the step's output depends on the secret.`,
        `<b>Cache mounts aren't in the image or in exported cache.</b> Don't put anything the runtime needs in a cache-mount target (it vanishes from the final image).`
      ],
      best: [
        `Order Dockerfile steps from least to most frequently changing; copy lockfiles before source code.`,
        `Always ship a <code>.dockerignore</code>; include <code>.git</code>, <code>.env*</code>, virtualenvs, <code>node_modules</code>, caches and test artifacts.`,
        `Use multi-stage builds with a slim, pinned runtime base, a non-root user, exec-form CMD and a HEALTHCHECK; keep compilers in the builder.`,
        `Use <code>RUN --mount=type=cache</code> for package managers and <code>--mount=type=secret</code> for credentials; never ARG/ENV for secrets.`,
        `Build multi-platform images (<code>linux/amd64,linux/arm64</code>) in CI with buildx, a registry cache, and <code>--pull</code>; tag immutably and record the digest.`,
        `Use <code>--target</code> stages for test and dev so one Dockerfile serves CI, local development and production.`
      ],
      lab: [
        `Create <code>main.py</code>, <code>requirements.txt</code> and <code>.dockerignore</code> as above. Build <code>Dockerfile.naive</code> as <code>shop-api:naive</code>, then edit <code>main.py</code> and rebuild: time it and notice <code>pip install</code> runs again.`,
        `Write the optimized multi-stage Dockerfile, build <code>shop-api:opt</code>, and compare sizes with <code>docker image ls shop-api</code> and layers with <code>docker history</code>.`,
        `Run it with <code>-p 8000:8000</code>; check <code>curl localhost:8000/</code>, <code>docker exec api id</code> (uid 10001) and that <code>docker ps</code> shows <code>(healthy)</code>. Time <code>docker stop api</code> (should be well under a second).`,
        `Change only <code>main.py</code> and rebuild with <code>--progress=plain</code>; confirm every step except the last COPY is <code>CACHED</code>. Then add a dependency to <code>requirements.txt</code> and see which steps rerun.`,
        `Build <code>--target test</code>. Then pass a fake token with <code>--secret</code> and confirm it doesn't appear in <code>docker history --no-trunc</code>; repeat with <code>--build-arg</code> and an <code>ARG</code> and find it in the image metadata.`,
        `(Optional) Create a <code>docker-container</code> buildx builder and build <code>--platform linux/amd64,linux/arm64</code> (push to a registry you own, or <code>--output type=oci,dest=api.tar</code>).`,
        `<b>Done when:</b> <code>shop-api:opt</code> is several times smaller than <code>shop-api:naive</code>, runs as uid 10001 and reports healthy, and a rebuild after editing only <code>main.py</code> finishes in seconds with all dependency steps <code>CACHED</code>.`
      ],
      teach: `<p>"When I run <code>docker build .</code>, the dot is the build context: the files the builder is allowed to COPY. <code>.dockerignore</code> keeps <code>.git</code>, <code>.env</code> and <code>node_modules</code> out, which makes builds faster and safer.</p>
<p>Every step is cached. A step is reused if everything before it was reused and its instruction text is the same; for COPY, the file contents must be the same too. The first miss rebuilds everything after it. So I copy <code>requirements.txt</code> and install dependencies first, and copy the code last; editing <code>main.py</code> then only reruns one tiny step.</p>
<p>Multi-stage builds let me compile in a builder stage and copy only the result into a slim runtime stage: our FastAPI image went from about a gigabyte to under 200 MB, running as non-root. BuildKit, the default builder, adds cache mounts for pip, secret mounts so tokens never land in a layer, <code>--target</code> for test stages, and with buildx, multi-platform images, so the same tag works on Apple Silicon and on amd64 servers."</p>`
    }
  ],
  quiz: [
    {
      q: `A teammate "removed" a 600 MB dataset from the image but it's still 1.2 GB. Why?`,
      code: `FROM python:3.12-slim
COPY data/ /data/
RUN python preprocess.py /data /model
RUN rm -rf /data`,
      lang: "dockerfile",
      ans: `The dataset is still in the <code>COPY data/</code> layer; the later <code>rm</code> only adds a whiteout in a new layer.`,
      why: `Layers are additive diffs. Use a multi-stage build: preprocess in a builder stage and <code>COPY --from=builder /model /model</code> into the final stage, so the dataset never enters a final-image layer. (Or <code>RUN --mount=type=bind,source=data,target=/data python preprocess.py …</code> so the data is mounted, not copied.) Also add <code>data/</code> to <code>.dockerignore</code> if no other step needs it.`
    },
    {
      q: `This image ignores the arguments you pass, and <code>docker stop</code> always takes 10 seconds. What's wrong?`,
      code: `FROM python:3.12-slim
COPY app.py .
ENTRYPOINT python app.py
CMD ["--workers", "4"]
# docker run myimg --workers 8   -> still runs with default settings`,
      lang: "dockerfile",
      ans: `ENTRYPOINT is in shell form: it runs <code>/bin/sh -c "python app.py"</code>, which ignores CMD and run arguments, and the shell is PID 1 so SIGTERM doesn't reach Python.`,
      why: `Per the CMD/ENTRYPOINT table, a shell-form ENTRYPOINT ignores CMD entirely. Fix with exec form: <code>ENTRYPOINT ["python", "app.py"]</code>; then <code>docker run myimg --workers 8</code> runs <code>python app.py --workers 8</code>, and Python is PID 1, receiving SIGTERM directly.`
    },
    {
      q: `A CI job builds with <code>docker build --build-arg NPM_TOKEN=$NPM_TOKEN .</code> and the Dockerfile does <code>ARG NPM_TOKEN</code> then <code>RUN echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" &gt; .npmrc &amp;&amp; npm ci &amp;&amp; rm .npmrc</code>. Security says the token leaked. How, and what's the fix?`,
      ans: `Build-arg values are recorded in image metadata/history, so anyone who pulls the image can recover them. Use a BuildKit secret mount instead.`,
      why: `Deleting <code>.npmrc</code> in the same RUN keeps it out of the layer, but the ARG value used by the RUN is still visible (e.g. via <code>docker history --no-trunc</code> or build provenance). Fix: <code>RUN --mount=type=secret,id=npmrc,target=/root/.npmrc npm ci</code> with <code>docker build --secret id=npmrc,src=$HOME/.npmrc .</code>. Rotate the leaked token.`
    },
    {
      q: `Builds take 4 minutes even for one-line code changes, and the log shows "transferring context: 1.9GB". The Dockerfile starts with <code>COPY . /app</code>. Name two fixes.`,
      ans: `Add a <code>.dockerignore</code> (exclude <code>.git</code>, <code>node_modules</code>, <code>.venv</code>, data) and reorder: copy only the dependency manifest, install, then copy the source.`,
      why: `The huge context is slow to transfer and, because <code>COPY . /app</code> comes first, any change in any file (even <code>.git</code> metadata) invalidates it and every following step including the dependency install. With the manifest copied first, code-only changes hit the cache for the install step.`
    },
    {
      q: `<code>docker image prune</code> reports "Total reclaimed space: 0B", yet <code>docker system df</code> says 6 GB of images are reclaimable. Why, and which command reclaims them?`,
      code: `docker image prune
docker system df`,
      lang: "sh",
      ans: `Plain <code>prune</code> only removes <b>dangling</b> (untagged) images. The reclaimable images are tagged but unused; <code>docker image prune -a</code> removes them.`,
      why: `"Unused" means no container (running or stopped) references the image. <code>-a</code> deletes those even if tagged; add <code>--filter until=…</code> to keep recent ones (for fast rollback). Build cache is separate: <code>docker builder prune</code>.`
    },
    {
      q: `An image built on a developer's M3 MacBook runs fine locally but on the amd64 production VM the container exits immediately with "exec format error". The developer says "but Docker is portable!". Explain.`,
      ans: `The image was built for <code>linux/arm64</code>; the amd64 kernel can't run arm64 binaries. Build for <code>linux/amd64</code> (or both) with <code>docker buildx build --platform linux/amd64,linux/arm64 --push</code>.`,
      why: `Containers abstract the OS userspace, not the CPU architecture. A multi-platform image is an index with one manifest per platform, and each host pulls the matching one. Verify with <code>docker buildx imagetools inspect</code>.`
    }
  ]
},
/* ===== Day 3 ===== */
{
  n: 3,
  title: "Networking",
  goal: "<b>By the end of today</b> you can explain exactly how a packet travels from a browser on the host, through a published port, across a Linux bridge and a veth pair into a container's own network namespace, and why <code>FastAPI → localhost:5432</code> fails while <code>FastAPI → postgres:5432</code> works. You can pick the right network driver (bridge, host, none, overlay, macvlan/ipvlan) and debug connectivity with <code>docker network inspect</code>, <code>getent</code>, <code>nsenter</code> and <code>iptables</code>.",
  rev: [
    "<b>Network namespaces:</b> every container gets its own network stack (interfaces, routes, iptables, <b>its own loopback</b>). <code>localhost</code> inside a container is the container itself, never the host and never another container.",
    "<b>Bridge plumbing:</b> a veth pair joins the container's <code>eth0</code> to a Linux bridge on the host (<code>docker0</code> for the default network, <code>br-&lt;id&gt;</code> for user-defined ones); the host NATs outbound traffic (MASQUERADE) and DNATs published ports.",
    "<b>DNS:</b> on <b>user-defined</b> networks Docker's embedded DNS server (<code>127.0.0.11</code> in the container's <code>/etc/resolv.conf</code>) resolves container names, service names and <code>--network-alias</code> names. The <b>default bridge has no name resolution</b>; always create your own network.",
    "<b>Publishing:</b> <code>-p 8080:80</code> = host 0.0.0.0:8080 → container :80 via an iptables DNAT rule (plus <code>docker-proxy</code> for some paths). <code>-p 127.0.0.1:8080:80</code> keeps it local. <code>EXPOSE</code> only documents; <code>-P</code> publishes every EXPOSEd port to a random host port. Container-to-container traffic on the same network needs <b>no</b> publishing.",
    "<b>Drivers:</b> bridge (single host, default), host (share host stack, no isolation, no <code>-p</code>), none (loopback only), overlay (multi-host over VXLAN, Swarm), macvlan/ipvlan (containers appear directly on the physical LAN). Server processes in containers must bind <code>0.0.0.0</code>, not <code>127.0.0.1</code>."
  ],
  topics: [
    {
      id: "d3-networks",
      title: "Container networking: namespaces, bridges, host, none and DNS",
      lv: ["fresher", "mid", "senior", "architect", "dca"],
      eli5: `<p>Imagine an apartment building. Each apartment (container) has its <b>own phone line with its own extensions</b>. When someone in apartment 3 dials extension "0" (localhost), the phone rings <i>in apartment 3</i>, not in the lobby and not in apartment 4. That is the single most important fact of today.</p>
<p>The building has an internal <b>switchboard</b> (the Linux bridge). Every apartment is connected to it by its own private cable (a veth pair). Apartments plugged into the same switchboard can call each other directly by their room number (IP address). If the building manager also keeps a <b>directory</b> (Docker's embedded DNS), you can call "postgres" by name instead of remembering it lives in room 172.20.0.3. The old shared switchboard in the basement (the default <code>bridge</code> network) has <b>no directory</b>; the newer switchboards you install yourself (user-defined networks) do.</p>
<p>Calls to the outside world go through the building's reception (the host's NAT): outsiders only see the building's number. If you want outsiders to reach a specific apartment, reception sets up a forwarding rule: "calls to the building on extension 8080 go to apartment 3, extension 80". That is port publishing, the subject of the next topic.</p>
<p>Some tenants choose odd setups: one moves into the lobby and uses the building's own phone (host network), one has no phone at all (none), and some buildings are connected to each other by a private tunnel so apartments in different buildings can call each other as if they were neighbours (overlay networks).</p>`,
      what: `<p><b>Docker networking</b> is built from ordinary Linux kernel features. Docker (specifically <code>libnetwork</code> inside <code>dockerd</code>) creates and wires them; the kernel does all of the packet forwarding. There is no "Docker router" process in the data path for container-to-container traffic.</p>
<h5>The building blocks</h5>
<ul class="pts">
<li><b>Network namespace</b>: a kernel namespace (<code>CLONE_NEWNET</code>) that gives a process its own copy of the network stack: interfaces, IP addresses, routing table, ARP table, iptables/nftables rules, socket port space and <b>its own loopback device <code>lo</code> (127.0.0.1)</b>. Two containers can both listen on port 80 because each has its own port space.</li>
<li><b>veth pair</b>: a virtual Ethernet cable with two ends. Whatever goes in one end comes out of the other. Docker puts one end inside the container's namespace (renamed <code>eth0</code>) and leaves the other end on the host with a name like <code>veth3a1f2c9</code>, attached to a bridge.</li>
<li><b>Linux bridge</b>: a virtual layer-2 switch in the kernel. <code>docker0</code> is the bridge for the default <code>bridge</code> network; each user-defined bridge network gets its own bridge named <code>br-&lt;first 12 chars of network id&gt;</code>. The bridge also has an IP (the gateway, e.g. <code>172.17.0.1</code>) so the host can route to containers.</li>
<li><b>iptables/NAT</b>: outbound traffic from containers is source-NATed (<code>MASQUERADE</code>) to the host's IP; inbound published ports are destination-NATed (<code>DNAT</code>) to the container. Docker also installs isolation rules so different bridge networks cannot talk to each other. (Newer Engine releases add an optional nftables backend; the concepts are the same.)</li>
<li><b>Embedded DNS server</b>: on user-defined networks each container's <code>/etc/resolv.conf</code> says <code>nameserver 127.0.0.11</code>. Queries to that address are intercepted (via iptables rules inside the container's namespace) and answered by <code>dockerd</code>, which knows every container name, service name and alias on the networks that container is attached to. Anything it does not know is forwarded to the host's upstream DNS servers.</li>
</ul>
<h5>The network drivers</h5>
<ul class="pts">
<li><b><code>bridge</code></b> (default driver): single-host, private subnet, NAT to the outside. There are two flavours that behave differently:
<ul>
<li>The <b>default bridge</b> named <code>bridge</code> (<code>docker0</code>, usually <code>172.17.0.0/16</code>). Containers started without <code>--network</code> land here. <b>No DNS by container name</b>: containers can only reach each other by IP (or the deprecated <code>--link</code>). The container gets a copy of the host's resolv.conf, not 127.0.0.11. All "unattached" containers share it, so there is no isolation between unrelated apps.</li>
<li><b>User-defined bridges</b> (<code>docker network create appnet</code>). Automatic DNS by container name and alias, better isolation (only containers you attach can talk), containers can be connected/disconnected at runtime, and per-network options (subnet, MTU, <code>--internal</code>). This is what Docker Compose creates for every project. <b>Always use these.</b></li>
</ul></li>
<li><b><code>host</code></b>: no separate network namespace; the container uses the host's stack directly. A process listening on :8000 is listening on the host's :8000. No NAT, no veth, best raw performance, no isolation, and <code>-p</code> is ignored. Fully supported on Linux; on Docker Desktop the "host" is the Linux VM (newer Desktop versions offer an opt-in host-networking feature with limitations, so check your version).</li>
<li><b><code>none</code></b>: a new namespace with only <code>lo</code>. No external connectivity at all. Useful for batch jobs that must not touch the network, or when you plumb networking yourself.</li>
<li><b><code>container:&lt;name&gt;</code></b> (network mode, not a driver): join another container's namespace. Both see the same <code>eth0</code> and the same <code>localhost</code>. This is exactly how a Kubernetes pod works (all containers share the pause container's network namespace) and how sidecars/debug containers attach: <code>docker run -it --network container:api nicolaka/netshoot</code>.</li>
<li><b><code>overlay</code></b>: a virtual layer-2 network that spans multiple Docker hosts. Frames are encapsulated in <b>VXLAN</b> (UDP 4789) between hosts; the control plane (who is where) is gossiped between Swarm nodes. Requires Swarm mode (use <code>--attachable</code> to let standalone containers join). Covered in depth on Day 9.</li>
<li><b><code>macvlan</code></b>: each container gets its own MAC address on a parent interface (e.g. <code>eth0</code>) and appears as a separate physical device on the LAN, with an IP from the LAN subnet. No NAT, no port publishing needed. Gotchas: the switch must accept multiple MACs per port (often blocked on cloud VPCs and Wi-Fi), and by default <b>the host itself cannot talk to its own macvlan containers</b>.</li>
<li><b><code>ipvlan</code></b>: like macvlan but all containers share the parent's MAC address (L2 mode) or the host routes for them (L3 mode). Useful where the network limits MAC addresses per port.</li>
<li><b>Third-party/plugin drivers</b> (Weave, Calico, cloud CNI-like plugins) exist but are rare outside Kubernetes today.</li>
</ul>
<h5>Names, aliases and multiple networks</h5>
<ul class="pts">
<li>On a user-defined network a container is resolvable by its <b>container name</b> (<code>--name postgres</code>), by its <b>short container ID</b>, and by any <b>network alias</b> (<code>--network-alias db</code> or <code>docker network connect --alias db</code>). Aliases are <i>per network</i>: a container can be <code>db</code> on one network and <code>primary</code> on another.</li>
<li>Several containers can share an alias. The embedded DNS then returns all their IPs (DNS round-robin), a poor man's load balancing. In Compose, the service name is automatically an alias, so <code>--scale api=3</code> makes <code>api</code> resolve to three IPs.</li>
<li>A container can be attached to <b>many networks</b>. It gets one <code>ethN</code> per network and is reachable by name only from containers that share at least one of those networks. This is the standard way to build tiers: <code>frontend</code> network (nginx + api) and <code>backend</code> network (api + postgres + redis). nginx can never reach postgres directly.</li>
<li><code>docker network connect</code>/<code>disconnect</code> work on running containers: a new <code>ethN</code> appears inside the container immediately.</li>
<li>The container's IP is assigned by Docker's IPAM from the network's subnet and is <b>not stable</b> across re-creation. Never hard-code container IPs; use names. (You can pin one with <code>--ip</code> on a user-defined network with an explicit subnet, but that is rarely the right answer.)</li>
</ul>`,
      why: `<p>Before containers, every process on a server shared one network stack. Two apps that both wanted port 8080 collided; a debug tool listening on <code>0.0.0.0</code> was exposed to the world; firewall rules were hand-maintained per host; and "what talks to what" lived in someone's head. Running many independent services on one machine meant juggling port numbers and config files.</p>
<p>Containers needed three things at once: <b>isolation</b> (each service gets its own ports and cannot sniff its neighbours), <b>connectivity</b> (services that should talk can, ideally by name) and <b>controlled exposure</b> (only chosen ports are reachable from outside). Linux already had the pieces (namespaces since kernel 2.6.24-ish, veth, bridges, netfilter); Docker's contribution was to assemble them automatically and consistently for every container, and to add service discovery (embedded DNS) so applications can use stable names instead of ephemeral IPs.</p>
<p>The distributed-systems angle: once a system is split into React, FastAPI, Redis and PostgreSQL processes, the network <i>is</i> the integration layer. Service discovery, isolation between tiers, failure when a name does not resolve, and the difference between "same machine" and "same network" are exactly the problems you will meet again with Swarm overlays, Kubernetes Services and cloud VPCs. Docker's bridge networks are the smallest, most inspectable version of those ideas.</p>`,
      diagram: {
        html: lanes([
          ["Container: api (netns A)", ["<code>lo</code> 127.0.0.1 (api only)", "<code>eth0</code> 172.20.0.3/16", "resolv.conf → 127.0.0.11", "default route via 172.20.0.1"]],
          ["Host (root netns)", ["<code>vethA</code> ⇄ <code>br-7c1e…</code> ⇄ <code>vethB</code>", "bridge IP 172.20.0.1 (gateway)", "iptables: MASQUERADE out, DNAT for -p", "dockerd: embedded DNS for appnet", "<code>eth0</code> 192.168.1.20 → LAN/Internet"]],
          ["Container: postgres (netns B)", ["<code>lo</code> 127.0.0.1 (postgres only)", "<code>eth0</code> 172.20.0.2/16", "listens 0.0.0.0:5432", "name <code>postgres</code>, alias <code>db</code>"]]
        ]) + flow([["api process", "connect postgres:5432", "w"], ["127.0.0.11", "embedded DNS → 172.20.0.2"], ["eth0 → veth", "kernel"], ["br-7c1e…", "L2 switch on host"], ["veth → eth0", "postgres netns", "g"]]),
        steps: [
          "<code>docker network create appnet</code> makes libnetwork allocate a subnet (e.g. 172.20.0.0/16), create the bridge <code>br-&lt;id&gt;</code> with gateway IP 172.20.0.1, and add NAT and isolation rules.",
          "<code>docker run --network appnet --name postgres …</code>: runc creates a new network namespace; libnetwork creates a veth pair, moves one end into the namespace as <code>eth0</code>, assigns 172.20.0.2, sets the default route via the gateway and attaches the other end to the bridge.",
          "The api container is created the same way and gets 172.20.0.3. Its <code>/etc/resolv.conf</code> points at <code>127.0.0.11</code>.",
          "When FastAPI resolves <code>postgres</code>, the query to 127.0.0.11:53 is redirected to the DNS resolver inside <code>dockerd</code>, which answers 172.20.0.2 because both containers share <code>appnet</code>.",
          "The TCP SYN leaves api's <code>eth0</code>, pops out of the host-side veth into the bridge, the bridge forwards it (L2, by MAC) to postgres's veth, and it arrives on postgres's <code>eth0</code>. No NAT, no port publishing involved.",
          "Traffic to the Internet takes the default route to 172.20.0.1, is routed by the host and MASQUERADEd to the host's IP on its way out."
        ]
      },
      cmds: [
        {
          t: "List and inspect the built-in networks",
          lang: "sh",
          code: `docker network ls
docker network inspect bridge --format '{{json .IPAM.Config}}'
ip addr show docker0`,
          out: `NETWORK ID     NAME      DRIVER    SCOPE
3f2a9c1d0b7e   bridge    bridge    local
a81c55e0f912   host      host      local
0d4e7b2a6c13   none      null      local

[{"Subnet":"172.17.0.0/16","Gateway":"172.17.0.1"}]

4: docker0: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc noqueue state DOWN
    inet 172.17.0.1/16 brd 172.17.255.255 scope global docker0`,
          note: `<p>Three networks always exist: <code>bridge</code>, <code>host</code> and <code>none</code> (driver <code>null</code>). They cannot be removed. <code>NO-CARRIER</code>/<code>DOWN</code> on <code>docker0</code> just means no container is attached yet. On Docker Desktop, run <code>ip</code> commands inside the VM or a privileged container; your Mac/Windows host has no <code>docker0</code>.</p>`
        },
        {
          t: "Prove the default bridge has no name DNS",
          lang: "sh",
          code: `docker run -d --name web1 nginx:1.27-alpine
docker run --rm busybox:1.36 ping -c1 web1
# use the IP instead
docker inspect -f '{{.NetworkSettings.IPAddress}}' web1
docker run --rm busybox:1.36 ping -c1 172.17.0.2
docker run --rm busybox:1.36 cat /etc/resolv.conf`,
          out: `ping: bad address 'web1'
172.17.0.2
PING 172.17.0.2 (172.17.0.2): 56 data bytes
64 bytes from 172.17.0.2: seq=0 ttl=64 time=0.112 ms
# resolv.conf is a copy of the host's, e.g.
nameserver 192.168.1.1`,
          note: `<p>Containers on the default bridge can reach each other by IP (inter-container communication is enabled by default), but there is no name resolution. The legacy fix was <code>--link</code>, which just wrote <code>/etc/hosts</code> entries; it is deprecated. The modern fix is a user-defined network.</p>`
        },
        {
          t: "Create a user-defined bridge and resolve by name",
          lang: "sh",
          code: `docker network create appnet
docker run -d --name postgres --network appnet -e POSTGRES_PASSWORD=secret postgres:16
docker run --rm --network appnet busybox:1.36 nslookup postgres
docker run --rm --network appnet busybox:1.36 cat /etc/resolv.conf`,
          out: `Server:		127.0.0.11
Address:	127.0.0.11:53

Non-authoritative answer:
Name:	postgres
Address: 172.18.0.2

nameserver 127.0.0.11
options ndots:0`,
          note: `<p>The resolver is <code>127.0.0.11</code>, i.e. Docker's embedded DNS. busybox <code>nslookup</code> sometimes prints an extra "can't find … AAAA" line for IPv6; that is harmless. The subnet you get (172.18, 172.19, …) depends on what already exists; daemon option <code>default-address-pools</code> controls the pool.</p>`
        },
        {
          t: "Look at the plumbing: bridge, veth pairs and the container's own stack",
          lang: "sh",
          code: `# host side (Linux)
NET=$(docker network inspect -f '{{.Id}}' appnet | cut -c1-12)
ip link show master br-$NET
bridge link show
# container side, without installing tools in the image
PID=$(docker inspect -f '{{.State.Pid}}' postgres)
sudo nsenter -t $PID -n ip addr
sudo nsenter -t $PID -n ip route
# match the pair: the container's eth0 peer index
sudo nsenter -t $PID -n cat /sys/class/net/eth0/iflink`,
          out: `7: veth9b2d1e4@if6: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 master br-5e0c4f7a1b2d state UP
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
6: eth0@if7: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 172.18.0.2/16 brd 172.18.255.255 scope global eth0
default via 172.18.0.1 dev eth0
172.18.0.0/16 dev eth0 proto kernel scope link src 172.18.0.2
7`,
          note: `<p><code>eth0@if7</code> inside the container and <code>veth9b2d1e4@if6</code> on the host point at each other's interface index: that is the veth pair. <code>nsenter -n</code> runs the host's <code>ip</code> binary inside the container's network namespace, which is the cleanest way to debug minimal images that ship no tools. <code>ip netns list</code> does not show Docker namespaces because Docker keeps them under <code>/var/run/docker/netns/</code>, not <code>/var/run/netns/</code>.</p>`
        },
        {
          t: "Aliases, multiple networks and runtime connect/disconnect",
          lang: "sh",
          code: `docker network create frontend
docker network create backend
docker run -d --name pg --network backend --network-alias db -e POSTGRES_PASSWORD=secret postgres:16
docker run -d --name api --network backend python:3.12-slim sleep infinity
docker network connect frontend api
docker run -d --name edge --network frontend nginx:1.27-alpine
docker exec api getent hosts db          # works: api is on backend
docker exec edge getent hosts api        # works: both on frontend
docker exec edge getent hosts pg || echo "edge cannot see pg"
docker inspect -f '{{range $k,$v := .NetworkSettings.Networks}}{{$k}}={{$v.IPAddress}} {{end}}' api`,
          out: `172.21.0.2      db
172.22.0.3      api
edge cannot see pg
backend=172.21.0.3 frontend=172.22.0.3`,
          note: `<p>The api container now has two interfaces (<code>eth0</code>, <code>eth1</code>), one per network. edge and pg share no network, so neither DNS nor routing connects them; Docker's isolation rules also drop traffic between different bridge networks. Note: since Engine 25-ish, <code>docker run</code> accepts <code>--network</code> more than once; on older versions use <code>docker network connect</code> after start.</p>`
        },
        {
          t: "host, none and container: network modes",
          lang: "sh",
          code: `# host: the process binds the host's port directly (Linux)
docker run -d --name h --network host nginx:1.27-alpine
curl -sI http://localhost:80 | head -1
# none: loopback only
docker run --rm --network none busybox:1.36 ip addr
# join another container's namespace (sidecar / debug)
docker run --rm -it --network container:pg nicolaka/netshoot ss -lntp`,
          out: `HTTP/1.1 200 OK
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue qlen 1000
    inet 127.0.0.1/8 scope host lo
State  Recv-Q Send-Q Local Address:Port  Peer Address:Port Process
LISTEN 0      244          0.0.0.0:5432       0.0.0.0:*
LISTEN 0      244             [::]:5432          [::]:*`,
          note: `<p>With <code>--network host</code>, <code>-p</code> flags are ignored (Docker prints a warning). With <code>container:pg</code>, the debug container sees pg's sockets: <code>localhost:5432</code> from netshoot <i>is</i> postgres, because they now share one namespace.</p>`
        },
        {
          t: "Custom subnets, internal networks, macvlan and ipvlan",
          lang: "sh",
          code: `# explicit subnet + gateway; an internal network has no route to the outside
docker network create --subnet 10.10.0.0/24 --gateway 10.10.0.1 --internal dbnet
# macvlan: containers get LAN IPs on the parent NIC (Linux, wired/promisc-friendly networks)
docker network create -d macvlan --subnet 192.168.1.0/24 --gateway 192.168.1.1 \\
  --ip-range 192.168.1.192/27 -o parent=eth0 lan
docker run -d --name printer-svc --network lan --ip 192.168.1.200 nginx:1.27-alpine
# ipvlan L2: same idea, shared MAC address
docker network create -d ipvlan --subnet 192.168.1.0/24 --gateway 192.168.1.1 \\
  -o parent=eth0 -o ipvlan_mode=l2 lan2
# overlay (needs swarm init first; details on Day 9)
docker network create -d overlay --attachable mesh`,
          note: `<p><code>--internal</code> is valuable for databases: containers on <code>dbnet</code> talk to each other but have no outbound Internet and cannot be published. <code>--ip-range</code> keeps Docker's IPAM inside a slice of the LAN your DHCP server does not hand out. Remember: the host cannot reach its own macvlan children unless you add a macvlan sub-interface on the host.</p>`
        },
        {
          t: "Clean up",
          lang: "sh",
          code: `docker rm -f web1 postgres pg api edge h printer-svc 2>/dev/null
docker network rm appnet frontend backend dbnet lan lan2 2>/dev/null
docker network prune -f`,
          out: `Deleted Networks:
…`,
          note: `<p>A network cannot be removed while containers are attached (<code>error … has active endpoints</code>). <code>docker network prune</code> removes all user-defined networks with no containers.</p>`
        }
      ],
      internals: `<p><b>Who does what.</b> <code>docker run</code> → <code>dockerd</code> → containerd → containerd-shim → <code>runc</code>. runc creates the new network namespace as part of <code>clone()</code>/<code>unshare()</code> with <code>CLONE_NEWNET</code> (the OCI spec lists a <code>network</code> namespace). Then <code>dockerd</code>'s <b>libnetwork</b> takes over through a prestart hook (historically <code>libnetwork-setkey</code>): the <b>sandbox</b> (the namespace, a file under <code>/var/run/docker/netns/&lt;id&gt;</code>) gets one <b>endpoint</b> per network the container joins. Sandbox, endpoint and network are the three concepts of Docker's Container Network Model (CNM).</p>
<p><b>Bridge driver steps per endpoint:</b></p>
<ul class="pts">
<li>IPAM picks a free IP from the network's subnet (default pools: 172.17.0.0/16 for <code>docker0</code>, then 172.18–172.31/16 and 192.168.0.0/16 in /20 chunks, configurable via <code>default-address-pools</code> in <code>daemon.json</code>).</li>
<li>netlink calls create <code>vethXXXX</code> + a peer; the peer is moved into the sandbox namespace, renamed <code>eth0</code> (or <code>eth1</code>, …), given the IP, a MAC derived from it, the MTU, and a default route via the bridge's gateway IP.</li>
<li>The host end is enslaved to the bridge (<code>ip link set vethXXXX master br-…</code>) and brought up.</li>
<li><code>/etc/hosts</code>, <code>/etc/resolv.conf</code> and <code>/etc/hostname</code> for the container are generated under <code>/var/lib/docker/containers/&lt;id&gt;/</code> and bind-mounted in. On user-defined networks resolv.conf gets <code>nameserver 127.0.0.11</code>; on the default bridge it gets a filtered copy of the host's (loopback resolvers like systemd-resolved's <code>127.0.0.53</code> are replaced with public fallbacks, because the host's loopback is unreachable from the container).</li>
</ul>
<p><b>Embedded DNS mechanics.</b> Inside each container namespace on a user-defined network, Docker installs iptables NAT rules that redirect UDP/TCP traffic for <code>127.0.0.11:53</code> to a random high port on which a resolver goroutine in <code>dockerd</code> listens <i>inside that namespace</i>. You can see them with <code>sudo nsenter -t $PID -n iptables -t nat -S</code> (look for <code>DOCKER_OUTPUT</code>/<code>DOCKER_POSTROUTING</code>). The resolver answers from libnetwork's service records for the networks this container is on; unknown names are forwarded to the host's configured DNS servers (or <code>--dns</code>). This is why name resolution survives container restarts with new IPs: the record is updated the moment the endpoint is created.</p>
<p><b>Host iptables.</b> Docker adds (in the <code>filter</code> table) chains <code>DOCKER</code>, <code>DOCKER-ISOLATION-STAGE-1/2</code> (drop traffic between different bridges) and <code>DOCKER-USER</code> (your place for custom rules; Docker never flushes it), and in the <code>nat</code> table <code>POSTROUTING -s 172.18.0.0/16 ! -o br-… -j MASQUERADE</code> for outbound NAT and the <code>DOCKER</code> chain for published-port DNAT. It also enables <code>net.ipv4.ip_forward=1</code>. Exact chain names have shifted between releases (Engine 28 reworked some of them) and Engine 29 introduces an opt-in nftables mode, so read the live rules with <code>iptables -S</code> / <code>nft list ruleset</code> rather than memorising them.</p>
<p><b>Inter-container traffic on one bridge</b> is pure L2 switching in the kernel: veth → bridge FDB lookup by MAC → veth. It does not traverse NAT. Whether it passes through iptables at all depends on <code>br_netfilter</code> (<code>net.bridge.bridge-nf-call-iptables</code>), which Docker enables so ICC rules can apply. <code>--icc=false</code> on the daemon (or <code>com.docker.network.bridge.enable_icc=false</code> per network) makes those rules drop container-to-container traffic.</p>
<p><b>Overlay in one paragraph.</b> Each overlay network gets its own namespace on every participating node containing a bridge and a <code>vxlan</code> interface with a VNI. Frames destined to a container on another node are encapsulated in UDP 4789 and sent to that node's IP; the peer MAC/IP mappings are distributed by the Swarm control plane (gossip on 7946/tcp+udp, management on 2377/tcp). Optional IPsec encryption (<code>--opt encrypted</code>). Day 9 goes deeper.</p>
<p><b>Docker Desktop.</b> All of the above happens inside a Linux VM. The host OS sees none of these bridges; published ports reach you through Desktop's own port-forwarding (vpnkit / its successor), which is why you cannot ping a container IP from macOS or Windows.</p>`,
      prod: `<p><b>The running example: React → FastAPI → Redis → PostgreSQL on one host.</b> A production-shaped layout uses two user-defined networks:</p>
<ul class="pts">
<li><code>edge</code>: <code>nginx</code> (serves the React build, reverse-proxies <code>/api</code> to <code>api:8000</code>) and <code>api</code>. Only nginx publishes ports (<code>-p 80:80 -p 443:443</code>).</li>
<li><code>data</code> (created with <code>--internal</code>): <code>api</code>, <code>redis</code>, <code>postgres</code>. Nothing on it is published; redis and postgres have no route to the Internet at all.</li>
<li>FastAPI reads <code>DATABASE_URL=postgresql+asyncpg://app:…@postgres:5432/app</code> and <code>REDIS_URL=redis://redis:6379/0</code>. The hostnames are container (or Compose service) names, resolved by 127.0.0.11. Moving to Swarm or Kubernetes later changes only how those names are provided (overlay + VIP, or a Service), not the application code.</li>
<li>Horizontal scaling: run three api containers with the same alias <code>api</code>; nginx resolves <code>api</code> to three IPs. Caveat: nginx caches DNS at startup unless you configure <code>resolver 127.0.0.11 valid=10s;</code> and use a variable in <code>proxy_pass</code>; otherwise new replicas are ignored and removed ones cause 502s.</li>
<li>Observability: <code>docker network inspect data</code> is your "who is on this network" source of truth; netshoot attached with <code>--network container:api</code> is the standard way to tcpdump the API's traffic without rebuilding the image.</li>
</ul>
<p><b>Typical incidents:</b> a teammate starts postgres with plain <code>docker run</code> (default bridge) and the API fails with "could not translate host name"; a corporate VPN uses 172.17/16 and Docker's bridge shadows it (fix: <code>bip</code> and <code>default-address-pools</code> in <code>daemon.json</code>); MTU mismatches on overlay or VPN links make small requests succeed and large responses hang (fix: set <code>com.docker.network.driver.mtu</code>).</p>`,
      iq: [
        ["dca", "A container on the default <code>bridge</code> network cannot resolve another container by name, but can ping its IP. Which change fixes this with the least effort?", "<p>Create a user-defined bridge (<code>docker network create appnet</code>) and attach both containers (<code>docker network connect appnet c1</code> / <code>c2</code>, or recreate them with <code>--network appnet</code>). User-defined networks get Docker's embedded DNS (127.0.0.11) with automatic name resolution. Wrong options: <code>--link</code> works but is a deprecated legacy feature; editing <code>/etc/hosts</code> by hand breaks on IP changes; publishing ports (<code>-p</code>) has nothing to do with name resolution.</p>"],
        ["dca", "Which network driver gives a container the host's network stack with no isolation, and what happens to <code>-p 8080:80</code> in that mode?", "<p><code>host</code>. The container shares the host's network namespace, so the process binds host ports directly; <code>-p</code>/<code>--publish</code> is ignored (Docker warns that published ports are discarded). <code>none</code> gives only loopback; <code>bridge</code> gives an isolated namespace with NAT; <code>macvlan</code> gives the container its own MAC/IP on the physical LAN, still a separate namespace.</p>"],
        ["dca", "Which TWO statements about Docker's embedded DNS are true? (A) It listens on 127.0.0.11 inside containers on user-defined networks. (B) It resolves container names on the default bridge network. (C) It forwards unknown names to the host's configured upstream resolvers. (D) It requires Swarm mode.", "<p><b>A and C.</b> B is false: the default bridge has no automatic name resolution. D is false: the embedded DNS works on any user-defined network on a single standalone engine; Swarm adds service VIPs on top but is not required.</p>"],
        ["dca", "What is the purpose of the overlay driver and which ports must be open between Swarm nodes for it to work?", "<p>Overlay creates a single L2 network spanning multiple Docker hosts by encapsulating frames in VXLAN. Commonly published requirements: TCP 2377 (cluster management, managers), TCP+UDP 7946 (node gossip/discovery), UDP 4789 (VXLAN data path), plus IP protocol 50 (ESP) if you use encrypted overlays. A tempting wrong answer is 2376, which is the Docker daemon's TLS API port, not overlay traffic.</p>"],
        ["mid", "What exactly is a veth pair and where are its two ends for a bridged container?", "<p>A pair of connected virtual Ethernet interfaces: a frame sent into one comes out of the other. For a bridged container, one end lives inside the container's network namespace as <code>eth0</code>; the other lives in the host's root namespace (named <code>vethXXXXXXX</code>) and is attached as a port of the Linux bridge (<code>docker0</code> or <code>br-&lt;id&gt;</code>). You can pair them by comparing <code>/sys/class/net/eth0/iflink</code> inside the container with interface indexes on the host.</p>"],
        ["mid", "Why can two containers both listen on port 80 at the same time, but two containers using <code>--network host</code> cannot?", "<p>Port numbers are per network namespace. Bridged containers each have their own namespace and therefore their own port 80. Host-network containers share the host's namespace, so the second <code>bind(:80)</code> fails with <code>EADDRINUSE</code>, exactly as two ordinary processes on the host would.</p>"],
        ["senior", "How would you debug connectivity from a distroless FastAPI container that has no shell, ping or curl?", "<p>Attach a tools container to its namespace: <code>docker run --rm -it --network container:api nicolaka/netshoot</code>, then use <code>dig</code>, <code>curl</code>, <code>ss</code>, <code>tcpdump</code>; because you share the namespace you see exactly what the API sees, including its <code>localhost</code>. Alternatively on the host: <code>nsenter -t $(docker inspect -f '{{.State.Pid}}' api) -n ss -tnp</code>. Note that <code>container:</code> shares only the network namespace; the debug container's resolv.conf comes from the target, so DNS behaviour matches too.</p>"],
        ["senior", "When would you choose macvlan or ipvlan over a bridge network, and what are the trade-offs?", "<p>When containers must be first-class citizens on the physical LAN: legacy systems expecting a fixed IP, network appliances, multicast/broadcast discovery, or avoiding NAT overhead. Trade-offs: requires control of the LAN subnet and IP planning; macvlan needs the switch/hypervisor to allow multiple MACs (often blocked in cloud VPCs and on Wi-Fi); the host cannot talk to its own macvlan containers without extra config; no Docker DNS benefits for LAN clients; no port mapping, so every container port is exposed on the LAN. ipvlan L2 avoids the MAC limit; ipvlan L3 avoids broadcast domains and routes instead.</p>"],
        ["architect", "How do Docker networks map to concepts you will meet in Kubernetes and cloud VPCs?", "<p>Network namespace per container ≈ per Pod (Kubernetes shares one namespace across the pod's containers, like <code>--network container:</code>). User-defined bridge with embedded DNS ≈ cluster DNS (CoreDNS) + Services, but Kubernetes gives each Service a stable virtual IP instead of DNS round-robin. Bridge isolation/<code>--internal</code> ≈ NetworkPolicies and private subnets. Overlay/VXLAN ≈ the CNI plugin's pod network (Flannel VXLAN, Calico, cloud-native routing). Published ports ≈ NodePort/LoadBalancer. Understanding the Docker version makes the Kubernetes one much less magical.</p>"]
      ],
      gotchas: [
        "<b><code>localhost</code> is per-container.</b> <code>127.0.0.1</code> inside any bridged container is its own loopback. It is never the host and never a neighbour container. This single fact explains most \"works on my laptop, fails in Docker\" bugs.",
        "<b>The default bridge is a trap.</b> No name DNS, everything unattached shares it, and options like custom subnets are daemon-wide. Docker's own docs recommend user-defined bridges for anything real. Compose always creates a project network, which is why Compose \"just works\" while ad-hoc <code>docker run</code> does not.",
        "<b>Container IPs change</b> whenever a container is recreated (and can change on restart if another container took the address). Never put container IPs in config files; use names.",
        "<b>Docker Desktop hides the plumbing.</b> On macOS/Windows there is no <code>docker0</code> on your machine and you cannot reach <code>172.x</code> container IPs directly; use published ports. <code>--network host</code> historically meant the VM's network, not your Mac's.",
        "<b>Subnet collisions.</b> If a VPN, office LAN or cloud VPC already uses 172.17–172.31 or 192.168.x, Docker networks can hijack routes and make remote hosts unreachable. Set <code>bip</code> and <code>default-address-pools</code> in <code>/etc/docker/daemon.json</code> before creating networks.",
        "<b>Clients that cache DNS.</b> nginx, the JVM and some connection pools resolve a hostname once. If the target container is recreated with a new IP they keep using the old one. Configure re-resolution (nginx <code>resolver 127.0.0.11 valid=10s</code>), or rely on stable names plus reconnect logic.",
        "<b>Name resolution needs a shared network.</b> Being on the same <i>host</i> is irrelevant. Two containers on different user-defined networks cannot resolve or reach each other until one is connected to the other's network.",
        "<b><code>ip netns</code> shows nothing</b> for Docker containers because their namespace handles live in <code>/var/run/docker/netns</code>. Use <code>nsenter -t &lt;pid&gt; -n</code> or symlink the file into <code>/var/run/netns</code>.",
        "<b>MTU</b>: overlay (VXLAN adds ~50 bytes) and VPN links reduce the usable MTU. If TLS handshakes or large responses hang while small pings work, suspect MTU and set <code>com.docker.network.driver.mtu</code>."
      ],
      best: [
        "Create one user-defined network per application (Compose does this for you) and attach only the containers that need to talk.",
        "Split tiers with multiple networks: a public-facing network for the reverse proxy and API, an <code>--internal</code> data network for Redis and PostgreSQL.",
        "Address services by name or alias (<code>postgres</code>, <code>redis</code>, <code>db</code>), injected through environment variables; never by IP.",
        "Plan address space up front on servers: configure <code>default-address-pools</code> so Docker never overlaps corporate or VPC ranges.",
        "Keep debugging tools out of production images; use <code>--network container:&lt;name&gt; nicolaka/netshoot</code> or <code>nsenter</code> when you need them.",
        "Use <code>host</code> networking only for a specific reason (very high packet rates, software that must see host interfaces) and document it; it removes isolation."
      ],
      lab: [
        "Run <code>docker run -d --name a nginx:1.27-alpine</code> and <code>docker run --rm busybox:1.36 ping -c1 a</code>. Observe <code>bad address 'a'</code>. Ping it by IP instead (<code>docker inspect -f '{{.NetworkSettings.IPAddress}}' a</code>).",
        "Create <code>docker network create labnet</code>, then <code>docker network connect labnet a</code>. Run <code>docker run --rm --network labnet busybox:1.36 nslookup a</code> and confirm the server is <code>127.0.0.11</code>.",
        "On a Linux host (or inside the Desktop VM), find the bridge with <code>ip link | grep br-</code>, list its ports with <code>bridge link</code>, and match container <code>a</code>'s <code>eth0@ifN</code> (via <code>nsenter -t $PID -n ip link</code>) to the host-side veth.",
        "Create two networks <code>front</code> and <code>back</code>. Put <code>busybox sleep 3600</code> containers <code>x</code> on front, <code>z</code> on back, and <code>y</code> on both. Show that x↔y and y↔z resolve and ping, but x↔z does not.",
        "Start <code>docker run --rm --network none busybox:1.36 ip addr</code> and <code>docker run --rm --network container:a busybox:1.36 wget -qO- localhost</code>. Explain why the second one returns nginx's welcome page.",
        "<b>Done when:</b> you can draw, from memory, container A's eth0 → veth → bridge → veth → container B's eth0, state where 127.0.0.11 lives and what it answers, and explain why x could not reach z."
      ],
      teach: `<p>"Every container gets its own network namespace: its own interfaces, its own routing table, its own ports and, crucially, its own <code>localhost</code>. Docker connects that namespace to the host with a veth pair, which is a virtual cable. One end is <code>eth0</code> in the container; the other end plugs into a Linux bridge on the host, which is just a software switch. Containers on the same bridge talk directly at layer 2; traffic to the Internet is NATed through the host.</p>
<p>There are two kinds of bridge network. The default one, <code>docker0</code>, has no name resolution. User-defined ones, which Compose creates automatically, run Docker's embedded DNS at 127.0.0.11, so you can say <code>postgres</code> instead of an IP. A container can be on several networks, and that's how you isolate tiers: nginx and the API on one network, the API, Redis and Postgres on another.</p>
<p>Other drivers: <code>host</code> shares the host's stack with no isolation, <code>none</code> has only loopback, overlay stretches a network across hosts with VXLAN, and macvlan/ipvlan put containers straight onto the physical LAN. If you remember one thing: names, not IPs, on a user-defined network, and localhost means 'me'."</p>`
    },
    {
      id: "d3-ports",
      title: "Ports, publishing and connectivity (why localhost:5432 fails)",
      lv: ["fresher", "mid", "senior", "dca"],
      eli5: `<p>Your apartment (container) has a door bell on extension 80, but the outside world only knows the building's street address (the host IP). <b>Publishing a port</b> is telling reception: "anyone who rings the building on 8080, put them through to apartment 3 on extension 80". Without that rule, outsiders can never reach the apartment, however loudly it listens.</p>
<p>Neighbours inside the building do not need reception at all. They walk down the corridor (the bridge network) and knock on apartment 3's door directly, using the door number the tenant actually listens on (80), not the reception number (8080).</p>
<p>A sign on the door saying "I answer on 80" (<code>EXPOSE</code>) is just a sign. It does not create a forwarding rule. And if the tenant only listens to the phone inside the bedroom (binds 127.0.0.1), nobody else, not neighbours and not reception, can reach them.</p>
<p>The classic mistake: the API tenant tries to call the database by dialling "0" (localhost). That rings the API's own apartment, where nobody is listening on 5432. They needed to dial "postgres", the name in the building directory.</p>`,
      what: `<p><b>Port publishing</b> (<code>-p</code> / <code>--publish</code>) maps a port on the host to a port in a container's network namespace so that clients <i>outside</i> the container's network (your browser, other machines) can reach it. It is only needed for traffic entering from the host side. Containers on the same user-defined network reach each other directly on the <b>container port</b>, with no publishing.</p>
<h5>Publish syntax</h5>
<ul class="pts">
<li><code>-p 8080:80</code>: host port 8080 on <b>all host interfaces</b> (0.0.0.0, and <code>[::]</code> when IPv6 is available) → container port 80/tcp. Format is always <code>HOST:CONTAINER</code>.</li>
<li><code>-p 127.0.0.1:8080:80</code>: bind only on the host's loopback, so only processes on the host can connect. The right default for databases and admin UIs on developer machines and servers.</li>
<li><code>-p 80</code>: container port 80 → a random ephemeral host port; see it with <code>docker port</code>.</li>
<li><code>-p 5353:53/udp</code>: UDP. Protocol defaults to TCP; to publish both, give two flags (<code>-p 53:53/tcp -p 53:53/udp</code>).</li>
<li><code>-p 8000-8010:8000-8010</code>: ranges.</li>
<li><code>-P</code> / <code>--publish-all</code>: publish every port declared by <code>EXPOSE</code> in the image (and <code>--expose</code>) to random host ports.</li>
<li>Long form (also in Compose): <code>--publish published=8080,target=80,protocol=tcp</code>; Swarm adds <code>mode=ingress|host</code>.</li>
</ul>
<h5>EXPOSE is documentation</h5>
<p><code>EXPOSE 8000</code> in a Dockerfile records metadata in the image config (<code>Config.ExposedPorts</code>). It does <b>not</b> open, publish or firewall anything. Its only effects: tooling can read it, and <code>-P</code> uses it. A container is reachable on its network on any port the process listens on, EXPOSEd or not.</p>
<h5>The four directions of traffic</h5>
<ul class="pts">
<li><b>Host → container</b>: use the published port: <code>curl localhost:8080</code>. On Linux the host can also reach container IPs directly (<code>curl 172.18.0.3:80</code>) because the bridge gateway is a host interface; on Docker Desktop it cannot.</li>
<li><b>Container → container</b> (same user-defined network): use the <b>name and the container port</b>: <code>postgres:5432</code>, <code>api:8000</code>. Not <code>localhost</code>, not the published host port.</li>
<li><b>Container → host</b>: the host is not <code>localhost</code>. On Docker Desktop use <code>host.docker.internal</code> (built in). On Linux add <code>--add-host host.docker.internal:host-gateway</code> (Compose: <code>extra_hosts: ["host.docker.internal:host-gateway"]</code>); <code>host-gateway</code> resolves to the bridge gateway IP (e.g. 172.17.0.1). The host service must listen on an address reachable from the bridge (0.0.0.0 or the gateway IP), not only 127.0.0.1, and the host firewall must allow it.</li>
<li><b>Container → Internet</b>: works by default via MASQUERADE; no configuration needed.</li>
</ul>
<h5>Binding inside the container: 0.0.0.0 vs 127.0.0.1</h5>
<p>Published traffic arrives at the container's <code>eth0</code> address, not at its loopback. A server that binds <code>127.0.0.1</code> inside the container accepts connections only from inside that same namespace, so the published port connects and then is immediately reset ("connection reset by peer" / "empty reply from server"). Dev servers often default to loopback: <code>uvicorn main:app</code> (127.0.0.1), <code>vite</code> (localhost), <code>flask run</code>. In containers run <code>uvicorn main:app --host 0.0.0.0 --port 8000</code> and <code>vite --host 0.0.0.0</code>. The official postgres and redis images already listen on all interfaces.</p>
<h5>Why <code>FastAPI → localhost:5432</code> fails and <code>FastAPI → postgres:5432</code> works</h5>
<p>On your laptop, PostgreSQL and FastAPI were the same machine, so <code>localhost:5432</code> worked. In Docker they are two network namespaces. From inside the api container, <code>localhost</code> resolves to 127.0.0.1 <i>in api's namespace</i>; nothing listens on 5432 there, so the kernel answers the SYN with RST: <b>connection refused</b>. Publishing <code>-p 5432:5432</code> on postgres does not help, because that maps the <i>host's</i> port, and the host's loopback is not api's loopback. <code>postgres:5432</code> works because the embedded DNS resolves <code>postgres</code> to the postgres container's IP on the shared user-defined network, and postgres listens on 0.0.0.0:5432 there. The investigation in the commands below proves every link of that chain.</p>`,
      why: `<p>Isolation is the default: a container's network namespace is unreachable from outside the host until you say otherwise. That is safe, but web apps need a front door. Port publishing exists to open exactly the doors you choose, mapping them to whatever host port is free, so that ten containers can all listen on 80 internally while being exposed on 8081–8090, or not at all.</p>
<p>Before containers you configured each daemon's listen address and port and maintained firewall rules by hand. With Docker the decision moves to deploy time (<code>-p</code>/<code>ports:</code>), lives next to the service definition, and the plumbing (DNAT rules, proxies) is generated and removed automatically with the container.</p>
<p>The <code>localhost</code> confusion exists because developers carry a single-machine mental model into a multi-namespace world. Learning to ask "<i>which</i> network namespace am I in, and which address is this name resolving to from there?" is the same skill you need for Kubernetes pods, service meshes and VPC routing.</p>`,
      diagram: {
        html: flow([["Browser on host / LAN", "http://192.168.1.20:8080", "w"], ["Host eth0 :8080", "iptables nat PREROUTING → DOCKER"], ["DNAT", "→ 172.18.0.4:80"], ["br-… bridge", "forward to veth"], ["nginx container", "eth0 172.18.0.4:80 (bound 0.0.0.0)", "g"]]) +
          flow([["api container", "connect localhost:5432", "r"], ["api's own lo", "nothing listens"], ["RST", "Connection refused", "r"]]) +
          flow([["api container", "connect postgres:5432", "g"], ["127.0.0.11", "postgres → 172.18.0.2"], ["bridge", "no NAT, no -p needed"], ["postgres", "0.0.0.0:5432", "g"]]),
        steps: [
          "<code>docker run -p 8080:80 nginx</code> makes dockerd add a DNAT rule in the <code>nat</code> table's <code>DOCKER</code> chain: TCP dport 8080 → 172.18.0.4:80, plus a filter rule accepting the forwarded traffic. It may also start a <code>docker-proxy</code> process listening on :8080.",
          "A packet from the LAN hits the host's eth0 on :8080. In PREROUTING the kernel rewrites the destination to 172.18.0.4:80 and routes it into the bridge; conntrack remembers the mapping so replies are rewritten back.",
          "Traffic from the host itself to <code>localhost:8080</code> does not pass PREROUTING; it is handled by the OUTPUT chain DNAT rule or by <code>docker-proxy</code>, which accepts the connection and opens a new one to the container.",
          "Inside the api container <code>localhost:5432</code> is api's own loopback: no listener, so the kernel replies RST and asyncpg/psycopg reports \"Connection refused\".",
          "<code>postgres:5432</code> is resolved by the embedded DNS to postgres's IP on the shared network and the SYN travels veth → bridge → veth directly to postgres, which listens on 0.0.0.0:5432. Published ports are irrelevant to this path."
        ]
      },
      cmds: [
        {
          t: "Publish ports and see the mappings",
          lang: "sh",
          code: `docker run -d --name web -p 8080:80 nginx:1.27-alpine
docker run -d --name web-local -p 127.0.0.1:8081:80 nginx:1.27-alpine
docker run -d --name web-rand -P nginx:1.27-alpine
docker port web
docker port web-rand
docker ps --format 'table {{.Names}}\\t{{.Ports}}'
curl -sI http://localhost:8080 | head -1`,
          out: `80/tcp -> 0.0.0.0:8080
80/tcp -> [::]:8080
80/tcp -> 0.0.0.0:32768
80/tcp -> [::]:32768
NAMES       PORTS
web-rand    0.0.0.0:32768->80/tcp, [::]:32768->80/tcp
web-local   127.0.0.1:8081->80/tcp
web         0.0.0.0:8080->80/tcp, [::]:8080->80/tcp
HTTP/1.1 200 OK`,
          note: `<p><code>-P</code> worked because the nginx image has <code>EXPOSE 80</code>. Random host ports come from the kernel's ephemeral range (<code>/proc/sys/net/ipv4/ip_local_port_range</code>). <code>web-local</code> is reachable from the host but not from other machines.</p>`
        },
        {
          t: "EXPOSE is only metadata",
          lang: "sh",
          code: `docker image inspect -f '{{json .Config.ExposedPorts}}' nginx:1.27-alpine
# a container is reachable on any listening port by its network peers, EXPOSEd or not
docker network create porttest
docker run -d --name raw --network porttest python:3.12-slim python -m http.server 9000
docker run --rm --network porttest busybox:1.36 wget -qO- http://raw:9000 | head -3`,
          out: `{"80/tcp":{}}
<!DOCTYPE HTML>
<html lang="en">
<head>`,
          note: `<p>The python image declares no <code>EXPOSE 9000</code>, yet a peer on the same network reaches it. <code>EXPOSE</code> neither opens nor restricts anything.</p>`
        },
        {
          t: "UDP publishing",
          lang: "sh",
          code: `docker run -d --name dns -p 5353:53/udp -p 5353:53/tcp coredns/coredns:1.11.1
docker port dns`,
          out: `53/tcp -> 0.0.0.0:5353
53/udp -> 0.0.0.0:5353
…`,
          note: `<p>Without <code>/udp</code> only TCP is mapped and UDP clients time out silently, a common mistake with DNS, syslog, StatsD and game servers.</p>`
        },
        {
          t: "Under the hood: iptables DNAT and docker-proxy (Linux host)",
          lang: "sh",
          code: `sudo iptables -t nat -S DOCKER
sudo iptables -t nat -S POSTROUTING | grep MASQUERADE
sudo iptables -S DOCKER-USER
ps -ef | grep [d]ocker-proxy
sudo ss -lntp | grep 8080
sudo conntrack -L -p tcp --dport 8080 2>/dev/null | head -2`,
          out: `-N DOCKER
-A DOCKER ! -i docker0 -p tcp -m tcp --dport 8080 -j DNAT --to-destination 172.17.0.2:80
-A DOCKER ! -i docker0 -p tcp -m tcp --dport 32768 -j DNAT --to-destination 172.17.0.4:80
-A POSTROUTING -s 172.17.0.0/16 ! -o docker0 -j MASQUERADE
-N DOCKER-USER
-A DOCKER-USER -j RETURN
root  4121  1  0 10:02 ?  00:00:00 /usr/bin/docker-proxy -proto tcp -host-ip 0.0.0.0 -host-port 8080 -container-ip 172.17.0.2 -container-port 80
LISTEN 0 4096 0.0.0.0:8080 0.0.0.0:* users:(("docker-proxy",pid=4121,fd=4))`,
          note: `<p>The DNAT rule handles traffic arriving from outside; <code>docker-proxy</code> (the "userland proxy") holds the host port so nothing else can take it and serves cases the DNAT rule cannot, such as some loopback/hairpin connections. It can be disabled with <code>"userland-proxy": false</code> in <code>daemon.json</code>, in which case hairpin NAT rules are used instead. Exact rule text varies by Engine version (28.x restructured chains; 29.x can use nftables).</p>`
        },
        {
          t: "Bind address inside the container: 127.0.0.1 vs 0.0.0.0",
          lang: "sh",
          code: `docker run -d --name bad  -p 8001:8000 python:3.12-slim python -m http.server 8000 --bind 127.0.0.1
docker run -d --name good -p 8002:8000 python:3.12-slim python -m http.server 8000 --bind 0.0.0.0
curl -s -o /dev/null -w '%{http_code}\\n' http://localhost:8001
curl -s -o /dev/null -w '%{http_code}\\n' http://localhost:8002
docker exec bad python -c "import urllib.request;print(urllib.request.urlopen('http://127.0.0.1:8000').status)"`,
          out: `000
curl: (56) Recv failure: Connection reset by peer
200
200`,
          note: `<p>The "bad" server works from inside its own container (loopback) but is unreachable through the published port, because DNATed packets arrive on <code>eth0</code>. Uvicorn defaults to 127.0.0.1, so a FastAPI Dockerfile must say <code>CMD ["uvicorn","app.main:app","--host","0.0.0.0","--port","8000"]</code>.</p>`
        },
        {
          t: "Container → host: host.docker.internal",
          lang: "sh",
          code: `# a service on the host, e.g. a local mock on :9000 bound to 0.0.0.0
# Docker Desktop: works out of the box
docker run --rm curlimages/curl:8.10.1 -s http://host.docker.internal:9000/health
# Linux Engine: map the name to the bridge gateway
docker run --rm --add-host host.docker.internal:host-gateway curlimages/curl:8.10.1 -s http://host.docker.internal:9000/health
docker run --rm --add-host host.docker.internal:host-gateway busybox:1.36 grep host.docker /etc/hosts`,
          out: `{"status":"ok"}
{"status":"ok"}
172.17.0.1	host.docker.internal`,
          note: `<p><code>host-gateway</code> is a special value the daemon replaces with the default bridge's gateway IP (configurable via <code>host-gateway-ip</code> in <code>daemon.json</code>). If the host service listens only on 127.0.0.1, the request still fails: the packet arrives on <code>docker0</code>, not on the host's loopback. Compose equivalent: <code>extra_hosts: ["host.docker.internal:host-gateway"]</code>.</p>`
        },
        {
          t: "Investigation, part 1: reproduce the failure (FastAPI → localhost:5432)",
          lang: "sh",
          code: `docker network create appnet
docker run -d --name postgres --network appnet -p 5432:5432 \\
  -e POSTGRES_USER=app -e POSTGRES_PASSWORD=secret -e POSTGRES_DB=app postgres:16
# the api image contains FastAPI + asyncpg; DATABASE_URL is the bug
docker run -d --name api --network appnet -p 8000:8000 \\
  -e DATABASE_URL=postgresql://app:secret@localhost:5432/app myorg/api:1.0
curl -s localhost:8000/health/db
docker logs api --tail 5`,
          out: `{"detail":"database unavailable"}
  File "/usr/local/lib/python3.12/site-packages/asyncpg/connect_utils.py", line …, in _create_ssl_connection
  …
OSError: Multiple exceptions: [Errno 111] Connect call failed ('127.0.0.1', 5432), [Errno 99] Cannot assign requested address
ERROR:    Application startup failed. Exiting.`,
          note: `<p>Read the error precisely: <code>Connect call failed ('127.0.0.1', 5432)</code>, errno 111 = ECONNREFUSED. The name resolved fine (to the loopback); the TCP connection was refused because nothing listens on 5432 <i>in this namespace</i>. With psycopg the message is <code>connection to server at "localhost" (127.0.0.1), port 5432 failed: Connection refused</code>. Also note that <code>-p 5432:5432</code> on postgres changed nothing for the api: it only opened the host's port.</p>`
        },
        {
          t: "Investigation, part 2: what does each name resolve to, from inside api?",
          lang: "sh",
          code: `docker exec api cat /etc/resolv.conf
docker exec api getent hosts localhost
docker exec api getent hosts postgres
# slim images have no nslookup/ss; borrow a namespace-sharing debug container
docker run --rm --network container:api nicolaka/netshoot nslookup postgres
docker run --rm --network container:api nicolaka/netshoot ss -lnt
docker run --rm --network container:api nicolaka/netshoot nc -zv localhost 5432
docker run --rm --network container:api nicolaka/netshoot nc -zv postgres 5432`,
          out: `nameserver 127.0.0.11
options ndots:0
::1             localhost
172.19.0.2      postgres
Server:         127.0.0.11
Address:        127.0.0.11#53

Non-authoritative answer:
Name:   postgres
Address: 172.19.0.2

State  Recv-Q Send-Q Local Address:Port  Peer Address:Port
LISTEN 0      2048         0.0.0.0:8000       0.0.0.0:*
nc: connect to localhost (::1) port 5432 (tcp) failed: Connection refused
nc: connect to localhost (127.0.0.1) port 5432 (tcp) failed: Connection refused
Connection to postgres (172.19.0.2) 5432 port [tcp/postgresql] succeeded!`,
          note: `<p>This is the proof. In api's namespace the only listener is uvicorn on :8000; <code>localhost:5432</code> is refused on both ::1 and 127.0.0.1; <code>postgres</code> resolves via 127.0.0.11 to 172.19.0.2 and port 5432 is open there. <code>getent</code> exists in Debian-based images (libc-bin) and uses the same resolver path as Python, so it is more faithful than <code>nslookup</code>, which bypasses <code>/etc/hosts</code>.</p>`
        },
        {
          t: "Investigation, part 3: confirm both containers share the network, then fix",
          lang: "sh",
          code: `docker network inspect appnet --format '{{range .Containers}}{{.Name}} {{.IPv4Address}}{{println}}{{end}}'
docker inspect -f '{{json .NetworkSettings.Networks}}' postgres | head -c 300; echo
# the fix: use the service name and the CONTAINER port
docker rm -f api
docker run -d --name api --network appnet -p 8000:8000 \\
  -e DATABASE_URL=postgresql://app:secret@postgres:5432/app myorg/api:1.0
curl -s localhost:8000/health/db
# and stop exposing the database on the host unless you really need it
docker rm -f postgres   # recreate without -p, or with -p 127.0.0.1:5432:5432 for local psql`,
          out: `api 172.19.0.3/16
postgres 172.19.0.2/16
{"appnet":{"IPAMConfig":null,"Links":null,"Aliases":["postgres"],"NetworkID":"7c1e…","IPAddress":"172.19.0.2",…
{"database":"ok","server_version":"16.4"}`,
          note: `<p>If <code>network inspect</code> had shown postgres missing (for example it was started without <code>--network</code> and sits on the default bridge), the symptom would change to a DNS failure: <code>socket.gaierror: [Errno -2] Name or service not known</code> / psycopg <code>could not translate host name "postgres" to address</code>. Fix that with <code>docker network connect appnet postgres</code>. Two distinct errors, two distinct root causes: "refused" means the name resolved but nobody listens there; "name not known" means no shared user-defined network (or a typo).</p>`
        }
      ],
      internals: `<p><b>What <code>-p</code> does at container start.</b> After libnetwork creates the endpoint, the bridge driver programs port mappings for it:</p>
<ul class="pts">
<li><b>NAT table, PREROUTING → DOCKER chain:</b> <code>-p tcp --dport 8080 -j DNAT --to-destination 172.18.0.4:80</code> (with <code>! -i br-…</code> so traffic from the bridge itself is not looped). The PREROUTING jump only matches packets addressed to local addresses (<code>-m addrtype --dst-type LOCAL</code>).</li>
<li><b>NAT table, OUTPUT:</b> a similar jump so connections originated on the host to its own IPs are DNATed too (loopback destinations are excluded unless the proxy is disabled, see below).</li>
<li><b>Filter table, FORWARD → DOCKER chain:</b> an ACCEPT for the DNATed destination port on the bridge; everything else forwarded to containers is dropped unless it is a reply (conntrack <code>RELATED,ESTABLISHED</code>).</li>
<li><b><code>docker-proxy</code></b>: one small process per published port/protocol/address family, which <code>bind()</code>s the host port (reserving it, so <code>ss</code> shows it) and proxies connections that do not traverse the DNAT path, chiefly connections from the host to <code>127.0.0.1:8080</code> (the kernel will not route loopback-sourced packets to another interface unless <code>route_localnet</code> is enabled) and hairpin connections from a container to its own published port. With <code>"userland-proxy": false</code> Docker sets <code>route_localnet</code> and adds hairpin MASQUERADE rules instead.</li>
</ul>
<p><b>Replies</b> are un-NATed by conntrack: the kernel remembers the original tuple, so the response from 172.18.0.4:80 leaves the host with source host-IP:8080. You can watch entries with <code>conntrack -L</code>. Removing the container removes the rules and stops the proxy.</p>
<p><b>Why <code>-p</code> bypasses ufw/firewalld rules.</b> DNAT happens in PREROUTING and the traffic is then <i>forwarded</i> (FORWARD chain), never reaching the INPUT chain where ufw's "deny 8080" lives. So a published port is reachable from the Internet even if ufw "blocks" it. Restrict with <code>-p 127.0.0.1:…</code>, a cloud security group, or rules in <code>DOCKER-USER</code> (evaluated before Docker's own forward rules), e.g. <code>iptables -I DOCKER-USER -i eth0 ! -s 10.0.0.0/8 -j DROP</code>.</p>
<p><b>Inside the container</b>, a published packet arrives with destination 172.18.0.4:80 on <code>eth0</code>. The server's socket must be bound to 0.0.0.0 (or that IP) to accept it. The source address the container sees is the real client IP for external traffic (DNAT keeps the source), but it is the bridge gateway when the connection went through <code>docker-proxy</code>. That is why access logs sometimes show <code>172.17.0.1</code> for every request.</p>
<p><b>Embedded DNS and <code>localhost</code>.</b> <code>localhost</code> is never sent to DNS: glibc reads <code>/etc/hosts</code> first (per <code>/etc/nsswitch.conf</code>), and Docker's generated <code>/etc/hosts</code> maps it to 127.0.0.1 and ::1. The container's <code>/etc/hosts</code> also contains its own hostname and IP. Every other name goes to 127.0.0.11, answered by dockerd from the network's service records.</p>
<p><b>Docker Desktop</b> adds a layer: the host's port 8080 is opened by Desktop's host-side process and forwarded into the VM, where the iptables/proxy mechanism above applies. <code>host.docker.internal</code> is resolved by Desktop's DNS to an address that reaches the real host OS.</p>`,
      prod: `<p><b>Production port policy for React → FastAPI → Redis → PostgreSQL:</b></p>
<ul class="pts">
<li>Only the edge publishes: nginx/Traefik/Caddy with <code>-p 80:80 -p 443:443</code>. It serves the React static build and proxies <code>/api/</code> to <code>http://api:8000</code> by name over the internal network.</li>
<li>FastAPI: no published port in production (reached only via the proxy). Uvicorn/Gunicorn binds <code>0.0.0.0:8000</code> inside the container. Run behind the proxy with <code>--proxy-headers --forwarded-allow-ips</code> set to the proxy's network so request IPs and scheme are correct.</li>
<li>PostgreSQL and Redis: never published to <code>0.0.0.0</code>. If an operator needs <code>psql</code>, either <code>docker exec -it postgres psql</code>, or publish <code>127.0.0.1:5432:5432</code> and tunnel over SSH. Thousands of Redis and Postgres instances have been compromised because <code>-p 6379:6379</code> bypassed the firewall.</li>
<li>Config: <code>DATABASE_URL=postgresql+asyncpg://app:…@postgres:5432/app</code>, <code>REDIS_URL=redis://redis:6379/0</code>. Same code runs in Compose, Swarm (service names via VIP) and Kubernetes (Service DNS); only the hostnames' providers change.</li>
<li>Local development: the API may need a service running on the developer's machine (a mock, an IDE debugger, a locally-run Postgres). Use <code>host.docker.internal</code>, plus <code>extra_hosts: host-gateway</code> so the same Compose file works on Linux.</li>
<li>Health checks and readiness: the API should retry DB connections at startup (or Compose <code>depends_on: condition: service_healthy</code>, Day 5), because "connection refused" also happens in the seconds before Postgres starts listening.</li>
</ul>`,
      iq: [
        ["dca", "A Dockerfile contains <code>EXPOSE 8000</code>. The container is started with <code>docker run -d myapi</code>. Can a browser on the host reach it at <code>localhost:8000</code>?", "<p>No. <code>EXPOSE</code> only records metadata; nothing is published without <code>-p</code> or <code>-P</code>. Fix: <code>docker run -d -p 8000:8000 myapi</code>, or <code>-P</code> to map exposed ports to random host ports (then check <code>docker port</code>). Tempting wrong answer: \"yes, EXPOSE opens the port\". It does not; it also does not restrict ports, since containers on the same network can reach any listening port.</p>"],
        ["dca", "Which command shows the host port that container port 80 of container <code>web</code> was mapped to after <code>docker run -P</code>?", "<p><code>docker port web</code> (or <code>docker port web 80</code>). <code>docker ps</code> also shows it in the PORTS column, and <code>docker inspect -f '{{json .NetworkSettings.Ports}}' web</code> gives the raw data. <code>docker network inspect</code> shows IPs, not port mappings.</p>"],
        ["dca", "Which TWO commands publish container port 53 for UDP? (A) <code>-p 53:53</code> (B) <code>-p 53:53/udp</code> (C) <code>--publish published=53,target=53,protocol=udp</code> (D) <code>--expose 53/udp</code>", "<p><b>B and C.</b> A publishes TCP only (TCP is the default). D only adds metadata like EXPOSE; it publishes nothing unless combined with <code>-P</code>.</p>"],
        ["dca", "You must ensure a container's admin port 9000 is reachable only from the Docker host itself. Which option is correct?", "<p><code>-p 127.0.0.1:9000:9000</code>. Binding the host-side to loopback means no remote host can connect. Relying on ufw to block 9000 is wrong because published ports are DNATed in PREROUTING and forwarded, bypassing INPUT-chain rules. Not publishing at all would also prevent the host from reaching it via localhost (on Linux the host could still use the container IP).</p>"],
        ["mid", "FastAPI in container <code>api</code> uses <code>DATABASE_URL=…@localhost:5432/app</code> and fails with <code>Connect call failed ('127.0.0.1', 5432)</code>, even though PostgreSQL runs in container <code>postgres</code> with <code>-p 5432:5432</code>. Explain and fix.", "<p>Each container has its own network namespace and loopback. <code>localhost</code> in api is api itself; nothing listens on 5432 there, so the kernel refuses the connection. The <code>-p</code> flag opened the <i>host's</i> port 5432, which is a different namespace again. Fix: put both on the same user-defined network and use <code>postgres:5432</code> (container name and container port). Verify with <code>docker exec api getent hosts postgres</code> and <code>docker network inspect appnet</code>. Remove <code>-p 5432:5432</code> unless something outside Docker needs it.</p>"],
        ["mid", "What is the difference between \"Connection refused\" and \"Name or service not known\" when connecting to <code>postgres:5432</code> from a container?", "<p>\"Name or service not known\" (<code>gaierror</code>, \"could not translate host name\") is a DNS failure: the container is not on a user-defined network shared with a container/alias named <code>postgres</code>, or the name is misspelled, or it is on the default bridge. \"Connection refused\" means the name resolved to an IP but nothing accepted on that port: Postgres not started yet, listening on a different port, or bound to 127.0.0.1 only. They point to different layers, so read the error before changing config.</p>"],
        ["mid", "<code>curl localhost:8000</code> from the host returns \"Connection reset by peer\" although <code>docker ps</code> shows <code>0.0.0.0:8000-&gt;8000/tcp</code>. The app logs show it started. What is the likely cause?", "<p>The server inside the container listens on <code>127.0.0.1:8000</code> (Uvicorn's default) instead of <code>0.0.0.0</code>. The published port's proxy/DNAT reaches the container's <code>eth0</code>, where nothing listens. Fix: <code>uvicorn app.main:app --host 0.0.0.0 --port 8000</code>. Check with <code>docker run --rm --network container:api nicolaka/netshoot ss -lnt</code>.</p>"],
        ["senior", "Why do access logs inside a published container sometimes show every client as <code>172.17.0.1</code>, and how do you get real client IPs?", "<p>When a connection goes through <code>docker-proxy</code> (e.g. from the host's loopback or certain hairpin paths), the proxy opens a fresh connection from the bridge gateway, so the source is the gateway IP. Traffic DNATed by iptables keeps the real source. In production put a reverse proxy at the edge and pass <code>X-Forwarded-For</code>/<code>Forwarded</code> or PROXY protocol; configure FastAPI/Uvicorn <code>--proxy-headers</code> with trusted <code>--forwarded-allow-ips</code>. Setting <code>userland-proxy: false</code> changes behaviour for some paths but is not a substitute for proper forwarding headers.</p>"],
        ["senior", "How do you let a container on Linux reach a service running on the host, in a way that also works on Docker Desktop?", "<p>Use the hostname <code>host.docker.internal</code> everywhere, and on Linux add <code>--add-host host.docker.internal:host-gateway</code> (Compose <code>extra_hosts</code>). <code>host-gateway</code> resolves to the bridge gateway IP. The host service must listen on 0.0.0.0 or the gateway IP (not only 127.0.0.1) and the host firewall must allow traffic from the Docker subnet. Alternative: <code>--network host</code>, which gives up isolation and only behaves this way on Linux.</p>"]
      ],
      gotchas: [
        "<b>Publishing is host-side only.</b> Container-to-container traffic on a shared network uses the container port and needs no <code>-p</code>. <code>api</code> talks to <code>postgres:5432</code> even if postgres is published as <code>15432:5432</code>; the published number is irrelevant inside the network.",
        "<b><code>-p 5432:5432</code> binds 0.0.0.0 and bypasses ufw/firewalld.</b> Your database is on the Internet if the host has a public IP. Prefer no publishing, or <code>127.0.0.1:5432:5432</code>, and use <code>DOCKER-USER</code> for host-level filtering.",
        "<b>Dev servers bind loopback by default</b> (uvicorn, Vite, Next dev, Flask). In a container that makes the published port reset connections. Always pass <code>--host 0.0.0.0</code>.",
        "<b>IPv6 surprises.</b> <code>localhost</code> may resolve to <code>::1</code> first. A client trying ::1 then 127.0.0.1 produces two errors (seen in the asyncpg trace). Published ports also bind <code>[::]</code> when the host has IPv6; a firewall that only filters IPv4 leaves the v6 door open.",
        "<b>Port already allocated.</b> <code>Bind for 0.0.0.0:8080 failed: port is already allocated</code> means another container (or <code>docker-proxy</code> left by it) or a host process holds the port. Find it with <code>docker ps --filter publish=8080</code> or <code>ss -lntp | grep 8080</code>.",
        "<b><code>host.docker.internal</code> is not automatic on Linux.</b> It exists on Docker Desktop; on Linux Engine you must add <code>host-gateway</code>. And a host service bound to 127.0.0.1 is still unreachable from containers.",
        "<b>A published port does not mean the app is ready.</b> Docker creates the mapping as soon as the container starts; clients may connect and be reset while the app is still booting. Use health checks.",
        "<b>Changing ports requires recreation.</b> You cannot add or change <code>-p</code> on an existing container; <code>docker rm -f</code> and <code>docker run</code> again (Compose does this automatically when the file changes)."
      ],
      best: [
        "Publish only the edge (reverse proxy). Keep API, cache and database unpublished on internal networks.",
        "When a backing service must be reachable from the host for development, bind it to loopback: <code>127.0.0.1:5432:5432</code>.",
        "Make every server in a container bind <code>0.0.0.0</code> on a fixed, documented port, and declare it with <code>EXPOSE</code> as documentation.",
        "Configure service addresses with names and container ports through environment variables (<code>DATABASE_URL</code>, <code>REDIS_URL</code>); never <code>localhost</code> for another container.",
        "Debug in order: does the name resolve (<code>getent hosts</code>)? Is the port open (<code>nc -zv</code>)? Is the server bound to 0.0.0.0 (<code>ss -lnt</code> in its namespace)? Are both on the same network (<code>docker network inspect</code>)?",
        "Put host-level firewall policy for containers in <code>DOCKER-USER</code> or in the cloud security group, not in ufw INPUT rules."
      ],
      lab: [
        "Build a tiny FastAPI image (FastAPI + asyncpg, endpoint <code>/health/db</code> that runs <code>SELECT version()</code> using <code>DATABASE_URL</code>), CMD <code>uvicorn main:app --host 0.0.0.0 --port 8000</code>.",
        "Create <code>appnet</code>, start <code>postgres:16</code> on it with <code>-p 5432:5432</code>, start the API with <code>DATABASE_URL=…@localhost:5432/app</code>. Record the exact error from <code>docker logs api</code>.",
        "Investigate: <code>docker exec api getent hosts localhost postgres</code>, <code>docker run --rm --network container:api nicolaka/netshoot sh -c 'ss -lnt; nc -zv localhost 5432; nc -zv postgres 5432'</code>, and <code>docker network inspect appnet</code>.",
        "Fix the URL to <code>@postgres:5432</code>, recreate the API, and confirm <code>curl localhost:8000/health/db</code>. Then recreate postgres without <code>-p</code> and confirm the API still works.",
        "Break it the other way: run postgres on the default bridge (no <code>--network</code>) and observe the different error (name resolution). Repair with <code>docker network connect appnet postgres</code> without restarting anything.",
        "Change the API's CMD to <code>--host 127.0.0.1</code>, publish it, and observe <code>curl: (56) … reset by peer</code>. Restore 0.0.0.0.",
        "<b>Done when:</b> you can explain, for each of the three failures (localhost, default bridge, loopback bind), which layer failed (DNS, TCP listener, bind address) and the one command that proves it."
      ],
      teach: `<p>"Publishing a port, <code>-p host:container</code>, opens a door from the host into a container. Docker writes an iptables DNAT rule, and sometimes runs a small docker-proxy, so traffic to host port 8080 is rewritten to the container's IP on port 80. <code>-p 127.0.0.1:8080:80</code> keeps that door local to the host, <code>-P</code> publishes everything the image EXPOSEs to random ports, and EXPOSE on its own does nothing but document.</p>
<p>Publishing is only for traffic coming from the host side. Containers on the same network talk to each other by name on the container port: <code>postgres:5432</code>. And here is the classic bug: if FastAPI connects to <code>localhost:5432</code>, it is talking to its own loopback, because every container has its own network namespace. Nothing listens there, so you get connection refused, even if Postgres is published on the host. The proof is three commands: <code>getent hosts postgres</code> inside the API, <code>nc -zv</code> to both addresses, and <code>docker network inspect</code> to see both containers on the same network.</p>
<p>Two more rules: the server inside the container must bind 0.0.0.0, not 127.0.0.1, or published traffic is reset. And to reach the host from a container use <code>host.docker.internal</code>, adding <code>host-gateway</code> on Linux."</p>`
    }
  ],
  quiz: [
    {
      q: "A developer runs PostgreSQL and the API like this. The API logs <code>could not translate host name \"db\" to address</code>. What is wrong?",
      code: `docker run -d --name db -e POSTGRES_PASSWORD=secret postgres:16
docker run -d --name api -p 8000:8000 -e DATABASE_URL=postgresql://postgres:secret@db:5432/postgres myorg/api:1.0`,
      lang: "sh",
      ans: "Both containers are on the default bridge, which has no name resolution.",
      why: "Without <code>--network</code>, containers join <code>bridge</code> (docker0), whose resolv.conf is a copy of the host's, so <code>db</code> is unknown. Create a network (<code>docker network create appnet</code>) and run both with <code>--network appnet</code>, or <code>docker network connect appnet db</code> and <code>… api</code>. Publishing ports or using <code>--link</code> are not the right fixes."
    },
    {
      q: "Same app, now on a shared user-defined network, but <code>DATABASE_URL</code> uses <code>localhost:5432</code> and postgres has <code>-p 5432:5432</code>. <code>psql -h localhost</code> on the host works. The API still logs <code>Connection refused</code>. Why does the host work and the API not?",
      ans: "localhost means a different network namespace in each case.",
      why: "On the host, <code>localhost:5432</code> hits the published port (DNAT/docker-proxy) into the postgres container. Inside the api container, <code>localhost</code> is api's own loopback where nothing listens on 5432. Use <code>postgres:5432</code>. The successful host test is misleading because it exercises a completely different path."
    },
    {
      q: "A Vite dev server in a container is started with <code>npm run dev</code> and published with <code>-p 5173:5173</code>. The browser shows \"connection reset\". Logs say <code>Local: http://localhost:5173/</code>. What do you change?",
      ans: "Make Vite listen on all interfaces: <code>vite --host 0.0.0.0</code> (or <code>server.host: true</code>).",
      why: "Vite binds the container's loopback by default. Published traffic arrives on the container's <code>eth0</code>, so nobody accepts it. The log line literally says localhost. The same applies to uvicorn's default 127.0.0.1."
    },
    {
      q: "Security reports that Redis on your server is reachable from the Internet, although <code>ufw deny 6379</code> is active. The container was started with <code>-p 6379:6379</code>. Explain and fix.",
      ans: "Docker's DNAT happens in PREROUTING and the packet is forwarded, so ufw's INPUT rules never see it.",
      why: "Published ports bypass host-firewall INPUT rules. Remove the publish (the API reaches <code>redis:6379</code> over the Docker network), or bind it to <code>127.0.0.1:6379:6379</code>, or filter in the <code>DOCKER-USER</code> chain / cloud security group. Also enable Redis authentication."
    },
    {
      q: "An nginx container proxies to <code>http://api:8000</code>. After <code>docker rm -f api</code> and recreating it, nginx returns 502 until nginx is restarted. Why?",
      ans: "nginx resolved <code>api</code> once at startup and keeps the old IP; the recreated container has a new IP.",
      why: "Container IPs are not stable across re-creation. Configure nginx to re-resolve via the embedded DNS (<code>resolver 127.0.0.11 valid=10s;</code> with the upstream in a variable), or reload nginx on deploys. The embedded DNS itself was updated immediately."
    },
    {
      q: "Which TWO statements are true? (A) <code>--network host</code> containers can use <code>-p</code> to remap ports. (B) Containers on different user-defined bridge networks cannot reach each other by default. (C) <code>EXPOSE</code> is required for container-to-container traffic. (D) A container can be attached to multiple networks at once.",
      ans: "B and D.",
      why: "A is false: <code>-p</code> is ignored in host mode. C is false: EXPOSE is metadata; any listening port is reachable by network peers. B is true because of Docker's isolation rules between bridges. D is true: <code>docker network connect</code> adds another interface."
    }
  ]
},
/* ===== Day 4 ===== */
{
  n: 4,
  title: "Storage",
  goal: "<b>By the end of today</b> you can explain where a container's files really live (image layers + a thin writable layer via overlay2), choose correctly between bind mounts, named volumes, anonymous volumes and tmpfs, and run PostgreSQL so that you can destroy and recreate its container, back up its volume to a tar file and restore it, without losing a row.",
  rev: [
    "<b>Container filesystem</b> = read-only image layers + one thin writable layer (overlay2 upperdir), merged into one view. The writable layer dies with <code>docker rm</code>, is slow for heavy writes (copy-up, overlay overhead) and must never hold data you care about.",
    "<b>Mount types:</b> <b>bind mount</b> (a host path, managed by you; great for source code in dev), <b>named volume</b> (managed by Docker under <code>/var/lib/docker/volumes/&lt;name&gt;/_data</code>; the default for databases), <b>anonymous volume</b> (random name, created by <code>VOLUME</code> or <code>-v /path</code>; easy to orphan), <b>tmpfs</b> (RAM only, Linux, gone on stop).",
    "<b>-v vs --mount:</b> same features, different strictness. <code>-v /missing:/data</code> silently creates the host directory (owned by root); <code>--mount type=bind,src=/missing,…</code> fails. <code>--mount</code> is explicit key=value and is required for some options (volume driver options, tmpfs size via keys); prefer it in scripts.",
    "<b>PostgreSQL persistence:</b> mount a <b>named volume</b> at <code>PGDATA</code> (<code>/var/lib/postgresql/data</code> for postgres ≤17 images). Remove and recreate the container freely; the volume survives. <code>docker rm -v</code>, <code>--rm</code>, <code>docker compose down -v</code> and <code>volume prune</code> are how data actually gets deleted.",
    "<b>Backups:</b> file-level: stop Postgres, <code>docker run --rm -v pgdata:/src:ro -v \"$PWD\":/backup alpine tar czf …</code>, restore into a new volume the same way. Application-consistent and portable across versions: <code>pg_dump -Fc</code> / <code>pg_restore</code>. Storage drivers (overlay2) manage image/container layers; volume drivers (local, NFS options, plugins) manage volumes."
  ],
  topics: [
    {
      id: "d4-storage",
      title: "Container storage: writable layer, bind mounts, volumes and tmpfs",
      lv: ["fresher", "mid", "senior", "dca"],
      eli5: `<p>Think of a container as a <b>hotel room</b>. The furniture (the image) is bolted down and identical in every room. You can rearrange things and leave notes on the desk (the writable layer), but when you check out (the container is removed), housekeeping resets the room. Anything you wanted to keep is gone.</p>
<p>If you want to keep things, you have options. A <b>bind mount</b> is like asking the hotel to connect your room to <i>your own</i> storage unit at home: you own it, you know exactly where it is, and whatever you change in the room changes at home. A <b>named volume</b> is a <b>locker the hotel manages for you</b>: it has your name on it, it stays when you check out, and the next room you check into can open the same locker. An <b>anonymous volume</b> is a locker with a random number on it; it survives check-out too, but nobody remembers whose it is. A <b>tmpfs mount</b> is a whiteboard: fast, private, and wiped the moment you leave.</p>
<p>Databases belong in lockers (named volumes). Your source code during development belongs in the connection to your home (bind mount), so edits on your laptop show up instantly in the room. Secrets and scratch files that must never touch disk go on the whiteboard (tmpfs).</p>`,
      what: `<p>Every container sees a single root filesystem, but it is assembled from several sources. Understanding which source a path comes from tells you how fast it is, who owns it and whether it survives.</p>
<h5>1. The container's own filesystem (image layers + writable layer)</h5>
<ul class="pts">
<li>Image layers are read-only and shared by every container from that image. The storage driver (normally <b>overlay2</b>) stacks them as <code>lowerdir</code>s and adds one per-container <b>writable layer</b> (<code>upperdir</code>). The merged result is the container's <code>/</code>.</li>
<li>Writes go to the writable layer. Modifying a file that exists in a lower layer triggers <b>copy-up</b>: the whole file is copied into the upper layer first (a 1 GB file copied to change 1 byte). Deleting a lower-layer file creates a <b>whiteout</b>; the bytes still exist in the image.</li>
<li>The writable layer lives as long as the container: it survives <code>docker stop</code>/<code>start</code>/<code>restart</code> and is deleted by <code>docker rm</code>. That is what "containers are ephemeral" means precisely.</li>
<li>Why heavy writes there are slow: copy-up latency, overlay lookups through many layers, extra metadata work for fsync-heavy workloads (databases), and it grows the container on the host's Docker root (<code>docker ps -s</code> shows it). Volumes and bind mounts bypass the storage driver entirely and write straight to the host filesystem.</li>
</ul>
<h5>2. Bind mounts</h5>
<ul class="pts">
<li>Mount an existing host file or directory into the container: <code>-v /srv/app/config:/etc/app:ro</code> or <code>--mount type=bind,src=/srv/app/config,dst=/etc/app,readonly</code>.</li>
<li>The host path must be absolute (relative paths like <code>./src</code> work in <code>-v</code> on modern CLIs and in Compose). The mount <b>hides</b> whatever the image had at the target path.</li>
<li>Permissions are the host's: the container process accesses the files with its numeric UID/GID. If the container runs as UID 999 and the host directory belongs to UID 1000 with mode 700, you get <code>Permission denied</code>. Names do not matter, numbers do.</li>
<li>Best for: source code with hot reload, config files you manage on the host, sharing a socket (<code>/var/run/docker.sock</code>, with great care). Weak for: portability (depends on host paths), Docker Desktop performance (file sharing across the VM boundary), and databases.</li>
</ul>
<h5>3. Named volumes</h5>
<ul class="pts">
<li>Docker-managed storage: <code>docker volume create pgdata</code>, or implicitly with <code>-v pgdata:/var/lib/postgresql/data</code>. With the <code>local</code> driver the data is in <code>/var/lib/docker/volumes/pgdata/_data</code> on the host (inside the VM on Docker Desktop).</li>
<li>Independent lifecycle: survives container removal; removed only by <code>docker volume rm</code>, <code>docker volume prune -a</code>, or <code>docker compose down -v</code>.</li>
<li><b>Pre-population</b>: when an <i>empty</i> named volume is mounted at a path where the image has files, Docker copies the image's files (and their ownership) into the volume first. Bind mounts never do this. Disable with <code>volume-nocopy</code>.</li>
<li>Can be shared by several containers concurrently (Docker does no locking; the application must cope), and can use <b>volume drivers</b> for NFS, CIFS or cloud storage.</li>
</ul>
<h5>4. Anonymous volumes</h5>
<ul class="pts">
<li>A volume with a random 64-hex name, created by <code>-v /data</code> (no source) or automatically for every <code>VOLUME</code> instruction in the image (postgres, mysql, redis, mongo images all declare one).</li>
<li>Survives <code>docker rm</code> (orphaned), but is deleted by <code>docker rm -v</code> and by <code>--rm</code> containers on exit. A <b>new</b> container gets a <b>new</b> anonymous volume, so data looks "lost" even though the old volume is still on disk.</li>
<li><code>docker volume prune</code> (Engine 23+) removes unused anonymous volumes by default; named ones need <code>--all</code>.</li>
</ul>
<h5>5. tmpfs mounts</h5>
<ul class="pts">
<li>In-memory filesystem: <code>--tmpfs /tmp:size=64m,mode=1777</code> or <code>--mount type=tmpfs,dst=/tmp,tmpfs-size=67108864</code>. Linux containers only. Contents vanish when the container stops; it counts against the container's memory limit; can be swapped.</li>
<li>Uses: scratch space for a <code>--read-only</code> root filesystem, temporary decrypted secrets, high-churn caches you never want on disk, Uvicorn/Gunicorn worker temp dirs.</li>
</ul>
<h5><code>-v</code> versus <code>--mount</code></h5>
<ul class="pts">
<li><code>-v SRC:DST[:OPTS]</code>: compact. If <code>SRC</code> starts with <code>/</code> (or <code>./</code>) it is a bind mount, otherwise a volume name; omitted means anonymous volume. Options: <code>ro</code>, <code>z</code>/<code>Z</code> (SELinux relabel), propagation flags, <code>nocopy</code>.</li>
<li><code>--mount type=bind|volume|tmpfs,src=…,dst=…,readonly,…</code>: verbose and explicit; supports <code>volume-driver</code>, <code>volume-opt</code>, <code>volume-nocopy</code>, <code>bind-propagation</code>, <code>tmpfs-size</code>, <code>tmpfs-mode</code>. It is the only syntax for Swarm services (<code>docker service create --mount</code>).</li>
<li>Key behavioural difference: a missing bind source with <code>-v</code> is created as an empty root-owned directory (a classic source of "my config is empty" and "a directory named nginx.conf appeared"); with <code>--mount</code> it is an error.</li>
<li><b>Read-only</b>: <code>:ro</code> or <code>readonly</code> makes the mount read-only for the container. Pair with <code>--read-only</code> (read-only root filesystem) and tmpfs for writable scratch to get immutable containers.</li>
</ul>
<h5>Storage drivers vs volume drivers</h5>
<p>Two different plug points that are often confused. The <b>storage driver</b> (overlay2; formerly aufs, devicemapper, btrfs, zfs, vfs) builds image layers and container writable layers; one per daemon, shown by <code>docker info</code>. With the newer containerd image store this role is played by containerd <b>snapshotters</b> (overlayfs). A <b>volume driver</b> provisions volumes (<code>local</code> by default; plugins for NFS/cloud block storage); you choose one per volume.</p>`,
      why: `<p>Containers were designed to be <b>disposable</b>: you replace them on every deploy, scale them up and down, and restart them on failure. That only works if the container itself holds no unique state. But applications do have state: database files, uploads, caches, logs. Storage features exist to separate "the process and its code" (replaceable) from "the data" (precious), so you can throw away the first without touching the second.</p>
<p>Before volumes existed, people either wrote data into the container (and lost it on upgrade), or bind-mounted hand-made host directories (and fought with paths, permissions and portability between machines). Named volumes give a portable, Docker-managed handle ("pgdata") that works the same on a laptop, a CI runner and a server, with drivers for network storage when one host is not enough.</p>
<p>Bind mounts solve a different problem: the developer loop. Editing code on the host and seeing it live inside the container without rebuilding is what makes containers pleasant for development. tmpfs solves a security and performance problem: some data should never hit disk, and some data is so short-lived that disk I/O is waste.</p>`,
      diagram: {
        html: lanes([
          ["Container view: /", ["<code>/usr, /app</code> → image layers (read-only)", "<code>/etc/app.conf</code> edited → copied up to writable layer", "<code>/var/lib/postgresql/data</code> → named volume", "<code>/app/src</code> → bind mount", "<code>/tmp</code> → tmpfs (RAM)"]],
          ["Host: /var/lib/docker", ["<code>overlay2/&lt;id&gt;/diff</code> image layers", "<code>overlay2/&lt;ctr&gt;/diff</code> writable (upperdir)", "<code>overlay2/&lt;ctr&gt;/merged</code> the union view", "<code>volumes/pgdata/_data</code> named volume", "<code>volumes/3f9a…/_data</code> anonymous volume"]],
          ["Elsewhere on the host", ["<code>/home/dev/project/src</code> bind source", "RAM (tmpfs, counts toward memory limit)", "NFS server via local driver options", "Plugin-backed storage (cloud disks)"]]
        ]) + flow([["docker rm", "writable layer deleted", "r"], ["docker rm -v / --rm", "+ anonymous volumes", "r"], ["named volume", "survives", "g"], ["bind source", "never touched by Docker", "g"]]),
        steps: [
          "At <code>docker run</code> the storage driver prepares a new writable layer on top of the image's layers and mounts the overlay at <code>…/merged</code>, which becomes the container's root.",
          "For every <code>-v</code>/<code>--mount</code>, dockerd resolves the source: creates a named volume if missing (via its driver), creates anonymous volumes for unspecified sources and image <code>VOLUME</code>s, checks bind sources, and copies image content into empty volumes.",
          "The OCI runtime spec passed to runc lists these as mounts; runc bind-mounts each source onto its destination inside the container's mount namespace, on top of the overlay root, and mounts tmpfs where requested.",
          "At run time writes under a mount go directly to the host filesystem (volume or bind) or RAM (tmpfs); writes elsewhere go to the overlay upperdir with copy-up.",
          "<code>docker rm</code> unmounts everything and deletes the writable layer; named volumes and bind sources are untouched; anonymous volumes are kept unless <code>-v</code> was given."
        ]
      },
      cmds: [
        {
          t: "Prove the writable layer is ephemeral",
          lang: "sh",
          code: `docker run --name scratch alpine:3.20 sh -c 'echo hello > /note.txt'
docker start -a scratch >/dev/null; docker cp scratch:/note.txt -   # still there after stop/start
docker diff scratch
docker rm scratch
docker run --rm alpine:3.20 cat /note.txt`,
          out: `note.txt…hello
A /note.txt
scratch
cat: can't open '/note.txt': No such file or directory`,
          note: `<p><code>docker diff</code> lists changes in the writable layer: <code>A</code> added, <code>C</code> changed, <code>D</code> deleted. A new container from the same image starts with an empty writable layer.</p>`
        },
        {
          t: "Named volumes: create, use, inspect, find on disk",
          lang: "sh",
          code: `docker volume create appdata
docker run --rm -v appdata:/data alpine:3.20 sh -c 'echo v1 > /data/version'
docker run --rm -v appdata:/data alpine:3.20 cat /data/version
docker volume ls
docker volume inspect appdata
sudo ls -l /var/lib/docker/volumes/appdata/_data     # Linux host only`,
          out: `v1
DRIVER    VOLUME NAME
local     appdata
[
    {
        "CreatedAt": "2026-11-16T10:12:03Z",
        "Driver": "local",
        "Labels": null,
        "Mountpoint": "/var/lib/docker/volumes/appdata/_data",
        "Name": "appdata",
        "Options": null,
        "Scope": "local"
    }
]
-rw-r--r-- 1 root root 3 Nov 16 10:12 version`,
          note: `<p>Two different containers, same data. On Docker Desktop the <code>Mountpoint</code> path is inside the Linux VM, not on your Mac/Windows disk; inspect it with a container (<code>docker run --rm -v appdata:/d alpine ls /d</code>) or the Desktop Volumes view.</p>`
        },
        {
          t: "Bind mounts, read-only, and the -v vs --mount difference",
          lang: "sh",
          code: `mkdir -p ./site && echo '<h1>from host</h1>' > ./site/index.html
docker run -d --name web -p 8080:80 -v "$PWD/site":/usr/share/nginx/html:ro nginx:1.27-alpine
curl -s localhost:8080
echo '<h1>edited live</h1>' > ./site/index.html && curl -s localhost:8080
docker exec web sh -c 'echo x > /usr/share/nginx/html/x'      # read-only
# missing source: -v creates it, --mount refuses
docker run --rm -v /tmp/does-not-exist:/data alpine:3.20 ls -ld /data
docker run --rm --mount type=bind,src=/tmp/does-not-exist2,dst=/data alpine:3.20 true`,
          out: `<h1>from host</h1>
<h1>edited live</h1>
sh: can't create /usr/share/nginx/html/x: Read-only file system
drwxr-xr-x    2 root     root          4096 Nov 16 10:20 /data
docker: Error response from daemon: invalid mount config for type "bind": bind source path does not exist: /tmp/does-not-exist2`,
          note: `<p>The silently-created directory is a frequent bug: a typo in the source path gives the container an empty directory instead of an error. In Git Bash on Windows, prefix with <code>MSYS_NO_PATHCONV=1</code> if paths get rewritten; in PowerShell use <code>-v "$pwd/site:/usr/share/nginx/html:ro"</code>.</p>`
        },
        {
          t: "Anonymous volumes and the image's VOLUME instruction",
          lang: "sh",
          code: `docker image inspect -f '{{json .Config.Volumes}}' postgres:16
docker run -d --name pg-anon -e POSTGRES_PASSWORD=secret postgres:16
docker inspect -f '{{range .Mounts}}{{.Type}} {{.Name}} -> {{.Destination}}{{println}}{{end}}' pg-anon
docker rm -f pg-anon
docker volume ls -f dangling=true`,
          out: `{"/var/lib/postgresql/data":{}}
volume 9c1e4f0b7a3d…e2 -> /var/lib/postgresql/data
pg-anon
DRIVER    VOLUME NAME
local     9c1e4f0b7a3d…e2`,
          note: `<p>Even without <code>-v</code>, the database files went to an anonymous volume because the image declares <code>VOLUME</code>. After <code>docker rm -f</code> the volume is orphaned ("dangling"). <code>docker rm -f -v pg-anon</code> would have deleted it.</p>`
        },
        {
          t: "tmpfs and a read-only root filesystem",
          lang: "sh",
          code: `docker run --rm --read-only --tmpfs /tmp:rw,size=64m,mode=1777 alpine:3.20 sh -c 'echo ok > /tmp/a && cat /tmp/a; echo no > /etc/x'
docker run --rm --mount type=tmpfs,dst=/scratch,tmpfs-size=67108864 alpine:3.20 df -h /scratch`,
          out: `ok
sh: can't create /etc/x: Read-only file system
Filesystem                Size      Used Available Use% Mounted on
tmpfs                    64.0M         0     64.0M   0% /scratch`,
          note: `<p><code>--read-only</code> + tmpfs for <code>/tmp</code> (and any path the app writes, like <code>/var/run</code>) is a strong hardening pattern for stateless services such as FastAPI.</p>`
        },
        {
          t: "Volume drivers: local with NFS options, and a plugin",
          lang: "sh",
          code: `# NFS via the built-in local driver (host needs NFS client support)
docker volume create --driver local \\
  --opt type=nfs --opt o=addr=10.0.0.20,rw,nfsvers=4.1 --opt device=:/exports/uploads uploads
docker run --rm -v uploads:/uploads alpine:3.20 ls /uploads
# same with --mount (the only form docker service create accepts)
docker run --rm --mount 'type=volume,src=uploads2,dst=/uploads,volume-driver=local,volume-opt=type=nfs,"volume-opt=o=addr=10.0.0.20,nfsvers=4.1",volume-opt=device=:/exports/uploads' alpine:3.20 ls /uploads
# third-party plugin (example from Docker docs)
docker plugin install --grant-all-permissions vieux/sshfs
docker volume create -d vieux/sshfs -o sshcmd=user@10.0.0.30:/data -o password=changeme sshvol`,
          note: `<p>The NFS mount is performed lazily, when the first container uses the volume, so a wrong server address shows up at <code>docker run</code>, not at <code>volume create</code>. Note the CSV quoting needed when an option value contains commas. Plugin ecosystems change; check that a plugin is maintained before relying on it.</p>`
        },
        {
          t: "Housekeeping: usage, prune, remove",
          lang: "sh",
          code: `docker system df -v | sed -n '/VOLUME NAME/,/^$/p'
docker volume rm appdata
docker volume prune -f          # unused anonymous volumes only (Engine 23+)
docker volume prune -a -f       # ALL unused volumes, including named ones. Careful.`,
          out: `VOLUME NAME   LINKS   SIZE
appdata       0       3B
pgdata        1       48.2MB
Deleted Volumes:
9c1e4f0b7a3d…e2
Total reclaimed space: 47.9MB`,
          note: `<p><code>LINKS</code> is the number of containers (running or stopped) using the volume; a volume in use by any container, even a stopped one, cannot be removed or pruned.</p>`
        },
        {
          t: "UID mismatch with a bind mount, and three fixes",
          lang: "sh",
          code: `mkdir -p ./data && chmod 700 ./data          # owned by your user, e.g. uid 1000
docker run --rm --user 999:999 -v "$PWD/data":/data alpine:3.20 touch /data/x
# fix 1: run as your own uid
docker run --rm --user "$(id -u):$(id -g)" -v "$PWD/data":/data alpine:3.20 touch /data/x
# fix 2: give the directory to the container's uid
sudo chown 999:999 ./data
# fix 3: don't bind-mount database dirs at all: use a named volume (pre-populated with correct owner)
docker run --rm -v pgdata:/var/lib/postgresql/data postgres:16 ls -ld /var/lib/postgresql/data`,
          out: `touch: /data/x: Permission denied
drwx------    2 postgres postgres     4096 Nov 16 10:31 /var/lib/postgresql/data`,
          note: `<p>The kernel checks numeric IDs. User namespace remapping (<code>userns-remap</code>) and rootless Docker shift IDs, which changes who owns files on the host. Docker Desktop's file sharing translates ownership differently on macOS/Windows, so a bind mount that "works" on a Mac can fail on a Linux server.</p>`
        }
      ],
      internals: `<p><b>overlay2 on disk.</b> For every layer and container there is a directory <code>/var/lib/docker/overlay2/&lt;id&gt;/</code> containing <code>diff/</code> (the layer's files), <code>link</code> (a short name used in <code>overlay2/l/</code> symlinks to keep mount options under the page-size limit), <code>lower</code> (the chain of lower layers) and, for containers, <code>work/</code> (overlayfs scratch) and <code>merged/</code> (the mount point). <code>docker inspect -f '{{json .GraphDriver.Data}}' &lt;ctr&gt;</code> prints <code>LowerDir</code>, <code>UpperDir</code>, <code>MergedDir</code>, <code>WorkDir</code>. The kernel mount looks like <code>overlay on /var/lib/docker/overlay2/…/merged type overlay (rw,lowerdir=l/ABC:l/DEF,upperdir=…/diff,workdir=…/work)</code>. With the <b>containerd image store</b> (default on recent Docker Desktop and on fresh installs of recent Engine versions; check <code>docker info</code> for <code>driver-type: io.containerd.snapshotter.v1</code>), layers live under <code>/var/lib/containerd/io.containerd.snapshotter.v1.overlayfs/</code> instead, but the overlayfs mechanics are identical.</p>
<p><b>Copy-up and whiteouts</b> are done by the overlayfs kernel module: on the first write-open of a lower file, it copies data and metadata to upperdir; on delete, it creates a character device 0/0 whiteout in upperdir; for directories replaced wholesale, an "opaque" xattr. That is why <code>docker diff</code> can be computed simply by walking upperdir.</p>
<p><b>Mount setup.</b> dockerd turns each <code>-v</code>/<code>--mount</code> into an entry in the OCI <code>config.json</code> <code>mounts</code> array (type <code>bind</code> with source path, options <code>rbind</code>, <code>ro</code>, propagation; or type <code>tmpfs</code> with size/mode). runc performs these mounts in the new mount namespace after mounting the rootfs and before <code>pivot_root</code>. For volumes, dockerd first asks the volume driver to <code>Mount</code> and gets back a host path (for <code>local</code>: <code>/var/lib/docker/volumes/&lt;name&gt;/_data</code>, or a freshly NFS-mounted path when options were given), and then bind-mounts that path. Volume plugins implement the same <code>Create/Mount/Unmount/Remove/Path</code> API over a Unix socket under <code>/run/docker/plugins/</code>.</p>
<p><b>Volume metadata</b> is stored in <code>/var/lib/docker/volumes/metadata.db</code> (BoltDB); options given at creation are in <code>/var/lib/docker/volumes/&lt;name&gt;/opts.json</code>. Reference counting (which containers use a volume) is in memory and derived from container configs; that is how <code>docker volume rm</code> refuses volumes in use.</p>
<p><b>Copy-on-mount for volumes:</b> when the volume is empty and the image has content at the destination, dockerd copies the content (preserving UID/GID and modes) before starting the container. That is how the postgres named volume ends up owned by the <code>postgres</code> user (UID 999 in the Debian-based image, 70 in the Alpine variant) with no manual <code>chown</code>.</p>
<p><b>tmpfs</b> is a kernel <code>tmpfs</code> mount in the container's mount namespace; its pages are charged to the container's memory cgroup, so a full tmpfs can trigger the OOM killer.</p>
<p><b>Docker Desktop:</b> volumes live on the VM's virtual disk (fast, native Linux filesystem). Bind mounts of Mac/Windows paths go through a file-sharing layer (VirtioFS, gRPC FUSE, or 9P/WSL2 mounts), which is slower and translates permissions. On Windows with WSL2, keep the project inside the WSL filesystem for good bind-mount performance.</p>`,
      prod: `<p><b>Mount choices for React → FastAPI → Redis → PostgreSQL:</b></p>
<ul class="pts">
<li><b>React (nginx serving the build)</b>: no mounts in production; the static files are baked into the image. Optionally <code>--read-only</code> with tmpfs for <code>/var/cache/nginx</code> and <code>/var/run</code>. In development: a bind mount of <code>./frontend</code> into the Vite dev container, plus an anonymous or named volume over <code>/app/node_modules</code> so the host's (possibly macOS-built) node_modules do not shadow the container's.</li>
<li><b>FastAPI</b>: stateless. <code>--read-only</code> root, <code>--tmpfs /tmp</code>. Uploads go to object storage (S3/MinIO), not to the container. In development: bind-mount <code>./backend</code> and run <code>uvicorn --reload</code>.</li>
<li><b>Redis</b>: if used purely as cache, no volume is fine (or tmpfs). If you rely on persistence (queues, sessions), mount a named volume at <code>/data</code> and enable AOF/RDB.</li>
<li><b>PostgreSQL</b>: a named volume at <code>PGDATA</code>, on a host disk with real IOPS; never a bind mount on Docker Desktop and never NFS unless you know its locking/fsync semantics. Backups via <code>pg_dump</code> or WAL archiving to off-host storage. Topic 2 builds this in full.</li>
<li><b>Config and TLS certs</b>: read-only bind mounts (<code>:ro</code>) of files managed by your config management, or Swarm/Compose <code>configs</code>/<code>secrets</code> (Day 9/10).</li>
<li><b>Disk hygiene</b>: monitor <code>/var/lib/docker</code>; writable layers (log files written inside containers!) and orphaned anonymous volumes are the usual culprits. Log to stdout so the logging driver (with rotation) handles it.</li>
</ul>`,
      iq: [
        ["dca", "Which TWO statements about named volumes are true? (A) They are deleted when the container using them is removed with <code>docker rm</code>. (B) With the local driver their data is stored under <code>/var/lib/docker/volumes/</code>. (C) An empty named volume mounted over a non-empty image directory is pre-populated with the image's content. (D) They must be created with <code>docker volume create</code> before use.", "<p><b>B and C.</b> A is false: <code>docker rm</code> (even with <code>-v</code>) never deletes named volumes; <code>-v</code> only removes anonymous ones. D is false: <code>-v name:/path</code> or <code>--mount type=volume,src=name,…</code> creates the volume on first use.</p>"],
        ["dca", "What is the difference in behaviour between <code>-v /opt/conf:/etc/app</code> and <code>--mount type=bind,src=/opt/conf,dst=/etc/app</code> when <code>/opt/conf</code> does not exist on the host?", "<p><code>-v</code> creates <code>/opt/conf</code> as an empty directory (owned by root) and starts the container with an empty <code>/etc/app</code>. <code>--mount</code> fails with \"bind source path does not exist\". That strictness is why <code>--mount</code> is recommended for scripts and why only <code>--mount</code> is accepted by <code>docker service create</code>.</p>"],
        ["dca", "Which mount type stores data only in the host's memory and is lost when the container stops?", "<p><code>tmpfs</code> (<code>--tmpfs</code> or <code>--mount type=tmpfs</code>). It is available for Linux containers only and cannot be shared between containers. Named volumes and bind mounts persist to disk; the writable layer persists until the container is removed, not when it stops.</p>"],
        ["dca", "A Dockerfile ends with <code>VOLUME /data</code>. A user runs the image three times with <code>docker run -d img</code>, removing each container with <code>docker rm -f</code>. What remains on the host?", "<p>Three anonymous volumes, one per container, all dangling. Each <code>docker run</code> creates a fresh anonymous volume for <code>/data</code>; <code>docker rm</code> without <code>-v</code> leaves them. Clean up with <code>docker volume prune</code>. The tempting wrong answer is \"one shared volume called data\"; <code>VOLUME</code> never names or shares volumes.</p>"],
        ["mid", "Why is writing a lot of data to the container's writable layer a bad idea?", "<p>It is slow (overlay copy-up of whole files on first modification, extra layer lookups, worse fsync behaviour), it is lost on <code>docker rm</code>, it bloats the host's Docker root where all images also live, and it makes containers non-disposable. Use a volume for data that must persist and tmpfs for scratch data.</p>"],
        ["mid", "A bind-mounted directory works on a developer's Mac but the same container gets <code>Permission denied</code> on a Linux server. Why?", "<p>On Linux the kernel enforces numeric UID/GID on the host directory exactly; the container runs as, say, UID 999 while the directory belongs to UID 1000 with restrictive mode. Docker Desktop's file-sharing layer on macOS maps ownership so the container appears to own the files. Fix by matching UIDs (<code>--user</code>, <code>chown</code>, building the image with a known UID) or use a named volume, which Docker pre-populates with the image's ownership.</p>"],
        ["senior", "What is the difference between a storage driver and a volume driver?", "<p>The storage driver (overlay2, or a containerd snapshotter) implements image layers and the container writable layer; there is one per daemon and you rarely change it. A volume driver provisions and mounts volumes (<code>local</code>, which can also mount NFS/CIFS via options, or plugins for networked/cloud storage); you can choose per volume. Database files should go through a volume (ideally local disk), not through the storage driver.</p>"],
        ["senior", "How would you make the FastAPI container's filesystem immutable without breaking it?", "<p>Run with <code>--read-only</code>, add <code>--tmpfs /tmp</code> (and any other path the app or libraries write to, found via <code>docker diff</code> on a test container), keep config as read-only mounts or environment variables, and send uploads to object storage. This blocks attackers from dropping files and makes drift impossible. Test with your real workload: Python writes <code>.pyc</code> files only if allowed, so set <code>PYTHONDONTWRITEBYTECODE=1</code>.</p>"]
      ],
      gotchas: [
        "<b>A bind mount or volume hides the image's content</b> at the destination. Mounting <code>./app</code> over <code>/app</code> also hides <code>/app/node_modules</code> or the installed virtualenv baked into the image, unless you add another (nested) volume for that path.",
        "<b>Pre-population happens only for empty named/anonymous volumes</b>, never for bind mounts and never again once the volume has data. Upgrading an image does not update files already copied into a volume.",
        "<b>Mounting a single file</b> (<code>-v ./nginx.conf:/etc/nginx/nginx.conf</code>) binds the inode. Editors that save by writing a new file and renaming (vim, many IDEs) leave the container looking at the old content until restart. Mount the directory instead.",
        "<b>If the file doesn't exist, <code>-v</code> creates a directory</b> with that name. You then get errors like \"nginx.conf is a directory\".",
        "<b><code>docker volume prune</code> changed behaviour</b> (Engine 23): without <code>-a</code> it only removes anonymous volumes. Old blog posts that say it wipes named volumes describe the previous behaviour; scripts written for one version may surprise you on the other.",
        "<b>VOLUME in a Dockerfile is hard to undo.</b> Child images cannot remove it, every run makes a volume, and with the legacy builder changes made to that path after the <code>VOLUME</code> line were discarded. Prefer declaring volumes at run/Compose time.",
        "<b>tmpfs counts toward memory.</b> A 2 GB tmpfs that fills up under a 1 GB memory limit gets the container OOM-killed.",
        "<b>SELinux hosts</b> (RHEL/Fedora) block bind mounts unless relabelled: add <code>:z</code> (shared) or <code>:Z</code> (private). Never use <code>:Z</code> on system directories like <code>/home</code> or <code>/usr</code>."
      ],
      best: [
        "Never keep data you care about in the writable layer; ask \"what happens on <code>docker rm</code>?\" for every path your app writes.",
        "Use named volumes for databases and any Docker-managed persistent data; give them explicit, meaningful names.",
        "Use bind mounts for development source code and for host-managed config, mounted <code>:ro</code> whenever the container does not need to write.",
        "Use <code>--mount</code> in scripts and docs for anything non-trivial: it fails loudly on mistakes and is explicit about the type.",
        "Run stateless services with <code>--read-only</code> plus tmpfs for scratch, and as a non-root UID that matches any bind-mounted data.",
        "Monitor <code>docker system df</code>, prune dangling volumes deliberately, and label volumes (<code>--label app=shop</code>) so cleanup scripts can filter safely."
      ],
      lab: [
        "Run an alpine container that writes a file to <code>/</code>; check <code>docker diff</code>; stop/start it and confirm the file survives; remove it and confirm a new container does not have the file.",
        "Create a named volume, write to it from one container, read it from another, then <code>docker volume inspect</code> it and (on Linux) look at <code>_data</code> on the host.",
        "Serve a host directory with nginx using a <code>:ro</code> bind mount; edit the HTML on the host and refresh; try writing from inside the container and read the error.",
        "Compare <code>-v /tmp/nope:/x</code> and <code>--mount type=bind,src=/tmp/nope2,dst=/x</code>; note which one creates a directory.",
        "Run <code>postgres:16</code> without any <code>-v</code>, inspect its mounts, remove it, and find the dangling anonymous volume with <code>docker volume ls -f dangling=true</code>.",
        "Run alpine with <code>--read-only --tmpfs /tmp:size=16m</code> and show that <code>/tmp</code> is writable but <code>/etc</code> is not; run <code>df -h /tmp</code>.",
        "<b>Done when:</b> for each of writable layer, bind mount, named volume, anonymous volume and tmpfs you can say where the bytes are on the host and which command deletes them."
      ],
      teach: `<p>"A container's root filesystem is the image's read-only layers plus one thin writable layer, stacked by overlay2. Anything written there disappears on <code>docker rm</code>, and it is slow for heavy writes because modified files are copied up whole. So data goes in mounts.</p>
<p>There are four kinds. Bind mounts map a host path you control; perfect for source code in development, but they depend on host paths and the kernel checks numeric UIDs, so permission mismatches are common. Named volumes are managed by Docker under <code>/var/lib/docker/volumes</code>; they survive container removal, get pre-filled with the image's files and correct ownership, and are the default choice for databases. Anonymous volumes are the same thing with a random name, created by <code>VOLUME</code> in Dockerfiles; they get orphaned easily. And tmpfs lives in RAM and vanishes on stop, ideal for scratch space with a read-only root.</p>
<p><code>-v</code> and <code>--mount</code> do the same job, but <code>-v</code> silently creates missing host directories while <code>--mount</code> errors, so prefer <code>--mount</code> in scripts. And keep storage drivers, which build layers, separate in your head from volume drivers, which provide volumes like NFS."</p>`
    },
    {
      id: "d4-persistence",
      title: "Data persistence, database volumes and backups",
      lv: ["fresher", "mid", "senior", "lead", "dca"],
      eli5: `<p>A database container is like a <b>chef</b>, and the data is the <b>recipe book</b>. Chefs can quit, get sick or be replaced by a newer chef (a new container from <code>postgres:16.5</code>). That is fine as long as the recipe book stays on the shelf (a named volume) and the new chef is told which shelf to read from.</p>
<p>If you let the chef keep the recipe book in their apron pocket (the container's own filesystem or an anonymous volume nobody tracks), it leaves with them. The next chef starts with a blank book and your restaurant forgets every customer order.</p>
<p>Backups are photocopies of the recipe book kept in another building. You can photocopy the pages directly (copying the volume files, best done when the kitchen is closed), or ask the chef to write out a clean, readable copy (<code>pg_dump</code>), which any future chef can read even if they use a different edition of the cookbook.</p>`,
      what: `<p><b>Persistence</b> in Docker means placing a stateful service's data directory on storage whose lifecycle is independent of the container: a named volume (default), a bind mount to a managed host path, or a volume backed by network storage. The container becomes a replaceable process that reattaches to the same data.</p>
<h5>PostgreSQL in the official image</h5>
<ul class="pts">
<li>Data directory: <code>PGDATA</code>, default <code>/var/lib/postgresql/data</code> for the postgres 16/17 images, which also declare <code>VOLUME /var/lib/postgresql/data</code>. Mount your named volume exactly there. (The postgres 18 images changed the layout: <code>PGDATA</code> defaults to a version-specific path under <code>/var/lib/postgresql</code> and the volume is declared at <code>/var/lib/postgresql</code>. Check the image documentation for the tag you use; mounting at the old path on 18 means data lands in an anonymous volume.)</li>
<li>First start (empty data dir): the entrypoint runs <code>initdb</code>, creates the superuser from <code>POSTGRES_USER</code>/<code>POSTGRES_PASSWORD</code>, the database <code>POSTGRES_DB</code>, and runs scripts in <code>/docker-entrypoint-initdb.d/</code> (<code>*.sql</code>, <code>*.sql.gz</code>, <code>*.sh</code>).</li>
<li>Later starts (data dir has <code>PG_VERSION</code>): initialisation is skipped entirely. Changing <code>POSTGRES_PASSWORD</code> or init scripts has <b>no effect</b> on an existing volume. This surprises everyone once.</li>
<li>The data directory must be owned by the <code>postgres</code> user with mode 0700. Named volumes get this automatically; bind mounts often break it (Windows/NTFS, UID mismatch). If you must bind-mount, mount the parent and set <code>PGDATA</code> to a subdirectory.</li>
<li>Major versions are not data-compatible. Pointing <code>postgres:17</code> at a volume initialised by 16 fails with <code>database files are incompatible with server</code>. Upgrade with <code>pg_dump</code>/<code>pg_restore</code> or <code>pg_upgrade</code>. Minor updates (16.4 → 16.6) are just a container swap.</li>
</ul>
<h5>What survives what</h5>
<ul class="pts">
<li><code>docker stop</code>/<code>start</code>/<code>restart</code>, daemon restart, host reboot: everything survives, including the writable layer.</li>
<li><code>docker rm</code> + new <code>docker run</code> with the <b>same named volume</b>: data survives. This is the normal upgrade/redeploy path.</li>
<li><code>docker rm</code> + new <code>docker run</code> with <b>no volume</b>: the new container gets a new anonymous volume; the old data sits in an orphaned anonymous volume (recoverable until pruned), but the app sees an empty database.</li>
<li><code>docker rm -v</code>, <code>docker run --rm</code>, <code>docker compose down -v</code>, <code>docker volume rm</code>, <code>docker volume prune</code>: the data is deleted.</li>
</ul>
<h5>Backup strategies</h5>
<ul class="pts">
<li><b>Logical, application-consistent: <code>pg_dump</code></b> (one database) / <code>pg_dumpall</code> (cluster incl. roles). Runs against a live database inside a consistent snapshot (MVCC). Custom format <code>-Fc</code> is compressed and restorable selectively with <code>pg_restore</code>. Portable across major versions and architectures. The default choice for most teams.</li>
<li><b>Physical, file-level: tar of the volume</b> with a throwaway container. Simple and fast, captures everything (all databases, config). <b>Only consistent if Postgres is stopped</b> (or you use a filesystem snapshot, or <code>pg_basebackup</code>). Restorable only into the same major version.</li>
<li><b>Continuous: <code>pg_basebackup</code> + WAL archiving</b> (pgBackRest, WAL-G, Barman) for point-in-time recovery; standard in serious production, often replaced by a managed database.</li>
<li>Docker-level helpers: <code>--volumes-from</code> attaches all volumes of another container to a backup container; <code>docker cp</code> copies files out of a container (fine for small files, not for live database directories).</li>
</ul>
<h5>Storage driver vs where the database writes</h5>
<p>overlay2 is the storage driver for image and writable layers. A database must not write through it: Postgres's write-ahead log does frequent <code>fsync</code>s and random writes that suffer from overlay copy-up and are lost on <code>docker rm</code>. A volume bypasses overlay2 and gives Postgres a normal ext4/xfs directory, with performance essentially equal to running on the host.</p>`,
      why: `<p>The whole point of containers is that you can delete and recreate them at will: to upgrade from <code>postgres:16.4</code> to <code>16.6</code>, to change a setting, to recover from a crash, or because Compose decided the configuration changed. If the data lived in the container, every one of those routine operations would be a data-loss incident.</p>
<p>Separating data from the container also makes the remaining operational questions explicit: <i>where</i> is the data (which volume, which disk), <i>how is it backed up</i> and <i>how is it restored</i>. Before Docker, a database's data directory was implicitly "on the server"; with containers you must name it, which is a good thing because it forces a backup plan.</p>
<p>Backups exist because volumes protect only against container deletion, not against <code>DROP TABLE</code>, disk failure, ransomware, a mistaken <code>docker compose down -v</code>, or losing the host. "We use a volume" is persistence, not durability.</p>`,
      diagram: {
        html: flow([["FastAPI container", "postgres:5432 over appnet", "w"], ["postgres container v1", "replaceable process"], ["named volume pgdata", "/var/lib/docker/volumes/pgdata/_data", "g"]]) +
          flow([["docker rm -f postgres", "container gone", "r"], ["docker run … -v pgdata:…", "postgres container v2"], ["same pgdata", "initdb skipped, rows intact", "g"]]) +
          lanes([
            ["File-level backup", ["stop postgres", "alpine + tar czf from pgdata", "pgdata.tgz on host / off-site", "restore: tar xzf into new volume", "same major version only"]],
            ["Logical backup", ["pg_dump -Fc while running", "app.dump (consistent snapshot)", "restore: pg_restore into any version ≥", "selective (one table) possible", "slower for very large DBs"]]
          ]),
        steps: [
          "PostgreSQL writes to <code>PGDATA</code>, which is a bind mount of the named volume's <code>_data</code> directory, so its files live outside the container's writable layer.",
          "Removing the container deletes only the container's writable layer and metadata; the volume's reference count drops to 0 but the volume stays.",
          "A new container started with the same <code>-v pgdata:/var/lib/postgresql/data</code> finds <code>PG_VERSION</code>, skips initdb, performs crash recovery from the WAL if needed and serves the old data.",
          "For a file-level backup, a throwaway container mounts the volume read-only and tars it to a bind-mounted host directory; restoring reverses this into a new volume.",
          "For a logical backup, <code>pg_dump</code> runs inside the postgres container (or any client) and streams a consistent dump to the host; <code>pg_restore</code> loads it into any compatible server."
        ]
      },
      cmds: [
        {
          t: "Set up: network, PostgreSQL with a named volume, FastAPI",
          lang: "sh",
          code: `docker network create appnet
docker volume create pgdata
docker run -d --name postgres --network appnet \\
  -e POSTGRES_USER=app -e POSTGRES_PASSWORD=secret -e POSTGRES_DB=app \\
  --mount type=volume,src=pgdata,dst=/var/lib/postgresql/data \\
  postgres:16
docker logs postgres 2>&1 | tail -2
docker run -d --name api --network appnet -p 8000:8000 \\
  -e DATABASE_URL=postgresql://app:secret@postgres:5432/app myorg/api:1.0`,
          out: `2026-11-16 10:40:12.311 UTC [1] LOG:  database system is ready to accept connections
…`,
          note: `<p><code>myorg/api:1.0</code> is the FastAPI image from Day 3 extended with <code>POST /notes</code> and <code>GET /notes</code> (a <code>notes(id serial, body text)</code> table created at startup). Any FastAPI + SQLAlchemy/asyncpg app works the same way.</p>`
        },
        {
          t: "Write data through the API (and check it in psql)",
          lang: "sh",
          code: `curl -s -X POST localhost:8000/notes -H 'content-type: application/json' -d '{"body":"first note"}'
curl -s -X POST localhost:8000/notes -H 'content-type: application/json' -d '{"body":"survives recreation"}'
curl -s localhost:8000/notes
docker exec postgres psql -U app -d app -c 'select count(*) from notes'`,
          out: `{"id":1,"body":"first note"}
{"id":2,"body":"survives recreation"}
[{"id":1,"body":"first note"},{"id":2,"body":"survives recreation"}]
 count
-------
     2
(1 row)`
        },
        {
          t: "Destroy and recreate PostgreSQL: data survives",
          lang: "sh",
          code: `docker rm -f postgres
docker volume ls --filter name=pgdata
docker run -d --name postgres --network appnet \\
  -e POSTGRES_USER=app -e POSTGRES_PASSWORD=secret -e POSTGRES_DB=app \\
  --mount type=volume,src=pgdata,dst=/var/lib/postgresql/data \\
  postgres:16
docker logs postgres 2>&1 | grep -E 'Skipping initialization|ready to accept'
curl -s localhost:8000/notes`,
          out: `postgres
DRIVER    VOLUME NAME
local     pgdata
PostgreSQL Database directory appears to contain a database; Skipping initialization
… LOG:  database system is ready to accept connections
[{"id":1,"body":"first note"},{"id":2,"body":"survives recreation"}]`,
          note: `<p>"Skipping initialization" is the line that proves the container found existing data. The API may log a transient connection error while Postgres was down; a connection pool with <code>pool_pre_ping</code> or retry logic reconnects automatically, which is exactly what you want during upgrades. The same procedure with a new tag (<code>postgres:16.6</code>) is a minor-version upgrade.</p>`
        },
        {
          t: "Counter-example: no volume, data is \"lost\"",
          lang: "sh",
          code: `docker run -d --name pg-tmp --network appnet -e POSTGRES_PASSWORD=secret postgres:16
sleep 5; docker exec pg-tmp psql -U postgres -c "create table t(x int); insert into t values (42);"
docker rm -f pg-tmp
docker run -d --name pg-tmp --network appnet -e POSTGRES_PASSWORD=secret postgres:16
sleep 5; docker exec pg-tmp psql -U postgres -c "select * from t"
docker volume ls -f dangling=true`,
          out: `CREATE TABLE
INSERT 0 1
pg-tmp
ERROR:  relation "t" does not exist
DRIVER    VOLUME NAME
local     5b0f3e…a1      <- the old data is still here, orphaned
local     9c1e4f…e2`,
          note: `<p>The image's <code>VOLUME</code> gave each container its own anonymous volume. The second container started from a fresh, empty one. The old data is recoverable by mounting that dangling volume by its long name, until someone runs <code>docker volume prune</code>. With <code>docker run --rm</code> or <code>docker rm -v</code> it would be gone for good. Lesson: always name the volume.</p>`
        },
        {
          t: "File-level backup of the volume to a tar file (throwaway container)",
          lang: "sh",
          code: `mkdir -p backups
docker stop postgres                       # consistency: no writes during the copy
docker run --rm \\
  --mount type=volume,src=pgdata,dst=/source,readonly \\
  -v "$PWD/backups":/backup \\
  alpine:3.20 tar czf /backup/pgdata-2026-11-16.tgz -C /source .
docker start postgres
ls -lh backups/
tar tzf backups/pgdata-2026-11-16.tgz | head -4`,
          out: `-rw-r--r-- 1 root root 6.1M Nov 16 10:52 pgdata-2026-11-16.tgz
./
./PG_VERSION
./base/
./global/`,
          note: `<p><code>-C /source .</code> stores relative paths so the archive can be extracted into any directory. tar run as root records numeric UIDs/GIDs (999 for postgres in Debian images), which are restored on extraction. Backing up a running Postgres this way can produce a corrupt copy; either stop it, use a filesystem snapshot, or use <code>pg_basebackup</code>/<code>pg_dump</code>. The backup file is owned by root because the container ran as root; <code>chown</code> it or run tar with <code>--user</code> if needed.</p>`
        },
        {
          t: "Restore the tar into a NEW volume and start a second Postgres on it",
          lang: "sh",
          code: `docker volume create pgdata_restored
docker run --rm \\
  -v pgdata_restored:/target \\
  -v "$PWD/backups":/backup:ro \\
  alpine:3.20 sh -c 'tar xzf /backup/pgdata-2026-11-16.tgz -C /target && ls -ln /target | head -3'
docker run -d --name postgres-restored --network appnet \\
  -v pgdata_restored:/var/lib/postgresql/data postgres:16
sleep 5; docker exec postgres-restored psql -U app -d app -c 'select * from notes'`,
          out: `total 64
-rw------- 1 999 999     3 Nov 16 10:40 PG_VERSION
drwx------ 6 999 999  4096 Nov 16 10:40 base
 id |        body
----+---------------------
  1 | first note
  2 | survives recreation
(2 rows)`,
          note: `<p>No <code>POSTGRES_*</code> variables were needed: initialisation was skipped because the restored directory already contains a cluster with the <code>app</code> role and database. The restored volume must be used with the same major version (16) that wrote it.</p>`
        },
        {
          t: "Application-consistent backup with pg_dump / pg_restore",
          lang: "sh",
          code: `# live, consistent snapshot; custom format, compressed
docker exec postgres pg_dump -U app -d app -Fc > backups/app-2026-11-16.dump
ls -lh backups/app-2026-11-16.dump
# restore into a fresh server (can even be a newer major version)
docker run -d --name pg17 --network appnet -e POSTGRES_USER=app -e POSTGRES_PASSWORD=secret -e POSTGRES_DB=app -v pg17data:/var/lib/postgresql/data postgres:17
sleep 5
docker exec -i pg17 pg_restore -U app -d app --clean --if-exists --no-owner < backups/app-2026-11-16.dump
docker exec pg17 psql -U app -d app -tc 'select count(*) from notes'
# roles and all databases: pg_dumpall (plain SQL)
docker exec postgres pg_dumpall -U app --roles-only > backups/roles.sql`,
          out: `-rw-r--r-- 1 dev dev 2.3K Nov 16 11:02 backups/app-2026-11-16.dump
     2`,
          note: `<p>Use <code>docker exec -i</code> (no <code>-t</code>) when piping binary data in or out; a TTY corrupts the stream. In PowerShell 5.1, <code>&gt;</code> re-encodes output as text and will corrupt a binary dump; run this from bash/WSL, or write the dump inside the container (<code>pg_dump -f /tmp/app.dump</code>) and <code>docker cp</code> it out.</p>`
        },
        {
          t: "Inspect where the data really is, and the storage driver",
          lang: "sh",
          code: `docker inspect -f '{{range .Mounts}}{{.Type}} {{.Name}} {{.Source}} -> {{.Destination}} rw={{.RW}}{{println}}{{end}}' postgres
docker info --format '{{.Driver}}'
docker inspect -f '{{.GraphDriver.Name}} {{.GraphDriver.Data.UpperDir}}' postgres
docker ps -s --filter name=postgres --format '{{.Names}} {{.Size}}'`,
          out: `volume pgdata /var/lib/docker/volumes/pgdata/_data -> /var/lib/postgresql/data rw=true
overlay2
overlay2 /var/lib/docker/overlay2/6f1c…/diff
postgres 63B (virtual 453MB)`,
          note: `<p>The container's own writable layer is 63 bytes: all the database bytes are in the volume. With the containerd image store, <code>docker info</code> reports the snapshotter (e.g. <code>overlayfs</code>) and <code>GraphDriver</code> output differs; the volume path does not.</p>`
        },
        {
          t: "Clean up (and the commands that really delete data)",
          lang: "sh",
          code: `docker rm -f api postgres postgres-restored pg17 pg-tmp
docker volume ls
# DANGER: these delete database files
docker volume rm pgdata_restored pg17data
# docker rm -v <ctr>            -> removes the container's anonymous volumes
# docker compose down -v        -> removes the project's named + anonymous volumes (Day 5)
# docker volume prune -a        -> removes every unused volume`,
          note: `<p>Treat <code>-v</code> on <code>down</code>/<code>rm</code> and <code>volume prune -a</code> like <code>rm -rf</code> on a database server. In production, mark critical volumes <code>external: true</code> in Compose so <code>down -v</code> cannot remove them.</p>`
        }
      ],
      internals: `<p><b>What the postgres entrypoint does.</b> <code>docker-entrypoint.sh</code> runs as root first: it creates <code>PGDATA</code> if needed, <code>chown</code>s it to <code>postgres</code> and <code>chmod 700</code>s it, then re-executes itself as the <code>postgres</code> user via <code>gosu</code>. If <code>$PGDATA/PG_VERSION</code> is missing it runs <code>initdb</code>, starts a temporary server listening only on the Unix socket, creates the user/database, runs <code>/docker-entrypoint-initdb.d/*</code>, stops the temporary server, and finally <code>exec</code>s <code>postgres</code> as PID 1 so it receives <code>SIGTERM</code> on <code>docker stop</code> and performs a clean "smart/fast" shutdown with a checkpoint.</p>
<p><b>Why clean shutdown matters.</b> <code>docker stop</code> sends SIGTERM, then SIGKILL after the timeout (10 s by default). Postgres needs time to checkpoint on busy systems; use <code>docker stop -t 60</code> or <code>--stop-timeout</code> / Compose <code>stop_grace_period</code>. After a SIGKILL the data is not lost (WAL guarantees durability of committed transactions) but the next start does crash recovery, which takes longer.</p>
<p><b>The volume path.</b> For <code>--mount type=volume,src=pgdata,dst=/var/lib/postgresql/data</code>, dockerd asks the <code>local</code> driver to mount <code>pgdata</code>; the driver returns <code>/var/lib/docker/volumes/pgdata/_data</code> (with no options there is nothing to actually mount). runc then bind-mounts that directory onto the destination inside the container's mount namespace. Postgres's <code>open()</code>/<code>write()</code>/<code>fsync()</code> calls therefore go straight to the host's ext4/xfs, no overlayfs involved. You can verify with <code>cat /proc/$(docker inspect -f '{{.State.Pid}}' postgres)/mountinfo | grep postgresql</code>.</p>
<p><b>The throwaway backup container</b> is an ordinary container whose only job is <code>tar</code>. Both the volume and the host's <code>./backups</code> are bind-mounted into its mount namespace; tar reads one and writes the other; <code>--rm</code> removes the container (and only its anonymous volumes, of which it has none). The same pattern works for any volume, any image (Redis <code>/data</code>, uploads) and any tool (<code>rsync</code>, <code>restic</code>, <code>aws s3 cp</code>).</p>
<p><b>Why file-level copies of a live database are unsafe.</b> Postgres writes data files lazily and relies on WAL replay to make them consistent after a crash. tar reads files at different moments while pages are changing, producing a set of files that no single crash could have produced; recovery may fail or silently produce wrong data. <code>pg_dump</code> instead opens a transaction with a single MVCC snapshot and reads logical rows, so it is consistent while the server keeps running. <code>pg_basebackup</code> copies files but also streams the WAL needed to make them consistent.</p>
<p><b>Major version layout.</b> The on-disk format is tied to the major version (<code>PG_VERSION</code> contains e.g. <code>16</code>); the server refuses to start on another major version's directory. The postgres 18 images moved to a per-version directory layout under <code>/var/lib/postgresql</code> partly to make <code>pg_upgrade --link</code> between versions in the same volume practical.</p>`,
      prod: `<p><b>Production PostgreSQL in the React → FastAPI → Redis → PostgreSQL stack on Docker hosts:</b></p>
<ul class="pts">
<li><b>Volume</b>: named volume <code>pgdata</code> (or a bind mount of a dedicated, monitored disk such as <code>/srv/pg/data</code> on fast SSD/EBS with correct ownership). In Compose mark it <code>external: true</code> or at least never run <code>down -v</code> in production automation.</li>
<li><b>Upgrades</b>: minor version = pull new tag, recreate container (seconds of downtime; the API's pool reconnects). Major version = <code>pg_dump</code>/<code>pg_restore</code> into a new container with a new volume, verify, switch <code>DATABASE_URL</code>, keep the old volume until confident.</li>
<li><b>Backups</b>: nightly <code>pg_dump -Fc</code> from a scheduled job container (cron, CI, or a sidecar) shipped to off-host object storage with retention and encryption; WAL archiving (pgBackRest/WAL-G) when RPO must be minutes; volume tar snapshots only with the DB stopped or via storage snapshots.</li>
<li><b>Restore drills</b>: a backup you have not restored is a hope. Automate restore into a throwaway container weekly and run a smoke query (row counts, latest timestamp).</li>
<li><b>Redis</b>: if it is a pure cache, losing it on recreate is acceptable (FastAPI repopulates from Postgres). If it stores sessions/queues, give it a named volume at <code>/data</code> with <code>appendonly yes</code>.</li>
<li><b>Single-host limits</b>: a local volume ties the database to one machine. For multi-host high availability use replication (Patroni etc.) or, more commonly, a managed database (RDS/Cloud SQL) while containers run the stateless tiers. Many teams run Postgres in Docker for dev/test/CI and managed Postgres in production; the same <code>DATABASE_URL</code> pattern covers both.</li>
</ul>`,
      iq: [
        ["dca", "A PostgreSQL container was started with <code>-v pgdata:/var/lib/postgresql/data</code>. The operator runs <code>docker rm -f -v db</code>. What happens to the data?", "<p>It survives. <code>-v</code> on <code>docker rm</code> removes only <b>anonymous</b> volumes associated with the container; named volumes are never removed by <code>docker rm</code>. The data is deleted only by <code>docker volume rm pgdata</code>, <code>docker volume prune -a</code> (if unused) or <code>docker compose down -v</code> if the volume belongs to a Compose project.</p>"],
        ["dca", "Which command backs up the contents of volume <code>dbdata</code> into the current directory as a tar archive without installing anything on the host?", "<p><code>docker run --rm -v dbdata:/data:ro -v \"$PWD\":/backup alpine tar czf /backup/dbdata.tgz -C /data .</code> (or the classic <code>--volumes-from db</code> variant). <code>docker volume export</code> does not exist in the Docker CLI; <code>docker cp</code> works on containers, not directly on volumes; <code>docker save</code> exports images, not volumes.</p>"],
        ["dca", "Which TWO actions remove a container's anonymous volumes? (A) <code>docker rm -v ctr</code> (B) <code>docker stop ctr</code> (C) the container exits when started with <code>--rm</code> (D) <code>docker restart ctr</code>", "<p><b>A and C.</b> <code>--rm</code> removes the container and its anonymous volumes on exit. B and D keep both the container's writable layer and all volumes.</p>"],
        ["dca", "Which storage driver is the recommended default for Docker Engine on modern Linux distributions, and what does it store?", "<p><code>overlay2</code>. It stores image layers and container writable layers under <code>/var/lib/docker/overlay2</code> using the kernel overlay filesystem. It does not store volumes; those are handled by volume drivers (default <code>local</code>) under <code>/var/lib/docker/volumes</code>. (Installations using the containerd image store use containerd's overlayfs snapshotter, which is equivalent in principle.)</p>"],
        ["mid", "You changed <code>POSTGRES_PASSWORD</code> in your configuration and recreated the container, but the API now fails authentication with the new password. Why?", "<p>The <code>POSTGRES_*</code> variables are used only by initdb on an empty data directory. The existing volume already contains the cluster with the old password, so initialisation is skipped. Change it in the database (<code>ALTER USER app PASSWORD '…'</code> via <code>docker exec … psql</code>) and then update the app's configuration, or (dev only) delete the volume and re-initialise.</p>"],
        ["mid", "Why is <code>pg_dump</code> preferred to tarring the volume for routine backups?", "<p>It is consistent while the database is running (single MVCC snapshot), portable across major versions and CPU architectures, selectively restorable, and usually smaller. A tar of a live data directory may be corrupt; it must be taken with Postgres stopped or via a snapshot, and can only be restored into the same major version. Tar/physical backups are faster for very large clusters and capture everything, which is why tools like pgBackRest do physical backups with WAL to make them consistent.</p>"],
        ["senior", "How would you upgrade a containerised PostgreSQL 16 to 17 with minimal risk?", "<p>Take a fresh <code>pg_dump -Fc</code> (and <code>pg_dumpall --roles-only</code>); start <code>postgres:17</code> with a <b>new</b> volume on the same network under a different name; <code>pg_restore</code>; run smoke tests and compare row counts; schedule a short write freeze, take a final dump/restore (or use logical replication to cut the freeze to seconds); switch <code>DATABASE_URL</code> (or the container name/alias) to the new server; keep the old container and volume untouched for rollback. Never point 17 at the 16 volume. For very large databases use <code>pg_upgrade</code> (e.g. via a community image that bundles both versions).</p>"],
        ["lead", "A teammate proposes running production Postgres in Docker on a single VM with a named volume. What questions do you ask before agreeing?", "<p>What are the RPO/RTO targets? How are backups taken, encrypted, shipped off-host and restore-tested? What happens when the VM or its disk dies (is there a replica or a storage snapshot)? Who handles minor/major upgrades and how? Is the volume on a persistent disk with enough IOPS and monitored for space? How do we prevent <code>down -v</code>/<code>prune</code> accidents? If the answers are weak, a managed database plus stateless containers is usually the better trade-off.</p>"]
      ],
      gotchas: [
        "<b>Init variables only work once.</b> <code>POSTGRES_USER</code>/<code>PASSWORD</code>/<code>DB</code> and <code>/docker-entrypoint-initdb.d</code> scripts run only on an empty data directory. Changing them later does nothing.",
        "<b>Mount at the right path for your tag.</b> If the volume is mounted somewhere other than where <code>PGDATA</code> points (for example after the postgres 18 layout change, or a custom <code>PGDATA</code>), the database silently writes to an anonymous volume and you lose data on recreate.",
        "<b>Major versions are incompatible on disk.</b> <code>postgres:latest</code> moving to a new major breaks startup on an old volume. Pin at least the major (<code>postgres:16</code>), ideally the minor.",
        "<b>Bind-mounting PGDATA from Windows/macOS paths</b> commonly fails (\"data directory has wrong ownership\", or fsync/performance issues). Use a named volume.",
        "<b>A dangling anonymous volume may be your only copy.</b> Before running <code>docker volume prune</code> after an accident, check <code>docker volume ls -f dangling=true</code> and inspect candidates.",
        "<b>Piping dumps through PowerShell or <code>docker exec -t</code> corrupts binary data.</b> Use <code>-i</code> without <code>-t</code> and a byte-safe shell, or write the file inside the container and <code>docker cp</code> it.",
        "<b>A tar backup of a running database may be unusable.</b> Stop the container, snapshot the filesystem, or use pg_dump/pg_basebackup.",
        "<b>Restored file ownership</b>: extracting as a non-root user or into an Alpine-based postgres image (UID 70) can leave files owned by the wrong UID (999). Extract as root and use the same image family, or <code>chown -R</code> afterwards."
      ],
      best: [
        "Always give stateful containers an explicitly named volume at the exact data path the image documents.",
        "Pin database images to a major (and preferably minor) version; upgrade majors deliberately with dump/restore or pg_upgrade.",
        "Automate <code>pg_dump -Fc</code> backups to off-host storage, encrypt them, keep a retention policy, and test restores on a schedule.",
        "Give databases a generous stop timeout (<code>--stop-timeout 60</code> / <code>stop_grace_period: 60s</code>) for clean shutdowns.",
        "Protect production volumes from automation accidents: external volumes in Compose, no <code>-v</code> on <code>down</code>, labels plus filtered prune commands.",
        "Make the API resilient to database restarts (connection pool with pre-ping and retries) so recreating Postgres is a non-event."
      ],
      lab: [
        "Create <code>appnet</code> and a named volume <code>pgdata</code>; run <code>postgres:16</code> with it and the FastAPI notes API (or plain <code>psql</code> if you have no API yet). Insert a few rows.",
        "<code>docker rm -f postgres</code>, recreate it with the same volume, look for \"Skipping initialization\" in the logs and confirm the rows are still there via the API.",
        "Repeat without any <code>-v</code>: insert, remove, recreate, observe the empty database, then find the orphaned anonymous volume and recover the data by mounting it by name into a new container.",
        "Stop Postgres, back up <code>pgdata</code> to <code>backups/pgdata.tgz</code> with an alpine throwaway container, start it again.",
        "Restore the archive into a new volume <code>pgdata_restored</code>, start <code>postgres-restored</code> on it and query the rows.",
        "Take a <code>pg_dump -Fc</code> backup, restore it into a <code>postgres:17</code> container with its own volume, and compare row counts.",
        "<b>Done when:</b> you have destroyed the Postgres container at least twice without losing data, restored from both a tar and a dump, and can state which commands would have deleted the data."
      ],
      teach: `<p>"A database container is disposable; its data is not. So you mount a named volume at the data directory, for Postgres that's <code>PGDATA</code>, <code>/var/lib/postgresql/data</code> on version 16. Now you can <code>docker rm -f</code> the container and run a new one with the same volume: the entrypoint sees the existing cluster, logs 'Skipping initialization', and every row is still there. That is also how you do minor upgrades.</p>
<p>Without a named volume, the Postgres image's VOLUME instruction quietly creates an anonymous volume per container. Recreate the container and you get a new empty one; the old data is orphaned, and <code>volume prune</code> or <code>rm -v</code> will delete it. Name your volumes.</p>
<p>A volume is persistence, not a backup. For a file-level backup, stop Postgres and run a throwaway alpine container that mounts the volume and a host directory and tars one into the other; restore by untarring into a new volume. For routine, consistent, version-portable backups use <code>pg_dump -Fc</code> and <code>pg_restore</code>. And remember the storage driver, overlay2, is for image layers; databases should never write through it."</p>`
    }
  ],
  quiz: [
    {
      q: "After a routine redeploy, the app's PostgreSQL database is empty. The deploy script did this. What went wrong, and is the data recoverable?",
      code: `docker rm -f db
docker run -d --name db --network appnet -e POSTGRES_PASSWORD=secret postgres:16`,
      lang: "sh",
      ans: "No volume was named, so each container got its own anonymous volume; the old data is in an orphaned volume.",
      why: "The postgres image declares <code>VOLUME /var/lib/postgresql/data</code>. <code>docker rm -f</code> without <code>-v</code> keeps the old anonymous volume. Find it with <code>docker volume ls -f dangling=true</code> (check <code>CreatedAt</code> via inspect), mount it by its ID into a new container, or copy it into a named volume. Then fix the script to use <code>-v pgdata:/var/lib/postgresql/data</code>."
    },
    {
      q: "An nginx container is started with <code>-v ./nginx/default.conf:/etc/nginx/conf.d/default.conf</code> from the wrong directory. nginx fails with <code>\"/etc/nginx/conf.d/default.conf\" is a directory</code>. Explain.",
      ans: "The bind source did not exist, so <code>-v</code> created a directory with that name on the host and mounted it.",
      why: "<code>-v</code> auto-creates missing bind sources as directories. With <code>--mount type=bind,…</code> the run would have failed immediately with \"bind source path does not exist\", pointing at the real problem (wrong working directory). Delete the stray directory and use the correct path."
    },
    {
      q: "A developer runs the backup below every night while Postgres is running. A restore test produces <code>invalid page in block …</code> errors. Why, and what should they do instead?",
      code: `docker run --rm --volumes-from db -v "$PWD":/backup alpine tar czf /backup/db.tgz /var/lib/postgresql/data`,
      lang: "sh",
      ans: "A file-level copy of a running database is not consistent.",
      why: "tar reads data files at different moments while Postgres writes them and the WAL needed to reconcile them is not captured consistently. Use <code>docker exec db pg_dump -Fc</code> (consistent while running), stop the container for the tar, or use <code>pg_basebackup</code>/pgBackRest for physical backups."
    },
    {
      q: "Which TWO statements are true? (A) <code>docker volume prune</code> on a current Engine removes unused named volumes by default. (B) A tmpfs mount's contents are lost when the container stops. (C) An empty named volume is pre-populated from the image's content at the mount point. (D) Bind mounts are pre-populated from the image too.",
      ans: "B and C.",
      why: "A: since Engine 23, prune without <code>--all</code> removes only anonymous volumes. D: bind mounts always show the host directory's content and hide the image's."
    },
    {
      q: "The team changes the image tag from <code>postgres:16</code> to <code>postgres:latest</code> and recreates the container on the same volume. It exits immediately with <code>database files are incompatible with server</code>. What happened and how do you recover?",
      ans: "<code>latest</code> is a newer major version, which cannot read the version 16 data directory.",
      why: "Roll back to <code>postgres:16</code> on the same volume (data is untouched). Then plan a real upgrade: <code>pg_dump</code> from 16 and <code>pg_restore</code> into the new major with a new volume, or <code>pg_upgrade</code>. Pin major versions in production."
    },
    {
      q: "A FastAPI service runs with <code>--read-only</code>. It crashes at startup with <code>OSError: [Errno 30] Read-only file system: '/tmp/…'</code>. What is the minimal fix that keeps the hardening?",
      ans: "Add a tmpfs mount for the writable scratch path: <code>--tmpfs /tmp</code>.",
      why: "<code>--read-only</code> makes the root filesystem immutable; the app (or a library like multipart upload parsing) needs writable temporary space. tmpfs gives it in memory without making the image writable. Removing <code>--read-only</code> would also work but throws away the protection."
    }
  ]
},
/* ===== Day 5 ===== */
{
  n: 5,
  title: "Docker Compose",
  goal: "<b>By the end of today</b> you can replace a page of <code>docker network create</code> / <code>docker volume create</code> / <code>docker run</code> commands with one declarative <code>compose.yaml</code>, explain exactly how Compose names, wires and starts things, and run a health-checked React → FastAPI → Redis + PostgreSQL stack that starts in the right order, hot-reloads in development and tears down safely.",
  rev: [
    "<b>Compose = declarative multi-container app.</b> One file (Compose Specification, <code>compose.yaml</code>; the top-level <code>version:</code> key is obsolete and ignored) declares <code>services</code>, <code>networks</code>, <code>volumes</code> (plus <code>configs</code>/<code>secrets</code>). <code>docker compose</code> (v2, a CLI plugin) turns it into API calls to the Engine; there is no Compose daemon.",
    "<b>Project:</b> name from <code>-p</code> &gt; <code>COMPOSE_PROJECT_NAME</code> &gt; top-level <code>name:</code> &gt; directory name. Resources are named <code>&lt;project&gt;_default</code> (network), <code>&lt;project&gt;_pgdata</code> (volume), <code>&lt;project&gt;-api-1</code> (container) and tracked with <code>com.docker.compose.*</code> labels. Every service is reachable by its <b>service name</b> on the project network.",
    "<b>Config:</b> <code>.env</code> feeds <code>\${VAR}</code> interpolation in the YAML (shell env wins over .env; <code>\${VAR:-default}</code>, <code>\${VAR:?error}</code>, <code>$$</code> for a literal $). <code>environment:</code> and <code>env_file:</code> set variables inside containers (<code>run -e</code> &gt; <code>environment</code> &gt; <code>env_file</code> &gt; image <code>ENV</code>). <code>docker compose config</code> shows the final rendered model.",
    "<b>Startup order:</b> <code>depends_on</code> short form only orders container <i>start</i>; use <code>condition: service_healthy</code> (with a <code>healthcheck</code>) and <code>service_completed_successfully</code> (migrations) for readiness. <code>restart:</code> no | always | on-failure | unless-stopped.",
    "<b>Lifecycle:</b> <code>up -d --build</code>, <code>ps</code>, <code>logs -f</code>, <code>exec</code>, <code>run --rm</code>, <code>stop</code>/<code>restart</code>, <code>down</code> (containers + networks), <code>down -v</code> (also named volumes declared in the file + anonymous volumes: your database!). Dev: <code>compose.override.yaml</code> auto-loaded, <code>-f</code> stacking, <code>profiles</code>, <code>include</code>, <code>docker compose watch</code>, <code>--scale</code>."
  ],
  topics: [
    {
      id: "d5-compose",
      title: "Compose files: services, networks, volumes and configuration",
      lv: ["fresher", "mid", "senior", "dca"],
      eli5: `<p>On Days 3 and 4 you ran the app by typing a long list of instructions: "build a switchboard called appnet, set up a locker called pgdata, start the database chef with these settings, start the API chef with those settings…". Every teammate had to type the same list in the same order, and one typo broke everything.</p>
<p>Compose is the <b>recipe card</b>. You write down, once, what the finished meal looks like: these four cooks, this locker, this switchboard, these settings. Then anyone says "make it" (<code>docker compose up</code>) and the kitchen sets everything up, in the right order, with the right names. "Clean up" (<code>docker compose down</code>) clears the counters but leaves the lockers alone unless you explicitly say "and empty the lockers" (<code>-v</code>).</p>
<p>The recipe can have blanks ("use the password written on the sticky note", which is the <code>.env</code> file), optional extras ("add the debugging tools only if I ask", which are profiles) and a second card with changes for practice cooking at home (the override file used in development).</p>`,
      what: `<p><b>Docker Compose</b> is a tool for defining and running multi-container applications from a YAML file that follows the <b>Compose Specification</b> (an open spec shared by Docker Compose v2 and other implementations). Compose v2 is a Go CLI plugin invoked as <code>docker compose</code>; the old Python <code>docker-compose</code> v1 is end-of-life. Compose is a client: it reads the file, computes the desired state and calls the same Engine API as <code>docker run</code>.</p>
<h5>File and project</h5>
<ul class="pts">
<li>Default file names, in order of preference: <code>compose.yaml</code>, <code>compose.yml</code>, then the legacy <code>docker-compose.yaml</code>/<code>.yml</code>. If an override file (<code>compose.override.yaml</code> or <code>docker-compose.override.yml</code>) exists next to it, it is <b>merged automatically</b>.</li>
<li>The <code>version: "3.8"</code> key is <b>obsolete</b>: Compose v2 ignores it and prints a warning. The spec unified the old v2/v3 formats.</li>
<li>The <b>project name</b> namespaces everything Compose creates. Resolution: <code>-p</code> flag, then <code>COMPOSE_PROJECT_NAME</code>, then the top-level <code>name:</code>, then the base name of the project directory (lowercased, invalid characters removed). Two checkouts in folders with the same name collide unless you set one.</li>
</ul>
<h5>Top-level elements</h5>
<ul class="pts">
<li><b><code>services</code></b>: each service is a template for one or more identical containers. Key attributes:
<ul>
<li><code>image</code>: image to run (and the tag to apply when building, if <code>build</code> is also set).</li>
<li><code>build</code>: a context path, or a mapping with <code>context</code>, <code>dockerfile</code>, <code>args</code> (build-time ARGs), <code>target</code> (multi-stage target), <code>cache_from</code>, <code>secrets</code>, <code>platforms</code>…</li>
<li><code>command</code> / <code>entrypoint</code>: override the image's <code>CMD</code> / <code>ENTRYPOINT</code> (exec form as a list is safest; setting <code>entrypoint</code> also clears the image's CMD).</li>
<li><code>ports</code>: <code>"8080:80"</code>, <code>"127.0.0.1:5432:5432"</code>, <code>"53:53/udp"</code>, or long form <code>{target, published, host_ip, protocol}</code>. Quote short forms: YAML 1.1 parses some <code>xx:yy</code> as base-60 numbers. <code>expose</code> documents container ports only.</li>
<li><code>environment</code> (map or list) and <code>env_file</code> (one or more files of <code>KEY=VALUE</code> lines, injected into the <b>container</b>).</li>
<li><code>volumes</code>: <code>pgdata:/var/lib/postgresql/data</code> (named, must be declared top-level), <code>./backend:/app</code> (bind, relative to the compose file), <code>/data</code> (anonymous), or long form with <code>type</code>, <code>source</code>, <code>target</code>, <code>read_only</code>. Plus <code>tmpfs:</code>.</li>
<li><code>networks</code>: which project networks to join, optionally with <code>aliases</code> and fixed <code>ipv4_address</code>. Omitted means the project's <code>default</code> network.</li>
<li><code>depends_on</code>, <code>healthcheck</code>, <code>restart</code>, <code>profiles</code>, <code>develop.watch</code>, <code>extra_hosts</code>, <code>user</code>, <code>read_only</code>, <code>init</code>, <code>stop_grace_period</code>, <code>deploy</code> (resources, replicas; full semantics in Swarm), <code>logging</code>, <code>labels</code>.</li>
</ul></li>
<li><b><code>networks</code></b>: Compose always creates <code>&lt;project&gt;_default</code> (a user-defined bridge, so service-name DNS works) unless every service specifies others. Declare more for tier isolation (<code>internal: true</code>, <code>driver</code>, <code>ipam</code>), or <code>external: true</code> to use one created outside the project.</li>
<li><b><code>volumes</code></b>: named volumes used by services must be declared here; they become <code>&lt;project&gt;_&lt;name&gt;</code> unless you set <code>name:</code>. <code>external: true</code> means "must already exist; Compose never creates or deletes it".</li>
<li><b><code>configs</code> / <code>secrets</code></b>: files mounted into containers (secrets under <code>/run/secrets/&lt;name&gt;</code>). With plain Compose they are bind mounts of local files or env values; in Swarm they are stored encrypted in the cluster (Day 10).</li>
<li><b><code>include</code></b>: pull in other Compose files as sub-projects (each resolved relative to its own directory), useful for sharing a standard Postgres or observability stack across repos.</li>
<li><b><code>name</code></b>: the project name. Extension fields <code>x-…</code> plus YAML anchors (<code>&amp;defaults</code>, <code>&lt;&lt;: *defaults</code>) remove repetition.</li>
</ul>
<h5>Variables: two different mechanisms</h5>
<ul class="pts">
<li><b>Interpolation</b> (<code>\${VAR}</code> in the YAML) happens when Compose <i>reads the file</i>. Values come from the shell environment, then from the <code>.env</code> file in the project directory (or files given with <code>--env-file</code>). Shell wins over <code>.env</code>. Syntax: <code>\${VAR:-default}</code> (default if unset or empty), <code>\${VAR-default}</code> (if unset), <code>\${VAR:?message}</code> (error if unset/empty), <code>\${VAR:+alt}</code>; <code>$$</code> escapes a literal <code>$</code> for the container's shell.</li>
<li><b>Container environment</b> is set by <code>environment:</code> and <code>env_file:</code>. Precedence (highest first) as documented: <code>docker compose run -e</code>; <code>environment</code>/<code>env_file</code> entries whose value is interpolated from the shell or .env; plain <code>environment</code>; <code>env_file</code>; the image's <code>ENV</code>.</li>
<li>The <code>.env</code> file is <b>not</b> injected into containers automatically. It only feeds interpolation (and Compose's own settings like <code>COMPOSE_PROJECT_NAME</code>, <code>COMPOSE_PROFILES</code>, <code>COMPOSE_FILE</code>). Put it in <code>env_file:</code> if you want that.</li>
</ul>
<h5>Combining files</h5>
<ul class="pts">
<li><code>docker compose -f compose.yaml -f compose.prod.yaml up</code>: files are merged left to right. Scalars are replaced, mappings are merged key by key, and multi-value options like <code>ports</code>, <code>expose</code>, <code>volumes</code> (by target) and <code>environment</code> are combined. Recent versions support the <code>!reset</code> and <code>!override</code> YAML tags to remove or replace inherited values.</li>
<li>When no <code>-f</code> is given, <code>compose.yaml</code> + <code>compose.override.yaml</code> are used. Convention: base file = production-like, override = developer conveniences (bind mounts, debug ports, dev targets).</li>
<li><b>Profiles</b>: a service with <code>profiles: [tools]</code> starts only when the profile is enabled (<code>--profile tools</code> or <code>COMPOSE_PROFILES=tools</code>), or when you target it explicitly by name. Services without profiles always start.</li>
</ul>`,
      why: `<p>By the end of Day 4 our app needed roughly ten commands: create two networks, two volumes, start Postgres and Redis with the right flags, wait for them, run migrations, start the API with a long <code>DATABASE_URL</code>, start the frontend with the right ports. That knowledge lived in a README that drifted, a shell script that was not idempotent, and people's shell history. Recreating one container meant remembering every flag it had.</p>
<p>Compose makes the environment <b>declarative and versioned</b>: the file in Git <i>is</i> the documentation, and <code>docker compose up</code> is idempotent: run it again and only what changed is recreated. It gives every project its own namespace so two apps (or two branches of one app) do not collide, and it standardises service discovery (service name = hostname) so application config is the same on every laptop and CI runner.</p>
<p>It is deliberately single-host. For many teams it covers development, CI, demos and small production deployments; when you need multiple hosts, the same file format feeds Swarm stacks (<code>docker stack deploy</code>, Day 9), and the mental model (services, networks, volumes, health) carries straight over to Kubernetes.</p>`,
      diagram: {
        html: flow([["compose.yaml", "+ compose.override.yaml + .env", "w"], ["docker compose CLI", "parse, interpolate, merge, validate"], ["Project model", "name: shop; services, networks, volumes"], ["Engine API", "same calls as docker run"], ["Resources", "shop_default, shop_pgdata, shop-api-1 …", "g"]]) +
          lanes([
            ["You write", ["<code>services: api: build: ./backend</code>", "<code>volumes: pgdata:</code>", "<code>DATABASE_URL: …@postgres:5432/…</code>", "<code>ports: [\"8080:80\"]</code>"]],
            ["Compose creates", ["network <code>shop_default</code> (bridge + DNS)", "volume <code>shop_pgdata</code>", "containers <code>shop-api-1</code>, <code>shop-postgres-1</code>", "labels <code>com.docker.compose.project=shop</code>"]],
            ["Equivalent CLI", ["<code>docker network create shop_default</code>", "<code>docker volume create shop_pgdata</code>", "<code>docker build -t shop-api ./backend</code>", "<code>docker run --network shop_default --network-alias api …</code>"]]
          ]),
        steps: [
          "The CLI locates the files (cwd and parents for <code>compose.yaml</code>, plus the override), loads <code>.env</code>, and determines the project name.",
          "It interpolates <code>\${VAR}</code> references, merges all files, applies profiles, and validates the result against the Compose Specification schema (what <code>docker compose config</code> prints).",
          "It compares the model with existing resources found by label (<code>com.docker.compose.project</code>, <code>…service</code>, <code>…config-hash</code>) to decide what to create, recreate or leave alone.",
          "It creates networks and volumes first, builds images if needed (via BuildKit / Bake), then creates and starts containers in dependency order, attaching each to its networks with the service name as a DNS alias.",
          "Output is streamed back; with <code>-d</code> the CLI exits and the Engine keeps everything running. No Compose process remains."
        ]
      },
      cmds: [
        {
          t: "From docker run to Compose: a minimal two-service file",
          lang: "yaml",
          code: `# compose.yaml  (no "version:" key needed)
name: shop
services:
  api:
    image: myorg/api:1.0
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://app:secret@postgres:5432/app
  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: app
    volumes:
      - pgdata:/var/lib/postgresql/data
volumes:
  pgdata:`,
          note: `<p>This replaces Day 3/4's <code>network create</code>, <code>volume create</code> and two <code>docker run</code> commands. No network is declared: both services join <code>shop_default</code>, where <code>postgres</code> resolves by service name. The secret is inline here only for brevity; the next blocks move it to <code>.env</code>.</p>`
        },
        {
          t: "Run it, see what Compose created",
          lang: "sh",
          code: `docker compose up -d
docker compose ps
docker network ls --filter label=com.docker.compose.project=shop
docker volume ls --filter label=com.docker.compose.project=shop
docker inspect shop-postgres-1 -f '{{json .NetworkSettings.Networks.shop_default.Aliases}}'`,
          out: `[+] Running 4/4
 ✔ Network shop_default       Created
 ✔ Volume "shop_pgdata"       Created
 ✔ Container shop-postgres-1  Started
 ✔ Container shop-api-1       Started
NAME              IMAGE           COMMAND                  SERVICE    CREATED          STATUS          PORTS
shop-api-1        myorg/api:1.0   "uvicorn app.main:ap…"   api        10 seconds ago   Up 9 seconds    0.0.0.0:8000->8000/tcp
shop-postgres-1   postgres:16     "docker-entrypoint.s…"   postgres   10 seconds ago   Up 9 seconds    5432/tcp
NETWORK ID     NAME           DRIVER    SCOPE
4be0c1d2e3f4   shop_default   bridge    local
DRIVER    VOLUME NAME
local     shop_pgdata
["shop-postgres-1","postgres","3c4d5e6f7a8b"]`,
          note: `<p>The aliases list shows why <code>postgres</code> resolves: Compose registers the service name (and the container name) as DNS aliases on the network. The <code>5432/tcp</code> without a host part means "exposed, not published".</p>`
        },
        {
          t: ".env interpolation, defaults and required values",
          lang: "yaml",
          code: `# .env  (same directory as compose.yaml; never commit real secrets)
# POSTGRES_USER=app
# POSTGRES_PASSWORD=change-me
# POSTGRES_DB=app
# TAG=1.4.2
services:
  api:
    image: myorg/api:\${TAG:-dev}
    environment:
      DATABASE_URL: postgresql://\${POSTGRES_USER}:\${POSTGRES_PASSWORD:?set POSTGRES_PASSWORD in .env}@postgres:5432/\${POSTGRES_DB}
      LOG_LEVEL: \${LOG_LEVEL:-info}
    env_file:
      - ./backend/api.env          # KEY=VALUE lines injected into the container
  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: \${POSTGRES_USER}
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD}
      POSTGRES_DB: \${POSTGRES_DB}
    healthcheck:
      # $$ = literal $, expanded by the container's shell, not by Compose
      test: ["CMD-SHELL", "pg_isready -U $\${POSTGRES_USER} -d $\${POSTGRES_DB}"]`,
          note: `<p><code>\${POSTGRES_PASSWORD:?…}</code> makes <code>docker compose up</code> fail fast with your message instead of starting a database with an empty password. <code>TAG=2.0.0 docker compose up</code> overrides the <code>.env</code> value because the shell wins.</p>`
        },
        {
          t: "Render the final model with docker compose config",
          lang: "sh",
          code: `docker compose config                 # fully merged + interpolated YAML
docker compose config --services
docker compose config --environment   # variables used for interpolation (recent versions)
POSTGRES_PASSWORD= docker compose config >/dev/null`,
          out: `name: shop
services:
  api:
    environment:
      DATABASE_URL: postgresql://app:change-me@postgres:5432/app
      LOG_LEVEL: info
    image: myorg/api:1.4.2
    networks:
      default: null
…
api
postgres
error while interpolating services.api.environment.DATABASE_URL: required variable POSTGRES_PASSWORD is missing a value: set POSTGRES_PASSWORD in .env`,
          note: `<p><code>config</code> is the first debugging step for any Compose surprise: it shows the effective file after overrides, profiles and interpolation, with relative paths made absolute. Careful: it prints secrets in clear text.</p>`
        },
        {
          t: "build: context, dockerfile, args, target; command and entrypoint overrides",
          lang: "yaml",
          code: `services:
  web:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      target: prod                 # multi-stage target
      args:
        VITE_API_BASE: /api        # build-time ARG
    image: myorg/web:\${TAG:-dev}   # tag applied to the built image
  api:
    build: ./backend               # short form = context only
    command: ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
  worker:
    build: ./backend               # same image, different process
    entrypoint: ["python", "-m"]
    command: ["app.worker"]`,
          note: `<p><code>docker compose build</code> builds every service with a <code>build</code> section (in parallel, with BuildKit); <code>up --build</code> builds before starting. <code>args</code> are for build time only; use <code>environment</code> for run time. Remember from Day 2 that <code>ENTRYPOINT</code> + <code>CMD</code> combine: overriding <code>entrypoint</code> resets the image's CMD, so set <code>command</code> too.</p>`
        },
        {
          t: "Networks for tier isolation, external volumes, extra_hosts",
          lang: "yaml",
          code: `services:
  web:
    image: myorg/web:1.4.2
    networks: [edge]
  api:
    image: myorg/api:1.4.2
    networks: [edge, data]
    extra_hosts:
      - "host.docker.internal:host-gateway"   # reach the host on Linux too
  postgres:
    image: postgres:16
    networks:
      data:
        aliases: [db]
    volumes:
      - pgdata:/var/lib/postgresql/data
networks:
  edge: {}
  data:
    internal: true          # no outbound internet, cannot be published
volumes:
  pgdata:
    external: true          # created once by ops: docker volume create shop_pgdata_prod
    name: shop_pgdata_prod`,
          note: `<p><code>web</code> can resolve <code>api</code> but not <code>postgres</code>. External volumes are never created or deleted by Compose, so <code>docker compose down -v</code> cannot wipe production data.</p>`
        },
        {
          t: "Override files, multiple -f, profiles and include",
          lang: "yaml",
          code: `# compose.override.yaml  (auto-loaded in dev, ignored when you pass -f explicitly)
services:
  api:
    build: ./backend
    command: ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--reload"]
    volumes:
      - ./backend/app:/app/app
    ports:
      - "127.0.0.1:8000:8000"
  postgres:
    ports:
      - "127.0.0.1:5432:5432"   # local psql / IDE only
  adminer:
    image: adminer:4
    profiles: [tools]           # only with --profile tools
    ports: ["127.0.0.1:8081:8080"]

# compose.yaml can also pull in shared stacks:
# include:
#   - path: ../platform/observability/compose.yaml`,
          note: `<p>Dev: <code>docker compose up</code> (base + override). Prod: <code>docker compose -f compose.yaml -f compose.prod.yaml up -d</code> (override <i>not</i> loaded because <code>-f</code> was given). Tools: <code>docker compose --profile tools up -d</code>. <code>COMPOSE_FILE=compose.yaml:compose.prod.yaml</code> in the environment does the same as repeated <code>-f</code> (separator <code>;</code> on Windows).</p>`
        },
        {
          t: "Inspect what the project contains",
          lang: "sh",
          code: `docker compose ls
docker compose -p shop ps -a
docker compose images
docker compose top api`,
          out: `NAME   STATUS       CONFIG FILES
shop   running(2)   /home/dev/shop/compose.yaml,/home/dev/shop/compose.override.yaml
…
CONTAINER         REPOSITORY    TAG     IMAGE ID       SIZE
shop-api-1        myorg/api     1.0     5e2b7c0d9a11   182MB
shop-postgres-1   postgres      16      0f2d1c3b4a55   453MB`,
          note: `<p><code>-p</code> lets you manage a project from any directory (useful in scripts and after you have deleted the files). Compose finds resources purely by labels.</p>`
        }
      ],
      internals: `<p><b>Compose is a client.</b> <code>docker compose</code> is a CLI plugin binary (<code>~/.docker/cli-plugins/docker-compose</code> or <code>/usr/libexec/docker/cli-plugins/</code>) built on the <code>compose-go</code> library, which implements the spec: loading, interpolation, merging, profile filtering, schema validation and normalisation. The result is a project model. Compose then talks to the Engine API through the same Docker context as the CLI (<code>docker context use</code> switches which daemon it targets, including remote hosts over SSH).</p>
<p><b>Labels are the state.</b> Compose keeps no database. Every container, network and volume it creates gets labels such as <code>com.docker.compose.project=shop</code>, <code>com.docker.compose.service=api</code>, <code>com.docker.compose.container-number=1</code>, <code>com.docker.compose.project.config_files=…</code>, <code>com.docker.compose.project.working_dir=…</code> and <code>com.docker.compose.config-hash=&lt;sha256 of the service config&gt;</code>. On <code>up</code>, Compose lists containers filtered by project label and compares config hashes: identical → leave running; different (image digest, env, ports, mounts…) → stop, remove and recreate; missing → create; containers for services no longer in the file → "orphans" (warned about; removed with <code>--remove-orphans</code>).</p>
<p><b>Networks and DNS.</b> The default network is a regular user-defined bridge, so all of Day 3 applies. Each container is connected with aliases: the service name, the container name and the short ID. Scaling to three replicas registers three endpoints with the same <code>api</code> alias; the embedded DNS returns all three IPs (round-robin). There is no load balancer or VIP in plain Compose (Swarm adds one).</p>
<p><b>Volumes.</b> Declared volumes are created via <code>VolumeCreate</code> with project labels; an existing volume with the expected name but different driver options triggers a warning or error rather than silent recreation. Relative bind paths are resolved against the project directory (the directory of the first compose file, or <code>--project-directory</code>).</p>
<p><b>Builds.</b> Services with <code>build</code> are built through BuildKit; recent Compose versions delegate to <code>docker buildx bake</code> under the hood when available, which builds independent services in parallel and shares cache. Built images are tagged with <code>image:</code> if given, otherwise <code>&lt;project&gt;-&lt;service&gt;</code> (e.g. <code>shop-api</code>).</p>
<p><b>Override merge internals.</b> compose-go merges the YAML trees before interpolation-aware normalisation: maps are deep-merged, most sequences are replaced, but specific attributes (ports, expose, external_links, dns, volumes keyed by target, devices, environment, labels) are merged by key. That is why adding a port in an override adds rather than replaces; use <code>!reset []</code> when you need to clear one.</p>`,
      prod: `<p><b>How teams structure Compose for React → FastAPI → Redis → PostgreSQL:</b></p>
<ul class="pts">
<li><code>compose.yaml</code>: the production-shaped definition. Images by immutable tag (<code>myorg/api:\${TAG:?}</code>), no bind mounts of source, only the edge publishes ports, health checks, restart policies, resource limits under <code>deploy.resources</code>, logging options, internal data network, named volumes.</li>
<li><code>compose.override.yaml</code> (committed, auto-loaded on laptops): build from source, bind mounts with <code>--reload</code>, Vite dev server, database port on <code>127.0.0.1</code>, debug env vars.</li>
<li><code>compose.ci.yaml</code>: used with <code>-f compose.yaml -f compose.ci.yaml</code> in CI to run integration tests (<code>docker compose run --rm api pytest</code>) against real Postgres and Redis, then <code>down -v</code> to leave nothing behind. Project name per pipeline (<code>-p ci-$CI_JOB_ID</code>) prevents collisions on shared runners.</li>
<li><code>.env.example</code> committed, <code>.env</code> git-ignored; real production secrets from a secret manager written at deploy time, or Compose <code>secrets:</code> mounted as files read by the app (<code>POSTGRES_PASSWORD_FILE</code> is supported by the postgres image).</li>
<li>Single-VM production with Compose is common for small products: <code>docker compose pull && docker compose up -d</code> as the deploy step (only changed services restart), a reverse proxy with TLS, and backups of the named volumes. When you need multiple hosts or zero-downtime rolling updates, move to Swarm (same file, <code>docker stack deploy</code>) or Kubernetes.</li>
</ul>`,
      iq: [
        ["dca", "A <code>compose.yaml</code> and a <code>compose.override.yaml</code> exist in the current directory. Which files does <code>docker compose up</code> use, and which does <code>docker compose -f compose.yaml up</code> use?", "<p>Without <code>-f</code>, both: the override is merged automatically on top of the base file. With an explicit <code>-f compose.yaml</code>, only that file; the override is loaded only if you list it too (<code>-f compose.yaml -f compose.override.yaml</code>). The tempting wrong answer is that the override is always applied.</p>"],
        ["dca", "Where does Compose take values for <code>\${TAG}</code> in <code>image: myorg/api:\${TAG}</code> and which wins if both are set?", "<p>From the shell environment of the <code>docker compose</code> command and from the <code>.env</code> file in the project directory (or <code>--env-file</code>). The shell environment wins over <code>.env</code>. <code>env_file:</code> entries are <b>not</b> used for interpolation; they only set variables inside the container.</p>"],
        ["dca", "Which TWO statements about Compose networking are true? (A) Compose creates a network named <code>&lt;project&gt;_default</code> unless services specify other networks. (B) Services must publish ports to talk to each other. (C) A service can reach another by its service name. (D) Compose uses the default <code>bridge</code> network so containers can resolve each other.", "<p><b>A and C.</b> B is false: inter-service traffic uses container ports on the shared network. D is false: the default bridge has no name DNS; Compose creates a user-defined bridge precisely so service names resolve.</p>"],
        ["dca", "What happens to the top-level <code>version: \"3.8\"</code> key with Compose v2?", "<p>It is obsolete and ignored (Compose prints a warning that the attribute is obsolete). The Compose Specification has no version; Compose validates against the latest spec. Removing it is recommended. Old v2-only features (like <code>depends_on</code> conditions) are available regardless of the version value.</p>"],
        ["mid", "What is the difference between <code>environment:</code>, <code>env_file:</code> and the <code>.env</code> file?", "<p><code>environment:</code> sets container variables inline in the YAML. <code>env_file:</code> reads <code>KEY=VALUE</code> lines from files and sets them in the container (lower precedence than <code>environment</code>). <code>.env</code> is read by Compose itself for <code>\${VAR}</code> interpolation and Compose settings; it is not passed into containers unless also listed in <code>env_file</code>.</p>"],
        ["mid", "How do you add pgAdmin to the stack for developers without it starting in production or CI?", "<p>Give it <code>profiles: [tools]</code>. Services with a profile start only when that profile is active (<code>docker compose --profile tools up</code> or <code>COMPOSE_PROFILES=tools</code>) or when named explicitly (<code>docker compose up pgadmin</code>). Alternatively put it only in the dev override file. Bind its port to 127.0.0.1.</p>"],
        ["senior", "Two developers clone the repo into <code>~/work/app</code> and <code>~/review/app</code> on the same machine and run <code>docker compose up</code>. What breaks, and how do you avoid it?", "<p>Both directories are named <code>app</code>, so both default to project <code>app</code>: the second <code>up</code> takes over (and recreates) the first one's containers, network and volumes, including sharing its database volume. Fix with a distinct project name (<code>-p</code>, <code>COMPOSE_PROJECT_NAME</code> in each <code>.env</code>), and avoid fixed host ports that collide (or bind random ports). Hard-coding <code>name:</code> in the file has the opposite problem: all checkouts share one project.</p>"],
        ["senior", "Why should you run <code>docker compose config</code> in CI?", "<p>It validates the schema, fails on missing required variables (<code>\${VAR:?}</code>), and produces the exact effective configuration after overrides, profiles and interpolation, which you can diff in code review or archive as the deploy artifact. It catches YAML indentation mistakes and typos (unknown keys are rejected) before deploy time. Be careful not to log it if it contains secrets.</p>"]
      ],
      gotchas: [
        "<b><code>.env</code> is not the container's environment.</b> It feeds interpolation only. Many \"my variable is empty in the container\" bugs come from this.",
        "<b>Unquoted ports</b>: YAML 1.1 parsers may read <code>22:22</code>-style values as base-60 integers. Always quote short port mappings: <code>\"8080:80\"</code>.",
        "<b><code>$</code> in values</b> (passwords, healthcheck shell variables) is interpolated by Compose. Use <code>$$</code> for a literal dollar sign, or values like <code>pa$word</code> silently become <code>pa</code>.",
        "<b>Project name defaults to the directory name</b>. Renaming or moving the folder creates a new project (new volume names!), so the app starts with an empty database even though the old volume still exists.",
        "<b>Explicit <code>-f</code> disables the automatic override.</b> Production scripts that pass <code>-f compose.yaml</code> are safe from dev settings; scripts that run plain <code>docker compose up</code> on a server pick up any override file lying around.",
        "<b>Changing <code>environment</code> requires recreation</b>, which <code>up</code> does automatically; <code>docker compose restart</code> does <i>not</i> apply config changes, it only restarts existing containers.",
        "<b><code>build</code> + <code>image</code></b> together means \"build and tag as this name\". If <code>pull_policy</code> or a <code>docker compose pull</code> fetches that tag from a registry, it can replace your local build. Use distinct tags for local builds.",
        "<b>Merging lists</b>: overrides append ports and volumes rather than replacing them. To drop a port from the base file in an override use <code>ports: !reset []</code> (recent Compose)."
      ],
      best: [
        "Name the file <code>compose.yaml</code>, drop <code>version:</code>, and keep the base file production-shaped with dev conveniences in <code>compose.override.yaml</code>.",
        "Commit <code>.env.example</code>, git-ignore <code>.env</code>, and use <code>\${VAR:?message}</code> for anything mandatory.",
        "Reference other services only by service name and container port; publish only what humans or external clients need, preferably bound to 127.0.0.1 in dev.",
        "Pin image tags (and use immutable tags or digests in production); declare named volumes explicitly and mark production data volumes <code>external</code>.",
        "Use <code>docker compose config</code> to review the effective configuration, and in CI to validate files.",
        "Use YAML anchors / <code>x-</code> extension fields for shared settings (logging, restart, env) instead of copy-paste."
      ],
      lab: [
        "Translate your Day 3/4 commands (network, volume, Postgres, API) into a <code>compose.yaml</code> with no <code>version:</code> key and run <code>docker compose up -d</code>.",
        "List the created network, volume and containers and identify the project name in each name; inspect the aliases on the Postgres container.",
        "Move credentials into <code>.env</code>, use <code>\${POSTGRES_PASSWORD:?…}</code>, and confirm <code>docker compose config</code> fails when you blank the variable and succeeds otherwise. Override <code>TAG</code> from the shell and see it win.",
        "Add a <code>compose.override.yaml</code> that publishes Postgres on <code>127.0.0.1:5432</code> and an <code>adminer</code> service under a <code>tools</code> profile; compare <code>docker compose config --services</code> with and without <code>--profile tools</code>.",
        "Run the stack under a second project name (<code>-p shop2</code>) and show that it gets its own network and volume.",
        "<b>Done when:</b> <code>docker compose config</code> output matches what you expect, two projects run side by side without conflicts, and you can explain where every value in the rendered file came from."
      ],
      teach: `<p>"Compose turns the pile of <code>docker run</code> commands into one declarative file. A <code>compose.yaml</code> lists services, which are container templates with an image or build, ports, environment, volumes and networks, plus top-level networks and volumes. No <code>version:</code> key any more; it follows the Compose Specification. <code>docker compose up</code> is just a client calling the Engine API.</p>
<p>Everything lives in a project, named from <code>-p</code>, the env var, the <code>name:</code> key or the folder. Compose creates a <code>project_default</code> network, which is a user-defined bridge, so every service resolves every other by service name. Volumes become <code>project_name</code>. It tracks everything with labels and a config hash, so running <code>up</code> again only recreates what changed.</p>
<p>Two variable mechanisms: <code>\${VAR}</code> in the YAML is interpolated from your shell and the <code>.env</code> file; <code>environment</code> and <code>env_file</code> set variables inside containers. For environments, keep the base file production-like, let <code>compose.override.yaml</code> add dev conveniences automatically, stack files with <code>-f</code>, hide optional tools behind profiles, and check the result with <code>docker compose config</code>."</p>`
    },
    {
      id: "d5-compose-stack",
      title: "A four-service stack: React → FastAPI → Redis → PostgreSQL",
      lv: ["mid", "senior", "lead", "architect", "dca"],
      eli5: `<p>Picture opening a restaurant every morning. The <b>fridge</b> (PostgreSQL) must be cold before anyone cooks. The <b>prep counter</b> (Redis) must be set up. Only then can the <b>chef</b> (FastAPI) start taking orders, and only once the chef is ready should the <b>waiter</b> (React behind nginx) open the doors to customers.</p>
<p>Just "turning things on in order" is not enough: a fridge that has been switched on is not yet cold. So each station has a <b>thermometer</b> (a health check), and the manager (Compose) waits until it reads "ready" before starting the next station. If a station breaks during the day, a rule says what to do (restart policy: always try again, only if it failed, or never).</p>
<p>Everyone finds each other by name tags ("chef", "fridge"), not by where they happen to stand today. And at closing time you can send everyone home (<code>down</code>) without throwing out the food in the fridge, unless you explicitly say so (<code>down -v</code>).</p>`,
      what: `<p>This topic builds the course's running example as one Compose project and covers the runtime features that make a multi-service stack reliable: dependency ordering, health checks, restart policies, service discovery, the lifecycle commands, development hot reload with <code>watch</code>, and scaling.</p>
<h5>The architecture</h5>
<ul class="pts">
<li><b>web</b>: React built by Vite and served by <code>nginx:1.27-alpine</code> (production target). nginx also reverse-proxies <code>/api/</code> to <code>http://api:8000</code>, so the browser talks to one origin (no CORS). In development the same service uses the Dockerfile's <code>dev</code> target (Vite dev server with HMR).</li>
<li><b>api</b>: FastAPI on Uvicorn, binding <code>0.0.0.0:8000</code>. Uses Redis for a visit counter (<code>INCR</code>) and as a read-through cache for <code>GET /api/notes</code>; uses PostgreSQL for notes.</li>
<li><b>migrate</b>: a one-shot service from the API image that creates/updates the schema and exits 0.</li>
<li><b>redis</b>: <code>redis:7.4-alpine</code> with AOF persistence on a named volume.</li>
<li><b>postgres</b>: <code>postgres:16</code> with a named volume at <code>PGDATA</code>.</li>
<li>Networks: <code>edge</code> (web, api) and <code>data</code> (api, migrate, redis, postgres; <code>internal: true</code>). Only <code>web</code> publishes a port.</li>
</ul>
<h5><code>depends_on</code>: short form vs conditions</h5>
<ul class="pts">
<li><b>Short form</b> <code>depends_on: [postgres]</code> only guarantees <code>postgres</code>'s container is <i>started</i> before <code>api</code>'s is created/started (and stopped after it on <code>down</code>). Postgres may still be initialising; the API's first connection is refused.</li>
<li><b>Long form</b> with <code>condition</code>:
<ul>
<li><code>service_started</code>: same as the short form.</li>
<li><code>service_healthy</code>: wait until the dependency's <code>healthcheck</code> reports <code>healthy</code>. Requires a health check (in the image or the Compose file).</li>
<li><code>service_completed_successfully</code>: wait until the dependency has <b>run to completion with exit code 0</b>. Ideal for migrations, seeders, permission fixers.</li>
</ul></li>
<li>Extra keys (recent Compose versions): <code>restart: true</code> (restart this service when the dependency is restarted by a Compose operation) and <code>required: false</code> (do not fail if the dependency is not running/enabled).</li>
<li><code>depends_on</code> applies only at startup by Compose. It does not watch dependencies later, and in Swarm (<code>docker stack deploy</code>) it is ignored. Applications must still retry connections.</li>
</ul>
<h5>Health checks</h5>
<ul class="pts">
<li><code>healthcheck: test, interval, timeout, retries, start_period, start_interval</code>. <code>test</code> is <code>["CMD", …]</code> (exec, no shell) or <code>["CMD-SHELL", "…"]</code> (via <code>/bin/sh -c</code>); exit 0 = healthy, 1 = unhealthy. <code>disable: true</code> turns off an image's HEALTHCHECK.</li>
<li>The Engine runs the probe inside the container (like <code>docker exec</code>) every <code>interval</code>; after <code>retries</code> consecutive failures the state becomes <code>unhealthy</code>. Failures during <code>start_period</code> do not count (and <code>start_interval</code>, on newer Engines, probes faster during it).</li>
<li>Probes must use tools that exist in the image: <code>pg_isready</code> (postgres), <code>redis-cli ping</code> (redis), a Python one-liner for a slim FastAPI image (no curl), <code>wget -q --spider</code> for nginx:alpine (busybox).</li>
<li>Standalone Docker only <b>reports</b> health; it does not restart unhealthy containers. Compose uses it for <code>service_healthy</code> and <code>up --wait</code>; Swarm replaces unhealthy tasks.</li>
</ul>
<h5>Restart policies</h5>
<ul class="pts">
<li><code>restart: "no"</code> (default; quote it in YAML), <code>always</code> (restart whenever it exits; a container you stop manually stays stopped until you start it or the daemon restarts, at which point it starts again), <code>on-failure[:max-retries]</code> (only non-zero exits), <code>unless-stopped</code> (like always, but a manual stop is remembered across daemon restarts). Restarts back off exponentially (100 ms doubling, reset after 10 s of uptime).</li>
<li>Use <code>unless-stopped</code> or <code>always</code> for long-running services and <code>"no"</code> for one-shot jobs like <code>migrate</code> (otherwise it loops forever).</li>
</ul>
<h5>Lifecycle commands</h5>
<ul class="pts">
<li><code>up</code> (<code>-d</code> detached, <code>--build</code>, <code>--wait</code> until healthy, <code>--force-recreate</code>, <code>--no-deps</code>, <code>--remove-orphans</code>, <code>--scale svc=n</code>, <code>--watch</code>); <code>down</code> (stop + remove containers and networks; <code>-v</code> also named volumes declared in the file and anonymous volumes; <code>--rmi local|all</code> images; external volumes and networks are never removed).</li>
<li><code>build</code>, <code>pull</code>, <code>ps</code>, <code>logs</code> (<code>-f</code>, <code>--tail</code>, <code>-t</code>, per service), <code>exec</code> (in a running container; <code>-T</code> to disable TTY for scripts), <code>run --rm</code> (a <i>new</i> one-off container from a service definition; starts dependencies, does not publish ports unless <code>--service-ports</code>), <code>start</code>/<code>stop</code>/<code>restart</code> (existing containers, no config changes applied), <code>top</code>, <code>events</code>, <code>cp</code>, <code>port</code>.</li>
<li><code>docker compose watch</code> (or <code>up --watch</code>): reads <code>develop.watch</code> rules and, on file changes, <b>syncs</b> files into the running container, <b>rebuilds</b> and recreates the service, or <b>sync+restart</b>s it. Unlike a bind mount it works with any filesystem and lets you ignore paths like <code>node_modules</code>.</li>
<li><code>--scale api=3</code> (or <code>deploy.replicas</code>) runs three containers <code>shop-api-1..3</code>; the name <code>api</code> resolves to all their IPs. Services with a fixed published host port cannot scale (port conflict); <code>container_name</code> also prevents scaling.</li>
</ul>`,
      why: `<p>A distributed system is only as reliable as its startup and failure behaviour. Starting four processes is easy; starting them so that the API never sees "connection refused" from a database still running initdb, migrations run exactly once before the API serves traffic, crashed processes come back, and the whole thing can be torn down and recreated without losing data: that is the actual job.</p>
<p>Without Compose you wrote <code>sleep 10</code> in scripts (too short on a slow CI runner, too long everywhere else) or <code>wait-for-it.sh</code> wrappers in every image. Health checks plus <code>depends_on</code> conditions express the real requirement ("wait until Postgres accepts connections") declaratively, and the same health checks later feed Swarm and monitoring.</p>
<p>For developers, the value is a one-command, identical environment: <code>git clone && docker compose up</code> gives every engineer and every CI job the same React + FastAPI + Redis + Postgres versions, wired the same way, with hot reload on top. That removes most of "works on my machine".</p>`,
      diagram: {
        html: flow([["Browser", "http://localhost:8080", "w"], ["web (nginx)", "/ → React build; /api/ → api:8000"], ["api (FastAPI)", "uvicorn 0.0.0.0:8000"], ["redis", "redis:6379 counter + cache"], ["postgres", "postgres:5432 notes", "g"]]) +
          flow([["postgres", "healthy: pg_isready", "g"], ["redis", "healthy: redis-cli ping", "g"], ["migrate", "exited 0", "g"], ["api", "healthy: GET /api/health", "g"], ["web", "started, serves traffic", "g"]], { v: false }) +
          lanes([
            ["network edge", ["web", "api"]],
            ["network data (internal)", ["api", "migrate", "redis", "postgres"]],
            ["volumes", ["shop_pgdata → postgres /var/lib/postgresql/data", "shop_redisdata → redis /data"]]
          ]),
        steps: [
          "<code>docker compose up -d --build</code> creates networks <code>shop_edge</code>, <code>shop_data</code> and volumes <code>shop_pgdata</code>, <code>shop_redisdata</code>, then builds the <code>api</code> and <code>web</code> images.",
          "postgres and redis have no dependencies, so they start first, in parallel. Compose polls their health status.",
          "When postgres is healthy, <code>migrate</code> starts, runs the schema migration and exits 0.",
          "When postgres and redis are healthy and migrate completed successfully, <code>api</code> starts; its own health check (<code>/api/health</code>, which pings both backends) turns healthy after startup.",
          "<code>web</code> waits for <code>api</code> to be healthy, then starts nginx. Requests flow browser → web:80 (published 8080) → api:8000 → redis:6379 / postgres:5432, every hop resolved by service name via 127.0.0.11."
        ]
      },
      cmds: [
        {
          t: "Project layout",
          lang: "text",
          code: `shop/
├── compose.yaml              # production-shaped stack
├── compose.override.yaml     # dev: Vite dev server, uvicorn --reload, watch rules
├── .env                      # POSTGRES_*, TAG (git-ignored); .env.example committed
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt      # fastapi, uvicorn[standard], asyncpg, redis
│   └── app/
│       ├── main.py
│       └── migrate.py
└── frontend/
    ├── Dockerfile            # targets: dev (Vite) and prod (nginx)
    ├── nginx.conf
    ├── package.json, vite.config.js, index.html
    └── src/App.jsx`
        },
        {
          t: "backend/app/main.py: FastAPI using Redis (counter + cache) and PostgreSQL",
          lang: "text",
          code: `import json, os
from contextlib import asynccontextmanager
import asyncpg
import redis.asyncio as redis
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.pg = await asyncpg.create_pool(os.environ["DATABASE_URL"], min_size=1, max_size=10)
    app.state.r = redis.from_url(os.environ["REDIS_URL"], decode_responses=True)
    yield
    await app.state.pg.close()
    await app.state.r.aclose()

app = FastAPI(lifespan=lifespan)

class NoteIn(BaseModel):
    body: str

@app.get("/api/health")
async def health():
    try:
        await app.state.r.ping()
        async with app.state.pg.acquire() as c:
            await c.fetchval("select 1")
    except Exception as e:
        raise HTTPException(503, f"dependency down: {e}")
    return {"status": "ok"}

@app.post("/api/visits")
async def visit():
    return {"visits": await app.state.r.incr("visits")}

@app.get("/api/notes")
async def list_notes():
    cached = await app.state.r.get("notes:all")
    if cached:
        return {"source": "redis", "notes": json.loads(cached)}
    async with app.state.pg.acquire() as c:
        rows = [dict(r) for r in await c.fetch("select id, body from notes order by id")]
    await app.state.r.set("notes:all", json.dumps(rows), ex=30)
    return {"source": "postgres", "notes": rows}

@app.post("/api/notes", status_code=201)
async def add_note(n: NoteIn):
    async with app.state.pg.acquire() as c:
        row = await c.fetchrow("insert into notes(body) values($1) returning id, body", n.body)
    await app.state.r.delete("notes:all")          # invalidate cache
    return dict(row)`,
          note: `<p><code>app/migrate.py</code> is a few lines: connect with asyncpg and run <code>create table if not exists notes (id serial primary key, body text not null)</code>. In a real project this is <code>alembic upgrade head</code>. Note the URLs come from the environment and use service names; the code has no idea it runs in Docker.</p>`
        },
        {
          t: "backend/Dockerfile and frontend/Dockerfile (multi-stage with dev and prod targets)",
          lang: "dockerfile",
          code: `# ---- backend/Dockerfile ----
FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app ./app
RUN useradd --system --uid 10001 appuser
USER appuser
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

# ---- frontend/Dockerfile ----
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS dev
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

FROM deps AS build
ARG VITE_API_BASE=/api
ENV VITE_API_BASE=$VITE_API_BASE
COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS prod
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html`,
          note: `<p><code>frontend/nginx.conf</code>: <code>server { listen 80; root /usr/share/nginx/html; location /api/ { proxy_pass http://api:8000; proxy_set_header Host $host; proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; } location / { try_files $uri /index.html; } }</code>. <code>src/App.jsx</code> calls <code>fetch("/api/visits", {method: "POST"})</code> and <code>fetch("/api/notes")</code> with relative URLs, so the same build works behind any host name.</p>`
        },
        {
          t: "compose.yaml: the complete four-service stack",
          lang: "yaml",
          code: `name: shop

x-restart: &restart
  restart: unless-stopped

services:
  postgres:
    image: postgres:16
    <<: *restart
    environment:
      POSTGRES_USER: \${POSTGRES_USER:-app}
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD:?set POSTGRES_PASSWORD in .env}
      POSTGRES_DB: \${POSTGRES_DB:-app}
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks: [data]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $\${POSTGRES_USER} -d $\${POSTGRES_DB}"]
      interval: 5s
      timeout: 3s
      retries: 10
      start_period: 20s
    stop_grace_period: 60s

  redis:
    image: redis:7.4-alpine
    <<: *restart
    command: ["redis-server", "--appendonly", "yes"]
    volumes:
      - redisdata:/data
    networks: [data]
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 10

  migrate:
    build: ./backend
    image: myorg/shop-api:\${TAG:-dev}
    command: ["python", "-m", "app.migrate"]
    environment: &api-env
      DATABASE_URL: postgresql://\${POSTGRES_USER:-app}:\${POSTGRES_PASSWORD}@postgres:5432/\${POSTGRES_DB:-app}
      REDIS_URL: redis://redis:6379/0
    networks: [data]
    depends_on:
      postgres:
        condition: service_healthy
    restart: "no"

  api:
    build: ./backend
    image: myorg/shop-api:\${TAG:-dev}
    <<: *restart
    environment: *api-env
    networks: [edge, data]
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      migrate:
        condition: service_completed_successfully
    healthcheck:
      test: ["CMD", "python", "-c", "import urllib.request,sys; sys.exit(0 if urllib.request.urlopen('http://127.0.0.1:8000/api/health', timeout=2).status == 200 else 1)"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 15s

  web:
    build:
      context: ./frontend
      target: prod
      args:
        VITE_API_BASE: /api
    image: myorg/shop-web:\${TAG:-dev}
    <<: *restart
    ports:
      - "8080:80"
    networks: [edge]
    depends_on:
      api:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://127.0.0.1/"]
      interval: 10s
      timeout: 3s
      retries: 3

networks:
  edge: {}
  data:
    internal: true

volumes:
  pgdata:
  redisdata:`,
          note: `<p>Points to notice: only <code>web</code> publishes a port; <code>api</code> has no <code>ports</code> at all in production; <code>migrate</code> shares the API image (built once, tagged once) with <code>restart: "no"</code>; <code>$$</code> keeps <code>$POSTGRES_USER</code> for the container shell; the API health check uses Python because <code>python:3.12-slim</code> has no curl. The <code>data</code> network is internal: Redis and Postgres cannot reach the Internet; <code>api</code> still can via <code>edge</code>.</p>`
        },
        {
          t: "compose.override.yaml: development with Vite, --reload and watch",
          lang: "yaml",
          code: `services:
  web:
    build:
      context: ./frontend
      target: dev
    ports: !reset ["5173:5173"]
    environment:
      VITE_PROXY_TARGET: http://api:8000      # vite.config.js proxies /api to this
    healthcheck:
      disable: true
    develop:
      watch:
        - action: sync
          path: ./frontend/src
          target: /app/src
        - action: rebuild
          path: ./frontend/package.json

  api:
    command: ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
    ports:
      - "127.0.0.1:8000:8000"
    develop:
      watch:
        - action: sync
          path: ./backend/app
          target: /app/app
          ignore:
            - "**/__pycache__/"
        - action: rebuild
          path: ./backend/requirements.txt

  postgres:
    ports:
      - "127.0.0.1:5432:5432"
    networks: [data, edge]       # the internal network has no published ports; join edge to publish

  adminer:
    image: adminer:4
    profiles: [tools]
    ports: ["127.0.0.1:8081:8080"]
    networks: [edge, data]`,
          note: `<p>With watch, edits to <code>frontend/src</code> are copied into the container and Vite's HMR refreshes the browser; edits to <code>backend/app</code> are copied and Uvicorn's <code>--reload</code> restarts the worker; dependency file changes trigger an image rebuild and container recreation. <code>!reset</code> replaces the base file's <code>8080:80</code> instead of appending (needs a recent Compose; otherwise list ports only in the per-environment files). Publishing a port on a container that is only on an <code>internal</code> network does not work, hence Postgres also joins <code>edge</code> in dev.</p>`
        },
        {
          t: "Start the stack with health-checked ordering",
          lang: "sh",
          code: `cp .env.example .env            # then edit POSTGRES_PASSWORD
docker compose -f compose.yaml up -d --build --wait
docker compose -f compose.yaml ps`,
          out: `[+] Building 41.2s (24/24) FINISHED
[+] Running 9/9
 ✔ Network shop_edge          Created
 ✔ Network shop_data          Created
 ✔ Volume "shop_pgdata"       Created
 ✔ Volume "shop_redisdata"    Created
 ✔ Container shop-redis-1     Healthy
 ✔ Container shop-postgres-1  Healthy
 ✔ Container shop-migrate-1   Exited
 ✔ Container shop-api-1       Healthy
 ✔ Container shop-web-1       Healthy
NAME              IMAGE                    COMMAND                  SERVICE    CREATED          STATUS                    PORTS
shop-api-1        myorg/shop-api:dev       "uvicorn app.main:ap…"   api        48 seconds ago   Up 30 seconds (healthy)   8000/tcp
shop-postgres-1   postgres:16              "docker-entrypoint.s…"   postgres   48 seconds ago   Up 47 seconds (healthy)   5432/tcp
shop-redis-1      redis:7.4-alpine         "docker-entrypoint.s…"   redis      48 seconds ago   Up 47 seconds (healthy)   6379/tcp
shop-web-1        myorg/shop-web:dev       "/docker-entrypoint.…"   web        48 seconds ago   Up 18 seconds (healthy)   0.0.0.0:8080->80/tcp`,
          note: `<p><code>-f compose.yaml</code> runs the production-shaped stack (no override). <code>--wait</code> returns only when services are running/healthy, perfect for CI. <code>ps</code> hides exited one-shot containers like <code>migrate</code>; use <code>ps -a</code> to see <code>Exited (0)</code>.</p>`
        },
        {
          t: "Demonstrate the flow end to end",
          lang: "sh",
          code: `curl -s localhost:8080/ | grep -o '<title>.*</title>'
curl -s -X POST localhost:8080/api/visits
curl -s -X POST localhost:8080/api/visits
curl -s -X POST localhost:8080/api/notes -H 'content-type: application/json' -d '{"body":"hello compose"}'
curl -s localhost:8080/api/notes
curl -s localhost:8080/api/notes
docker compose exec redis redis-cli get visits
docker compose exec postgres psql -U app -d app -c 'select * from notes'`,
          out: `<title>Shop</title>
{"visits":1}
{"visits":2}
{"id":1,"body":"hello compose"}
{"source":"postgres","notes":[{"id":1,"body":"hello compose"}]}
{"source":"redis","notes":[{"id":1,"body":"hello compose"}]}
"2"
 id |     body
----+---------------
  1 | hello compose
(1 row)`,
          note: `<p>Every request passed browser → nginx (<code>web</code>) → <code>api:8000</code> → <code>redis:6379</code> / <code>postgres:5432</code>. The second <code>GET</code> was served from the Redis cache. Open <code>http://localhost:8080</code> to see the React page doing the same calls.</p>`
        },
        {
          t: "Service discovery and failure behaviour",
          lang: "sh",
          code: `docker compose exec api getent hosts postgres redis
docker compose exec web getent hosts postgres || echo "web cannot see postgres (different network)"
docker compose stop redis
curl -s -o /dev/null -w '%{http_code}\\n' localhost:8080/api/health
docker compose ps api
docker compose start redis
docker compose logs -f --tail 20 api`,
          out: `172.24.0.3      postgres
172.24.0.2      redis
web cannot see postgres (different network)
503
NAME         …  STATUS
shop-api-1   …  Up 3 minutes (unhealthy)
shop-api-1  | INFO:     127.0.0.1:41822 - "GET /api/health HTTP/1.1" 200 OK`,
          note: `<p>The API reports 503 and becomes <code>unhealthy</code> while Redis is down, but plain Docker does not restart it (restart policies react to exits, not health). When Redis returns the API recovers by itself because the client reconnects. That is the behaviour you want: dependencies flapping should not crash-loop the API.</p>`
        },
        {
          t: "Development: override file, watch, run --rm, exec",
          lang: "sh",
          code: `docker compose up -d --build           # base + compose.override.yaml
docker compose watch                   # foreground; Ctrl+C stops watching (containers keep running)
# in another terminal: edit backend/app/main.py, then
docker compose logs --tail 5 api
docker compose run --rm api pytest -q  # one-off container from the api service definition
docker compose exec api python -c "import os; print(os.environ['REDIS_URL'])"
docker compose --profile tools up -d adminer`,
          out: `Watch enabled
Syncing service "api" after 1 changed files were detected
shop-api-1  | WARNING:  WatchFiles detected changes in 'app/main.py'. Reloading...
shop-api-1  | INFO:     Application startup complete.
..........                                                    [100%]
10 passed in 1.84s
redis://redis:6379/0`,
          note: `<p><code>run</code> creates a new container (named like <code>shop-api-run-3f2a…</code>) and starts the service's dependencies first; add <code>--no-deps</code> to skip them, <code>--service-ports</code> to publish its ports. <code>exec</code> enters the existing container. With watch you no longer need bind mounts of source code, which avoids slow file sharing on Docker Desktop and node_modules shadowing.</p>`
        },
        {
          t: "Scale the API and watch DNS round-robin",
          lang: "sh",
          code: `docker compose up -d --scale api=3 --no-recreate
docker compose ps api
docker compose exec web nslookup api 127.0.0.11
docker compose up -d --scale api=1`,
          out: `NAME         IMAGE                SERVICE  STATUS
shop-api-1   myorg/shop-api:dev   api      Up 9 minutes (healthy)
shop-api-2   myorg/shop-api:dev   api      Up 20 seconds (healthy)
shop-api-3   myorg/shop-api:dev   api      Up 20 seconds (healthy)
Server:		127.0.0.11
Name:	api
Address: 172.23.0.4
Name:	api
Address: 172.23.0.6
Name:	api
Address: 172.23.0.5`,
          note: `<p>Scaling works because <code>api</code> publishes no host port in <code>compose.yaml</code> (with the dev override's <code>127.0.0.1:8000:8000</code> it would fail with "port is already allocated"). nginx resolves <code>api</code> once at startup, so to actually spread load configure <code>resolver 127.0.0.11 valid=10s;</code> with a variable upstream, or restart <code>web</code> after scaling.</p>`
        },
        {
          t: "Stop, restart, recreate, tear down (and what -v deletes)",
          lang: "sh",
          code: `docker compose restart api          # restarts the existing container; config changes NOT applied
docker compose up -d                # applies config changes: recreates only changed services
docker compose pull                 # fetch newer images for services that use image:
docker compose stop                 # containers stopped, everything kept
docker compose down                 # containers + networks removed; volumes and images kept
docker compose up -d && curl -s localhost:8080/api/notes   # data still there
docker compose down -v              # ALSO removes shop_pgdata and shop_redisdata: data gone
docker volume ls --filter label=com.docker.compose.project=shop`,
          out: `[+] Running 7/7
 ✔ Container shop-web-1       Removed
 ✔ Container shop-api-1       Removed
 ✔ Container shop-migrate-1   Removed
 ✔ Container shop-redis-1     Removed
 ✔ Container shop-postgres-1  Removed
 ✔ Network shop_edge          Removed
 ✔ Network shop_data          Removed
{"source":"postgres","notes":[{"id":1,"body":"hello compose"}]}
 ✔ Volume shop_pgdata         Removed
 ✔ Volume shop_redisdata      Removed
DRIVER    VOLUME NAME`,
          note: `<p><code>down -v</code> removes named volumes declared in the file and anonymous volumes of the project's containers; volumes declared <code>external: true</code> are never removed. <code>down --rmi local</code> additionally removes images built by Compose without a custom tag (<code>--rmi all</code>: all images used by services).</p>`
        }
      ],
      internals: `<p><b>How Compose orders startup.</b> Compose builds a dependency graph from <code>depends_on</code> (and implicit dependencies like <code>network_mode: service:x</code> or <code>volumes_from</code>), rejects cycles, and walks it with parallelism: independent services start concurrently; a service is started only after each dependency satisfies its condition. For <code>service_healthy</code> Compose polls <code>ContainerInspect</code> for <code>State.Health.Status</code> (<code>starting</code> → <code>healthy</code>/<code>unhealthy</code>); if a dependency becomes unhealthy, <code>up</code> fails with "dependency failed to start: container shop-postgres-1 is unhealthy". For <code>service_completed_successfully</code> it waits for the container to exit and checks <code>State.ExitCode == 0</code>. On <code>down</code>/<code>stop</code> the graph is walked in reverse.</p>
<p><b>How health checks run.</b> The health config (from the image's <code>HEALTHCHECK</code> or Compose's <code>healthcheck</code>) is part of the container config. dockerd's health monitor goroutine runs the probe on each interval by creating an exec process inside the container (same mechanism as <code>docker exec</code>: containerd runs a new process in the container's namespaces and cgroup), with the timeout enforced by killing it. The last five results (exit codes and truncated output) are stored in <code>State.Health.Log</code>: <code>docker inspect --format '{{json .State.Health}}' shop-api-1</code>. Status changes emit <code>health_status</code> events (<code>docker events</code>).</p>
<p><b>Restart policies</b> are implemented by dockerd's container monitor, not by Compose: when the container's main process exits, dockerd decides based on the policy, the exit code and whether the user stopped it, and restarts with backoff. On daemon start, containers with <code>always</code> (and <code>unless-stopped</code> if not manually stopped) are started again. That is why a Compose stack comes back after a reboot without Compose running. Note that daemon-restarted containers ignore <code>depends_on</code> ordering, another reason apps must retry connections.</p>
<p><b>Recreation logic.</b> On <code>up</code>, Compose computes a hash of each service's normalised config (plus the image ID it resolved). If it differs from the <code>com.docker.compose.config-hash</code> label, the old container is stopped, renamed temporarily, the new one is created with the same name, and the old one is removed. Dependents of a recreated service are recreated only in specific cases (e.g. <code>network_mode: service:</code>), or with <code>depends_on.restart: true</code> restarted. Named volumes carry over, which is why Postgres keeps its data across <code>up</code>s.</p>
<p><b>Watch.</b> <code>docker compose watch</code> uses filesystem notifications on the host, debounces events, and for <code>sync</code> copies changed files into the container through the Engine API (an archive upload, like <code>docker cp</code>), honouring <code>.dockerignore</code> and <code>ignore</code> rules; <code>rebuild</code> runs the build and recreates the service; <code>sync+restart</code> syncs then restarts the container. The target container needs a writable target path and, for <code>sync</code> deletions, may need tools such as <code>rm</code>.</p>
<p><b>Scaling.</b> <code>--scale api=3</code> creates containers with <code>container-number</code> labels 2 and 3 from the same config; each joins the networks with the alias <code>api</code>. The embedded DNS returns all A records for the alias (order shuffled per query). There is no health-aware load balancer in plain Compose; an unhealthy replica still receives traffic unless your proxy health-checks upstreams.</p>`,
      prod: `<p><b>Running this stack for real on a single VM:</b></p>
<ul class="pts">
<li><b>Deploy</b>: CI builds and pushes <code>myorg/shop-api:1.4.2</code> and <code>myorg/shop-web:1.4.2</code>; on the server: <code>TAG=1.4.2 docker compose -f compose.yaml pull && TAG=1.4.2 docker compose -f compose.yaml up -d --wait</code>. Only <code>api</code>, <code>migrate</code> and <code>web</code> are recreated; Postgres and Redis keep running. The <code>migrate</code> one-shot runs before the new API starts.</li>
<li><b>Downtime</b>: plain Compose recreates a container in place (stop old, start new), so there is a few-second gap per service. Mitigate by running two API replicas behind nginx with upstream health checks and updating one at a time, or move to Swarm (<code>update_config: order: start-first</code>) when zero-downtime matters.</li>
<li><b>Edge</b>: put Caddy/Traefik/nginx with TLS in front (or make <code>web</code> terminate TLS), publish 80/443 only. Configure Uvicorn with <code>--proxy-headers</code> and trusted forwarded IPs.</li>
<li><b>Resilience</b>: <code>restart: unless-stopped</code> everywhere except one-shot jobs; health checks on every long-running service; app-level connection retries because after a host reboot dockerd restarts containers without <code>depends_on</code> ordering.</li>
<li><b>Data</b>: <code>pgdata</code> as an external volume in production, nightly <code>docker compose exec -T postgres pg_dump -Fc …</code> to off-host storage, Redis AOF if it holds anything you cannot rebuild.</li>
<li><b>Operations</b>: <code>docker compose logs -f api</code> for quick looks, but ship logs via a logging driver/agent; resource limits under <code>deploy.resources.limits</code> (honoured by Compose) so a runaway worker cannot starve Postgres; <code>docker compose ps</code> + health in your monitoring.</li>
<li><b>Graduation path</b>: the same file (minus <code>build</code>, plus <code>deploy</code> settings) can run on Swarm with <code>docker stack deploy -c compose.yaml shop</code> (Day 9), where <code>depends_on</code> is ignored and health checks drive rolling updates.</li>
</ul>`,
      iq: [
        ["dca", "In a Compose file, <code>api</code> has <code>depends_on: [postgres]</code>. On <code>docker compose up</code>, the API crashes with \"connection refused\" on the first start. Which change makes Compose wait until PostgreSQL accepts connections?", "<p>Add a <code>healthcheck</code> to <code>postgres</code> (e.g. <code>[\"CMD-SHELL\", \"pg_isready -U app -d app\"]</code>) and use the long form <code>depends_on: { postgres: { condition: service_healthy } }</code>. The short form only waits for the container to be <i>started</i>. Adding <code>restart: always</code> to the API would eventually work by crash-looping, but is not ordering; <code>links</code> is legacy and does not wait.</p>"],
        ["dca", "Which command removes the containers, networks <b>and</b> named volumes defined by the current Compose project?", "<p><code>docker compose down -v</code> (<code>--volumes</code>). Plain <code>down</code> removes containers and the project's networks but keeps volumes and images. <code>docker compose rm</code> removes only stopped service containers. External volumes are never removed by Compose.</p>"],
        ["dca", "Which TWO restart policies restart a container after the Docker daemon restarts, if the container was running before? (A) <code>no</code> (B) <code>always</code> (C) <code>unless-stopped</code> (D) <code>on-failure</code>", "<p><b>B and C.</b> <code>on-failure</code> restarts only after a non-zero exit, not because the daemon restarted; <code>no</code> never restarts. The difference between B and C: a container you stopped manually stays stopped after a daemon restart with <code>unless-stopped</code>, but is started again with <code>always</code>.</p>"],
        ["dca", "What is the difference between <code>docker compose exec api sh</code> and <code>docker compose run --rm api sh</code>?", "<p><code>exec</code> runs a new process inside the <b>already running</b> <code>api</code> container. <code>run</code> creates a <b>new, one-off container</b> from the <code>api</code> service definition (starting its dependencies unless <code>--no-deps</code>, without publishing its ports unless <code>--service-ports</code>), and <code>--rm</code> removes it afterwards. Use <code>run</code> for migrations, tests and admin scripts; <code>exec</code> for inspecting a live container.</p>"],
        ["mid", "Why does <code>docker compose up --scale api=3</code> fail with \"port is already allocated\" and how do you fix it?", "<p>The service publishes a fixed host port (<code>8000:8000</code>); only one container can bind it. Remove the host port and reach the replicas through a reverse proxy on the Compose network (nginx → <code>api:8000</code>, DNS returns all replicas), or publish a range/ephemeral port (<code>\"8000\"</code>) if you only need host access for testing. <code>container_name</code> also blocks scaling.</p>"],
        ["mid", "How do you run database migrations exactly once before the API starts?", "<p>A one-shot <code>migrate</code> service using the API image with <code>command</code> set to the migration, <code>restart: \"no\"</code>, <code>depends_on: postgres: condition: service_healthy</code>; and in the API <code>depends_on: migrate: condition: service_completed_successfully</code>. If the migration exits non-zero, <code>up</code> stops and reports it, so the API never starts against a half-migrated schema. Alternative: <code>docker compose run --rm api alembic upgrade head</code> as an explicit deploy step.</p>"],
        ["senior", "You edited <code>environment</code> for <code>api</code> and ran <code>docker compose restart api</code>, but the change is not visible. Why, and what is the right command?", "<p><code>restart</code> stops and starts the existing container with its original configuration. Configuration changes require recreating the container: <code>docker compose up -d</code> (Compose detects the config-hash change and recreates only <code>api</code>), or <code>up -d --force-recreate api</code>.</p>"],
        ["senior", "When would you prefer <code>docker compose watch</code> over bind-mounting source code?", "<p>When bind mounts are slow or problematic: Docker Desktop file sharing, Windows paths, inotify not crossing the VM boundary, or host <code>node_modules</code>/virtualenvs shadowing the container's. Watch syncs only the paths you list (with ignore rules) into the container's own filesystem, can rebuild on dependency-file changes, and keeps the image's installed dependencies intact. Bind mounts remain simpler on Linux and when tools in the container must write back to the host (formatters, generated code).</p>"],
        ["architect", "What does Compose not give you that you would need for production at scale, and what replaces it?", "<p>Multi-host scheduling and failover, rolling or blue/green updates without downtime, health-aware load balancing with stable virtual IPs, cluster-managed secrets, autoscaling, and declarative reconciliation of drift. Swarm adds most of these with the same file format (services, overlay networks, VIPs, rolling updates, secrets); Kubernetes adds them with richer APIs. Many teams use Compose for dev/CI and single-VM products, and an orchestrator or PaaS beyond that, while keeping service names and env-var configuration identical.</p>"]
      ],
      gotchas: [
        "<b><code>depends_on</code> is start-up only.</b> It does not restart dependents when a dependency dies later, it is ignored by Swarm, and dockerd's own restarts after a reboot ignore it. Apps must retry connections anyway.",
        "<b>Health checks need tools in the image.</b> <code>curl</code> is absent from <code>python:3.12-slim</code> and distroless images; a check that cannot run marks the container unhealthy forever and blocks <code>service_healthy</code> dependents.",
        "<b><code>restart: no</code> must be quoted</b> (<code>\"no\"</code>) because YAML 1.1 treats bare <code>no</code> as boolean false.",
        "<b>A one-shot service with <code>restart: always</code></b> (e.g. inherited from an anchor) runs forever in a loop. Override it with <code>restart: \"no\"</code>.",
        "<b>Unhealthy is not restarted</b> by plain Docker/Compose. Health affects ordering and <code>--wait</code>; recovery from hangs needs the app to exit (so the restart policy fires) or an orchestrator.",
        "<b><code>down -v</code> in a habit-forming alias</b> deletes the dev database every time; worse on a server. Keep production volumes <code>external</code>.",
        "<b>Port publishing on an <code>internal</code> network</b> has no effect, which surprises people who add <code>ports</code> to Postgres in an override; attach it to a non-internal network too (dev only).",
        "<b>nginx caches upstream DNS</b>: after scaling or recreating <code>api</code>, nginx may keep stale IPs (502s) until reloaded, unless configured to re-resolve via <code>127.0.0.11</code>.",
        "<b>The Vite dev server and Uvicorn default to localhost</b>; in containers pass <code>--host 0.0.0.0</code> or the published ports reset connections (Day 3)."
      ],
      best: [
        "Give every long-running service a meaningful health check (API health that pings its dependencies) and gate dependents with <code>condition: service_healthy</code>.",
        "Model migrations and seeders as one-shot services with <code>service_completed_successfully</code> and <code>restart: \"no\"</code>.",
        "Publish only the edge; keep API, Redis and Postgres on networks, with data stores on an <code>internal</code> network.",
        "Use <code>up -d --wait</code> in CI and deploy scripts so failures surface as non-zero exit codes.",
        "Use <code>docker compose watch</code> (or bind mounts on Linux) plus the dev target for hot reload; never ship dev servers in production images.",
        "Pin image tags via <code>\${TAG}</code>, pull then <code>up -d</code> to deploy, and never put <code>down -v</code> in production automation."
      ],
      lab: [
        "Create the <code>shop/</code> layout with the FastAPI app, migrate script, the two Dockerfiles, nginx.conf and a minimal React page that calls <code>/api/visits</code> and <code>/api/notes</code>.",
        "Write <code>compose.yaml</code> as shown; run <code>docker compose -f compose.yaml up -d --build --wait</code> and confirm all services are healthy and <code>migrate</code> exited 0 (<code>ps -a</code>).",
        "Exercise the flow with <code>curl</code> through <code>localhost:8080</code>: increment visits twice, add a note, read notes twice and see <code>source</code> switch from postgres to redis.",
        "Break ordering on purpose: change the API's dependency on postgres to the short form, add <code>sleep 20 &&</code> before Postgres starts (via <code>command</code>/entrypoint wrapper), and observe the API failing; restore <code>service_healthy</code>.",
        "Stop Redis, observe the API go <code>unhealthy</code> and <code>/api/health</code> return 503; start Redis and watch it recover without a restart.",
        "Run the dev setup (<code>docker compose up -d</code> + <code>docker compose watch</code>), change the React heading and a FastAPI response, and see both update without rebuilding.",
        "Scale the API to 3 in the production setup, check DNS with <code>nslookup api 127.0.0.11</code> from <code>web</code>, then scale back.",
        "<code>docker compose down</code>, <code>up</code> again and confirm notes and the visit counter survived; then <code>down -v</code> and confirm they are gone.",
        "<b>Done when:</b> a fresh clone plus <code>.env</code> and one <code>docker compose up -d --wait</code> brings up all four services healthy in the right order, and you can explain each hop of a request and what every lifecycle command did to containers, networks and volumes."
      ],
      teach: `<p>"Our stack is React served by nginx, FastAPI, Redis and Postgres. In Compose each is a service; nginx serves the React build and proxies <code>/api</code> to <code>api:8000</code>; FastAPI uses <code>redis:6379</code> and <code>postgres:5432</code>, all by service name. Only nginx publishes a port. Redis and Postgres sit on an internal network and keep their data in named volumes.</p>
<p>Ordering is where most stacks go wrong. Plain <code>depends_on</code> only means 'start the container first', not 'ready'. So Postgres and Redis get health checks, <code>pg_isready</code> and <code>redis-cli ping</code>; a one-shot migrate service waits for Postgres to be healthy and must exit 0; the API waits for all three with <code>service_healthy</code> and <code>service_completed_successfully</code>; and nginx waits for the API's own health check. Restart policies, usually <code>unless-stopped</code>, bring things back after crashes and reboots; health alone does not restart anything.</p>
<p>Day to day: <code>up -d --build --wait</code>, <code>ps</code>, <code>logs -f</code>, <code>exec</code> into a running container, <code>run --rm</code> for one-off jobs, <code>watch</code> for hot reload, <code>--scale</code> for replicas. <code>restart</code> doesn't apply config changes, <code>up</code> does. <code>down</code> keeps your data; <code>down -v</code> deletes it."</p>`
    }
  ],
  quiz: [
    {
      q: "A teammate's stack starts but the API logs <code>could not translate host name \"db\" to address</code>. The Compose file is below. What is wrong?",
      code: `services:
  api:
    image: myorg/api:1.0
    environment:
      DATABASE_URL: postgresql://app:secret@db:5432/app
  postgres:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: secret`,
      lang: "yaml",
      ans: "The service is called <code>postgres</code>, not <code>db</code>; service names are the DNS names.",
      why: "Compose registers each service name as an alias on the project network. Either use <code>@postgres:5432</code> in the URL, rename the service, or add <code>networks: default: aliases: [db]</code> to postgres. (Also: the user/database <code>app</code> does not exist because only <code>POSTGRES_PASSWORD</code> is set; that would be the next error.)"
    },
    {
      q: "In CI, <code>docker compose up -d</code> succeeds but the first integration test fails with connection errors to the API about half of the time. The API has a health check. What single flag fixes the race?",
      ans: "<code>docker compose up -d --wait</code>",
      why: "<code>-d</code> returns as soon as containers are started; <code>--wait</code> blocks until services are running and healthy (and fails the command if one becomes unhealthy). Adding <code>sleep 30</code> is slower and still flaky."
    },
    {
      q: "A developer adds <code>POSTGRES_PASSWORD=pa$word1</code> to <code>.env</code> and uses <code>\${POSTGRES_PASSWORD}</code> in compose.yaml. Postgres starts but login fails with the password they typed. Why?",
      ans: "Values containing <code>$</code> are interpolated; <code>$word1</code> is treated as a variable.",
      why: "Compose interpolates <code>$word1</code> (unset → empty), so the actual password is <code>pa</code>. Quote the value with single quotes in <code>.env</code> (<code>'pa$word1'</code>, which disables interpolation in the .env file) or escape as <code>$$</code>. Check with <code>docker compose config</code>. Remember that Postgres only uses the variable on first initialisation."
    },
    {
      q: "After <code>git pull</code> the team runs <code>docker compose restart</code>, but the new <code>REDIS_URL</code> in compose.yaml is not picked up, and the new <code>worker</code> service did not start. What should they run?",
      ans: "<code>docker compose up -d</code> (with <code>--build</code> if Dockerfiles or code changed).",
      why: "<code>restart</code> only restarts existing containers with their old configuration and never creates services. <code>up -d</code> reconciles: it recreates services whose config hash changed and creates new ones, leaving unchanged services (like Postgres) running."
    },
    {
      q: "The <code>migrate</code> service keeps running over and over and <code>api</code> never starts. The file uses an anchor <code>&lt;&lt;: *defaults</code> that contains <code>restart: always</code>. Explain.",
      ans: "The one-shot migrate container is restarted after every successful exit, so it never stays \"completed\", and the API waits for <code>service_completed_successfully</code>.",
      why: "Set <code>restart: \"no\"</code> explicitly on <code>migrate</code> (after the merge key so it overrides the anchor). One-shot jobs must not have <code>always</code>/<code>unless-stopped</code>."
    },
    {
      q: "Which TWO commands delete the PostgreSQL data stored in the project's named volume <code>pgdata</code> (not declared external)? (A) <code>docker compose down</code> (B) <code>docker compose down -v</code> (C) <code>docker compose rm -f postgres</code> (D) <code>docker volume rm shop_pgdata</code> after <code>down</code>",
      ans: "B and D.",
      why: "A keeps volumes. C removes the stopped container only (its <code>-v</code> option would remove anonymous volumes, not named ones). B removes named volumes declared in the file; D removes it directly once no container uses it."
    }
  ]
}
]});
