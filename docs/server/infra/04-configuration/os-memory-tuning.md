# Linux Memory Tuning and Troubleshooting Guide

Ubuntu 24.04 LTS (applies to most modern Linux distributions with minor command differences).

## Why This Matters

Backend services (Django, Celery, GeoServer/Tomcat, PostgreSQL) can fail under memory pressure.  
A stable host setup needs:

- enough RAM for normal load
- right-size swap for bursts
- safe `vm.swappiness` tuning
- clear troubleshooting steps for OOM and latency issues

---

## 1. Quick Health Checks

Run these first during incidents:

```bash
free -h
vmstat 1 5
top
ps aux --sort=-%mem | head -n 15
dmesg -T | rg -i "killed process|out of memory|oom"
```

What to look for:
- very low `available` memory in `free -h`
- high `si/so` (swap in/out) in `vmstat` (swap thrashing)
- OOM killer messages in `dmesg`

---

## 2. How to Decide Swap Size

Use this practical baseline:

| RAM | Recommended Swap |
|---|---|
| <= 4 GB | 2x RAM |
| 8 GB | 4-8 GB |
| 16 GB | 4-8 GB |
| 32 GB+ | 2-8 GB (burst safety only) |

Notes:
- If hibernation is required, swap should be at least RAM size.
- For server workloads, swap is a safety buffer, not primary memory.
- More swap does not fix memory leaks; it only delays failures.

---

## 3. Create or Resize Swap File

Example: create 8 GB swap file.

```bash
sudo swapoff -a
sudo fallocate -l 8G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
swapon --show
free -h
```

If `fallocate` is unavailable, use:

```bash
sudo dd if=/dev/zero of=/swapfile bs=1M count=8192 status=progress
```

---

## 4. `vm.swappiness`: What and How to Set

`vm.swappiness` controls how aggressively Linux moves memory pages to swap.

- `10`: keep most data in RAM, swap only when needed (common for application servers)
- `20-30`: moderate pressure handling
- `60` (default on many systems): balanced desktop/general behavior

Check current value:

```bash
cat /proc/sys/vm/swappiness
```

Set temporarily:

```bash
sudo sysctl vm.swappiness=10
```

Set permanently:

```bash
echo 'vm.swappiness=10' | sudo tee /etc/sysctl.d/99-corestack-memory.conf
sudo sysctl --system
```

### What Drives Swappiness Choice

Pick swappiness based on workload behavior, not a fixed number:

- memory burst pattern (steady vs sudden spikes)
- latency sensitivity (API/UI requests vs batch jobs)
- swap I/O characteristics on the host volume
- mix of JVM/Python/PostgreSQL processes
- observed `vmstat si/so` under peak traffic

Initialization sequence for new hosts:
1. set initial value to `10`
2. run representative workload
3. review `free -h`, `vmstat`, `dmesg`
4. adjust to `5-20` range if needed
5. keep value in `/etc/sysctl.d/99-corestack-memory.conf`

### How to Pick the Value

- Start with `10` for backend-heavy hosts.
- If OOM happens with no swap use and RAM spikes fast, try `15-20`.
- If latency rises due to swap I/O (`vmstat` shows sustained `si/so`), move down to `5-10`.
- Re-check after 24-72 hours under normal + peak load.

---

## 5. Troubleshooting Memory Issues

### Scenario A: OOM Kill Happened

1. Confirm:
   ```bash
   dmesg -T | rg -i "out of memory|killed process|oom"
   ```
2. Identify top consumers:
   ```bash
   ps aux --sort=-%mem | head -n 20
   ```
3. Immediate actions:
   - restart only the failed service (not the full host unless necessary)
   - reduce Celery concurrency temporarily
   - pause heavy batch jobs
4. Durable fixes:
   - increase RAM or optimize workload
   - set realistic worker counts
   - add queue backpressure/rate limits

### Scenario B: High Swap Use but No OOM

Symptoms:
- response latency increases
- CPU `wa` (I/O wait) grows
- `vmstat` shows repeated `si/so`

Actions:
- reduce process concurrency
- set `vm.swappiness` lower (for example from 60 to 10)
- check for memory leaks in long-lived workers
- restart stale workers during low-traffic windows

### Scenario C: Memory Slowly Climbs Over Days

Possible memory leak or cache growth.

Actions:
- capture process memory periodically:
  ```bash
  while true; do date; ps -eo pid,cmd,%mem,rss --sort=-rss | head -n 12; sleep 300; done
  ```
- rotate workers (Celery `--max-tasks-per-child`)
- review app-level caches and JVM heap settings (for GeoServer/Tomcat)

---

## 6. Service-Specific Guidance

- **Django + Apache/mod_wsgi**
  - Keep process/thread counts proportional to RAM.
  - Avoid over-provisioning workers on small instances.

- **Celery**
  - Concurrency should be tuned per queue and task type.
  - CPU-heavy and memory-heavy tasks should not share the same high-concurrency queue.

- **GeoServer/Tomcat**
  - Set JVM heap (`-Xms`, `-Xmx`) explicitly.
  - Leave enough RAM for OS page cache and other services.

- **PostgreSQL**
  - Revisit `shared_buffers` and `work_mem` if database process dominates memory.

---

## 7. Minimal Incident Runbook

```bash
free -h
vmstat 1 5
ps aux --sort=-%mem | head -n 20
dmesg -T | rg -i "oom|killed process"
```

Then:
1. stop/slow the largest offender
2. restore service health
3. tune swap + swappiness
4. reduce worker concurrency
5. schedule a postmortem with sustained monitoring

---

## 8. Recommended Starting Point (CoreStack Hosts)

- Swap: `4-8 GB` (or more on small RAM hosts)
- `vm.swappiness=10`
- Alerting:
  - available memory < 15%
  - swap usage > 40%
  - OOM events > 0

Revisit monthly or after major workload changes.

---

## 9. Common Infra Troubleshooting (Non-Memory)

### GeoServer/Tomcat Hangs

Symptoms:
- endpoint times out
- Tomcat process alive but no response on `8443`

Checks:
```bash
sudo systemctl status tomcat
ps -ef | rg -i "tomcat|java"
sudo journalctl -u tomcat -n 200 --no-pager
sudo ss -lntp | rg 8443
```

Actions:
- capture logs before restart
- restart Tomcat only (`sudo systemctl restart tomcat`)
- validate JVM heap limits and host free memory
- check GeoServer data directory lock/contention

### Network Unreachable / Intermittent API Failures

Checks:
```bash
ip a
ip route
ping -c 4 8.8.8.8
ping -c 4 geoserver.core-stack.org
curl -I https://geoserver.core-stack.org
sudo ss -s
```

Actions:
- verify security-group + firewall rules (`ufw`, cloud SG/NACL)
- confirm DNS resolution and TTL changes
- test internal localhost service first, then public endpoint
- inspect packet drops (`dmesg`, NIC stats) during incident window
