# Pour Jenkins
FROM jenkins/jenkins:lts-jdk11

USER jenkins

RUN jenkins-plugin-cli --plugins configuration-as-code
RUN jenkins-plugin-cli --plugins job-dsl
RUN jenkins-plugin-cli --plugins role-strategy
RUN jenkins-plugin-cli --plugins credentials
RUN jenkins-plugin-cli --plugins github
RUN jenkins-plugin-cli --plugins ws-cleanup
RUN jenkins-plugin-cli --plugins workflow-aggregator:596.v8c21c963d92d


ENV JAVA_OPTS="-Djenkins.install.runSetupWizard=false"

COPY jenkins.yaml /var/jenkins_home/jenkins.yaml
COPY job_dsl.groovy /var/jenkins_home/job_dsl.groovy

ENV CASC_JENKINS_CONFIG=/var/jenkins_home/jenkins.yaml