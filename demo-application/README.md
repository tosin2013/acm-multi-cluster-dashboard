
# Sample application used for ClusterQuota Dashboard

**Create new project**
```
oc adm new-project  dashboard-demo 
```

**Label your project**
```
oc label namespace dashboard-demo quota=dashboard-demo
```

**Set the cluster resource limits for the project**
```
oc create clusterresourcequota dashboard-demo-quota --project-label-selector=name=dashboard-demo --hard=pods=10 --hard=secrets=20 --hard=requests.memory=300Mi --hard=requests.cpu=300m --hard=memory=300Mi --hard=cpu=300m
```

**Create sample app**
```
oc create -f demo-application/dashboard-demo.yaml 
```