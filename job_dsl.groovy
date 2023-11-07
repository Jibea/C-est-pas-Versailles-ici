pipeline {
    agent any
    stages {
        stage('Build Docker Image') {
            steps {
                script {
                    sh 'docker build -t c-est-pas-versailles-ici_vue-js-app:latest .'
                }
            }
        }
    }
    post {
        success {
            echo 'Docker image built successfully!'
        }
    }
}
