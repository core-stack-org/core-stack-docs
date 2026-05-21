# Nagios Monitoring Thresholds and Alert Frequency

This page documents service-level Nagios checks, threshold interpretation, alert timing behavior, and why CloudWatch may detect some short-lived incidents earlier than Nagios.

## Service Monitoring Table

| Service | NRPE Command | What It Checks | Warning Threshold | Critical Threshold | Threshold Meaning |
|---|---|---|---|---|---|
| CPU Usage | `check_nrpe!check_cpu` | CPU utilization | `40%` | `50%` | WARNING if CPU usage exceeds 40%, CRITICAL above 50% |
| RAM Usage | `check_nrpe!check_ram` | Server RAM utilization | `40%` | `50%` | WARNING if RAM usage exceeds 40%, CRITICAL above 50% |
| Swap Usage | `check_nrpe!check_swap` | Swap memory usage | `40%` | `50%` | WARNING if swap usage exceeds 40%, CRITICAL above 50% |
| Apache Service | `check_nrpe!check_apache` | Apache/httpd process health | Apache process unhealthy | Apache process stopped | Checks whether Apache web server process is running properly |
| Tomcat | `check_nrpe!check_tomcat` | Tomcat Java application server process | Tomcat process unhealthy | Tomcat process stopped | Checks whether Tomcat service/process is active |
| PostgreSQL Service | `check_nrpe!check_postgress` | PostgreSQL database process | Database connection issue | PostgreSQL process stopped | Checks whether PostgreSQL database service is running |

## Process Health Meaning

| Status | Meaning |
|---|---|
| Healthy Process | Service/process is running normally and responding |
| Unhealthy Process | Process exists but may be overloaded, hung, or partially failing |
| Process Stopped | Service/process is not running at all |
| Recovery | Process/service becomes healthy again after failure |

## Alert Frequency Table

| Setting | Typical Value | Meaning |
|---|---|---|
| `check_interval` | `5` minutes | Nagios checks the service every 5 minutes |
| `retry_interval` | `1` minute | If service fails, Nagios retries every 1 minute |
| `max_check_attempts` | `3` | Alert becomes HARD state after 3 failed attempts |
| `notification_interval` | `30` minutes | Nagios sends repeated reminder emails every 30 minutes |
| `notification_period` | `24x7` | Notifications are allowed all the time |

## Email Alert Timeline

| Time | Event |
|---|---|
| 10:00 | Service fails |
| 10:01 | Retry attempt 1 |
| 10:02 | Retry attempt 2 |
| 10:03 | HARD state reached, first email alert sent |
| 10:33 | Reminder email sent |
| 11:03 | Reminder email sent |
| 11:10 | Service recovers |
| 11:10 | Recovery email sent |

## Why Amazon CloudWatch Detects High Swap Usage but Nagios May Not

| Monitoring Tool | Behavior |
|---|---|
| Amazon CloudWatch | Uses event-driven monitoring and near real-time metric streaming through CloudWatch Agent/EC2 metrics. It can detect short-lived swap spikes and transient memory pressure events before Nagios performs its next scheduled poll. |
| Nagios | Checks only during scheduled polling intervals (for example every 5 minutes). If swap usage becomes high and recovers before the next Nagios check, Nagios may never detect the issue while CloudWatch does. |

### Example Scenario

| Time | Event |
|---|---|
| 10:00 | Swap usage spikes to 80% |
| 10:01 | CloudWatch event/metric stream detects high swap usage and triggers alert |
| 10:03 | System memory pressure reduces and swap usage falls back to 10% |
| 10:05 | Nagios performs next scheduled check |
| 10:05 | Nagios sees normal swap usage and reports OK |

### Why This Happens

| Reason | Explanation |
|---|---|
| Monitoring architecture difference | CloudWatch uses continuous metric/event collection while Nagios relies on scheduled polling intervals |
| Transient spikes | Temporary spikes can recover before Nagios polls again |
| Memory reclamation | Linux may automatically free swap/cache before Nagios checks |
| Check scheduling delay | Nagios is poll-based, not continuous streaming metrics |

## CPU Load Threshold Explanation

For CPU checks:

```bash
check_load -w 40,40,40 -c 50,50,50
```

The values represent:

| Position | Meaning |
|---|---|
| First value | 1-minute average load |
| Second value | 5-minute average load |
| Third value | 15-minute average load |

Example interpretation:

| Time Window | Warning | Critical |
|---|---|---|
| Last 1 minute | > 40 | > 50 |
| Last 5 minutes | > 40 | > 50 |
| Last 15 minutes | > 40 | > 50 |
