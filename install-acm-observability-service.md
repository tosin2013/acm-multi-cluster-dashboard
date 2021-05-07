# Install MultiCluster Observability  
 
**Run the following command:**
```
DOCKER_CONFIG_JSON=`oc extract secret/pull-secret -n openshift-config --to=-`
oc create secret generic multiclusterhub-operator-pull-secret \
    -n open-cluster-management-observability \
    --from-literal=.dockerconfigjson="$DOCKER_CONFIG_JSON" \
    --type=kubernetes.io/dockerconfigjson
```

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
```
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
```



**Create Secert**
```
oc create -f thanos-object-storage.yaml -n open-cluster-management-observability
```

**Create the MultiClusterObservability custom resource YAML**
```
cat >multiclusterobservability_cr.yaml<<YAML
apiVersion: observability.open-cluster-management.io/v1beta1
kind: MultiClusterObservability
metadata:
  name: observability #Your customized name of MulticlusterObservability CR
spec:
  availabilityConfig: High # Available values are High or Basic
  imagePullPolicy: Always
  imagePullSecret: multiclusterhub-operator-pull-secret
  observabilityAddonSpec: # The ObservabilityAddonSpec defines the global settings for all managed clusters which have observability add-on enabled
    enableMetrics: true # EnableMetrics indicates the observability addon push metrics to hub server
    interval: 60 # Interval for the observability addon push metrics to hub server
  retentionResolution1h: 30d # How long to retain samples of 1 hour in bucket
  retentionResolution5m: 14d
  retentionResolutionRaw: 5d
  storageConfigObject: # Specifies the storage to be used by Observability
    metricObjectStorage:
      name: thanos-object-storage
      key: thanos.yaml
    statefulSetSize: 10Gi # The amount of storage applied to the Observability StatefulSets, i.e. Amazon S3 store, Rule, compact and receiver.
    statefulSetStorageClass: gp2
YAML
```

**Apply the observability YAML to your cluster**
```
oc apply -f multiclusterobservability_cr.yaml
```


## Reference Link
* [OBSERVING ENVIRONMENTS](https://access.redhat.com/documentation/en-us/red_hat_advanced_cluster_management_for_kubernetes/2.2/html/observing_environments/index)