
#ddev-generated - Do not modify this file; your modifications will be overwritten.
ARG BASE_IMAGE="scratch"

### DDEV-injected base Dockerfile contents
FROM $BASE_IMAGE
SHELL ["/bin/bash", "-c"]

ARG TARGETPLATFORM
ARG TARGETARCH
ARG TARGETOS
ARG username
ARG uid
ARG gid
ARG DDEV_PHP_VERSION
ARG DDEV_DATABASE
RUN getent group tty || groupadd tty
RUN (groupadd --gid $gid "$username" || groupadd "$username" || true) && (useradd -G tty -l -m -s "/bin/bash" --gid "$username" --comment '' --uid $uid "$username" || useradd -G tty -l -m -s "/bin/bash" --gid "$username" --comment '' "$username" || useradd  -G tty -l -m -s "/bin/bash" --gid "$gid" --comment '' "$username" || useradd -G tty -l -m -s "/bin/bash" --comment '' $username )

### DDEV-injected extra content

ENV PATH=$PATH:/usr/lib/postgresql/$PG_MAJOR/bin
ADD postgres_healthcheck.sh /
RUN chmod ugo+rx /postgres_healthcheck.sh
RUN mkdir -p /etc/postgresql/conf.d && chmod 777 /etc/postgresql/conf.d
RUN echo "*:*:db:db:db" > ~postgres/.pgpass && chown postgres:postgres ~postgres/.pgpass && chmod 600 ~postgres/.pgpass && chmod 777 /var/tmp && ln -sf /mnt/ddev_config/postgres/postgresql.conf /etc/postgresql && echo "restore_command = 'true'" >> /var/lib/postgresql/recovery.conf
RUN printf "# TYPE DATABASE USER CIDR-ADDRESS  METHOD \nhost  all  all 0.0.0.0/0 md5\nlocal all all trust\nhost    replication    db             0.0.0.0/0  trust\nhost replication all 0.0.0.0/0 trust\nlocal replication all trust\nlocal replication all peer\n" >/etc/postgresql/pg_hba.conf
RUN (timeout 120 apt-get update || true) && DEBIAN_FRONTEND=noninteractive apt-get install -y -o Dpkg::Options::="--force-confold" --no-install-recommends --no-install-suggests bzip2 less procps pv vim

