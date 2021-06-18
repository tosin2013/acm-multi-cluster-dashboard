import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '60s', target: 20 },
    { duration: '3m30s', target: 30 },
    { duration: '30s', target: 5 },
  ],
};

export default function () {
  let res = http.get('http://dashboard-demo-dashboard-demo.apps.90c6.example.opentlc.com/');
  check(res, { 'status was 200': (r) => r.status == 200 });
  sleep(1);
}
