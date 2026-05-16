# GeoServer + Tomcat + SSL (8443) Setup Guide

Ubuntu 24.04 LTS

## Overview

This guide installs:

- Apache Tomcat 10
- GeoServer (WAR deployment)
- HTTPS on port `8443`
- systemd service for Tomcat

Final URL:
`https://geoserver.core-stack.org:8443/geoserver`

## Prerequisites

- Ubuntu 24.04 host with sudo access
- DNS for `geoserver.core-stack.org`
- Open port `8443` in security group/firewall
- Java 17 available

---

## 1. Install Java

GeoServer requires Java 11 or 17 (Java 17 recommended):

```bash
sudo apt update
sudo apt install openjdk-17-jdk
java -version
```

## 2. Install Apache Tomcat 10

```bash
sudo useradd -m -U -d /opt/tomcat -s /bin/false tomcat
cd /tmp
wget https://downloads.apache.org/tomcat/tomcat-10/v10.1.24/bin/apache-tomcat-10.1.24.tar.gz
sudo mkdir -p /opt/tomcat
sudo tar -xzf apache-tomcat-10.1.24.tar.gz -C /opt/tomcat --strip-components=1
sudo chown -R tomcat:tomcat /opt/tomcat
sudo chmod -R 755 /opt/tomcat
```

## 3. Create Tomcat systemd Service

Create `/etc/systemd/system/tomcat.service`:

```ini
[Unit]
Description=Apache Tomcat
After=network.target

[Service]
Type=forking
User=tomcat
Group=tomcat
Environment=JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
Environment=CATALINA_PID=/opt/tomcat/temp/tomcat.pid
Environment=CATALINA_HOME=/opt/tomcat
Environment=CATALINA_BASE=/opt/tomcat
ExecStart=/opt/tomcat/bin/startup.sh
ExecStop=/opt/tomcat/bin/shutdown.sh
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable tomcat
sudo systemctl start tomcat
sudo systemctl status tomcat
```

## 4. Install GeoServer (WAR)

```bash
cd /tmp
wget https://sourceforge.net/projects/geoserver/files/GeoServer/2.24.2/geoserver-2.24.2-war.zip
sudo apt install unzip
unzip geoserver-2.24.2-war.zip
sudo cp geoserver.war /opt/tomcat/webapps/
sudo chown tomcat:tomcat /opt/tomcat/webapps/geoserver.war
sudo systemctl restart tomcat
```

Wait 1-2 minutes, then open:
`http://geoserver.core-stack.org:8080/geoserver`

Default credentials:
- Username: `admin`
- Password: `geoserver`

> Bootstrap defaults are for first login only. Change these immediately and store production credentials in the approved secret manager.
> See `credentials-and-secrets.md`.

## 5. Configure HTTPS on 8443

Use Let's Encrypt certificate and convert it to PKCS12:

```bash
sudo apt install certbot
sudo certbot certonly --standalone -d geoserver.core-stack.org
sudo openssl pkcs12 -export \
-in /etc/letsencrypt/live/geoserver.core-stack.org/fullchain.pem \
-inkey /etc/letsencrypt/live/geoserver.core-stack.org/privkey.pem \
-out /opt/tomcat/conf/keystore.p12 \
-name tomcat \
-password pass:changeit
```

Add this connector in `server.xml`:

```xml
<Connector port="8443"
 protocol="org.apache.coyote.http11.Http11NioProtocol"
 SSLEnabled="true">
 <SSLHostConfig>
   <Certificate
     certificateKeystoreFile="/opt/tomcat/conf/keystore.p12"
     certificateKeystorePassword="changeit"
     certificateKeystoreType="PKCS12"
     type="RSA" />
 </SSLHostConfig>
</Connector>
```

Restart Tomcat:

```bash
sudo systemctl restart tomcat
```

## 6. Open Firewall Port

```bash
sudo ufw allow 8443/tcp
sudo ufw reload
```

## 7. Logs

```bash
tail -f /var/log/tomcat/catalina.out
```

## Verify

```bash
sudo systemctl status tomcat
curl -I https://geoserver.core-stack.org:8443/geoserver
```

Expected:
- Tomcat service is `active (running)`
- GeoServer responds over HTTPS

## Troubleshooting

- `404 /geoserver`: check if `geoserver.war` extracted under `/opt/tomcat/webapps/`.
- HTTPS handshake issues: verify keystore path/password and connector config.
- Slow responses: review JVM heap sizing and host memory pressure.

## Final Architecture

Client -> HTTPS `8443` -> Tomcat -> GeoServer

## Related: OS Memory Tuning

If Tomcat performance degrades under load, use:

- `os-memory-tuning.md`