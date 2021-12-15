# Install MultiCluster Observability  

**Create open-cluster-management-observability  project** 
```
oc new-project open-cluster-management-observability 
```

**Run the following command to create pull secret:**
```
DOCKER_CONFIG_JSON=`oc extract secret/pull-secret -n openshift-config --to=-`
oc create secret generic multiclusterhub-operator-pull-secret \
    -n open-cluster-management-observability \
    --from-literal=.dockerconfigjson="$DOCKER_CONFIG_JSON" \
    --type=kubernetes.io/dockerconfigjson
```

## For AWS Deployments
**Optional: Download aws cli**
```
curl -OL https://raw.githubusercontent.com/tosin2013/openshift-4-deployment-notes/master/aws/configure-aws-cli.sh
chmod +x configure-aws-cli.sh
./configure-aws-cli.sh
```

**Validate AWS Credentials**
```
aws sts get-caller-identity 
```

**Create bucket**
* https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteEndpoints.html
```
aws s3 mb s3://thanos-object-storage
```


**For Amazon S3 or S3 compatible**
> For other storage classes see documentation 
```
cat >thanos-object-storage.yaml<<EOF
apiVersion: v1
kind: Secret
metadata:
  name: thanos-object-storage
type: Opaque
stringData:
  thanos.yaml: |
    type: s3
    config:
      bucket: thanos-object-storage
      endpoint: s3.us-east-1.amazonaws.com
      insecure: false
      access_key: YOUR_ACCESS_KEY
      secret_key: YOUR_SECRET_KEY
EOF
```

**Edit thanos-object-storage.yaml**

**Create Secret**
```
oc create -f thanos-object-storage.yaml -n open-cluster-management-observability
```

**Create the MultiClusterObservability custom resource YAML**
```
cat >multiclusterobservability_cr.yaml<<YAML
apiVersion: observability.open-cluster-management.io/v1beta2
kind: MultiClusterObservability
metadata:
  name: observability #Your customized name of MulticlusterObservability CR
apiVersion: observability.open-cluster-management.io/v1beta2
kind: MultiClusterObservability
metadata:
  name: observability
spec:
  observabilityAddonSpec: {}
  storageConfig:
    metricObjectStorage:
      name: thanos-object-storage
      key: thanos.yaml
YAML
```

**Apply the observability YAML to your cluster**
```
oc apply -f multiclusterobservability_cr.yaml
```

## For ODF Deployments


**Create bucket**
```
$ oc project open-cluster-management-observability 
$ cat >thanos-object-bucket.yaml<<EOF
apiVersion: objectbucket.io/v1alpha1
kind: ObjectBucketClaim
metadata:
  name: thanos-object-storage-bucket
  namespace: open-cluster-management-observability 
  finalizers:
    - objectbucket.io/finalizer
  labels:
    app: noobaa
    bucket-provisioner: openshift-storage.noobaa.io-obc
    noobaa-domain: openshift-storage.noobaa.io
spec:
  additionalConfig:
    bucketclass: noobaa-default-bucket-class
  objectBucketName: thanos-object-storage-bucket
  bucketName: thanos-object-storage-bucket
  storageClassName: openshift-storage.noobaa.io
EOF
$ oc create -f thanos-object-bucket.yaml
```


**Create ODF storage secret**
> For other storage classes see documentation 
![20211011130350](https://i.imgur.com/CL8E1Wo.png)
![20211011130421](https://i.imgur.com/1jgOHnz.png)
```
YOUR_OSC_ACCESS_KEY=$( oc -n open-cluster-management-observability get secret thanos-object-storage-bucket  -o jsonpath="{.data.AWS_ACCESS_KEY_ID}" | base64 --decode)
YOUR_OSC_SECRET_KEY=$( oc -n open-cluster-management-observability get secret thanos-object-storage-bucket  -o jsonpath="{.data.AWS_SECRET_ACCESS_KEY}" | base64 --decode)
cat >thanos-object-storage.yaml<<EOF
apiVersion: v1
kind: Secret
metadata:
  name: thanos-object-storage
type: Opaque
stringData:
  thanos.yaml: |
    type: s3
    config:
      bucket: thanos-object-storage-bucket
      endpoint: s3.openshift-storage.svc
      insecure: true
      access_key: ${YOUR_OSC_ACCESS_KEY}
      secret_key: ${YOUR_OSC_SECRET_KEY}
EOF
```
**Edit thanos-object-storage.yaml**
**Create Secret**
```
oc create -f thanos-object-storage.yaml -n open-cluster-management-observability
```

**Create the MultiClusterObservability custom resource YAML**
```
cat >multiclusterobservability_cr.yaml<<YAML
apiVersion: observability.open-cluster-management.io/v1beta2
kind: MultiClusterObservability
metadata:
  name: observability #Your customized name of MulticlusterObservability CR
apiVersion: observability.open-cluster-management.io/v1beta2
kind: MultiClusterObservability
metadata:
  name: observability
spec:
  observabilityAddonSpec: {}
  storageConfig:
    metricObjectStorage:
      name: thanos-object-storage
      key: thanos.yaml
YAML
```

**Apply the observability YAML to your cluster**
```
oc apply -f multiclusterobservability_cr.yaml
```

## User permissions

**Add read-only users to dashboard**
``` 
USERNAME=user
oc adm policy add-cluster-role-to-user cluster-monitoring-view  ${USERNAME}
oc adm policy add-cluster-role-to-user advanced-cluster-management-view ${USERNAME}
```

## Reference Link
* [OBSERVING ENVIRONMENTS](https://access.redhat.com/documentation/en-us/red_hat_advanced_cluster_management_for_kubernetes/2.3/html/observability/index)
