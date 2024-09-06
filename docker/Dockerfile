FROM 172.16.1.99/aip/aip-ui-base:master

ENV KG_PIERCE_MVP_HOME=/usr/lib/kg_pierce_mvp
WORKDIR ${KG_PIERCE_MVP_HOME}
COPY dist/ ${KG_PIERCE_MVP_HOME}/build
COPY bin/ ${KG_PIERCE_MVP_HOME}/bin
# COPY confd/ /etc/confd
RUN ln ${KG_PIERCE_MVP_HOME}/bin/boot.sh /bin/boot.sh && chmod 777 /bin/boot.sh \
    && ln ${KG_PIERCE_MVP_HOME}/bin/bootstrap.sh /bin/bootstrap.sh && chmod 777 /bin/bootstrap.sh
