import bcrypt from 'bcryptjs';

async function hashPassword() {
  const password = 'Password123#';
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log(hashedPassword);
}

function printKey() {
  const key = {
    type: 'service_account',
    project_id: 'resource-realty-484715',
    private_key_id: '08ba25480a1117c668d84ddd93a106878d2cf5dc',
    private_key:
      '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCKYklk1TdVfUG2\n+eBmEcpP7psGGNoMNlZBbHINMfcvwQ/hq1hiz58dpFQD5e2t+6JtptNPtrdV4UT7\nwbuSUJIimR0VwrZWdBZGy8ADRzSEsLI3Aojgv64vTVME9YWCA9/bqwqGZo7TVQsp\nZKaIV2FjGcFxlGSFier3wryDadiIQK5jzoHBN3Ui4uIrAR2HQXZHI8+9ky00c14t\nv33q7gu8ZF6rU+GfOO2GUFSSuveGpwXTNXr4awRWebrDi+Byq0QF8hdudrJgM2z9\nZi9PEoRD1ejsLs/BF3RrDkq+Uk/mbQgN+UiqOwiLSIvv7HCq8kDAOxYfCHtM1NM7\n5wbWxjqxAgMBAAECggEACNQcOzCDi+xmhZSe6KdVTgP6sO9jjduzmHXuN5t985AW\n6GTrMFaibJyZkMWzanulnhncD/eOVI5lvV51QVbrLWwX5NXPMAHOkzkX6KQIAwUk\nDlb9KFvvC9NPkUvtEHsY/4wDqy84CN4hzN2M5rriAPwMkUEp22X0O/B/ei5sPMXO\nAwe/tdL63iU0UXvxGHLYZpwGREccHuVVpWyXhHBnq1rpTzndcC5S+qDoViNnerau\nFeAiLteOiVTKwraMegA2CkJgcfFaFASynigIhf6qQEyEjQPLb1tfhmgxV9zAL/in\nsQYM55gEx4NUQ9SJes7JbwwW8IVI5RBTpXpi++qRNwKBgQC844vytep/up20GXT1\nozdpOD1gHbw7zBf8hUF2CqrTINuHzg382nULnxkR349AB2pJ5a5q/Mf1mRCaJFMY\n3EYjm7XvXQxKmP3+zIclAkeZ99pt1k1oKQOcB1+RaMDqZcHHSGt1SOgTiReDz74E\njDoepZUoICwdvvOIneMWXmK3KwKBgQC7jQv6THjiTwvJgi9OESSzU0pIJo4AlfAQ\nk5rqYXIrj/UffylCcDlWn/WrUsVkQa/z7Gl97N9Zmp6ExzvRMn1+Ka//28SXwhdu\nw1yszaENBwkWtmrST6aJRAnxwJzyeO7rEoJAfE/XmuACnI9A8HhB+i11XRuAsjFo\nVkQ5js6nkwKBgQCBf7Ob0/KQXV3vcqCII71CiwcxFVHO4U70lltZ1VhmZRl9Etzu\nJMuoCwyB/3ZTnIHXZftdaC6jB6ylMRAzdBk2InPqRi2+GwPQI2LoEZcLTSzYrtrk\n9XF/EGMJ6vqP+PGQcesSPsi1VADmIpAQyB60kisflmcIgbivSie9VzpwfwKBgQC0\nk61ApXiOjQUQU6QwShlH/525skVvEu49R6EUohZHEygz1z9mlJ7gZMso1Vzwlr5O\n4QUBFZxGrbSKqzlQxohFfOXUN0klxN7C6p7EUogJ/wglMiXPsJjr+PKKLaXvX7jJ\n5Nw8MnS9ZoTgftT+9YkUHUi/g5IDa45eoxC1SmZ2uQKBgEzGl+7HPq36kkUFYHEo\ndBPEuWSTecf3BGhjFyz5xaxMlVsecHaoYzxD9g7gFK6yzUkBELvmR6MDJOpJq/o4\n3hdZDJ3xATXTs7lDqpqd5KNwJDYH63xGKtAcfx8UeisO8kIp35t4ZhXel0q5ZIg/\n+EZjFSMpWRsJTHyuCpg9R3TI\n-----END PRIVATE KEY-----\n',
    client_email: 'file-admin@resource-realty-484715.iam.gserviceaccount.com',
    client_id: '112594639474305318591',
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url:
      'https://www.googleapis.com/robot/v1/metadata/x509/file-admin%40resource-realty-484715.iam.gserviceaccount.com',
    universe_domain: 'googleapis.com',
  };

  console.log(JSON.stringify(key));
}

// hashPassword();

printKey();
